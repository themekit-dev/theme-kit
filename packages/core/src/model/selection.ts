import type { ThemeDefinition, ThemeMode, ThemeName } from "./theme";

/**
 * The active selection: a family plus a color-mode.
 *
 * Persistence adapters serialize this exact shape, so the fields are part
 * of the storage contract.
 *
 * @see {@link createThemeModeController}
 */
export interface ThemeSelectionState {
  /**
   * Selected theme family. Themes without `meta.family` belong to the
   * `"default"` family.
   */
  family: string;
  /**
   * Selected color mode. `"system"` tracks the visitor's
   * `prefers-color-scheme` preference.
   */
  mode: ThemeMode;
}

/**
 * Get a theme's family. Themes without `meta.family` belong to the
 * `"default"` family.
 *
 * @see {@link resolveThemeName}
 */
export function getThemeFamily(theme: ThemeDefinition): string {
  return theme.meta?.family ?? "default";
}

/**
 * Every family registered in a theme list, in registration order.
 *
 * @param themes - The registry to read.
 * @returns The distinct families, each appearing once.
 *
 * @internal — shared invariant helper, not part of the public API.
 */
export function getThemeFamilies(themes: readonly ThemeDefinition[]): string[] {
  const families: string[] = [];
  for (const theme of themes) {
    const family = getThemeFamily(theme);
    if (!families.includes(family)) families.push(family);
  }
  return families;
}

/**
 * Resolves a requested family to one that is actually registered.
 *
 * @param themes - The registry to validate against.
 * @param requested - The family that was asked for (a prop, a cookie, a
 *   persisted selection). Empty, `null` and `undefined` all mean "not
 *   specified".
 * @param fallbackTheme - The theme whose family is used when `requested` is not
 *   registered. Defaults to the first theme.
 * @returns A family that exists in `themes`, or `"default"` for an empty
 *   registry.
 *
 * @remarks
 * A family that is not in the registry must never survive into
 * {@link ThemeSelectionState}. It matches no theme, so every downstream lookup
 * silently falls back to `themes[0]` — while the selection keeps naming a family
 * that is not on screen. Anything that renders the selection (a
 * `data-tk-readout="family"` element, `data-theme-selection-family`) then shows
 * a value that contradicts the theme actually applied, and the server and the
 * browser can disagree about it, which is a visible correction on load.
 *
 * This covers two cases that look different but are the same defect: a family
 * that was never registered, and one that *was* registered and has since been
 * removed from the registry — a stale cookie or `localStorage` entry from
 * before the app changed its family set.
 *
 * @internal — shared invariant helper, not part of the public API.
 */
export function normalizeThemeFamily(
  themes: readonly ThemeDefinition[],
  requested: string | null | undefined,
  fallbackTheme?: ThemeDefinition,
): string {
  if (requested && getThemeFamilies(themes).includes(requested)) {
    return requested;
  }

  const fallback = fallbackTheme ?? themes[0];
  return fallback ? getThemeFamily(fallback) : requested || "default";
}

/**
 * Get the color mode of a theme. Uses `meta.mode` when present; otherwise
 * infers it from the theme name (e.g. `"mint-dark"` → "dark"). This keeps
 * simple theme definitions working:
 * `[{ name: "light", ... }, { name: "dark", ... }]` resolve and toggle
 * correctly without requiring `meta.mode`.
 *
 * @see {@link resolveThemeName}
 */
export function getThemeMode(theme: ThemeDefinition): ThemeMode {
  const mode = theme.meta?.mode;
  if (mode === "light" || mode === "dark" || mode === "system") return mode;
  return /dark/i.test(theme.name) ? "dark" : "light";
}

/**
 * Resolve the theme name that best matches a family + mode selection.
 *
 * Looks up the theme in `family` whose mode matches the requested mode,
 * honoring `prefersDark` when `mode` is `"system"`. Falls back to the
 * family's light theme, then the family's first theme, then the first
 * theme overall.
 *
 * @param themes Registered themes to search.
 * @param family Family to resolve within.
 * @param mode Requested mode; `"system"` resolves via `prefersDark`.
 * @param prefersDark Whether the visitor prefers dark mode. Used only when
 *   `mode` is `"system"`. Default `false`.
 * @returns The resolved theme name.
 * @throws {Error} When `themes` is empty.
 *
 * @see {@link getThemeFamily}
 * @see {@link getThemeMode}
 * @see {@link resolveSelectedTheme}
 */
export function resolveThemeName<Name extends ThemeName>(
  themes: readonly ThemeDefinition<Name>[],
  family: string,
  mode: ThemeMode,
  prefersDark = false,
): Name {
  const wantedMode =
    mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const familyThemes = themes.filter(
    (theme) => getThemeFamily(theme) === family,
  );

  const exact = familyThemes.find(
    (theme) => getThemeMode(theme) === wantedMode,
  );

  const fallback =
    familyThemes.find((theme) => getThemeMode(theme) === "light") ??
    familyThemes[0] ??
    themes[0];

  if (!fallback) {
    throw new Error("At least one theme must be provided.");
  }

  return (exact?.name ?? fallback.name) as Name;
}
