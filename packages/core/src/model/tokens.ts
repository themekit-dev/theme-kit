/**
 * Arbitrary nested color values.
 *
 * Keys are semantic color names; values are CSS color strings, nested
 * `ThemeColors` objects, or `undefined` (to remove a key when overriding).
 */
export interface ThemeColors {
  [key: string]: string | ThemeColors | undefined;
}

/**
 * Semantic colors for code and syntax surfaces.
 *
 * Use this group when the application renders syntax-highlighted code,
 * terminals, editors, or documentation code blocks.
 *
 * This token group is opt-in. Themes that do not define `code` do not emit
 * `--theme-code-*` CSS variables.
 *
 * @see {@link ThemeTokens}
 */
export interface CodeTokens {
  /** Code surface background. */
  background?: string;
  /** Default code text color. */
  foreground?: string;
  /** Border or divider color around code surfaces. */
  border?: string;
  /** Comment / documentation text color. */
  comment?: string;
  /** Language keyword color. */
  keyword?: string;
  /** String literal color. */
  string?: string;
  /** Numeric literal color. */
  number?: string;
  /** Function / method name color. */
  function?: string;
  /** Variable identifier color. */
  variable?: string;
  /** Type / class name color. */
  type?: string;
  /** Object property color. */
  property?: string;
  /** Operator color. */
  operator?: string;
  /** Punctuation color. */
  punctuation?: string;
  /** Tag name color (markup). */
  tag?: string;
  /** Attribute color (markup). */
  attribute?: string;
  /** Line number gutter text color. */
  lineNumber?: string;
  /** Text selection highlight. */
  selection?: string;
  /** Highlighted line / token background. */
  highlight?: string;
  /** Gutter background. */
  gutter?: string;
}

/**
 * Semantic token values consumed by the runtime.
 *
 * Top-level groups map to CSS variable namespaces (`--theme-colors-*`,
 * `--theme-spacing-*`, …) when bound to the DOM by the runtime.
 *
 * @see {@link themeToCSSVariables}
 * @see {@link resolveTokens}
 */
export interface ThemeTokens {
  /** Semantic color values. */
  colors?: ThemeColors;

  /** Spacing scale values (typically CSS lengths). */
  spacing?: Record<string, string>;

  /** Border radius scale values. */
  radius?: Record<string, string>;

  /** Shadow values (typically CSS box-shadow strings). */
  shadows?: Record<string, string>;

  /** Border width values. */
  borderWidths?: Record<string, string>;

  /** Z-index values. */
  zIndex?: Record<string, string>;

  /** Responsive breakpoint values. */
  breakpoints?: Record<string, string>;

  /** Typography scale values. */
  typography?: {
    /** Font family values. */
    fontFamilies?: Record<string, string>;
    /** Font size values. */
    fontSizes?: Record<string, string>;
    /** Line height values. */
    lineHeights?: Record<string, string>;
  };

  /** Opt-in semantic colors for code and syntax surfaces. */
  code?: CodeTokens;
}
