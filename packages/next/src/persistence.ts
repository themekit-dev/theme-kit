"use client";

import type {
  ThemeDefinition,
  ThemeSelectionPersistenceAdapter,
  ThemeSelectionState,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";

export interface NextThemePersistenceOptions {
  key?: string;
  storage?: Storage;
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

export function createNextThemePersistence(
  themes?: readonly ThemeDefinition[],
  defaultTheme?: string,
  options: NextThemePersistenceOptions = {},
): ThemeSelectionPersistenceAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = options.key ?? "theme-selection";
  const storage = options.storage ?? window.localStorage;
  const fingerprint = themes?.length
    ? computeFingerprint(themes, defaultTheme)
    : null;

  return {
    get() {
      return parseState(storage.getItem(key));
    },

    set(value) {
      storage.setItem(key, JSON.stringify(value));

      document.cookie = `theme-family=${encodeURIComponent(
        value.family,
      )}; path=/; max-age=31536000; samesite=lax`;

      document.cookie = `theme-mode=${encodeURIComponent(
        value.mode,
      )}; path=/; max-age=31536000; samesite=lax`;

      if (fingerprint) {
        document.cookie = `theme-fingerprint=${encodeURIComponent(
          fingerprint,
        )}; path=/; max-age=31536000; samesite=lax`;
      }
    },

    remove() {
      storage.removeItem(key);

      document.cookie = "theme-family=; path=/; max-age=0; samesite=lax";
      document.cookie = "theme-mode=; path=/; max-age=0; samesite=lax";
      document.cookie = "theme-fingerprint=; path=/; max-age=0; samesite=lax";
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
