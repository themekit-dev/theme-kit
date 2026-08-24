// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createDaisyAdapter } from "../src";

const themes = [
  defineTheme({
    name: "light",
    meta: { mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#1f2937",
        primary: "#2563eb",
        primaryForeground: "#ffffff",
        border: "#e5e7eb",
        ring: "#2563eb",
      },
    },
  }),
  defineTheme({
    name: "dark",
    meta: { mode: "dark" },
    tokens: {
      colors: {
        background: "#1f2937",
        foreground: "#f9fafb",
        primary: "#60a5fa",
        primaryForeground: "#0f172a",
        border: "#374151",
        ring: "#60a5fa",
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

describe("daisyui adapter lifecycle", () => {
  it("installs, updates on theme change, and cleans up on uninstall", () => {
    const runtime = makeRuntime();

    const adapter = createDaisyAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    const styleEl = document.getElementById("theme-kit-daisy-variables") as HTMLStyleElement;
    expect(styleEl).toBeTruthy();
    expect(styleEl.textContent).toContain("#ffffff");

    runtime.selection.setMode("dark");
    expect(styleEl.textContent).toContain("#1f2937");

    handle.dispose();
    expect(document.getElementById("theme-kit-daisy-variables")).toBeNull();

    runtime.selection.setMode("light");
    expect(document.getElementById("theme-kit-daisy-variables")).toBeNull();

    runtime.destroy();
  });

  it("is safe to call dispose after the runtime was destroyed", () => {
    const runtime = makeRuntime();
    const adapter = createDaisyAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    runtime.destroy();
    expect(() => handle.dispose()).not.toThrow();
    expect(document.getElementById("theme-kit-daisy-variables")).toBeNull();
  });
});