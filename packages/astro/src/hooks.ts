import { useSyncExternalStore, useMemo, useCallback } from "react";
import type {
  ThemeDefinition,
  ThemeTokens,
  ThemeRuntime,
  ThemeRuntimeSnapshot,
  ThemePack,
  ThemeLifecycleEventName,
  ThemeSchedule,
  ThemeScheduleSetOptions,
  ThemeScheduleState,
} from "@theme-kit/core";
import { EMPTY_THEME_SCHEDULE_STATE } from "@theme-kit/core";
import { requireGlobalRuntime } from "./shared-runtime";

export function useThemeRuntime<T extends ThemeDefinition>() {
  return requireGlobalRuntime<T>();
}

export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  return useSyncExternalStore(
    (listener) => runtime.store.subscribe(() => listener()),
    () => runtime.store.get(),
    () => runtime.store.get(),
  );
}

export function useThemeTokens<T extends ThemeDefinition>(): ThemeTokens | undefined {
  return useThemeValue<T>().tokens;
}

export function useThemeMode() {
  const runtime = useThemeRuntime();

  return useSyncExternalStore(
    (listener) => runtime.store.subscribe(() => listener()),
    () => runtime.selection.getSelection().mode,
    () => runtime.selection.getSelection().mode,
  );
}

export function useThemeFamily() {
  const runtime = useThemeRuntime();

  return useSyncExternalStore(
    (listener) => runtime.store.subscribe(() => listener()),
    () => runtime.selection.getSelection().family,
    () => runtime.selection.getSelection().family,
  );
}

export function useSetThemeMode() {
  return useThemeRuntime().selection.setMode;
}

export function useSetThemeFamily() {
  return useThemeRuntime().selection.setFamily;
}

export function useToggleTheme() {
  return useThemeRuntime().selection.toggleTheme;
}

export function useTheme<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();
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
  const runtime = useThemeRuntime();

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

  const history = useSyncExternalStore(
    subscribe,
    () => runtime.history.getHistory(),
    () => runtime.history.getHistory(),
  );

  return useMemo(
    () => ({
      undo: () => runtime.history.undo(),
      redo: () => runtime.history.redo(),
      canUndo,
      canRedo,
      clear: () => runtime.history.clear(),
      jump: (index: number) => runtime.history.jump(index),
      history,
    }),
    [runtime, canUndo, canRedo, history],
  );
}

export function useThemeBatch() {
  const runtime = useThemeRuntime();
  return useCallback((callback: () => void) => runtime.batch(callback), [runtime]);
}

export function useThemeSnapshot() {
  const runtime = useThemeRuntime();
  return useCallback((): ThemeRuntimeSnapshot => runtime.snapshot(), [runtime]);
}

export function useThemeRestore() {
  const runtime = useThemeRuntime();
  return useCallback((snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot), [runtime]);
}

export function useThemeLifecycle() {
  const runtime = useThemeRuntime();
  return useMemo(
    () => ({
      on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
    }),
    [runtime],
  );
}

export function useThemePacks() {
  const runtime = useThemeRuntime();
  return useCallback((pack: ThemePack<any>) => runtime.use(pack), [runtime]);
}

/**
 * Reactive sunrise/sunset schedule controller. Returns `null` when the
 * runtime was created without the `scheduled` option.
 *
 * ```tsx
 * const schedule = useThemeSchedule();
 * schedule?.enable();
 * schedule?.disable();
 * schedule?.set({ timeZone: "Asia/Kathmandu" });
 * ```
 */
export function useThemeSchedule(): ThemeSchedule | null {
  const runtime = useThemeRuntime();
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
