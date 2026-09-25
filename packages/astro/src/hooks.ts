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

/**
 * Subscribe to a derived value that can change from **either** the theme store
 * or the selection controller, and re-render when either does.
 *
 * Subscribing to the store alone is not enough. A selection change that resolves
 * to the same theme — `setMode("light")` while the OS preference is already
 * light, or `setMode("system")` while the resolved theme is unchanged — does not
 * emit a store change, so a store-only subscription never re-renders and the UI
 * keeps showing the previous mode. The symptom is a readout that disagrees with
 * the SSR HTML until something else happens to touch the store, which reads as
 * the page "fluctuating" on reload.
 *
 * `@theme-kit/react` already does this (`useThemeSelector`); the Astro hooks did
 * not, which is why the same components behaved differently across the two
 * integrations.
 */
function useThemeSelector<T>(getSnapshot: () => T, getServerSnapshot: () => T): T {
  const runtime = requireGlobalRuntime();

  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubStore = runtime.store.subscribe(() => listener());
      const unsubSelection = runtime.selection.subscribe
        ? runtime.selection.subscribe(() => listener())
        : () => {};
      return () => {
        unsubStore();
        unsubSelection();
      };
    },
    [runtime],
  );

  // `getServerSnapshot` is NOT `getSnapshot`. React uses the server snapshot
  // for the hydration render and compares it against the markup the server
  // produced; passing the live client state there makes React see a mismatch
  // on every load where the two legitimately differ — which is always, for a
  // prerendered page (the server has no cookies to resolve from) and for
  // `"system"` mode anywhere (the server cannot know `prefers-color-scheme`).
  // The mismatch is reported as React error #418 and makes React discard the
  // server HTML and re-render the whole island: the flash this package exists
  // to prevent. `runtime.initial` is the state a server render produces.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns the app-wide theme runtime installed by `ThemeProviderClient`.
 * Client-only: must be called from a component rendered inside the island.
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns The active theme runtime.
 *
 * @throws {Error} When no runtime has been initialized (no `ThemeProviderClient` mounted).
 *
 * @see {@link ThemeProviderClient}
 * @see {@link useThemeValue}
 */
export function useThemeRuntime<T extends ThemeDefinition>() {
  return requireGlobalRuntime<T>();
}

/**
 * Returns the current resolved theme value (the active theme definition).
 * Client-only; re-renders when the theme changes.
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns The current theme value.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useThemeTokens}
 */
export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  return useSyncExternalStore(
    (listener) => runtime.store.subscribe(() => listener()),
    () => runtime.store.get(),
    // The theme a server render produced (see `useThemeSelector`).
    () => runtime.initial.theme,
  );
}

/**
 * Returns the token group of the current resolved theme. Client-only.
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns The current theme's tokens, or `undefined` when the theme has none.
 *
 * @see {@link useThemeValue}
 */
export function useThemeTokens<T extends ThemeDefinition>(): ThemeTokens | undefined {
  return useThemeValue<T>().tokens;
}

/**
 * Returns the current theme mode (`"light"`, `"dark"` or `"system"`).
 * Client-only; re-renders when the mode changes.
 *
 * @returns The current theme mode.
 *
 * @see {@link useSetThemeMode}
 */
export function useThemeMode() {
  const runtime = useThemeRuntime();

  // Reads from the selection controller, so it must subscribe to that too —
  // see `useThemeSelector`.
  return useThemeSelector(
    () => runtime.selection.getSelection().mode,
    () => runtime.initial.selection.mode,
  );
}

/**
 * Returns the current theme family. Client-only; re-renders when the family
 * changes.
 *
 * @returns The current theme family, or `undefined` when none is selected.
 *
 * @see {@link useSetThemeFamily}
 */
export function useThemeFamily() {
  const runtime = useThemeRuntime();

  // Same as `useThemeMode`: the family lives on the selection controller.
  return useThemeSelector(
    () => runtime.selection.getSelection().family,
    () => runtime.initial.selection.family,
  );
}

/**
 * Returns a stable setter that changes the theme mode. Client-only.
 *
 * @returns A function that sets the theme mode.
 *
 * @see {@link useThemeMode}
 */
export function useSetThemeMode() {
  return useThemeRuntime().selection.setMode;
}

/**
 * Returns a stable setter that changes the theme family. Client-only.
 *
 * @returns A function that sets the theme family.
 *
 * @see {@link useThemeFamily}
 */
export function useSetThemeFamily() {
  return useThemeRuntime().selection.setFamily;
}

/**
 * Returns a stable function that toggles the theme between light and dark.
 * Client-only.
 *
 * @returns A function that toggles the theme mode.
 *
 * @see {@link useThemeMode}
 */
export function useToggleTheme() {
  return useThemeRuntime().selection.toggleTheme;
}

/**
 * Returns the current theme, mode, family, and stable setters. Client-only;
 * re-renders when any of the reactive values change.
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns An object with `theme`, `mode`, `family`, `setMode`, `setFamily`
 * and `toggleTheme`.
 *
 * @example
 * ```tsx
 * const { theme, mode, setMode, toggleTheme } = useTheme();
 * ```
 *
 * @see {@link useThemeRuntime}
 * @see {@link useThemeValue}
 * @see {@link useThemeMode}
 * @see {@link useThemeFamily}
 */
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

/**
 * Returns the theme history controller (undo/redo/jump). Client-only;
 * re-renders when the history changes.
 *
 * @returns An object with `undo`, `redo`, `canUndo`, `canRedo`, `clear`,
 * `jump` and `history`.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useThemeBatch}
 */
export function useThemeHistory() {
  const runtime = useThemeRuntime();

  const subscribe = useCallback(
    (listener: () => void) => runtime.store.subscribe(() => listener()),
    [runtime],
  );

  const canUndo = useSyncExternalStore(
    subscribe,
    () => runtime.history.canUndo(),
    // The history a server render produced — see `useThemeSelector`. Stable by
    // construction, which `runtime.history.getHistory()` is not (it returns a
    // fresh copy on every call).
    () => runtime.initial.canUndo,
  );

  const canRedo = useSyncExternalStore(
    subscribe,
    () => runtime.history.canRedo(),
    () => runtime.initial.canRedo,
  );

  const history = useSyncExternalStore(
    subscribe,
    () => runtime.history.getHistory(),
    () => runtime.initial.history,
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

/**
 * Returns a stable function that batches multiple runtime mutations into a
 * single update. Client-only.
 *
 * @returns A function that runs a callback inside a runtime batch.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useTheme}
 */
export function useThemeBatch() {
  const runtime = useThemeRuntime();
  return useCallback((callback: () => void) => runtime.batch(callback), [runtime]);
}

/**
 * Returns a stable function that captures a snapshot of the runtime state.
 * Client-only.
 *
 * @returns A function returning a {@link ThemeRuntimeSnapshot}.
 *
 * @see {@link useThemeRestore}
 */
export function useThemeSnapshot() {
  const runtime = useThemeRuntime();
  return useCallback((): ThemeRuntimeSnapshot => runtime.snapshot(), [runtime]);
}

/**
 * Returns a stable function that restores a previously captured runtime
 * snapshot. Client-only.
 *
 * @returns A function that restores a {@link ThemeRuntimeSnapshot}.
 *
 * @see {@link useThemeSnapshot}
 */
export function useThemeRestore() {
  const runtime = useThemeRuntime();
  return useCallback((snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot), [runtime]);
}

/**
 * Returns the runtime lifecycle controller, allowing subscription to theme
 * lifecycle events. Client-only.
 *
 * @returns An object with an `on` method to subscribe to lifecycle events.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useTheme}
 */
export function useThemeLifecycle() {
  const runtime = useThemeRuntime();
  return useMemo(
    () => ({
      on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
    }),
    [runtime],
  );
}

/**
 * Returns a stable function that installs a theme pack onto the runtime.
 * Client-only.
 *
 * @returns A function that applies a {@link ThemePack}.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useTheme}
 */
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
 *
 * @remarks
 * The returned controller is a **reactive view**: its state reads
 * (`state`, `enabled`, `active`, `status`, `sunrise`, `sunset`, …) come from
 * the subscription below, not from the live controller. That distinction is
 * what makes it safe to render during SSR.
 *
 * The schedule is resolved per visitor (timezone auto-detection) and recomputes
 * on a timer, so sunrise/sunset differ between the server render and hydration.
 * The subscription hydrates from {@link EMPTY_THEME_SCHEDULE_STATE} — the same
 * snapshot the server rendered — and only adopts the live state after mount, so
 * hydration matches. Returning the raw controller instead (which is what this
 * hook used to do, discarding the subscription it had just created) handed
 * consumers the *live* value during the hydration render: React saw a mismatch
 * against the server HTML and re-rendered the whole island.
 *
 * Consumers must therefore read state through this return value — never through
 * a controller they obtained some other way, which has no server snapshot.
 *
 * @see {@link useThemeRuntime}
 */
export function useThemeSchedule(): ThemeSchedule | null {
  const runtime = useThemeRuntime();
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
