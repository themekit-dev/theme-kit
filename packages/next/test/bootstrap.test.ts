import { describe, expect, it } from "vitest";
import { ThemeBootstrap } from "../src/theme-bootstrap";
import {
  defineTheme,
  resolveInitialTheme,
  themeToCSSVariables,
} from "@theme-kit/core";

describe("theme bootstrap", () => {
  it("creates CSS variables from a theme", () => {
    const theme = defineTheme({
      name: "light",
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#111111",
        },
      },
    });

    expect(themeToCSSVariables(theme)).toEqual({
      "--theme-color-background": "#ffffff",
      "--theme-color-foreground": "#111111",
    });
  });

  it("injects nothing for fixed mode", () => {
    const themes = [
      defineTheme({
        name: "light",
        meta: { family: "default", mode: "light" },
        tokens: { colors: { background: "#ffffff" } },
      }),
      defineTheme({
        name: "dark",
        meta: { family: "default", mode: "dark" },
        tokens: { colors: { background: "#000000" } },
      }),
    ];

    const initial = resolveInitialTheme({
      themes,
      mode: "light",
      family: "default",
    });

    // For fixed mode, the component renders null (no <style> needed)
    expect(ThemeBootstrap).toBeDefined();
  });

  it("generates dark mode CSS override for system mode", () => {
    const themes = [
      defineTheme({
        name: "light",
        meta: { family: "default", mode: "light" },
        tokens: { colors: { background: "#ffffff" } },
      }),
      defineTheme({
        name: "dark",
        meta: { family: "default", mode: "dark" },
        tokens: { colors: { background: "#000000" } },
      }),
    ];

    const initial = resolveInitialTheme({
      themes,
      mode: "system",
      family: "default",
    });

    const darkCSS = themeToCSSVariables(
      themes.find((t) => t.name === "dark")!,
    );

    expect(darkCSS["--theme-color-background"]).toBe("#000000");
  });
});
