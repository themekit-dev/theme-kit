// @vitest-environment jsdom
/**
 * Migration audit: legacy bootstrap vs the extracted shared primitive.
 *
 * The extraction replaced several near-copies of the pre-paint applier (core,
 * Astro, Next, Remix — Nuxt had its own) with `buildBootstrapPlan` +
 * `serializeThemeBootstrapScript`. The open question was never "is the shared
 * primitive correct?" but "does it reproduce the behaviour of the code it
 * replaced?".
 *
 * This file answers that with evidence. Every scenario is executed twice —
 * once against the frozen pre-migration implementation
 * (`test/fixtures/legacy-bootstrap.ts`) and once against the current one — and
 * the resulting DOM state is compared.
 *
 * The golden table pins the *current* behaviour. `LEGACY_DELTAS` pins the
 * *difference*: a scenario not listed there must behave identically, and a
 * listed one must differ in exactly the documented way. The test therefore
 * fails both if the new implementation silently drifts and if the legacy
 * fixture is ever edited to hide a delta.
 *
 * @see fixtures/legacy-bootstrap.ts
 */
import { beforeEach, describe, expect, it } from "vitest";
import { defineTheme } from "../src/model";
import { createThemeBootstrapScript } from "../src/bootstrap";
import { themeToCSSVariables } from "../src/css";
import { createThemeBootstrapScript as createLegacyBootstrapScript } from "./fixtures/legacy-bootstrap";

type Options = Parameters<typeof createThemeBootstrapScript>[0];

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

/** Only `themes` is fixed; a scenario may override any other option. */
const base = { themes } as unknown as Options;

interface State {
  dark: boolean;
  colorScheme: string | null;
  theme: string | null;
  mode: string | null;
  family: string | null;
  variables: Record<string, string>;
}

function setOSDark(matches: boolean): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: query.includes("dark") ? matches : !matches,
  });
}

function resetDOM(): void {
  const el = document.documentElement;
  el.removeAttribute("style");
  for (const name of ["data-theme", "data-theme-mode", "data-theme-family"]) {
    el.removeAttribute(name);
  }
  el.classList.remove("dark");
  window.localStorage.clear();
  setOSDark(false);
}

function capture(): State {
  const el = document.documentElement;
  const variables: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style.item(i);
    if (prop.startsWith("--")) variables[prop] = el.style.getPropertyValue(prop);
  }
  // jsdom reports an unset `color-scheme` as `""`, not `null`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const colorScheme = (el.style as any).colorScheme as string;
  return {
    dark: el.classList.contains("dark"),
    colorScheme: colorScheme === "" ? null : colorScheme,
    theme: el.getAttribute("data-theme"),
    mode: el.getAttribute("data-theme-mode"),
    family: el.getAttribute("data-theme-family"),
    variables,
  };
}

interface Scenario {
  name: string;
  /** Raw `localStorage` value for `theme-selection`. */
  storage?: string;
  systemDark?: boolean;
  /** `false` removes `window.matchMedia` entirely. */
  matchMedia?: boolean;
  options?: Record<string, unknown>;
  /** Golden expectation for the current implementation. */
  expect: State;
}

/**
 * The documented differences between the legacy implementation and the
 * extracted primitive. Keyed by scenario name: only the listed fields may
 * differ, and they must differ exactly as recorded.
 */
const LEGACY_DELTAS: Record<string, Partial<State>> = {
  "malformed storage JSON": {
    // Legacy: `JSON.parse` ran inside the outer try, so a corrupt value
    // aborted the whole applier — no variables, no attributes, no `dark`
    // class, no `color-scheme`. The visitor got whatever the server painted.
    // Current: the parse is isolated, so the fallback theme is still applied.
    colorScheme: null,
    theme: null,
    mode: null,
    family: null,
    variables: {},
  },
  "unknown persisted family": {
    // Legacy wrote the *raw* persisted family while painting the fallback
    // family's variables, so the attribute disagreed both with the theme that
    // was painted and with what the client runtime writes.
    family: "plum",
  },
  "unknown initialFamily": {
    // The real bug the extraction fixed. `resolveSelectedTheme` falls back to
    // `themes[0]` when the family is unknown, so legacy wrote the *requested*
    // (unknown) family into `data-theme-family` while painting the fallback
    // family's theme — an attribute that agreed neither with the paint nor with
    // what the client runtime writes. The current applier writes the resolved
    // family.
    //
    // Legacy also hardcoded the fallback mode to "system", so with nothing
    // persisted it followed `prefers-color-scheme`; the current applier derives
    // the fallback mode from `resolveInitialTheme`, so an unpersisted visit no
    // longer depends on the OS.
    dark: true,
    colorScheme: "dark",
    theme: "mint-dark",
    mode: "dark",
    variables: { "--theme-color-background": "#101014" },
    family: "plum",
  },
  // Legacy left `data-theme-family` unset whenever no family was persisted
  // (it used the raw `initialFamily` option, which is undefined by default).
  // The current applier writes the resolved family, matching the runtime.
  "no persistence, light OS": { family: null },
  "no persistence, dark OS with initialMode system": { family: null },
  "no persistence, dark OS": {
    // Legacy hardcoded the script's fallback mode to "system", so with nothing
    // persisted it followed `prefers-color-scheme` while the client runtime
    // followed the default theme's own mode ("light" for a `*-light` default).
    // The script painted dark and the runtime corrected it to light — a visible
    // flash on a first visit. The fallback mode is now derived from
    // `resolveInitialTheme`, so both halves agree; `initialMode: "system"` is
    // the explicit opt-in to OS-following.
    dark: true,
    colorScheme: "dark",
    theme: "mint-dark",
    mode: "dark",
    variables: { "--theme-color-background": "#101014" },
    family: null,
  },
  "persisted selection is JSON null": { family: null },
  "persisted selection is a bare string": { family: null },
  "no persisted family": { family: null },
  "matchMedia unavailable": { family: null },
  "initialMode dark": { family: null },
  "defaultTheme ocean-light": { family: null },
  "defaultTheme unknown": { family: null },
};

const scenarios: Scenario[] = [
  {
    name: "no persistence, light OS",
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "no persistence, dark OS",
    systemDark: true,
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "no persistence, dark OS with initialMode system",
    systemDark: true,
    options: { initialMode: "system" },
    expect: {
      dark: true,
      colorScheme: "dark",
      theme: "mint-dark",
      mode: "dark",
      family: "mint",
      variables: { "--theme-color-background": "#101014" },
    },
  },
  {
    name: "persisted dark/ocean",
    storage: JSON.stringify({ mode: "dark", family: "ocean" }),
    expect: {
      dark: true,
      colorScheme: "dark",
      theme: "ocean-dark",
      mode: "dark",
      family: "ocean",
      variables: { "--theme-color-background": "#04121f" },
    },
  },
  {
    name: "persisted light/ocean",
    storage: JSON.stringify({ mode: "light", family: "ocean" }),
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "ocean-light",
      mode: "light",
      family: "ocean",
      variables: { "--theme-color-background": "#f2f8ff" },
    },
  },
  {
    name: "persisted system/ocean on a dark OS",
    storage: JSON.stringify({ mode: "system", family: "ocean" }),
    systemDark: true,
    expect: {
      dark: true,
      colorScheme: "dark",
      theme: "ocean-dark",
      mode: "dark",
      family: "ocean",
      variables: { "--theme-color-background": "#04121f" },
    },
  },
  {
    name: "malformed storage JSON",
    storage: "{not json",
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "persisted selection is JSON null",
    storage: "null",
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "persisted selection is a bare string",
    storage: JSON.stringify("dark"),
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "unknown persisted mode",
    storage: JSON.stringify({ mode: "neon", family: "ocean" }),
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "ocean-light",
      mode: "light",
      family: "ocean",
      variables: { "--theme-color-background": "#f2f8ff" },
    },
  },
  {
    name: "unknown persisted family",
    storage: JSON.stringify({ mode: "dark", family: "plum" }),
    expect: {
      dark: true,
      colorScheme: "dark",
      theme: "mint-dark",
      mode: "dark",
      family: "mint",
      variables: { "--theme-color-background": "#101014" },
    },
  },
  {
    name: "no persisted family",
    storage: JSON.stringify({ mode: "dark" }),
    expect: {
      dark: true,
      colorScheme: "dark",
      theme: "mint-dark",
      mode: "dark",
      family: "mint",
      variables: { "--theme-color-background": "#101014" },
    },
  },
  {
    name: "matchMedia unavailable",
    matchMedia: false,
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "initialFamily ocean",
    options: { initialFamily: "ocean" },
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "ocean-light",
      mode: "light",
      family: "ocean",
      variables: { "--theme-color-background": "#f2f8ff" },
    },
  },
  {
    name: "unknown initialFamily",
    systemDark: true,
    options: { initialFamily: "plum" },
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
  {
    name: "initialMode dark",
    options: { initialMode: "dark" },
    expect: {
      dark: true,
      colorScheme: "dark",
      theme: "mint-dark",
      mode: "dark",
      family: "mint",
      variables: { "--theme-color-background": "#101014" },
    },
  },
  {
    name: "defaultTheme ocean-light",
    options: { defaultTheme: "ocean-light" },
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "ocean-light",
      mode: "light",
      family: "ocean",
      variables: { "--theme-color-background": "#f2f8ff" },
    },
  },
  {
    name: "defaultTheme unknown",
    options: { defaultTheme: "does-not-exist" },
    expect: {
      dark: false,
      colorScheme: "light",
      theme: "mint-light",
      mode: "light",
      family: "mint",
      variables: { "--theme-color-background": "#ffffff" },
    },
  },
];

function optionsFor(scenario: Scenario): Options {
  return { ...base, ...(scenario.options ?? {}) } as Options;
}

/** Resets the DOM, then applies the scenario's environment, then runs. */
function execute(scenario: Scenario, script: string): State {
  resetDOM();
  if (scenario.storage !== undefined) {
    window.localStorage.setItem("theme-selection", scenario.storage);
  }
  if (scenario.systemDark) setOSDark(true);
  if (scenario.matchMedia === false) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = undefined;
  }
  // eslint-disable-next-line no-eval
  (0, eval)(script);
  return capture();
}

function currentState(scenario: Scenario): State {
  return execute(scenario, createThemeBootstrapScript(optionsFor(scenario)));
}

function legacyState(scenario: Scenario): State {
  return execute(scenario, createLegacyBootstrapScript(optionsFor(scenario)));
}

beforeEach(() => {
  resetDOM();
});

describe("bootstrap migration — golden behaviour", () => {
  for (const scenario of scenarios) {
    it(scenario.name, () => {
      expect(currentState(scenario)).toEqual(scenario.expect);
    });
  }
});

describe("bootstrap migration — legacy equivalence", () => {
  for (const scenario of scenarios) {
    const delta = LEGACY_DELTAS[scenario.name];

    it(
      delta
        ? `${scenario.name} — differs only as documented`
        : `${scenario.name} — identical to legacy`,
      () => {
        const legacy = legacyState(scenario);
        const current = currentState(scenario);

        if (!delta) {
          expect(current).toEqual(legacy);
          return;
        }

        // Everything the delta does not name must be unchanged.
        expect(legacy).toEqual({ ...scenario.expect, ...delta });

        // ...and each named field must really differ.
        for (const [key, value] of Object.entries(delta)) {
          expect(
            current[key as keyof State],
            `${key} should differ from the legacy value`,
          ).not.toEqual(value);
        }
      },
    );
  }
});

describe("bootstrap migration — invariants", () => {
  it("never applies less than the legacy implementation did", () => {
    for (const scenario of scenarios) {
      const legacy = legacyState(scenario);
      const current = currentState(scenario);
      const applied = (state: State): boolean =>
        state.theme !== null || Object.keys(state.variables).length > 0;

      if (applied(legacy)) {
        expect(
          applied(current),
          `${scenario.name}: legacy applied a theme but the current applier did not`,
        ).toBe(true);
      }
    }
  });

  it("paints exactly one theme's variables, never a partial merge", () => {
    for (const scenario of scenarios) {
      const state = currentState(scenario);
      const painted = themes.find((theme) => theme.name === state.theme);

      expect(
        painted,
        `${scenario.name}: data-theme must name a registered theme`,
      ).toBeDefined();
      expect(state.variables, `${scenario.name}: painted variables`).toEqual(
        themeToCSSVariables(painted!),
      );
    }
  });

  it("writes state that agrees with the theme it painted", () => {
    // The client runtime writes `data-theme` / `data-theme-family` /
    // `data-theme-mode` from the *resolved theme's own* `name` / `meta.family`
    // / `meta.mode` (see src/adapters/dom/effects.ts). If the pre-paint
    // applier disagrees, hydration corrects the paint — which is exactly the
    // flash the script exists to prevent.
    for (const scenario of scenarios) {
      const state = currentState(scenario);
      const painted = themes.find((theme) => theme.name === state.theme);

      expect(state.family, `${scenario.name}: data-theme-family`).toBe(
        painted?.meta?.family,
      );
      expect(state.mode, `${scenario.name}: data-theme-mode`).toBe(
        painted?.meta?.mode,
      );
      expect(state.dark, `${scenario.name}: dark class`).toBe(
        painted?.meta?.mode === "dark",
      );
    }
  });
});
