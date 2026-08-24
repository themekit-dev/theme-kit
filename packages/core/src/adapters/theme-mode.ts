import type { ThemeDefinition, ThemeMode } from "../model";
import { createSystemThemeBinding } from "./system";
import type { ThemeBroadcastAdapter } from "./broadcast";
import type { ThemePersistenceAdapter } from "./persistence";
import type { ThemeStore } from "../types";

export interface ThemeModeControllerOptions<T extends ThemeDefinition> {
  store: ThemeStore<T>;
  lightTheme: T;
  darkTheme: T;
  initialMode?: ThemeMode;
  view?: Window;
  persistence?: ThemePersistenceAdapter | null;
  broadcast?: ThemeBroadcastAdapter | null;
  readPersistenceOnInit?: boolean;
}

export function createThemeModeController<T extends ThemeDefinition>(
  options: ThemeModeControllerOptions<T>,
) {
  const persistence = options.persistence ?? null;
  const broadcast = options.broadcast ?? null;
  const readPersistenceOnInit = options.readPersistenceOnInit ?? true;

  let mode: ThemeMode = readPersistenceOnInit
    ? (persistence?.get() ?? options.initialMode ?? "system")
    : (options.initialMode ?? "system");

  let systemBinding: { destroy(): void } | null = null;
  let unsubscribePersistence: (() => void) | null = null;
  let unsubscribeBroadcast: (() => void) | null = null;

  function stopSystemBinding() {
    systemBinding?.destroy();
    systemBinding = null;
  }

  function applyResolvedTheme(nextMode: ThemeMode) {
    stopSystemBinding();

    if (nextMode === "system") {
      systemBinding = createSystemThemeBinding(options.store, {
        lightTheme: options.lightTheme,
        darkTheme: options.darkTheme,
        ...(options.view ? { view: options.view } : {}),
      });

      if (!systemBinding) {
        options.store.set(options.lightTheme);
      }

      return;
    }

    options.store.set(
      nextMode === "dark" ? options.darkTheme : options.lightTheme,
    );
  }

  function setMode(nextMode: ThemeMode) {
    if (mode === nextMode) return;

    mode = nextMode;

    persistence?.set(nextMode);
    broadcast?.post(nextMode);

    applyResolvedTheme(nextMode);
  }

  if (persistence) {
    unsubscribePersistence = persistence.subscribe((nextMode) => {
      if (!nextMode || nextMode === mode) return;
      mode = nextMode;
      applyResolvedTheme(nextMode);
    });
  }

  if (broadcast) {
    unsubscribeBroadcast = broadcast.subscribe((nextMode) => {
      if (nextMode === mode) return;
      mode = nextMode;
      applyResolvedTheme(nextMode);
    });
  }

  applyResolvedTheme(mode);

  return {
    getMode() {
      return mode;
    },
    setMode,
    destroy() {
      stopSystemBinding();
      unsubscribePersistence?.();
      unsubscribePersistence = null;
      unsubscribeBroadcast?.();
      unsubscribeBroadcast = null;
    },
  };
}
