#!/usr/bin/env node
/**
 * Audit I — docs content → well-formed markdown tables.
 *
 * Two routine inputs corrupt a markdown table row, and both come from the
 * generated API pages:
 *
 *   1. A JSDoc summary that wraps in the source. `commentText` keeps the
 *      source line breaks, and a raw newline inside a `| … |` row terminates
 *      it — the rest of the sentence escapes the table, and the row loses
 *      every column after the break.
 *
 *   2. A union type. `renderType` joins alternatives with a raw `" | "`, so
 *      `ThemeTokens | undefined` splits its own cell. The cell *count* grows,
 *      which is why this one is invisible to any "does the line end in a pipe"
 *      check.
 *
 * Both render as visible corruption rather than an error, so nothing else in
 * the suite notices: `generate-api-reference.mjs --check` compares generator
 * output against the generated files (both were wrong together, so it agreed),
 * and Audit H only fails on console errors. A mangled table logs nothing.
 *
 * This audit parses every content file with the SAME pipeline the site renders
 * with — unified + remark-parse + remark-gfm, the versions react-markdown@10
 * drives — and asserts every row of every table has exactly as many cells as
 * that table's header row. That catches both mechanisms and any future one.
 *
 * Measured when written: 983 of 6,769 generated rows were malformed (all 54
 * API pages). After the `tableCell` fix in the generator: 0 of 6,954 across all
 * 82 content files.
 *
 * Usage: node scripts/docs/audits/audit-i-generated-tables.mjs
 */

import { readFileSync, readdirSync, statSync, realpathSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const docsRoot = join(repoRoot, "apps", "docs");
const contentRoot = join(docsRoot, "content");

const CONTRACT = "docs content → well-formed markdown tables (every row matches its header's column count)";

/**
 * Resolve the render pipeline without hardcoding pnpm's content-addressed store
 * paths. `apps/docs` depends on `react-markdown` and `remark-gfm` directly, and
 * pnpm keeps each package's dependency closure beside it — so `unified` and
 * `remark-parse` are siblings of the `react-markdown` symlink target.
 */
async function loadPipeline() {
  const rmLink = join(docsRoot, "node_modules", "react-markdown");
  const gfmLink = join(docsRoot, "node_modules", "remark-gfm");
  if (!existsSync(rmLink) || !existsSync(gfmLink)) {
    throw new Error(
      `cannot find react-markdown / remark-gfm in ${join(docsRoot, "node_modules")} — ` +
        `run the workspace install first`,
    );
  }
  const closure = dirname(realpathSync(rmLink));
  const gfmDir = realpathSync(gfmLink);

  const load = async (dir, label) => {
    const entry = join(dir, "index.js");
    if (!existsSync(entry)) throw new Error(`${label}: no index.js at ${entry}`);
    return import(pathToFileURL(entry).href);
  };

  const { unified } = await load(join(closure, "unified"), "unified");
  const { default: remarkParse } = await load(join(closure, "remark-parse"), "remark-parse");
  const { default: remarkGfm } = await load(gfmDir, "remark-gfm");

  return unified().use(remarkParse).use(remarkGfm);
}

function walkMarkdown(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkMarkdown(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

/** Every `table` node in the tree, depth-first. */
function findTables(node, out = []) {
  if (node.type === "table") out.push(node);
  for (const child of node.children ?? []) findTables(child, out);
  return out;
}

function cellText(cell) {
  return cell.children.map((n) => n.value ?? "").join("");
}

const failures = [];
let files = 0;
let tables = 0;
let rows = 0;

let processor;
try {
  processor = await loadPipeline();
} catch (error) {
  console.log("\n=== AUDIT I — WELL-FORMED MARKDOWN TABLES ===\n");
  console.log(`✗ cannot load the markdown pipeline: ${error.message}`);
  console.log("\nThis audit is fail-closed: without the real renderer it cannot tell a");
  console.log("well-formed table from a corrupt one, so it must not report success.\n");
  process.exit(1);
}

for (const file of walkMarkdown(contentRoot)) {
  files += 1;
  const rel = relative(repoRoot, file).split("\\").join("/");
  const source = readFileSync(file, "utf8");

  let tree;
  try {
    tree = processor.parse(source);
  } catch (error) {
    failures.push({ file: rel, line: 1, detail: `failed to parse: ${error.message}` });
    continue;
  }

  for (const table of findTables(tree)) {
    tables += 1;
    const header = table.children[0];
    const expected = header.children.length;
    // The delimiter row is folded into `table.align`, so `children` is the
    // header followed by the data rows.
    for (const row of table.children) {
      rows += 1;
      if (row.children.length === expected) continue;
      const cells = row.children.map(cellText);
      failures.push({
        file: rel,
        line: row.position?.start?.line ?? 1,
        detail:
          `${row.children.length} cell(s), header has ${expected}` +
          ` — first cell ${JSON.stringify(cells[0] ?? "")}` +
          `, last cell ${JSON.stringify(cells[cells.length - 1] ?? "")}`,
      });
    }
  }
}

console.log("\n=== AUDIT I — WELL-FORMED MARKDOWN TABLES ===\n");
console.log(`Content files scanned: ${files}`);
console.log(`Tables parsed: ${tables}, rows checked: ${rows}`);
console.log(`Failures: ${failures.length}\n`);

// Fail closed. A broken walk (wrong root, a renamed directory) finds nothing to
// check and would otherwise report a clean run — the same silent-pass failure
// mode this audit exists to catch one level down. The counts above are printed
// so a human sees the real denominator.
if (files === 0 || tables === 0) {
  console.log(`✗ scanned ${files} file(s) and ${tables} table(s) — the audit proved nothing.`);
  console.log("  Expected apps/docs/content/** to contain markdown with tables.\n");
  process.exitCode = 1;
  process.exit(1);
}

for (const f of failures.slice(0, 25)) {
  console.log(`  ✗ ${f.file}:${f.line}`);
  console.log(`      contract: ${CONTRACT}`);
  console.log(`      detail: ${f.detail}`);
}
if (failures.length > 25) {
  console.log(`  … and ${failures.length - 25} more`);
}

process.exitCode = failures.length ? 1 : 0;
