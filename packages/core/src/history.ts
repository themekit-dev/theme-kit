import type { ThemeDefinition } from "./model/theme";
import type { ThemeStore } from "./types";

export interface ThemeHistoryOptions {
  maxSteps?: number;
}

export interface HistoryEntry<T extends ThemeDefinition = ThemeDefinition> {
  theme: T;
  timestamp: number;
}

export interface ThemeHistory<T extends ThemeDefinition = ThemeDefinition> {
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  jump(index: number): void;
  getHistory(): HistoryEntry<T>[];
  clear(): void;
  destroy(): void;
}

export function createThemeHistory<T extends ThemeDefinition>(
  store: ThemeStore<T>,
  options?: ThemeHistoryOptions,
): ThemeHistory<T> {
  const maxSteps = options?.maxSteps ?? 50;
  const entries: HistoryEntry<T>[] = [{
    theme: structuredClone(store.get()),
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
      theme: structuredClone(theme),
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
    store.set(structuredClone(theme), { force: true });
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
      cachedHistory = entries.map((e) => ({ ...e, theme: structuredClone(e.theme) }));
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
        theme: structuredClone(store.get()),
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
