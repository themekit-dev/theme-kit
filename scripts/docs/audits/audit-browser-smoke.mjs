#!/usr/bin/env node
/**
 * Audit H — docs-site browser smoke (docs-system brief, Audit H).
 *
 * Boots the built docs site (`next start` — run `npm run build` in apps/docs
 * first), drives headless Chromium over the CDP protocol, and checks every
 * DOCS_ROUTES page for:
 *   - HTTP 200 (a listed route that 404s means IA/route drift),
 *   - no console errors and no uncaught page exceptions after hydration,
 *   - non-empty rendered text.
 *
 * Content spot-checks enforce Audit F / §6.4 guarantees in a real browser:
 *   - /api-reference/* pages render their package name and the generated
 *     "Related docs" capability backlink section;
 *   - framework pages use the mode vocabulary ("Pick the mode:"), never
 *     variant ("Pick the variant:").
 *
 * Infrastructure-skip: when headless Chromium or the `ws` CDP transport is
 * unavailable the audit reports SKIP and exits 0 (browser checks are best-
 * effort on machines without the toolchain); pass --strict to fail instead.
 *
 * Usage: node scripts/docs/audits/audit-browser-smoke.mjs [--strict]
 * Requires: apps/docs/.next build (a `next start` server), Chromium, ws.
 */

import { spawn } from "node:child_process";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const siteRoot = join(repoRoot, "apps", "docs");
const strict = process.argv.includes("--strict");

const failures = [];
const fail = (where, detail) => failures.push({ where, detail });

function skip(msg) {
  console.log(`\n=== AUDIT H — BROWSER SMOKE ===\n\n  SKIP — ${msg}\n`);
  if (strict) {
    console.log("--strict: treating skip as a failure.");
    // `process.exit(0)` would override `process.exitCode`, so exit explicitly
    // with the failing code — otherwise `--strict` would silently pass.
    process.exit(1);
  }
  process.exit(0);
}

// --- Locate headless Chromium (Playwright cache or THEME_KIT_CHROME) --------
function findChrome() {
  if (process.env.THEME_KIT_CHROME && existsSync(process.env.THEME_KIT_CHROME)) {
    return process.env.THEME_KIT_CHROME;
  }
  const pwRoot = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "ms-playwright")
    : join(os.homedir(), "AppData", "Local", "ms-playwright");
  if (!existsSync(pwRoot)) return null;
  const dirs = readdirSync(pwRoot)
    .filter((d) => /^chromium(-\d+)?$/.test(d))
    .sort((a, b) => Number(b.split("-")[1] ?? 0) - Number(a.split("-")[1] ?? 0));
  for (const d of dirs) {
    for (const exe of [
      join(pwRoot, d, "chrome-win64", "chrome.exe"),
      join(pwRoot, d, "chrome-win", "chrome.exe"),
      join(pwRoot, d, "chrome-linux", "chrome"),
      join(pwRoot, d, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
    ]) {
      if (existsSync(exe)) return exe;
    }
  }
  return null;
}

// --- Locate the `ws` CDP transport (pnpm store or hoisted node_modules) -----
function findWs() {
  const candidates = [];
  const nm = join(repoRoot, "node_modules");
  const pnpm = join(nm, ".pnpm");
  if (existsSync(pnpm)) {
    for (const d of readdirSync(pnpm)) {
      if (/^ws@\d+\.\d+\.\d+$/.test(d)) candidates.push(join(pnpm, d, "node_modules", "ws"));
    }
  }
  candidates.sort((a, b) => b.localeCompare(a)); // newest version first
  if (existsSync(join(nm, "ws"))) candidates.unshift(join(nm, "ws"));
  for (const c of candidates) {
    if (existsSync(join(c, "package.json"))) return c;
  }
  return null;
}

const chrome = findChrome();
const wsPath = findWs();
if (!chrome) skip("headless Chromium not found (set THEME_KIT_CHROME or install Playwright browsers)");
if (!wsPath) skip("the `ws` package is not installed (needed for the CDP transport)");

const { default: WebSocket } = await import(`file://${wsPath.replaceAll("\\", "/")}/index.js`);

// --- Collect the routes to smoke --------------------------------------------
const routesSrc = readFileSync(join(siteRoot, "lib", "docs-routes.ts"), "utf8");
const docsRoutes = [...routesSrc.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);

// Generated API-reference pages are not individually listed in DOCS_ROUTES
// (only the index is); enumerate them from the generated content tree so the
// smoke loop covers every generated page too.
function generatedApiRoutes() {
  const out = [];
  const base = join(siteRoot, "content", "api-reference");
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(dir, e.name), `${prefix}/${e.name}`);
      else if (e.name.endsWith(".md")) out.push(`/api-reference${prefix}/${e.name.replace(/\.md$/, "")}`);
    }
  };
  walk(base, "");
  return out;
}
const apiRefRoutes = generatedApiRoutes();
const allRoutes = [...new Set([...docsRoutes, ...apiRefRoutes])];


const apiSlug = (route) => route.split("/")[2]; // /api-reference/react → "react"

// --- Boot the built site -----------------------------------------------------
if (!existsSync(join(siteRoot, ".next", "BUILD_ID"))) {
  skip("apps/docs/.next build not found — run `npm run build` in apps/docs first");
}

const port = 32123;
const server = spawn(
  process.execPath,
  [join(siteRoot, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(port)],
  { cwd: siteRoot, stdio: ["ignore", "pipe", "pipe"] },
);
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

const baseUrl = `http://localhost:${port}`;
async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`${baseUrl}/`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
    if (server.exitCode !== null) break;
  }
  throw new Error(`docs server did not become ready.\n${serverLog.slice(-2000)}`);
}

// --- Minimal CDP client over `ws` --------------------------------------------
function cdpConnect(cdpPort, browserPath = "/devtools/browser") {
  return new Promise((resolveCdp, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${cdpPort}${browserPath}`);
    let id = 0;
    const pending = new Map();
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id && pending.has(msg.id)) {
        const { resolve: res, reject: rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      }
    });
    const send = (method, params = {}, sessionId) =>
      new Promise((res, rej) => {
        const msgId = ++id;
        pending.set(msgId, { resolve: res, reject: rej });
        ws.send(JSON.stringify(sessionId ? { sessionId, id: msgId, method, params } : { id: msgId, method, params }));
      });
    ws.on("open", () => resolveCdp({ send, on: (h) => ws.on("message", h), off: (h) => ws.off("message", h) }));
    ws.on("error", reject);
  });
}

// --- Main flow ---------------------------------------------------------------
await waitForServer();

// Detached Chrome: --user-data-dir makes it write DevToolsActivePort (host
// port on line 1) — the reliable way to learn the ephemeral CDP endpoint.
const profileDir = join(os.tmpdir(), `tk-audit-h-${process.pid}`);
const child = spawn(
  chrome,
  ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profileDir}`, "--no-first-run", "--no-default-browser-check", "about:blank"],
  { stdio: "ignore", detached: true },
);
child.unref();
const portFile = join(profileDir, "DevToolsActivePort");
for (let i = 0; i < 60; i++) {
  if (existsSync(portFile)) break;
  await new Promise((r) => setTimeout(r, 250));
}
if (!existsSync(portFile)) skip("headless Chromium did not expose a CDP endpoint (DevToolsActivePort missing)");
const [cdpPortStr, browserPath = "/devtools/browser"] = readFileSync(portFile, "utf8").split("\n").map((s) => s.trim());
const cdpPort = Number(cdpPortStr);

const cdp = await cdpConnect(cdpPort, browserPath);
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const send = (method, params) => cdp.send(method, params, sessionId);

await send("Runtime.enable");
await send("Page.enable");
await send("Log.enable").catch(() => {});

/** Resolves with the params of the next CDP `method` event (or times out). */
function eventPromise(method, timeoutMs = 30000) {
  return new Promise((resolveEvt, reject) => {
    const timer = setTimeout(() => {
      cdp.off(handler);
      reject(new Error(`timeout waiting for ${method}`));
    }, timeoutMs);
    const handler = (raw) => {
      const msg = JSON.parse(raw);
      if (msg.method === method) {
        clearTimeout(timer);
        cdp.off(handler);
        resolveEvt(msg.params);
      }
    };
    cdp.on(handler);
  });
}

/** Navigate, wait for load + hydration settle, return console/page errors. */
async function visit(url) {
  const consoleErrors = [];
  const pageErrors = [];
  const onConsole = (raw) => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.consoleAPICalled" && msg.params?.type === "error") {
      consoleErrors.push(msg.params.args?.map((a) => a.value ?? a.description ?? "").join(" "));
    }
    if (msg.method === "Log.entryAdded" && msg.params?.entry?.level === "error") {
      consoleErrors.push(String(msg.params.entry.text ?? ""));
    }
    if (msg.method === "Runtime.exceptionThrown") {
      pageErrors.push(msg.params?.exceptionDetails?.exception?.description ?? msg.params?.exceptionDetails?.text ?? "exception");
    }
  };
  cdp.on(onConsole);
  try {
    const loaded = eventPromise("Page.loadEventFired", 45000);
    await send("Page.navigate", { url });
    await loaded;
    // Allow hydration to settle and lazy errors to surface.
    await new Promise((r) => setTimeout(r, 1200));
    const { result } = await send("Runtime.evaluate", {
      expression: "document.body.innerText.length",
      returnByValue: true,
    });
    return { textLength: Number(result.value ?? 0), consoleErrors, pageErrors };
  } finally {
    cdp.off(onConsole);
  }
}

console.log("\n=== AUDIT H — BROWSER SMOKE ===\n");
console.log(`Routes to check: ${allRoutes.length} (${apiRefRoutes.length} API-reference pages)\n`);

let checked = 0;
let index = 0;
for (const route of allRoutes) {
  // Progress matters here: this audit walks 140+ routes over ~15 minutes, and
  // `visit` can throw (a CDP navigation timeout). Without a running index a
  // failure gives no clue which route hung.
  index += 1;
  if (index % 10 === 0 || index === allRoutes.length) {
    console.log(`  … ${index}/${allRoutes.length}  (at ${route})`);
  }
  const url = `${baseUrl}${route}`;
  const res = await fetch(url).catch(() => null);
  if (!res || res.status !== 200) {
    fail(route, `HTTP ${res ? res.status : "fetch failed"} — route listed in docs-routes.ts does not render`);
    continue;
  }
  let textLength, consoleErrors, pageErrors;
  try {
    ({ textLength, consoleErrors, pageErrors } = await visit(url));
  } catch (e) {
    // Name the route rather than letting the CDP timeout escape as a bare stack.
    fail(route, `navigation failed: ${String(e && e.message ? e.message : e)}`);
    continue;
  }
  checked += 1;
  if (textLength === 0) fail(route, "page rendered empty (no text content after hydration)");
  for (const e of consoleErrors) fail(route, `console error: ${String(e).slice(0, 220)}`);
  for (const e of pageErrors) fail(route, `uncaught exception: ${String(e).slice(0, 220)}`);

  // Content spot-check: generated API pages must expose the package and the
  // §6.4 capability backlinks (Audit F guarantee + generated section).
  if (route.startsWith("/api-reference/")) {
    const { result } = await send("Runtime.evaluate", {
      expression: "document.body.innerText",
      returnByValue: true,
    });
    const text = String(result.value ?? "");
    const slug = apiSlug(route);
    if (!text.includes(`@theme-kit/${slug}`)) {
      fail(route, `API page does not mention its package (@theme-kit/${slug})`);
    }
    if (!text.includes("Related docs")) {
      fail(route, 'generated "Related docs" capability section missing');
    }
  }
}

// Mode-vocabulary spot-check on a framework page (root-fix verification).
const fwUrl = `${baseUrl}/framework-guides/react`;
const fwRes = await fetch(fwUrl).catch(() => null);
if (fwRes?.ok) {
  await visit(fwUrl);
  const { result } = await send("Runtime.evaluate", {
    expression: "document.body.innerText",
    returnByValue: true,
  });
  const hydrated = String(result.value ?? "");
  if (/Pick the variant:/.test(hydrated)) fail("/framework-guides/react (mode vocabulary)", 'page still renders "Pick the variant:"');
}

// Teardown: close the browser, stop the server, remove the throwaway profile.
await cdp.send("Browser.close").catch(() => {});
server.kill();

console.log(`\nChecked ${checked}/${allRoutes.length} routes in a real browser.`);
for (const f of failures) {
  console.log(`\n  ✗ ${f.where}\n      ${f.detail}`);
}
console.log(`\nFailures: ${failures.length}`);
process.exitCode = failures.length ? 1 : 0;
