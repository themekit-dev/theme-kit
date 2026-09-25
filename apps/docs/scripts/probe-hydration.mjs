/**
 * Hydration probe for the docs app.
 *
 * Loads a set of routes in a real browser against `next dev` (unminified React,
 * so warnings carry a component stack) and prints every console message that
 * mentions hydration, mismatch or a React error code.
 *
 * Usage:
 *   node scripts/probe-hydration.mjs                 # a representative route set
 *   node scripts/probe-hydration.mjs /quick-start …  # specific routes
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = probePort(4399);

const DEFAULT_ROUTES = [
  "/",
  "/quick-start",
  "/framework-guides/react",
  "/framework-guides/astro",
  "/sunrise-sunset",
  "/custom-themes",
  "/scoped-theme",
  "/presets",
  "/brand",
  "/zero-flash",
  "/persistence",
];

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : DEFAULT_ROUTES;

const proc = spawn(
  NODE,
  ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
  {
    cwd: path.dirname(here),
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverLog = "";
proc.stdout.on("data", (d) => (serverLog += d));
proc.stderr.on("data", (d) => (serverLog += d));

const base = `http://localhost:${PORT}`;
for (let i = 0; i < 300; i++) {
  try {
    const r = await fetch(base + "/");
    if (r.status < 500) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ colorScheme: "light" });

const INTERESTING =
  /hydrat|mismatch|did not match|error #4\d\d|Warning:|server rendered|client rendered|text content/i;

let hits = 0;
for (const route of routes) {
  const page = await ctx.newPage();
  const msgs = [];
  page.on("pageerror", (e) => msgs.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (INTERESTING.test(t)) msgs.push(`console.${m.type()}: ${t}`);
  });

  try {
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2000);
  } catch (err) {
    msgs.push("navigation: " + err.message.split("\n")[0]);
  }

  if (msgs.length) {
    hits += msgs.length;
    console.log(`\n=== ${route} ===`);
    for (const m of msgs) console.log(m.slice(0, 6000));
  } else {
    console.log(`ok  ${route}`);
  }
  await page.close();
}

console.log(`\ntotal hydration-related messages: ${hits}`);
await browser.close();
proc.kill("SIGKILL");
