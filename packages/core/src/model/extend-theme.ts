import type { ThemeDefinition, ThemeName } from "./theme";
import type { ThemeMeta } from "./meta";
import type { ThemeTokens, ThemeColors } from "./tokens";

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type TokenOverrides = {
  colors?: DeepPartial<ThemeColors>;
  spacing?: Record<string, string>;
  radius?: Record<string, string>;
  shadows?: Record<string, string>;
  typography?: DeepPartial<NonNullable<ThemeTokens["typography"]>>;
};

function toTokens(overrides: TokenOverrides): ThemeTokens | undefined {
  const tokens: ThemeTokens = {};

  if (overrides.colors) {
    tokens.colors = overrides.colors as ThemeColors;
  }
  if (overrides.spacing) {
    tokens.spacing = overrides.spacing;
  }
  if (overrides.radius) {
    tokens.radius = overrides.radius;
  }
  if (overrides.shadows) {
    tokens.shadows = overrides.shadows;
  }
  if (overrides.typography) {
    tokens.typography = overrides.typography as NonNullable<ThemeTokens["typography"]>;
  }

  return Object.keys(tokens).length > 0 ? tokens : undefined;
}

export function extendTheme<TName extends string, TBase extends ThemeDefinition>(
  name: TName,
  base: TBase,
  overrides?: TokenOverrides & { meta?: Partial<ThemeMeta> },
): ThemeDefinition<TName> {
  const result: ThemeDefinition<TName> = {
    name,
    extends: base.name as TName,
  };

  if (overrides?.meta) {
    result.meta = { ...base.meta, ...overrides.meta };
  }

  const tokens = overrides ? toTokens(overrides) : undefined;
  if (tokens) {
    result.tokens = tokens;
  }

  return result;
}
