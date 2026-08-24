import type { ThemeDefinition } from "./model/theme";
import type { ThemeStore } from "./types";

export type ThemeChangeSource =
  | "user"
  | "system"
  | "persistence"
  | "broadcast"
  | "update"
  | "init";

export interface ThemeChangeEvent<T extends ThemeDefinition = ThemeDefinition> {
  timestamp: number;
  source: ThemeChangeSource;
  previous: T | null;
  current: T;
  label?: string;
}

export interface ThemeDebugger<T extends ThemeDefinition = ThemeDefinition> {
  getHistory(): readonly ThemeChangeEvent<T>[];
  record(source: ThemeChangeSource, label?: string): void;
  clear(): void;
  destroy(): void;
}

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
