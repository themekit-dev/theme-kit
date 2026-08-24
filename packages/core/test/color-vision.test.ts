import { describe, expect, it } from "vitest";
import {
  simulateCVD,
  simulateThemeForCVD,
  getCVDLabel,
  defineTheme,
} from "../src";

describe("simulateCVD", () => {
  it("returns hex string for protanopia", () => {
    const result = simulateCVD("#ff0000", "protanopia");
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("returns hex string for deuteranopia", () => {
    const result = simulateCVD("#00ff00", "deuteranopia");
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("returns hex string for tritanopia", () => {
    const result = simulateCVD("#0000ff", "tritanopia");
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("returns grayscale for achromatopsia", () => {
    const result = simulateCVD("#ff0000", "achromatopsia");
    const [r, g, b] = [
      parseInt(result.slice(1, 3), 16),
      parseInt(result.slice(3, 5), 16),
      parseInt(result.slice(5, 7), 16),
    ];
    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  it("leaves black unchanged", () => {
    const types = ["protanopia", "deuteranopia", "tritanopia", "achromatopsia"] as const;
    for (const type of types) {
      expect(simulateCVD("#000000", type)).toBe("#000000");
    }
  });

  it("leaves white approximately unchanged for dichromacies", () => {
    const result = simulateCVD("#ffffff", "protanopia");
    const [r, g, b] = [
      parseInt(result.slice(1, 3), 16),
      parseInt(result.slice(3, 5), 16),
      parseInt(result.slice(5, 7), 16),
    ];
    expect(r).toBeGreaterThanOrEqual(250);
    expect(g).toBeGreaterThanOrEqual(250);
    expect(b).toBeGreaterThanOrEqual(250);
  });

  it("returns input for non-hex values", () => {
    const result = simulateCVD("transparent", "protanopia");
    expect(result).toBe("transparent");
  });

  it("produces different results for different CVD types on red", () => {
    const protan = simulateCVD("#ff0000", "protanopia");
    const deuteran = simulateCVD("#ff0000", "deuteranopia");
    const tritan = simulateCVD("#ff0000", "tritanopia");
    const achroma = simulateCVD("#ff0000", "achromatopsia");
    expect(protan).not.toBe(deuteran);
    expect(deuteran).not.toBe(tritan);
    expect(tritan).not.toBe(achroma);
  });
});

describe("simulateThemeForCVD", () => {
  const theme = defineTheme({
    name: "test",
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        primary: "#ff0000",
      },
    },
  });

  it("transforms primary from red", () => {
    const simulated = simulateThemeForCVD(theme, "protanopia");
    const colors = simulated.tokens?.colors as Record<string, string>;
    expect(colors.primary).not.toBe("#ff0000");
  });

  it("preserves theme name and meta", () => {
    const simulated = simulateThemeForCVD(theme, "protanopia");
    expect(simulated.name).toBe("test");
  });

  it("handles undefined tokens gracefully", () => {
    const empty = defineTheme({ name: "empty" });
    const result = simulateThemeForCVD(empty, "protanopia");
    expect(result.name).toBe("empty");
  });
});

describe("getCVDLabel", () => {
  it("returns label for protanopia", () => {
    expect(getCVDLabel("protanopia")).toBe("Protanopia (Red-Blind)");
  });

  it("returns label for deuteranopia", () => {
    expect(getCVDLabel("deuteranopia")).toBe("Deuteranopia (Green-Blind)");
  });

  it("returns label for tritanopia", () => {
    expect(getCVDLabel("tritanopia")).toBe("Tritanopia (Blue-Blind)");
  });

  it("returns label for achromatopsia", () => {
    expect(getCVDLabel("achromatopsia")).toBe("Achromatopsia (Total Color Blindness)");
  });
});
