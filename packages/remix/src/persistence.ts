import type {
  ThemeDefinition,
  ThemeSelectionPersistenceAdapter,
  ThemeSelectionState,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";

export interface RemixThemePersistenceOptions {
  key?: string;
  storage?: Storage;
  cookieOptions?: string;
}

function parseState(value: string | null): ThemeSelectionState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ThemeSelectionState>;

    if (
      (parsed.mode === "light" ||
        parsed.mode === "dark" ||
        parsed.mode === "system") &&
      typeof parsed.family === "string"
    ) {
      return {
        mode: parsed.mode,
        family: parsed.family,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function createRemixThemePersistence(
  themes?: readonly ThemeDefinition[],
  defaultTheme?: string,
  options: RemixThemePersistenceOptions = {},
): ThemeSelectionPersistenceAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = options.key ?? "theme-selection";
  const storage = options.storage ?? window.localStorage;
  const cookieBase = options.cookieOptions ?? "path=/; max-age=31536000; samesite=lax";
  const fingerprint = themes?.length
    ? computeFingerprint(themes, defaultTheme)
    : null;

  return {
    get() {
      return parseState(storage.getItem(key));
    },

    set(value) {
      storage.setItem(key, JSON.stringify(value));

      document.cookie = `theme-family=${encodeURIComponent(value.family)}; ${cookieBase}`;
      document.cookie = `theme-mode=${encodeURIComponent(value.mode)}; ${cookieBase}`;

      if (fingerprint) {
        document.cookie = `theme-fingerprint=${encodeURIComponent(fingerprint)}; ${cookieBase}`;
      }
    },

    remove() {
      storage.removeItem(key);

      const expire = "path=/; max-age=0; samesite=lax";
      document.cookie = `theme-family=; ${expire}`;
      document.cookie = `theme-mode=; ${expire}`;
      document.cookie = `theme-fingerprint=; ${expire}`;
    },

    subscribe(listener) {
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== key) {
          return;
        }

        listener(parseState(event.newValue));
      };

      window.addEventListener("storage", handleStorage);

      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    },
  };
}
