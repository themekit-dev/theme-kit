import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { createMantineTheme } from "../src/theme";

const dark = defineTheme({
  name: "test",
  meta: { mode: "dark" },
  tokens: {
    colors: {
      background: "#0f172a",
      foreground: "#f8fafc",
      primary: "#fb923c",
      secondary: "#1e293b",
      accent: "#fdba74",
      destructive: "#f87171",
      border: "#334155",
      muted: "#334155",
      mutedForeground: "#94a3b8",
    },
    radius: { lg: "16px" },
    typography: {
      fontFamilies: { sans: "Inter, sans-serif" },
      fontSizes: { md: "0.875rem" },
    },
    spacing: { md: "1rem" },
    shadows: { md: "0 4px 6px rgba(0,0,0,0.3)" },
    breakpoints: { sm: "640px", md: "768px", lg: "1024px" },
  },
});

describe("createMantineTheme", () => {
  it("sets primaryColor and generates 10 shades", () => {
    const theme = createMantineTheme(dark);
    expect(theme.primaryColor).toBe("primary");
    expect(theme.colors.primary).toHaveLength(10);
    expect(theme.colors.primary[6]).toBe("#fb923c");
  });

  it("maps radius and defaultRadius", () => {
    const theme = createMantineTheme(dark);
    expect(theme.radius.lg).toBe("16px");
    expect(theme.defaultRadius).toBe("lg");
  });

  it("maps fontFamily and fontSizes", () => {
    const theme = createMantineTheme(dark);
    expect(theme.fontFamily).toBe("Inter, sans-serif");
    expect(theme.fontSizes.md).toBe("0.875rem");
  });

  it("maps breakpoints", () => {
    const theme = createMantineTheme(dark);
    expect(theme.breakpoints.md).toBe("768px");
  });
});