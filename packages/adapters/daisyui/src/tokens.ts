import type { ThemeDefinition } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { resolveAdapterSource } from "@theme-kit/adapters";

export interface DaisyColorState {
  base100: string | undefined;
  base200: string | undefined;
  base300: string | undefined;
  baseContent: string | undefined;
  primary: string | undefined;
  primaryContent: string | undefined;
  secondary: string | undefined;
  secondaryContent: string | undefined;
  accent: string | undefined;
  accentContent: string | undefined;
  neutral: string | undefined;
  neutralContent: string | undefined;
  info: string | undefined;
  infoContent: string | undefined;
  success: string | undefined;
  successContent: string | undefined;
  warning: string | undefined;
  warningContent: string | undefined;
  error: string | undefined;
  errorContent: string | undefined;
}

export function resolveDaisyTheme(
  source: ThemeDefinition | AdapterResolvedTheme,
): AdapterResolvedTheme {
  return resolveAdapterSource(source as never);
}

export function deriveDaisyColors(
  theme: AdapterResolvedTheme,
  colorKey: (key: string, fallback?: string) => string | undefined,
): DaisyColorState {
  const fg = colorKey("foreground");

  return {
    base100: colorKey("background"),
    base200: colorKey("secondary", colorKey("muted")),
    base300: colorKey("border", colorKey("muted")),
    baseContent: fg,
    primary: colorKey("primary"),
    primaryContent: colorKey("primaryForeground"),
    secondary: colorKey("secondary"),
    secondaryContent: colorKey("secondaryForeground"),
    accent: colorKey("accent"),
    accentContent: colorKey("accentForeground"),
    neutral: colorKey("muted", colorKey("border")),
    neutralContent: colorKey("mutedForeground"),
    info: colorKey("info", colorKey("accent")),
    infoContent: colorKey("infoForeground", colorKey("accentForeground")),
    success: colorKey("success", colorKey("secondary")),
    successContent: colorKey(
      "successForeground",
      colorKey("secondaryForeground"),
    ),
    warning: colorKey("warning", colorKey("accent")),
    warningContent: colorKey("warningForeground", colorKey("accentForeground")),
    error: colorKey("destructive"),
    errorContent: colorKey("destructiveForeground"),
  };
}