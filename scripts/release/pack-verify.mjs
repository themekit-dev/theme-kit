#!/usr/bin/env node
/**
 * Tarball verification for Theme Kit 1.0.0 (checklist item 3 / 19 / 20).
 *
 * For every publishable package:
 *  1. `pnpm pack` produces a real tarball in release-test/tarballs/
 *  2. The tarball is inspected:
 *     - package.json present and contains no `workspace:` specifiers
 *     - dist/ present
 *     - no src/, tests, coverage, node_modules, or local config leaked in
 *     - every exports target resolves to a file inside the tarball
 *     - every bin target resolves to a file inside the tarball
 *     - README.md and LICENSE present
 *
 * Usage: node scripts/release/pack-verify.mjs
 * Output: release-test/tarballs/*.tgz + console report
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));
const outDir = join(repoRoot, "release-test", "tarballs");

function readTarball(tarballPath) {
  // npm ships with a vendored tar; use the system tar (Windows 10+ has bsdtar)
  const out = execSync(`tar -tzf "${tarballPath.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split(/\r?\n/).filter(Boolean);
}

function tarballFile(tarballPath, entry) {
  const tmp = join(process.env.TEMP ?? "/tmp", `tk-untar-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  execSync(`tar -xzf "${tarballPath.replace(/"/g, '\\"')}" -C "${tmp.replace(/"/g, '\\"')}" "${entry}"`, {
    stdio: "pipe",
  });
  const content = readFileSync(join(tmp, entry), "utf8");
  rmSync(tmp, { recursive: true, force: true });
  return content;
}

const packages = [];
for (const base of ["packages", join("packages", "adapters")]) {
  const baseAbs = join(repoRoot, base);
  if (!existsSync(baseAbs)) continue;
  for (const entry of readdirSync(baseAbs)) {
    const dir = join(baseAbs, entry);
    const pkgPath = join(dir, "package.json");
    if (!existsSync(pkgPath)) continue;
    const json = JSON.parse(readFileSync(pkgPath, "utf8"));
    if (json.private) continue;
    packages.push({ dir, rel: relative(repoRoot, dir), json });
  }
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const report = [];
const SKIP_LEAK = /(^|\/)(src|test|tests|coverage|node_modules|\.changeset)\/|tsconfig|\.env|\.npmrc|vitest\.config|tsup\.config|\.prettier|\.eslint/;

for (const pkg of packages) {
  const rel = pkg.rel;
  try {
    // 1. pack
    const raw = execSync(`pnpm pack --pack-destination "${outDir}"`, {
      cwd: pkg.dir, encoding: "utf8",
    });
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const tgzLine = lines
      .map((l) => l.trim())
      .find((l) => l.endsWith(".tgz") && existsSync(l));
    if (!tgzLine) {
      report.push({ package: rel, ok: false, checks: [{ name: "pack", ok: false, detail: `tarball not found in output:\n${raw}` }] });
      continue;
    }
    const tarballPath = tgzLine;
    const entries = readTarball(tarballPath);
    const files = entries.filter((e) => !e.endsWith("/"));

    const checks = [];

    // package.json present
    const pkgJsonEntry = entries.find((e) => e === "package/package.json");
    checks.push({ name: "package.json", ok: !!pkgJsonEntry });

    // workspace specifiers
    const pkgJsonRaw = pkgJsonEntry
      ? tarballFile(tarballPath, "package/package.json")
      : "";
    const hasWorkspace = /"workspace:/.test(pkgJsonRaw);
    checks.push({ name: "no workspace:*", ok: !hasWorkspace, detail: hasWorkspace ? "found workspace: specifier in published package.json" : "" });

    // dist present
    checks.push({ name: "dist", ok: entries.some((e) => e.startsWith("package/dist/")) });

    // leakage (respect intentional files[] entries like astro src/*.astro)
    const intentionalFiles = (JSON.parse(pkgJsonRaw).files ?? []).filter(
      (f) => !f.includes("*") && !f.startsWith("!"),
    );
    const isIntentional = (f) =>
      intentionalFiles.some((i) => f === `package/${i}` || f.startsWith(`package/${i.replace(/\/$/, "")}/`));
    const leaked = files.filter((f) => SKIP_LEAK.test(f.replace(/^package\//, "")) && !isIntentional(f));
    checks.push({ name: "no src/tests", ok: leaked.length === 0, detail: leaked.slice(0, 5).join(", ") });

    // exports targets resolve inside tarball
    const exported = JSON.parse(pkgJsonRaw).exports ?? {};
    const missingTargets = [];
    for (const [subpath, def] of Object.entries(exported)) {
      const targets = typeof def === "string" ? [def] : Object.values(def).filter((v) => typeof v === "string");
      for (const t of targets) {
        const normalized = `package/${t.replace(/^\.\//, "")}`.replace(/\\/g, "/");
        const exists = entries.includes(normalized) || entries.some((e) => e.startsWith(normalized) && !e.endsWith("/"));
        if (!exists) missingTargets.push(`${subpath} -> ${t}`);
      }
    }
    checks.push({ name: "exports targets in tarball", ok: missingTargets.length === 0, detail: missingTargets.join("; ") });

    // bin targets resolve
    const bins = JSON.parse(pkgJsonRaw).bin ?? {};
    const missingBins = [];
    for (const [name, path] of Object.entries(bins)) {
      const normalized = `package/${path.replace(/^\.\//, "")}`.replace(/\\/g, "/");
      if (!entries.includes(normalized)) missingBins.push(`${name} -> ${path}`);
    }
    checks.push({ name: "bin targets in tarball", ok: missingBins.length === 0, detail: missingBins.join("; ") });

    // README + LICENSE
    checks.push({ name: "README", ok: entries.includes("package/README.md") });
    checks.push({ name: "LICENSE", ok: entries.includes("package/LICENSE") });

    const ok = checks.every((c) => c.ok);
    report.push({ package: rel, ok, fileCount: files.length, checks });
  } catch (err) {
    report.push({ package: rel, ok: false, error: err.message });
  }
}

console.log("\n=== TARBALL VERIFICATION ===\n");
const fails = report.filter((r) => !r.ok);
for (const r of report) {
  const status = r.ok ? "PASS" : "FAIL";
  console.log(`${status}  ${r.package}  (${r.fileCount ?? "-"} files)`);
  if (!r.ok) {
    for (const c of r.checks ?? []) {
      if (!c.ok) console.log(`     ✗ ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
    }
    if (r.error) console.log(`     ✗ ${r.error}`);
  }
}
console.log(`\n${report.length} packages packed, ${fails.length} failed`);
console.log(`Tarballs: ${outDir}`);

writeFileSync(join(outDir, "..", "pack-verify-report.json"), JSON.stringify(report, null, 2), "utf8");
process.exitCode = fails.length ? 1 : 0;
