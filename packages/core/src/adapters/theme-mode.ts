import type { ThemeDefinition, ThemeMode } from "../model";
import { isThemeMode } from "../diagnostics";
import { createSystemThemeBinding } from "./system";
import { emitInvalidModeDiagnostic } from "./mode-diagnostic";
import type { ThemeBroadcastAdapter } from "./broadcast";
import type { ThemePersistenceAdapter } from "./persistence";
import type { ThemeStore } from "../types";

/**
 * Options for {@link createThemeModeController}.
 *
 * The controller resolves a theme mode (`light` | `dark` | `system`) into a
 * concrete theme applied to the store, optionally persisting the mode and
 * broadcasting it across tabs/windows.
 */
export interface ThemeModeControllerOptions<T extends ThemeDefinition> {
  /** The store the resolved theme is applied to. */
  store: ThemeStore<T>;
  /** Theme applied when the resolved mode is light. */
  lightTheme: T;
  /** Theme applied when the resolved mode is dark. */
  darkTheme: T;
  /** Initial mode used when persistence is not read (or has no value).
   *  @defaultValue `"system"` */
  initialMode?: ThemeMode;
  /** The `Window` used for the system binding. Defaults to the global
   *  `window` when present. */
  view?: Window;
  /** Adapter used to persist and observe the mode. When `null`, persistence
   *  is disabled. @defaultValue `null` */
  persistence?: ThemePersistenceAdapter | null;
  /** Adapter used to broadcast and observe the mode across tabs/windows.
   *  When `null`, broadcasting is disabled. @defaultValue `null` */
  broadcast?: ThemeBroadcastAdapter | null;
  /** Whether to read the persisted mode on creation.
   *  @defaultValue `true` */
  readPersistenceOnInit?: boolean;
}

/**
 * Create a theme-mode controller that resolves a mode into a concrete theme
 * and keeps it applied to the store.
 *
 * In `system` mode it follows the OS color-scheme preference live via a
 * system binding; in `light`/`dark` mode it applies the corresponding theme
 * directly. `setMode` refuses a value that is not `"light"`, `"dark"` or
 * `"system"`: the call is ignored — nothing is applied, persisted or
 * broadcast — and a `TK_MODE_INVALID` diagnostic is emitted, so `getMode()`
 * never reports a mode the runtime cannot render. Mode changes are persisted
 * and broadcast when the corresponding adapters are provided. The returned
 * controller is safe to destroy: after `destroy()` its methods become no-ops
 * and all subscriptions are released.
 *
 * @param options The controller configuration.
 * @returns A controller exposing `getMode`, `setMode` and `destroy`.
 *
 * @example
 * ```ts
 * const controller = createThemeModeController({
 *   store,
 *   lightTheme,
 *   darkTheme,
 *   persistence: createThemePersistence(),
 * });
 * controller.setMode("dark");
 * ```
 *
 * @see {@link ThemeSelectionState}
 * @see {@link createThemePersistence}
 */
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

    // Refuse a mode the runtime cannot represent, for the same reason the
    // selection controller does. `ThemeMode` keeps this out of TypeScript, but
    // `setMode` is reachable from plain JavaScript, from a framework binding
    // forwarding a prop, and from anything that read a mode out of storage —
    // none of which the compiler can check. Accepting it would persist and
    // broadcast a value nothing can render, while `applyResolvedTheme` fell
    // through to the light theme: `getMode()` would report a mode that does not
    // match the theme on screen, and every other tab would adopt it too.
    if (!isThemeMode(nextMode)) {
      emitInvalidModeDiagnostic(nextMode);
      return;
    }

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
