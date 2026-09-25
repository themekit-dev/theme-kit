import type { ThemeDefinition } from "./model/theme";
import type { ThemeTokens } from "./model/tokens";
import { createThemeStore } from "./createThemeStore";
import { mergeTokens } from "./model";
import { resolveTokens } from "./resolve";
import { getBuiltInThemes } from "./built-in-themes";

import {
  createThemeRegistry,
  ThemeRegistry,
  type ThemePack,
  type ThemeRegistryOptions,
} from "./registry";
import { resolveInitialTheme, type InitialThemeResolution } from "./resolver";
import { readBootstrapState } from "./bootstrap";

import {
  createThemeSelectionController,
  type ThemeSelectionBroadcastAdapter,
  type ThemeSelectionPersistenceAdapter,
} from "./adapters/theme-selection";

import { createThemeSelectionBroadcast } from "./adapters/broadcast";
import { createDOMBinding, type DOMBindingOptions } from "./adapters/dom";

import {
  createCSSVariablesBinding,
  type CSSVariablesOptions,
} from "./adapters/css-variables";

import {
  createAdapterRegistry,
  type AdapterRegistry,
  type ThemeAdapter,
} from "./adapters/library";

import {
  createThemeSchedule,
  type ThemeSchedule,
} from "./adapters/schedule";

import type { ThemeMode } from "./model/theme";
import type { ThemeSelectionState } from "./model/selection";
import type { ThemeStore } from "./types";
import type { ThemeTransitionOptions } from "./transition";
import { createThemeHistory, type ThemeHistory, type HistoryEntry } from "./history";
import { cloneThemeValue } from "./utils/clone";
import { createThemeLifecycle, type ThemeLifecycle } from "./lifecycle";
import { createPluginManager, type ThemePlugin, type PluginManager } from "./plugin";

/**
 * Configures the runtime's automatic sunrise/sunset scheduling.
 *
 * When provided, the runtime creates a schedule controller that applies the
 * light or dark theme of the selected family based on solar times.
 */
export interface ScheduledThemeOptions<T extends ThemeDefinition> {
  /** Theme applied between sunrise and sunset. Optional — when omitted the
   *  schedule derives it from the currently selected theme's family (or falls
   *  back to the built-in neutral `"light"` theme). */
  lightTheme?: T["name"];
  /** Theme applied between sunset and sunrise. Optional — same derivation
   *  as `lightTheme`, falling back to the built-in neutral `"dark"` theme. */
  darkTheme?: T["name"];
  /** Explicit latitude. Optional — when omitted the location is resolved from
   *  `timeZone` or the visitor's browser timezone, so every user gets
   *  sunrise/sunset for their own location automatically. */
  latitude?: number;
  /** Explicit longitude. Optional — see `latitude`. */
  longitude?: number;
  /** IANA timezone to resolve coordinates from when `latitude`/`longitude`
   *  are omitted (e.g. `"Asia/Kathmandu"`). Takes precedence over
   *  auto-detection. */
  timeZone?: string;
  /** Auto-detect the visitor's location from their browser timezone when no
   *  explicit coordinates/timezone are given. Default `true`. */
  autoDetectLocation?: boolean;
  /** How often the schedule re-checks the solar state, in milliseconds.
   *  Passed through to the underlying schedule controller. */
  checkInterval?: number;
  /** Minimum time, in milliseconds, between two applications of the same
   *  theme — remote changes inside this window are ignored. */
  skipApplyMs?: number;
  /** Start enabled. Default `true`. */
  enabled?: boolean;
}

/**
 * Configuration for creating a Theme Kit runtime.
 *
 * Every option is optional; the runtime falls back to built-in themes,
 * localStorage persistence, and default bindings when an option is omitted.
 * @see {@link createThemeRuntime}
 */
export interface ThemeRuntimeOptions<T extends ThemeDefinition> extends ThemeRegistryOptions<T> {
  /**
   * Explicit initial theme resolution, bypassing default + persistence
   * based resolution.
   */
  initial?: InitialThemeResolution<T>;

  /**
   * Theme name to activate when no persisted or explicit selection exists.
   */
  defaultTheme?: T["name"];

  /**
   * Initial mode used when nothing else is given.
   */
  initialMode?: ThemeMode;

  /**
   * Initial family used when nothing else is given.
   */
  initialFamily?: string;

  /**
   * Whether a persisted selection is read at runtime creation.
   *
   * @defaultValue true
   */
  readPersistenceOnInit?: boolean;

  /**
   * Persistence adapter for the theme selection. Pass `null` to disable
   * persistence entirely.
   *
   * @defaultValue localStorage-backed persistence under the
   *   `"theme-selection"` key, when `window` is available.
   */
  persistence?: ThemeSelectionPersistenceAdapter | null;

  /**
   * Cross-tab broadcast adapter. When omitted, a `BroadcastChannel`-based
   * adapter on channel `"theme-selection"` is created; pass `null` to
   * disable cross-tab sync.
   */
  broadcast?: ThemeSelectionBroadcastAdapter | null;

  /**
   * The `window` to bind to. Defaults to the global `window` when
   * available; omit (or pass `undefined`) in SSR environments.
   */
  view?: Window;

  /**
   * DOM attribute/class binding configuration. `false` disables the
   * binding.
   *
   * @defaultValue enabled with default options
   */
  dom?: false | DOMBindingOptions;

  /**
   * CSS-variable binding configuration. `false` disables the binding.
   *
   * @defaultValue enabled with default options
   */
  cssVariables?: false | CSSVariablesOptions;

  /**
   * Transition configuration. `true` enables transitions with defaults,
   * `false` disables them, and an object provides explicit options.
   *
   * @defaultValue disabled (transitions off unless enabled)
   */
  transition?: boolean | ThemeTransitionOptions;

  /**
   * Sunrise/sunset scheduling configuration. `false` disables scheduling.
   *
   * @defaultValue disabled
   */
  scheduled?: false | ScheduledThemeOptions<T>;

  /**
   * Runtime plugins installed at creation.
   */
  plugins?: ThemePlugin<T>[];

  /**
   * Library adapters installed when the runtime is created. The runtime owns
   *  the registry and notifies every adapter whenever the theme changes; it
   *  never knows anything about the libraries themselves. */
  adapters?: ThemeAdapter<T>[];
}

/**
 * A serializable snapshot of a runtime's state.
 *
 * Produced by {@link ThemeRuntime.snapshot} and accepted by
 * {@link ThemeRuntime.restore} for time-travel and state transfer.
 */
export interface ThemeRuntimeSnapshot<T extends ThemeDefinition = ThemeDefinition> {
  /** The active theme definition. */
  theme: T;
  /** The active selection (family + mode). */
  selection: ThemeSelectionState;
  /** Recorded history entries. */
  history: HistoryEntry<T>[];
  /** The registry contents at snapshot time. */
  registry: { themes: T[] };
}

/**
 * The state a **server render** produces: the fallback resolution with no
 * persisted override and no OS preference resolved, plus the history state
 * captured before the initial selection was applied.
 *
 * @remarks
 * This is what React's `useSyncExternalStore` must be given as its *server*
 * snapshot. The runtime's live state cannot serve that purpose: by the time a
 * client component renders, the runtime has already adopted the persisted
 * selection and resolved `prefers-color-scheme`, so handing the live state to
 * `getServerSnapshot` makes React compare it against markup the server
 * rendered from the *fallback* — a mismatch, reported as React error #418,
 * that discards the server HTML and re-renders the whole island.
 *
 * A server has neither a persisted selection (no storage) nor an OS
 * preference (no `matchMedia`), so the server snapshot is exactly the
 * fallback: `options.initial` when the caller resolved one, otherwise the
 * `defaultTheme`/`initialFamily`/`initialMode` resolution with `prefersDark`
 * pinned to `false`.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link ThemeRuntime.initial}
 */
export interface ThemeRuntimeInitial<T extends ThemeDefinition>
  extends InitialThemeResolution<T> {
  /** Whether {@link ThemeHistory.undo} would have an effect on the server. */
  canUndo: boolean;
  /** Whether {@link ThemeHistory.redo} would have an effect on the server. */
  canRedo: boolean;
  /**
   * The history a server render produces: a single entry holding the
   * server-resolved theme.
   *
   * @remarks
   * Synthesised rather than read from the live controller, because the live
   * controller has already appended the client-resolved theme. Only the entry
   * count and the theme are meaningful — the timestamp is `0` (a server
   * render has no recorded timestamp to publish).
   */
  history: HistoryEntry<T>[];
}

/**
 * A Theme Kit runtime — the single entry point for theming one application
 * boundary.
 *
 * A runtime owns theme selection, token resolution, persistence bindings,
 * scheduling, lifecycle events, history, DOM/CSS-variable application, and
 * adapter registration. Destroy the runtime when its owning application
 * lifecycle ends.
 *
 * @see {@link createThemeRuntime}
 * @see {@link ThemeRuntimeOptions}
 */
export interface ThemeRuntime<T extends ThemeDefinition> {
  /**
   * The underlying theme store (current theme + subscription).
   */
  store: ThemeStore<T>;

  /**
   * The state a **server render** produces — the value `useSyncExternalStore`
   * needs as its *server* snapshot. Read-only and frozen at creation.
   *
   * @see {@link ThemeRuntimeInitial}
   */
  readonly initial: ThemeRuntimeInitial<T>;

  /**
   * The selection controller (mode/family/system binding, persistence).
   */
  selection: ReturnType<typeof createThemeSelectionController<T>>;

  /**
   * The theme registry holding the registered definitions.
   */
  registry: ThemeRegistry<T>;

  /**
   * Live view of the registered themes.
   */
  readonly themes: readonly T[];

  /**
   * Undo/redo history of theme changes.
   */
  history: ThemeHistory<T>;

  /**
   * Typed lifecycle event emitter.
   */
  lifecycle: ThemeLifecycle<T>;

  /**
   * The adapter registry (library adapters installed via `runtime.use`).
   */
  adapters: AdapterRegistry<T>;

  /** The sunrise/sunset scheduling controller created from the `scheduled`
   *  runtime option. `null` when the runtime was created without one. */
  schedule: ThemeSchedule | null;

  /** The resolved theme-transition options the runtime was created with
   *  (`undefined` when none were supplied). Components like `ThemeScope` read
   *  this so scoped theme changes inherit the same transition as the provider. */
  transition?: ThemeTransitionOptions;

  /**
   * Merges token overrides into the active theme and applies the result.
   *
   * Runs plugin token transforms and token-reference resolution before
   * committing the change.
   *
   * @param tokens Partial tokens to merge into the active theme.
   */
  update(tokens: Partial<ThemeTokens>): void;

  /**
   * Installs a theme pack (registry `use`) and refreshes the runtime's
   * theme list.
   *
   * @param pack The pack to install.
   */
  use(pack: ThemePack<T>): void;

  /**
   * Runs a callback with all intermediate theme changes coalesced.
   *
   * @param callback Work that performs one or more theme mutations.
   */
  batch(callback: () => void): void;

  /**
   * Captures a deep, serializable snapshot of runtime state.
   *
   * @returns A snapshot restorable via {@link ThemeRuntime.restore}.
   */
  snapshot(): ThemeRuntimeSnapshot<T>;

  /**
   * Restores a snapshot produced by {@link ThemeRuntime.snapshot}.
   *
   * Replaces the registry contents, history, store, and selection in one
   * batch. The snapshot is deep-cloned, so later mutation of the input is
   * safe.
   *
   * @param snapshot The snapshot to restore.
   */
  restore(snapshot: ThemeRuntimeSnapshot<T>): void;

  /**
   * Destroys the runtime and releases owned resources.
   *
   * Unsubscribes store listeners, destroys the selection controller,
   * history, bindings, schedule, adapters, registry, and plugin manager.
   *
   * Idempotent. Calling `destroy()` more than once has no effect. After
   * destruction, mutations become no-ops unless otherwise documented.
   */
  destroy(): void;
}

/**
 * Creates the default persistence adapter: a `localStorage`-backed
 * selection adapter under the `"theme-selection"` key.
 *
 * Returns `null` when `window` is unavailable (SSR) or storage access
 * throws. Cross-tab changes are surfaced through the `storage` event.
 *
 * @returns A persistence adapter, or `null` when storage is unavailable.
 * @see {@link ThemeSelectionPersistenceAdapter}
 * @see {@link createThemePersistence}
 */
export function createDefaultPersistence(): ThemeSelectionPersistenceAdapter | null {
  if (typeof window === "undefined") return null;

  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    return null;
  }

  const key = "theme-selection";

  function parseState(value: string | null): ThemeSelectionState | null {
    if (!value) return null;
    try {
      const p = JSON.parse(value) as Partial<ThemeSelectionState>;
      if (
        (p.mode === "light" || p.mode === "dark" || p.mode === "system") &&
        typeof p.family === "string"
      ) {
        return { mode: p.mode, family: p.family };
      }
    } catch {}
    return null;
  }

  return {
    get() {
      try { return parseState(storage!.getItem(key)); } catch { return null; }
    },
    set(value) {
      try { storage!.setItem(key, JSON.stringify(value)); } catch {}
    },
    remove() {
      try { storage!.removeItem(key); } catch {}
    },
    subscribe(listener) {
      const handler = (event: StorageEvent) => {
        if (event.key !== key) return;
        listener(parseState(event.newValue));
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}

function createDefaultBroadcast(): ThemeSelectionBroadcastAdapter | null {
  return createThemeSelectionBroadcast({ channelName: "theme-selection" });
}

/**
 * Creates an independent Theme Kit runtime — the single entry point for
 * theming.
 *
 * The runtime wires together the theme store, selection controller
 * (mode/family/system binding), persistence, broadcast (cross-tab sync),
 * history, scheduling, the DOM + CSS-variable bindings, and the adapter
 * registry.
 *
 * @param options Runtime configuration and initial theme definitions.
 * @returns A new `ThemeRuntime` instance.
 *
 * @example
 * ```ts
 * const runtime = createThemeRuntime({
 *   themes: [lightTheme, darkTheme],
 *   defaultTheme: "light",
 *   initialMode: "system",
 * });
 * runtime.selection.setMode("dark");
 * ```
 *
 * @remarks
 * The returned runtime must be destroyed when its owning application
 * lifecycle ends.
 *
 * @see {@link ThemeRuntime}
 * @see {@link createThemeStore}
 */
export function createThemeRuntime<T extends ThemeDefinition>(
  // Defaulted for the same reason every other factory here is: the options are
  // all optional, so `createThemeRuntime()` should create a runtime over the
  // built-in themes rather than throw on `options.themes`.
  options: ThemeRuntimeOptions<T> = {},
): ThemeRuntime<T> {
  const initialThemes = options.themes !== undefined
    ? [...options.themes]
    : [...(getBuiltInThemes() as unknown as T[])];
  const registry = createThemeRegistry<T>({ themes: initialThemes });
  const themes: T[] = [...registry.list()];

  const pluginManager = createPluginManager<T>();
  if (options.plugins) {
    for (const plugin of options.plugins) {
      pluginManager.use(plugin);
    }
  }

  const persistence =
    options.persistence === undefined
      ? createDefaultPersistence()
      : options.persistence;
  const readPersistenceOnInit = options.readPersistenceOnInit ?? true;

  const view =
    options.view ?? (typeof window !== "undefined" ? window : undefined);

  const prefersDark =
    typeof view?.matchMedia === "function" &&
    view.matchMedia("(prefers-color-scheme: dark)").matches;

  let initialFamily = options.initialFamily;
  let initialMode = options.initialMode as ThemeMode | undefined;

  if (readPersistenceOnInit && !options.initial) {
    const saved = persistence?.get();
    if (saved) {
      initialFamily = saved.family;
      initialMode = saved.mode;
    }
  }

  // The bootstrap handoff: read back what the pre-paint script already applied.
  // Client only (`document` is absent on a server), and `null` when there is no
  // `data-theme` or the name is not in this registry.
  //
  // Gated on `data-theme-ready`, which only the bootstrap script writes. A bare
  // `data-theme` is not enough: a previous runtime's DOM binding, a test, or a
  // hand-authored attribute can all leave one behind, and adopting that would
  // silently override the caller's `initial`/persistence with whatever happened
  // to be in the document.
  const bootstrapState =
    typeof document !== "undefined" ? readBootstrapState(themes) : null;
  const adoptBootstrap = bootstrapState?.ready === true ? bootstrapState : null;

  const resolution =
    // Client only: adopt the pre-paint bootstrap's state when it is present.
    // By the time a client renders, `<html>` already carries the resolved theme
    // — the blocking script wrote it before first paint — so the DOM is the
    // authority on what the visitor is looking at, and anything that re-derives
    // the theme can disagree with it. Note this overrides `options.initial`:
    // that is the *server's* resolution, which cannot know
    // `prefers-color-scheme`, while the bootstrap can. `runtime.initial` below
    // deliberately keeps the server's value, because React's hydration snapshot
    // has to match the markup the server sent.
    adoptBootstrap
      ? resolveInitialTheme({
          themes,

          ...(options.defaultTheme !== undefined
            ? { defaultTheme: options.defaultTheme }
            : {}),

          family: adoptBootstrap.selection.family,
          mode: adoptBootstrap.selection.mode,
          prefersDark,
        })
      : options.initial ??
        resolveInitialTheme({
          themes,

          ...(options.defaultTheme !== undefined
            ? { defaultTheme: options.defaultTheme }
            : {}),

          ...(initialFamily !== undefined ? { family: initialFamily } : {}),

          ...(initialMode !== undefined ? { mode: initialMode } : {}),

          prefersDark,
        });

  // The resolution a **server render** produces. Same inputs as above, minus
  // the two things a server does not have: a persisted selection (no storage)
  // and an OS preference (no `matchMedia`). Exposed as `runtime.initial` so
  // `useSyncExternalStore` can be given the value the server actually
  // rendered — see `ThemeRuntimeInitial`.
  const serverResolution =
    options.initial ??
    resolveInitialTheme({
      themes,

      ...(options.defaultTheme !== undefined
        ? { defaultTheme: options.defaultTheme }
        : {}),

      ...(options.initialFamily !== undefined
        ? { family: options.initialFamily }
        : {}),

      ...(options.initialMode !== undefined
        ? { mode: options.initialMode }
        : {}),

      prefersDark: false,
    });

  const initial: ThemeRuntimeInitial<T> = Object.freeze({
    theme: serverResolution.theme,
    selection: serverResolution.selection,
    // A server render starts from an empty history: `createThemeHistory` seeds
    // exactly one entry and the initial `applySelection` re-applies the same
    // theme, so nothing is appended. Synthesised rather than read from the live
    // controller, which has already recorded the client-resolved theme.
    canUndo: false,
    canRedo: false,
    history: Object.freeze([
      { theme: serverResolution.theme, timestamp: 0 },
    ]) as unknown as HistoryEntry<T>[],
  });

  const store = createThemeStore({
    initialTheme: resolution.theme,
  });

  const lifecycleController = createThemeLifecycle<T>();

  const historyController = createThemeHistory(store);

  const transitionOpt =
    options.transition === undefined
      ? undefined
      : typeof options.transition === "object"
        ? options.transition
        : options.transition === true
          ? {}
          : { enabled: false };

  const domOptions = mergeDOMOptions(options.dom, transitionOpt);
  const cssVarOptions = mergeCSSOptions(options.cssVariables, transitionOpt);

  const schedule = createScheduleController(
    store,
    themes,
    options.scheduled,
  );

  const selectionController = createThemeSelectionController({
    store,
    themes,

    initialFamily: resolution.selection.family,
    initialMode: resolution.selection.mode,

    readPersistenceOnInit: false,
    persistence,

    ...(options.broadcast === undefined
      ? { broadcast: createDefaultBroadcast() }
      : options.broadcast
        ? { broadcast: options.broadcast }
        : {}),
    ...(view ? { view } : {}),
    onSyncApply: () => {
      schedule?.setLastSyncTime(Date.now());
    },
  });

  // Created *after* the selection controller, because both bindings apply the
  // store's current theme the moment they are created, and the selection
  // controller is what resolves it. Creating them first published whatever the
  // store happened to hold — for `"system"` mode that is the fallback theme
  // until the controller binds `prefers-color-scheme`, so a dark-OS visitor got
  // one painted frame of the light theme before the binding it replaced. The
  // order matters only here: nothing else observes the store in between.
  // `selection` is handed to the DOM binding so it also maintains
  // `data-theme-selection-mode` / `data-theme-selection-family`. Those are
  // published by the pre-paint bootstrap and the SSR layouts and, until this
  // wiring existed, were never updated again: after the first client-side change
  // the document advertised a selection the visitor no longer had, and every
  // consumer of that attribute — CSS, a framework-free control,
  // `readBootstrapState` — read the state of the page as it was loaded.
  // Whether the CSS-variables binding will own the DOM write for this runtime.
  //
  // Inline variables (the default) are applied inside a single
  // `document.startViewTransition`, whose update callback runs in a *later
  // task*. The DOM binding must therefore not subscribe to the store itself —
  // it is driven from `onBeforeSwap` instead, so the attributes, the `dark`
  // class, `color-scheme` and the `--theme-*` variables all commit together.
  //
  // Without this, `data-theme` flipped in one task and the palette in the next.
  // A paint landing between them showed the new theme's identity over the old
  // theme's colours: the page announced `oat-light` while still painting the
  // dark background, and a `[data-tk-readout]` label disagreed with the pixels
  // beside it. Because it depends on where the compositor commits, it looked
  // like the theme state was "fluctuating" rather than failing every time.
  //
  // `styleSheet: true` is excluded because that path writes into a `<style>`
  // element and returns before `onBeforeSwap`, so the DOM binding has to keep
  // its own subscription there.
  const cssBindingDrivesDom =
    cssVarOptions !== undefined && cssVarOptions.styleSheet !== true;

  const domBinding = domOptions
    ? createDOMBinding(store, {
        ...domOptions,
        selection: selectionController,
        subscribe: !cssBindingDrivesDom,
      })
    : null;

  const cssVariablesBinding =
    cssVarOptions
      ? createCSSVariablesBinding(store, {
          ...cssVarOptions,
          ...(domBinding ? { onBeforeSwap: domBinding.apply } : {}),
        })
      : null;

  // Safety net for the one combination the flags above cannot see: an explicit
  // `dom.target` makes the DOM binding possible while the CSS binding still
  // returns `null` (no target and no document). Nothing would then call
  // `onBeforeSwap`, so publish the current state once rather than leaving the
  // attributes unwritten.
  if (domBinding && cssBindingDrivesDom && !cssVariablesBinding) {
    domBinding.apply(store.get(), { suppressTransition: true });
  }

  function wirePluginHooks() {
    for (const plugin of pluginManager.list()) {
      if (plugin.onBeforeThemeChange) {
        lifecycleController.on("beforeThemeChange", plugin.onBeforeThemeChange as (data: unknown) => void);
      }
      if (plugin.onAfterThemeChange) {
        lifecycleController.on("afterThemeChange", plugin.onAfterThemeChange as (data: unknown) => void);
      }
      if (plugin.onBeforePersist) {
        lifecycleController.on("beforePersist", plugin.onBeforePersist as (data: unknown) => void);
      }
      if (plugin.onAfterPersist) {
        lifecycleController.on("afterPersist", plugin.onAfterPersist as (data: unknown) => void);
      }
      if (plugin.onBeforeApply) {
        lifecycleController.on("beforeApply", plugin.onBeforeApply as (data: unknown) => void);
      }
      if (plugin.onAfterApply) {
        lifecycleController.on("afterApply", plugin.onAfterApply as (data: unknown) => void);
      }
    }
  }

  function use(pack: ThemePack<T>): void {
    registry.use(pack);
    themes.length = 0;
    themes.push(...registry.list());
  }

  function mergeDOMOptions(
    explicit: false | DOMBindingOptions | undefined,
    fallbackTransition: ThemeTransitionOptions | undefined,
  ): DOMBindingOptions | undefined {
    if (explicit === false) return undefined;

    const base: DOMBindingOptions = explicit ?? {};

    if (base.transition) return base;
    if (fallbackTransition) return { ...base, transition: fallbackTransition };

    return base;
  }

  function mergeCSSOptions(
    explicit: false | CSSVariablesOptions | undefined,
    fallbackTransition: ThemeTransitionOptions | undefined,
  ): CSSVariablesOptions | undefined {
    if (explicit === false) return undefined;

    const base: CSSVariablesOptions = explicit ?? {};

    if (base.transition) return base;
    if (fallbackTransition) return { ...base, transition: fallbackTransition };

    return base;
  }

  function batch(callback: () => void): void {
    store.batch(callback);
  }

  function snapshot(): ThemeRuntimeSnapshot<T> {
    return {
      theme: cloneThemeValue(store.get()),
      selection: { ...selectionController.getSelection() },
      history: [...historyController.getHistory()],
      registry: {
        themes: registry.list().map((t) => cloneThemeValue(t)),
      },
    };
  }

  function restore(snap: ThemeRuntimeSnapshot<T>): void {
    updatingFromRuntime = true;
    store.batch(() => {
      registry.clear();
      for (const theme of snap.registry.themes) {
        registry.register(theme);
      }
      themes.length = 0;
      themes.push(...registry.list());

      historyController.clear();

      store.set(cloneThemeValue(snap.theme) as T, { force: true });
      previousTheme = store.get();
      selectionController.setMode(snap.selection.mode);
      if (snap.selection.family) {
        selectionController.setFamily(snap.selection.family);
      }
    });
    updatingFromRuntime = false;
  }

  let updatingFromRuntime = false;
  let previousTheme = store.get();

  const unsubscribeStoreSelection = store.subscribe((theme) => {
    if (updatingFromRuntime) return;
    if (theme === previousTheme) return;
    lifecycleController.emit("beforeThemeChange", { current: previousTheme, next: theme });
    lifecycleController.emit("beforePersist", { selection: selectionController.getSelection() });
    lifecycleController.emit("afterPersist", { selection: selectionController.getSelection() });
    lifecycleController.emit("afterThemeChange", { theme });
    previousTheme = theme;
  });

  let adapterRegistry: AdapterRegistry<T> | null = null;

  const runtime: ThemeRuntime<T> = {
    store,
    initial,
    registry,
    get themes(): readonly T[] {
      return registry.list();
    },
    selection: selectionController,
    history: historyController,
    lifecycle: lifecycleController,
    adapters: null as unknown as AdapterRegistry<T>,
    schedule,
    ...(transitionOpt !== undefined ? { transition: transitionOpt } : {}),

    update(tokens: Partial<ThemeTokens>) {
      const current = store.get();
      const next = { ...current } as T;
      let merged = mergeTokens(current.tokens, tokens as ThemeTokens);
      if (merged) {
        for (const plugin of pluginManager.list()) {
          if (plugin.transformTokens) {
            merged = plugin.transformTokens(merged, { theme: next });
          }
        }
        merged = resolveTokens(merged);
      }
      (next as Record<string, unknown>).tokens = merged ?? current.tokens;

      updatingFromRuntime = true;
      lifecycleController.emit("beforeThemeChange", { current, next });
      lifecycleController.emit("beforePersist", { selection: selectionController.getSelection() });
      store.set(next, { force: true });
      previousTheme = next;
      updatingFromRuntime = false;
      lifecycleController.emit("afterPersist", { selection: selectionController.getSelection() });
      lifecycleController.emit("afterThemeChange", { theme: next });
    },

    use,

    batch,
    snapshot,
    restore,

     destroy() {
      unsubscribeStoreSelection();
      pluginManager.destroy();
      selectionController.destroy();
      historyController.destroy();
      domBinding?.destroy();
      cssVariablesBinding?.destroy();
      schedule?.destroy();
      adapterRegistry?.destroy();
      registry.destroy();
      lifecycleController.destroy();
    },
   };

  for (const plugin of pluginManager.list()) {
    plugin.onRuntimeCreated?.(runtime);
  }
  wirePluginHooks();

  adapterRegistry = createAdapterRegistry(runtime);
  runtime.adapters = adapterRegistry;
  for (const adapter of options.adapters ?? []) {
    adapterRegistry.use(adapter);
  }

  return runtime;
}

function createScheduleController<T extends ThemeDefinition>(
  store: ThemeStore<T>,
  themes: readonly T[],
  scheduled: false | ScheduledThemeOptions<T> | undefined,
) {
  if (!scheduled) return null;

  return createThemeSchedule(store, themes, {
    ...(scheduled.lightTheme !== undefined
      ? { lightTheme: scheduled.lightTheme }
      : {}),
    ...(scheduled.darkTheme !== undefined
      ? { darkTheme: scheduled.darkTheme }
      : {}),
    ...(scheduled.latitude !== undefined
      ? { latitude: scheduled.latitude }
      : {}),
    ...(scheduled.longitude !== undefined
      ? { longitude: scheduled.longitude }
      : {}),
    ...(scheduled.timeZone !== undefined
      ? { timeZone: scheduled.timeZone }
      : {}),
    ...(scheduled.autoDetectLocation !== undefined
      ? { autoDetectLocation: scheduled.autoDetectLocation }
      : {}),
    ...(scheduled.checkInterval !== undefined
      ? { checkInterval: scheduled.checkInterval }
      : {}),
    ...(scheduled.skipApplyMs !== undefined
      ? { skipApplyMs: scheduled.skipApplyMs }
      : {}),
    ...(scheduled.enabled !== undefined
      ? { enabled: scheduled.enabled }
      : {}),
  });
}
