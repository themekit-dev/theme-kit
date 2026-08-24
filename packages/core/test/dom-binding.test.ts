// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeStore, createDOMBinding } from "../src";

describe("createDOMBinding", () => {
  it("applies the active theme to the document", () => {
    const store = createThemeStore({ initialTheme: { name: "light" } });

    const binding = createDOMBinding(store);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    store.set({ name: "dark" });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    binding.destroy();
  });
});
