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

export {
  injectShadcnTheme,
  injectBootstrapTheme,
  injectDaisyTheme,
  injectOpenPropsTheme,
  type InjectAdapterOptions,
} from "./lib/hooks-adapters";

export { ThemeScopeDirective } from "./lib/theme-scope.directive";

export { ThemeScrollbarDirective } from "./lib/theme-scrollbar.directive";

export { ThemeInspectorComponent } from "./lib/inspector.component";

export {
  createAngularPersistence,
} from "./lib/persistence";

export {
  createBlockingScriptContent,
  buildThemeCSSMap,
  type ThemeCSSMap,
} from "./lib/blocking-script";
