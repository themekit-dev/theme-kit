/**
 * Shared docs-snippet extraction.
 *
 * The repo keeps exactly one snippet extractor (brief §16 "extend it, do not
 * replace it"; §14 forbids duplicated logic). `scripts/release/snippet-audit.mjs`
 * owns the *import-drift* check and originally owned these primitives; they live
 * here so the example-completeness checks
 * (`scripts/docs/check-examples.mjs`) can read the same snippets the drift audit
 * reads, rather than growing a second, subtly different extractor.
 *
 * Nothing here may import from the registry or the manifest — it is pure text
 * handling over the docs sources, so it stays cheap and side-effect free.
 */

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Extensions a snippet may declare as a file name. */
const FILE_EXT = /\.(?:tsx?|jsx?|mts|cts|vue|svelte|astro|css|scss|mjs|cjs|json)$/;

/**
 * Directories a scan never descends into.
 *
 * `examples/apps` is now one of the scanned roots (the example stylesheets read
 * the same theme tokens the docs teach), and every example app carries its own
 * `node_modules` plus a build output directory. Descending into them would be
 * slow and would report third-party CSS as documentation.
 */
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".nuxt",
  ".output",
  ".svelte-kit",
  ".astro",
]);

/**
 * Build-output directories whose names carry a suffix, so an exact-name set
 * cannot match them (`examples/apps/react/dist-theme-config`).
 */
const IGNORED_DIR_PREFIXES = ["dist-"];

/** Recursively collect files under `dir` whose name ends with one of `exts`. */
export function walk(dir, exts) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (IGNORED_DIRS.has(entry)) continue;
      if (IGNORED_DIR_PREFIXES.some((p) => entry.startsWith(p))) continue;
      out.push(...walk(full, exts));
    } else if (exts.some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
}

/**
 * Matches a `code:` template literal, honouring **escaped** backticks.
 *
 * A docs snippet is a TypeScript template literal, so an inner code span is
 * written `` \`themes\` ``. A naive `([\s\S]*?)` up to the next backtick stops
 * at that escape and truncates the snippet — which silently dropped every
 * import appearing *after* it. Snippets whose first escaped backtick preceded
 * their imports were therefore never drift-checked at all, so a renamed or
 * removed export in them could not fail the gate. `(?:[^`\\]|\\.)*` consumes an
 * escaped pair as a unit and stops only at a real closing backtick.
 */
const CODE_TEMPLATE_RE = /code:\s*`((?:[^`\\]|\\.)*)`/g;

/**
 * Matches a `code:` value passed by **identifier** rather than as a literal:
 *
 *     const multiProvider = `...`;
 *     snippetBlock({ title: "main.tsx", lang: "tsx", code: multiProvider })
 *
 * The literal form is the convention, but the identifier form is used in the
 * docs and was invisible to every snippet check — `extractSnippets` only matched
 * `code:` followed by a literal. `apps/docs/app/architecture/page.tsx` passes 11
 * snippets this way and `components/framework-guides/react-bootstrap.tsx` one, so
 * an entire page's worth of snippets was never drift-checked. Resolving the
 * identifier against template-literal consts in the same file closes the hole
 * without rewriting the call sites.
 */
const CODE_IDENTIFIER_RE = /code:\s*([A-Za-z_$][\w$]*)\s*(?=[,}])/g;

/** `const NAME = \`...\``, with `let`/`var` and an optional type annotation. */
const CONST_TEMPLATE_RE =
  /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=`]+)?=\s*`((?:[^`\\]|\\.)*)`/g;

/** Template-literal consts declared in this file, keyed by identifier. */
function resolveConstTemplates(content) {
  const map = new Map();
  for (const m of content.matchAll(new RegExp(CONST_TEMPLATE_RE.source, "g"))) {
    map.set(m[1], unescapeTemplate(m[2]));
  }
  return map;
}

/**
 * Extract code snippets: the `code: \`...\`` values inside object literals
 * (CodeBlock/`snippetBlock`) and `code={...}` / `code: \`...\`` in FrameworkTabs.
 */
export function extractSnippets(content) {
  const snippets = [];
  const re = new RegExp(CODE_TEMPLATE_RE.source, "g");
  let m;
  while ((m = re.exec(content))) {
    snippets.push(unescapeTemplate(m[1]));
  }
  // framework tabs: code: "..." single-quoted strings too
  const re2 = /code:\s*"([\s\S]*?)"/g;
  while ((m = re2.exec(content))) {
    snippets.push(m[1]);
  }
  // code: <identifier> — resolve against this file's template-literal consts.
  // Unresolvable identifiers are skipped, so `code: string` (a type annotation)
  // and `code: installCommand(...)` (a call) are correctly ignored.
  const consts = resolveConstTemplates(content);
  const re3 = new RegExp(CODE_IDENTIFIER_RE.source, "g");
  while ((m = re3.exec(content))) {
    const resolved = consts.get(m[1]);
    if (resolved !== undefined) snippets.push(resolved);
  }
  return snippets;
}

/** `` \` `` -> `` ` `` so the extracted snippet is the text the reader sees. */
function unescapeTemplate(text) {
  return text.replace(/\\([`\\])/g, "$1");
}

/** Extract fenced code blocks from markdown guides. */
export function extractMarkdownSnippets(content) {
  const snippets = [];
  const re = /```[a-zA-Z0-9]*[^\n]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(content))) {
    snippets.push(m[1]);
  }
  return snippets;
}

/**
 * Like `extractSnippets`, but keeps the sibling metadata that declares *which
 * file* the snippet is. The docs convention is
 *
 *     quickStart: { title: "app.tsx", lang: "tsx", code: `...` }
 *
 * so `title` + `lang` are the declared file identity — this is what makes a
 * relative import like `./themes` resolvable at all (see `declaredFileName`).
 * Snippets without a `title` still get an entry (title `null`), so counts match
 * `extractSnippets` and the drift audit is unaffected.
 */
export function extractSnippetEntries(content) {
  const out = [];
  // Both forms of `code:` participate, in source order: the literal form and the
  // identifier form (resolved against this file's template-literal consts). The
  // identifier form previously produced no entry at all, so its snippets escaped
  // every completeness check — `app/architecture/page.tsx` (11 of them) among them.
  const consts = resolveConstTemplates(content);
  const occurrences = [];
  const codeRe = new RegExp(CODE_TEMPLATE_RE.source, "g");
  let m;
  while ((m = codeRe.exec(content))) {
    occurrences.push({
      index: m.index,
      end: m.index + m[0].length,
      code: unescapeTemplate(m[1]),
    });
  }
  const identRe = new RegExp(CODE_IDENTIFIER_RE.source, "g");
  while ((m = identRe.exec(content))) {
    const resolved = consts.get(m[1]);
    if (resolved === undefined) continue;
    occurrences.push({
      index: m.index,
      end: m.index + m[0].length,
      code: resolved,
    });
  }
  occurrences.sort((a, b) => a.index - b.index);

  let prevEnd = 0;
  for (const occ of occurrences) {
    // Read the properties between the previous code literal and this one, so
    // the metadata is attributed to the right object. Key order is NOT fixed in
    // the docs — `apps/docs/app/custom-themes/CustomThemesGuide.tsx` writes
    // `lang` before `title`, and an order-sensitive pattern silently reported
    // its declared `themes.ts` as missing.
    const window = content.slice(Math.max(prevEnd, occ.index - 500), occ.index);
    const pick = (re) => {
      const all = [...window.matchAll(re)];
      return all.length ? all[all.length - 1][1] : null;
    };
    out.push({
      title: pick(/(?:title|filename):\s*"([^"]*)"/g),
      lang: pick(/lang:\s*"([^"]*)"/g),
      code: occ.code,
    });
    prevEnd = occ.end;
  }
  return out;
}

/**
 * Fenced markdown blocks, with the fence language as `lang` and the optional
 * fence meta as `title`.
 *
 * The title rule MIRRORS `parseMeta` in `apps/docs/components/markdown.tsx`
 * (`/(?:title\s*=\s*)?["']([^"']+)["']/`) so the gate sees exactly the filename
 * the rendered page shows. Without this, markdown had no way to declare a
 * companion file and every relative import in a `.md` page was an unfixable
 * violation.
 */
export function extractMarkdownEntries(content) {
  const entries = [];
  const re = /```([a-zA-Z0-9]*)([^\n]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(content))) {
    const meta = m[2] ?? "";
    const titleMatch = /(?:title\s*=\s*)?["']([^"']+)["']/.exec(meta);
    entries.push({ title: titleMatch?.[1] ?? null, lang: m[1] || null, code: m[3] });
  }
  return entries;
}

/** Parse `@theme-kit/*` import statements from a snippet (drift-audit contract). */
export function parseImports(snippet) {
  const imports = [];
  // import { A, type B, C as D } from "@theme-kit/pkg" / "@theme-kit/pkg/subpath"
  const named = /import\s*\{([^}]+)\}\s*from\s*["'](@theme-kit\/[^"']+)["']/g;
  let m;
  while ((m = named.exec(snippet))) {
    const pkg = m[2];
    for (const part of m[1].split(",")) {
      let name = part.trim();
      // strip inline `type ` modifier
      name = name.replace(/^type\s+/, "");
      name = name.split(/\s+as\s+/)[0].trim();
      if (name) imports.push({ pkg, name });
    }
  }
  // import type { ... } from "@theme-kit/..."
  const typeNamed = /import\s+type\s*\{([^}]+)\}\s*from\s*["'](@theme-kit\/[^"']+)["']/g;
  while ((m = typeNamed.exec(snippet))) {
    const pkg = m[2];
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) imports.push({ pkg, name });
    }
  }
  // import def from / import def, { named } from
  const defaultRe = /import\s+(type\s+)?(\w+)(?:\s*,\s*\{[^}]+\})?\s*from\s*["'](@theme-kit\/[^"']+)["']/g;
  while ((m = defaultRe.exec(snippet))) {
    if (m[2] !== "{") imports.push({ pkg: m[3], name: m[2] });
  }
  // dynamic import("@theme-kit/...")
  const dyn = /import\(["'](@theme-kit\/[^"']+)["']\)/g;
  while ((m = dyn.exec(snippet))) {
    imports.push({ pkg: m[1], name: null, dynamic: true });
  }
  return imports;
}

/**
 * Every module specifier a snippet reaches for — relative, bare, or Theme Kit.
 * Used by the completeness checks, which care about *all* dependencies (the
 * drift audit only cares about `@theme-kit/*`).
 *
 * Returns `[{ specifier, kind }]` where kind is one of
 * "static" | "side-effect" | "dynamic" | "require" | "export-from".
 */
export function parseAllImports(snippet) {
  const out = [];
  const push = (specifier, kind) => {
    if (specifier) out.push({ specifier, kind });
  };

  // import ... from "x"  /  import type ... from "x"
  const fromRe = /\bimport\s+(?:type\s+)?(?:[\s\S]*?)\bfrom\s*["']([^"']+)["']/g;
  let m;
  while ((m = fromRe.exec(snippet))) push(m[1], "static");

  // bare side-effect import "x" (and import "x";)
  const sideRe = /\bimport\s+["']([^"']+)["']/g;
  while ((m = sideRe.exec(snippet))) push(m[1], "side-effect");

  // dynamic import("x")
  const dynRe = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = dynRe.exec(snippet))) push(m[1], "dynamic");

  // require("x")
  const reqRe = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = reqRe.exec(snippet))) push(m[1], "require");

  // export ... from "x"
  const expRe = /\bexport\s+(?:type\s+)?(?:\*|\{[\s\S]*?\})\s*from\s*["']([^"']+)["']/g;
  while ((m = expRe.exec(snippet))) push(m[1], "export-from");

  // de-dupe, keeping the first kind seen for a specifier
  const seen = new Map();
  for (const entry of out) if (!seen.has(entry.specifier)) seen.set(entry.specifier, entry);
  return [...seen.values()];
}

/** True for specifiers that resolve inside the snippet bundle rather than a package. */
export function isRelativeSpecifier(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

/** True for Node builtins (`node:fs`) and their bare form (`fs`, `path`). */
const NODE_BUILTINS = new Set([
  "assert", "buffer", "child_process", "cluster", "console", "crypto", "dgram",
  "dns", "events", "fs", "http", "http2", "https", "module", "net", "os",
  "path", "perf_hooks", "process", "punycode", "querystring", "readline",
  "stream", "string_decoder", "timers", "tls", "tty", "url", "util", "v8",
  "vm", "worker_threads", "zlib",
]);

export function isNodeBuiltin(specifier) {
  if (specifier.startsWith("node:")) return true;
  const base = specifier.split("/")[0];
  return NODE_BUILTINS.has(base);
}

/**
 * The file name a snippet declares for itself, or `null`.
 *
 * Two conventions are in use and both must be honoured:
 *   - the sibling `title:` field (`title: "main.tsx — optimized CSR bootstrap"`
 *     → `main.tsx`), which is the reliable one, and
 *   - a leading comment inside the code (`` // app.tsx ``).
 *
 * This is what lets `import { themes } from "./themes"` resolve: the *same
 * bundle* must also declare a `themes.ts(x)` snippet. 49 snippets import
 * `./themes`; without this mapping there is no way to tell a declared
 * companion file from a file the reader has to invent.
 */
export function declaredFileName(entry) {
  const fromTitle = normalise(entry.title ?? "");
  if (fromTitle) return fromTitle;
  const firstLines = (entry.code ?? "").split("\n").slice(0, 3).join("\n");
  const m = firstLines.match(/^\s*(?:\/\/|\/\*)\s*([A-Za-z0-9_@./-]+\.[A-Za-z0-9]+)/m);
  if (!m) return null;
  return FILE_EXT.test(m[1]) ? m[1] : null;
}

/** `"main.tsx — optimized CSR bootstrap"` → `"main.tsx"`; prose → `null`. */
function normalise(title) {
  const m = title.match(/[A-Za-z0-9_@./-]+\.[A-Za-z0-9]+/);
  return m && FILE_EXT.test(m[0]) ? m[0] : null;
}

/** The basename a bundle can be imported by: `src/App.tsx` → `App`. */
export function moduleKey(fileName) {
  return fileName
    .replace(/^.*\//, "")
    .replace(/\.(?:tsx?|jsx?|mts|cts|vue|svelte|astro|css|scss|mjs|cjs|json)$/, "");
}

/**
 * Resolve a relative specifier against a bundle's declared files.
 *
 * Matching is by **basename**, not by path: docs bundles use illustrative
 * directories (`./src/themes`, `../themes`, `./theme/themes` all mean the same
 * companion file), so a path-exact model would report every one of them as
 * missing and drown the real defects. `declaredKeys` is the set produced by
 * `moduleKey()` over the bundle's declared file names.
 */
export function resolveLocal(specifier, declaredKeys) {
  const base = specifier
    .replace(/^\.\//, "")
    .replace(/^(?:\.\.\/)+/, "")
    .replace(/^.*\//, "")
    .replace(/\.(?:tsx?|jsx?|mts|cts|vue|svelte|astro|css|scss|mjs|cjs|json)$/, "");
  return declaredKeys.has(base) ? base : null;
}

/**
 * The docs sources the snippet audits scan, in scan order.
 *
 * `completeness: false` marks a root whose snippets are **fragments rendered
 * inside a guide panel**, not canonical copy-paste examples. They must still
 * resolve against the shipped API (the drift audit), but the example
 * completeness contract — every import declared, every local file present —
 * does not apply to a fragment whose surrounding page supplies the rest.
 */
export function scanRoots(repoRoot) {
  return [
    { dir: join(repoRoot, "apps", "docs", "app"), exts: [".tsx", ".ts"], astro: false, completeness: true },
    { dir: join(repoRoot, "apps", "docs", "lib"), exts: [".tsx", ".ts"], astro: false, completeness: true },
    // Rendered guide panels live here, not under app/ or lib/. Leaving this root
    // out of the *drift* audit hid a subpath that does not exist
    // (`@theme-kit/mui/factory`) in components/framework-guides.
    { dir: join(repoRoot, "apps", "docs", "components"), exts: [".tsx", ".ts"], astro: false, completeness: false },
    { dir: join(repoRoot, "apps", "docs", "content"), exts: [".md", ".mdx"], astro: true, completeness: true },
  ];
}

/** The subset of `scanRoots` whose snippets must be self-contained examples. */
export function completenessRoots(repoRoot) {
  return scanRoots(repoRoot).filter((root) => root.completeness !== false);
}
