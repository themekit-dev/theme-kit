import type { ThemeDefinition, ThemeMode, ThemeName } from "./theme";

export interface ThemeSelectionState {
  family: string;
  mode: ThemeMode;
}

export function getThemeFamily(theme: ThemeDefinition): string {
  return theme.meta?.family ?? "default";
}

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

  const exact = familyThemes.find((theme) => theme.meta?.mode === wantedMode);

  const fallback =
    familyThemes.find((theme) => theme.meta?.mode === "light") ??
    familyThemes[0] ??
    themes[0];

  if (!fallback) {
    throw new Error("At least one theme must be provided.");
  }

  return (exact?.name ?? fallback.name) as Name;
}
