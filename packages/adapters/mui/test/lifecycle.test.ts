// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createMuiAdapter } from "../src";

const themes = [
  defineTheme({
    name: "light",
    meta: { mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        primary: "#6366f1",
        primaryForeground: "#ffffff",
        border: "#e4e4e7",
        ring: "#6366f1",
      },
    },
  }),
  defineTheme({
    name: "dark",
    meta: { mode: "dark" },
    tokens: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        primary: "#818cf8",
        primaryForeground: "#ffffff",
        border: "#27272a",
        ring: "#818cf8",
      },
    },
  }),
];

function makeRuntime() {
  return createThemeRuntime({
    themes,
    defaultTheme: "light",
    initialMode: "light",
    dom: false,
    cssVariables: false,
    // No persistence: otherwise localStorage from a previous test would make
    // setMode("dark") a no-op in a later test.
    persistence: null,
  });
}

describe("mui adapter lifecycle", () => {
  it("installs, rebuilds on theme change, and unsubscribes on uninstall", () => {
    const runtime = makeRuntime();

    const adapter = createMuiAdapter();
    const handle = runtime.adapters.use(adapter);

    // 1. install → the snapshot reflects the current theme
    expect(adapter.getSnapshot()).not.toBeNull();
    expect(adapter.getSnapshot()!.palette.mode).toBe("light");
    expect(adapter.getSnapshot()!.palette.primary.main).toBe("#6366f1");

    // 2. theme update → the snapshot rebuilds on the next tick
    runtime.selection.setMode("dark");
    expect(adapter.getSnapshot()!.palette.mode).toBe("dark");
    expect(adapter.getSnapshot()!.palette.primary.main).toBe("#818cf8");

    // 3. cleanup → uninstall clears the snapshot and listeners
    handle.dispose();
    expect(adapter.getSnapshot()).toBeNull();

    runtime.destroy();
  });

  it("notifies subscribers when the theme changes", () => {
    const runtime = makeRuntime();

    const adapter = createMuiAdapter();
    const handle = runtime.adapters.use(adapter);

    let notifications = 0;
    const unsub = adapter.subscribe(() => {
      notifications++;
    });

    runtime.selection.setMode("dark");
    expect(adapter.getSnapshot()?.palette.mode).toBe("dark");
    expect(notifications).toBeGreaterThan(0);

    unsub();
    handle.dispose();
    runtime.destroy();
  });

  it("uninstall resets the snapshot to null", () => {
    const runtime = makeRuntime();

    const adapter = createMuiAdapter();
    const handle = runtime.adapters.use(adapter);
    expect(adapter.getSnapshot()).not.toBeNull();

    handle.dispose();
    expect(adapter.getSnapshot()).toBeNull();

    runtime.destroy();
  });
});