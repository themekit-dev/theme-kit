/**
 * Checks that every framework guide contains a complete first-success path:
 * Install → Set up → Add a small UI → Style it with Theme Kit tokens, with the
 * toggle and the themed UI actually rendered and no dev-server step in the
 * onboarding flow.
 *
 * The completion card ("You're ready") belongs to `/quick-start` only. A
 * framework guide is reference material — a reader arrives there from a specific
 * integration question, and a green "you are done" panel at the end of a page
 * they may have landed on mid-scroll is noise. The guides are asserted to *not*
 * carry it, so it cannot creep back in eleven files at once.
 *
 * The styling step is asserted twice over, because it is the one step whose
 * content is identical in every framework and therefore the one that can go
 * stale in eleven places at once: the stylesheet has to be *rendered* on the
 * page the reader copies from, and every `var(--theme-*)` in it has to be a
 * custom property the shipped runtime actually emits. The second half re-derives
 * the emitted set by running `themeToCSSVariables()` from the built
 * `@theme-kit/core`, so a renamed token fails here instead of silently falling
 * back to an inherited value in every reader's app.
 *
 * Astro is asserted differently, because its guide is shape-driven rather than
 * one linear sequence: the setup selector must resolve to `#astro-only` /
 * `#astro-react`, each path must carry its own steps in order, each path's
 * install command must name the packages that path actually needs (the React
 * path adds `@astrojs/react`), the Astro + React path must show the island API
 * and a hydration directive, and — the reason the split exists — no React API
 * may appear anywhere in the Astro-only path.
 *
 * `/quick-start` is checked too: Astro's two shapes must both be reachable
 * there, the framework-free one must be the default, and switching to the React
 * shape must swap the install command, the config and the switcher together.
 * This is also the one page that must render the completion card.
 *
 * Usage: node scripts/probe-guide-first-success.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { chromium, CHROME, NODE, probePort } from "./lib/probe-env.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..", "..", "..");
/**
 * The custom properties the shipped runtime emits.
 *
 * Derived by *running* `themeToCSSVariables()` over the built-in themes rather
 * than by parsing `packages/core/src/css.ts`: the group→prefix mapping is
 * irregular (`shadows` emits `--theme-shadow-*`, singular) and each token key is
 * appended verbatim, so only the implementation is authoritative.
 */
const emittedProperties = await (async () => {
  try {
    const entry = pathToFileURL(
      path.join(repoRoot, "packages", "core", "dist", "index.js"),
    ).href;
    const core = await import(entry);
    const out = new Set();
    for (const theme of core.getBuiltInThemes()) {
      for (const name of Object.keys(core.themeToCSSVariables(theme))) out.add(name);
    }
    return out;
  } catch {
    return null;
  }
})();

/** The first line of the canonical stylesheet — how the probe finds its block. */
const STYLESHEET_MARKER = "Theme Kit emits its design tokens as CSS custom properties";

/**
 * The `var(--theme-*)` references inside the stylesheet block of `text`.
 *
 * Located by the stylesheet's own opening line and read from the rendered page,
 * so the assertion covers what the reader copies rather than the source it was
 * generated from — Shiki highlighting and the surrounding template included.
 */
function stylesheetReferences(text) {
  const at = text.indexOf(STYLESHEET_MARKER);
  if (at < 0) return null;
  const block = text.slice(at, at + 2600);
  return [...new Set([...block.matchAll(/var\((--theme-[A-Za-z0-9.-]+)/g)].map((m) => m[1]))];
}

/** `[]` when the stylesheet is sound, otherwise one problem string per defect. */
function stylesheetProblems(text, where) {
  const used = stylesheetReferences(text);
  if (!used) return [`${where}: the token-driven stylesheet is not rendered`];
  const problems = [];
  if (emittedProperties) {
    const unknown = used.filter((name) => !emittedProperties.has(name));
    if (unknown.length) {
      problems.push(
        `${where}: the stylesheet reads properties the runtime does not emit — ${unknown.join(", ")}`,
      );
    }
  }
  // A stylesheet that lost its token references would still render and still
  // pass the "not empty" check; a floor catches a truncated or rewritten block.
  if (used.length < 12) {
    problems.push(`${where}: the stylesheet exposes only ${used.length} token reference(s)`);
  }
  return problems;
}

const PORT = probePort(4540);

// slug -> the packages the install command must name, and the zero-flash
// badge the compatibility table implies ("yes" for Auto, "partial" for Manual).
const SLUGS = [
  ["react", ["@theme-kit/core", "@theme-kit/react"], "Partial"],
  ["next", ["@theme-kit/core", "@theme-kit/next"], "Yes"],
  ["vue", ["@theme-kit/core", "@theme-kit/vue"], "Partial"],
  ["svelte", ["@theme-kit/core", "@theme-kit/svelte"], "Partial"],
  ["solid", ["@theme-kit/core", "@theme-kit/solid"], "Partial"],
  ["angular", ["@theme-kit/core", "@theme-kit/angular"], "Partial"],
  ["web", ["@theme-kit/core", "@theme-kit/web"], "Partial"],
  ["tailwind", ["@theme-kit/core", "@theme-kit/tailwind", "@theme-kit/react"], undefined],
  ["astro", ["@theme-kit/core", "@theme-kit/astro"], "Yes"],
  ["nuxt", ["@theme-kit/core", "@theme-kit/nuxt"], "Yes"],
  ["remix", ["@theme-kit/core", "@theme-kit/remix"], "Partial"],
];

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
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

let failures = 0;

for (const [slug, pkgs, zeroFlash] of SLUGS) {
  const page = await ctx.newPage();
  try {
    await page.goto(`${base}/framework-guides/${slug}`, {
      waitUntil: "networkidle",
      timeout: 90000,
    });
  } catch (err) {
    console.log(`FAIL ${slug}: navigation — ${err.message.split("\n")[0]}`);
    failures++;
    await page.close();
    continue;
  }

  const info = await page.evaluate((pkgs) => {
    // innerText inserts newlines between the spans inside a highlighted code
    // block ("pnpm\n add\n @theme-kit/react"), so collapse whitespace before
    // matching anything inside a snippet.
    const text = (document.querySelector("article") || document.body).innerText
      .replace(/[ \t]+/g, " ")
      .replace(/\s*\n\s*/g, " ");
    const headings = [...document.querySelectorAll("h2")].map((h) =>
      h.textContent.replace(/^\d+\s*/, "").trim(),
    );
    const codeBlocks = [...document.querySelectorAll("figure, pre")].length;
    return {
      headings,
      codeBlocks,
      // The whole guide as the reader sees it, for the stylesheet assertions.
      text,
      hasInstallCmd: /\b(pnpm|npm|yarn|bun) (add|install)\b/.test(text),
      hasToggleCall: /toggleTheme|toggle\(\)|theme-kit-toggle/.test(text),
      // The onboarding flow runs from "Install" up to "Theme configuration".
      // A dev-server command in there would mean the "Run it" step crept back.
      onboardingDevCommand: (() => {
        const from = text.indexOf("Install");
        const to = text.indexOf("Theme configuration");
        if (from < 0 || to < 0) return "(could not locate the onboarding region)";
        const region = text.slice(from, to);
        return (region.match(/\b(pnpm|npm|yarn|bun) (run )?dev\b/) || [])[0];
      })(),
      hasReady: /You're ready|You’re ready/.test(text),
      missingPkgs: pkgs.filter((pkg) => !text.includes(pkg)),
      zeroFlashBadge: (text.match(/Zero-flash: (Yes|Partial|No)/) || [])[1],
      hasThemedUi:
        /var\(--theme-color-|bg-background|bg-card|theme-color-primary/.test(
          text,
        ),
    };
  }, pkgs);

  // The onboarding steps must appear in this order, with the completion state
  // directly after the toggle. Astro is asserted separately below: its guide is
  // shape-driven (Astro-only vs Astro + React) rather than one linear sequence,
  // so a single ordered list of h2s would not describe it.
  const problems = [];

  if (slug === "astro") {    const astro = await page.evaluate((sel) => {
      const collapse = (s) =>
        s.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ");
      const only = document.querySelector(sel.only);
      const react = document.querySelector(sel.react);
      const stepsOf = (el) =>
        el
          ? [...el.querySelectorAll("h3")].map((h) =>
              h.textContent.replace(/^\d+\.\s*/, "").trim(),
            )
          : [];
      // The install step renders a package-manager tabpanel. Reading it
      // directly lets us assert what the command the reader copies actually
      // names, separately from the prose around it.
      const installCmdOf = (el) => {
        const panel = el?.querySelector('[role="tabpanel"]');
        return panel ? collapse(panel.innerText) : "";
      };
      return {
        hasOnly: Boolean(only),
        hasReact: Boolean(react),
        onlySteps: stepsOf(only),
        reactSteps: stepsOf(react),
        onlyText: collapse(only ? only.innerText : ""),
        reactText: collapse(react ? react.innerText : ""),
        onlyInstall: installCmdOf(only),
        reactInstall: installCmdOf(react),
        navHrefs: [
          ...document.querySelectorAll(
            'nav[aria-label="Astro guide sections"] a[href^="#"]',
          ),
        ].map((a) => a.getAttribute("href")),
        h2: [...document.querySelectorAll("h2")].map((h) =>
          h.textContent.replace(/^\d+\s*/, "").trim(),
        ),
      };
    }, { only: "#astro-only", react: "#astro-react" });

    const wantH2 = [
      "Overview",
      "Choose your setup",
      "Astro-only",
      "Astro + React",
      "Shared behavior",
      "Examples",
    ];
    const missingH2 = wantH2.filter((h) => !astro.h2.includes(h));
    if (missingH2.length) problems.push(`missing sections: ${missingH2.join(", ")}`);

    if (!astro.hasOnly || !astro.hasReact)
      problems.push("the setup selector does not resolve to #astro-only / #astro-react");
    for (const href of ["#astro-only", "#astro-react"]) {
      if (!astro.navHrefs.includes(href))
        problems.push(`in-page nav does not link ${href}`);
    }

    const ordered = (list, want) => {
      const at = want.map((s) => list.indexOf(s));
      return at.every((p) => p >= 0) && at.every((p, i) => i === 0 || p > at[i - 1]);
    };

    if (!ordered(astro.onlySteps, ["Install", "Configure", "Use Theme Kit", "Style it with Theme Kit tokens"]))
      problems.push(
        `Astro-only steps missing or out of order: ${astro.onlySteps.join(" → ") || "(none)"}`,
      );
    if (
      !ordered(astro.reactSteps, [
        "Install",
        "Configure",
        "Add React island",
        "Use React APIs",
        "Style it with Theme Kit tokens",
      ])
    )
      problems.push(
        `Astro + React steps missing or out of order: ${astro.reactSteps.join(" → ") || "(none)"}`,
      );

    // The theme config is what `themeKit()` discovers and what the layout
    // imports, so the framework-free path must show the file itself — showing
    // only the integration registration leaves the layout unresolved.
    for (const needle of ["theme.config.ts", "defineThemeKitConfig"]) {
      if (!astro.onlyText.includes(needle))
        problems.push(`the Astro-only path does not show ${needle}`);
    }

    // The whole point of splitting the guide in two: the Astro-only path must be
    // implementable without knowing React, so no React API may appear in it.
    const leak = astro.onlyText.match(
      /@astrojs\/react|ThemeProviderClient|useTheme|astro\/client/,
    );
    if (leak) problems.push(`Astro-only path contains React: "${leak[0]}"`);

    if (!/ThemeProviderClient|astro\/client/.test(astro.reactText))
      problems.push("Astro + React path shows no React island API");
    if (!astro.reactText.includes("client:load"))
      problems.push("Astro + React path shows no hydration directive");

    // The two paths install different packages, and the install step is where
    // that has to be visible: a reader on the React path should not have to
    // infer `@astrojs/react` from prose and then discover a missing renderer at
    // build time. Asserted on the rendered command, not on the surrounding text.
    if (!astro.reactInstall.includes("@astrojs/react"))
      problems.push(
        `Astro + React install command does not name @astrojs/react: "${astro.reactInstall}"`,
      );
    if (astro.onlyInstall.includes("@astrojs/react"))
      problems.push("Astro-only install command names @astrojs/react");

    if (/\b(pnpm|npm|yarn|bun) (run )?dev\b/.test(astro.onlyText))
      problems.push("a dev-server command appears in the Astro-only path");

    // Both paths teach the same stylesheet — that is the point of sharing it —
    // so both have to render it, and neither may read a property that is not
    // emitted.
    problems.push(...stylesheetProblems(astro.onlyText, "Astro-only"));
    problems.push(...stylesheetProblems(astro.reactText, "Astro + React"));

    // The completion card is `/quick-start`'s job. A guide that renders it again
    // duplicates the onboarding ending in eleven places.
    if (info.hasReady)
      problems.push(
        'the guide still renders the "You\'re ready" completion card',
      );
  } else {
    // The first-success path, in order. Quick Start carries the same four steps,
    // so the two pages are asserted against one list.
    const want = ["Install", "Set up", "Add a small UI", "Style it with Theme Kit tokens"];
    const positions = want.map((label) => info.headings.indexOf(label));
    const inOrder =
      positions.every((pos) => pos >= 0) &&
      positions.every((pos, i) => i === 0 || pos > positions[i - 1]);
    const missing = want.filter((w) => !info.headings.includes(w));
    if (missing.length) problems.push(`missing sections: ${missing.join(", ")}`);
    if (info.onboardingDevCommand)
      problems.push(
        `dev-server command "${info.onboardingDevCommand}" in the onboarding flow`,
      );
    if (!inOrder)
      problems.push(`onboarding steps out of order: ${info.headings.slice(0, 6).join(" → ")}`);
    if (info.headings.includes("Run it"))
      problems.push("a \"Run it\" section is still present");
    // As in the Astro branch: the completion card belongs to `/quick-start`.
    if (info.hasReady)
      problems.push(
        "the guide still renders the \"You're ready\" completion card",
      );

    problems.push(...stylesheetProblems(info.text, slug));
  }

  if (!info.hasInstallCmd) problems.push("no install command");
  if (!info.hasToggleCall) problems.push("no toggle call in a snippet");
  if (!info.hasThemedUi) problems.push("no themed UI in a snippet");
  if (info.missingPkgs.length)
    problems.push(`install command omits ${info.missingPkgs.join(", ")}`);
  if ((info.zeroFlashBadge ?? undefined) !== zeroFlash)
    problems.push(
      `zero-flash badge is "${info.zeroFlashBadge}", compatibility table implies "${zeroFlash}"`,
    );

  if (problems.length) {
    failures++;
    console.log(`FAIL ${slug}: ${problems.join("; ")}`);
  } else {
    console.log(`ok   ${slug}  (${info.codeBlocks} code blocks)`);
  }
  await page.close();
}

// --- Quick Start: Astro's two shapes ---------------------------------------
// Quick Start is the shortest-path page, so it must not teach one shape's
// install and config and the other's switcher. The framework-free shape is the
// default; the React shape is one click away and swaps install, config and
// switcher together. Asserted here because the page is a client component — a
// server-rendered snapshot would show neither shape.
{
  const page = await ctx.newPage();
  const problems = [];
  try {
    await page.goto(`${base}/quick-start`, {
      waitUntil: "networkidle",
      timeout: 90000,
    });

    await page
      .getByRole("button")
      .filter({ hasText: "@theme-kit/astro" })
      .first()
      .click();
    await page.waitForTimeout(600);

    const read = () =>
      page.evaluate(() => {
        const collapse = (s) =>
          s.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ");
        // The guide root is the parent of its `#install` section — scoping to
        // it keeps the sidebar's framework list out of the assertions.
        const root = document.querySelector("#install")?.parentElement ?? null;
        const group = root?.querySelector(
          '[role="group"][aria-label="Astro setup"]',
        );
        const pressedOf = (el) =>
          el
            ? [...el.querySelectorAll("button")]
                .filter((b) => b.getAttribute("aria-pressed") === "true")
                .map((b) => b.innerText.replace(/\s+/g, " ").trim())
            : [];
        return {
          labels: group
            ? [...group.querySelectorAll("button")].map((b) =>
                b.innerText.replace(/\s+/g, " ").trim(),
              )
            : [],
          pressed: pressedOf(group),
          install: collapse(
            root?.querySelector('[role="tabpanel"]')?.innerText ?? "",
          ),
          text: collapse(root?.innerText ?? ""),
        };
      });

    const only = await read();

    if (only.labels.length !== 2)
      problems.push(
        `expected 2 setup shapes on /quick-start, found ${only.labels.length}`,
      );
    if (!only.pressed.some((l) => l.startsWith("Astro-only")))
      problems.push(
        `the framework-free shape is not the default: [${only.pressed.join(", ")}]`,
      );
    if (only.install.includes("@astrojs/react"))
      problems.push("the default Astro install command names @astrojs/react");
    if (!/ThemeToggle/.test(only.text))
      problems.push("the default shape shows no <ThemeToggle />");
    // The setup must declare the theme config, not just register the
    // integration: `theme.config.ts` is what `themeKit()` discovers, and the
    // layout imports it, so a page that omits it leaves the layout unresolved.
    for (const needle of [
      "theme.config.ts",
      "defineThemeKitConfig",
      "config={themeConfig}",
    ]) {
      if (!only.text.includes(needle))
        problems.push(`the Astro setup does not show ${needle}`);
    }
    const defaultLeak = only.text.match(/ThemeProviderClient|useTheme/);
    if (defaultLeak)
      problems.push(
        `the default Astro shape contains React: "${defaultLeak[0]}"`,
      );

    // The styling step is part of the shortest path now, so Quick Start has to
    // show it and the completion state — a reader who stops here must have seen
    // how the UI is driven by tokens, not just how it is mounted.
    for (const label of ["Style it with Theme Kit tokens", "You're ready"]) {
      if (!only.text.includes(label))
        problems.push(`Quick Start does not show "${label}"`);
    }
    problems.push(...stylesheetProblems(only.text, "quick-start (Astro-only)"));

    // Switch to the React shape and assert the whole page follows it.
    await page
      .locator('[role="group"][aria-label="Astro setup"] button')
      .filter({ hasText: "Astro + React" })
      .first()
      .click();
    await page.waitForTimeout(600);

    const react = await read();
    if (!react.pressed.some((l) => l.startsWith("Astro + React")))
      problems.push("clicking the React shape did not select it");
    if (!react.install.includes("@astrojs/react"))
      problems.push(
        `the React shape's install command omits @astrojs/react: "${react.install}"`,
      );
    if (!/\breact\(\)/.test(react.text))
      problems.push("the React shape does not register react() in the config");
    if (!react.text.includes("astro.config.mjs"))
      problems.push("the React shape does not show astro.config.mjs");
    // The shared files must survive the shape switch — only the integration
    // config changes, so the theme config and the layout stay as they were.
    for (const needle of ["theme.config.ts", "config={themeConfig}"]) {
      if (!react.text.includes(needle))
        problems.push(`the React shape drops ${needle}`);
    }
    if (!react.text.includes("ThemeProviderClient"))
      problems.push("the React shape shows no ThemeProviderClient island");
    if (!react.text.includes("client:load"))
      problems.push("the React shape shows no client:load hydration directive");
    // The stylesheet is shape-independent, so it must survive the switch too.
    problems.push(...stylesheetProblems(react.text, "quick-start (Astro + React)"));
  } catch (err) {
    problems.push(`navigation — ${err.message.split("\n")[0]}`);
  }

  if (problems.length) {
    failures++;
    console.log(`FAIL quick-start: ${problems.join("; ")}`);
  } else {
    console.log("ok   quick-start  (astro shapes)");
  }
  await page.close();
}

console.log(`\nguides failing the first-success check: ${failures}`);
await browser.close();
proc.kill("SIGKILL");
process.exit(failures ? 1 : 0);
