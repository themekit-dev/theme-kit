/**
 * Build-time entry: discovery of the application's `theme.config.ts`.
 *
 * Imported from `@theme-kit/core/config`. Kept out of the main entry because it
 * uses node builtins, which a browser bundle of `@theme-kit/core` must never
 * pull in — the main entry is runtime code, this is build-time code.
 *
 * @packageDocumentation
 */
export {
  loadThemeKitConfig,
  THEME_KIT_CONFIG_FILES,
} from "./config-loader";
