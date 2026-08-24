import type { ThemeDefinition, ThemeName } from "./theme";
import type { ThemeMeta } from "./meta";
import type { ThemeTokens, ThemeColors } from "./tokens";
import { resolveTokens } from "../resolve";

function mergeObjects<T extends object>(
  base: T | undefined,
  override: T | undefined,
): T | undefined {
  if (!base && !override) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(override ?? {}),
  } as T;
}

function mergeThemeColors(
  base: ThemeColors | undefined,
  override: ThemeColors | undefined,
): ThemeColors | undefined {
  const colors: ThemeColors = {};
  const allKeys = new Set([
    ...Object.keys(base ?? {}),
    ...Object.keys(override ?? {}),
  ]);

  for (const key of allKeys) {
    const baseVal = base?.[key];
    const overVal = override?.[key];

    if (overVal !== undefined) {
      if (typeof overVal === "object" && overVal !== null) {
        if (typeof baseVal === "object" && baseVal !== null) {
          const merged = mergeThemeColors(baseVal as ThemeColors, overVal as ThemeColors);
          if (merged !== undefined) {
            colors[key] = merged;
          }
        } else {
          colors[key] = overVal as ThemeColors;
        }
      } else if (typeof overVal === "string") {
        colors[key] = overVal;
      }
    } else if (baseVal !== undefined) {
      colors[key] = baseVal;
    }
  }

  return Object.keys(colors).length > 0 ? colors : undefined;
}

export function mergeTokens(
  base: ThemeTokens | undefined,
  override: ThemeTokens | undefined,
): ThemeTokens | undefined {
  if (!base && !override) {
    return undefined;
  }

  const tokens: ThemeTokens = {};

  const colors = mergeThemeColors(base?.colors, override?.colors);
  if (colors) {
    tokens.colors = colors;
  }

  const spacing = mergeObjects(base?.spacing, override?.spacing);
  if (spacing) {
    tokens.spacing = spacing;
  }

  const radius = mergeObjects(base?.radius, override?.radius);
  if (radius) {
    tokens.radius = radius;
  }

  const shadows = mergeObjects(base?.shadows, override?.shadows);
  if (shadows) {
    tokens.shadows = shadows;
  }

  const borderWidths = mergeObjects(base?.borderWidths, override?.borderWidths);
  if (borderWidths) {
    tokens.borderWidths = borderWidths;
  }

  const zIndex = mergeObjects(base?.zIndex, override?.zIndex);
  if (zIndex) {
    tokens.zIndex = zIndex;
  }

  const breakpoints = mergeObjects(base?.breakpoints, override?.breakpoints);
  if (breakpoints) {
    tokens.breakpoints = breakpoints;
  }

  const typography = mergeObjects(base?.typography, override?.typography);
  if (typography) {
    tokens.typography = typography;
  }

  const code = mergeObjects(base?.code, override?.code);
  if (code) {
    tokens.code = code as NonNullable<ThemeTokens["code"]>;
  }

  return Object.keys(tokens).length > 0 ? tokens : undefined;
}

export function mergeThemeDefinitions<Name extends ThemeName>(
  base: ThemeDefinition<Name>,
  override: ThemeDefinition<Name>,
): ThemeDefinition<Name> {
  const result: ThemeDefinition<Name> = {
    ...base,
    ...override,
  };

  const meta = mergeObjects(base.meta, override.meta);
  if (meta) {
    result.meta = meta;
  }

  const tokens = mergeTokens(base.tokens, override.tokens);
  if (tokens) {
    result.tokens = tokens;
  }

  return result;
}

function resolveThemeRecursive<Name extends ThemeName>(
  themes: readonly ThemeDefinition<Name>[],
  themeName: Name,
  visited: Set<Name>,
): ThemeDefinition<Name> {
  if (visited.has(themeName)) {
    throw new Error(
      `Circular theme inheritance detected while resolving "${String(themeName)}".`,
    );
  }

  visited.add(themeName);

  const theme = themes.find((item) => item.name === themeName);

  if (!theme) {
    throw new Error(`Theme "${String(themeName)}" is not registered.`);
  }

  const parents = Array.isArray(theme.extends)
    ? theme.extends
    : theme.extends
      ? [theme.extends]
      : [];

  if (parents.length === 0) {
    visited.delete(themeName);
    return theme;
  }

  const [firstParent, ...remainingParents] = parents;

  let resolvedParents = resolveThemeRecursive(
    themes,
    firstParent,
    new Set(visited),
  );

  for (const parentName of remainingParents) {
    resolvedParents = mergeThemeDefinitions(
      resolvedParents,
      resolveThemeRecursive(themes, parentName, new Set(visited)),
    );
  }

  visited.delete(themeName);

  return mergeThemeDefinitions(resolvedParents, theme);
}

export function resolveTheme<Name extends ThemeName>(
  themes: readonly ThemeDefinition<Name>[],
  themeName: Name,
  resolveTokenRefs: boolean = true,
): ThemeDefinition<Name> {
  const theme = resolveThemeRecursive(themes, themeName, new Set<Name>());

  if (resolveTokenRefs && theme.tokens) {
    return { ...theme, tokens: resolveTokens(theme.tokens) };
  }

  return theme;
}
