import type { ThemeMode } from "../model";

export interface ThemePersistenceAdapter {
  get(): ThemeMode | null;
  set(value: ThemeMode): void;
  remove(): void;
  subscribe(listener: (value: ThemeMode | null) => void): () => void;
}

export interface ThemePersistenceOptions {
  storage?: Storage;
  key?: string;
  view?: Window;
}

function parseThemeMode(value: string | null): ThemeMode | null {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return null;
}

export function createThemePersistence(
  options: ThemePersistenceOptions = {},
): ThemePersistenceAdapter | null {
  const view =
    options.view ?? (typeof window !== "undefined" ? window : undefined);

  if (!view) {
    return null;
  }

  const storage = options.storage ?? view.localStorage;
  const key = options.key ?? "theme-mode";

  return {
    get() {
      return parseThemeMode(storage.getItem(key));
    },

    set(value) {
      storage.setItem(key, value);
    },

    remove() {
      storage.removeItem(key);
    },

    subscribe(listener) {
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== key) {
          return;
        }

        listener(parseThemeMode(event.newValue));
      };

      view.addEventListener("storage", handleStorage);

      return () => {
        view.removeEventListener("storage", handleStorage);
      };
    },
  };
}
