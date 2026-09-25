/**
 * Inspects the "You're ready" completion card at a 390px viewport.
 *
 * The card lives on `/quick-start` only. The framework guides deliberately stop
 * at the styling step — a guide is reference material, and a green "you are
 * done" panel at the end of a page a reader may have landed on mid-scroll is
 * noise — so this probe follows the card to the one page that owns it.
 *
 * Asserts the title, the check icon, that the success tint resolves, and that
 * the card does not force horizontal overflow on a narrow phone.
 *
 * Usage: node scripts/probe-ready-state.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = probePort(4550);

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
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

let failures = 0;

for (const target of ["/quick-start"]) {
  await page.goto(`${base}${target}`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForTimeout(1500);

  const card = page.locator("#ready");
  const exists = (await card.count()) === 1;
  if (!exists) {
    console.log(`FAIL ${target}: no #ready section`);
    failures++;
    continue;
  }

  const info = await card.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const inner = el.querySelector("div.rounded-xl");
    const style = inner ? getComputedStyle(inner) : null;
    const icon = el.querySelector("svg");
    const title = el.querySelector(".font-semibold");
    return {
      text: el.innerText.replace(/\s+/g, " ").trim(),
      width: Math.round(box.width),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      borderColor: style?.borderTopColor ?? "",
      background: style?.backgroundColor ?? "",
      hasIcon: !!icon,
      iconPath: icon?.querySelector("path")?.getAttribute("d")?.slice(0, 24) ?? "",
      titleColor: title ? getComputedStyle(title).color : "",
      borderStyle: inner ? getComputedStyle(inner).borderTopStyle : "",
      borderWidth: inner ? getComputedStyle(inner).borderTopWidth : "",
      successVar: getComputedStyle(document.documentElement).getPropertyValue("--theme-color-success").trim(),
    };
  });

  const problems = [];
  if (!info.text.includes("You're ready")) problems.push("missing title");
  if (!info.hasIcon) problems.push("missing check icon");
  if (info.overflowX) problems.push("horizontal overflow at 390px");
  if (info.width < 300) problems.push(`card is only ${info.width}px wide`);

  console.log(
    `${problems.length ? "FAIL" : "ok  "} ${target}  ${info.width}px  ` +
      `bg=${info.background}  border=${info.borderColor}  success=${info.successVar}  icon=${info.hasIcon}`,
  );
  if (problems.length) {
    failures++;
    console.log("      " + problems.join("; "));
  }
  console.log("      " + info.text.slice(0, 150));
}

console.log(`\nready-state failures: ${failures}`);
await browser.close();
proc.kill("SIGKILL");
process.exit(failures ? 1 : 0);
