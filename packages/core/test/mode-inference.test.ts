// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, getThemeMode, resolveThemeName, resolveSelectedTheme } from "../src";

// Regression: mode resolution must work for plain theme definitions that omit
// `meta.mode`. Previously `setMode("dark")` / `toggleTheme()` were silent
// no-ops when themes were written as `[{ name: "light" }, { name: "dark" }]`
// (the most common way a fresh Vite/React app defines them).

const plainThemes = [
  { name: "light", tokens: {} },
  { name: "dark", tokens: {} },
];

const metaThemes = [
  { name: "mint-light", meta: { mode: "light" }, tokens: {} },
  { name: "mint-dark", meta: { mode: "dark" }, tokens: {} },
];

describe("getThemeMode — name-based inference", () => {
  it("infers dark from the name when meta.mode is absent", () => {
    expect(getThemeMode({ name: "dark", tokens: {} })).toBe("dark");
    expect(getThemeMode({ name: "mint-dark", tokens: {} })).toBe("dark");
    expect(getThemeMode({ name: "my_dark_theme", tokens: {} })).toBe("dark");
  });

  it("infers light otherwise", () => {
    expect(getThemeMode({ name: "light", tokens: {} })).toBe("light");
    expect(getThemeMode({ name: "mint", tokens: {} })).toBe("light");
  });

  it("prefers an explicit meta.mode", () => {
    expect(getThemeMode({ name: "weird", meta: { mode: "dark" }, tokens: {} })).toBe("dark");
    expect(getThemeMode({ name: "dark", meta: { mode: "light" }, tokens: {} })).toBe("light");
  });
});

describe("mode resolution for plain themes (no meta.mode)", () => {
  it("resolveSelectedTheme finds the dark theme by name", () => {
    const theme = resolveSelectedTheme(plainThemes, { family: "default", mode: "dark" });
    expect(theme.name).toBe("dark");
  });

  it("resolveThemeName finds the dark theme by name", () => {
    expect(resolveThemeName(plainThemes, "default", "dark")).toBe("dark");
  });

  it("setMode('dark') actually switches the store theme", () => {
    const runtime = createThemeRuntime({
      themes: plainThemes,
      defaultTheme: "light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
      broadcast: null,
    });
    runtime.selection.setMode("dark");
    expect(runtime.store.get().name).toBe("dark");
    runtime.destroy();
  });

  it("toggleTheme flips light ⇄ dark repeatedly", () => {
    const runtime = createThemeRuntime({
      themes: plainThemes,
      defaultTheme: "light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
      broadcast: null,
    });
    runtime.selection.toggleTheme();
    expect(runtime.store.get().name).toBe("dark");
    runtime.selection.toggleTheme();
    expect(runtime.store.get().name).toBe("light");
    runtime.selection.toggleTheme();
    expect(runtime.store.get().name).toBe("dark");
    runtime.destroy();
  });
});

describe("themes with meta.mode still resolve exactly", () => {
  it("prefers the exact meta.mode match over name inference", () => {
    const theme = resolveSelectedTheme(metaThemes, { family: "default", mode: "dark" });
    expect(theme.name).toBe("mint-dark");
  });

  it("runtime mode switching respects meta.mode", () => {
    const runtime = createThemeRuntime({
      themes: metaThemes,
      defaultTheme: "mint-light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
      broadcast: null,
    });
    runtime.selection.toggleTheme();
    expect(runtime.store.get().name).toBe("mint-dark");
    runtime.destroy();
  });
});
