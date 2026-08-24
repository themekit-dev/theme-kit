import React from "react";
import type { ThemeDefinition } from "@theme-kit/core";
import {
  resolveSelectionTheme,
  resolveInitialTheme,
  themeToCSSVariables,
} from "@theme-kit/core";
import { computeFingerprint } from "./fingerprint";

export interface ThemeHeadProps<T extends ThemeDefinition> {
  themes: readonly T[];
  defaultTheme?: T["name"];
}

function darkModeCSSTemplate(variables: Record<string, string>): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `@media (prefers-color-scheme: dark) {:root {\n${rules}\n}}`;
}

export function getBlockingScriptContent<T extends ThemeDefinition>(
  themes: readonly T[],
  defaultTheme?: T["name"],
): string {
  const themeCssMap: Record<string, Record<string, string>> = {};
  for (const themeItem of themes) {
    const vars = themeToCSSVariables(themeItem);
    themeCssMap[String(themeItem.name)] = vars;
    if (themeItem.meta?.family && themeItem.meta?.mode) {
      themeCssMap[`${themeItem.meta.family}:${themeItem.meta.mode}`] = vars;
    }
  }

  return `(function(){try{function getCookie(name){var m=document.cookie.match(new RegExp('(^|; )'+name+'=([^;]+)'));return m?decodeURIComponent(m[2]):null}var mode=getCookie('theme-mode');var family=getCookie('theme-family');var fingerprint=getCookie('theme-fingerprint');var map=${JSON.stringify(themeCssMap)};var sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var effMode=mode==='dark'||(mode==='system'&&sysDark)?'dark':'light';var k=(family&&map[family+':'+effMode])?(family+':'+effMode):null;var v=k?map[k]:null;if(effMode==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}if(v){for(var prop in v){document.documentElement.style.setProperty(prop,v[prop]);}}}catch(e){}})()`;
}

export function getDarkModeCSS<T extends ThemeDefinition>(
  themes: readonly T[],
  defaultTheme?: T["name"],
): string | null {
  const initial = resolveInitialTheme({
    themes,
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
  });

  if (initial.selection.mode !== "system") {
    return null;
  }

  const dark = resolveSelectionTheme({
    themes,
    selection: { family: initial.selection.family, mode: "dark" },
  });

  const darkVariables = themeToCSSVariables(dark.theme);
  return darkModeCSSTemplate(darkVariables);
}

export function ThemeHead<T extends ThemeDefinition>({
  themes,
  defaultTheme,
}: ThemeHeadProps<T>) {
  const scriptContent = getBlockingScriptContent(themes, defaultTheme);
  const darkCSS = getDarkModeCSS(themes, defaultTheme);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
      {darkCSS ? (
        <style
          dangerouslySetInnerHTML={{
            __html: darkCSS,
          }}
        />
      ) : null}
    </>
  );
}
