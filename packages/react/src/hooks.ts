"use client";

import { useMemo, useSyncExternalStore, useCallback } from "react";
import type { ThemeDefinition, ThemeTokens, ThemeRuntime, ThemeRuntimeSnapshot, ThemePack, ThemeLifecycleEventMap, ThemeSchedule } from "@theme-kit/core";

import { useThemeRuntime as useProviderThemeRuntime } from "./provider";

import { EMPTY_THEME_SCHEDULE_STATE } from "@theme-kit/core";

type ThemeLifecycleEventName = keyof ThemeLifecycleEventMap;

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

export function useThemeBatch() {
  const runtime = useProviderThemeRuntime();
  return useCallback((callback: () => void) => runtime.batch(callback), [runtime]);
}

export function useThemeSnapshot() {
  const runtime = useProviderThemeRuntime();
  return useCallback((): ThemeRuntimeSnapshot => runtime.snapshot(), [runtime]);
}

export function useThemeRestore() {
  const runtime = useProviderThemeRuntime();
  return useCallback((snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot), [runtime]);
}

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

export function useThemePacks() {
  const runtime = useProviderThemeRuntime();
  return useCallback((pack: ThemePack<any>) => runtime.use(pack), [runtime]);
}

export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();

  return useThemeSelector(() => runtime.store.get());
}

export function useThemeTokens<T extends ThemeDefinition>():
  ThemeTokens | undefined {
  return useThemeValue<T>().tokens;
}

export function useThemeMode() {
  const runtime = useProviderThemeRuntime();

  return useThemeSelector(() => runtime.selection.getSelection().mode);
}

export function useThemeFamily() {
  const runtime = useProviderThemeRuntime();

  return useThemeSelector(() => runtime.selection.getSelection().family);
}

export function useSetThemeMode() {
  const runtime = useProviderThemeRuntime();

  return runtime.selection.setMode;
}

export function useSetThemeFamily() {
  const runtime = useProviderThemeRuntime();

  return runtime.selection.setFamily;
}

export function useToggleTheme() {
  const runtime = useProviderThemeRuntime();

  return runtime.selection.toggleTheme;
}

export function useTheme<T extends ThemeDefinition>() {
  const runtime = useProviderThemeRuntime<T>();

  const theme = useThemeValue<T>();
  const mode = useThemeMode();
  const family = useThemeFamily();

  return useMemo(
    () => ({
      theme,
      mode,
      family,
      setMode: runtime.selection.setMode,
      setFamily: runtime.selection.setFamily,
      toggleTheme: runtime.selection.toggleTheme,
    }),
    [runtime, theme, mode, family],
  );
}

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