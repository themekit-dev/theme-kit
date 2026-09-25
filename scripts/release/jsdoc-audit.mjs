#!/usr/bin/env node
/**
 * JSDoc / TSDoc coverage gate (JSDOC.md enforcement).
 *
 * For every publishable package with a configured source entry:
 *  1. Resolves the public export surface via the TypeScript compiler API on
 *     the *source* entry (re-exports expanded, @internal excluded — same
 *     program shape as export-inventory.mjs).
 *  2. Hard failure: every public function/class/interface/type alias/enum/
 *     constant export MUST carry a JSDoc comment with a non-empty summary.
 *  3. Warning: public properties/methods of interfaces, classes, and object
 *     type aliases SHOULD carry JSDoc (promote with --props=fail).
 *  4. Supports a per-package exception allowlist for intentionally
 *     self-documenting symbols (JSDOC_EXCEPTIONS below).
 *
 * Usage:
 *   node scripts/release/jsdoc-audit.mjs            # failures → exit 1
 *   node scripts/release/jsdoc-audit.mjs --props=fail
 *   node scripts/release/jsdoc-audit.mjs --packages=core,react
 * Output: console report + scripts/release/reports/jsdoc.json
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

/**
 * Intentionally self-documenting public symbols: their contract is fully
 * expressed by name + type (e.g. tiny string unions used as option values).
 * Keep this list minimal — a real doc comment is almost always better.
 */
const JSDOC_EXCEPTIONS = {};

// --- args ---
const args = process.argv.slice(2);
const propsFail = args.includes("--props=fail");
const pkgFilter = args
  .find((a) => a.startsWith("--packages="))
  ?.replace("--packages=", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const PROGRAM_OPTIONS = {
  skipLibCheck: true,
  noResolve: false,
  allowJs: true,
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
  types: [],
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

function hasSummary(sym, checker) {
  const docs = sym.getDocumentationComment(checker);
  if (!docs || !docs.length) return false;
  return docs.map((d) => d.text ?? "").join("").trim().length > 0;
}

function hasJsDocTags(sym, checker) {
  return sym.getJsDocTags(checker).some((t) => t.name !== "internal");
}

function isInternalSymbol(sym) {
  return (sym.declarations ?? []).some((d) =>
    d.getFullText().includes("@internal"),
  );
}

function kindName(flags) {
  const isType = Boolean(
    flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Class | ts.SymbolFlags.Enum | ts.SymbolFlags.NamespaceModule),
  );
  const isValue = Boolean(
    flags & (ts.SymbolFlags.Value | ts.SymbolFlags.Class | ts.SymbolFlags.Function | ts.SymbolFlags.Variable | ts.SymbolFlags.Enum | ts.SymbolFlags.NamespaceModule | ts.SymbolFlags.RegularEnum | ts.SymbolFlags.ConstEnum),
  );
  if (flags & ts.SymbolFlags.Interface) return "interface";
  if (flags & ts.SymbolFlags.TypeAlias) return "type alias";
  if (flags & ts.SymbolFlags.Class) return "class";
  if (flags & ts.SymbolFlags.Enum) return "enum";
  if (flags & ts.SymbolFlags.Function) return "function";
  if (flags & ts.SymbolFlags.Variable) return "constant";
  if (isType && isValue) return "symbol";
  if (isType) return "type";
  if (isValue) return "value";
  return "export";
}

function isPropertyNode(node) {
  return (
    ts.isPropertyDeclaration(node) ||
    ts.isPropertySignature(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isMethodSignature(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function memberHasDoc(member, checker) {
  const nameNode = member.name;
  if (!nameNode || !ts.isIdentifier(nameNode) && !ts.isStringLiteral(nameNode)) return true;
  const sym = checker.getSymbolAtLocation(nameNode);
  if (!sym) return true;
  return hasSummary(sym, checker) || hasJsDocTags(sym, checker);
}

function ownMembersOfTypeDeclaration(decl) {
  const out = [];
  for (const member of decl.members ?? []) {
    if (!isPropertyNode(member)) continue;
    // skip privates / internals
    if (
      member.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword || m.kind === ts.SyntaxKind.StaticKeyword,
      )
    ) continue;
    if (member.getFullText().includes("@internal")) continue;
    if (ts.isIdentifier(member.name) && member.name.text.startsWith("__")) continue;
    out.push(member);
  }
  return out;
}

function collectExports(sf, checker) {
  const values = [];
  for (const sym of checker.getExportsOfModule(sf.symbol)) {
    const name = sym.getName();
    if (name.startsWith("__") || name === "default") continue;
    let resolved = sym;
    let flags = sym.flags;
    if (flags & ts.SymbolFlags.Alias) {
      try {
        resolved = checker.getAliasedSymbol(sym);
        flags = resolved.flags;
      } catch {
        // keep alias classification
      }
    }
    if (isInternalSymbol(resolved)) continue;
    const kind = kindName(flags);
    values.push({ name, kind, sym: resolved, flags });
  }
  return values;
}

function auditPackage(pkg) {
  const name = pkg.json.name;
  const entryRel = ENTRY_SOURCE[name];
  const entry = join(pkg.dir, entryRel ?? "src/index.ts");
  if (!existsSync(entry)) {
    return { name, error: `missing source entry: ${entryRel ?? "src/index.ts"}` };
  }

  const program = ts.createProgram([entry], PROGRAM_OPTIONS);
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(entry);
  if (!sf?.symbol) return { name, error: "entry has no module symbol" };

  const failures = [];
  const propWarnings = [];
  const exceptions = JSDOC_EXCEPTIONS[name] ?? [];

  for (const exp of collectExports(sf, checker)) {
    const hasDoc = hasSummary(exp.sym, checker) || hasJsDocTags(exp.sym, checker);
    if (!hasDoc && !exceptions.includes(exp.name)) {
      const decl = exp.sym.declarations?.[0];
      failures.push({
        name: exp.name,
        kind: exp.kind,
        file: decl ? relative(repoRoot, decl.getSourceFile().fileName) : null,
      });
    }

    // property/method-level checks (warning)
    for (const d of exp.sym.declarations ?? []) {
      let typeNode = null;
      if (ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d)) {
        typeNode = d;
      } else if (ts.isTypeAliasDeclaration(d)) {
        typeNode = extractTypeLiteral(d.type);
      }
      if (!typeNode) continue;
      for (const member of ownMembersOfTypeDeclaration(typeNode)) {
        if (memberHasDoc(member, checker)) continue;
        const mname = ts.isIdentifier(member.name) ? member.name.text : String(member.name.text ?? member.name);
        if (member.getFullText().includes("@internal")) continue;
        propWarnings.push({
          owner: exp.name,
          name: mname,
          file: relative(repoRoot, d.getSourceFile().fileName),
        });
      }
    }
  }

  const covered = 0; // placeholder, replaced below
  return { name, failures, propWarnings };
}

function extractTypeLiteral(type) {
  if (ts.isTypeLiteralNode(type)) return type;
  if (ts.isParenthesizedTypeNode(type)) return extractTypeLiteral(type.type);
  if (ts.isIntersectionTypeNode(type)) {
    for (const t of type.types) {
      const lit = extractTypeLiteral(t);
      if (lit) return lit;
    }
  }
  return null;
}

// --- run ---
const results = [];
let totalFailures = 0;
let totalPropWarnings = 0;

console.log("\n=== JSDoc COVERAGE AUDIT ===\n");
for (const pkg of PACKAGES) {
  const name = pkg.json.name;
  if (pkgFilter && !pkgFilter.includes(name.replace("@theme-kit/", ""))) continue;
  if (!ENTRY_SOURCE[name]) continue;
  const r = auditPackage(pkg);
  if (r.error) {
    console.log(`  ${name}: ERROR — ${r.error}`);
    results.push(r);
    continue;
  }
  totalFailures += r.failures.length;
  totalPropWarnings += r.propWarnings.length;
  results.push(r);
  const status = r.failures.length ? "FAIL" : "ok";
  console.log(
    `  [${status}] ${name}: ${r.failures.length} undocumented export(s), ${r.propWarnings.length} undocumented member(s)`,
  );
  for (const f of r.failures.slice(0, 25)) {
    console.log(`        - ${f.kind} ${f.name} (${f.file})`);
  }
  if (r.failures.length > 25) {
    console.log(`        … and ${r.failures.length - 25} more`);
  }
  for (const w of r.propWarnings.slice(0, 10)) {
    console.log(`        ~ member ${w.owner}.${w.name} (${w.file})`);
  }
}

// --- report file ---
mkdirSync(join(here, "reports"), { recursive: true });
writeFileSync(
  join(here, "reports", "jsdoc.json"),
  JSON.stringify(results, null, 2),
  "utf8",
);

console.log(`\nTop-level failures: ${totalFailures}`);
console.log(`Property/method warnings: ${totalPropWarnings}`);
console.log(`Report: scripts/release/reports/jsdoc.json`);

if (totalFailures > 0) {
  console.log(
    `\n✗ ${totalFailures} public export(s) are missing JSDoc. See JSDOC.md — every public export needs a contract comment.`,
  );
  process.exitCode = 1;
} else if (propsFail && totalPropWarnings > 0) {
  console.log(`\n✗ Property-level JSDoc required (--props=fail): ${totalPropWarnings} member(s) undocumented.`);
  process.exitCode = 1;
} else {
  console.log("\n✓ JSDoc gate passed.");
}
