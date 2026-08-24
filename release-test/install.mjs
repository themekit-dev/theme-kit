#!/usr/bin/env node
/**
 * Consumer install runner for release-test/ (checklist item 2).
 *
 * Re-generates each fixture app's package.json so that every @theme-kit/*
 * dependency points at a local tarball (file:../tarballs/<name>-1.0.0.tgz)
 * instead of the registry or workspace, then runs `npm install` in each app.
 *
 * Usage: node release-test/install.mjs
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const tarballsDir = join(here, "tarballs");

const APPS = ["vanilla-app", "react-app", "cli-app", "clean-app"];

function tarballFor(pkgName, version = "1.0.0") {
  const scope = pkgName.startsWith("@") ? pkgName.split("/")[0].replace("@", "") : "theme-kit";
  const unscoped = pkgName.startsWith("@") ? pkgName.split("/")[1] : pkgName;
  const file = `${scope}-${unscoped}-${version}.tgz`;
  const abs = join(tarballsDir, file);
  if (!existsSync(abs)) {
    throw new Error(`Missing tarball: ${file} — run "pnpm --filter <pkg> pack" or scripts/release/pack-verify.mjs first`);
  }
  return `file:../tarballs/${file}`;
}

const APPS_CONFIG = {
  "vanilla-app": {
    registryDeps: {},
    themeKitDeps: ["@theme-kit/core"],
  },
  "react-app": {
    registryDeps: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      typescript: "^5.9.0",
    },
    themeKitDeps: ["@theme-kit/core", "@theme-kit/react"],
  },
  "cli-app": {
    registryDeps: {},
    themeKitDeps: ["@theme-kit/cli", "@theme-kit/core"],
  },
  "clean-app": {
    registryDeps: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      typescript: "^5.9.0",
    },
    // @theme-kit/next depends on the whole adapter family (batteries included),
    // so a realistic Next.js consumer installs the full coherent set.
    themeKitDeps: [
      "@theme-kit/core",
      "@theme-kit/react",
      "@theme-kit/next",
      "@theme-kit/adapters",
      "@theme-kit/mui",
      "@theme-kit/chakra",
      "@theme-kit/antd",
      "@theme-kit/mantine",
      "@theme-kit/shadcn",
      "@theme-kit/bootstrap",
      "@theme-kit/daisyui",
      "@theme-kit/open-props",
      "@theme-kit/unocss",
    ],
  },
};

function writeAppPackageJson(app, config) {
  const dir = join(here, app);
  mkdirSync(dir, { recursive: true });
  const deps = { ...config.registryDeps };
  for (const pkg of config.themeKitDeps) {
    deps[pkg] = tarballFor(pkg);
  }
  const pkg = {
    name: `theme-kit-${app}`,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: app === "vanilla-app"
      ? { test: "node smoke.mjs && node smoke.cjs" }
      : app === "react-app"
        ? { test: "tsc --noEmit && node smoke-runtime.mjs" }
        : app === "cli-app"
          ? { test: "node test.mjs" }
          : { test: "tsc --noEmit" },
    dependencies: deps,
  };
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

for (const [app, config] of Object.entries(APPS_CONFIG)) {
  writeAppPackageJson(app, config);
  // No lockfile: package-lock.json pins tarball integrity hashes, which would
  // make reinstalls reuse stale cached tarballs after re-packing.
  execSync(`npm install --no-audit --no-fund --no-package-lock`, { cwd: join(here, app), stdio: "inherit" });
  console.log(`  done`);
}

console.log("\nAll fixture apps installed from local tarballs.");
