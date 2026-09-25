import type { ThemeDefinition } from "../model/theme";
import type { ThemeSelectionState } from "../model";

import { resolveInitialTheme } from "./resolveInitialTheme";

/**
 * Options for resolving the theme for an existing selection.
 */
export interface ResolveSelectionThemeOptions<T extends ThemeDefinition> {
  /** Registered themes to resolve within. */
  themes: readonly T[];
  /** The selection (family + mode) to resolve a theme for. */
  selection: ThemeSelectionState;
  /** Whether the visitor prefers dark mode. Used only when the selection
   *  mode is `"system"`. */
  prefersDark?: boolean;
}

/**
 * The result of selection-theme resolution.
 */
export interface SelectionThemeResolution<T extends ThemeDefinition> {
  /** The theme matching the selection. */
  theme: T;
  /** The (possibly normalized) selection. */
  selection: ThemeSelectionState;
}

/**
 * Resolves the theme that matches an existing selection state.
 *
 * Convenience wrapper around {@link resolveInitialTheme} for the common
 * case of re-applying a persisted or scoped selection.
 *
 * @param options Resolution inputs.
 * @returns The matching theme and the normalized selection.
 * @see {@link resolveSelection}
 * @see {@link resolveSelectedTheme}
 */
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
