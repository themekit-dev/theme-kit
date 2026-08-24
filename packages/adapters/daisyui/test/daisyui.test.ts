import { describe, expect, it } from "vitest";
import { createDaisyVariables } from "../src/generator";

const tokens = {
  colors: {
    background: "#f8fafc",
    foreground: "#0f172a",
    primary: "#d97706",
    primaryForeground: "#ffffff",
    secondary: "#e2e8f0",
    secondaryForeground: "#0f172a",
    accent: "#f59e0b",
    accentForeground: "#0f172a",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    muted: "#e2e8f0",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
  },
  radius: { lg: "16px", md: "8px", sm: "4px" },
  borderWidths: { _default: "1px" },
};

describe("createDaisyVariables", () => {
  it("maps primary semantic tokens", () => {
    const v = createDaisyVariables(tokens);
    expect(v["--color-primary"]).toBe("#d97706");
    expect(v["--color-primary-content"]).toBe("#ffffff");
    expect(v["--color-base-100"]).toBe("#f8fafc");
    expect(v["--color-base-content"]).toBe("#0f172a");
  });

  it("maps error and accent", () => {
    const v = createDaisyVariables(tokens);
    expect(v["--color-error"]).toBe("#ef4444");
    expect(v["--color-accent"]).toBe("#f59e0b");
  });

  it("maps radius tokens", () => {
    const v = createDaisyVariables(tokens);
    expect(v["--radius-box"]).toBe("16px");
    expect(v["--radius-field"]).toBe("8px");
    expect(v["--radius-selector"]).toBe("4px");
  });
});