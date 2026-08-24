import { describe, expect, it } from "vitest";
import {
  composeTheme,
  defineTheme,
  resolveTheme,
  themeToCSSVariables,
} from "../src";

describe("semantic color groups", () => {
  it("allows nested color groups in theme definition", () => {
    const theme = defineTheme({
      name: "nested",
      tokens: {
        colors: {
          surface: {
            default: "#ffffff",
            hover: "#f5f5f5",
            active: "#e0e0e0",
            disabled: "#cccccc",
          },
          text: {
            default: "#000000",
            muted: "#666666",
            link: "#3b82f6",
          },
        },
      },
    });

    expect(theme.tokens?.colors?.surface).toEqual({
      default: "#ffffff",
      hover: "#f5f5f5",
      active: "#e0e0e0",
      disabled: "#cccccc",
    });
  });

  it("generates CSS variables from nested groups", () => {
    const theme = defineTheme({
      name: "nested-css",
      tokens: {
        colors: {
          surface: {
            default: "#ffffff",
            hover: "#f5f5f5",
          },
          text: {
            default: "#000000",
          },
        },
      },
    });

    const vars = themeToCSSVariables(theme);
    expect(vars["--theme-color-surface-default"]).toBe("#ffffff");
    expect(vars["--theme-color-surface-hover"]).toBe("#f5f5f5");
    expect(vars["--theme-color-text-default"]).toBe("#000000");
  });

  it("merges nested colors through compose", () => {
    const base = defineTheme({
      name: "base",
      tokens: {
        colors: {
          surface: {
            default: "#ffffff",
            hover: "#f0f0f0",
          },
          text: {
            default: "#000000",
          },
        },
      },
    });

    const override = defineTheme({
      name: "override",
      tokens: {
        colors: {
          surface: {
            hover: "#e0e0e0",
            active: "#d0d0d0",
          },
        },
      },
    });

    const merged = composeTheme("merged", base, override);

    expect(merged.tokens?.colors?.surface).toEqual({
      default: "#ffffff",
      hover: "#e0e0e0",
      active: "#d0d0d0",
    });
    expect(merged.tokens?.colors?.text).toEqual({
      default: "#000000",
    });
  });

  it("flat and nested tokens coexist", () => {
    const theme = defineTheme({
      name: "hybrid",
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          surface: {
            default: "#f5f5f5",
          },
        },
      },
    });

    const vars = themeToCSSVariables(theme);
    expect(vars["--theme-color-background"]).toBe("#ffffff");
    expect(vars["--theme-color-foreground"]).toBe("#000000");
    expect(vars["--theme-color-surface-default"]).toBe("#f5f5f5");
  });

  it("deeply nested groups generate correct CSS variable names", () => {
    const theme = defineTheme({
      name: "deep",
      tokens: {
        colors: {
          components: {
            button: {
              primary: {
                bg: "#3b82f6",
                text: "#ffffff",
              },
            },
            card: {
              bg: "#ffffff",
              border: "#e2e8f0",
            },
          },
        },
      },
    });

    const vars = themeToCSSVariables(theme);
    expect(vars["--theme-color-components-button-primary-bg"]).toBe("#3b82f6");
    expect(vars["--theme-color-components-button-primary-text"]).toBe("#ffffff");
    expect(vars["--theme-color-components-card-bg"]).toBe("#ffffff");
    expect(vars["--theme-color-components-card-border"]).toBe("#e2e8f0");
  });

  it("merges nested colors through composed inheritance", () => {
    const base = defineTheme({
      name: "base-theme",
      tokens: {
        colors: {
          surface: { default: "#ffffff" },
          text: { default: "#000000", muted: "#666666" },
        },
      },
    });

    const override = defineTheme({
      name: "child-theme",
      tokens: {
        colors: {
          surface: { hover: "#e0e0e0" },
          text: { muted: "#888888" },
        },
      },
    });

    const merged = composeTheme("final", base, override);
    const allThemes = [base, override, merged];
    const resolved = resolveTheme(allThemes, "final");

    expect(resolved.tokens?.colors?.surface).toEqual({
      default: "#ffffff",
      hover: "#e0e0e0",
    });
    expect(resolved.tokens?.colors?.text).toEqual({
      default: "#000000",
      muted: "#888888",
    });
  });
});
