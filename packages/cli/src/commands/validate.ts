import { validateTheme } from "@theme-kit/core";
import { getString } from "../utils.js";
import type { ParsedArgs } from "../utils.js";
import { readThemeJSON, toThemes, themeName } from "../theme-shared.js";
import { ExitCodes, UsageError } from "../exit-codes.js";

/**
 * Implements the `validate` command: validates a theme file and reports any
 * issues.
 *
 * Reads `--file`/`-f` (or the first positional), parses the theme JSON, and
 * validates each theme. On success prints a confirmation; on failure prints
 * the issues and exits with the validation-failed exit code.
 *
 * @param args The parsed command-line arguments.
 * @throws {UsageError} When no file is provided.
 *
 * @see {@link parseArgs}
 */
export async function cmdValidate(args: ParsedArgs) {
  const file = getString(args, "file") || getString(args, "f") || args._[1];

  if (!file) {
    throw new UsageError("--file <path> is required");
  }

  const parsed = readThemeJSON(file);
  const themes = toThemes(parsed);

  interface Failure {
    name: string;
    issues: string[];
  }

  const failures: Failure[] = [];

  for (const theme of themes) {
    const result = validateTheme(theme);
    if (result.valid) continue;
    failures.push({
      name: themeName(theme),
      issues: result.issues.map((issue) => issue.message),
    });
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`✗ Theme is invalid: ${failure.name}`);
      for (const issue of failure.issues) {
        console.error(`  - ${issue}`);
      }
    }
    console.error(`(validation failed for ${failures.length} theme${failures.length === 1 ? "" : "s"})`);
    process.exit(ExitCodes.ValidationFailed);
  }

  const summary =
    themes.length > 1
      ? `${themeName(themes[0]!)} + ${themeName(themes[1]!)}`
      : themeName(themes[0]!);
  console.log(`✓ Theme is valid: ${summary}`);
}