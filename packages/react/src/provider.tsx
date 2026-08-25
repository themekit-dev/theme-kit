"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  createCSSVariablesBinding,
  createDOMBinding,
  createThemeRuntime,
  createThemeBootstrapScript,
  type CSSVariablesOptions,
  type DOMBindingOptions,
  type ThemeDefinition,
  type ThemeFamilies,
  type ThemeModes,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
} from "@theme-kit/core";

type ThemeKitContextValue<T extends ThemeDefinition> = {
  runtime: ThemeRuntime<T>;
};

const ThemeKitContext = createContext<ThemeKitContextValue<any> | null>(null);

export interface ThemeProviderProps<
  T extends ThemeDefinition,
> extends Omit<ThemeRuntimeOptions<T>, "initialFamily" | "initialMode"> {
  runtime?: ThemeRuntime<T>;
  children: ReactNode;
  /**
   * The family resolved on first load. When themes are defined with `as const`,
   * this is constrained to the families defined in `themes` (autocomplete).
   */
  initialFamily?: ThemeFamilies<readonly T[]>;
  /**
   * The mode resolved on first load: `"light" | "dark" | "system"`.
   * When themes are defined with `as const`, this is constrained to the
   * modes defined in `themes` plus `"system"` (autocomplete).
   */
  initialMode?: ThemeModes<readonly T[]> | "system";
}

export function ThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
  ...runtimeOptions
}: ThemeProviderProps<T>) {
  const ownsRuntime = runtime === undefined;

  const runtimeRef = useRef<ThemeRuntime<T> | null>(null);
  const prevInitialRef = useRef<object | null>(null);
  // StrictMode remount signal: the destroy effect sets the ref to null, and
  // this state bump forces the render body to recreate the runtime.
  const [, setRuntimeTick] = useState(0);

  const { dom: domOptions, cssVariables: cssOptions, transition: transitionOptions, ...coreOptions } = runtimeOptions;

  const resolvedTransition =
    transitionOptions === undefined
      ? undefined
      : typeof transitionOptions === "object"
        ? transitionOptions
        : transitionOptions === true
          ? {}
          : { enabled: false };

  if (runtime) {
    runtimeRef.current = runtime;
  } else if (!runtimeRef.current) {
    runtimeRef.current = createThemeRuntime({
      ...coreOptions,
      // The runtime's `transition` drives scoped themes and reads like the
      // theme inspector; without it `runtime.transition` stays undefined even
      // though the provider was given a transition config.
      ...(resolvedTransition !== undefined
        ? { transition: resolvedTransition }
        : {}),
      dom: false,
      cssVariables: false,
    });
  }

  const resolvedRuntime = runtimeRef.current;

  useEffect(() => {
    if (!ownsRuntime || !resolvedRuntime) {
      return;
    }

    if (coreOptions.initial && prevInitialRef.current !== coreOptions.initial) {
      prevInitialRef.current = coreOptions.initial;

      const { selection, theme } = coreOptions.initial;

      // When the selection is "system" the selection controller's system
      // binding owns the resolved store theme (it already applied it during
      // runtime creation). Forcing the SSR-rendered light theme here would
      // override the client's OS-preference resolution and leave the page
      // stuck on light until the OS preference changes.
      if (
        selection.mode !== "system" &&
        resolvedRuntime.store.get().name !== theme.name
      ) {
        resolvedRuntime.store.set(theme);
      }

      if (selection.family !== resolvedRuntime.selection.getFamily()) {
        resolvedRuntime.selection.setFamily(selection.family);
      }
      if (selection.mode !== resolvedRuntime.selection.getMode()) {
        resolvedRuntime.selection.setMode(selection.mode);
      }
    }
  }, [ownsRuntime, resolvedRuntime, coreOptions.initial]);

  // useLayoutEffect (not useEffect): the CSS variables + DOM attributes must be
  // applied synchronously after the DOM is committed but BEFORE the browser
  // paints, so the first frame already shows the resolved theme — no flash of
  // an unthemed html/body background. The runtime already read the persisted
  // selection during creation, so this paints the persisted theme.
  useLayoutEffect(() => {
    if (!resolvedRuntime) {
      return;
    }

    // Flash-proofing for SPAs with zero setup: inject a blocking bootstrap
    // <script> into <head> that reads the persisted selection (localStorage
    // "theme-selection") and applies it before paint — no vite plugin or
    // manual index.html script needed. Idempotent; skipped when persistence is
    // disabled.
    if (
      ownsRuntime &&
      typeof document !== "undefined" &&
      document.head &&
      coreOptions.persistence !== null &&
      coreOptions.themes?.length &&
      !document.getElementById("theme-kit-bootstrap")
    ) {
      const bootstrap = createThemeBootstrapScript({
        themes: coreOptions.themes,
        ...(coreOptions.defaultTheme !== undefined
          ? { defaultTheme: coreOptions.defaultTheme as string }
          : {}),
        ...(coreOptions.initialMode !== undefined
          ? { initialMode: coreOptions.initialMode }
          : {}),
        ...(coreOptions.initialFamily !== undefined
          ? { initialFamily: coreOptions.initialFamily }
          : {}),
      });
      if (bootstrap) {
        const script = document.createElement("script");
        script.id = "theme-kit-bootstrap";
        script.text = bootstrap;
        document.head.appendChild(script);
      }
    }

    const cssBindingDrivesDom =
      cssOptions !== false &&
      (cssOptions === undefined || cssOptions.styleSheet !== true);

    const domBinding =
      domOptions === false
        ? null
        : createDOMBinding(resolvedRuntime.store, {
            ...domOptions,
            // The CSS binding (when present and applying inline variables) runs
            // DOM updates inside its single View Transition lightswitch via
            // onBeforeSwap; subscribing here too would fire a second, competing
            // startViewTransition. Otherwise the DOM binding owns its updates.
            subscribe: !cssBindingDrivesDom,
            ...(resolvedTransition !== undefined ? { transition: resolvedTransition } : {}),
          });

    const cssBinding =
      cssOptions === false
        ? null
        : createCSSVariablesBinding(resolvedRuntime.store, {
            ...cssOptions,
            ...(resolvedTransition !== undefined ? { transition: resolvedTransition } : {}),
            ...(domBinding ? { onBeforeSwap: domBinding.apply } : {}),
          });

    return () => {
      domBinding?.destroy();
      cssBinding?.destroy();
    };
  }, [resolvedRuntime, domOptions, cssOptions]);

  useEffect(() => {
    return () => {
      if (ownsRuntime && resolvedRuntime) {
        resolvedRuntime.destroy();
        runtimeRef.current = null;
      }
    };
  }, [ownsRuntime, resolvedRuntime]);

  // React StrictMode (dev) mounts → unmounts → remounts effects. The cleanup
  // above destroys the runtime and nulls the ref, but the remount does not
  // re-render the component, so the render body would keep using the destroyed
  // runtime and every selection change would silently no-op. Force a re-render
  // so the render body recreates a fresh runtime for the remounted effects.
  useEffect(() => {
    if (ownsRuntime && runtimeRef.current === null) {
      setRuntimeTick((t) => t + 1);
    }
  }, [ownsRuntime, setRuntimeTick]);

  const value = useMemo(
    () => ({
      runtime: resolvedRuntime,
    }),
    [resolvedRuntime],
  );

  return (
    <ThemeKitContext.Provider value={value}>
      {children}
    </ThemeKitContext.Provider>
  );
}

/**
 * Get the active Theme Kit runtime from context. Throws when used outside a
 * \`ThemeProvider\`. Pass the theme tuple element type to type the runtime's
 * store/selection against your themes:
 *
 * \`\`\`ts
 * const runtime = useThemeRuntime<typeof themes[number]>();
 * \`\`\`
 */
export function useThemeRuntime<T extends ThemeDefinition>() {
  const context = useContext(ThemeKitContext);

  if (!context) {
    throw new Error("useThemeRuntime must be used inside ThemeProvider.");
  }

  return context.runtime as ThemeRuntime<T>;
}
