import {
  createThemeRuntime,
  darkModeCSSTemplate,
  getBuiltInThemes,
  resolveSelectionTheme,
  themeToCSSVariables,
  createPrePaintScrollbarCSS,
  type InitialThemeResolution,
  type PrePaintScrollbarOptions,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeRuntime,
  type ThemeScheduleOptions,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { ThemeKitSymbol } from "@theme-kit/vue";
import {
  defineNuxtPlugin,
  useHead,
  useRequestHeaders,
  useState,
  useRuntimeConfig,
} from "#app";
import { resolveThemeFromCookies } from "../../server/resolve";
import {
  createNuxtThemeBootstrapScript,
  cssVariablesStyle,
} from "../../server/bootstrap";
import {
  themeKitCookieNames,
  parseCookieHeader,
} from "../../server/cookies";
import { computeFingerprint } from "../../server/fingerprint";
import { createNuxtThemePersistence } from "../utils/persistence";

export interface ThemeKitRuntimeConfig {
  themes?: ThemeDefinition[];
  defaultTheme?: string;
  initialMode?: ThemeMode;
  initialFamily?: string;
  transition?: boolean | ThemeTransitionOptions;
  scrollbar?: boolean | PrePaintScrollbarOptions;
  storageKey?: string;
  scheduled?: false | ThemeScheduleOptions<ThemeDefinition>;
}

const INITIAL_STATE_KEY = "theme-kit:initial";

function writeCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; path=/; max-age=31536000; samesite=lax`;
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const themeConfig = (config.public.themeKit ?? {}) as ThemeKitRuntimeConfig;

  const themes = (themeConfig.themes?.length
    ? themeConfig.themes
    : (getBuiltInThemes() as ThemeDefinition[])) as ThemeDefinition[];
  const defaultTheme = themeConfig.defaultTheme;
  const initialMode: ThemeMode = themeConfig.initialMode ?? "system";
  const initialFamily = themeConfig.initialFamily;
  const transition = themeConfig.transition;
  const scrollbar = themeConfig.scrollbar;
  const scheduled = themeConfig.scheduled;

  // ------------------------------------------------------------------ server
  // SSR-first theme resolution: read cookies → validate fingerprint → resolve
  // family + mode + theme → render a themed <html> + blocking bootstrap so the
  // browser paints already themed (no "neutral → hydrate → change" sequence).
  if (import.meta.server) {
    const cookieHeader = useRequestHeaders(["cookie"]).cookie;
    const cookies = parseCookieHeader(cookieHeader ?? "");

    const initial = resolveThemeFromCookies({
      themes,
      ...(defaultTheme !== undefined ? { defaultTheme } : {}),
      initialMode,
      ...(initialFamily !== undefined ? { initialFamily } : {}),
      cookies,
    });

    const initialState = useState<InitialThemeResolution<ThemeDefinition> | null>(
      INITIAL_STATE_KEY,
      () => initial,
    );
    initialState.value = initial;

    const selection = initial.selection;
    const effMode = selection.mode === "dark" ? "dark" : "light";
    const cssVars = themeToCSSVariables(initial.theme);
    const blockingScript = createNuxtThemeBootstrapScript({
      themes,
      ...(defaultTheme !== undefined ? { defaultTheme } : {}),
      initialMode,
      ...(initialFamily !== undefined ? { initialFamily } : {}),
    });

    const styleEntries: Array<{ innerHTML: string; tagPriority?: string }> = [
      {
        innerHTML: `${cssVariablesStyle(cssVars)}html{color-scheme:${effMode}}`,
        tagPriority: "critical",
      },
    ];

    // "system" renders the light theme statically; dark-mode users get the
    // correct colors without JS via a prefers-color-scheme media block.
    if (selection.mode === "system") {
      const dark = resolveSelectionTheme({
        themes,
        selection: { family: selection.family, mode: "dark" },
      });
      styleEntries.push({
        innerHTML: darkModeCSSTemplate(themeToCSSVariables(dark.theme)),
      });
    }

    // Pre-paint scrollbar: hide the native bar from the very first paint.
    if (scrollbar) {
      styleEntries.push({ innerHTML: createPrePaintScrollbarCSS() });
    }

    const htmlAttrs: Record<string, string> = {
      "data-theme": String(initial.theme.name),
      "data-theme-mode": effMode,
    };
    if (selection.family) {
      htmlAttrs["data-theme-family"] = selection.family;
    }
    if (effMode === "dark") htmlAttrs.class = "dark";
    if (scrollbar) {
      htmlAttrs.class = htmlAttrs.class
        ? `${htmlAttrs.class} tk-scrollbar`
        : "tk-scrollbar";
    }

    useHead(
      {
        htmlAttrs,
        style: styleEntries,
        script: [
          {
            innerHTML: blockingScript,
            type: "text/javascript",
            tagPriority: "critical",
          },
        ],
      },
      { mode: "server" },
    );

    // Provide a runtime during SSR so components calling useTheme()/useThemeRuntime()
    // render without throwing. Bindings stay off; they attach on the client.
    const ssrRuntime = createThemeRuntime<ThemeDefinition>({
      themes,
      initial,
      readPersistenceOnInit: false,
      dom: false,
      cssVariables: false,
      ...(scheduled !== undefined ? { scheduled } : {}),
    });

    nuxtApp.vueApp.provide(ThemeKitSymbol, ssrRuntime);
    nuxtApp.provide("themeKit", ssrRuntime);
    nuxtApp.provide("themeKitRuntime", ssrRuntime);
    return;
  }

  // ------------------------------------------------------------------ client
  const initialFromPayload = useState<InitialThemeResolution<ThemeDefinition> | null>(
    INITIAL_STATE_KEY,
  );

  const persistence = createNuxtThemePersistence(themes, defaultTheme);

  const runtime = createThemeRuntime<ThemeDefinition>({
    themes,
    ...(initialFromPayload.value ? { initial: initialFromPayload.value } : {}),
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    initialMode,
    ...(initialFamily !== undefined ? { initialFamily } : {}),
    // SSR state wins on first paint so hydration matches exactly; localStorage
    // sync kicks in on the first selection change.
    readPersistenceOnInit: !initialFromPayload.value,
    persistence,
    ...(transition !== undefined ? { transition } : {}),
    ...(scheduled !== undefined ? { scheduled } : {}),
  });

  nuxtApp.vueApp.provide(ThemeKitSymbol, runtime);
  nuxtApp.provide("themeKit", runtime);
  nuxtApp.provide("themeKitRuntime", runtime);

  // Mirror the full selection back to cookies so the server knows exactly what
  // the client picked on the next request (same CookieSync as @theme-kit/next).
  const fingerprint = computeFingerprint(themes, defaultTheme);

  const syncFromRuntime = (theme: ThemeDefinition) => {
    const isDark = theme.meta?.mode === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    writeCookie(themeKitCookieNames.name, String(theme.name));
    writeCookie(themeKitCookieNames.family, runtime.selection.getFamily());
    writeCookie(themeKitCookieNames.mode, runtime.selection.getMode());
    if (fingerprint) {
      writeCookie(themeKitCookieNames.fingerprint, fingerprint);
    }
  };

  syncFromRuntime(runtime.store.get());
  const unsubscribe = runtime.store.subscribe(syncFromRuntime);

  nuxtApp.hook("app:error", () => {
    unsubscribe();
  });

  nuxtApp.hook("vue:error", () => {
    unsubscribe();
  });

  return {
    provide: {
      themeKitRuntime: runtime,
    },
  };
});

export type ThemeKitPluginRuntime = ThemeRuntime<ThemeDefinition>;