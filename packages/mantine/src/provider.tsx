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

export interface MantineThemeProviderProps<T extends ThemeDefinition> {
  runtime: ThemeRuntime<T>;
  children: React.ReactNode;
}

/**
 * `<MantineThemeProvider runtime={runtime}>` — wraps Mantine's own
 * `MantineProvider` with a theme derived from Theme Kit's semantic tokens.
 * The Mantine color scheme is forced to match the active Theme Kit mode so
 * Mantine's built-in dark styles stay in sync.
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