#!/usr/bin/env node
/**
 * Generate `lib/generated/examples.ts` from the real `examples/` workspace.
 *
 * `/examples` must describe implementations that actually exist — the whole
 * point of the page is that you can run and copy them. So nothing here is
 * authored: the 21 concept examples come from their own `example.meta.json`
 * files, and the 11 framework starter apps from their `package.json`
 * (`@theme-kit/*` dependencies + the `dev` script), which live under
 * `examples/apps/`.
 *
 *   node scripts/generate-examples.mjs           # write
 *   node scripts/generate-examples.mjs --check   # verify (CI gate)
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const EXAMPLES = join(repoRoot, "examples");
/** The framework starter apps. Concept examples live directly under `examples/`. */
const APPS = join(EXAMPLES, "apps");
const OUT = join(here, "..", "lib", "generated", "examples.ts");

const SKIP_DIRS = new Set(["node_modules", "dist", ".astro", ".nuxt", ".output", "out-tsc"]);

/** Every `example.meta.json` under examples/, as a concept example. */
function collectConcepts() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === "example.meta.json") {
        const meta = JSON.parse(readFileSync(full, "utf8"));
        const rel = dirname(full).slice(EXAMPLES.length + 1).split("\\").join("/");
        out.push({
          kind: "concept",
          id: `${meta.feature}-${meta.framework}`,
          dir: rel,
          feature: meta.feature ?? rel.split("/")[0],
          framework: meta.framework ?? rel.split("/")[1] ?? "core",
          packages: (meta.packages ?? []).slice().sort(),
          peerDependencies: (meta.peerDependencies ?? []).slice().sort(),
          files: meta.files ?? [],
          entry: meta.entry ?? (meta.files ?? [])[0] ?? "",
          prerequisites: meta.prerequisites ?? [],
          exportsUsed: meta.expectedExportsUsed ?? [],
        });
      }
    }
  };
  walk(EXAMPLES);
  return out;
}

/** Every app under `examples/apps/` that ships a dev script. */
function collectStarters() {
  const out = [];
  for (const entry of readdirSync(APPS, { withFileTypes: true })) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(join(APPS, entry.name, "package.json"), "utf8"));
    } catch {
      continue; // a directory without a manifest is not an app
    }
    const deps = Object.keys(pkg.dependencies ?? {});
    out.push({
      kind: "starter",
      id: `starter-${entry.name}`,
      // Repo-relative, so `exampleRepoPath()` and the GitHub link resolve.
      dir: `apps/${entry.name}`,
      framework: entry.name,
      name: pkg.name ?? `example-${entry.name}`,
      packages: deps.filter((d) => d.startsWith("@theme-kit/")).sort(),
      devCommand: `pnpm --filter ${pkg.name} dev`,
      hasBuild: !!pkg.scripts?.build,
    });
  }
  return out;
}

function render(concepts, starters) {
  const arr = (xs) => xs.map((x) => JSON.stringify(x)).join(", ");

  const conceptLines = concepts
    .map((c) =>
      [
        "  {",
        `    kind: "concept",`,
        `    id: ${JSON.stringify(c.id)},`,
        `    dir: ${JSON.stringify(c.dir)},`,
        `    feature: ${JSON.stringify(c.feature)},`,
        `    framework: ${JSON.stringify(c.framework)},`,
        `    packages: [${arr(c.packages)}],`,
        `    peerDependencies: [${arr(c.peerDependencies)}],`,
        `    files: [${arr(c.files)}],`,
        `    entry: ${JSON.stringify(c.entry)},`,
        `    prerequisites: [${arr(c.prerequisites)}],`,
        `    exportsUsed: [${arr(c.exportsUsed)}],`,
        "  },",
      ].join("\n"),
    )
    .join("\n");

  const starterLines = starters
    .map((s) =>
      [
        "  {",
        `    kind: "starter",`,
        `    id: ${JSON.stringify(s.id)},`,
        `    dir: ${JSON.stringify(s.dir)},`,
        `    framework: ${JSON.stringify(s.framework)},`,
        `    name: ${JSON.stringify(s.name)},`,
        `    packages: [${arr(s.packages)}],`,
        `    devCommand: ${JSON.stringify(s.devCommand)},`,
        `    hasBuild: ${s.hasBuild},`,
        "  },",
      ].join("\n"),
    )
    .join("\n");

  return `/**
 * GENERATED FILE — do not edit.
 *
 * Produced by \`apps/docs/scripts/generate-examples.mjs\` from the real
 * \`examples/\` workspace: the 21 concept examples' own \`example.meta.json\`
 * files and the 10 framework starter apps' \`package.json\`. Regenerate with
 * \`pnpm --filter @theme-kit/docs examples:generate\`; \`examples:check\` fails
 * when this drifts.
 *
 * Consumed by \`/examples\` and merged with the editorial layer in
 * \`lib/examples.ts\`.
 */

/** A focused, framework-specific implementation of one Theme Kit feature. */
export type ConceptExample = {
  kind: "concept";
  id: string;
  /** Path under \`examples/\`, e.g. \`persistence/react\`. */
  dir: string;
  /** The Theme Kit feature being demonstrated, e.g. \`persistence\`. */
  feature: string;
  /** \`core\` or a framework name. */
  framework: string;
  /** @theme-kit packages the example uses. */
  packages: string[];
  peerDependencies: string[];
  /** Source files, relative to \`dir\`. */
  files: string[];
  /** The file to read first, relative to \`dir\`. */
  entry: string;
  prerequisites: string[];
  /** The public APIs the example exercises — verified against the packages. */
  exportsUsed: string[];
};

/** A full runnable app for one framework integration. */
export type StarterExample = {
  kind: "starter";
  id: string;
  /** Path under \`examples/\`, e.g. \`react\`. */
  dir: string;
  framework: string;
  /** Workspace package name, e.g. \`@theme-kit/example-react\`. */
  name: string;
  packages: string[];
  devCommand: string;
  hasBuild: boolean;
};

export type GeneratedExample = ConceptExample | StarterExample;

export const CONCEPT_EXAMPLES: ConceptExample[] = [
${conceptLines}
];

export const STARTER_EXAMPLES: StarterExample[] = [
${starterLines}
];
`;
}

function main() {
  const check = process.argv.includes("--check");
  const concepts = collectConcepts().sort((a, b) => a.id.localeCompare(b.id));
  const starters = collectStarters().sort((a, b) => a.framework.localeCompare(b.framework));

  if (concepts.length === 0 || starters.length === 0) {
    throw new Error(
      `collected ${concepts.length} concept / ${starters.length} starter examples — collector is broken`,
    );
  }

  const next = render(concepts, starters);

  let current = null;
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* first run */
  }

  if (check) {
    if (current !== next) {
      console.error(
        "lib/generated/examples.ts is out of date. Run: pnpm --filter @theme-kit/docs examples:generate",
      );
      process.exit(1);
    }
    console.log(
      `Examples are in sync (${concepts.length} concept, ${starters.length} starter).`,
    );
    return;
  }

  if (current === next) {
    console.log("Examples already up to date.");
    return;
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, next);
  console.log(
    `Wrote lib/generated/examples.ts — ${concepts.length} concept, ${starters.length} starter examples.`,
  );
}

main();
