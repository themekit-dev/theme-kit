import { describe, expect, it } from "vitest";
import type { ThemeTokens } from "@theme-kit/core";
import {
  generateOpenPropsVariables,
  createOpenPropsVariables,
} from "../src/generator";

const fullTokens: ThemeTokens = {
  colors: {
    background: "#ffffff",
    foreground: "#1f2933",
    primary: "#2563eb",
    secondary: "#e5e7eb",
    accent: "#f59e0b",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    card: "#fafafa",
    destructive: "#ef4444",
    border: "#d1d5db",
  },
  radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" },
  typography: {
    fontFamilies: { sans: "Inter, system-ui", mono: "ui-monospace, monospace" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 2px 4px rgba(0,0,0,0.06)",
    lg: "0 4px 8px rgba(0,0,0,0.08)",
    xl: "0 8px 16px rgba(0,0,0,0.1)",
  },
  spacing: {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
  },
};

describe("generateOpenPropsVariables", () => {
  it("maps surfaces, foreground and aliases", () => {
    const vars = generateOpenPropsVariables(fullTokens, { strategy: "exact" });

    expect(vars["--color-canvas"]).toBe("#ffffff");
    expect(vars["--color-background"]).toBe("#ffffff");
    expect(vars["--color-text"]).toBe("#1f2933");
    expect(vars["--color-foreground"]).toBe("#1f2933");
    expect(vars["--color-surface-1"]).toBe("#fafafa");
    expect(vars["--color-surface-2"]).toBe("#f3f4f6");
    expect(vars["--color-border"]).toBe("#d1d5db");
  });

  it("maps brand, link, primary, accent and semantic colors", () => {
    const vars = generateOpenPropsVariables(fullTokens, { strategy: "exact" });

    expect(vars["--color-primary"]).toBe("#2563eb");
    expect(vars["--brand"]).toBe("#2563eb");
    expect(vars["--link"]).toBe("#2563eb");
    expect(vars["--color-accent"]).toBe("#f59e0b");
    expect(vars["--color-secondary"]).toBe("#e5e7eb");
    expect(vars["--color-muted"]).toBe("#f3f4f6");
    expect(vars["--color-muted-foreground"]).toBe("#6b7280");
    expect(vars["--color-error"]).toBe("#ef4444");
    expect(vars["--color-danger"]).toBe("#ef4444");
  });

  it("reads radius, fonts, shadows and spacing", () => {
    const vars = generateOpenPropsVariables(fullTokens, { strategy: "exact" });

    expect(vars["--radius-1"]).toBe("0.25rem");
    expect(vars["--radius-2"]).toBe("0.5rem");
    expect(vars["--radius-3"]).toBe("0.75rem");
    expect(vars["--radius-4"]).toBe("1rem");
    expect(vars["--font-sans"]).toBe("Inter, system-ui");
    expect(vars["--font-mono"]).toBe("ui-monospace, monospace");
    expect(vars["--shadow-1"]).toBe("0 1px 2px rgba(0,0,0,0.05)");
    expect(vars["--shadow-2"]).toBe("0 2px 4px rgba(0,0,0,0.06)");
    expect(vars["--size-1"]).toBe("0.25rem");
    expect(vars["--size-4"]).toBe("1rem");
    expect(vars["--size-12"]).toBe("3rem");
  });

  it("falls back to defaults when categories are missing", () => {
    const vars = generateOpenPropsVariables({ colors: {} }, { strategy: "exact" });

    expect(vars["--color-canvas"]).toBe("");
    expect(vars["--radius-1"]).toBe("0.25rem");
    expect(vars["--font-sans"]).toBe("system-ui, sans-serif");
    expect(vars["--shadow-1"]).toBe("0 1px 3px rgba(0,0,0,0.1)");
    expect(vars["--size-1"]).toBe("0.25rem");
  });

  it("applies refine and transform plugins", () => {
    const vars = generateOpenPropsVariables(fullTokens, {
      strategy: "native",
      plugins: [
        {
          transform(result) {
            return { ...result, "--custom-pad": "1.5rem" };
          },
        },
      ],
    });
    expect(vars["--custom-pad"]).toBe("1.5rem");
  });

  it("is deterministic", () => {
    const a = generateOpenPropsVariables(fullTokens, { strategy: "aggressive" });
    const b = generateOpenPropsVariables(fullTokens, { strategy: "aggressive" });
    expect(a).toEqual(b);
  });

  it("accepts raw tokens via createOpenPropsVariables", () => {
    const vars = createOpenPropsVariables(fullTokens);
    expect(vars["--color-primary"]).toBe("#2563eb");
    expect(vars["--size-8"]).toBe("2rem");
  });
});