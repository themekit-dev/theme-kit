import { describe, expect, it } from "vitest";
import {
  defineTheme,
  createThemeRegistry,
  createThemeRuntime,
} from "../src";

describe("ThemePack", () => {
  it("use adds pack themes to registry", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.use({
      name: "test-pack",
      themes: [
        defineTheme({ name: "pack-light", meta: { mode: "light" } }),
        defineTheme({ name: "pack-dark", meta: { mode: "dark" } }),
      ],
    });
    expect(registry.has("pack-light")).toBe(true);
    expect(registry.has("pack-dark")).toBe(true);
  });

  it("use tags themes with pack name", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.use({
      name: "test-pack",
      themes: [
        defineTheme({ name: "pack-theme", meta: { mode: "light" } }),
      ],
    });
    const theme = registry.get("pack-theme");
    expect(theme?.meta?.tags).toContain("pack:test-pack");
  });

  it("use replaces existing themes with same name", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.register(defineTheme({ name: "shared", meta: { label: "Original", mode: "light" } }));
    registry.use({
      name: "override-pack",
      themes: [
        defineTheme({ name: "shared", meta: { label: "Override", mode: "light" } }),
      ],
    });
    expect(registry.get("shared")?.meta?.label).toBe("Override");
  });

  it("use adds timestamps to pack themes", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.use({
      name: "test-pack",
      themes: [
        defineTheme({ name: "pack-theme", meta: { mode: "light" } }),
      ],
    });
    const theme = registry.get("pack-theme");
    expect(theme?.meta?.created).toBeDefined();
    expect(theme?.meta?.updated).toBeDefined();
  });

  it("preserves explicitly set timestamps on pack themes", () => {
    const registry = createThemeRegistry({ themes: [] });
    registry.use({
      name: "test-pack",
      themes: [
        defineTheme({
          name: "pack-theme",
          meta: { mode: "light", created: "2000-01-01T00:00:00.000Z" },
        }),
      ],
    });
    const theme = registry.get("pack-theme");
    expect(theme?.meta?.created).toBe("2000-01-01T00:00:00.000Z");
  });
});

describe("runtime.use()", () => {
  it("registers a theme pack via runtime", () => {
    const base = defineTheme({ name: "base-theme", meta: { mode: "light" } });
    const runtime = createThemeRuntime({ themes: [base] });
    runtime.use({
      name: "runtime-pack",
      themes: [
        defineTheme({ name: "runtime-light", meta: { mode: "light" } }),
        defineTheme({ name: "runtime-dark", meta: { mode: "dark" } }),
      ],
    });
    expect(runtime.themes.length).toBe(3);
    expect(runtime.registry.has("runtime-light")).toBe(true);
    expect(runtime.registry.has("base-theme")).toBe(true);
  });
});
