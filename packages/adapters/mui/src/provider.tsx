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

/**
 * Props for {@link MuiThemeProvider}.
 */
export interface MuiThemeProviderProps<T extends ThemeDefinition> {
  /** The Theme Kit runtime whose active theme drives the MUI theme. */
  runtime: ThemeRuntime<T>;
  /** The React subtree rendered inside MUI's `ThemeProvider`. */
  children: React.ReactNode;
}

/**
 * `<MuiThemeProvider runtime={runtime}>` — wraps MUI's own `ThemeProvider` with
 * a theme derived from Theme Kit's semantic tokens.
 *
 * The provider owns the derived MUI theme: it subscribes to the runtime and
 * rebuilds the theme whenever the active theme changes, so the wrapped subtree
 * always renders with the current theme selection.
 *
 * @example
 * ```tsx
 * import { MuiThemeProvider } from "@theme-kit/mui";
 *
 * <MuiThemeProvider runtime={runtime}>
 *   <App />
 * </MuiThemeProvider>
 * ```
 *
 * @see {@link useMuiTheme}
 */
export function MuiThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
}: MuiThemeProviderProps<T>) {
  const theme = useMuiTheme(runtime);
  return <MuiThemeProviderBase theme={theme}>{children}</MuiThemeProviderBase>;
}