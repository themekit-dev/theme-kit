"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import {
  createCSSVariablesBinding,
  createDOMBinding,
  createThemeRuntime,
  createThemeBootstrapScript,
  resolveRuntimeOptions,
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

/**
 * Props for the {@link ThemeProvider} component.
 *
 * Accepts all `createThemeRuntime` options except `initialFamily`/`initialMode`
 * (which are re-typed with family/mode autocompletion), plus `runtime` and
 * `children`.
 */
export interface ThemeProviderProps<
  T extends ThemeDefinition,
> extends Omit<ThemeRuntimeOptions<T>, "initialFamily" | "initialMode"> {
  /**
   * A runtime owned by the caller. When provided, the provider does not
   * create or destroy a runtime — the caller owns its lifecycle. When
   * omitted, the provider creates an internal runtime (owning `dom` and
   * `cssVariables` itself) and destroys it on unmount.
   */
  runtime?: ThemeRuntime<T>;
  /**
   * The application tree rendered inside the provider.
   */
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

/**
 * React provider for a Theme Kit runtime.
 *
 * Creates a runtime on mount (unless a `runtime` prop is given), installs the
 * DOM + CSS-variable bindings, injects a pre-paint bootstrap script for
 * flash-proofing, and provides the runtime to all Theme Kit hooks below.
 *
 * Must be rendered inside the application's root. When no `runtime` prop is
 * passed, the provider owns the runtime and destroys it on unmount; the
 * deferred-destroy mechanism keeps the runtime alive across React StrictMode
 * remounts.
 *
 * @remarks
 * **The first paint is the root's business, not the provider's.** On a
 * client-rendered app React's concurrent root *schedules* the initial commit,
 * so the browser can paint a frame with the root still empty before React
 * commits — one frame, ~33 ms, plainly visible as the UI blinking on reload.
 * The provider cannot prevent it: that frame is painted before any of the app's
 * React code runs, so nothing the provider does in a render, an insertion
 * effect or a layout effect is in time.
 *
 * It is fixed where it happens instead, with no application code:
 *
 * - **Vite apps** — `themeKitVitePlugin()` resolves `react-dom/client` to a shim
 *   that flushes the first `render` synchronously (`syncFirstRender`, on by
 *   default). Nothing in the app changes; `<ThemeProvider>` alone is enough.
 * - **Anything else** — {@link createThemeRoot} is that same synchronous first
 *   commit plus runtime ownership, and stays entirely opt-in.
 *
 * The provider's own theme work *is* pre-paint: the bootstrap is injected in an
 * insertion effect and a server-resolved `initial` is applied in a layout
 * effect, so neither waits for the browser to paint.
 *
 * The pre-JS window is out of scope for all of them: until the entry module
 * runs, the root is empty by definition. A themed canvas keeps that window from
 * reading as a flash, and only a prerendered first paint puts content in it.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ThemeProvider defaultTheme="mint-light" initialMode="system">
 *       <Page />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @see {@link useTheme}
 * @see {@link ThemeScope}
 * @see {@link createThemeRoot}
 */
export function ThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
  ...runtimeOptions
}: ThemeProviderProps<T>) {
  const ownsRuntime = runtime === undefined;

  const runtimeRef = useRef<ThemeRuntime<T> | null>(null);
  const prevInitialRef = useRef<object | null>(null);
  // Holds the pending runtime-destroy timer left by a cleanup. React
  // StrictMode (dev) runs effect cleanups and re-runs setup synchronously, so
  // a deferred destroy lets the re-run cancel it — the runtime survives
  // StrictMode instead of being torn down and recreated (which flashed the
  // whole app as it re-rendered on a fresh runtime).
  const destroyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The build integration transports the application's `theme.config.ts` to the
  // browser as a global before any application code runs, so a provider with no
  // theme props still has a registry to build a runtime from. Explicit props win,
  // which keeps a local override possible without becoming the primary setup.
  // Shared with the other framework providers, so all of them resolve the
  // transport the same way.
  const resolvedOptions = resolveRuntimeOptions<T>(
    runtimeOptions,
  ) as ThemeRuntimeOptions<T>;

  const { dom: domOptions, cssVariables: cssOptions, transition: transitionOptions, ...coreOptions } = resolvedOptions;

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

  // Applied in a LAYOUT effect, not a passive one: `initial` is the SSR-resolved
  // selection, and it has to win *before* the browser paints. In a passive
  // effect it ran after paint, so a server-rendered app painted the persisted
  // selection first and then corrected itself — a visible theme blink on every
  // load, for exactly the apps that went to the trouble of resolving the
  // selection on the server. Layout effects run after the insertion effect above
  // (which injects the pre-paint bootstrap) and before paint, which is the order
  // this needs: the bootstrap establishes the persisted selection, `initial`
  // overrides it with the server's answer, and the browser sees only the result.
  //
  // `createThemeRoot` applies the same selection synchronously, before its first
  // commit — this is the plain-provider equivalent.
  useLayoutEffect(() => {
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

  // The bootstrap above owns the first paint. Set up the live bindings after
  // mount so their initialization cannot compete with the browser's first
  // layout/composite pass.
  useInsertionEffect(() => {
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

  }, [resolvedRuntime, coreOptions, ownsRuntime]);

  useLayoutEffect(() => {
    if (!resolvedRuntime) {
      return;
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
            // onBeforeSwap; subscribing here too would fire a second,
            // competing startViewTransition. Otherwise the DOM binding owns its updates.
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
    // Cancel a deferred destroy left by a StrictMode simulated unmount. The
    // cleanup below schedules a deferred destroy; if this setup runs (the
    // effect re-initialises) before the timer fires, the destroy is cancelled
    // and the runtime survives StrictMode. On a real unmount there is no
    // re-run, so the deferred destroy executes.
    if (destroyTimerRef.current) {
      clearTimeout(destroyTimerRef.current);
      destroyTimerRef.current = null;
    }

    return () => {
      if (!ownsRuntime || !resolvedRuntime) {
        return;
      }
      destroyTimerRef.current = setTimeout(() => {
        destroyTimerRef.current = null;
        resolvedRuntime.destroy();
        runtimeRef.current = null;
      }, 0);
    };
  }, [ownsRuntime, resolvedRuntime]);

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
 * store/selection against your registry — any registry works, so the built-in
 * set is used here to keep the example self-contained:
 *
 * \`\`\`ts
 * import { getBuiltInThemes } from "@theme-kit/core";
 *
 * const themes = getBuiltInThemes();
 * const runtime = useThemeRuntime<typeof themes[number]>();
 * \`\`\`
 *
 * @see {@link ThemeProvider}
 * @see {@link useTheme}
 */
export function useThemeRuntime<T extends ThemeDefinition>() {
  const context = useContext(ThemeKitContext);

  if (!context) {
    throw new Error("useThemeRuntime must be used inside ThemeProvider.");
  }

  return context.runtime as ThemeRuntime<T>;
}
