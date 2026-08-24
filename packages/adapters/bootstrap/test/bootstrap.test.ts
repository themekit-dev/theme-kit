import { describe, expect, it } from "vitest";
import { createBootstrapVariables } from "../src/mapping";

const tokens = {
  colors: {
    background: "#f8fafc",
    foreground: "#0f172a",
    primary: "#d97706",
    secondary: "#e2e8f0",
    accent: "#f59e0b",
    destructive: "#ef4444",
    border: "#e2e8f0",
    muted: "#e2e8f0",
  },
  radius: { lg: "16px", md: "8px", sm: "4px" },
  typography: {
    fontFamilies: { sans: "Inter, sans-serif" },
  },
};

describe("createBootstrapVariables", () => {
  it("maps primary and foreground", () => {
    const v = createBootstrapVariables(tokens);
    expect(v["--bs-primary"]).toBe("#d97706");
    expect(v["--bs-body-bg"]).toBe("#f8fafc");
    expect(v["--bs-body-color"]).toBe("#0f172a");
  });

  it("produces rgb triplets for primary colors", () => {
    const v = createBootstrapVariables(tokens);
    expect(v["--bs-primary-rgb"]).toBe("217, 119, 6");
  });

  it("maps border radius", () => {
    const v = createBootstrapVariables(tokens);
    expect(v["--bs-border-radius-lg"]).toBe("16px");
    expect(v["--bs-border-radius"]).toBe("8px");
  });

  it("maps font family", () => {
    const v = createBootstrapVariables(tokens);
    expect(v["--bs-body-font-family"]).toBe("Inter, sans-serif");
  });
});