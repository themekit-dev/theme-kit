import { describe, expect, it } from "vitest";
import {
  getContrastRatio,
  checkContrastPair,
  validateThemeContrast,
  defineTheme,
} from "../src";

describe("getContrastRatio", () => {
  it("returns 21:1 for black on white", () => {
    const ratio = getContrastRatio("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for same color", () => {
    const ratio = getContrastRatio("#ff0000", "#ff0000");
    expect(ratio).toBeCloseTo(1, 1);
  });

  it("is symmetric", () => {
    const a = getContrastRatio("#000000", "#ffffff");
    const b = getContrastRatio("#ffffff", "#000000");
    expect(a).toBeCloseTo(b, 5);
  });

  it("handles gray on white", () => {
    const ratio = getContrastRatio("#999999", "#ffffff");
    expect(ratio).toBeLessThan(4.5);
  });

  it("handles dark gray on white", () => {
    const ratio = getContrastRatio("#333333", "#ffffff");
    expect(ratio).toBeGreaterThan(10);
  });
});

describe("checkContrastPair", () => {
  it("passes AA and AAA for black on white", () => {
    const result = checkContrastPair("#000000", "#ffffff");
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.passesAANormal).toBe(true);
    expect(result.passesAALarge).toBe(true);
    expect(result.passesAAANormal).toBe(true);
    expect(result.passesAAALarge).toBe(true);
  });

  it("fails all levels for very light gray on white", () => {
    const result = checkContrastPair("#bbbbbb", "#ffffff");
    expect(result.passesAANormal).toBe(false);
    expect(result.passesAALarge).toBe(false);
    expect(result.passesAAANormal).toBe(false);
    expect(result.passesAAALarge).toBe(false);
  });

  it("passes AA large only for medium gray on white", () => {
    const result = checkContrastPair("#888888", "#ffffff");
    expect(result.passesAANormal).toBe(false);
    expect(result.passesAALarge).toBe(true);
    expect(result.passesAAANormal).toBe(false);
    expect(result.passesAAALarge).toBe(false);
  });

  it("passes AA normal for dark gray on white", () => {
    const result = checkContrastPair("#5c5c5c", "#ffffff");
    expect(result.passesAANormal).toBe(true);
    expect(result.passesAALarge).toBe(true);
    expect(result.passesAAANormal).toBe(false);
    expect(result.passesAAALarge).toBe(true);
  });
});

describe("validateThemeContrast", () => {
  const passingTheme = defineTheme({
    name: "good-contrast",
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#09090b",
        card: "#ffffff",
        cardForeground: "#09090b",
        popover: "#ffffff",
        popoverForeground: "#09090b",
        primary: "#18181b",
        primaryForeground: "#fafafa",
        secondary: "#f4f4f5",
        secondaryForeground: "#18181b",
        muted: "#f4f4f5",
        mutedForeground: "#63636b",
        accent: "#f4f4f5",
        accentForeground: "#18181b",
        destructive: "#dc2626",
        destructiveForeground: "#fafafa",
      },
    },
  });

  it("passes a theme with good contrast", () => {
    const result = validateThemeContrast(passingTheme);
    expect(result.valid).toBe(true);
    expect(result.checks.length).toBeGreaterThan(0);
    for (const check of result.checks) {
      expect(check.passesAANormal).toBe(true);
    }
  });

  it("fails a theme with poor contrast", () => {
    const poorTheme = defineTheme({
      name: "poor-contrast",
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#cccccc",
          card: "#ffffff",
          cardForeground: "#cccccc",
          popover: "#ffffff",
          popoverForeground: "#cccccc",
          primary: "#3b82f6",
          primaryForeground: "#cccccc",
          secondary: "#e2e8f0",
          secondaryForeground: "#cccccc",
          muted: "#e2e8f0",
          mutedForeground: "#cccccc",
          accent: "#e2e8f0",
          accentForeground: "#cccccc",
          destructive: "#ef4444",
          destructiveForeground: "#cccccc",
        },
      },
    });

    const result = validateThemeContrast(poorTheme);
    expect(result.valid).toBe(false);
    for (const check of result.checks) {
      expect(check.passesAANormal).toBe(false);
    }
  });

  it("checks all 8 semantic pairs", () => {
    const result = validateThemeContrast(passingTheme);
    expect(result.checks).toHaveLength(8);
  });

  it("reports individual check details", () => {
    const result = validateThemeContrast(passingTheme);
    const foregroundOnBg = result.checks.find(
      (c) => c.foregroundToken === "foreground" && c.backgroundToken === "background",
    );
    expect(foregroundOnBg).toBeDefined();
    expect(foregroundOnBg!.ratio).toBeGreaterThan(10);
  });

  it("returns valid=true with empty checks for theme without colors", () => {
    const empty = defineTheme({ name: "empty" });
    const result = validateThemeContrast(empty);
    expect(result.valid).toBe(true);
    expect(result.checks).toHaveLength(0);
  });

  it("validates through inheritance chain", () => {
    const base = defineTheme({
      name: "base",
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#09090b",
          card: "#ffffff",
          cardForeground: "#09090b",
          popover: "#ffffff",
          popoverForeground: "#09090b",
          primary: "#18181b",
          primaryForeground: "#fafafa",
          secondary: "#f4f4f5",
          secondaryForeground: "#18181b",
          muted: "#f4f4f5",
          mutedForeground: "#63636b",
          accent: "#f4f4f5",
          accentForeground: "#18181b",
          destructive: "#dc2626",
          destructiveForeground: "#fafafa",
        },
      },
    });

    const child = defineTheme({
      name: "child",
      extends: "base",
    });

    const result = validateThemeContrast(child, { themes: [base, child] });
    expect(result.valid).toBe(true);
    expect(result.checks.length).toBeGreaterThan(0);
  });
});
