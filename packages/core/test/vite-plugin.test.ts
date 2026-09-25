import { describe, expect, it } from "vitest";
import { themeKitVitePlugin } from "../src/vite-plugin";

/**
 * The plugin's public entry point.
 *
 * `themeKitVitePlugin()` with no arguments is the documented registration —
 * discovery of `theme.config.ts` is the default, and every option is optional.
 * Constructing it must therefore work without arguments; only the later
 * `configResolved` / `transformIndexHtml` hooks need a Vite config.
 */
describe("themeKitVitePlugin", () => {
  it("constructs without arguments", () => {
    expect(() => themeKitVitePlugin()).not.toThrow();
  });

  it("returns a pre-enforced plugin named theme-kit:vite", () => {
    const plugin = themeKitVitePlugin();
    expect(plugin.name).toBe("theme-kit:vite");
    expect(plugin.enforce).toBe("pre");
    expect(typeof plugin.transformIndexHtml).toBe("function");
  });

  it("accepts an empty options object", () => {
    const plugin = themeKitVitePlugin({});
    expect(plugin.name).toBe("theme-kit:vite");
  });

  it("accepts an explicit config path", () => {
    const plugin = themeKitVitePlugin({ config: "./config/theme.config.ts" });
    expect(plugin.name).toBe("theme-kit:vite");
  });
});
