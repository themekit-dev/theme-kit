// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { createShadcnAdapter } from "../src";

const themes = [
  defineTheme({
    name: "light",
    meta: { mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        card: "#ffffff",
        cardForeground: "#0a0a0a",
        popover: "#ffffff",
        popoverForeground: "#0a0a0a",
        primary: "#6366f1",
        primaryForeground: "#ffffff",
        secondary: "#f4f4f5",
        secondaryForeground: "#18181b",
        muted: "#f4f4f5",
        mutedForeground: "#71717a",
        accent: "#f4f4f5",
        accentForeground: "#18181b",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        success: "#22c55e",
        successForeground: "#ffffff",
        border: "#e4e4e7",
        input: "#e4e4e7",
        ring: "#6366f1",
        radius: "0.5rem",
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
        card: "#0a0a0a",
        cardForeground: "#fafafa",
        popover: "#0a0a0a",
        popoverForeground: "#fafafa",
        primary: "#818cf8",
        primaryForeground: "#ffffff",
        secondary: "#27272a",
        secondaryForeground: "#fafafa",
        muted: "#27272a",
        mutedForeground: "#a1a1aa",
        accent: "#27272a",
        accentForeground: "#fafafa",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        success: "#4ade80",
        successForeground: "#ffffff",
        border: "#27272a",
        input: "#27272a",
        ring: "#818cf8",
        radius: "0.5rem",
      },
    },
  }),
];

describe("shadcn adapter lifecycle", () => {
  it("installs, updates on theme change, and cleans up on uninstall", () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
    });

    // 1. install
    const adapter = createShadcnAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    // After install a style element with the shadcn variables exists
    const styleEl = document.querySelector('[data-theme-kit="shadcn"]') as HTMLStyleElement;
    expect(styleEl).toBeTruthy();
    expect(styleEl.textContent).toContain("#ffffff"); // light background
    expect(styleEl.textContent).toContain("#0a0a0a"); // light foreground

    // 2. theme update — switch to dark
    runtime.selection.setMode("dark");
    expect(styleEl.textContent).toContain("#0a0a0a"); // dark background
    expect(styleEl.textContent).toContain("#fafafa"); // dark foreground

    // 3. cleanup — uninstall
    handle.dispose();
    expect(document.querySelector('[data-theme-kit="shadcn"]')).toBeNull();

    // 4. store subscription is cleaned up — no style element is recreated after uninstall
    runtime.selection.setMode("light");
    expect(document.querySelector('[data-theme-kit="shadcn"]')).toBeNull();

    runtime.destroy();
  });

  it("is safe to call uninstall when the runtime was already destroyed", () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
    });
    const adapter = createShadcnAdapter({ injectCSS: false });
    const handle = runtime.adapters.use(adapter);

    runtime.destroy();
    // After destroy, uninstall must be a no-op (the registry already uninstalled it)
    expect(() => handle.dispose()).not.toThrow();
    expect(document.querySelector('[data-theme-kit="shadcn"]')).toBeNull();
  });
});