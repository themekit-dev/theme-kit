import type { ThemeSelectionState } from "../../model";

export interface ThemeSelectionPersistenceAdapter {
  get(): ThemeSelectionState | null;

  set(value: ThemeSelectionState): void;

  remove(): void;

  subscribe(listener: (value: ThemeSelectionState | null) => void): () => void;
}
