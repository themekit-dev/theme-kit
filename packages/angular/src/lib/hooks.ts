import {
  inject,
  DestroyRef,
  type Signal,
  signal,
} from "@angular/core";
import type {
  ThemeRuntime,
  ThemeDefinition,
  ThemeMode,
  ThemeRuntimeSnapshot,
  ThemePack,
  HistoryEntry,
  ThemeLifecycleEventName,
  ThemeScheduleState,
  ThemeScheduleSetOptions,
} from "@theme-kit/core";
import { EMPTY_THEME_SCHEDULE_STATE } from "@theme-kit/core";
import { THEME_KIT_RUNTIME, THEME_KIT_SCOPED_RUNTIME } from "./tokens";

function resolveRuntime<T extends ThemeDefinition>(): ThemeRuntime<T> {
  const runtime =
    inject(THEME_KIT_SCOPED_RUNTIME, { optional: true }) ??
    inject(THEME_KIT_RUNTIME);
  if (!runtime) {
    throw new Error(
      "No ThemeKit runtime found. Ensure provideThemeKit() is included in your providers.",
    );
  }
  return runtime as ThemeRuntime<T>;
}

export function injectThemeRuntime<T extends ThemeDefinition = ThemeDefinition>(): ThemeRuntime<T> {
  return resolveRuntime<T>();
}

export interface ThemeState<T extends ThemeDefinition = ThemeDefinition> {
  theme: T;
  mode: ThemeMode;
  family: string;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  setFamily: (family: string) => void;
  toggleTheme: () => void;
}

export function injectTheme<T extends ThemeDefinition = ThemeDefinition>(): Signal<ThemeState<T>> {
  const runtime = resolveRuntime<T>();
  const destroyRef = inject(DestroyRef);

  const state = signal<ThemeState<T>>({
    theme: runtime.store.get() as T,
    mode: runtime.selection.getMode(),
    family: runtime.selection.getFamily(),
    resolvedMode:
      runtime.store.get().meta?.mode === "dark" ? "dark" : "light",
    setMode: (m: ThemeMode) => runtime.selection.setMode(m),
    setFamily: (f: string) => runtime.selection.setFamily(f),
    toggleTheme: () => runtime.selection.toggleTheme(),
  });

  const unsub = runtime.store.subscribe((t) => {
    state.set({
      theme: t as T,
      mode: runtime.selection.getMode(),
      family: runtime.selection.getFamily(),
      resolvedMode: t.meta?.mode === "dark" ? "dark" : "light",
      setMode: state().setMode,
      setFamily: state().setFamily,
      toggleTheme: state().toggleTheme,
    });
  });

  destroyRef.onDestroy(unsub);

  return state.asReadonly();
}

export interface ThemeHistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export function injectThemeHistory<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = resolveRuntime<T>();
  const destroyRef = inject(DestroyRef);

  const state = signal<ThemeHistoryState>({
    canUndo: runtime.history.canUndo(),
    canRedo: runtime.history.canRedo(),
  });

  const unsub = runtime.store.subscribe(() => {
    state.set({
      canUndo: runtime.history.canUndo(),
      canRedo: runtime.history.canRedo(),
    });
  });

  destroyRef.onDestroy(unsub);

  return {
    history: state.asReadonly(),
    undo: () => runtime.history.undo(),
    redo: () => runtime.history.redo(),
    clear: () => runtime.history.clear(),
  };
}

export function injectThemeBatch() {
  const runtime = resolveRuntime();
  return (callback: () => void) => runtime.batch(callback);
}

export function injectThemeSnapshot() {
  const runtime = resolveRuntime();
  return () => runtime.snapshot() as ThemeRuntimeSnapshot;
}

export function injectThemeRestore() {
  const runtime = resolveRuntime();
  return (snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot);
}

export function injectThemeTimeTravel<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = resolveRuntime<T>();
  const destroyRef = inject(DestroyRef);

  const historySignal = signal<readonly HistoryEntry<T>[]>(runtime.history.getHistory());

  const unsub = runtime.store.subscribe(() => {
    historySignal.set(runtime.history.getHistory());
  });
  destroyRef.onDestroy(unsub);

  return {
    history: historySignal.asReadonly(),
    jump: (index: number) => runtime.history.jump(index),
  };
}

export function injectThemeLifecycle() {
  const runtime = resolveRuntime();
  return {
    on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
  };
}

export function injectThemePacks() {
  const runtime = resolveRuntime();
  return (pack: ThemePack<any>) => runtime.use(pack);
}

export interface ThemeScheduleController {
  /** Reactive `Signal` of the schedule state: `enabled`, `active`, `status`,
   *  `sunrise`, `sunset`, `nextTransition`, `nextActivation`,
   *  `nextDeactivation`. */
  state: Signal<ThemeScheduleState>;
  enable: () => void;
  disable: () => void;
  set: (options: ThemeScheduleSetOptions) => void;
}

/**
 * Reactive access to the runtime's sunrise/sunset scheduling controller.
 * Returns `null` when the runtime was provided without the `scheduled` option.
 *
 * ```ts
 * const schedule = injectThemeSchedule();
 * schedule?.enable();
 * schedule?.disable();
 * schedule?.state().nextTransition;
 * ```
 */
export function injectThemeSchedule<T extends ThemeDefinition = ThemeDefinition>(): ThemeScheduleController | null {
  const runtime = resolveRuntime<T>();
  const schedule = runtime.schedule ?? null;
  const destroyRef = inject(DestroyRef);

  const state = signal<ThemeScheduleState>(
    schedule?.state ?? EMPTY_THEME_SCHEDULE_STATE,
  );

  if (schedule) {
    const unsub = schedule.subscribe((next) => state.set(next));
    destroyRef.onDestroy(unsub);
  }

  if (!schedule) return null;

  return {
    state: state.asReadonly(),
    enable: () => schedule.enable(),
    disable: () => schedule.disable(),
    set: (options: ThemeScheduleSetOptions) => schedule.set(options),
  };
}
