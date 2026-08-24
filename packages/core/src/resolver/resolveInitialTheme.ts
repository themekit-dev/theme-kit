import type { ThemeDefinition, ThemeMode } from "../model/theme";
import { type ThemeSelectionState } from "../model";

import { resolveSelection } from "./resolveSelection";
import { resolveSelectedTheme } from "../model";

export interface ResolveInitialThemeOptions<T extends ThemeDefinition> {
  themes: readonly T[];
  defaultTheme?: T["name"];

  family?: string;
  mode?: ThemeMode;

  prefersDark?: boolean;
}

export interface InitialThemeResolution<T extends ThemeDefinition> {
  theme: T;
  selection: ThemeSelectionState;
}

export function resolveInitialTheme<T extends ThemeDefinition>(
  options: ResolveInitialThemeOptions<T>,
): InitialThemeResolution<T> {
  const selection = resolveSelection({
    themes: options.themes,

    ...(options.defaultTheme !== undefined
      ? { defaultTheme: options.defaultTheme }
      : {}),

    ...(options.family !== undefined ? { initialFamily: options.family } : {}),

    ...(options.mode !== undefined ? { initialMode: options.mode } : {}),
  });

  const effectiveMode: ThemeMode =
    selection.mode === "system"
      ? options.prefersDark
        ? "dark"
        : "light"
      : selection.mode;

  const theme = resolveSelectedTheme(options.themes, {
    ...selection,
    mode: effectiveMode,
  });

  return {
    theme,
    selection,
  };
}
