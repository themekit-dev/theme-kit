import type { ThemeDefinition } from "./model/theme";
import type { ThemeStore } from "./types";
import { cloneThemeValue } from "./utils/clone";

/**
 * Options for creating a theme history controller.
 */
export interface ThemeHistoryOptions {
  /**
   * Maximum number of history entries retained (including the initial
   * entry). When the limit is exceeded, the oldest entries are dropped.
   *
   * @defaultValue 50
   */
  maxSteps?: number;
}

/**
 * A single recorded theme state.
 */
export interface HistoryEntry<T extends ThemeDefinition = ThemeDefinition> {
  /** The theme state at this point in history. */
  theme: T;
  /** Epoch-milliseconds timestamp of when the entry was recorded. */
  timestamp: number;
}

/**
 * Undo/redo history bound to a theme store.
 *
 * Every theme change (outside of undo/redo/restore operations) appends an
 * entry and truncates any redo branch. Entries are deep-cloned on read so
 * callers cannot mutate recorded states.
 */
export interface ThemeHistory<T extends ThemeDefinition = ThemeDefinition> {
  /**
   * Steps back one entry.
   *
   * No-op when there is nothing to undo. The applied theme is forced into
   * the store without creating a new history entry.
   */
  undo(): void;

  /**
   * Steps forward one entry.
   *
   * No-op when there is nothing to redo.
   */
  redo(): void;

  /**
   * Whether {@link undo} would have an effect.
   */
  canUndo(): boolean;

  /**
   * Whether {@link redo} would have an effect.
   */
  canRedo(): boolean;

  /**
   * Jumps to a history index.
   *
   * No-op when `index` is out of range or equals the current position.
   *
   * @param index Entry index from {@link getHistory}.
   */
  jump(index: number): void;

  /**
   * Returns a defensive copy of the recorded entries, oldest first.
   *
   * The current position is the entry at index `currentIndex`; entries after
   * it form the redo branch.
   */
  getHistory(): HistoryEntry<T>[];

  /**
   * Resets history to a single entry for the current theme.
   */
  clear(): void;

  /**
   * Detaches from the store and releases all entries.
   *
   * Idempotent. After destruction all methods become no-ops.
   */
  destroy(): void;
}

/**
 * Creates an undo/redo history controller for a theme store.
 *
 * @param store The store to track.
 * @param options History configuration (see {@link ThemeHistoryOptions}).
 * @returns A new theme history controller.
 *
 * @example
 * ```ts
 * const history = createThemeHistory(store, { maxSteps: 20 });
 * history.undo();
 * ```
 * @see {@link ThemeHistory}
 * @see {@link ThemeStore}
 */
export function createThemeHistory<T extends ThemeDefinition>(
  store: ThemeStore<T>,
  options?: ThemeHistoryOptions,
): ThemeHistory<T> {
  const maxSteps = options?.maxSteps ?? 50;
  const entries: HistoryEntry<T>[] = [{
    theme: cloneThemeValue(store.get()),
    timestamp: Date.now(),
  }];
  let currentIndex = 0;
  let skipNext = false;
  let cachedHistory: HistoryEntry<T>[] | null = null;

  const unsubscribe = store.subscribe((theme) => {
    if (skipNext) {
      skipNext = false;
      return;
    }

    cachedHistory = null;
    const entry: HistoryEntry<T> = {
      theme: cloneThemeValue(theme),
      timestamp: Date.now(),
    };

    entries.splice(currentIndex + 1, entries.length - currentIndex - 1);
    entries.push(entry);
    currentIndex++;

    while (entries.length > maxSteps + 1) {
      entries.shift();
      currentIndex--;
    }
  });

  function applyTheme(theme: T) {
    skipNext = true;
    store.set(cloneThemeValue(theme), { force: true });
  }

  function undo() {
    if (!canUndo()) return;
    currentIndex--;
    applyTheme(entries[currentIndex]!.theme);
  }

  function redo() {
    if (!canRedo()) return;
    currentIndex++;
    applyTheme(entries[currentIndex]!.theme);
  }

  function canUndo(): boolean {
    return currentIndex > 0;
  }

  function canRedo(): boolean {
    return currentIndex < entries.length - 1;
  }

  function jump(index: number) {
    if (index < 0 || index >= entries.length) return;
    if (index === currentIndex) return;
    currentIndex = index;
    applyTheme(entries[currentIndex]!.theme);
  }

  function getHistory(): HistoryEntry<T>[] {
    if (cachedHistory === null) {
      cachedHistory = entries.map((e) => ({ ...e, theme: cloneThemeValue(e.theme) }));
    }
    return cachedHistory;
  }

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    jump,
    getHistory,
    clear() {
      cachedHistory = null;
      entries.length = 0;
      entries.push({
        theme: cloneThemeValue(store.get()),
        timestamp: Date.now(),
      });
      currentIndex = 0;
    },
    destroy() {
      cachedHistory = null;
      unsubscribe();
      entries.length = 0;
      currentIndex = -1;
    },
  };
}
