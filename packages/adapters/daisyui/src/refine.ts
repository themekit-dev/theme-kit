import type { AdapterPluginContext, AdapterStrategy } from "@theme-kit/core";

export function createDaisyRefineContext(
  mode: "light" | "dark" | "system" | undefined,
  strategy: AdapterStrategy,
): AdapterPluginContext {
  return { strategy, mode };
}

export type DaisyRefineState = Record<string, unknown>;

export type { AdapterPluginContext, AdapterStrategy };