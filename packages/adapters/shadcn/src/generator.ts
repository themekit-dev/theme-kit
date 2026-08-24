import type {
  AdapterPlugin,
  AdapterPluginContext,
  ThemeTokens,
} from "@theme-kit/core";
import { resolveTokens } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { readColor, readToken } from "@theme-kit/adapters";
import { resolveShadcnTheme, deriveShadcnColors } from "./tokens";
import { createShadcnRefineContext } from "./refine";

import type { ShadcnColorState } from "./tokens";

export interface ShadcnVariableOptions {
  strategy?: "exact" | "native" | "aggressive";
  plugins?: AdapterPlugin[];
}

function colorKey(theme: AdapterResolvedTheme) {
  return (key: string, fallback?: string) =>
    readColor(theme, key, fallback) ?? "";
}

export function generateShadcnVariables(
  input: ThemeTokens | AdapterResolvedTheme,
  options: ShadcnVariableOptions = {},
): Record<string, string> {
  const theme: AdapterResolvedTheme = resolveShadcnTheme(input as never);
  const rc = colorKey(theme);

  const colors = deriveShadcnColors(theme, rc);

  const state: Record<string, unknown> = { colors };
  const ctx: AdapterPluginContext = createShadcnRefineContext(
    theme.mode,
    options.strategy ?? "native",
  );

  for (const plugin of options.plugins ?? []) {
    const next = plugin.refine?.(state, ctx);
    if (next) Object.assign(state, next);
  }

  const refinedColors =
    (state.colors as ShadcnColorState | undefined) ?? colors;

  const c = refinedColors;

  const vars: Record<string, string> = {
    "--background": c.background ?? "",
    "--foreground": c.foreground ?? "",
    "--card": c.card ?? c.background ?? "",
    "--card-foreground": c.cardForeground ?? c.foreground ?? "",
    "--popover": c.popover ?? c.card ?? c.background ?? "",
    "--popover-foreground": c.popoverForeground ?? c.foreground ?? "",
    "--primary": c.primary ?? "",
    "--primary-foreground": c.primaryForeground ?? "",
    "--secondary": c.secondary ?? c.muted ?? "",
    "--secondary-foreground": c.secondaryForeground ?? c.foreground ?? "",
    "--muted": c.muted ?? "",
    "--muted-foreground": c.mutedForeground ?? "",
    "--accent": c.accent ?? c.secondary ?? "",
    "--accent-foreground": c.accentForeground ?? c.foreground ?? "",
    "--destructive": c.destructive ?? "",
    "--destructive-foreground": c.destructiveForeground ?? "",
    "--border": c.border ?? "",
    "--input": c.input ?? c.border ?? "",
    "--ring": c.ring ?? c.primary ?? "",
    "--chart-1": rc("chart-1", c.ring ?? c.primary),
    "--chart-2": rc("chart-2", c.accent ?? c.secondary),
    "--chart-3": rc("chart-3", c.muted ?? c.border),
    "--chart-4": rc("chart-4", c.mutedForeground),
    "--chart-5": rc("chart-5", c.destructive ?? c.primary),
    "--sidebar": rc("sidebar", c.card ?? c.background),
    "--sidebar-foreground": rc("sidebarForeground", c.foreground),
    "--sidebar-primary": rc("sidebar-primary", c.primary),
    "--sidebar-primary-foreground": rc(
      "sidebar-primary-foreground",
      c.primaryForeground ?? c.primary,
    ),
    "--sidebar-accent": rc("sidebar-accent", c.accent ?? c.secondary),
    "--sidebar-accent-foreground": rc(
      "sidebar-accent-foreground",
      c.accentForeground ?? c.foreground,
    ),
    "--sidebar-border": rc("sidebar-border", c.border),
    "--sidebar-ring": rc("sidebar-ring", c.ring ?? c.primary),
  };

  const radius = readToken(theme, "radius", "lg");
  if (radius) vars["--radius"] = radius;

  let result = vars;
  for (const plugin of options.plugins ?? []) {
    result = plugin.transform?.(result, ctx) ?? result;
  }
  return result;
}

/**
 * Programmatic alternative to `shadcn.css`. Returns concrete shadcn/ui CSS
 * variable values for a given set of Theme Kit tokens.
 *
 * @deprecated prefer `generateShadcnVariables` or `createShadcnAdapter`.
 */
export function createShadcnVariables(
  tokens: ThemeTokens,
): Record<string, string> {
  const theme: AdapterResolvedTheme = {
    name: "__shadcn__",
    mode: undefined,
    tokens: resolveTokens(tokens),
  };
  return generateShadcnVariables(theme);
}
