// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createCSSVariablesBinding, createThemeStore } from "../src";
import { defineTheme } from "../src/model";

function flushFrames(count = 2) {
  const frames: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(new Promise((r) => requestAnimationFrame(() => r())));
  }
  return Promise.all(frames);
}

describe("createCSSVariablesBinding", () => {
  it("applies and clears token groups", async () => {
    const light = defineTheme({
          name: "light",
          tokens: {
            colors: {
              background: "#ffffff",
            },
            spacing: {
              md: "16px",
            },
            radius: {
              lg: "12px",
            },
            shadows: {
              card: "0 10px 30px rgba(0,0,0,0.12)",
            },
            typography: {
              fontFamilies: {
                sans: "Inter, sans-serif",
              },
              fontSizes: {
                base: "16px",
              },
              lineHeights: {
                normal: "1.5",
              },
            },
          },
        });
    const dark = defineTheme({
          name: "dark",
          tokens: {
            colors: {
              background: "#000000",
            },
          },
        });
    const store = createThemeStore({ initialTheme: light });

    const binding = createCSSVariablesBinding(store);

    const style = document.documentElement.style;

    expect(style.getPropertyValue("--theme-color-background")).toBe("#ffffff");
    expect(style.getPropertyValue("--theme-spacing-md")).toBe("16px");
    expect(style.getPropertyValue("--theme-radius-lg")).toBe("12px");
    expect(style.getPropertyValue("--theme-shadow-card")).toBe(
      "0 10px 30px rgba(0,0,0,0.12)",
    );
    expect(style.getPropertyValue("--theme-typography-font-family-sans")).toBe(
      "Inter, sans-serif",
    );
    expect(style.getPropertyValue("--theme-typography-font-size-base")).toBe(
      "16px",
    );
    expect(
      style.getPropertyValue("--theme-typography-line-height-normal"),
    ).toBe("1.5");

store.set(dark);

    // The variables swap on the next animation frame (batched by the
    // coordinator), so flush before asserting the new values.
    await flushFrames();

    expect(style.getPropertyValue("--theme-color-background")).toBe("#000000");
    expect(style.getPropertyValue("--theme-spacing-md")).toBe("");
    expect(style.getPropertyValue("--theme-radius-lg")).toBe("");
    expect(style.getPropertyValue("--theme-shadow-card")).toBe("");
    expect(style.getPropertyValue("--theme-typography-font-family-sans")).toBe(
      "",
    );
    expect(style.getPropertyValue("--theme-typography-font-size-base")).toBe(
      "",
    );
    expect(
      style.getPropertyValue("--theme-typography-line-height-normal"),
    ).toBe("");

    binding.destroy();
  });
});
