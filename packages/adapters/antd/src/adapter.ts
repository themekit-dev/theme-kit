import type {
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import type { ThemeConfig } from "antd";
import { createAntdTheme } from "./theme";
import type { AntdAdapterOptions } from "./defaults";

/**
 * Options for {@link createAntdAdapter}.
 *
 * @see {@link createAntdAdapter}
 */
export interface CreateAntdAdapterOptions extends AntdAdapterOptions {}

/**
 * An Ant Design adapter that exposes its generated theme config synchronously
 * via `getSnapshot` / `subscribe`, so both the runtime-owned registry and React
 * (`useSyncExternalStore`) can consume it.
 */
export interface AntdThemeAdapter<T extends ThemeDefinition>
  extends ThemeAdapter<T> {
  /**
   * Returns the latest generated Ant Design theme config, or `null` before the
   * first install or after uninstall.
   */
  getSnapshot(): ThemeConfig | null;
  /**
   * Registers a listener invoked whenever the generated theme config changes.
   *
   * @param listener The callback to invoke on change.
   * @returns A function that unregisters the listener.
   */
  subscribe(listener: () => void): () => void;
}

/**
 * Runtime-owned Ant Design adapter. On install it subscribes to the Theme Kit
 * store and rebuilds the `ThemeConfig` whenever the active theme changes. The
 * generated config is available through `getSnapshot` for React consumption.
 *
 * @see {@link createAntdAdapter}
 */
export function createAntdAdapter<T extends ThemeDefinition>(
  _options: CreateAntdAdapterOptions = {},
): AntdThemeAdapter<T> {
  let latest: ThemeConfig | null = null;
  let unsubscribe: (() => void) | null = null;
  const listeners = new Set<() => void>();

  function rebuild(source: ThemeRuntime<T> | ThemeDefinition) {
    if (!source) return;
    latest = createAntdTheme(source as never);
    for (const listener of listeners) listener();
  }

  function install(runtime: ThemeRuntime<T>) {
    rebuild(runtime);
    unsubscribe = runtime.store.subscribe(() => rebuild(runtime));
  }

  function uninstall() {
    unsubscribe?.();
    unsubscribe = null;
    listeners.clear();
    // The adapter is no longer active: drop the last snapshot so consumers
    // (useSyncExternalStore) render nothing until a fresh install.
    latest = null;
  }

  return {
    id: "antd",
    supports: () => true,
    install,
    uninstall,
    getSnapshot: () => latest,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  } satisfies AntdThemeAdapter<T>;
}