import {
  createThemeRuntime,
  systemModeCSSTemplate,
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
import { toRaw } from "vue";
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

  // Nuxt hands us Vue reactive proxies: `useRuntimeConfig()` is reactive and so
  // is every `useState` payload. The core history/snapshot controllers isolate
  // state with `structuredClone`, which throws a `DataCloneError` on *any*
  // Proxy, so the runtime must never receive one. `toRaw` unwraps the whole
  // tree — reading a property off the raw target never re-wraps.
  const themes = toRaw(
    themeConfig.themes?.length
      ? themeConfig.themes
      : (getBuiltInThemes() as ThemeDefinition[]),
  ) as ThemeDefinition[];
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

    // A concrete mode means the server already knows the answer, so inlining
    // that theme's variables is safe. "system" it cannot answer — and there the
    // variables must NOT be inlined: an inline declaration outranks every
    // stylesheet rule regardless of specificity, so a dark media block emitted
    // alongside them could never apply and an OS-dark visitor would stay light.
    // Emit both schemes as media blocks instead and leave only
    // `color-scheme: light dark`, which is the same rule `@theme-kit/astro`
    // applies via `systemModeCSSTemplate`.
    let themeStyle: string;
    let colorScheme: string;
    if (selection.mode === "system") {
      const light = resolveSelectionTheme({
        themes,
        selection: { family: selection.family, mode: "light" },
      });
      const dark = resolveSelectionTheme({
        themes,
        selection: { family: selection.family, mode: "dark" },
      });
      themeStyle = systemModeCSSTemplate(
        themeToCSSVariables(light.theme),
        themeToCSSVariables(dark.theme),
      );
      colorScheme = "light dark";
    } else {
      themeStyle = cssVariablesStyle(cssVars);
      colorScheme = effMode;
    }

    const styleEntries: Array<{ innerHTML: string; tagPriority?: string }> = [
      {
        innerHTML: `${themeStyle}html{color-scheme:${colorScheme}}`,
        tagPriority: "critical",
      },
    ];

    // Pre-paint scrollbar: hide the native bar from the very first paint.
    if (scrollbar) {
      styleEntries.push({ innerHTML: createPrePaintScrollbarCSS() });
    }

    // Everything the pre-paint script writes onto <html>, declared here so the
    // server-rendered markup already carries it. A client hydration diff reports
    // an attribute that is in the DOM but absent from the rendered props as a
    // mismatch, so a server that stayed silent about any of these warned on every
    // page load in development.
    //
    // `data-theme-mode` is the *resolved* mode; `data-theme-selection-mode` is
    // the visitor's actual choice, which the resolved mode cannot recover — a
    // `"system"` selection is resolved to `"light"`/`"dark"` before it is
    // written, and `data-theme-ready` is the script's completion marker.
    const resolvedFamily = initial.theme.meta?.family ?? selection.family;
    const selectionFamily = selection.family ?? resolvedFamily;
    const htmlAttrs: Record<string, string> = {
      "data-theme": String(initial.theme.name),
      "data-theme-mode": effMode,
      "data-theme-selection-mode": selection.mode,
      "data-theme-ready": "true",
    };
    // The script writes these two only when it has a family, so the server does
    // the same rather than emitting an empty attribute it would then not match.
    if (resolvedFamily) {
      htmlAttrs["data-theme-family"] = resolvedFamily;
    }
    if (selectionFamily) {
      htmlAttrs["data-theme-selection-family"] = selectionFamily;
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

  // Same proxy hazard as `themes` above: the revived payload is reactive, and
  // `createThemeHistory` clones the initial theme on construction.
  const initial = initialFromPayload.value
    ? (toRaw(initialFromPayload.value) as InitialThemeResolution<ThemeDefinition>)
    : null;

  const persistence = createNuxtThemePersistence(themes, defaultTheme);

  const runtime = createThemeRuntime<ThemeDefinition>({
    themes,
    ...(initial ? { initial } : {}),
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    initialMode,
    ...(initialFamily !== undefined ? { initialFamily } : {}),
    // SSR state wins on first paint so hydration matches exactly; localStorage
    // sync kicks in on the first selection change.
    readPersistenceOnInit: !initial,
    persistence,
    ...(transition !== undefined ? { transition } : {}),
    ...(scheduled !== undefined ? { scheduled } : {}),
  });

  nuxtApp.vueApp.provide(ThemeKitSymbol, runtime);
  nuxtApp.provide("themeKit", runtime);
  // Registered exactly once. Nuxt's `provide` installs a non-configurable
  // getter, so also returning `{ provide: { themeKitRuntime } }` from the
  // plugin would call `provide("themeKitRuntime", ...)` a second time and throw
  // "Cannot redefine property: $themeKitRuntime" during app initialisation.
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
});

export type ThemeKitPluginRuntime = ThemeRuntime<ThemeDefinition>;