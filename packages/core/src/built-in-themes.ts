import { getNeutralThemes } from "./neutral-themes";
import { getPresetThemes } from "./preset-themes";
import { getBrandPresets } from "./brand-presets";
import { getAccessibilityProfiles } from "./accessibility-profiles";

/**
 * Build the complete set of built-in themes shipped with Theme Kit.
 *
 * Combines the neutral themes, preset themes, brand presets, and accessibility
 * profiles into a single array ready to be registered with a theme runtime.
 *
 * @returns An array of all built-in theme definitions.
 */
export function getBuiltInThemes() {
  return [
    ...getNeutralThemes(),
    ...getPresetThemes(),
    ...getBrandPresets(),
    ...getAccessibilityProfiles(),
  ];
}
