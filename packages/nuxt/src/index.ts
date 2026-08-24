import {
  defineNuxtModule,
  addImportsDir,
  addPlugin,
  createResolver,
  addComponentsDir,
} from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";
import type {
  PrePaintScrollbarOptions,
  ThemeDefinition,
  ThemeMode,
  ThemeScheduleOptions,
  ThemeTransitionOptions,
} from "@theme-kit/core";

export interface ModuleOptions {
  /** Theme registry. Defaults to the built-in themes when omitted. */
  themes?: ThemeDefinition[];
  /** Fallback theme name when no selection is persisted. */
  defaultTheme?: string;
  /** Initial mode: `"light"`, `"dark"` or `"system"`. Default `"system"`. */
  initialMode?: ThemeMode;
  /** Initial theme family when no selection is persisted. */
  initialFamily?: string;
  /**
   * Theme transitions. `false` disables them; `true` (or an options object)
   * enables smooth cross-fades on theme changes through the shared
   * `@theme-kit/core` transition engine.
   */
  transition?: boolean | ThemeTransitionOptions;
  /**
   * Custom scrollbar bootstrap. `true` (or options) emits the pre-paint CSS
   * and the `tk-scrollbar` class on `<html>` so the native scrollbar is
   * hidden from first paint; mount `<ThemeScrollbar />` to create the
   * overlay engine (shared with every framework).
   */
  scrollbar?: boolean | PrePaintScrollbarOptions;
  /** localStorage key holding the persisted selection. Default `"theme-selection"`. */
  storageKey?: string;
  /**
   * Sunrise/sunset scheduling. Pass `{ lightTheme, darkTheme, latitude,
   * longitude, ... }` to auto-switch between a light and a dark theme at
   * sunrise/sunset. `false` (default) disables scheduling. Use
   * `useThemeSchedule()` to read `enabled`/`status`/`sunrise`/`sunset` and to
   * enable or disable the schedule reactively.
   */
  scheduled?: false | ThemeScheduleOptions<ThemeDefinition>;
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@theme-kit/nuxt",
    configKey: "themeKit",
    compatibility: { nuxt: "^3.10.0" },
  },
  defaults: {
    themes: undefined,
    defaultTheme: undefined,
    initialMode: "system",
    initialFamily: undefined,
    transition: undefined,
    scrollbar: undefined,
    storageKey: undefined,
    scheduled: undefined,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.public.themeKit = {
      themes: options.themes ?? undefined,
      defaultTheme: options.defaultTheme ?? undefined,
      initialMode: options.initialMode ?? "system",
      initialFamily: options.initialFamily ?? undefined,
      transition: options.transition ?? undefined,
      scrollbar: options.scrollbar ?? undefined,
      storageKey: options.storageKey ?? undefined,
      scheduled: options.scheduled ?? undefined,
    };

    addImportsDir(resolver.resolve("./runtime/composables"));
    addComponentsDir({ path: resolver.resolve("./runtime/components"), prefix: "" });

    addPlugin(resolver.resolve("./runtime/plugin"));

    nuxt.hook("prepare:types", () => {
      const { themes } = nuxt.options.runtimeConfig.public.themeKit as { themes?: ThemeDefinition[] };
      if (themes && themes.length > 0) {
        const themeNames = themes.map((t: ThemeDefinition) => `"${t.name}"`).join(" | ");
        nuxt.options.alias["#theme-kit-themes"] = `{ name: ${themeNames} }`;
      }
    });
  },
});

export default module;

export {
  ThemeProvider,
  ThemeScope,
  ThemeScrollbar,
  ThemeInspector,
  useTheme,
  useThemeRuntime,
  useThemeHistory,
  useThemeBatch,
  useThemeSnapshot,
  useThemeRestore,
  useThemeLifecycle,
  useThemePacks,
  useThemeSchedule,
} from "@theme-kit/vue";
export { useShadcnTheme, useBootstrapTheme, useDaisyTheme, useOpenPropsTheme } from "@theme-kit/vue";
export type { ThemeProviderProps, ThemeScrollbarProps, ThemeScopeProps, ThemeInspectorProps } from "@theme-kit/vue";
export * from "@theme-kit/core";

export {
  computeFingerprint,
  resolveThemeFromCookies,
  createNuxtThemeBootstrapScript,
  themeKitCookieNames,
  parseCookieHeader,
} from "./server";
export type {
  ResolveThemeFromCookiesOptions,
  NuxtThemeBootstrapOptions,
} from "./server";