import type { ThemeDefinition } from "../model/theme";
import type { ThemeSelectionState } from "../model";

import { resolveInitialTheme } from "./resolveInitialTheme";

export interface ResolveSelectionThemeOptions<T extends ThemeDefinition> {
  themes: readonly T[];
  selection: ThemeSelectionState;
  prefersDark?: boolean;
}

export interface SelectionThemeResolution<T extends ThemeDefinition> {
  theme: T;
  selection: ThemeSelectionState;
}

export function resolveSelectionTheme<T extends ThemeDefinition>(
  options: ResolveSelectionThemeOptions<T>,
): SelectionThemeResolution<T> {
  const resolution = resolveInitialTheme({
    themes: options.themes,
    family: options.selection.family,
    mode: options.selection.mode,
    ...(options.prefersDark !== undefined
      ? { prefersDark: options.prefersDark }
      : {}),
  });

  return {
    selection: resolution.selection,
    theme: resolution.theme,
  };
}
