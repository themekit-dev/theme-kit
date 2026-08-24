import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";

export interface DebuggerPluginOptions {
  logThemeChanges?: boolean;
  logTokenUpdates?: boolean;
  logPersistence?: boolean;
  logHistory?: boolean;
  label?: string;
}

export function createDebuggerPlugin<T extends ThemeDefinition>(
  options?: DebuggerPluginOptions,
): ThemePlugin<T> {
  const opts = {
    logThemeChanges: true,
    logTokenUpdates: true,
    logPersistence: true,
    logHistory: false,
    label: "[theme-kit:debug]",
    ...options,
  };

  return {
    name: "debugger",
    version: "1.0.0",
    priority: 0,

    onBeforeThemeChange({ current, next }) {
      if (opts.logThemeChanges) {
        console.groupCollapsed(`${opts.label} Theme Change`);
        console.log("From:", current.name);
        console.log("To:", next.name);
        console.groupEnd();
      }
    },

    onAfterThemeChange({ theme }) {
      if (opts.logTokenUpdates) {
        console.log(`${opts.label} Active theme:`, theme.name, theme.tokens);
      }
    },

    onBeforePersist({ selection }) {
      if (opts.logPersistence) {
        console.log(`${opts.label} Persisting selection:`, selection);
      }
    },

    onAfterPersist({ selection }) {
      if (opts.logPersistence) {
        console.log(`${opts.label} Persisted selection:`, selection);
      }
    },
  };
}
