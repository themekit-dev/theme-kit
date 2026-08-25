import type { ThemeDefinition, ThemeName } from "./theme";

/**
 * Define a theme. Currently returns the definition unchanged; it exists
 *    to give themes a consistent shape and future validation.
 */
export function defineTheme<
  Name extends ThemeName,
  T extends ThemeDefinition<Name>,
>(theme: T): T {
  return theme;
}
