/**
 * Theme Kit Astro integration.
 *
 * This entry point is **framework-neutral**: it ships the Astro integration
 * (`themeKit`), the zero-flash server helpers (`createBlockingScript`,
 * `buildThemeCssMap`, `darkModeCSSTemplate`, `systemModeCSSTemplate`,
 * `computeFingerprint`, `getInitialThemeState`), the Astro-specific
 * `ThemePersistence`, the browser-side `getThemeController()` /
 * `createThemeController()` API, the shared-runtime accessors, and the
 * framework-neutral `ThemeKitScrollbar` / `ThemeKitInspector` re-exports from
 * `@theme-kit/web`. None of it imports React.
 *
 * The React island (`ThemeProviderClient`), the React hooks, and the React
 * `ThemeScope` live behind the opt-in `@theme-kit/astro/client` subpath, which
 * is the only entry that depends on React.
 *
 * @remarks
 * The Astro-native surface has three levels, and only the third needs React:
 *
 * | Level | Import | Client framework |
 * | ----- | ------ | ---------------- |
 * | Declare the configuration once | `@theme-kit/astro/provider.astro` | none |
 * | Toggle the theme | `@theme-kit/astro/ThemeToggle.astro` | none |
 * | Custom browser interaction | `getThemeController()` | none |
 * | React components inside Astro | `@theme-kit/astro/client` | React (optional) |
 *
 * @packageDocumentation
 */
export { themeKit } from "./integration";
export type { ThemeKitIntegrationOptions } from "./integration";
export { default } from "./integration";

export { ThemeKitScrollbar, ThemeKitInspector, injectPrePaintScrollbarCSS } from "@theme-kit/web";

export { computeFingerprint } from "./fingerprint";
export {
  createBlockingScript,
  buildThemeCssMap,
  darkModeCSSTemplate,
  systemModeCSSTemplate,
} from "./blocking-script";
export { createAstroThemePersistence } from "./persistence";
export { getInitialThemeState } from "./server";

export { getGlobalRuntime, setGlobalRuntime, requireGlobalRuntime } from "./shared-runtime";

/**
 * The Astro-native, framework-neutral browser API.
 *
 * `getThemeController()` is the idiomatic entry point — one runtime per
 * document, shared with every other consumer on the page. `getGlobalRuntime()`
 * stays available as the low-level escape hatch.
 *
 * @see {@link ThemeController}
 */
export { createThemeController, getThemeController } from "./controller";
export type {
  ThemeController,
  ThemeControllerOptions,
  ThemeControllerState,
} from "./controller";
