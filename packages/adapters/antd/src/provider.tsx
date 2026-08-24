"use client";

import React from "react";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd";
import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";
import { useRuntimeThemeFactory } from "@theme-kit/adapters/react";
import { createAntdTheme } from "./theme";

/**
 * Subscribes to a Theme Kit runtime and returns an Ant Design theme config that
 * is rebuilt automatically whenever the active theme changes.
 */
export function useAntdTheme<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
): ThemeConfig {
  return useRuntimeThemeFactory(runtime, createAntdTheme);
}

export interface AntdThemeProviderProps<T extends ThemeDefinition> {
  runtime: ThemeRuntime<T>;
  children: React.ReactNode;
}

/**
 * `<AntdThemeProvider runtime={runtime}>` — wraps Ant Design's own
 * `ConfigProvider` with a theme derived from Theme Kit's semantic tokens.
 */
export function AntdThemeProvider<T extends ThemeDefinition>({
  runtime,
  children,
}: AntdThemeProviderProps<T>) {
  const theme = useAntdTheme(runtime);
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}