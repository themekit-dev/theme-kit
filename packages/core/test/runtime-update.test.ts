// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "../src";

describe("runtime.update", () => {
  const themes = [
    defineTheme({
      name: "light",
      meta: { family: "default", mode: "light" },
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          primary: "#3b82f6",
          surface: {
            default: "#f8fafc",
            hover: "#f1f5f9",
          },
        },
        radius: { lg: "8px" },
      },
    }),
  ];

  it("updates a flat color token", () => {
    const runtime = createThemeRuntime({
      themes,
      dom: false,
      cssVariables: false,
    });

    runtime.update({ colors: { primary: "#ef4444" } });

    expect(runtime.store.get().tokens?.colors?.primary).toBe("#ef4444");
    runtime.destroy();
  });

  it("preserves other tokens when updating", () => {
    const runtime = createThemeRuntime({
      themes,
      dom: false,
      cssVariables: false,
    });

    runtime.update({ colors: { primary: "#ef4444" } });

    expect(runtime.store.get().tokens?.colors?.background).toBe("#ffffff");
    expect(runtime.store.get().tokens?.radius?.lg).toBe("8px");
    runtime.destroy();
  });

  it("updates nested semantic color groups", () => {
    const runtime = createThemeRuntime({
      themes,
      dom: false,
      cssVariables: false,
    });

    runtime.update({
      colors: {
        surface: { hover: "#e2e8f0", active: "#cbd5e1" },
      },
    });

    const colors = runtime.store.get().tokens?.colors;
    expect(colors?.surface).toEqual({
      default: "#f8fafc",
      hover: "#e2e8f0",
      active: "#cbd5e1",
    });
    runtime.destroy();
  });

  it("adds new token groups", () => {
    const runtime = createThemeRuntime({
      themes,
      dom: false,
      cssVariables: false,
    });

    runtime.update({ spacing: { page: "24px" } });

    expect(runtime.store.get().tokens?.spacing?.page).toBe("24px");
    runtime.destroy();
  });

  it("triggers store subscribers", () => {
    const runtime = createThemeRuntime({
      themes,
      dom: false,
      cssVariables: false,
    });

    let callCount = 0;
    const unsub = runtime.store.subscribe(() => {
      callCount++;
    });

    runtime.update({ colors: { primary: "#7c3aed" } });

    expect(callCount).toBe(1);
    unsub();
    runtime.destroy();
  });

  it("updates deeply nested groups", () => {
    const runtime = createThemeRuntime({
      themes,
      dom: false,
      cssVariables: false,
    });

    runtime.update({
      colors: {
        components: {
          button: {
            bg: "#3b82f6",
            text: "#ffffff",
          },
        },
      },
    });

    expect(runtime.store.get().tokens?.colors?.components).toEqual({
      button: { bg: "#3b82f6", text: "#ffffff" },
    });
    runtime.destroy();
  });
});
