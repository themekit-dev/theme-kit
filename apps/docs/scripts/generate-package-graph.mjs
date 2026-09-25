#!/usr/bin/env node
/**
 * Generate `lib/generated/package-graph.ts` from the monorepo manifests.
 *
 * `/package-map` is a reference page, so its structural claims — what depends on
 * what, who uses a package, which subpaths a package exports, what to install —
 * must come from `packages/**​/package.json` rather than from prose that rots.
 * Only the editorial layer (role, use cases, primary APIs) is hand-written, in
 * `lib/package-map.ts`.
 *
 *   node scripts/generate-package-graph.mjs           # write
 *   node scripts/generate-package-graph.mjs --check   # verify (CI gate)
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const PACKAGES = join(repoRoot, "packages");
const OUT = join(here, "..", "lib", "generated", "package-graph.ts");

/** Every package directory, including the UI adapters under packages/adapters. */
function packageDirs() {
  const dirs = [];
  for (const entry of readdirSync(PACKAGES, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "adapters") {
      for (const sub of readdirSync(join(PACKAGES, "adapters"), { withFileTypes: true })) {
        if (sub.isDirectory()) dirs.push(`adapters/${sub.name}`);
      }
    } else {
      dirs.push(entry.name);
    }
  }
  return dirs.sort();
}

function collect() {
  const rows = [];
  for (const dir of packageDirs()) {
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(join(PACKAGES, dir, "package.json"), "utf8"));
    } catch {
      continue;
    }
    if (!pkg.name) continue;

    const deps = Object.keys(pkg.dependencies ?? {});
    const peers = Object.keys(pkg.peerDependencies ?? {});
    const internalDeps = [...new Set([...deps, ...peers])]
      .filter((d) => d.startsWith("@theme-kit/"))
      .sort();

    const exportsMap = pkg.exports && typeof pkg.exports === "object" ? pkg.exports : {};
    const subpaths = Object.keys(exportsMap)
      .filter((k) => k !== ".")
      .sort();

    rows.push({
      name: pkg.name,
      version: pkg.version ?? "0.0.0",
      dir,
      description: pkg.description ?? "",
      // `@theme-kit/adapters` lives in packages/adapters/shared.
      repoDir: dir === "adapters/shared" ? "packages/adapters/shared" : `packages/${dir}`,
      internalDeps,
      externalPeers: peers.filter((d) => !d.startsWith("@theme-kit/")).sort(),
      subpaths,
      hasBin: !!pkg.bin,
      entry: pkg.main ?? "./dist/index.js",
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));

  const usedBy = {};
  for (const row of rows) {
    for (const dep of row.internalDeps) (usedBy[dep] ??= []).push(row.name);
  }
  for (const row of rows) row.usedBy = (usedBy[row.name] ?? []).sort();

  return rows;
}

function render(rows) {
  const body = rows
    .map((r) => {
      const list = (arr) => (arr.length ? arr.map((s) => JSON.stringify(s)).join(", ") : "");
      return [
        "  {",
        `    name: ${JSON.stringify(r.name)},`,
        `    version: ${JSON.stringify(r.version)},`,
        `    dir: ${JSON.stringify(r.dir)},`,
        `    repoDir: ${JSON.stringify(r.repoDir)},`,
        `    description: ${JSON.stringify(r.description)},`,
        `    internalDeps: [${list(r.internalDeps)}],`,
        `    usedBy: [${list(r.usedBy)}],`,
        `    externalPeers: [${list(r.externalPeers)}],`,
        `    subpaths: [${list(r.subpaths)}],`,
        `    hasBin: ${r.hasBin},`,
        "  },",
      ].join("\n");
    })
    .join("\n");

  return `/**
 * GENERATED FILE — do not edit.
 *
 * Produced by \`apps/docs/scripts/generate-package-graph.mjs\` from the
 * \`package.json\` manifests under \`packages/\`. Regenerate with
 * \`pnpm --filter @theme-kit/docs packages:generate\`; \`packages:check\` fails
 * when this drifts.
 *
 * Consumed by \`/package-map\` and merged with the editorial layer in
 * \`lib/package-map.ts\`.
 */

export type PackageGraphEntry = {
  /** Published package name, e.g. \`@theme-kit/core\`. */
  name: string;
  version: string;
  /** Directory under \`packages/\`, e.g. \`adapters/mui\`. */
  dir: string;
  /** Repository path, e.g. \`packages/adapters/mui\`. */
  repoDir: string;
  description: string;
  /** Other @theme-kit packages this one depends on (dependencies + peerDependencies). */
  internalDeps: string[];
  /** @theme-kit packages that depend on this one. */
  usedBy: string[];
  /** Third-party peer dependencies (react, vue, tailwindcss, …). */
  externalPeers: string[];
  /** Extra export subpaths (excluding "."), e.g. \`./client\`. */
  subpaths: string[];
  /** True when the package ships a binary. */
  hasBin: boolean;
};

export const PACKAGE_GRAPH: PackageGraphEntry[] = [
${body}
];
`;
}

function main() {
  const check = process.argv.includes("--check");
  const rows = collect();
  if (rows.length === 0) throw new Error("collected 0 packages — the collector is broken");

  const next = render(rows);

  let current = null;
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* first run */
  }

  if (check) {
    if (current !== next) {
      console.error(
        "lib/generated/package-graph.ts is out of date. Run: pnpm --filter @theme-kit/docs packages:generate",
      );
      process.exit(1);
    }
    console.log(`Package graph is in sync (${rows.length} packages).`);
    return;
  }

  if (current === next) {
    console.log(`Package graph already up to date (${rows.length} packages).`);
    return;
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, next);
  console.log(`Wrote lib/generated/package-graph.ts — ${rows.length} packages.`);
}

main();
