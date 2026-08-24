import type { ThemeDefinition } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { resolveAdapterSource } from "@theme-kit/adapters";

export interface BootstrapColorState {
  primary: string | undefined;
  secondary: string | undefined;
  success: string | undefined;
  danger: string | undefined;
  warning: string | undefined;
  info: string | undefined;
}

export function resolveBootstrapTheme(
  source: ThemeDefinition | AdapterResolvedTheme,
): AdapterResolvedTheme {
  return resolveAdapterSource(source as never);
}

export function deriveBootstrapColors(
  theme: AdapterResolvedTheme,
  colorKey: (key: string) => string | undefined,
): BootstrapColorState {
  const first = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = colorKey(key);
      if (value) return value;
    }
    return undefined;
  };

  return {
    primary: colorKey("primary"),
    secondary: colorKey("secondary"),
    success: first("success", "accent"),
    danger: colorKey("destructive"),
    warning: first("warning", "accent"),
    info: first("info", "accent"),
  };
}