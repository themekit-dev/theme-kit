import { describe, expect, it, vi } from "vitest";
import { createSyncFirstRoot } from "../src/sync-first-root";
import { themeKitVitePlugin } from "../src/vite-plugin";
import { defineTheme } from "../src/model";

/**
 * The synchronous-first-render contract.
 *
 * What matters is that exactly one render per root is forced, and that the
 * plugin does not reach into dependency code. Both are invisible in a unit test
 * unless they are expressed as plain functions of their dependencies — hence
 * `createSyncFirstRoot` rather than a generated snippet.
 */

/**
 * Core's tests run in node, so there is no DOM. The wrapper never touches the
 * container — it only forwards it — so a plain object stands in.
 */
const STUB_CONTAINER = {} as Element;

/** A stand-in for React's root, recording how each render was dispatched. */
function makeRoot() {
  const calls: string[] = [];
  let insideFlush = false;
  const root = {
    render: vi.fn((node: unknown) => {
      calls.push(`${String(node)}${insideFlush ? " (flushed)" : ""}`);
      return `rendered:${String(node)}`;
    }),
    unmount: vi.fn(),
  };
  const flushSync = (cb: () => void) => {
    insideFlush = true;
    try {
      cb();
    } finally {
      insideFlush = false;
    }
  };
  return { root, calls, flushSync };
}

describe("createSyncFirstRoot", () => {
  it("commits the first render synchronously and leaves later ones alone", () => {
    const { root, calls, flushSync } = makeRoot();
    const createRoot = createSyncFirstRoot(() => root, flushSync);
    const instance = createRoot(STUB_CONTAINER);

    instance.render("a");
    instance.render("b");
    instance.render("c");

    expect(calls).toEqual(["a (flushed)", "b", "c"]);
    expect(root.render).toHaveBeenCalledTimes(3);
  });

  it("returns whatever the underlying render returned", () => {
    const { root, flushSync } = makeRoot();
    const instance = createSyncFirstRoot(() => root, flushSync)(
      STUB_CONTAINER,
    );
    expect(instance.render("a")).toBe("rendered:a");
    expect(instance.render("b")).toBe("rendered:b");
  });

  it("flushes once per root, not once globally", () => {
    const first = makeRoot();
    const second = makeRoot();
    const flushCalls = vi.fn();
    let n = 0;
    const createRoot = createSyncFirstRoot(
      () => (n++ === 0 ? first.root : second.root),
      (cb) => {
        flushCalls();
        cb();
      },
    );

    const a = createRoot(STUB_CONTAINER);
    const b = createRoot(STUB_CONTAINER);
    a.render("a1");
    a.render("a2");
    b.render("b1");
    b.render("b2");

    // Two roots, two flushes — one each. A global "first render ever" flag
    // would leave the second root unsynchronised.
    expect(flushCalls).toHaveBeenCalledTimes(2);
    expect(first.calls).toEqual(["a1", "a2"]);
    expect(second.calls).toEqual(["b1", "b2"]);
  });

  it("wraps only the first root when asked", () => {
    const first = makeRoot();
    const second = makeRoot();
    const flushCalls = vi.fn();
    let n = 0;
    const createRoot = createSyncFirstRoot(
      () => (n++ === 0 ? first.root : second.root),
      (cb) => {
        flushCalls();
        cb();
      },
      { onlyFirstRoot: true },
    );

    createRoot(STUB_CONTAINER).render("app");
    // A library creating its own root from an effect — Theme Kit's own
    // ThemeScrollbar does this, once per arrow. Flushing here would put
    // `flushSync` inside React's commit phase and React would log
    // "flushSync was called from inside a lifecycle method".
    createRoot(STUB_CONTAINER).render("arrow");

    expect(flushCalls).toHaveBeenCalledTimes(1);
    expect(first.calls).toEqual(["app"]);
    expect(second.calls).toEqual(["arrow"]);
  });

  it("forwards other members and binds methods to the real root", () => {
    const { root, flushSync } = makeRoot();
    const instance = createSyncFirstRoot(() => root, flushSync)(
      STUB_CONTAINER,
    );
    instance.unmount();
    expect(root.unmount).toHaveBeenCalledTimes(1);
  });
});

describe("themeKitVitePlugin — syncFirstRender scoping", () => {
  const themes = [defineTheme({ name: "mint-light", meta: { family: "mint", mode: "light" } })];
  const plugin = () => themeKitVitePlugin({ themes, defaultTheme: "mint-light" });
  const virtualId = "\0virtual:theme-kit/react-dom-client";

  it("aliases react-dom/client for application code", () => {
    const id = plugin().resolveId?.("react-dom/client", "/app/src/main.tsx");
    expect(id).toBe(virtualId);
  });

  it("leaves a dependency's import of react-dom/client untouched", () => {
    for (const importer of [
      "/app/node_modules/some-lib/dist/index.js",
      "D:\\app\\node_modules\\some-lib\\dist\\index.js",
    ]) {
      expect(plugin().resolveId?.("react-dom/client", importer)).toBeNull();
    }
  });

  it("ignores every other module", () => {
    expect(plugin().resolveId?.("react-dom", "/app/src/main.tsx")).toBeNull();
    expect(plugin().resolveId?.("react", "/app/src/main.tsx")).toBeNull();
  });

  it("emits a shim that delegates to createSyncFirstRoot", async () => {
    const source = await plugin().load?.call(
      {
        resolve: async (source: string) => ({
          id: `/resolved/${source.replace(/[\\/]/g, "_")}.js`,
        }),
      } as never,
      virtualId,
    );
    expect(source).toContain("export * from");
    expect(source).toContain("__tkCreateRoot as createRoot");
    // The shim itself must not mention the real module's `createRoot` at all:
    // re-exporting it and declaring a local of the same name in one module is
    // what made a bundler emit `createSyncFirstRoot(createRoot, …)`, a
    // temporal-dead-zone error at module evaluation.
    expect(source).not.toMatch(/\.createRoot\b/);
  });

  it("falls back to the real module when React cannot be resolved", async () => {
    const source = await plugin().load?.call(
      { resolve: async () => null } as never,
      virtualId,
    );
    expect(source).toBe(`export * from "react-dom/client";`);
  });

  it("never aliases in an SSR build", () => {
    const p = plugin();
    p.configResolved?.({ build: { ssr: "src/entry-server.tsx" } });
    // Nothing is painted on a server, so the shim can do no good there — and it
    // breaks the build: @theme-kit/react imports react-dom/client, so an SSR
    // bundle would pull the shim in and evaluate it in Node.
    expect(p.resolveId?.("react-dom/client", "/app/src/main.tsx")).toBeNull();
    expect(p.resolveId?.("virtual:theme-kit/react-dom-client-wrapper", "/app/x")).toBeNull();
  });

  it("lets its own modules resolve the real react-dom/client", () => {
    const p = plugin();
    // Marked internal. `skipSelf` does not skip this plugin when resolution is
    // initiated from `load`, and that call has no importer to key off — without
    // the marker the wrapper imports the shim, which imports the wrapper, and
    // Vite fails with "Failed to resolve import virtual:theme-kit/...".
    expect(
      p.resolveId?.("react-dom/client", undefined, {
        custom: { themeKitInternal: true },
      }),
    ).toBeNull();
    // An unmarked application import is still aliased.
    expect(p.resolveId?.("react-dom/client", "/app/src/main.tsx")).toBe(virtualId);
  });

  it("resolves the wrapper specifier even from its own modules", () => {
    // The self-guard above must not swallow this one, or the shim cannot reach
    // the wrapper.
    expect(
      plugin().resolveId?.(
        "virtual:theme-kit/react-dom-client-wrapper",
        "\0virtual:theme-kit/react-dom-client",
      ),
    ).toBe("\0virtual:theme-kit/react-dom-client-wrapper");
  });

  it("lets its own modules resolve the real react-dom/client", () => {
    const p = plugin();
    // Marked internal. `skipSelf` does not skip this plugin when resolution is
    // initiated from `load`, and that call has no importer to key off — without
    // the marker the wrapper imports the shim, which imports the wrapper, and
    // Vite fails with "Failed to resolve import virtual:theme-kit/...".
    expect(
      p.resolveId?.("react-dom/client", undefined, {
        custom: { themeKitInternal: true },
      }),
    ).toBeNull();
    // An unmarked application import is still aliased.
    expect(p.resolveId?.("react-dom/client", "/app/src/main.tsx")).toBe(virtualId);
  });

  it("resolves the wrapper specifier even from its own modules", () => {
    // The self-guard above must not swallow this one, or the shim cannot reach
    // the wrapper.
    expect(
      plugin().resolveId?.(
        "virtual:theme-kit/react-dom-client-wrapper",
        " virtual:theme-kit/react-dom-client",
      ),
    ).toBe(" virtual:theme-kit/react-dom-client-wrapper");
  });

  it("derives the bootstrap from the provider's config", async () => {
    // One object, two consumers: the plugin reads the registry, fallback theme
    // and initial mode from the same config the provider spreads. Nothing to
    // keep in sync, so the script and the runtime cannot disagree.
    const only = defineTheme({
      name: "plum-dark",
      meta: { family: "plum", mode: "dark" },
      tokens: { colors: { background: "#0f0520" } },
    });
    const withConfig = themeKitVitePlugin({
      config: { themes: [only], defaultTheme: "plum-dark", initialMode: "dark" },
    });
    const tags = (await withConfig.transformIndexHtml("")) as { children?: string }[];
    const script = tags[0]?.children ?? "";
    expect(script).toContain("plum-dark");
    expect(script).toContain('"__default-dark"');
  });

  it("ignores the deprecated inline options when config is given", async () => {
    const only = defineTheme({
      name: "plum-dark",
      meta: { family: "plum", mode: "dark" },
      tokens: { colors: { background: "#0f0520" } },
    });
    const plugin = themeKitVitePlugin({
      // Deliberately contradictory: `config` is the single source, so the
      // inline registry must not leak into the emitted script.
      themes: [defineTheme({ name: "mint-light", meta: { family: "mint", mode: "light" } })],
      defaultTheme: "mint-light",
      config: { themes: [only], defaultTheme: "plum-dark" },
    });
    const tags = (await plugin.transformIndexHtml("")) as { children?: string }[];
    const script = tags[0]?.children ?? "";
    expect(script).toContain("plum-dark");
    expect(script).not.toContain("mint-light");
  });

  it("says what is missing when no registry is given", async () => {
    const plugin = themeKitVitePlugin({} as never);
    await expect(plugin.transformIndexHtml("")).rejects.toThrow(/theme registry/);
  });

  it("drops the shim entirely when opted out", () => {
    const opted = themeKitVitePlugin({ themes, defaultTheme: "mint-light", syncFirstRender: false });
    expect(opted.resolveId).toBeUndefined();
    expect(opted.load).toBeUndefined();
  });
});

describe("themeKitVitePlugin — dev prerender", () => {
  const themes = [defineTheme({ name: "mint-light", meta: { family: "mint", mode: "light" } })];
  const EMPTY_HTML = '<!doctype html><html><body><div id="root"></div></body></html>';

  function devPlugin(
    ssrEntry: string | null | undefined,
    render?: () => string,
    opts: { css?: string } = {},
  ) {
    const plugin = themeKitVitePlugin({
      themes,
      defaultTheme: "mint-light",
      ...(ssrEntry !== undefined ? { ssrEntry } : {}),
    });
    plugin.configureServer?.({
      ssrLoadModule: async () => ({ render: render ?? (() => "<p>prerendered</p>") }),
      pluginContainer: {
        resolveId: async (id: string) =>
          id === "@theme-kit/core/scrollbar.css"
            ? { id: opts.css ?? "/pkg/core/dist/scrollbar.css" }
            : null,
      },
    });
    return plugin;
  }

  it("injects the rendered markup into the container", async () => {
    const result = await devPlugin("/src/entry-server.tsx").transformIndexHtml(EMPTY_HTML);
    expect(result).toMatchObject({
      html: '<!doctype html><html><body><div id="root"><p>prerendered</p></div></body></html>',
    });
    expect(Array.isArray((result as { tags: unknown[] }).tags)).toBe(true);
  });

  it("defaults to the conventional entry, so it works without configuration", async () => {
    // The whole point of the default: an app that follows the layout gets the
    // dev prerender for free. The stub answers any specifier, so a default that
    // was NOT applied would show up here as a missing injection.
    const result = await devPlugin(undefined).transformIndexHtml(EMPTY_HTML);
    expect(result).toMatchObject({
      html: expect.stringContaining('<div id="root"><p>prerendered</p></div>'),
    });
  });

  it("can be opted out with ssrEntry: null", async () => {
    const result = await devPlugin(null).transformIndexHtml(EMPTY_HTML);
    expect(Array.isArray(result)).toBe(true);
  });

  it("makes Theme Kit's stylesheet render-blocking in dev", async () => {
    // Vite injects CSS through JS in dev, so prerendered markup would paint
    // unstyled — a one-frame flash of unstyled content. A real link is
    // render-blocking, so the first paint is already styled.
    const result = await devPlugin(undefined).transformIndexHtml(EMPTY_HTML);
    const tags = (result as { tags: { tag: string; attrs?: Record<string, string> }[] }).tags;
    const link = tags.find((t) => t.attrs?.["data-theme-kit"] === "stylesheet");
    expect(link).toBeTruthy();
    expect(link?.tag).toBe("link");
    // `?direct` is load-bearing: without it Vite serves the JS transform of the
    // stylesheet, which a <link rel="stylesheet"> is not allowed to use.
    expect(link?.attrs?.href).toBe("/@fs//pkg/core/dist/scrollbar.css?direct");
  });

  it("falls back to the empty root when the render throws", async () => {
    const plugin = devPlugin("/src/entry-server.tsx", () => {
      throw new Error("boom");
    });
    const result = await plugin.transformIndexHtml(EMPTY_HTML);
    // A failing prerender must not take the dev server down.
    expect(Array.isArray(result)).toBe(true);
  });

  it("leaves a page with a different container alone", async () => {
    const html = '<div id="app"></div>';
    const result = await devPlugin("/src/entry-server.tsx").transformIndexHtml(html);
    expect(Array.isArray(result)).toBe(true);
  });
});
