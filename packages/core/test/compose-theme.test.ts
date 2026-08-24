import { describe, expect, it } from "vitest";
import { composeTheme, defineTheme } from "../src";

describe("composeTheme", () => {
  const typographyPreset = defineTheme({
    name: "typography-preset",
    tokens: {
      typography: {
        fontFamilies: { sans: "Inter, sans-serif", mono: "Fira Code, monospace" },
        fontSizes: { sm: "0.875rem", base: "1rem", lg: "1.25rem" },
      },
    },
  });

  const spacingPreset = defineTheme({
    name: "spacing-preset",
    tokens: {
      spacing: { page: "24px", section: "16px", gutter: "12px" },
    },
  });

  const brandPreset = defineTheme({
    name: "brand-preset",
    tokens: {
      colors: {
        primary: "#7c3aed",
        primaryForeground: "#ffffff",
      },
    },
    meta: { label: "Brand" },
  });

  it("merges multiple presets into one theme", () => {
    const theme = composeTheme(
      "my-theme",
      typographyPreset,
      spacingPreset,
      brandPreset,
    );

    expect(theme.name).toBe("my-theme");
    expect(theme.extends).toBeUndefined();
  });

  it("contains tokens from all presets", () => {
    const theme = composeTheme(
      "my-theme",
      typographyPreset,
      spacingPreset,
      brandPreset,
    );

    expect(theme.tokens?.typography?.fontFamilies?.sans).toBe("Inter, sans-serif");
    expect(theme.tokens?.spacing?.page).toBe("24px");
    expect(theme.tokens?.colors?.primary).toBe("#7c3aed");
  });

  it("later presets override earlier ones", () => {
    const base = defineTheme({
      name: "base",
      tokens: { colors: { primary: "#3b82f6" } },
    });
    const override = defineTheme({
      name: "override",
      tokens: { colors: { primary: "#ef4444" } },
    });

    const theme = composeTheme("overridden", base, override);
    expect(theme.tokens?.colors?.primary).toBe("#ef4444");
  });

  it("merges meta from sources", () => {
    const theme = composeTheme("with-meta", typographyPreset, brandPreset);
    expect(theme.meta?.label).toBe("Brand");
  });

  it("handles a single source", () => {
    const theme = composeTheme("single", typographyPreset);
    expect(theme.name).toBe("single");
    expect(theme.tokens?.typography?.fontFamilies?.sans).toBe("Inter, sans-serif");
  });

  it("handles empty sources", () => {
    const theme = composeTheme("empty");
    expect(theme.name).toBe("empty");
    expect(theme.tokens).toBeUndefined();
    expect(theme.meta).toBeUndefined();
  });
});
