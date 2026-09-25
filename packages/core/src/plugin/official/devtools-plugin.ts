import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";

/**
 * Options for {@link createDevToolsPlugin}.
 */
export interface DevToolsPluginOptions {
  /** Whether the plugin exposes runtime state to the browser devtools.
   *  Default `true`. */
  enabled?: boolean;
}

/**
 * Creates a plugin that exposes the theme runtime to browser devtools.
 *
 * When enabled, the plugin registers a devtools hook on `window` that exposes
 * the current themes, selection, active theme, and history, so a devtools
 * extension can inspect the runtime state.
 *
 * @param options - Devtools configuration.
 * @returns A `"devtools"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createDevToolsPlugin());
 * ```
 *
 * @remarks
 * The hook is only registered in browser environments. `onDestroy` clears the
 * internal runtime reference.
 *
 * Entries are added to the same `window.__THEME_KIT_DEVTOOLS__` set that
 * `@theme-kit/devtools`'s inspector plugin uses, and must satisfy that set's
 * declared shape — `getState()`, `getEntries()`, `getPerformance()`. This
 * plugin records no entries or performance samples, so those two return empty
 * arrays; the point is that a consumer enumerating the set can call all three
 * on every member without a type check. Use
 * `@theme-kit/devtools`'s `createDevToolsPlugin` instead when you want the
 * recorded entries and timings.
 *
 * @see {@link DevToolsPluginOptions}
 */
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

      // Present so this entry matches the shape `@theme-kit/devtools` registers
      // and the docs declare for the set. Omitting them made the documented
      // consumer loop (`inspector.getEntries()`) throw on any page that
      // installed this plugin rather than the inspector one.
      getEntries(): unknown[] {
        return [];
      },

      getPerformance(): unknown[] {
        return [];
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
