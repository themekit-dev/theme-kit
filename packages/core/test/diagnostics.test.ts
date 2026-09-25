// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAccessibilityPlugin,
  createDiagnostic,
  createPluginManager,
  createScheduledPlugin,
  createThemeModeController,
  createThemeRuntime,
  createThemeStore,
  defineTheme,
  emitDiagnostic,
  formatDiagnostic,
  isThemeMode,
  resetDiagnosticEmission,
  ThemeError,
  validateTheme,
  type ThemeBroadcastAdapter,
  type ThemeDefinition,
  type ThemeDiagnostic,
  type ThemePersistenceAdapter,
} from "../src";

/**
 * These tests assert on the stable contract of a diagnostic — its code, level
 * and structured context — never on the wording of its message. The message is
 * allowed to change; the code is not.
 */

/** A theme with a full, valid colour set. */
function validTheme(name = "mint-light", mode: "light" | "dark" = "light") {
  return defineTheme({
    name,
    meta: { family: "mint", mode },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#111111",
        card: "#ffffff",
        cardForeground: "#111111",
        popover: "#ffffff",
        popoverForeground: "#111111",
        primary: "#111111",
        primaryForeground: "#ffffff",
        secondary: "#eeeeee",
        secondaryForeground: "#111111",
        muted: "#eeeeee",
        mutedForeground: "#111111",
        accent: "#dddddd",
        accentForeground: "#111111",
        destructive: "#cc0000",
        destructiveForeground: "#ffffff",
        success: "#007700",
        successForeground: "#ffffff",
        border: "#cccccc",
        input: "#cccccc",
        ring: "#111111",
      },
    },
  });
}

/** The diagnostic handed to `console` as the second argument, or `undefined`. */
function diagnosticFrom(spy: ReturnType<typeof vi.spyOn>, call = 0): ThemeDiagnostic | undefined {
  return (spy.mock.calls[call] as unknown[] | undefined)?.[1] as ThemeDiagnostic | undefined;
}

let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;
let info: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  resetDiagnosticEmission();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
  info = vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("diagnostic model", () => {
  it("derives the docs link from the code", () => {
    const diagnostic = createDiagnostic({
      code: "TK_MODE_INVALID",
      level: "warning",
      message: "x",
    });

    // Assert the derivation, not the host: the origin is a deployment detail
    // that moves with the docs site, while the path and fragment are the
    // contract that makes the link land on the right entry.
    expect(diagnostic.docs).toContain("/reference/diagnostics");
    expect(diagnostic.docs?.endsWith("#tk_mode_invalid")).toBe(true);
  });

  it("omits fields that were not supplied", () => {
    const diagnostic = createDiagnostic({
      code: "TK_MODE_INVALID",
      level: "warning",
      message: "x",
    });

    expect("context" in diagnostic).toBe(false);
    expect("hint" in diagnostic).toBe(false);
    expect("cause" in diagnostic).toBe(false);
  });

  it("renders context, hint and docs in development", () => {
    const diagnostic = createDiagnostic({
      code: "TK_MODE_INVALID",
      level: "warning",
      message: "bad mode",
      context: { api: "setMode", property: "mode", received: "purple", expected: "light | dark | system" },
      hint: "pass a real mode",
    });

    const text = formatDiagnostic(diagnostic, { dev: true });

    expect(text).toContain("TK_MODE_INVALID");
    expect(text).toContain("api: setMode");
    expect(text).toContain('received: "purple"');
    expect(text).toContain("expected: light | dark | system");
    expect(text).toContain("hint: pass a real mode");
  });

  it("renders a single line outside development, without hiding the code", () => {
    const diagnostic = createDiagnostic({
      code: "TK_MODE_INVALID",
      level: "warning",
      message: "bad mode",
      context: { api: "setMode" },
      hint: "pass a real mode",
    });

    const text = formatDiagnostic(diagnostic, { dev: false });

    expect(text).not.toContain("\n");
    expect(text).toContain("TK_MODE_INVALID");
    expect(text).toContain("bad mode");
  });

  it("routes warnings to console.warn and errors to console.error", () => {
    emitDiagnostic(createDiagnostic({ code: "TK_MODE_INVALID", level: "warning", message: "w" }));
    emitDiagnostic(createDiagnostic({ code: "TK_A11Y_CONTRAST_VIOLATION", level: "error", message: "e" }));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("passes the structured diagnostic to the sink", () => {
    emitDiagnostic(
      createDiagnostic({
        code: "TK_MODE_INVALID",
        level: "warning",
        message: "w",
        context: { api: "setMode", received: "purple" },
      }),
    );

    expect(diagnosticFrom(warn)?.context?.received).toBe("purple");
  });

  it("suppresses a repeated identical diagnostic", () => {
    const make = () =>
      createDiagnostic({
        code: "TK_MODE_INVALID",
        level: "warning",
        message: "w",
        context: { api: "setMode", received: "purple" },
      });

    emitDiagnostic(make());
    emitDiagnostic(make());

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("does not suppress a diagnostic with different context", () => {
    emitDiagnostic(
      createDiagnostic({
        code: "TK_MODE_INVALID",
        level: "warning",
        message: "w",
        context: { api: "setMode", received: "purple" },
      }),
    );
    emitDiagnostic(
      createDiagnostic({
        code: "TK_MODE_INVALID",
        level: "warning",
        message: "w",
        context: { api: "setMode", received: "mauve" },
      }),
    );

    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("emits again after resetDiagnosticEmission()", () => {
    const make = () =>
      createDiagnostic({ code: "TK_MODE_INVALID", level: "warning", message: "w" });

    emitDiagnostic(make());
    resetDiagnosticEmission();
    emitDiagnostic(make());

    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("can bypass deduplication", () => {
    const make = () =>
      createDiagnostic({ code: "TK_MODE_INVALID", level: "warning", message: "w" });

    emitDiagnostic(make(), { dedupe: false });
    emitDiagnostic(make(), { dedupe: false });

    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe("isThemeMode", () => {
  it("accepts the three modes", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of ["purple", "", "Light", null, undefined, 1, {}]) {
      expect(isThemeMode(value)).toBe(false);
    }
  });
});

describe("ThemeError", () => {
  it("remains constructible with a message alone", () => {
    const err = new ThemeError("boom");

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ThemeError");
    expect(err.message).toBe("boom");
    expect(err.code).toBeUndefined();
  });

  it("carries code, context and cause from a diagnostic", () => {
    const cause = new Error("root");
    const err = ThemeError.fromDiagnostic(
      createDiagnostic({
        code: "TK_PLUGIN_DESTROY_FAILED",
        level: "warning",
        message: "plugin blew up",
        context: { api: "pluginManager.destroy", received: "a" },
        cause,
      }),
    );

    expect(err.code).toBe("TK_PLUGIN_DESTROY_FAILED");
    expect(err.context?.received).toBe("a");
    expect(err.cause).toBe(cause);
  });
});

describe("setMode validation (decision A)", () => {
  // Driven through the runtime, which is how `setMode` is actually reached:
  // `createThemeSelectionController` is internal, `runtime.selection` is public.
  const themes = [validTheme("mint-light", "light"), validTheme("mint-dark", "dark")];

  function runtime() {
    return createThemeRuntime({
      defaultTheme: "mint-light",
      themes,
      initialMode: "light",
    });
  }

  it("emits nothing for a valid mode and applies it", () => {
    const rt = runtime();

    rt.selection.setMode("dark");

    expect(warn).not.toHaveBeenCalled();
    expect(rt.selection.getMode()).toBe("dark");
    rt.destroy();
  });

  it("emits TK_MODE_INVALID and leaves the selection unchanged for an invalid mode", () => {
    const rt = runtime();
    const before = rt.selection.getMode();
    const themeBefore = rt.snapshot().theme.name;

    rt.selection.setMode("purple" as never);

    const diagnostic = diagnosticFrom(warn);
    expect(diagnostic?.code).toBe("TK_MODE_INVALID");
    expect(diagnostic?.level).toBe("warning");
    expect(diagnostic?.context?.api).toBe("setMode");
    expect(diagnostic?.context?.property).toBe("mode");
    expect(diagnostic?.context?.received).toBe("purple");
    expect(diagnostic?.context?.expected).toBe("light | dark | system");
    expect(rt.selection.getMode()).toBe(before);
    expect(rt.snapshot().theme.name).toBe(themeBefore);
    rt.destroy();
  });

  it("does not throw for an invalid mode", () => {
    const rt = runtime();

    expect(() => rt.selection.setMode(undefined as never)).not.toThrow();
    rt.destroy();
  });

  it("does not corrupt the selection after an invalid mode", () => {
    const rt = runtime();

    rt.selection.setMode("purple" as never);
    rt.selection.setMode("dark");

    expect(rt.selection.getMode()).toBe("dark");
    expect(rt.snapshot().theme.name).toBe("mint-dark");
    rt.destroy();
  });

  it("deduplicates repeated invalid modes", () => {
    const rt = runtime();

    rt.selection.setMode("purple" as never);
    rt.selection.setMode("purple" as never);

    expect(warn).toHaveBeenCalledTimes(1);
    rt.destroy();
  });

  it("still refuses an unregistered family silently (decision A did not broaden scope)", () => {
    const rt = runtime();
    const before = rt.selection.getFamily();

    rt.selection.setFamily("nonexistent");

    expect(warn).not.toHaveBeenCalled();
    expect(rt.selection.getFamily()).toBe(before);
    rt.destroy();
  });
});

describe("createThemeModeController setMode validation (decision A, second boundary)", () => {
  // The standalone mode controller is a public export with its own `setMode`
  // that does not go through `runtime.selection`. It used to accept an invalid
  // mode, persist it, broadcast it and report it from `getMode()` while the
  // applied theme fell back to light. These tests pin the contract the
  // selection controller already had, so the two boundaries cannot diverge.
  const light = validTheme("mint-light", "light");
  const dark = validTheme("mint-dark", "dark");

  function build(options: {
    persistence?: ThemePersistenceAdapter | null;
    broadcast?: ThemeBroadcastAdapter | null;
  } = {}) {
    const store = createThemeStore({ initialTheme: light });
    const controller = createThemeModeController({
      store,
      lightTheme: light,
      darkTheme: dark,
      initialMode: "light",
      ...options,
    });
    return { store, controller };
  }

  it("applies a valid mode and emits nothing", () => {
    const { store, controller } = build();

    controller.setMode("dark");

    expect(warn).not.toHaveBeenCalled();
    expect(controller.getMode()).toBe("dark");
    expect(store.get().name).toBe("mint-dark");
    controller.destroy();
  });

  it("emits TK_MODE_INVALID with the established contract fields", () => {
    const { controller } = build();

    controller.setMode("purple" as never);

    const diagnostic = diagnosticFrom(warn);
    expect(diagnostic?.code).toBe("TK_MODE_INVALID");
    expect(diagnostic?.level).toBe("warning");
    expect(diagnostic?.context?.api).toBe("setMode");
    expect(diagnostic?.context?.property).toBe("mode");
    expect(diagnostic?.context?.received).toBe("purple");
    expect(diagnostic?.context?.expected).toBe("light | dark | system");
    expect(diagnostic?.hint).toBeDefined();
    controller.destroy();
  });

  it("does not mutate state for an invalid mode", () => {
    const { store, controller } = build();
    const before = controller.getMode();
    const themeBefore = store.get().name;

    controller.setMode("purple" as never);

    expect(controller.getMode()).toBe(before);
    expect(store.get().name).toBe(themeBefore);
    controller.destroy();
  });

  it("does not persist an invalid mode", () => {
    const persistence: ThemePersistenceAdapter = {
      get: vi.fn(() => null),
      set: vi.fn(),
      remove: vi.fn(),
      subscribe: vi.fn(() => () => {}),
    };
    const { controller } = build({ persistence });

    controller.setMode("purple" as never);
    expect(persistence.set).not.toHaveBeenCalled();

    // A valid mode still persists, so the guard rejects the value and not the call.
    controller.setMode("dark");
    expect(persistence.set).toHaveBeenCalledWith("dark");
    controller.destroy();
  });

  it("does not broadcast an invalid mode", () => {
    const broadcast: ThemeBroadcastAdapter = {
      post: vi.fn(),
      subscribe: vi.fn(() => () => {}),
      destroy: vi.fn(),
    };
    const { controller } = build({ broadcast });

    controller.setMode("purple" as never);
    expect(broadcast.post).not.toHaveBeenCalled();

    controller.setMode("dark");
    expect(broadcast.post).toHaveBeenCalledWith("dark");
    controller.destroy();
  });

  it("never reports an invalid mode from getMode()", () => {
    const { controller } = build();

    for (const invalid of ["purple", "", "LIGHT", undefined, null, 42, {}]) {
      controller.setMode(invalid as never);
      expect(controller.getMode()).toBe("light");
    }

    controller.destroy();
  });

  it("stays usable after a rejected mode", () => {
    const { store, controller } = build();

    controller.setMode("purple" as never);
    controller.setMode("dark");

    expect(controller.getMode()).toBe("dark");
    expect(store.get().name).toBe("mint-dark");
    controller.destroy();
  });

  it("does not throw for an invalid mode", () => {
    const { controller } = build();

    expect(() => controller.setMode("purple" as never)).not.toThrow();
    expect(() => controller.setMode(undefined as never)).not.toThrow();
    controller.destroy();
  });

  it("deduplicates repeated identical invalid modes", () => {
    const { controller } = build();

    controller.setMode("purple" as never);
    controller.setMode("purple" as never);

    expect(warn).toHaveBeenCalledTimes(1);
    controller.destroy();
  });

  it("emits the same contract as runtime.selection.setMode()", () => {
    // Parity is the point of the fix: two public `setMode` boundaries must not
    // disagree about what an invalid mode produces.
    const rt = createThemeRuntime({
      defaultTheme: "mint-light",
      themes: [light, dark],
      initialMode: "light",
    });
    const { controller } = build();

    rt.selection.setMode("purple" as never);
    const fromSelection = diagnosticFrom(warn, 0);

    // Emission is deduplicated by code + context, so the second boundary would
    // otherwise be suppressed for having the same contract as the first.
    resetDiagnosticEmission();

    controller.setMode("purple" as never);
    const fromModeController = diagnosticFrom(warn, 1);

    expect(fromModeController?.code).toBe(fromSelection?.code);
    expect(fromModeController?.level).toBe(fromSelection?.level);
    expect(fromModeController?.context).toEqual(fromSelection?.context);
    expect(fromModeController?.hint).toBe(fromSelection?.hint);

    rt.destroy();
    controller.destroy();
  });
});

describe("validateTheme issue codes (decision B)", () => {
  it("reports no issues for a valid theme", () => {
    const result = validateTheme(validTheme());

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("attaches a stable code and structured context to each issue", () => {
    const theme = defineTheme({
      name: "broken",
      tokens: { colors: { background: "#ffffff" } },
    });

    const result = validateTheme(theme);

    expect(result.valid).toBe(false);
    const issue = result.issues[0]!;
    expect(issue.code).toBe("TK_THEME_TOKEN_MISSING");
    expect(issue.type).toBe("missing");
    expect(issue.path).toBe("colors.foreground");
    expect(issue.context.api).toBe("validateTheme");
    expect(issue.context.path).toBe("colors.foreground");
    expect(issue.context.expected).toBe("a token value");
  });

  it("codes a missing tokens group", () => {
    const result = validateTheme({ name: "empty" } as ThemeDefinition);

    expect(result.issues[0]!.code).toBe("TK_THEME_TOKEN_MISSING");
    expect(result.issues[0]!.path).toBe("tokens");
  });

  it("preserves the message shape the CLI renders", () => {
    const theme = defineTheme({
      name: "broken",
      tokens: { colors: { background: "#ffffff" } },
    });

    const result = validateTheme(theme);

    expect(result.issues[0]!.message).toMatch(/^Missing token: `colors\./);
  });

  it("emits nothing (it reports rather than throws)", () => {
    const result = validateTheme(defineTheme({ name: "broken", tokens: { colors: {} } }));

    expect(result.valid).toBe(false);
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

describe("accessibility plugin diagnostics (decision C)", () => {
  const poorTheme = () =>
    defineTheme({
      name: "poor",
      meta: { family: "poor", mode: "light" },
      tokens: { colors: { background: "#ffffff", foreground: "#f2f2f2" } },
    });

  it("emits TK_A11Y_CONTRAST_VIOLATION at warning level by default", () => {
    const plugin = createAccessibilityPlugin();

    plugin.onAfterThemeChange?.({ theme: poorTheme() });

    const diagnostic = diagnosticFrom(warn);
    expect(diagnostic?.code).toBe("TK_A11Y_CONTRAST_VIOLATION");
    expect(diagnostic?.level).toBe("warning");
    expect(diagnostic?.context?.received).toBe("poor");
  });

  it("carries the failing checks as structured detail", () => {
    const plugin = createAccessibilityPlugin();

    plugin.onAfterThemeChange?.({ theme: poorTheme() });

    const details = diagnosticFrom(warn)?.context?.details as unknown[] | undefined;
    expect(Array.isArray(details)).toBe(true);
    expect(details!.length).toBeGreaterThan(0);
  });

  it("uses error level when warnOnly is false", () => {
    const plugin = createAccessibilityPlugin({ warnOnly: false });

    plugin.onAfterThemeChange?.({ theme: poorTheme() });

    expect(diagnosticFrom(error)?.code).toBe("TK_A11Y_CONTRAST_VIOLATION");
    expect(warn).not.toHaveBeenCalled();
  });

  it("still invokes onViolation", () => {
    const onViolation = vi.fn();
    const plugin = createAccessibilityPlugin({ onViolation });

    plugin.onAfterThemeChange?.({ theme: poorTheme() });

    expect(onViolation).toHaveBeenCalledTimes(1);
    expect(onViolation.mock.calls[0]![0].themeName).toBe("poor");
  });

  it("emits nothing for a theme that passes", () => {
    const plugin = createAccessibilityPlugin();

    plugin.onAfterThemeChange?.({ theme: validTheme() });

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

describe("scheduled plugin diagnostics (decision C)", () => {
  it("emits TK_SCHEDULE_THEME_UNRESOLVED when the pair cannot be resolved", () => {
    // The plugin installs from `onRuntimeCreated`, so registering it with a
    // runtime is the path that actually resolves the pair.
    const runtime = createThemeRuntime({
      defaultTheme: "mint-light",
      themes: [validTheme("mint-light", "light"), validTheme("mint-dark", "dark")],
      plugins: [
        createScheduledPlugin({
          lightTheme: "does-not-exist" as never,
          darkTheme: "also-missing" as never,
        }),
      ],
    });

    const diagnostic = diagnosticFrom(warn);
    expect(diagnostic?.code).toBe("TK_SCHEDULE_THEME_UNRESOLVED");
    expect(diagnostic?.level).toBe("warning");
    expect(diagnostic?.context?.api).toBe("createScheduledPlugin");
    expect(diagnostic?.context?.expected).toBe(
      "a light and a dark theme both resolvable from the registry",
    );

    runtime.destroy();
  });
});

describe("pluginManager.destroy failure isolation (decision D)", () => {
  it("still destroys the remaining plugins when one throws", () => {
    const pm = createPluginManager();
    const after = vi.fn();
    const boom = new Error("onDestroy blew up");

    pm.use({
      name: "a-broken",
      priority: 1,
      onDestroy: () => {
        throw boom;
      },
    });
    pm.use({ name: "z-later", priority: 2, onDestroy: after });

    expect(() => pm.destroy()).not.toThrow();
    expect(after).toHaveBeenCalledTimes(1);
    expect(pm.list()).toHaveLength(0);
  });

  it("reports the failure with the plugin name and the original cause", () => {
    const pm = createPluginManager();
    const boom = new Error("onDestroy blew up");
    pm.use({
      name: "a-broken",
      onDestroy: () => {
        throw boom;
      },
    });

    pm.destroy();

    const diagnostic = diagnosticFrom(warn);
    expect(diagnostic?.code).toBe("TK_PLUGIN_DESTROY_FAILED");
    expect(diagnostic?.level).toBe("warning");
    expect(diagnostic?.context?.received).toBe("a-broken");
    expect(diagnostic?.cause).toBe(boom);
  });

  it("reports each failing plugin separately", () => {
    const pm = createPluginManager();
    pm.use({ name: "one", priority: 1, onDestroy: () => { throw new Error("1"); } });
    pm.use({ name: "two", priority: 2, onDestroy: () => { throw new Error("2"); } });

    pm.destroy();

    expect(warn).toHaveBeenCalledTimes(2);
    const names = (warn.mock.calls as unknown[][]).map(
      (call) => (call[1] as ThemeDiagnostic).context?.received,
    );
    expect(names).toEqual(["one", "two"]);
  });

  it("is safe to call repeatedly", () => {
    const pm = createPluginManager();
    pm.use({ name: "a", onDestroy: () => { throw new Error("x"); } });

    pm.destroy();
    expect(() => pm.destroy()).not.toThrow();

    // The second destroy has nothing left to iterate, so it emits nothing more.
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("emits nothing when every plugin destroys cleanly", () => {
    const pm = createPluginManager();
    pm.use({ name: "a", onDestroy: vi.fn() });
    pm.use({ name: "b", onDestroy: vi.fn() });

    pm.destroy();

    expect(warn).not.toHaveBeenCalled();
  });
});
