import type { ThemeTokens } from "./model/tokens";

export type PresetFamily =
  | "neutral"
  | "oat"
  | "berry"
  | "mint"
  | "citrus"
  | "cocoa"
  | "plum"
  | "iris"
  | "sky"
  | "graphite";

export type PresetVariant = "light" | "dark";

export type PresetThemeName = `${PresetFamily}-${PresetVariant}`;

export interface PresetVariantOverride {
  tokens?: Partial<ThemeTokens>;
}

export type PresetOverrides = Partial<
  Record<PresetFamily, Partial<Record<PresetVariant, PresetVariantOverride>>>
>;

export function mergePresetTokens(
  base: ThemeTokens,
  override?: Partial<ThemeTokens>,
): ThemeTokens {
  return {
    ...base,
    ...override,
    colors: {
      ...base.colors,
      ...override?.colors,
    },
    spacing: {
      ...base.spacing,
      ...override?.spacing,
    },
    radius: {
      ...base.radius,
      ...override?.radius,
    },
    shadows: {
      ...base.shadows,
      ...override?.shadows,
    },
    borderWidths: {
      ...base.borderWidths,
      ...override?.borderWidths,
    },
    zIndex: {
      ...base.zIndex,
      ...override?.zIndex,
    },
    breakpoints: {
      ...base.breakpoints,
      ...override?.breakpoints,
    },
    typography: {
      ...base.typography,
      ...override?.typography,
    },
  };
}
