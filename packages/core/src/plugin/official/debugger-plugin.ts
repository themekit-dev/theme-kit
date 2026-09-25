import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";

/**
 * Options for {@link createDebuggerPlugin}.
 */
export interface DebuggerPluginOptions {
  /** Log theme changes to the console. Default `true`. */
  logThemeChanges?: boolean;
  /** Log active theme tokens after a theme change. Default `true`. */
  logTokenUpdates?: boolean;
  /** Log theme selection persistence events. Default `true`. */
  logPersistence?: boolean;
  /** Log history events. Default `false`. */
  logHistory?: boolean;
  /** Prefix used for all debug log output. Default `"[theme-kit:debug]"`. */
  label?: string;
}

/**
 * Creates a plugin that logs theme runtime activity to the console.
 *
 * The plugin logs theme changes, active theme tokens, and persistence events
 * (before and after) to the console, gated by the corresponding options.
 *
 * @param options - Debugger configuration.
 * @returns A `"debugger"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createDebuggerPlugin({ label: "[my-app]" }));
 * ```
 *
 * @see {@link DebuggerPluginOptions}
 */
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
