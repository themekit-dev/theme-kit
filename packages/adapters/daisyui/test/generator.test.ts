import { describe, expect, it } from "vitest";
import type { ThemeTokens } from "@theme-kit/core";
import { generateDaisyVariables, createDaisyVariables } from "../src/generator";

const fullTokens: ThemeTokens = {
  colors: {
    background: "#ffffff",
    foreground: "#1f2933",
    primary: "#2563eb",
    primaryForeground: "#ffffff",
    secondary: "#e5e7eb",
    secondaryForeground: "#1f2933",
    accent: "#f59e0b",
    accentForeground: "#1f2933",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#d1d5db",
    info: "#06b6d4",
    success: "#22c55e",
    warning: "#facc15",
  },
  radius: { sm: "0.25rem", md: "0.5rem", lg: "1rem" },
  borderWidths: { _default: "2px" },
};

describe("generateDaisyVariables", () => {
  it("maps base, content and semantic color variables", () => {
    const vars = generateDaisyVariables(fullTokens, { strategy: "exact" });

    expect(vars["--color-base-100"]).toBe("#ffffff");
    expect(vars["--color-base-200"]).toBe("#e5e7eb");
    expect(vars["--color-base-300"]).toBe("#d1d5db");
    expect(vars["--color-base-content"]).toBe("#1f2933");
    expect(vars["--color-primary"]).toBe("#2563eb");
    expect(vars["--color-primary-content"]).toBe("#ffffff");
    expect(vars["--color-secondary"]).toBe("#e5e7eb");
    expect(vars["--color-accent"]).toBe("#f59e0b");
    expect(vars["--color-neutral"]).toBe("#f3f4f6");
    expect(vars["--color-error"]).toBe("#ef4444");
  });

  it("maps info/success/warning to explicit colors when present", () => {
    const vars = generateDaisyVariables(fullTokens, { strategy: "exact" });
    expect(vars["--color-info"]).toBe("#06b6d4");
    expect(vars["--color-success"]).toBe("#22c55e");
    expect(vars["--color-warning"]).toBe("#facc15");
  });

  it("falls back to accent/secondary for info/warning/success", () => {
    const tokens: ThemeTokens = {
      colors: {
        background: "#ffffff",
        foreground: "#1f2933",
        primary: "#2563eb",
        primaryForeground: "#ffffff",
        secondary: "#e5e7eb",
        secondaryForeground: "#1f2933",
        accent: "#f59e0b",
        accentForeground: "#1f2933",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
      },
    };
    const vars = generateDaisyVariables(tokens, { strategy: "native" });
    expect(vars["--color-info"]).toBe("#f59e0b");
    expect(vars["--color-warning"]).toBe("#f59e0b");
    expect(vars["--color-success"]).toBe("#e5e7eb");
  });

  it("maps radius and border tokens", () => {
    const vars = generateDaisyVariables(fullTokens, { strategy: "exact" });
    expect(vars["--radius-selector"]).toBe("0.25rem");
    expect(vars["--radius-field"]).toBe("0.5rem");
    expect(vars["--radius-box"]).toBe("1rem");
    expect(vars["--border"]).toBe("2px");
  });

  it("omits empty color variables", () => {
    const vars = generateDaisyVariables({ colors: {} }, { strategy: "exact" });
    expect(vars["--color-base-100"]).not.toBeDefined();
    expect(vars["--color-primary"]).not.toBeDefined();
  });

  it("applies refine and transform plugins", () => {
    const vars = generateDaisyVariables(fullTokens, {
      strategy: "native",
      plugins: [
        {
          refine(state) {
            return { colors: { ...(state.colors as object), primary: "#00ff00" } };
          },
          transform(result) {
            return { ...result, "--custom": "1" };
          },
        },
      ],
    });
    expect(vars["--color-primary"]).toBe("#00ff00");
    expect(vars["--custom"]).toBe("1");
  });

  it("is deterministic", () => {
    const a = generateDaisyVariables(fullTokens, { strategy: "aggressive" });
    const b = generateDaisyVariables(fullTokens, { strategy: "aggressive" });
    expect(a).toEqual(b);
  });

  it("accepts raw tokens via createDaisyVariables", () => {
    const vars = createDaisyVariables(fullTokens);
    expect(vars["--color-primary"]).toBe("#2563eb");
    expect(vars["--radius-box"]).toBe("1rem");
  });
});