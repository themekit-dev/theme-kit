// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "../src";

function flushFrames(count = 2) {
  const frames: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(new Promise((r) => requestAnimationFrame(() => r())));
  }
  return Promise.all(frames);
}

describe("createThemeRuntime", () => {
  it("wires store, DOM, and CSS variables together", async () => {
    const runtime = createThemeRuntime({
      defaultTheme: "light",
      themes: [
        defineTheme({
          name: "light",
          meta: { mode: "light" },
          tokens: {
            colors: {
              background: "#ffffff",
            },
          },
        }),
        defineTheme({
          name: "dark",
          meta: { mode: "dark" },
          tokens: {
            colors: {
              background: "#000000",
            },
          },
        }),
      ],
      lightTheme: "light",
      darkTheme: "dark",
      initialMode: "light",
    });

    expect(runtime.store.get().name).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(
      document.documentElement.style.getPropertyValue(
        "--theme-color-background",
      ),
    ).toBe("#ffffff");

    runtime.selection.setMode("dark");

    expect(runtime.store.get().name).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    // The CSS variables swap on the next animation frame (the coordinator
    // batches the write into one frame), so flush before asserting.
    await flushFrames();
    expect(
      document.documentElement.style.getPropertyValue(
        "--theme-color-background",
      ),
    ).toBe("#000000");

    runtime.destroy();
  });

  it("uses persisted selection before creating the store", () => {
    const runtime = createThemeRuntime({
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
      persistence: {
        get: () => ({ family: "default", mode: "dark" }),
        set: () => {},
        remove: () => {},
        subscribe: () => () => {},
      },
      dom: false,
      cssVariables: false,
    });

    expect(runtime.store.get().name).toBe("dark");
    expect(runtime.selection.getMode()).toBe("dark");

    runtime.destroy();
  });
});
