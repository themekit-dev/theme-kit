import { migrateTheme, type ThemeDefinition } from "@theme-kit/core";
import { writeFileSync } from "node:fs";
import { getString } from "../utils.js";
import type { ParsedArgs } from "../utils.js";
import { UsageError } from "../exit-codes.js";
import { readThemeJSON, isThemePair } from "../theme-shared.js";

export async function cmdMigrate(args: ParsedArgs) {
  const file = getString(args, "file") || getString(args, "f") || args._[1];
  const output = getString(args, "output") || getString(args, "o") || null;

  if (!file) {
    throw new UsageError("--file <path> is required");
  }

  const parsed = readThemeJSON(file);

  const result = isThemePair(parsed)
    ? {
        light: migrateTheme(parsed.light),
        dark: migrateTheme(parsed.dark),
      }
    : migrateTheme(parsed as ThemeDefinition);

  const json = JSON.stringify(result, null, 2);

  if (output) {
    writeFileSync(output, json, "utf-8");
    console.log(`Migrated theme written to ${output}`);
  } else {
    console.log(json);
  }
}