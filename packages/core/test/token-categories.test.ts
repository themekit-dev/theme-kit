import { describe, expect, it } from "vitest";
import {
  composeTheme,
  defineTheme,
  getBuiltInThemes,
  resolveTheme,
  themeToCSSVariables,
} from "../src";
import { resolveTokens } from "../src/resolve";

describe("token categories: borderWidths, zIndex, breakpoints", () => {
  it("resolves borderWidths, zIndex and breakpoints via resolveTokens", () => {
    const tokens = resolveTokens({
      borderWidths: {
        thin: "$borderWidths.1",
        "1": "1px",
        "2": "2px",
      },
      zIndex: {
        dropdown: "$zIndex.50",
        "50": "50",
        modal: "$zIndex.100",
        "100": "100",
      },
      breakpoints: {
        sm: "$breakpoints.md",
        md: "768px",
      },
    });

    expect(tokens.borderWidths?.thin).toBe("1px");
    expect(tokens.zIndex?.dropdown).toBe("50");
    expect(tokens.zIndex?.modal).toBe("100");
    expect(tokens.breakpoints?.sm).toBe("768px");
  });

  it("emits CSS variables for the new categories", () => {
    const theme = defineTheme({
      name: "new-categories",
      tokens: {
        borderWidths: {
          "1": "1px",
          "2": "2px",
        },
        zIndex: {
          "10": "10",
          dropdown: "1000",
        },
        breakpoints: {
          sm: "640px",
          lg: "1024px",
        },
      },
    });

    const vars = themeToCSSVariables(theme);
    expect(vars["--theme-border-width-1"]).toBe("1px");
    expect(vars["--theme-border-width-2"]).toBe("2px");
    expect(vars["--theme-z-index-10"]).toBe("10");
    expect(vars["--theme-z-index-dropdown"]).toBe("1000");
    expect(vars["--theme-breakpoint-sm"]).toBe("640px");
    expect(vars["--theme-breakpoint-lg"]).toBe("1024px");
  });

  it("merges the new categories through compose", () => {
    const base = defineTheme({
      name: "base",
      tokens: {
        borderWidths: { "1": "1px", "2": "2px" },
        zIndex: { "10": "10" },
        breakpoints: { sm: "640px" },
      },
    });

    const override = defineTheme({
      name: "override",
      tokens: {
        borderWidths: { "4": "4px" },
        zIndex: { "50": "50" },
        breakpoints: { lg: "1024px" },
      },
    });

    const merged = composeTheme("merged", base, override);

    expect(merged.tokens?.borderWidths).toEqual({
      "1": "1px",
      "2": "2px",
      "4": "4px",
    });
    expect(merged.tokens?.zIndex).toEqual({ "10": "10", "50": "50" });
    expect(merged.tokens?.breakpoints).toEqual({
      sm: "640px",
      lg: "1024px",
    });
  });

  it("resolves references across the new categories through resolveTheme", () => {
    const base = defineTheme({
      name: "base",
      tokens: {
        borderWidths: { "1": "1px" },
        zIndex: { "50": "50" },
        breakpoints: { md: "768px" },
      },
    });

    const override = defineTheme({
      name: "override",
      tokens: {
        borderWidths: { hairline: "$borderWidths.1" },
        zIndex: { dropdown: "$zIndex.50" },
        breakpoints: { sm: "$breakpoints.md" },
      },
    });

    const merged = composeTheme("merged", base, override);
    const resolved = resolveTheme([base, override, merged], "merged");

    expect(resolved.tokens?.borderWidths?.hairline).toBe("1px");
    expect(resolved.tokens?.zIndex?.dropdown).toBe("50");
    expect(resolved.tokens?.breakpoints?.sm).toBe("768px");
  });

  it("emits code CSS variables only when a theme defines the code group", () => {
    const withCode = defineTheme({
      name: "with-code",
      tokens: {
        colors: { background: "#ffffff" },
        code: { background: "#161b22", keyword: "#ff7b72" },
      },
    });

    const withoutCode = defineTheme({
      name: "without-code",
      tokens: {
        colors: { background: "#000000" },
      },
    });

    const codeVars = themeToCSSVariables(withCode);
    expect(codeVars["--theme-code-background"]).toBe("#161b22");
    expect(codeVars["--theme-code-keyword"]).toBe("#ff7b72");

    const noCodeVars = themeToCSSVariables(withoutCode);
    expect(noCodeVars["--theme-code-background"]).toBeUndefined();
    expect(noCodeVars["--theme-code-keyword"]).toBeUndefined();
  });

  it("merges the code group through compose", () => {
    const base = defineTheme({
      name: "base",
      tokens: {
        code: { background: "#f6f8fa", keyword: "#d73a49" },
      },
    });

    const override = defineTheme({
      name: "override",
      tokens: {
        code: { foreground: "#24292e", string: "#032f62" },
      },
    });

    const merged = composeTheme("merged", base, override);

    expect(merged.tokens?.code).toEqual({
      background: "#f6f8fa",
      keyword: "#d73a49",
      foreground: "#24292e",
      string: "#032f62",
    });
  });

  it("includes full token sets in the neutral light/dark built-in themes", () => {
    const themes = getBuiltInThemes();
    const light = themes.find((t) => t.name === "light");
    const dark = themes.find((t) => t.name === "dark");

    for (const theme of [light, dark]) {
      expect(theme).toBeDefined();
      expect(theme!.tokens?.spacing).toBeDefined();
      expect(theme!.tokens?.spacing?.["4"]).toBe("16px");
      expect(theme!.tokens?.shadows).toBeDefined();
      expect(theme!.tokens?.shadows?.lg).toBeDefined();
      expect(theme!.tokens?.typography).toBeDefined();
      expect(theme!.tokens?.typography?.fontSizes).toBeDefined();
      expect(theme!.tokens?.typography?.lineHeights).toBeDefined();
      expect(theme!.tokens?.typography?.fontFamilies).toBeDefined();
      expect(theme!.tokens?.borderWidths).toBeDefined();
      expect(theme!.tokens?.zIndex).toBeDefined();
      expect(theme!.tokens?.breakpoints).toBeDefined();
      expect(theme!.tokens?.breakpoints?.md).toBe("768px");
    }
  });
});
