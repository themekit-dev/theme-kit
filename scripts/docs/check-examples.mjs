#!/usr/bin/env node
/**
 * docs:examples — example *completeness* (docs-hardening gate).
 *
 * Why this exists next to `scripts/release/snippet-audit.mjs`:
 *
 *   snippet-audit answers "does every documented `@theme-kit/*` import exist in
 *   the shipped API manifest?" — i.e. it catches **drift**. It says nothing
 *   about whether the example around that import is usable. A snippet can import
 *   three real symbols and still be impossible to run, because it also reaches
 *   for a file the reader has to invent, a package nobody declared, or a binding
 *   from a different framework.
 *
 *   This gate answers "is the example *complete*?" — the other half of the
 *   documentation contract. Both are needed; neither implies the other.
 *
 * Checks (all deterministic, no network, no toolchain):
 *
 *   A. local-reference completeness — every `./x` / `../x` import resolves to a
 *      file the *same bundle* declares (via its `title:` or a leading
 *      `// file.ts` comment). This is the `./themes` class of defect: imported
 *      49× across the docs, declared nowhere.
 *   B. dependency completeness — every non-Theme-Kit package a snippet imports
 *      is on the authored allowlist (`examples-allowlist.json`), so an example
 *      cannot quietly assume a dependency the reader was never told to install.
 *   C. framework consistency — a snippet must not mix framework bindings
 *      (`@theme-kit/vue` + `@theme-kit/react`), and a file whose extension names
 *      a framework (`.vue`, `.svelte`, `.component.ts`) must not import another
 *      framework's binding.
 *   D. binding completeness — a snippet that *uses* the `themes` identifier must
 *      either import it or sit in a bundle that declares a `themes.*` file.
 *      Enforces the established convention "a snippet must never require the
 *      reader to invent `themes.ts`".
 *   E. token references resolve — every `var(--theme-*)` a snippet reads must be
 *      a custom property the shipped runtime actually emits, or carry a fallback
 *      that names one. This is the same class of defect as A: a stylesheet that
 *      reads `var(--theme-color-card-foreground)` looks right, is copy-pasted
 *      without complaint, and silently does nothing — `themeToCSSVariables()`
 *      appends each token key to its group prefix **verbatim**, so the real
 *      property is camelCase (`--theme-color-cardForeground`) and there is no
 *      kebab conversion to catch the mistake. The declaration falls back to
 *      `inherit`, so the panel still renders — in the wrong colour, which is
 *      exactly why it survives review.
 *
 *      The emitted set is derived by *running* `themeToCSSVariables()` against
 *      the built package, not by parsing `packages/core/src/css.ts`: the
 *      group→prefix mapping is irregular (`shadows` emits `--theme-shadow-*`,
 *      singular) and only the implementation is authoritative. When the built
 *      package is not on disk the check reports itself skipped rather than
 *      failing, so a clean checkout is not blocked on a build.
 *
 * Debt model (deliberate): the docs currently carry real, known incompleteness.
 * Failing outright would block every release until all of it is fixed, so
 * violations are frozen in `docs/reference/baselines/examples-baseline.json`:
 *
 *   - a violation NOT in the baseline        -> FAIL (new incompleteness)
 *   - a baseline violation that is now gone  -> NOTE, not a failure
 *     (debt paid down is progress; the gate must not punish fixing docs)
 *
 * Usage:
 *   node scripts/docs/check-examples.mjs              # verify against the baseline
 *   node scripts/docs/check-examples.mjs --report     # list every violation
 *   node scripts/docs/check-examples.mjs --update     # re-freeze the baseline
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  walk,
  completenessRoots,
  extractSnippetEntries,
  extractMarkdownEntries,
  parseAllImports,
  isRelativeSpecifier,
  isNodeBuiltin,
  declaredFileName,
  moduleKey,
  resolveLocal,
} from "./lib/snippets.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const BASELINE_REL = "docs/reference/baselines/examples-baseline.json";
const ALLOWLIST_REL = "docs/reference/baselines/examples-allowlist.json";
const BASELINE = join(repoRoot, BASELINE_REL);
const ALLOWLIST = join(repoRoot, ALLOWLIST_REL);
const CONTRACT = "docs-hardening — every copy-paste example must be complete";

const update = process.argv.includes("--update");
const reportAll = process.argv.includes("--report");

// --- framework bindings ------------------------------------------------------

/**
 * Which framework a `@theme-kit/*` binding belongs to. `neutral` bindings
 * (core, vite, cli, devtools) can appear anywhere.
 */
const BINDING_FRAMEWORK = {
  react: "react",
  next: "react",
  remix: "react",
  vue: "vue",
  nuxt: "vue",
  svelte: "svelte",
  solid: "solid",
  angular: "angular",
  astro: "astro",
  web: "neutral",
  core: "neutral",
  vite: "neutral",
  cli: "neutral",
  devtools: "neutral",
};

/**
 * A file whose *extension* names a framework. Only those frameworks' bindings
 * may appear in it. `.tsx`/`.jsx` are shared by React and Solid — both compile
 * JSX — so they allow either, and flagging one against the other is a false
 * positive (Solid's own convention is `.tsx`).
 */
const EXT_FRAMEWORKS = {
  ".vue": ["vue"],
  ".svelte": ["svelte"],
  ".tsx": ["react", "solid"],
  ".jsx": ["react", "solid"],
  ".component.ts": ["angular"],
  ".component.html": ["angular"],
};

/** Astro pages host islands from other frameworks, so `astro` is never a contradiction. */
const ISLAND_HOSTS = new Set(["astro"]);

/**
 * Fence languages that carry importable module source. Anything else with an
 * explicit language (`bash`, `json`, `yaml`, `html`, …) is skipped: a YAML
 * `jobs: themes:` block is not an unbound identifier, and a `json` config is
 * not an import graph. A fence with *no* language is accepted only when the body
 * actually looks like module source.
 */
const CODE_LANGS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts",
  "typescript", "javascript", "vue", "svelte", "astro",
]);

function isCodeEntry(entry) {
  const lang = (entry.lang ?? "").toLowerCase();
  if (CODE_LANGS.has(lang)) return true;
  if (lang) return false;
  return /\b(?:import|export)\b[\s\S]{0,200}?\bfrom\b|\brequire\s*\(|<[A-Z][A-Za-z0-9]*[\s/>]/.test(entry.code ?? "");
}

const frameworkOfBinding = (pkg) => BINDING_FRAMEWORK[pkg.replace("@theme-kit/", "").split("/")[0]] ?? null;

// --- helpers -----------------------------------------------------------------

const allowlist = JSON.parse(readFileSync(ALLOWLIST, "utf8"));
const allowedPackages = new Set(Object.keys(allowlist.packages ?? {}));
const allowedPrefixes = allowlist.specifierPrefixes ?? [];

/** A specifier that is a package name rather than an alias, URL or interpolation. */
function isExternalSpecifier(specifier) {
  if (isRelativeSpecifier(specifier)) return false;
  if (specifier.startsWith("@theme-kit/")) return false;
  if (specifier.includes("${")) return false; // template-literal placeholder
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(specifier)) return false; // https:, data:, node:
  if (isNodeBuiltin(specifier)) return false;
  if (allowedPrefixes.some((p) => specifier.startsWith(p))) return false; // $lib, @/, ~
  return true;
}

function packageOf(specifier) {
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];
}

/** Remove comments and string literals so identifier scans do not read prose. */
function stripNoise(code) {
  return code
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/'(?:\\.|[^'\\\n])*'/g, '""')
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');
}

/** True when `themes` has a binding somewhere in the entry or its bundle. */
function themesIsBound(entry, declaredKeys) {
  if (declaredKeys.has("themes")) return true;
  const code = entry.code ?? "";
  if (/(?:const|let|var)\s+themes\b/.test(code)) return true; // const themes = …
  if (/(?:const|let|var)\s*\{[^}]*\bthemes\b[^}]*\}/.test(code)) return true; // const { themes } = …
  if (/\bimport\s*\{[^}]*\bthemes\b[^}]*\}/.test(code)) return true; // import { themes } from "…"
  if (/\bimport\s+themes\s*(?:,|from)/.test(code)) return true; // import themes from "…"
  for (const { specifier } of parseAllImports(code)) {
    if (isRelativeSpecifier(specifier) && moduleKey(specifier) === "themes") return true;
  }
  return false;
}

// --- token references --------------------------------------------------------

/**
 * The custom properties the shipped runtime emits, or `null` when the built
 * package is not on disk.
 *
 * Derived by *running* `themeToCSSVariables()` over the built-in themes rather
 * than by parsing `packages/core/src/css.ts`. The group→prefix mapping is
 * irregular — `shadows` emits `--theme-shadow-*` (singular) and `breakpoints`
 * emits `--theme-breakpoint-*` — and each token key is appended verbatim, so
 * only the implementation can be authoritative about the resulting names.
 */
async function emittedProperties() {
  try {
    const entry = join(repoRoot, "packages", "core", "dist", "index.js");
    const core = await import(pathToFileURL(entry).href);
    const out = new Set();
    for (const theme of core.getBuiltInThemes()) {
      for (const name of Object.keys(core.themeToCSSVariables(theme))) out.add(name);
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Every `var(--theme-*)` reference in `code`, with the fallback it carries.
 *
 * Scanned rather than regex-matched so nested calls survive: the docs write
 * `var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))`
 * where the kebab name is not emitted and the camelCase fallback is. A flat
 * regex cannot tell that apart from a reference with no fallback at all.
 * Interpolated names (`var(--theme-color-${key})`) are not matched, because the
 * capture has to be followed by `,` or `)`.
 */
function tokenReferences(code) {
  const out = [];
  const re = /var\(/g;
  let m;
  while ((m = re.exec(code))) {
    let depth = 1;
    let text = "";
    for (let i = m.index + 4; i < code.length && depth > 0; i += 1) {
      const c = code[i];
      if (c === "(") depth += 1;
      else if (c === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
      text += c;
    }
    const parts = [];
    let buf = "";
    let nest = 0;
    for (const c of text) {
      if (c === "(") nest += 1;
      else if (c === ")") nest -= 1;
      else if (c === "," && nest === 0) {
        parts.push(buf);
        buf = "";
        continue;
      }
      buf += c;
    }
    parts.push(buf);
    const name = parts[0].trim();
    if (!/^--theme-[A-Za-z0-9.-]+$/.test(name)) continue;
    out.push({ name, fallback: parts.slice(1).join(",").trim() });
  }
  return out;
}

/** Record an E violation for every `var(--theme-*)` in `code` that cannot resolve. */
function tokenViolations(page, label, code) {
  if (!emitted) return;
  for (const { name, fallback } of tokenReferences(code)) {
    if (emitted.has(name)) continue;
    // Two forms are legitimate: a fallback that names a real token (the
    // documented forward-compatible spelling), and a plain literal fallback
    // (a deliberate non-token default such as `inherit`).
    const rescued = tokenReferences(fallback).some((ref) => emitted.has(ref.name));
    const literalFallback = fallback !== "" && !fallback.includes("var(--theme-");
    if (rescued || literalFallback) continue;
    add(
      "E",
      page,
      `${label} → ${name}`,
      "reads a CSS custom property the shipped runtime never emits — token keys are appended to their group prefix verbatim, so colour keys stay camelCase (packages/core/src/css.ts)",
    );
  }
}

/**
 * Split a source file into bundles.
 *
 * A bundle is the set of snippets a reader is expected to create *together* —
 * which is not always the whole file. `apps/docs/lib/frameworks.tsx` holds all
 * twelve framework guides; the React guide's `import ... from "./themes"` must
 * not "resolve" just because the Remix guide further down the same file declares
 * `app/theme/themes.ts`. Splitting on the `slug:` markers the framework data
 * already carries makes each guide its own bundle. Files without markers (and
 * all markdown) stay a single bundle.
 *
 * The text before the first marker is prepended to every slice: shared
 * declarations at the top of a data file belong to all of its sections.
 */
function bundleSlices(content) {
  const marks = [...content.matchAll(/^[ \t]*slug:\s*"([^"]+)"/gm)];
  if (marks.length < 2) return [{ id: null, text: content }];
  const preamble = content.slice(0, marks[0].index);
  return marks.map((mark, i) => ({
    id: mark[1],
    text: preamble + content.slice(mark.index, i + 1 < marks.length ? marks[i + 1].index : content.length),
  }));
}

// --- collect -----------------------------------------------------------------

// Only roots whose snippets are canonical examples are held to the completeness
// contract. `components/` snippets are fragments rendered inside a guide panel,
// so their imports are supplied by the page around them — see `scanRoots`.
const roots = completenessRoots(repoRoot);
const emitted = await emittedProperties();
const violations = [];
const add = (check, page, subject, detail) => violations.push({ check, page, subject, detail });

let bundles = 0;
let entries = 0;
let skipped = 0;

for (const root of roots) {
  for (const file of walk(root.dir, root.exts)) {
    const content = readFileSync(file, "utf8");
    const isMd = file.endsWith(".md") || file.endsWith(".mdx");
    for (const slice of bundleSlices(content)) {
    const raw = isMd ? extractMarkdownEntries(slice.text) : extractSnippetEntries(slice.text);
    if (!raw.length) continue;
    const page = slice.id
      ? `${relative(repoRoot, file).replace(/\\/g, "/")}#${slice.id}`
      : relative(repoRoot, file).replace(/\\/g, "/");
    bundles += 1;

    // The file set the reader is expected to create together for this bundle.
    const declared = new Map(); // moduleKey -> declared file name
    for (const e of raw) {
      const name = declaredFileName(e);
      if (name) declared.set(moduleKey(name), name);
    }
    const declaredKeys = new Set(declared.keys());

    for (const entry of raw) {
      // --- E. token references resolve ---------------------------------------
      // Deliberately outside the `isCodeEntry` gate below. A stylesheet fence
      // (`css`) is not module source, so A–D skip it — but it is exactly where
      // a token name can be wrong, and a wrong name there fails silently.
      tokenViolations(
        page,
        declaredFileName(entry) ?? "(anonymous snippet)",
        entry.code ?? "",
      );

      if (!isCodeEntry(entry)) {
        skipped += 1;
        continue;
      }
      entries += 1;
      const code = entry.code ?? "";
      const selfName = declaredFileName(entry);
      const imports = parseAllImports(code);

      // --- A. local references resolve ---------------------------------------
      for (const { specifier } of imports) {
        if (!isRelativeSpecifier(specifier)) continue;
        if (resolveLocal(specifier, declaredKeys)) continue;
        add(
          "A",
          page,
          `${selfName ?? "(anonymous snippet)"} → "${specifier}"`,
          `imports a local file no snippet in this bundle declares (declared: ${
            [...declared.values()].join(", ") || "none"
          })`,
        );
      }

      // --- B. dependencies are declared --------------------------------------
      for (const { specifier } of imports) {
        if (!isExternalSpecifier(specifier)) continue;
        if (allowedPackages.has(packageOf(specifier))) continue;
        add(
          "B",
          page,
          `${selfName ?? "(anonymous snippet)"} → "${specifier}"`,
          `imports package "${packageOf(specifier)}", which is not on the example dependency allowlist (${ALLOWLIST_REL})`,
        );
      }

      // --- C. framework consistency ------------------------------------------
      const themeKitFrameworks = new Map();
      for (const { specifier } of imports) {
        if (!specifier.startsWith("@theme-kit/")) continue;
        const fw = frameworkOfBinding(specifier);
        if (fw && fw !== "neutral") themeKitFrameworks.set(fw, specifier);
      }
      const distinct = [...themeKitFrameworks.keys()].filter((f) => !ISLAND_HOSTS.has(f));
      if (distinct.length > 1) {
        add(
          "C",
          page,
          `${selfName ?? "(anonymous snippet)"} → ${distinct.map((f) => themeKitFrameworks.get(f)).join(" + ")}`,
          `one snippet mixes ${distinct.length} framework bindings (${distinct.join(", ")})`,
        );
      }
      if (selfName) {
        const ext = Object.keys(EXT_FRAMEWORKS)
          .filter((e) => selfName.endsWith(e))
          .sort((a, b) => b.length - a.length)[0];
        const permitted = ext ? EXT_FRAMEWORKS[ext] : null;
        if (permitted) {
          for (const [fw, specifier] of themeKitFrameworks) {
            if (permitted.includes(fw) || ISLAND_HOSTS.has(fw)) continue;
            add(
              "C",
              page,
              `${selfName} → "${specifier}"`,
              `a ${ext} file must not import the ${fw} binding (allowed: ${permitted.join(", ")})`,
            );
          }
        }
      }

      // --- D. `themes` is bound ----------------------------------------------
      // Only *value references* count. `<ThemeScope themes={[x]}>` mentions
      // `themes` as a prop name (not a reference), and `runtime.themes` is a
      // property access — neither needs a binding, and flagging them would bury
      // the real cases (`<ThemeProvider themes={themes}>` with no import).
      const bare = stripNoise(code)
        .replace(/(?<=[\s<{,:])themes\s*(?==|:)/g, "PROPNAME")
        .replace(/\.\s*themes\b/g, "PROPACCESS");
      if (/\bthemes\b/.test(bare) && !themesIsBound(entry, declaredKeys)) {
        add(
          "D",
          page,
          `${selfName ?? "(anonymous snippet)"} → themes`,
          "uses the `themes` identifier without importing it, and no snippet in this bundle declares a themes.* file",
        );
      }
    }
    }
  }
}

// --- E, second pass: real stylesheets ----------------------------------------
//
// The completeness contract (A–D) covers copy-paste bundles; these are the
// stylesheets of the runnable example apps the guides link to as "the complete
// app behind this guide", plus the docs site's own. They are whole projects
// rather than bundles, so A–D do not apply — but they read the same theme
// tokens, and a wrong name there fails the same silent way. `walk` never
// descends into `node_modules` or build output.
const STYLESHEET_ROOTS = [
  {
    dir: join(repoRoot, "examples", "apps"),
    exts: [".css", ".astro", ".vue", ".svelte", ".html"],
  },
  { dir: join(repoRoot, "apps", "docs", "app"), exts: [".css"] },
];

for (const root of STYLESHEET_ROOTS) {
  for (const file of walk(root.dir, root.exts)) {
    tokenViolations(
      relative(repoRoot, file).replace(/\\/g, "/"),
      "(stylesheet)",
      readFileSync(file, "utf8"),
    );
  }
}

// --- report ------------------------------------------------------------------

const keyOf = (v) => `${v.check}|${v.page}|${v.subject}`;
const byCheck = { A: 0, B: 0, C: 0, D: 0, E: 0 };
for (const v of violations) byCheck[v.check] += 1;

const CHECK_NAMES = {
  A: "local references resolve",
  B: "dependencies declared",
  C: "framework consistency",
  D: "`themes` binding present",
  E: "token references resolve",
};

console.log("\n=== EXAMPLE COMPLETENESS ===\n");
console.log(`Sources scanned: ${bundles} bundle(s), ${entries} snippet(s) (${skipped} non-code fence(s) skipped)`);
console.log(
  emitted
    ? `Token references: checked against ${emitted.size} emitted custom properties`
    : "Token references: SKIPPED — packages/core/dist is not built, so the emitted set is unknown",
);
console.log(`Contract: ${CONTRACT}`);
console.log("\nViolations by check:");
for (const [k, name] of Object.entries(CHECK_NAMES)) console.log(`  ${k}. ${name.padEnd(30)} ${byCheck[k]}`);

if (reportAll) {
  console.log("\n--- all violations ---");
  for (const v of violations.sort((a, b) => keyOf(a).localeCompare(keyOf(b)))) {
    console.log(`  ✗ [${v.check}] ${v.subject} — ${v.page}`);
    console.log(`      ${v.detail}`);
  }
}

// --- baseline ratchet --------------------------------------------------------
//
// The baseline stores an occurrence *count* per (check, page, subject) rather
// than a flat list of keys: five identical `./themes` imports on one page are
// five recorded violations, not one, so adding a sixth still fails the gate.

const tally = (list) => {
  const m = new Map();
  for (const v of list) m.set(keyOf(v), (m.get(keyOf(v)) ?? 0) + 1);
  return m;
};

if (reportAll) {
  console.log("\nReport mode: baseline neither read nor written.");
  process.exitCode = 0;
} else if (update || !existsSync(BASELINE)) {
  mkdirSync(dirname(BASELINE), { recursive: true });
  const snapshot = {
    capturedAt: new Date().toISOString(),
    tool: "scripts/docs/check-examples.mjs",
    contract: CONTRACT,
    counts: { bundles, entries, skipped, ...byCheck, total: violations.length },
    // key -> occurrence count
    violations: Object.fromEntries([...tally(violations)].sort(([a], [b]) => a.localeCompare(b))),
    details: Object.fromEntries(violations.map((v) => [keyOf(v), v.detail])),
  };
  writeFileSync(BASELINE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `\n${update ? "Re-froze" : "Created"} baseline: ${BASELINE_REL} — ${violations.length} known violation(s) frozen.`,
  );
  console.log("Exit: OK (0) — a fresh baseline records debt, it does not create it.");
  process.exitCode = 0;
} else {
  const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  const was = baseline.violations ?? {};
  const now = tally(violations);

  const introduced = [];
  for (const [key, n] of now) {
    const before = was[key] ?? 0;
    if (n > before) {
      introduced.push({ key, added: n - before, sample: violations.find((v) => keyOf(v) === key) });
    }
  }
  const resolved = [];
  for (const [key, n] of Object.entries(was)) {
    const before = now.get(key) ?? 0;
    if (before < n) resolved.push({ key, fixed: n - before });
  }

  const knownTotal = Object.values(was).reduce((a, b) => a + b, 0);
  console.log(`\nBaseline: ${BASELINE_REL} (captured ${baseline.capturedAt}) — ${knownTotal} known violation(s)`);
  console.log(`Current:  ${violations.length} violation(s)`);

  if (resolved.length) {
    const total = resolved.reduce((a, r) => a + r.fixed, 0);
    console.log(`\nDebt paid down: ${total} violation(s) fixed — re-freeze with --update.`);
    for (const r of resolved.slice(0, 10)) console.log(`      fixed ×${r.fixed}: ${r.key}`);
    if (resolved.length > 10) console.log(`      … and ${resolved.length - 10} more`);
  }

  if (introduced.length) {
    const total = introduced.reduce((a, i) => a + i.added, 0);
    console.log(`\nFAIL: ${total} NEW incomplete example(s) — ${CONTRACT}`);
    for (const i of introduced) {
      console.log(
        `  ✗ [${i.sample.check}] ${i.sample.subject} — ${i.sample.page}${i.added > 1 ? ` (×${i.added} new)` : ""}`,
      );
      console.log(`      ${i.sample.detail}`);
    }
    console.log("\nExit: FAIL — an example became incomplete. Fix it, or justify it and re-freeze with --update.");
    process.exitCode = 1;
  } else {
    console.log("\nExit: OK (0) — no new incomplete examples.");
    process.exitCode = 0;
  }
}
