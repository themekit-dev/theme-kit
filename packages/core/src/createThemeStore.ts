import type { ThemeDefinition } from "./model/theme";
import type { ThemeStore, ThemeStoreOptions } from "./types";

/**
 * Create a theme store. The store holds the current theme and notifies
 *    subscribers when it changes. Use the higher-level `createThemeRuntime`
 *    for the full runtime; use the store directly when you only need a
 *    reactive current-theme container.
 * 
 *    ```ts
 *    const store = createThemeStore({ initialTheme: lightTheme });
 *    store.subscribe((theme) => console.log(theme.name));
 *    store.set(darkTheme);
 *    ```
 */
export function createThemeStore<T extends ThemeDefinition>(
  options: ThemeStoreOptions<T>,
): ThemeStore<T> {
  let current = options.initialTheme;
  let batchDepth = 0;
  let pendingBatchTheme: T | null = null;
  const listeners = new Set<(theme: T, options?: { suppressTransition?: boolean }) => void>();

  function emit(theme: T, emitOptions?: { suppressTransition?: boolean }) {
    for (const listener of listeners) {
      listener(theme, emitOptions);
    }
  }

  return {
    get() {
      return pendingBatchTheme ?? current;
    },

    set(theme: T, options?: { force?: boolean; suppressTransition?: boolean }) {
      if (!options?.force && theme.name === current.name && batchDepth === 0) {
        return;
      }

      current = theme;

      if (batchDepth > 0) {
        pendingBatchTheme = theme;
        return;
      }

      emit(theme, options);
    },

    batch(callback: () => void) {
      batchDepth++;
      try {
        callback();
      } finally {
        batchDepth--;
        if (batchDepth === 0 && pendingBatchTheme) {
          const theme = pendingBatchTheme;
          pendingBatchTheme = null;
          emit(theme);
        }
      }
    },

    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    destroy() {
      listeners.clear();
      pendingBatchTheme = null;
    },
  };
}
