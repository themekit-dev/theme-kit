"use client";

import { useMemo, useSyncExternalStore, useCallback } from "react";
import type { ThemeDefinition, ThemeFamilies, ThemeModes, ThemeTokens, ThemeRuntime, ThemeRuntimeSnapshot, ThemePack, ThemeLifecycleEventMap, ThemeSchedule, ThemeScheduleState } from "@theme-kit/core";

import { useThemeRuntime as useProviderThemeRuntime } from "./provider";

import { EMPTY_THEME_SCHEDULE_STATE } from "@theme-kit/core";

type ThemeLifecycleEventName = keyof ThemeLifecycleEventMap;

// Derive the literal family/mode unions from the theme definitions (T).
// `"system"` is always a valid mode (follow the OS).
type FamiliesOf<T extends ThemeDefinition> = ThemeFamilies<readonly T[]>;
type ModesOf<T extends ThemeDefinition> = ThemeModes<readonly T[]> | "system";

/**
 * Subscribe to a slice of the runtime.
 *
 * `getServerSnapshot` matters for hydration. The runtime a client creates can
 * legitimately hold a different value than the one the server rendered — it
 * adopts the pre-paint bootstrap, which knows `prefers-color-scheme` and the
 * server does not — so React needs the server's value for the hydration render
 * and the live one afterwards. `runtime.initial` keeps exactly that value.
 */
function useThemeSelector<T>(
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
): T {
  const runtime = useProviderThemeRuntime();

  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubStore = runtime.store.subscribe(listener);
      const unsubSelection = runtime.selection.subscribe
        ? runtime.selection.subscribe(listener)
        : () => {};
      return () => {
        unsubStore();
        unsubSelection();
      };
    },
    [runtime],
  );

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot ?? getSnapshot,
  );
}

/**
 * Get a batch function that defers all selection changes and DOM writes
 *    to a single flush.
 *
 * @see {@link useTheme}
 */
export function useThemeBatch() {
  const runtime = useProviderThemeRuntime();
  return useCallback((callback: () => void) => runtime.batch(callback), [runtime]);
}

/**
 * Get a snapshot function that captures the full runtime state.
 *
 * @see {@link useThemeRestore}
 */
export function useThemeSnapshot() {
  const runtime = useProviderThemeRuntime();
  return useCallback((): ThemeRuntimeSnapshot => runtime.snapshot(), [runtime]);
}

/**
 * Get a restore function that re-applies a previously captured snapshot.
 *
 * @see {@link useThemeSnapshot}
 */
export function useThemeRestore() {
  const runtime = useProviderThemeRuntime();
  return useCallback((snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot), [runtime]);
}

/**
 * Subscribe to the history timeline and get a `jump(index)` function.
 *
 * @see {@link useThemeHistory}
 */
export function useThemeTimeTravel() {
  const runtime = useProviderThemeRuntime();

  const history = useSyncExternalStore(
    useCallback((listener: () => void) => runtime.store.subscribe(() => listener()), [runtime]),
    () => runtime.history.getHistory(),
    () => runtime.history.getHistory(),
  );

  const jump = useCallback((index: number) => runtime.history.jump(index), [runtime]);

  return { history, jump };
}

/**
 * Subscribe to runtime lifecycle events (theme changed, mode changed, …).
 *
 * The handler is typed per event name, so `on("beforeThemeChange", ({ next }) => …)`
 * gives you the theme definitions rather than `unknown` — the same precision
 * `runtime.lifecycle.on` has in `@theme-kit/core`.
 *
 * @see {@link useTheme}
 */
export function useThemeLifecycle<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();

  const subscribe = useCallback(
    <K extends ThemeLifecycleEventName>(
      event: K,
      listener: (data: ThemeLifecycleEventMap<T>[K]) => void,
    ) => {
      const unsubscribe = runtime.lifecycle.on(event, listener);
      return unsubscribe;
    },
    [runtime],
  );

  return { on: subscribe };
}

/**
 * Get a function that applies a theme pack to the runtime.
 *
 * @see {@link useTheme}
 */
export function useThemePacks() {
  const runtime = useProviderThemeRuntime();
  return useCallback((pack: ThemePack<any>) => runtime.use(pack), [runtime]);
}

/**
 * Subscribe to the current theme definition (re-renders on change).
 *
 * @see {@link useTheme}
 */
export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();

  return useThemeSelector(
    () => runtime.store.get(),
    () => runtime.initial.theme,
  );
}

/**
 * Subscribe to the current theme's token groups.
 *
 * @see {@link useThemeValue}
 */
export function useThemeTokens<T extends ThemeDefinition>():
  ThemeTokens | undefined {
  return useThemeValue<T>().tokens;
}

/**
 * Subscribe to the current selection mode ("light" | "dark" | "system").
 *
 * @see {@link useSetThemeMode}
 */
export function useThemeMode() {
  const runtime = useProviderThemeRuntime();

  return useThemeSelector(
    () => runtime.selection.getSelection().mode,
    () => runtime.initial.selection.mode,
  );
}

/**
 * Subscribe to the current selection family.
 *
 * @see {@link useSetThemeFamily}
 */
export function useThemeFamily() {
  const runtime = useProviderThemeRuntime();

  return useThemeSelector(
    () => runtime.selection.getSelection().family,
    () => runtime.initial.selection.family,
  );
}

/**
 * Get a stable `setMode` function (does not re-render on change).
 *
 * @see {@link useThemeMode}
 */
export function useSetThemeMode<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();
  return runtime.selection.setMode as (mode: ModesOf<T>) => void;
}

/**
 * Get a stable `setFamily` function (does not re-render on change).
 *
 * @see {@link useThemeFamily}
 */
export function useSetThemeFamily<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();
  return runtime.selection.setFamily as (family: FamiliesOf<T>) => void;
}

/**
 * Get a stable `toggleTheme` function (flips light ⇄ dark).
 *
 * @see {@link useThemeMode}
 */
export function useToggleTheme() {
  const runtime = useProviderThemeRuntime();

  return runtime.selection.toggleTheme;
}

/**
 * The primary Theme Kit hook. Returns the current theme, mode, family and
 *    the selection controls.
 * 
 *    When you pass the theme tuple element type, `setFamily` and `setMode`
 *    are constrained to the families/modes defined in your registry (the
 *    built-in set is used below so the example stands alone):
 * 
 *    ```ts
 *    import { getBuiltInThemes } from "@theme-kit/core";
 *
 *    const themes = getBuiltInThemes();
 *    const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme<typeof themes[number]>();
 *    setFamily("mint");   // autocomplete suggests your families
 *    setMode("dark");
 *    ```
 *
 * @see {@link useThemeValue}
 * @see {@link useThemeMode}
 * @see {@link useThemeFamily}
 */
export function useTheme<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();
  type F = FamiliesOf<T>;
  type M = ModesOf<T>;

  const theme = useThemeValue<T>();
  const mode = useThemeMode();
  const family = useThemeFamily();

  return useMemo(
    () => ({
      theme,
      mode,
      family,
      setMode: runtime.selection.setMode as (mode: M) => void,
      setFamily: runtime.selection.setFamily as (family: F) => void,
      toggleTheme: runtime.selection.toggleTheme,
    }),
    [runtime, theme, mode, family],
  );
}

/**
 * Subscribe to the runtime history (undo/redo/canUndo/canRedo/clear).
 *
 * @see {@link useThemeTimeTravel}
 */
export function useThemeHistory() {
  const runtime = useProviderThemeRuntime();

  const subscribe = useCallback(
    (listener: () => void) => runtime.store.subscribe(() => listener()),
    [runtime],
  );

  const canUndo = useSyncExternalStore(
    subscribe,
    () => runtime.history.canUndo(),
    () => runtime.history.canUndo(),
  );

  const canRedo = useSyncExternalStore(
    subscribe,
    () => runtime.history.canRedo(),
    () => runtime.history.canRedo(),
  );

  return useMemo(
    () => ({
      undo: () => runtime.history.undo(),
      redo: () => runtime.history.redo(),
      canUndo,
      canRedo,
      clear: () => runtime.history.clear(),
    }),
    [runtime, canUndo, canRedo],
  );
}

/**
 * Reactive access to the runtime's sunrise/sunset scheduling controller.
 *
 * Requires the runtime to be created with the `scheduled` option (see
 * `ThemeProvider` / `createThemeRuntime`). Returns `null` when the provider has
 * no schedule configured.
 *
 * ```tsx
 * const schedule = useThemeSchedule();
 * schedule?.enable();
 * schedule?.disable();
 * // schedule.enabled, schedule.active, schedule.sunrise, schedule.sunset,
 * // schedule.nextTransition ... re-render reactively.
 * ```
 *
 * @remarks
 * The returned controller is a **reactive view**: its state reads come from the
 * subscription below, not from the live controller. That is what makes it safe
 * to render during SSR — the subscription hydrates from
 * {@link EMPTY_THEME_SCHEDULE_STATE}, the same snapshot the server rendered, and
 * only adopts the live state after mount. Returning the raw controller instead
 * (which is what this hook used to do, discarding the subscription it had just
 * created) handed consumers the *live* value during the hydration render, so
 * React saw a mismatch against the server HTML and re-rendered the tree.
 *
 * @see {@link ThemeProvider}
 * @see {@link useTheme}
 */
export function useThemeSchedule(): ThemeSchedule | null {
  const runtime = useProviderThemeRuntime();
  const schedule = runtime.schedule ?? null;

  const state = useSyncExternalStore(
    useCallback(
      (listener: () => void) =>
        schedule ? schedule.subscribe(() => listener()) : () => {},
      [schedule],
    ),
    useCallback(
      () => schedule?.state ?? EMPTY_THEME_SCHEDULE_STATE,
      [schedule],
    ),
    useCallback(() => EMPTY_THEME_SCHEDULE_STATE, []),
  );

  return useMemo(
    () => (schedule ? withReactiveScheduleState(schedule, state) : null),
    [schedule, state],
  );
}

/**
 * Wraps `schedule` so every state read resolves through `state` (the reactive
 * snapshot) instead of the controller's live getters. Methods and the
 * subscription keep working: they are closures, not `this`-bound.
 */
function withReactiveScheduleState(
  schedule: ThemeSchedule,
  state: ThemeScheduleState,
): ThemeSchedule {
  const view = Object.create(schedule) as ThemeSchedule;
  const source = state as unknown as Record<string, unknown>;

  for (const key of Object.keys(EMPTY_THEME_SCHEDULE_STATE)) {
    Object.defineProperty(view, key, {
      get: () => source[key],
      enumerable: true,
      configurable: true,
    });
  }

  Object.defineProperty(view, "state", {
    get: () => state,
    enumerable: true,
    configurable: true,
  });

  return view;
}