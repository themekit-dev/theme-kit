import type { ThemeDefinition } from "./model/theme";

export interface ThemeStore<T extends ThemeDefinition = ThemeDefinition> {
  get(): T;
  set(theme: T, options?: { force?: boolean; suppressTransition?: boolean }): void;
  subscribe(listener: (theme: T, options?: { suppressTransition?: boolean }) => void): () => void;
  batch(callback: () => void): void;
  destroy(): void;
}

export interface ThemeStoreOptions<
  T extends ThemeDefinition = ThemeDefinition,
> {
  initialTheme: T;
}
