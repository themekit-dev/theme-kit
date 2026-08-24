import { describe, expect, it } from "vitest";
import type { ThemeTokens } from "@theme-kit/core";
import { generateBootstrapVariables, createBootstrapVariables } from "../src/generator";

const fullTokens: ThemeTokens = {
  colors: {
    background: "#ffffff",
    foreground: "#1f2933",
    primary: "#2563eb",
    secondary: "#6b7280",
    accent: "#f59e0b",
    muted: "#f3f4f6",
    destructive: "#ef4444",
    border: "#e5e7eb",
    ring: "#3b82f6",
    warning: "#facc15",
    info: "#06b6d4",
    success: "#22c55e",
  },
  radius: { sm: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "1rem" },
  typography: {
    fontFamilies: { sans: "Inter, system-ui, sans-serif" },
  },
  shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)" as string },
};

describe("generateBootstrapVariables", () => {
  it("maps body, border, radius and link tokens", () => {
    const vars = generateBootstrapVariables(fullTokens, { strategy: "exact" });

    expect(vars["--bs-body-bg"]).toBe("#ffffff");
    expect(vars["--bs-body-color"]).toBe("#1f2933");
    expect(vars["--bs-body-font-family"]).toBe("Inter, system-ui, sans-serif");
    expect(vars["--bs-border-color"]).toBe("#e5e7eb");
    expect(vars["--bs-border-radius"]).toBe("0.375rem");
    expect(vars["--bs-border-radius-sm"]).toBe("0.25rem");
    expect(vars["--bs-border-radius-lg"]).toBe("0.5rem");
    expect(vars["--bs-border-radius-xl"]).toBe("1rem");
    expect(vars["--bs-link-color"]).toBe("#2563eb");
    expect(vars["--bs-link-hover-color"]).toBe("#3b82f6");
  });

  it("maps semantic color states with fallback derivation", () => {
    const vars = generateBootstrapVariables(fullTokens, { strategy: "native" });

    expect(vars["--bs-primary"]).toBe("#2563eb");
    expect(vars["--bs-secondary"]).toBe("#6b7280");
    expect(vars["--bs-danger"]).toBe("#ef4444");
    expect(vars["--bs-success"]).toBe("#22c55e");
    expect(vars["--bs-warning"]).toBe("#facc15");
    expect(vars["--bs-info"]).toBe("#06b6d4");
  });

  it("derives success/warning/info from accent when not provided", () => {
    const tokens: ThemeTokens = {
      ...fullTokens,
      colors: { ...fullTokens.colors, success: undefined, warning: undefined, info: undefined },
    };
    const vars = generateBootstrapVariables(tokens, { strategy: "native" });

    expect(vars["--bs-success"]).toBe("#f59e0b");
    expect(vars["--bs-warning"]).toBe("#f59e0b");
    expect(vars["--bs-info"]).toBe("#f59e0b");
  });

  it("emits -rgb companion triplets for hex colors only", () => {
    const vars = generateBootstrapVariables(fullTokens, { strategy: "exact" });

    expect(vars["--bs-primary-rgb"]).toBe("37, 99, 235");
    expect(vars["--bs-danger-rgb"]).toBe("239, 68, 68");
  });

  it("does not emit color vars or rgb for missing colors", () => {
    const vars = generateBootstrapVariables({ colors: {} }, { strategy: "exact" });
    expect(vars["--bs-body-bg"]).toBe("");
    expect(vars["--bs-warning"]).not.toBeDefined();
  });

  it("applies refine and transform plugins", () => {
    const vars = generateBootstrapVariables(fullTokens, {
      strategy: "native",
      plugins: [
        {
          refine(state) {
            return { colors: { ...(state.colors as object), primary: "#0000ff" } };
          },
          transform(result) {
            return { ...result, "--custom-border": "6px" };
          },
        },
      ],
    });

    expect(vars["--bs-primary"]).toBe("#0000ff");
    expect(vars["--custom-border"]).toBe("6px");
  });

  it("is deterministic and idempotent", () => {
    const a = generateBootstrapVariables(fullTokens, { strategy: "aggressive" });
    const b = generateBootstrapVariables(fullTokens, { strategy: "aggressive" });
    expect(a).toEqual(b);
  });

  it("accepts a raw ThemeTokens input via createBootstrapVariables", () => {
    const vars = createBootstrapVariables(fullTokens);
    expect(vars["--bs-body-bg"]).toBe("#ffffff");
    expect(vars["--bs-primary"]).toBe("#2563eb");
  });
});