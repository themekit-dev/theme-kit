import { getBuiltInThemes } from "../../built-in-themes";
import type { ThemeDefinition } from "../../model/theme";

export interface ThemeRegistryOptions<T extends ThemeDefinition> {
  themes?: readonly T[];
}

/**
 * Resolves the theme registry used by every theme entry point.
 *
 * Explicit themes replace the built-in registry. Supplying an empty array has
 * the same meaning as omitting the option and falls back to built-in themes.
 */
export function resolveThemeRegistry<T extends ThemeDefinition>(
  options: ThemeRegistryOptions<T> = {},
): readonly T[] {
  if (options.themes?.length) {
    return options.themes;
  }

  return getBuiltInThemes() as unknown as readonly T[];
}
