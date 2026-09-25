import {
  buildBootstrapPlan,
  serializeThemeBootstrapScript,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";
import { themeKitCookieNames } from "./cookies";

/**
 * Options for {@link createNuxtThemeBootstrapScript}. Describes the theme
 * registry and the fallback selection used to build the blocking bootstrap
 * script and its default light/dark CSS maps.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see `createThemeBootstrapScript`
 * @see {@link createNuxtThemeBootstrapScript}
 * @see {@link resolveThemeFromCookies}
 */
export interface NuxtThemeBootstrapOptions<T extends ThemeDefinition> {
  /** The theme registry the bootstrap resolves against. */
  themes: readonly T[];
  /** Fallback theme name when no selection is persisted. */
  defaultTheme?: T["name"];
  /**
   * Fallback mode when no valid mode cookie is present. Defaults to the fallback
   * theme's own mode — the mode `defaultTheme` resolves to, so `"light"` for
   * `mint-light` and `"dark"` for `mint-dark`. Pass `"system"` to follow
   * `prefers-color-scheme` instead.
   *
   * @remarks
   * Whatever you choose must also reach the client runtime, or it corrects the
   * theme this script already painted. The Nuxt module supplies `"system"` on
   * both sides; calling this helper directly means wiring both yourself.
   */
  initialMode?: ThemeMode;
  /** Initial theme family used when no valid family cookie is present. */
  initialFamily?: string;
}

/**
 * Generate the blocking, inline bootstrap script that applies the persisted
 * theme before first paint — the same zero-flash guarantee `@theme-kit/next`
 * ships.
 *
 * The script reads the four theme cookies (same contract as Next), validates
 * the config fingerprint, resolves the theme for the effective mode
 * (`"system"` is resolved against `prefers-color-scheme`), and writes the CSS
 * variables plus DOM effects onto `document.documentElement`. It delegates to
 * the shared `@theme-kit/core` applier (`buildBootstrapPlan` +
 * `serializeThemeBootstrapScript`), so every SSR integration emits the same
 * correct script and cannot drift from the client runtime contract.
 *
 * Emit it in `<head>` with `tagPriority: "critical"` so it runs before the app
 * stylesheets and the browser paints already themed.
 *
 * @see {@link NuxtThemeBootstrapOptions}
 * @see {@link resolveThemeFromCookies}
 */
export function createNuxtThemeBootstrapScript<T extends ThemeDefinition>(
  options: NuxtThemeBootstrapOptions<T>,
): string {
  const { themes, defaultTheme, initialMode, initialFamily } = options;

  const plan = buildBootstrapPlan(themes, {
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(initialMode !== undefined ? { initialMode } : {}),
    ...(initialFamily !== undefined ? { initialFamily } : {}),
  });

  return serializeThemeBootstrapScript(
    plan,
    {
      kind: "cookies",
      names: {
        mode: themeKitCookieNames.mode,
        family: themeKitCookieNames.family,
        fingerprint: themeKitCookieNames.fingerprint,
      },
    },
    { fingerprint: computeFingerprint(themes, defaultTheme) },
  );
}

/** `:root { --a: b; ... }` style block for the resolved SSR theme.
 *
 * @see {@link createNuxtThemeBootstrapScript}
 */
export function cssVariablesStyle(
  variables: Record<string, string>,
): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
  return `:root{${rules}}`;
}
