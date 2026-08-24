// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { computeFingerprint } from "../src/fingerprint";
import { createBlockingScript, buildThemeCssMap, darkModeCSSTemplate } from "../src/blocking-script";
import { getGlobalRuntime, setGlobalRuntime, requireGlobalRuntime } from "../src/shared-runtime";
import { createAstroThemePersistence } from "../src/persistence";
import { defineTheme } from "@theme-kit/core";

describe("fingerprint", () => {
  it("returns empty string for empty themes", () => {
    expect(computeFingerprint([])).toBe("");
  });

  it("returns sorted names prefixed with defaultTheme", () => {
    const themes = [
      defineTheme({ name: "dark", meta: { family: "default", mode: "dark" } }),
      defineTheme({ name: "light", meta: { family: "default", mode: "light" } }),
    ];
    expect(computeFingerprint(themes)).toBe("|dark,light");
    expect(computeFingerprint(themes, "light")).toBe("light|dark,light");
  });

  it("includes defaultTheme in fingerprint", () => {
    const themes = [
      defineTheme({ name: "light", meta: { family: "default", mode: "light" } }),
    ];
    expect(computeFingerprint(themes, "light")).toBe("light|light");
  });
});

describe("buildThemeCssMap", () => {
  it("builds map with theme names and family:mode keys", () => {
    const themes = [
      defineTheme({ name: "light", meta: { family: "default", mode: "light" }, tokens: { colors: { bg: "#fff" } } }),
      defineTheme({ name: "dark", meta: { family: "default", mode: "dark" }, tokens: { colors: { bg: "#000" } } }),
    ];
    const map = buildThemeCssMap(themes);
    expect(map["light"]).toBeDefined();
    expect(map["dark"]).toBeDefined();
    expect(map["default:light"]).toBeDefined();
    expect(map["default:dark"]).toBeDefined();
  });
});

describe("darkModeCSSTemplate", () => {
  it("generates media query with CSS variables", () => {
    const result = darkModeCSSTemplate({ "--color-bg": "#000" });
    expect(result).toContain("@media (prefers-color-scheme: dark)");
    expect(result).toContain("--color-bg: #000");
  });
});

describe("createBlockingScript", () => {
  it("returns a self-executing function string", () => {
    const result = createBlockingScript("test", {});
    expect(result).toContain("(function(){try{");
    expect(result).toContain("})()");
  });
});

describe("shared-runtime", () => {
  it("getGlobalRuntime returns null before set", () => {
    expect(getGlobalRuntime()).toBeNull();
  });

  it("requireGlobalRuntime throws before set", () => {
    expect(() => requireGlobalRuntime()).toThrow("ThemeRuntime not initialized");
  });

  it("setGlobalRuntime makes runtime accessible", () => {
    const mockRuntime = { store: {} } as any;
    setGlobalRuntime(mockRuntime);
    expect(getGlobalRuntime()).toBe(mockRuntime);
    expect(requireGlobalRuntime()).toBe(mockRuntime);
  });
});

describe("createAstroThemePersistence", () => {
  it("returns null when window is undefined", () => {
    const { window } = globalThis as any;
    (globalThis as any).window = undefined;
    const result = createAstroThemePersistence([]);
    expect(result).toBeNull();
    (globalThis as any).window = window;
  });
});
