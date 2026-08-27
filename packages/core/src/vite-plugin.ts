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

/**
 * Structural twin of Vite's `HtmlTagDescriptor`. Kept local so the plugin does
 * not need a hard dependency on `vite` types; the shape is assignable to
 * Vite's `IndexHtmlTransformResult` in Vite 4 through 8.
 */
export interface ThemeKitViteInjectedTag {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string;
  injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
}

export interface ThemeKitVitePlugin {
  name: string;
  enforce: "pre";
  transformIndexHtml(
    html: string,
    ctx?: unknown,
  ): string | ThemeKitViteInjectedTag[];
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
      // Return the plain `HtmlTagDescriptor[]` form of `transformIndexHtml`,
      // which is valid across Vite 4–8. (The old `{ tags, order }` object form
      // was dropped in Vite 6, where the object result requires `html`.)
      return [
        {
          tag: "script",
          attrs: {},
          children: getScript(),
          injectTo: "head-prepend",
        },
      ];
    },
  };
}
