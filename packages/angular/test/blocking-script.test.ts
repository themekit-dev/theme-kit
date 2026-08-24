import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { createBlockingScriptContent, buildThemeCSSMap } from "../src/lib/blocking-script";

const themes = [
  defineTheme({
    name: "light",
    meta: { family: "default", mode: "light" },
    tokens: {
      colors: {
        surface: { default: "#ffffff", raised: "#f5f5f5" },
        foreground: { default: "#111111", muted: "#666666" },
        brand: { default: "#0066cc" },
      },
      radius: { sm: "4px", md: "6px", lg: "8px" },
    },
  }),
  defineTheme({
    name: "dark",
    meta: { family: "default", mode: "dark" },
    tokens: {
      colors: {
        surface: { default: "#1a1a1a", raised: "#2a2a2a" },
        foreground: { default: "#eeeeee", muted: "#999999" },
        brand: { default: "#3399ff" },
      },
      radius: { sm: "4px", md: "6px", lg: "8px" },
    },
  }),
  defineTheme({
    name: "forest-light",
    meta: { family: "forest", mode: "light" },
    tokens: {
      colors: {
        surface: { default: "#f0faf0", raised: "#e0f0e0" },
        foreground: { default: "#1a2e1a", muted: "#4a6e4a" },
        brand: { default: "#2d8a2d" },
      },
    },
  }),
  defineTheme({
    name: "forest-dark",
    meta: { family: "forest", mode: "dark" },
    tokens: {
      colors: {
        surface: { default: "#0f1a0f", raised: "#1a2e1a" },
        foreground: { default: "#d0e0d0", muted: "#80a080" },
        brand: { default: "#4caf4c" },
      },
    },
  }),
];

describe("buildThemeCSSMap", () => {
  it("returns light and dark CSS maps for the default family", () => {
    const map = buildThemeCSSMap(themes);
    expect(map.light).toHaveProperty("--theme-surface-default", "#ffffff");
    expect(map.light).toHaveProperty("--theme-foreground-default", "#111111");
    expect(map.dark).toHaveProperty("--theme-surface-default", "#1a1a1a");
    expect(map.dark).toHaveProperty("--theme-foreground-default", "#eeeeee");
  });

  it("includes semantic token groups (surface.foreground, brand)", () => {
    const map = buildThemeCSSMap(themes);
    expect(map.light["--theme-brand-default"]).toBe("#0066cc");
    expect(map.dark["--theme-brand-default"]).toBe("#3399ff");
  });

  it("includes non-color tokens like radius", () => {
    const map = buildThemeCSSMap(themes);
    expect(map.light["--theme-radius-sm"]).toBe("4px");
    expect(map.light["--theme-radius-md"]).toBe("6px");
    expect(map.light["--theme-radius-lg"]).toBe("8px");
  });

  it("handles empty themes array gracefully", () => {
    const map = buildThemeCSSMap([]);
    expect(map.light).toEqual({});
    expect(map.dark).toEqual({});
  });

  it("handles themes without tokens gracefully", () => {
    const map = buildThemeCSSMap([
      defineTheme({ name: "empty-light", meta: { mode: "light" } }),
      defineTheme({ name: "empty-dark", meta: { mode: "dark" } }),
    ]);
    expect(map.light).toEqual({});
    expect(map.dark).toEqual({});
  });
});

describe("createBlockingScriptContent", () => {
  it("generates a style and script tag", () => {
    const html = createBlockingScriptContent(themes);
    expect(html).toContain("<style id=\"theme-kit-critical\">");
    expect(html).toContain("<script id=\"theme-kit-blocking\">");
  });

  it("includes CSS for both prefers-color-scheme media queries", () => {
    const html = createBlockingScriptContent(themes);
    expect(html).toContain("prefers-color-scheme:dark");
    expect(html).toContain("prefers-color-scheme:light");
  });

  it("includes CSS variable declarations in the style tag", () => {
    const html = createBlockingScriptContent(themes);
    expect(html).toContain("--theme-surface-default");
    expect(html).toContain("--theme-foreground-default");
  });

  it("includes inline script that reads localStorage and sets attributes", () => {
    const html = createBlockingScriptContent(themes);
    expect(html).toContain("localStorage.getItem");
    expect(html).toContain("data-theme-mode");
    expect(html).toContain("data-theme-family");
    expect(html).toContain("classList.add");
  });

  it("uses savedSelection when provided", () => {
    const html = createBlockingScriptContent(themes, {
      mode: "dark",
      family: "forest",
    });
    expect(html).toContain("forest");
    expect(html).toContain("dark");
  });

  it("falls back to system/default when no savedSelection", () => {
    const html = createBlockingScriptContent(themes);
    expect(html).toContain("system");
  });

  it("handles single-theme arrays gracefully", () => {
    const single = [defineTheme({ name: "mono", meta: { mode: "light" }, tokens: { colors: { bg: "#fff" } } })];
    const html = createBlockingScriptContent(single);
    expect(html).toContain("--theme-bg");
  });
});
