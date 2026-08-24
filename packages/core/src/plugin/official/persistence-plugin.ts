import type { ThemeDefinition } from "../../model/theme";
import type { ThemeSelectionState } from "../../model/selection";
import type { ThemeSelectionPersistenceAdapter } from "../../adapters/theme-selection";
import type { ThemePlugin } from "../types";

export interface PersistencePluginOptions {
  adapter?: ThemeSelectionPersistenceAdapter | null;
  key?: string;
  readOnInit?: boolean;
}

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
