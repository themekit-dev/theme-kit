import type { ThemeDefinition, ThemeMode } from "./theme";
import { getThemeFamily, getThemeMode } from "./selection";

export interface ThemeSelection {
  family: string;
  mode: ThemeMode;
}

/**
 * Resolve the registered theme that best matches a selection.
 *
 * Prefers an exact family + mode match, then any theme in the family, then any
 * theme of the requested mode, then the first registered theme. Never throws;
 * the fallback chain guarantees a result for non-empty theme lists.
 *
 * @param themes Registered themes to search.
 * @param selection The family + mode selection to match.
 * @returns The selected theme definition.
 * @see {@link resolveThemeName}
 * @see {@link ThemeSelection}
 */
export function resolveSelectedTheme<T extends ThemeDefinition>(
  themes: readonly T[],
  selection: ThemeSelection,
): T {
  const exact = themes.find(
    (theme) =>
      getThemeFamily(theme) === selection.family &&
      getThemeMode(theme) === selection.mode,
  );

  if (exact) {
    return exact;
  }

  const familyFallback = themes.find(
    (theme) => getThemeFamily(theme) === selection.family,
  );

  if (familyFallback) {
    return familyFallback;
  }

  // The family is unknown. Honour the requested mode before giving up: jumping
  // straight to `themes[0]` hands back whatever is registered first — a light
  // theme for a `"dark"` request — which turns an unknown family into a
  // *wrong-theme* first paint rather than merely a different one. That is how a
  // missing `theme-family` cookie (read as `""`, which matches no theme) used to
  // paint light for an OS-dark visitor on every SSR surface.
  const modeFallback = themes.find(
    (theme) => getThemeMode(theme) === selection.mode,
  );

  return modeFallback ?? themes[0]!;
}
