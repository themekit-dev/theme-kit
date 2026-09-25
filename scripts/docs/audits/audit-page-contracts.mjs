#!/usr/bin/env node
/**
 * §3 page-contract audit + §2 IA integrity (docs-system brief).
 *
 * The brief's docs/features|frameworks|adapters *.mdx tree is mapped onto the
 * existing apps/docs site (see docs/reference/README.md "Where the pages
 * live"). The §3 content contracts are therefore enforced against what
 * actually renders those pages:
 *
 *   §2 IA integrity
 *     - every DOCS_ROUTES href resolves to a concrete app route (static
 *       page.tsx, a data-driven dynamic segment, or a generated API page);
 *     - every capabilities.ts `guide` route is a DOCS_ROUTES href (guards the
 *       generated API-reference backlinks).
 *
 *   §3.2 framework pages (lib/frameworks.tsx → app/framework-guides/[slug])
 *     every framework entry declares slug/name/pkg/tagline/tags/groups plus
 *     quickStart, snippet, snippet2 and noTheme snippets with title/lang/code,
 *     and `pkg` is a shipped TypeScript entrypoint.
 *
 *   §3.3 adapter pages (lib/libraries.tsx → app/libraries/[slug])
 *     every library entry declares slug/name/pkg/tagline/kind/tags/groups
 *     (with an Options group) plus a primary snippet with title/lang/code,
 *     and `pkg` is a shipped TypeScript entrypoint.
 *
 *   §3.4 tooling pages (content/cli/*.md → app/cli/*, app/devtools/page.tsx)
 *     the CLI section covers Installation / Overview / Commands / Configuration /
 *     CI & Automation / a complete example, and every tooling page links its
 *     generated API reference rather than duplicating it.
 *
 * Usage: node scripts/docs/audits/audit-page-contracts.mjs
 * Exit: 0 when clean, 1 on any violation.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadClassification, loadRegistry } from "../lib/registry.mjs";
import { entrypointsOf } from "../lib/api-index.mjs";

const URL_ = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(dirname(dirname(dirname(URL_)))));
const siteRoot = join(repoRoot, "apps", "docs");
const CONTRACT = "brief §3 page contracts + §2 IA integrity";

const failures = [];
const fail = (where, what, detail) => failures.push({ where, what, detail });

// ---------------------------------------------------------------------------
// Load the authorities
// ---------------------------------------------------------------------------

const routesSrc = readFileSync(join(siteRoot, "lib", "docs-routes.ts"), "utf8");
const docsRoutes = [...routesSrc.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);

const capabilitiesSrc = readFileSync(join(repoRoot, "docs", "reference", "capabilities.ts"), "utf8");
const capabilityGuides = [...capabilitiesSrc.matchAll(/guide:\s*"([^"]+)"/g)].map((m) => m[1]);

const classification = loadClassification();
const entrypoints = entrypointsOf(classification);
// entrypointsOf is keyed `pkg|entry` — the bare-package set is what data-file
// `pkg:` values (e.g. "@theme-kit/react") must be members of.
const shippedEntrypoints = new Set([...entrypoints.keys()].map((k) => k.split("|")[0]));

// ---------------------------------------------------------------------------
// Concrete route set: every app/**/page.tsx mapped to a URL, with dynamic
// segments expanded from the data that drives them.
// ---------------------------------------------------------------------------

const GENERATED_API_PREFIX = "api-reference"; // app/api-reference/[...slug] ← content/api-reference/**.md

function generatedApiRoutes() {
  const out = [];
  const base = join(siteRoot, "content", GENERATED_API_PREFIX);
  if (!existsSync(base)) return out;
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(dir, e.name), `${prefix}/${e.name}`);
      else if (e.name.endsWith(".md")) out.push(`${GENERATED_API_PREFIX}${prefix}/${e.name.replace(/\.md$/, "")}`);
    }
  };
  walk(base, "");
  return out;
}

/** Dynamic [slug] dirs and the data source that defines their concrete values. */
const DYNAMIC_SLUG_SOURCES = {
  "framework-guides": () => slugsFromDataFile(join(siteRoot, "lib", "frameworks.tsx")),
  libraries: () => slugsFromDataFile(join(siteRoot, "lib", "libraries.tsx")),
  packages: () => slugsFromDataFile(join(siteRoot, "lib", "packages.tsx")),
  blog: () =>
    readdirSync(join(siteRoot, "content", "blog"), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name.replace(/\.md$/, "")),
};

function slugsFromDataFile(path) {
  const src = readFileSync(path, "utf8");
  return [...src.matchAll(/^\s{2,}slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
}

function concreteRoutes() {
  const routes = new Set();
  const appDir = join(siteRoot, "app");
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith("(")) continue; // route groups don't appear in URLs
      if (e.isDirectory()) {
        if (e.name === "[...slug]") continue; // handled via content below
        if (e.name === "[slug]") {
          const source = DYNAMIC_SLUG_SOURCES[prefix.replace(/^\//, "")];
          if (!source) {
            fail("§2 routes", `${prefix}/[slug]`, "dynamic segment with no known data source; extend DYNAMIC_SLUG_SOURCES");
            continue;
          }
          for (const slug of source()) routes.add(`${prefix}/${slug}`);
          continue;
        }
        walk(join(dir, e.name), `${prefix}/${e.name}`);
      } else if (e.name === "page.tsx") {
        routes.add(prefix || "/");
      }
    }
  };
  walk(appDir, "");
  for (const r of generatedApiRoutes()) routes.add(`/${r}`);
  return routes;
}

const knownRoutes = concreteRoutes();

// ---------------------------------------------------------------------------
// §2 checks
// ---------------------------------------------------------------------------

console.log("\n=== §2 IA INTEGRITY + §3 PAGE CONTRACTS ===\n");
console.log(`DOCS_ROUTES: ${docsRoutes.length} · concrete app routes: ${knownRoutes.size} · capability guides: ${capabilityGuides.length}\n`);

for (const href of docsRoutes) {
  if (!knownRoutes.has(href)) {
    fail("§2 routes", href, "listed in docs-routes.ts but no app route renders it");
  }
}

for (const guide of capabilityGuides) {
  if (!docsRoutes.includes(guide)) {
    fail("§4 → §2 link", guide, "capabilities.ts guide is not a DOCS_ROUTES href (API backlinks would 404)");
  }
}

// ---------------------------------------------------------------------------
// §2 IA: unreachable prose.
//
// A `content/*.md` that no `getContent("<slug>")` call reads is invisible on the
// site. Nothing else notices: the file exists, so it is not missing; it is not a
// route, so no link resolves to it; Audit A counts its snippets but does not care
// whether anyone reads them. It is just rot — and 684 lines of it had accumulated.
// ---------------------------------------------------------------------------

function filesUnder(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      filesUnder(p, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

const renderedContentSlugs = new Set();
for (const f of [...filesUnder(join(siteRoot, "app")), ...filesUnder(join(siteRoot, "lib"))]) {
  for (const m of readFileSync(f, "utf8").matchAll(/getContent\(\s*"([^"]+)"\s*\)/g)) {
    renderedContentSlugs.add(m[1]);
  }
}

/**
 * Content files deliberately not rendered yet, with the reason and the decision
 * that is outstanding. Empty this out by resolving each one, not by adding more.
 *
 * The coverage figures were measured (sections/snippets carried over verbatim
 * into the live source, plus prose-vocabulary overlap), not eyeballed — heading
 * structure alone is misleading: `adapters.md` and `animation.md` both *look*
 * like reasonable summaries of their pages while most of their snippets are not
 * in those pages at all.
 */
const UNRENDERED_CONTENT = {
  "devtools.md":
    "superseded by app/devtools/page.tsx — 5/5 snippets and 100% of prose " +
    "vocabulary already there. Safe to delete.",
  "architecture.md":
    "superseded by app/architecture/page.tsx — 13/13 snippets, 87% prose " +
    "vocabulary. Safe to delete.",
  "animation.md":
    "not superseded — only 2/13 snippets and 60% of prose are in " +
    "AnimationGuide.tsx. 11 snippets (incl. the animations plugin and runtime " +
    "token updates) exist only here. Fold in, then delete.",
  "adapters.md":
    "not superseded — only 7/33 snippets and 36% of prose are in " +
    "app/adapters/page.tsx. 26 snippets (adapter contract, registry, strategies) " +
    "exist only here. Wire to a sub-route or fold in; do not delete.",
};

/**
 * Content files that are *generated*, and unrendered on purpose.
 *
 * These are not rot and not open decisions: they are mirrors of a rendered
 * source, produced by a generator, and a `--check` run fails if they fall out of
 * date. Nothing here is hand-maintained, so there is no second version of the
 * content to keep in sync — which is the failure mode the §2 check above exists
 * to catch, and the reason these are listed separately from
 * `UNRENDERED_CONTENT` rather than folded into it.
 */
const GENERATED_MIRRORS = {
  "framework-guides.md":
    "mirrors lib/frameworks.tsx (the source the /framework-guides pages render) " +
    "— regenerate with `node apps/docs/scripts/generate-framework-guides.mjs`; " +
    "`--check` fails when it is stale",
};

const contentRoot = join(siteRoot, "content");
const contentFiles = existsSync(contentRoot)
  ? readdirSync(contentRoot, { withFileTypes: true }).filter((e) => e.isFile() && e.name.endsWith(".md"))
  : [];
for (const entry of contentFiles) {
  const slug = entry.name.replace(/\.md$/, "");
  if (renderedContentSlugs.has(slug)) continue;
  if (UNRENDERED_CONTENT[entry.name] || GENERATED_MIRRORS[entry.name]) continue;
  fail(
    "§2 unreachable prose",
    `content/${entry.name}`,
    `no route renders it (no getContent("${slug}") call) — wire it up or delete it`,
  );
}
for (const [name, why] of Object.entries(UNRENDERED_CONTENT)) {
  if (contentFiles.some((e) => e.name === name)) {
    console.log(`  NOTE  content/${name} is unrendered — ${why}\n`);
  }
}
for (const [name, why] of Object.entries(GENERATED_MIRRORS)) {
  if (contentFiles.some((e) => e.name === name)) {
    console.log(`  NOTE  content/${name} is a generated mirror — ${why}\n`);
  }
}

// ---------------------------------------------------------------------------
// Data-driven page contracts
// ---------------------------------------------------------------------------

function checkItem(src, required, label) {
  const slugs = [...src.matchAll(/^\s{2,}slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
  for (const slug of slugs) {
    const start = src.indexOf(`slug: "${slug}"`);
    const next = src.indexOf(`slug: "`, start + 1);
    const body = src.slice(start, next === -1 ? undefined : next);
    for (const key of required) {
      if (!new RegExp(`^\\s+${key}:`, "m").test(body)) {
        fail(label, slug, `missing required field \`${key}\``);
      }
    }
    const pkg = body.match(/pkg:\s*"([^"]+)"/)?.[1];
    if (pkg && !shippedEntrypoints.has(pkg)) {
      fail(label, slug, `pkg "${pkg}" is not a shipped TypeScript entrypoint`);
    }
    for (const snippetKey of ["quickStart", "snippet", "snippet2", "noTheme"]) {
      if (!new RegExp(`^\\s+${snippetKey}:`, "m").test(body)) continue;
      const snip = body.slice(body.indexOf(`${snippetKey}:`));
      for (const f of ["title", "lang", "code"]) {
        if (!new RegExp(`${snippetKey}:\\s*\\{[^}]*\\b${f}:`, "s").test(snip.slice(0, 400))) {
          fail(label, slug, `${snippetKey} snippet missing \`${f}\``);
        }
      }
    }
    if (/groups:\s*\[/.test(body) && !/\{\s*label:/.test(body.slice(body.indexOf("groups: [")))) {
      fail(label, slug, "groups must contain labeled feature groups");
    }
  }
  return slugs.length;
}

const frameworksSrc = readFileSync(join(siteRoot, "lib", "frameworks.tsx"), "utf8");
const fwCount = checkItem(
  frameworksSrc,
  ["name", "pkg", "tagline", "mark", "tags", "groups", "quickStart", "snippet", "snippet2", "noTheme"],
  "§3.2 framework pages",
);

const librariesSrc = readFileSync(join(siteRoot, "lib", "libraries.tsx"), "utf8");
const libCount = checkItem(
  librariesSrc,
  ["name", "pkg", "tagline", "mark", "kind", "tags", "groups", "snippet2"],
  "§3.3 adapter pages",
);

// §3.2/§3.3: a page that exists but is not listed in the sidebar is
// undiscoverable. The §2 checks run the other way round (every sidebar href must
// resolve; every *capability* guide must be listed), so a new framework or
// adapter entry could previously ship with a working page and no way to reach it.
for (const [src, prefix, label] of [
  [frameworksSrc, "/framework-guides", "§3.2 framework pages"],
  [librariesSrc, "/libraries", "§3.3 adapter pages"],
]) {
  for (const slug of [...src.matchAll(/^\s{2,}slug:\s*"([^"]+)"/gm)].map((m) => m[1])) {
    const href = `${prefix}/${slug}`;
    if (!docsRoutes.includes(href)) {
      fail(label, slug, `has a page but no sidebar entry (${href} is missing from docs-routes.ts)`);
    }
  }
}

// §3.3: adapters that ship a CSS-variable stylesheet (declare `css:`) must
// expose an "Options" group — that group documents the design-token surface
// the stylesheet maps. Runtime-only adapters have no token surface to expose.
for (const chunk of librariesSrc.split(/(?=\n  \{\n    slug:)/).slice(1)) {
  const slug = chunk.match(/slug:\s*"([^"]+)"/)?.[1];
  if (slug && /css:\s*"/.test(chunk) && !/label:\s*"Options"/.test(chunk)) {
    fail("§3.3 adapter pages", slug, 'ships CSS variables but has no "Options" feature group documenting them');
  }
}

// ---------------------------------------------------------------------------
// §3.1 feature page contract
//
//   Feature page
//   ├── What it is      ├── Why it matters   ├── Quick start
//   ├── How it works    ├── Options          ├── Examples
//   ├── Edge cases      └── API reference
//
// The prose sections are authorial, but the last one is not: §3.1 ends at "API
// reference" and §14 lists "feature pages duplicating the API reference instead
// of linking it" as an anti-pattern. So every capability's feature page must link
// a generated API reference rather than restating it.
//
// The page may be a thin wrapper (`app/scoped-theme/page.tsx` renders
// `./ScopedThemeGuide`), so scan the route's whole directory rather than just
// `page.tsx`.
// ---------------------------------------------------------------------------

// Matches `/api-reference` with or without a package subpath, but not an
// unrelated slug that merely starts with the same text.
const API_REFERENCE_LINK = /\/api-reference(?![a-z0-9-])/i;

function linksApiReference(dir, expected) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (linksApiReference(p, expected)) return true;
    } else if (/\.(tsx|ts|md|mdx)$/.test(entry.name)) {
      const src = readFileSync(p, "utf8");
      if (expected) {
        if (src.includes(expected)) return true;
      } else if (API_REFERENCE_LINK.test(src)) {
        return true;
      }
    }
  }
  return false;
}

// Scope comes from the registry rather than guesswork. `category` is what
// separates §2's Concepts (themes, tokens, families/modes, runtime, scopes) from
// its Features and Tooling, so §3.1 applies to `core-feature` only — a concept
// page like /architecture is not a feature page and needs no API-reference
// section. Tooling is §3.4's business, below.
//
// A guide may be markdown-driven (`app/advanced-features/page.tsx` renders
// `content/advanced-features.md`), so the prose lives outside the app tree.
const { capabilities: registryCapabilities } = loadRegistry();
for (const cap of Object.values(registryCapabilities)) {
  if (cap.category !== "core-feature" || !cap.guide) continue;
  const route = cap.guide.replace(/^\//, "");
  const appDir = join(siteRoot, "app", route);
  // A guide with no matching route is already reported by the §2 check above.
  if (!existsSync(appDir)) continue;

  const contentMd = join(siteRoot, "content", `${route}.md`);
  const contentDir = join(siteRoot, "content", route);
  // Which API reference is an authorial choice (a scoped-theme page sensibly
  // links the React one, not core); the contract only requires that one is
  // linked rather than restated.
  const linked =
    linksApiReference(appDir) ||
    (existsSync(contentMd) && API_REFERENCE_LINK.test(readFileSync(contentMd, "utf8"))) ||
    (existsSync(contentDir) && linksApiReference(contentDir));
  if (!linked) {
    fail(
      "§3.1 feature pages",
      cap.guide,
      `does not link a generated API reference (declared: ${cap.apiReference ?? "/api-reference"}) — §3.1 ends at "API reference" and §14 forbids duplicating it`,
    );
  }
}

// ---------------------------------------------------------------------------
// §3.4 tooling page contract
//
//   Tooling
//   ├── Installation
//   ├── Overview
//   ├── Commands / Surfaces
//   ├── Configuration
//   ├── CI / Automation
//   ├── Complete example
//   └── API reference
//
// The CLI is markdown-driven (`apps/docs/content/cli/*.md`); DevTools is a single
// hand-authored page (`apps/docs/app/devtools/page.tsx`).
// ---------------------------------------------------------------------------

const CLI_DIR = join(siteRoot, "content", "cli");

/** §3.4 area → the CLI page(s) that may satisfy it. */
const CLI_CONTRACT = {
  Installation: ["installation.md"],
  Overview: ["overview.md"],
  "Commands / Surfaces": ["generate.md", "validate.md", "inspect.md", "migrate.md", "export.md"],
  Configuration: ["reference.md"],
  "CI / Automation": ["ci.md"],
  "Complete example": ["quickstart.md", "workflows.md"],
};

for (const [area, candidates] of Object.entries(CLI_CONTRACT)) {
  const found = candidates.some((f) => {
    const p = join(CLI_DIR, f);
    return existsSync(p) && readFileSync(p, "utf8").trim().length > 0;
  });
  if (!found) {
    fail(
      "§3.4 tooling pages (CLI)",
      area,
      `no non-empty page covers "${area}" (looked for ${candidates.join(", ")})`,
    );
  }
}

// Every tooling page must link its generated API reference rather than
// duplicating it (§3.4 "API reference", §14).
const cliReference = join(CLI_DIR, "reference.md");
if (!existsSync(cliReference) || !readFileSync(cliReference, "utf8").includes("/api-reference/cli")) {
  fail("§3.4 tooling pages (CLI)", "reference.md", "does not link its generated API reference (/api-reference/cli)");
}

const DEVTOOLS = join(siteRoot, "app", "devtools", "page.tsx");
if (!existsSync(DEVTOOLS)) {
  fail("§3.4 tooling pages (DevTools)", "app/devtools/page.tsx", "missing");
} else {
  const src = readFileSync(DEVTOOLS, "utf8");
  if (src.length < 2000) {
    fail("§3.4 tooling pages (DevTools)", "app/devtools/page.tsx", "too short to cover the §3.4 contract");
  }
  if (!src.includes("CodeBlock")) {
    fail("§3.4 tooling pages (DevTools)", "app/devtools/page.tsx", "has no complete example (no CodeBlock)");
  }
  if (!src.includes("/api-reference/devtools")) {
    fail(
      "§3.4 tooling pages (DevTools)",
      "app/devtools/page.tsx",
      "does not link its generated API reference (/api-reference/devtools)",
    );
  }
}

console.log(`Checked ${fwCount} framework entries and ${libCount} adapter entries.\n`);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

for (const f of failures) {
  console.log(`  ✗ ${f.what} — ${f.where}`);
  console.log(`      contract: ${CONTRACT}`);
  console.log(`      detail: ${f.detail}`);
}
console.log(`\nFailures: ${failures.length}`);
process.exitCode = failures.length ? 1 : 0;
