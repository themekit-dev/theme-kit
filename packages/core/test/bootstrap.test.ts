// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  buildThemeCssMap,
  createThemeBootstrapScript,
  darkModeCSSTemplate,
} from "../src";
import { defineTheme } from "../src/model";

const themes = [
  defineTheme({
    name: "sunrise-light",
    meta: { family: "sunrise", mode: "light" },
    tokens: {
      colors: {
        background: "#fff7ed",
        foreground: "#431407",
        primary: "#ea580c",
      },
      radius: { lg: "16px" },
    },
  }),
  defineTheme({
    name: "sunrise-dark",
    meta: { family: "sunrise", mode: "dark" },
    tokens: {
      colors: {
        background: "#431407",
        foreground: "#fff7ed",
        primary: "#fb923c",
      },
      radius: { lg: "16px" },
    },
  }),
] as const;

function runScript(script: string) {
  const fn = new Function(script);
  fn();
}

describe("buildThemeCssMap", () => {
  it("registers themes under name and family:mode keys", () => {
    const map = buildThemeCssMap(themes);

    expect(map["sunrise-light"]["--theme-color-background"]).toBe("#fff7ed");
    expect(map["sunrise:light"]["--theme-color-background"]).toBe("#fff7ed");
    expect(map["sunrise-dark"]["--theme-color-background"]).toBe("#431407");
    expect(map["sunrise:dark"]["--theme-color-background"]).toBe("#431407");
    expect(map["sunrise:light"]["--theme-radius-lg"]).toBe("16px");
  });

  it("honors a custom prefix", () => {
    const map = buildThemeCssMap(themes, { prefix: "ui-" });
    expect(map["sunrise:light"]["--ui-color-background"]).toBe("#fff7ed");
  });
});

describe("createThemeBootstrapScript", () => {
  it("applies the persisted dark selection before paint", () => {
    window.localStorage.setItem(
      "theme-selection",
      JSON.stringify({ mode: "dark", family: "sunrise" }),
    );

    const script = createThemeBootstrapScript({ themes });

    runScript(script);

    const el = document.documentElement;
    expect(el.style.getPropertyValue("--theme-color-background")).toBe(
      "#431407",
    );
    expect(el.style.getPropertyValue("--theme-color-foreground")).toBe(
      "#fff7ed",
    );
    expect(el.getAttribute("data-theme")).toBe("sunrise-dark");
    expect(el.getAttribute("data-theme-mode")).toBe("dark");
    expect(el.getAttribute("data-theme-family")).toBe("sunrise");
    expect(el.classList.contains("dark")).toBe(true);
    expect(el.style.colorScheme).toBe("dark");

    window.localStorage.removeItem("theme-selection");
  });

  it("falls back to the default theme when nothing is persisted", () => {
    window.localStorage.removeItem("theme-selection");

    const script = createThemeBootstrapScript({ themes });

    runScript(script);

    const el = document.documentElement;
    expect(el.style.getPropertyValue("--theme-color-background")).toBe(
      "#fff7ed",
    );
    expect(el.getAttribute("data-theme")).toBe("sunrise-light");
    expect(el.getAttribute("data-theme-mode")).toBe("light");
  });

  it("uses a custom storage key", () => {
    window.localStorage.setItem(
      "my-key",
      JSON.stringify({ mode: "dark", family: "sunrise" }),
    );

    const script = createThemeBootstrapScript({
      themes,
      storageKey: "my-key",
    });
    expect(script).toContain("my-key");

    runScript(script);

    expect(
      document.documentElement.style.getPropertyValue(
        "--theme-color-background",
      ),
    ).toBe("#431407");

    window.localStorage.removeItem("my-key");
  });
});

describe("darkModeCSSTemplate", () => {
  it("wraps variables in a prefers-color-scheme media query", () => {
    const css = darkModeCSSTemplate({ "--theme-color-background": "#000" });
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("--theme-color-background: #000;");
  });
});
