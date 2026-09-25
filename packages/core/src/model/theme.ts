import type { ThemeMeta } from "./meta";
import type { ThemeTokens } from "./tokens";

/**
 * Stable theme identifier used for selection and lookup.
 *
 * Any string is accepted; use a readable family-oriented name such as
 * `"mint-light"` or `"dark"`.
 */
export type ThemeName = string;

/**
 * The color-mode dimension of a theme selection.
 *
 * - `"light"` and `"dark"` are explicit modes.
 * - `"system"` follows the visitor's `prefers-color-scheme` preference and
 *   resolves to `"light"` or `"dark"` at selection time.
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * A theme definition: a name plus optional metadata and token values.
 *
 * @typeParam Name The literal theme name, inferred from `as const` arrays.
 *
 * @see {@link defineTheme}
 * @see {@link extendTheme}
 * @see {@link composeTheme}
 */
export interface ThemeDefinition<Name extends ThemeName = ThemeName> {
  /**
   * Stable theme identifier used for selection and lookup.
   */
  name: Name;

  /**
   * Names of themes this definition extends. Extending merges the base
   * themes' tokens before applying this definition's own tokens.
   */
  extends?: Name | readonly Name[];

  /**
   * Metadata describing the theme family, mode, and presentation labels.
   */
  meta?: ThemeMeta;

  /**
   * Semantic token values consumed by the runtime. When omitted, the
   * theme inherits tokens entirely from its extended bases.
   */
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
