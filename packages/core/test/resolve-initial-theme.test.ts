import { describe, expect, it } from "vitest";
import { defineTheme, resolveInitialTheme } from "../src";

const themes = [
  defineTheme({
    name: "neutral-light",
    meta: { family: "neutral", mode: "light" },
  }),
  defineTheme({
    name: "neutral-dark",
    meta: { family: "neutral", mode: "dark" },
  }),
  defineTheme({
    name: "brand-light",
    meta: { family: "brand", mode: "light" },
  }),
  defineTheme({
    name: "brand-dark",
    meta: { family: "brand", mode: "dark" },
  }),
] as const;

describe("resolveInitialTheme", () => {
  it("returns the default theme when no selection is supplied", () => {
    const result = resolveInitialTheme({ themes, defaultTheme: "brand-dark" });
    expect(result.theme).toBe(themes[3]);
    expect(result.selection.family).toBe("brand");
    expect(result.selection.mode).toBe("dark");
  });

  it("uses the first registered theme when there is no default", () => {
    const result = resolveInitialTheme({ themes });
    expect(result.theme).toBe(themes[0]);
    expect(result.selection.family).toBe("neutral");
    expect(result.selection.mode).toBe("light");
  });

  it("uses the explicit family and mode over the default theme", () => {
    const result = resolveInitialTheme({
      themes,
      defaultTheme: "neutral-light",
      family: "brand",
      mode: "dark",
    });
    expect(result.theme).toBe(themes[3]);
    expect(result.selection.family).toBe("brand");
    expect(result.selection.mode).toBe("dark");
  });

  it("uses the default theme family when only mode is supplied", () => {
    const result = resolveInitialTheme({
      themes,
      defaultTheme: "brand-light",
      mode: "dark",
    });
    expect(result.theme).toBe(themes[3]);
    expect(result.selection.family).toBe("brand");
    expect(result.selection.mode).toBe("dark");
  });

  it("resolves system mode using the supplied system preference", () => {
    const darkResult = resolveInitialTheme({
      themes,
      family: "brand",
      mode: "system",
      prefersDark: true,
    });
    expect(darkResult.theme).toBe(themes[3]);
    expect(darkResult.selection.mode).toBe("system");

    const lightResult = resolveInitialTheme({
      themes,
      family: "brand",
      mode: "system",
      prefersDark: false,
    });
    expect(lightResult.theme).toBe(themes[2]);
    expect(lightResult.selection.mode).toBe("system");
  });

  it("throws when the registry is empty", () => {
    expect(() => resolveInitialTheme({ themes: [] })).toThrow(
      "At least one theme must be provided.",
    );
  });
});
