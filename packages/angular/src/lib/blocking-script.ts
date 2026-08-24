import type { ThemeDefinition, ThemeMode } from "@theme-kit/core";

export interface ThemeCSSMap {
  light: Record<string, string>;
  dark: Record<string, string>;
}

function themeToFlatCSS(theme: ThemeDefinition): Record<string, string> {
  const map: Record<string, string> = {};
  const tokens = theme.tokens;
  if (!tokens) return map;

  function flatten(obj: Record<string, unknown>, prefix: string) {
    for (const [key, value] of Object.entries(obj)) {
      const name = `--theme-${prefix}${key}`;
      if (typeof value === "string") {
        map[name] = value;
      } else if (value && typeof value === "object") {
        flatten(value as Record<string, unknown>, `${prefix}${key}-`);
      }
    }
  }

  if (tokens.colors) flatten(tokens.colors as unknown as Record<string, unknown>, "");
  if (tokens.spacing) flatten(tokens.spacing as unknown as Record<string, unknown>, "spacing-");
  if (tokens.radius) flatten(tokens.radius as unknown as Record<string, unknown>, "radius-");
  if (tokens.shadows) flatten(tokens.shadows as unknown as Record<string, unknown>, "shadow-");

  return map;
}

export function buildThemeCSSMap(themes: readonly ThemeDefinition[]): ThemeCSSMap {
  let lightTheme: ThemeDefinition | undefined;
  let darkTheme: ThemeDefinition | undefined;

  const first = themes[0];
  const family = first?.meta?.family ?? "default";

  for (const theme of themes) {
    if (theme.meta?.family === family || !theme.meta?.family) {
      if (theme.meta?.mode === "light") lightTheme ??= theme;
      if (theme.meta?.mode === "dark") darkTheme ??= theme;
    }
  }

  lightTheme ??= themes.find((t) => t.meta?.mode === "light") ?? themes[0];
  darkTheme ??= themes.find((t) => t.meta?.mode === "dark") ?? themes[0];

  return {
    light: lightTheme ? themeToFlatCSS(lightTheme) : {},
    dark: darkTheme ? themeToFlatCSS(darkTheme) : {},
  };
}

function cssVarsToString(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
}

function darkModeCSSTemplate(lightVars: string, darkVars: string): string {
  return [
    `@media (prefers-color-scheme:dark){:root{${darkVars}}}`,
    `@media (prefers-color-scheme:light){:root{${lightVars}}}`,
  ].join("");
}

export function createBlockingScriptContent(
  themes: readonly ThemeDefinition[],
  savedSelection?: { mode: ThemeMode; family: string } | null,
): string {
  const cssMap = buildThemeCSSMap(themes);

  const initialFamily = savedSelection?.family ?? themes[0]?.meta?.family ?? "default";
  const initialMode = savedSelection?.mode ?? "system";

  const lightVars = cssVarsToString(cssMap.light);
  const darkVars = cssVarsToString(cssMap.dark);

  const mediaCSS = darkModeCSSTemplate(lightVars, darkVars);

  const inlineVars =
    initialMode === "dark" ? darkVars : initialMode === "light" ? lightVars : "";

  const script = [
    "(function(){",
    "try{",
    `var m='${initialMode}',f='${initialFamily}';`,
    "var s=document.getElementById('theme-kit-state');",
    "if(s){try{var p=JSON.parse(s.textContent||'{}');",
    "if(p.mode)m=p.mode;if(p.family)f=p.family;}catch(e){}}",
    "var ls;try{ls=window.localStorage.getItem('theme-selection');",
    "if(ls){var lp=JSON.parse(ls);if(lp.mode)m=lp.mode;if(lp.family)f=lp.family;}}catch(e){}",
    "if(m!=='system'){document.documentElement.setAttribute('data-theme-mode',m);}",
    "document.documentElement.setAttribute('data-theme-family',f);",
    "if(m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){",
    "document.documentElement.classList.add('dark');",
    "document.documentElement.style.cssText+='" + darkVars + "';",
    "}else{",
    "document.documentElement.style.cssText+='" + lightVars + "';",
    "}",
    "}catch(e){}",
    "})();",
  ].join("");

  return [
    `<style id="theme-kit-critical">${mediaCSS}</style>`,
    `<script id="theme-kit-blocking">${script}</script>`,
  ].join("");
}
