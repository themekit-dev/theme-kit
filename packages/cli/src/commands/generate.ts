import { generateTheme } from "@theme-kit/core";
import { getString } from "../utils.js";
import type { ParsedArgs } from "../utils.js";
import { UsageError } from "../exit-codes.js";

export async function cmdGenerate(args: ParsedArgs) {
  const seed = getString(args, "seed") || getString(args, "s") || args._[1] || "#6366f1";
  const family = getString(args, "family") || getString(args, "f") || "default";
  const mode = (getString(args, "mode") || getString(args, "m") || "both").toLowerCase();
  const output = getString(args, "output") || getString(args, "o") || null;

  if (!seed.startsWith("#") || seed.length !== 7) {
    throw new UsageError("seed must be a hex color (e.g. #6366f1)");
  }

  if (mode !== "light" && mode !== "dark" && mode !== "both") {
    throw new UsageError(`invalid mode "${mode}" — use "light", "dark", or "both"`);
  }

  const pair = generateTheme({ seed, family });
  const json = JSON.stringify(
    mode === "both" ? pair : mode === "dark" ? pair.dark : pair.light,
    null,
    2,
  );

  if (output) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(output, json, "utf-8");
    console.log(`Theme written to ${output}`);
  } else {
    console.log(json);
  }
}
