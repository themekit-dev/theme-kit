// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  createThemeModeController,
  createThemePersistence,
  createThemeStore,
} from "../src";

describe("cross-tab sync", () => {
  it("syncs mode changes across tabs via storage events", () => {
    const light = { name: "light" } as const;
    const dark = { name: "dark" } as const;
    const store = createThemeStore({ initialTheme: light });

    const persistence = createThemePersistence({
      view: window,
      key: "theme-mode",
      storage: window.localStorage,
    });

    const controller = createThemeModeController({
      store,
      lightTheme: light,
      darkTheme: dark,
      persistence,
      view: window,
      initialMode: "light",
    });

    expect(controller.getMode()).toBe("light");
    expect(store.get().name).toBe("light");

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "theme-mode",
        newValue: "dark",
        storageArea: window.localStorage,
        url: window.location.href,
      }),
    );

    expect(controller.getMode()).toBe("dark");
    expect(store.get().name).toBe("dark");

    controller.destroy();
  });
});
