import { getBuiltInThemes } from "../built-in-themes";
import type { ThemeDefinition, ThemeName } from "../model/theme";
import type { ThemeMeta } from "../model/meta";

export interface ThemeRegistryOptions<T extends ThemeDefinition> {
  themes?: readonly T[];
}

export type ThemePack<T extends ThemeDefinition> = {
  name: string;
  label?: string;
  themes: readonly T[];
};

function getDefaultMetaTimestamp(): ThemeMeta["created"] {
  return new Date().toISOString();
}

export class ThemeRegistry<T extends ThemeDefinition = ThemeDefinition> {
  private _themes: T[] = [];

  constructor(options?: ThemeRegistryOptions<T>) {
    if (options?.themes !== undefined) {
      const seen = new Set<string>();
      for (const theme of options.themes) {
        if (seen.has(theme.name)) continue;
        seen.add(theme.name);
        this._themes.push(theme);
      }
    } else {
      this._themes = [];
    }
  }

  get themes(): readonly T[] {
    return this._themes;
  }

  register(theme: T): boolean {
    if (this._themes.some((t) => t.name === theme.name)) {
      return false;
    }
    this._themes.push({
      ...theme,
      meta: {
        ...theme.meta,
        created: theme.meta?.created ?? getDefaultMetaTimestamp(),
        updated: theme.meta?.updated ?? getDefaultMetaTimestamp(),
      },
    });
    return true;
  }

  registerMany(themes: readonly T[]): number {
    let count = 0;
    for (const theme of themes) {
      if (this.register(theme)) count++;
    }
    return count;
  }

  unregister(name: string): boolean {
    const index = this._themes.findIndex((t) => t.name === name);
    if (index === -1) return false;
    this._themes.splice(index, 1);
    return true;
  }

  replace(name: string, theme: T): boolean {
    const index = this._themes.findIndex((t) => t.name === name);
    if (index === -1) return false;
    this._themes[index] = {
      ...theme,
      meta: {
        ...theme.meta,
        updated: getDefaultMetaTimestamp(),
      },
    };
    return true;
  }

  get<Name extends ThemeName = ThemeName>(name: Name): T | undefined {
    return this._themes.find((t) => t.name === name) as T | undefined;
  }

  has(name: string): boolean {
    return this._themes.some((t) => t.name === name);
  }

  list(): readonly T[] {
    return [...this._themes];
  }

  use(pack: ThemePack<T>): void {
    const packThemes = [...pack.themes].map((theme) => ({
      ...theme,
      meta: {
        ...theme.meta,
        tags: [...(theme.meta?.tags ?? []), `pack:${pack.name}`],
        created: theme.meta?.created ?? getDefaultMetaTimestamp(),
        updated: theme.meta?.updated ?? getDefaultMetaTimestamp(),
      },
    }));
    for (const theme of packThemes) {
      const existing = this._themes.findIndex((t) => t.name === theme.name);
      if (existing !== -1) {
        this._themes[existing] = theme;
      } else {
        this._themes.push(theme);
      }
    }
  }

  getFamilies(): string[] {
    const families = new Set<string>();
    for (const theme of this._themes) {
      const family = theme.meta?.family ?? "default";
      families.add(family);
    }
    return [...families];
  }

  getThemesByFamily(family: string): T[] {
    return this._themes.filter((t) => (t.meta?.family ?? "default") === family);
  }

  clear(): void {
    this._themes = [];
  }

  destroy(): void {
    this._themes = [];
  }
}

export function createThemeRegistry<T extends ThemeDefinition>(
  options?: ThemeRegistryOptions<T>,
): ThemeRegistry<T> {
  return new ThemeRegistry<T>(options);
}

export function resolveThemeRegistry<T extends ThemeDefinition>(
  options?: ThemeRegistryOptions<T>,
): readonly T[] {
  if (options?.themes !== undefined && options.themes.length > 0) {
    return options.themes;
  }
  return getBuiltInThemes() as unknown as readonly T[];
}
