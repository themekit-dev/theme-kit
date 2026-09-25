import type { ThemeMode } from "../model";

/**
 * A contract for persisting and observing the selected theme mode.
 *
 * `get` returns `null` when nothing is stored or the stored value is not a
 * valid mode. `subscribe` returns an unsubscribe function.
 */
export interface ThemePersistenceAdapter {
  /** Read the persisted mode, or `null` when none is stored. */
  get(): ThemeMode | null;
  /** Persist the given mode. */
  set(value: ThemeMode): void;
  /** Remove any persisted mode. */
  remove(): void;
  /** Subscribe to mode changes from other tabs/windows. Returns an
   *  unsubscribe function. */
  subscribe(listener: (value: ThemeMode | null) => void): () => void;
}

/**
 * Options for {@link createThemePersistence}.
 *
 * The adapter persists the theme mode to a `Storage` (default
 * `localStorage`) and observes cross-tab changes via the `storage` event.
 */
export interface ThemePersistenceOptions {
  /** The `Storage` to read/write. Defaults to `view.localStorage`.
   *  @defaultValue `view.localStorage` */
  storage?: Storage;
  /** Storage key used for the persisted mode.
   *  @defaultValue `"theme-mode"` */
  key?: string;
  /** The `Window` used to access storage and listen for `storage` events.
   *  Defaults to the global `window` when present. */
  view?: Window;
}

function parseThemeMode(value: string | null): ThemeMode | null {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return null;
}

/**
 * Create a theme-mode persistence adapter backed by `Storage`.
 *
 * The adapter reads/writes the mode under a single key and notifies
 * subscribers of cross-tab changes through the `storage` event. It requires
 * a `Window`; when none is available it returns `null` (e.g. during SSR).
 *
 * @param options The persistence configuration.
 * @returns A `ThemePersistenceAdapter`, or `null` when no `Window` is
 *   available.
 *
 * @example
 * ```ts
 * const persistence = createThemePersistence({ key: "my-theme-mode" });
 * persistence?.set("dark");
 * ```
 *
 * @see {@link createDefaultPersistence}
 * @see {@link ThemeSelectionPersistenceAdapter}
 */
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
