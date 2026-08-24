import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { createMuiTheme } from "../src";

const dark = defineTheme({
  name: "test",
  meta: { mode: "dark" },
  tokens: {
    colors: {
      background: "#0f172a",
      foreground: "#f8fafc",
      card: "#1e293b",
      primary: "#fb923c",
      primaryForeground: "#0f172a",
      secondary: "#1e293b",
      secondaryForeground: "#f8fafc",
      muted: "#334155",
      mutedForeground: "#94a3b8",
      accent: "#fdba74",
      accentForeground: "#0f172a",
      destructive: "#f87171",
      destructiveForeground: "#0f172a",
      border: "#334155",
      ring: "#fb923c",
    },
    radius: { lg: "16px" },
    shadows: { md: "0 4px 6px rgba(0,0,0,0.3)" },
    typography: {
      fontFamilies: { sans: "Inter, sans-serif" },
      fontSizes: { md: "0.875rem" },
    },
    breakpoints: { sm: "640px", lg: "1024px" },
  },
});

describe("createMuiTheme", () => {
  it("maps primary/foreground + contrastText", () => {
    const theme = createMuiTheme(dark);
    expect(theme.palette.primary.main).toBe("#fb923c");
    expect(theme.palette.primary.contrastText).toBe("#0f172a");
    expect(theme.palette.mode).toBe("dark");
  });

  it("maps background / card to paper", () => {
    const theme = createMuiTheme(dark);
    expect(theme.palette.background.default).toBe("#0f172a");
    expect(theme.palette.background.paper).toBe("#1e293b");
    expect(theme.palette.text.primary).toBe("#f8fafc");
  });

  it("maps destructive to error", () => {
    const theme = createMuiTheme(dark);
    expect(theme.palette.error.main).toBe("#f87171");
  });

  it("maps radius and shadows", () => {
    const theme = createMuiTheme(dark);
    expect(theme.shape.borderRadius).toBe(16);
    expect(theme.shadows).toHaveLength(25);
    expect(theme.shadows[0]).toBe("none");
  });

  it("maps typography and breakpoints", () => {
    const theme = createMuiTheme(dark);
    expect(theme.typography.fontFamily).toBe("Inter, sans-serif");
    expect(theme.breakpoints.values.sm).toBe(640);
    expect(theme.breakpoints.values.lg).toBe(1024);
  });
});