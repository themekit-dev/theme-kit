#!/usr/bin/env node
/**
 * docs:release-gate — docs-system brief §9.
 *
 * Runs every docs gate **sequentially** (they share a temp report file with
 * `scripts/release/snippet-audit.mjs`). Any failure blocks release.
 *
 *   API exists? / classified?   → scripts/docs/public-api.mjs --check
 *   Source = dist = docs?       → scripts/release/export-inventory.mjs
 *   Snippet imports valid?      → scripts/release/snippet-audit.mjs (via baseline)
 *   No docs drift (floor)?      → scripts/docs/snapshot-snippet-baseline.mjs
 *   Examples complete?          → scripts/docs/check-examples.mjs
 *   Export has a destination?   → audits/audit-b-package-to-docs.mjs --coverage=fail
 *   Examples valid?             → audits/audit-c-examples.mjs (static half)
 *   Dependencies correct?       → scripts/release/audit-dependencies.mjs (Audit D)
 *   No invented symbols?        → audits/audit-e-invented-symbols.mjs
 *   No internal symbols?        → audits/audit-f-internal-symbols.mjs
 *   Terminology consistent?     → audits/audit-g-terminology.mjs
 *   Tables well-formed?         → audits/audit-i-generated-tables.mjs
 *   IA + §3 page contracts?     → audits/audit-page-contracts.mjs
 *   Generated files current?    → apps/docs/scripts/generate-examples.mjs --check
 *                                 apps/docs/scripts/generate-framework-guides.mjs --check
 *                                 apps/docs/scripts/generate-package-graph.mjs --check
 *                                 apps/docs/scripts/generate-cli-reference.mjs --check
 *   Links / titles / sitemap?   → apps/docs/scripts/check-links.mjs
 *   Docs names are real?        → apps/docs/scripts/verify-package-apis.mjs
 *
 * Two different documentation contracts are checked here, and neither implies
 * the other:
 *
 *   "zero import drift" (snippet audit + baseline) — every documented
 *   `@theme-kit/*` import exists in the shipped API manifest. It catches
 *   *drift*. It says nothing about whether the example is usable.
 *
 *   "examples complete" (check-examples) — the example around that import is
 *   copy-pasteable: local files it imports are declared in the same bundle, its
 *   third-party packages are on the dependency allowlist, it does not mix
 *   framework bindings, and the `themes` identifier it uses is bound.
 *
 * A release is not blocked by the *known* incompleteness frozen in
 * `docs/reference/baselines/examples-baseline.json`; it is blocked by making it
 * worse. Run `npm run docs:examples:report` to see the current debt.
 *
 * Three tiers:
 *
 *   (default)   the fast, static gates above — run anywhere, ~40s.
 *
 *   --full      adds the slower, environment-dependent steps from §9:
 *               and enables --browser (below).
 *     Generated API pages current? → apps/docs/scripts/generate-api-reference.mjs --check
 *                          (regenerates in memory and compares — this is what
 *                          makes "don't hand-edit generated files" enforced)
 *     Example works?     → audits/audit-c-examples.mjs --offline
 *                          (compiled against the workspace's built .d.ts, then
 *                          rendered with react-dom/server — no network)
 *     Docs build works?  → `next build` in apps/docs
 *     Browser docs work? → audits/audit-browser-smoke.mjs --strict (Audit H)
 *   Needs a headless Chromium (Playwright cache or THEME_KIT_CHROME) and `ws`.
 *   Audit H runs with `--strict` so a missing toolchain fails rather than
 *   silently skipping.
 *
 *   --browser   adds the first-paint / readout regression gates. Each builds its
 *               example and drives headless Chromium through a frame matrix:
 *     Astro readout matrix → scripts/release/verify-astro-readouts.mjs
 *                          (12 rows: native + island × {persisted dark,
 *                          system+light, system+dark, system+dark+hint, fresh
 *                          visitor, stale family})
 *     React first-paint    → scripts/release/verify-react-first-paint.mjs
 *                          (bootstrap state on <html>; one run per build variant
 *                          present — `theme-config` always, `quickstart` when
 *                          examples/apps/react/dist has been built)
 *   Implied by --full. Neither gate has a SKIP path: a missing build output,
 *   a missing browser and a failed assertion all fail the release.
 *
 * NOTE — the browser tier runs *last* and only after every static step passed,
 * because `break` stops the run at the first failure. A static failure (e.g.
 * audit B's coverage gate) therefore hides these steps from the output
 * entirely; that is a listing artifact, not a dropped gate. Run the gates
 * directly (`npm run verify:astro-readouts`, `npm run verify:react-first-paint`)
 * to verify them while a static gate is red.
 *
 *   --dynamic   adds the strongest example check: pack each example's declared
 *               packages, install a throwaway consumer project from those
 *               tarballs, then typecheck and smoke-run the example. Needs `pnpm`
 *               + network (~4 min for 21 examples). Uses a private npm cache per
 *               run, so it no longer depends on the state of the machine's
 *               default npm cache.
 *
 * Usage:
 *   node scripts/docs/release-gate.mjs                     # fast, static gates
 *   node scripts/docs/release-gate.mjs --full              # + offline verify, build, browser
 *   node scripts/docs/release-gate.mjs --full --dynamic    # everything (§9 end to end)
 *   node scripts/docs/release-gate.mjs --only=browser      # probe: browser tier alone
 *
 * The four tiers are named `static`, `full`, `dynamic` and `browser`, and every
 * run prints a per-tier verdict:
 *
 *   PASSED / FAILED / NOT RUN (fail-fast after …) / NOT RUN BY SELECTION
 *
 * The default invocation fail-fasts across tiers, so a red static gate means the
 * browser tier never runs. That is the correct release behavior, but it made
 * "the browser gates did not run" indistinguishable from "the browser gates were
 * dropped" without reading stderr. `--only=<tier>` exists to answer that: it
 * runs one tier alone and reports the rest as NOT RUN BY SELECTION.
 *
 * It is a debugging selector, not a shortcut — a targeted run never claims the
 * release is unblocked, because the tiers it skipped may well be red.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const full = process.argv.includes("--full");
const dynamic = process.argv.includes("--dynamic");
// The browser regression gates build their example and launch Chromium, so they
// are opt-in (`--browser`, or implied by `--full`) rather than in the ~40s
// static tier. They are never skipped implicitly — see the block below.
const browser = process.argv.includes("--browser") || full;

/**
 * The named tiers, in execution order. A step belongs to exactly one tier.
 *
 * @remarks
 * `--only=<tier>` runs one tier and nothing else. It exists so "did the browser
 * gates actually run?" is answerable from stdout alone — the default invocation
 * fail-fasts, which means a red static gate stops the run before the browser
 * steps are ever listed, and that looks identical to "the browser tier was
 * dropped". It is a debugging selector, not a release shortcut: a targeted run
 * never reports a release verdict (see the summary).
 */
const TIER_LABELS = {
  static: "Static gate",
  full: "Full gate",
  dynamic: "Dynamic gate",
  browser: "Browser gate",
};
const TIER_ORDER = Object.keys(TIER_LABELS);

const onlyArg = process.argv.find((a) => a === "--only" || a.startsWith("--only="));
const only =
  onlyArg === undefined ? null : onlyArg.includes("=") ? onlyArg.slice(onlyArg.indexOf("=") + 1) : "";
if (only !== null && !TIER_ORDER.includes(only)) {
  console.error(
    `\n=== DOCS RELEASE GATE ===\n\n  FATAL — unknown --only=${JSON.stringify(only)}\n\n` +
      `  Expected one of: ${TIER_ORDER.join(", ")}.\n`,
  );
  process.exit(1);
}

const staticSteps = [
  { name: "public-api classification", cmd: "scripts/docs/public-api.mjs", args: ["--check"] },
  { name: "export inventory (source=dist=docs)", cmd: "scripts/release/export-inventory.mjs", args: [] },
  { name: "snippet audit (via baseline floor)", cmd: "scripts/docs/snapshot-snippet-baseline.mjs", args: [] },
  { name: "example completeness (copy-paste contract)", cmd: "scripts/docs/check-examples.mjs", args: [] },
  // The catalog is generated from `examples/apps/*`, so it goes stale silently
  // when an app moves. `docs:examples` audits the snippets, not the generator.
  { name: "examples catalog freshness (generated file is current)", cmd: "apps/docs/scripts/generate-examples.mjs", args: ["--check"] },
  // `content/framework-guides.md` is a generated mirror of `lib/frameworks.tsx`.
  // A stale mirror means the snippet audits below are reading guide content that
  // no longer exists on the site, so this runs before them.
  { name: "framework-guide mirror current (generated file is current)", cmd: "apps/docs/scripts/generate-framework-guides.mjs", args: ["--check"] },
  // `lib/generated/package-graph.ts` drives the package map. Its `--check` mode
  // existed but was wired to nothing, so it silently rotted — the same failure
  // mode as the TOC manifest. Both generated `lib/generated/*` files are now
  // gated, because an ungated generated file is a file that will drift.
  { name: "package graph current (generated file is current)", cmd: "apps/docs/scripts/generate-package-graph.mjs", args: ["--check"] },
  // `docs/style-guide.md` §1 names `cli:check` as the gate for the CLI reference
  // tables, but it was reachable only through the `apps/docs` package script, so
  // the declared gate and the enforced gate disagreed. The tables are generated
  // from `packages/cli/src/cli.ts` and `exit-codes.ts` — no build, no dist — so
  // it belongs in this static cluster with the other generated-freshness checks.
  { name: "CLI reference current (generated file is current)", cmd: "apps/docs/scripts/generate-cli-reference.mjs", args: ["--check"] },
  { name: "audit B — package → docs destinations", cmd: "scripts/docs/audits/audit-b-package-to-docs.mjs", args: ["--coverage=fail"] },
  { name: "audit C — canonical examples (static)", cmd: "scripts/docs/audits/audit-c-examples.mjs", args: [] },
  { name: "audit D — dependency isolation", cmd: "scripts/release/audit-dependencies.mjs", args: [] },
  // `verify-package-apis.mjs` existed but was wired only to `apps/docs`
  // (`apis:check`), so it silently rotted — the same failure mode as the TOC
  // manifest and the package graph above. It had resolved a package's surface
  // from `dist/index.*` alone, so `@theme-kit/remix`'s `getInitialThemeState`,
  // a `./server` subpath export, was reported as invented. It guards the same
  // class of factual error as audit E below: a name the docs claim exists.
  { name: "package-map APIs are real exports", cmd: "apps/docs/scripts/verify-package-apis.mjs", args: [] },
  { name: "audit E — no invented symbols", cmd: "scripts/docs/audits/audit-e-invented-symbols.mjs", args: [] },
  { name: "audit F — no internal symbols", cmd: "scripts/docs/audits/audit-f-internal-symbols.mjs", args: [] },
  { name: "audit G — terminology consistency", cmd: "scripts/docs/audits/audit-g-terminology.mjs", args: [] },
  { name: "audit I — well-formed markdown tables", cmd: "scripts/docs/audits/audit-i-generated-tables.mjs", args: [] },
  { name: "§2 IA + §3 page contracts", cmd: "scripts/docs/audits/audit-page-contracts.mjs", args: [] },
  // `docs/style-guide.md` §1 names `links` as the gate for internal links,
  // duplicate titles and sitemap coverage, but it was reachable only through the
  // `apps/docs` package script. It complements the step above rather than
  // duplicating it: the page contracts validate the `docs-routes.ts` registry
  // against the app's routes, while this scans inline JSX `href` literals
  // anywhere in source. A page linking to `/compatibility` when the route is
  // really `/reference/compatibility` is invisible to the registry check.
  { name: "internal links, titles, sitemap", cmd: "apps/docs/scripts/check-links.mjs", args: [] },
];

// The `--full`-only steps. Built unconditionally; the tier selection decides
// whether they run, so `--only=full` can run them without the static tier.
const fullSteps = [
  {
    name: "api reference drift (generated files are current)",
    cmd: "apps/docs/scripts/generate-api-reference.mjs",
    args: ["--check"],
  },
  {
    name: "audit C — canonical examples (offline verify)",
    cmd: "scripts/docs/audits/audit-c-examples.mjs",
    args: ["--offline"],
  },
  {
    name: "docs build (next build)",
    cmd: "apps/docs/node_modules/next/dist/bin/next",
    args: ["build"],
    cwd: join(repoRoot, "apps", "docs"),
    // `next build` can exit 0 having printed the full route table yet leave an
    // incomplete artifact (a locked/half-written `.next` on Windows drops
    // BUILD_ID and app-path-routes-manifest). Audit H would then skip, or —
    // worse — serve the partial build and report hundreds of confusing
    // console-error failures. Assert the artifact before trusting the build.
    verify: () => {
      const dist = join(repoRoot, "apps", "docs", ".next");
      for (const f of ["BUILD_ID", "app-path-routes-manifest.json", "prerender-manifest.json"]) {
        if (!existsSync(join(dist, f))) {
          return `apps/docs/.next/${f} is missing — \`next build\` did not complete (a locked .next leaves a partial build). Delete apps/docs/.next and retry.`;
        }
      }
      return null;
    },
  },
  { name: "audit H — browser smoke (docs site)", cmd: "scripts/docs/audits/audit-browser-smoke.mjs", args: ["--strict"] },
  // The TOC rail's SSR list comes from a committed manifest (lib/generated/
  // toc-headings.ts) because the render-tree walk cannot see headings inside
  // client components. Crawling the built site is the only way to know the
  // manifest still matches the pages, so this runs here, after the build, on
  // its own `next start` port (32124 — audit H uses 32123; neither writes to
  // .next). It skips cleanly when Chromium is unavailable, like audit H.
  { name: "TOC manifest is current", cmd: "scripts/docs/generate-toc-headings.mjs", args: ["--check", "--prod"] },
];

// Strongest example check: pack the declared packages, install a throwaway
// consumer project from those tarballs, then typecheck + smoke-run the
// example. Needs `pnpm` + network. Its own npm cache is used per run, so it no
// longer depends on the state of the machine's default npm cache.
const dynamicSteps = [
  {
    name: "audit C — canonical examples (dynamic consumer-compile)",
    cmd: "scripts/docs/audits/audit-c-examples.mjs",
    args: ["--dynamic"],
  },
];

const browserSteps = [];

{
  // The first-paint / readout regression gates. These build their example and
  // drive a real headless browser, which is the only way to observe a *frame
  // order* — no unit test can prove which frame painted which value.
  //
  // They sit behind `--browser` rather than in the default tier because they
  // cost a build + a browser launch each (~30-60s). They must never be silently
  // dropped from a release: run `--full` (which enables this tier) before
  // release. Neither gate has a SKIP path, so an unavailable browser is a
  // failure, not a quiet pass.
  //
  // The React gate enumerates variants. `theme-config` is the checked-in default
  // build and always runs; `quickstart` needs `dist/` written by the *separate*
  // `examples/apps/react/quickstart.vite.config.ts` build, so it is included
  // only when that output actually exists. Absent output is a fixture condition,
  // not a broken contract — silently asserting an unbuilt variant would make
  // this tier unrunnable rather than stronger.
  const reactExample = join(repoRoot, "examples", "apps", "react");
  const reactVariants = ["theme-config"];
  if (existsSync(join(reactExample, "dist", "index.html"))) {
    reactVariants.push("quickstart");
  }
  const reactSteps = reactVariants.map((variant) => ({
    name: `React first-paint (browser, bootstrap state) [${variant}]`,
    cmd: "scripts/release/verify-react-first-paint.mjs",
    args: [`--variant=${variant}`],
  }));
  if (reactVariants.length === 1) {
    console.log(
      "\nnote: examples/apps/react/dist/index.html is absent — skipping the " +
        "`quickstart` variant of the React first-paint gate. Build it with " +
        "`examples/apps/react/quickstart.vite.config.ts` to include it.",
    );
  }
  browserSteps.push(
    {
      name: "Astro readout matrix (browser, frame-0)",
      cmd: "scripts/release/verify-astro-readouts.mjs",
      args: [],
    },
    ...reactSteps,
  );
}

const TIERS = [
  { name: "static", steps: staticSteps },
  { name: "full", steps: fullSteps },
  { name: "dynamic", steps: dynamicSteps },
  { name: "browser", steps: browserSteps },
];

// Which tiers run? `--only=<tier>` selects exactly one; otherwise the cumulative
// set the flags asked for, in TIER_ORDER.
const selected = new Set(
  only !== null
    ? [only]
    : [
        "static",
        ...(full ? ["full"] : []),
        ...(dynamic ? ["dynamic"] : []),
        ...(browser ? ["browser"] : []),
      ],
);

/** Final state per tier — one of PASSED | FAILED | NOT RUN | NOT RUN BY SELECTION. */
const status = new Map();
let failedTier = null;
let failedStep = null;

for (const tier of TIERS) {
  if (!selected.has(tier.name)) {
    // Two different reasons a tier does not run, reported distinctly so neither
    // is confused with the fail-fast case below.
    status.set(tier.name, {
      state: only !== null ? "NOT RUN BY SELECTION" : "NOT RUN",
      note:
        only !== null
          ? `--only=${only}`
          : "not requested — pass --full / --browser / --dynamic",
    });
    continue;
  }
  if (failedTier) {
    // Fail-fast: the earlier tier's failure stops the run, so this one never
    // executed. Reported explicitly rather than left to be inferred from the
    // absence of output.
    status.set(tier.name, {
      state: "NOT RUN",
      note: `fail-fast after ${TIER_LABELS[failedTier]} failure`,
    });
    continue;
  }

  // Announced before the tier runs, so a long browser tier is legible from
  // stdout while it is still in progress.
  console.log(`\n${TIER_LABELS[tier.name]}: RUNNING`);

  let tierFailed = false;
  for (const step of tier.steps) {
    console.log(`\n>>> ${step.name} — node ${step.cmd} ${step.args.join(" ")}`);
    const r = spawnSync(process.execPath, [join(repoRoot, step.cmd), ...step.args], {
      stdio: "inherit",
      cwd: step.cwd ?? repoRoot,
      env: process.env,
    });
    if (r.status !== 0) {
      console.error(`\n>>> FAILED: ${step.name} (exit ${r.status})`);
      tierFailed = true;
      failedStep = step.name;
      break; // prefer surfacing the first real failure
    }
    const problem = step.verify?.();
    if (problem) {
      console.error(`\n>>> FAILED: ${step.name} — ${problem}`);
      tierFailed = true;
      failedStep = step.name;
      break;
    }
  }

  if (tierFailed) {
    status.set(tier.name, { state: "FAILED", note: null });
    failedTier = tier.name;
  } else {
    status.set(tier.name, { state: "PASSED", note: null });
  }
}

console.log("\n=== DOCS RELEASE GATE ===");
for (const name of TIER_ORDER) {
  const s = status.get(name);
  console.log(`  ${TIER_LABELS[name]}: ${s.state}${s.note ? ` (${s.note})` : ""}`);
}

const mode = [
  full ? "--full" : "static",
  dynamic ? "--dynamic" : null,
  browser && !full ? "--browser" : null,
]
  .filter(Boolean)
  .join(" + ");
console.log(
  `Mode: ${only !== null ? `--only=${only}` : mode}` +
    (only === null && !(full || dynamic || browser)
      ? " (pass --full for build + browser, --browser for the frame-order gates, --dynamic for the tarball install)"
      : ""),
);

if (failedTier) {
  console.log(`FAIL — ${TIER_LABELS[failedTier]} failed at "${failedStep}". Release blocked.`);
  process.exitCode = 1;
} else if (only !== null) {
  // A targeted run is a probe, not a verdict. Reporting "release not blocked"
  // here would let `--only=browser` green-light a release whose static gates
  // never ran, which is the one thing this flag must not be able to do.
  console.log(
    `Targeted run — ${TIER_LABELS[only]} passed. The other tiers did not run, ` +
      "so this is NOT a release verdict. Re-run without --only for that.",
  );
} else {
  console.log("All docs gates passed. Release not blocked by docs.");
}
