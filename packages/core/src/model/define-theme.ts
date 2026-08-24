import type { ThemeDefinition, ThemeName } from "./theme";

export function defineTheme<
  Name extends ThemeName,
  T extends ThemeDefinition<Name>,
>(theme: T): T {
  return theme;
}
