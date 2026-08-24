import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => {
  return {
    cookies: vi.fn(),
  };
});

import { cookies } from "next/headers";
import { getInitialThemeState } from "../src/server";
import { defineTheme } from "@theme-kit/core";

const defaultOptions = {
  themes: [
    defineTheme({
      name: "light",
      meta: { family: "default", mode: "light" },
    }),
    defineTheme({
      name: "dark",
      meta: { family: "default", mode: "dark" },
    }),
  ],
  mode: "system" as const,
  family: "default",
};

describe("getInitialThemeState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns system mode when no cookies are set", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
    } as any);

    const state = await getInitialThemeState(defaultOptions);

    expect(state.selection.mode).toBe("system");
    expect(state.theme.name).toBe("light");
  });

  it("reads mode from cookie and resolves the theme", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "theme-mode") return { value: "dark" };
        return undefined;
      }),
    } as any);

    const state = await getInitialThemeState(defaultOptions);

    expect(state.selection.mode).toBe("dark");
    expect(state.theme.name).toBe("dark");
  });

  it("falls back to system for invalid mode cookie values", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "theme-mode") return { value: "invalid" };
        return undefined;
      }),
    } as any);

    const state = await getInitialThemeState(defaultOptions);

    expect(state.selection.mode).toBe("system");
  });
});
