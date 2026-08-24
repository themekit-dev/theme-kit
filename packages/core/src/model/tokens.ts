export interface ThemeColors {
  [key: string]: string | ThemeColors | undefined;
}

export interface CodeTokens {
  background?: string;
  foreground?: string;
  border?: string;
  comment?: string;
  keyword?: string;
  string?: string;
  number?: string;
  function?: string;
  variable?: string;
  type?: string;
  property?: string;
  operator?: string;
  punctuation?: string;
  tag?: string;
  attribute?: string;
  lineNumber?: string;
  selection?: string;
  highlight?: string;
  gutter?: string;
}

export interface ThemeTokens {
  colors?: ThemeColors;
  spacing?: Record<string, string>;
  radius?: Record<string, string>;
  shadows?: Record<string, string>;
  borderWidths?: Record<string, string>;
  zIndex?: Record<string, string>;
  breakpoints?: Record<string, string>;
  typography?: {
    fontFamilies?: Record<string, string>;
    fontSizes?: Record<string, string>;
    lineHeights?: Record<string, string>;
  };
  code?: CodeTokens;
}
