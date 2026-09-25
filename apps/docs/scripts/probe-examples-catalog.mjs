/**
 * Checks the /examples starter cards: one per framework app, each with a repo
 * link that resolves to the app's real directory.
 *
 * Usage: node scripts/probe-examples-catalog.mjs
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(here, "..", "..", "..");
const PORT = probePort(4600);

const EXPECTED = [
  "angular",
  "astro",
  "next",
  "nuxt",
  "react",
  "remix",
  "solid",
  "svelte",
  "tailwind",
  "vue",
  "web",
];

const proc = spawn(
  NODE,
  ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
  {
    cwd: path.join(repo, "apps", "docs"),
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
const page = await browser.newPage();
await page.goto(base + "/examples", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1200);

const cards = await page.evaluate(() =>
  [...document.querySelectorAll("[id^='starter-']")].map((el) => ({
    id: el.id,
    repoHref:
      el.querySelector("a[href*='github.com']")?.getAttribute("href") ?? "",
    devCommand: el.querySelector("code")?.textContent?.trim() ?? "",
  })),
);

console.log(`starter cards: ${cards.length}`);
let failures = 0;

for (const slug of EXPECTED) {
  const card = cards.find((c) => c.id === `starter-${slug}`);
  if (!card) {
    console.log(`FAIL ${slug}: no card on the page`);
    failures++;
    continue;
  }
  // The repo link must point at a directory that exists in this checkout.
  const dir = card.repoHref.split("/tree/main/")[1] ?? "";
  const exists = dir !== "" && existsSync(path.join(repo, dir));
  const problems = [];
  if (!exists) problems.push(`repo link "${dir}" does not exist`);
  if (!card.devCommand) problems.push("no dev command");
  console.log(
    `${problems.length ? "FAIL" : "ok  "} ${slug.padEnd(9)} ${dir.padEnd(14)} ${card.devCommand}`,
  );
  if (problems.length) {
    failures++;
    console.log("      " + problems.join("; "));
  }
}

console.log(`\ncatalog failures: ${failures}`);
await browser.close();
proc.kill("SIGKILL");
process.exit(failures ? 1 : 0);
