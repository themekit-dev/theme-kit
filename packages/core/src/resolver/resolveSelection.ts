import type { ThemeDefinition, ThemeMode } from "../model/theme";
import { getThemeFamily, type ThemeSelectionState } from "../model";

export interface ResolveSelectionOptions<T extends ThemeDefinition> {
  themes: readonly T[];

  defaultTheme?: T["name"];

  initialMode?: ThemeMode;
  initialFamily?: string;

  persistedSelection?: ThemeSelectionState | null;
}

function getThemeMode(theme: ThemeDefinition): ThemeMode {
  const mode = theme.meta?.mode;

  return mode === "light" || mode === "dark" || mode === "system"
    ? mode
    : "light";
}

export function resolveSelection<T extends ThemeDefinition>(
  options: ResolveSelectionOptions<T>,
): ThemeSelectionState {
  const fallback =
    options.themes.find((theme) => theme.name === options.defaultTheme) ??
    options.themes[0];

  if (!fallback) {
    throw new Error("At least one theme must be provided.");
  }

  if (options.persistedSelection) {
    return options.persistedSelection;
  }

  return {
    family: options.initialFamily ?? getThemeFamily(fallback),

    mode: options.initialMode ?? getThemeMode(fallback),
  };
}
