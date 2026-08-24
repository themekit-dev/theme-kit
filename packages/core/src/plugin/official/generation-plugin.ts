import type { ThemeDefinition } from "../../model/theme";
import type { ThemeTokens } from "../../model/tokens";
import type { ThemePlugin } from "../types";
import { generateTheme, type GenerateThemeOptions } from "../../generate-theme";

export interface GenerationPluginOptions {
  onGenerate?: (options: GenerateThemeOptions) => void;
}

export function createGenerationPlugin<T extends ThemeDefinition>(
  options?: GenerationPluginOptions,
): ThemePlugin<T> {
  return {
    name: "theme-generation",
    version: "1.0.0",
    priority: 30,

    transformTokens(tokens, _context) {
      return tokens;
    },
  };
}
