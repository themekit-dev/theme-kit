import { describe, expect, it } from "vitest";
import { getInitialThemeState } from "../src/server";
import { defineTheme } from "@theme-kit/core";

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

describe("getInitialThemeState", () => {
  it("returns system mode when no cookies are set", async () => {
    const request = new Request("http://localhost");

    const state = await getInitialThemeState(request, {
      themes,
      mode: "system",
      family: "default",
    });

    expect(state.selection.mode).toBe("system");
    expect(state.theme.name).toBe("light");
  });

  it("reads mode from cookie and resolves the theme", async () => {
    const request = new Request("http://localhost", {
      headers: { Cookie: "theme-mode=dark" },
    });

    const state = await getInitialThemeState(request, {
      themes,
      mode: "system",
      family: "default",
    });

    expect(state.selection.mode).toBe("dark");
    expect(state.theme.name).toBe("dark");
  });

  it("reads family from cookie", async () => {
    const request = new Request("http://localhost", {
      headers: { Cookie: "theme-mode=light; theme-family=forest" },
    });

    const state = await getInitialThemeState(request, {
      themes,
    });

    expect(state.selection.mode).toBe("light");
    expect(state.selection.family).toBe("forest");
  });

  it("falls back to options when cookie values are invalid", async () => {
    const request = new Request("http://localhost", {
      headers: { Cookie: "theme-mode=invalid" },
    });

    const state = await getInitialThemeState(request, {
      themes,
      mode: "system",
      family: "default",
    });

    expect(state.selection.mode).toBe("system");
  });
});
