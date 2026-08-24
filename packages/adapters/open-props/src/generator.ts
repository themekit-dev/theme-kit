import type {
  AdapterPlugin,
  AdapterPluginContext,
  ThemeTokens,
} from "@theme-kit/core";
import { resolveTokens } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { readColor, readFontFamily, readToken } from "@theme-kit/adapters";
import { resolveOpenPropsTheme, deriveOpenPropsColors } from "./tokens";
import { createOpenPropsRefineContext } from "./refine";

import type { OpenPropsColorState } from "./tokens";

export interface OpenPropsVariableOptions {
  strategy?: "exact" | "native" | "aggressive";
  plugins?: AdapterPlugin[];
}

function colorKey(theme: AdapterResolvedTheme) {
  return (key: string, fallback?: string) =>
    readColor(theme, key, fallback) ?? "";
}

export function generateOpenPropsVariables(
  input: ThemeTokens | AdapterResolvedTheme,
  options: OpenPropsVariableOptions = {},
): Record<string, string> {
  const theme: AdapterResolvedTheme = resolveOpenPropsTheme(input as never);
  const rc = colorKey(theme);

  const colors = deriveOpenPropsColors(theme, rc);

  const state: Record<string, unknown> = { colors };
  const ctx: AdapterPluginContext = createOpenPropsRefineContext(
    theme.mode,
    options.strategy ?? "native",
  );

  for (const plugin of options.plugins ?? []) {
    const next = plugin.refine?.(state, ctx);
    if (next) Object.assign(state, next);
  }

  const refinedColors =
    (state.colors as OpenPropsColorState | undefined) ?? colors;

  const c = refinedColors;

  const vars: Record<string, string> = {
    "--color-canvas": c.background ?? "",
    "--color-background": c.background ?? "",
    "--color-text": c.foreground ?? "",
    "--color-foreground": c.foreground ?? "",
    "--color-surface-1": c.surface1 ?? "",
    "--color-surface-2": c.surface2 ?? "",
    "--color-primary": c.primary ?? "",
    "--brand": c.primary ?? "",
    "--link": c.primary ?? "",
    "--color-accent": c.accent ?? "",
    "--color-secondary": c.secondary ?? "",
    "--color-muted": c.muted ?? "",
    "--color-muted-foreground": c.mutedForeground ?? "",
    "--color-border": c.border ?? "",
    "--color-error": c.destructive ?? "",
    "--color-danger": c.destructive ?? "",
    "--radius-1": readToken(theme, "radius", "sm", "0.25rem") ?? "0.25rem",
    "--radius-2": readToken(theme, "radius", "md", "0.5rem") ?? "0.5rem",
    "--radius-3": readToken(theme, "radius", "lg", "0.75rem") ?? "0.75rem",
    "--radius-4": readToken(theme, "radius", "xl", "1rem") ?? "1rem",
    "--font-sans": readFontFamily(theme.tokens),
    "--font-mono": readFontFamily(theme.tokens, "ui-monospace, monospace", "mono"),
    "--shadow-1": readToken(theme, "shadows", "sm", "0 1px 3px rgba(0,0,0,0.1)") ?? "0 1px 3px rgba(0,0,0,0.1)",
    "--shadow-2": readToken(theme, "shadows", "md", "0 4px 6px rgba(0,0,0,0.07)") ?? "0 4px 6px rgba(0,0,0,0.07)",
    "--shadow-3": readToken(theme, "shadows", "lg", "0 10px 15px rgba(0,0,0,0.1)") ?? "0 10px 15px rgba(0,0,0,0.1)",
    "--shadow-4": readToken(theme, "shadows", "xl", "0 20px 25px rgba(0,0,0,0.1)") ?? "0 20px 25px rgba(0,0,0,0.1)",
    "--size-1": readToken(theme, "spacing", "1", "0.25rem") ?? "0.25rem",
    "--size-2": readToken(theme, "spacing", "2", "0.5rem") ?? "0.5rem",
    "--size-3": readToken(theme, "spacing", "3", "0.75rem") ?? "0.75rem",
    "--size-4": readToken(theme, "spacing", "4", "1rem") ?? "1rem",
    "--size-5": readToken(theme, "spacing", "5", "1.25rem") ?? "1.25rem",
    "--size-6": readToken(theme, "spacing", "6", "1.5rem") ?? "1.5rem",
    "--size-8": readToken(theme, "spacing", "8", "2rem") ?? "2rem",
    "--size-10": readToken(theme, "spacing", "10", "2.5rem") ?? "2.5rem",
    "--size-12": readToken(theme, "spacing", "12", "3rem") ?? "3rem",
  };

  let result = vars;
  for (const plugin of options.plugins ?? []) {
    result = plugin.transform?.(result, ctx) ?? result;
  }
  return result;
}

/**
 * Programmatic alternative to `open-props.css`. Returns concrete Open Props
 * CSS variable values for a given set of Theme Kit tokens.
 *
 * @deprecated prefer `generateOpenPropsVariables` or `createOpenPropsAdapter`.
 */
export function createOpenPropsVariables(
  tokens: ThemeTokens,
): Record<string, string> {
  const theme: AdapterResolvedTheme = {
    name: "__open_props__",
    mode: undefined,
    tokens: resolveTokens(tokens),
  };
  return generateOpenPropsVariables(theme);
}