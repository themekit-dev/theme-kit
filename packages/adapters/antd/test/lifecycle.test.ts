// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createAntdAdapter } from "../src";

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
    persistence: null,
  });
}

describe("antd adapter lifecycle", () => {
  it("installs, rebuilds on theme change, and clears the snapshot on uninstall", () => {
    const runtime = makeRuntime();

    const adapter = createAntdAdapter();
    const handle = runtime.adapters.use(adapter);

    // 1. install → snapshot is available with the light primary color
    expect(adapter.getSnapshot()).not.toBeNull();
    expect(adapter.getSnapshot()!.token?.colorPrimary).toBe("#6366f1");

    // 2. theme update → the token rebuilds for the dark primary
    runtime.selection.setMode("dark");
    expect(adapter.getSnapshot()!.token?.colorPrimary).toBe("#818cf8");

    // 3. cleanup → snapshot cleared
    handle.dispose();
    expect(adapter.getSnapshot()).toBeNull();

    runtime.destroy();
  });

  it("notifies subscribers when the theme changes", () => {
    const runtime = makeRuntime();

    const adapter = createAntdAdapter();
    const handle = runtime.adapters.use(adapter);

    let notifications = 0;
    const unsub = adapter.subscribe(() => {
      notifications++;
    });

    runtime.selection.setMode("dark");
    expect(notifications).toBeGreaterThan(0);

    unsub();
    handle.dispose();
    runtime.destroy();
  });
});