#!/usr/bin/env node
/**
 * Static QA for the docs site — runs without a build.
 *
 * 1. Link check: enumerate every route the app actually renders, then scan the
 *    source for internal `href` values and report any that resolve to nothing.
 *    This is the class of bug where a page links to `/compatibility` when the
 *    route is really `/reference/compatibility`.
 * 2. Metadata check: report duplicate page titles, which hurt SEO and the
 *    search index.
 *
 * Route enumeration handles `app/.../page.tsx`, `[slug]`/`[id]` dynamic
 * segments, and `[[...slug]]` optional catch-alls. Links containing template
 * interpolation (`${...}`) cannot be resolved statically and are listed as
 * unverified rather than failed.
 *
 * Run: node scripts/check-links.mjs   (or `pnpm links`)
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const APP_DIR = join(ROOT, "app");
const SCAN_DIRS = ["app", "components", "content", "lib"];

const STATIC_ROUTE = /(?:^|[\\/])page\.tsx$/;
// Capture the path of an href literal, handling both JSX and object forms.
const HREF_RE = /\bhref(?:\s*=\s*{|:)\s*"((?:\/|#)[^"]*)"/g;
// A static metadata export. Files that only use generateMetadata are skipped
// because their titles are computed per-param and unique by construction.
const STATIC_METADATA = /export\s+const\s+metadata[\s\S]*?title:\s*"([^"]+)"/;

/**
 * Dynamic routes whose children `app/sitemap.ts` enumerates from a data module.
 * Listing them here is a deliberate act: a new dynamic route that nobody wired
 * into the sitemap fails this check instead of silently going unlisted.
 */
const DYNAMIC_SITEMAP_SOURCES = {
  "/blog/:": "content/blog markdown (getPosts)",
  "/recipes/:": "lib/recipes.ts (recipeData)",
  "/api-reference/:": "lib/api-reference.ts (apiPackages)",
  "/packages/:": "lib/packages.tsx (packages)",
  "/libraries/:": "lib/libraries.tsx (libraries)",
  "/framework-guides/:": "lib/frameworks.tsx (frameworks)",
};

/** Recursively collect files matching a predicate. */
async function walk(dir, pred, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip build output and dependencies.
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      await walk(full, pred, out);
    } else if (pred(full)) {
      out.push(full);
    }
  }
  return out;
}

/** Convert an app-dir file path to a route pattern string. */
function fileToRoute(appRelative) {
  const parts = appRelative.split(sep).filter(Boolean);
  // Drop the trailing page.tsx / not-found etc.
  const segs = parts.slice(0, -1);
  const route = segs.map((s) => {
    if (/^\[\[/.test(s)) return `*`; // optional catch-all
    if (/^\[/.test(s)) return `:`; // dynamic segment placeholder
    return s;
  });
  return "/" + route.join("/");
}

/** A link matches a route pattern when every literal segment is equal. */
function matchesRoute(link, pattern) {
  if (pattern === "/*") return true;
  const linkSegs = link.split("/").filter(Boolean);
  const routeSegs = pattern.split("/").filter(Boolean);
  if (routeSegs.includes("*")) {
    const star = routeSegs.indexOf("*");
    const before = routeSegs.slice(0, star);
    if (linkSegs.length < before.length) return false;
    return before.every((s, i) => s === linkSegs[i]);
  }
  if (linkSegs.length !== routeSegs.length) return false;
  return routeSegs.every((s, i) => (s === ":" ? true : s === linkSegs[i]));
}

async function main() {
  const pageFiles = await walk(APP_DIR, (f) => STATIC_ROUTE.test(f));
  const routes = pageFiles
    .map((f) => fileToRoute(relative(APP_DIR, f)))
    // index route (empty segs) is "/"
    .map((r) => (r === "/" ? "/" : r));

  const known = new Set(routes);
  const indexRoute = known.has("/");

  // Collect every internal href across the scanned source.
  const sources = [];
  for (const dir of SCAN_DIRS) {
    sources.push(
      ...(await walk(join(ROOT, dir), (f) => /\.(?:tsx|ts|mdx?|md)$/.test(f))),
    );
  }

  /** link -> files that reference it */
  const broken = new Map();
  const dynamic = new Set();
  const unverified = new Map();
  const titles = new Map();

  for (const file of sources) {
    const text = await readFile(file, "utf8");
    let m;
    HREF_RE.lastIndex = 0;
    while ((m = HREF_RE.exec(text))) {
      const raw = m[1];
      if (raw.startsWith("#")) continue; // in-page anchor
      // Strip a trailing in-page anchor before resolving the route.
      const link = raw.split("#")[0];
      if (!link.startsWith("/")) continue;
      // Template interpolation or runtime-built href — can't resolve statically.
      if (link.includes("${") || /\{[^}]*\}/.test(link)) {
        unverified.set(link, (unverified.get(link) ?? []));
        unverified.get(link).push(relative(ROOT, file));
        continue;
      }
      // Dynamic-segment links resolve to a pattern; record them separately so
      // the report distinguishes "no such route" from "param not enumerated".
      if (/\/:(?!\w)/.test(link) || link.endsWith("/:")) {
        dynamic.add(link);
        continue;
      }
      const hit = [...known].some((r) => matchesRoute(link, r));
      if (hit) continue;
      if (!broken.has(link)) broken.set(link, []);
      broken.get(link).push(relative(ROOT, file));
    }

    // Only static metadata exports count toward title uniqueness.
    const t = STATIC_METADATA.exec(text);
    if (t) {
      const rel = relative(ROOT, file);
      if (!titles.has(t[1])) titles.set(t[1], []);
      titles.get(t[1]).push(rel);
    }
  }

  const dupTitles = [...titles.entries()].filter(([, files]) => files.length > 1);

  // ---- sitemap coverage ---------------------------------------------------
  // `app/sitemap.ts` derives most URLs from data modules this static script
  // can't read, so guard the two things that can actually drift: a rendered page
  // that no sitemap source lists, and a hand-written sitemap URL with no route.
  const sitemapPath = join(APP_DIR, "sitemap.ts");
  let sitemapMissing = false;
  const sitemapUnknownUrls = [];
  const uncoveredRoutes = [];

  try {
    const sitemapText = await readFile(sitemapPath, "utf8");
    const standaloneBlock =
      /const STANDALONE_ROUTES = \[([\s\S]*?)\] as const;/.exec(sitemapText);
    const standalone = standaloneBlock
      ? [...standaloneBlock[1].matchAll(/"(\/[^"]*)"/g)].map((m) => m[1])
      : [];

    const docsRoutesText = await readFile(
      join(ROOT, "lib", "docs-routes.ts"),
      "utf8",
    );
    const docsHrefs = [...docsRoutesText.matchAll(/href:\s*"([^"]+)"/g)].map(
      (m) => m[1],
    );

    const covered = new Set([...docsHrefs, ...standalone]);

    for (const url of standalone) {
      if (![...known].some((r) => matchesRoute(url, r))) {
        sitemapUnknownUrls.push(url);
      }
    }

    for (const route of [...known].sort()) {
      if (route.includes(":")) {
        if (!(route in DYNAMIC_SITEMAP_SOURCES)) uncoveredRoutes.push(route);
      } else if (!covered.has(route)) {
        uncoveredRoutes.push(route);
      }
    }
  } catch {
    sitemapMissing = true;
  }

  const log = [];
  const push = (s) => log.push(s);

  push("Link & metadata check");
  push("======================");
  push(`Routes discovered:        ${known.size}`);
  push(`Source files scanned:     ${sources.length}`);
  push(`Index route present:      ${indexRoute ? "yes" : "no"}`);
  push("");

  if (broken.size > 0) {
    push(`BROKEN LINKS (${broken.size})`);
    push("-----------------");
    for (const [link, files] of [...broken.entries()].sort()) {
      push(`  ${link}`);
      for (const f of [...new Set(files)].sort()) push(`    referenced by: ${f}`);
    }
    push("");
  } else {
    push("BROKEN LINKS: none");
    push("");
  }

  if (dupTitles.length > 0) {
    push(`DUPLICATE PAGE TITLES (${dupTitles.length})`);
    push("---------------------------");
    for (const [title, files] of dupTitles.sort()) {
      push(`  "${title}"`);
      for (const f of [...new Set(files)].sort()) push(`    ${f}`);
    }
    push("");
  } else {
    push("DUPLICATE PAGE TITLES: none");
    push("");
  }

  if (unverified.size > 0) {
    push(`UNVERIFIED (template-interpolated) HREFS (${unverified.size})`);
    push("-------------------------------------------");
    for (const [link, files] of [...unverified.entries()].sort()) {
      push(`  ${link}`);
      for (const f of [...new Set(files)].sort()) push(`    ${f}`);
    }
    push("");
  }

  if (sitemapMissing) {
    push("SITEMAP: app/sitemap.ts not found");
    push("");
  } else if (sitemapUnknownUrls.length > 0 || uncoveredRoutes.length > 0) {
    push("SITEMAP COVERAGE");
    push("----------------");
    for (const url of sitemapUnknownUrls) {
      push(`  sitemap lists a URL with no route: ${url}`);
    }
    for (const route of uncoveredRoutes) {
      push(`  route is in no sitemap source: ${route}`);
    }
    push("");
  } else {
    push("SITEMAP: covers every rendered route");
    push("");
  }

  const report = log.join("\n");
  const fail =
    broken.size > 0 ||
    dupTitles.length > 0 ||
    sitemapMissing ||
    sitemapUnknownUrls.length > 0 ||
    uncoveredRoutes.length > 0;

  if (fail) {
    console.error(report);
    console.error(
      `\nFAILED: ${broken.size} broken link(s), ${dupTitles.length} duplicate title(s), ` +
        `${sitemapUnknownUrls.length + uncoveredRoutes.length} sitemap gap(s).`,
    );
    process.exit(1);
  }
  console.log(report);
  console.log(
    "\nOK: all resolvable internal links and titles are unique, and the sitemap covers every route.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
