// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  createThemeModeController,
  createThemePersistence,
  createThemeStore,
} from "../src";

describe("createThemePersistence", () => {
  it("stores and restores the theme mode", () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } as unknown as Storage;

    const persistence = createThemePersistence({
      storage,
      key: "app-theme",
    });

    expect(persistence.get()).toBeNull();

    persistence.set("dark");
    expect(storage.setItem).toHaveBeenCalledWith("app-theme", "dark");
  });
});

describe("createThemeModeController persistence", () => {
  it("restores mode from persistence", () => {
    const storage = {
      getItem: vi.fn(() => "dark"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } as unknown as Storage;

    const persistence = createThemePersistence({
      storage,
      key: "app-theme",
    });

    const light = { name: "light" } as const;
    const dark = { name: "dark" } as const;
    const store = createThemeStore({ initialTheme: light });

    const controller = createThemeModeController({
      store,
      lightTheme: light,
      darkTheme: dark,
      persistence,
      view: window,
    });

    expect(controller.getMode()).toBe("dark");
    expect(store.get().name).toBe("dark");
  });
});
