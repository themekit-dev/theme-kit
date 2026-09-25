import type { ThemeDefinition, ThemeMode } from "../model/theme";
import {
  getThemeMode,
  normalizeThemeFamily,
  type ThemeSelectionState,
} from "../model";

/**
 * Options for resolving a selection state.
 */
export interface ResolveSelectionOptions<T extends ThemeDefinition> {
  /** Registered themes to resolve within. */
  themes: readonly T[];

  /** Theme name to prefer when nothing else is given. */
  defaultTheme?: T["name"];

  /** Initial mode. Defaults to the fallback theme's mode. */
  initialMode?: ThemeMode;

  /** Initial family. Defaults to the fallback theme's family. */
  initialFamily?: string;

  /** A persisted selection that wins over the other inputs when present. */
  persistedSelection?: ThemeSelectionState | null;
}

/**
 * Resolves a selection state from configuration inputs.
 *
 * Priority: `persistedSelection` wins; otherwise the resolved family/mode
 * default to the fallback theme's own family/mode. The fallback theme is
 * `defaultTheme` when provided and registered, else the first theme.
 *
 * The returned family is always one that exists in `themes`: a requested or
 * persisted family that is not registered is replaced by the fallback theme's
 * family. See {@link normalizeThemeFamily} for why that invariant matters.
 *
 * @param options Resolution inputs.
 * @returns The resolved selection (family + mode).
 * @throws {Error} When `themes` is empty.
 * @see {@link resolveInitialTheme}
 * @see {@link resolveSelectionTheme}
 */
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
    return {
      family: normalizeThemeFamily(
        options.themes,
        options.persistedSelection.family,
        fallback,
      ),
      mode: options.persistedSelection.mode,
    };
  }

  // An empty family means "not specified", exactly like omitting it — `??` only
  // catches null/undefined, so an `initialFamily` of `""` (what a cookie read
  // yields for a missing cookie on some adapters) would otherwise survive into
  // the selection. `normalizeThemeFamily` handles that and the stronger case: a
  // family that is not registered at all, which would match no theme, drag
  // every downstream lookup to the `themes[0]` fallback, and leave the selection
  // naming a family that is not on screen.
  return {
    family: normalizeThemeFamily(options.themes, options.initialFamily, fallback),

    mode: options.initialMode ?? getThemeMode(fallback),
  };
}
