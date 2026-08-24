#!/usr/bin/env node
/**
 * Public export inventory + drift check for Theme Kit 1.0.0 (item 1 / item 16).
 *
 * For every publishable package:
 *  1. Lists every public export (values and types) of the package entry point,
 *     reading the *built* .d.ts via the TypeScript compiler API (re-exports are
 *     expanded, so this is the definitive consumer-facing surface).
 *  2. Compares the dist entry surface against the source entry surface
 *     (source ↔ dist drift).
 *  3. Compares the dist surface against the generated docs API reference
 *     (docs drift) and reports undocumented exports + documented-but-missing
 *     exports.
 *
 * Usage: node scripts/release/export-inventory.mjs
 * Output: console report + scripts/release/reports/exports.json
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(join(here, "..", ".."));

const ENTRY_SOURCE = {
  "@theme-kit/core": "src/index.ts",
  "@theme-kit/web": "src/index.ts",
  "@theme-kit/react": "src/index.ts",
  "@theme-kit/next": "src/index.ts",
  "@theme-kit/vue": "src/index.ts",
  "@theme-kit/nuxt": "src/index.ts",
  "@theme-kit/svelte": "src/index.ts",
  "@theme-kit/solid": "src/index.tsx",
  "@theme-kit/angular": "src/public-api.ts",
  "@theme-kit/astro": "src/index.ts",
  "@theme-kit/remix": "src/index.ts",
  "@theme-kit/tailwind": "src/index.ts",
  "@theme-kit/cli": "src/index.ts",
  "@theme-kit/devtools": "src/index.ts",
  "@theme-kit/mantine": "src/index.ts",
  "@theme-kit/adapters": "src/index.ts",
  "@theme-kit/mui": "src/index.ts",
  "@theme-kit/chakra": "src/index.ts",
  "@theme-kit/antd": "src/index.ts",
  "@theme-kit/shadcn": "src/index.ts",
  "@theme-kit/bootstrap": "src/index.ts",
  "@theme-kit/daisyui": "src/index.ts",
  "@theme-kit/open-props": "src/index.ts",
  "@theme-kit/unocss": "src/index.ts",
};

const DOCS_PAGES = {
  "@theme-kit/core": "api-reference/core.md",
  "@theme-kit/react": "api-reference/react.md",
  "@theme-kit/next": "api-reference/next.md",
  "@theme-kit/vue": "api-reference/vue.md",
  "@theme-kit/nuxt": "api-reference/nuxt.md",
  "@theme-kit/svelte": "api-reference/svelte.md",
  "@theme-kit/solid": "api-reference/solid.md",
  "@theme-kit/angular": "api-reference/angular.md",
  "@theme-kit/astro": "api-reference/astro.md",
  "@theme-kit/remix": "api-reference/remix.md",
  "@theme-kit/tailwind": "api-reference/tailwind.md",
  "@theme-kit/cli": "api-reference/cli.md",
  "@theme-kit/devtools": "api-reference/devtools.md",
  "@theme-kit/web": "api-reference/web.md",
};

const PACKAGES = [];
for (const base of ["packages", join("packages", "adapters")]) {
  const baseAbs = join(repoRoot, base);
  if (!existsSync(baseAbs)) continue;
  for (const entry of readdirSafe(baseAbs)) {
    const dir = join(baseAbs, entry);
    const pkgPath = join(dir, "package.json");
    if (!existsSync(pkgPath)) continue;
    const json = JSON.parse(readFileSync(pkgPath, "utf8"));
    if (json.private) continue;
    PACKAGES.push({ dir, rel: relative(repoRoot, dir), json });
  }
}

function readdirSafe(p) {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}

function getEntryDts(pkg) {
  const exportsMap = pkg.json.exports ?? {};
  const root = exportsMap["."];
  if (!root) return null;
  return join(pkg.dir, typeof root === "string" ? root : (root.types ?? root.import ?? root.default));
}

function exportPathsOf(pkg) {
  const exportsMap = pkg.json.exports ?? {};
  return Object.keys(exportsMap)
    .filter((s) => s !== ".")
    .sort();
}

function textParseExports(dtsContent) {
  const values = new Set();
  const types = new Set();
  const lines = dtsContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // export declare function name(...)
    let m = trimmed.match(/^export declare function\s+(\w+)/);
    if (m) { values.add(m[1]); continue; }

    // export declare class name
    m = trimmed.match(/^export declare class\s+(\w+)/);
    if (m) { values.add(m[1]); types.add(m[1]); continue; }

    // export declare const name
    m = trimmed.match(/^export declare const\s+(\w+)/);
    if (m) { values.add(m[1]); continue; }

    // export declare let name
    m = trimmed.match(/^export declare let\s+(\w+)/);
    if (m) { values.add(m[1]); continue; }

    // export declare var name
    m = trimmed.match(/^export declare var\s+(\w+)/);
    if (m) { values.add(m[1]); continue; }

    // export declare type name =
    m = trimmed.match(/^export declare type\s+(\w+)/);
    if (m) { types.add(m[1]); continue; }

    // export declare interface name
    m = trimmed.match(/^export declare interface\s+(\w+)/);
    if (m) { types.add(m[1]); continue; }

    // export declare enum name
    m = trimmed.match(/^export declare enum\s+(\w+)/);
    if (m) { values.add(m[1]); types.add(m[1]); continue; }

    // export { name1, name2 } from "..."  (named re-exports)
    m = trimmed.match(/^export\s+(type\s+)?\{([^}]+)\}\s+from\s+/);
    if (m) {
      const set = m[1] ? types : values;
      for (const part of m[2].split(",")) {
        const n = part.trim().split(/\s+as\s+/)[0].trim();
        if (n) set.add(n);
      }
      continue;
    }

    // export * from "..."  (re-export — can't expand names here)
    // Not adding anything; we note that there are re-exports
    
    // export { name1, name2 }  (local re-exports)
    m = trimmed.match(/^export\s+(type\s+)?\{([^}]+)\}\s*$/);
    if (m) {
      const set = m[1] ? types : values;
      for (const part of m[2].split(",")) {
        const n = part.trim().split(/\s+as\s+/)[0].trim();
        if (n) set.add(n);
      }
      continue;
    }
  }

  return { values: [...values].sort(), types: [...types].sort() };
}

function collectExports(entryFile) {
  const isDts = entryFile.endsWith(".d.ts");

  // Try TS compiler API first
  const options = {
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    noResolve: false,
    allowJs: true,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
    types: [],
    baseUrl: repoRoot,
  };
  if (!isDts) {
    // For source files, add most common framework type packages
    options.types = ["react", "react-dom", "vue", "svelte", "solid-js", "next", "nuxt"];
  }
  const program = ts.createProgram([entryFile], options);
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(entryFile);
  if (sf?.symbol) {
    const values = new Set();
    const types = new Set();
    const internalValues = new Set();
    const internalTypes = new Set();
    for (const sym of checker.getExportsOfModule(sf.symbol)) {
      const name = sym.getName();
      if (name.startsWith("__")) continue;
      if (name === "default") continue;
      let flags = sym.flags;
      let resolved = sym;
      if (flags & ts.SymbolFlags.Alias) {
        try {
          resolved = checker.getAliasedSymbol(sym);
          flags = resolved.flags;
        } catch {
          // keep alias flags; classify conservatively below
        }
      }
      const isValue = Boolean(flags & (ts.SymbolFlags.Value | ts.SymbolFlags.Class | ts.SymbolFlags.Function | ts.SymbolFlags.Variable | ts.SymbolFlags.Enum | ts.SymbolFlags.NamespaceModule | ts.SymbolFlags.RegularEnum | ts.SymbolFlags.ConstEnum));
      const isType = Boolean(flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Class | ts.SymbolFlags.Enum | ts.SymbolFlags.NamespaceModule));

      // `@internal` (JSDoc) — kept in the compiled surface but excluded from
      // the docs-comparison (the API reference generator drops them). Checked
      // on the aliased symbol's own declarations (barrel re-export statements
      // don't carry the JSDoc).
      const isInternal = (resolved.declarations ?? []).some(
        (d) => d.getFullText().includes("@internal"),
      );

      if (isInternal) {
        if (isType) internalTypes.add(name);
        if (isValue) internalValues.add(name);
        if (!isType && !isValue) {
          internalTypes.add(name);
          internalValues.add(name);
        }
        continue;
      }

      if (isType) types.add(name);
      if (isValue) values.add(name);
      if (!isType && !isValue) {
        // unresolvable alias: count as both to avoid false drift
        types.add(name);
        values.add(name);
      }
    }
    if (values.size || types.size) {
      return {
        values: [...values].sort(),
        types: [...types].sort(),
        internal: {
          values: [...internalValues].sort(),
          types: [...internalTypes].sort(),
        },
      };
    }
  }

  // Fallback: text parse the .d.ts for packages where compiler can't resolve symbols
  if (isDts) {
    const content = readFileSync(entryFile, "utf8");
    const result = textParseExports(content);
    if (result.values.length || result.types.length) {
      return result;
    }
  }

  return { values: [], types: [], error: "no exports found" };
}

function parseDocsNames(mdPath) {
  if (!existsSync(mdPath)) return null;
  const content = readFileSync(mdPath, "utf8");
  const names = new Set();
  // headings like `### \`ThemeProvider<T extends ...>(...)\`` or `### \`class ThemeError\``
  const re = /^### `(.+?)`/gm;
  let m;
  while ((m = re.exec(content))) {
    let n = m[1];
    // strip "class " / "enum " prefix
    n = n.replace(/^(class|enum|namespace|interface|type) /, "");
    // strip generic suffix and call signature
    const idx = Math.min(
      ...["<", "(", "["].map((c) => {
        const i = n.indexOf(c);
        return i === -1 ? Infinity : i;
      }),
    );
    if (idx !== Infinity) n = n.slice(0, idx);
    if (n && n !== "default") names.add(n.trim());
  }
  return [...names].sort();
}

const results = [];
for (const pkg of PACKAGES) {
  const entryDts = getEntryDts(pkg);
  const name = pkg.json.name;
  if (!entryDts || !existsSync(entryDts)) {
    results.push({ name, rel: pkg.rel, error: `missing dts entry: ${entryDts}` });
    continue;
  }
  const dist = collectExports(entryDts);

  // source entry surface (via TS on the source file)
  const srcEntry = join(pkg.dir, ENTRY_SOURCE[name] ?? "src/index.ts");
  const src = existsSync(srcEntry) ? collectExports(srcEntry) : null;

  // docs surface
  const docsPath = join(repoRoot, "apps", "docs", "content", DOCS_PAGES[name] ?? "");
  const docs = DOCS_PAGES[name] ? parseDocsNames(docsPath) : null;

  const distAll = new Set([...dist.values, ...dist.types]);
  const srcAll = src ? new Set([...src.values, ...src.types]) : null;
  const docsAll = docs ? new Set(docs) : null;

  const srcDrift = srcAll
    ? {
        inDistNotSrc: [...distAll].filter((n) => !srcAll.has(n)).sort(),
        inSrcNotDist: [...srcAll].filter((n) => !distAll.has(n)).sort(),
      }
    : null;
  const docsDrift = docsAll
    ? {
        notDocumented: [...distAll].filter((n) => !docsAll.has(n)).sort(),
        documentedNotExported: [...docsAll].filter((n) => !distAll.has(n)).sort(),
      }
    : null;

  results.push({
    name,
    rel: pkg.rel,
    dts: relative(repoRoot, entryDts),
    exports: {
      values: dist.values,
      types: dist.types,
      internal: dist.internal ?? { values: [], types: [] },
      subpaths: exportPathsOf(pkg),
    },
    dist: { values: dist.values.length, types: dist.types.length },
    srcDrift,
    docsDrift,
    docsPage: docsPath ? relative(repoRoot, docsPath) : null,
  });
}

// --- report ---
console.log("\n=== PUBLIC EXPORT INVENTORY / DRIFT ===\n");
for (const r of results) {
  if (r.error) {
    console.log(`\nERROR ${r.name}: ${r.error}`);
    continue;
  }
  console.log(`\n${r.name}`);
  console.log(`  dts: ${r.dts} (${r.dist.values} values, ${r.dist.types} types)`);
  if (r.srcDrift && (r.srcDrift.inDistNotSrc.length || r.srcDrift.inSrcNotDist.length)) {
    console.log(`  SOURCE/	DIST DRIFT:`);
    for (const n of r.srcDrift.inDistNotSrc) console.log(`    - in dist, not source: ${n}`);
    for (const n of r.srcDrift.inSrcNotDist) console.log(`    - in source, not dist: ${n}`);
  }
  if (r.docsDrift && (r.docsDrift.notDocumented.length || r.docsDrift.documentedNotExported.length)) {
    console.log(`  DOCS DRIFT (${r.docsPage}):`);
    for (const n of r.docsDrift.notDocumented) console.log(`    - exported, NOT documented: ${n}`);
    for (const n of r.docsDrift.documentedNotExported) console.log(`    - documented, NOT exported: ${n}`);
  } else {
    console.log(`  docs: ${r.docsPage ? "in sync" : "no docs page"}`);
  }
}

const outDir = join(here, "reports");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "exports.json"), JSON.stringify(results, null, 2), "utf8");

// Frozen public API manifest (the 1.0.0 API freeze contract)
const manifest = {};
for (const r of results) {
  if (r.error) continue;
  manifest[r.name] = {
    version: "1.0.0",
    dts: r.dts,
    exports: r.exports,
  };
}
writeFileSync(join(here, "api-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(`\nFrozen API manifest: scripts/release/api-manifest.json (${Object.keys(manifest).length} packages)`);
console.log(`Full report: scripts/release/reports/exports.json`);
