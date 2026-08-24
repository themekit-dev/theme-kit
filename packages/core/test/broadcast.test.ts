import { describe, expect, it, vi } from "vitest";
import { createThemeModeController, createThemeStore } from "../src";
import type { ThemeBroadcastAdapter } from "../src/adapters/broadcast";

describe("createThemeModeController broadcast", () => {
  it("syncs theme mode through BroadcastChannel", () => {
    let incoming: ((mode: "light" | "dark" | "system") => void) | undefined;

    const broadcast: ThemeBroadcastAdapter = {
      post: vi.fn(),
      subscribe(listener) {
        incoming = listener;
        return () => {
          incoming = undefined;
        };
      },
      destroy: vi.fn(),
    };

    const light = { name: "light" } as const;
    const dark = { name: "dark" } as const;
    const store = createThemeStore({ initialTheme: light });

    const controller = createThemeModeController({
      store,
      lightTheme: light,
      darkTheme: dark,
      initialMode: "light",
      broadcast,
    });

    controller.setMode("dark");
    expect(store.get().name).toBe("dark");
    expect(broadcast.post).toHaveBeenCalledWith("dark");

    incoming?.("light");
    expect(store.get().name).toBe("light");
    expect(broadcast.post).toHaveBeenCalledTimes(1);

    controller.destroy();
  });
});
