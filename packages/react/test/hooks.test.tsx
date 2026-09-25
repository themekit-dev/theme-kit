// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { createThemeRuntime, defineTheme } from "@theme-kit/core";
import { ThemeProvider } from "../src/provider";
import { ThemeModeButton } from "../src/theme-mode-button";
import { useThemeMode, useThemeTokens, useThemeSchedule } from "../src/hooks";

function TokensDemo() {
  const tokens = useThemeTokens();

  return (
    <span data-testid="background">{tokens?.colors?.background ?? "none"}</span>
  );
}

describe("react hooks", () => {
  it("returns tokens for the active theme", () => {
    const runtime = createThemeRuntime({
      themes: [
        defineTheme({
          name: "light",
          meta: { family: "default", mode: "light" },
          tokens: {
            colors: {
              background: "#ffffff",
            },
          },
        }),
        defineTheme({
          name: "dark",
          meta: { family: "default", mode: "dark" },
          tokens: {
            colors: {
              background: "#000000",
            },
          },
        }),
      ],
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ThemeProvider runtime={runtime}>
          <TokensDemo />
        </ThemeProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="background"]')?.textContent,
    ).toBe("#ffffff");

    act(() => {
      runtime.selection.setMode("dark");
    });

    expect(
      container.querySelector('[data-testid="background"]')?.textContent,
    ).toBe("#000000");

    act(() => {
      root.unmount();
    });

    document.body.removeChild(container);
  });

  it("cycles modes with ThemeModeButton", () => {
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
      persistence: null,
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ThemeProvider runtime={runtime}>
          <ThemeModeButton />
        </ThemeProvider>,
      );
    });

    const button = container.querySelector("button") as HTMLButtonElement;

    expect(button.textContent).toContain("light");

    act(() => {
      button.click();
    });
    expect(runtime.selection.getMode()).toBe("dark");

    act(() => {
      button.click();
    });
    expect(runtime.selection.getMode()).toBe("system");

    act(() => {
      button.click();
    });
    expect(runtime.selection.getMode()).toBe("light");

    act(() => {
      root.unmount();
    });

    document.body.removeChild(container);
  });

  it("exposes the runtime schedule reactively", () => {
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
      defaultTheme: "light",
      initialMode: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
      scheduled: {
        lightTheme: "light",
        darkTheme: "dark",
        latitude: 40.7128,
        longitude: -74.006,
      },
    });

    function ScheduleDemo() {
      const schedule = useThemeSchedule();
      const status = schedule ? schedule.status : "none";
      const enabled = schedule ? String(schedule.enabled) : "none";
      return (
        <span data-testid="schedule-status">
          {status}·{enabled}
        </span>
      );
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ThemeProvider runtime={runtime}>
          <ScheduleDemo />
        </ThemeProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="schedule-status"]')?.textContent,
    ).toBe("active·true");

    act(() => {
      runtime.schedule!.disable();
    });

    expect(
      container.querySelector('[data-testid="schedule-status"]')?.textContent,
    ).toBe("disabled·false");

    act(() => {
      runtime.schedule!.enable();
    });

    expect(
      container.querySelector('[data-testid="schedule-status"]')?.textContent,
    ).toBe("active·true");

    act(() => {
      root.unmount();
    });

    runtime.destroy();
    document.body.removeChild(container);
  });

  it("returns null when the runtime has no schedule", () => {
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
      defaultTheme: "light",
      dom: false,
      cssVariables: false,
      persistence: null,
    });

    function ScheduleDemo() {
      const schedule = useThemeSchedule();
      return <span data-testid="schedule-status">{schedule ? "set" : "none"}</span>;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ThemeProvider runtime={runtime}>
          <ScheduleDemo />
        </ThemeProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="schedule-status"]')?.textContent,
    ).toBe("none");

    act(() => {
      root.unmount();
    });

    runtime.destroy();
    document.body.removeChild(container);
  });
});

/**
 * Hydration snapshots.
 *
 * A client runtime can legitimately hold a different value than the one the
 * server rendered — it adopts the pre-paint bootstrap, which knows
 * `prefers-color-scheme` and the server does not. React therefore needs the
 * server's value for the hydration render and the live one afterwards, which is
 * what `runtime.initial` is for. Without it the two disagree and React reports
 * a hydration mismatch.
 */
describe("react hooks — hydration snapshot", () => {
  const themes = [
    defineTheme({
      name: "light",
      meta: { family: "default", mode: "light" },
      tokens: { colors: { background: "#ffffff" } },
    }),
    defineTheme({
      name: "dark",
      meta: { family: "default", mode: "dark" },
      tokens: { colors: { background: "#000000" } },
    }),
  ];

  function ModeDemo() {
    return <span>{useThemeMode()}</span>;
  }

  it("renders the server's selection while the live one differs", () => {
    const runtime = createThemeRuntime({
      themes,
      defaultTheme: "light",
      initial: {
        theme: themes[0]!,
        selection: { mode: "system", family: "default" },
      },
    });

    // What the browser resolved after adopting the bootstrap.
    runtime.selection.setMode("dark");
    expect(runtime.selection.getMode()).toBe("dark");

    const html = renderToString(
      <ThemeProvider runtime={runtime}>
        <ModeDemo />
      </ThemeProvider>,
    );

    // The hydration render uses the server's value, not the live one.
    expect(html).toContain("system");
    expect(html).not.toContain("dark");
  });
});
