// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  parseCookieHeader,
  encodeCookieValue,
  themeKitCookieNames,
} from "../src/server/cookies";
import { computeFingerprint } from "../src/server/fingerprint";
import {
  resolveThemeFromCookies,
} from "../src/server/resolve";
import {
  createNuxtThemeBootstrapScript,
  cssVariablesStyle,
} from "../src/server/bootstrap";
import type { ThemeDefinition } from "@theme-kit/core";

const themes: ThemeDefinition[] = [
  {
    name: "forest-light",
    meta: { family: "forest", mode: "light" },
    tokens: { colors: { background: "#f0fff0" } },
  },
  {
    name: "forest-dark",
    meta: { family: "forest", mode: "dark" },
    tokens: { colors: { background: "#002200" } },
  },
];

describe("parseCookieHeader", () => {
  it("parses a plain header", () => {
    expect(parseCookieHeader("a=1; b=2")).toEqual({ a: "1", b: "2" });
  });

  it("returns an empty map for an empty header", () => {
    expect(parseCookieHeader("")).toEqual({});
    expect(parseCookieHeader(undefined as unknown as string)).toEqual({});
  });

  it("skips parts without an equals sign", () => {
    expect(parseCookieHeader("just-a-token; a=1")).toEqual({ a: "1" });
  });

  it("trims whitespace around names and values", () => {
    expect(parseCookieHeader(" a = 1 ; b=2 ")).toEqual({ a: "1", b: "2" });
  });

  it("decodes URI-encoded values", () => {
    expect(parseCookieHeader(`mode=${encodeURIComponent("dark")}`)).toEqual({
      mode: "dark",
    });
  });

  it("tolerates malformed percent-encoding", () => {
    const parsed = parseCookieHeader("mode=%zz-not-valid");
    expect(parsed.mode).toBe("%zz-not-valid");
  });
});

describe("encodeCookieValue", () => {
  it("URI-encodes a value", () => {
    expect(encodeCookieValue("a b&c")).toBe("a%20b%26c");
  });
});

describe("computeFingerprint", () => {
  it("is deterministic and based on sorted theme names", () => {
    const a = computeFingerprint(themes, "forest-light");
    const b = computeFingerprint(themes, "forest-light");
    expect(a).toBe(b);
    expect(a).toContain("forest-dark");
    expect(a).toContain("forest-light");
  });

  it("includes the default theme", () => {
    expect(computeFingerprint(themes, "forest-light")).toBe(
      "forest-light|forest-dark,forest-light",
    );
  });

  it("returns empty when there are no themes", () => {
    expect(computeFingerprint([], "forest-light")).toBe("");
  });
});

describe("resolveThemeFromCookies", () => {
  const base = { themes, defaultTheme: "forest-light", initialMode: "system" as const };

  it("falls back to initialMode when no cookies are set", () => {
    const resolution = resolveThemeFromCookies({ ...base, cookies: {} });
    expect(resolution.selection.mode).toBe("system");
    expect(resolution.theme.name).toBe("forest-light");
  });

  it("reads a valid mode cookie and resolves the matching theme", () => {
    const cookies = {
      [themeKitCookieNames.mode]: "dark",
      [themeKitCookieNames.family]: "forest",
      [themeKitCookieNames.fingerprint]: computeFingerprint(themes, "forest-light"),
    };
    const resolution = resolveThemeFromCookies({ ...base, cookies });
    expect(resolution.selection.mode).toBe("dark");
    expect(resolution.theme.name).toBe("forest-dark");
  });

  it("ignores invalid mode cookie values", () => {
    const cookies = {
      [themeKitCookieNames.mode]: "neon",
      [themeKitCookieNames.fingerprint]: computeFingerprint(themes, "forest-light"),
    };
    const resolution = resolveThemeFromCookies({ ...base, cookies });
    expect(resolution.selection.mode).toBe("system");
  });

  it("rejects cookies when the fingerprint is stale", () => {
    const cookies = {
      [themeKitCookieNames.mode]: "dark",
      [themeKitCookieNames.family]: "forest",
      [themeKitCookieNames.fingerprint]: "an-old-config",
    };
    const resolution = resolveThemeFromCookies({ ...base, cookies });
    // stale config → ignore cookies → fall back to system/light
    expect(resolution.selection.mode).toBe("system");
    expect(resolution.theme.name).toBe("forest-light");
  });

  it("applies initialFamily when no family cookie is present", () => {
    const resolution = resolveThemeFromCookies({
      ...base,
      initialFamily: "forest",
      cookies: {
        [themeKitCookieNames.mode]: "dark",
        [themeKitCookieNames.fingerprint]: computeFingerprint(themes, "forest-light"),
      },
    });
    expect(resolution.selection.family).toBe("forest");
    expect(resolution.theme.name).toBe("forest-dark");
  });
});

describe("createNuxtThemeBootstrapScript", () => {
  it("emits a script referencing the cookie names and fallback mode", () => {
    const script = createNuxtThemeBootstrapScript({
      themes,
      defaultTheme: "forest-light",
      initialMode: "system",
    });
    expect(script).toContain("theme-mode");
    expect(script).toContain("theme-family");
    expect(script).toContain("theme-fingerprint");
    expect(script).toContain("prefers-color-scheme");
    expect(script).toContain("__default-light");
    expect(script).toContain("__default-dark");
    expect(script).toContain("colorScheme");
  });

  it("produces the dark theme variables for a persisted dark mode", () => {
    const script = createNuxtThemeBootstrapScript({
      themes,
      defaultTheme: "forest-light",
      initialMode: "system",
    });
    // Execute the generated script against a fake document.
    const effects: Record<string, unknown> = {};
    const fakeDocument = {
      documentElement: {
        classList: {
          add: (c: string) => { effects.classListAdd = c; },
          remove: () => {},
        },
        style: {
          setProperty: (k: string, v: string) => { (effects.style ??= {})[k] = v; },
        },
        setAttribute: (k: string, v: string) => { (effects.attrs ??= {})[k] = v; },
      },
      cookie: `${themeKitCookieNames.mode}=dark; ${themeKitCookieNames.family}=forest; ${themeKitCookieNames.fingerprint}=${computeFingerprint(themes, "forest-light")}`,
      matchMedia: () => ({ matches: false }),
    };
    const vm = require("node:vm");
    vm.runInNewContext(script, { document: fakeDocument, window: { matchMedia: () => ({ matches: false }) } });
    expect(effects.classListAdd).toBe("dark");
    expect((effects.style as Record<string, string>)["--theme-color-background"]).toBe("#002200");
    expect((effects.attrs as Record<string, string>)["data-theme-mode"]).toBe("dark");
  });
});

describe("cssVariablesStyle", () => {
  it("renders a flat :root block", () => {
    expect(cssVariablesStyle({ "--a": "1", "--b": "2" })).toBe(":root{--a:1;--b:2}");
  });
});
