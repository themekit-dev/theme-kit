#!/usr/bin/env node
/**
 * Snippet-to-API drift check (item 16 / checklist "every snippet matches the
 * shipped API").
 *
 * Extracts every code snippet embedded in the docs pages (CodeBlock code=
 * template literals and FrameworkTabs examples) plus every fenced code block
 * in the markdown guides, parses the `import ... from "@theme-kit/*"`
 * statements, and verifies each imported symbol exists in the frozen public
 * API manifest (scripts/release/api-manifest.json). Also verifies subpath
 * imports (e.g. "@theme-kit/core/vanilla") resolve to a declared exports
 * subpath.
 *
 * Framework-aware rules (the "docs must not become a museum of old framework
 * APIs" checks):
 *
 *  - `astro:island-directive` — every `client:*` directive in an Astro snippet
 *    must be a real Astro client directive with a valid value.
 *  - `astro:root-import` — a snippet may only take framework-neutral symbols
 *    from the `@theme-kit/astro` root; React symbols (island, hooks,
 *    `ThemeScope`) must come from `@theme-kit/astro/client`. Enforced by the
 *    manifest check, restated here so the intent is explicit.
 *  - `remix:server-boundary` — `getInitialThemeState` must be imported from
 *    `@theme-kit/remix/server`, never the package root.
 *  - `framework:obsolete-bootstrap` — `createThemeRoot()` is a React-SPA-only
 *    helper; it must not appear in Astro/Remix/Next snippets.
 *
 * Scan roots: apps/docs/app, apps/docs/lib (framework guide data),
 * apps/docs/components (rendered guide panels) and apps/docs/content (markdown
 * guides). The lib/, components/ and content/ roots hold the most
 * framework-sensitive snippets, so leaving them out hid exactly the drift this
 * check exists to catch.
 *
 * Usage: node scripts/release/snippet-audit.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// The extractor is shared with scripts/docs/check-examples.mjs — the repo keeps
// exactly one snippet extractor (§16 "extend it, do not replace it").
import { walk, scanRoots, extractSnippets, extractMarkdownSnippets, parseImports } from "../docs/lib/snippets.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

/**
 * Optional machine-readable report (`--json=<path>`), consumed by
 * scripts/docs/snapshot-snippet-baseline.mjs. Additive: the console report and
 * the exit code are unchanged.
 */
const jsonPath = process.argv
  .find((a) => a.startsWith("--json="))
  ?.replace("--json=", "");

const manifest = JSON.parse(
  readFileSync(join(here, "api-manifest.json"), "utf8"),
);

// `walk`, `extractSnippets`, `extractMarkdownSnippets` and `parseImports` live in
// scripts/docs/lib/snippets.mjs (imported above) so the drift audit and the
// example-completeness gate read the docs through the same lens.

function checkImport({ pkg, name, dynamic }) {
  const parts = pkg.replace("@theme-kit/", "").split("/");
  const base = `@theme-kit/${parts[0]}`; // e.g. @theme-kit/core
  const subpath = parts.length > 1 ? `./${parts.slice(1).join("/")}` : ".";

  const entry = manifest[base];
  if (!entry) {
    return { ok: false, detail: `package ${base} not in manifest` };
  }
  if (dynamic) {
    return { ok: true, detail: `dynamic import ${pkg}` };
  }
  if (name === null) {
    return { ok: true, detail: `default import from ${pkg}` };
  }

  // Subpath imports: verify the subpath is declared AND that it actually
  // exports the symbol. Verifying only that the subpath exists is how
  // `ThemeTransitionOptions from "@theme-kit/next/client"` survived: the
  // subpath is real, the symbol is not in it.
  if (subpath !== ".") {
    const declared = entry.exports.subpaths.includes(subpath);
    if (!declared) {
      return { ok: false, detail: `${base} has no exports subpath ${subpath}` };
    }

    const entrypoint = entry.exports.entrypoints?.[subpath];
    if (entrypoint && entrypoint.ts) {
      const symbols = new Set([...entrypoint.values, ...entrypoint.types]);
      if (symbols.has(name)) return { ok: true, detail: `${base}${subpath} exports ${name}` };
      const internalEp = new Set([
        ...(entrypoint.internal?.values ?? []),
        ...(entrypoint.internal?.types ?? []),
      ]);
      if (internalEp.has(name)) {
        return {
          ok: false,
          detail: `${base}${subpath} marks ${name} @internal — internal symbols must not be referenced by public guides`,
        };
      }
      return {
        ok: false,
        detail: `${base}${subpath} does NOT export ${name} — the subpath exists but this symbol is not in it`,
      };
    }

    // Non-TypeScript entrypoint (CSS / `.astro` component): the subpath being
    // declared is the whole contract. Falls back to the root re-export check
    // for manifests that predate per-entrypoint data.
    const all = new Set([...entry.exports.values, ...entry.exports.types]);
    if (all.has(name)) return { ok: true, detail: `${base}${subpath} exports ${name} (root re-export)` };
    const internal = internalNames(entry);
    if (internal.has(name)) {
      return {
        ok: false,
        detail: `${base} marks ${name} @internal — internal symbols must not be referenced by public guides`,
      };
    }
    return { ok: true, detail: `${base}${subpath} declared entrypoint (no TypeScript surface)` };
  }

  const all = new Set([...entry.exports.values, ...entry.exports.types]);
  if (all.has(name)) return { ok: true, detail: `${base} exports ${name}` };

  // Distinguish "does not exist" from "exists but is deliberately internal":
  // a guide must never teach an @internal implementation helper as public API.
  const internal = internalNames(entry);
  if (internal.has(name)) {
    return {
      ok: false,
      detail: `${base} exports ${name} but marks it @internal — internal symbols must not be referenced by public guides`,
    };
  }
  return { ok: false, detail: `${base} exports ${name} — NOT FOUND` };
}

// The @internal split recorded in the frozen manifest.
function internalNames(entry) {
  return new Set([
    ...(entry.exports.internal?.values ?? []),
    ...(entry.exports.internal?.types ?? []),
  ]);
}

// --- framework-aware rules ---------------------------------------------------

const VALID_CLIENT_DIRECTIVES = new Set([
  "client:load",
  "client:idle",
  "client:visible",
  "client:only",
  "client:media",
]);

const FRAMEWORK_BOOTSTRAP_PKGS = new Set([
  "@theme-kit/astro",
  "@theme-kit/remix",
  "@theme-kit/next",
  "@theme-kit/nuxt",
]);

// Returns [{ import, ok, detail }] for the framework-aware rules.
function checkFrameworkRules(snippet, isAstro) {
  const results = [];
  const imports = parseImports(snippet);

  // astro:island-directive — `client:*` must be a real directive.
  if (isAstro) {
    const directiveRe = /\bclient:([a-zA-Z-]+)/g;
    let m;
    const seen = new Set();
    while ((m = directiveRe.exec(snippet))) {
      const directive = `client:${m[1]}`;
      if (seen.has(directive)) continue;
      seen.add(directive);
      results.push({
        import: `directive ${directive}`,
        ok: VALID_CLIENT_DIRECTIVES.has(directive),
        detail: VALID_CLIENT_DIRECTIVES.has(directive)
          ? `valid Astro client directive`
          : `unknown Astro client directive "${directive}"`,
      });
    }
  }

  // remix:server-boundary — the Remix server helper must come from /server.
  const isRemixSnippet = imports.some((i) => i.pkg.startsWith("@theme-kit/remix"));
  if (isRemixSnippet) {
    for (const imp of imports) {
      if (imp.name === "getInitialThemeState" && imp.pkg !== "@theme-kit/remix/server") {
        results.push({
          import: `getInitialThemeState from "${imp.pkg}"`,
          ok: false,
          detail: `must be imported from "@theme-kit/remix/server", not "${imp.pkg}"`,
        });
      }
    }
  }

  // astro:root-import — the React-free Astro root must not be combined with a
  // React runtime import; React belongs behind `@theme-kit/astro/client`.
  const usesAstroRoot = imports.some((i) => i.pkg === "@theme-kit/astro");
  if (usesAstroRoot) {
    const reactRuntime = snippet.match(/from\s*["'](react|react-dom|@theme-kit\/react)["']/);
    if (reactRuntime) {
      results.push({
        import: `react runtime "${reactRuntime[1]}"`,
        ok: false,
        detail: `the @theme-kit/astro root is framework-neutral; take React from "@theme-kit/astro/client"`,
      });
    }
  }

  // framework:obsolete-bootstrap — createThemeRoot() is React-SPA only.
  if (/\bcreateThemeRoot\s*\(/.test(snippet)) {
    const offending = imports.filter((i) => FRAMEWORK_BOOTSTRAP_PKGS.has(i.pkg));
    if (offending.length) {
      results.push({
        import: "createThemeRoot()",
        ok: false,
        detail: `React-SPA-only bootstrap used in a ${offending[0].pkg} snippet`,
      });
    }
  }

  return results;
}

const SCAN_ROOTS = scanRoots(repoRoot);

const pages = [];
for (const root of SCAN_ROOTS) {
  for (const file of walk(root.dir, root.exts)) pages.push({ file, ...root });
}

const report = [];
let snippetCount = 0;

for (const page of pages) {
  const content = readFileSync(page.file, "utf8");
  const snippets = page.exts.includes(".md")
    ? extractMarkdownSnippets(content)
    : extractSnippets(content);
  if (!snippets.length) continue;
  const rel = relative(repoRoot, page.file);
  const seen = new Set();
  for (const snippet of snippets) {
    snippetCount++;
    for (const imp of parseImports(snippet)) {
      const key = `import|${imp.pkg}|${imp.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const result = checkImport(imp);
      report.push({ page: rel, import: `${imp.name ?? "(default)"} from "${imp.pkg}"`, ...result });
    }
    for (const rule of checkFrameworkRules(snippet, page.astro)) {
      const key = `rule|${rule.import}|${rule.detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      report.push({ page: rel, ...rule });
    }
  }
}

const fails = report.filter((r) => !r.ok);
console.log(`\n=== SNIPPET → API DRIFT CHECK ===`);
console.log(`Pages scanned: ${pages.length}, snippets extracted: ${snippetCount}`);
console.log(`References checked: ${report.length}\n`);
for (const r of report.sort((a, b) => a.page.localeCompare(b.page))) {
  console.log(`  ${r.ok ? "✓" : "✗"} ${r.page}\n      ${r.import} → ${r.detail}`);
}
console.log(`\nFailures: ${fails.length}`);

if (jsonPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        tool: "scripts/release/snippet-audit.mjs",
        pages: pages.length,
        snippets: snippetCount,
        references: report.length,
        failures: fails.length,
        entries: report.map((r) => ({
          page: r.page,
          import: r.import,
          detail: r.detail,
          ok: r.ok,
        })),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`JSON report: ${jsonPath}`);
}

process.exitCode = fails.length ? 1 : 0;
