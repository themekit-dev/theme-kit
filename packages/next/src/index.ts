/**
 * Theme Kit Next.js App Router integration.
 *
 * Provides the SSR-safe `ThemeProvider` (with `ThemeProviderHtmlProps` /
 * `ThemeProviderBodyProps` for zero-flash layout wiring) plus the React
 * `ThemeScope` and `ThemeScrollbar` re-exports.
 *
 * @packageDocumentation
 */
export { ThemeProvider } from "./layout";
export type {
  ThemeProviderProps,
  ThemeProviderHtmlProps,
  ThemeProviderBodyProps,
} from "./layout";

export { ThemeScope, ThemeScrollbar } from "@theme-kit/react";
export type { ThemeScopeProps } from "@theme-kit/react";
export type { ThemeScrollbarProps } from "@theme-kit/react";
