import { describe, expect, it } from "vitest";
import { defineTheme } from "@theme-kit/core";
import { computeFingerprint } from "../src/fingerprint";
import {
  buildThemeBootstrapPayload,
  buildThemeCssMap,
  createBlockingScript,
  type BlockingScriptOptions,
} from "../src/blocking-script";

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
const themeCssMap = buildThemeCssMap(themes);
const payload = buildThemeBootstrapPayload(themes, "mint");

const options: BlockingScriptOptions = {
  mode: "system",
  family: payload.family,
  names: payload.names,
  defaults: payload.defaults,
};

const script = createBlockingScript(fingerprint, themeCssMap, options);

function cookieString(parts: Record<string, string>): string {
  return Object.entries(parts)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");
}

interface DomState {
  dark: boolean;
  attributes: Record<string, string>;
  variables: Record<string, string>;
  colorScheme: string | null;
}

/**
 * Runs the generated script against a minimal DOM. The script is
 * dependency-free and only needs `document.cookie`,
 * `document.documentElement` (`classList`, `style`, `setAttribute`) and
 * `window.matchMedia`.
 */
function execute(
  source: string,
  env: { cookie?: string; systemDark?: boolean; matchMedia?: boolean } = {},
): DomState {
  const { cookie = "", systemDark = false, matchMedia = true } = env;

  const classes = new Set<string>();
  const attributes: Record<string, string> = {};
  const variables: Record<string, string> = {};
  const style = {
    colorScheme: null as string | null,
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
      getAttribute(name: string) {
        return attributes[name] ?? null;
      },
    },
    cookie,
    createElement: () => ({ setAttribute() {}, textContent: "" }),
    head: { appendChild() {} },
  };

  scope.window = matchMedia
    ? {
        matchMedia: (query: string) => ({
          matches: query.includes("dark") ? systemDark : !systemDark,
        }),
      }
    : {};

  try {
    // Indirect eval so the script runs against the stubbed globals.
    (0, eval)(source);
  } finally {
    scope.document = previousDocument;
    scope.window = previousWindow;
  }

  return {
    dark: classes.has("dark"),
    attributes,
    variables,
    colorScheme: style.colorScheme,
  };
}

describe("createBlockingScript — pre-paint contract", () => {
  it("applies the dark theme when nothing is persisted and the OS prefers dark", () => {
    const dom = execute(script, { systemDark: true });

    expect(dom.dark).toBe(true);
    expect(dom.colorScheme).toBe("dark");
    expect(dom.attributes["data-theme-mode"]).toBe("dark");
    expect(dom.attributes["data-theme"]).toBe("mint-dark");
    expect(dom.attributes["data-theme-family"]).toBe("mint");
    expect(dom.variables).toEqual(themeCssMap["mint:dark"]);
  });

  it("applies the light theme when nothing is persisted and the OS prefers light", () => {
    const dom = execute(script, { systemDark: false });

    expect(dom.dark).toBe(false);
    expect(dom.colorScheme).toBe("light");
    expect(dom.attributes["data-theme-mode"]).toBe("light");
    expect(dom.attributes["data-theme"]).toBe("mint-light");
    expect(dom.attributes["data-theme-family"]).toBe("mint");
    expect(dom.variables).toEqual(themeCssMap["mint:light"]);
  });

  it("applies the persisted family and mode from the cookies", () => {
    const dom = execute(script, {
      cookie: cookieString({
        "theme-mode": "dark",
        "theme-family": "ocean",
        "theme-fingerprint": fingerprint,
      }),
    });

    expect(dom.dark).toBe(true);
    expect(dom.attributes["data-theme"]).toBe("ocean-dark");
    expect(dom.attributes["data-theme-family"]).toBe("ocean");
    expect(dom.variables).toEqual(themeCssMap["ocean:dark"]);
  });

  it("rejects stale cookies whose fingerprint does not match", () => {
    const dom = execute(script, {
      cookie: cookieString({
        "theme-mode": "dark",
        "theme-family": "ocean",
        "theme-fingerprint": "stale|other",
      }),
      systemDark: false,
    });

    expect(dom.dark).toBe(false);
    expect(dom.attributes["data-theme"]).toBe("mint-light");
    expect(dom.variables).toEqual(themeCssMap["mint:light"]);
  });

  it("falls back to the default family when the persisted family is unknown", () => {
    const dom = execute(script, {
      cookie: cookieString({
        "theme-mode": "dark",
        "theme-family": "plum",
        "theme-fingerprint": fingerprint,
      }),
    });

    expect(dom.attributes["data-theme"]).toBe("mint-dark");
    // The fallback family is written, not the unknown cookie family — the
    // client runtime writes the resolved theme's family for the same state.
    expect(dom.attributes["data-theme-family"]).toBe("mint");
    expect(dom.variables).toEqual(themeCssMap["mint:dark"]);
  });

  it("does not throw when matchMedia is unavailable", () => {
    const dom = execute(script, { matchMedia: false });

    expect(dom.dark).toBe(false);
    expect(dom.colorScheme).toBe("light");
    expect(dom.attributes["data-theme-mode"]).toBe("light");
    expect(dom.variables).toEqual(themeCssMap["mint:light"]);
  });

  it("produces identical state when run repeatedly (idempotent)", () => {
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

describe("createBlockingScript — options and backwards compatibility", () => {
  it("still runs without the options object", () => {
    const legacy = createBlockingScript(fingerprint, themeCssMap);

    expect(legacy).toContain("(function(){try{");
    expect(legacy).toContain("})()");

    // Resolves the family from the map and still corrects the mode marker.
    const dom = execute(legacy, {
      cookie: cookieString({ "theme-mode": "system" }),
      systemDark: true,
    });

    expect(dom.dark).toBe(true);
    expect(dom.attributes["data-theme-mode"]).toBe("dark");
    expect(dom.variables).toEqual(themeCssMap["mint:dark"]);
  });

  it("omits the fingerprint guard when the fingerprint is empty", () => {
    expect(createBlockingScript("", {})).not.toContain("fp!==");
  });

  it("survives an empty theme map", () => {
    const dom = execute(createBlockingScript("", {}), { systemDark: true });

    expect(dom.colorScheme).toBe("dark");
    expect(dom.attributes["data-theme"]).toBeUndefined();
  });
});

describe("buildThemeBootstrapPayload", () => {
  it("maps theme names and family:mode keys to theme names", () => {
    expect(payload.names["mint-light"]).toBe("mint-light");
    expect(payload.names["ocean:dark"]).toBe("ocean-dark");
  });

  it("resolves the fallback family's light and dark variables", () => {
    expect(payload.family).toBe("mint");
    expect(payload.defaults.lightName).toBe("mint-light");
    expect(payload.defaults.darkName).toBe("mint-dark");
    expect(payload.defaults.light).toEqual(themeCssMap["mint:light"]);
    expect(payload.defaults.dark).toEqual(themeCssMap["mint:dark"]);
  });

  it("resolves dark against the family light resolved to when it is unknown", () => {
    const other = buildThemeBootstrapPayload(themes, "plum");

    expect(other.defaults.lightName).toBe("mint-light");
    expect(other.defaults.darkName).toBe("mint-dark");
    expect(other.family).toBe("mint");
    expect(other.defaults.dark).toEqual(themeCssMap["mint:dark"]);
  });
});

/**
 * `buildThemeBootstrapPayload` returns `plan.fallbackFamily ?? ""`. That `?? ""`
 * is a type boundary, not a runtime possibility: on the themes path
 * `buildBootstrapPlan` always resolves a family. It is asserted here so the
 * coercion cannot silently absorb a future regression — if `fallbackFamily`
 * ever became null, `createBlockingScript` would receive `family: ""`, drop the
 * `data-theme-family` attribute, and stop agreeing with the client runtime
 * without failing anything else.
 */
describe("buildThemeBootstrapPayload — fallback family invariant", () => {
  const families = [
    "mint", // known
    "ocean", // known, not the first
    "plum", // unknown
    "", // empty
    "MINT", // wrong case
    "mint:dark", // a map key, not a family
  ];

  it("never returns null or undefined for any requested family", () => {
    for (const family of families) {
      const result = buildThemeBootstrapPayload(themes, family);

      expect(result.family, `family=${JSON.stringify(family)}`).not.toBeNull();
      expect(result.family, `family=${JSON.stringify(family)}`).not.toBeUndefined();
      expect(typeof result.family).toBe("string");
    }
  });

  it("always returns a family that exists in the registry", () => {
    const declared = new Set(themes.map((theme) => theme.meta!.family));

    for (const family of families) {
      expect(
        declared.has(buildThemeBootstrapPayload(themes, family).family),
        `family=${JSON.stringify(family)} must resolve to a declared family`,
      ).toBe(true);
    }
  });

  it("keeps the invariant for a registry without meta", () => {
    // `getThemeFamily` falls back to `"default"`, so even a registry whose
    // themes declare no `meta` yields a usable family.
    const bare = [
      defineTheme({ name: "light", tokens: { colors: { background: "#fff" } } }),
      defineTheme({ name: "dark", tokens: { colors: { background: "#000" } } }),
    ];

    const result = buildThemeBootstrapPayload(bare, "plum");

    expect(result.family).toBe("default");
    expect(result.defaults.lightName).toBe("light");
    expect(result.defaults.darkName).toBe("dark");
  });

  it("keeps the invariant for a single-theme registry", () => {
    const single = [themes[0]!];

    const result = buildThemeBootstrapPayload(single, "plum");

    expect(result.family).toBe("mint");
    expect(result.defaults.lightName).toBe("mint-light");
    // No dark theme exists, so both defaults resolve to the only theme.
    expect(result.defaults.darkName).toBe("mint-light");
  });
});