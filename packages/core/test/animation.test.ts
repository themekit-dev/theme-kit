// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import {
  createThemeDiff,
  createTransitionPlan,
  runThemeAnimation,
  cancelThemeAnimation,
} from "../src/animation";
import { registerThemeProperties } from "../src/adapters/dom/transition";

function flushFrames(count = 2) {
  const frames: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(new Promise((r) => requestAnimationFrame(() => r())));
  }
  return Promise.all(frames);
}

function vars(entries: Record<string, string>) {
  return new Map(Object.entries(entries));
}

beforeEach(() => {
  document.documentElement.style.cssText = "";
  document.body.innerHTML = "";
  document.querySelectorAll('style[data-theme-kit-transition]').forEach((n) => n.remove());
  cancelThemeAnimation(document.documentElement);
});

describe("Theme Diff Engine", () => {
  it("treats an empty baseline as no-change", () => {
    const diff = createThemeDiff(new Map(), { "--theme-color-background": "#fff" });
    expect(diff).toEqual({
      colors: false,
      radius: false,
      spacing: false,
      typography: false,
      shadows: false,
      borders: false,
      layout: false,
      transforms: false,
    });
  });

  it("flags only the groups whose values changed", () => {
    const prev = vars({
      "--theme-color-background": "#ffffff",
      "--theme-radius-lg": "12px",
      "--theme-spacing-md": "16px",
      "--theme-typography-font-size-base": "16px",
      "--theme-shadow-card": "none",
      "--theme-border-width-thin": "1px",
      "--theme-z-index-header": "50",
      "--theme-breakpoint-lg": "1024px",
    });
    const next = {
      ...Object.fromEntries(prev),
      "--theme-color-background": "#000000",
      "--theme-radius-lg": "20px",
    };
    const diff = createThemeDiff(prev, next);
    expect(diff.colors).toBe(true);
    expect(diff.radius).toBe(true);
    expect(diff.spacing).toBe(false);
    expect(diff.typography).toBe(false);
    expect(diff.shadows).toBe(false);
    expect(diff.borders).toBe(false);
    expect(diff.layout).toBe(false);
    expect(diff.transforms).toBe(false);
  });

  it("detects removed groups as changes", () => {
    const prev = vars({ "--theme-spacing-md": "16px" });
    const diff = createThemeDiff(prev, {});
    expect(diff.spacing).toBe(true);
  });

  it("flags layout for z-index and breakpoint changes", () => {
    const prev = vars({ "--theme-z-index-header": "50" });
    const diff = createThemeDiff(prev, { "--theme-z-index-header": "60" });
    expect(diff.layout).toBe(true);
    expect(diff.colors).toBe(false);
  });
});

describe("Transition Planner", () => {
  it("maps a colors-only diff to a root transition", () => {
    const diff = createThemeDiff(
      vars({ "--theme-color-background": "#fff" }),
      { "--theme-color-background": "#000" },
    );
    const plan = createTransitionPlan(diff);
    expect(plan).not.toBeNull();
    expect(plan!.animatesColors).toBe(true);
    expect(plan!.elementProperties).toEqual([]);
  });

  it("maps a radius diff to border-radius", () => {
    const diff = createThemeDiff(
      vars({ "--theme-radius-lg": "12px" }),
      { "--theme-radius-lg": "20px" },
    );
    const plan = createTransitionPlan(diff);
    expect(plan!.elementProperties).toContain("border-radius");
  });

  it("maps spacing to padding/margin/gap and typography to font props", () => {
    const diff = createThemeDiff(
      vars({ "--theme-spacing-md": "16px" }),
      { "--theme-spacing-md": "20px" },
    );
    const plan = createTransitionPlan(diff);
    expect(plan!.elementProperties).toEqual(
      expect.arrayContaining(["padding", "margin", "gap", "row-gap", "column-gap"]),
    );

    const typoDiff = createThemeDiff(
      vars({ "--theme-typography-font-size-base": "16px" }),
      { "--theme-typography-font-size-base": "18px" },
    );
    const typoPlan = createTransitionPlan(typoDiff);
    expect(typoPlan!.elementProperties).toEqual(
      expect.arrayContaining(["font-size", "line-height", "letter-spacing"]),
    );
    expect(typoPlan!.elementProperties).not.toContain("font-family");
  });

  it("maps shadows to box-shadow/filter/backdrop-filter", () => {
    const diff = createThemeDiff(
      vars({ "--theme-shadow-card": "none" }),
      { "--theme-shadow-card": "0 1px 2px #000" },
    );
    const plan = createTransitionPlan(diff);
    expect(plan!.elementProperties).toEqual(
      expect.arrayContaining(["box-shadow", "filter", "backdrop-filter"]),
    );
  });

  it("returns null when only non-animatable (layout) groups changed", () => {
    const diff = createThemeDiff(
      vars({ "--theme-z-index-header": "50" }),
      { "--theme-z-index-header": "60" },
    );
    expect(createTransitionPlan(diff)).toBeNull();
  });

  it("returns null when nothing changed", () => {
    const diff = createThemeDiff(vars({ "--theme-color-background": "#fff" }), {
      "--theme-color-background": "#fff",
    });
    expect(createTransitionPlan(diff)).toBeNull();
  });

  it("returns null when disabled or reduced motion", () => {
    const diff = createThemeDiff(
      vars({ "--theme-color-background": "#fff" }),
      { "--theme-color-background": "#000" },
    );
    expect(createTransitionPlan(diff, { enabled: false })).toBeNull();
    expect(
      createTransitionPlan(diff, undefined, { reducedMotion: true }),
    ).toBeNull();
  });

  it("returns null for the instant preset", () => {
    const diff = createThemeDiff(
      vars({ "--theme-color-background": "#fff" }),
      { "--theme-color-background": "#000" },
    );
    expect(createTransitionPlan(diff, { preset: "instant" })).toBeNull();
  });
});

describe("Animation Coordinator", () => {
  it("attaches root + element transitions, swaps on the next frame, then cleans up", async () => {
    registerThemeProperties(
      document.documentElement,
      { "--theme-color-background": "#ffffff" },
      "theme-",
    );
    document.body.innerHTML =
      '<div id="box" style="padding: 8px; border-radius: 4px"></div>';
    const target = document.documentElement;
    const swapped: string[] = [];

    runThemeAnimation({
      target,
      plan: {
        animatesColors: true,
        elementProperties: ["padding", "border-radius"],
        duration: 10,
        easing: "ease",
      },
      swap: () => swapped.push("swapped"),
      buffer: 0,
    });

    // Synchronously attached before the frame-batched swap.
    expect(target.style.transition).toContain("--theme-color-background");
    const box = document.getElementById("box")!;
    expect(box.style.transitionProperty).toContain("padding");
    expect(box.style.transitionDuration).toBe("10ms");

    await flushFrames();
    expect(swapped).toEqual(["swapped"]);

    // Cleanup after the longest transition finishes.
    await new Promise((r) => setTimeout(r, 20));
    expect(target.style.transition).toBe("");
    expect(box.style.transitionProperty).toBe("");
    expect(box.style.transitionDuration).toBe("");
  });

  it("does not scan invisible elements", async () => {
    document.body.innerHTML =
      '<div id="hidden" style="display:none; padding: 8px"></div>' +
      '<div id="visible" style="padding: 8px"></div>';
    const target = document.documentElement;
    const swapped: string[] = [];

    runThemeAnimation({
      target,
      plan: {
        animatesColors: false,
        elementProperties: ["padding"],
        duration: 10,
        easing: "ease",
      },
      swap: () => swapped.push("swapped"),
      buffer: 0,
    });

    const hidden = document.getElementById("hidden")!;
    const visible = document.getElementById("visible")!;
    expect(hidden.style.transitionProperty).toBe("");
    expect(visible.style.transitionProperty).toContain("padding");

    await flushFrames();
    await new Promise((r) => setTimeout(r, 20));
    expect(swapped).toEqual(["swapped"]);
  });

  it("suppresses descendant transitions during the window and restores them after", async () => {
    document.body.innerHTML =
      '<div id="self" style="transition: color 150ms ease"></div>';
    const target = document.documentElement;
    const swapped: string[] = [];

    runThemeAnimation({
      target,
      plan: { animatesColors: true, elementProperties: [], duration: 10, easing: "ease" },
      swap: () => swapped.push("swapped"),
      buffer: 0,
    });

    const el = document.getElementById("self")!;
    // While the animation runs, the element's own color transition is muted so
    // it can't double-ease the inherited theme-colour interpolation.
    expect(target.hasAttribute("data-theme-kit-animating")).toBe(true);
    expect(getComputedStyle(el).transitionDuration).toBe("0s");

    await flushFrames();
    expect(swapped).toEqual(["swapped"]);

    // After the swap settles, the element's original transition is restored
    // (inline untouched, suppression attribute cleared so the rule no longer
    // applies).
    await new Promise((r) => setTimeout(r, 20));
    expect(target.hasAttribute("data-theme-kit-animating")).toBe(false);
    expect(el.getAttribute("style")).toContain("150ms");
  });

  it("cancels a pending run when a new theme change arrives", async () => {
    const target = document.documentElement;
    const swapped: string[] = [];

    runThemeAnimation({
      target,
      plan: { animatesColors: true, elementProperties: [], duration: 10, easing: "ease" },
      swap: () => swapped.push("first"),
      buffer: 0,
    });
    runThemeAnimation({
      target,
      plan: { animatesColors: true, elementProperties: [], duration: 10, easing: "ease" },
      swap: () => swapped.push("second"),
      buffer: 0,
    });

    await flushFrames();
    expect(swapped).toEqual(["second"]);

    await new Promise((r) => setTimeout(r, 20));
    expect(target.style.transition).toBe("");
  });
});
