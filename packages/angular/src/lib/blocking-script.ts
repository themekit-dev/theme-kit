import {
  resolveSelection,
  systemModeCSSTemplate,
  themeToCSSVariables,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";

/**
 * A map of flattened CSS variables for the light and dark themes.
 *
 * Each entry maps a CSS variable name (for example `--theme-color-primary`) to
 * its concrete value for that mode.
 *
 * @see {@link buildThemeCSSMap}
 */
export interface ThemeCSSMap {
  /** CSS variables for the light theme. */
  light: Record<string, string>;
  /** CSS variables for the dark theme. */
  dark: Record<string, string>;
}

/**
 * Flattens a theme's tokens into CSS custom properties.
 *
 * Delegates to core's {@link themeToCSSVariables} instead of flattening here.
 * The previous local implementation passed an empty prefix for the `colors`
 * group, so it emitted `--theme-background` while every consumer in the library
 * — core's runtime, the Tailwind preset, the adapters and the shipped examples
 * — reads `--theme-color-background`. The pre-paint script therefore wrote
 * variables nothing read, so a theme's colors only appeared once the client
 * runtime booted. It also skipped `borderWidths`, `zIndex`, `breakpoints`,
 * `typography` and `code`, and did not flatten `extends` chains.
 *
 * @param theme The theme whose tokens to flatten.
 * @returns A map of CSS custom property name → value.
 *
 * @see {@link buildThemeCSSMap}
 */
function themeToFlatCSS(theme: ThemeDefinition): Record<string, string> {
  return themeToCSSVariables(theme);
}

/**
 * Builds a {@link ThemeCSSMap} of flattened CSS variables from a list of
 * themes.
 *
 * Selects the light and dark themes of the first theme family and flattens
 * their tokens into CSS variables. Falls back to the first light/dark theme, or
 * the first theme, when a mode is not present.
 *
 * @param themes The theme definitions to build the map from.
 * @returns A {@link ThemeCSSMap} with light and dark CSS variables.
 *
 * @see {@link createBlockingScriptContent}
 */
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

/**
 * Fallback inputs for {@link createBlockingScriptContent}.
 *
 * These must match the options the client runtime is created with. The script
 * and the runtime each resolve the initial mode independently, so a value given
 * to one and not the other makes the script paint one theme and the runtime
 * correct it — a visible flash of the wrong theme.
 */
export interface BlockingScriptOptions {
  /**
   * Fallback mode used when no selection is persisted.
   *
   * @defaultValue The fallback theme's own mode — the mode
   * `resolveSelection` derives from `defaultTheme` (or from `themes[0]` when
   * `defaultTheme` is omitted). Pass `"system"` to follow
   * `prefers-color-scheme` instead, and pass the same value as `initialMode` to
   * `provideThemeKit`.
   */
  mode?: ThemeMode;

  /**
   * Theme name the fallback family and mode are derived from.
   *
   * Should match the `defaultTheme` given to `provideThemeKit`.
   */
  defaultTheme?: string;
}

/**
 * Generates the blocking bootstrap HTML (a critical CSS `<style>` and a
 * blocking `<script>`) that applies the theme before first paint.
 *
 * The script sets the theme mode and family attributes and toggles the `dark`
 * class. The critical `<style>` carries the CSS variables: a plain `:root` rule
 * when the resolved mode is concrete, or — when it is `"system"` — a
 * `prefers-color-scheme` block per scheme, so an OS-dark visitor is correct
 * with no JavaScript at all. The saved selection (from persistence) is honored
 * when provided.
 *
 * @param themes The theme definitions to emit CSS variables for.
 * @param savedSelection The persisted mode and theme family, if any.
 * @param options Fallback mode/family inputs. Must match the client runtime's
 * `initialMode`/`defaultTheme` so the two resolve the same theme.
 * @returns An HTML string containing the critical style and blocking script.
 *
 * @see {@link buildThemeCSSMap}
 * @see {@link BlockingScriptOptions}
 * @see `createThemeBootstrapScript`
 */
export function createBlockingScriptContent(
  themes: readonly ThemeDefinition[],
  savedSelection?: { mode: ThemeMode; family: string } | null,
  options: BlockingScriptOptions = {},
): string {
  const cssMap = buildThemeCSSMap(themes);

  // The fallback must be what the runtime resolves for the same registry.
  // Hardcoding `"system"` here did not: the runtime defaults to the fallback
  // theme's own mode, so a caller that omitted `savedSelection` produced a script
  // that disagreed with the runtime it was paired with — the script painted one
  // theme and the runtime corrected it. `options` exists so a caller that asked
  // the runtime for a non-default mode (notably `"system"`) can say so here too.
  const fallback = resolveSelection({
    themes,
    ...(options.defaultTheme !== undefined
      ? { defaultTheme: options.defaultTheme }
      : {}),
    ...(options.mode !== undefined ? { initialMode: options.mode } : {}),
  });

  const initialFamily = savedSelection?.family ?? fallback.family;
  const initialMode = savedSelection?.mode ?? fallback.mode;

  const lightVars = cssVarsToString(cssMap.light);
  const darkVars = cssVarsToString(cssMap.dark);

  // `"system"` is the only mode the server cannot resolve, so it is the only
  // one expressed with media queries. A CONCRETE mode must not use them: both
  // blocks target `:root`, so a `light` selection would still follow an OS-dark
  // visitor when the script is blocked. Emitting the resolved mode as a plain
  // `:root` rule keeps the two cases distinct.
  //
  // Both are emitted as a `<style>` element rather than as an inline `style`
  // attribute on `<html>`: two `:root` rules are resolved by source order,
  // whereas an inline declaration outranks every stylesheet rule and would
  // neutralise the dark block.
  const criticalCSS =
    initialMode === "system"
      ? systemModeCSSTemplate(cssMap.light, cssMap.dark)
      : `:root{${initialMode === "dark" ? darkVars : lightVars}}`;

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
    `<style id="theme-kit-critical">${criticalCSS}</style>`,
    `<script id="theme-kit-blocking">${script}</script>`,
  ].join("");
}
