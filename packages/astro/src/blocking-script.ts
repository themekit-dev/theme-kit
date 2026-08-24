import type { ThemeDefinition } from "@theme-kit/core";
import { themeToCSSVariables } from "@theme-kit/core";

export function createBlockingScript(
  fingerprint: string,
  themeCssMap: Record<string, Record<string, string>>,
): string {
  return `(function(){try{function getCookie(name){var m=document.cookie.match(new RegExp('(^|; )'+name+'=([^;]+)'));return m?decodeURIComponent(m[2]):null}var mode=getCookie('theme-mode');var family=getCookie('theme-family');var savedFingerprint=getCookie('theme-fingerprint');var map=${JSON.stringify(themeCssMap)};var sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var effMode=mode==='dark'||(mode==='system'&&sysDark)?'dark':'light';var k=(family&&map[family+':'+effMode])?(family+':'+effMode):null;var v=k?map[k]:null;if(effMode==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}if(v){for(var prop in v){document.documentElement.style.setProperty(prop,v[prop]);}}}catch(e){}})()`;
}

export function buildThemeCssMap(themes: readonly ThemeDefinition[]): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};
  for (const theme of themes) {
    const vars = themeToCSSVariables(theme);
    map[String(theme.name)] = vars;
    if (theme.meta?.family && theme.meta?.mode) {
      map[`${theme.meta.family}:${theme.meta.mode}`] = vars;
    }
  }
  return map;
}

export function darkModeCSSTemplate(variables: Record<string, string>): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `@media (prefers-color-scheme: dark) {:root {\n${rules}\n}}`;
}
