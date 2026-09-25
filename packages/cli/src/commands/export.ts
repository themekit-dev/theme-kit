import { themeToCSSVariables, type ThemeDefinition } from "@theme-kit/core";
import { writeFileSync } from "node:fs";
import { getString } from "../utils.js";
import type { ParsedArgs } from "../utils.js";
import { UsageError } from "../exit-codes.js";
import { readThemeJSON, isThemePair } from "../theme-shared.js";

function cssBlock(selector: string, map: Record<string, string>): string {
  const lines = Object.entries(map)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join("\n");
  return `${selector} {\n${lines}\n}`;
}

/**
 * Implements the `export` command: exports a theme file as CSS variables or
 * JSON.
 *
 * Reads `--file`/`-f` (or the first positional), `--format`/`-F` (`css` or
 * `json`), and `--output`/`-o`. Prints the exported CSS or JSON to stdout, or
 * writes it to the output file when provided.
 *
 * @param args The parsed command-line arguments.
 * @throws {UsageError} When no file is provided or the format is unknown.
 *
 * @see {@link parseArgs}
 */
export async function cmdExport(args: ParsedArgs) {
  const file = getString(args, "file") || getString(args, "f") || args._[1];
  const format = (getString(args, "format") || getString(args, "F") || "css").toLowerCase();
  const output = getString(args, "output") || getString(args, "o") || null;

  if (!file) {
    throw new UsageError("--file <path> is required");
  }

  const parsed = readThemeJSON(file);

  if (format === "css") {
    let css: string;

    if (isThemePair(parsed)) {
      css = [
        cssBlock(":root", themeToCSSVariables(parsed.light)),
        "",
        cssBlock('.dark, [data-theme="dark"]', themeToCSSVariables(parsed.dark)),
        "",
      ].join("\n");
    } else {
      css = `${cssBlock(":root", themeToCSSVariables(parsed as ThemeDefinition))}\n`;
    }

    if (output) {
      writeFileSync(output, css, "utf-8");
      console.log(`CSS exported to ${output}`);
    } else {
      console.log(css);
    }
  } else if (format === "json") {
    const data = isThemePair(parsed)
      ? {
          light: themeToCSSVariables(parsed.light),
          dark: themeToCSSVariables(parsed.dark),
        }
      : themeToCSSVariables(parsed as ThemeDefinition);

    const json = JSON.stringify(data, null, 2);

    if (output) {
      writeFileSync(output, json, "utf-8");
      console.log(`JSON exported to ${output}`);
    } else {
      console.log(json);
    }
  } else {
    throw new UsageError(`unknown format "${format}" — use "css" or "json"`);
  }
}