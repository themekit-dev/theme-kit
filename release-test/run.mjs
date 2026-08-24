#!/usr/bin/env node
/**
 * One-shot consumer verification for Theme Kit 1.0.0:
 *  1. pack all packages into release-test/tarballs (and verify contents)
 *  2. install vanilla-app + react-app + cli-app + clean-app from those tarballs (npm, no lockfile)
 *  3. run each app's test suite
 *
 * Usage: node release-test/run.mjs
 */

import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}  (${cwd})`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

run(`node ${join("scripts", "release", "pack-verify.mjs")}`, root);
run(`node ${join("release-test", "install.mjs")}`, root);
for (const app of ["vanilla-app", "react-app", "cli-app", "clean-app"]) {
  run(`npm run test`, join(here, app));
}
console.log("\n=== consumer verification complete ===");
