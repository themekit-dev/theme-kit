import type { ThemeDefinition, ThemeMode } from "./model/theme";
import { createThemeBootstrapScript } from "./bootstrap";
import { createPrePaintScrollbarScript } from "./scrollbar/pre-paint";

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
  /** Hide native scrollbars before first paint by injecting the scrollbar
   *  pre-paint bootstrap script. `true` hides them (desktop), an options
   *  object keeps native bars on coarse-pointer devices unless `touch` is
   *  forced. Default `false` — the script is only needed when the page uses
   *  the Theme Kit overlay scrollbar. */
  scrollbar?: boolean | import("./scrollbar/pre-paint").PrePaintScrollbarOptions;
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
  let scrollbarScript: string | null = null;
  function getScript(): string {
    if (script === null) {
      script = createThemeBootstrapScript(options);
    }
    return script;
  }

  function getScrollbarScript(): string | null {
    if (options.scrollbar === undefined || options.scrollbar === false) {
      return null;
    }
    if (scrollbarScript === null) {
      scrollbarScript = createPrePaintScrollbarScript(
        options.scrollbar === true
          ? {}
          : options.scrollbar,
      );
    }
    return scrollbarScript;
  }

  return {
    name,
    enforce: "pre",
    transformIndexHtml() {
      // Return the plain `HtmlTagDescriptor[]` form of `transformIndexHtml`,
      // which is valid across Vite 4–8. (The old `{ tags, order }` object form
      // was dropped in Vite 6, where the object result requires `html`.)
      const tags: ThemeKitViteInjectedTag[] = [
        {
          tag: "script",
          attrs: { id: "theme-kit-bootstrap" },
          children: getScript(),
          injectTo: "head-prepend",
        },
      ];
      const scrollbar = getScrollbarScript();
      if (scrollbar) {
        tags.push({
          tag: "script",
          attrs: { id: "tk-scrollbar-bootstrap" },
          children: scrollbar,
          injectTo: "head-prepend",
        });
      }
      return tags;
    },
  };
}
