import {
  useTheme as useVueTheme,
  useThemeRuntime as useVueThemeRuntime,
  useThemeHistory as useVueThemeHistory,
  useThemeValue as useVueThemeValue,
  useThemeTokens as useVueThemeTokens,
  useThemeMode as useVueThemeMode,
  useThemeFamily as useVueThemeFamily,
  useThemeBatch as useVueThemeBatch,
  useThemeSnapshot as useVueThemeSnapshot,
  useThemeRestore as useVueThemeRestore,
  useThemeLifecycle as useVueThemeLifecycle,
  useThemePacks as useVueThemePacks,
  useThemeSchedule as useVueThemeSchedule,
} from "@theme-kit/vue";

export const useTheme = useVueTheme;
export const useThemeRuntime = useVueThemeRuntime;
export const useThemeHistory = useVueThemeHistory;
export const useThemeValue = useVueThemeValue;
export const useThemeTokens = useVueThemeTokens;
export const useThemeMode = useVueThemeMode;
export const useThemeFamily = useVueThemeFamily;
export const useThemeBatch = useVueThemeBatch;
export const useThemeSnapshot = useVueThemeSnapshot;
export const useThemeRestore = useVueThemeRestore;
export const useThemeLifecycle = useVueThemeLifecycle;
export const useThemePacks = useVueThemePacks;
export const useThemeSchedule = useVueThemeSchedule;

/** Alias of `useThemeRuntime` — resolves the app-wide runtime installed by the
 *  `@theme-kit/nuxt` plugin (also available as `$themeKit` on `nuxtApp`). */
export function useThemeKitRuntime() {
  return useVueThemeRuntime();
}

export {
  useShadcnTheme,
  useBootstrapTheme,
  useDaisyTheme,
  useOpenPropsTheme,
} from "@theme-kit/vue";