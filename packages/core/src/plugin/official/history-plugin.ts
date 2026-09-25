import type { ThemeDefinition } from "../../model/theme";
import type { ThemeHistoryOptions } from "../../history";
import type { ThemePlugin } from "../types";

/**
 * Options for {@link createHistoryPlugin}.
 */
export interface HistoryPluginOptions {
  /** Maximum number of theme selections retained in history. Default `50`. */
  maxSteps?: number;
}

/**
 * Creates a plugin that configures the runtime's theme history.
 *
 * The plugin applies the given history options (notably `maxSteps`) to the
 * runtime's history when the runtime is created.
 *
 * @param options - History configuration.
 * @returns A `"history"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createHistoryPlugin({ maxSteps: 20 }));
 * ```
 *
 * @see {@link HistoryPluginOptions}
 */
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
