import type { ThemeDefinition } from "../../model/theme";
import type { ThemeTokens } from "../../model/tokens";
import type { ThemePlugin } from "../types";
import { generateTheme, type GenerateThemeOptions } from "../../generate-theme";

/**
 * Options for {@link createGenerationPlugin}.
 */
export interface GenerationPluginOptions {
  /** Callback invoked with the options used to generate a theme. */
  onGenerate?: (options: GenerateThemeOptions) => void;
}

/**
 * Creates a plugin that participates in theme generation.
 *
 * The plugin registers a token transform hook that runs during theme
 * application, allowing generated themes to be observed or adjusted.
 *
 * @param options - Generation configuration.
 * @returns A `"theme-generation"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createGenerationPlugin({ onGenerate: (opts) => track(opts) }));
 * ```
 *
 * @see {@link GenerationPluginOptions}
 */
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
