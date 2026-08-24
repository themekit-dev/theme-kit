// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createOpenPropsAdapter } from "../src";

const themes = [
  defineTheme({
    name: "light",
    meta: { mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#1a1a1a",
        primary: "#6c63ff",
        primaryForeground: "#ffffff",
        border: "#e0e0e0",
        ring: "#6c63ff",
      },
    },
  }),
  defineTheme({
    name: "dark",
    meta: { mode: "dark" },
    tokens: {
      colors: {
        background: "#1a1a1a",
        foreground: "#e0e0e0",
        primary: "#6c63ff",
        primaryForeground: "#ffffff",
        border: "#333333",
        ring: "#6c63ff",
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

describe("open-props adapter lifecycle", () => {
  it("installs, updates on theme change, and cleans up on uninstall", () => {
    const runtime = makeRuntime();

    const adapter = createOpenPropsAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    const styleEl = document.getElementById("theme-kit-open-props-variables") as HTMLStyleElement;
    expect(styleEl).toBeTruthy();
    expect(styleEl.textContent).toContain("#ffffff");

    runtime.selection.setMode("dark");
    expect(styleEl.textContent).toContain("#1a1a1a");

    handle.dispose();
    expect(document.getElementById("theme-kit-open-props-variables")).toBeNull();

    runtime.selection.setMode("light");
    expect(document.getElementById("theme-kit-open-props-variables")).toBeNull();

    runtime.destroy();
  });

  it("is safe to call dispose after the runtime was destroyed", () => {
    const runtime = makeRuntime();
    const adapter = createOpenPropsAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    runtime.destroy();
    expect(() => handle.dispose()).not.toThrow();
    expect(document.getElementById("theme-kit-open-props-variables")).toBeNull();
  });
});