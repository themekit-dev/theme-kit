#!/usr/bin/env node
/**
 * Generate the SSR table-of-contents manifest.
 *
 * Why this exists
 * ---------------
 * `DocsLayout` renders the "On this page" rail from `collectTocItems`, a walk of
 * the render tree (`lib/toc-tree.tsx`). That walk stops at opaque boundaries:
 * RSC serializes any subtree that shares a parent with a client component as a
 * template, so headings rendered inside client components — and, on
 * markdown-driven pages, everything past the first such boundary — are invisible
 * to it. Measured on /core-concepts: 87 elements walked, 8 of 25 headings found.
 *
 * `Toc` reconciles against the live DOM after hydration, which is correct but
 * means the rail is painted short and then grows. Pages can pass `headings`
 * explicitly to avoid that; 25 do. The rest cannot reasonably: on
 * /framework-guides/[slug] only 8 of 23 headings are literal in the page — the
 * other 13 come from four child components — and the route is per-slug (11
 * guides), so a hand-written list would be ~250 entries that rot silently.
 *
 * This script produces that data instead. It crawls every route, reads the
 * post-hydration heading list (the authoritative one — it is exactly what the
 * client scanner derives), and emits a committed manifest keyed by pathname.
 * `DocsLayout` consults it between an explicit `headings` prop and the tree walk.
 *
 * Usage:
 *   node scripts/docs/generate-toc-headings.mjs                 # starts its own dev server
 *   node scripts/docs/generate-toc-headings.mjs --prod          # …or serves the built site
 *   node scripts/docs/generate-toc-headings.mjs --url http://127.0.0.1:3121
 *   node scripts/docs/generate-toc-headings.mjs --check --prod  # fail if stale, do not write
 *
 * `--prod` runs `next start` against apps/docs/.next (so the build must exist)
 * and is what the release gate uses: it is read-only with respect to `.next`,
 * unlike `next dev`, so it cannot clobber the build audit H then serves from.
 * It picks a port distinct from audit H's 32123.
 *
 * Every route with at least one heading is recorded, so the output is a pure
 * function of the rendered pages and `--check` is meaningful. Routes that pass
 * an explicit `headings` prop are still recorded; the prop simply wins at
 * runtime, which keeps the manifest stable rather than conditional.
 *
 * Requires a headless Chromium (Playwright cache or THEME_KIT_CHROME) — the same
 * toolchain audit H uses. Skips cleanly when it is unavailable.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const siteRoot = join(repoRoot, "apps", "docs");
const routesFile = join(siteRoot, "lib", "docs-routes.ts");
const outFile = join(siteRoot, "lib", "generated", "toc-headings.ts");

const argOf = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : null;
};
const PORT = Number(argOf("--port") ?? (process.argv.includes("--prod") ? 32124 : 3187));
const externalUrl = argOf("--url");
const check = process.argv.includes("--check");
const prod = process.argv.includes("--prod");
const BASE = externalUrl ?? `http://127.0.0.1:${PORT}`;
const CDP_PORT = PORT + 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Locate headless Chromium (mirrors audit H) -----------------------------

function findChrome() {
  if (process.env.THEME_KIT_CHROME && existsSync(process.env.THEME_KIT_CHROME)) {
    return process.env.THEME_KIT_CHROME;
  }
  const cache = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "ms-playwright")
    : join(os.homedir(), "AppData", "Local", "ms-playwright");
  if (!existsSync(cache)) return null;
  const rels = [
    "chrome-win64/chrome.exe",
    "chrome-win/chrome.exe",
    "chrome-linux/chrome",
    "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
  ];
  for (const d of readdirSync(cache).filter((x) => /^chromium(-\d+)?$/.test(x))) {
    for (const rel of rels) {
      const p = join(cache, d, rel);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

// --- Minimal CDP client over Node's built-in WebSocket ----------------------

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id === undefined) return;
      const q = this.pending.get(m.id);
      if (!q) return;
      this.pending.delete(m.id);
      if (m.error) q.reject(new Error(JSON.stringify(m.error)));
      else q.resolve(m.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

/**
 * Read the route list out of `lib/docs-routes.ts` textually. Importing the module
 * would need a TypeScript loader; the file is a flat array of `href` literals, so
 * a scan is both simpler and dependency-free.
 */
function docsRoutes() {
  const source = readFileSync(routesFile, "utf8");
  return [...source.matchAll(/href:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
}

/** The heading list the client scanner derives, read from the live DOM. */
const HEADINGS_EXPR = `(() => {
  const root = document.querySelector('[data-toc-root]');
  if (!root) return [];
  return [...root.querySelectorAll("h2, h3")]
    .map((h) => ({ text: h.textContent.trim(), level: h.tagName === "H2" ? 2 : 3 }))
    .filter((h) => h.text);
})()`;

/** Count the rail anchors in the raw SSR HTML. */
function ssrRailCount(html) {
  const i = html.indexOf('aria-label="On this page"');
  if (i === -1) return 0;
  const end = html.indexOf("</nav>", i);
  const region = html.slice(i, end === -1 ? i + 20000 : end);
  return (region.match(/href="#/g) || []).length;
}

/**
 * Read the heading list once hydration has settled.
 *
 * A fixed sleep is not safe here: a cold dev-server compile can take several
 * seconds, and reading early records a *partial* list — which would bake wrong
 * data into a committed file. So poll until the count stops changing, then take
 * one final sample. `minMs` gives fast routes a floor so we do not sample before
 * the client scan has run at all.
 */
async function settledHeadings(evaluate, { minMs = 2500, maxMs = 20000, quiet = 1500 } = {}) {
  const started = Date.now();
  await sleep(minMs);
  let last = await evaluate(HEADINGS_EXPR);
  while (Date.now() - started < maxMs) {
    await sleep(quiet);
    const next = await evaluate(HEADINGS_EXPR);
    // Compare the whole list, not its length. Two samples can agree on the count
    // while the set is still changing — a page whose headings come from client
    // components swaps them in over several ticks — and "same count" is then a
    // false settle that bakes a partial list into a committed file. Deep equality
    // is what makes this run-to-run deterministic.
    if (JSON.stringify(next) === JSON.stringify(last)) return next;
    last = next;
  }
  return last;
}

/** Parse a generated manifest back into `href -> headings`, for diffing. */
function parseManifest(source) {
  const out = new Map();
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const head = /^ {2}("(?:\\.|[^"\\])*"): \[\s*$/.exec(lines[i]);
    if (!head) continue;
    let href;
    try {
      href = JSON.parse(head[1]);
    } catch {
      continue;
    }
    const rows = [];
    for (i++; i < lines.length && !/^ {2}\],?\s*$/.test(lines[i]); i++) {
      const row = /^\s*\{ text: ("(?:\\.|[^"\\])*"), level: ([23]) \},\s*$/.exec(lines[i]);
      if (row) rows.push({ text: JSON.parse(row[1]), level: Number(row[2]) });
    }
    out.set(href, rows);
  }
  return out;
}

/**
 * Name the routes whose heading list differs.
 *
 * The divergence lines printed during the crawl only appear when SSR and
 * hydration disagree, and once a manifest is applied they agree — so the run
 * that matters is exactly the silent one. Without this the gate could only say
 * "stale", which is not actionable.
 */
function describeDrift(before, entries) {
  const out = [];
  const after = new Set(entries.map(({ href }) => href));
  for (const { href, headings } of entries) {
    const prev = before.get(href);
    if (!prev) {
      out.push(`  + ${href} — ${headings.length} heading(s), not in the manifest`);
      continue;
    }
    if (prev.length !== headings.length) {
      out.push(`  ~ ${href} — ${prev.length} heading(s) -> ${headings.length}`);
      continue;
    }
    for (let i = 0; i < headings.length; i++) {
      if (prev[i].text !== headings[i].text || prev[i].level !== headings[i].level) {
        out.push(
          `  ~ ${href}[${i}] — ${JSON.stringify(prev[i].text)} (h${prev[i].level}) -> ` +
            `${JSON.stringify(headings[i].text)} (h${headings[i].level})`,
        );
        break;
      }
    }
  }
  for (const href of before.keys()) if (!after.has(href)) out.push(`  - ${href} — dropped`);
  return out.length > 20 ? [...out.slice(0, 20), `  … and ${out.length - 20} more`] : out;
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.log("SKIP — headless Chromium not found (set THEME_KIT_CHROME).");
    return;
  }

  const routes = docsRoutes();
  if (routes.length === 0) throw new Error(`No routes parsed from ${routesFile}`);

  let server = null;
  if (!externalUrl) {
    // `next start` serves the existing build and never writes to `.next`, so it
    // can run alongside audit H. `next dev` is the convenient local default but
    // does write to `.next`, which is why the gate uses --prod.
    if (prod && !existsSync(join(siteRoot, ".next", "BUILD_ID"))) {
      throw new Error(
        "apps/docs/.next/BUILD_ID is missing — run `next build` in apps/docs before using --prod.",
      );
    }
    server = spawn(
      process.execPath,
      [
        join(siteRoot, "node_modules", "next", "dist", "bin", "next"),
        prod ? "start" : "dev",
        "-p",
        String(PORT),
      ],
      { cwd: siteRoot, stdio: "ignore", env: { ...process.env, NODE_OPTIONS: "" } },
    );
  }

  const dir = join(os.tmpdir(), `tk-toc-${Date.now()}`);
  const chrome = spawn(
    chromePath,
    ["--headless=new", `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${dir}`, "--no-first-run", "--disable-gpu"],
    { stdio: "ignore" },
  );

  try {
    for (let i = 0; i < 90; i++) {
      try {
        if ((await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) })).ok) break;
      } catch {}
      await sleep(1000);
    }
    for (let i = 0; i < 80; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).ok) break;
      } catch {}
      await sleep(250);
    }

    const target = await (
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: "PUT" })
    ).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener("open", res);
      ws.addEventListener("error", rej);
    });
    const cdp = new Cdp(ws);
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const evaluate = async (expr) =>
      (await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true })).result.value;

    const entries = [];
    for (const href of routes) {
      let ssr = 0;
      try {
        const html = await (
          await fetch(`${BASE}${href}`, { signal: AbortSignal.timeout(120000) })
        ).text();
        ssr = ssrRailCount(html);
      } catch {
        continue;
      }

      await cdp.send("Page.navigate", { url: `${BASE}${href}` });
      const hydrated = await settledHeadings(evaluate);

      // Record every route that has headings, not just the ones currently
      // diverging. Recording only the divergent set would make this script
      // non-idempotent: once the manifest is applied the SSR rail already
      // matches the DOM, so a re-run would compute an empty diff and `--check`
      // could never pass. Snapshotting the full set keeps the output a pure
      // function of the rendered pages.
      if (hydrated.length >= 1) {
        entries.push({ href, headings: hydrated });
        if (hydrated.length !== ssr) {
          console.log(
            `  ${href.padEnd(34)} SSR ${String(ssr).padStart(2)} -> hydrated ${String(hydrated.length).padStart(2)}  (was diverging)`,
          );
        }
      }
    }

    const body = entries
      .map(({ href, headings }) => {
        const rows = headings
          .map((h) => `      { text: ${JSON.stringify(h.text)}, level: ${h.level} },`)
          .join("\n");
        return `  ${JSON.stringify(href)}: [\n${rows}\n  ],`;
      })
      .join("\n");

    const source = `// GENERATED FILE — do not edit by hand.
//
// Regenerate with: node scripts/docs/generate-toc-headings.mjs
//
// Why this exists: DocsLayout's render-tree walk stops at opaque client-component
// boundaries, so on many routes the "On this page" rail was painted short and
// then grew after hydration. Each entry is the heading sequence the client
// scanner derives, so SSR and hydration now agree and the rail never resizes.
//
// Every route with at least one heading is listed. Where a page also passes an
// explicit \`headings\` prop that prop wins; the entry is then unused, which keeps
// this file a plain snapshot rather than a conditional one.

export type GeneratedHeading = { text: string; level: 2 | 3 };

export const GENERATED_TOC_HEADINGS: Record<string, GeneratedHeading[]> = {
${body}
};
`;

    // A crawl that finds no headings anywhere is a broken crawl, not an empty
    // site: every route in `docs-routes.ts` renders at least one heading. The
    // way this actually happens is a partial or corrupt `apps/docs/.next` — the
    // failure mode the release gate's `next build` `verify` already guards —
    // which makes `next start` answer 500, so `document.querySelector(
    // "[data-toc-root]")` is null on every route and this reads as "no headings
    // anywhere". Both modes must refuse it: writing would silently delete a
    // committed manifest, and `--check` would report a false "stale" and send
    // the reader off regenerating against a site that never rendered.
    if (entries.length === 0) {
      console.error(
        `\nFAIL — crawled ${routes.length} route(s) and found no headings on any of them.\n` +
          `That means the site did not render — a corrupt apps/docs/.next makes \`next start\` answer 500.\n` +
          `Refusing to touch ${outFile}.\n` +
          `Fix: delete apps/docs/.next and run \`next build\` in apps/docs, then retry.`,
      );
      process.exitCode = 1;
      return;
    }

    // `--check` follows the generate-api-reference convention: fail rather than
    // write, so the release gate can catch a manifest that has drifted from the
    // pages it describes.
    if (check) {
      const existing = existsSync(outFile) ? readFileSync(outFile, "utf8") : "";
      if (existing.trim() !== source.trim()) {
        // "stale" alone is not actionable: the divergence lines above only print
        // when SSR and hydration disagree, and once the manifest is applied they
        // agree — so the run that matters is usually the silent one. Diff the two
        // snapshots instead and name the route.
        const drift = describeDrift(parseManifest(existing), entries);
        console.error(
          `\nFAIL — ${outFile} is stale.` +
            (drift.length ? `\n\n${drift.join("\n")}` : "") +
            `\n\nRun: node scripts/docs/generate-toc-headings.mjs`,
        );
        process.exitCode = 1;
        return;
      }
      console.log(`\nChecked ${routes.length} routes; manifest is up to date (${entries.length} entries).`);
      return;
    }

    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, source, "utf8");
    console.log(`\nChecked ${routes.length} routes; wrote ${entries.length} entries.`);
    console.log(`Output: ${outFile}`);
  } finally {
    chrome.kill();
    if (server) server.kill();
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
