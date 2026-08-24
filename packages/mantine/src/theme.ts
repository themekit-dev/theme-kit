import { createTheme } from "@mantine/core";
import {
  resolveAdapterSource,
  type AdapterResolvedTheme,
  type AdapterSource,
  generateShades,
  readBreakpoints,
  readColor,
  readFontFamily,
  readFontSize,
  readRadiusNumber,
  readToken,
} from "@theme-kit/adapters";

const DEFAULT_SPACING: Record<string, string> = {
  xs: "0.625rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "2rem",
};

const DEFAULT_FONT_SIZES: Record<string, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
};

const DEFAULT_LINE_HEIGHTS: Record<string, string> = {
  xs: "1.4",
  sm: "1.45",
  md: "1.55",
  lg: "1.6",
  xl: "1.65",
};

const DEFAULT_SHADOWS: Record<string, string> = {
  xs: "0 1px 2px rgba(0,0,0,0.05)",
  sm: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  md: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
  lg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
  xl: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
};

function readMap(
  theme: AdapterResolvedTheme,
  category: "spacing" | "shadows",
  keys: string[],
  defaults: Record<string, string>,
): Record<string, string> {
  const section = theme.tokens[category] as Record<string, unknown> | undefined;
  const result: Record<string, string> = {};
  for (const key of keys) {
    const token = section?.[key];
    if (typeof token === "string") {
      result[key] = token;
    } else if (defaults[key]) {
      result[key] = defaults[key];
    }
  }
  return result;
}

/**
 * Maps Theme Kit semantic tokens onto a Mantine theme.
 *
 * ```ts
 * import { createMantineTheme } from "@theme-kit/mantine";
 * const mantineTheme = createMantineTheme(runtime);
 * ```
 */
export function createMantineTheme(source: AdapterSource) {
  const theme = resolveAdapterSource(source);
  const c = (key: string, fallback?: string) => readColor(theme, key, fallback);

  const primary = c("primary", "#3b5bdb") ?? "#3b5bdb";
  const family = readFontFamily(theme.tokens);
  const monoFamily = readFontFamily(theme.tokens, "ui-monospace, monospace");
  const radius = readRadiusNumber(theme, "lg", 12);

  const spacing = readMap(theme, "spacing", ["xs", "sm", "md", "lg", "xl"], DEFAULT_SPACING);
  const shadows = readMap(theme, "shadows", ["xs", "sm", "md", "lg", "xl"], DEFAULT_SHADOWS);

  return createTheme({
    primaryColor: "primary",
    primaryShade: { light: 6, dark: 8 },
    autoContrast: true,
    colors: {
      primary: generateShades(primary, 10, 6) as [string, string, string, string, string, string, string, string, string, string],
      secondary: generateShades(c("secondary", primary) ?? primary, 10, 6) as [string, string, string, string, string, string, string, string, string, string],
      accent: generateShades(c("accent", primary) ?? primary, 10, 6) as [string, string, string, string, string, string, string, string, string, string],
      destructive: generateShades(c("destructive", "#fa5252") ?? "#fa5252", 10, 6) as [string, string, string, string, string, string, string, string, string, string],
    },
    fontFamily: family,
    fontFamilyMonospace: monoFamily,
    headings: {
      fontFamily: family,
      sizes: {
        h1: { fontSize: readFontSize(theme.tokens, "xl", "2.5rem") },
        h2: { fontSize: readFontSize(theme.tokens, "lg", "2rem") },
        h3: { fontSize: readFontSize(theme.tokens, "lg", "1.5rem") },
        h4: { fontSize: readFontSize(theme.tokens, "md", "1.25rem") },
        h5: { fontSize: readFontSize(theme.tokens, "sm", "1.125rem") },
        h6: { fontSize: readFontSize(theme.tokens, "sm", "1rem") },
      },
    },
    radius: {
      xs: `${Math.round(radius * 0.5)}px`,
      sm: `${Math.round(radius * 0.75)}px`,
      md: `${Math.round(radius * 0.9)}px`,
      lg: `${radius}px`,
      xl: `${Math.round(radius * 1.25)}px`,
    },
    defaultRadius: "lg",
    spacing,
    fontSizes: {
      xs: readFontSize(theme.tokens, "xs", DEFAULT_FONT_SIZES.xs),
      sm: readFontSize(theme.tokens, "sm", DEFAULT_FONT_SIZES.sm),
      md: readFontSize(theme.tokens, "md", DEFAULT_FONT_SIZES.md),
      lg: readFontSize(theme.tokens, "lg", DEFAULT_FONT_SIZES.lg),
      xl: readFontSize(theme.tokens, "xl", DEFAULT_FONT_SIZES.xl),
    },
    lineHeights: { ...DEFAULT_LINE_HEIGHTS },
    shadows,
    breakpoints: readBreakpoints(theme.tokens, {
      xs: "36em",
      sm: "48em",
      md: "62em",
      lg: "75em",
      xl: "88em",
    }),
  });
}