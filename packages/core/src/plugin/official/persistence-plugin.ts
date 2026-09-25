import type { ThemeDefinition } from "../../model/theme";
import type { ThemeSelectionState } from "../../model/selection";
import type { ThemeSelectionPersistenceAdapter } from "../../adapters/theme-selection";
import type { ThemePlugin } from "../types";

/**
 * Options for {@link createPersistencePlugin}.
 */
export interface PersistencePluginOptions {
  /** Custom persistence adapter. When omitted, a `localStorage`-backed adapter
   *  is used in browser environments; in non-browser (SSR) environments the
   *  plugin is inert. Pass `null` to disable persistence entirely. */
  adapter?: ThemeSelectionPersistenceAdapter | null;
  /** Storage key used by the default `localStorage` adapter. Default
   *  `"theme-selection"`. */
  key?: string;
  /** Whether to restore the saved theme selection when the runtime is created.
   *  Default `true`. */
  readOnInit?: boolean;
}

/**
 * Creates a plugin that persists the theme selection and restores it on
 * startup.
 *
 * The plugin reads the saved selection when the runtime is created (if
 * `readOnInit` is enabled) and writes the selection to the adapter after every
 * persist. It uses a `localStorage`-backed adapter by default in the browser
 * and is inert in non-browser environments unless a custom adapter is given.
 *
 * @param options - Persistence configuration.
 * @returns A `"persistence"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createPersistencePlugin({ key: "my-app-theme" }));
 * ```
 *
 * @remarks
 * The default adapter also subscribes to cross-tab `storage` events so the
 * selection stays in sync across tabs. `onDestroy` releases the adapter and
 * runtime references.
 *
 * @see {@link PersistencePluginOptions}
 */
export function createPersistencePlugin<T extends ThemeDefinition>(
  options?: PersistencePluginOptions,
): ThemePlugin<T> {
  const readOnInit = options?.readOnInit ?? true;

  let adapter: ThemeSelectionPersistenceAdapter | null | undefined = options?.adapter;

  if (adapter === undefined) {
    if (typeof window === "undefined") {
      adapter = null;
    } else {
      const key = options?.key ?? "theme-selection";
      let storage: Storage | null = null;
      try { storage = window.localStorage; } catch { storage = null; }

      adapter = storage
        ? {
            get() {
              try {
                const value = storage!.getItem(key);
                if (!value) return null;
                const p = JSON.parse(value) as Partial<ThemeSelectionState>;
                if ((p.mode === "light" || p.mode === "dark" || p.mode === "system") && typeof p.family === "string") {
                  return { mode: p.mode, family: p.family };
                }
              } catch {}
              return null;
            },
            set(value) {
              try { storage!.setItem(key, JSON.stringify(value)); } catch {}
            },
            remove() {
              try { storage!.removeItem(key); } catch {}
            },
            subscribe(listener) {
              const handler = (event: StorageEvent) => {
                if (event.key !== key) return;
                try {
                  const p = event.newValue ? JSON.parse(event.newValue) : null;
                  listener(p);
                } catch {}
              };
              window.addEventListener("storage", handler);
              return () => window.removeEventListener("storage", handler);
            },
          }
        : null;
    }
  }

  let _runtime: { selection: { getSelection(): ThemeSelectionState; setMode(m: string): void; setFamily(f: string): void } } | null = null;

  return {
    name: "persistence",
    version: "1.0.0",
    priority: 100,

    onRuntimeCreated(runtime) {
      _runtime = runtime;

      if (readOnInit) {
        const saved = adapter?.get();
        if (saved) {
          runtime.selection.setMode(saved.mode);
          if (saved.family) runtime.selection.setFamily(saved.family);
        }
      }
    },

    onAfterPersist({ selection }) {
      adapter?.set(selection);
    },

    onDestroy() {
      adapter = null;
      _runtime = null;
    },
  };
}
