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
import { createThemeLifecycle, type ThemeLifecycle } from "./lifecycle";
import { createPluginManager, type ThemePlugin, type PluginManager } from "./plugin";

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
  checkInterval?: number;
  skipApplyMs?: number;
  /** Start enabled. Default `true`. */
  enabled?: boolean;
}

export interface ThemeRuntimeOptions<T extends ThemeDefinition> extends ThemeRegistryOptions<T> {
  initial?: InitialThemeResolution<T>;

  defaultTheme?: T["name"];

  initialMode?: ThemeMode;
  initialFamily?: string;

  readPersistenceOnInit?: boolean;

  persistence?: ThemeSelectionPersistenceAdapter | null;
  broadcast?: ThemeSelectionBroadcastAdapter | null;

  view?: Window;

  dom?: false | DOMBindingOptions;
  cssVariables?: false | CSSVariablesOptions;

  transition?: boolean | ThemeTransitionOptions;

  scheduled?: false | ScheduledThemeOptions<T>;

  plugins?: ThemePlugin<T>[];

  /** Library adapters installed when the runtime is created. The runtime owns
   *  the registry and notifies every adapter whenever the theme changes; it
   *  never knows anything about the libraries themselves. */
  adapters?: ThemeAdapter<T>[];
}

export interface ThemeRuntimeSnapshot<T extends ThemeDefinition = ThemeDefinition> {
  theme: T;
  selection: ThemeSelectionState;
  history: HistoryEntry<T>[];
  registry: { themes: T[] };
}

export interface ThemeRuntime<T extends ThemeDefinition> {
  store: ThemeStore<T>;
  selection: ReturnType<typeof createThemeSelectionController<T>>;
  registry: ThemeRegistry<T>;
  readonly themes: readonly T[];
  history: ThemeHistory<T>;
  lifecycle: ThemeLifecycle<T>;
  adapters: AdapterRegistry<T>;
  /** The sunrise/sunset scheduling controller created from the `scheduled`
   *  runtime option. `null` when the runtime was created without one. */
  schedule: ThemeSchedule | null;
  /** The resolved theme-transition options the runtime was created with
   *  (`undefined` when none were supplied). Components like `ThemeScope` read
   *  this so scoped theme changes inherit the same transition as the provider. */
  transition?: ThemeTransitionOptions;
  update(tokens: Partial<ThemeTokens>): void;
  use(pack: ThemePack<T>): void;
  batch(callback: () => void): void;
  snapshot(): ThemeRuntimeSnapshot<T>;
  restore(snapshot: ThemeRuntimeSnapshot<T>): void;
  destroy(): void;
}

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

export function createThemeRuntime<T extends ThemeDefinition>(
  options: ThemeRuntimeOptions<T>,
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

  const resolution =
    options.initial ??
    resolveInitialTheme({
      themes,

      ...(options.defaultTheme !== undefined
        ? { defaultTheme: options.defaultTheme }
        : {}),

      ...(initialFamily !== undefined ? { family: initialFamily } : {}),

      ...(initialMode !== undefined ? { mode: initialMode } : {}),

      prefersDark,
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

  const domBinding =
    domOptions ? createDOMBinding(store, domOptions) : null;

  const cssVariablesBinding =
    cssVarOptions
      ? createCSSVariablesBinding(store, cssVarOptions)
      : null;

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
      theme: structuredClone(store.get()),
      selection: { ...selectionController.getSelection() },
      history: [...historyController.getHistory()],
      registry: {
        themes: registry.list().map((t) => structuredClone(t)),
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

      store.set(structuredClone(snap.theme) as T, { force: true });
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
