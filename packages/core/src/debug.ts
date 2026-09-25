import type { ThemeDefinition } from "./model/theme";
import type { ThemeStore } from "./types";

/**
 * The origin of a theme change, used to attribute debug events.
 */
export type ThemeChangeSource =
  | "user"
  | "system"
  | "persistence"
  | "broadcast"
  | "update"
  | "init";

/**
 * A single recorded theme change, captured by a {@link ThemeDebugger}.
 */
export interface ThemeChangeEvent<T extends ThemeDefinition = ThemeDefinition> {
  /** Epoch milliseconds when the change was recorded. */
  timestamp: number;
  /** The origin of the change. */
  source: ThemeChangeSource;
  /** The theme in effect before the change, or `null` for the first event. */
  previous: T | null;
  /** The theme in effect after the change. */
  current: T;
  /** Optional caller-supplied label describing the change. */
  label?: string;
}

/**
 * A debugger that records theme changes on a theme store.
 */
export interface ThemeDebugger<T extends ThemeDefinition = ThemeDefinition> {
  /** The recorded theme change events, oldest first. */
  getHistory(): readonly ThemeChangeEvent<T>[];
  /** Attribute the next theme change to the given source and optional label. */
  record(source: ThemeChangeSource, label?: string): void;
  /** Clear all recorded events and reset the baseline theme. */
  clear(): void;
  /** Stop observing the store. Idempotent. */
  destroy(): void;
}

/**
 * Create a debugger that records theme changes on a theme store.
 *
 * The debugger subscribes to the store and records an event whenever the
 * current theme changes. Call {@link ThemeDebugger.record} before a change to
 * attribute it to a specific source and label; otherwise the change is
 * attributed to `"user"`. History is capped at `maxEvents` entries.
 *
 * @param store The theme store to observe.
 * @param options Optional configuration.
 * @returns A {@link ThemeDebugger} bound to the store.
 *
 * @example
 * ```ts
 * const debugger = createThemeDebugger(store, { maxEvents: 100 });
 * debugger.record("user", "switched to dark");
 * ```
 *
 * @see {@link ThemeDebugger}
 */
export function createThemeDebugger<T extends ThemeDefinition>(
  store: ThemeStore<T>,
  options?: { maxEvents?: number },
): ThemeDebugger<T> {
  const maxEvents = options?.maxEvents ?? 50;
  const history: ThemeChangeEvent<T>[] = [];

  let pendingSource: ThemeChangeSource | null = null;
  let pendingLabel: string | undefined;
  let lastTheme = store.get();

  function flush() {
    const current = store.get();
    if (current === lastTheme) return;

    const event: ThemeChangeEvent<T> = {
      timestamp: Date.now(),
      source: pendingSource ?? "user",
      previous: lastTheme,
      current,
    };

    if (pendingLabel !== undefined) {
      event.label = pendingLabel;
    }

    history.push(event);
    if (history.length > maxEvents) {
      history.shift();
    }

    lastTheme = current;
    pendingSource = null;
    pendingLabel = undefined;
  }

  const unsubscribe = store.subscribe(flush);

  return {
    getHistory() {
      return history;
    },

    record(source: ThemeChangeSource, label?: string) {
      pendingSource = source;
      pendingLabel = label;
    },

    clear() {
      history.length = 0;
      lastTheme = store.get();
      pendingSource = null;
      pendingLabel = undefined;
    },

    destroy() {
      unsubscribe();
    },
  };
}
