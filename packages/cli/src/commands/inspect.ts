import { getString } from "../utils.js";
import type { ParsedArgs } from "../utils.js";
import { UsageError } from "../exit-codes.js";
import { readThemeJSON, toThemes, themeName } from "../theme-shared.js";

type ThemeLike = Record<string, unknown> & {
  name?: string;
  meta?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
  extends?: unknown;
};

function printThemeSummary(theme: ThemeLike, index?: number) {
  const label = index !== undefined ? `Theme ${index}: ${themeName(theme as never)}` : `Theme: ${themeName(theme as never)}`;
  console.log(label);

  const meta = theme.meta ?? {};
  console.log(`Mode: ${(meta.mode as string) ?? "N/A"}`);
  console.log(`Family: ${(meta.family as string) ?? "N/A"}`);

  if (theme.tokens) {
    console.log("\nTokens:");
    for (const [group, values] of Object.entries(theme.tokens)) {
      const count = Array.isArray(values) ? values.length : Object.keys(values as object).length;
      console.log(`  ${group}: ${count} items`);
    }
  }

  if (theme.meta) {
    console.log("\nMeta:");
    console.log(`  Label: ${(meta.label as string) ?? "N/A"}`);
    console.log(`  Description: ${(meta.description as string) ?? "N/A"}`);
    console.log(`  Version: ${(meta.version as string) ?? "N/A"}`);
  }

  if (theme.extends) {
    console.log(`\nExtends: ${String(theme.extends)}`);
  }
}

export async function cmdInspect(args: ParsedArgs) {
  const file = getString(args, "file") || getString(args, "f") || args._[1];

  if (!file) {
    throw new UsageError("--file <path> is required");
  }

  const parsed = readThemeJSON(file);
  const themes = toThemes(parsed);

  if (themes.length > 1) {
    themes.forEach((theme, i) => {
      if (i > 0) console.log("");
      printThemeSummary(theme as ThemeLike, i + 1);
    });
  } else {
    printThemeSummary(themes[0] as ThemeLike);
  }
}