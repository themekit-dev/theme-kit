import {
  createThemeRuntime,
  getBuiltInThemes,
  resolveRuntimeOptions,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
} from "@theme-kit/core";
import { THEME_READOUT_ATTRIBUTE } from "./attributes";
import { createAstroThemePersistence } from "./persistence";
import { getGlobalRuntime, setGlobalRuntime } from "./shared-runtime";

/**
 * The reactive state a {@link ThemeController} publishes to its subscribers.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link ThemeController.subscribe}
 */
export interface ThemeControllerState<T extends ThemeDefinition> {
  /** The resolved theme definition. */
  theme: T;
  /** The mode actually applied — `"light"` or `"dark"`, never `"system"`. */
  resolvedMode: "light" | "dark";
  /** The visitor's mode selection — `"light"`, `"dark"` or `"system"`. */
  mode: ThemeMode;
  /** The visitor's family selection. */
  family: string;
}

/**
 * A framework-neutral controller over the app-wide Theme Kit runtime.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @remarks
 * This is **not** a React hook, and not a hook of any kind: it is a plain
 * object with getters and setters, valid in any browser context — an Astro
 * `<script>`, a custom element, an event handler, a devtools console. Nothing
 * here re-renders; {@link ThemeController.subscribe} is how a caller observes
 * change.
 *
 * It exists so Astro does not have to borrow React's shape. A `.astro` file has
 * no reactive component runtime, so `useTheme()` — a React hook, valid only
 * inside a React island — is the wrong abstraction there. The Astro-idiomatic
 * spelling is:
 *
 * ```ts
 * const theme = getThemeController();
 * theme.toggleTheme();
 * ```
 *
 * The React hook keeps its own shape, for React islands:
 *
 * ```tsx
 * const { theme, mode, toggleTheme } = useTheme();
 * ```
 *
 * @see {@link getThemeController}
 * @see {@link createThemeController}
 */
export interface ThemeController<T extends ThemeDefinition> {
  /** The underlying runtime, for anything the controller does not wrap. */
  readonly runtime: ThemeRuntime<T>;

  /** The currently resolved theme definition. */
  getTheme(): T;

  /**
   * The visitor's mode selection: `"light"`, `"dark"` or `"system"`.
   *
   * @remarks
   * The *selection*, not the resolved mode. A `"system"` selection stays
   * `"system"` as the OS preference changes, so a control bound to it does not
   * silently downgrade to a concrete mode. Use
   * {@link ThemeController.getResolvedMode} for the value actually painted.
   */
  getMode(): ThemeMode;

  /** The mode actually applied: `"light"` or `"dark"`. */
  getResolvedMode(): "light" | "dark";

  /** The visitor's family selection. */
  getFamily(): string;

  /** Sets the mode selection. */
  setMode(mode: ThemeMode): void;

  /** Sets the family selection. */
  setFamily(family: string): void;

  /** Flips between `"light"` and `"dark"`, resolved from what is painted. */
  toggleTheme(): void;

  /**
   * Subscribes to state changes from **either** the theme store or the
   * selection controller.
   *
   * @param listener - Called with the new state on every change.
   * @returns An unsubscribe function.
   *
   * @remarks
   * Both sources are needed. A selection change that resolves to the same theme
   * — `setMode("light")` while the OS preference is already light — emits no
   * store change, so a store-only subscription would never fire and a bound
   * control would keep showing the previous value.
   */
  subscribe(listener: (state: ThemeControllerState<T>) => void): () => void;

  /**
   * Destroys the runtime and stops every subscription.
   *
   * @remarks
   * On a controller that does not own its runtime — one returned by
   * {@link getThemeController} over a runtime a React island installed — this
   * only detaches. The owner destroys it.
   */
  destroy(): void;
}

/**
 * Options for {@link createThemeController} / {@link getThemeController}.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @remarks
 * Every field is optional, and every field is an *override*. The application
 * configuration is already in the browser — `themeKit()` transports
 * `theme.config.ts` as `window.__THEME_KIT_CONFIG__` from `<head>` — so the
 * runtime is built from that. Passing `themes` / `defaultTheme` /
 * `initialMode` / `initialFamily` here is for a test, a storybook, or an
 * island that deliberately wants a different registry.
 *
 * @see {@link getThemeController}
 */
export type ThemeControllerOptions<T extends ThemeDefinition> = Partial<
  Omit<ThemeRuntimeOptions<T>, "persistence" | "readPersistenceOnInit">
> & {
  /**
   * Keep every `[data-tk-readout]` element in the document in sync with the
   * live state. Defaults to `true`.
   *
   * @remarks
   * The pre-paint bootstrap already patches these elements from `<head>`,
   * before the body is parsed — that is what stops a server-rendered label
   * being painted with the wrong value and correcting itself after hydration.
   * That patch runs once, though, so without this a readout would go stale the
   * moment the visitor changes the theme. This is the framework-neutral
   * equivalent of React's `<ThemeReadout />` plus `suppressHydrationWarning`.
   *
   * The element's text is *owned* by the contract, exactly as `ThemeReadout`
   * renders a `<span>` whose only child is the value. Put the readout on its own
   * element rather than on a container with other children.
   *
   * Pass `false` when the application renders readouts itself.
   */
  readouts?: boolean;
};

/**
 * Resolves the text a readout element should display.
 *
 * @param kind - The element's `data-tk-readout` value.
 * @param theme - The resolved theme.
 * @param mode - The visitor's mode selection.
 * @param family - The visitor's family selection.
 * @returns The text, or `null` for a kind this contract does not own.
 *
 * @internal
 */
function readoutValue<T extends ThemeDefinition>(
  kind: string | null,
  theme: T,
  mode: ThemeMode,
  family: string,
): string | null {
  if (kind === "theme") return String(theme.name);
  if (kind === "mode") return mode;
  if (kind === "family") return family;
  return null;
}

/**
 * Writes the live state into every `[data-tk-readout]` element.
 *
 * @internal
 */
function patchReadouts<T extends ThemeDefinition>(
  theme: T,
  mode: ThemeMode,
  family: string,
) {
  if (typeof document === "undefined") return;

  const els = document.querySelectorAll<HTMLElement>(
    `[${THEME_READOUT_ATTRIBUTE}]`,
  );
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i]!;
    const value = readoutValue(
      el.getAttribute(THEME_READOUT_ATTRIBUTE),
      theme,
      mode,
      family,
    );
    if (value != null && el.textContent !== value) {
      el.textContent = value;
    }
  }
}

/**
 * Builds a controller around an existing runtime.
 *
 * @param runtime - The runtime to wrap.
 * @param readouts - Whether to keep `[data-tk-readout]` elements in sync.
 * @param owns - Whether {@link ThemeController.destroy} may destroy the runtime.
 *
 * @internal
 */
function wrapRuntime<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  readouts: boolean,
  owns: boolean,
): ThemeController<T> {
  let destroyed = false;

  const readState = (): ThemeControllerState<T> => {
    const theme = runtime.store.get();
    return {
      theme,
      resolvedMode: (theme.meta?.mode as ThemeMode) === "dark" ? "dark" : "light",
      mode: runtime.selection.getMode(),
      family: runtime.selection.getFamily(),
    };
  };

  /**
   * Attaches a listener to both change sources.
   *
   * @param listener - Called after every change.
   * @returns An unsubscribe function.
   *
   * @remarks
   * Both sources, for the reason documented on
   * {@link ThemeController.subscribe}: a same-theme selection change emits no
   * store event.
   */
  const observe = (listener: (state: ThemeControllerState<T>) => void) => {
    const unsubStore = runtime.store.subscribe(() => listener(readState()));
    const unsubSelection = runtime.selection.subscribe(() => listener(readState()));

    return () => {
      unsubStore();
      unsubSelection();
    };
  };

  // Readouts are kept live by the controller itself, not by a caller's
  // subscription. A `<ThemeToggle showMode />` has no subscriber of its own —
  // it just calls `toggleTheme()` — and without this its label would keep the
  // value the pre-paint bootstrap wrote and never move again.
  const unsubReadouts = readouts
    ? observe((state) => patchReadouts(state.theme, state.mode, state.family))
    : null;

  // Patch once now, so a readout rendered on a page whose bootstrap did not run
  // (JS-enabled but `injectBootstrap: false`) is correct from the first frame
  // the runtime exists rather than from the first change.
  if (readouts) {
    const initial = readState();
    patchReadouts(initial.theme, initial.mode, initial.family);
  }

  return {
    runtime,

    getTheme: () => runtime.store.get(),
    getMode: () => runtime.selection.getMode(),
    getFamily: () => runtime.selection.getFamily(),
    getResolvedMode: () => readState().resolvedMode,

    setMode: (mode) => runtime.selection.setMode(mode),
    setFamily: (family) => runtime.selection.setFamily(family),
    toggleTheme: () => runtime.selection.toggleTheme(),

    subscribe: observe,

    destroy() {
      if (destroyed) return;
      destroyed = true;
      unsubReadouts?.();
      if (owns) runtime.destroy();
    },
  };
}

/**
 * Creates a controller over a **new** runtime and installs it as the app-wide
 * runtime.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param options - Overrides for the transported application configuration (see
 *   {@link ThemeControllerOptions}).
 * @returns A new controller owning a new runtime.
 *
 * @example
 * ```ts
 * import { createThemeController } from "@theme-kit/astro";
 *
 * const theme = createThemeController({ themes: myTestThemes });
 * theme.setMode("dark");
 * ```
 *
 * @remarks
 * Prefer {@link getThemeController} in application code: this function replaces
 * any runtime already installed, so two calls give two runtimes racing to write
 * `<html>`.
 *
 * @see {@link getThemeController}
 * @see {@link ThemeController}
 */
export function createThemeController<T extends ThemeDefinition>(
  options: ThemeControllerOptions<T> = {},
): ThemeController<T> {
  const { readouts = true, ...runtimeOptions } = options;

  // Transported configuration first, overrides second — the same order every
  // other provider in the monorepo uses, so an Astro app and a Web Components
  // app given the same `theme.config.ts` produce the same runtime.
  const resolved = resolveRuntimeOptions<T>(runtimeOptions);

  const themes = (resolved.themes as readonly T[] | undefined)?.length
    ? (resolved.themes as readonly T[])
    : (getBuiltInThemes() as unknown as readonly T[]);
  const defaultTheme = resolved.defaultTheme;

  // The persistence adapter needs the same registry and fallback the server
  // used, or the fingerprints disagree and the persisted cookies are rejected
  // as stale — silently dropping to the default theme on every load.
  const persistence = createAstroThemePersistence(themes, defaultTheme);

  const runtime = createThemeRuntime<T>({
    ...resolved,
    themes,
    dom: resolved.dom ?? {},
    cssVariables: resolved.cssVariables ?? {},
    persistence,
    // No `initial` is passed here: this runs in the browser, where the persisted
    // selection — and the state the blocking script already painted — is more
    // recent than any server resolution. The runtime adopts the bootstrap
    // handoff (`data-theme-ready`) on its own.
    readPersistenceOnInit: true,
  });

  setGlobalRuntime(runtime);

  return wrapRuntime(runtime, readouts, true);
}

/**
 * The app-wide {@link ThemeController}, created on first call.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param options - Overrides, honoured only on the call that creates the
 *   controller (see {@link ThemeControllerOptions}).
 * @returns The shared controller.
 *
 * @example
 * ```astro
 * <button id="theme-toggle">Toggle theme</button>
 *
 * <script>
 *   import { getThemeController } from "@theme-kit/astro";
 *
 *   const theme = getThemeController();
 *
 *   document
 *     .querySelector("#theme-toggle")
 *     ?.addEventListener("click", () => theme.toggleTheme());
 * </script>
 * ```
 *
 * @remarks
 * **One runtime per document.** The provider, `<ThemeToggle />`, a hand-written
 * `<script>` and a React island all end up here, and the first caller wins:
 * every later call returns the same controller rather than building a second
 * runtime that would fight the first over `<html>`. That is what lets a page go
 * from `<Provider>` to `<ThemeToggle />` with no per-page `initialMode` /
 * `initialFamily` and no React island.
 *
 * If a runtime is already installed — a React island created one — this adopts
 * it instead of replacing it, so the two surfaces share one runtime and one
 * state.
 *
 * Browser-only. It reads the transported configuration, the persisted selection
 * and `prefers-color-scheme`, none of which exist on a server — call it from a
 * `<script>`, never from Astro frontmatter.
 *
 * @throws {Error} When called outside the browser.
 *
 * @see {@link ThemeController}
 * @see {@link createThemeController}
 * @see {@link getGlobalRuntime}
 */
export function getThemeController<T extends ThemeDefinition>(
  options: ThemeControllerOptions<T> = {},
): ThemeController<T> {
  if (typeof window === "undefined") {
    throw new Error(
      "getThemeController() is browser-only. It creates the client runtime from the transported " +
        "configuration, the persisted selection and prefers-color-scheme, none of which exist during " +
        "server rendering. Call it from a <script> — the server-rendered document is owned by " +
        "provider.astro, which needs no runtime.",
    );
  }

  const key = globalThis as unknown as object;
  const live = getGlobalRuntime<ThemeDefinition>();
  const cached = controllers.get(key);

  // Re-wrap whenever the installed runtime changes: a React island mounts its
  // own runtime through `ThemeProviderClient`, and a controller cached against
  // the previous one would then drive a runtime nothing is listening to.
  if (cached && live && cached.runtime === live) return cached as ThemeController<T>;

  const controller = live
    ? wrapRuntime(live as ThemeRuntime<T>, options.readouts ?? true, false)
    : createThemeController<T>(options);

  controllers.set(key, controller as ThemeController<ThemeDefinition>);
  return controller;
}

/**
 * The app-wide controllers, keyed by the global scope they were created in.
 *
 * @remarks
 * Keyed by `globalThis` rather than held in a module-level variable because
 * this package is also loaded in test environments, where several independent
 * "documents" can share one module instance. A plain module variable would leak
 * a controller from one test into the next, which reads as a runtime that is
 * already installed and never created.
 */
const controllers = new WeakMap<object, ThemeController<ThemeDefinition>>();

/**
 * Discards the cached app-wide controller without destroying its runtime.
 *
 * @remarks
 * **Test-only.** It lets a test create a controller per case; nothing in an
 * application should call it. The runtime is deliberately left alone —
 * destroying it would tear down a document the caller may still be using.
 *
 * @internal
 */
export function __resetThemeController(): void {
  controllers.delete(globalThis as unknown as object);
}
