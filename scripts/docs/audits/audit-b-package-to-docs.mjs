#!/usr/bin/env node
/**
 * Audit B — package → docs (docs-system brief §8, §7).
 *
 * For every shipped, classified public export (everything except `@internal`):
 *   1. an API reference page covering that export must exist
 *      (`apps/docs/content/api-reference/<pkg>.md` or `<pkg>/<submodule>.md`), and
 *   2. it must have a guide/capability destination — it is listed in the
 *      capability registry (`docs/reference/capabilities.ts`), the §4 mapping.
 *
 * Why this exists beyond export-inventory: that gate only docs-checks the 14
 * packages it knows about. Every package now has an API page — adapters
 * included — and Audit B is the only check that *every* export of *every*
 * package lands on its page.
 *
 * The API-page half is a hard gate (§16: prefer failing over shipping drift).
 * Registry/guide coverage is reported as numbers plus a per-export list; it
 * gates only with `--coverage=fail`, so an unfinished registry can be burned
 * down without an invisible permanently-red gate.
 *
 * Usage:
 *   node scripts/docs/audits/audit-b-package-to-docs.mjs
 *   node scripts/docs/audits/audit-b-package-to-docs.mjs --coverage=fail
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadRegistry, loadClassification, repoRoot } from "../lib/registry.mjs";
import { registryIndex } from "../lib/api-index.mjs";

const CONTENT = join(repoRoot, "apps", "docs", "content", "api-reference");
const CONTRACT_PAGE =
  "brief §8 Audit B — every shipped public export must have an API reference page that names it";
const CONTRACT_GUIDE =
  "brief §8 Audit B — every public export needs a guide/capability destination (feature/framework/adapter)";

const coverageFail = process.argv.includes("--coverage=fail");

const classification = loadClassification();
const { capabilities, integrations } = loadRegistry();
const index = registryIndex({ capabilities, integrations });

const pageFailures = []; // no API-page destination — hard gate
const uncovered = []; // no guide/capability destination — reported, gated by flag

/** The API-reference file an entrypoint maps to. */
function pageFile(slug, entry) {
  const base = `${slug}.md`;
  if (entry === ".") return join(CONTENT, base);
  return join(CONTENT, slug, `${entry.replace(/^\.\//, "")}.md`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pageNamesIt(file, symbol) {
  const content = readFileSync(file, "utf8");
  return content.includes(`### \`${symbol}`) || new RegExp(`\\b${escapeRegExp(symbol)}\\b`).test(content);
}

let symbolsChecked = 0;
let pageTargets = 0;

for (const [pkg, entrypoints] of Object.entries(classification)) {
  if (pkg.startsWith("$")) continue;
  const slug = pkg.replace(/^@theme-kit\//, "");

  for (const [entry, row] of Object.entries(entrypoints)) {
    const file = pageFile(slug, entry);
    const pageExists = existsSync(file);
    if (pageExists) pageTargets += 1;

    for (const symbol of Object.keys(row)) {
      const cls = row[symbol];
      if (cls === "INTERNAL") continue; // Audit F enforces the forbidden half.

      symbolsChecked += 1;
      if (!pageExists || !pageNamesIt(file, symbol)) {
        pageFailures.push({ package: pkg, entrypoint: entry, symbol, cls, file: pageExists ? file : null });
        continue;
      }

      // Guide/capability destination: listed in the registry under either the
      // base package or the entrypoint-specific key?
      const baseKey = `${pkg}|${symbol}`;
      const specKey =
        entry === "." ? null : `${pkg}/${entry.replace(/^\.\//, "")}|${symbol}`;
      const listed = index.get(baseKey) ?? (specKey ? index.get(specKey) : null);
      if (!listed) uncovered.push({ package: pkg, entrypoint: entry, symbol, cls });
    }
  }
}
console.log("\n=== AUDIT B — PACKAGE → DOCS DESTINATIONS ===\n");
console.log(`Entrypoints with an API page: ${pageTargets}`);
console.log(`Public exports checked (API page + guide destination): ${symbolsChecked}`);
console.log(`Registry: ${Object.keys(capabilities).length} capabilities, ${Object.keys(integrations).length} integrations, ${index.size} (pkg|symbol) entries`);
console.log(`Without a guide/capability destination: ${uncovered.length}`);
console.log(`API-page failures: ${pageFailures.length}\n`);

for (const f of pageFailures.slice(0, 30)) {
  console.log(`  ✗ ${f.symbol} (${f.cls}) — ${f.package} ${f.entrypoint}`);
  console.log(`      contract: ${CONTRACT_PAGE}`);
  console.log(`      detail: no named API-reference page at ${f.file ?? "(missing)"}`);
}
if (pageFailures.length > 30) console.log(`  … and ${pageFailures.length - 30} more`);
if (uncovered.length) {
  console.log(`\nNo guide/capability destination (${uncovered.length}) — first 25:`);
  for (const u of uncovered.slice(0, 25)) {
    console.log(`  · ${u.package} ${u.entrypoint} ${u.symbol} (${u.cls})`);
  }
  if (uncovered.length > 25) console.log(`  … and ${uncovered.length - 25} more`);
}

const failPage = pageFailures.length > 0;
const failCoverage = coverageFail && uncovered.length > 0;

if (failPage) {
  console.log(`\nFAIL: ${pageFailures.length} export(s) with no API-page destination — ${CONTRACT_PAGE}`);
}
if (failCoverage) {
  console.log(`\nFAIL: ${uncovered.length} export(s) with no guide/capability destination — ${CONTRACT_GUIDE} (enforced via --coverage=fail)`);
}
if (failPage || failCoverage) {
  process.exitCode = 1;
} else {
  console.log(`\nExit: OK (0) — every public export has an API-page destination. Registry coverage reported (force with --coverage=fail).`);
}