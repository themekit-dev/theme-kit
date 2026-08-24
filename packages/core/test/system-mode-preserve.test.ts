// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createThemeRuntime } from "../src";

describe("system mode preservation", () => {
  it("keeps 'system' selected when the OS resolves to dark", () => {
    let mediaListener: ((event: MediaQueryListEvent) => void) | undefined;

    const matchMediaMock = vi.fn().mockReturnValue({
      media: "(prefers-color-scheme: dark)",
      matches: true,
      addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => {
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

    const light = {
      name: "light",
      meta: { mode: "light", family: "f" },
    } as const;
    const dark = {
      name: "dark",
      meta: { mode: "dark", family: "f" },
    } as const;

    const runtime = createThemeRuntime({
      themes: [light as never, dark as never],
      initialMode: "system",
      initialFamily: "f",
      readPersistenceOnInit: false,
      persistence: null,
      broadcast: null,
      dom: false,
      cssVariables: false,
    });

    // OS is dark, mode is system -> store resolves to the dark theme but the
    // explicit selection must remain "system".
    expect(runtime.store.get().name).toBe("dark");
    expect(runtime.selection.getMode()).toBe("system");

    mediaListener?.({ matches: false } as MediaQueryListEvent);
    expect(runtime.store.get().name).toBe("light");
    expect(runtime.selection.getMode()).toBe("system");

    runtime.destroy();
  });
});