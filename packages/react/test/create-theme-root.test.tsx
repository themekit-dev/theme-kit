// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { defineTheme, type ThemeRuntime } from "@theme-kit/core";
import { createThemeRoot, ThemeProvider } from "../src";

const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light" },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark" },
  }),
] as const;

function App() {
  return <div data-testid="app">hello</div>;
}

function makeContainer() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

function cleanDom() {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-theme-mode");
  document.getElementById("theme-kit-bootstrap")?.remove();
}

type Opts = Parameters<typeof createThemeRoot>[0];

const baseOptions = (container: HTMLElement): Opts => ({
  container,
  themes,
  defaultTheme: "mint-light",
  initialMode: "light",
  dom: false,
  cssVariables: false,
  persistence: null,
  render: () => <App />,
});

describe("createThemeRoot", () => {
  it("commits the initial render synchronously at call time", () => {
    const container = makeContainer();
    cleanDom();

    act(() => {
      createThemeRoot(baseOptions(container));

      // Still inside the act scope, immediately after the helper call: the
      // themed tree is already committed (createThemeRoot flushes its first
      // render). A plain createRoot().render() is NOT in the DOM here.
      expect(container.querySelector('[data-testid="app"]')?.textContent).toBe(
        "hello",
      );
    });

    container.remove();
    cleanDom();
  });

  it("applies the runtime theme DOM synchronously at call time", () => {
    const container = makeContainer();
    cleanDom();

    let handle: ReturnType<typeof createThemeRoot> | null = null;
    act(() => {
      handle = createThemeRoot({
        ...baseOptions(container),
        initialMode: "dark",
        dom: true,
      });

      // The DOM binding (data-theme) is applied within the same call stack as
      // createThemeRoot — the very first frame is themed.
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "mint-dark",
      );
    });

    act(() => handle!.unmount());
    container.remove();
    cleanDom();
  });

  it("passes the created runtime to render and exposes it on the handle", () => {
    const container = makeContainer();
    cleanDom();

    let captured: ThemeRuntime<any> | null = null;
    let handle: ReturnType<typeof createThemeRoot> | null = null;
    act(() => {
      handle = createThemeRoot({
        ...baseOptions(container),
        render: ({ runtime }) => {
          captured = runtime;
          return <App />;
        },
      });
    });

    // The runtime the render callback received IS the runtime on the handle —
    // a single runtime drives context, render composition, and unmount.
    expect(captured).toBe(handle!.runtime);
    expect(handle!.runtime.store.get().name).toBe("mint-light");
    expect(handle!.root).toBeTruthy();

    act(() => handle!.unmount());
    container.remove();
    cleanDom();
  });

  it("unmount() empties the container", () => {
    const container = makeContainer();
    cleanDom();

    let handle: ReturnType<typeof createThemeRoot> | null = null;
    act(() => {
      handle = createThemeRoot(baseOptions(container));
    });
    expect(container.childElementCount).toBeGreaterThan(0);

    act(() => handle!.unmount());
    expect(container.innerHTML).toBe("");

    container.remove();
    cleanDom();
  });

  it("plain createRoot + ThemeProvider does NOT commit synchronously (contrast case)", () => {
    const container = makeContainer();
    cleanDom();

    const root = createRoot(container);
    act(() => {
      root.render(
        <ThemeProvider
          themes={themes}
          defaultTheme="mint-light"
          initialMode="light"
          dom={false}
          cssVariables={false}
          persistence={null}
        >
          <App />
        </ThemeProvider>,
      );

      // React's concurrent root schedules the initial commit; even inside
      // act it has not been performed at this point. This is exactly the gap
      // createThemeRoot closes for the first frame.
      expect(container.innerHTML).toBe("");
    });

    // act flushed the scheduled work by the time the scope exits.
    expect(container.querySelector('[data-testid="app"]')).toBeTruthy();

    act(() => root.unmount());
    container.remove();
    cleanDom();
  });
});
