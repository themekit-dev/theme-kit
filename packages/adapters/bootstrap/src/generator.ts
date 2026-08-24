import type {
  AdapterPlugin,
  AdapterPluginContext,
  ThemeTokens,
} from "@theme-kit/core";
import { resolveTokens } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import {
  readColor,
  readFontFamily,
  readToken,
  rgbTriplet,
} from "@theme-kit/adapters";
import { resolveBootstrapTheme, deriveBootstrapColors } from "./tokens";
import { createBootstrapRefineContext } from "./refine";

import type { BootstrapColorState } from "./tokens";

export interface BootstrapVariableOptions {
  strategy?: "exact" | "native" | "aggressive";
  plugins?: AdapterPlugin[];
}

function colorKey(theme: AdapterResolvedTheme) {
  return (key: string, fallback?: string) => readColor(theme, key, fallback) ?? "";
}

export function generateBootstrapVariables(
  input: ThemeTokens | AdapterResolvedTheme,
  options: BootstrapVariableOptions = {},
): Record<string, string> {
  const theme: AdapterResolvedTheme = resolveBootstrapTheme(input as never);
  const rc = colorKey(theme);
  const present = (value: string | undefined): value is string =>
    typeof value === "string" && value.length > 0;

  const colors = deriveBootstrapColors(theme, rc);

  const state: Record<string, unknown> = { colors };
  const ctx: AdapterPluginContext = createBootstrapRefineContext(
    theme.mode,
    options.strategy ?? "native",
  );

  for (const plugin of options.plugins ?? []) {
    const next = plugin.refine?.(state, ctx);
    if (next) Object.assign(state, next);
  }

  const refinedColors = (state.colors as BootstrapColorState | undefined) ?? colors;

  const border = rc("border");

  const vars: Record<string, string> = {
    "--bs-body-bg": rc("background"),
    "--bs-body-color": rc("foreground"),
    "--bs-body-font-family": readFontFamily(theme.tokens),
    "--bs-border-color": border,
    "--bs-border-color-translucent": border
      ? `color-mix(in srgb, ${border} 50%, transparent)`
      : "",
    "--bs-border-radius":
      readToken(theme, "radius", "md", "0.375rem") ?? "0.375rem",
    "--bs-border-radius-sm":
      readToken(theme, "radius", "sm", "0.25rem") ?? "0.25rem",
    "--bs-border-radius-lg":
      readToken(theme, "radius", "lg", "0.5rem") ?? "0.5rem",
    "--bs-border-radius-xl":
      readToken(theme, "radius", "xl", "1rem") ?? "1rem",
    "--bs-link-color": refinedColors.primary ?? rc("primary"),
    "--bs-link-hover-color": rc("ring", refinedColors.primary ?? rc("primary")),
  };

  const colorMap: Record<string, string | undefined> = {
    primary: refinedColors.primary,
    secondary: refinedColors.secondary,
    success: refinedColors.success,
    danger: refinedColors.danger,
    warning: refinedColors.warning,
    info: refinedColors.info,
  };

  for (const [name, color] of Object.entries(colorMap)) {
    if (!present(color)) continue;
    vars[`--bs-${name}`] = color;
    const triplet = rgbTriplet(color);
    if (triplet) vars[`--bs-${name}-rgb`] = triplet;
  }

  let result = vars;
  for (const plugin of options.plugins ?? []) {
    result = plugin.transform?.(result, ctx) ?? result;
  }
  return result;
}

/**
 * Programmatic alternative to `bootstrap.css`. Returns concrete Bootstrap 5
 * CSS variable values — including `-rgb` companion variables that plain CSS
 * cannot derive.
 *
 * @deprecated prefer `generateBootstrapVariables` or `createBootstrapAdapter`.
 */
export function createBootstrapVariables(tokens: ThemeTokens): Record<string, string> {
  const theme: AdapterResolvedTheme = {
    name: "__bootstrap__",
    mode: undefined,
    tokens: resolveTokens(tokens),
  };
  return generateBootstrapVariables(theme);
}
