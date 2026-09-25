#!/usr/bin/env node
/**
 * Audit G — terminology consistency (docs-system brief §8).
 *
 * Enforces the canonical Theme Kit vocabulary across the prose surfaces:
 *
 *   theme, family, mode, runtime, scope, tokens,
 *   adapter, schedule, transition, persistence
 *
 * "mode" is the canonical word for the light/dark/system axis; "variant",
 * "skin", and a few other near-synonyms are known anti-patterns when they
 * appear in prose describing user-facing mode selection. Each rule below is
 * a regex that fires on a known anti-pattern and skips matches inside
 * backticks (where code/type identifiers legitimately appear, e.g.
 * `PresetVariant`).
 *
 * Scope:
 *   - package source under packages/<name>/src — JSDoc/TSDoc comments
 *   - packages/<name>/README.md
 *   - apps/docs/{app,lib,components} — TSX/JSX prose + CodeBlock titles
 *   - apps/docs/content — markdown guides + API reference
 *   - apps/docs/content/cli — CLI docs
 *   - examples/<feature>/README.md and example.meta.json
 *
 * Allowlist:
 *   AUDIT_G_ALLOWLIST — an array of { file, pattern } objects. Each pattern
 *   is matched against the same backtick-stripped line; matches are reported
 *   as allowlisted, not as failures. Useful when a known legitimate usage
 *   fires (e.g. tailwind's `dark:` variant, MUI's component variants).
 *
 * Usage:
 *   node scripts/docs/audits/audit-g-terminology.mjs
 *   node scripts/docs/audits/audit-g-terminology.mjs --update   # re-freeze the allowlist
 *
 * Exit: 0 when clean, 1 on any unlisted violation.
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");

const update = process.argv.includes("--update");

const CONTRACT =
  "brief §8 Audit G — prose must use the canonical Theme Kit vocabulary (mode, family, theme, runtime, scope, tokens, adapter, schedule, transition, persistence); known anti-patterns are forbidden outside the allowlist";

/**
 * Each rule:
 *   id        — short stable id (printed in the report)
 *   re        — case-insensitive regex applied to a *single line*
 *   message   — human description of why this is wrong
 *   suggest   — what to say instead
 *
 * The rule scans only the prose of the line. Backticks (`…`) are stripped
 * before matching so code/type identifiers (e.g. `PresetVariant`,
 * `dark:` Tailwind variant) don't fire false positives.
 */
const RULES = [
  {
    id: "G1:prose-mode-not-variant",
    re: /\btheme variant\b/i,
    message: 'prose says "theme variant" when describing user-facing mode selection',
    suggest: 'use "mode" — the canonical Theme Kit word for the light/dark/system axis',
  },
  {
    id: "G2:prose-pick-variant",
    re: /\b(pick|choose|select)\s+the\s+variant\b/i,
    message: 'UI prose says "Pick/Choose/Select the variant"',
    suggest: 'use "mode" (e.g. "Pick the mode")',
  },
  {
    id: "G3:prose-switch-variant",
    re: /\bswitch(?:ing)?\s+to\s+.{1,40}?\bvariant\b/i,
    message: 'prose says "switch to … variant" when describing mode change',
    suggest: 'use "mode" — Theme Kit calls the light/dark/system axis the "mode"',
  },
  {
    id: "G4:prose-theme-variant-pair",
    re: /\b(dark|light)\s+theme\s+variant\b/i,
    message: '"dark/light theme variant" is the legacy UI word',
    suggest: 'use "dark mode" / "light mode"',
  },
  {
    id: "G5:prose-skin-for-theme",
    re: /\b(skin|skinned)\s+(theme|mode|family)\b/i,
    message: '"skin" is not part of the Theme Kit vocabulary',
    suggest: 'use "theme" / "mode" / "family"',
  },
  {
    id: "G6:prose-skin-as-mode",
    re: /\b(use|set|get|switch|toggle)\s+(?:a|the)?\s*skin\b/i,
    message: 'prose treats "skin" as a synonym for theme/mode',
    suggest: 'use "theme" / "mode" (never "skin")',
  },
  {
    id: "G7:code-callset-variant",
    re: /\bsetVariant\s*\(|useVariant\s*\(|getVariant\s*\(/i,
    message: 'code reference calls setVariant/useVariant/getVariant — no such API exists',
    suggest: 'use setMode / mode / mode (mode is the canonical Theme Kit API)',
  },
];

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

const SCAN_ROOTS = [
  { root: join(repoRoot, "packages"), extensions: [".ts", ".tsx", ".astro", ".vue", ".svelte", ".js", ".mjs"] },
  { root: join(repoRoot, "apps", "docs", "app"), extensions: [".ts", ".tsx"] },
  { root: join(repoRoot, "apps", "docs", "lib"), extensions: [".ts", ".tsx"] },
  { root: join(repoRoot, "apps", "docs", "components"), extensions: [".ts", ".tsx"] },
  { root: join(repoRoot, "apps", "docs", "content"), extensions: [".md"] },
  { root: join(repoRoot, "apps", "docs", "content", "cli"), extensions: [".md"] },
];

const README_PATTERNS = [
  /^packages\/.*\/README\.md$/,
  /^examples\/.*\/README\.md$/,
  /^examples\/.*\/example\.meta\.json$/,
];

function walk(dir, exts, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === "dist" || entry === ".git") continue;
      walk(full, exts, out);
    } else if (exts.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

const scanned = [];
for (const { root, extensions } of SCAN_ROOTS) {
  if (!statSync(root, { throwIfNoEntry: false })) continue;
  scanned.push(...walk(root, extensions));
}
for (const relPattern of README_PATTERNS) {
  const re = new RegExp(relPattern.source);
  for (const root of [join(repoRoot, "packages"), join(repoRoot, "examples")]) {
    if (!statSync(root, { throwIfNoEntry: false })) continue;
    for (const file of walk(root, [".md", ".json"])) {
      const rel = relative(repoRoot, file).replaceAll("\\", "/");
      if (re.test(rel)) scanned.push(file);
    }
  }
}

// ---------------------------------------------------------------------------
// Allowlist
// ---------------------------------------------------------------------------

const ALLOWLIST_PATH = join(
  repoRoot,
  "docs",
  "reference",
  "baselines",
  "audit-g-terminology.allowlist.json",
);

function loadAllowlist() {
  try {
    return JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch {
    return { entries: [] };
  }
}

function saveAllowlist(entries) {
  const payload = {
    $comment:
      "Per-line allowlist for Audit G. Each entry matches (file, ruleId); " +
      "the matched lines are reported as allowlisted, not as failures. Re-freeze " +
      "with `node scripts/docs/audits/audit-g-terminology.mjs --update`. Prefer " +
      "fixing the prose over widening the allowlist.",
    entries: entries.sort((a, b) =>
      a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file),
    ),
  };
  mkdirSync(dirname(ALLOWLIST_PATH), { recursive: true });
  writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(payload, null, 2)}\n`);
}

const allowlist = loadAllowlist();

function isAllowlisted(file, rule, lineText) {
  for (const e of allowlist.entries) {
    if (e.ruleId !== rule.id) continue;
    const relFile = relative(repoRoot, file).replaceAll("\\", "/");
    if (e.file !== relFile) continue;
    const ruleRe = new RegExp(rule.re.source, rule.re.flags);
    if (ruleRe.test(lineText)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Line scan
// ---------------------------------------------------------------------------

/**
 * Strips inline code spans (`…`) from a prose line so the rule regex doesn't
 * fire on legitimate type/identifier references (e.g. `PresetVariant`,
 * Tailwind's `dark:` variant). Block-level code (```…```) is removed at the
 * file level before this is called.
 */
function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, "");
}

/** Removes fenced code blocks from markdown before per-line scanning. */
function stripFencedCode(src) {
  return src.replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " "));
}

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

const findings = [];
const newlyAllowlisted = [];

for (const file of scanned) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const rel = relative(repoRoot, file).replaceAll("\\", "/");

  // Markdown files: strip fenced blocks before scanning prose lines.
  const proseSrc = rel.endsWith(".md") ? stripFencedCode(src) : src;

  const lines = proseSrc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const stripped = stripInlineCode(lineText);
    for (const rule of RULES) {
      const re = new RegExp(rule.re.source, rule.re.flags);
      if (!re.test(stripped)) continue;
      if (isAllowlisted(file, rule, lineText)) continue;
      findings.push({
        file: rel,
        line: i + 1,
        ruleId: rule.id,
        message: rule.message,
        suggest: rule.suggest,
        text: lineText.trim().slice(0, 160),
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log("\n=== AUDIT G — TERMINOLOGY ===\n");
console.log(`Scanned ${scanned.length} files. Allowlist: ${allowlist.entries.length} entries.\n`);

if (findings.length === 0) {
  console.log("No findings.");
} else {
  for (const f of findings) {
    console.log(`  ✗ ${f.ruleId} — ${f.file}:${f.line}`);
    console.log(`      ${f.message}`);
    console.log(`      suggestion: ${f.suggest}`);
    console.log(`      > ${f.text}`);
  }
  console.log(`\nFindings: ${findings.length}`);
}

if (update) {
  // --update: turn every current finding into an allowlist entry, then re-save.
  // Prefer fixing the prose; only use --update when a known legitimate usage
  // genuinely belongs (e.g. the audit can't easily tell tailwind's dark:
  // variant from a mode discussion).
  const entries = findings.map((f) => ({
    file: f.file,
    line: f.line,
    ruleId: f.ruleId,
    $comment: f.text,
  }));
  // Merge with the existing allowlist (preserve history).
  const merged = [
    ...allowlist.entries,
    ...entries.filter(
      (e) => !allowlist.entries.some((a) => a.file === e.file && a.line === e.line && a.ruleId === e.ruleId),
    ),
  ];
  saveAllowlist(merged);
  console.log(`\n--update: ${entries.length} entries added; total ${merged.length}.`);
  process.exit(0);
}

process.exitCode = findings.length ? 1 : 0;
