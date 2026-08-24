import { definePreset, type Preset } from "@unocss/core";
import type { ThemeTokens } from "@theme-kit/core";
import type { AdapterSource } from "@theme-kit/adapters";
import { resolveAdapterSource } from "@theme-kit/adapters";

function pair(name: string, fallback?: string): string {
  return fallback
    ? `var(--theme-color-${name}, ${fallback})`
    : `var(--theme-color-${name})`;
}

function pairForeground(name: string): string {
  return `var(--theme-color-${name}-foreground, var(--theme-color-${name}Foreground))`;
}

/**
 * UnoCSS preset that exposes Theme Kit semantic tokens as utilities such as
 * `bg-primary`, `text-foreground`, `border-border`, `rounded-lg`, etc.
 * Values reference the live `--theme-*` variables, so they update at runtime.
 */
export function presetThemeKit(): Preset {
  return definePreset({
    name: "@theme-kit/unocss",
    theme: {
      colors: {
        background: pair("background"),
        foreground: pair("foreground"),
        card: {
          DEFAULT: pair("card", "var(--theme-color-background)"),
          foreground: pairForeground("card"),
        },
        popover: {
          DEFAULT: pair("popover", "var(--theme-color-card)"),
          foreground: pairForeground("popover"),
        },
        primary: {
          DEFAULT: pair("primary"),
          foreground: pairForeground("primary"),
        },
        secondary: {
          DEFAULT: pair("secondary", "var(--theme-color-muted)"),
          foreground: pairForeground("secondary"),
        },
        muted: {
          DEFAULT: pair("muted"),
          foreground: pairForeground("muted"),
        },
        accent: {
          DEFAULT: pair("accent", "var(--theme-color-secondary)"),
          foreground: pairForeground("accent"),
        },
        destructive: {
          DEFAULT: pair("destructive"),
          foreground: pairForeground("destructive"),
        },
        border: pair("border"),
        input: pair("input", "var(--theme-color-border)"),
        ring: pair("ring", "var(--theme-color-primary)"),
      },
      borderRadius: {
        sm: "var(--theme-radius-sm, calc(var(--theme-radius-lg) * 0.75))",
        md: "var(--theme-radius-md, calc(var(--theme-radius-lg) * 0.9))",
        lg: "var(--theme-radius-lg)",
        xl: "var(--theme-radius-xl, calc(var(--theme-radius-lg) * 1.25))",
      },
      boxShadow: {
        sm: "var(--theme-shadow-sm)",
        md: "var(--theme-shadow-md)",
        lg: "var(--theme-shadow-lg)",
        xl: "var(--theme-shadow-xl)",
      },
      fontFamily: {
        sans: "var(--theme-typography-font-family-sans)",
        mono: "var(--theme-typography-font-family-mono, ui-monospace, monospace)",
      },
    },
  }) as Preset;
}

/**
 * Returns a static UnoCSS theme object with concrete values for a given set of
 * Theme Kit tokens (useful for build-time generation instead of runtime vars).
 */
export function createUnoTheme(source: AdapterSource) {
  const theme = resolveAdapterSource(source);
  const tokens = theme.tokens;

  const read = (category: "colors" | "radius" | "shadows", key: string): string | undefined => {
    const section = tokens[category] as Record<string, unknown> | undefined;
    const value = section?.[key];
    return typeof value === "string" ? value : undefined;
  };

  const result: Record<string, unknown> = {
    colors: {
      background: read("colors", "background"),
      foreground: read("colors", "foreground"),
      primary: read("colors", "primary"),
      secondary: read("colors", "secondary"),
      accent: read("colors", "accent"),
      muted: read("colors", "muted"),
      destructive: read("colors", "destructive"),
      border: read("colors", "border"),
      ring: read("colors", "ring"),
    },
    borderRadius: {
      sm: read("radius", "sm"),
      md: read("radius", "md"),
      lg: read("radius", "lg"),
      xl: read("radius", "xl"),
    },
    boxShadow: {
      sm: read("shadows", "sm"),
      md: read("shadows", "md"),
      lg: read("shadows", "lg"),
      xl: read("shadows", "xl"),
    },
  };

  return pruneUndefined(result);
}

function pruneUndefined(input: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(input)) {
    const value = input[key];
    if (value && typeof value === "object") {
      pruneUndefined(value as Record<string, unknown>);
    }
    if (value === undefined) delete input[key];
  }
  return input;
}

export type { ThemeTokens };