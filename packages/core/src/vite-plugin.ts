import type { ThemeDefinition, ThemeMode } from "./model/theme";
import { createThemeBootstrapScript } from "./bootstrap";

export interface ThemeKitVitePluginOptions<T extends ThemeDefinition> {
  /** The theme definitions registered with the runtime. */
  themes: readonly T[];
  defaultTheme?: T["name"];
  initialMode?: ThemeMode;
  initialFamily?: string;
  /** localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. */
  storageKey?: string;
  /** CSS custom property prefix. Defaults to `"theme-"`. */
  prefix?: string;
}

export interface ThemeKitViteInjectedTag {
  tag: string;
  attrs: Record<string, string>;
  children?: string;
  injectTo: string;
}

export interface ThemeKitVitePlugin {
  name: string;
  enforce: "pre";
  transformIndexHtml(
    html: string,
    ctx?: unknown,
  ):
    | string
    | { tags: ThemeKitViteInjectedTag[]; order?: "pre" | "post" }
    | ThemeKitViteInjectedTag[];
}

/**
 * Vite plugin that injects the theme bootstrap as a blocking inline script at
 * the top of `index.html`, so the persisted theme is applied before the first
 * paint. Prevents the flash-of-wrong-theme on reload for client-rendered apps.
 *
 * ```ts
 * import { themeKitVitePlugin } from "@theme-kit/core/vite";
 * import { customThemes } from "./src/themes";
 *
 * export default defineConfig({
 *   plugins: [react(), themeKitVitePlugin({ themes: customThemes })],
 * });
 * ```
 */
export function themeKitVitePlugin<T extends ThemeDefinition>(
  options: ThemeKitVitePluginOptions<T>,
): ThemeKitVitePlugin {
  const name = "theme-kit:vite";

  let script: string | null = null;
  function getScript(): string {
    if (script === null) {
      script = createThemeBootstrapScript(options);
    }
    return script;
  }

  return {
    name,
    enforce: "pre",
    transformIndexHtml() {
      return {
        tags: [
          {
            tag: "script",
            attrs: {},
            children: getScript(),
            injectTo: "head-prepend",
          },
        ],
      };
    },
  };
}
