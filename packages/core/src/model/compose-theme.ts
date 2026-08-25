import type { ThemeDefinition, ThemeName } from "./theme";
import { mergeThemeDefinitions } from "./resolve-theme-definition";

/**
 * Compose a theme by layering multiple sources (e.g. a family theme, a
 *    mode override, and local tokens), later sources winning.
 */
export function composeTheme<TName extends string>(
  name: TName,
  ...sources: ThemeDefinition[]
): ThemeDefinition<TName> {
  if (sources.length === 0) {
    return { name };
  }

  const [first, ...rest] = sources as [ThemeDefinition, ...ThemeDefinition[]];

  let result: ThemeDefinition = {
    name: first.name,
  };

  result = mergeThemeDefinitions(result, first);

  for (const source of rest) {
    result = mergeThemeDefinitions(result, source);
  }

  const output: ThemeDefinition<TName> = {
    name,
  };

  if (result.meta) {
    output.meta = result.meta;
  }
  if (result.tokens) {
    output.tokens = result.tokens;
  }

  return output;
}
