/**
 * Theme Kit Angular integration.
 *
 * Provides the DI tokens (`THEME_KIT_RUNTIME`, `THEME_KIT_SCOPED_RUNTIME`),
 * the `provideThemeKit` / `provideThemeKitRuntime` providers, the
 * `injectTheme*` injection functions, the `ThemeScopeDirective`,
 * `ThemeScrollbarDirective`, and `ThemeInspectorComponent`, plus the
 * persistence and blocking-script (zero-flash) helpers.
 *
 * @packageDocumentation
 */
export { THEME_KIT_RUNTIME, THEME_KIT_SCOPED_RUNTIME } from "./lib/tokens";

export {
  provideThemeKit,
  provideThemeKitRuntime,
  type ThemeKitProviderOptions,
} from "./lib/provider";

export {
  injectThemeRuntime,
  injectTheme,
  injectThemeHistory,
  injectThemeBatch,
  injectThemeSnapshot,
  injectThemeRestore,
  injectThemeTimeTravel,
  injectThemeLifecycle,
  injectThemePacks,
  injectThemeSchedule,
  type ThemeState,
  type ThemeHistoryState,
  type ThemeScheduleController,
} from "./lib/hooks";

export { ThemeScopeDirective } from "./lib/theme-scope.directive";

export { ThemeScrollbarDirective } from "./lib/theme-scrollbar.directive";

export { ThemeInspectorComponent } from "./lib/inspector.component";

export {
  createAngularPersistence,
} from "./lib/persistence";

export {
  createBlockingScriptContent,
  buildThemeCSSMap,
  type BlockingScriptOptions,
  type ThemeCSSMap,
} from "./lib/blocking-script";
