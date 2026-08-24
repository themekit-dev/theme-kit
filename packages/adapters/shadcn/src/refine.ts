import type { AdapterPluginContext, AdapterStrategy } from "@theme-kit/core";

export function createShadcnRefineContext(
  mode: "light" | "dark" | "system" | undefined,
  strategy: AdapterStrategy,
): AdapterPluginContext {
  return { strategy, mode };
}

export type ShadcnRefineState = Record<string, unknown>;

export type { AdapterPluginContext, AdapterStrategy };
