import { describe, expect, it } from "vitest";
import type { ThemeTokens } from "@theme-kit/core";
import { generateShadcnVariables, createShadcnVariables } from "../src/generator";

const fullTokens: ThemeTokens = {
  colors: {
    background: "#ffffff",
    foreground: "#1f2933",
    card: "#fafafa",
    cardForeground: "#111111",
    popover: "#ffffff",
    popoverForeground: "#1f2933",
    primary: "#2563eb",
    primaryForeground: "#ffffff",
    secondary: "#f3f4f6",
    secondaryForeground: "#1f2933",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    accent: "#fde68a",
    accentForeground: "#1f2933",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#e5e7eb",
    input: "#d1d5db",
    ring: "#3b82f6",
    "chart-1": "#2563eb",
    "chart-2": "#f59e0b",
  },
  radius: { sm: "0.125rem", md: "0.25rem", lg: "0.5rem", xl: "1rem" },
};

describe("generateShadcnVariables", () => {
  it("maps core semantic surfaces", () => {
    const vars = generateShadcnVariables(fullTokens, { strategy: "exact" });

    expect(vars["--background"]).toBe("#ffffff");
    expect(vars["--foreground"]).toBe("#1f2933");
    expect(vars["--card"]).toBe("#fafafa");
    expect(vars["--card-foreground"]).toBe("#111111");
    expect(vars["--popover"]).toBe("#ffffff");
    expect(vars["--popover-foreground"]).toBe("#1f2933");
    expect(vars["--border"]).toBe("#e5e7eb");
    expect(vars["--ring"]).toBe("#3b82f6");
  });

  it("maps element and chart colors with case-insensitive reads", () => {
    const vars = generateShadcnVariables(fullTokens, { strategy: "exact" });

    expect(vars["--primary"]).toBe("#2563eb");
    expect(vars["--primary-foreground"]).toBe("#ffffff");
    expect(vars["--secondary"]).toBe("#f3f4f6");
    expect(vars["--accent"]).toBe("#fde68a");
    expect(vars["--muted"]).toBe("#f3f4f6");
    expect(vars["--destructive"]).toBe("#ef4444");
    expect(vars["--input"]).toBe("#d1d5db");
expect(vars["--chart-1"]).toBe("#2563eb");
    expect(vars["--chart-2"]).toBe("#f59e0b");
  });

  it("emits --radius from the lg token", () => {
    const vars = generateShadcnVariables(fullTokens, { strategy: "exact" });
    expect(vars["--radius"]).toBe("0.5rem");
  });

  it("omits radius when no radius tokens exist", () => {
    const vars = generateShadcnVariables({ colors: {} }, { strategy: "exact" });
    expect(vars["--radius"]).not.toBeDefined();
    expect(vars["--background"]).toBe("");
  });

  it("applies refine and transform plugins", () => {
    const vars = generateShadcnVariables(fullTokens, {
      strategy: "native",
      plugins: [
        {
          refine(state) {
            return { colors: { ...(state.colors as object), primary: "#000000" } };
          },
          transform(result) {
            return { ...result, "--radius": "9999px" };
          },
        },
      ],
    });

    expect(vars["--primary"]).toBe("#000000");
    expect(vars["--radius"]).toBe("9999px");
  });

  it("is deterministic", () => {
    const a = generateShadcnVariables(fullTokens, { strategy: "aggressive" });
    const b = generateShadcnVariables(fullTokens, { strategy: "aggressive" });
    expect(a).toEqual(b);
  });

  it("accepts raw tokens via createShadcnVariables", () => {
    const vars = createShadcnVariables(fullTokens);
    expect(vars["--background"]).toBe("#ffffff");
    expect(vars["--primary"]).toBe("#2563eb");
  });
});