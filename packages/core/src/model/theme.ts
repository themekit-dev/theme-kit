import type { ThemeMeta } from "./meta";
import type { ThemeTokens } from "./tokens";

export type ThemeName = string;
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeDefinition<Name extends ThemeName = ThemeName> {
  name: Name;
  extends?: Name | readonly Name[];
  meta?: ThemeMeta;
  tokens?: ThemeTokens;
}
