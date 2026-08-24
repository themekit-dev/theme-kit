import React, {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import {
  createPrePaintScrollbarCSS,
  getBuiltInThemes,
  resolveInitialTheme,
  resolveSelectionTheme,
  themeToCSSVariables,
  type PrePaintScrollbarOptions,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";

import { computeFingerprint } from "./fingerprint";

/**
 * Every attribute a plain `<html>` element accepts, You can pass straight
 * through to `ThemeProvider`. `className` and `style` are merged with the
 * theme's SSR output rather than replaced.
 */
export interface ThemeProviderHtmlProps extends Omit<
  HTMLAttributes<HTMLHtmlElement>,
  "children" | "lang" | "className" | "style"
> {
  className?: string;
  style?: CSSProperties;
}

export interface ThemeProviderBodyProps extends Omit<
  HTMLAttributes<HTMLBodyElement>,
  "children" | "className" | "style"
> {
  className?: string;
  style?: CSSProperties;
}

export interface ThemeProviderProps<
  T extends ThemeDefinition,
> extends ThemeProviderHtmlProps {
  children: ReactNode;
  /** Collection of themes to be specified for the application. */
  themes?: readonly T[];
  /** The lang attribute name the language of the element's content. */
  lang?: string;
  /** Theme to be applied as default.
   * Pass defaultTheme="light" for the theme-kit's default neutral light theme.
   * And defaultTheme="dark" for default neutral dark theme.
   */
  defaultTheme?: T["name"];
  /** Font family applied to the body element (e.g. "Inter, sans-serif"). */
  font?: string;
  /** Attributes forwarded to the rendered `<body>` element. */
  body?: ThemeProviderBodyProps;
  /** CSS transition options for theme changes. */
  transition?: boolean | import("@theme-kit/core").ThemeTransitionOptions;
  /**
   * Sunrise/sunset scheduling. Passed to the client runtime; the server
   * resolves the initial theme (zero-flash) and the client schedule controls
   * activation. Exposed reactively via `useThemeSchedule()`.
   */
  scheduled?: false | import("@theme-kit/core").ScheduledThemeOptions<T>;
  /**
   * Opt into a custom document scrollbar that exists from the very first
   * paint �?" no native-scrollbar flash, no gap while the bundle hydrates.
   *
   * `true` builds the pre-paint overlay with defaults; pass
   * `PrePaintScrollbarOptions` to customize it. The server emits the overlay
   * `tk-scrollbar` class on `<html>` plus a blocking `<style>` (via
   * `createPrePaintScrollbarCSS`) so the native scrollbar is hidden from the
   * very first paint �?" no flash and no hydration mismatch. When your
   * `<ThemeScrollbar>` / `createOverlayScrollbar` hydrates, the engine creates
   * the custom strips and takes over. Import
   * `@theme-kit/core/scrollbar.css` for the pre-paint styles.
   */
  scrollbar?: boolean | PrePaintScrollbarOptions;
}

function darkModeCSSTemplate(variables: Record<string, string>): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `@media (prefers-color-scheme: dark) {:root {\n${rules}\n}}`;
}

export async function ThemeProvider<T extends ThemeDefinition>({
  children,
  themes,
  lang = "en",
  defaultTheme,
  className,
  style,
  font,
  body,
  transition,
  scheduled,
  scrollbar,
  ...htmlProps
}: ThemeProviderProps<T>) {
  const resolvedThemes = themes?.length
    ? themes
    : (getBuiltInThemes() as unknown as readonly T[]);

  const currentFingerprint = computeFingerprint(resolvedThemes, defaultTheme);

  let mode: ThemeMode = "system";
  let family: string | undefined;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const savedFingerprint = cookieStore.get("theme-fingerprint")?.value;

    if (savedFingerprint === currentFingerprint) {
      const modeCookie = cookieStore.get("theme-mode")?.value;
      const familyCookie = cookieStore.get("theme-family")?.value;

      if (
        modeCookie === "light" ||
        modeCookie === "dark" ||
        modeCookie === "system"
      ) {
        mode = modeCookie;
      }
      if (familyCookie) {
        family = familyCookie;
      }
    }
  } catch {
    // cookies() not available
  }

  const initial = resolveInitialTheme({
    themes: resolvedThemes,
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(family ? { family } : {}),
    mode,
    // The server cannot know the client's OS preference, so it resolves the
    // light theme when mode is "system". The client runtime receives the
    // "system" selection and creates the system binding, which resolves the
    // correct theme for the client's OS (prefers-color-scheme).
  });

  const cssVars = themeToCSSVariables(initial.theme);
  const themeMode = initial.selection.mode === "dark" ? "dark" : "light";
  const ssrStyle = { colorScheme: themeMode, ...cssVars } as CSSProperties;

  let darkStyle: ReactNode = null;
  if (initial.selection.mode === "system") {
    const dark = resolveSelectionTheme({
      themes: resolvedThemes,
      selection: { family: initial.selection.family, mode: "dark" },
    });
    const darkVariables = themeToCSSVariables(dark.theme);
    darkStyle = (
      <style
        dangerouslySetInnerHTML={{
          __html: darkModeCSSTemplate(darkVariables),
        }}
      />
    );
  }

  const ClientThemeProvider = (await import("./provider")).ClientThemeProvider;

  const themeCssMap: Record<string, Record<string, string>> = {};
  for (const themeItem of resolvedThemes) {
    const vars = themeToCSSVariables(themeItem);
    themeCssMap[String(themeItem.name)] = vars;
    if (themeItem.meta?.family && themeItem.meta?.mode) {
      themeCssMap[`${themeItem.meta.family}:${themeItem.meta.mode}`] = vars;
    }
  }

  // Default-family light/dark fallbacks so the blocking script can resolve
  // variables even when no family cookie exists (e.g. a first visit with a
  // system dark preference). Mirrors the Nuxt bootstrap's __default-* keys.
  const defaultLightTheme = resolveSelectionTheme({
    themes: resolvedThemes,
    selection: { family: initial.selection.family, mode: "light" },
  });
  const defaultDarkTheme = resolveSelectionTheme({
    themes: resolvedThemes,
    selection: { family: initial.selection.family, mode: "dark" },
  });
  themeCssMap["__default-light"] = themeToCSSVariables(defaultLightTheme.theme);
  themeCssMap["__default-dark"] = themeToCSSVariables(defaultDarkTheme.theme);

  const blockingScript = `(function(){try{function getCookie(name){var m=document.cookie.match(new RegExp('(^|; )'+name+'=([^;]+)'));return m?decodeURIComponent(m[2]):null}var mode=getCookie('theme-mode');var family=getCookie('theme-family');var fingerprint=getCookie('theme-fingerprint');var map=${JSON.stringify(
    themeCssMap,
  )};var hasMode=mode==='light'||mode==='dark'||mode==='system';var selMode=hasMode?mode:'system';var sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var effMode=selMode==='dark'||(selMode==='system'&&sysDark)?'dark':'light';var k=(family&&map[family+':'+effMode])?family+':'+effMode:'__default-'+effMode;var v=k?map[k]:map['__default-light'];if(effMode==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}if(v){for(var prop in v){document.documentElement.style.setProperty(prop,v[prop]);}}}catch(e){}})()`;

  const {
    className: bodyClassName,
    style: bodyStyle,
    ...bodyProps
  } = body ?? {};

  const bodyFontStyle: CSSProperties = font ? { fontFamily: font } : {};

  return (
    <html
      {...htmlProps}
      lang={lang}
      data-theme={String(initial.theme.name)}
      className={[
        className,
        themeMode === "dark" ? "dark" : "",
        scrollbar ? "tk-scrollbar" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...style, ...ssrStyle }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: blockingScript }} />
        {scrollbar && (
          <style
            data-theme-kit-pre-paint="scrollbar"
            dangerouslySetInnerHTML={{ __html: createPrePaintScrollbarCSS() }}
          />
        )}
        {darkStyle}
      </head>
      <body
        className={bodyClassName}
        style={{ ...bodyStyle, ...bodyFontStyle }}
        {...bodyProps}
      >
        <ClientThemeProvider
          themes={resolvedThemes}
          initial={initial}
          {...(defaultTheme !== undefined ? { defaultTheme } : {})}
          {...(transition !== undefined ? { transition } : {})}
          {...(scheduled !== undefined ? { scheduled } : {})}
        >
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
