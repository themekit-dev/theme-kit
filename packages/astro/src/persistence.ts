import type {
  ThemeDefinition,
  ThemeSelectionPersistenceAdapter,
  ThemeSelectionState,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";

function parseState(value: string | null): ThemeSelectionState | null {
  if (!value) return null;

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

function writeCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; path=/; max-age=31536000; samesite=lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function createAstroThemePersistence(
  themes?: readonly ThemeDefinition[],
  defaultTheme?: string,
): ThemeSelectionPersistenceAdapter | null {
  if (typeof window === "undefined") return null;

  const key = "theme-selection";
  const storage = window.localStorage;
  const fingerprint = themes?.length
    ? computeFingerprint(themes, defaultTheme)
    : null;

  return {
    get() {
      return parseState(storage.getItem(key));
    },

    set(value) {
      storage.setItem(key, JSON.stringify(value));

      writeCookie("theme-family", value.family);
      writeCookie("theme-mode", value.mode);

      if (fingerprint) {
        writeCookie("theme-fingerprint", fingerprint);
      }
    },

    remove() {
      storage.removeItem(key);
      removeCookie("theme-family");
      removeCookie("theme-mode");
      removeCookie("theme-fingerprint");
    },

    subscribe(listener) {
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        listener(parseState(event.newValue));
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
  };
}
