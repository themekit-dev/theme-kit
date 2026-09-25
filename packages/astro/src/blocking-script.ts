import {
  buildBootstrapPlan,
  serializeThemeBootstrapScript,
  themeToCSSVariables,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";

/**
 * CSS variables of the fallback theme family, used by the pre-paint script
 * when the visitor has no valid `theme-family` cookie (first visit, cleared
 * cookies, blocked cookies).
 *
 * @see {@link BlockingScriptOptions}
 * @see {@link buildThemeBootstrapPayload}
 */
export interface ThemeBootstrapDefaults {
  /** CSS variables of the fallback family's light theme. */
  light: Record<string, string>;
  /** CSS variables of the fallback family's dark theme. */
  dark: Record<string, string>;
  /** Theme name of the fallback family's light theme, written to `data-theme`. */
  lightName: string;
  /** Theme name of the fallback family's dark theme, written to `data-theme`. */
  darkName: string;
}

/**
 * Options for {@link createBlockingScript}: the fallback selection and the
 * theme lookup the script needs to resolve a theme when the visitor has no
 * valid cookies yet.
 *
 * Build them with {@link buildThemeBootstrapPayload} so the pre-paint script,
 * the server-rendered document and the client runtime all resolve the same
 * theme — a disagreement between the three is what produces a corrected
 * (flashing) first paint.
 *
 * @see {@link buildThemeBootstrapPayload}
 */
export interface BlockingScriptOptions {
  /**
   * Mode used when no valid `theme-mode` cookie is present. `"system"` is
   * resolved against `prefers-color-scheme` inside the script.
   *
   * @defaultValue `"system"` — but prefer passing it. Resolve the fallback with
   * `resolveInitialTheme` and forward `selection.mode`, so the script cannot
   * disagree with the client runtime. `"system"` is only a last resort for
   * callers that resolve their own fallback, and it disagrees with any runtime
   * whose `initialMode` was derived from `defaultTheme`.
   */
  mode?: ThemeMode;
  /**
   * Family written to `data-theme-family` when the resolved theme came from
   * the fallback (`__default-light` / `__default-dark`) instead of a persisted
   * family cookie. Matches the family the client runtime writes for the same
   * resolved theme.
   *
   * @see {@link buildThemeBootstrapPayload}
   */
  family?: string;
  /**
   * Every family registered in this app's theme set.
   *
   * The script validates the `theme-family` cookie against this list, so a
   * stale cookie — one written before the app changed its family set — cannot
   * survive into `data-theme-selection-family` or a
   * `data-tk-readout="family"` element. Without it the browser keeps naming a
   * family the CSS map has no variables for while the theme resolves to
   * `__default-*`, and the server (which normalises through
   * `resolveSelection`) disagrees with it about the same page.
   *
   * @see {@link buildThemeBootstrapPayload}
   */
  families?: string[];
  /**
   * Theme-name lookup (`themeCssMap` key to theme name) used to write the
   * `data-theme` attribute, matching the contract the client runtime applies.
   *
   * @see {@link buildThemeBootstrapPayload}
   */
  names?: Record<string, string>;
  /**
   * The fallback family's light/dark variables, registered in the map under
   * `__default-light` / `__default-dark`.
   *
   * @see {@link buildThemeBootstrapPayload}
   */
  defaults?: ThemeBootstrapDefaults;
}

/**
 * Builds the `names` lookup and the fallback light/dark variables the
 * pre-paint script resolves against when no valid selection is persisted.
 *
 * `names` maps every theme name and every `family:mode` key to its theme name
 * so the script can write a truthful `data-theme`; `defaults` carries the
 * fallback family's resolved light and dark themes so a visitor with no
 * persisted family still paints a complete theme instead of no variables.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param themes - The theme registry the script resolves against.
 * @param family - The fallback family (from `resolveInitialTheme`).
 * @returns The names lookup, the fallback family's light/dark variables, and
 * the family those variables belong to.
 *
 * @see {@link createBlockingScript}
 * @see {@link BlockingScriptOptions}
 */
export function buildThemeBootstrapPayload<T extends ThemeDefinition>(
  themes: readonly T[],
  family: string,
): {
  names: Record<string, string>;
  defaults: ThemeBootstrapDefaults;
  family: string;
  families: string[];
} {
  const plan = buildBootstrapPlan(themes, {
    ...(family !== undefined ? { initialFamily: family } : {}),
  });

  return {
    names: plan.names,
    family: plan.fallbackFamily ?? "",
    // Forwarded to `createBlockingScript` so the inline script can reject a
    // persisted family that is no longer registered — see
    // `BlockingScriptOptions.families`.
    families: plan.families ?? [],
    defaults: {
      light: themeToCSSVariables(plan.defaultLight!),
      dark: themeToCSSVariables(plan.defaultDark!),
      lightName: String(plan.defaultLight!.name),
      darkName: String(plan.defaultDark!.name),
    },
  };
}

/**
 * Builds the blocking, inline bootstrap script that applies the persisted
 * theme before first paint (zero-flash).
 *
 * The script reads the theme cookies, rejects them when the config fingerprint
 * is stale, resolves the effective mode (`"system"` against
 * `prefers-color-scheme`), and writes the CSS variables plus the full DOM
 * contract the client runtime applies — `data-theme`, `data-theme-family`,
 * `data-theme-mode`, the `dark` class and `color-scheme` — onto
 * `document.documentElement`. Hydration therefore confirms the server-rendered
 * theme instead of correcting it.
 *
 * It is deliberately tiny and synchronous: no runtime, no listeners, no
 * storage access beyond cookies, and no framework dependency.
 *
 * @param fingerprint - The config fingerprint used to reject stale cookies.
 * @param themeCssMap - A map of theme keys to CSS variable records (see
 * {@link buildThemeCssMap}).
 * @param options - The fallback selection and theme lookup (see
 * {@link BlockingScriptOptions}). Omit it only when the caller resolves the
 * fallback itself.
 * @returns The inline script string to emit in the document `<head>`.
 *
 * @remarks
 * Pass `options` so a visitor with no valid cookies is resolved against the
 * same fallback the runtime uses. Without it the script still corrects the
 * mode marker and uses the first matching `family:mode` entry it finds, but it
 * cannot guarantee it agrees with the client runtime.
 *
 * @see {@link buildThemeCssMap}
 * @see {@link buildThemeBootstrapPayload}
 * @see {@link darkModeCSSTemplate}
 */
export function createBlockingScript(
  fingerprint: string,
  themeCssMap: Record<string, Record<string, string>>,
  options: BlockingScriptOptions = {},
): string {
  const map: Record<string, Record<string, string>> = { ...themeCssMap };
  const names: Record<string, string> = { ...(options.names ?? {}) };

  if (options.defaults) {
    map["__default-light"] = options.defaults.light;
    map["__default-dark"] = options.defaults.dark;
    names["__default-light"] = options.defaults.lightName;
    names["__default-dark"] = options.defaults.darkName;
  }

  // Delegate to the shared core applier so this script cannot drift from the
  // Nuxt/Next/Remix bootstrap or the client runtime's DOM contract.
  return serializeThemeBootstrapScript(
    {
      map,
      names,
      fallbackMode: options.mode ?? "system",
      fallbackFamily: options.family ?? null,
      // Absent means "cannot validate": the core serializer then trusts the
      // persisted family as before, which is the pre-existing behaviour for a
      // caller that does not resolve a registry.
      ...(options.families ? { families: options.families } : {}),
    },
    {
      kind: "cookies",
      names: {
        mode: "theme-mode",
        family: "theme-family",
        fingerprint: "theme-fingerprint",
      },
    },
    { fingerprint },
  );
}

/**
 * Re-exported from `@theme-kit/core` — the CSS-map and stylesheet builders live
 * there, not here, so that every surface that needs them shares one
 * implementation.
 *
 * @remarks
 * `themeKit()` and `provider.astro` both emit the `"system"` stylesheet, and a
 * hand-rolled `<head>` needs the same primitives. Keeping a second copy in this
 * package was the drift the shared applier exists to prevent: the copies agree
 * today, and the only symptom of them diverging would be a wrong first paint on
 * one surface only — the hardest kind of flash to attribute.
 *
 * `buildThemeCssMap` was the last local copy. Beyond the drift risk it silently
 * dropped core's `prefix` option, so an Astro caller could not key the map
 * differently from the `theme-` default. Re-exporting core's version is
 * backward-compatible — the second parameter is optional — and restores it.
 *
 * The import path is unchanged (`@theme-kit/astro`), so this is a pure
 * de-duplication with no API change.
 *
 * @see {@link createBlockingScript}
 */
export {
  buildThemeCssMap,
  createThemeReadoutScript,
  darkModeCSSTemplate,
  systemModeCSSTemplate,
} from "@theme-kit/core";
