#!/usr/bin/env node
/**
 * Package release audit for Theme Kit 1.0.0.
 *
 * Verifies, for every workspace package:
 *  - package.json metadata (name, version, license, description, repository,
 *    homepage, bugs, keywords, engines)
 *  - exports map targets resolve to files that exist
 *  - files[] entries exist
 *  - dist entry files exist (index.js / index.cjs / index.d.ts)
 *  - bin targets exist
 *  - workspace:* dependencies resolve to packages that can be published
 *    (i.e. not `private: true`)
 *  - framework-neutral packages don't hard-depend on framework packages
 *  - version coherence (everything should be 1.0.0 for a coherent release)
 *
 * Usage: node scripts/release/audit-packages.mjs
 * Output: console report + scripts/release/reports/audit.json
 */

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const PKG_DIRS = [
  "packages/*",
  "packages/adapters/*",
];

function globDirectories(pattern) {
  const globIdx = pattern.indexOf("*");
  const base = pattern.slice(0, globIdx); // e.g. "packages/" or "packages/adapters/"
  const baseAbs = join(repoRoot, base);
  if (!existsSync(baseAbs)) return [];
  const entries = [];
  for (const entry of readdirSync(baseAbs)) {
    const full = join(baseAbs, entry);
    if (existsSync(join(full, "package.json"))) entries.push(full);
  }
  return entries.sort();
}

function readDir(p) {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

const packages = [];
for (const pattern of PKG_DIRS) {
  for (const dir of globDirectories(pattern)) {
    const pkgJsonPath = join(dir, "package.json");
    if (!existsSync(pkgJsonPath)) continue;
    const json = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    packages.push({ dir, rel: relative(repoRoot, dir), json });
  }
}

const byName = new Map(packages.map((p) => [p.json.name, p]));

const FRAMEWORK_PKGS = new Set([
  "@theme-kit/react",
  "@theme-kit/next",
  "@theme-kit/vue",
  "@theme-kit/nuxt",
  "@theme-kit/svelte",
  "@theme-kit/solid",
  "@theme-kit/angular",
  "@theme-kit/astro",
  "@theme-kit/remix",
]);

const FRAMEWORK_RUNTIMES = new Set([
  "react",
  "react-dom",
  "vue",
  "svelte",
  "solid-js",
  "@angular/core",
  "@angular/common",
  "next",
  "nuxt",
]);

const REQUIRED_METADATA = [
  "description",
  "license",
  "repository",
  "homepage",
  "bugs",
  "keywords",
  "files",
];

const report = [];

function check(rel, label, ok, detail = "") {
  report.push({ package: rel, check: label, ok, detail });
}

function exists(p) {
  return existsSync(p);
}

function collectDeps(json) {
  const out = [];
  for (const key of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [name, version] of Object.entries(json[key] ?? {})) {
      out.push({ name, version, kind: key });
    }
  }
  return out;
}

for (const pkg of packages) {
  const { json, rel, dir } = pkg;
  const publishable = !json.private;

  // --- identity ---
  check(rel, "name", Boolean(json.name), json.name ?? "MISSING");
  check(rel, "version", Boolean(json.version), json.version ?? "MISSING");
  check(rel, "version=1.0.0", json.version === "1.0.0", json.version ?? "MISSING");

  // CLI version constant must match the package version (theme-kit --version)
  if (rel === "packages\\cli" || rel === "packages/cli") {
    const versionSrc = join(dir, "src", "version.ts");
    if (existsSync(versionSrc)) {
      const src = readFileSync(versionSrc, "utf8");
      const m = src.match(/export const VERSION = "([^"]+)"/);
      check(
        rel,
        "cli:VERSION-matches-package.json",
        m?.[1] === json.version,
        `version.ts says "${m?.[1] ?? "?"}", package.json says "${json.version}"`,
      );
    }
  }

  // --- metadata ---
  for (const field of REQUIRED_METADATA) {
    const has = json[field] !== undefined && json[field] !== "";
    if (publishable) {
      check(rel, `metadata:${field}`, has);
    }
  }
  if (publishable && json.description && json.description.length > 120) {
    check(rel, "description:short", false, `description is ${json.description.length} chars`);
  }
  if (publishable && !json.keywords?.length) {
    check(rel, "metadata:keywords", false, "keywords array is empty");
  }

  // --- module format ---
  check(rel, "type:module", json.type === "module", json.type ?? "MISSING");
  if (publishable) {
    check(rel, "main:exists", exists(join(dir, json.main ?? "__missing__")), json.main ?? "MISSING");
    if (json.module) check(rel, "module:exists", exists(join(dir, json.module)), json.module);
    check(rel, "types:exists", exists(join(dir, json.types ?? "__missing__")), json.types ?? "MISSING");
  }

  // --- files[] ---
  for (const file of json.files ?? []) {
    const target = join(dir, file);
    // files entries may be glob-ish (e.g. "dist") — only check literal paths
    if (!file.includes("*") && !file.includes("!")) {
      check(rel, `files:${file}`, exists(target));
    }
  }
  if (publishable && !(json.files ?? []).some((f) => f === "dist" || f.startsWith("dist/"))) {
    check(rel, "files:dist", false, "files[] does not include dist");
  }

  // --- exports map ---
  const exportsMap = json.exports ?? {};
  const exportPaths = Object.keys(exportsMap);
  for (const subpath of exportPaths) {
    const target = exportsMap[subpath];
    if (typeof target === "string") {
      const p = join(dir, target);
      check(rel, `exports:${subpath}`, exists(p), target);
      continue;
    }
    for (const [cond, file] of Object.entries(target)) {
      if (cond === "types" || cond === "import" || cond === "require" || cond === "default") {
        const p = join(dir, file);
        check(rel, `exports:${subpath}:${cond}`, exists(p), file);
      }
    }
  }

  // --- dist entry files ---
  const distDir = join(dir, "dist");
  if (existsSync(distDir)) {
    // Standard tsup layout; Angular (ng-packagr) uses dist/fesm2022 + dist/types.
    const isNgPackagr = json.main?.includes("/fesm") || json.types?.includes("/types/");
    if (!isNgPackagr) {
      check(rel, "dist:index.js", exists(join(distDir, "index.js")));
      check(rel, "dist:index.d.ts", exists(join(distDir, "index.d.ts")));
    }
    const hasRequire = Object.values(exportsMap).some((v) =>
      v && typeof v === "object" && v.require,
    );
    if (hasRequire) {
      check(rel, "dist:index.cjs", exists(join(distDir, "index.cjs")));
    }
    const hasCjs = exists(join(distDir, "index.cjs"));
    if (hasCjs && !hasRequire && !isNgPackagr) {
      check(rel, "exports:require-missing", false, "dist/index.cjs exists but exports map has no require condition (dead artifact or missing dual-support)");
    }
  } else {
    check(rel, "dist:dir", false, "no dist directory");
  }

  // --- bin ---
  for (const [binName, binPath] of Object.entries(json.bin ?? {})) {
    check(rel, `bin:${binName}`, exists(join(dir, binPath)), binPath);
    // npm 11 rejects bin paths with a leading "./"
    check(rel, `bin:${binName}:format`, !binPath.startsWith("./"), `bin path should omit "./" (npm 11 drops it): "${binPath}"`);
  }
  if (json.bin && !json.files?.includes("dist")) {
    // bin is in dist, which is covered by files; no extra check needed
  }

  // --- dependencies ---
  for (const dep of collectDeps(json)) {
    if (dep.version === "workspace:*" || dep.version === "workspace:^") {
      const target = byName.get(dep.name);
      if (!target) {
        check(rel, `dep:${dep.name}`, false, `workspace dep points at unknown package (${dep.kind})`);
      } else if (target.json.private) {
        check(
          rel,
          `dep:${dep.name}:private`,
          false,
          `${dep.kind} depends on private package "${dep.name}" — publish will break`,
        );
      } else {
        check(rel, `dep:${dep.name}:workspace`, true, `${dep.kind}`);
      }
      continue;
    }
    if (dep.version.startsWith("workspace")) {
      check(rel, `dep:${dep.name}:workspace-form`, false, `unusual workspace specifier "${dep.version}"`);
    }
    // framework-neutral package must not depend on framework packages
    const isFramework = FRAMEWORK_PKGS.has(json.name);
    if (!isFramework && FRAMEWORK_PKGS.has(dep.name)) {
      check(rel, `dep:${dep.name}:framework-leak`, false, `non-framework package depends on framework package ${dep.name}`);
    }
    // adapter packages depending on react (framework) are expected only when they have react peer deps
    const isAdapterFactory = dep.name.endsWith("/factory") || rel.startsWith("packages/adapters");
    void isAdapterFactory;
  }

  // --- subpath/source consistency ---
  // every exports subpath (other than .) should have a matching source file,
  // except static assets (.css, .astro) which are shipped verbatim
  const STATIC_ASSET = /\.(css|astro|svg|json)$/;
  for (const subpath of exportPaths) {
    if (subpath === ".") continue;
    const targetDef = exportsMap[subpath];
    const targetFile = typeof targetDef === "string" ? targetDef : (targetDef?.import ?? targetDef?.default ?? "");
    if (STATIC_ASSET.test(targetFile)) continue;
    const name = subpath.replace(/^\.\//, "").split(".")[0];
    const srcCandidates = [
      join(dir, "src", `${name}.ts`),
      join(dir, "src", `${name}.tsx`),
      join(dir, "src", `${name}`, "index.ts`"),
    ];
    const hasSrc = srcCandidates.some((p) => existsSync(p));
    if (!hasSrc) {
      const noExt = subpath.replace(/^\.\//, "");
      void noExt;
      const base = targetFile.replace(/^\.\/dist\//, "").replace(/\.(js|cjs|d\.ts)$/, "");
      const altCandidates = [
        join(dir, "src", `${base}.ts`),
        join(dir, "src", `${base}.tsx`),
        join(dir, "src", `${base}`, "index.ts"),
      ];
      if (!altCandidates.some((p) => existsSync(p))) {
        check(rel, `exports:${subpath}:source`, false, `no src/${base}.ts found for subpath`);
      }
    }
  }
}

// --- cross-package: framework runtimes in dependencies of neutral packages ---
for (const pkg of packages) {
  if (FRAMEWORK_PKGS.has(pkg.json.name)) continue;
  for (const dep of collectDeps(pkg.json)) {
    if (FRAMEWORK_RUNTIMES.has(dep.name) && dep.kind === "dependencies") {
      check(pkg.rel, `dep:${dep.name}:runtime`, false, `framework runtime "${dep.name}" in dependencies of neutral package`);
    }
  }
}

// --- summary ---
const fails = report.filter((r) => !r.ok);
const warns = report.filter((r) => !r.ok && !r.check.startsWith("dep:") && !r.check.startsWith("exports:") && !r.check.startsWith("bin:"));

console.log("\n=== THEME KIT PACKAGE AUDIT ===\n");
console.log(`Packages audited: ${packages.length}\n`);

const byPkg = new Map();
for (const r of report) {
  if (!byPkg.has(r.package)) byPkg.set(r.package, []);
  byPkg.get(r.package).push(r);
}

for (const [rel, checks] of [...byPkg.entries()].sort()) {
  const bad = checks.filter((c) => !c.ok);
  const status = bad.length ? `FAIL (${bad.length})` : "PASS";
  console.log(`\n${status.padEnd(10)} ${rel}`);
  if (bad.length) {
    for (const b of bad) {
      console.log(`   ✗ ${b.check} — ${b.detail}`);
    }
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total checks: ${report.length}`);
console.log(`Failures: ${fails.length}`);
console.log(`Failures by package:`);
const failByPkg = new Map();
for (const f of fails) {
  if (!failByPkg.has(f.package)) failByPkg.set(f.package, []);
  failByPkg.get(f.package).push(f.check);
}
for (const [rel, checks] of [...failByPkg.entries()].sort()) {
  console.log(`  ${rel}: ${checks.length}`);
}

const outDir = join(here, "reports");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "audit.json"), JSON.stringify({ packages, report }, null, 2), "utf8");
console.log(`\nFull report: scripts/release/reports/audit.json`);
process.exitCode = fails.length ? 1 : 0;
