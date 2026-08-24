import type { ThemeDefinition } from "./model/theme";
import type { ThemeSelectionState } from "./model/selection";

export interface ThemeLifecycleEventMap<T extends ThemeDefinition = ThemeDefinition> {
  beforeThemeChange: { current: T; next: T };
  afterThemeChange: { theme: T };
  beforePersist: { selection: ThemeSelectionState };
  afterPersist: { selection: ThemeSelectionState };
  beforeApply: { theme: T };
  afterApply: { theme: T };
}

export type ThemeLifecycleEventName = keyof ThemeLifecycleEventMap;

export interface ThemeLifecycle<T extends ThemeDefinition = ThemeDefinition> {
  on: {
    <K extends ThemeLifecycleEventName>(
      event: K,
      handler: (data: ThemeLifecycleEventMap<T>[K]) => void,
    ): () => void;
  };
  off: {
    <K extends ThemeLifecycleEventName>(
      event: K,
      handler: (data: ThemeLifecycleEventMap<T>[K]) => void,
    ): void;
  };
  emit: {
    <K extends ThemeLifecycleEventName>(
      event: K,
      data: ThemeLifecycleEventMap<T>[K],
    ): void;
  };
  destroy(): void;
}

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
