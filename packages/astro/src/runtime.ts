/**
 * Browser entry for the Theme Kit Astro integration
 * (`@theme-kit/astro/runtime`).
 *
 * This is the **framework-neutral client API**, and it is the entry a `<script>`
 * in a `.astro` file should import. It ships the global runtime controller —
 * `getThemeController()` / `createThemeController()` — plus the low-level
 * shared-runtime accessors, and it imports no client framework.
 *
 * @remarks
 * **Why not `@theme-kit/astro`?** The root entry also exports `themeKit()`, the
 * build integration, which reads `theme.config.ts` from disk. That drags `node:url`
 * (and `@theme-kit/core/config`, hence `fs` / `path` / `module`) into whatever
 * imports it. A browser bundle cannot resolve those: Astro externalises them for
 * browser compatibility and the build fails with
 * `"fileURLToPath" is not exported by "__vite-browser-external"`.
 *
 * So the package is split the way the runtime actually is:
 *
 * | Entry | Environment | Contents |
 * | ----- | ----------- | -------- |
 * | `@theme-kit/astro` | Node / build | `themeKit()`, server helpers, type-only re-exports |
 * | `@theme-kit/astro/runtime` | Browser | `getThemeController()`, `getGlobalRuntime()` |
 * | `@theme-kit/astro/client` | Browser | React island + hooks (optional peer) |
 * | `@theme-kit/astro/provider.astro` | Server + browser | the SSR document |
 * | `@theme-kit/astro/ThemeToggle.astro` | Server + browser | the native toggle |
 *
 * `@theme-kit/astro` re-exports this entry's symbols for Node-side callers
 * (tests, scripts, a server-side integration), so importing from the root in a
 * server context keeps working. Import from `/runtime` in anything a browser
 * bundles.
 *
 * @example
 * ```astro
 * <button id="theme-toggle">Toggle theme</button>
 *
 * <script>
 *   import { getThemeController } from "@theme-kit/astro/runtime";
 *
 *   const theme = getThemeController();
 *
 *   document
 *     .querySelector("#theme-toggle")
 *     ?.addEventListener("click", () => theme.toggleTheme());
 * </script>
 * ```
 *
 * @packageDocumentation
 */
export { createThemeController, getThemeController } from "./controller";
export type {
  ThemeController,
  ThemeControllerOptions,
  ThemeControllerState,
} from "./controller";

export { getGlobalRuntime, requireGlobalRuntime, setGlobalRuntime } from "./shared-runtime";

export { THEME_READOUT_ATTRIBUTE, THEME_TOGGLE_ATTRIBUTE } from "./attributes";
