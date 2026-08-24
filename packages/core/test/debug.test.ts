// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createThemeDebugger, createThemeRuntime, defineTheme } from "../src";

describe("createThemeDebugger", () => {
  const themes = [
    defineTheme({
      name: "light",
      meta: { family: "default", mode: "light" },
    }),
    defineTheme({
      name: "dark",
      meta: { family: "default", mode: "dark" },
    }),
  ];

  function createTestRuntime(overrides = {}) {
    return createThemeRuntime({
      themes,
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
      ...overrides,
    });
  }

  it("records initial state without an event", () => {
    const runtime = createTestRuntime();

    const debugger_ = createThemeDebugger(runtime.store);
    expect(debugger_.getHistory()).toHaveLength(0);
    debugger_.destroy();
    runtime.destroy();
  });

  it("records a theme change event", () => {
    const runtime = createTestRuntime();

    const debugger_ = createThemeDebugger(runtime.store);

    runtime.selection.setMode("dark");

    const history = debugger_.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].source).toBe("user");
    expect(history[0].current.name).toBe("dark");
    expect(history[0].previous?.name).toBe("light");
    debugger_.destroy();
    runtime.destroy();
  });

  it("records a change with a custom source label", () => {
    const runtime = createTestRuntime();

    const debugger_ = createThemeDebugger(runtime.store);

    debugger_.record("system");
    runtime.selection.setMode("dark");

    const history = debugger_.getHistory();
    expect(history[0].source).toBe("system");
    debugger_.destroy();
    runtime.destroy();
  });

  it("records a change with a descriptive label", () => {
    const runtime = createTestRuntime();

    const debugger_ = createThemeDebugger(runtime.store);

    debugger_.record("persistence", "Cross-tab sync");
    runtime.selection.setMode("dark");

    const history = debugger_.getHistory();
    expect(history[0].source).toBe("persistence");
    expect(history[0].label).toBe("Cross-tab sync");
    debugger_.destroy();
    runtime.destroy();
  });

  it("records multiple changes in order", () => {
    const runtime = createTestRuntime();

    const debugger_ = createThemeDebugger(runtime.store);

    runtime.selection.setMode("dark");
    runtime.selection.setMode("light");

    const history = debugger_.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].current.name).toBe("dark");
    expect(history[1].current.name).toBe("light");
    debugger_.destroy();
    runtime.destroy();
  });

  it("clears history", () => {
    const runtime = createTestRuntime();

    const debugger_ = createThemeDebugger(runtime.store);

    runtime.selection.setMode("dark");
    expect(debugger_.getHistory()).toHaveLength(1);

    debugger_.clear();
    expect(debugger_.getHistory()).toHaveLength(0);
    debugger_.destroy();
    runtime.destroy();
  });

  it("records update calls", () => {
    const runtime = createThemeRuntime({
      themes: [
        defineTheme({
          name: "base",
          tokens: { colors: { primary: "#3b82f6", background: "#ffffff" } },
        }),
      ],
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    const debugger_ = createThemeDebugger(runtime.store);

    runtime.update({ colors: { primary: "#ef4444" } });

    const history = debugger_.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].source).toBe("user");
    debugger_.destroy();
    runtime.destroy();
  });

  it("respects maxEvents limit", () => {
    const runtime = createThemeRuntime({
      themes: [
        defineTheme({ name: "a", meta: { mode: "light" } }),
        defineTheme({ name: "b", meta: { mode: "dark" } }),
      ],
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    const debugger_ = createThemeDebugger(runtime.store, { maxEvents: 3 });

    runtime.selection.setMode("dark");
    runtime.selection.setMode("light");
    runtime.selection.setMode("dark");
    runtime.selection.setMode("light");

    expect(debugger_.getHistory().length).toBeLessThanOrEqual(3);
    debugger_.destroy();
    runtime.destroy();
  });
});
