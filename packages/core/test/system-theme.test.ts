// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createSystemThemeBinding, createThemeStore } from "../src";

describe("createSystemThemeBinding", () => {
  it("switches themes when system preference changes", () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;

    const matchMediaMock = vi.fn().mockReturnValue({
      media: "(prefers-color-scheme: dark)",
      matches: false,
      addEventListener: (
        _: string,
        cb: (event: MediaQueryListEvent) => void,
      ) => {
        listener = cb;
      },
      removeEventListener: () => {
        listener = undefined;
      },
      addListener: (cb: (event: MediaQueryListEvent) => void) => {
        listener = cb;
      },
      removeListener: () => {
        listener = undefined;
      },
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    const light = { name: "light" } as const;
    const dark = { name: "dark" } as const;
    const store = createThemeStore({ initialTheme: light });

    const binding = createSystemThemeBinding(store, {
      lightTheme: light,
      darkTheme: dark,
      view: window,
    });

    expect(store.get().name).toBe("light");

    listener?.({ matches: true } as MediaQueryListEvent);
    expect(store.get().name).toBe("dark");

    listener?.({ matches: false } as MediaQueryListEvent);
    expect(store.get().name).toBe("light");

    binding.destroy();
  });
});
