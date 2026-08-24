import type { ThemeName } from "../model";

export interface StorageAdapter {
  get(): ThemeName | null;
  set(theme: ThemeName): void;
  remove(): void;
}
