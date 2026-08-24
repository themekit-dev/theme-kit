// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createThemeStore, createThemeModeController } from "../src";

describe("createThemeModeController", () => {
  it("switches between manual and system modes", () => {
    let mediaListener: ((event: MediaQueryListEvent) => void) | undefined;

    const matchMediaMock = vi.fn().mockReturnValue({
      media: "(prefers-color-scheme: dark)",
      matches: false,
      addEventListener: (
        _: string,
        cb: (event: MediaQueryListEvent) => void,
      ) => {
        mediaListener = cb;
      },
      removeEventListener: () => {
        mediaListener = undefined;
      },
      addListener: (cb: (event: MediaQueryListEvent) => void) => {
        mediaListener = cb;
      },
      removeListener: () => {
        mediaListener = undefined;
      },
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    const light = { name: "light" } as const;
    const dark = { name: "dark" } as const;
    const store = createThemeStore({ initialTheme: light });

    const controller = createThemeModeController({
      store,
      lightTheme: light,
      darkTheme: dark,
      initialMode: "system",
      view: window,
    });

    expect(controller.getMode()).toBe("system");
    expect(store.get().name).toBe("light");

    mediaListener?.({ matches: true } as MediaQueryListEvent);
    expect(store.get().name).toBe("dark");

    controller.setMode("dark");
    expect(store.get().name).toBe("dark");

    mediaListener?.({ matches: false } as MediaQueryListEvent);
    expect(store.get().name).toBe("dark");

    controller.setMode("system");
    mediaListener?.({ matches: false } as MediaQueryListEvent);
    expect(store.get().name).toBe("light");

    controller.destroy();
  });
});
