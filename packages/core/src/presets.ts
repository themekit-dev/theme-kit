import type { ThemeTokens } from "./model/tokens";

/**
 * The name of a preset theme family.
 */
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

/**
 * The color mode of a preset theme.
 */
export type PresetVariant = "light" | "dark";

/**
 * The full name of a preset theme, e.g. `"oat-light"`.
 */
export type PresetThemeName = `${PresetFamily}-${PresetVariant}`;

/**
 * Token overrides applied to a single preset theme mode.
 */
export interface PresetVariantOverride {
  /** Partial token groups merged over the preset's base tokens. */
  tokens?: Partial<ThemeTokens>;
}

/**
 * Per-family, per-mode token overrides for the preset theme set.
 */
export type PresetOverrides = Partial<
  Record<PresetFamily, Partial<Record<PresetVariant, PresetVariantOverride>>>
>;

/**
 * Merge a partial token override into a base token set.
 *
 * Each token group is merged shallowly, so override values replace individual
 * keys while leaving unspecified keys from the base intact.
 *
 * @param base The base token set.
 * @param override Optional partial token groups to merge on top.
 * @returns A new token set combining `base` and `override`.
 */
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
