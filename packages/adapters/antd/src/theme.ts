import { theme as antdTheme, type ThemeConfig } from "antd";
import {
  resolveAdapterSource,
  type AdapterResolvedTheme,
  type AdapterSource,
  readColor,
  readFontFamily,
  readFontSize,
  readRadiusNumber,
} from "@theme-kit/adapters";

function fontSizeToNumber(value: string): number {
  const trimmed = value.trim();
  const px = /^([\d.]+)px$/.exec(trimmed);
  if (px) return Number(px[1]);
  const rem = /^([\d.]+)rem$/.exec(trimmed);
  if (rem) return Math.round(Number(rem[1]) * 16);
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : 14;
}

/**
 * Maps Theme Kit semantic tokens onto an Ant Design theme config.
 *
 * ```ts
 * import { createAntdTheme } from "@theme-kit/antd";
 * const antdTheme = createAntdTheme(runtime);
 * ```
 */
export function createAntdTheme(source: AdapterSource): ThemeConfig {
  const theme = resolveAdapterSource(source);
  return buildAntdConfig(theme);
}

export function buildAntdConfig(theme: AdapterResolvedTheme): ThemeConfig {
  const c = (key: string, fallback?: string) => readColor(theme, key, fallback);
  const isDark = theme.mode === "dark";
  const background = c("background", isDark ? "#141414" : "#ffffff") ?? (isDark ? "#141414" : "#ffffff");
  const foreground = c("foreground", isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.88)") ?? (isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.88)");
  const primary = c("primary", "#1677ff") ?? "#1677ff";
  const radius = readRadiusNumber(theme, "lg", 8);

  return {
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorInfo: c("accent", primary) ?? primary,
      colorSuccess: c("success", c("muted", "#52c41a")) ?? "#52c41a",
      colorWarning: c("accent", "#faad14") ?? "#faad14",
      colorError: c("destructive", "#ff4d4f") ?? "#ff4d4f",
      colorTextBase: foreground,
      colorBgBase: c("card", background) ?? background,
      colorBgElevated: c("popover", c("card", background)) ?? background,
      colorBgLayout: background,
      colorBorder: c("border", isDark ? "#424242" : "#d9d9d9") ?? (isDark ? "#424242" : "#d9d9d9"),
      colorBorderSecondary: c("muted", isDark ? "#303030" : "#f0f0f0") ?? (isDark ? "#303030" : "#f0f0f0"),
      colorSplit: c("border", isDark ? "#424242" : "#f0f0f0") ?? (isDark ? "#424242" : "#f0f0f0"),
      borderRadius: radius,
      borderRadiusLG: Math.round(radius * 1.25),
      borderRadiusSM: Math.round(radius * 0.75),
      fontFamily: readFontFamily(theme.tokens),
      fontSize: fontSizeToNumber(readFontSize(theme.tokens, "md", "0.875rem")),
    },
    components: {
      Button: {
        primaryColor: c("primaryForeground", "#ffffff") ?? "#ffffff",
        dangerColor: c("destructiveForeground", "#ffffff") ?? "#ffffff",
      },
    },
  };
}