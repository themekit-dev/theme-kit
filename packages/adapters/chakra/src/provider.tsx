"use client";

import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";
import { useRuntimeThemeFactory } from "@theme-kit/adapters/react";
import { createChakraTheme } from "./theme";

/**
 * Subscribes to a Theme Kit runtime and returns a Chakra UI system that is
 * rebuilt automatically whenever the active theme changes.
 */
export function useChakraTheme<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
) {
  return useRuntimeThemeFactory(runtime, createChakraTheme);
}

/**
 * Props for {@link ChakraThemeProvider}.
 */
export interface ChakraThemeProviderProps<T extends ThemeDefinition> {
  /** The Theme Kit runtime whose active theme drives the Chakra system. */
  runtime: ThemeRuntime<T>;
  /** The React subtree rendered inside Chakra's `ChakraProvider`. */
  children: React.ReactNode;
}

/**
 * `<ChakraThemeProvider runtime={runtime}>` — wraps Chakra's own `ChakraProvider`
 * with a system derived from Theme Kit's semantic tokens.
 *
 * The provider owns the derived Chakra system: it subscribes to the runtime and
 * rebuilds the system whenever the active theme changes, so the wrapped subtree
 * always renders with the current theme selection.
 *
 * @example
 * ```tsx
 * import { ChakraThemeProvider } from "@theme-kit/chakra";
 *
 * <ChakraThemeProvider runtime={runtime}>
 *   <App />
 * </ChakraThemeProvider>
 * ```
 *
 * @see {@link useChakraTheme}
 */
export function ChakraThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
}: ChakraThemeProviderProps<T>) {
  const system = useChakraTheme(runtime);
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}