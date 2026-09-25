#!/usr/bin/env node
/**
 * Audit E — docs → no invented symbols (docs-system brief §8, §4).
 *
 * Two directions, because the registry is only meaningful if both hold:
 *
 *  1. Registry integrity: every (package, symbol) listed in
 *     `docs/reference/capabilities.ts` must be a symbol the shipped package
 *     actually exports. A registry entry for a symbol that does not exist is an
 *     invented capability.
 *  2. Docs membership: every symbol the docs import from a `@theme-kit/*`
 *     package must be listed in the registry (brief §4: "No feature page,
 *     framework page, or adapter page may reference an exported symbol that is
 *     not listed here").
 *
 * Non-TypeScript entrypoints (CSS, `.astro` components) are validated against
 * the declared entrypoint list instead, since they have no exported symbols.
 *
 * Every failure prints the offending file, the offending symbol, and the
 * contract it violates (§16).
 *
 * Usage: node scripts/docs/audits/audit-e-invented-symbols.mjs
 */

import {
  loadRegistry,
  loadClassification,
  REGISTRY_REL,
} from "../lib/registry.mjs";
import { entrypointsOf, resolveSpecifier, registryIndex, registryLists } from "../lib/api-index.mjs";
import { collectDocReferences } from "../lib/references.mjs";

const CONTRACT =
  "brief §8 Audit E — a referenced symbol must exist in the shipped package AND be listed in capabilities.ts";
const CONTRACT_SHAPE = "brief §4 — Capability shape";

const failures = [];
const fail = (file, symbol, contract, detail) =>
  failures.push({ file, symbol, contract, detail });

const classification = loadClassification();
const { capabilities, integrations } = loadRegistry();
const index = registryIndex({ capabilities, integrations });
const entrypoints = entrypointsOf(classification);

// --- 1. registry shape -----------------------------------------------------
const slugs = new Map();
for (const [key, cap] of Object.entries(capabilities)) {
  for (const field of ["slug", "title", "summary"]) {
    if (!cap[field]) fail(REGISTRY_REL, key, CONTRACT_SHAPE, `missing \`${field}\``);
  }
  if (!["core-feature", "tooling", "concept"].includes(cap.category)) {
    fail(REGISTRY_REL, key, CONTRACT_SHAPE, `category "${cap.category}" must be core-feature | tooling | concept`);
  }
  if (cap.slug && slugs.has(cap.slug)) {
    fail(REGISTRY_REL, key, CONTRACT_SHAPE, `slug "${cap.slug}" duplicates capability "${slugs.get(cap.slug)}"`);
  }
  if (cap.slug) slugs.set(cap.slug, key);
  if (!Array.isArray(cap.frameworks)) {
    fail(REGISTRY_REL, key, CONTRACT_SHAPE, "`frameworks` must be an array");
  }
}

// --- 2. registry integrity: listed symbols must be shipped -----------------
/**
 * A registry key may be a base package (`@theme-kit/core`) or a base package
 * plus one of its declared entrypoints (`@theme-kit/core/vanilla`), because
 * that is how the docs import the symbols. Both must resolve to a shipped
 * entrypoint, and the symbol must be exported by it.
 */
function checkListing(source, pkgKey, symbol) {
  const resolved = resolveSpecifier(classification, pkgKey);
  if (!resolved) {
    fail(
      REGISTRY_REL,
      symbol,
      CONTRACT,
      `${source} lists package "${pkgKey}", which is not a shipped package or a declared entrypoint`,
    );
    return;
  }
  if (resolved.isAsset) {
    fail(
      REGISTRY_REL,
      symbol,
      CONTRACT,
      `${source} lists "${pkgKey}", which has no TypeScript surface (${resolved.assetReason}) and therefore cannot export symbols`,
    );
    return;
  }
  const rows =
    resolved.entry === "."
      ? [...entrypoints.entries()].filter(([key]) => key.startsWith(`${resolved.pkg}|`)).map(([, row]) => row)
      : [entrypoints.get(`${resolved.pkg}|${resolved.entry}`)];
  const found = rows.some((row) => row && Object.prototype.hasOwnProperty.call(row, symbol));
  if (!found) {
    fail(
      REGISTRY_REL,
      symbol,
      CONTRACT,
      `${source} lists "${symbol}" for ${pkgKey}, which the shipped entrypoint does not export`,
    );
  }
}

for (const [key, cap] of Object.entries(capabilities)) {
  for (const [pkg, symbols] of Object.entries(cap.packages ?? {})) {
    for (const symbol of symbols) checkListing(`capability:${key}`, pkg, symbol);
  }
}

for (const [key, integration] of Object.entries(integrations)) {
  if (!["framework", "adapter"].includes(integration.kind)) {
    fail(REGISTRY_REL, key, CONTRACT_SHAPE, `integration kind "${integration.kind}" must be framework | adapter`);
  }
  for (const [pkg, symbols] of Object.entries(integration.packages ?? {})) {
    for (const symbol of symbols) checkListing(`integration:${key}`, pkg, symbol);
  }
  for (const mirror of integration.mirrors ?? []) {
    if (!resolveSpecifier(classification, mirror)) {
      fail(REGISTRY_REL, key, CONTRACT, `mirrors "${mirror}", which is not a shipped package`);
    }
  }
}

// --- 3. docs membership ----------------------------------------------------
const { refs, report } = collectDocReferences();
let checked = 0;
let assetRefs = 0;

for (const ref of refs) {
  if (ref.symbol === "(default)") continue;
  const resolved = resolveSpecifier(classification, ref.specifier);
  if (!resolved) {
    fail(
      ref.page,
      ref.symbol,
      CONTRACT,
      `imports from "${ref.specifier}", which is not a declared entrypoint of any shipped package`,
    );
    continue;
  }
  if (resolved.isAsset) {
    assetRefs += 1;
    continue;
  }
  checked += 1;
  // The registry may key a symbol by base package or by an explicit
  // entrypoint (`@theme-kit/astro/client`), matching how the docs import it.
  const listed =
    registryLists(index, ref.specifier, ref.symbol) ?? registryLists(index, resolved.pkg, ref.symbol);
  if (!listed) {
    fail(
      ref.page,
      ref.symbol,
      CONTRACT,
      `"${ref.symbol}" from "${ref.specifier}" is not listed in ${REGISTRY_REL}`,
    );
  }
}

// --- report ---------------------------------------------------------------
console.log("\n=== AUDIT E — DOCS → NO INVENTED SYMBOLS ===\n");
console.log(`Registry: ${Object.keys(capabilities).length} capabilities, ${Object.keys(integrations).length} integrations`);
console.log(`Registry symbols: ${index.size}`);
console.log(`Docs pages scanned: ${report.pages}, references: ${report.references}`);
console.log(`References checked against the registry: ${checked} (plus ${assetRefs} component/CSS entrypoint imports)`);
console.log(`Failures: ${failures.length}\n`);

for (const f of failures) {
  console.log(`  ✗ ${f.symbol} — ${f.file}`);
  console.log(`      contract: ${f.contract}`);
  console.log(`      detail: ${f.detail}`);
}

process.exitCode = failures.length ? 1 : 0;