import type {
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import type { Theme as MuiTheme } from "@mui/material/styles";
import { createMuiTheme } from "./theme";
import type { MuiAdapterOptions } from "./defaults";

/**
 * Options for {@link createMuiAdapter}.
 *
 * @see {@link createMuiAdapter}
 */
export interface CreateMuiAdapterOptions extends MuiAdapterOptions {}

/**
 * A Material UI adapter that exposes its generated theme synchronously via
 * `getSnapshot` / `subscribe`, so both the runtime-owned registry and React
 * (`useSyncExternalStore`) can consume it.
 */
export interface MuiThemeAdapter<T extends ThemeDefinition>
  extends ThemeAdapter<T> {
  /**
   * Returns the latest generated MUI theme, or `null` before the first install
   * or after uninstall.
   */
  getSnapshot(): MuiTheme | null;
  /**
   * Registers a listener invoked whenever the generated theme changes.
   *
   * @param listener The callback to invoke on change.
   * @returns A function that unregisters the listener.
   */
  subscribe(listener: () => void): () => void;
}

/**
 * Runtime-owned Material UI adapter. On install it subscribes to the Theme Kit
 * store and rebuilds a MUI `Theme` whenever the active theme changes. The
 * generated theme is available through `getSnapshot` for React consumption.
 *
 * @see {@link createMuiAdapter}
 */
export function createMuiAdapter<T extends ThemeDefinition>(
  _options: CreateMuiAdapterOptions = {},
): MuiThemeAdapter<T> {
  let latest: MuiTheme | null = null;
  let unsubscribe: (() => void) | null = null;
  const listeners = new Set<() => void>();

  function rebuild(source: ThemeRuntime<T> | ThemeDefinition) {
    if (!source) return;
    latest = createMuiTheme(source as never);
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
    id: "mui",
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
  } satisfies MuiThemeAdapter<T>;
}