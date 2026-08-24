"use client";

import React from "react";
import {
  ThemeProvider as MuiThemeProviderBase,
  type Theme as MuiTheme,
} from "@mui/material/styles";
import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";
import { useRuntimeThemeFactory } from "@theme-kit/adapters/react";
import { createMuiTheme } from "./theme";

/**
 * Subscribes to a Theme Kit runtime and returns a Material UI theme that is
 * rebuilt automatically whenever the active theme changes.
 */
export function useMuiTheme<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
): MuiTheme {
  return useRuntimeThemeFactory(runtime, createMuiTheme);
}

export interface MuiThemeProviderProps<T extends ThemeDefinition> {
  runtime: ThemeRuntime<T>;
  children: React.ReactNode;
}

/**
 * `<MuiThemeProvider runtime={runtime}>` — wraps MUI's own `ThemeProvider` with
 * a theme derived from Theme Kit's semantic tokens.
 */
export function MuiThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
}: MuiThemeProviderProps<T>) {
  const theme = useMuiTheme(runtime);
  return <MuiThemeProviderBase theme={theme}>{children}</MuiThemeProviderBase>;
}