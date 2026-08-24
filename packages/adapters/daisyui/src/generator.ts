import type {
  AdapterPlugin,
  AdapterPluginContext,
  ThemeTokens,
} from "@theme-kit/core";
import { resolveTokens } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "@theme-kit/adapters";
import { readColor, readToken } from "@theme-kit/adapters";
import { resolveDaisyTheme, deriveDaisyColors } from "./tokens";
import { createDaisyRefineContext } from "./refine";

import type { DaisyColorState } from "./tokens";

export interface DaisyVariableOptions {
  strategy?: "exact" | "native" | "aggressive";
  plugins?: AdapterPlugin[];
}

function colorKey(theme: AdapterResolvedTheme) {
  return (key: string, fallback?: string) =>
    readColor(theme, key, fallback) ?? "";
}

export function generateDaisyVariables(
  input: ThemeTokens | AdapterResolvedTheme,
  options: DaisyVariableOptions = {},
): Record<string, string> {
  const theme: AdapterResolvedTheme = resolveDaisyTheme(input as never);
  const rc = colorKey(theme);
  const present = (value: string | undefined): value is string =>
    typeof value === "string" && value.length > 0;

  const colors = deriveDaisyColors(theme, rc);

  const state: Record<string, unknown> = { colors };
  const ctx: AdapterPluginContext = createDaisyRefineContext(
    theme.mode,
    options.strategy ?? "native",
  );

  for (const plugin of options.plugins ?? []) {
    const next = plugin.refine?.(state, ctx);
    if (next) Object.assign(state, next);
  }

  const refinedColors = (state.colors as DaisyColorState | undefined) ?? colors;

  const c = refinedColors;

  const vars: Record<string, string> = {
    "--color-base-100": c.base100 ?? "",
    "--color-base-200": c.base200 ?? "",
    "--color-base-300": c.base300 ?? "",
    "--color-base-content": c.baseContent ?? "",
    "--color-primary": c.primary ?? "",
    "--color-primary-content": c.primaryContent ?? "",
    "--color-secondary": c.secondary ?? "",
    "--color-secondary-content": c.secondaryContent ?? "",
    "--color-accent": c.accent ?? "",
    "--color-accent-content": c.accentContent ?? "",
    "--color-neutral": c.neutral ?? "",
    "--color-neutral-content": c.neutralContent ?? "",
    "--color-info": c.info ?? "",
    "--color-info-content": c.infoContent ?? "",
    "--color-success": c.success ?? "",
    "--color-success-content": c.successContent ?? "",
    "--color-warning": c.warning ?? "",
    "--color-warning-content": c.warningContent ?? "",
    "--color-error": c.error ?? "",
    "--color-error-content": c.errorContent ?? "",
    "--radius-selector": readToken(theme, "radius", "sm", "0.25rem") ?? "0.25rem",
    "--radius-field": readToken(theme, "radius", "md", "0.25rem") ?? "0.25rem",
    "--radius-box": readToken(theme, "radius", "lg", "0.5rem") ?? "0.5rem",
    "--border": readToken(theme, "borderWidths", "_default", "1px") ?? "1px",
  };

  for (const [key, value] of Object.entries(vars)) {
    if (!present(value)) delete vars[key];
  }

  let result = vars;
  for (const plugin of options.plugins ?? []) {
    result = plugin.transform?.(result, ctx) ?? result;
  }
  return result;
}

/**
 * Programmatic alternative to `daisyui.css`. Returns concrete daisyUI 5 CSS
 * variable values for a given set of Theme Kit tokens.
 *
 * @deprecated prefer `generateDaisyVariables` or `createDaisyAdapter`.
 */
export function createDaisyVariables(tokens: ThemeTokens): Record<string, string> {
  const theme: AdapterResolvedTheme = {
    name: "__daisy__",
    mode: undefined,
    tokens: resolveTokens(tokens),
  };
  return generateDaisyVariables(theme);
}