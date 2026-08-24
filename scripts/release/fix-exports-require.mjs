#!/usr/bin/env node
/**
 * Add require conditions to package exports maps where dist/index.cjs exists
 * but no require condition is declared.
 *
 * This ensures CJS consumers can use the packages (item 1/20: CJS/ESM mismatch).
 *
 * Usage: node scripts/release/fix-exports-require.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(import.meta.url);
const repoRoot = resolve(join(here, "..", "..", ".."));

const PACKAGES_TO_FIX = [
  "packages/devtools",
  "packages/next",
  "packages/react",
  "packages/remix",
  "packages/solid",
  "packages/svelte",
  "packages/vue",
  "packages/web",
];

for (const rel of PACKAGES_TO_FIX) {
  const dir = join(repoRoot, rel);
  const pkgPath = join(dir, "package.json");
  const cjsPath = join(dir, "dist", "index.cjs");
  if (!existsSync(pkgPath)) {
    console.log(`SKIP ${rel}: no package.json`);
    continue;
  }
  if (!existsSync(cjsPath)) {
    console.log(`SKIP ${rel}: no dist/index.cjs`);
    continue;
  }
  const json = JSON.parse(readFileSync(pkgPath, "utf8"));
  const rootExport = json.exports?.["."];
  if (!rootExport) {
    console.log(`SKIP ${rel}: no "." export`);
    continue;
  }
  if (rootExport.require) {
    console.log(`OK ${rel}: require already declared`);
    continue;
  }
  rootExport.require = "./dist/index.cjs";
  writeFileSync(pkgPath, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`FIX ${rel}: added require: ./dist/index.cjs`);
}