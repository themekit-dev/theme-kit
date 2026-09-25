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

/** Cookie names of the contract shared with the pre-paint bootstrap script. */
const COOKIE_NAMES = {
  mode: "theme-mode",
  family: "theme-family",
  fingerprint: "theme-fingerprint",
} as const;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]!) : null;
}

/**
 * Reads the selection back out of the theme cookies — the same source, and the
 * same fingerprint check, that the pre-paint bootstrap script uses.
 *
 * This adapter writes the selection to `localStorage` **and** to cookies, but
 * only ever read `localStorage`. Whenever the two disagreed — cookies set by
 * the server, a cleared or partitioned `localStorage`, a fresh browser profile,
 * private mode — the client runtime resolved a different theme than the one the
 * blocking script had already painted, and corrected it. That correction is the
 * flash the script exists to prevent.
 */
function readCookieSelection(fingerprint: string | null): ThemeSelectionState | null {
  const saved = readCookie(COOKIE_NAMES.fingerprint);
  // Stale cookies from an older build are ignored, exactly as the script does:
  // only reject when both fingerprints are known and differ.
  if (fingerprint && saved && saved !== fingerprint) return null;

  const mode = readCookie(COOKIE_NAMES.mode);
  const family = readCookie(COOKIE_NAMES.family);

  if (!family) return null;
  if (mode !== "light" && mode !== "dark" && mode !== "system") return null;

  return { mode, family };
}

/**
 * Creates the client-side persistence adapter for Astro. Mirrors the theme
 * selection to `localStorage` (cross-tab sync, offline) AND to the theme
 * cookies (`theme-family` / `theme-mode` / `theme-fingerprint`) so the server
 * resolves the exact same state on the next request.
 *
 * Reads from both: `localStorage` first, then the cookies. Reading the cookies
 * as well is what keeps the client runtime in agreement with the pre-paint
 * bootstrap script, which only ever sees cookies — a read path that ignored
 * them made the runtime overwrite an already-correct first paint.
 *
 * @param themes - The theme registry used to compute the config fingerprint.
 * @param defaultTheme - Fallback theme name used in the fingerprint.
 * @returns A persistence adapter, or `null` when running outside the browser.
 *
 * @remarks
 * Returns `null` during SSR (no `window`). The cookie contract matches the
 * other SSR integrations (`@theme-kit/next`, `@theme-kit/nuxt`, `@theme-kit/remix`).
 *
 * @see {@link ThemeProviderClient}
 * @see `createThemePersistence`
 */
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
      // localStorage first (cross-tab, offline), then the cookies the
      // pre-paint script reads — so the runtime adopts the already-painted
      // theme instead of overwriting it.
      return parseState(storage.getItem(key)) ?? readCookieSelection(fingerprint);
    },

    set(value) {
      storage.setItem(key, JSON.stringify(value));

      writeCookie(COOKIE_NAMES.family, value.family);
      writeCookie(COOKIE_NAMES.mode, value.mode);

      if (fingerprint) {
        writeCookie(COOKIE_NAMES.fingerprint, fingerprint);
      }
    },

    remove() {
      storage.removeItem(key);
      removeCookie(COOKIE_NAMES.family);
      removeCookie(COOKIE_NAMES.mode);
      removeCookie(COOKIE_NAMES.fingerprint);
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
