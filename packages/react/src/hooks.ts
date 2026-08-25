"use client";

import { useMemo, useSyncExternalStore, useCallback } from "react";
import type { ThemeDefinition, ThemeFamilies, ThemeModes, ThemeTokens, ThemeRuntime, ThemeRuntimeSnapshot, ThemePack, ThemeLifecycleEventMap, ThemeSchedule } from "@theme-kit/core";

import { useThemeRuntime as useProviderThemeRuntime } from "./provider";

import { EMPTY_THEME_SCHEDULE_STATE } from "@theme-kit/core";

type ThemeLifecycleEventName = keyof ThemeLifecycleEventMap;

// Derive the literal family/mode unions from the theme definitions (T).
// `"system"` is always a valid mode (follow the OS).
type FamiliesOf<T extends ThemeDefinition> = ThemeFamilies<readonly T[]>;
type ModesOf<T extends ThemeDefinition> = ThemeModes<readonly T[]> | "system";

function useThemeSelector<T>(getSnapshot: () => T): T {
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

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Get a batch function that defers all selection changes and DOM writes
 *    to a single flush.
 */
export function useThemeBatch() {
  const runtime = useProviderThemeRuntime();
  return useCallback((callback: () => void) => runtime.batch(callback), [runtime]);
}

/**
 * Get a snapshot function that captures the full runtime state.
 */
export function useThemeSnapshot() {
  const runtime = useProviderThemeRuntime();
  return useCallback((): ThemeRuntimeSnapshot => runtime.snapshot(), [runtime]);
}

/**
 * Get a restore function that re-applies a previously captured snapshot.
 */
export function useThemeRestore() {
  const runtime = useProviderThemeRuntime();
  return useCallback((snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot), [runtime]);
}

/**
 * Subscribe to the history timeline and get a `jump(index)` function.
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
 */
export function useThemeLifecycle() {
  const runtime = useProviderThemeRuntime();

  const subscribe = useCallback(
    (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => {
      const unsubscribe = runtime.lifecycle.on(event, listener);
      return unsubscribe;
    },
    [runtime],
  );

  return { on: subscribe };
}

/**
 * Get a function that applies a theme pack to the runtime.
 */
export function useThemePacks() {
  const runtime = useProviderThemeRuntime();
  return useCallback((pack: ThemePack<any>) => runtime.use(pack), [runtime]);
}

/**
 * Subscribe to the current theme definition (re-renders on change).
 */
export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();

  return useThemeSelector(() => runtime.store.get());
}

/**
 * Subscribe to the current theme's token groups.
 */
export function useThemeTokens<T extends ThemeDefinition>():
  ThemeTokens | undefined {
  return useThemeValue<T>().tokens;
}

/**
 * Subscribe to the current selection mode ("light" | "dark" | "system").
 */
export function useThemeMode() {
  const runtime = useProviderThemeRuntime();

  return useThemeSelector(() => runtime.selection.getSelection().mode);
}

/**
 * Subscribe to the current selection family.
 */
export function useThemeFamily() {
  const runtime = useProviderThemeRuntime();

  return useThemeSelector(() => runtime.selection.getSelection().family);
}

/**
 * Get a stable `setMode` function (does not re-render on change).
 */
export function useSetThemeMode<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();
  return runtime.selection.setMode as (mode: ModesOf<T>) => void;
}

/**
 * Get a stable `setFamily` function (does not re-render on change).
 */
export function useSetThemeFamily<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();
  return runtime.selection.setFamily as (family: FamiliesOf<T>) => void;
}

/**
 * Get a stable `toggleTheme` function (flips light ⇄ dark).
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
 *    are constrained to the families/modes defined in your themes:
 * 
 *    ```ts
 *    const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme<typeof themes[number]>();
 *    setFamily("mint");   // autocomplete suggests your families
 *    setMode("dark");
 *    ```
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
 */
export function useThemeSchedule(): ThemeSchedule | null {
  const runtime = useProviderThemeRuntime();
  const schedule = runtime.schedule ?? null;

  useSyncExternalStore(
    useCallback(
      (listener: () => void) =>
        schedule ? schedule.subscribe(() => listener()) : () => {},
      [schedule],
    ),
    useCallback(
      () => schedule?.state ?? EMPTY_THEME_SCHEDULE_STATE,
      [schedule],
    ),
    // The schedule state is resolved per-visitor on the client (timezone
    // auto-detection), so it can differ between the server render and the
    // hydrated client. Hydrate with the stable empty snapshot and let the
    // real state replace it immediately after mount — this keeps SSR HTML
    // deterministic and avoids a hydration mismatch.
    useCallback(() => EMPTY_THEME_SCHEDULE_STATE, []),
  );

  return schedule;
}