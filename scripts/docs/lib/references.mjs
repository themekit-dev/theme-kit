/**
 * Collects the (page, symbol, package) references the docs make.
 *
 * Reuses the existing snippet audit (scripts/release/snippet-audit.mjs) through
 * its additive `--json=` report, so the repo keeps exactly one snippet
 * extractor (§16 "extend it, do not replace it"; §14 forbids duplicated logic).
 */

import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { repoRoot, AUDIT_REL } from "./registry.mjs";

export function collectDocReferences() {
  const tmp = join(repoRoot, "scripts", "docs", ".audit-references.json");
  mkdirSync(join(repoRoot, "scripts", "docs"), { recursive: true });

  let auditExit = 0;
  try {
    execFileSync(process.execPath, [join(repoRoot, AUDIT_REL), `--json=${tmp}`], {
      cwd: repoRoot,
      encoding: "utf8",
    });
  } catch (err) {
    auditExit = err.status ?? 1;
  }

  const report = JSON.parse(readFileSync(tmp, "utf8"));
  rmSync(tmp, { force: true });

  const refs = [];
  for (const entry of report.entries) {
    const m = entry.import.match(/^(.*?) from "([^"]+)"$/);
    if (!m) continue; // framework-rule entries carry no import
    refs.push({
      page: entry.page,
      symbol: m[1],
      specifier: m[2],
      detail: entry.detail,
      ok: entry.ok,
    });
  }
  return { report, refs, auditExit };
}