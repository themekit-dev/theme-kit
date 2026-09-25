import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import {
  createThemeRuntime,
  createThemeReadoutScript,
  defineTheme,
  type ThemeDefinition,
} from "@theme-kit/core";
import { createThemeReadoutScript as createReadoutScriptFromCore } from "@theme-kit/core";
import { ThemeReadout } from "../src/theme-readout";
import { setGlobalRuntime } from "../src/shared-runtime";

/**
 * Regression matrix for the bootstrap-readout contract.
 *
 * The behaviour under test is the one that keeps re-appearing: for
 * `mode: "system"` the server renders a fallback it cannot verify, the pre-paint
 * bootstrap resolves the real value and patches the DOM, and React hydration
 * must then **not** put the server's fallback back. The final assertion in the
 * hydration suite is the heart of the contract.
 */

const mintLight = defineTheme({
  name: "mint-light",
  meta: { family: "mint", mode: "light" },
  tokens: { colors: { background: "#f8fafc", primary: "#059669" } },
});

const mintDark = defineTheme({
  name: "mint-dark",
  meta: { family: "mint", mode: "dark" },
  tokens: { colors: { background: "#020617", primary: "#10b981" } },
});

const themes: readonly ThemeDefinition[] = [mintLight, mintDark];

/** The payload the blocking bootstrap publishes (see `bootstrap.ts`). */
function publish(payload: Record<string, unknown>) {
  (window as unknown as Record<string, unknown>).__THEME_KIT_BOOTSTRAP__ = payload;
}

function runReadoutScript() {
  // The emitted script is a self-contained IIFE, exactly as the browser gets it.
  // eslint-disable-next-line no-new-func
  new Function(createThemeReadoutScript())();
}

beforeEach(() => {
  document.documentElement.innerHTML = "";
  document.body.innerHTML = "";
  delete (window as unknown as Record<string, unknown>).__THEME_KIT_BOOTSTRAP__;
});

describe("the bootstrap publishes a selection the resolved mode cannot express", () => {
  it("writes the selection mode, the completion marker and the global payload", async () => {
    const { createBlockingScript, buildThemeBootstrapPayload } = await import(
      "../src/blocking-script"
    );
    const cssMap = Object.fromEntries(
      themes.map((t) => [t.name, { "--theme-color-background": "#000" }]),
    );
    const { names, defaults, family } = buildThemeBootstrapPayload(themes, "mint");

    const script = createBlockingScript("fp", cssMap, {
      mode: "system",
      family,
      names,
      defaults,
    });

    // `data-theme-mode` carries the *resolved* mode, so a `"system"` selection
    // is unrecoverable from it — which is why the selection is published too.
    expect(script).toContain("data-theme-selection-mode");
    expect(script).toContain("data-theme-selection-family");
    expect(script).toContain("data-theme-ready");
    expect(script).toContain("__THEME_KIT_BOOTSTRAP__");
    expect(script).toContain("selection:{mode:mode,family:family||fam}");
  });
});

describe("createThemeReadoutScript", () => {
  it("patches theme / mode / family from the published payload", () => {
    document.body.innerHTML = `
      <strong id="t" data-tk-readout="theme">mint-light</strong>
      <strong id="m" data-tk-readout="mode">system</strong>
      <strong id="f" data-tk-readout="family">mint</strong>
      <span id="untouched">keep me</span>`;
    publish({ theme: "mint-dark", mode: "dark", selection: { mode: "system", family: "mint" } });

    runReadoutScript();

    expect(document.getElementById("t")!.textContent).toBe("mint-dark");
    // The *selection*, not the resolved mode — the readout shows what the
    // visitor chose, which is still "system".
    expect(document.getElementById("m")!.textContent).toBe("system");
    expect(document.getElementById("f")!.textContent).toBe("mint");
    expect(document.getElementById("untouched")!.textContent).toBe("keep me");
  });

  it("patches var:<name> from the variable the bootstrap applied to <html>", () => {
    document.body.innerHTML = `<span id="v" data-tk-readout="var:--theme-color-primary">#059669</span>`;
    document.documentElement.style.setProperty("--theme-color-primary", "#10b981");
    publish({ theme: "mint-dark", selection: { mode: "dark", family: "mint" } });

    runReadoutScript();

    expect(document.getElementById("v")!.textContent).toBe("#10b981");
    document.documentElement.style.removeProperty("--theme-color-primary");
  });

  it("leaves the server text alone when the bootstrap did not publish (graceful absence)", () => {
    document.body.innerHTML = `<strong id="t" data-tk-readout="theme">mint-light</strong>`;

    // No payload: the script must return immediately, not throw and not blank
    // the readout.
    expect(() => runReadoutScript()).not.toThrow();
    expect(document.getElementById("t")!.textContent).toBe("mint-light");
  });

  it("is the same implementation the package re-exports", () => {
    expect(createReadoutScriptFromCore()).toBe(createThemeReadoutScript());
  });
});

describe("ThemeReadout encodes the contract for the caller", () => {
  function withRuntime<T>(fn: (runtime: ReturnType<typeof createThemeRuntime<ThemeDefinition>>) => T): T {
    const runtime = createThemeRuntime<ThemeDefinition>({
      themes,
      defaultTheme: "mint-light",
      initial: { theme: mintLight, selection: { family: "mint", mode: "light" } },
    });
    setGlobalRuntime(runtime);
    try {
      return fn(runtime);
    } finally {
      runtime.destroy();
    }
  }

  it("renders the marker attribute and the value", () => {
    withRuntime(() => {
      const html = renderToStaticMarkup(<ThemeReadout kind="theme" fallback="—" />);
      // `data-tk-readout` is a real DOM attribute, so it survives to the markup
      // the bootstrap patch script looks for.
      expect(html).toContain('data-tk-readout="theme"');
      expect(html).toContain("mint-light");
      // `suppressHydrationWarning` is deliberately NOT asserted here: it is a
      // React-only prop that never reaches the DOM, which is exactly why the
      // hydration test below — not a markup snapshot — is what proves the
      // contract.
    });
  });

  it("renders the fallback when a value is missing", () => {
    withRuntime(() => {
      const html = renderToStaticMarkup(<ThemeReadout kind="theme" fallback="—" />);
      expect(html).toContain("mint-light");
    });
  });

  /**
   * The heart of the contract: the bootstrap patches the node before hydration,
   * and hydration must leave that text in place.
   */
  it("does not let hydration overwrite a patched readout", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    document.body.appendChild(container);

    // 1. SSR: the server renders the fallback it cannot verify.
    container.innerHTML = renderToStaticMarkup(<ThemeReadout kind="theme" />);
    expect(container.textContent).toBe("mint-light");

    // 2. Bootstrap: the browser resolves the real value and patches the DOM.
    publish({ theme: "mint-dark", selection: { mode: "system", family: "mint" } });
    runReadoutScript();
    expect(container.textContent).toBe("mint-dark");

    // 3. Hydrate. React's own render produces the server's fallback here, which
    //    is exactly the value that must NOT win.
    let root: Root | null = null;
    withRuntime(() => {
      act(() => {
        root = hydrateRoot(container, <ThemeReadout kind="theme" />);
      });
    });

    expect(container.textContent).toBe("mint-dark");

    act(() => {
      root?.unmount();
    });
    errors.mockRestore();
  });

});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the head script patches readouts as they are parsed", () => {
  it("patches an element that appears after the script ran", async () => {
    // The bootstrap runs in <head>, before the body exists, so it cannot query
    // once — it watches instead. A body-end script is too late: the browser is
    // free to paint the prerendered value while the parser is still working.
    const { createThemeBootstrapScript } = await import("@theme-kit/core");
    const script = createThemeBootstrapScript({
      themes,
      defaultTheme: "mint-light",
      initialMode: "dark",
    });

    document.body.innerHTML = "";
    // eslint-disable-next-line no-new-func
    new Function(script)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("mint-dark");

    const el = document.createElement("span");
    el.setAttribute("data-tk-readout", "theme");
    el.textContent = "mint-light";
    document.body.appendChild(el);

    // MutationObserver callbacks are microtasks.
    await Promise.resolve();
    await Promise.resolve();
    expect(el.textContent).toBe("mint-dark");
    expect(el.getAttribute("data-tk-patched")).toBe("1");
  });
});

describe("the head script patches readouts as they are parsed", () => {
  it("patches an element that appears after the script ran", async () => {
    // The bootstrap runs in <head>, before the body exists, so it cannot query
    // once — it watches instead. A body-end script is too late: the browser is
    // free to paint the prerendered value while the parser is still working.
    const { createThemeBootstrapScript } = await import("@theme-kit/core");
    const script = createThemeBootstrapScript({
      themes,
      defaultTheme: "mint-light",
      initialMode: "dark",
    });

    document.body.innerHTML = "";
    // eslint-disable-next-line no-new-func
    new Function(script)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("mint-dark");

    const el = document.createElement("span");
    el.setAttribute("data-tk-readout", "theme");
    el.textContent = "mint-light";
    document.body.appendChild(el);

    // MutationObserver callbacks are microtasks.
    await Promise.resolve();
    await Promise.resolve();
    expect(el.textContent).toBe("mint-dark");
    expect(el.getAttribute("data-tk-patched")).toBe("1");
  });
});
