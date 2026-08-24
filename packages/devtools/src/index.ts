import type { ThemeRuntime, ThemeDefinition } from "@theme-kit/core";
import { createDevToolsInspector } from "./inspector";
import { createDevToolsPanel } from "./panel";
import type { DevToolsInspector, DevToolsEntry, DevToolsPerformanceEntry, DevToolsInspectorOptions, DevToolsState } from "./types";

export { createDevToolsInspector, createDevToolsPanel };
export type { DevToolsInspector, DevToolsEntry, DevToolsPerformanceEntry, DevToolsInspectorOptions, DevToolsState };

export function createDevToolsPlugin<T extends ThemeDefinition>(options?: DevToolsInspectorOptions) {
  const inspector = createDevToolsInspector<T>(options);
  const unsubscribe: Array<() => void> = [];

  return {
    name: "devtools-inspector",
    version: "1.0.0",
    priority: 0,

    onRuntimeCreated(runtime: ThemeRuntime<T>) {
      inspector._bindRuntime(runtime as any);

      if (typeof window !== "undefined") {
        const win = window as any;
        if (!win.__THEME_KIT_DEVTOOLS__) {
          win.__THEME_KIT_DEVTOOLS__ = new Set();
        }
        win.__THEME_KIT_DEVTOOLS__.add(inspector);
      }

      const unsub = runtime.lifecycle.on("beforeThemeChange", () => {
        inspector._addPerfEntry("beforeThemeChange", 0);
      });
      unsubscribe.push(unsub);

      const unsub2 = runtime.lifecycle.on("afterThemeChange", () => {
        inspector._addPerfEntry("afterThemeChange", 0);
        inspector._addEntry("theme-change", "Theme changed", {});
      });
      unsubscribe.push(unsub2);
    },

    getInspector() {
      return inspector;
    },

    onDestroy() {
      unsubscribe.forEach((fn) => fn());
      unsubscribe.length = 0;
      inspector.destroy();
    },
  };
}