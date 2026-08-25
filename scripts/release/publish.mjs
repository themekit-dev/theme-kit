#!/usr/bin/env node
/**
 * Publish all Theme Kit packages to npm in dependency order.
 *
 * Usage:
 *   node scripts/release/publish.mjs              # real publish (prompts for confirmation)
 *   node scripts/release/publish.mjs --dry-run    # run through the plan without publishing
 *   node scripts/release/publish.mjs --tag next   # publish with a dist-tag (e.g. "next")
 *
 * Notes:
 *  - Publishes with `--access public` (all packages are scoped @theme-kit/*).
 *  - Orders packages topologically (core → react → ... → next/astro/remix → adapters → docs),
 *    so every package's rewritten dependencies already exist on the registry.
 *  - Does NOT build — run `pnpm -r build` first. Uses the existing dist output.
 *  - `npm whoami` is checked up front; abort if not authenticated.
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const isDryRun = process.argv.includes("--dry-run");
const distTagArg = process.argv.find((a) => a.startsWith("--tag="));
const distTag = distTagArg ? distTagArg.split("=")[1] : undefined;

// --- collect publishable packages ---
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
    packages.push({ dir, name: json.name, json });
  }
}

const byName = new Map(packages.map((p) => [p.name, p]));

/** True when `name@version` is already on the npm registry. */
async function isPublished(name, version) {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`,
    );
    return res.ok;
  } catch {
    // Registry unreachable — assume not published so publish proceeds and the
    // error surfaces from pnpm itself.
    return false;
  }
}

// --- topological sort by workspace dependencies ---
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

// --- verify auth ---
if (!isDryRun) {
  try {
    const who = execSync("npm whoami", { encoding: "utf8" }).trim();
    console.log(`Authenticated as: ${who}`);
  } catch {
    console.error("Not authenticated with npm. Run `npm login` first.");
    process.exit(1);
  }
}

console.log(`\nPublish plan (${order.length} packages):`);
for (const name of order) console.log(`  ${name}`);

if (isDryRun) {
  console.log("\nDry run — nothing published. Re-run without --dry-run to publish.");
  process.exit(0);
}

console.log("\nPublishing...\n");
let ok = 0;
let skipped = 0;
for (const name of order) {
  const pkg = byName.get(name);

  // Skip versions already on the registry. A partially-completed publish (or
  // an interrupted run) can leave some packages at the target version while
  // others lag — re-publishing an existing version returns 403.
  const published = await isPublished(pkg.name, pkg.json.version);
  if (published) {
    console.log(`— ${name}@${pkg.json.version} already published, skipping`);
    skipped++;
    continue;
  }

  // `pnpm publish` (not `npm publish`): pnpm rewrites workspace:* dependencies
  // to the actual version in the published package.json; npm would ship the
  // literal "workspace:*" specifier and break every dependent package.
  const args = ["publish", "--access", "public", "--no-git-checks"];
  if (distTag) args.push("--tag", distTag);
  try {
    execSync(`pnpm ${args.join(" ")}`, {
      cwd: pkg.dir,
      encoding: "utf8",
      stdio: "inherit",
    });
    console.log(`\n✓ ${name}@${pkg.json.version}`);
    ok++;
  } catch (err) {
    console.error(`\n✗ ${name} failed: ${err.message}`);
    console.error("Stopping — remaining packages were not published.");
    process.exit(1);
  }
}

console.log(`\nPublished ${ok} new, skipped ${skipped} already-published.`);
console.log("\nNext steps:");
console.log("  npm install -g @theme-kit/cli && theme-kit --version");
console.log("  cd <clean dir> && npm install @theme-kit/core @theme-kit/react");
