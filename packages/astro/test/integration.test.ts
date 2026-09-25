import { describe, expect, it } from "vitest";
import { pathToFileURL } from "node:url";
import { defineTheme } from "@theme-kit/core";
import { themeKit } from "../src/integration";
import { createNavigationScript } from "../src/navigation-script";

const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light" },
    tokens: { colors: { background: "#ffffff" } },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark" },
    tokens: { colors: { background: "#101014" } },
  }),
];

interface SetupOptions {
  injectScript(stage: string, content: string): void;
  config?: { root: URL | string };
}

/**
 * Runs the integration's `astro:config:setup` hook and collects injections.
 *
 * The hook is async — it awaits config discovery — so this must be awaited too;
 * collecting synchronously yields an empty array.
 *
 * `root` points at this package, which has no `theme.config.ts`. Discovery
 * therefore short-circuits on the file check and the options passed here are
 * the effective ones, which is what these cases are about. Without a root the
 * loader would search `process.cwd()`, and the result would depend on where the
 * suite was started from.
 */
async function inject(options: Parameters<typeof themeKit>[0]) {
  const injected: { stage: string; content: string }[] = [];

  const hook = themeKit(options).hooks["astro:config:setup"] as unknown as (
    setup: SetupOptions,
  ) => void | Promise<void>;

  await hook({
    config: { root: pathToFileURL(import.meta.dirname) },
    injectScript(stage, content) {
      injected.push({ stage, content });
    },
  });

  return injected;
}

/** Only the pre-paint scrollbar script from core matches coarse pointers. */
const COARSE_POINTER = "pointer: coarse";

describe("themeKit integration — injected scripts", () => {
  it("injects the pre-paint bootstrap and the navigation script", async () => {
    const injected = await inject({
      themes,
      defaultTheme: "mint-light",
      mode: "system",
    });

    expect(injected).toHaveLength(2);
    expect(injected.every((entry) => entry.stage === "head-inline")).toBe(true);
    expect(injected[0]!.content).toContain("fp!==");
    expect(injected[1]!.content).toContain("astro:before-swap");
    expect(injected.some((entry) => entry.content.includes(COARSE_POINTER))).toBe(
      false,
    );
  });

  it("injects the scrollbar pre-paint script when scrollbar is enabled", async () => {
    const injected = await inject({ themes, scrollbar: true });
    const scrollbar = injected.find((entry) =>
      entry.content.includes(COARSE_POINTER),
    );

    expect(injected).toHaveLength(3);
    expect(scrollbar).toBeDefined();
    // Default: coarse-pointer devices keep their native scrollbars.
    expect(scrollbar!.content).toContain("!false");
  });

  it("forces the scrollbar bootstrap on coarse pointers when touch is set", async () => {
    const injected = await inject({ themes, scrollbar: { touch: true } });
    const scrollbar = injected.find((entry) =>
      entry.content.includes(COARSE_POINTER),
    );

    expect(scrollbar!.content).toContain("!true");
  });

  it("can opt out of the navigation script", async () => {
    const injected = await inject({ themes, navigation: false });

    expect(injected).toHaveLength(1);
    expect(injected[0]!.content).not.toContain("astro:before-swap");
  });

  it("still injects the navigation script when the bootstrap is self-managed", async () => {
    const injected = await inject({ themes, injectBootstrap: false });

    expect(injected).toHaveLength(1);
    expect(injected[0]!.content).toContain("astro:before-swap");
  });
});


interface FakeRoot {
  classList: {
    add(name: string): void;
    remove(name: string): void;
    contains(name: string): boolean;
  };
  attributes: Record<string, string>;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
}

function fakeRoot(initialClasses: string[] = []): FakeRoot {
  const classes = new Set(initialClasses);
  const attributes: Record<string, string> = {};

  return {
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    attributes,
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return attributes[name] ?? null;
    },
  };
}

interface FakeDocument {
  documentElement: FakeRoot;
  root: FakeRoot;
  headChildren: unknown[];
  head?: { appendChild(node: unknown): void };
}

function fakeDocument(
  initialClasses: string[] = [],
  withHead = true,
): FakeDocument {
  const root = fakeRoot(initialClasses);
  const headChildren: unknown[] = [];

  const doc: FakeDocument = {
    documentElement: root,
    root,
    headChildren,
    getElementById: () => null,
    importNode: (node: unknown) => node,
  } as unknown as FakeDocument;

  if (withHead) {
    doc.head = {
      appendChild: (node) => {
        headChildren.push(node);
      },
    };
  }

  return doc;
}

interface LiveState {
  classes: string[];
  attributes?: Record<string, string>;
  style?: string | null;
  scrollbarStyle?: boolean;
}

/**
 * Executes the navigation script against a live document and dispatches
 * `astro:before-swap` with the given incoming document.
 */
function dispatchBeforeSwap(live: LiveState, next: unknown) {
  const liveRoot = fakeRoot(live.classes);
  if (live.style !== undefined && live.style !== null) {
    liveRoot.attributes["style"] = live.style;
  }
  for (const [name, value] of Object.entries(live.attributes ?? {})) {
    liveRoot.attributes[name] = value;
  }

  const scrollbarStyle = live.scrollbarStyle
    ? { id: "tk-scrollbar-style", textContent: "html.tk-scrollbar{scrollbar-width:none}" }
    : null;

  const handlers: Array<(event: unknown) => void> = [];
  const scope = globalThis as { document?: unknown };
  const previous = scope.document;

  scope.document = {
    documentElement: liveRoot,
    getElementById: (id: string) =>
      id === "tk-scrollbar-style" ? scrollbarStyle : null,
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      if (type === "astro:before-swap") handlers.push(handler);
    },
  };

  try {
    (0, eval)(createNavigationScript());
    for (const handler of handlers) handler({ newDocument: next });
  } finally {
    scope.document = previous;
  }

  return handlers.length;
}

describe("createNavigationScript — client-side navigation", () => {
  it("carries the resolved theme onto the incoming document", () => {
    const next = fakeDocument();

    const handlers = dispatchBeforeSwap(
      {
        classes: ["dark", "tk-scrollbar"],
        attributes: {
          "data-theme": "mint-dark",
          "data-theme-mode": "dark",
          "data-theme-family": "mint",
        },
        style: "color-scheme: dark; --theme-color-background: #101014",
        scrollbarStyle: true,
      },
      next,
    );

    expect(handlers).toBe(1);
    expect(next.root.classList.contains("dark")).toBe(true);
    expect(next.root.classList.contains("tk-scrollbar")).toBe(true);
    expect(next.root.attributes["data-theme"]).toBe("mint-dark");
    expect(next.root.attributes["data-theme-mode"]).toBe("dark");
    expect(next.root.attributes["data-theme-family"]).toBe("mint");
    expect(next.root.attributes["style"]).toBe(
      "color-scheme: dark; --theme-color-background: #101014",
    );
    expect(next.headChildren).toHaveLength(1);
    expect((next.headChildren[0] as { id: string }).id).toBe(
      "tk-scrollbar-style",
    );
  });

  it("restores the light state when the incoming document is dark", () => {
    const next = fakeDocument(["dark"]);

    dispatchBeforeSwap({ classes: [] }, next);

    expect(next.root.classList.contains("dark")).toBe(false);
  });

  it("keeps the scrollbar class without adding a style element when none exists", () => {
    const next = fakeDocument();

    dispatchBeforeSwap({ classes: ["tk-scrollbar"] }, next);

    expect(next.root.classList.contains("tk-scrollbar")).toBe(true);
    expect(next.headChildren).toHaveLength(0);
  });

  it("only copies attributes the live document actually has", () => {
    const next = fakeDocument();

    dispatchBeforeSwap(
      { classes: [], attributes: { "data-theme": "mint-light" } },
      next,
    );

    expect(next.root.attributes["data-theme"]).toBe("mint-light");
    expect(next.root.attributes["data-theme-mode"]).toBeUndefined();
  });

  it("ignores navigation events it cannot apply", () => {
    expect(dispatchBeforeSwap({ classes: [] }, null)).toBe(1);
    expect(() => dispatchBeforeSwap({ classes: [] }, {})).not.toThrow();
    expect(() =>
      dispatchBeforeSwap({ classes: [] }, fakeDocument([], false)),
    ).not.toThrow();
  });
});