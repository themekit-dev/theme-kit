import type { ThemeDefinition, ThemeMode } from "./model/theme";
import { resolveInitialTheme, resolveSelectionTheme } from "./resolver";
import { themeToCSSVariables, type ThemeToCSSVariablesOptions } from "./css";

export interface BuildThemeCssMapOptions {
  prefix?: string;
}

function cssOptionsFrom(prefix?: string): ThemeToCSSVariablesOptions {
  return prefix !== undefined ? { prefix } : {};
}

/**
 * Build a lookup map of theme keys to flat CSS variables.
 *
 * Each theme is registered twice:
 * - under its own `name` (e.g. `"sunrise-light"`)
 * - under a `family:mode` key (e.g. `"sunrise:light"`) so that a persisted
 *   family + effective mode can be resolved without knowing theme names.
 */
export function buildThemeCssMap<T extends ThemeDefinition>(
  themes: readonly T[],
  options: BuildThemeCssMapOptions = {},
): Record<string, Record<string, string>> {
  const cssOptions = cssOptionsFrom(options.prefix);

  const map: Record<string, Record<string, string>> = {};

  for (const theme of themes) {
    const vars = themeToCSSVariables(theme, cssOptions);
    map[String(theme.name)] = vars;

    if (theme.meta?.family && theme.meta?.mode) {
      map[`${theme.meta.family}:${theme.meta.mode}`] = vars;
    }
  }

  return map;
}

export interface ThemeBootstrapScriptOptions<T extends ThemeDefinition> {
  themes: readonly T[];
  defaultTheme?: T["name"];
  initialMode?: ThemeMode;
  initialFamily?: string;
  /** localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. */
  storageKey?: string;
  /** CSS custom property prefix. Defaults to `"theme-"`. */
  prefix?: string;
}

function buildMaps<T extends ThemeDefinition>(
  themes: readonly T[],
  cssOptions: ThemeToCSSVariablesOptions,
): { map: Record<string, Record<string, string>>; names: Record<string, string> } {
  const map: Record<string, Record<string, string>> = {};
  const names: Record<string, string> = {};

  for (const theme of themes) {
    const vars = themeToCSSVariables(theme, cssOptions);
    const themeName = String(theme.name);

    map[themeName] = vars;
    names[themeName] = themeName;

    if (theme.meta?.family && theme.meta?.mode) {
      const key = `${theme.meta.family}:${theme.meta.mode}`;
      map[key] = vars;
      names[key] = themeName;
    }
  }

  return { map, names };
}

/**
 * Generate an inline, blocking script that applies the persisted theme before
 * first paint, preventing a flash of the wrong (or missing) theme on reload.
 *
 * The script reads the saved selection from localStorage, resolves the theme
 * for the effective mode (`"system"` is resolved against `prefers-color-scheme`),
 * and writes the CSS variables plus DOM effects onto `document.documentElement`.
 */
export function createThemeBootstrapScript<T extends ThemeDefinition>(
  options: ThemeBootstrapScriptOptions<T>,
): string {
  const {
    themes,
    defaultTheme,
    initialMode,
    initialFamily,
    storageKey = "theme-selection",
    prefix,
  } = options;

  const cssOptions = cssOptionsFrom(prefix);

  const { map, names } = buildMaps(themes, cssOptions);

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

  map["__default-light"] = themeToCSSVariables(defaultLight.theme, cssOptions);
  names["__default-light"] = String(defaultLight.theme.name);
  map["__default-dark"] = themeToCSSVariables(defaultDark.theme, cssOptions);
  names["__default-dark"] = String(defaultDark.theme.name);

  const fallbackMode = initialMode ?? "system";
  const fallbackFamily = initialFamily ?? null;

  return `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
    storageKey,
  )});var sel=raw?JSON.parse(raw):null;var mode=sel&&(sel.mode==='light'||sel.mode==='dark'||sel.mode==='system')?sel.mode:${JSON.stringify(
    fallbackMode,
  )};var family=sel&&typeof sel.family==='string'?sel.family:${JSON.stringify(
    fallbackFamily,
  )};var map=${JSON.stringify(
    map,
  )};var names=${JSON.stringify(
    names,
  )};var sysDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var effMode=mode==='dark'||(mode==='system'&&sysDark)?'dark':'light';var key=(family&&map[family+':'+effMode])?family+':'+effMode:'__default-'+effMode;var vars=map[key]||map['__default-light'];var name=names[key]||names['__default-'+effMode]||null;var el=document.documentElement;if(effMode==='dark'){el.classList.add('dark');}else{el.classList.remove('dark');}el.style.colorScheme=effMode;el.setAttribute('data-theme-mode',effMode);if(family){el.setAttribute('data-theme-family',family);}if(name){el.setAttribute('data-theme',name);}if(vars){for(var prop in vars){el.style.setProperty(prop,vars[prop]);}}}catch(e){}})()`;
}

/**
 * Generate a `@media (prefers-color-scheme: dark)` CSS block carrying the given
 * variables. Useful when the initial mode is `"system"` and the light theme is
 * rendered statically, so dark-mode users get the correct colors without JS.
 */
export function darkModeCSSTemplate(
  variables: Record<string, string>,
): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `@media (prefers-color-scheme: dark) {:root {\n${rules}\n}}`;
}
