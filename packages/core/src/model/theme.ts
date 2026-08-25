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

/**
 * Extract the literal theme-family union from a tuple of theme definitions.
 * When themes are defined with `as const`, autocomplete shows the available
 * families in `setFamily()` / `initialFamily`:
 *
 * ```ts
 * const themes = [
 *   { name: "mint-light", meta: { family: "mint", mode: "light" }, tokens: {} },
 *   { name: "mint-dark",  meta: { family: "mint", mode: "dark" }, tokens: {} },
 * ] as const;
 * // ThemeFamilies<typeof themes> → "mint"
 * ```
 */
export type ThemeFamilies<T extends readonly ThemeDefinition[]> =
  FamilyOf<T[number]> extends never ? string : FamilyOf<T[number]>;

type FamilyOf<T> = T extends ThemeDefinition<infer _Name>
  ? T["meta"] extends { family?: infer F }
    ? F extends string
      ? F
      : never
    : never
  : never;

/**
 * Extract the literal theme-mode union from a tuple of theme definitions.
 * With `as const`, `ThemeModes<typeof themes> → "light" | "dark"`.
 */
export type ThemeModes<T extends readonly ThemeDefinition[]> =
  ModeOf<T[number]> extends never ? ThemeMode : ModeOf<T[number]>;

type ModeOf<T> = T extends ThemeDefinition<infer _Name>
  ? T["meta"] extends { mode?: infer M }
    ? M extends ThemeMode
      ? M
      : never
    : never
  : never;
