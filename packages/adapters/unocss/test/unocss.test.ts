import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { presetThemeKit, createUnoTheme } from "../src";

const tokens = defineTheme({
  name: "test",
  tokens: {
    colors: {
      background: "#f8fafc",
      foreground: "#0f172a",
      primary: "#d97706",
      secondary: "#e2e8f0",
      accent: "#f59e0b",
      destructive: "#ef4444",
      border: "#e2e8f0",
    },
    radius: { lg: "16px" },
    typography: {
      fontFamilies: { sans: "Inter, sans-serif" },
    },
    shadows: { md: "0 4px 6px rgba(0,0,0,0.07)" },
  },
});

describe("presetThemeKit", () => {
  it("returns a preset object with a theme", () => {
    const preset = presetThemeKit();
    expect(preset.name).toBe("@theme-kit/unocss");
    expect(preset.theme).toBeTruthy();
  });

  it("exposes color tokens as var() references", () => {
    const preset = presetThemeKit();
    const theme = preset.theme as Record<string, unknown>;
    const colors = theme.colors as Record<string, unknown>;
    expect(colors.background).toBe("var(--theme-color-background)");
    expect(colors.primary.DEFAULT).toBe("var(--theme-color-primary)");
  });
});

describe("createUnoTheme", () => {
  it("returns concrete values for known tokens", () => {
    const theme = createUnoTheme(tokens);
    const colors = theme.colors as Record<string, string | undefined>;
    expect(colors.background).toBe("#f8fafc");
    expect(colors.primary).toBe("#d97706");
    expect(colors.destructive).toBe("#ef4444");
  });

  it("maps radius", () => {
    const theme = createUnoTheme(tokens);
    const radius = theme.borderRadius as Record<string, string | undefined>;
    expect(radius.lg).toBe("16px");
  });
});