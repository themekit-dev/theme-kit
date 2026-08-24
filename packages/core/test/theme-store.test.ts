import { describe, expect, it, vi } from "vitest";
import { createThemeStore, defineTheme } from "../src";

describe("createThemeStore", () => {
  const light = defineTheme({ name: "light" });
  const dark = defineTheme({ name: "dark" });

  it("starts from the resolved initial theme", () => {
    const store = createThemeStore({ initialTheme: dark });

    expect(store.get()).toBe(dark);
  });

  it("accepts resolved themes without knowing a registry", () => {
    const store = createThemeStore({ initialTheme: light });

    store.set(dark);

    expect(store.get()).toBe(dark);
  });

  it("notifies listeners when the resolved theme changes", () => {
    const store = createThemeStore({ initialTheme: light });
    const listener = vi.fn();

    store.subscribe(listener);
    store.set(dark);

    expect(listener).toHaveBeenLastCalledWith(dark, undefined);
  });
});
