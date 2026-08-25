import type { ThemeDefinition, ThemeMode } from "../model";
import { getThemeFamily, getThemeMode, type ThemeSelectionState } from "../model";
import { resolveSelectionTheme } from "../resolver";
import { createSystemThemeBinding } from "./system";
import type { ThemeStore } from "../types";

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

  let state: ThemeSelectionState = saved ?? {
    mode: options.initialMode ?? "system",
    family: options.initialFamily ?? getThemeFamily(initialTheme),
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

    state = {
      ...state,
      mode: nextMode,
    };

    applySelection(state, true);
  }

  function setFamily(nextFamily: string) {
    if (state.family === nextFamily) return;

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
