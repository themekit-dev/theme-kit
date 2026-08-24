// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createBootstrapAdapter } from "../src";

const themes = [
  defineTheme({
    name: "light",
    meta: { mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        primary: "#0d6efd",
        primaryForeground: "#ffffff",
        border: "#dee2e6",
        ring: "#0d6efd",
      },
    },
  }),
  defineTheme({
    name: "dark",
    meta: { mode: "dark" },
    tokens: {
      colors: {
        background: "#212529",
        foreground: "#f8f9fa",
        primary: "#6ea8fe",
        primaryForeground: "#000000",
        border: "#495057",
        ring: "#6ea8fe",
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

describe("bootstrap adapter lifecycle", () => {
  it("installs, updates on theme change, and cleans up on uninstall", () => {
    const runtime = makeRuntime();

    const adapter = createBootstrapAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    // 1. install → a tagged style element with the CSS variables exists
    const styleEl = document.getElementById("theme-kit-bootstrap-variables") as HTMLStyleElement;
    expect(styleEl).toBeTruthy();
    const lightText = styleEl.textContent ?? "";
    expect(lightText).toContain("#ffffff"); // light background
    expect(lightText).toContain("#0a0a0a"); // light foreground

    // 2. theme update → the style element reflects the dark theme
    runtime.selection.setMode("dark");
    const darkText = styleEl.textContent ?? "";
    expect(darkText).toContain("#212529"); // dark background
    expect(darkText).toContain("#f8f9fa"); // dark foreground

    // 3. cleanup → the style element is removed and not recreated
    handle.dispose();
    expect(document.getElementById("theme-kit-bootstrap-variables")).toBeNull();

    runtime.selection.setMode("light");
    expect(document.getElementById("theme-kit-bootstrap-variables")).toBeNull();

    runtime.destroy();
  });

  it("is safe to call dispose after the runtime was destroyed", () => {
    const runtime = makeRuntime();
    const adapter = createBootstrapAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    runtime.destroy();
    expect(() => handle.dispose()).not.toThrow();
    expect(document.getElementById("theme-kit-bootstrap-variables")).toBeNull();
  });
});