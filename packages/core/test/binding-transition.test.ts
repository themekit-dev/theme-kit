// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createDOMBinding, createCSSVariablesBinding } from "@theme-kit/core";

const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light", label: "Mint Light", order: 10 },
    tokens: {
      colors: {
        background: "#f8fafc",
        card: "#ffffff",
        primary: "#059669",
      },
    },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark", label: "Mint Dark", order: 20 },
    tokens: {
      colors: {
        background: "#020617",
        card: "#0f172a",
        primary: "#10b981",
      },
    },
  }),
];

describe("core DOM + CSS bindings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-mode");
    document.documentElement.removeAttribute("data-theme-family");
    document.documentElement.classList.remove("dark");
  });

  it("DOM binding applies store changes when transition enabled", () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "mint-light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    const dom = createDOMBinding(runtime.store, { transition: { enabled: true } });
    const css = createCSSVariablesBinding(runtime.store, { transition: { enabled: true } });

    const el = document.documentElement;
    expect(el.getAttribute("data-theme")).toBe("mint-light");

    runtime.selection.toggleTheme();
    expect(el.getAttribute("data-theme")).toBe("mint-dark");

    dom?.destroy();
    css?.destroy();
    runtime.destroy();
  });
});
