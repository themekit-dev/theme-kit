// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildBootstrapPlan,
  serializeThemeBootstrapScript,
  type ThemeBootstrapSource,
} from "../src/bootstrap";
import { defineTheme } from "../src/model";

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

const cookieNames = {
  mode: "theme-mode",
  family: "theme-family",
  fingerprint: "theme-fingerprint",
};
const fingerprint = "mint-light|mint-dark,mint-light,ocean-dark,ocean-light";

const storage: ThemeBootstrapSource = { kind: "storage", key: "theme-selection" };
const cookies: ThemeBootstrapSource = { kind: "cookies", names: cookieNames };

interface State {
  dark: boolean;
  attributes: Record<string, string>;
  variables: Record<string, string>;
  colorScheme: string | null;
}

function capture(): State {
  const el = document.documentElement;
  const variables: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style.item(i);
    if (prop.startsWith("--")) variables[prop] = el.style.getPropertyValue(prop);
  }
  return {
    dark: el.classList.contains("dark"),
    attributes: {
      "data-theme": el.getAttribute("data-theme") ?? "",
      "data-theme-mode": el.getAttribute("data-theme-mode") ?? "",
      "data-theme-family": el.getAttribute("data-theme-family") ?? "",
    },
    variables,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colorScheme: (el.style as any).colorScheme ?? null,
  };
}

function apply(script: string): void {
  // eslint-disable-next-line no-eval
  (0, eval)(script);
}

function darkOS(matches: boolean): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({ matches });
}

/** jsdom only sets one cookie per `document.cookie` assignment. */
function setCookies(parts: Record<string, string>): void {
  for (const [name, value] of Object.entries(parts)) {
    document.cookie = `${name}=${encodeURIComponent(value)}`;
  }
}

beforeEach(() => {
  const el = document.documentElement;
  for (const name of ["data-theme", "data-theme-mode", "data-theme-family"]) {
    el.removeAttribute(name);
  }
  el.classList.remove("dark");
  darkOS(false);
  window.localStorage.clear();
  for (const name of Object.values(cookieNames)) {
    document.cookie = `${name}=; max-age=0`;
  }
});

describe("buildBootstrapPlan", () => {
  it("resolves the fallback family's light/dark themes and names", () => {
    const plan = buildBootstrapPlan(themes, { defaultTheme: "ocean-light" });

    expect(plan.fallbackFamily).toBe("ocean");
    // The fallback mode is the mode `resolveInitialTheme` resolved for the
    // default theme — the same value the client runtime adopts — not a
    // hardcoded "system". Hardcoding it made the script follow the OS while the
    // runtime followed the theme's own mode, so a first-time visitor on a dark
    // OS saw the script's dark paint corrected to light (a visible flash).
    // Pass `initialMode: "system"` to opt into OS-following instead.
    expect(plan.fallbackMode).toBe("light");
    expect(plan.names["mint:dark"]).toBe("mint-dark");
    expect(plan.names["__default-light"]).toBe("ocean-light");
    expect(plan.names["__default-dark"]).toBe("ocean-dark");
    expect(plan.map["ocean:light"]["--theme-color-background"]).toBe("#f2f8ff");
    expect(plan.defaultLight.name).toBe("ocean-light");
    expect(plan.defaultDark.name).toBe("ocean-dark");
  });

  it("keeps light/dark coherent when the requested family is unknown", () => {
    const plan = buildBootstrapPlan(themes, { defaultTheme: "does-not-exist" });

    expect(plan.fallbackFamily).toBe("mint");
    expect(plan.defaultLight.name).toBe("mint-light");
    expect(plan.defaultDark.name).toBe("mint-dark");
  });
});

describe("storage source", () => {
  const script = (): string =>
    serializeThemeBootstrapScript(buildBootstrapPlan(themes), storage);

  it("applies the default light theme when nothing is persisted and the OS is light", () => {
    apply(script());
    const s = capture();
    expect(s.dark).toBe(false);
    expect(s.colorScheme).toBe("light");
    expect(s.attributes["data-theme"]).toBe("mint-light");
    expect(s.attributes["data-theme-mode"]).toBe("light");
    expect(s.attributes["data-theme-family"]).toBe("mint");
    expect(s.variables["--theme-color-background"]).toBe("#ffffff");
  });

  it("ignores the OS when nothing is persisted: the fallback is the default theme's mode", () => {
    // `buildBootstrapPlan` derives the fallback mode from `resolveInitialTheme`
    // rather than hardcoding "system", so a first-time visitor on a dark OS
    // paints the configured default instead of being flashed dark-then-light by
    // the runtime. See the `fallbackMode` note in `buildBootstrapPlan`.
    darkOS(true);
    apply(script());
    const s = capture();
    expect(s.dark).toBe(false);
    expect(s.colorScheme).toBe("light");
    expect(s.attributes["data-theme"]).toBe("mint-light");
    expect(s.attributes["data-theme-mode"]).toBe("light");
    expect(s.variables["--theme-color-background"]).toBe("#ffffff");
  });

  it("follows the OS when the plan is built with initialMode system", () => {
    // The opt-in path: the fallback mode becomes "system", so the script
    // resolves `prefers-color-scheme` before first paint.
    const systemScript = serializeThemeBootstrapScript(
      buildBootstrapPlan(themes, { initialMode: "system" }),
      storage,
    );

    darkOS(true);
    apply(systemScript);
    const s = capture();
    expect(s.dark).toBe(true);
    expect(s.attributes["data-theme"]).toBe("mint-dark");
    expect(s.attributes["data-theme-mode"]).toBe("dark");
    expect(s.variables["--theme-color-background"]).toBe("#101014");
  });

  it("applies the persisted selection from storage", () => {
    window.localStorage.setItem(
      "theme-selection",
      JSON.stringify({ mode: "dark", family: "ocean" }),
    );
    apply(script());
    const s = capture();
    expect(s.attributes["data-theme"]).toBe("ocean-dark");
    expect(s.attributes["data-theme-family"]).toBe("ocean");
    expect(s.variables["--theme-color-background"]).toBe("#04121f");
  });

  it("falls back safely on malformed persisted JSON", () => {
    window.localStorage.setItem("theme-selection", "{not json");
    apply(script());
    expect(capture().attributes["data-theme"]).toBe("mint-light");
  });

  it("does not throw when matchMedia is unavailable", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = undefined;
    apply(script());
    expect(capture().attributes["data-theme-mode"]).toBe("light");
  });
});

describe("cookie source", () => {
  const script = (): string =>
    serializeThemeBootstrapScript(
      buildBootstrapPlan(themes, { defaultTheme: "mint-light" }),
      cookies,
      { fingerprint },
    );

  it("applies the persisted family and mode from the cookies", () => {
    setCookies({
      "theme-mode": "dark",
      "theme-family": "ocean",
      "theme-fingerprint": fingerprint,
    });
    apply(script());
    const s = capture();
    expect(s.attributes["data-theme"]).toBe("ocean-dark");
    expect(s.attributes["data-theme-family"]).toBe("ocean");
    expect(s.variables["--theme-color-background"]).toBe("#04121f");
  });

  it("ignores the OS on a first visit: the fallback is the default theme's mode", () => {
    // Same contract as the storage source — the cookie source only differs in
    // where the persisted selection comes from. With no cookies there is no
    // selection to read, so the plan's derived fallback decides.
    darkOS(true);
    apply(script());
    const s = capture();
    expect(s.dark).toBe(false);
    expect(s.colorScheme).toBe("light");
    expect(s.attributes["data-theme"]).toBe("mint-light");
    expect(s.attributes["data-theme-mode"]).toBe("light");
    expect(s.variables["--theme-color-background"]).toBe("#ffffff");
  });

  it("rejects stale cookies whose fingerprint does not match", () => {
    setCookies({
      "theme-mode": "dark",
      "theme-family": "ocean",
      "theme-fingerprint": "an-old-config",
    });
    darkOS(false);
    apply(script());
    // Stale cookies are ignored → fall back to the default (system / light OS).
    const s = capture();
    expect(s.dark).toBe(false);
    expect(s.attributes["data-theme"]).toBe("mint-light");
    expect(s.variables["--theme-color-background"]).toBe("#ffffff");
  });

  it("falls back to the default family when the persisted family is unknown", () => {
    setCookies({
      "theme-mode": "dark",
      "theme-family": "plum",
      "theme-fingerprint": fingerprint,
    });
    darkOS(false);
    apply(script());
    const s = capture();
    expect(s.attributes["data-theme"]).toBe("mint-dark");
    expect(s.attributes["data-theme-family"]).toBe("mint");
    expect(s.variables["--theme-color-background"]).toBe("#101014");
  });

  it("is idempotent when applied repeatedly", () => {
    setCookies({
      "theme-mode": "dark",
      "theme-family": "ocean",
      "theme-fingerprint": fingerprint,
    });
    apply(script());
    const first = capture();
    apply(script());
    expect(capture()).toEqual(first);
  });

  it("omits the fingerprint guard when no fingerprint is supplied", () => {
    const raw = serializeThemeBootstrapScript(
      buildBootstrapPlan(themes),
      cookies,
    );
    expect(raw).not.toContain("fp!==");
    setCookies({ "theme-mode": "dark", "theme-family": "ocean" });
    apply(raw);
    expect(capture().attributes["data-theme"]).toBe("ocean-dark");
  });
});