#!/usr/bin/env node
/**
 * Generates `content/framework-guides.md` from `lib/frameworks.tsx`.
 *
 * The markdown file is a *mirror*, not a source. Before this generator existed
 * it was a hand-maintained 846-line guide that no route rendered — a shadow copy
 * of the framework pages, free to drift from them silently. It drifted: only 8
 * of its 36 snippets were in the live pages, and the rest had been rewritten or
 * superseded there without the markdown following.
 *
 * One source, one direction:
 *
 *   lib/frameworks.tsx  ──generate──▶  content/framework-guides.md
 *
 * The generator never reads the markdown, so the two cannot converge on a
 * middle ground the way a bidirectional sync would. `--check` re-generates in
 * memory and fails if the file on disk differs, which is what keeps a stray
 * hand-edit from surviving.
 *
 * Usage:
 *   node apps/docs/scripts/generate-framework-guides.mjs          # write
 *   node apps/docs/scripts/generate-framework-guides.mjs --check  # verify only
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePath = join(siteRoot, "lib", "frameworks.tsx");
const targetPath = join(siteRoot, "content", "framework-guides.md");
const check = process.argv.includes("--check");

/**
 * Reads `rawFrameworks` out of the TSX without a TypeScript toolchain.
 *
 * The array is a literal: object literals of strings, string arrays, and
 * `icons.<name>` references (the only non-literal values). Scanning to the
 * matching `]` and stubbing those references is enough to evaluate it, and it
 * avoids running a bundler — or worse, hand-parsing snippet template literals,
 * which would break the moment a snippet contained a backtick.
 */
function readFrameworks() {
  const src = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
  const anchor = src.indexOf("export const rawFrameworks");
  if (anchor === -1) {
    throw new Error(`could not find \`export const rawFrameworks\` in ${sourcePath}`);
  }
  const open = src.indexOf("[", src.indexOf("=", anchor));
  let depth = 0;
  let quote = null;
  let out = "";
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      out += c;
      if (c === "\\") { out += src[++i]; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; continue; }
    if (c === "[") depth++;
    if (c === "]") {
      depth--;
      if (depth === 0) { out += c; break; }
    }
    out += c;
  }
  const stubbed = out.replace(/icons\.[A-Za-z0-9_]+/g, "null");
  // eslint-disable-next-line no-eval
  const frameworks = eval(`(() => {\n${sharedDeclarations(src, out)}\nreturn (${stubbed});\n})()`);
  if (!Array.isArray(frameworks) || frameworks.length === 0) {
    throw new Error("rawFrameworks did not evaluate to a non-empty array");
  }
  return frameworks;
}

/**
 * The top-level `const` declarations the array references by name.
 *
 * `rawFrameworks` shares a value between entries where sharing is the point —
 * the canonical stylesheet and the step copy that introduces it — so the array
 * names `CANONICAL_STYLES` and `CANONICAL_STYLES_STEP` rather than restating
 * them eleven times. The array is evaluated as a literal, so those names have to
 * be in scope; they are lifted verbatim from the same file, which is what keeps
 * the single-source rule intact. Nothing here is written by hand.
 *
 * `icons` is skipped: its values are JSX elements, and it is already stubbed to
 * `null` above.
 */
function sharedDeclarations(src, arraySource) {
  const referenced = new Set(
    [...arraySource.matchAll(/\b([A-Z][A-Za-z0-9_]*)\b/g)].map((m) => m[1]),
  );
  const out = [];
  for (const name of referenced) {
    const decl = topLevelDeclaration(src, name);
    if (decl) out.push(decl);
  }
  return out.join("\n");
}

/** `const NAME = …;` at column 0, scanned to the matching top-level `;`. */
function topLevelDeclaration(src, name) {
  const match = new RegExp(
    `^(?:export\\s+)?const\\s+${name}\\s*(:\\s*[^=]+)?=`,
    "m",
  ).exec(src);
  if (!match) return null;
  if (match[1]) {
    throw new Error(
      `\`${name}\` is shared with rawFrameworks, which the generator evaluates ` +
        `as JavaScript — drop the type annotation so it can be lifted.`,
    );
  }
  let depth = 0;
  let quote = null;
  let i = match.index + match[0].length;
  for (; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === "\\") { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === ";" && depth === 0) { i++; break; }
  }
  const decl = src.slice(match.index, i).replace(/^export\s+/, "");
  // A declaration holding JSX cannot be evaluated — `icons` is the one case.
  if (/<[A-Za-z/]/.test(decl)) return null;
  // `as const` is TypeScript-only, and lifting it verbatim into an `eval` fails
  // with a bare syntax error far from its cause. Say what is wrong instead.
  if (/\bas\s+const\s*;?\s*$/.test(decl)) {
    throw new Error(
      `\`${name}\` is shared with rawFrameworks, which the generator evaluates ` +
        `as JavaScript — drop \`as const\` so it can be lifted.`,
    );
  }
  return decl;
}

/** Snippet slots, in the order the rendered page shows them. */
const SLOTS = [
  ["quickStart", "Quick Start"],
  ["quickStartExtra", "Quick Start"],
  ["setupExtra", "Quick Start"],
  ["noTheme", "Quick Start"],
  // The canonical stylesheet belongs with the setup, not with the extras: it is
  // the step that connects the reader's own classes to the theme, and every
  // framework entry carries the same one.
  ["styles", "Quick Start"],
  ["snippet", "Use Cases"],
  ["switchSnippet", "Use Cases"],
  ["snippet2", "More Examples"],
  ["snippet3", "More Examples"],
  ["snippet4", "More Examples"],
  ["snippet6", "More Examples"],
  ["reactSetup", "More Examples"],
];

function fence(code) {
  // A snippet that itself contains a fence needs a longer one to close it.
  const ticks = code.includes("```") ? "````" : "```";
  return { open: ticks, close: ticks };
}

function snippetBlock(label, snippet) {
  const { open, close } = fence(snippet.code);
  // The title goes in the fence meta, not in a heading. That is the form
  // `parseMeta` (apps/docs/components/markdown.tsx) and the snippet gate
  // (`declaredFileName` in scripts/docs/lib/snippets.mjs) both read, and it is
  // what lets a snippet declare the file a relative import resolves against.
  // Emitting it as a heading instead made `theme.config.ts` undeclared and the
  // Astro layout's `../../theme.config` import look broken.
  return [
    `#### ${label}`,
    "",
    `${open}${snippet.lang} title="${snippet.title}"`,
    snippet.code,
    close,
    "",
  ];
}

function render(frameworks) {
  const out = [];
  out.push(
    "<!--",
    "  GENERATED FILE — DO NOT EDIT.",
    "",
    "  Generated from apps/docs/lib/frameworks.tsx by",
    "  apps/docs/scripts/generate-framework-guides.mjs. Every snippet, feature and",
    "  note below is a mirror of that file, which is the single authoritative",
    "  source for framework-guide content and what the site actually renders.",
    "",
    "  Editing this file changes nothing on the site, and the next regeneration",
    "  will discard the edit. Change lib/frameworks.tsx and run:",
    "",
    "      node apps/docs/scripts/generate-framework-guides.mjs",
    "",
    "  `--check` fails if this file is out of date.",
    "-->",
    "",
    "# Framework Guides",
    "",
    "The rendered guide lives at `/framework-guides` and `/framework-guides/<slug>`.",
    "This file is a plain-markdown mirror of the same content, generated so it",
    "cannot drift from the pages. Hero copy and page layout are part of the",
    "components, not the data, so they are not mirrored here.",
    "",
  );

  for (const fw of frameworks) {
    out.push("---", "");
    out.push(`## ${fw.name} (\`${fw.pkg}\`)`, "");
    out.push(`${fw.tagline}`, "");
    if (fw.tags?.length) out.push(`**Tags:** ${fw.tags.join(" · ")}`, "");
    if (fw.extraPackages?.length) {
      out.push(`**Also installs:** ${fw.extraPackages.map((p) => `\`${p}\``).join(", ")}`, "");
    }

    out.push("### Feature map", "");
    for (const group of fw.groups ?? []) {
      out.push(`**${group.label}**`, "");
      for (const feature of group.features ?? []) {
        out.push(`- **${feature.name}** — ${feature.desc}`);
      }
      out.push("");
    }

    out.push("### Notes", "");
    out.push(`- **Zero-flash:** ${fw.zeroFlashNote}`);
    out.push(`- **Starting mode:** ${fw.modeNote}`);
    out.push(`- **Configuration:** ${fw.configNote}`);
    out.push("");

    let lastSection = null;
    for (const [slot, section] of SLOTS) {
      const snippet = fw[slot];
      if (!snippet) continue;
      if (section !== lastSection) {
        out.push(`### ${section}`, "");
        lastSection = section;
      }
      out.push(...snippetBlock(slot, snippet));
    }
  }

  out.push("---", "");
  out.push(
    `${frameworks.length} frameworks. Generated from \`lib/frameworks.tsx\`.`,
    "",
  );
  return out.join("\n");
}

const frameworks = readFrameworks();
const generated = render(frameworks);

if (check) {
  let onDisk;
  try {
    onDisk = readFileSync(targetPath, "utf8");
  } catch {
    console.error(
      `\n  FAIL  content/framework-guides.md is missing — run:\n` +
        `        node apps/docs/scripts/generate-framework-guides.mjs\n`,
    );
    process.exit(1);
  }
  // Compare line endings-insensitively: git may check the file out as CRLF.
  const a = onDisk.replace(/\r\n/g, "\n").trimEnd();
  const b = generated.trimEnd();
  if (a !== b) {
    const aLines = a.split("\n");
    const bLines = b.split("\n");
    const at = bLines.findIndex((l, i) => l !== aLines[i]);
    console.error(
      `\n  FAIL  content/framework-guides.md is out of date with lib/frameworks.tsx\n` +
        `        first difference at line ${at + 1}:\n` +
        `          on disk: ${JSON.stringify((aLines[at] ?? "<eof>").slice(0, 100))}\n` +
        `          expected: ${JSON.stringify((bLines[at] ?? "<eof>").slice(0, 100))}\n\n` +
        `        Regenerate:\n` +
        `          node apps/docs/scripts/generate-framework-guides.mjs\n`,
    );
    process.exit(1);
  }
  console.log("framework-guides.md is up to date with lib/frameworks.tsx");
  process.exit(0);
}

writeFileSync(targetPath, generated);
const lines = generated.split("\n").length;
console.log(
  `wrote content/framework-guides.md — ${frameworks.length} frameworks, ${lines} lines`,
);
