import { describe, expect, it } from "vitest";
import {
  buildBootstrapPlan,
  createThemeRuntime,
  defineTheme,
  getThemeFamilies,
  getThemeFamily,
  normalizeThemeFamily,
  resolveInitialTheme,
  resolveSelection,
  serializeThemeBootstrapScript,
  type ThemeSelectionState,
} from "../src";

/**
 * A registry whose families are `neutral` and `brand` — deliberately *not*
 * including `mint`, which stands in for a family the app used to ship. A
 * visitor who was here before that change still has `mint` in a cookie and in
 * `localStorage`.
 */
const themes = [
  defineTheme({
    name: "neutral-light",
    meta: { family: "neutral", mode: "light" },
  }),
  defineTheme({
    name: "neutral-dark",
    meta: { family: "neutral", mode: "dark" },
  }),
  defineTheme({
    name: "brand-light",
    meta: { family: "brand", mode: "light" },
  }),
  defineTheme({
    name: "brand-dark",
    meta: { family: "brand", mode: "dark" },
  }),
] as const;

const STALE = "mint";

function memoryPersistence(initial: ThemeSelectionState | null) {
  let value = initial;
  return {
    get: () => value,
    set: (next: ThemeSelectionState) => {
      value = next;
    },
    remove: () => {
      value = null;
    },
    subscribe: () => () => {},
  };
}

describe("theme family normalization", () => {
  it("lists the registered families once, in registration order", () => {
    expect(getThemeFamilies(themes)).toEqual(["neutral", "brand"]);
    expect(getThemeFamilies([themes[2]!, themes[0]!, themes[3]!])).toEqual([
      "brand",
      "neutral",
    ]);
  });

  it("keeps a registered family and replaces an unregistered one", () => {
    expect(normalizeThemeFamily(themes, "brand")).toBe("brand");
    expect(normalizeThemeFamily(themes, STALE)).toBe("neutral");
    // Empty means "not specified" — a cookie read yields "" for a missing cookie.
    expect(normalizeThemeFamily(themes, "")).toBe("neutral");
    expect(normalizeThemeFamily(themes, null)).toBe("neutral");
    expect(normalizeThemeFamily(themes, undefined)).toBe("neutral");
  });

  it("uses the given fallback theme's family, not the first theme's", () => {
    expect(normalizeThemeFamily(themes, STALE, themes[2])).toBe("brand");
  });

  describe("resolveInitialTheme", () => {
    it("never returns a selection that disagrees with the resolved theme", () => {
      const result = resolveInitialTheme({
        themes,
        defaultTheme: "brand-light",
        family: STALE,
        mode: "light",
      });

      // The theme falls back; the selection must follow it rather than keep
      // naming the family the visitor asked for. Otherwise a
      // `data-tk-readout="family"` renders `mint` next to a `brand-light` theme.
      expect(result.theme).toBe(themes[2]);
      expect(getThemeFamily(result.theme)).toBe("brand");
      expect(result.selection.family).toBe("brand");
    });

    it("keeps a registered family", () => {
      const result = resolveInitialTheme({
        themes,
        family: "neutral",
        mode: "dark",
      });
      expect(result.theme).toBe(themes[1]);
      expect(result.selection.family).toBe("neutral");
    });
  });

  describe("resolveSelection", () => {
    it("normalizes the family of a persisted selection but keeps its mode", () => {
      expect(
        resolveSelection({
          themes,
          persistedSelection: { family: STALE, mode: "dark" },
        }),
      ).toEqual({ family: "neutral", mode: "dark" });
    });

    it("leaves a registered persisted selection untouched", () => {
      expect(
        resolveSelection({
          themes,
          persistedSelection: { family: "brand", mode: "system" },
        }),
      ).toEqual({ family: "brand", mode: "system" });
    });
  });

  describe("pre-paint bootstrap", () => {
    const plan = buildBootstrapPlan(themes, { initialFamily: "neutral-light" });

    it("publishes the registry's families for the script to validate against", () => {
      expect(plan.families).toEqual(["neutral", "brand"]);
      expect(plan.fallbackFamily).toBe("neutral");
    });

    it("emits a guard that rejects a persisted family the registry lacks", () => {
      const script = serializeThemeBootstrapScript(plan, {
        kind: "cookies",
        names: {
          mode: "theme-mode",
          family: "theme-family",
          fingerprint: "theme-fingerprint",
        },
      });

      expect(script).toContain('var fams=["neutral","brand"]');
      // The stale value can only reach `family` through the fallback branch.
      expect(script).toContain("fams.indexOf(fam0)!==-1?fam0:");
      expect(script).not.toMatch(/var family=fam0\|\|/);
    });

    it("evaluates the guard to the fallback for a stale cookie", () => {
      const script = serializeThemeBootstrapScript(plan, {
        kind: "cookies",
        names: {
          mode: "theme-mode",
          family: "theme-family",
          fingerprint: "theme-fingerprint",
        },
      });

      // Run the real script body against a stub carrying the stale family, so
      // this asserts the DOM contract the script actually produces rather than
      // the shape of its source string.
      const attrs: Record<string, string> = {};
      new Function(
        "document",
        "window",
        "localStorage",
        script,
      )(
        {
          cookie: `theme-family=${STALE}; theme-mode=dark`,
          documentElement: {
            style: {} as Record<string, string>,
            classList: { add() {}, remove() {} },
            setAttribute: (name: string, value: unknown) => {
              attrs[name] = String(value);
            },
            getAttribute: () => null,
          },
        },
        { matchMedia: () => ({ matches: false }) },
        { getItem: () => null, setItem() {} },
      );

      // The theme falls back, and the selection now names the family that
      // fallback belongs to — so a `data-tk-readout="family"` cannot render a
      // family that is not applied.
      expect(attrs["data-theme"]).toBe("neutral-dark");
      expect(attrs["data-theme-family"]).toBe("neutral");
      expect(attrs["data-theme-selection-family"]).toBe("neutral");
    });
  });

  describe("runtime selection", () => {
    it("normalizes a stale persisted family on init", () => {
      const runtime = createThemeRuntime({
        themes,
        persistence: memoryPersistence({ family: STALE, mode: "dark" }),
      });

      expect(runtime.selection.getSelection()).toEqual({
        family: "neutral",
        mode: "dark",
      });
      // The store and the selection agree — which is what a readout renders.
      expect(getThemeFamily(runtime.store.get())).toBe("neutral");
    });

    it("refuses to select a family the registry does not have", () => {
      const runtime = createThemeRuntime({
        themes,
        persistence: memoryPersistence({ family: "brand", mode: "light" }),
      });

      expect(runtime.selection.getFamily()).toBe("brand");
      runtime.selection.setFamily(STALE);
      // Unchanged: the selection must keep naming a family that is applied.
      expect(runtime.selection.getFamily()).toBe("brand");
    });

    it("still selects a registered family", () => {
      const runtime = createThemeRuntime({
        themes,
        persistence: memoryPersistence(null),
      });

      runtime.selection.setFamily("brand");
      expect(runtime.selection.getFamily()).toBe("brand");
      expect(getThemeFamily(runtime.store.get())).toBe("brand");
    });
  });
});
