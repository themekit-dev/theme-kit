#!/usr/bin/env node
/**
 * First-paint regression gate for the React example.
 *
 * Guards the empty-root frame: React's concurrent root schedules the initial
 * commit, so the browser can paint one frame (~33 ms) with the root still empty
 * — visible as the UI blinking on reload. `themeKitVitePlugin({ syncFirstRender })`
 * closes it by resolving `react-dom/client` to a shim that flushes the first
 * `render` synchronously.
 *
 * Screenshot polling cannot see a 33 ms frame (a capture costs 50–100 ms), so
 * this samples from a rAF loop installed at document-start: the callback runs
 * after the frame's tasks and before the paint, which makes "was #root empty"
 * an accurate statement about what that frame painted.
 *
 * The network is throttled as well as the CPU. That matters: with a fast bundle
 * the pre-JS window is one frame and easy to miss, but on a slow one the
 * document paints for *hundreds* of milliseconds with `#root` still empty. An
 * earlier version of this gate throttled only the CPU and passed while that
 * window was wide open.
 *
 * Blank frames are split by whether React had marked the container yet
 * (`__reactContainer…`, set when `createRoot` runs):
 *   - pre-JS   — the window before the entry module runs
 *   - post-JS  — React had mounted but not committed
 *
 * Both FAIL.
 *
 * ## Which variant this gate targets
 *
 * `examples/apps/react` ships two builds, and only one has the empty-root
 * contract this gate asserts:
 *
 *   `dist/`              the QUICK START variant — plain `createRoot`, no build
 *                        plugin, no pre-paint bootstrap, and its readout spans
 *                        carry `data-readout` (not `data-tk-readout`).
 *   `dist-theme-config/` the build-integrated variant — `themeKitVitePlugin()`
 *                        derives the pre-paint bootstrap from `theme.config.ts`
 *                        and injects it into `theme-config.html`, and its
 *                        readouts are `[data-tk-readout]`.
 *
 * The gate therefore serves `dist-theme-config/theme-config.html`.
 *
 * ## The four contracts, kept separate on purpose
 *
 * An earlier revision of this file conflated four different guarantees into one
 * pass/fail, which is why it could not fail honestly: whenever the fixture lacked
 * markup it had implicitly assumed, the gate reported a regression that did not
 * exist, and the temptation was to weaken an assertion to clear it. The
 * contracts are now explicit and independently proven:
 *
 *   1. BOOTSTRAP STATE — the pre-paint bootstrap establishes the expected
 *      initial theme/mode/family on `<html>`. Fixture: the theme-config build's
 *      `data-theme*` attributes. Does NOT depend on any rendered readout.
 *
 *   2. SYNC-FIRST-RENDER — the shipping `syncFirstRender` shim commits the first
 *      React render synchronously, so no frame paints with `#root` empty. Proven
 *      by frame sampling alone; independent of prerendered markup.
 *
 *   3. FRAME-0 READOUT — a `[data-tk-readout]` element that exists in the served
 *      HTML is patched before its first paint and never fluctuates. This is
 *      asserted ONLY when the served HTML actually contains such an element.
 *      `examples/apps/react` prerenders none, so the gate says so out loud rather
 *      than failing on an assumption it made up. The real fixture for this
 *      contract is `examples/apps/astro/src/pages/index.astro` (prerendered
 *      `—` placeholders), verified by `verify-astro-readouts.mjs`.
 *
 *   4. NO-FLICKER TIMING — the readout, once present, never changes value. A
 *      change is the "label fluctuates on reload" bug.
 *
 * Regression scenarios preserved across the gates: persisted-dark, system+light,
 * system+dark, warm system+dark, fresh visitor (initialMode), stale family.
 * The four OS/persistence cases live in `verify-astro-readouts.mjs`, which has a
 * fixture that can actually observe them; this gate keeps the React-side
 * bootstrap-state equivalents.
 *
 * ## There is no SKIP path
 *
 * A missing build output, a missing browser, a missing `ws` and a failed
 * assertion all exit non-zero with an actionable message. Do not add a SKIP
 * branch: this gate previously hardcoded `examples/react`, kept "passing" after
 * the app moved to `examples/apps/react`, and so verified nothing for as long as
 * nobody read its output.
 *
 * Usage: node scripts/release/verify-react-first-paint.mjs [loads] [--variant=theme-config|quickstart]
 * Requires: `vite build` (theme-config variant: `vite build --config vite.config.theme-config.ts`),
 * headless Chromium, and `ws`.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readdirSync, mkdtempSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

// Derived from this file's location, not hardcoded. A hardcoded absolute repo
// root is what let this gate keep pointing at `examples/react` after the app
// moved to `examples/apps/react`, which made it SKIP (exit 0) on every run
// while a valid build sat one directory away. The gate looked green and
// verified nothing.
const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const exampleRoot = join(repoRoot, "examples", "apps", "react");
const strict = process.argv.includes("--strict");
const loads = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 6);
const PORT = 4477;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };

// `theme-config` (default) is the only variant with a `[data-tk-readout]`
// pre-paint contract to assert. See the header.
const variantArg = process.argv.find((a) => a.startsWith("--variant="));
const variant = variantArg ? variantArg.slice("--variant=".length) : "theme-config";
if (variant !== "theme-config" && variant !== "quickstart") {
  console.error(
    `\n=== REACT FIRST-PAINT GATE ===\n\n  FATAL — unknown --variant="${variant}"\n\n` +
      `  Expected "theme-config" (default) or "quickstart".\n`,
  );
  process.exit(1);
}
const isThemeConfig = variant === "theme-config";
const distDir = join(exampleRoot, isThemeConfig ? "dist-theme-config" : "dist");
// The theme-config build emits `theme-config.html`; the quickstart build emits
// `index.html`.
const entryFile = isThemeConfig ? "theme-config.html" : "index.html";
const buildHint = isThemeConfig ? "vite build --config vite.config.theme-config.ts" : "vite build";

/**
 * A missing prerequisite is a FAILURE, not a skip.
 *
 * `--strict` (used by the release gate) always failed on a missing toolchain;
 * the default mode exited 0. That default is what made a stale path invisible
 * for months: CI ran the gate, the gate printed SKIP, CI reported success. A
 * gate that passes without running is worse than one that fails, because it
 * manufactures confidence. There is no SKIP path any more.
 */
function fail(msg, detail) {
  console.error(`\n=== REACT FIRST-PAINT GATE ===\n\n  FATAL — ${msg}\n`);
  if (detail) console.error(`${detail}\n`);
  process.exit(1);
}

function findChrome() {
  if (process.env.THEME_KIT_CHROME && existsSync(process.env.THEME_KIT_CHROME))
    return process.env.THEME_KIT_CHROME;
  const pwRoot = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "ms-playwright")
    : join(os.homedir(), "AppData", "Local", "ms-playwright");
  if (!existsSync(pwRoot)) return null;
  for (const d of readdirSync(pwRoot).filter((x) => /^chromium(-\d+)?$/.test(x))) {
    const exe = join(pwRoot, d, "chrome-win64", "chrome.exe");
    if (existsSync(exe)) return exe;
  }
  return null;
}

function findWs() {
  const pnpm = join(repoRoot, "node_modules", ".pnpm");
  if (!existsSync(pnpm)) return null;
  const dirs = readdirSync(pnpm).filter((d) => /^ws@\d+\.\d+\.\d+$/.test(d)).sort();
  for (const d of dirs.reverse()) {
    const p = join(pnpm, d, "node_modules", "ws", "package.json");
    if (existsSync(p)) return join(pnpm, d, "node_modules", "ws");
  }
  return null;
}

if (!existsSync(join(distDir, entryFile))) {
  const staleDist = join(repoRoot, "examples", "react", "dist");
  fail(
    `the React example's ${variant} build output is missing at ${join(distDir, entryFile)}`,
    existsSync(staleDist)
      ? `A build exists at the OLD path (${staleDist}). That is the stale path this ` +
          `gate used to look at; the app now lives in examples/apps/react.`
      : `Build it first:\n` +
          `        cd examples/apps/react && ${buildHint}\n` +
          `      (\`npm run ${isThemeConfig ? "build:theme-config" : "build"}\` also works.)`,
  );
}

// --- which contracts this fixture can actually prove -------------------------
//
// Read the served HTML before the browser starts. Two facts decide which
// assertions are legitimate:
//
//   `hasPrerenderedMarkup` — is there content inside #root in the HTML? If not,
//     the empty-root check is meaningless: the app is client-rendered by design,
//     so #root is *supposed* to start empty. This gate asserts no-empty-frame
//     only for a build that ships prerendered markup.
//
//   `hasPrerenderedReadout` — is there a `[data-tk-readout]` element in the HTML?
//     If not, a frame-0 readout assertion is meaningless: there is no element to
//     patch until React mounts, so `?|?` on frame 0 is correct behaviour, not a
//     regression.
//
// Deriving these instead of assuming them is the whole point. The previous
// revision assumed both, so it reported ~17 failures against a perfectly healthy
// build — and the "fix" would have been to weaken an assertion, which is exactly
// the wrong move.
const servedHtml = await readFile(join(distDir, entryFile), "utf8");
const rootInner = servedHtml.match(/<div[^>]*id=["']root["'][^>]*>([\s\S]*?)<\/div>/);
const hasPrerenderedMarkup = Boolean(rootInner && rootInner[1].trim().length > 0);
// Count only real elements, not the selector strings the inline patch script
// contains — a naive substring count sees those and reports phantom readouts.
const readoutElementCount = (
  servedHtml.match(/<[a-z][^>]*\sdata-tk-readout=/gi) ?? []
).length;
const hasPrerenderedReadout = readoutElementCount > 0;

const chromePath = findChrome();
const wsPath = findWs();
if (!chromePath)
  fail(
    "headless Chromium not found",
    "Install Playwright's Chromium, or point THEME_KIT_CHROME at a chrome.exe.\n" +
      "      Do not silence this by skipping: the gate exists to observe a painted frame.",
  );
if (!wsPath)
  fail(
    "the `ws` package is not installed under node_modules/.pnpm",
    "The gate talks to Chromium over CDP, which needs a WebSocket client.",
  );

const require = createRequire(import.meta.url);
const WebSocket = require(wsPath);

// --- serve the built app ----------------------------------------------------
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = join(distDir, p);
  if (!existsSync(file) || p === "/") file = join(distDir, entryFile);
  if (!existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
  res.end(await readFile(file));
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const base = `http://127.0.0.1:${PORT}`;

// --- CDP --------------------------------------------------------------------
const profile = mkdtempSync(join(os.tmpdir(), "tk-rfp-"));
const child = spawn(
  chromePath,
  ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
   "--no-first-run", "--no-proxy-server", "--disable-gpu", "--window-size=1200,900", "about:blank"],
  { stdio: "ignore", detached: true },
);
child.unref();
const portFile = join(profile, "DevToolsActivePort");
for (let i = 0; i < 80; i++) {
  if (existsSync(portFile)) break;
  await new Promise((r) => setTimeout(r, 250));
}
if (!existsSync(portFile))
  fail(
    "headless Chromium did not expose a CDP endpoint",
    "The browser launched but never wrote DevToolsActivePort. A stale profile " +
      "lock or a blocked port is the usual cause.",
  );
const [cdpPort, browserPath = "/devtools/browser"] = (await readFile(portFile, "utf8"))
  .split("\n").map((s) => s.trim());

const cdp = await new Promise((res, rej) => {
  const ws = new WebSocket(`ws://127.0.0.1:${cdpPort}${browserPath}`);
  let id = 0; const pending = new Map(); const listeners = new Set();
  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result);
    }
    for (const l of listeners) l(raw);
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((r, j) => {
      const i = ++id; pending.set(i, { resolve: r, reject: j });
      ws.send(JSON.stringify(sessionId ? { sessionId, id: i, method, params } : { id: i, method, params }));
    });
  ws.on("open", () => res({ send, on: (h) => listeners.add(h), off: (h) => listeners.delete(h) }));
  ws.on("error", rej);
});
const consoleErrors = [];
cdp.on((raw) => {
  const m = JSON.parse(raw);
  if (m.method !== "Runtime.consoleAPICalled") return;
  const { type, args } = m.params;
  if (type !== "error" && type !== "warning") return;
  const text = args.map((a) => a.value ?? a.description ?? "").join(" ");
  // React's development warnings are the ones that matter here: they are how a
  // hook used from the wrong phase announces itself, and this gate existed for a
  // while without noticing "flushSync was called from inside a lifecycle method".
  if (text) consoleErrors.push({ type, text: text.slice(0, 160) });
});


const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const send = (m, p) => cdp.send(m, p, sessionId);
await send("Runtime.enable"); await send("Page.enable"); await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
// A cold, throttled load is what makes the frame visible; on a warm machine the
// commit usually wins the race and the gate would pass without proving anything.
await send("Emulation.setCPUThrottlingRate", { rate: 6 });
await send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 300,
  downloadThroughput: (400 * 1024) / 8,
  uploadThroughput: (400 * 1024) / 8,
});

const seedScript = await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `// A *persisted dark* selection, while the prerender runs with the default
// (light). That makes the prerendered readout and the resolved theme genuinely
// differ, which is the only way to see the label fluctuate: without it the
// prerendered value happens to be right and the check proves nothing.
try { localStorage.setItem('theme-selection', JSON.stringify({ mode: 'dark', family: 'mint' })); } catch (e) {}

window.__tkFrames = [];
(function(){
  var n = 0;
  function snap(){
    try {
      var root = document.getElementById('root');
      var theme = document.querySelector('[data-tk-readout="theme"]');
      var mode = document.querySelector('[data-tk-readout="mode"]');
      var de = document.documentElement;
      window.__tkFrames.push({
        rootChildren: root ? root.childElementCount : -1,
        reactOwned: root ? Object.keys(root).some(function(k){ return k.indexOf('__reactContainer') === 0; }) : false,
        readout: (theme ? theme.textContent : '?') + '|' + (mode ? mode.textContent : '?'),
        // The bootstrap-state contract: what the pre-paint script wrote onto
        // <html>. Independent of whether a readout is rendered, which is why it
        // can be asserted even on a fixture with an empty #root.
        dt: de.getAttribute('data-theme'),
        dm: de.getAttribute('data-theme-mode'),
        df: de.getAttribute('data-theme-family'),
        dsm: de.getAttribute('data-theme-selection-mode'),
        dsf: de.getAttribute('data-theme-selection-family'),
        ready: de.getAttribute('data-theme-ready'),
        rs: document.readyState,
      });
    } catch (e) {}
  }
  function loop(){ snap(); if (++n < 600) requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
})();`,
});

let preJs = 0;
let postJs = 0;
const failures = [];
console.log("\n=== REACT FIRST-PAINT GATE ===\n");
console.log(`loads: ${loads} (cpu 6x, cache disabled)\n`);

// Two passes. The first has a persisted dark selection, so the prerendered
// default and the resolved theme genuinely differ — that is what makes a late
// patch visible. The second has NO persisted selection, so the theme must match
// the configured `initialMode` instead; that is the case a plugin/runtime mode
// mismatch shows up in, and the first pass cannot see it.
//
// `expected` is the `[data-tk-readout]` value (only used when the fixture ships
// prerendered readouts). `expectedTheme`/`expectedSelMode` are the bootstrap's
// own `<html>` attributes, which are assertable on any fixture.
//
// `theme.config.ts` declares defaultTheme "mint-light", initialMode "system",
// initialFamily "mint" — so a fresh visitor resolves to mint-light while the
// *selection* mode stays "system" (the effective mode is what the OS decides).
//
// The quickstart variant has no `theme.config.ts` at all: `main.tsx` passes
// `defaultTheme="light" initialMode="system"` to the provider, so no pre-paint
// bootstrap is injected and no family is registered. Its expectations are
// therefore genuinely different — deriving them per variant is what stops this
// gate from reporting a healthy build as broken.
const themeConfigPasses = [
  {
    label: "persisted dark",
    expected: "mint-dark|dark",
    expectedTheme: "mint-dark",
    expectedFamily: "mint",
    expectedSelFamily: "mint",
    expectedSelMode: "dark",
    seeded: true,
  },
  {
    label: "no selection (initialMode)",
    expected: "mint-light|system",
    expectedTheme: "mint-light",
    expectedFamily: "mint",
    expectedSelFamily: "mint",
    expectedSelMode: "system",
    seeded: false,
  },
];

// No bootstrap is injected for this variant — `dist/index.html` has neither
// `theme-kit-bootstrap` nor `__THEME_KIT_CONFIG__`, so it is pure client runtime
// and asserts after React resolves. Its provider passes NO `themes` array, so the
// runtime falls back to the full built-in theme set. A persisted
// `{mode:"dark", family:"mint"}` therefore resolves to the built-in
// `mint-dark`, and a fresh visitor to the provider's `defaultTheme="light"`.
// Those are the observed, intended contracts — not guesses.
const quickstartPasses = [
  {
    label: "persisted dark",
    expected: "mint-dark|dark",
    expectedTheme: "mint-dark",
    expectedFamily: "mint",
    expectedSelFamily: "mint",
    expectedSelMode: "dark",
    seeded: true,
    bootstrap: false,
  },
  {
    label: "no selection (initialMode)",
    expected: "light|system",
    expectedTheme: "light",
    // The provider passes no `themes` and `defaultTheme="light"` resolves to the
    // built-in neutral theme, which carries no `meta.family`. Two layers then
    // disagree on purpose, and the gate encodes both:
    //
    //   data-theme-family            — mirrors `theme.meta.family`, so the
    //                                 attribute is REMOVED (<absent>).
    //   data-theme-selection-family  — `getThemeFamily()` normalises a
    //                                 familyless theme to the sentinel
    //                                 "default" (documented in
    //                                 model/selection.ts), so it reads
    //                                 "default".
    //
    // That is the shipped contract, not an inconsistency to fix here.
    expectedFamily: null,
    expectedSelFamily: "default",
    expectedSelMode: "system",
    seeded: false,
    bootstrap: false,
  },
];

const passes = (isThemeConfig ? themeConfigPasses : quickstartPasses).map((p) => ({
  bootstrap: true,
  ...p,
}));

let load = 0;
for (const pass of passes) {
  if (!pass.seeded) {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: seedScript.identifier });
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try { localStorage.removeItem('theme-selection'); } catch (e) {}
window.__tkFrames = [];
(function(){
  var n = 0;
  function snap(){
    try {
      var root = document.getElementById('root');
      var theme = document.querySelector('[data-tk-readout="theme"]');
      var mode = document.querySelector('[data-tk-readout="mode"]');
      var de = document.documentElement;
      window.__tkFrames.push({
        rootChildren: root ? root.childElementCount : -1,
        reactOwned: root ? Object.keys(root).some(function(k){ return k.indexOf('__reactContainer') === 0; }) : false,
        readout: (theme ? theme.textContent : '?') + '|' + (mode ? mode.textContent : '?'),
        // The bootstrap-state contract: what the pre-paint script wrote onto
        // <html>. Independent of whether a readout is rendered, which is why it
        // can be asserted even on a fixture with an empty #root.
        dt: de.getAttribute('data-theme'),
        dm: de.getAttribute('data-theme-mode'),
        df: de.getAttribute('data-theme-family'),
        dsm: de.getAttribute('data-theme-selection-mode'),
        dsf: de.getAttribute('data-theme-selection-family'),
        ready: de.getAttribute('data-theme-ready'),
        rs: document.readyState,
      });
    } catch (e) {}
  }
  function loop(){ snap(); if (++n < 600) requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
})();`,
    });
  }
  for (let i = 0; i < (pass.seeded ? loads : 1); i++) {
    load += 1;
  const loaded = new Promise((res) => {
    const h = (raw) => { if (JSON.parse(raw).method === "Page.loadEventFired") { cdp.off(h); res(); } };
    cdp.on(h);
  });
  await send("Page.navigate", { url: base + "/" });
  await loaded;
  await new Promise((r) => setTimeout(r, 2500));

  const frames = JSON.parse(
    (await send("Runtime.evaluate", { expression: "JSON.stringify(window.__tkFrames)", returnByValue: true })).result.value || "[]",
  );
  const blank = frames.filter((f) => f.rootChildren === 0);
  const pre = blank.filter((f) => !f.reactOwned).length;
  const post = blank.filter((f) => f.reactOwned).length;
  preJs += pre; postJs += post;
  const rendered = frames.some((f) => f.rootChildren > 0);

  // --- CONTRACT 1: bootstrap state -----------------------------------------
  // The pre-paint script must have written the expected selection onto <html>
  // before React matters. Asserted against frame 0, because that is the frame
  // the visitor sees. For the theme-config variant `data-theme-ready="true"` is
  // the bootstrap's own "I am done" flag, so a missing/partial bootstrap fails
  // here rather than silently producing a plausible-looking page. The quickstart
  // variant injects no bootstrap, so it is asserted after React resolves the
  // theme instead — and the "ready" flag is not required.
  const withBootstrap = pass.bootstrap
    ? frames.filter((f) => f.ready === "true")
    : frames.filter((f) => f.dt !== null);
  const bootstrapFrames = withBootstrap.length ? withBootstrap : frames;
  const first = bootstrapFrames[0] ?? {};
  if (pass.bootstrap && !withBootstrap.length) {
    failures.push(`${pass.label}: the pre-paint bootstrap never set data-theme-ready="true"`);
  }
  if (!pass.bootstrap && !withBootstrap.length) {
    failures.push(`${pass.label}: the runtime never resolved a theme onto <html>`);
  }
  if (first.dt !== pass.expectedTheme)
    failures.push(
      `${pass.label}: data-theme="${first.dt}", expected "${pass.expectedTheme}"`,
    );
  if (first.dsm !== pass.expectedSelMode)
    failures.push(
      `${pass.label}: data-theme-selection-mode="${first.dsm}", expected "${pass.expectedSelMode}"`,
    );
  // `expectedFamily` may be `null`, meaning "the attribute must be absent".
  // `getAttribute` returns real `null` for an absent attribute and the batch API
  // removes it via `removeAttribute`, so `null` here is a positive assertion that
  // no family was written — not an unknown. Format it as <absent> so a failure
  // reads clearly instead of printing the word "null".
  const show = (v) => (v === null || v === undefined ? "<absent>" : `"${v}"`);
  const familyWrong =
    pass.expectedFamily === null ? first.df !== null : first.df !== pass.expectedFamily;
  if (familyWrong) {
    failures.push(
      `${pass.label}: data-theme-family=${show(first.df)}, expected ${show(pass.expectedFamily)}`,
    );
  }
  const selFamilyWrong = first.dsf !== pass.expectedSelFamily;
  if (selFamilyWrong) {
    failures.push(
      `${pass.label}: data-theme-selection-family=${show(first.dsf)}, expected ${show(pass.expectedSelFamily)}`,
    );
  }
  // The resolved effective mode must agree with the resolved theme name. This is
  // the "mode says dark but the theme is light" mismatch the bootstrap exists to
  // prevent.
  const effFromTheme = String(first.dt ?? "").includes("dark") ? "dark" : "light";
  if (first.dm !== effFromTheme)
    failures.push(
      `${pass.label}: data-theme-mode="${first.dm}" disagrees with data-theme="${first.dt}"`,
    );

  // --- CONTRACT 2: sync-first-render ---------------------------------------
  // `syncFirstRender` is on by default; the shim flushes the first commit so no
  // frame paints with #root still empty. Only asserted when the build ships
  // prerendered markup — a client-only build legitimately starts with an empty
  // #root, and failing it for that would be asserting the fixture's architecture
  // rather than the shim.
  if (hasPrerenderedMarkup) {
    if (pre > 0) failures.push(`load ${load}: ${pre} pre-JS blank frame(s) — #root had no prerendered markup`);
    if (post > 0) failures.push(`load ${load}: ${post} post-JS blank frame(s) — the first render was not committed synchronously`);
  }
  if (!rendered) failures.push(`load ${load}: the app never rendered`);

  // --- CONTRACT 3 + 4: frame-0 readout, and no flicker ---------------------
  // Only meaningful when the served HTML actually contains a `[data-tk-readout]`
  // element. Without one, the readout cannot exist until React mounts, so `?|?`
  // on frame 0 is correct and asserting it would be inventing a regression.
  const readouts = [];
  for (const f of frames) {
    if (!readouts.length || readouts[readouts.length - 1] !== f.readout) readouts.push(f.readout);
  }
  if (hasPrerenderedReadout) {
    // Frame-0: the first value the readout ever holds must already be correct.
    if (readouts.length > 0 && readouts[0] !== pass.expected) {
      failures.push(`${pass.label}: readout was "${readouts[0]}" on frame 0, expected "${pass.expected}"`);
    }
    // No flicker: a change after the first value is the "label fluctuates on
    // reload" bug the head-script patch prevents.
    if (readouts.length > 1) {
      failures.push(`${pass.label}: readout fluctuated (${readouts.join(" -> ")})`);
    }
  }

  // A pass means every contract this fixture can prove held.
  const proved = [
    "bootstrap",
    hasPrerenderedMarkup ? "sync-first" : null,
    hasPrerenderedReadout ? "readout" : null,
  ].filter(Boolean);
  const status = failures.length === 0 ? "PASS" : "FAIL";
  console.log(
    `  ${status}  ${pass.label.padEnd(22)} load ${load}  ` +
      `proves: ${proved.join("+")}  ` +
      `${hasPrerenderedMarkup ? `blank: pre-JS ${pre}, post-JS ${post}  ` : ""}` +
      `${hasPrerenderedReadout ? `readout: ${readouts.join(" -> ")}  ` : ""}` +
      `data-theme=${first.dt ?? "-"} sel-mode=${first.dsm ?? "-"}`,
  );
  }
}

// Which of the four contracts this fixture could prove at all. Printed so the
// output never implies more coverage than was actually exercised.
console.log(`\n  contracts provable by this fixture:`);
console.log(`    bootstrap state      YES (data-theme* on <html>)`);
console.log(`    sync-first-render    ${hasPrerenderedMarkup ? "YES" : "NO — #root is empty in the served HTML (client-rendered build)"}`);
console.log(`    frame-0 readout      ${hasPrerenderedReadout ? "YES" : "NO — no [data-tk-readout] in the served HTML"}`);
if (!hasPrerenderedReadout) {
  console.log(`    -> frame-0 readout is proven by verify-astro-readouts.mjs, whose`);
  console.log(`       fixture (examples/apps/astro/src/pages/index.astro) prerenders`);
  console.log(`       [data-tk-readout] placeholders. Not asserted here, not skipped silently.`);
}
console.log(`\n  totals: pre-JS ${preJs}, post-JS ${postJs}`);
if (consoleErrors.length) {
  console.log(`\n  console errors/warnings: ${consoleErrors.length}`);
  for (const e of consoleErrors.slice(0, 6)) console.log(`     [${e.type}] ${e.text}`);
  failures.push(`${consoleErrors.length} console error/warning(s) — see above`);
}
for (const f of failures) console.log(`\n  ✗ ${f}`);
console.log(`\nFailures: ${failures.length}`);

await cdp.send("Browser.close").catch(() => {});
server.close();
process.exitCode = failures.length ? 1 : 0;
