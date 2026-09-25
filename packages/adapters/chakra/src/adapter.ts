import type {
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import { createChakraTheme } from "./theme";
import type { ChakraAdapterOptions } from "./defaults";

/**
 * Options for {@link createChakraAdapter}.
 *
 * @see {@link createChakraAdapter}
 */
export interface CreateChakraAdapterOptions extends ChakraAdapterOptions {}

/**
 * A Chakra UI adapter that exposes its generated system synchronously via
 * `getSnapshot` / `subscribe`, so both the runtime-owned registry and React
 * (`useSyncExternalStore`) can consume it.
 */
export interface ChakraThemeAdapter<T extends ThemeDefinition>
  extends ThemeAdapter<T> {
  /**
   * Returns the latest generated Chakra system, or `null` before the first
   * install or after uninstall.
   */
  getSnapshot(): ReturnType<typeof createChakraTheme> | null;
  /**
   * Registers a listener invoked whenever the generated system changes.
   *
   * @param listener The callback to invoke on change.
   * @returns A function that unregisters the listener.
   */
  subscribe(listener: () => void): () => void;
}

/**
 * Runtime-owned Chakra UI adapter. On install it subscribes to the Theme Kit
 * store and rebuilds the Chakra system whenever the active theme changes. The
 * generated system is available through `getSnapshot` for React consumption.
 *
 * @see {@link createChakraAdapter}
 */
export function createChakraAdapter<T extends ThemeDefinition>(
  _options: CreateChakraAdapterOptions = {},
): ChakraThemeAdapter<T> {
  let latest: ReturnType<typeof createChakraTheme> | null = null;
  let unsubscribe: (() => void) | null = null;
  const listeners = new Set<() => void>();

  function rebuild(source: ThemeRuntime<T> | ThemeDefinition) {
    if (!source) return;
    latest = createChakraTheme(source as never);
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
    id: "chakra",
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
  } satisfies ChakraThemeAdapter<T>;
}