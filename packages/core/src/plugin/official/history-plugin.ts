import type { ThemeDefinition } from "../../model/theme";
import type { ThemeHistoryOptions } from "../../history";
import type { ThemePlugin } from "../types";

export interface HistoryPluginOptions {
  maxSteps?: number;
}

export function createHistoryPlugin<T extends ThemeDefinition>(
  options?: HistoryPluginOptions,
): ThemePlugin<T> {
  const opts: ThemeHistoryOptions = {
    maxSteps: options?.maxSteps ?? 50,
  };

  return {
    name: "history",
    version: "1.0.0",
    priority: 80,

    onRuntimeCreated(runtime) {
      (runtime.history as any).__options = opts;
    },
  };
}
