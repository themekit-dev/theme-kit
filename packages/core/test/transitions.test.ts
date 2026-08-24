// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import { createThemeRuntime, defineTheme } from "../src";

function flushFrames(count = 2) {
  const frames: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(new Promise((r) => requestAnimationFrame(() => r())));
  }
  return Promise.all(frames);
}

beforeEach(() => {
  // Isolate file-level state shared by the runtime's default persistence and
  // the DOM bindings: reset styles, clear stored selection, and undo any attrs
  // a prior test left on the shared <html>.
  document.documentElement.style.cssText = "";
  document.querySelectorAll('style[data-theme-kit-transition]').forEach((n) => n.remove());
  document.documentElement.removeAttribute("data-theme-kit-animating");
  document.documentElement.classList.remove("dark");
  document.documentElement.removeAttribute("data-theme");
  window.localStorage.clear();
});

describe("theme transitions", () => {
  const themes = [
    defineTheme({
      name: "light",
      meta: { family: "default", mode: "light" },
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#000000",
        },
      },
    }),
    defineTheme({
      name: "dark",
      meta: { family: "default", mode: "dark" },
      tokens: {
        colors: {
          background: "#000000",
          foreground: "#ffffff",
        },
      },
    }),
  ];

  it("transitions the theme custom properties on :root when colors change", async () => {
    const runtime = createThemeRuntime({
      themes,
      initialMode: "light",
      transition: { enabled: true, duration: 300, easing: "ease-in-out" },
    });

    // Boot applies the baseline instantly — no transition is attached.
    expect(document.documentElement.style.transition).toBe("");

    runtime.selection.setMode("dark");

    // The coordinator attaches the transition synchronously (before the
    // frame-batched variable swap), listing the registered color variables.
    const style = document.documentElement.style.transition;
    expect(style).toContain("--theme-color-background");
    expect(style).toContain("300ms");
    expect(style).toContain("ease-in-out");

    await flushFrames();
    expect(
      document.documentElement.style.getPropertyValue("--theme-color-background"),
    ).toBe("#000000");

    runtime.destroy();
  });

  it("uses the View Transition API for the cross-fade when enabled and supported", async () => {
    const calls: string[] = [];
    (document as any).startViewTransition = (cb: () => void) => {
      calls.push("startViewTransition");
      const result = cb();
      return {
        ready: Promise.resolve(),
        finished: Promise.resolve(result),
      };
    };
    try {
      const runtime = createThemeRuntime({
        themes,
        initialMode: "light",
        transition: {
          enabled: true,
          duration: 300,
          useViewTransition: true,
        },
      });

      runtime.selection.setMode("dark");

      // The cross-fade is owned by the View Transition, so the redundant,
      // double-applying CSS transition must NOT be injected.
      expect(calls).toContain("startViewTransition");
      expect(document.documentElement.style.transition).toBe("");

      // The new variables apply inside the transition callback (no frame
      // batching, no CSS easing), so they are in place immediately.
      expect(
        document.documentElement.style.getPropertyValue("--theme-color-background"),
      ).toBe("#000000");

      runtime.destroy();
    } finally {
      delete (document as any).startViewTransition;
    }
  });

  it("falls back to the CSS-variable transition when the API is unsupported", async () => {
    const runtime = createThemeRuntime({
      themes,
      initialMode: "light",
      transition: {
        enabled: true,
        duration: 300,
        useViewTransition: true, // requested, but startViewTransition absent
      },
    });

    runtime.selection.setMode("dark");

    // No View Transition → the coordinator's CSS-variable transition runs and
    // lists the registered color variables before the frame-batched swap.
    expect(document.documentElement.style.transition).toContain(
      "--theme-color-background",
    );

    await flushFrames();
    expect(
      document.documentElement.style.getPropertyValue("--theme-color-background"),
    ).toBe("#000000");

    runtime.destroy();
  });

  it("does not add transition when disabled", () => {
    const runtime = createThemeRuntime({
      themes,
      initialMode: "light",
      dom: false,
      cssVariables: false,
    });

    expect(document.documentElement.style.transition).toBe("");

    runtime.destroy();
  });

  it("does not add transition when enabled but dom is disabled", () => {
    const runtime = createThemeRuntime({
      themes,
      initialMode: "light",
      transition: { enabled: true },
      dom: false,
      cssVariables: false,
    });

    expect(document.documentElement.style.transition).toBe("");

    runtime.destroy();
  });
});
