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
  it("never publishes a theme identity without that theme's palette", async () => {
    // The regression guard for the "theme state fluctuates" bug.
    //
    // The DOM binding writes `data-theme` / `data-theme-mode` / the `dark`
    // class / `color-scheme`; the CSS-variables binding writes `--theme-*`. If
    // they subscribe to the store independently, the identity lands in the
    // current task while the palette lands inside the swap callback (a View
    // Transition callback, or the animation coordinator's frame) — a later
    // task. A paint in between shows the new theme's name over the old theme's
    // colours.
    //
    // Whether a frame actually lands in that window depends on the compositor,
    // so the symptom is intermittent rather than reproducible per change. This
    // asserts the invariant instead of the timing: at every observable moment,
    // whatever `data-theme` claims must already be what the palette paints.
    const palette = { light: "#ffffff", dark: "#000000" };
    const runtime = createThemeRuntime({
      defaultTheme: "light",
      themes: [
        defineTheme({
          name: "light",
          meta: { mode: "light" },
          tokens: { colors: { background: palette.light } },
        }),
        defineTheme({
          name: "dark",
          meta: { mode: "dark" },
          tokens: { colors: { background: palette.dark } },
        }),
      ],
      initialMode: "light",
    });

    const el = document.documentElement;
    const violations: string[] = [];

    const check = (why: string) => {
      const name = el.getAttribute("data-theme");
      const background = el.style.getPropertyValue("--theme-color-background");
      const expected = palette[name as keyof typeof palette];
      if (expected && background !== expected) {
        violations.push(`${why}: data-theme="${name}" but background="${background}"`);
      }
    };

    const observer = new MutationObserver(() => check("mutation"));
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    // Alternate through every transition so both directions are covered.
    for (const mode of ["dark", "light", "dark", "light"] as const) {
      runtime.selection.setMode(mode);
      check(`sync after setMode(${mode})`);
      await flushFrames();
      check(`settled after setMode(${mode})`);
    }

    observer.disconnect();
    runtime.destroy();

    expect(violations).toEqual([]);
  });

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
    // The identity attributes and the CSS variables commit *together*. The
    // CSS-variables binding owns the single swap (a View Transition when
    // available, otherwise the animation coordinator's frame), and the DOM
    // binding is driven from inside it via `onBeforeSwap`.
    //
    // Asserting `data-theme` synchronously here would be asserting the bug: the
    // document used to claim the new theme for a whole frame while the palette
    // still painted the old one, so a label and the colours behind it
    // disagreed. Both are read after the swap, which is the point — they must
    // agree at every moment either is observable.
    await flushFrames();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
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
