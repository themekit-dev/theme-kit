import type { ThemeDefinition } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { resolveAdapterSource } from "@theme-kit/adapters";

export interface ShadcnColorState {
  background: string | undefined;
  foreground: string | undefined;
  card: string | undefined;
  cardForeground: string | undefined;
  popover: string | undefined;
  popoverForeground: string | undefined;
  primary: string | undefined;
  primaryForeground: string | undefined;
  secondary: string | undefined;
  secondaryForeground: string | undefined;
  muted: string | undefined;
  mutedForeground: string | undefined;
  accent: string | undefined;
  accentForeground: string | undefined;
  destructive: string | undefined;
  destructiveForeground: string | undefined;
  border: string | undefined;
  input: string | undefined;
  ring: string | undefined;
}

export function resolveShadcnTheme(
  source: ThemeDefinition | AdapterResolvedTheme,
): AdapterResolvedTheme {
  return resolveAdapterSource(source as never);
}

export function deriveShadcnColors(
  theme: AdapterResolvedTheme,
  colorKey: (key: string, fallback?: string) => string | undefined,
): ShadcnColorState {
  const bg = colorKey("background");
  const fg = colorKey("foreground");

  return {
    background: bg,
    foreground: fg,
    card: colorKey("card", bg),
    cardForeground: colorKey("cardForeground", fg),
    popover: colorKey("popover", bg),
    popoverForeground: colorKey("popoverForeground", fg),
    primary: colorKey("primary"),
    primaryForeground: colorKey("primaryForeground"),
    secondary: colorKey("secondary", colorKey("muted")),
    secondaryForeground: colorKey("secondaryForeground", fg),
    muted: colorKey("muted"),
    mutedForeground: colorKey("mutedForeground"),
    accent: colorKey("accent", colorKey("secondary")),
    accentForeground: colorKey("accentForeground", fg),
    destructive: colorKey("destructive"),
    destructiveForeground: colorKey("destructiveForeground"),
    border: colorKey("border"),
    input: colorKey("input", colorKey("border")),
    ring: colorKey("ring", colorKey("primary")),
  };
}
