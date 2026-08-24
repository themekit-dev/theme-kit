export { ThemeProviderClient } from "./client";
export type { ThemeProviderClientProps } from "./client";

export { ThemeScrollbar, ThemeInspector } from "@theme-kit/react";
export type { ThemeScrollbarProps, ThemeInspectorProps } from "@theme-kit/react";

export {
  useThemeRuntime,
  useTheme,
  useThemeValue,
  useThemeMode,
  useThemeFamily,
  useSetThemeMode,
  useSetThemeFamily,
  useToggleTheme,
  useThemeTokens,
  useThemeHistory,
  useThemeBatch,
  useThemeSnapshot,
  useThemeRestore,
  useThemeLifecycle,
  useThemePacks,
  useThemeSchedule,
} from "./hooks";

export { ThemeScope } from "./theme-scope";
export type { ThemeScopeProps } from "./theme-scope";

export { computeFingerprint } from "./fingerprint";
export { createBlockingScript, buildThemeCssMap, darkModeCSSTemplate } from "./blocking-script";
export { createAstroThemePersistence } from "./persistence";

export { getGlobalRuntime, setGlobalRuntime } from "./shared-runtime";
