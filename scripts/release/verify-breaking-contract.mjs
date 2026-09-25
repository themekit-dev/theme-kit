#!/usr/bin/env node
/**
 * verify-breaking-contract — pins the 2.0.0 public-API contract.
 *
 * 2.0.0 removed 93 public exports across 12 packages and deleted the
 * `@theme-kit/astro/adapters` subpath, because adapter framework bindings moved
 * out of the framework packages and off the adapter root entries. See
 * `CHANGELOG.md` §2.0.0 and the "Migrating from 1.x to 2.0" docs page.
 *
 * That removal is the release. This gate makes it a *tested* contract rather
 * than a one-off edit: it fails if a removed symbol comes back on the entry it
 * was removed from, if a required new subpath disappears, or if the required
 * `runtime` parameter of the adapter hooks is relaxed back to optional.
 *
 * Why a separate gate: `export-inventory.mjs` freezes the surface and asserts
 * src = dist = manifest = docs, but it only asserts *internal consistency with
 * the current tree*. It cannot know that a symbol used to be somewhere else, so
 * re-adding a re-export would keep it green. This is the pin that catches it.
 *
 * Usage: node scripts/release/verify-breaking-contract.mjs
 * Exit: 0 when the contract holds, 1 on any violation.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const MANIFEST = join(here, "api-manifest.json");

const failures = [];
const fail = (where, what, detail) => failures.push({ where, what, detail });

// ---------------------------------------------------------------------------
// The contract
// ---------------------------------------------------------------------------

/**
 * Symbols that MUST NOT be exported from the given entry any more, and the
 * subpaths that MUST exist in their place.
 */
const CONTRACT = [
  {
    pkg: "@theme-kit/shadcn",
    removedFrom: ["useShadcnTheme"],
    requiredSubpaths: ["./react", "./vue", "./svelte", "./solid", "./angular"],
    hook: { subpath: "./react", name: "useShadcnTheme" },
  },
  {
    pkg: "@theme-kit/bootstrap",
    removedFrom: ["useBootstrapTheme"],
    requiredSubpaths: ["./react", "./vue", "./svelte", "./solid", "./angular"],
    hook: { subpath: "./react", name: "useBootstrapTheme" },
  },
  {
    pkg: "@theme-kit/daisyui",
    removedFrom: ["useDaisyTheme"],
    requiredSubpaths: ["./react", "./vue", "./svelte", "./solid", "./angular"],
    hook: { subpath: "./react", name: "useDaisyTheme" },
  },
  {
    pkg: "@theme-kit/open-props",
    removedFrom: ["useOpenPropsTheme"],
    requiredSubpaths: ["./react", "./vue", "./svelte", "./solid", "./angular"],
    hook: { subpath: "./react", name: "useOpenPropsTheme" },
  },
  {
    // Angular is a framework package, so the adapter bindings left its root for
    // each adapter's own `./angular` subpath — the same break vue/svelte/solid
    // carry. The replacement lives in another package, so `hook` (which asserts
    // within one package) cannot express it; the bindings' presence on
    // `@theme-kit/<adapter>/angular` is covered by export-inventory.
    pkg: "@theme-kit/angular",
    removedFrom: [
      "injectShadcnTheme",
      "injectBootstrapTheme",
      "injectDaisyTheme",
      "injectOpenPropsTheme",
      "InjectAdapterOptions",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/vue",
    removedFrom: [
      "useShadcnTheme",
      "useBootstrapTheme",
      "useDaisyTheme",
      "useOpenPropsTheme",
      "UseAdapterOptions",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/svelte",
    removedFrom: [
      "useShadcnTheme",
      "useBootstrapTheme",
      "useDaisyTheme",
      "useOpenPropsTheme",
      "UseAdapterOptions",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/solid",
    removedFrom: [
      "useShadcnTheme",
      "useBootstrapTheme",
      "useDaisyTheme",
      "useOpenPropsTheme",
      "UseAdapterOptions",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/nuxt",
    removedFrom: [
      "useShadcnTheme",
      "useBootstrapTheme",
      "useDaisyTheme",
      "useOpenPropsTheme",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/remix",
    removedFrom: [
      "AntdThemeProvider",
      "AntdThemeProviderProps",
      "ChakraThemeProvider",
      "ChakraThemeProviderProps",
      "MantineThemeProvider",
      "MantineThemeProviderProps",
      "MuiThemeProvider",
      "MuiThemeProviderProps",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/next",
    entry: "./client",
    removedFrom: [
      "AntdThemeProvider",
      "AntdThemeProviderProps",
      "ChakraThemeProvider",
      "ChakraThemeProviderProps",
      "MantineThemeProvider",
      "MantineThemeProviderProps",
      "MuiThemeProvider",
      "MuiThemeProviderProps",
      "useAntdTheme",
      "useBootstrapTheme",
      "useChakraTheme",
      "useDaisyTheme",
      "useMantineTheme",
      "useMuiTheme",
      "useOpenPropsTheme",
      "useShadcnTheme",
    ],
    requiredSubpaths: [],
  },
  {
    pkg: "@theme-kit/astro",
    removedFrom: [
      "ThemeProviderClient",
      "ThemeProviderClientProps",
      "ThemeScope",
      "ThemeScopeProps",
      "ThemeScrollbar",
      "ThemeScrollbarProps",
      "ThemeInspector",
      "ThemeInspectorProps",
      "useTheme",
      "useThemeMode",
      "useThemeFamily",
      "useSetThemeMode",
      "useSetThemeFamily",
      "useToggleTheme",
      "useThemeRuntime",
      "useThemeValue",
      "useThemeTokens",
      "useThemeHistory",
      "useThemeBatch",
      "useThemeSnapshot",
      "useThemeRestore",
      "useThemeLifecycle",
      "useThemePacks",
      "useThemeSchedule",
    ],
    // The whole entry point is gone.
    removedSubpaths: ["./adapters"],
    // The React surface lives here now.
    requiredSubpaths: ["./client", "./runtime"],
  },
  {
    // `./client` kept the React surface but lost the adapter bindings, which
    // moved to each adapter package's own framework subpath.
    pkg: "@theme-kit/astro",
    entry: "./client",
    removedFrom: [
      "AntdThemeProvider",
      "AntdThemeProviderProps",
      "ChakraThemeProvider",
      "ChakraThemeProviderProps",
      "MantineThemeProvider",
      "MantineThemeProviderProps",
      "MuiThemeProvider",
      "MuiThemeProviderProps",
      "UseAstroAdapterOptions",
      "useAntdTheme",
      "useBootstrapTheme",
      "useChakraTheme",
      "useDaisyTheme",
      "useMantineTheme",
      "useMuiTheme",
      "useOpenPropsTheme",
      "useShadcnTheme",
    ],
    requiredSubpaths: [],
  },
];

/**
 * The React surface that must live on `@theme-kit/astro/client` after the split.
 *
 * Note `ThemeScrollbar` / `ThemeInspector` are deliberately NOT here: the React
 * components were not re-exported onto `/client`. Astro's root now exports the
 * web-component equivalents (`ThemeKitScrollbar` / `ThemeKitInspector`, from
 * `@theme-kit/web`) plus the `.astro` subpaths, which is what a non-React Astro
 * page should use.
 */
const ASTRO_CLIENT_SURFACE = [
  "ThemeProviderClient",
  "ThemeReadout",
  "ThemeScope",
  "useTheme",
  "useThemeMode",
  "useToggleTheme",
];

/** The framework-neutral replacements that must be on astro's root. */
const ASTRO_ROOT_GAINS = ["ThemeKitScrollbar", "ThemeKitInspector", "getThemeController"];

// ---------------------------------------------------------------------------
// Load the authorities

if (!existsSync(MANIFEST)) {
  console.error(`Missing ${MANIFEST} — run export-inventory.mjs first.`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

const surfacesOf = (entry) => {
  const values = entry.values ?? [];
  const types = entry.types ?? [];
  const internal = [...(entry.internal?.values ?? []), ...(entry.internal?.types ?? [])];
  return new Set([...values, ...types, ...internal]);
};

/** All symbols reachable from a package's root, plus every subpath's own set. */
const rootSurface = (name) => {
  const e = manifest[name];
  if (!e) return null;
  return surfacesOf(e.exports);
};

const entrypointSurface = (name, subpath) => {
  const e = manifest[name];
  const ep = e?.exports?.entrypoints?.[subpath];
  if (!ep) return null;
  return surfacesOf(ep);
};

const declaredSubpaths = (name) => new Set(manifest[name]?.exports?.subpaths ?? []);

/** Map a subpath to its shipped .d.ts, via the package's own exports map. */
function dtsForSubpath(pkgName, subpath) {
  const dirName = pkgName.replace("@theme-kit/", "");
  const candidates = [
    join(repoRoot, "packages", dirName, "package.json"),
    join(repoRoot, "packages", "adapters", dirName, "package.json"),
  ];
  const pkgPath = candidates.find((p) => existsSync(p));
  if (!pkgPath) return null;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const target = pkg.exports?.[subpath];
  if (!target) return null;
  const typesPath = typeof target === "string" ? target : target.types;
  if (!typesPath) return null;
  return join(dirname(pkgPath), typesPath.replace(/^\.\//, ""));
}

// ---------------------------------------------------------------------------
// 1. Removed symbols must stay removed

for (const row of CONTRACT) {
  const { pkg } = row;
  const entry = row.entry ?? ".";
  const surface =
    entry === "." ? rootSurface(pkg) : entrypointSurface(pkg, entry);

  if (!surface) {
    fail(pkg, `entry ${entry} missing from the manifest`, "");
    continue;
  }

  for (const symbol of row.removedFrom) {
    if (surface.has(symbol)) {
      fail(
        pkg,
        `removed export is back on ${entry}`,
        `"${symbol}" is exported from ${pkg}${entry === "." ? "" : entry} again — ` +
          `this is the 2.0.0 break and it must not be re-added`,
      );
    }
  }

  const subs = declaredSubpaths(pkg);
  for (const sub of row.removedSubpaths ?? []) {
    if (subs.has(sub)) {
      fail(pkg, `removed subpath is back`, `${pkg}${sub} is declared again`);
    }
  }
  for (const sub of row.requiredSubpaths) {
    if (!subs.has(sub)) {
      fail(pkg, `required subpath missing`, `${pkg}${sub} is not declared in exports`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. The replacement subpaths must actually carry the bindings

for (const row of CONTRACT) {
  if (!row.hook) continue;
  const surface = entrypointSurface(row.pkg, row.hook.subpath);
  if (!surface) {
    fail(row.pkg, `subpath ${row.hook.subpath} missing`, "cannot verify the hook moved");
    continue;
  }
  if (!surface.has(row.hook.name)) {
    fail(
      row.pkg,
      `subpath ${row.hook.subpath} does not export ${row.hook.name}`,
      "the binding must be reachable from its new location",
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Astro: the React surface must live on /client, and the root must have
//    gained the framework-neutral replacements.

{
  const client = entrypointSurface("@theme-kit/astro", "./client");
  if (!client) {
    fail("@theme-kit/astro", "missing ./client entry", "");
  } else {
    for (const symbol of ASTRO_CLIENT_SURFACE) {
      if (!client.has(symbol)) {
        fail(
          "@theme-kit/astro",
          `./client does not export ${symbol}`,
          "the React surface moved here and must be reachable",
        );
      }
    }
  }

  const root = rootSurface("@theme-kit/astro");
  if (!root) {
    fail("@theme-kit/astro", "root entry missing from the manifest", "");
  } else {
    for (const symbol of ASTRO_ROOT_GAINS) {
      if (!root.has(symbol)) {
        fail(
          "@theme-kit/astro",
          `root does not export ${symbol}`,
          "the framework-neutral replacement must be on the root",
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. The runtime parameter must still be required

const REQUIRED_RUNTIME = [
  ["@theme-kit/shadcn", "./react", "useShadcnTheme"],
  ["@theme-kit/bootstrap", "./react", "useBootstrapTheme"],
  ["@theme-kit/daisyui", "./react", "useDaisyTheme"],
  ["@theme-kit/open-props", "./react", "useOpenPropsTheme"],
];

for (const [pkg, subpath, hook] of REQUIRED_RUNTIME) {
  const dts = dtsForSubpath(pkg, subpath);
  if (!dts || !existsSync(dts)) {
    fail(pkg, `cannot locate the .d.ts for ${subpath}`, dts ?? "(unresolved)");
    continue;
  }
  const text = readFileSync(dts, "utf8");
  // Match the declaration and inspect the first parameter list only.
  const decl = new RegExp(`function\\s+${hook}\\s*(?:<[^>]*>)?\\s*\\(([^)]*)\\)`);
  const m = decl.exec(text);
  if (!m) {
    fail(pkg, `${hook} not found in ${subpath} .d.ts`, dts);
    continue;
  }
  const params = m[1].trim();
  const first = params.split(",")[0]?.trim() ?? "";
  if (!first) {
    fail(pkg, `${hook} takes no parameters`, "the runtime must be the first parameter");
    continue;
  }
  if (first.includes("?")) {
    fail(
      pkg,
      `${hook} first parameter is optional again`,
      `"${first}" — 2.0.0 made the runtime required; relaxing it silently ` +
        `re-breaks the callers who migrated`,
    );
    continue;
  }
  if (!/\bruntime\b/.test(first)) {
    fail(
      pkg,
      `${hook} first parameter is not the runtime`,
      `"${first}"`,
    );
  }
}

// ---------------------------------------------------------------------------
// Report

const total =
  CONTRACT.reduce((n, r) => n + r.removedFrom.length, 0) +
  CONTRACT.reduce((n, r) => n + (r.requiredSubpaths?.length ?? 0), 0) +
  ASTRO_CLIENT_SURFACE.length +
  ASTRO_ROOT_GAINS.length +
  REQUIRED_RUNTIME.length;

console.log(`Breaking-contract checks: ${total} across ${CONTRACT.length} packages`);
console.log(`Removed exports pinned absent: ${CONTRACT.reduce((n, r) => n + r.removedFrom.length, 0)}`);
console.log("");

if (failures.length === 0) {
  console.log("OK: the 2.0.0 public-API contract holds.");
} else {
  console.log(`FAIL: ${failures.length} violation(s)\n`);
  for (const f of failures) {
    console.log(`  ${f.where}`);
    console.log(`    ${f.what}`);
    if (f.detail) console.log(`    ${f.detail}`);
  }
}

const reportsDir = join(here, "reports");
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });
writeFileSync(
  join(reportsDir, "breaking-contract.json"),
  JSON.stringify(
    { total, pinnedRemovals: CONTRACT.reduce((n, r) => n + r.removedFrom.length, 0), failures },
    null,
    2,
  ),
  "utf8",
);

console.log(`\nFull report: scripts/release/reports/breaking-contract.json`);
process.exit(failures.length === 0 ? 0 : 1);
