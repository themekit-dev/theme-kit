#!/usr/bin/env node
/**
 * Audit F — docs → no internal symbols (docs-system brief §8, §7).
 *
 * No doc page may reference a symbol classified `INTERNAL`, and the registry
 * may not list one either (list `INTERNAL` in capabilities.ts and the registry
 * silently promotes an implementation helper to public API).
 *
 * Classification comes from `docs/reference/public-api.json`, which derives
 * `INTERNAL` from each symbol's own `@internal` JSDoc tag.
 *
 * Usage: node scripts/docs/audits/audit-f-internal-symbols.mjs
 */

import { loadRegistry, loadClassification, REGISTRY_REL } from "../lib/registry.mjs";
import { resolveSpecifier } from "../lib/api-index.mjs";
import { collectDocReferences } from "../lib/references.mjs";

const CONTRACT = "brief §8 Audit F — no doc may reference a symbol classified INTERNAL";

const classification = loadClassification();
const { capabilities, integrations } = loadRegistry();
const failures = [];
const fail = (file, symbol, contract, detail) => failures.push({ file, symbol, contract, detail });

/** The entrypoint that classifies `symbol` INTERNAL for a registry package key. */
function internalEntry(pkgKey, symbol) {
  const resolved = resolveSpecifier(classification, pkgKey);
  if (!resolved || resolved.isAsset) return null;
  const entries = classification[resolved.pkg] ?? {};
  if (resolved.entry !== ".") {
    return entries[resolved.entry]?.[symbol] === "INTERNAL" ? resolved.entry : null;
  }
  for (const [key, row] of Object.entries(entries)) {
    if (row[symbol] === "INTERNAL") return key;
  }
  return null;
}

let registryEntries = 0;
for (const [key, cap] of Object.entries(capabilities)) {
  for (const [pkg, symbols] of Object.entries(cap.packages ?? {})) {
    for (const symbol of symbols) {
      registryEntries += 1;
      const entry = internalEntry(pkg, symbol);
      if (entry) {
        fail(
          REGISTRY_REL,
          symbol,
          CONTRACT,
          `capability:${key} lists "${symbol}", but ${pkg} classifies it INTERNAL (${entry})`,
        );
      }
    }
  }
}

for (const [key, integration] of Object.entries(integrations)) {
  for (const [pkg, symbols] of Object.entries(integration.packages ?? {})) {
    for (const symbol of symbols) {
      registryEntries += 1;
      const entry = internalEntry(pkg, symbol);
      if (entry) {
        fail(
          REGISTRY_REL,
          symbol,
          CONTRACT,
          `integration:${key} lists "${symbol}", but ${pkg} classifies it INTERNAL (${entry})`,
        );
      }
    }
  }
}

const { refs, report } = collectDocReferences();
let checked = 0;
for (const ref of refs) {
  if (ref.symbol === "(default)") continue;
  const resolved = resolveSpecifier(classification, ref.specifier);
  if (!resolved || resolved.isAsset) continue;
  checked += 1;
  const entry = internalEntry(resolved.specifier, ref.symbol);
  if (entry) {
    fail(
      ref.page,
      ref.symbol,
      CONTRACT,
      `imports "${ref.symbol}" from "${ref.specifier}", classified INTERNAL (${resolved.pkg} ${entry})`,
    );
  }
}

console.log("\n=== AUDIT F — DOCS → NO INTERNAL SYMBOLS ===\n");
console.log(`Registry entries checked: ${registryEntries}`);
console.log(`Docs pages scanned: ${report.pages}, references checked: ${checked}`);
console.log(`Failures: ${failures.length}\n`);

for (const f of failures) {
  console.log(`  ✗ ${f.symbol} — ${f.file}`);
  console.log(`      contract: ${f.contract}`);
  console.log(`      detail: ${f.detail}`);
}

process.exitCode = failures.length ? 1 : 0;