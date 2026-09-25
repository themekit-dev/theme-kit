#!/usr/bin/env node
/**
 * Snippet baseline — docs-system brief Phase 1 task 4, plus the "zero drift is
 * the floor" half of Audit A (§8).
 *
 * Runs the existing snippet audit (scripts/release/snippet-audit.mjs, extended
 * with an additive `--json=` report — extended, never replaced, per §16) and
 * freezes its result as the docs baseline. Later runs diff against the frozen
 * baseline:
 *
 *   - any failing reference            -> FAIL (the audit's own gate)
 *   - fewer pages / fewer references    -> FAIL (the documented surface shrank)
 *   - a baseline reference that vanished -> FAIL (drift)
 *   - new references                   -> reported, allowed (growth)
 *
 * Usage:
 *   node scripts/docs/snapshot-snippet-baseline.mjs            # verify vs the frozen baseline
 *   node scripts/docs/snapshot-snippet-baseline.mjs --update    # re-freeze the baseline
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const AUDIT_REL = "scripts/release/snippet-audit.mjs";
const AUDIT = join(repoRoot, AUDIT_REL);
const BASELINE_PATH = join(repoRoot, "docs", "reference", "baselines", "snippet-baseline.json");
const BASELINE_REL = "docs/reference/baselines/snippet-baseline.json";
const CONTRACT = "Audit A — docs → package (zero drift is the floor)";

const update = process.argv.includes("--update");
const tmp = join(here, ".snippet-audit.tmp.json");

const keyOf = (e) => `${e.page}|${e.import}`;

function runAudit() {
  mkdirSync(dirname(tmp), { recursive: true });
  let auditExit = 0;
  try {
    process.stdout.write(
      execFileSync(process.execPath, [AUDIT, `--json=${tmp}`], { cwd: repoRoot, encoding: "utf8" }),
    );
  } catch (err) {
    auditExit = err.status ?? 1;
    process.stdout.write(err.stdout ?? "");
    process.stdout.write(err.stderr ?? "");
  }
  if (!existsSync(tmp)) {
    console.log(`\nFAIL: ${AUDIT_REL} did not produce a JSON report (exit ${auditExit})`);
    process.exit(1);
  }
  const report = JSON.parse(readFileSync(tmp, "utf8"));
  rmSync(tmp, { force: true });
  return { report, auditExit };
}

const { report, auditExit } = runAudit();

const snapshot = {
  capturedAt: new Date().toISOString(),
  tool: AUDIT_REL,
  contract: CONTRACT,
  pages: report.pages,
  snippets: report.snippets,
  references: report.references,
  failures: report.failures,
  failing: report.entries.filter((e) => !e.ok).map(keyOf),
  entries: report.entries.map((e) => ({ page: e.page, import: e.import, detail: e.detail, ok: e.ok })),
};

console.log(`\n=== SNIPPET BASELINE ===`);
console.log(`Audit: ${AUDIT_REL} → ${report.pages} page(s), ${report.snippets} snippet(s), ${report.references} reference(s), ${report.failures} failure(s)`);

if (update || !existsSync(BASELINE_PATH)) {
  mkdirSync(dirname(BASELINE_PATH), { recursive: true });
  writeFileSync(BASELINE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  const verb = update ? "Re-froze" : "Created";
  console.log(`${verb} baseline: ${BASELINE_REL}`);
  console.log(
    update
      ? `Exit: OK (0) — the frozen baseline now reflects this run.`
      : `Exit: ${auditExit ? "FAIL (audit reported failures)" : "OK (0)"} — re-run without --update to verify.`,
  );
  process.exitCode = auditExit ? 1 : 0;
} else {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  const baselineKeys = new Set(baseline.entries.map(keyOf));
  const currentKeys = new Set(snapshot.entries.map(keyOf));
  const baselineFailing = new Set(baseline.failing ?? []);

  const lost = [...baselineKeys].filter((k) => !currentKeys.has(k)).sort();
  const added = [...currentKeys].filter((k) => !baselineKeys.has(k)).sort();
  const newFailures = snapshot.entries.filter((e) => !e.ok).filter((e) => !baselineFailing.has(keyOf(e)));

  const problems = [];
  if (snapshot.failures > 0) {
    problems.push(`${snapshot.failures} failing snippet reference(s) (was ${baseline.failures ?? 0} at baseline)`);
  }
  if (snapshot.pages < baseline.pages) {
    problems.push(`pages scanned dropped: ${baseline.pages} → ${snapshot.pages}`);
  }
  if (snapshot.references < baseline.references) {
    problems.push(`references dropped: ${baseline.references} → ${snapshot.references}`);
  }
  if (lost.length) {
    problems.push(`${lost.length} baseline reference(s) no longer present`);
  }
  if (newFailures.length) {
    problems.push(`${newFailures.length} new failing reference(s)`);
  }

  if (added.length) {
    console.log(`Growth (allowed): +${added.length} reference(s)`);
  }

  if (problems.length) {
    console.log(`\nFAIL: ${problems.length} baseline violation(s) — ${CONTRACT}`);
    for (const p of problems) console.log(`  - ${p}`);
    for (const l of lost.slice(0, 25)) console.log(`      lost: ${l}`);
    if (lost.length > 25) console.log(`      … and ${lost.length - 25} more`);
    for (const f of newFailures.slice(0, 25)) console.log(`      failing: ${f.page} → ${f.import} (${f.detail})`);
    console.log(`  If a removal is deliberate, re-freeze with --update.`);
    console.log(`\nExit: FAIL`);
    process.exitCode = 1;
  } else {
    console.log(
      `Baseline: ${BASELINE_REL} (captured ${baseline.capturedAt}) — ${baseline.pages} page(s), ${baseline.references} reference(s), ${baseline.failures ?? 0} failure(s)`,
    );
    console.log(
      `Current:  ${snapshot.pages} page(s), ${snapshot.references} reference(s), ${snapshot.failures} failure(s)`,
    );
    console.log(`\nExit: OK (0) — no drift against the frozen baseline.`);
    process.exitCode = auditExit ? 1 : 0;
  }
}