#!/usr/bin/env node
/**
 * Public API classification gate.
 *
 * Emits `docs/reference/public-api.json`: every shipped export of every
 * publishable package, classified.
 *
 * Authorities:
 *  - the published `exports` maps of every package (which entrypoints exist),
 *  - the *built* `.d.ts` (the consumer-facing surface),
 *  - public JSDoc/TSDoc tags (which decide INTERNAL / DEPRECATED),
 *  - the frozen manifest `scripts/release/api-manifest.json`, produced by
 *    `scripts/release/export-inventory.mjs` from those same `.d.ts` files.
 *
 * The manifest is treated as the exports authority and is cross-checked against
 * a fresh tag read; a disagreement is a hard failure (silent drift between the
 * frozen manifest and the classifier is exactly what this gate exists to catch).
 *
 * Classification:
 *   @internal tag                        -> INTERNAL
 *   @deprecated tag                      -> DEPRECATED
 *   explicit override (OVERRIDES)        -> the override
 *   package role default (ROLES)         -> CORE_/FRAMEWORK_/ADAPTER_/LOW_LEVEL_PUBLIC
 *   none of the above                    -> UNCLASSIFIED  (fails the build)
 *
 * Usage:
 *   node scripts/docs/public-api.mjs           # write docs/reference/public-api.json + gate
 *   node scripts/docs/public-api.mjs --check    # gate only, never write
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const MANIFEST_PATH = join(repoRoot, "scripts", "release", "api-manifest.json");
const OUT_PATH = join(repoRoot, "docs", "reference", "public-api.json");
const OUT_REL = "docs/reference/public-api.json";
const CONTRACT = "every shipped export must be classified";

/** The six allowed classes. */
const CLASSES = [
  "CORE_PUBLIC",
  "FRAMEWORK_PUBLIC",
  "ADAPTER_PUBLIC",
  "LOW_LEVEL_PUBLIC",
  "INTERNAL",
  "DEPRECATED",
];

/**
 * Package role defaults. A package's role is a property of the package, not of
 * a symbol: every export of `@theme-kit/core` is core runtime surface, every
 * export of a framework package is framework surface.
 */
const ROLES = {
  "@theme-kit/core": { role: "core", class: "CORE_PUBLIC" },
  "@theme-kit/web": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/react": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/next": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/vue": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/nuxt": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/svelte": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/solid": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/angular": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/astro": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/remix": { role: "framework", class: "FRAMEWORK_PUBLIC" },
  "@theme-kit/tailwind": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/mui": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/chakra": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/antd": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/mantine": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/shadcn": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/bootstrap": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/daisyui": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/open-props": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/unocss": { role: "adapter", class: "ADAPTER_PUBLIC" },
  "@theme-kit/adapters": { role: "adapter-toolkit", class: "LOW_LEVEL_PUBLIC" },
  "@theme-kit/cli": { role: "tooling", class: "LOW_LEVEL_PUBLIC" },
  "@theme-kit/devtools": { role: "tooling", class: "LOW_LEVEL_PUBLIC" },
};

/**
 * Symbol-level exceptions to the package role. Keep this list tiny and
 * justified: an override means "this export is public but is not part of the
 * package's normal surface".
 */
const OVERRIDES = {
  "@theme-kit/react:createThemeRoot": {
    class: "LOW_LEVEL_PUBLIC",
    reason: "React-SPA-only bootstrap helper (see .workbuddy-ai/memory/MEMORY.md)",
  },
};

const PROGRAM_OPTIONS = {
  skipLibCheck: true,
  skipDefaultLibCheck: true,
  noResolve: false,
  allowJs: true,
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
  types: [],
  baseUrl: repoRoot,
};

// ------------------------------------------------------------- helpers

function readdirSafe(p) {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

/**
 * Indexes workspace packages the same way export-inventory/jsdoc-audit do
 * (`packages/*`, `packages/adapters/*`, non-private) so a package is resolved
 * from its *source* manifest. Walking up from a `dist/**.d.ts` is not safe
 * here: ng-packagr emits its own `packages/angular/dist/package.json` with an
 * extra `"./package.json"` subpath, which is build output, not the source
 * manifest the authorities above call authoritative.
 */
function indexWorkspacePackages() {
  const byName = new Map();
  for (const base of ["packages", join("packages", "adapters")]) {
    const baseAbs = join(repoRoot, base);
    for (const entry of readdirSafe(baseAbs)) {
      const dir = join(baseAbs, entry);
      const pkgPath = join(dir, "package.json");
      if (!existsSync(pkgPath)) continue;
      let json;
      try {
        json = JSON.parse(readFileSync(pkgPath, "utf8"));
      } catch {
        continue;
      }
      if (json.private || !json.name) continue;
      byName.set(json.name, { dir, json });
    }
  }
  return byName;
}

/** Fallback for a package that does not live under `packages/**`. */
function packageDirOf(dtsPath) {
  let dir = dirname(resolve(repoRoot, dtsPath.replace(/\\/g, "/")));
  for (let i = 0; i < 6; i += 1) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * The declaration file a subpath resolves to, or null when the subpath is a
 * non-TypeScript asset (CSS, `.astro` component) and therefore has no exported
 * symbols to classify.
 */
function typesTargetOf(entryDir, target) {
  const t = typeof target === "string" ? target : (target.types ?? target.import ?? target.default);
  if (typeof t !== "string" || !t.endsWith(".d.ts")) return null;
  const abs = join(entryDir, t);
  return existsSync(abs) ? abs : null;
}

/**
 * Enumerates the consumer-facing surface of one built declaration entry point:
 * which names are values, which are types, and the JSDoc tags carried by the
 * declaration that *owns* each name (a barrel `export *` line carries no tags,
 * so tags must be read off the aliased symbol's own declarations).
 */
function readEntrySurface(entryFile) {
  const program = ts.createProgram([entryFile], PROGRAM_OPTIONS);
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(entryFile);
  if (!sf) return { error: `cannot load ${relative(repoRoot, entryFile)}` };
  const moduleSymbol = checker.getSymbolAtLocation(sf);
  if (!moduleSymbol) return { error: `no module symbol in ${relative(repoRoot, entryFile)}` };

  const names = new Map(); // name -> { value, type, tags:Set<string> }

  for (const sym of checker.getExportsOfModule(moduleSymbol)) {
    const name = sym.getName();
    let resolved = sym;
    let flags = sym.flags;
    if (flags & ts.SymbolFlags.Alias) {
      try {
        resolved = checker.getAliasedSymbol(sym);
        flags = resolved.flags;
      } catch {
        // keep alias flags; classified conservatively below
      }
    }

    const isValue = Boolean(
      flags &
        (ts.SymbolFlags.Value |
          ts.SymbolFlags.Class |
          ts.SymbolFlags.Function |
          ts.SymbolFlags.Variable |
          ts.SymbolFlags.Enum |
          ts.SymbolFlags.NamespaceModule |
          ts.SymbolFlags.RegularEnum |
          ts.SymbolFlags.ConstEnum),
    );
    const isType = Boolean(
      flags &
        (ts.SymbolFlags.Interface |
          ts.SymbolFlags.TypeAlias |
          ts.SymbolFlags.Class |
          ts.SymbolFlags.Enum |
          ts.SymbolFlags.NamespaceModule),
    );

    const tags = new Set();
    for (const decl of resolved.declarations ?? []) {
      for (const tag of ts.getJSDocTags(decl)) tags.add(tag.tagName.text);
    }

    names.set(name, {
      value: isValue || (!isValue && !isType),
      type: isType || (!isValue && !isType),
      tags,
    });
  }

  return { names };
}

/**
 * Mirrors the frozen manifest's convention (export-inventory.mjs): `default`
 * and `__*` are not enumerable named API surface.
 */
function isNamedSurface(name) {
  return name !== "default" && !name.startsWith("__");
}

/** Applies the §7 classification rules to one exported symbol. */
function classifySymbol(pkgName, name, tags) {
  if (tags.has("internal")) return { class: "INTERNAL", why: "@internal JSDoc tag" };
  if (tags.has("deprecated")) return { class: "DEPRECATED", why: "@deprecated JSDoc tag" };
  const override = OVERRIDES[`${pkgName}:${name}`];
  if (override) return { class: override.class, why: `override: ${override.reason}` };
  const role = ROLES[pkgName];
  if (role) return { class: role.class, why: `package role: ${role.role}` };
  return { class: "UNCLASSIFIED", why: "no @internal/@deprecated tag, no override, no package role" };
}

// ---------------------------------------------------------------- main

const checkOnly = process.argv.includes("--check");
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const workspacePackages = indexWorkspacePackages();

const table = {};
const unclassified = [];
const mismatches = [];
const skippedEntrypoints = [];
const excludedExports = [];
const byClass = Object.fromEntries(CLASSES.map((c) => [c, 0]));
let symbolCount = 0;
let entrypointCount = 0;

for (const pkgName of Object.keys(manifest).sort()) {
  const entry = manifest[pkgName];
  const workspacePkg = workspacePackages.get(pkgName);
  const pkgDir = workspacePkg?.dir ?? packageDirOf(entry.dts);
  if (!pkgDir) {
    mismatches.push(`${pkgName}: cannot locate the package directory that owns ${entry.dts}`);
    continue;
  }
  const pkgJson =
    workspacePkg?.json ?? JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  const exportsMap = pkgJson.exports ?? {};

  // entrypoint -> surface ({ names, dts })
  const surfaces = new Map();
  const rootDts = typesTargetOf(pkgDir, exportsMap["."] ?? {});
  if (!rootDts) {
    mismatches.push(`${pkgName}: the root entry resolves to no built .d.ts (${entry.dts}) — build the package first`);
    continue;
  }
  surfaces.set(".", { ...readEntrySurface(rootDts), dts: rootDts });

  // Ownership assert: the declaration the frozen manifest points at must be the
  // one this package's own exports map declares, or the classifier is auditing
  // a different artifact than the one that ships.
  const manifestDts = resolve(repoRoot, entry.dts.replace(/\\/g, "/"));
  if (resolve(rootDts) !== manifestDts) {
    mismatches.push(
      `${pkgName}: the frozen manifest points at ${entry.dts} but ${relative(repoRoot, join(pkgDir, "package.json"))} declares ${relative(repoRoot, rootDts)} — the manifest is stale; re-run scripts/release/export-inventory.mjs`,
    );
  }

  const computedSubpaths = [];
  for (const key of Object.keys(exportsMap)) {
    if (key === ".") continue;
    computedSubpaths.push(key);
    const abs = typesTargetOf(pkgDir, exportsMap[key]);
    if (!abs) {
      skippedEntrypoints.push({
        package: pkgName,
        entrypoint: key,
        reason: "non-TypeScript entrypoint (CSS or component asset) — no exported symbols",
      });
      continue;
    }
    surfaces.set(key, { ...readEntrySurface(abs), dts: abs });
  }

  // Invariant: this script's view of the entrypoints must equal the frozen
  // manifest's subpath list, or the classifier is auditing a different package
  // than the one that ships.
  const declaredSubpaths = [...(entry.exports.subpaths ?? [])].sort();
  computedSubpaths.sort();
  if (declaredSubpaths.join("|") !== computedSubpaths.join("|")) {
    mismatches.push(
      `${pkgName}: subpath list differs — frozen manifest [${declaredSubpaths.join(", ") || "none"}] vs exports map [${computedSubpaths.join(", ") || "none"}]`,
    );
  }

  const rows = {};
  for (const entryKey of [...surfaces.keys()].sort()) {
    const surface = surfaces.get(entryKey);
    if (surface.error) {
      mismatches.push(`${pkgName} ${entryKey}: ${surface.error}`);
      continue;
    }
    const row = {};
    for (const name of [...surface.names.keys()].sort()) {
      // Follow the frozen manifest's convention (export-inventory.mjs): a
      // `default` export and `__`-prefixed internals are not enumerable named
      // API surface, so they carry no documentation destination. Recorded in
      // $meta.excludedExports rather than dropped silently.
      if (!isNamedSurface(name)) {
        excludedExports.push({
          package: pkgName,
          entrypoint: entryKey,
          symbol: name,
          reason:
            "unnamed/private export — excluded from the frozen manifest's named surface (export-inventory.mjs skips `default` and `__*`)",
        });
        continue;
      }
      const info = surface.names.get(name);
      const verdict = classifySymbol(pkgName, name, info.tags);
      row[name] = verdict.class;
      byClass[verdict.class] += 1;
      symbolCount += 1;
      if (verdict.class === "UNCLASSIFIED") {
        unclassified.push({
          package: pkgName,
          entrypoint: entryKey,
          symbol: name,
          file: relative(repoRoot, surface.dts),
          why: verdict.why,
        });
      }
    }
    rows[entryKey] = row;
    entrypointCount += 1;
  }
  table[pkgName] = rows;

  // Cross-check the root surface against the frozen manifest: the manifest is
  // the exports authority, so a disagreement means the classifier has drifted.
  const root = surfaces.get(".");
  if (root && !root.error) {
    const tagPublic = new Set();
    const tagInternal = new Set();
    for (const [name, info] of root.names) {
      if (!isNamedSurface(name)) continue;
      (info.tags.has("internal") ? tagInternal : tagPublic).add(name);
    }
    const manPublic = new Set([...(entry.exports.values ?? []), ...(entry.exports.types ?? [])]);
    const manInternal = new Set([
      ...(entry.exports.internal?.values ?? []),
      ...(entry.exports.internal?.types ?? []),
    ]);
    const onlyIn = (a, b) => [...a].filter((n) => !b.has(n)).sort();
    const publicDiff = [...onlyIn(tagPublic, manPublic), ...onlyIn(manPublic, tagPublic)];
    const internalDiff = [...onlyIn(tagInternal, manInternal), ...onlyIn(manInternal, tagInternal)];
    if (publicDiff.length) {
      mismatches.push(`${pkgName}: public surface differs from the frozen manifest — [${publicDiff.join(", ")}]`);
    }
    if (internalDiff.length) {
      mismatches.push(`${pkgName}: @internal surface differs from the frozen manifest — [${internalDiff.join(", ")}]`);
    }
  }
}

// ------------------------------------------------------------- report

console.log("\n=== PUBLIC API CLASSIFICATION ===\n");
for (const pkgName of Object.keys(table).sort()) {
  const rows = table[pkgName];
  const counts = {};
  let total = 0;
  for (const row of Object.values(rows)) {
    for (const cls of Object.values(row)) {
      counts[cls] = (counts[cls] ?? 0) + 1;
      total += 1;
    }
  }
  const detail = CLASSES.filter((c) => counts[c])
    .map((c) => `${c}=${counts[c]}`)
    .join(" ");
  const role = ROLES[pkgName]?.role ?? "(no role)";
  console.log(
    `  [ok] ${pkgName}  role=${role}  ${Object.keys(rows).length} entrypoint(s), ${total} symbol(s)  ${detail}`,
  );
}

console.log(`\nPackages: ${Object.keys(table).length}`);
console.log(`Entrypoints classified: ${entrypointCount}`);
console.log(`Symbols classified: ${symbolCount}`);
for (const cls of CLASSES) console.log(`  ${cls.padEnd(17)} ${byClass[cls]}`);
if (skippedEntrypoints.length) {
  console.log(`\nSkipped entrypoints (no TypeScript surface): ${skippedEntrypoints.length}`);
  for (const s of skippedEntrypoints) console.log(`  - ${s.package} ${s.entrypoint}: ${s.reason}`);
}
if (excludedExports.length) {
  console.log(`\nExcluded exports (not named API surface): ${excludedExports.length}`);
  for (const e of excludedExports) console.log(`  - ${e.package} ${e.entrypoint}: ${e.symbol} (${e.reason})`);
}

const output = {
  $meta: {
    generatedBy: "scripts/docs/public-api.mjs",
    contract: CONTRACT,
    sourceManifest: "scripts/release/api-manifest.json",
    manifestAuthority: "scripts/release/export-inventory.mjs (built .d.ts surface)",
    schema: 'package name -> entrypoint ("." or a subpath) -> exported symbol -> classification',
    classes: CLASSES,
    packageRoles: Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v.role])),
    counts: {
      packages: Object.keys(table).length,
      entrypoints: entrypointCount,
      symbols: symbolCount,
      byClass,
    },
    skippedEntrypoints,
    excludedExports,
  },
  ...table,
};

if (!checkOnly) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`\nWritten: ${OUT_REL}`);
} else {
  console.log(`\n--check: ${OUT_REL} not written`);
}

// --- gate ---------------------------------------------------------------
console.log("");
if (mismatches.length) {
  console.log(`FAIL: ${mismatches.length} manifest/classifier disagreement(s) — ${CONTRACT}`);
  for (const m of mismatches) console.log(`  - ${m}`);
}
if (unclassified.length) {
  console.log(`FAIL: ${unclassified.length} unclassified export(s) — ${CONTRACT}`);
  for (const u of unclassified) {
    console.log(`  - ${u.symbol} (${u.package} ${u.entrypoint}, ${u.file})`);
    console.log(`      contract: ${CONTRACT}`);
    console.log(`      reason: ${u.why}`);
  }
  console.log(`  Add the symbol to OVERRIDES in scripts/docs/public-api.mjs, or tag it @internal.`);
}

if (mismatches.length || unclassified.length) {
  console.log(`\nExit: FAIL`);
  process.exitCode = 1;
} else {
  console.log(`OK: every shipped export is classified (${symbolCount} symbols, ${entrypointCount} entrypoints).`);
  console.log(`Exit: OK (0)`);
}