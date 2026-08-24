import {
  resolveInitialTheme,
  type InitialThemeResolution,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";
import { themeKitCookieNames, type ParsedCookies } from "./cookies";

export interface ResolveThemeFromCookiesOptions<T extends ThemeDefinition> {
  themes: readonly T[];
  defaultTheme?: T["name"];
  initialMode?: ThemeMode;
  initialFamily?: string;
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
 */
export function resolveThemeFromCookies<T extends ThemeDefinition>(
  options: ResolveThemeFromCookiesOptions<T>,
): InitialThemeResolution<T> {
  const { themes, defaultTheme, initialMode, initialFamily, cookies } = options;

  const fingerprint = computeFingerprint(themes, defaultTheme);
  const savedFingerprint = cookies[themeKitCookieNames.fingerprint];

  let mode: ThemeMode | undefined;
  let family: string | undefined;

  if (savedFingerprint === fingerprint) {
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