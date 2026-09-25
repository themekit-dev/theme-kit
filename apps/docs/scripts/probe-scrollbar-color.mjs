/**
 * Measures the docs site's own overlay scrollbar.
 *
 * The docs app mounts `ThemeScrollbar`, so the scrollbar a reader sees on every
 * page is this engine. This reports the theme tokens it resolves to, the thumb's
 * computed colour, and the contrast against the page background — in both modes.
 *
 * Usage: node scripts/probe-scrollbar-color.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = probePort(4570);

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

for (const mode of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: mode,
  });
  const page = await ctx.newPage();
  // The docs persist the selection in cookies; set them before the first load.
  await ctx.addCookies([
    { name: "theme-mode", value: mode, domain: "localhost", path: "/" },
    { name: "theme-family", value: "theme-kit", domain: "localhost", path: "/" },
    { name: "theme-name", value: `theme-kit-default-${mode}`, domain: "localhost", path: "/" },
  ]);
  await page.goto(base + "/custom-scrollbar", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForTimeout(1500);

  // Scroll so the auto-hiding thumb is on screen.
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(900);

  const info = await page.evaluate(() => {
    const thumbs = [...document.querySelectorAll(".tk-thumb")].map((el) => {
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        opacity: cs.opacity,
        w: cs.width,
        h: cs.height,
        host: el.closest("[data-theme-kit-host]")?.getAttribute("data-theme-kit-scrollbar") ?? "window",
      };
    });
    return {
      mode: document.documentElement.getAttribute("data-theme-mode"),
      theme: document.documentElement.getAttribute("data-theme"),
      background: getComputedStyle(document.documentElement).getPropertyValue("--theme-color-background").trim(),
      primary: getComputedStyle(document.documentElement).getPropertyValue("--theme-color-primary").trim(),
      accent: getComputedStyle(document.documentElement).getPropertyValue("--theme-color-accent").trim(),
      thumbVar: (() => { const h = document.querySelector("[data-theme-kit-host]"); return h ? getComputedStyle(h).getPropertyValue("--tk-scrollbar-thumb").trim() : "(unset)"; })(),
      thumbs,
    };
  });

  console.log(`--- requested ${mode}: mode=${info.mode} bg=${info.background} primary=${info.primary} accent=${info.accent}`);
  console.log(`    --tk-scrollbar-thumb = ${info.thumbVar || "(unset — engine default applies)"}`);
  for (const t of info.thumbs.slice(0, 4)) {
    console.log(`  ${t.host.padEnd(10)} bg=${t.bg} opacity=${t.opacity} size=${t.w}x${t.h}`);
  }
  await ctx.close();
}

await browser.close();
proc.kill("SIGKILL");
