/**
 * Loads the two canonical docs artifacts:
 *  - `docs/reference/capabilities.ts` — the capability registry (§4)
 *  - `docs/reference/public-api.json`  — the generated classification (§7)
 *
 * The registry is evaluated with the TypeScript compiler. It is pure data by
 * contract, so a `require` that is actually reached is a hard error.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url)); // scripts/docs/lib

export const repoRoot = resolve(join(here, "..", "..", ".."));
export const REGISTRY_PATH = join(repoRoot, "docs", "reference", "capabilities.ts");
export const REGISTRY_REL = "docs/reference/capabilities.ts";
export const CLASSIFICATION_PATH = join(repoRoot, "docs", "reference", "public-api.json");
export const CLASSIFICATION_REL = "docs/reference/public-api.json";
export const AUDIT_REL = "scripts/release/snippet-audit.mjs";

export const CAPABILITY_CATEGORIES = ["core-feature", "tooling", "concept"];

export function loadRegistry() {
  const source = readFileSync(REGISTRY_PATH, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = { exports: {} };
  const requireStub = () => {
    throw new Error(`${REGISTRY_REL} must not import anything (it is canonical data, not code)`);
  };
  new Function("exports", "module", "require", js)(loaded.exports, loaded, requireStub);
  const { capabilities, integrations } = loaded.exports;
  if (!capabilities || !integrations) {
    throw new Error(`${REGISTRY_REL} must export both \`capabilities\` and \`integrations\``);
  }
  return { capabilities, integrations };
}

export function loadClassification() {
  return JSON.parse(readFileSync(CLASSIFICATION_PATH, "utf8"));
}

export function packageNames(classification) {
  return Object.keys(classification).filter((k) => !k.startsWith("$"));
}