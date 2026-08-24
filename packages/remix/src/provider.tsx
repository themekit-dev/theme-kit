import React, { useEffect, useMemo } from "react";
import type {
  InitialThemeResolution,
  ThemeDefinition,
} from "@theme-kit/core";
import {
  ThemeProvider as ReactThemeProvider,
  useThemeRuntime,
} from "@theme-kit/react";
import { createRemixThemePersistence } from "./persistence";
import { computeFingerprint } from "./fingerprint";

export interface ThemeProviderProps<T extends ThemeDefinition> {
  initial?: InitialThemeResolution<T>;
  themes?: readonly T[];
  defaultTheme?: T["name"];
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

export function ThemeProvider<T extends ThemeDefinition>({
  initial,
  themes,
  defaultTheme,
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
