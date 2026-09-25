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
    document.documentElement.removeAttribute("data-theme-kit-animating");
    document.documentElement.classList.remove("dark");
    // Clean up any transition stylesheets left in <head> by the coordinator.
    document.head
      .querySelectorAll("style[data-theme-kit-transition]")
      .forEach((n) => n.remove());
    document.head
      .querySelectorAll("style[data-theme-kit-animating-style]")
      .forEach((n) => n.remove());
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

  it("DOM binding disables transitions when transition.enabled is false", async () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "mint-light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    const dom = createDOMBinding(runtime.store, { transition: { enabled: false } });
    const css = createCSSVariablesBinding(runtime.store, { transition: { enabled: false } });

    const el = document.documentElement;

    // No View Transition API in jsdom; the CSS transition should not be attached
    // when enabled is explicitly false.
    runtime.selection.toggleTheme();

    expect(el.getAttribute("data-theme")).toBe("mint-dark");
    // No transition stylesheet should be present when transitions are disabled.
    expect(document.head.querySelector("style[data-theme-kit-transition]")).toBeNull();

    dom?.destroy();
    css?.destroy();
    runtime.destroy();
  });

  it("DOM binding applies instantly when transition is false", async () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "mint-light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    // Simulate what the framework providers do: resolve `false` to `{ enabled: false }`
    const resolvedTransition = { enabled: false };

    const dom = createDOMBinding(runtime.store, { transition: resolvedTransition });
    const css = createCSSVariablesBinding(runtime.store, { transition: resolvedTransition });

    const el = document.documentElement;

    runtime.selection.toggleTheme();

    expect(el.getAttribute("data-theme")).toBe("mint-dark");
    expect(document.head.querySelector("style[data-theme-kit-transition]")).toBeNull();

    dom?.destroy();
    css?.destroy();
    runtime.destroy();
  });
});
