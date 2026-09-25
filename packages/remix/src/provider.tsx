import React, { useEffect, useMemo } from "react";
import type {
  InitialThemeResolution,
  ThemeDefinition,
  ThemeMode,
} from "@theme-kit/core";
import {
  ThemeProvider as ReactThemeProvider,
  useThemeRuntime,
} from "@theme-kit/react";
import { createRemixThemePersistence } from "./persistence";
import { computeFingerprint } from "./fingerprint";

/**
 * Props for the Remix `ThemeProvider`. Configures the theme registry, the
 * fallback selection, and the optional SSR-resolved initial state.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link ThemeProvider}
 * @see {@link ThemeHead}
 */
export interface ThemeProviderProps<T extends ThemeDefinition> {
  /**
   * The SSR-resolved initial theme state (from `getInitialThemeState`). When
   * provided, it wins on first paint so hydration matches exactly and the
   * selection is mirrored back to cookies.
   *
   * @remarks
   * Prefer supplying it. Omitting it is *flash-free* — the runtime falls back to
   * the very cookies the pre-paint script reads, so it adopts the already-painted
   * theme rather than correcting it — but it is **not** hydration-clean: the
   * server renders with the fallback selection, so any component that renders the
   * theme name or mode (a switcher label, say) hydrates against different text
   * once a persisted selection differs from the fallback. Measured with a
   * persisted `plum-dark` and this prop omitted: the canvas painted correctly and
   * never corrected, but React reported error #418 (text content did not match).
   */
  initial?: InitialThemeResolution<T>;
  /** The theme registry the selection is resolved against. */
  themes?: readonly T[];
  /** Fallback theme name when no selection is persisted. */
  defaultTheme?: T["name"];
  /**
   * Mode used when neither `initial` nor a persisted selection is available.
   *
   * Optional: the runtime and `ThemeHead`'s script both derive the fallback mode
   * from `defaultTheme` by default, so they already agree. Set this to pin a mode
   * the script would not derive — e.g. `"system"` to follow
   * `prefers-color-scheme` — and pass the same value to `ThemeHead`.
   *
   * Ignored when `initial` is provided, since the SSR resolution wins.
   */
  initialMode?: ThemeMode;
  /**
   * Family used when neither `initial` nor a persisted selection is available.
   * Pair it with `initialMode` for the same reason.
   */
  initialFamily?: string;
  /** The application content rendered inside the provider. */
  children: React.ReactNode;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function syncDarkClass(theme: ThemeDefinition) {
  const isDark = theme.meta?.mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
}

function CookieSync<T extends ThemeDefinition>({
  initial,
  fingerprint,
}: {
  initial: InitialThemeResolution<T>;
  fingerprint: string;
}) {
  const runtime = useThemeRuntime();

  useEffect(() => {
    syncDarkClass(initial.theme);

    writeCookie("theme-family", initial.selection.family);
    writeCookie("theme-mode", initial.selection.mode);
    writeCookie("theme-name", String(initial.theme.name));
    writeCookie("theme-fingerprint", fingerprint);

    const unsubscribe = runtime.store.subscribe((theme) => {
      syncDarkClass(theme);
      writeCookie("theme-name", String(theme.name));
      writeCookie("theme-family", runtime.selection.getFamily());
      writeCookie("theme-mode", runtime.selection.getMode());
      writeCookie("theme-fingerprint", fingerprint);
    });

    return unsubscribe;
  }, [runtime, fingerprint, initial]);

  return null;
}

/**
 * Remix theme provider. Mounts the client theme runtime, wires the cookie
 * persistence adapter, and — when an SSR-resolved `initial` state is supplied —
 * mirrors the selection back to cookies so the server resolves the same state
 * on the next request (zero-flash).
 *
 * @typeParam T - The theme definition type used by the application.
 * @param props - The provider props (see {@link ThemeProviderProps}).
 * @returns The provider tree wrapping the application content.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from "@theme-kit/remix";
 *
 * export default function App({ children }) {
 *   return (
 *     <ThemeProvider defaultTheme="light" themes={myThemes}>
 *       {children}
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @remarks
 * Pair with `ThemeHead` in the document `<head>` and `getInitialThemeState` in
 * the loader for the full SSR-first, zero-flash setup. When `initial` is
 * omitted, the persisted selection is read on the client from `localStorage`
 * and then from the theme cookies `ThemeHead`'s script reads — see
 * {@link ThemeProviderProps.initial} for the hydration caveat.
 *
 * @see {@link ThemeHead}
 * @see {@link createRemixThemePersistence}
 * @see {@link ThemeProviderProps}
 * @see `useTheme`
 */
export function ThemeProvider<T extends ThemeDefinition>({
  initial,
  themes,
  defaultTheme,
  initialMode,
  initialFamily,
  children,
}: ThemeProviderProps<T>) {
  const persistence = useMemo(
    () => createRemixThemePersistence(themes, defaultTheme),
    [themes, defaultTheme],
  );

  const fingerprint = useMemo(
    () => computeFingerprint(themes ?? [], defaultTheme),
    [themes, defaultTheme],
  );

  return (
    <ReactThemeProvider
      {...(initial ? { initial } : {})}
      {...(themes ? { themes } : {})}
      {...(initialMode !== undefined ? { initialMode } : {})}
      {...(initialFamily !== undefined ? { initialFamily } : {})}
      readPersistenceOnInit={!initial}
      persistence={persistence}
    >
      {initial && fingerprint ? (
        <CookieSync initial={initial} fingerprint={fingerprint} />
      ) : null}
      {children}
    </ReactThemeProvider>
  );
}
