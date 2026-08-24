import { createTheme, type Theme, type ThemeOptions } from "@mui/material/styles";
import {
  resolveAdapterSource,
  type AdapterResolvedTheme,
  type AdapterSource,
  readBreakpoints,
  readColor,
  readFontFamily,
  readFontSize,
  readRadiusNumber,
  readToken,
} from "@theme-kit/adapters";

/**
 * Maps Theme Kit semantic tokens onto a Material UI theme.
 *
 * ```ts
 * import { createMuiTheme } from "@theme-kit/mui";
 * const muiTheme = createMuiTheme(runtime);
 * ```
 */
export function createMuiTheme(source: AdapterSource): Theme {
  const resolved = resolveAdapterSource(source);
  return createTheme(buildMuiThemeOptions(resolved));
}

interface ResolvedColor {
  main: string;
  contrastText?: string;
}

function color(
  main: string | undefined,
  contrast?: string | undefined,
  fallback = "#1976d2",
): ResolvedColor {
  const result: ResolvedColor = { main: main ?? fallback };
  if (contrast) result.contrastText = contrast;
  return result;
}

function buildShadows(theme: AdapterResolvedTheme): ThemeOptions["shadows"] {
  const byIndex = [
    "xs",
    "sm",
    "sm",
    "md",
    "md",
    "md",
    "lg",
    "lg",
    "lg",
    "lg",
    "lg",
    "xl",
    "xl",
    "xl",
    "xl",
    "xl",
    "2xl",
    "2xl",
    "2xl",
    "2xl",
    "2xl",
    "2xl",
    "2xl",
  ];
  const result: string[] = ["none"];
  for (let i = 1; i < 25; i++) {
    const key = byIndex[i - 1] ?? "lg";
    result.push(readToken(theme, "shadows", key) ?? "none");
  }
  return result as ThemeOptions["shadows"];
}

function ensure(value: string | undefined, fallback: string): string {
  return value ?? fallback;
}

export function buildMuiThemeOptions(theme: AdapterResolvedTheme): ThemeOptions {
  const c = (key: string, fallback?: string) => readColor(theme, key, fallback);
  const background = ensure(
    c("background", theme.mode === "dark" ? "#121212" : "#ffffff"),
    theme.mode === "dark" ? "#121212" : "#ffffff",
  );
  const foreground = ensure(
    c("foreground", theme.mode === "dark" ? "#ffffff" : "#000000"),
    theme.mode === "dark" ? "#ffffff" : "#000000",
  );
  const isDark = theme.mode === "dark";

  const options: ThemeOptions = {
    palette: {
      mode: isDark ? "dark" : "light",
      primary: color(c("primary"), c("primaryForeground")),
      secondary: color(
        c("secondary"),
        c("secondaryForeground"),
        isDark ? "#b0bec5" : "#455a64",
      ),
      error: color(c("destructive"), c("destructiveForeground"), "#f44336"),
      warning: color(c("accent"), c("accentForeground"), "#ff9800"),
      info: color(c("info", c("accent")), c("infoForeground")),
      success: color(c("success", c("accent")), c("successForeground")),
      background: {
        default: background,
        paper: ensure(c("card", background), background),
      },
      text: {
        primary: foreground,
        secondary: ensure(c("mutedForeground", foreground), foreground),
      },
      divider: ensure(c("border", isDark ? "#424242" : "#e0e0e0"), isDark ? "#424242" : "#e0e0e0"),
      action: {
        hover: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        selected: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)",
        focus: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      },
    },
    shape: {
      borderRadius: readRadiusNumber(theme, "lg", 8),
    },
    typography: {
      fontFamily: readFontFamily(theme.tokens),
      fontSize: toFontSizePx(readFontSize(theme.tokens)),
    },
    shadows: buildShadows(theme),
    breakpoints: {
      values: toBreakpointValues(theme),
    },
  };

  return options;
}

function toBreakpointValues(theme: AdapterResolvedTheme): Record<"xs" | "sm" | "md" | "lg" | "xl", number> {
  const raw = readBreakpoints(theme.tokens, {});
  return {
    xs: 0,
    sm: toPxNumber(raw.sm ?? "600px"),
    md: toPxNumber(raw.md ?? "900px"),
    lg: toPxNumber(raw.lg ?? "1200px"),
    xl: toPxNumber(raw.xl ?? "1536px"),
  };
}

function toPxNumber(value: string): number {
  const px = /^([\d.]+)px$/.exec(value.trim());
  if (px) return Number(px[1]);
  const rem = /^([\d.]+)rem$/.exec(value.trim());
  if (rem) return Number(rem[1]) * 16;
  const number = Number(value.trim());
  return Number.isFinite(number) ? number : 600;
}

function toFontSizePx(value: string): number {
  const px = /^([\d.]+)px$/.exec(value.trim());
  if (px) return Number(px[1]);
  const rem = /^([\d.]+)rem$/.exec(value.trim());
  if (rem) return Number(rem[1]) * 16;
  const em = /^([\d.]+)em$/.exec(value.trim());
  if (em) return Number(em[1]) * 16;
  const number = Number(value.trim());
  return Number.isFinite(number) ? number : 14;
}