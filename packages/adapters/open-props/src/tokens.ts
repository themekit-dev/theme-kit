import type { ThemeDefinition } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { resolveAdapterSource } from "@theme-kit/adapters";

export interface OpenPropsColorState {
  background: string | undefined;
  foreground: string | undefined;
  surface1: string | undefined;
  surface2: string | undefined;
  primary: string | undefined;
  accent: string | undefined;
  secondary: string | undefined;
  muted: string | undefined;
  mutedForeground: string | undefined;
  border: string | undefined;
  destructive: string | undefined;
}

export function resolveOpenPropsTheme(
  source: ThemeDefinition | AdapterResolvedTheme,
): AdapterResolvedTheme {
  return resolveAdapterSource(source as never);
}

export function deriveOpenPropsColors(
  theme: AdapterResolvedTheme,
  colorKey: (key: string, fallback?: string) => string | undefined,
): OpenPropsColorState {
  return {
    background: colorKey("background"),
    foreground: colorKey("foreground"),
    surface1: colorKey("card", colorKey("background")),
    surface2: colorKey("muted", colorKey("background")),
    primary: colorKey("primary"),
    accent: colorKey("accent", colorKey("primary")),
    secondary: colorKey("secondary", colorKey("muted")),
    muted: colorKey("muted"),
    mutedForeground: colorKey("mutedForeground", colorKey("muted")),
    border: colorKey("border"),
    destructive: colorKey("destructive"),
  };
}