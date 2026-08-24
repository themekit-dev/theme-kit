// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  createThemeRuntime,
  createPluginManager,
  defineTheme,
} from "../src";

describe("PluginManager", () => {
  it("registers and lists plugins in priority order", () => {
    const pm = createPluginManager();
    pm.use({ name: "a", priority: 20 });
    pm.use({ name: "b", priority: 10 });
    pm.use({ name: "c", priority: 30 });

    expect(pm.list().map((p) => p.name)).toEqual(["b", "a", "c"]);
  });

  it("removes a plugin by name", () => {
    const pm = createPluginManager();
    pm.use({ name: "test" });
    expect(pm.list()).toHaveLength(1);
    expect(pm.remove("test")).toBe(true);
    expect(pm.list()).toHaveLength(0);
  });

  it("returns a plugin by name", () => {
    const pm = createPluginManager();
    pm.use({ name: "test", version: "1.0.0" });
    expect(pm.get("test")?.version).toBe("1.0.0");
    expect(pm.get("nonexistent")).toBeUndefined();
  });

  it("returns an unsubscribe function from use()", () => {
    const pm = createPluginManager();
    const unsub = pm.use({ name: "test" });
    expect(pm.list()).toHaveLength(1);
    unsub();
    expect(pm.list()).toHaveLength(0);
  });

  it("warns and skips duplicate plugin names", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pm = createPluginManager();
    pm.use({ name: "dup" });
    pm.use({ name: "dup" });
    expect(pm.list()).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("calls onDestroy on all plugins during destroy()", () => {
    const fn = vi.fn();
    const pm = createPluginManager();
    pm.use({ name: "a", onDestroy: fn });
    pm.use({ name: "b", onDestroy: fn });
    pm.destroy();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("createThemeRuntime with plugins option", () => {
  const testThemes = [
    defineTheme({ name: "light", meta: { mode: "light" }, tokens: { colors: { background: "#ffffff", foreground: "#000000" } } }),
    defineTheme({ name: "dark", meta: { mode: "dark" }, tokens: { colors: { background: "#000000", foreground: "#ffffff" } } }),
  ];

  it("calls onRuntimeCreated for each plugin", () => {
    const fn = vi.fn();
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      plugins: [{ name: "test", onRuntimeCreated: fn }],
      dom: false,
      cssVariables: false,
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(runtime);
    runtime.destroy();
  });

  it("calls onBeforeThemeChange and onAfterThemeChange hooks", () => {
    const before = vi.fn();
    const after = vi.fn();
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      persistence: null,
      plugins: [{ name: "test", onBeforeThemeChange: before, onAfterThemeChange: after }],
      dom: false,
      cssVariables: false,
    });

    runtime.selection.setMode("dark");

    expect(before).toHaveBeenCalled();
    expect(before.mock.calls[0][0].current.name).toBe("light");
    expect(before.mock.calls[0][0].next.name).toBe("dark");
    expect(after).toHaveBeenCalled();
    expect(after.mock.calls[0][0].theme.name).toBe("dark");

    runtime.destroy();
  });

  it("calls before/afterPersist hooks", () => {
    const before = vi.fn();
    const after = vi.fn();
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      plugins: [{ name: "test", onBeforePersist: before, onAfterPersist: after }],
      persistence: { get: () => null, set: () => {}, remove: () => {}, subscribe: () => () => {} },
      dom: false,
      cssVariables: false,
    });

    runtime.selection.setMode("dark");

    expect(before).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
    expect(after.mock.calls[0][0].selection).toBeDefined();

    runtime.destroy();
  });

  it("calls before/afterPersist hooks", () => {
    const before = vi.fn();
    const after = vi.fn();
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      plugins: [{ name: "test", onBeforePersist: before, onAfterPersist: after }],
      persistence: { get: () => null, set: () => {}, remove: () => {}, subscribe: () => () => {} },
      dom: false,
      cssVariables: false,
    });

    runtime.selection.setMode("dark");

    expect(before).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
    expect(after.mock.calls[0][0].selection).toBeDefined();

    runtime.destroy();
  });

  it("calls onDestroy when runtime is destroyed", () => {
    const fn = vi.fn();
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      plugins: [{ name: "test", onDestroy: fn }],
      dom: false,
      cssVariables: false,
    });

    runtime.destroy();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("applies transformTokens during update", () => {
    const transform = vi.fn((tokens) => ({ ...tokens, colors: { ...tokens.colors, background: "#ff0000" } }));
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      plugins: [{ name: "test", transformTokens: transform }],
      dom: false,
      cssVariables: false,
    });

    runtime.update({ colors: { primary: "#00ff00" } });

    expect(transform).toHaveBeenCalled();
    expect(runtime.store.get().tokens?.colors?.background).toBe("#ff0000");

    runtime.destroy();
  });

  it("calls hooks in priority order", () => {
    const order: number[] = [];
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      persistence: null,
      plugins: [
        { name: "a", priority: 30, onAfterThemeChange: () => order.push(30) },
        { name: "b", priority: 10, onAfterThemeChange: () => order.push(10) },
        { name: "c", priority: 20, onAfterThemeChange: () => order.push(20) },
      ],
      dom: false,
      cssVariables: false,
    });

    expect(runtime.store.get().name).toBe("light");
    runtime.selection.setMode("dark");
    expect(runtime.store.get().name).toBe("dark");
    expect(order).toEqual([10, 20, 30]);

    runtime.destroy();
  });

  it("supports multiple plugins simultaneously", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const runtime = createThemeRuntime({
      themes: testThemes,
      initialMode: "light",
      persistence: null,
      plugins: [
        { name: "p1", onAfterThemeChange: fn1 },
        { name: "p2", onAfterThemeChange: fn2 },
      ],
      dom: false,
      cssVariables: false,
    });

    runtime.selection.setMode("dark");
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();

    runtime.destroy();
  });
});
