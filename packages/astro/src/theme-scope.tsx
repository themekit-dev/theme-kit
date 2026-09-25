import React, { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  resolveTheme,
  themeToCSSVariables,
  createScopedThemeBinding,
  type ThemeDefinition,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { getGlobalRuntime } from "./shared-runtime";

/**
 * Props for the Astro `ThemeScope` component. Describes the local theme and
 * the optional transition applied when the scope's theme changes.
 *
 * @see {@link ThemeScope}
 */
export interface ThemeScopeProps {
  /** The theme name applied to this scope, overriding the app-wide selection. */
  theme: string;
  /** The content rendered inside the scoped element. */
  children: ReactNode;
  /** Extra classes applied to the scoped element. */
  className?: string;
  /** Transition applied when the scope's theme changes. Defaults to the owning
   *  runtime's transition (the provider's), or pass your own to override. */
  transition?: ThemeTransitionOptions;
}

/**
 * Applies a local theme to a subtree, overriding the app-wide selection.
 *
 * @param props - The scope props (see {@link ThemeScopeProps}).
 * @returns A `<div>` wrapping the scoped content.
 *
 * @example
 * ```tsx
 * <ThemeScope theme="brand-dark">
 *   <p>This content uses the brand-dark theme.</p>
 * </ThemeScope>
 * ```
 *
 * @remarks
 * The scope is a nested override: it does not change the app-wide selection,
 * only the CSS variables on its own element. The binding is destroyed when the
 * scope unmounts.
 *
 * The variables are resolved **during render**, not in an effect, so they are
 * present in the server-rendered markup. That distinction is what makes the
 * scope flash-free: an effect-only scope emits a bare `<div>` on the server, so
 * its content paints with the *global* theme on the first frame and is
 * repainted with the scoped one after hydration — a visible colour change on
 * everything inside. Resolving during render puts the same variables in the
 * server HTML and in the client's first render, so hydration confirms them and
 * there is nothing to correct. The effect below then only has to handle later
 * changes (`theme`, `transition`) and the cross-fade between them.
 *
 * @see {@link ThemeProviderClient}
 * @see {@link ThemeScopeProps}
 */
export function ThemeScope({ theme, children, className, transition }: ThemeScopeProps) {
  const ref = useRef<HTMLDivElement>(null);

  // `getGlobalRuntime()` is already installed by the time this renders — the
  // provider installs it during its own render, and it renders first — so the
  // server render resolves the scope exactly as the client does.
  const runtime = getGlobalRuntime();

  const scopedVariables = useMemo(() => {
    if (!runtime) return undefined;
    try {
      return themeToCSSVariables(resolveTheme(runtime.themes, theme));
    } catch {
      // An unknown theme name must not take the island down; the binding below
      // reports it the same way it always has.
      return undefined;
    }
  }, [runtime, theme]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rt = getGlobalRuntime();
    if (!rt) return;

    const scopeTransition = transition ?? rt.transition;
    const binding = createScopedThemeBinding(
      rt.themes,
      el,
      theme,
      scopeTransition ? { transition: scopeTransition } : {},
    );

    return () => {
      binding.destroy();
    };
  }, [theme, transition]);

  return (
    <div ref={ref} className={className} style={scopedVariables}>
      {children}
    </div>
  );
}
