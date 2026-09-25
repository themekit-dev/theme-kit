/**
 * React island entry for Theme Kit's Astro integration
 * (`@theme-kit/astro/client`).
 *
 * This is the **only** entry that depends on React. Import it explicitly when
 * you chose a React island in your Astro project:
 *
 * ```tsx
 * import { ThemeProviderClient, useTheme } from "@theme-kit/astro/client";
 * ```
 *
 * The framework-neutral root entry (`@theme-kit/astro`) does not import React,
 * so projects that use Astro components only never pull a client framework
 * runtime into their bundle.
 *
 * @packageDocumentation
 */
import React, { useEffect, useMemo } from "react";
import {
  createThemeRuntime,
  readTransportedConfig,
  type CSSVariablesOptions,
  type DOMBindingOptions,
  type InitialThemeResolution,
  type ScheduledThemeOptions,
  type ThemeAdapter,
  type ThemeDefinition,
  type ThemeMode,
  type ThemePlugin,
  type ThemeRuntimeOptions,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { getGlobalRuntime, setGlobalRuntime } from "./shared-runtime";
import { createAstroThemePersistence } from "./persistence";

/**
 * Props for the Astro `ThemeProviderClient` island component. Describes the
 * SSR-resolved initial state and the theme registry the client runtime is
 * created with.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link ThemeProviderClient}
 */
export interface ThemeProviderClientProps<T extends ThemeDefinition> {
  /**
   * The SSR-resolved initial theme state (from `getInitialThemeState`). When
   * provided it wins on first paint, so hydration matches exactly. Omit it on
   * prerendered/static pages (no request available) — the island then reads the
   * persisted selection from storage on the client instead.
   */
  initial?: InitialThemeResolution<T>;
  /** The theme registry the client runtime resolves against. */
  themes?: readonly T[];
  /** Fallback theme name when no selection is persisted. */
  defaultTheme?: string;
  /**
   * Mode used when nothing is persisted.
   *
   * @remarks
   * **Usually unnecessary.** `themeKit()` transports `theme.config.ts` to the
   * browser as `window.__THEME_KIT_CONFIG__`, `initialMode` included, and this
   * island reads it — so the runtime already resolves the mode the application
   * declared once, and there is nothing to mirror by hand. Pass this only to
   * override the configuration for this island.
   *
   * It used to be required on every page, and that requirement was the bug: a
   * hand-written `initialMode` is a *second* source of truth for a decision the
   * application already made, so a value that drifted from `theme.config.ts`
   * made the runtime resolve a different selection than the document — the
   * island's server markup contradicted its hydrated markup and the text
   * visibly fluctuated on load.
   *
   * `"system"` makes the runtime honour `prefers-color-scheme`; the island reads
   * it and resolves accordingly.
   */
  initialMode?: ThemeMode;
  /**
   * Family used when nothing is persisted. Optional for the same reason as
   * {@link ThemeProviderClientProps.initialMode} — the transported
   * configuration already carries it.
   */
  initialFamily?: string;

  /**
   * Animate theme changes. `true` uses the defaults; pass
   * `{ enabled, duration, easing }` to tune, or `false` to disable. The
   * transition itself is applied by the DOM/CSS bindings, so it also needs
   * `dom`/`cssVariables` to be left at their defaults (they are).
   */
  transition?: boolean | ThemeTransitionOptions;

  /**
   * Sunrise/sunset scheduling. Enables `useThemeSchedule()`; without it that
   * hook returns `null`. `autoDetectLocation` resolves coordinates from the
   * browser, and `timeZone` overrides the detected one.
   */
  scheduled?: false | ScheduledThemeOptions<T>;

  /** Theme plugins to install at runtime creation. */
  plugins?: ThemePlugin<T>[];

  /** DOM adapters (component-library bridges) to install. */
  adapters?: ThemeAdapter<T>[];

  /**
   * Cross-tab broadcast adapter. Omitted → a `BroadcastChannel` on
   * `"theme-selection"`; `null` disables cross-tab sync.
   */
  broadcast?: ThemeRuntimeOptions<T>["broadcast"];

  /**
   * DOM attribute binding. Defaults to `{}` (bind `data-theme` on `<html>`).
   * Pass `false` to disable.
   */
  dom?: false | DOMBindingOptions;

  /**
   * CSS custom property binding. Defaults to `{}` (write `--theme-*` on
   * `<html>`). Pass `false` to disable.
   */
  cssVariables?: false | CSSVariablesOptions;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Client island component that installs the theme runtime on the browser. It
 * publishes it as the app-wide runtime (see {@link getGlobalRuntime}), wires the
 * cookie persistence adapter, and mirrors the selection back to cookies so the
 * server resolves the same state on the next request.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param props - The island props (see {@link ThemeProviderClientProps}).
 * @returns `null` — this component only sets up the runtime and side effects.
 *
 * @example
 * ```astro
 * ---
 * import { ThemeProviderClient } from "@theme-kit/astro/client";
 * ---
 * <ThemeProviderClient client:load initial={initial} />
 * ```
 *
 * No theme props are needed: the registry, the default theme and the initial
 * mode/family all come from the `theme.config.ts` the integration transported.
 * Pass `initial` only when the page resolved the selection on the server with
 * `getInitialThemeState()`.
 *
 * @remarks
 * This is an island component: it renders nothing and only runs on the client.
 * Mount it inside the server-rendered provider (e.g. `provider.astro`) so the
 * SSR-resolved `initial` state is available.
 *
 * **One runtime per document.** If a runtime is already installed — by
 * `getThemeController()` behind `<ThemeToggle />`, or by another island — this
 * component adopts it rather than creating a second one, and leaves its
 * destruction to the owner. That is what lets a page mix native Astro controls
 * and React islands without two runtimes racing to write `<html>`.
 *
 * On a server-rendered page the island's *own* markup must come from the same
 * registry the document used. `provider.astro` publishes the configuration on
 * `globalThis` for exactly that reason; without it the island's server render
 * falls back to the built-in themes while its hydrated render uses the real
 * ones, and React reports a text mismatch (error #418) and re-renders the
 * island.
 *
 * @see {@link getGlobalRuntime}
 * @see {@link createAstroThemePersistence}
 * @see {@link useThemeRuntime}
 * @see {@link ThemeScope}
 * @see {@link createBlockingScript}
 */
export function ThemeProviderClient<T extends ThemeDefinition>({
  initial,
  themes,
  defaultTheme,
  initialMode,
  initialFamily,
  transition,
  scheduled,
  plugins,
  adapters,
  broadcast,
  dom,
  cssVariables,
}: ThemeProviderClientProps<T>) {
  // The build integration transports the application's `theme.config.ts` to the
  // browser before any application code runs. Reading it here is what lets the
  // island take no theme props at all — and, on the server, what keeps its
  // markup built from the real registry rather than the built-in fallback.
  // Explicit props still win, so a local override stays possible.
  const transported = readTransportedConfig<T>();
  const resolvedThemes = (themes ?? transported?.themes) as readonly T[] | undefined;
  const resolvedDefaultTheme = defaultTheme ?? transported?.defaultTheme;

  // `initialMode` / `initialFamily` come from the same transported object the
  // pre-paint script and `provider.astro` resolved against. Reading them is what
  // makes the island need no per-page `initialMode="…"` / `initialFamily="…"`:
  // those props were a *second* source of truth for a decision the application
  // had already declared once, and when the two disagreed — a hand-written prop
  // that drifted from `theme.config.ts` — the runtime resolved a different
  // selection than the document, so the island's server markup contradicted its
  // hydrated markup and the text visibly fluctuated on load.
  //
  // The transport is not lossy: `toBootstrapConfig` carries `initialMode` and
  // `initialFamily` alongside the registry. The island's own reader used to drop
  // them, which is why the props were needed in the first place.
  const resolvedInitialMode = initialMode ?? transported?.initialMode;
  const resolvedInitialFamily = initialFamily ?? transported?.initialFamily;

  const persistence = useMemo(
    () =>
      createAstroThemePersistence(
        resolvedThemes,
        // Must match the `defaultTheme` the integration/`provider.astro` used,
        // or the fingerprints disagree and the persisted cookies are rejected
        // as stale — silently dropping back to the default theme on every load.
        resolvedDefaultTheme,
      ),
    [resolvedThemes, resolvedDefaultTheme],
  );

  // One runtime per document. If something already installed one — the native
  // `getThemeController()` behind `<ThemeToggle />`, or an earlier island — this
  // island adopts it instead of creating a second runtime that would fight the
  // first over `<html>`. Both paths derive their configuration from the same
  // transported `theme.config.ts`, so which one wins does not change the result;
  // only the runtime-shaping props below are the owner's to apply.
  const entry = useMemo(() => {
    const existing = getGlobalRuntime<T>();
    if (existing) return { runtime: existing, owns: false } as const;

    const rt = createThemeRuntime({
      ...(initial ? { initial } : {}),
      themes: resolvedThemes,
      ...(resolvedDefaultTheme !== undefined ? { defaultTheme: resolvedDefaultTheme } : {}),
      // Mirror the integration's `mode`/`family`. Without these the runtime
      // resolves the mode from `defaultTheme` alone and overwrites the theme
      // the blocking script already painted from `prefers-color-scheme`.
      ...(resolvedInitialMode !== undefined ? { initialMode: resolvedInitialMode } : {}),
      ...(resolvedInitialFamily !== undefined ? { initialFamily: resolvedInitialFamily } : {}),
      // Pass-throughs for the remaining runtime options. They default to the
      // same values the runtime would pick on its own, so omitting them keeps
      // the previous behaviour — but without them there was no way to reach
      // scheduling, plugins, transitions or adapters from an Astro app at all.
      ...(transition !== undefined ? { transition } : {}),
      ...(scheduled !== undefined ? { scheduled } : {}),
      ...(plugins !== undefined ? { plugins } : {}),
      ...(adapters !== undefined ? { adapters } : {}),
      ...(broadcast !== undefined ? { broadcast } : {}),
      dom: dom ?? {},
      cssVariables: cssVariables ?? {},
      readPersistenceOnInit: !initial,
      persistence,
    });
    setGlobalRuntime(rt);
    return { runtime: rt, owns: true } as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { runtime } = entry;

  useEffect(() => {
    const unsubscribe = runtime.store.subscribe((theme) => {
      writeCookie("theme-name", String(theme.name));
      writeCookie("theme-family", runtime.selection.getFamily());
      writeCookie("theme-mode", runtime.selection.getMode());
    });

    return () => {
      unsubscribe();
      // Only the owner tears it down. Destroying a runtime this island adopted
      // would take the document's theme with it while whatever created it is
      // still using it.
      if (entry.owns) runtime.destroy();
    };
  }, [entry, runtime]);

  return null;
}

export default ThemeProviderClient;

export {
  useThemeRuntime,
  useTheme,
  useThemeValue,
  useThemeMode,
  useThemeFamily,
  useSetThemeMode,
  useSetThemeFamily,
  useToggleTheme,
  useThemeTokens,
  useThemeHistory,
  useThemeSchedule,
  // `hooks.ts` implemented these all along but the client entry never
  // re-exported them, so they were unreachable from `@theme-kit/astro/client`
  // while their React/Vue siblings had them.
  useThemeBatch,
  useThemeSnapshot,
  useThemeRestore,
  useThemeLifecycle,
  useThemePacks,
} from "./hooks";

export { ThemeScope } from "./theme-scope";
export type { ThemeScopeProps } from "./theme-scope";

export { ThemeReadout } from "./theme-readout";
export type { ThemeReadoutProps, ThemeReadoutKind } from "./theme-readout";
