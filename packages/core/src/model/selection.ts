import type { ThemeDefinition, ThemeMode, ThemeName } from "./theme";

export interface ThemeSelectionState {
  family: string;
  mode: ThemeMode;
}

export function getThemeFamily(theme: ThemeDefinition): string {
  return theme.meta?.family ?? "default";
}

/**
 * The color mode of a theme. Uses `meta.mode` when present; otherwise infers
 * it from the theme name (e.g. `"mint-dark"` → "dark"). This keeps simple
 * theme definitions working: `[{ name: "light", ... }, { name: "dark", ... }]`
 * resolve and toggle correctly without requiring `meta.mode`.
 */
export function getThemeMode(theme: ThemeDefinition): ThemeMode {
  const mode = theme.meta?.mode;
  if (mode === "light" || mode === "dark" || mode === "system") return mode;
  return /dark/i.test(theme.name) ? "dark" : "light";
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
