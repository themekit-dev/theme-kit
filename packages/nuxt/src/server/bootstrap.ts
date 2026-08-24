import {
  buildThemeCssMap,
  resolveInitialTheme,
  resolveSelectionTheme,
  themeToCSSVariables,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";
import { themeKitCookieNames } from "./cookies";

export interface NuxtThemeBootstrapOptions<T extends ThemeDefinition> {
  themes: readonly T[];
  defaultTheme?: T["name"];
  initialMode?: ThemeMode;
  initialFamily?: string;
}

function buildNames<T extends ThemeDefinition>(
  themes: readonly T[],
  map: Record<string, Record<string, string>>,
): Record<string, string> {
  const names: Record<string, string> = {};
  for (const theme of themes) {
    const themeName = String(theme.name);
    names[themeName] = themeName;
    if (theme.meta?.family && theme.meta?.mode) {
      names[`${theme.meta.family}:${theme.meta.mode}`] = themeName;
    }
  }
  for (const key of Object.keys(map)) {
    if (key.startsWith("__default-")) {
      names[key] = key.replace("__default-", "theme-kit-default-");
    }
  }
  return names;
}

/**
 * Generate the blocking, inline bootstrap script that applies the persisted
 * theme before first paint — the same zero-flash guarantee `@theme-kit/next`
 * ships.
 *
 * The script reads the four theme cookies (same contract as Next), validates
 * the config fingerprint, resolves the theme for the effective mode
 * (`"system"` is resolved against `prefers-color-scheme`), and writes the CSS
 * variables plus DOM effects onto `document.documentElement`. All theme
 * knowledge (CSS maps, default resolution) comes from `@theme-kit/core` — this
 * file is only glue wiring the cookie contract into the rendered HTML.
 *
 * Emit it in `<head>` with `tagPriority: "critical"` so it runs before the app
 * stylesheets and the browser paints already themed.
 */
export function createNuxtThemeBootstrapScript<T extends ThemeDefinition>(
  options: NuxtThemeBootstrapOptions<T>,
): string {
  const { themes, defaultTheme, initialMode, initialFamily } = options;

  const map = buildThemeCssMap(themes);

  const resolution = resolveInitialTheme({
    themes,
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(initialFamily !== undefined ? { family: initialFamily } : {}),
    ...(initialMode !== undefined ? { mode: initialMode } : {}),
  });
  const defaultFamily = resolution.selection.family;

  const defaultLight = resolveSelectionTheme({
    themes,
    selection: { family: defaultFamily, mode: "light" },
  });
  const defaultDark = resolveSelectionTheme({
    themes,
    selection: { family: defaultFamily, mode: "dark" },
  });

  map["__default-light"] = themeToCSSVariables(defaultLight.theme);
  map["__default-dark"] = themeToCSSVariables(defaultDark.theme);

  const names = buildNames(themes, map);
  const fallbackMode = initialMode ?? "system";
  const fingerprint = computeFingerprint(themes, defaultTheme);

  const { mode: cMode, family: cFamily, fingerprint: cFingerprint } =
    themeKitCookieNames;

  return (
    "(function(){try{" +
    "function getCookie(n){var m=document.cookie.match(new RegExp('(^|; )'+n+'=([^;]+)'));" +
    "return m?decodeURIComponent(m[2]):null}" +
    "var mode=getCookie(" + JSON.stringify(cMode) + ");" +
    "var family=getCookie(" + JSON.stringify(cFamily) + ");" +
    "var fp=getCookie(" + JSON.stringify(cFingerprint) + ");" +
    (fingerprint
      ? "if(fp&&fp!==" + JSON.stringify(fingerprint) + "){mode=null;family=null;}"
      : "") +
    "var hasMode=mode==='light'||mode==='dark'||mode==='system';" +
    "var selMode=hasMode?mode:" + JSON.stringify(fallbackMode) + ";" +
    "var sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches;" +
    "var eff=selMode==='dark'||(selMode==='system'&&sysDark)?'dark':'light';" +
    "var selFamily=family||" + JSON.stringify(initialFamily ?? null) + ";" +
    "var map=" + JSON.stringify(map) + ";" +
    "var names=" + JSON.stringify(names) + ";" +
    "var key=(selFamily&&map[selFamily+':'+eff])?selFamily+':'+eff:'__default-'+eff;" +
    "var vars=map[key]||map['__default-light'];" +
    "var name=names[key]||names['__default-'+eff]||null;" +
    "var el=document.documentElement;" +
    "if(eff==='dark'){el.classList.add('dark');}else{el.classList.remove('dark');}" +
    "el.style.colorScheme=eff;" +
    "el.setAttribute('data-theme-mode',eff);" +
    "if(selFamily){el.setAttribute('data-theme-family',selFamily);}" +
    "if(name){el.setAttribute('data-theme',name);}" +
    "if(vars){for(var p in vars){el.style.setProperty(p,vars[p]);}}" +
    "}catch(e){}})()"
  );
}

/** `:root { --a: b; ... }` style block for the resolved SSR theme. */
export function cssVariablesStyle(
  variables: Record<string, string>,
): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
  return `:root{${rules}}`;
}
