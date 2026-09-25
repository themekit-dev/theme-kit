#!/usr/bin/env node
/**
 * Dependency-isolation release audit for Theme Kit.
 *
 * Enforces the TARGET dependency policy in scripts/release/dependency-policy.json
 * (NOT the current graph — this audit is expected to fail until the dependency
 * graph is cleaned up). Verifies, for every workspace package:
 *
 *  - direct dependency policy: every `dependencies` / `optionalDependencies` /
 *    `bundledDependencies` entry is allowed by the per-package allowlist;
 *    framework packages must not hard-depend on foreign framework packages
 *    (framework-leak) or on adapter packages (adapter-leak); adapters must not
 *    depend on other adapters (adapter-dep) or on framework packages
 *    (framework-dep).
 *  - peer dependency policy: every `peerDependencies` entry is in the
 *    per-package allowedPeers list (peer-dep), and every declared peer is
 *    justified — imported by src/** or referenced by the public .d.ts, unless
 *    listed in policy.companionPeers (unused-peer). An unjustified peer is a
 *    false compatibility claim: it tells consumers the package requires
 *    something it never uses.
 *  - third-party isolation: framework runtimes and design-system libraries
 *    (react, vue, @mui/*, tailwindcss, ...) must only ever appear in
 *    `peerDependencies` — never in dependencies/optionalDependencies/
 *    bundledDependencies (third-party-runtime). `@theme-kit/core` must have
 *    no deps or peers at all.
 *  - transitive graph: BFS over workspace `@theme-kit/*` dependencies starting
 *    from each package's *disallowed* direct deps. A package is blamed for
 *    framework/adapter packages its own disallowed edges pull in (transitive,
 *    with the full chain, e.g. @theme-kit/vue -> @theme-kit/shadcn ->
 *    @theme-kit/react). Packages pulled in through ALLOWED edges are the
 *    responsibility of that edge's own audit (trust boundary), so e.g. nuxt is
 *    not blamed for whatever vue's subtree contains.
 *  - source import boundary: every `@theme-kit/*` import in src/** must resolve
 *    (subpaths normalized) to the package itself or an allowed dependency
 *    (source-import).
 *
 * Methodology note: the transitive closure is a BFS over workspace package.json
 * `dependencies`/`optionalDependencies` edges. It does NOT parse pnpm-lock.yaml,
 * so it cannot see peer-resolution artifacts or third-party transitive graphs;
 * those are covered by the third-party-runtime and peer checks instead.
 *
 * Usage: node scripts/release/audit-dependencies.mjs
 * Output: console report + scripts/release/reports/audit-dependencies.json
 * Exit: 0 when clean, 1 on any violation (this is a release gate, not a linter).
 */

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));
const POLICY_REL = "scripts/release/dependency-policy.json";
const POLICY_PATH = join(repoRoot, POLICY_REL);

const PKG_DIRS = [
  "packages/*",
  "packages/adapters/*",
];

const HARD_DEP_KINDS = ["dependencies", "optionalDependencies", "bundledDependencies", "bundleDependencies"];

function globDirectories(pattern) {
  const globIdx = pattern.indexOf("*");
  const base = pattern.slice(0, globIdx); // e.g. "packages/" or "packages/adapters/"
  const baseAbs = join(repoRoot, base);
  if (!existsSync(baseAbs)) return [];
  const entries = [];
  for (const entry of readdirSync(baseAbs)) {
    if (entry.startsWith(".") || entry === "node_modules") continue;
    const full = join(baseAbs, entry);
    if (existsSync(join(full, "package.json"))) entries.push(full);
  }
  return entries.sort();
}

// Recursive file listing; skips node_modules, dist and .ignored* dirs.
function walkFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir).sort();
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.startsWith(".ignored") || entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

// --- unused-peer detection --------------------------------------------------
// A declared peer must be justified by the shipped runtime (imported somewhere
// in src/**) or by the public API surface (referenced by the built .d.ts).
// Anything else is an unjustified compatibility claim: it tells consumers the
// package requires something it never uses. Peers that a consumer's app supplies
// at runtime without being imported (react-dom, tailwindcss, ...) are listed in
// policy.companionPeers with a justification.
const SPECIFIER_RE = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\s+["']([^"']+)["']/g,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
];

function collectPeerSpecifiers(dir) {
  const specs = new Set();
  function walk(d, extRe) {
    let entries;
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry === "node_modules") continue;
      const full = join(d, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        walk(full, extRe);
      } else if (extRe.test(entry)) {
        let txt;
        try {
          txt = readFileSync(full, "utf8");
        } catch {
          continue;
        }
        for (const re of SPECIFIER_RE) {
          for (const m of txt.matchAll(re)) specs.add(m[1]);
        }
      }
    }
  }
  walk(join(dir, "src"), /\.(ts|tsx|js|mjs|cjs|svelte|vue|astro)$/);
  walk(join(dir, "dist"), /\.d\.ts$/);
  return specs;
}

function peerIsUsed(specs, peer) {
  for (const spec of specs) {
    if (spec === peer || spec.startsWith(`${peer}/`)) return true;
  }
  return false;
}

// --- workspace packages -----------------------------------------------------

const packages = [];
for (const pattern of PKG_DIRS) {
  for (const dir of globDirectories(pattern)) {
    const pkgJsonPath = join(dir, "package.json");
    if (!existsSync(pkgJsonPath)) continue;
    const json = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    packages.push({ dir, rel: relative(repoRoot, dir), json });
  }
}
packages.sort((a, b) => a.json.name.localeCompare(b.json.name));

const byName = new Map(packages.map((p) => [p.json.name, p]));

// --- policy -----------------------------------------------------------------

let policy;
try {
  policy = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
} catch (err) {
  console.error(`FATAL: cannot load ${POLICY_REL}: ${err.message}`);
  process.exit(1);
}

// Peers a consumer's app supplies at runtime without the package importing them.
const companionPeers = new Set(
  Object.keys(policy.companionPeers ?? {}).filter((k) => !k.startsWith("_")),
);

// --- enforcement engine (pure + deterministic so the policy round-trip check
// --- can re-run it on a re-parsed policy and compare) ------------------------

function matchesForbiddenThirdParty(policy, name) {
  for (const matcher of policy.thirdPartyForbiddenInRuntimeDeps ?? []) {
    if (matcher.endsWith("/*")) {
      if (name.startsWith(matcher.slice(0, -1))) return true; // scope prefix, e.g. "@mui/"
    } else if (name === matcher) {
      return true;
    }
  }
  return false;
}

// "@theme-kit/adapters/react" -> "@theme-kit/adapters"; "react" -> "react"
function basePackageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
}

function shortName(name) {
  return name.replace(/^@theme-kit\//, "");
}

function pairingType(pkgCat, depCat) {
  if (pkgCat === "framework" && depCat === "framework") return "framework-leak";
  if (pkgCat === "framework" && depCat === "adapter") return "adapter-leak";
  if (pkgCat === "adapter" && depCat === "adapter") return "adapter-dep";
  if (pkgCat === "adapter" && depCat === "framework") return "framework-dep";
  return "unapproved-dep";
}

function workspaceEdges(name) {
  const json = byName.get(name).json;
  const edges = [];
  for (const kind of ["dependencies", "optionalDependencies"]) {
    for (const dep of Object.keys(json[kind] ?? {})) {
      if (byName.has(dep)) edges.push(dep);
    }
  }
  return edges.sort();
}

function push(violations, record) {
  violations.push(record);
}

function compareViolations(a, b) {
  const ka = [a.package, a.type, a.dependency, (a.chain ?? []).join("->"), a.detail];
  const kb = [b.package, b.type, b.dependency, (b.chain ?? []).join("->"), b.detail];
  for (let i = 0; i < ka.length; i += 1) {
    if (ka[i] < kb[i]) return -1;
    if (ka[i] > kb[i]) return 1;
  }
  return 0;
}

function runAudit(policy) {
  const violations = [];
  const categoryOfName = new Map();
  for (const [category, members] of Object.entries(policy.categories ?? {})) {
    for (const name of members ?? []) categoryOfName.set(name, category);
  }

  // --- policy self-consistency ---
  for (const [category, members] of Object.entries(policy.categories ?? {})) {
    for (const name of members ?? []) {
      const other = categoryOfName.get(name);
      if (other && other !== category) {
        push(violations, {
          package: "(policy)",
          type: "policy",
          dependency: name,
          chain: null,
          detail: `listed in categories "${category}" and "${other}" — categories must be disjoint`,
        });
      }
    }
  }
  const policyNames = new Set(Object.keys(policy.packages ?? {}));
  for (const pkg of packages) {
    if (!policyNames.has(pkg.json.name)) {
      push(violations, {
        package: pkg.json.name,
        type: "policy",
        dependency: pkg.json.name,
        chain: null,
        detail: "workspace package missing from dependency-policy.json — policy must cover every package",
      });
    }
  }
  for (const name of policyNames) {
    if (!byName.has(name)) {
      push(violations, {
        package: "(policy)",
        type: "policy",
        dependency: name,
        chain: null,
        detail: "policy entry references a package that does not exist in the workspace",
      });
    }
  }

  const frameworkSet = new Set(policy.categories?.framework ?? []);
  const adapterSet = new Set(policy.categories?.adapter ?? []);

  for (const pkg of packages) {
    const { json, dir } = pkg;
    const name = json.name;
    const conf = policy.packages?.[name];
    if (!conf) continue; // already reported as a policy violation above

    const allowed = new Set(conf.allowedDependencies ?? []);
    const allowedPeers = new Set(conf.allowedPeers ?? []);
    const allowedList = [...allowed].join(", ") || "(none)";
    const pkgCat = categoryOfName.get(name) ?? "unknown";

    // --- hard dependencies (dependencies / optional / bundled) ---
    const directWorkspace = [];
    for (const kind of HARD_DEP_KINDS) {
      const kindDeps = json[kind];
      if (!kindDeps) continue;
      // bundledDependencies may be an array of names rather than a map
      const entries = Array.isArray(kindDeps)
        ? kindDeps.map((n) => [n, "(bundled)"])
        : Object.entries(kindDeps);
      for (const [dep, spec] of entries) {
        const isWorkspaceDep = byName.has(dep);
        // Track ALL direct workspace edges (allowed or not) for the
        // transitive closure; allowed direct edges are never blamed below.
        if (isWorkspaceDep && (kind === "dependencies" || kind === "optionalDependencies")) {
          directWorkspace.push(dep);
        }
        if (allowed.has(dep)) continue;
        if (isWorkspaceDep) {
          const depCat = categoryOfName.get(dep) ?? "unknown";
          const type = pairingType(pkgCat, depCat);
          const why = {
            "framework-leak": "framework package hard-depends on a DIFFERENT framework package",
            "adapter-leak": "framework package must not depend on adapter packages",
            "adapter-dep": "adapter depends on another adapter",
            "framework-dep": "adapter must not hard-depend on @theme-kit/react or any framework package",
            "unapproved-dep": `workspace dep not in allowedDependencies [${allowedList}]`,
          }[type];
          push(violations, {
            package: name,
            type,
            dependency: dep,
            chain: null,
            detail: `"${dep}" (${kind}: ${spec}) — ${why}`,
          });
        } else if (matchesForbiddenThirdParty(policy, dep)) {
          push(violations, {
            package: name,
            type: "third-party-runtime",
            dependency: dep,
            chain: null,
            detail: `"${dep}" (${kind}: ${spec}) — third-party runtime/design-system library must be a peerDependency, never a hard dependency`,
          });
        }
        // anything else (e.g. tslib) is not ecosystem-specific and is allowed
      }
    }
    const directWorkspaceSet = new Set(directWorkspace);

    // --- peer dependencies ---
    const peerSpecifiers = Object.keys(json.peerDependencies ?? {}).length
      ? collectPeerSpecifiers(dir)
      : new Set();
    for (const [peer, spec] of Object.entries(json.peerDependencies ?? {})) {
      if (!allowedPeers.has(peer)) {
        push(violations, {
          package: name,
          type: "peer-dep",
          dependency: peer,
          chain: null,
          detail: `peer "${peer}" (${spec}) is not in allowedPeers [${[...allowedPeers].join(", ") || "(none)"}]`,
        });
      }
      if (!companionPeers.has(peer) && !peerIsUsed(peerSpecifiers, peer)) {
        push(violations, {
          package: name,
          type: "unused-peer",
          dependency: peer,
          chain: null,
          detail: `peer "${peer}" (${spec}) is neither imported by src/** nor referenced by the public .d.ts — remove it or justify it in policy.companionPeers`,
        });
      }
    }

    // --- transitive closure (BFS over workspace edges from DISALLOWED direct
    // --- deps; allowed edges are the dependency's own audit responsibility) ---
    const disallowedRoots = directWorkspace.filter((d) => !allowed.has(d));
    const visited = new Set(disallowedRoots);
    const queue = disallowedRoots.map((d) => ({ node: d, chain: [d] }));
    const reported = new Set();
    while (queue.length) {
      const { node, chain } = queue.shift();
      const nodeCat = categoryOfName.get(node);
      const isLeak = node !== name && (frameworkSet.has(node) || adapterSet.has(node));
      if (isLeak && !directWorkspaceSet.has(node) && !reported.has(node)) {
        reported.add(node);
        push(violations, {
          package: name,
          type: "transitive",
          dependency: node,
          chain: [name, ...chain],
          detail: `closure reaches ${nodeCat} "${node}" via ${[name, ...chain].map(shortName).join(" -> ")}`,
        });
      }
      for (const next of workspaceEdges(node)) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ node: next, chain: [...chain, next] });
        }
      }
    }

    // --- source import boundary ---
    const srcDir = join(dir, "src");
    if (existsSync(srcDir)) {
      const importsByBase = new Map(); // base name -> { specs: Set, files: Set }
      // Match only real module specifiers (import/export/require/dynamic
      // import), not arbitrary quoted strings such as Angular InjectionToken
      // descriptions.
      const IMPORT_RE = [
        /\bfrom\s*["'](@theme-kit\/[^"']+)["']/g,
        /\bimport\s*\(\s*["'](@theme-kit\/[^"']+)["']\s*\)/g,
        /\bimport\s+["'](@theme-kit\/[^"']+)["']/g,
        /\brequire\s*\(\s*["'](@theme-kit\/[^"']+)["']\s*\)/g,
      ];
      for (const file of walkFiles(srcDir)) {
        if (!/\.(ts|tsx|js|mjs|cjs|svelte|vue|astro)$/.test(file)) continue;
        const txt = readFileSync(file, "utf8");
        for (const re of IMPORT_RE) {
          for (const m of txt.matchAll(re)) {
            const spec = m[1];
            const base = basePackageName(spec);
            if (base === name || allowed.has(base)) continue;
            const entry = importsByBase.get(base) ?? { specs: new Set(), files: new Set() };
            entry.specs.add(spec);
            entry.files.add(relative(dir, file));
            importsByBase.set(base, entry);
          }
        }
      }
      for (const [base, entry] of [...importsByBase.entries()].sort()) {
        const fileList = [...entry.files].sort();
        const shown = fileList.slice(0, 3).join(", ") + (fileList.length > 3 ? ` (+${fileList.length - 3} more)` : "");
        push(violations, {
          package: name,
          type: "source-import",
          dependency: base,
          chain: null,
          detail: `src imports "${[...entry.specs].sort().join('", "')}" in ${shown} — target not in allowedDependencies [${allowedList}]`,
        });
      }
    }
  }

  violations.sort(compareViolations);
  return violations;
}

// --- run + policy round-trip check -------------------------------------------

const violations = runAudit(policy);

// Round-trip: re-parse the policy file and re-run; enforcement must be
// identical (proves the allowlist is the single source of truth).
let reparsed;
try {
  reparsed = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
} catch (err) {
  console.error(`FATAL: cannot re-parse ${POLICY_REL}: ${err.message}`);
  process.exit(1);
}
const secondPass = runAudit(reparsed);
if (JSON.stringify(violations) !== JSON.stringify(secondPass)) {
  push(violations, {
    package: "(policy)",
    type: "policy",
    dependency: "round-trip",
    chain: null,
    detail: "re-loading dependency-policy.json produced different enforcement — policy is not deterministic",
  });
}

// --- console report ----------------------------------------------------------

console.log("\n=== THEME KIT DEPENDENCY ISOLATION AUDIT ===\n");
console.log(`Policy: ${POLICY_REL}`);
console.log(`Packages audited: ${packages.length}\n`);

const byPkg = new Map(packages.map((p) => [p.json.name, []]));
for (const v of violations) {
  if (!byPkg.has(v.package)) byPkg.set(v.package, []);
  byPkg.get(v.package).push(v);
}

for (const [name, list] of [...byPkg.entries()].sort()) {
  const status = list.length ? `FAIL (${list.length})` : "PASS";
  console.log(`${status.padEnd(10)} ${name}`);
  for (const v of list) {
    console.log(`   ✗ ${v.type} — ${v.detail}`);
  }
  console.log("");
}

console.log(`=== SUMMARY ===`);
console.log(`Total violations: ${violations.length}`);
console.log(`Violations by package:`);
for (const [name, list] of [...byPkg.entries()].sort()) {
  if (list.length) console.log(`  ${name}: ${list.length}`);
}
console.log(`Violations by type:`);
const byType = new Map();
for (const v of violations) {
  byType.set(v.type, (byType.get(v.type) ?? 0) + 1);
}
for (const [type, n] of [...byType.entries()].sort()) {
  console.log(`  ${type}: ${n}`);
}

// --- JSON report -------------------------------------------------------------

const outDir = join(here, "reports");
mkdirSync(outDir, { recursive: true });
const summary = {
  total: violations.length,
  byPackage: Object.fromEntries(
    [...byPkg.entries()]
      .filter(([, list]) => list.length)
      .sort()
      .map(([name, list]) => [name, list.length]),
  ),
  byType: Object.fromEntries([...byType.entries()].sort()),
};
writeFileSync(
  join(outDir, "audit-dependencies.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      policy: POLICY_REL,
      methodology:
        "transitive closure = BFS over workspace @theme-kit/* dependencies (dependencies + optionalDependencies) in package.json; pnpm-lock.yaml is not consulted",
      packagesAudited: packages.length,
      violations,
      summary,
    },
    null,
    2,
  ),
  "utf8",
);
console.log(`\nFull report: scripts/release/reports/audit-dependencies.json`);
console.log(`Exit: ${violations.length ? "FAIL (1)" : "OK (0)"} — this is a release gate, not a linter.`);
process.exitCode = violations.length ? 1 : 0;
