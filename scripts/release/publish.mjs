#!/usr/bin/env node
/**
 * Publish the Theme Kit packages to npm in dependency order.
 *
 * Usage:
 *   node scripts/release/publish.mjs --dry-run        # plan + preflight, publishes nothing
 *   node scripts/release/publish.mjs                  # real publish (asks for confirmation)
 *   node scripts/release/publish.mjs --yes            # real publish, no prompt (CI)
 *   node scripts/release/publish.mjs --tag next       # publish under a dist-tag
 *   node scripts/release/publish.mjs --tag=next       # same thing
 *   node scripts/release/publish.mjs --otp 123456     # one-time password for 2FA
 *   node scripts/release/publish.mjs --allow-dirty    # permit publishing an uncommitted tree
 *   node scripts/release/publish.mjs --verify         # run the release gates first
 *
 * Releases are **not lockstep** (see `VERSIONING.md`): one release legitimately
 * ships several versions side by side, so the plan prints `name@version` and a
 * version-boundary summary rather than a single number.
 *
 * What this script guarantees:
 *  - Publishes with `--access public` (every package is scoped `@theme-kit/*`).
 *  - Publishes in dependency order (topological over workspace deps + peers), so
 *    every package's rewritten dependencies already exist on the registry.
 *  - Uses `pnpm publish`, never `npm publish`: pnpm rewrites `workspace:^` to the
 *    real caret range; npm would ship the literal `workspace:^` specifier and
 *    break every dependent.
 *  - Skips a version that is already on the registry, so an interrupted run can
 *    be resumed without 403s.
 *  - Does NOT build. It *verifies* that `dist/` exists and that the built
 *    `dist/package.json` version matches the source, but run the build first.
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

/**
 * Run a command and capture its output.
 *
 * Deliberately not `execSync(cmd, { encoding: "utf8" })`: that spawns with
 * `stdio: "pipe"`, which some Windows hosts reject with `EBUSY`, silently
 * turning the clean-tree gate and the `npm whoami` check into no-ops. Shell
 * redirection into a temp file with `stdio: "inherit"` works everywhere.
 *
 * @returns `{ ok, out }` — `ok` is false when the command exited non-zero.
 */
function capture(cmd, cwd = repoRoot) {
  const tmp = join(
    tmpdir(),
    `theme-kit-publish-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`,
  );
  let ok = true;
  try {
    execSync(`${cmd} > "${tmp}" 2>&1`, { cwd, stdio: "inherit" });
  } catch {
    ok = false;
  }
  let out = "";
  try {
    out = readFileSync(tmp, "utf8");
  } catch {
    /* the command failed before writing anything */
  }
  try {
    rmSync(tmp, { force: true });
  } catch {
    /* best effort */
  }
  return { ok, out };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);

/** Accept both `--tag next` and `--tag=next`; reject a missing/blank value. */
function stringArg(name) {
  const inline = argv.find((a) => a.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const i = argv.indexOf(name);
  if (i !== -1) return argv[i + 1];
  return undefined;
}

const isDryRun = has("--dry-run");
const allowDirty = has("--allow-dirty");
const assumeYes = has("--yes");
const runVerify = has("--verify");
const otp = stringArg("--otp");
const distTag = stringArg("--tag");

const failures = [];
const warnings = [];

if (distTag !== undefined && !/^[a-z][a-z0-9.-]*$/i.test(distTag)) {
  failures.push(
    `--tag must be a valid npm dist-tag (letters, digits, ".", "-"), got "${distTag}"`,
  );
}

// ---------------------------------------------------------------------------
// Collect the publishable packages
// ---------------------------------------------------------------------------

const packages = [];
for (const base of ["packages", join("packages", "adapters")]) {
  const baseAbs = join(repoRoot, base);
  if (!existsSync(baseAbs)) continue;
  for (const entry of readdirSync(baseAbs)) {
    const dir = join(baseAbs, entry);
    const pkgPath = join(dir, "package.json");
    if (!existsSync(pkgPath)) continue;
    let json;
    try {
      json = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch (err) {
      failures.push(`${base}/${entry}/package.json is not valid JSON: ${err.message}`);
      continue;
    }
    if (json.private) continue;
    if (!json.name || !json.version) {
      failures.push(`${base}/${entry} is publishable but has no name/version`);
      continue;
    }
    packages.push({ dir, name: json.name, version: json.version, json });
  }
}

const byName = new Map(packages.map((p) => [p.name, p]));

// ---------------------------------------------------------------------------
// Topological order over workspace dependencies (deps first)
// ---------------------------------------------------------------------------

const visited = new Set();
const order = [];
function visit(pkg) {
  if (visited.has(pkg.name)) return;
  visited.add(pkg.name);
  const deps = [
    ...Object.keys(pkg.json.dependencies ?? {}),
    ...Object.keys(pkg.json.peerDependencies ?? {}),
  ].filter((d) => byName.has(d));
  for (const dep of deps) visit(byName.get(dep));
  order.push(pkg.name);
}
for (const pkg of packages) visit(pkg);
const ordered = order.map((n) => byName.get(n));

// ---------------------------------------------------------------------------
// Preflight — everything that would make the publish wrong or incomplete
// ---------------------------------------------------------------------------

/** True when `name@version` is already on the npm registry. */
async function registryVersion(name, version) {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`,
    );
    return res.ok;
  } catch {
    // Registry unreachable — assume not published so the publish proceeds and
    // the real error surfaces from pnpm itself.
    return false;
  }
}

/** The version `latest` currently points at, or `undefined` for a new package. */
async function registryLatest(name) {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`,
    );
    if (!res.ok) return undefined;
    return (await res.json()).version;
  } catch {
    return undefined;
  }
}

/** Minimal range check: caret, tilde, comparison, exact, `*`. */
function cmp(a, b) {
  const pa = String(a).split(/[.-]/).map((x) => Number(x) || 0);
  const pb = String(b).split(/[.-]/).map((x) => Number(x) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}
function satisfies(version, range) {
  if (!range || range === "*" || range === "latest") return true;
  return String(range)
    .trim()
    .split("||")
    .some((part) => {
      const m = part.trim().match(/^(\^|~|>=|>|<=|<|=)?\s*v?(\d+\.\d+\.\d+.*)$/);
      if (!m) return true;
      const [, op, ver] = m;
      const c = cmp(version, ver);
      if (op === "^") return String(version).split(".")[0] === ver.split(".")[0] && c >= 0;
      if (op === "~") {
        const [vmaj, vmin] = String(version).split(".").map(Number);
        const [maj, min] = ver.split(".").map(Number);
        return vmaj === maj && vmin === min && c >= 0;
      }
      if (op === ">=") return c >= 0;
      if (op === ">") return c > 0;
      if (op === "<=") return c <= 0;
      if (op === "<") return c < 0;
      return c === 0;
    });
}

for (const pkg of ordered) {
  const distDir = join(pkg.dir, "dist");

  // 1. Build output must exist — this script never builds.
  if (!existsSync(distDir) || readdirSync(distDir).length === 0) {
    failures.push(`${pkg.name}: no build output at ${pkg.dir}/dist — run the build first`);
  }

  // 2. A package that emits its own manifest (ng-packagr) must agree on the
  //    version, or the tarball ships a different version than package.json says.
  const distPkg = join(distDir, "package.json");
  if (existsSync(distPkg)) {
    try {
      const built = JSON.parse(readFileSync(distPkg, "utf8"));
      if (built.version !== pkg.version) {
        failures.push(
          `${pkg.name}: dist/package.json is ${built.version} but package.json is ${pkg.version} — rebuild`,
        );
      }
    } catch (err) {
      failures.push(`${pkg.name}: dist/package.json is not valid JSON: ${err.message}`);
    }
  }

  // 3. Internal deps must use caret ranges (`workspace:^`), never an exact pin —
  //    `audit-packages` enforces the same rule at release:audit.
  for (const [dep, range] of Object.entries(pkg.json.dependencies ?? {})) {
    if (!dep.startsWith("@theme-kit/")) continue;
    if (range === "workspace:*") {
      failures.push(
        `${pkg.name}: "${dep}": "${range}" is an exact pin — use "workspace:^" (VERSIONING.md)`,
      );
    } else if (!range.startsWith("workspace:") && byName.has(dep)) {
      // A literal range on a workspace package must still accept what we ship.
      const target = byName.get(dep);
      if (!satisfies(target.version, range)) {
        failures.push(
          `${pkg.name}: "${dep}": "${range}" does not accept ${dep}@${target.version} in this release`,
        );
      }
    }
  }
}

// 4. Publishing an uncommitted tree means the tarballs match no commit.
if (!allowDirty) {
  const { ok, out } = capture("git status --porcelain");
  if (!ok) {
    warnings.push("could not read `git status` — clean-tree check skipped");
  } else if (out.trim()) {
    const lines = out.trim().split("\n").length;
    failures.push(
      `working tree has ${lines} uncommitted change(s) — commit first, or pass --allow-dirty`,
    );
  }
}

// 5. A tracked file that also matches a `.gitignore` rule is still committed and
//    published — `.gitignore` has no effect on files git already tracks. This is
//    how seven `.playwright-mcp/*.yml` browser snapshots were committed by
//    accident: the ignore rule looked like protection but did nothing.
const ignored = capture("git ls-files --cached --ignored --exclude-standard");
if (ignored.ok && ignored.out.trim()) {
  const list = ignored.out.trim().split("\n");
  failures.push(
    `${list.length} tracked file(s) match a .gitignore rule and would be committed/published ` +
      `(gitignore does not apply to tracked files) — e.g. ${list[0]}`,
  );
}

// 6. Registry state — what a real run would skip, and any downgrade.
const registry = new Map();
for (const pkg of ordered) {
  registry.set(pkg.name, {
    published: await registryVersion(pkg.name, pkg.version),
    latest: await registryLatest(pkg.name),
  });
}
for (const pkg of ordered) {
  const { latest } = registry.get(pkg.name);
  if (latest && cmp(pkg.version, latest) < 0) {
    warnings.push(
      `${pkg.name}: publishing ${pkg.version} but the registry's "latest" is ${latest} — ` +
        `a plain publish would move "latest" backwards; consider --tag`,
    );
  }
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

const byVersion = new Map();
for (const pkg of ordered) {
  if (!byVersion.has(pkg.version)) byVersion.set(pkg.version, []);
  byVersion.get(pkg.version).push(pkg.name.replace("@theme-kit/", ""));
}

console.log(`\nPublish plan — ${ordered.length} packages, in dependency order:\n`);
for (const pkg of ordered) {
  const state = registry.get(pkg.name);
  const tags = [
    state.published ? "already published" : "",
    state.latest && cmp(pkg.version, state.latest) < 0 ? `registry latest ${state.latest}` : "",
  ].filter(Boolean);
  console.log(`  ${`${pkg.name}@${pkg.version}`.padEnd(38)}${tags.join(" · ")}`);
}

console.log("\nVersion boundary:");
for (const version of [...byVersion.keys()].sort((a, b) => cmp(b, a))) {
  const list = byVersion.get(version).sort();
  console.log(`  ${version.padEnd(8)} ${String(list.length).padStart(2)}  ${list.join(", ")}`);
}

const toPublish = ordered.filter((p) => !registry.get(p.name).published);
console.log(
  `\n${toPublish.length} to publish, ${ordered.length - toPublish.length} already on the registry.`,
);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (failures.length) {
  console.log("\nPreflight failures:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  if (isDryRun) {
    console.log("\nDry run — the failures above would block a real publish.");
    process.exit(0);
  }
  console.error("\nAborting — fix the preflight failures above.");
  process.exit(1);
}

if (isDryRun) {
  console.log("\nPreflight passed. Dry run — nothing published.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Gates (opt-in) + confirmation
// ---------------------------------------------------------------------------

if (runVerify) {
  console.log("\nRunning the release gates (--verify)...\n");
  for (const cmd of ["npm run release:audit", "npm run docs:api:check"]) {
    try {
      execSync(cmd, { cwd: repoRoot, stdio: "inherit" });
      console.log(`✓ ${cmd}`);
    } catch {
      console.error(`\n✗ ${cmd} failed — aborting before any publish.`);
      process.exit(1);
    }
  }
}

const who = capture("npm whoami");
if (!who.ok || !who.out.trim()) {
  console.error("\nNot authenticated with npm. Run `npm login` first.");
  if (who.out.trim()) console.error(`  npm said: ${who.out.trim().split("\n")[0]}`);
  process.exit(1);
}
console.log(`\nAuthenticated as: ${who.out.trim()}`);

if (!assumeYes) {
  if (!process.stdin.isTTY) {
    console.error(
      "\nRefusing to publish without confirmation. Re-run with --yes, or from a terminal.",
    );
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((res) =>
    rl.question(
      `\nPublish ${toPublish.length} package(s) to npm${distTag ? ` under tag "${distTag}"` : ""}? [y/N] `,
      res,
    ),
  );
  rl.close();
  if (!/^y(es)?$/i.test(answer.trim())) {
    console.log("Aborted — nothing published.");
    process.exit(0);
  }
}

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------

console.log("\nPublishing...\n");
let ok = 0;
let skipped = 0;
for (const pkg of ordered) {
  if (registry.get(pkg.name).published) {
    console.log(`— ${pkg.name}@${pkg.version} already published, skipping`);
    skipped++;
    continue;
  }

  // `pnpm publish` (not `npm publish`): pnpm rewrites `workspace:^` to the real
  // caret range; npm would ship the literal specifier and break dependents.
  const args = ["publish", "--access", "public", "--no-git-checks"];
  if (distTag) args.push("--tag", distTag);
  if (otp) args.push("--otp", otp);

  try {
    execSync(`pnpm ${args.join(" ")}`, { cwd: pkg.dir, stdio: "inherit" });
    console.log(`\n✓ ${pkg.name}@${pkg.version}`);
    ok++;
  } catch (err) {
    console.error(`\n✗ ${pkg.name}@${pkg.version} failed: ${err.message}`);
    console.error(
      "Stopping — remaining packages were not published. " +
        "Fix the cause and re-run; already-published versions are skipped.",
    );
    process.exit(1);
  }
}

console.log(`\nPublished ${ok} new, skipped ${skipped} already-published.`);
console.log("\nNext steps:");
console.log("  git tag v<version> && git push --follow-tags   # tag the commit you published");
console.log("  npm install -g @theme-kit/cli && theme-kit --version");
console.log("  cd <clean dir> && npm install @theme-kit/core @theme-kit/react");
