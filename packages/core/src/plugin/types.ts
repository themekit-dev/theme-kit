import type { ThemeDefinition } from "../model/theme";
import type { ThemeTokens } from "../model/tokens";
import type { ThemeSelectionState } from "../model/selection";
import type { ThemeRuntime } from "../runtime";

export interface ThemePluginHooks<T extends ThemeDefinition = ThemeDefinition> {
  onRuntimeCreated?: (runtime: ThemeRuntime<T>) => void | (() => void);
  onBeforeThemeChange?: (data: { current: T; next: T }) => void;
  onAfterThemeChange?: (data: { theme: T }) => void;
  onBeforePersist?: (data: { selection: ThemeSelectionState }) => void;
  onAfterPersist?: (data: { selection: ThemeSelectionState }) => void;
  onBeforeApply?: (data: { theme: T }) => void;
  onAfterApply?: (data: { theme: T }) => void;
  onDestroy?: () => void;
  transformTokens?: (tokens: ThemeTokens, context: { theme: T }) => ThemeTokens;
}

export interface ThemePlugin<T extends ThemeDefinition = ThemeDefinition> extends ThemePluginHooks<T> {
  name: string;
  version?: string;
  priority?: number;
}

export interface PluginManager<T extends ThemeDefinition = ThemeDefinition> {
  use(plugin: ThemePlugin<T>): () => void;
  remove(name: string): boolean;
  list(): ThemePlugin<T>[];
  get(name: string): ThemePlugin<T> | undefined;
  destroy(): void;
}
