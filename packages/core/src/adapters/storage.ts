import type { ThemeName } from "../model";

/**
 * A minimal key-value contract for persisting the selected theme name.
 *
 * Implementations back this with any durable store (e.g. `localStorage`).
 * `get` returns `null` when nothing has been stored yet or the stored value
 * is not a valid theme name.
 */
export interface StorageAdapter {
  /** Read the persisted theme name, or `null` when none is stored. */
  get(): ThemeName | null;
  /** Persist the given theme name. */
  set(theme: ThemeName): void;
  /** Remove any persisted theme name. */
  remove(): void;
}
