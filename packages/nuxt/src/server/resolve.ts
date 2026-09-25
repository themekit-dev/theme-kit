import {
  resolveInitialTheme,
  type InitialThemeResolution,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";
import { themeKitCookieNames, type ParsedCookies } from "./cookies";

/**
 * Options for {@link resolveThemeFromCookies}. Describes the theme registry,
 * the fallback selection, and the parsed request cookies used to resolve the
 * initial theme server-side.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link resolveThemeFromCookies}
 */
export interface ResolveThemeFromCookiesOptions<T extends ThemeDefinition> {
  /** The theme registry the selection is resolved against. */
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
   * This must agree with the mode the pre-paint script resolved, or hydration
   * disagrees with the painted theme. The Nuxt module supplies `"system"` on
   * both sides.
   */
  initialMode?: ThemeMode;
  /** Initial theme family used when no valid family cookie is present. */
  initialFamily?: string;
  /** The parsed request cookies (see {@link parseCookieHeader}). */
  cookies: ParsedCookies;
}

/**
 * SSR-first theme resolution. Reads the four theme cookies from the request,
 * rejects them when the config fingerprint is stale, and resolves the initial
 * theme for the effective selection — exactly like `@theme-kit/next`'s
 * `getInitialThemeState`.
 *
 * The resolved `<html>` state (theme name, family, mode) can then be rendered
 * server-side so the browser paints already themed.
 *
 * @see `resolveInitialTheme`
 * @see {@link createNuxtThemeBootstrapScript}
 * @see {@link parseCookieHeader}
 */
export function resolveThemeFromCookies<T extends ThemeDefinition>(
  options: ResolveThemeFromCookiesOptions<T>,
): InitialThemeResolution<T> {
  const { themes, defaultTheme, initialMode, initialFamily, cookies } = options;

  const fingerprint = computeFingerprint(themes, defaultTheme);
  const savedFingerprint = cookies[themeKitCookieNames.fingerprint];

  let mode: ThemeMode | undefined;
  let family: string | undefined;

  // Trust the persisted selection when the fingerprint is absent (there is
  // nothing to invalidate) or when it matches. A *present but stale* fingerprint
  // is still rejected — that is what invalidates a selection made against a
  // different theme registry.
  //
  // The absent case must not count as a mismatch. The blocking script's guard is
  // `if (fp && fp !== F)`, so it honours `theme-mode`/`theme-family` when the
  // fingerprint cookie is missing; rejecting them here made the server render
  // the fallback theme while the script painted the persisted one — the two
  // halves of the zero-flash contract disagreeing, which shows up as a
  // hydration mismatch. Identical rule to `@theme-kit/remix`'s
  // `readCookieSelection` and `@theme-kit/next`'s `ThemeProvider`.
  if (savedFingerprint === undefined || savedFingerprint === fingerprint) {
    const cookieMode = cookies[themeKitCookieNames.mode];
    if (cookieMode === "light" || cookieMode === "dark" || cookieMode === "system") {
      mode = cookieMode;
    }
    family = cookies[themeKitCookieNames.family];
  }

  return resolveInitialTheme({
    themes,
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(family !== undefined ? { family } : {}),
    ...(mode !== undefined && mode !== "system" ? { mode } : {}),
    ...(initialMode !== undefined && mode === undefined
      ? { mode: initialMode }
      : {}),
    ...(initialFamily !== undefined && family === undefined
      ? { family: initialFamily }
      : {}),
  });
}