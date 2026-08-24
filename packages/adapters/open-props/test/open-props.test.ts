import { describe, expect, it } from "vitest";
import { createOpenPropsVariables } from "../src/generator";

const tokens = {
  colors: {
    background: "#f8fafc",
    foreground: "#0f172a",
    primary: "#d97706",
    accent: "#f59e0b",
    secondary: "#e2e8f0",
    muted: "#e2e8f0",
    border: "#e2e8f0",
    destructive: "#ef4444",
  },
  radius: { lg: "16px", md: "8px", sm: "4px", xl: "24px" },
  typography: {
    fontFamilies: { sans: "Inter, sans-serif", mono: "ui-monospace, monospace" },
  },
  spacing: { 4: "1rem", 8: "2rem" },
  shadows: { md: "0 4px 6px rgba(0,0,0,0.07)" },
};

describe("createOpenPropsVariables", () => {
  it("maps primary and background", () => {
    const v = createOpenPropsVariables(tokens);
    expect(v["--color-primary"]).toBe("#d97706");
    expect(v["--color-background"]).toBe("#f8fafc");
    expect(v["--color-text"]).toBe("#0f172a");
  });

  it("maps radius and font", () => {
    const v = createOpenPropsVariables(tokens);
    expect(v["--radius-3"]).toBe("16px");
    expect(v["--font-sans"]).toBe("Inter, sans-serif");
  });

  it("maps spacing and shadows", () => {
    const v = createOpenPropsVariables(tokens);
    expect(v["--size-4"]).toBe("1rem");
    expect(v["--shadow-2"]).toBe("0 4px 6px rgba(0,0,0,0.07)");
  });
});