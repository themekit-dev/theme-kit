/**
 * Screenshots /custom-scrollbar so the scrollbar can be inspected visually.
 *
 * Usage: node scripts/probe-scrollbar-shot.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = probePort(4580);

const proc = spawn(
  NODE,
  ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
  {
    cwd: path.dirname(here),
    stdio: ["ignore", "pipe", "pipe"],
  },
);

const base = `http://localhost:${PORT}`;
for (let i = 0; i < 300; i++) {
  try {
    const r = await fetch(base + "/");
    if (r.status < 500) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 } });
const page = await ctx.newPage();

await page.goto(base + "/custom-scrollbar", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(2000);
await page.mouse.wheel(0, 500);
// Grab the frame while the auto-hiding thumb is still on screen.
await page.waitForTimeout(220);
await page.screenshot({
  path: path.join(here, "..", "shot-scrollbar-light.png"),
  clip: { x: 1280 - 60, y: 0, width: 60, height: 820 },
});

// Force the docs theme to dark and repeat.
await page.evaluate(() => {
  document.documentElement.setAttribute("data-theme-mode", "dark");
  document.documentElement.setAttribute("data-theme", "theme-kit-default-dark");
  localStorage.setItem("theme-mode", "dark");
});
await page.waitForTimeout(1200);
await page.mouse.wheel(0, 200);
await page.waitForTimeout(220);
await page.screenshot({
  path: path.join(here, "..", "shot-scrollbar-dark.png"),
  clip: { x: 1280 - 60, y: 0, width: 60, height: 820 },
});

console.log("wrote shot-scrollbar-light.png and shot-scrollbar-dark.png");
await browser.close();
proc.kill("SIGKILL");
