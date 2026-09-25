"use client";

import React from "react";
import { MantineProvider } from "@mantine/core";
import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";
import { useRuntimeThemeFactory } from "@theme-kit/adapters/react";
import { createMantineTheme } from "./theme";

/**
 * Subscribes to a Theme Kit runtime and returns a Mantine theme that is rebuilt
 * automatically whenever the active theme changes.
 */
export function useMantineTheme<T extends ThemeDefinition>(runtime: ThemeRuntime<T>) {
  return useRuntimeThemeFactory(runtime, createMantineTheme);
}

/**
 * Props for {@link MantineThemeProvider}.
 */
export interface MantineThemeProviderProps<T extends ThemeDefinition> {
  /** The Theme Kit runtime whose active theme drives the Mantine theme. */
  runtime: ThemeRuntime<T>;
  /** The React subtree rendered inside Mantine's `MantineProvider`. */
  children: React.ReactNode;
}

/**
 * `<MantineThemeProvider runtime={runtime}>` — wraps Mantine's own
 * `MantineProvider` with a theme derived from Theme Kit's semantic tokens.
 * The Mantine color scheme is forced to match the active Theme Kit mode so
 * Mantine's built-in dark styles stay in sync.
 *
 * The provider owns the derived Mantine theme: it subscribes to the runtime
 * and rebuilds the theme whenever the active theme changes, so the wrapped
 * subtree always renders with the current theme selection.
 *
 * @example
 * ```tsx
 * import { MantineThemeProvider } from "@theme-kit/mantine";
 *
 * <MantineThemeProvider runtime={runtime}>
 *   <App />
 * </MantineThemeProvider>
 * ```
 *
 * @see {@link createMantineTheme}
 */
export function MantineThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
}: MantineThemeProviderProps<T>) {
  const theme = useMantineTheme(runtime);
  const mode = useRuntimeThemeFactory(runtime, (t) => {
    const meta = t.meta as { mode?: string } | undefined;
    return meta?.mode === "light" || meta?.mode === "dark" ? meta.mode : undefined;
  });

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      {...(mode ? { forceColorScheme: mode } : {})}
    >
      {children}
    </MantineProvider>
  );
}