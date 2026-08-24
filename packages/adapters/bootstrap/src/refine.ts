import type { AdapterPluginContext, AdapterStrategy } from "@theme-kit/core";

export function createBootstrapRefineContext(
  mode: "light" | "dark" | "system" | undefined,
  strategy: AdapterStrategy,
): AdapterPluginContext {
  return { strategy, mode };
}

export type BootstrapRefineState = Record<string, unknown>;

export type { AdapterPluginContext, AdapterStrategy };