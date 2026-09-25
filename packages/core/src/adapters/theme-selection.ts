import type { ThemeDefinition, ThemeMode } from "../model";
import {
  getThemeFamilies,
  getThemeFamily,
  getThemeMode,
  normalizeThemeFamily,
  type ThemeSelectionState,
} from "../model";
import { resolveSelectionTheme } from "../resolver";
import { createSystemThemeBinding } from "./system";
import type { ThemeStore } from "../types";
import { isThemeMode } from "../diagnostics";
import { emitInvalidModeDiagnostic } from "./mode-diagnostic";

export interface ThemeSelectionPersistenceAdapter {
  get(): ThemeSelectionState | null;
  set(value: ThemeSelectionState): void;
  remove(): void;
  subscribe(listener: (value: ThemeSelectionState | null) => void): () => void;
}

export interface ThemeSelectionBroadcastAdapter {
  post(value: ThemeSelectionState): void;
  subscribe(listener: (value: ThemeSelectionState) => void): () => void;
  destroy(): void;
}

export interface ThemeSelectionControllerOptions<T extends ThemeDefinition> {
  store: ThemeStore<T>;
  themes: readonly T[];
  initialMode?: ThemeMode;
  initialFamily?: string;
  persistence?: ThemeSelectionPersistenceAdapter | null;
  broadcast?: ThemeSelectionBroadcastAdapter | null;
  view?: Window;
  readPersistenceOnInit?: boolean;
  onSyncApply?: () => void;
}

export function createThemeSelectionController<T extends ThemeDefinition>(
  options: ThemeSelectionControllerOptions<T>,
) {
  const persistence = options.persistence ?? null;
  const broadcast = options.broadcast ?? null;
  const readPersistenceOnInit = options.readPersistenceOnInit ?? true;

  const initialTheme = options.themes[0];

  if (!initialTheme) {
    throw new Error("At least one theme must be provided.");
  }

  const saved = readPersistenceOnInit ? persistence?.get() : null;

  // A persisted family can be stale: a cookie or `localStorage` entry written
  // before the registry changed its family set. Left as-is it matches no theme,
  // so the store falls back to `themes[0]` while the selection keeps naming the
  // old family — and every readout of the selection then contradicts the theme
  // actually on screen. Normalise against the registry, the same invariant
  // `resolveSelection` enforces. The mode is always valid on its own, so a saved
  // mode still wins untouched.
  let state: ThemeSelectionState = {
    mode: saved?.mode ?? options.initialMode ?? "system",
    family: normalizeThemeFamily(
      options.themes,
      saved?.family ?? options.initialFamily,
      initialTheme,
    ),
  };

  let systemBinding: { destroy(): void } | null = null;
  let unsubscribePersistence: (() => void) | null = null;
  let unsubscribeBroadcast: (() => void) | null = null;
  let unsubscribeStore: (() => void) | null = null;
  let destroyed = false;
  let applyingFromController = false;
  const selectionListeners = new Set<(selection: ThemeSelectionState) => void>();

  function notifySelectionListeners() {
    const current = { ...state };
    for (const listener of selectionListeners) {
      listener(current);
    }
  }

  function stopSystemBinding() {
    systemBinding?.destroy();
    systemBinding = null;
  }

  function applySelection(nextState: ThemeSelectionState, sync = true) {
    // After destroy() the controller is a safe no-op: setMode/setFamily/toggle
    // must not touch persistence or the (now closed) broadcast channel.
    if (destroyed) return;
    stopSystemBinding();

    if (sync) {
      persistence?.set(nextState);
      broadcast?.post(nextState);
    }

    notifySelectionListeners();

    if (nextState.mode === "system") {
      systemBinding = createSystemThemeBinding(options.store, {
        lightTheme: resolveSelectionTheme({
          themes: options.themes,
          selection: {
            family: nextState.family,
            mode: "light",
          },
        }).theme,

        darkTheme: resolveSelectionTheme({
          themes: options.themes,
          selection: {
            family: nextState.family,
            mode: "dark",
          },
        }).theme,

        ...(options.view ? { view: options.view } : {}),
      });

      if (!systemBinding) {
        applyingFromController = true;
        options.store.set(
          resolveSelectionTheme({
            themes: options.themes,
            selection: {
              family: nextState.family,
              mode: "light",
            },
          }).theme,
          { suppressTransition: !sync },
        );
        applyingFromController = false;
      }

      return;
    }

    const resolution = resolveSelectionTheme({
      themes: options.themes,
      selection: nextState,
    });

    applyingFromController = true;
    options.store.set(resolution.theme, { suppressTransition: !sync });
    applyingFromController = false;
  }

  function setMode(nextMode: ThemeMode) {
    if (state.mode === nextMode) return;

    // Refuse a mode the runtime cannot represent. `ThemeMode` keeps this out of
    // TypeScript, but `setMode` is reachable from plain JavaScript, from a
    // framework binding forwarding a prop, and from anything that read a mode
    // out of storage — none of which the compiler can check. Accepting it would
    // put an unrunnable mode into the selection: no theme matches, so the store
    // silently falls back to the family's light theme while `getMode()` and
    // every readout keep reporting the invalid value. Ignoring the call keeps
    // the selection honest, the same way `setFamily` refuses an unregistered
    // family below.
    if (!isThemeMode(nextMode)) {
      emitInvalidModeDiagnostic(nextMode);
      return;
    }

    state = {
      ...state,
      mode: nextMode,
    };

    applySelection(state, true);
  }

  function setFamily(nextFamily: string) {
    if (state.family === nextFamily) return;

    // Refuse a family the registry does not have. Accepting it would leave the
    // selection naming a family that is not on screen — the store falls back to
    // `themes[0]` — so `data-theme-selection-family` and any
    // `data-tk-readout="family"` would contradict `data-theme-family`. Ignoring
    // the request keeps the selection honest; silently switching the visitor to
    // a *different* family than the one requested would be worse, and a caller
    // that passes an unregistered family has a bug that a no-op does not hide
    // from the readout.
    if (!getThemeFamilies(options.themes).includes(nextFamily)) return;

    state = {
      ...state,
      family: nextFamily,
    };

    applySelection(state, true);
  }

  function getAppliedMode(): "light" | "dark" {
    return getThemeMode(options.store.get()) === "dark" ? "dark" : "light";
  }

  function toggleTheme() {
    setMode(getAppliedMode() === "dark" ? "light" : "dark");
  }

  const onSyncApply = options.onSyncApply ?? null;

  function handleSyncUpdate(nextState: ThemeSelectionState) {
    applySelection(nextState, false);
    onSyncApply?.();
  }

  if (persistence) {
    unsubscribePersistence = persistence.subscribe((nextState) => {
      if (!nextState) return;

      if (nextState.mode === state.mode && nextState.family === state.family) {
        return;
      }

      state = nextState;
      handleSyncUpdate(nextState);
    });
  }

  if (broadcast) {
    unsubscribeBroadcast = broadcast.subscribe((nextState) => {
      if (nextState.mode === state.mode && nextState.family === state.family) {
        return;
      }

      state = nextState;
      handleSyncUpdate(nextState);
    });
  }

  unsubscribeStore = options.store.subscribe((theme) => {
    if (applyingFromController) return;
    const themeFamily = getThemeFamily(theme);
    const themeMode = theme.meta?.mode as ThemeMode | undefined;

    // While "system" is selected the store legitimately resolves to the
    // family's light or dark theme as the OS preference changes. That is not
    // a mode switch — keep the explicit "system" selection and its binding,
    // otherwise every OS change would silently downgrade the choice to
    // light/dark and leave the toggle stuck on a concrete mode.
    if (state.mode === "system") {
      return;
    }

    if (
      themeMode &&
      (themeFamily !== state.family || themeMode !== state.mode)
    ) {
      state = { family: themeFamily, mode: themeMode };
      persistence?.set(state);
      broadcast?.post(state);
    }
  });

  applySelection(state, false);

  return {
    getMode() {
      return state.mode;
    },

    getFamily() {
      return state.family;
    },

    getSelection() {
      return {
        ...state,
      };
    },

    setMode,

    setFamily,

    toggleTheme,

    subscribe(listener: (selection: ThemeSelectionState) => void) {
      selectionListeners.add(listener);
      return () => {
        selectionListeners.delete(listener);
      };
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;

      stopSystemBinding();

      unsubscribePersistence?.();
      unsubscribePersistence = null;

      unsubscribeBroadcast?.();
      unsubscribeBroadcast = null;

      // The controller owns the broadcast adapter it subscribed to; without
      // this the underlying BroadcastChannel is never closed and keeps the
      // Node event loop alive (and leaks the port in browsers).
      broadcast?.destroy();

      unsubscribeStore?.();
      unsubscribeStore = null;
    },
  };
}
