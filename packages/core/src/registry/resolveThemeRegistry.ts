import { getBuiltInThemes } from "../built-in-themes";
import type { ThemeDefinition, ThemeName } from "../model/theme";
import type { ThemeMeta } from "../model/meta";

/**
 * Options for creating a theme registry.
 */
export interface ThemeRegistryOptions<T extends ThemeDefinition> {
  /**
   * Initial theme definitions. Duplicate names are dropped (first wins).
   * When omitted, the registry starts empty.
   */
  themes?: readonly T[];
}

/**
 * A named collection of theme definitions installable as a group.
 *
 * Themes installed through `use` receive a `pack:<name>` tag and replace
 * any existing theme with the same name.
 */
export type ThemePack<T extends ThemeDefinition> = {
  /**
   * Pack identifier, attached to each theme as a `pack:<name>` tag.
   */
  name: string;
  /** Optional human-readable label for the pack. */
  label?: string;
  /** Themes this pack contributes. */
  themes: readonly T[];
};

/** @internal Shared timestamp stamp for registry metadata. */
function getDefaultMetaTimestamp(): ThemeMeta["created"] {
  return new Date().toISOString();
}

/**
 * A collection of registered theme definitions with deduplication,
 * inheritance-ready metadata stamps, and family queries.
 *
 * The registry stores theme *definitions*; resolution of `extends` chains
 * and token references happens separately via {@link resolveTheme}.
 */
export class ThemeRegistry<T extends ThemeDefinition = ThemeDefinition> {
  private _themes: T[] = [];

  /**
   * Creates an empty registry, or one pre-populated with `themes`.
   *
   * @param options Initial themes and other registry configuration.
   */
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

  /**
   * The registered themes. Returns the internal live array.
   */
  get themes(): readonly T[] {
    return this._themes;
  }

  /**
   * Registers a theme, stamping `meta.created` / `meta.updated` when absent.
   *
   * @param theme Theme to register.
   * @returns `true` when registered, `false` when a theme with the same name
   *   already exists (no-op in that case).
   */
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

  /**
   * Registers multiple themes.
   *
   * @param themes Themes to register.
   * @returns The number of themes actually registered (duplicates skipped).
   */
  registerMany(themes: readonly T[]): number {
    let count = 0;
    for (const theme of themes) {
      if (this.register(theme)) count++;
    }
    return count;
  }

  /**
   * Removes a theme by name.
   *
   * @param name Theme name to remove.
   * @returns `true` when a theme was removed, `false` when none matched.
   */
  unregister(name: string): boolean {
    const index = this._themes.findIndex((t) => t.name === name);
    if (index === -1) return false;
    this._themes.splice(index, 1);
    return true;
  }

  /**
   * Replaces a registered theme with a new definition, stamping
   * `meta.updated`.
   *
   * @param name Name of the theme to replace.
   * @param theme Replacement definition.
   * @returns `true` when replaced, `false` when no theme with that name is
   *   registered.
   */
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

  /**
   * Looks up a theme by name.
   *
   * @param name Theme name.
   * @returns The theme definition, or `undefined` when not registered.
   */
  get<Name extends ThemeName = ThemeName>(name: Name): T | undefined {
    return this._themes.find((t) => t.name === name) as T | undefined;
  }

  /**
   * Checks whether a theme name is registered.
   *
   * @param name Theme name.
   * @returns `true` when registered.
   */
  has(name: string): boolean {
    return this._themes.some((t) => t.name === name);
  }

  /**
   * Returns a defensive copy of the registered themes.
   */
  list(): readonly T[] {
    return [...this._themes];
  }

  /**
   * Installs a theme pack, tagging each theme with `pack:<name>` and
   * replacing any existing theme of the same name.
   *
   * @param pack The pack to install.
   */
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

  /**
   * Lists the distinct theme families. Themes without `meta.family` count
   * as the `"default"` family.
   */
  getFamilies(): string[] {
    const families = new Set<string>();
    for (const theme of this._themes) {
      const family = theme.meta?.family ?? "default";
      families.add(family);
    }
    return [...families];
  }

  /**
   * Returns the themes belonging to a family.
   *
   * @param family Family name; `"default"` matches themes without
   *   `meta.family`.
   */
  getThemesByFamily(family: string): T[] {
    return this._themes.filter((t) => (t.meta?.family ?? "default") === family);
  }

  /**
   * Removes all registered themes.
   */
  clear(): void {
    this._themes = [];
  }

  /**
   * Releases registry resources by clearing all themes.
   *
   * Idempotent. The registry remains usable (empty) after destruction.
   */
  destroy(): void {
    this._themes = [];
  }
}

/**
 * Creates a theme registry.
 *
 * @param options Initial themes and registry configuration.
 * @returns A new {@link ThemeRegistry}.
 *
 * @example
 * ```ts
 * const registry = createThemeRegistry({ themes: [lightTheme, darkTheme] });
 * registry.get("light");
 * ```
 * @see {@link ThemeRegistry}
 * @see {@link resolveThemeRegistry}
 */
export function createThemeRegistry<T extends ThemeDefinition>(
  options?: ThemeRegistryOptions<T>,
): ThemeRegistry<T> {
  return new ThemeRegistry<T>(options);
}

/**
 * Resolves the effective theme list for a registry configuration.
 *
 * Returns the provided themes when non-empty; otherwise falls back to the
 * built-in themes.
 *
 * @param options Registry configuration.
 * @returns The effective theme definitions.
 * @see {@link ThemeRegistry}
 * @see {@link getBuiltInThemes}
 */
export function resolveThemeRegistry<T extends ThemeDefinition>(
  options?: ThemeRegistryOptions<T>,
): readonly T[] {
  if (options?.themes !== undefined && options.themes.length > 0) {
    return options.themes;
  }
  return getBuiltInThemes() as unknown as readonly T[];
}
