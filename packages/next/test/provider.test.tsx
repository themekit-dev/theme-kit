// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { defineTheme, resolveInitialTheme } from "@theme-kit/core";
import { ClientThemeProvider, useThemeMode } from "../src/client";

function Demo() {
  const mode = useThemeMode();
  return <span data-testid="mode">{mode}</span>;
}

describe("@theme-kit/next", () => {
  it("renders with the Next provider and hooks", () => {
    const themes = [
      defineTheme({
        name: "light",
        meta: { family: "default", mode: "light" },
      }),
      defineTheme({
        name: "dark",
        meta: { family: "default", mode: "dark" },
      }),
    ];

    const initial = resolveInitialTheme({
      themes,
      mode: "light",
      family: "default",
    });

    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    act(() => {
      root.render(
        <ClientThemeProvider themes={themes} initial={initial}>
          <Demo />
        </ClientThemeProvider>,
      );
    });

    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe(
      "light",
    );

    act(() => {
      root.unmount();
    });

    document.body.removeChild(container);
  });
});
