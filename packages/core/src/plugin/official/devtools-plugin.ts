import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";

export interface DevToolsPluginOptions {
  enabled?: boolean;
}

export function createDevToolsPlugin<T extends ThemeDefinition>(
  options?: DevToolsPluginOptions,
): ThemePlugin<T> {
  const enabled = options?.enabled ?? true;

  let _runtime: { themes: readonly T[]; selection: { getMode(): string; getFamily(): string; getSelection(): unknown }; store: { get(): T }; history: { getHistory(): unknown[] }; lifecycle: { on(event: string, handler: (...args: unknown[]) => void): () => void } } | null = null;

  function exposeToGlobal() {
    if (typeof window === "undefined") return;
    const win = window as any;
    if (!win.__THEME_KIT_DEVTOOLS__) {
      win.__THEME_KIT_DEVTOOLS__ = new Set();
    }
    win.__THEME_KIT_DEVTOOLS__.add({
      getState() {
        if (!_runtime) return null;
        return {
          themes: _runtime.themes,
          selection: _runtime.selection.getSelection(),
          activeTheme: _runtime.store.get(),
          history: _runtime.history.getHistory(),
        };
      },
    });
  }

  return {
    name: "devtools",
    version: "1.0.0",
    priority: 0,

    onRuntimeCreated(runtime) {
      if (!enabled) return;
      _runtime = runtime;
      exposeToGlobal();
    },

    onDestroy() {
      _runtime = null;
    },
  };
}
