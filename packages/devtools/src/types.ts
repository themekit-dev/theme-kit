import type { ThemeDefinition, ThemeTokens, ThemeSelectionState, HistoryEntry } from "@theme-kit/core";

export interface DevToolsEntry {
  type: "theme-change" | "mode-change" | "family-change" | "persist" | "restore" | "batch";
  timestamp: number;
  label: string;
  data: Record<string, unknown>;
}

export interface DevToolsPerformanceEntry {
  duration: number;
  type: string;
  timestamp: number;
}

export interface DevToolsInspectorOptions {
  maxEntries?: number;
  maxPerfEntries?: number;
}

export interface DevToolsState<T extends ThemeDefinition> {
  currentTheme: T;
  selection: ThemeSelectionState;
  history: Array<{
    index: number;
    point: {
      theme: T;
      selection: ThemeSelectionState;
    };
  }>;
  entries: DevToolsEntry[];
  performance: DevToolsPerformanceEntry[];
  cssVariables: Record<string, string>;
}

export interface DevToolsInspector<T extends ThemeDefinition> {
  getState(): DevToolsState<T>;
  getEntries(): DevToolsEntry[];
  getPerformance(): DevToolsPerformanceEntry[];
  getCSSVariables(): Record<string, string>;
  jump(index: number): void;
  clearEntries(): void;
  clearPerformance(): void;
  exportState(): string;
  exportCSS(): Record<string, string>;
  destroy(): void;
  _bindRuntime: (runtime: any) => void;
  _bindThemeToCSS: (fn: (theme: T) => Record<string, string>) => void;
  _addEntry: (type: DevToolsEntry["type"], label: string, data: Record<string, unknown>) => void;
  _addPerfEntry: (type: string, duration: number) => void;
}
