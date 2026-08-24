import type { ThemeDefinition, ThemeMode } from "./theme";
import { getThemeFamily } from "./selection";

export interface ThemeSelection {
  family: string;
  mode: ThemeMode;
}

export function resolveSelectedTheme<T extends ThemeDefinition>(
  themes: readonly T[],
  selection: ThemeSelection,
): T {
  const exact = themes.find(
    (theme) =>
      getThemeFamily(theme) === selection.family &&
      theme.meta?.mode === selection.mode,
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

  return themes[0]!;
}
