import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import {
  getBlockingScriptContent,
  getDarkModeCSS,
} from "../src/blocking-script";
import { computeFingerprint } from "../src/fingerprint";

/**
 * The pre-paint script is the only thing standing between a reload and a flash
 * of the wrong theme, and until this file existed `@theme-kit/remix` had no
 * test that executed it. Everything here runs the real generated script.
 */
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
  defineTheme({
    name: "ocean-light",
    meta: { family: "ocean", mode: "light" },
    tokens: { colors: { background: "#f2f8ff" } },
  }),
  defineTheme({
    name: "ocean-dark",
    meta: { family: "ocean", mode: "dark" },
    tokens: { colors: { background: "#04121f" } },
  }),
];

const fingerprint = computeFingerprint(themes, "mint-light");

interface DomState {
  dark: boolean;
  colorScheme: string | null;
  theme: string | null;
  mode: string | null;
  family: string | null;
  variables: Record<string, string>;
}

/**
 * Runs the generated script against a stubbed document. The script only needs
 * `document.cookie`, `document.documentElement` (`classList`, `style`,
 * `setAttribute`) and `window.matchMedia`.
 */
function execute(
  source: string,
  env: { cookie?: string; systemDark?: boolean } = {},
): DomState {
  const { cookie = "", systemDark = false } = env;

  const classes = new Set<string>();
  const attributes: Record<string, string> = {};
  const variables: Record<string, string> = {};
  const style = {
    colorScheme: "" as string,
    setProperty(name: string, value: string) {
      variables[name] = value;
    },
  };

  const scope = globalThis as { document?: unknown; window?: unknown };
  const previousDocument = scope.document;
  const previousWindow = scope.window;

  scope.document = {
    documentElement: {
      classList: {
        add: (name: string) => classes.add(name),
        remove: (name: string) => classes.delete(name),
        contains: (name: string) => classes.has(name),
      },
      style,
      setAttribute(name: string, value: string) {
        attributes[name] = String(value);
      },
    },
    cookie,
  };

  scope.window = {
    matchMedia: (query: string) => ({
      matches: query.includes("dark") ? systemDark : !systemDark,
    }),
  };

  try {
    // Indirect eval so the script runs against the stubbed globals.
    (0, eval)(source);
  } finally {
    scope.document = previousDocument;
    scope.window = previousWindow;
  }

  return {
    dark: classes.has("dark"),
    colorScheme: style.colorScheme === "" ? null : style.colorScheme,
    theme: attributes["data-theme"] ?? null,
    mode: attributes["data-theme-mode"] ?? null,
    family: attributes["data-theme-family"] ?? null,
    variables,
  };
}

function cookieString(parts: Record<string, string>): string {
  return Object.entries(parts)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");
}

const script = getBlockingScriptContent(themes, "mint-light");

describe("getBlockingScriptContent — pre-paint contract", () => {
  it("applies the default light theme on a first visit with a light OS", () => {
    expect(execute(script)).toEqual({
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    });
  });

  it("ignores the OS when no mode is configured: the fallback is the default theme's own mode", () => {
    // `buildBootstrapPlan` derives the script's fallback mode from
    // `resolveInitialTheme` — the very value the client runtime adopts — rather
    // than hardcoding "system". Hardcoding it made a first-time visitor on a
    // dark OS paint dark and then get corrected to light by the runtime: a
    // visible flash. Pass `mode: "system"` to follow `prefers-color-scheme`.
    const dom = execute(script, { systemDark: true });

    expect(dom).toEqual({
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    });
  });

  it("follows the OS on a first visit when the configured mode is system", () => {
    // The opt-in path: the script's fallback mode becomes "system", so it
    // resolves `prefers-color-scheme` pre-paint.
    const systemScript = getBlockingScriptContent(themes, "mint-light", "system");
    const dom = execute(systemScript, { systemDark: true });

    expect(dom).toEqual({
      dark: true,
      colorScheme: "dark",
      theme: "mint-dark",
      mode: "dark",
      family: "mint",
      variables: { "--theme-color-background": "#101014" },
    });
  });

  it("applies the persisted selection when the fingerprint matches", () => {
    const dom = execute(script, {
      cookie: cookieString({
        "theme-mode": "dark",
        "theme-family": "ocean",
        "theme-fingerprint": fingerprint,
      }),
    });

    expect(dom.dark).toBe(true);
    expect(dom.theme).toBe("ocean-dark");
    expect(dom.family).toBe("ocean");
    expect(dom.variables).toEqual({ "--theme-color-background": "#04121f" });
  });

  it("rejects stale cookies and falls back to the default", () => {
    const dom = execute(script, {
      cookie: cookieString({
        "theme-mode": "dark",
        "theme-family": "ocean",
        "theme-fingerprint": "an-old-config",
      }),
    });

    expect(dom.dark).toBe(false);
    expect(dom.theme).toBe("mint-light");
    expect(dom.variables).toEqual({ "--theme-color-background": "#ffffff" });
  });

  it("writes the resolved family, not an unknown persisted one", () => {
    const dom = execute(script, {
      cookie: cookieString({
        "theme-mode": "dark",
        "theme-family": "plum",
        "theme-fingerprint": fingerprint,
      }),
    });

    expect(dom.theme).toBe("mint-dark");
    // The client runtime writes the resolved theme's family; the pre-paint
    // script must agree or hydration corrects the paint.
    expect(dom.family).toBe("mint");
    expect(dom.variables).toEqual({ "--theme-color-background": "#101014" });
  });

  it("honours mode/family cookies that arrive without a fingerprint cookie", () => {
    // Documents a deliberate asymmetry: the script's guard is `if(fp && fp !==
    // F)`, so a missing fingerprint cookie does not invalidate the selection,
    // while the Remix server loader requires a matching fingerprint. In
    // practice the three cookies are written together.
    const dom = execute(script, {
      cookie: cookieString({ "theme-mode": "dark", "theme-family": "ocean" }),
    });

    expect(dom.theme).toBe("ocean-dark");
    expect(dom.family).toBe("ocean");
  });

  it("does not throw when matchMedia is unavailable", () => {
    const scope = globalThis as { document?: unknown; window?: unknown };
    const previousDocument = scope.document;
    const previousWindow = scope.window;
    scope.document = {
      documentElement: {
        classList: { add() {}, remove() {}, contains: () => false },
        style: { colorScheme: "", setProperty() {} },
        setAttribute() {},
      },
      cookie: "",
    };
    scope.window = {};

    try {
      expect(() => (0, eval)(script)).not.toThrow();
    } finally {
      scope.document = previousDocument;
      scope.window = previousWindow;
    }
  });

  it("is idempotent", () => {
    const env = {
      cookie: cookieString({
        "theme-mode": "system",
        "theme-family": "ocean",
        "theme-fingerprint": fingerprint,
      }),
      systemDark: true,
    };

    expect(execute(script, env)).toEqual(execute(script, env));
  });
});

describe("getDarkModeCSS", () => {
  it("returns null when the resolved default is a fixed mode", () => {
    // `resolveInitialTheme` derives the mode from the fallback theme itself,
    // so a normal registry resolves to light/dark and the no-JS dark fallback
    // is never emitted. Recorded here because it diverges from
    // Next/Astro/Nuxt, which thread the persisted mode through and therefore
    // do emit the block.
    expect(getDarkModeCSS(themes, "mint-light")).toBeNull();
    expect(getDarkModeCSS(themes, "ocean-dark")).toBeNull();
  });

  it("emits the media block when a theme declares system mode", () => {
    const systemThemes = [
      defineTheme({
        name: "auto",
        meta: { family: "auto", mode: "system" },
        tokens: { colors: { background: "#ffffff" } },
      }),
      defineTheme({
        name: "auto-dark",
        meta: { family: "auto", mode: "dark" },
        tokens: { colors: { background: "#000000" } },
      }),
    ];

    const css = getDarkModeCSS(systemThemes);

    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("--theme-color-background: #000000;");
  });
});
