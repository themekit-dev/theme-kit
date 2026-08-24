// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { defineTheme } from "../src";
import {
  createScopedThemeBinding,
  resolveScopeTransition,
  resolveScopedTheme,
  resolveScopedThemePrePaint,
  scopeToCSSVariables,
} from "../src/adapters/scoped-theme";

const themes = [
  defineTheme({
    name: "default-light",
    meta: { family: "default", mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        surface: { default: "#f5f5f5" },
      },
      spacing: { sm: "0.5rem", md: "1rem" },
    },
  }),
  defineTheme({
    name: "plum-dark",
    meta: { family: "plum", mode: "dark" },
    tokens: {
      colors: {
        background: "#1e1b2e",
        surface: { default: "#2d2a3d" },
        primary: "#a78bfa",
      },
    },
  }),
  defineTheme({
    name: "plum-light",
    meta: { family: "plum", mode: "light" },
    tokens: {
      colors: {
        background: "#fff7ed",
        surface: { default: "#f5edff" },
        primary: "#7c3aed",
      },
    },
  }),
  defineTheme({
    name: "forest",
    meta: { family: "forest", mode: "light" },
    tokens: {
      colors: {
        background: "#1a3a2a",
        surface: { default: "#2d5a3d" },
      },
    },
  }),
];

describe("createScopedThemeBinding", () => {
  it("applies CSS variables for the given theme to the target element", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest");

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#1a3a2a");
    expect(el.style.getPropertyValue("--theme-color-surface-default")).toBe("#2d5a3d");
    expect(el.style.getPropertyValue("--theme-spacing-sm")).toBe("");

    binding.destroy();
  });

  it("clears variables on destroy", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest");

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#1a3a2a");

    binding.destroy();

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("");
  });

  it("updates variables when update() is called", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest");

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#1a3a2a");

    binding.update("default-light");

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#ffffff");
    expect(el.style.getPropertyValue("--theme-spacing-sm")).toBe("0.5rem");

    binding.destroy();
  });

  it("clears old variables on update", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest");

    expect(el.style.getPropertyValue("--theme-spacing-sm")).toBe("");

    binding.update("default-light");

    expect(el.style.getPropertyValue("--theme-spacing-sm")).toBe("0.5rem");
    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#ffffff");

    binding.destroy();
  });

  it("uses custom prefix when provided", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest", {
      prefix: "custom-",
    });

    expect(el.style.getPropertyValue("--custom-color-background")).toBe("#1a3a2a");
    expect(el.style.getPropertyValue("--theme-color-background")).toBe("");

    binding.destroy();
  });

  it("passes transition through when provided", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest", {
      transition: { duration: 300, easing: "cubic-bezier(0.4,0,0.2,1)" },
    });

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#1a3a2a");

    binding.destroy();
  });

  it("does not crash when no transition is provided", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest");

    expect(el.style.getPropertyValue("--theme-color-background")).toBe("#1a3a2a");

    binding.destroy();
  });

  it("sets data-mode and dark class for dark scoped themes", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "plum-dark");

    expect(el.getAttribute("data-theme")).toBe("plum-dark");
    expect(el.getAttribute("data-mode")).toBe("dark");
    expect(el.classList.contains("dark")).toBe(true);

    binding.update("plum-light");
    expect(el.getAttribute("data-mode")).toBe("light");
    expect(el.classList.contains("dark")).toBe(false);

    binding.destroy();
    expect(el.hasAttribute("data-theme")).toBe(false);
    expect(el.hasAttribute("data-mode")).toBe(false);
  });

  it("resolves a family+mode selection", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, {
      family: "plum",
      mode: "dark",
    });

    expect(el.getAttribute("data-theme")).toBe("plum-dark");
    expect(el.style.getPropertyValue("--theme-color-primary")).toBe("#a78bfa");

    binding.update({ family: "plum", mode: "light" });
    expect(el.getAttribute("data-theme")).toBe("plum-light");

    binding.destroy();
  });

  it("resolves a bare family name to its light theme", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "plum");

    expect(el.getAttribute("data-theme")).toBe("plum-light");

    binding.destroy();
  });

  it("falls back to the first theme for an unknown name", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "does-not-exist");

    expect(el.getAttribute("data-theme")).toBe("default-light");

    binding.destroy();
  });

  it("resolves local themes first, falling back to parent themes", () => {
    const local = [
      defineTheme({
        name: "checkout",
        meta: { family: "checkout", mode: "light" },
        tokens: {
          colors: {
            background: "#ffffff",
            primary: "#6366f1",
          },
        },
      }),
    ];

    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "checkout", {
      localThemes: local,
    });

    expect(el.getAttribute("data-theme")).toBe("checkout");
    expect(el.style.getPropertyValue("--theme-color-primary")).toBe("#6366f1");

    // Parent themes still resolve after local ones are missed.
    binding.update("plum-dark");
    expect(el.getAttribute("data-theme")).toBe("plum-dark");

    binding.destroy();
  });

  it("local theme names shadow parent themes of the same name", () => {
    const local = [
      defineTheme({
        name: "plum-dark",
        meta: { family: "plum", mode: "dark" },
        tokens: {
          colors: {
            background: "#0a0a0a",
            primary: "#111111",
          },
        },
      }),
    ];

    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "plum-dark", {
      localThemes: local,
    });

    expect(el.style.getPropertyValue("--theme-color-primary")).toBe("#111111");

    binding.destroy();
  });

  it("updates to a family+mode selection reactively", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, {
      family: "plum",
      mode: "light",
    });

    expect(el.getAttribute("data-theme")).toBe("plum-light");

    binding.update({ family: "plum", mode: "dark" });
    expect(el.getAttribute("data-theme")).toBe("plum-dark");

    binding.destroy();
  });

  it("applies themes using a custom variable prefix (diffing included)", () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "plum-dark", {
      prefix: "checkout-",
    });

    expect(el.style.getPropertyValue("--checkout-color-primary")).toBe("#a78bfa");
    expect(el.style.getPropertyValue("--theme-color-primary")).toBe("");

    binding.update("plum-light");
    expect(el.style.getPropertyValue("--checkout-color-primary")).toBe("#7c3aed");

    binding.destroy();
    expect(el.style.getPropertyValue("--checkout-color-primary")).toBe("");
  });

  it("supports setLocalThemes + setTransition without recreating", async () => {
    const el = document.createElement("div");
    const binding = createScopedThemeBinding(themes, el, "forest");

    binding.setTransition({ duration: 200, easing: "ease-out" });
    binding.setLocalThemes([
      defineTheme({
        name: "coin",
        meta: { family: "coin", mode: "dark" },
        tokens: {
          colors: { background: "#101010", primary: "#facc15" },
        },
      }),
    ]);

    binding.update("coin");

    // The transition runs through rAF + a cleanup timer when animating.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(el.style.getPropertyValue("--theme-color-primary")).toBe("#facc15");

    binding.destroy();
  });
});

describe("resolveScopedTheme", () => {
  it("resolves exact names", () => {
    expect(resolveScopedTheme(themes, "plum-dark").name).toBe("plum-dark");
  });

  it("resolves family/mode and family alone", () => {
    expect(resolveScopedTheme(themes, { family: "plum", mode: "dark" }).name).toBe("plum-dark");
    expect(resolveScopedTheme(themes, { family: "plum" }).name).toBe("plum-light");
  });

  it("resolves a family name passed as a bare string", () => {
    expect(resolveScopedTheme(themes, "plum").name).toBe("plum-light");
  });

  it("prefers local themes when given an already-combined list", () => {
    const local = [
      defineTheme({ name: "solo", meta: { family: "solo", mode: "light" } }),
    ];
    expect(resolveScopedTheme([...local, ...themes], "solo").name).toBe("solo");
  });
});

describe("scopeToCSSVariables", () => {
  it("maps --theme-color-* and --theme-radius-* into --color-* / --radius-*", () => {
    const vars = scopeToCSSVariables({
      "--theme-color-cardForeground": "#fafaf9",
      "--theme-radius-lg": "14px",
      "--theme-color-card": "#ffffff",
      "--theme-spacing-sm": "0.5rem",
    });
    expect(vars).toEqual({
      "--color-card-foreground": "#fafaf9",
      "--color-card": "#ffffff",
      "--radius-lg": "14px",
    });
  });

  it("respects a custom prefix", () => {
    const vars = scopeToCSSVariables(
      { "--checkout-color-primary": "#6366f1" },
      "checkout-",
    );
    expect(vars).toEqual({ "--color-primary": "#6366f1" });
  });
});

describe("resolveScopedThemePrePaint", () => {
  it("marks system-mode family selections and emits a media-query block", () => {
    const sel = { family: "plum", mode: "system" as const };
    const result = resolveScopedThemePrePaint(themes, sel, {
      selector: "[data-tk='scope']",
    });

    expect(result.systemBased).toBe(true);
    expect(result.name).toBe("plum-light");
    expect(result.isDark).toBe(false);
    expect(result.lightVariables).toEqual(
      expect.objectContaining({
        "--theme-color-background": "#fff7ed",
        "--theme-color-surface-default": "#f5edff",
        "--color-background": "#fff7ed",
        "--color-surface-default": "#f5edff",
        "--color-primary": "#7c3aed",
      }),
    );
    expect(result.css).toContain("[data-tk='scope']");
    expect(result.css).toContain("@media (prefers-color-scheme: dark)");
    // The dark block switches the family's dark theme values.
    const darkBlock = result.css!.split(
      "@media (prefers-color-scheme: dark)",
    )[1];
    expect(darkBlock).toContain("--theme-color-background: #1e1b2e");
    expect(darkBlock).toContain("--color-background: #1e1b2e");
  });

  it("treats family selections without an explicit mode as light-locked", () => {
    const bare = resolveScopedThemePrePaint(themes, "plum");
    expect(bare.systemBased).toBe(false);
    expect(bare.css).toBeNull();

    const noMode = resolveScopedThemePrePaint(themes, { family: "plum" });
    expect(noMode.systemBased).toBe(false);
    expect(noMode.css).toBeNull();
  });

  it("leaves explicit light/dark family modes inline (no media block)", () => {
    const light = resolveScopedThemePrePaint(themes, {
      family: "plum",
      mode: "light",
    });
    expect(light.systemBased).toBe(false);
    expect(light.css).toBeNull();
    expect(light.lightVariables["--theme-color-background"]).toBe("#fff7ed");

    const dark = resolveScopedThemePrePaint(themes, {
      family: "plum",
      mode: "dark",
    });
    expect(dark.systemBased).toBe(false);
    expect(dark.isDark).toBe(true);
    expect(dark.lightVariables["--theme-color-background"]).toBe("#1e1b2e");
  });

  it("keeps exact-name locks inline regardless of OS", () => {
    const exact = resolveScopedThemePrePaint(themes, "plum-light");
    expect(exact.systemBased).toBe(false);
    expect(exact.css).toBeNull();
    expect(exact.lightVariables["--theme-color-background"]).toBe("#fff7ed");
  });

  it("uses the default selector when none is provided", () => {
    const result = resolveScopedThemePrePaint(themes, {
      family: "plum",
      mode: "system",
    });
    expect(result.css).toContain("[data-theme-kit-scope]");
  });
});

describe("resolveScopeTransition", () => {
  const parent = { enabled: true, duration: 360, easing: "ease", preset: "smooth" as const };

  it("inherits the parent transition when unset or true", () => {
    expect(resolveScopeTransition(parent, undefined)).toEqual(parent);
    expect(resolveScopeTransition(parent, true)).toEqual(parent);
  });

  it("merges local overrides over the parent", () => {
    expect(resolveScopeTransition(parent, { duration: 200 })).toEqual({
      enabled: true,
      duration: 200,
      easing: "ease",
      preset: "smooth",
    });
    expect(resolveScopeTransition(parent, { easing: "ease-out" })).toEqual({
      enabled: true,
      duration: 360,
      easing: "ease-out",
      preset: "smooth",
    });
  });

  it("disables transitions when false", () => {
    expect(resolveScopeTransition(parent, false)).toEqual({ enabled: false });
  });

  it("returns only local options when no parent exists", () => {
    expect(resolveScopeTransition(undefined, { duration: 120 })).toEqual({
      duration: 120,
    });
    expect(resolveScopeTransition(undefined, false)).toEqual({ enabled: false });
  });
});
