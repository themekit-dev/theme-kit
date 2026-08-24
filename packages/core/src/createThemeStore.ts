import type { ThemeDefinition } from "./model/theme";
import type { ThemeStore, ThemeStoreOptions } from "./types";

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
