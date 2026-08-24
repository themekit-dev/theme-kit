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

export interface ChakraThemeProviderProps<T extends ThemeDefinition> {
  runtime: ThemeRuntime<T>;
  children: React.ReactNode;
}

/**
 * `<ChakraThemeProvider runtime={runtime}>` — wraps Chakra's own `ChakraProvider`
 * with a system derived from Theme Kit's semantic tokens.
 */
export function ChakraThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
}: ChakraThemeProviderProps<T>) {
  const system = useChakraTheme(runtime);
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}