import { inject, PLATFORM_ID, TransferState, makeStateKey } from "@angular/core";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import type {
  ThemeSelectionPersistenceAdapter,
  ThemeSelectionState,
} from "@theme-kit/core";

export const THEME_SELECTION_KEY = makeStateKey<ThemeSelectionState>("theme-kit:selection");

const STORAGE_KEY = "theme-selection";

export function createAngularPersistence(): ThemeSelectionPersistenceAdapter {
  const platformId = inject(PLATFORM_ID);
  const transferState = inject(TransferState);

  return {
    get(): ThemeSelectionState | null {
      if (isPlatformServer(platformId)) {
        return transferState.get(THEME_SELECTION_KEY, null);
      }

      if (isPlatformBrowser(platformId)) {
        const ssr = transferState.get(THEME_SELECTION_KEY, null);
        if (ssr) {
          transferState.remove(THEME_SELECTION_KEY);
          return ssr;
        }
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as Partial<ThemeSelectionState>;
          if (
            (parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system") &&
            typeof parsed.family === "string"
          ) {
            return { mode: parsed.mode, family: parsed.family };
          }
        } catch {
          return null;
        }
      }

      return null;
    },

    set(value: ThemeSelectionState): void {
      if (isPlatformServer(platformId)) {
        transferState.set(THEME_SELECTION_KEY, value);
      }

      if (isPlatformBrowser(platformId)) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch {
          // Private browsing or quota exceeded
        }
      }
    },

    remove(): void {
      if (isPlatformBrowser(platformId)) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // noop
        }
      }
    },

    subscribe(listener: (value: ThemeSelectionState | null) => void): () => void {
      if (!isPlatformBrowser(platformId)) return () => {};

      const handler = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        if (!event.newValue) {
          listener(null);
          return;
        }
        try {
          const parsed = JSON.parse(event.newValue) as Partial<ThemeSelectionState>;
          if (
            (parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system") &&
            typeof parsed.family === "string"
          ) {
            listener({ mode: parsed.mode, family: parsed.family });
          }
        } catch {
          // noop
        }
      };

      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}
