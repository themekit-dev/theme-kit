import { describe, expect, it } from "vitest";
import { generateTheme } from "../src";

describe("generateTheme", () => {
  it("generates light and dark themes from a seed", () => {
    const { light, dark } = generateTheme({ seed: "#7c3aed" });

    expect(light.name).toBe("generated-light");
    expect(light.meta?.mode).toBe("light");
    expect(dark.name).toBe("generated-dark");
    expect(dark.meta?.mode).toBe("dark");
  });

  it("uses the family option for naming", () => {
    const { light, dark } = generateTheme({ seed: "#3b82f6", family: "ocean" });

    expect(light.name).toBe("ocean-light");
    expect(light.meta?.family).toBe("ocean");
    expect(dark.name).toBe("ocean-dark");
    expect(dark.meta?.family).toBe("ocean");
  });

  it("uses the seed as the primary color in light mode", () => {
    const { light } = generateTheme({ seed: "#7c3aed" });

    expect(light.tokens?.colors?.primary).toBe("#7c3aed");
  });

  it("generates a lighter primary for dark mode", () => {
    const { dark } = generateTheme({ seed: "#7c3aed" });

    const primary = dark.tokens?.colors?.primary as string;
    expect(primary).toBeTruthy();
    expect(primary).not.toBe("#7c3aed");
  });

  it("generates all expected color tokens for light theme", () => {
    const { light } = generateTheme({ seed: "#0ea5e9" });
    const colors = light.tokens?.colors;

    const expectedKeys = [
      "background", "foreground",
      "card", "cardForeground",
      "popover", "popoverForeground",
      "primary", "primaryForeground",
      "secondary", "secondaryForeground",
      "muted", "mutedForeground",
      "accent", "accentForeground",
      "destructive", "destructiveForeground",
      "success", "successForeground",
      "border", "input", "ring",
    ];

    for (const key of expectedKeys) {
      expect(colors).toHaveProperty(key);
      expect(typeof (colors as Record<string, unknown>)[key]).toBe("string");
    }
  });

  it("generates all expected color tokens for dark theme", () => {
    const { dark } = generateTheme({ seed: "#0ea5e9" });
    const colors = dark.tokens?.colors;

    const expectedKeys = [
      "background", "foreground",
      "card", "cardForeground",
      "popover", "popoverForeground",
      "primary", "primaryForeground",
      "secondary", "secondaryForeground",
      "muted", "mutedForeground",
      "accent", "accentForeground",
      "destructive", "destructiveForeground",
      "success", "successForeground",
      "border", "input", "ring",
    ];

    for (const key of expectedKeys) {
      expect(colors).toHaveProperty(key);
      expect(typeof (colors as Record<string, unknown>)[key]).toBe("string");
    }
  });

  it("generates radius tokens", () => {
    const { light } = generateTheme({ seed: "#7c3aed" });

    expect(light.tokens?.radius?.lg).toBe("8px");
  });

  it("sets mode ordering in meta", () => {
    const { light, dark } = generateTheme({ seed: "#3b82f6", family: "ocean" });

    expect(light.meta?.order).toBe(10);
    expect(dark.meta?.order).toBe(20);
  });

  it("picks a contrast-safe primary foreground for dark seeds", () => {
    const { light, dark } = generateTheme({ seed: "#3b82f6" });

    expect(light.tokens?.colors?.primaryForeground).toBe("#ffffff");
    expect(dark.tokens?.colors?.primaryForeground).toBe("#020617");
  });

  it("picks a dark primary foreground for light seeds", () => {
    const { light } = generateTheme({ seed: "#f59e0b" });

    expect(light.tokens?.colors?.primaryForeground).toBe("#0f172a");
  });

  it("produces valid hex colors", () => {
    const { light, dark } = generateTheme({ seed: "#10b981" });
    const hexRegex = /^#[0-9a-fA-F]{6}$/;

    const checkTheme = (theme: typeof light) => {
      const colors = theme.tokens?.colors as Record<string, unknown>;
      for (const [key, value] of Object.entries(colors)) {
        if (typeof value === "string") {
          expect(value, `Invalid hex for ${key}`).toMatch(hexRegex);
        }
      }
    };

    checkTheme(light);
    checkTheme(dark);
  });

  it("generates different colors for different seeds", () => {
    const a = generateTheme({ seed: "#ef4444" });
    const b = generateTheme({ seed: "#3b82f6" });

    expect(a.light.tokens?.colors?.primary).not.toBe(
      b.light.tokens?.colors?.primary,
    );
    expect(a.light.tokens?.colors?.accent).not.toBe(
      b.light.tokens?.colors?.accent,
    );
  });

  it("generates valid theme definitions compatible with resolveTheme", () => {
    const { light, dark } = generateTheme({ seed: "#8b5cf6" });

    expect(light.extends).toBeUndefined();
    expect(dark.extends).toBeUndefined();
    expect(light.tokens?.colors).toBeTruthy();
    expect(dark.tokens?.colors).toBeTruthy();
  });
});
