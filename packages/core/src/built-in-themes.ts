import { getNeutralThemes } from "./neutral-themes";
import { getPresetThemes } from "./preset-themes";
import { getBrandPresets } from "./brand-presets";
import { getAccessibilityProfiles } from "./accessibility-profiles";

export function getBuiltInThemes() {
  return [
    ...getNeutralThemes(),
    ...getPresetThemes(),
    ...getBrandPresets(),
    ...getAccessibilityProfiles(),
  ];
}
