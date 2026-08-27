// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import {
  createThemeRuntime,
  defineTheme,
  createCSSVariablesBinding,
  createDOMBinding,
} from "../src/index";

const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light", label: "Mint Light", order: 10 },
    tokens: { colors: { background: "#f8fafc", card: "#ffffff", primary: "#059669" } },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark", label: "Mint Dark", order: 20 },
    tokens: { colors: { background: "#020617", card: "#0f172a", primary: "#10b981" } },
  }),
];

function flushAnimationFrames(count = 4) {
  const frames: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(new Promise((r) => requestAnimationFrame(() => r())));
  }
  return Promise.all(frames);
}

describe("default transition behavior (no transition option)", () => {
  afterEach(() => {
    document.head.querySelectorAll("style[data-theme-kit-transition]").forEach((n) => n.remove());
    document.head
      .querySelectorAll("style[data-theme-kit-animating-style]")
      .forEach((n) => n.remove());
    document.documentElement.removeAttribute("data-theme-kit-animating");
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  it("CSS binding attaches a transition to :root when no transition option is passed", async () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "mint-light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    const css = createCSSVariablesBinding(runtime.store, {});
    const el = document.documentElement;

    // Toggle: colors change → plan should be non-null → coordinator should
    // attach the transition stylesheet + the animating attribute.
    runtime.selection.toggleTheme();

    // First frame runs the swap; by then the transition rule should be present.
    await flushAnimationFrames();

    const transitionStyle = document.head.querySelector("style[data-theme-kit-transition]");
    const animatingAttr = el.hasAttribute("data-theme-kit-animating");

    // The coordinator removes the attribute after the animation finishes, but
    // the persistent :root transition rule stays installed for future runs.
    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#020617");
    expect(!!transitionStyle).toBe(true);

    css?.destroy();
    runtime.destroy();
  });
});
