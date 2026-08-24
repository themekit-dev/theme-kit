import type {
  ThemeDefinition,
  ThemeSelectionPersistenceAdapter,
  ThemeSelectionState,
} from "@theme-kit/core";
import { computeFingerprint } from "../../server/fingerprint";
import { themeKitCookieNames } from "../../server/cookies";

export interface NuxtThemePersistenceOptions {
  key?: string;
  storage?: Storage;
}

function parseState(value: string | null): ThemeSelectionState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ThemeSelectionState>;
    if (
      (parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system") &&
      typeof parsed.family === "string"
    ) {
      return { mode: parsed.mode, family: parsed.family };
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

function clearCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Client-side persistence adapter for Nuxt. Mirrors the selection to
 * `localStorage` (cross-tab sync, offline) AND to the four theme cookies
 * (theme-family / theme-mode / theme-fingerprint) so the server resolves the
 * exact same state on the next request — same contract as `@theme-kit/next`.
 */
export function createNuxtThemePersistence(
  themes?: readonly ThemeDefinition[],
  defaultTheme?: string,
  options: NuxtThemePersistenceOptions = {},
): ThemeSelectionPersistenceAdapter | null {
  if (typeof window === "undefined") return null;

  let storage: Storage | null = null;
  try {
    storage = options.storage ?? window.localStorage;
  } catch {
    return null;
  }
  if (!storage) return null;

  const key = options.key ?? "theme-selection";
  const fingerprint = themes?.length
    ? computeFingerprint(themes, defaultTheme)
    : null;

  return {
    get() {
      try {
        return parseState(storage!.getItem(key));
      } catch {
        return null;
      }
    },

    set(value) {
      try {
        storage!.setItem(key, JSON.stringify(value));
      } catch {
        return;
      }
      writeCookie(themeKitCookieNames.family, value.family);
      writeCookie(themeKitCookieNames.mode, value.mode);
      if (fingerprint) {
        writeCookie(themeKitCookieNames.fingerprint, fingerprint);
      }
    },

    remove() {
      try {
        storage!.removeItem(key);
      } catch {
        return;
      }
      clearCookie(themeKitCookieNames.family);
      clearCookie(themeKitCookieNames.mode);
      clearCookie(themeKitCookieNames.fingerprint);
    },

    subscribe(listener) {
      const handler = (event: StorageEvent) => {
        if (event.key !== key) return;
        listener(parseState(event.newValue));
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}