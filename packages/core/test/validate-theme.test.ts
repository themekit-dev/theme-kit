// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeStore, defineTheme } from "../src";

describe("validate theme", () => {
  it("creates a theme store with light theme", () => {
    const light = defineTheme({
      name: "light",
      tokens: {
        colors: {
          background: "#ffffff",
          foreground: "#000000",
        },
      },
    });

    const store = createThemeStore({ initialTheme: light });

    expect(store.get()).toBe(light);
  });

  it("creates a theme store with dark theme", () => {
    const dark = defineTheme({
      name: "dark",
      tokens: {
        colors: {
          background: "#18181b",
          foreground: "#ffffff",
        },
      },
    });

    const store = createThemeStore({ initialTheme: dark });

    expect(store.get()).toBe(dark);
  });
});