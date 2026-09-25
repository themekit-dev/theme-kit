/**
 * Checks that the docs rail keeps its place across a client-side navigation.
 *
 * The rail lives inside the page tree, so Next re-mounts it on every route
 * change and the browser resets `scrollTop` to 0 — scroll down, click a link,
 * and the rail jumps to the top. The fix re-centers the rail on the active link
 * (the same thing the pre-paint script does on a full load), so this asserts
 * that after navigating the rail is scrolled to somewhere that shows the link
 * you just clicked.
 *
 * Usage: node scripts/probe-sidebar-scroll.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = probePort(4403);
const FROM = "/quick-start";
const TO = "/persistence";

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
const page = await browser
  .newContext({ viewport: { width: 1440, height: 800 } })
  .then((c) => c.newPage());

await page.goto(base + FROM, { waitUntil: "networkidle" });
await page.waitForSelector("nav[data-docs-sidebar]", { timeout: 30000 });
await page.waitForTimeout(2500);

const rail = page.locator("nav[data-docs-sidebar]");

// Scroll the rail to the bottom, so the link we click is far from where the
// rail would sit if it reset to the top.
await rail.evaluate((el) => {
  el.style.scrollBehavior = "auto";
  el.scrollTop = el.scrollHeight - el.clientHeight;
});
await page.waitForTimeout(400);
console.log(
  "rail scrollTop before navigating:",
  await rail.evaluate((el) => el.scrollTop),
);

// Navigate client-side. The link is in the page body because a link inside the
// rail scrolls under the sticky header and cannot be clicked reliably.
const link = page.locator(`main a[href="${TO}"]`).first();
await link.waitFor({ state: "attached", timeout: 30000 });

for (let attempt = 0; attempt < 3; attempt++) {
  await link.scrollIntoViewIfNeeded();
  await link.click({ timeout: 10000 }).catch(() => {});
  try {
    await page.waitForURL(`**${TO}`, { timeout: 10000 });
    break;
  } catch {
    console.log(`  (navigation attempt ${attempt + 1} did not land, retrying)`);
  }
}

const url = page.url();
await page.waitForTimeout(1500);

const result = await rail.evaluate((el) => {
  const active = el.querySelector('[aria-current="page"]');
  const railRect = el.getBoundingClientRect();
  const activeRect = active?.getBoundingClientRect();
  return {
    scrollTop: el.scrollTop,
    maxScroll: el.scrollHeight - el.clientHeight,
    activeHref: active?.getAttribute("href") ?? null,
    activeVisible:
      activeRect !== undefined &&
      activeRect.top >= railRect.top - 1 &&
      activeRect.bottom <= railRect.bottom + 1,
  };
});

console.log("url after navigation:", url);
console.log("rail after navigation:", result);

const navigated = url.endsWith(TO);
const ok = navigated && result.scrollTop > 0 && result.activeVisible;
console.log(
  ok
    ? ">>> PASS: the rail kept its place and shows the active link"
    : ">>> FAIL: the rail did not end up showing the active link",
);

await browser.close();
proc.kill("SIGKILL");
process.exit(ok ? 0 : 1);
