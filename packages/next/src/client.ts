"use client";

export { ClientThemeProvider } from "./provider";
export type { ClientThemeProviderProps } from "./provider";
export { createNextThemePersistence } from "./persistence";
export type { NextThemePersistenceOptions } from "./persistence";
export * from "./hooks";
export * from "./theme-bootstrap";
export {
  ThemeScope,
  useScopedTheme,
  ThemeInspector,
  ThemeModeButton,
} from "@theme-kit/react";
