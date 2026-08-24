import type { ThemeDefinition } from "../model/theme";
import type { ThemePlugin, PluginManager } from "./types";

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
      for (const plugin of sorted()) {
        plugin.onDestroy?.();
      }
      plugins.clear();
    },
  };
}
