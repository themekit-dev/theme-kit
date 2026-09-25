import type { ThemeDefinition } from "../model/theme";
import type { ThemePlugin, PluginManager } from "./types";
import { createDiagnostic, emitDiagnostic } from "../diagnostics";

/**
 * Creates a {@link PluginManager} for registering and coordinating theme
 * plugins.
 *
 * The returned manager stores plugins by name, orders them by ascending
 * `priority` (default `10`) for hook dispatch, and coordinates destruction.
 *
 * @returns A new, empty plugin manager.
 *
 * @example
 * ```ts
 * const manager = createPluginManager<MyTheme>();
 * const dispose = manager.use(createPersistencePlugin());
 * manager.list(); // [persistence plugin]
 * dispose();      // removes it
 * ```
 *
 * @remarks
 * Registering a plugin whose name is already present is skipped with a
 * console warning and returns a no-op disposer. `destroy` invokes `onDestroy`
 * on every plugin (in priority order) and clears the registry.
 *
 * `destroy` is failure-isolated: a plugin whose `onDestroy` throws is reported
 * with `TK_PLUGIN_DESTROY_FAILED` and the remaining plugins are still
 * destroyed, so one broken plugin cannot leak the rest.
 *
 * @see {@link PluginManager}
 * @see {@link ThemePlugin}
 */
export function createPluginManager<T extends ThemeDefinition>(): PluginManager<T> {
  const plugins = new Map<string, ThemePlugin<T>>();

  function sorted(): ThemePlugin<T>[] {
    return [...plugins.values()].sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10));
  }

  return {
    use(plugin) {
      if (plugins.has(plugin.name)) {
        console.warn(`[theme-kit] Plugin "${plugin.name}" is already registered. Skipping.`);
        return () => {};
      }
      plugins.set(plugin.name, plugin);
      return () => plugins.delete(plugin.name);
    },
    remove(name) {
      return plugins.delete(name);
    },
    list() {
      return sorted();
    },
    get(name) {
      return plugins.get(name);
    },
    destroy() {
      // Teardown is failure-isolated. One plugin whose `onDestroy` throws must
      // not strand the plugins ordered after it, and must not skip `clear()` —
      // a manager that cannot be emptied cannot be rebuilt cleanly. Each
      // failure is reported with the original exception kept as the
      // diagnostic's `cause`, rather than swallowed.
      for (const plugin of sorted()) {
        try {
          plugin.onDestroy?.();
        } catch (error) {
          emitDiagnostic(
            createDiagnostic({
              code: "TK_PLUGIN_DESTROY_FAILED",
              level: "warning",
              message:
                `Plugin "${plugin.name}" threw while being destroyed. ` +
                "The remaining plugins were still destroyed.",
              context: {
                api: "pluginManager.destroy",
                property: "onDestroy",
                received: plugin.name,
              },
              hint:
                "Make onDestroy() tolerant of partial initialisation — it runs " +
                "even when the plugin never finished starting.",
              cause: error,
            }),
          );
        }
      }
      plugins.clear();
    },
  };
}
