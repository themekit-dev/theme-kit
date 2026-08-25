import type { ThemeDefinition, ThemeName } from "./model/theme";

export interface TokenRemap {
  from: string;
  to: string;
}

export interface MigrationStep {
  from: string;
  to: string;
  description: string;
  remapColors?: TokenRemap[];
  migrate?: (theme: ThemeDefinition) => ThemeDefinition;
}

const CURRENT_VERSION = "0.1";

export const migrations: MigrationStep[] = [];

function applyRemap(
  obj: Record<string, unknown> | undefined,
  remaps: TokenRemap[],
): Record<string, unknown> | undefined {
  if (!obj) return undefined;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const remap = remaps.find((r) => r.from === key);
    const targetKey = remap?.to ?? key;
    result[targetKey] = value;
  }

  return result;
}

/**
 * Register a migration for the theme migration system.
 */
export function registerMigration(step: MigrationStep): void {
  const existing = migrations.findIndex((m) => m.from === step.from);
  if (existing >= 0) {
    migrations[existing] = step;
  } else {
    migrations.push(step);
  }
}

export function clearMigrations(): void {
  migrations.length = 0;
}

export interface MigrateOptions {
  targetVersion?: string;
}

/**
 * Migrate a legacy theme to the current Theme Kit format using registered
 *    migrations.
 */
export function migrateTheme(
  theme: ThemeDefinition,
  options: MigrateOptions = {},
): ThemeDefinition {
  const target = options.targetVersion ?? CURRENT_VERSION;
  const currentVersion = theme.meta?.version;

  if (!currentVersion || currentVersion === target) {
    return theme;
  }

  const chain: MigrationStep[] = [];
  let cursor = currentVersion;

  while (cursor !== target) {
    const step = migrations.find((m) => m.from === cursor);
    if (!step) break;
    chain.push(step);
    cursor = step.to;
    if (chain.length > 20) break;
  }

  if (chain.length === 0) return theme;

  let result = theme;

  for (const step of chain) {
    if (step.migrate) {
      result = step.migrate(result);
    }

    if (step.remapColors && result.tokens?.colors) {
      result = {
        ...result,
        tokens: {
          ...result.tokens,
          colors: applyRemap(
            result.tokens.colors as Record<string, unknown>,
            step.remapColors,
          ) as typeof result.tokens.colors,
        },
      };
    }
  }

  return {
    ...result,
    meta: { ...result.meta, version: target },
  };
}
