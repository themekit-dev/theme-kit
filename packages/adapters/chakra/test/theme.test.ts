import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { buildChakraConfig } from "../src/theme";
import { resolveAdapterSource } from "@theme-kit/adapters";

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
      destructive: "#f87171",
      border: "#334155",
      ring: "#fb923c",
    },
    radius: { lg: "16px" },
    typography: {
      fontFamilies: { sans: "Inter, sans-serif" },
    },
  },
});

describe("buildChakraConfig", () => {
  const config = buildChakraConfig(resolveAdapterSource(dark));

  it("generates a 50-950 scale with the base color at 600", () => {
    const scale = config.tokens.colors.primary as Record<string, { value: string }>;
    expect(scale["600"].value).toBe("#fb923c");
    expect(Object.keys(scale)).toHaveLength(11);
    expect(scale["50"].value).not.toBe("#fb923c");
  });

  it("maps semantic colors", () => {
    const semantic = config.semanticTokens.colors as Record<string, { value: string }>;
    expect(semantic.background.value).toBe("#0f172a");
    expect(semantic.foreground.value).toBe("#f8fafc");
    // primary/accent/secondary/destructive are palette-semantic objects
    expect(
      (semantic.primary as Record<string, { value: string }>).solid.value,
    ).toBe("{colors.primary.500}");
    expect(
      (semantic.destructive as Record<string, { value: string }>).solid.value,
    ).toBe("{colors.destructive.500}");
  });

  it("maps fonts and radii", () => {
    const tokens = config.tokens as {
      fonts: Record<string, { value: string }>;
      radii: Record<string, { value: string }>;
    };
    expect(tokens.fonts.body.value).toBe("Inter, sans-serif");
    expect(tokens.radii.lg.value).toBe("16px");
  });
});