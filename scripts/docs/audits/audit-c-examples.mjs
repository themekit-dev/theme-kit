#!/usr/bin/env node
/**
 * Audit C — canonical examples (docs-system brief §8, §5) — STATIC half.
 *
 * For every example.meta.json under examples/ it validates the invariants that
 * need no network or toolchain:
 *   - the meta schema (feature/framework/packages/peerDependencies/files/entry)
 *   - every declared `files` exists, and `entry` is one of them
 *   - every declared `packages` is a shipped, TypeScript entrypoint
 *   - every `expectedExportsUsed` is actually exported by at least one of the
 *     declared packages (INTERNAL excluded), and
 *   - `peerDependencies` are declared names only.
 *
 * The dynamic half (`--dynamic`, Audit C spec §8) — create a temp project,
 * install the declared packages from BUILT TARBALLS, copy `files`, run the
 * framework build/typecheck — lives in `scripts/docs/lib/consumer-compile.mjs`.
 * It needs `pnpm` (to pack) and network (to fetch registry peers).
 *
 * Usage: node scripts/docs/audits/audit-c-examples.mjs [--dynamic]
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadClassification, loadRegistry, packageNames, REGISTRY_REL } from "../lib/registry.mjs";
import { entrypointsOf, resolveSpecifier } from "../lib/api-index.mjs";

const URL = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(dirname(dirname(dirname(URL)))));
const EXAMPLES = join(repoRoot, "examples");
const CONTRACT = "brief §8 Audit C — every example's meta.json must match the shipped ecosystem";

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry === "example.meta.json") out.push(full);
  }
  return out;
}

const classification = loadClassification();
const entrypoints = entrypointsOf(classification);
const shipped = new Set(packageNames(classification));
const failures = [];
const fail = (file, symbol, contract, detail) => failures.push({ file, symbol, contract, detail });

const metas = walk(EXAMPLES);
console.log("\n=== AUDIT C — CANONICAL EXAMPLES (static) ===\n");
console.log(`Examples found: ${metas.length}\n`);

/** Capability slugs that have at least one example (brief §13 coverage). */
const coveredFeatures = new Set();

for (const metaPath of metas) {
  const dir = dirname(metaPath);
  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, "utf8"));
  } catch (e) {
    fail(metaPath, "(meta)", CONTRACT, `unparsable JSON: ${e.message}`);
    continue;
  }

  for (const field of ["feature", "framework", "packages", "files", "entry"]) {
    if (meta[field] === undefined) fail(metaPath, "(meta)", CONTRACT, `missing \`${field}\``);
  }
  if (typeof meta.feature === "string") coveredFeatures.add(meta.feature);
  if (!Array.isArray(meta.files)) continue;

  if (!meta.files.includes(meta.entry)) {
    fail(metaPath, meta.entry ?? "(entry)", CONTRACT, "`entry` not listed in `files`");
  }
  for (const f of meta.files) {
    if (!existsSync(join(dir, f))) fail(metaPath, f, CONTRACT, `declared file does not exist`);
  }

  for (const pkg of meta.packages ?? []) {
    const resolved = resolveSpecifier(classification, pkg);
    if (!resolved) fail(metaPath, pkg, CONTRACT, `declares package "${pkg}", which is not a shipped entrypoint`);
    else if (resolved.isAsset) fail(metaPath, pkg, CONTRACT, `declares "${pkg}", which has no TypeScript surface`);
  }

  // A symbol is covered if at least one declared package exports it (post-@internal).
  for (const symbol of meta.expectedExportsUsed ?? []) {
    let found = false;
    for (const pkg of meta.packages ?? []) {
      const resolved = resolveSpecifier(classification, pkg);
      if (!resolved || resolved.isAsset) continue;
      const rows =
        resolved.entry === "."
          ? [...entrypoints.entries()].filter(([k]) => k.startsWith(`${resolved.pkg}|`)).map(([, r]) => r)
          : [entrypoints.get(`${resolved.pkg}|${resolved.entry}`)];
      if (rows.some((r) => r?.[symbol] && r[symbol] !== "INTERNAL")) { found = true; break; }
    }
    if (!found) fail(metaPath, symbol, CONTRACT, `expectedExportsUsed "${symbol}" is exported by none of "${(meta.packages ?? []).join(", ")}"`);
  }
}

// ---------------------------------------------------------------------------
// §13 coverage: every capability needs at least one canonical example.
// One-directional (capability → example): extra examples are allowed — e.g.
// `basic-theme`, a getting-started example that is not itself a capability.
// ---------------------------------------------------------------------------
const capabilitySlugs = Object.values(loadRegistry().capabilities).map((c) => c.slug);
const uncovered = capabilitySlugs.filter((s) => !coveredFeatures.has(s)).sort();
console.log(
  `§13 coverage: ${capabilitySlugs.length - uncovered.length}/${capabilitySlugs.length} capabilities have an example.\n`,
);
for (const slug of uncovered) {
  fail("(coverage)", slug, CONTRACT, `capability "${slug}" has no example under examples/**`);
}

for (const f of failures) {
  console.log(`  ✗ ${f.symbol} — ${f.file}`);
  console.log(`      contract: ${CONTRACT}`);
  console.log(`      detail: ${f.detail}`);
}
console.log(`\nFailures: ${failures.length}`);
if (failures.length) process.exitCode = 1;

// ---------------------------------------------------------------------------
// Offline verify (--offline): typecheck each example's sources against the
// workspace's BUILT declarations, then *render* framework examples with
// react-dom/server so the component tree actually executes. Deterministic, no
// npm install, no network — the always-available half of "the example works".
// ---------------------------------------------------------------------------
if (process.argv.includes("--offline")) {
  if (failures.length) {
    console.log("\nOffline verify skipped: static half failed.");
  } else {
    const { verifyExampleTypecheck, verifyExampleRender } = await import("../lib/consumer-compile.mjs");
    console.log("\n=== AUDIT C — CANONICAL EXAMPLES (offline verify) ===\n");
    let offlineFailures = 0;
    for (const metaPath of metas) {
      const dir = dirname(metaPath);
      const short = dir.slice(repoRoot.length + 1);
      process.stdout.write(`  • ${short} … `);
      try {
        const { tsc } = verifyExampleTypecheck(dir);
        const render = verifyExampleRender(dir);
        console.log(render ? `ok (${tsc}; rendered ${render.html} chars)` : `ok (${tsc})`);
      } catch (e) {
        offlineFailures++;
        console.log("FAIL");
        console.log(`      contract: ${CONTRACT}`);
        console.log(
          String(e.message)
            .split("\n")
            .slice(0, 12)
            .map((l) => `      ${l}`)
            .join("\n"),
        );
      }
    }
    console.log(`\nOffline failures: ${offlineFailures}`);
    if (offlineFailures) process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Dynamic half (--dynamic): pack → install → typecheck → smoke. See
// scripts/docs/lib/consumer-compile.mjs. Requires pnpm + network and a built
// workspace; throws (does not silently skip) when a step fails.
// ---------------------------------------------------------------------------
if (process.argv.includes("--dynamic")) {
  if (failures.length) {
    console.log("\nDynamic half skipped: static half failed.");
  } else {
    const { verifyExampleConsumerCompile, disposeNpmCache } = await import("../lib/consumer-compile.mjs");
    console.log("\n=== AUDIT C — CANONICAL EXAMPLES (dynamic) ===\n");
    let dynamicFailures = 0;
    for (const metaPath of metas) {
      const dir = dirname(metaPath);
      const short = dir.slice(repoRoot.length + 1);
      process.stdout.write(`  • ${short} … `);
      try {
        const { packed } = await verifyExampleConsumerCompile(dir);
        console.log(`ok (packed ${packed.length} tarball(s), installed, tsc, smoke)`);
      } catch (e) {
        dynamicFailures++;
        console.log("FAIL");
        console.log(`      contract: ${CONTRACT}`);
        console.log(`      detail: ${String(e.message).split("\n")[0]}`);
        if (e.stdout) console.log(String(e.stdout));
        if (e.stderr) console.log(String(e.stderr).split("\n").slice(0, 12).join("\n"));
      }
    }
    console.log(`\nDynamic failures: ${dynamicFailures}`);
    disposeNpmCache();
    if (dynamicFailures) process.exitCode = 1;
  }
}
