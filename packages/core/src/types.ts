import type { ThemeDefinition } from "./model/theme";

/**
 * The theme store: the runtime's single source of truth for the active theme.
 *
 * The store is deliberately framework-free. Framework integrations wrap it
 * with reactive bindings; the runtime wires persistence, transitions, and
 * adapters around it.
 */
export interface ThemeStore<T extends ThemeDefinition = ThemeDefinition> {
  /**
   * Returns the currently active theme.
   */
  get(): T;

  /**
   * Sets the active theme.
   *
   * @param theme Theme definition to activate.
   * @param options `force` bypasses reference equality checks;
   *   `suppressTransition` disables the configured transition for this update.
   */
  set(
    theme: T,
    options?: { force?: boolean; suppressTransition?: boolean },
  ): void;

  /**
   * Subscribes to theme changes.
   *
   * @param listener Called after the active theme changes.
   * @returns An unsubscribe function. Idempotent: calling it more than once
   *   has no effect.
   */
  subscribe(
    listener: (theme: T, options?: { suppressTransition?: boolean }) => void,
  ): () => void;

  /**
   * Runs a callback with all intermediate `set` calls coalesced.
   *
   * Listeners are notified once, after the callback completes, with the final
   * theme.
   *
   * @param callback Work that performs one or more `set` calls.
   */
  batch(callback: () => void): void;

  /**
   * Destroys the store, detaching all listeners.
   *
   * Idempotent. After destruction, mutations become no-ops unless otherwise
   * documented.
   */
  destroy(): void;
}

/**
 * Options for creating a theme store.
 */
export interface ThemeStoreOptions<
  T extends ThemeDefinition = ThemeDefinition,
> {
  /**
   * The theme the store starts with.
   */
  initialTheme: T;
}
