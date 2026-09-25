import type {
  ThemeDefinition,
  ThemeSelectionPersistenceAdapter,
  ThemeSelectionState,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";

/**
 * Options for {@link createRemixThemePersistence}. Configures the storage key,
 * the backing `Storage` object, and the cookie attributes used when mirroring
 * the selection to cookies.
 *
 * @see {@link createRemixThemePersistence}
 */
export interface RemixThemePersistenceOptions {
  /** The `localStorage` key holding the persisted selection. Default `"theme-selection"`. */
  key?: string;
  /** The backing storage. Defaults to `window.localStorage`. */
  storage?: Storage;
  /**
   * Cookie attribute string appended to the mirrored theme cookies (e.g.
   * `"path=/; max-age=31536000; samesite=lax"`). Defaults to
   * `"path=/; max-age=31536000; samesite=lax"`.
   */
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
 * same fingerprint check, that `ThemeHead`'s pre-paint bootstrap script uses.
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
 * Creates the client-side persistence adapter for Remix. Mirrors the theme
 * selection to `localStorage` (cross-tab sync, offline) AND to the theme
 * cookies (`theme-family` / `theme-mode` / `theme-fingerprint`) so the server
 * resolves the exact same state on the next request.
 *
 * @param themes - The theme registry used to compute the config fingerprint.
 * @param defaultTheme - Fallback theme name used in the fingerprint.
 * @param options - Persistence options (see {@link RemixThemePersistenceOptions}).
 * @returns A persistence adapter, or `null` when running outside the browser.
 *
 * @example
 * ```ts
 * import { createRemixThemePersistence } from "@theme-kit/remix";
 *
 * const persistence = createRemixThemePersistence(myThemes, "light", {
 *   key: "my-theme-selection",
 * });
 * ```
 *
 * @remarks
 * Returns `null` during SSR (no `window`), so the runtime falls back to its
 * default persistence behavior on the server. The cookie contract matches
 * `@theme-kit/next` and `@theme-kit/nuxt`.
 *
 * @see {@link ThemeProvider}
 * @see {@link ThemeHead}
 */
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
      // localStorage first (cross-tab, offline), then the cookies `ThemeHead`'s
      // bootstrap script reads — so the runtime adopts the already-painted
      // theme instead of overwriting it.
      return parseState(storage.getItem(key)) ?? readCookieSelection(fingerprint);
    },

    set(value) {
      storage.setItem(key, JSON.stringify(value));

      document.cookie = `${COOKIE_NAMES.family}=${encodeURIComponent(value.family)}; ${cookieBase}`;
      document.cookie = `${COOKIE_NAMES.mode}=${encodeURIComponent(value.mode)}; ${cookieBase}`;

      if (fingerprint) {
        document.cookie = `${COOKIE_NAMES.fingerprint}=${encodeURIComponent(fingerprint)}; ${cookieBase}`;
      }
    },

    remove() {
      storage.removeItem(key);

      const expire = "path=/; max-age=0; samesite=lax";
      document.cookie = `${COOKIE_NAMES.family}=; ${expire}`;
      document.cookie = `${COOKIE_NAMES.mode}=; ${expire}`;
      document.cookie = `${COOKIE_NAMES.fingerprint}=; ${expire}`;
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
