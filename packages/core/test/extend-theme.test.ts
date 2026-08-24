import { describe, expect, it } from "vitest";
import { defineTheme, extendTheme, resolveTheme } from "../src";

describe("extendTheme", () => {
  const neutral = defineTheme({
    name: "neutral-light",
    meta: { mode: "light", family: "neutral" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        primary: "#3b82f6",
        primaryForeground: "#ffffff",
        secondary: "#e2e8f0",
        secondaryForeground: "#0f172a",
      },
      radius: {
        lg: "8px",
      },
    },
  });

  it("creates a new theme extending the base", () => {
    const ocean = extendTheme("ocean-light", neutral, {
      colors: {
        primary: "#0ea5e9",
      },
    });

    expect(ocean.name).toBe("ocean-light");
    expect(ocean.extends).toBe("neutral-light");
  });

  it("overrides specified tokens", () => {
    const ocean = extendTheme("ocean-light", neutral, {
      colors: {
        primary: "#0ea5e9",
      },
    });

    expect(ocean.tokens?.colors?.primary).toBe("#0ea5e9");
    expect(ocean.tokens?.colors?.background).toBeUndefined();
  });

  it("resolves theme through inheritance chain", () => {
    const ocean = extendTheme("ocean-light", neutral, {
      colors: {
        primary: "#0ea5e9",
      },
    });

    const themes = [neutral, ocean];
    const resolved = resolveTheme(themes, "ocean-light");

    expect(resolved.tokens?.colors?.primary).toBe("#0ea5e9");
    expect(resolved.tokens?.colors?.background).toBe("#ffffff");
    expect(resolved.tokens?.colors?.foreground).toBe("#000000");
    expect(resolved.tokens?.radius?.lg).toBe("8px");
  });

  it("overrides nested token groups", () => {
    const custom = extendTheme("custom-neutral", neutral, {
      radius: { lg: "16px" },
      spacing: { page: "24px" },
    });

    expect(custom.tokens?.radius?.lg).toBe("16px");
    expect(custom.tokens?.spacing?.page).toBe("24px");
  });

  it("overrides meta fields", () => {
    const ocean = extendTheme("ocean-light", neutral, {
      meta: { label: "Ocean Light", order: 30 },
    });

    expect(ocean.meta?.label).toBe("Ocean Light");
    expect(ocean.meta?.order).toBe(30);
  });

  it("creates a theme with no overrides", () => {
    const clone = extendTheme("clone", neutral);

    expect(clone.name).toBe("clone");
    expect(clone.extends).toBe("neutral-light");
    expect(clone.tokens).toBeUndefined();
    expect(clone.meta).toBeUndefined();
  });

  it("supports multiple overrides at once", () => {
    const full = extendTheme("full-override", neutral, {
      colors: {
        primary: "#7c3aed",
        background: "#faf5ff",
        foreground: "#2e1065",
      },
      radius: { lg: "12px" },
      meta: { label: "Full Override", family: "custom" },
    });

    expect(full.tokens?.colors?.primary).toBe("#7c3aed");
    expect(full.tokens?.colors?.background).toBe("#faf5ff");
    expect(full.tokens?.colors?.foreground).toBe("#2e1065");
    expect(full.tokens?.radius?.lg).toBe("12px");
    expect(full.meta?.label).toBe("Full Override");
    expect(full.meta?.family).toBe("custom");
  });
});
