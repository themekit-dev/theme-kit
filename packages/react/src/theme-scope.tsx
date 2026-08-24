"use client";

import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import {
  resolveScopeTransition,
  resolveScopedThemePrePaint,
  createScopedThemeBinding,
  type ScopedThemeSelection,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { useThemeRuntime } from "./provider";

export interface ThemeScopeProps {
  /** Exact theme name, family name, or a `{ family, mode }`-style object.
   *  When `family`/`mode` are also passed, `theme` wins (it's the explicit
   *  selection). Omit to follow the global selection inside a new boundary. */
  theme?: string;
  /** Theme family for the scoped subtree. When `mode` is omitted the scope
   *  follows the provider's current mode (light/dark/system). */
  family?: string;
  /** Mode for a family-based scope. Optional — defaults to the provider's
   *  current mode so `family="plum"` flips light/dark with the page. */
  mode?: ThemeMode;
  /** Local theme definitions for genuinely isolated components. Resolved FIRST
   *  (they shadow same-named parent themes), then the provider's registry
   *  falls back — no second runtime is created. */
  themes?: readonly ThemeDefinition[];
  /** Transition for this scope's own theme changes. `undefined` inherits the
   *  `<ThemeProvider/>` transition, `false` disables it, `true` inherits, and
   *  an object is merged over the provider's config (local keys win). */
  transition?: boolean | ThemeTransitionOptions;
  className?: string;
  children: ReactNode;
  /** Any additional attributes (e.g. `data-testid`) forwarded to the wrapper. */
  [key: string]: unknown;
}

function withGlobalMode(
  selection: ScopedThemeSelection,
  mode: ThemeMode,
): ScopedThemeSelection {
  if (typeof selection === "string") return selection;
  if ("name" in selection) return selection;
  return { ...selection, mode: selection.mode ?? mode };
}

export function ThemeScope({
  theme,
  family,
  mode,
  themes,
  transition,
  className,
  children,
  ...rest
}: ThemeScopeProps) {
  const runtime = useThemeRuntime();
  const ref = useRef<HTMLDivElement | null>(null);
  const bindingRef = useRef<ReturnType<typeof createScopedThemeBinding> | null>(null);

  const localThemes = useMemo(
    () => (themes !== undefined ? themes : undefined),
    [themes],
  );

  // The scope's base selection. `theme` wins over `family`/`mode`. When neither
  // is given, the scope mirrors the provider's current selection inside its own
  // boundary (family + live mode), so it follows every global change.
  const baseSelection = useMemo<ScopedThemeSelection>(() => {
    if (theme !== undefined) return theme;
    if (family !== undefined) return mode !== undefined ? { family, mode } : { family };
    return {
      family: runtime.selection.getFamily() ?? "default",
      mode: runtime.selection.getMode(),
    };
  }, [theme, family, mode, runtime]);

  // Inherited transition: provider → scope, with local overrides merged on top.
  const scopeTransition = useMemo(
    () => resolveScopeTransition(runtime.transition, transition),
    [runtime.transition, transition],
  );

  const combinedThemes = useMemo(
    () => [...(localThemes ?? []), ...runtime.themes],
    [localThemes, runtime.themes],
  );

  // Resolve the scope's first-paint setup generically from its theme data:
  //  - explicit selections (lock to a name, or a light/dark family mode) render
  //    their resolved variables inline — the server knows the answer;
  //  - OS-dependent selections (a `system` mode, or a family/boundary scope
  //    following a system selection) ship NO inline variables + a
  //    `@media (prefers-color-scheme: dark)` override so the first paint
  //    already matches the OS. The live binding writes its own inline
  //    variables after hydration, which outrank that stylesheet, so manual
  //    scope switching keeps working.
  const scopeId = useId();
  const initial = useRef<{
    systemBased: boolean;
    style: CSSProperties;
    css: string | null;
    isDark: boolean;
    name: string;
  } | null>(null);
  if (initial.current === null) {
    const prePaint = resolveScopedThemePrePaint(
      combinedThemes,
      withGlobalMode(baseSelection, runtime.selection.getMode()),
      { selector: `[data-theme-kit-scope="${scopeId}"]` },
    );
    initial.current = {
      systemBased: prePaint.systemBased,
      style: prePaint.lightVariables as CSSProperties,
      css: prePaint.css,
      isDark: prePaint.isDark,
      name: prePaint.name,
    };
  }

  // Keep refs in sync so the layout effect can read the latest values without
  // re-running.
  const baseSelectionRef = useRef(baseSelection);
  baseSelectionRef.current = baseSelection;
  const localThemesRef = useRef(localThemes);
  localThemesRef.current = localThemes;
  const transitionRef = useRef(scopeTransition);
  transitionRef.current = scopeTransition;

  // Create the live binding once per runtime. It owns the inline variables on
  // the element (left untouched by React, since the JSX `style` prop keeps a
  // stable reference) and animates subsequent theme changes.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const binding = createScopedThemeBinding(
      runtime.themes,
      el,
      withGlobalMode(baseSelectionRef.current, runtime.selection.getMode()),
      {
        ...(localThemesRef.current ? { localThemes: localThemesRef.current } : {}),
        ...(transitionRef.current ? { transition: transitionRef.current } : {}),
      },
    );
    bindingRef.current = binding;
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [runtime]);

  // Reactive selection changes: `theme`/`family`/`mode` props mutate over time
  // (e.g. `theme={editorTheme}`) and must re-resolve + animate, no remount.
  useLayoutEffect(() => {
    if (!bindingRef.current) return;
    bindingRef.current.setTransition(transitionRef.current);
    bindingRef.current.update(
      withGlobalMode(baseSelectionRef.current, runtime.selection.getMode()),
    );
  }, [baseSelection, runtime]);

  // Local theme definitions swapped at runtime (late-loaded packs).
  useEffect(() => {
    bindingRef.current?.setLocalThemes(localThemesRef.current);
  }, [localThemes]);

  // Transition config changed (duration/easing/preset on the prop) — swap it on
  // the existing binding so an in-flight scope animation isn't torn down.
  useEffect(() => {
    bindingRef.current?.setTransition(transitionRef.current);
  }, [scopeTransition]);

  // Follow the provider's mode: family-based scopes (and boundary-only scopes)
  // flip light/dark when the global mode changes, animating through the binding.
  useEffect(() => {
    return runtime.store.subscribe(() => {
      const base = baseSelectionRef.current;
      if (typeof base === "string") return;
      if ("name" in base || base.mode !== undefined) return;
      if (bindingRef.current) {
        bindingRef.current.update(
          withGlobalMode(base, runtime.selection.getMode()),
        );
      }
    });
  }, [runtime]);

  const combinedClassName = [
    className,
    initial.current.isDark ? "dark" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      style={initial.current.systemBased ? undefined : initial.current.style}
      className={combinedClassName || undefined}
      data-theme={initial.current.name}
      data-mode={initial.current.isDark ? "dark" : "light"}
      data-theme-kit-scope={scopeId}
      {...rest}
    >
      {initial.current.css ? (
        <style
          data-theme-kit-scope-style={scopeId}
          dangerouslySetInnerHTML={{ __html: initial.current.css }}
        />
      ) : null}
      {children}
    </div>
  );
}

export function useScopedTheme(
  ref: RefObject<HTMLElement | null>,
  selection: ScopedThemeSelection | null,
  transition?: boolean | ThemeTransitionOptions,
) {
  const runtime = useThemeRuntime();
  const bindingRef = useRef<ReturnType<typeof createScopedThemeBinding> | null>(null);

  const scopeTransition = resolveScopeTransition(runtime.transition, transition);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const transitionRef = useRef(scopeTransition);
  transitionRef.current = scopeTransition;

  useLayoutEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [runtime, ref]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (selectionRef.current == null) {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      return;
    }
    if (!bindingRef.current) {
      bindingRef.current = createScopedThemeBinding(
        runtime.themes,
        el,
        selectionRef.current,
        transitionRef.current ? { transition: transitionRef.current } : {},
      );
    } else {
      bindingRef.current.setTransition(transitionRef.current);
      bindingRef.current.update(selectionRef.current);
    }
  }, [runtime, ref, selection, scopeTransition]);

  return bindingRef;
}
