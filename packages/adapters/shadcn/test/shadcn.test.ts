import { describe, expect, it } from "vitest";
import { createShadcnVariables } from "../src/generator";

const tokens = {
  colors: {
    background: "#f8fafc",
    foreground: "#0f172a",
    card: "#ffffff",
    primary: "#d97706",
    secondary: "#e2e8f0",
    muted: "#e2e8f0",
    accent: "#f59e0b",
    destructive: "#ef4444",
    border: "#e2e8f0",
    ring: "#d97706",
  },
  radius: { lg: "16px" },
};

describe("createShadcnVariables", () => {
  it("maps primary semantic tokens to shadcn variables", () => {
    const v = createShadcnVariables(tokens);
    expect(v["--background"]).toBe("#f8fafc");
    expect(v["--primary"]).toBe("#d97706");
    expect(v["--destructive"]).toBe("#ef4444");
    expect(v["--radius"]).toBe("16px");
  });

  it("falls back to empty when a foreground pair is missing", () => {
    const v = createShadcnVariables(tokens);
    expect(v["--primary-foreground"]).toBe("");
  });

  it("handles missing optional tokens gracefully", () => {
    const v = createShadcnVariables({ primary: "#000" });
    expect(v["--background"]).toBe("");
  });
});