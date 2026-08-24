// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { themeToCSSVariables } from "../src/css";

const plainTheme = {
  name: "plain",
  tokens: { colors: { background: "#ffffff" } },
};

const codeTheme = {
  name: "codey",
  tokens: {
    colors: { background: "#ffffff" },
    code: {
      background: "#1e1e1e",
      foreground: "#d4d4d4",
      keyword: "#569cd6",
      string: "#ce9178",
      number: "#b5cea8",
      comment: "#6a9955",
    },
  },
};

// Item 13 decision: `tokens.code` is an OPT-IN semantic namespace. Themes
// without it must produce no `--theme-code-*` variables; themes with it emit
// them; and `themeToCSSVariables({ groups })` controls the code group exactly
// like every other token group.
describe("code token system (tokens.code — opt-in)", () => {
  it("emits no --theme-code-* variables for a theme without code tokens", () => {
    const variables = themeToCSSVariables(plainTheme);
    expect(Object.keys(variables).some((k) => k.includes("code"))).toBe(false);
    expect(variables["--theme-code-background"]).toBeUndefined();
  });

  it("emits --theme-code-* variables for a theme with code tokens", () => {
    const variables = themeToCSSVariables(codeTheme);
    expect(variables["--theme-code-background"]).toBe("#1e1e1e");
    expect(variables["--theme-code-keyword"]).toBe("#569cd6");
    expect(variables["--theme-code-string"]).toBe("#ce9178");
    expect(variables["--theme-code-number"]).toBe("#b5cea8");
  });

  it("excludes the code group when groups omits it", () => {
    const variables = themeToCSSVariables(codeTheme, { groups: ["colors"] });
    expect(Object.keys(variables).some((k) => k.includes("code"))).toBe(false);
    expect(variables["--theme-color-background"]).toBe("#ffffff");
  });

  it("emits only the code group when groups is ['code']", () => {
    const variables = themeToCSSVariables(codeTheme, { groups: ["code"] });
    const keys = Object.keys(variables);
    expect(keys.every((k) => k.includes("code"))).toBe(true);
    expect(keys.length).toBe(6);
  });

  it("all token groups default to included when groups is omitted", () => {
    const variables = themeToCSSVariables(codeTheme);
    expect(variables["--theme-color-background"]).toBe("#ffffff");
    expect(variables["--theme-code-keyword"]).toBe("#569cd6");
  });

  it("an empty code group produces no output", () => {
    const variables = themeToCSSVariables({
      name: "empty-code",
      tokens: { code: {} },
    });
    expect(Object.keys(variables).some((k) => k.includes("code"))).toBe(false);
  });
});
