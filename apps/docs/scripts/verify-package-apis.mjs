#!/usr/bin/env node
/**
 * Verify that every `primaryApis` entry in `lib/package-map.ts` is a real export
 * of the package it is listed under.
 *
 * `/package-map` is a reference page, so a renamed or invented export is a
 * factual error a reader would hit immediately. The page cannot typecheck its
 * way to correctness — the names live in plain string arrays — so they are
 * checked against each package's built `dist` instead.
 *
 *   node scripts/verify-package-apis.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const MAP = join(here, "..", "lib", "package-map.ts");
const GRAPH = join(here, "..", "lib", "generated", "package-graph.ts");

/** package name → primaryApis, parsed from the editorial layer. */
function parseEditorial(source) {
  const out = new Map();
  const entry = /"(@theme-kit\/[a-z-]+)":\s*\{([\s\S]*?)\n  \},/g;
  let m;
  while ((m = entry.exec(source))) {
    const name = m[1];
    const body = m[2];
    const apis = /primaryApis:\s*\[([\s\S]*?)\]/.exec(body);
    if (!apis) continue;
    const names = [...apis[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    out.set(name, names);
  }
  return out;
}

/** package name → { dir, hasBin } from the generated graph. */
function parseGraph(source) {
  const out = new Map();
  const entry = /\{\s*name:\s*"(@theme-kit\/[a-z-]+)",[\s\S]*?dir:\s*"([^"]+)"/g;
  let m;
  while ((m = entry.exec(source))) out.set(m[1], { dir: m[2] });
  return out;
}

/**
 * `exportsUsed` per concept example, from the generated examples file.
 * Each name must exist on at least one of that example's declared packages.
 */
function parseExampleExports(source) {
  const out = [];
  const blocks = source.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    if (!block.includes('kind: "concept"')) continue;
    const feature = /feature: "([^"]+)"/.exec(block)?.[1];
    const framework = /framework: "([^"]+)"/.exec(block)?.[1];
    const packages = /packages: \[([^\]]*)\]/.exec(block)?.[1];
    const used = /exportsUsed: \[([^\]]*)\]/.exec(block)?.[1];
    if (!feature || !used) continue;
    out.push({
      label: `${feature}/${framework}`,
      packages: [...(packages ?? "").matchAll(/"([^"]+)"/g)].map((x) => x[1]),
      names: [...used.matchAll(/"([^"]+)"/g)].map((x) => x[1]),
    });
  }
  return out;
}

/**
 * Recipes: the declared `packages` must cover every package the snippet imports.
 *
 * `/recipes/[id]` builds its install command from the declared list, so a recipe
 * whose snippet imports something it does not declare would tell the reader to
 * install the wrong thing. The CLI recipe declares its package explicitly because
 * its snippet is a shell command that names none.
 */
function parseRecipes(source) {
  const out = [];
  const ids = [...source.matchAll(/^ {2}"([a-z-]+)": \{/gm)].map((m) => m[1]);
  for (const id of ids) {
    const from = source.indexOf(`  "${id}": {`);
    const block = source.slice(from, source.indexOf("\n  },", from));
    const declared = /packages: \[([^\]]*)\]/.exec(block)?.[1];
    const code = /code: `([\s\S]*?)`,\n/.exec(block)?.[1] ?? "";
    out.push({
      id,
      declared: declared
        ? [...declared.matchAll(/"([^"]+)"/g)].map((x) => x[1])
        : ["@theme-kit/core"],
      imported: [...new Set([...code.matchAll(/@theme-kit\/[a-z-]+/g)].map((m) => m[0]))],
    });
  }
  return out;
}

/**
 * The entrypoints a package actually declares, from its `exports` map.
 *
 * A package's surface is not only its root entry. `@theme-kit/remix` ships
 * `./server`, `@theme-kit/core` ships `./vanilla`, `./config` and `./vite`.
 * Reading the map is the same model `export-inventory.mjs` uses, so a
 * `primaryApis` name that legitimately lives on a subpath resolves instead of
 * being reported as invented. `package-map.ts` names the API, not the specifier
 * a reader would import it from, so subpath APIs belong in `primaryApis`.
 */
function entrypoints(dir) {
  const fallback = { types: ["dist/index.d.ts"], runtime: ["dist/index.js"] };
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(repoRoot, "packages", dir, "package.json"), "utf8"));
  } catch {
    return fallback;
  }

  const types = new Set();
  const runtime = new Set();
  for (const target of Object.values(pkg.exports ?? {})) {
    // A string target is a non-TypeScript asset (`./scrollbar.css`).
    if (typeof target === "string") continue;
    if (typeof target.types === "string" && target.types.endsWith(".d.ts")) {
      types.add(target.types);
    }
    if (typeof target.import === "string" && target.import.endsWith(".js")) {
      runtime.add(target.import);
    }
  }

  return {
    types: types.size ? [...types] : fallback.types,
    runtime: runtime.size ? [...runtime] : fallback.runtime,
  };
}

async function exportsOf(dir) {
  const names = new Set();
  let lastError = null;

  for (const rel of entrypoints(dir).runtime) {
    try {
      const mod = await import(pathToFileURL(join(repoRoot, "packages", dir, rel)).href);
      for (const key of Object.keys(mod)) names.add(key);
    } catch (err) {
      lastError = err;
    }
  }

  // Only a total failure is an error: a package that loads its root but not a
  // subpath still contributes the names it does export.
  if (names.size === 0 && lastError) {
    return { error: String(lastError.message).slice(0, 120) };
  }
  return names;
}

/**
 * Type-only exports are erased from the runtime build, and two packages cannot
 * be imported outside their own environment at all (`solid` calls a client-only
 * API on import; `angular` ships the ng-packagr layout with no `dist/index.js`).
 * So declarations are always read, and they are the *only* source when the
 * runtime import is impossible.
 */
function declaredTypes(dir) {
  const distDir = join(repoRoot, "packages", dir, "dist");
  const names = new Set();

  const visit = (file, depth) => {
    if (depth > 4) return;
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      return;
    }
    for (const m of text.matchAll(
      /(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?(?:type|interface|class|function|const|enum)\s+([A-Za-z_$][\w$]*)/g,
    )) {
      names.add(m[1]);
    }
    for (const m of text.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
      for (const part of m[1].split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) names.add(name);
      }
    }
    for (const m of text.matchAll(/from\s+"(\.[^"]+)"/g)) {
      const rel = m[1];
      for (const cand of [`${rel}.d.ts`, `${rel}/index.d.ts`]) {
        visit(join(dirname(file), cand), depth + 1);
      }
    }
  };

  // Standard layout first, then every declared entrypoint, then ng-packagr's
  // `types/` directory. Visiting the declared entrypoints is what makes a
  // subpath export visible to the check.
  visit(join(distDir, "index.d.ts"), 0);
  for (const rel of entrypoints(dir).types) {
    visit(join(repoRoot, "packages", dir, rel), 0);
  }
  try {
    for (const f of readdirSync(join(distDir, "types"))) {
      if (f.endsWith(".d.ts")) visit(join(distDir, "types", f), 0);
    }
  } catch {
    /* no types dir */
  }
  return names;
}

async function main() {
  const editorial = parseEditorial(readFileSync(MAP, "utf8"));
  const graph = parseGraph(readFileSync(GRAPH, "utf8"));

  if (editorial.size === 0) throw new Error("parsed 0 editorial entries — parser is broken");

  let checked = 0;
  let problems = 0;

  for (const [pkg, apis] of [...editorial].sort()) {
    const meta = graph.get(pkg);
    if (!meta) {
      console.error(`  ${pkg}: not present in the generated package graph`);
      problems++;
      continue;
    }

    const runtime = await exportsOf(meta.dir);
    const types = declaredTypes(meta.dir);

    if (runtime.error && types.size === 0) {
      console.error(`  ${pkg}: could not load dist and found no declarations — ${runtime.error}`);
      problems++;
      continue;
    }

    const runtimeExports = runtime.error ? new Set() : runtime;
    const missing = apis.filter((a) => !runtimeExports.has(a) && !types.has(a));
    checked += apis.length;

    if (missing.length) {
      problems += missing.length;
      console.error(`  ${pkg}: ${missing.length} not exported → ${missing.join(", ")}`);
    }
  }

  if (problems) {
    console.error(
      `\nFAILED: ${problems} documented API name(s) do not exist on their package.`,
    );
    process.exit(1);
  }
  console.log(
    `OK: all ${checked} primaryApis entries across ${editorial.size} packages are real exports.`,
  );

  // ---- examples: every API an example claims to exercise must exist ----
  const exampleSource = readFileSync(
    join(here, "..", "lib", "generated", "examples.ts"),
    "utf8",
  );
  const examples = parseExampleExports(exampleSource);
  if (examples.length === 0) throw new Error("parsed 0 examples — parser is broken");

  const exportCache = new Map();
  const exportsFor = async (pkg) => {
    if (!exportCache.has(pkg)) {
      const meta = graph.get(pkg);
      const set = new Set();
      if (meta) {
        const runtime = await exportsOf(meta.dir);
        if (!runtime.error) for (const k of runtime) set.add(k);
        for (const t of declaredTypes(meta.dir)) set.add(t);
      }
      exportCache.set(pkg, set);
    }
    return exportCache.get(pkg);
  };

  let exampleProblems = 0;
  let exampleChecked = 0;
  for (const example of examples) {
    const pool = new Set();
    for (const pkg of example.packages) {
      for (const name of await exportsFor(pkg)) pool.add(name);
    }
    const missing = example.names.filter((n) => !pool.has(n));
    exampleChecked += example.names.length;
    if (missing.length) {
      exampleProblems += missing.length;
      console.error(
        `  example ${example.label}: ${missing.join(", ")} not exported by ${example.packages.join(" / ")}`,
      );
    }
  }

  if (exampleProblems) {
    console.error(
      `\nFAILED: ${exampleProblems} of ${exampleChecked} APIs an example claims to use do not exist.`,
    );
    process.exit(1);
  }
  console.log(
    `OK: all ${exampleChecked} APIs across ${examples.length} examples are real exports.`,
  );

  // ---- recipes: declared install packages must cover the snippet's imports ----
  const recipeSource = readFileSync(join(here, "..", "lib", "recipes.ts"), "utf8");
  const recipes = parseRecipes(recipeSource);
  if (recipes.length === 0) throw new Error("parsed 0 recipes — parser is broken");

  let recipeProblems = 0;
  for (const recipe of recipes) {
    const undeclared = recipe.imported.filter((p) => !recipe.declared.includes(p));
    const unknown = recipe.declared.filter((p) => !graph.has(p));

    if (undeclared.length) {
      recipeProblems += undeclared.length;
      console.error(
        `  recipe ${recipe.id}: snippet imports ${undeclared.join(", ")} but declares [${recipe.declared.join(", ")}]`,
      );
    }
    for (const pkg of unknown) {
      recipeProblems++;
      console.error(`  recipe ${recipe.id}: declares unknown package ${pkg}`);
    }
  }

  if (recipeProblems) {
    console.error(
      `\nFAILED: ${recipeProblems} recipe install-package mismatch(es).`,
    );
    process.exit(1);
  }
  console.log(
    `OK: all ${recipes.length} recipes declare an install set covering their snippet.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
