import { describe, expect, it } from "vitest";
import { defineTheme, getBuiltInThemes, resolveThemeRegistry } from "../src";

describe("resolveThemeRegistry", () => {
  it("uses supplied themes as the registry", () => {
    const themes = [
      defineTheme({ name: "brand-light" }),
      defineTheme({ name: "brand-dark" }),
    ] as const;

    expect(resolveThemeRegistry({ themes })).toBe(themes);
  });

  it("falls back to built-in themes when themes are omitted", () => {
    expect(resolveThemeRegistry()).toEqual(getBuiltInThemes());
  });

  it("falls back to built-in themes when given an empty registry", () => {
    expect(resolveThemeRegistry({ themes: [] })).toEqual(getBuiltInThemes());
  });
});
