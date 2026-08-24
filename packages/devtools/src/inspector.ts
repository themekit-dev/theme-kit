import type { ThemeRuntime, ThemeDefinition, ThemeSelectionState, HistoryEntry } from "@theme-kit/core";
import type { DevToolsInspector, DevToolsState, DevToolsEntry, DevToolsPerformanceEntry, DevToolsInspectorOptions } from "./types";

export function createDevToolsInspector<T extends ThemeDefinition>(
  options?: DevToolsInspectorOptions,
): DevToolsInspector<T> {
  const maxEntries = options?.maxEntries ?? 200;
  const maxPerfEntries = options?.maxPerfEntries ?? 100;

  const entries: DevToolsEntry[] = [];
  const performance: DevToolsPerformanceEntry[] = [];

  let _runtime: ThemeRuntime<T> | null = null;
  let _themeToCSS: ((theme: T) => Record<string, string>) | null = null;

  function addEntry(type: DevToolsEntry["type"], label: string, data: Record<string, unknown>) {
    entries.push({ type, timestamp: Date.now(), label, data });
    if (entries.length > maxEntries) entries.shift();
  }

  function addPerfEntry(type: string, duration: number) {
    performance.push({ duration, type, timestamp: Date.now() });
    if (performance.length > maxPerfEntries) performance.shift();
  }

  function getCSSVariables(): Record<string, string> {
    if (!_runtime || !_themeToCSS) return {};
    const theme = _runtime.store.get();
    return _themeToCSS(theme);
  }

  function getState(): DevToolsState<T> {
    if (!_runtime) {
      return {
        currentTheme: null as unknown as T,
        selection: {} as unknown as ThemeSelectionState,
        history: [],
        entries: [],
        performance: [],
        cssVariables: {},
      };
    }
    return {
      currentTheme: _runtime.store.get(),
      selection: _runtime.selection.getSelection(),
      history: _runtime.history.getHistory().map((value: HistoryEntry<T>, index: number) => ({
        index,
        point: { theme: value.theme, selection: _runtime!.selection.getSelection() },
      })),
      entries: [...entries],
      performance: [...performance],
      cssVariables: getCSSVariables(),
    };
  }

  function getEntries(): DevToolsEntry[] {
    return [...entries];
  }

  function getPerformance(): DevToolsPerformanceEntry[] {
    return [...performance];
  }

  function jump(index: number) {
    if (!_runtime) return;
    _runtime.history.jump(index);
    addEntry("restore", `Jumped to history index ${index}`, { index });
  }

  function clearEntries() {
    entries.length = 0;
  }

  function clearPerformance() {
    performance.length = 0;
  }

  function exportState(): string {
    return JSON.stringify(getState(), null, 2);
  }

  function exportCSS(): Record<string, string> {
    return getCSSVariables();
  }

  function bindRuntime(runtime: ThemeRuntime<T>) {
    _runtime = runtime;
  }

  function bindThemeToCSS(fn: (theme: T) => Record<string, string>) {
    _themeToCSS = fn;
  }

  function destroy() {
    _runtime = null;
    _themeToCSS = null;
    entries.length = 0;
    performance.length = 0;
  }

  const inspector: DevToolsInspector<T> & {
    _bindRuntime: (r: ThemeRuntime<T>) => void;
    _bindThemeToCSS: (fn: (theme: T) => Record<string, string>) => void;
    _addEntry: (type: DevToolsEntry["type"], label: string, data: Record<string, unknown>) => void;
    _addPerfEntry: (type: string, duration: number) => void;
  } = {
    getState,
    getEntries,
    getPerformance,
    getCSSVariables,
    jump,
    clearEntries,
    clearPerformance,
    exportState,
    exportCSS,
    destroy,
    _bindRuntime: bindRuntime,
    _bindThemeToCSS: bindThemeToCSS,
    _addEntry: addEntry,
    _addPerfEntry: addPerfEntry,
  };

  return inspector as DevToolsInspector<T>;
}
