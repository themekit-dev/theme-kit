import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { createAntdTheme } from "../src/theme";

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
  },
});

describe("createAntdTheme", () => {
  it("maps primary color and explicit tokens", () => {
    const config = createAntdTheme(dark);
    expect(config.token?.colorPrimary).toBe("#fb923c");
  });

  it("maps background and foreground tokens", () => {
    const config = createAntdTheme(dark);
    expect(config.token?.colorBgBase).toBeTruthy();
    expect(config.token?.colorTextBase).toBe("#f8fafc");
  });

  it("maps border radius", () => {
    const config = createAntdTheme(dark);
    expect(config.token?.borderRadius).toBe(16);
  });

  it("maps fontFamily and fontSize", () => {
    const config = createAntdTheme(dark);
    expect(config.token?.fontFamily).toBe("Inter, sans-serif");
    expect(config.token?.fontSize).toBe(14);
  });
});