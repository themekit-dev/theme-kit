import {
  resolveInitialTheme,
  type InitialThemeResolution,
  type ResolveInitialThemeOptions,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";

export async function getInitialThemeState<T extends ThemeDefinition>(
  request: Request,
  options: ResolveInitialThemeOptions<T>,
): Promise<InitialThemeResolution<T>> {
  const cookieHeader = request.headers.get("Cookie") ?? "";

  function getCookie(name: string): string | undefined {
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]!) : undefined;
  }

  const mode = getCookie("theme-mode");
  const family = getCookie("theme-family");

  return resolveInitialTheme({
    ...options,
    ...(mode &&
      (mode === "light" || mode === "dark" || mode === "system") && {
        mode: mode as ThemeMode,
      }),
    ...(family && {
      family,
    }),
  });
}
