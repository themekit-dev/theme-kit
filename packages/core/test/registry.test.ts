import { describe, expect, it } from "vitest";
import {
  defineTheme,
  getBuiltInThemes,
  resolveThemeRegistry,
  createThemeRegistry,
  ThemeRegistry,
} from "../src";

describe("resolveThemeRegistry", () => {
  it("uses supplied themes as the registry", () => {
    const themes = [
      defineTheme({ name: "brand-light" }),
      defineTheme({ name: "brand-dark" }),
    ] as const;

    expect(resolveThemeRegistry({ themes })).toBe(themes);
  });

  it("falls back to built-in themes when themes are omitted", () => {
    expect(resolveThemeRegistry()).toEqual(getBuiltInThemes());
  });

  it("falls back to built-in themes when given an empty registry", () => {
    expect(resolveThemeRegistry({ themes: [] })).toEqual(getBuiltInThemes());
  });
});

describe("ThemeRegistry", () => {
  it("creates an empty registry by default", () => {
    const registry = createThemeRegistry();
    expect(registry.list()).toEqual([]);
  });

  it("creates a registry with custom themes", () => {
    const custom = [
      defineTheme({ name: "custom-light", meta: { mode: "light" } }),
      defineTheme({ name: "custom-dark", meta: { mode: "dark" } }),
    ];
    const registry = createThemeRegistry({ themes: custom });
    expect(registry.list()).toEqual(custom);
  });

  it("register adds a new theme", () => {
    const registry = createThemeRegistry({ themes: [] });
    const theme = defineTheme({ name: "test-theme" });
    const result = registry.register(theme);
    expect(result).toBe(true);
    expect(registry.has("test-theme")).toBe(true);
  });

  it("register returns false for duplicate names", () => {
    const registry = createThemeRegistry({ themes: [] });
    const theme = defineTheme({ name: "test-theme" });
    registry.register(theme);
    const result = registry.register(theme);
    expect(result).toBe(false);
  });

  it("register adds metadata timestamps", () => {
    const registry = createThemeRegistry({ themes: [] });
    const theme = defineTheme({ name: "test-theme" });
    registry.register(theme);
    const registered = registry.get("test-theme");
    expect(registered?.meta?.created).toBeDefined();
    expect(registered?.meta?.updated).toBeDefined();
  });

  it("unregister removes a theme", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "test-theme" }));
    const result = registry.unregister("test-theme");
    expect(result).toBe(true);
    expect(registry.has("test-theme")).toBe(false);
  });

  it("unregister returns false for non-existent theme", () => {
    const registry = createThemeRegistry({ themes: [] });
    const result = registry.unregister("nonexistent");
    expect(result).toBe(false);
  });

  it("replace updates an existing theme", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "test-theme", meta: { label: "Old" } }));
    const result = registry.replace("test-theme", defineTheme({ name: "test-theme", meta: { label: "New" } }));
    expect(result).toBe(true);
    expect(registry.get("test-theme")?.meta?.label).toBe("New");
  });

  it("replace updates the timestamp", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "test-theme" }));
    registry.replace("test-theme", defineTheme({ name: "test-theme" }));
    const updated = registry.get("test-theme")?.meta?.updated;
    expect(typeof updated).toBe("string");
  });

  it("replace returns false for non-existent theme", () => {
    const registry = createThemeRegistry({ themes: [] });
    const result = registry.replace("nonexistent", defineTheme({ name: "nonexistent" }));
    expect(result).toBe(false);
  });

  it("get returns undefined for missing theme", () => {
    const registry = createThemeRegistry({ themes: [] });
    expect(registry.get("missing")).toBeUndefined();
  });

  it("has returns correct boolean", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "exists" }));
    expect(registry.has("exists")).toBe(true);
    expect(registry.has("missing")).toBe(false);
  });

  it("list returns a copy of all themes", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "a" }));
    registry.register(defineTheme({ name: "b" }));
    const list = registry.list();
    expect(list).toHaveLength(2);
    list.push(defineTheme({ name: "c" }));
    expect(registry.list()).toHaveLength(2);
  });

  it("getFamilies returns unique family names", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "a", meta: { family: "fam1", mode: "light" } }));
    registry.register(defineTheme({ name: "b", meta: { family: "fam2", mode: "light" } }));
    registry.register(defineTheme({ name: "c", meta: { family: "fam1", mode: "dark" } }));
    const families = registry.getFamilies();
    expect(families).toContain("fam1");
    expect(families).toContain("fam2");
    expect(families).toHaveLength(2);
  });

  it("getThemesByFamily returns themes for a family", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "a", meta: { family: "fam1", mode: "light" } }));
    registry.register(defineTheme({ name: "b", meta: { family: "fam2", mode: "light" } }));
    registry.register(defineTheme({ name: "c", meta: { family: "fam1", mode: "dark" } }));
    const fam1 = registry.getThemesByFamily("fam1");
    expect(fam1).toHaveLength(2);
    expect(fam1.map((t) => t.name).sort()).toEqual(["a", "c"]);
  });

  it("registerMany returns count of registered themes", () => {
    const registry = createThemeRegistry({ themes: [] });
    const themes = [
      defineTheme({ name: "a" }),
      defineTheme({ name: "b" }),
      defineTheme({ name: "c" }),
    ];
    const count = registry.registerMany(themes);
    expect(count).toBe(3);
    expect(registry.list()).toHaveLength(3);
  });

  it("registerMany skips duplicates", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "a" }));
    const themes = [
      defineTheme({ name: "a" }),
      defineTheme({ name: "b" }),
    ];
    const count = registry.registerMany(themes);
    expect(count).toBe(1);
    expect(registry.list()).toHaveLength(2);
  });

  it("clear removes all themes", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "a" }));
    registry.register(defineTheme({ name: "b" }));
    registry.clear();
    expect(registry.list()).toHaveLength(0);
  });

  it("themes getter returns the current list", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "a" }));
    expect(registry.themes).toHaveLength(1);
  });
});
