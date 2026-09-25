#!/usr/bin/env node
/**
 * Compile this package's `.svelte` components to plain JS.
 *
 * The package is bundled by tsup, which does not run the Svelte compiler, so a
 * runes component has to be compiled before tsup sees it. Both variants are
 * emitted:
 *
 *   theme-scrollbar.client.js — imports `svelte/internal/client`
 *   theme-scrollbar.server.js — imports `svelte/internal/server`
 *
 * `src/index.ts` picks between them at runtime (`typeof window`), so an SSR
 * bundle never runs the client component and vice versa.
 *
 *   node scripts/compile-svelte.mjs           # write
 *   node scripts/compile-svelte.mjs --check   # verify the output is current
 */

import { compile } from "svelte/compiler";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const SOURCE_DIR = join(root, "src");
const OUT_DIR = join(SOURCE_DIR, "generated");

/** Each entry: the `.svelte` file and the type its default export satisfies. */
const COMPONENTS = [
  { name: "theme-scrollbar", propsType: "ThemeScrollbarProps" },
];

/**
 * The source lives in `src/`, the compiled output in `src/generated/`, so every
 * relative import needs one more level of `../`. `svelte/internal/*` and bare
 * package specifiers are untouched.
 */
function reindentImports(code) {
  return code.replace(/(\bfrom\s*["'])(\.\/?)/g, (_m, prefix, spec) =>
    prefix + "../" + spec.replace(/^\.\//, ""),
  );
}

const check = process.argv.includes("--check");
let stale = 0;

mkdirSync(OUT_DIR, { recursive: true });

for (const { name, propsType } of COMPONENTS) {
  const source = readFileSync(join(SOURCE_DIR, `${name}.svelte`), "utf8");

  const outputs = [];
  for (const generate of ["client", "server"]) {
    const { js } = compile(source, {
      filename: `${name}.svelte`,
      generate,
      runes: true,
      dev: false,
    });
    outputs.push([`${name}.${generate}.js`, reindentImports(js.code)]);
  }

  // A hand-written declaration per variant, so `tsc` can resolve the import
  // without `allowJs` and without inspecting the compiled JS.
  const types = `import type { Component } from "svelte";
import type { ${propsType} } from "../scrollbar-options";

declare const Component_: Component<${propsType}>;
export default Component_;
`;
  for (const generate of ["client", "server"]) {
    outputs.push([`${name}.${generate}.d.ts`, types]);
  }

  for (const [file, contents] of outputs) {
    const target = join(OUT_DIR, file);
    let current = null;
    try {
      current = readFileSync(target, "utf8");
    } catch {
      /* first run */
    }
    if (current === contents) continue;
    if (check) {
      console.error(`src/generated/${file} is out of date.`);
      stale++;
      continue;
    }
    writeFileSync(target, contents);
  }
}

if (check) {
  if (stale) {
    console.error("Run: node scripts/compile-svelte.mjs");
    process.exit(1);
  }
  console.log(`Compiled Svelte output is current (${COMPONENTS.length} component).`);
  process.exit(0);
}

console.log(
  `Compiled ${COMPONENTS.length} component to src/generated/ (client + server).`,
);
