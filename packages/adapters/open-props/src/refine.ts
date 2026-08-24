import type { AdapterPluginContext, AdapterStrategy } from "@theme-kit/core";

export function createOpenPropsRefineContext(
  mode: "light" | "dark" | "system" | undefined,
  strategy: AdapterStrategy,
): AdapterPluginContext {
  return { strategy, mode };
}

export type OpenPropsRefineState = Record<string, unknown>;

export type { AdapterPluginContext, AdapterStrategy };