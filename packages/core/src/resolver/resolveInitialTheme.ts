import type { ThemeDefinition, ThemeMode } from "../model/theme";
import { type ThemeSelectionState } from "../model";

import { resolveSelection } from "./resolveSelection";
import { resolveSelectedTheme } from "../model";

/**
 * Options for resolving the initial theme of a runtime.
 */
export interface ResolveInitialThemeOptions<T extends ThemeDefinition> {
  /** Registered themes to resolve within. */
  themes: readonly T[];

  /** Theme name to prefer when no family/mode selection is given. */
  defaultTheme?: T["name"];

  /** Initial family. Defaults to the fallback theme's family. */
  family?: string;

  /** Initial mode. `"system"` is resolved via `prefersDark`. */
  mode?: ThemeMode;

  /** Whether the visitor prefers dark mode. Used only when `mode` is
   *  `"system"`. */
  prefersDark?: boolean;
}

/**
 * The result of initial theme resolution: the resolved theme plus the
 * resolved selection state.
 */
export interface InitialThemeResolution<T extends ThemeDefinition> {
  /** The theme to activate. */
  theme: T;
  /** The resolved selection (family + mode). */
  selection: ThemeSelectionState;
}

/**
 * Resolves the initial theme and selection for a runtime bootstrap.
 *
 * Combines `defaultTheme`, `family`, `mode`, and `prefersDark` into a
 * concrete theme, resolving `"system"` mode against `prefersDark` for the
 * theme lookup while keeping the `"system"` mode in the returned selection.
 *
 * @param options Resolution inputs.
 * @returns The resolved theme and selection.
 * @see {@link resolveSelection}
 * @see {@link resolveThemeName}
 */
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
