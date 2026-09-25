import type { ThemeDefinition, ThemeTokens, ThemeSelectionState, HistoryEntry } from "@theme-kit/core";

/**
 * A single recorded devtools event entry.
 *
 * Records a lifecycle or selection event with a timestamp, label, and
 * arbitrary data payload.
 *
 * @see {@link DevToolsInspector}
 */
export interface DevToolsEntry {
  /** The kind of event that was recorded. */
  type: "theme-change" | "mode-change" | "family-change" | "persist" | "restore" | "batch";
  /** The time the event was recorded, in milliseconds since the epoch. */
  timestamp: number;
  /** A human-readable label describing the event. */
  label: string;
  /** Arbitrary data associated with the event. */
  data: Record<string, unknown>;
}

/**
 * A single recorded performance measurement.
 *
 * Captures the duration of a lifecycle phase (for example a theme change).
 *
 * @see {@link DevToolsInspector}
 */
export interface DevToolsPerformanceEntry {
  /** The measured duration in milliseconds. */
  duration: number;
  /** The lifecycle phase that was measured. */
  type: string;
  /** The time the measurement was recorded, in milliseconds since the epoch. */
  timestamp: number;
}

/**
 * Options for {@link createDevToolsInspector}.
 *
 * @see {@link createDevToolsInspector}
 */
export interface DevToolsInspectorOptions {
  /** The maximum number of event entries to retain. Defaults to `200`. */
  maxEntries?: number;
  /** The maximum number of performance entries to retain. Defaults to `100`. */
  maxPerfEntries?: number;
}

/**
 * A snapshot of the devtools inspector's full state.
 *
 * Combines the current theme, selection, history, recorded entries,
 * performance measurements, and the current CSS variables.
 *
 * @see {@link DevToolsInspector}
 */
export interface DevToolsState<T extends ThemeDefinition> {
  /** The currently active theme definition. */
  currentTheme: T;
  /** The current theme selection (mode and theme family). */
  selection: ThemeSelectionState;
  /** The recorded history, each entry with its index and point. */
  history: Array<{
    index: number;
    point: {
      theme: T;
      selection: ThemeSelectionState;
    };
  }>;
  /** The recorded event entries. */
  entries: DevToolsEntry[];
  /** The recorded performance measurements. */
  performance: DevToolsPerformanceEntry[];
  /** The current CSS variables for the active theme. */
  cssVariables: Record<string, string>;
}

/**
 * The devtools inspector interface.
 *
 * Records theme events and performance measurements, exposes the current
 * state, and provides export and destroy operations.
 *
 * @see {@link createDevToolsPlugin}
 */
export interface DevToolsInspector<T extends ThemeDefinition> {
  /** Returns a snapshot of the inspector's full state. */
  getState(): DevToolsState<T>;
  /** Returns a copy of the recorded event entries. */
  getEntries(): DevToolsEntry[];
  /** Returns a copy of the recorded performance measurements. */
  getPerformance(): DevToolsPerformanceEntry[];
  /** Returns the current CSS variables for the active theme. */
  getCSSVariables(): Record<string, string>;
  /** Jumps the runtime history to the given index and records a restore entry. */
  jump(index: number): void;
  /** Clears all recorded event entries. */
  clearEntries(): void;
  /** Clears all recorded performance measurements. */
  clearPerformance(): void;
  /** Exports the current state as a pretty-printed JSON string. */
  exportState(): string;
  /** Exports the current CSS variables as a record. */
  exportCSS(): Record<string, string>;
  /** Destroys the inspector, releasing its runtime reference and clearing all
   *  recorded data. Idempotent. */
  destroy(): void;
  /** @internal Binds the inspector to a runtime. */
  _bindRuntime: (runtime: any) => void;
  /** @internal Binds a theme-to-CSS-variables converter. */
  _bindThemeToCSS: (fn: (theme: T) => Record<string, string>) => void;
  /** @internal Records an event entry. */
  _addEntry: (type: DevToolsEntry["type"], label: string, data: Record<string, unknown>) => void;
  /** @internal Records a performance measurement. */
  _addPerfEntry: (type: string, duration: number) => void;
}
