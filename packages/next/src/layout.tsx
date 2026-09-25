import React, {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import {
  buildBootstrapPlan,
  createPrePaintScrollbarCSS,
  getBuiltInThemes,
  resolveInitialTheme,
  resolveSelectionTheme,
  serializeThemeBootstrapScript,
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
 *
 * @see {@link ThemeProvider}
 */
export interface ThemeProviderHtmlProps extends Omit<
  HTMLAttributes<HTMLHtmlElement>,
  "children" | "lang" | "className" | "style"
> {
  /** Extra classes merged onto the `<html>` element alongside the theme output. */
  className?: string;
  /** Inline styles merged onto the `<html>` element alongside the theme output. */
  style?: CSSProperties;
}

/**
 * Attributes forwarded to the rendered `<body>` element. `className` and
 * `style` are merged with the theme's SSR output (the resolved font family is
 * applied to the body) rather than replaced.
 *
 * @see {@link ThemeProvider}
 */
export interface ThemeProviderBodyProps extends Omit<
  HTMLAttributes<HTMLBodyElement>,
  "children" | "className" | "style"
> {
  /** Extra classes merged onto the `<body>` element alongside the theme output. */
  className?: string;
  /** Inline styles merged onto the `<body>` element alongside the theme output. */
  style?: CSSProperties;
}

/**
 * Props for the App Router `ThemeProvider`. Renders the `<html>` and `<body>`
 * elements, applies the SSR-resolved theme (zero-flash), and mounts the client
 * runtime inside the body.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { ThemeProvider } from "@theme-kit/next";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ThemeProvider defaultTheme="light" font="Inter, sans-serif">
 *       {children}
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @see `createThemeRuntime`
 * @see {@link ThemeProvider}
 * @see {@link ThemeProviderBodyProps}
 */
export interface ThemeProviderProps<
  T extends ThemeDefinition,
> extends ThemeProviderHtmlProps {
  /** The application content rendered inside the `<body>` element. */
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
   * paint — no native-scrollbar flash, no gap while the bundle hydrates.
   *
   * `true` builds the pre-paint overlay with defaults; pass
   * `PrePaintScrollbarOptions` to customize it. The server emits the overlay
   * `tk-scrollbar` class on `<html>` plus a blocking `<style>` (via
   * `createPrePaintScrollbarCSS`) so the native scrollbar is hidden from the
   * very first paint — no flash and no hydration mismatch. When your
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

/**
 * App Router theme provider. Must be used in the root layout: it renders the
 * `<html>` and `<body>` elements, resolves the initial theme server-side from
 * the persisted cookies (zero-flash), emits a blocking bootstrap script plus
 * the SSR CSS variables, and mounts the client runtime inside the body.
 *
 * The server cannot know the client's OS preference, so a `"system"` selection
 * is resolved to the light theme for SSR; the client runtime receives the
 * `"system"` selection and creates the system binding, which resolves the
 * correct theme for the client's OS via `prefers-color-scheme`.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param props - The provider props (see {@link ThemeProviderProps}).
 * @returns The themed `<html>`/`<body>` tree wrapping the application content.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { ThemeProvider } from "@theme-kit/next";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ThemeProvider defaultTheme="light" scrollbar>
 *       {children}
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @remarks
 * Because this component renders the document shell, it must be the root of
 * the App Router layout tree. `body` props are forwarded to the `<body>`
 * element; `className`/`style` are merged with the theme's SSR output.
 *
 * @see {@link ThemeProviderProps}
 * @see {@link ThemeProviderBodyProps}
 * @see {@link ThemeProviderHtmlProps}
 * @see `useThemeRuntime`
 */
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

  // The persisted selection, if any. Both `resolveInitialTheme` below and
  // `buildBootstrapPlan` further down are given exactly these two values, so the
  // theme the server renders and the selection the blocking script publishes
  // cannot disagree. Leaving the default at a concrete mode here — it used to be
  // `"system"` — made the server resolve `"system"` while the script derived its
  // fallback from `defaultTheme`, and the two halves of the zero-flash contract
  // then reported different selections for a first-time visitor.
  let mode: ThemeMode | undefined;
  let family: string | undefined;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const savedFingerprint = cookieStore.get("theme-fingerprint")?.value;

    // Trust the persisted selection when the fingerprint is absent (there is
    // nothing to invalidate) or when it matches. A *present but stale*
    // fingerprint is still rejected — that is what invalidates a selection made
    // against a different theme registry.
    //
    // The absent case must not be treated as a mismatch: the blocking script's
    // guard is `if (fp && fp !== F)`, so a browser holding `theme-mode` without
    // the fingerprint cookie has the script honour it. Rejecting it here would
    // make the server render the default theme while the script painted the
    // persisted one — the two halves of the zero-flash contract disagreeing,
    // which surfaces as a hydration mismatch. Keeping the rules identical means
    // they cannot drift apart.
    if (savedFingerprint === undefined || savedFingerprint === currentFingerprint) {
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
    ...(family !== undefined ? { family } : {}),
    ...(mode !== undefined ? { mode } : {}),
    // The server cannot know the client's OS preference, so it resolves the
    // light theme when mode is "system". The client runtime receives the
    // "system" selection and creates the system binding, which resolves the
    // correct theme for the client's OS (prefers-color-scheme).
  });

  const cssVars = themeToCSSVariables(initial.theme);
  const themeMode = initial.selection.mode === "dark" ? "dark" : "light";
  const ssrStyle = { colorScheme: themeMode, ...cssVars } as CSSProperties;

  // The family of the *resolved* theme — the same value the DOM adapter writes
  // to `data-theme-family` (see `@theme-kit/core`'s DOM effects) and the same
  // one the blocking script recomputes in the browser. Deriving it from the
  // resolved theme rather than `initial.selection.family` matters: a persisted
  // family that no longer exists in the registry survives in the selection but
  // resolves to a different theme, and the script follows the resolved one.
  const resolvedFamily = initial.theme.meta?.family;

  // What the script writes to `data-theme-selection-family`: the persisted
  // selection's family, falling back to the resolved one. It is a separate
  // attribute from `data-theme-family` because the selection survives a family
  // that no longer resolves.
  const selectionFamily = initial.selection.family ?? resolvedFamily;

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

  // The plan must be built from the same inputs the server resolved `initial`
  // with. `buildBootstrapPlan` derives the script's fallback selection from its
  // own `resolveInitialTheme` call, and the script publishes that selection as
  // `data-theme-selection-mode` — which the client runtime then adopts. Leaving
  // `initialMode` out here made the script fall back to a mode derived from
  // `defaultTheme` (`"light"`) while the server resolved `"system"`, so a
  // first-time visitor's selection was downgraded from `"system"` to `"light"`
  // and the OS binding was never created. It also made the two halves of the
  // zero-flash contract disagree about the selection.
  const bootstrapPlan = buildBootstrapPlan(resolvedThemes, {
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(mode !== undefined ? { initialMode: mode } : {}),
    ...(family !== undefined ? { initialFamily: family } : {}),
  });

  const blockingScript = serializeThemeBootstrapScript(
    bootstrapPlan,
    {
      kind: "cookies",
      names: {
        mode: "theme-mode",
        family: "theme-family",
        fingerprint: "theme-fingerprint",
      },
    },
    { fingerprint: currentFingerprint },
  );

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
      data-theme-mode={themeMode}
      data-theme-family={resolvedFamily ? String(resolvedFamily) : undefined}
      // Everything below is written onto <html> by the blocking bootstrap
      // script before React hydrates, so the server has to declare it too.
      // React's hydration diff treats an attribute that exists in the DOM but
      // not in the client props as a mismatch, and it reports the whole element
      // — which is why a server that stayed silent about any of these warned on
      // every page load in development.
      //
      // `data-theme-mode` above is the *resolved* mode; the selection is the
      // visitor's actual choice, which the resolved mode cannot recover (a
      // `"system"` selection is resolved to `"light"`/`"dark"` before it is
      // written). `data-theme-ready` is the script's completion marker and the
      // gate a client runtime uses before adopting bootstrap state.
      data-theme-selection-mode={String(initial.selection.mode)}
      data-theme-selection-family={
        selectionFamily ? String(selectionFamily) : undefined
      }
      data-theme-ready="true"
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
