import type { ThemeDefinition } from "./model/theme";
import type { ThemeSelectionState } from "./model/selection";

/**
 * Payload shapes for each lifecycle event.
 *
 * - `beforeThemeChange` / `afterThemeChange` fire around theme transitions.
 * - `beforePersist` / `afterPersist` fire around persistence writes.
 * - `beforeApply` / `afterApply` fire around DOM/CSS application.
 */
export interface ThemeLifecycleEventMap<T extends ThemeDefinition = ThemeDefinition> {
  /** Fired before the active theme changes. */
  beforeThemeChange: { current: T; next: T };
  /** Fired after the active theme changed. */
  afterThemeChange: { theme: T };
  /** Fired before the selection is persisted. */
  beforePersist: { selection: ThemeSelectionState };
  /** Fired after the selection was persisted. */
  afterPersist: { selection: ThemeSelectionState };
  /** Fired before the theme is applied to the DOM/CSS bindings. */
  beforeApply: { theme: T };
  /** Fired after the theme was applied to the DOM/CSS bindings. */
  afterApply: { theme: T };
}

/**
 * Names of the lifecycle events exposed by {@link ThemeLifecycle}.
 */
export type ThemeLifecycleEventName = keyof ThemeLifecycleEventMap;

/**
 * Typed event emitter for runtime lifecycle events.
 *
 * Hooks are invoked synchronously in registration order.
 */
export interface ThemeLifecycle<T extends ThemeDefinition = ThemeDefinition> {
  /**
   * Registers a handler for a lifecycle event.
   *
   * @param event Event name.
   * @param handler Handler receiving the typed event payload.
   * @returns An unsubscribe function. Idempotent: calling it more than once
   *   has no effect.
   */
  on: {
    <K extends ThemeLifecycleEventName>(
      event: K,
      handler: (data: ThemeLifecycleEventMap<T>[K]) => void,
    ): () => void;
  };

  /**
   * Removes a previously registered handler.
   *
   * No-op when the handler is not registered.
   *
   * @param event Event name.
   * @param handler Handler to remove.
   */
  off: {
    <K extends ThemeLifecycleEventName>(
      event: K,
      handler: (data: ThemeLifecycleEventMap<T>[K]) => void,
    ): void;
  };

  /**
   * Synchronously emits an event to all registered handlers.
   *
   * @param event Event name.
   * @param data Typed event payload.
   */
  emit: {
    <K extends ThemeLifecycleEventName>(
      event: K,
      data: ThemeLifecycleEventMap<T>[K],
    ): void;
  };

  /**
   * Destroys the lifecycle, removing all handlers.
   *
   * Idempotent.
   */
  destroy(): void;
}

/**
 * Creates a typed lifecycle event emitter for runtime events.
 *
 * @returns A new lifecycle controller.
 *
 * @example
 * ```ts
 * const lifecycle = createThemeLifecycle();
 * const off = lifecycle.on("afterThemeChange", ({ theme }) => log(theme));
 * lifecycle.emit("afterThemeChange", { theme });
 * off();
 * ```
 * @see {@link ThemeLifecycle}
 * @see {@link ThemeLifecycleEventMap}
 */
export function createThemeLifecycle<T extends ThemeDefinition = ThemeDefinition>(): ThemeLifecycle<T> {
  const handlers = new Map<string, Set<(data: unknown) => void>>();

  function getEventSet(event: string): Set<(data: unknown) => void> {
    let set = handlers.get(event);
    if (!set) {
      set = new Set();
      handlers.set(event, set);
    }
    return set;
  }

  return {
    on(event, handler) {
      getEventSet(event as string).add(handler as (data: unknown) => void);
      return () => {
        getEventSet(event as string).delete(handler as (data: unknown) => void);
      };
    },
    off(event, handler) {
      getEventSet(event as string).delete(handler as (data: unknown) => void);
    },
    emit(event, data) {
      const set = handlers.get(event as string);
      if (!set) return;
      for (const handler of set) {
        handler(data);
      }
    },
    destroy() {
      handlers.clear();
    },
  };
}
