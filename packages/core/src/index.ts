/**
 * Theme Kit core — the framework-free theming runtime.
 *
 * Provides the theme model and store, the runtime and selection controller,
 * persistence and cross-tab broadcast, sunrise/sunset scheduling,
 * transitions and animation, DOM and CSS-variable bindings, the plugin
 * system, library adapters, token resolution, validation, generation, and
 * migration.
 *
 * @packageDocumentation
 */
export * from "./model";
export * from "./adapters";
export * from "./createThemeStore";
export * from "./bootstrap";
export * from "./app-config";
// Deliberately NOT exported here: the loader uses node builtins and is only
// meaningful at build time. It lives at `@theme-kit/core/config` so a browser
// bundle of the main entry never sees it.

// Type-only, so the Vite plugin itself is not pulled into the main bundle.
export type { ThemeKitThemeConfig } from "./vite-plugin";
export * from "./sync-first-root";
export * from "./runtime";
// The diagnostics model comes before `./errors`: `ThemeError` carries a
// diagnostic's code and context, so the two are documented together.
export * from "./diagnostics";
export * from "./errors";
export * from "./validate-theme";
export * from "./css";
export * from "./default-themes";
export * from "./generate-theme";
export * from "./migrate-theme";
export * from "./debug";
export * from "./neutral-themes";
export * from "./preset-themes";
export * from "./built-in-themes";
export * from "./presets";
export * from "./brand-presets";
export * from "./accessibility-profiles";
export * from "./registry";
export * from "./resolver";
export type { ThemeStore, ThemeStoreOptions } from "./types";
export * from "./transition";
export * from "./animation";
export * from "./history";
export * from "./resolve";
export * from "./lifecycle";
export * from "./accessibility";
export * from "./plugin";
export * from "./utils/overlay-scrollbar";
