/**
 * Theme Kit Remix integration.
 *
 * Provides the SSR-safe `ThemeProvider`, the `ThemeHead` blocking script
 * for zero-flash bootstrapping, and the cookie-backed
 * `createRemixThemePersistence`, plus the React `ThemeScope`,
 * `ThemeScrollbar`, and `ThemeInspector` re-exports.
 *
 * @packageDocumentation
 */
export { ThemeProvider } from "./provider";
export type { ThemeProviderProps } from "./provider";
export { ThemeHead } from "./blocking-script";
export type { ThemeHeadProps } from "./blocking-script";
export { createRemixThemePersistence } from "./persistence";
export type { RemixThemePersistenceOptions } from "./persistence";
export { ThemeScope, ThemeScrollbar, ThemeInspector } from "@theme-kit/react";
export type { ThemeScrollbarProps, ThemeInspectorProps } from "@theme-kit/react";
export * from "./hooks";
