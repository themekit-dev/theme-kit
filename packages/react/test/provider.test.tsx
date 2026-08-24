// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { ThemeProvider, useSetThemeMode, useTheme, useThemeMode } from "../src";

function Demo() {
  const { theme, mode, setMode } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme.name}</span>
      <span data-testid="mode">{mode}</span>
      <button onClick={() => setMode("dark")}>dark</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("updates hooks when the runtime changes", () => {
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
      initialMode: "light",
      dom: false,
      cssVariables: false,
    });

    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    act(() => {
      root.render(
        <ThemeProvider runtime={runtime}>
          <Demo />
        </ThemeProvider>,
      );
    });

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe(
      "light",
    );
    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe(
      "light",
    );

    act(() => {
      runtime.selection.setMode("dark");
    });

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe(
      "dark",
    );
    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe(
      "dark",
    );

    act(() => {
      root.unmount();
    });

    document.body.removeChild(container);
  });
});
