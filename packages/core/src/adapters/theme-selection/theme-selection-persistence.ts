import type { ThemeSelectionState } from "../../model";

/**
 * A contract for persisting and observing the full theme selection (mode +
 * family).
 *
 * `get` returns `null` when nothing is stored or the stored value is not a
 * valid selection. `subscribe` returns an unsubscribe function.
 */
export interface ThemeSelectionPersistenceAdapter {
  /** Read the persisted selection, or `null` when none is stored. */
  get(): ThemeSelectionState | null;

  /** Persist the given selection. */
  set(value: ThemeSelectionState): void;

  /** Remove any persisted selection. */
  remove(): void;

  /** Subscribe to selection changes from other tabs/windows. Returns an
   *  unsubscribe function. */
  subscribe(listener: (value: ThemeSelectionState | null) => void): () => void;
}
