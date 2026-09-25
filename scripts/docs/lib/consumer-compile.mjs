#!/usr/bin/env node
/**
 * Dynamic consumer-compile harness for Audit C (brief §8) and §10's
 * "Run example consumer fixtures" step.
 *
 * For one example.meta.json this:
 *   1. packs every *workspace* package the example declares (plus each declared
 *      package's own workspace `dependencies`) into fresh tarballs with
 *      `pnpm pack` — the same artifacts the publish pipeline ships;
 *   2. generates a fixture project whose package.json installs exactly the
 *      example's declared `packages` + `peerDependencies` from those tarballs
 *      (`file:` specifiers, mirroring release-test/install.mjs);
 *   3. copies the example's declared `files` into the fixture;
 *   4. typechecks the copied sources against the *packed* declarations with
 *      `tsc --noEmit`;
 *   5. runs a Node smoke test that imports the copied framework-free sources.
 *
 * Network is only needed for npm to fetch the example's *registry* peers
 * (react, typescript, ...) from the cache; theme-kit packages never touch it.
 * No reporting here: throw on the first failure; the caller owns output.
 */

import { readFileSync, existsSync, mkdirSync, cpSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { execFileSync, execSync } from "node:child_process";
import { join, dirname, resolve, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."));

/** Map of workspace package name → package.json, discovered once per run. */
function workspacePackages() {
  const out = new Map();
  for (const dir of ["packages", "packages/adapters"]) {
    const base = join(repoRoot, dir);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgPath = join(base, entry.name, "package.json");
      if (!existsSync(pkgPath)) continue;
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      out.set(pkg.name, { ...pkg, __dir: join(base, entry.name) });
    }
  }
  return out;
}

const tgzMangled = (pkgName) => `${pkgName.replace("@", "").replace("/", "-")}-`;
const findTarball = (dir, pkgName) =>
  readdirSync(dir).find((f) => f.startsWith(tgzMangled(pkgName)) && f.endsWith(".tgz"));

/**
 * A stable, collision-free identifier for an example directory.
 *
 * `basename()` is NOT enough: every React example lives in a folder literally
 * called `react`, so `examples/basic-theme/react` and `examples/theme-scope/react`
 * would share one temp directory — and a crash in the first would leave state the
 * second silently reuses. Derive from the path instead.
 */
const exampleSlug = (exampleDir) =>
  relative(repoRoot, exampleDir).replace(/[\\/]/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

/**
 * Absolute path to the npm CLI shipped with the *running* node, or null when it
 * cannot be located (unusual layouts).
 *
 * Resolving npm through this path instead of a `shell: true` PATH lookup is
 * deliberate: on Windows the shell can resolve a different npm (a corepack or
 * shim wrapper) which then hangs instead of installing, making the audit
 * environment-dependent. Deterministic tool resolution keeps CI honest.
 */
function npmCliPath() {
  const nodeDir = dirname(process.execPath);
  for (const c of [
    join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js"), // Windows layout
    join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"), // unix layout
  ]) {
    if (existsSync(c)) return c;
  }
  return null;
}

function packWorkspacePackage(pkgName, ws, outDir) {
  const pkg = ws.get(pkgName);
  if (!pkg) return null;
  execFileSync("pnpm", ["pack", "--pack-destination", outDir], {
    cwd: pkg.__dir,
    stdio: "ignore",
    shell: process.platform === "win32",
  });
  const t = findTarball(outDir, pkgName);
  if (!t) throw new Error(`pnpm pack produced no tarball for ${pkgName}`);
  return join(outDir, t);
}

/**
 * A dedicated npm cache for this audit run.
 *
 * npm locks its cache directory. When the *default* cache is left in a bad state
 * (observed after installs that were interrupted mid-write), later installs block
 * forever at `fetch manifest …@file:<tarball>` instead of failing — measured on
 * this machine: **3/3 installs timed out on the shared cache, 3/3 succeeded in
 * ~3.5s each with a per-run cache**. Reusing one directory across the examples of
 * a single run keeps it to one download; a fresh directory per run keeps it
 * reliable.
 *
 * Set `THEME_KIT_AUDIT_C_CACHE` to deliberately reuse a warm cache.
 */
function npmCacheDir() {
  return process.env.THEME_KIT_AUDIT_C_CACHE ?? join(tmpdir(), `theme-kit-audit-c-cache-${process.pid}`);
}

/** Removes the run's private npm cache (no-op when one was supplied via env). */
export function disposeNpmCache() {
  if (process.env.THEME_KIT_AUDIT_C_CACHE) return;
  try {
    rmSync(npmCacheDir(), { recursive: true, force: true });
  } catch {
    /* best effort on Windows file locks */
  }
}

/**
 * Builds a self-contained consumer fixture for one canonical example and
 * verifies it installs, typechecks, and (where framework-free) runs.
 *
 * @param {string} exampleDir absolute path holding example.meta.json
 * @returns {Promise<{ packed: string[] }>} tarball paths used (for reporting)
 */
export async function verifyExampleConsumerCompile(exampleDir) {
  const meta = JSON.parse(readFileSync(join(exampleDir, "example.meta.json"), "utf8"));
  const ws = workspacePackages();
  const work = join(tmpdir(), `theme-kit-audit-c-${exampleSlug(exampleDir)}-${process.pid}`);
  const tarballs = join(work, "tarballs");
  const fixture = join(work, "fixture");
  const packed = [];
  const cleanup = () => {
    try {
      rmSync(work, { recursive: true, force: true });
    } catch {
      /* best effort on Windows file locks */
    }
  };
  try {
    mkdirSync(tarballs, { recursive: true });
    mkdirSync(join(fixture, "src"), { recursive: true });

    // 1. Pack every declared theme-kit package plus its workspace deps so the
    //    installed tree matches what the registry would serve.
    const need = new Set();
    for (const spec of meta.packages ?? []) {
      const pkgName = spec.startsWith("@theme-kit/") ? spec : null;
      if (!pkgName || !ws.has(pkgName)) continue;
      need.add(pkgName);
      const pkg = ws.get(pkgName);
      for (const dep of Object.keys(pkg.dependencies ?? {})) if (ws.has(dep)) need.add(dep);
    }
    for (const name of need) {
      const t = packWorkspacePackage(name, ws, tarballs);
      if (t) packed.push(t);
    }

    // 2. Fixture package.json: declared theme-kit packages and workspace peers
    //    from tarballs; registry peers (react, react-dom, ...) from the cache.
    const usesReact =
      (meta.files ?? []).some((f) => f.endsWith(".tsx")) || (meta.peerDependencies ?? []).includes("react");
    const deps = {};
    const tarballSpec = (pkgName) => {
      const t = findTarball(tarballs, pkgName);
      if (!t) throw new Error(`no tarball packed for ${pkgName}`);
      // Absolute path on purpose. A *relative* `file:../tarballs/x.tgz`
      // specifier is re-resolved from a different base when the packed package
      // itself depends on the same package (e.g. @theme-kit/react ->
      // @theme-kit/core), and npm then hangs forever in `idealTree buildDeps`
      // instead of failing. Absolute specifiers are unambiguous.
      return `file:${join(tarballs, t)}`;
    };
    for (const spec of meta.packages ?? []) {
      if (spec.startsWith("@theme-kit/") && ws.has(spec)) deps[spec] = tarballSpec(spec);
    }
    for (const peer of meta.peerDependencies ?? []) {
      const pkg = ws.get(peer);
      deps[peer] = pkg ? tarballSpec(peer) : "*";
    }
    // Registry peers resolve to "*" from the npm cache; React examples also
    // need the same @types devDeps the canonical examples themselves declare
    // (the packed @theme-kit/react declarations import React types).
    const devDeps = { typescript: "^5.9.0" };
    if (usesReact) {
      devDeps["@types/react"] = "^19.0.0";
      devDeps["@types/react-dom"] = "^19.0.0";
    }
    writeFileSync(
      join(fixture, "package.json"),
      JSON.stringify(
        {
          name: "theme-kit-audit-c-fixture",
          private: true,
          version: "0.0.0",
          type: "module",
          dependencies: deps,
          devDependencies: devDeps,
        },
        null,
        2,
      ) + "\n",
    );

    // 3. Copy the example's declared sources verbatim — the audit target.
    for (const f of meta.files ?? []) {
      const from = join(exampleDir, f);
      if (!existsSync(from)) throw new Error(`declared file missing: ${f}`);
      cpSync(from, join(fixture, f));
    }

    // 4. Fixture tsconfig (mirrors the examples': moduleResolution bundler).
    const fixtureTsconfig = {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        ...(usesReact ? { jsx: "react-jsx", types: ["react", "react-dom"] } : {}),
      },
      include: (meta.files ?? []).map((f) => f.replace(/\\/g, "/")),
    };
    writeFileSync(join(fixture, "tsconfig.json"), JSON.stringify(fixtureTsconfig, null, 2));

    // 5. Install from the packed tarballs + registry cache. `--no-package-lock`
    //    keeps re-runs from pinning stale tarballs (release-test/install.mjs).
    //    Prefer the npm CLI bundled with the running node (see npmCliPath); the
    //    timeout bounds a resolution deadlock so the gate fails rather than
    //    hanging forever (see the absolute-path note above). Output is captured
    //    so a failure is diagnosable instead of an opaque exit code.
    //
    //    Retried once: npm can stall reading a tarball that was written moments
    //    earlier (observed as a hang at `fetch manifest ...@file:<tarball>` —
    //    consistent with a transient Windows file lock). A second attempt after
    //    a short pause succeeds.
    const npmArgs = [
      "install",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
      `--cache=${npmCacheDir()}`,
    ];
    const installTimeout = Number(process.env.THEME_KIT_AUDIT_C_TIMEOUT_MS ?? 120_000);
    const npmCli = npmCliPath();
    const tail = (v) =>
      String(v ?? "")
        .split("\n")
        .slice(-8)
        .join("\n")
        .trim();

    let installError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (npmCli) {
          execFileSync(process.execPath, [npmCli, ...npmArgs], {
            cwd: fixture,
            stdio: "pipe",
            timeout: installTimeout,
            killSignal: "SIGKILL",
          });
        } else {
          execSync(`npm ${npmArgs.join(" ")}`, {
            cwd: fixture,
            stdio: "pipe",
            shell: process.platform === "win32",
            timeout: installTimeout,
            killSignal: "SIGKILL",
          });
        }
        installError = undefined;
        break;
      } catch (e) {
        installError = e;
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    if (installError) {
      throw new Error(
        `npm install failed in the consumer fixture after 2 attempts ` +
          `(${installError.code ?? installError.message}).\n` +
          `${tail(installError.stdout)}\n${tail(installError.stderr)}`,
      );
    }

    // 6. Typecheck the copied sources against the packed declarations.
    const tsc = join(fixture, "node_modules", ".bin", process.platform === "win32" ? "tsc.CMD" : "tsc");
    execFileSync(`"${tsc}" --noEmit`, { cwd: fixture, stdio: "pipe", shell: process.platform === "win32" });

    // 7. Runtime smoke for framework-free sources. Node ≥23 strips types
    //    natively, so .ts can be imported directly — but only with explicit
    //    extensions and no bare relative specifiers, so skip any smoke file
    //    that uses relative imports (those need a bundler; tsc already proved
    //    they compile).
    const smokeFiles = (meta.files ?? [])
      .filter((f) => /\.(ts|mjs)$/.test(f) && !f.endsWith(".d.ts"))
      .filter((f) => {
        const src = readFileSync(join(fixture, f), "utf8");
        return !/(^|\n)\s*(import|export)\s[^;]*from\s*["']\.\.?\/|(^|\n)\s*import\s*["']\.\.?\/\//.test(src);
      });
    if (smokeFiles.length) {
      const imports = smokeFiles
        .map((f, i) => `import * as m${i} from "./${f.replace(/\\/g, "/")}";`)
        .join("\n");
      const touched = smokeFiles.map((_, i) => `void m${i};`).join(" ");
      const smoke = `${imports}
import { createThemeRegistry } from "@theme-kit/core";
const registry = createThemeRegistry({ themes: [] });
if (typeof registry.get !== "function") throw new Error("registry smoke failed");
${touched}
console.log("smoke-ok");
`;
      writeFileSync(join(fixture, "smoke.mjs"), smoke);
      execFileSync(process.execPath, ["smoke.mjs"], { cwd: fixture, stdio: "pipe" });
    }

    return { packed };
  } finally {
    cleanup();
  }
}

// ---------------------------------------------------------------------------
// Offline typecheck (deterministic, no network)
// ---------------------------------------------------------------------------

/** node_modules roots to search for a peer/types package, most specific first. */
function dependencyRoots() {
  const roots = [join(repoRoot, "node_modules")];
  for (const dir of ["packages", "packages/adapters", "examples"]) {
    const base = join(repoRoot, dir);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === "node_modules") continue;
      roots.push(join(base, entry.name, "node_modules"));
    }
  }
  return roots.filter((r) => existsSync(r));
}

/** Resolves an installed package directory (e.g. `react` or `@types/react`). */
function findInstalledDir(pkgName) {
  const rel = join(...pkgName.split("/"));
  for (const root of dependencyRoots()) {
    const p = join(root, rel);
    if (existsSync(p)) return p;
  }
  return null;
}

/** The declaration entry a consumer would see for `@theme-kit/<name>[/sub]`. */
function declarationEntryFor(spec, ws) {
  const m = spec.match(/^(@[^/]+\/[^/]+)(?:\/(.+))?$/);
  if (!m) return null;
  const [, name, sub] = m;
  const pkg = ws.get(name);
  if (!pkg) return null;
  const entry = sub ? pkg.exports?.[`./${sub}`] : (pkg.exports?.["."] ?? pkg);
  const types = typeof entry === "object" ? entry.types : pkg.types;
  return join(pkg.__dir, types ?? (sub ? `dist/${sub}.d.ts` : "dist/index.d.ts"));
}

/** The package *directory* a consumer's bundler would resolve a specifier to. */
function runtimeEntryFor(spec, ws) {
  const m = spec.match(/^(@[^/]+\/[^/]+)(?:\/(.+))?$/);
  if (!m) return null;
  const [, name, sub] = m;
  const pkg = ws.get(name);
  if (!pkg) return null;
  if (sub) {
    const entry = pkg.exports?.[`./${sub}`];
    const target = typeof entry === "object" ? (entry.import ?? entry.default) : entry;
    return join(pkg.__dir, target ?? `dist/${sub}.js`);
  }
  return pkg.__dir;
}

/**
 * esbuild's CLI, resolved from the pnpm store (tsup/vitest already bring it in).
 * Version-sorted so a future bump is picked up without editing this file.
 */
function esbuildBin() {
  const pnpm = join(repoRoot, "node_modules", ".pnpm");
  if (!existsSync(pnpm)) return null;
  const candidates = readdirSync(pnpm)
    .filter((d) => /^esbuild@\d+\.\d+\.\d+/.test(d))
    .sort((a, b) => {
      const v = (s) => s.slice("esbuild@".length).split("_")[0].split(".").map(Number);
      const [a1, a2, a3] = v(a);
      const [b1, b2, b3] = v(b);
      return b1 - a1 || b2 - a2 || b3 - a3;
    });
  for (const d of candidates) {
    const bin = join(pnpm, d, "node_modules", "esbuild", "bin", "esbuild");
    if (existsSync(bin)) return bin;
  }
  return null;
}

/**
 * Builds the offline project description shared by the typecheck and the render
 * smoke: the specifier→path maps plus a tsconfig on disk.
 *
 * `typePaths` points at declarations (what tsc needs); `runtimePaths` points at
 * the real modules (what a bundler needs). They differ: `react` resolves to
 * `@types/react` for types but to `react` itself at runtime.
 */
function buildOfflineProject(exampleDir) {
  const meta = JSON.parse(readFileSync(join(exampleDir, "example.meta.json"), "utf8"));
  const ws = workspacePackages();
  const work = join(tmpdir(), `theme-kit-audit-c-offline-${exampleSlug(exampleDir)}-${process.pid}`);

  const typePaths = {};
  const runtimePaths = {};
  for (const spec of meta.packages ?? []) {
    const types = declarationEntryFor(spec, ws);
    if (!types) throw new Error(`cannot resolve declaration entry for "${spec}"`);
    if (!existsSync(types)) {
      throw new Error(`"${spec}" has no built declarations at ${types} — build the package first`);
    }
    typePaths[spec] = [types.replace(/\\/g, "/")];
    const runtime = runtimeEntryFor(spec, ws);
    if (runtime) runtimePaths[spec] = [runtime.replace(/\\/g, "/")];
  }

  // Registry peers (react, react-dom, ...) come from whichever workspace package
  // already has them installed; `@types/*` wins for type resolution.
  const usesReact =
    (meta.files ?? []).some((f) => f.endsWith(".tsx")) ||
    (meta.peerDependencies ?? []).includes("react");
  for (const peer of meta.peerDependencies ?? []) {
    const types = findInstalledDir(`@types/${peer}`);
    const runtime = findInstalledDir(peer);
    const dir = types ?? runtime;
    if (!dir) throw new Error(`peer "${peer}" is not installed anywhere in the workspace`);
    typePaths[peer] = [dir.replace(/\\/g, "/")];
    if (runtime) runtimePaths[peer] = [runtime.replace(/\\/g, "/")];
  }
  if (usesReact) {
    // Subpath imports TypeScript resolves as distinct specifiers.
    const reactDir = findInstalledDir("@types/react") ?? findInstalledDir("react");
    const reactDomDir = findInstalledDir("@types/react-dom") ?? findInstalledDir("react-dom");
    if (!reactDir || !reactDomDir) throw new Error("react/react-dom types are not installed in the workspace");
    typePaths["react/jsx-runtime"] = [join(reactDir, "jsx-runtime.d.ts").replace(/\\/g, "/")];
    typePaths["react-dom/client"] = [join(reactDomDir, "client.d.ts").replace(/\\/g, "/")];

    // A bundler needs the runtime subpaths as well, resolved to real files.
    const reactRuntime = findInstalledDir("react");
    const reactDomRuntime = findInstalledDir("react-dom");
    for (const [spec, dir, file] of [
      ["react/jsx-runtime", reactRuntime, "jsx-runtime.js"],
      ["react-dom/server", reactDomRuntime, "server.js"],
      ["react-dom/client", reactDomRuntime, "client.js"],
    ]) {
      if (dir && existsSync(join(dir, file))) runtimePaths[spec] = [join(dir, file).replace(/\\/g, "/")];
    }
  }

  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      baseUrl: repoRoot.replace(/\\/g, "/"),
      paths: typePaths,
      ...(usesReact ? { jsx: "react-jsx" } : {}),
    },
    files: (meta.files ?? []).map((f) => join(exampleDir, f).replace(/\\/g, "/")),
  };

  mkdirSync(work, { recursive: true });
  const tsconfigPath = join(work, "tsconfig.json");
  writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

  return { meta, work, tsconfigPath, usesReact, runtimePaths, exampleDir };
}

function cleanupOffline(work) {
  try {
    rmSync(work, { recursive: true, force: true });
  } catch {
    /* best effort on Windows file locks */
  }
}

/**
 * Offline typecheck of an example's own sources against the workspace's BUILT
 * declarations — no `npm install`, no network, deterministic.
 *
 * Complements {@link verifyExampleConsumerCompile}: this proves the example
 * compiles against exactly what a consumer's compiler sees (the emitted `.d.ts`),
 * while the tarball-install path additionally proves the packages install and
 * that the sources run. Use this where `pnpm`/network are unavailable or flaky.
 *
 * @param {string} exampleDir absolute path holding example.meta.json
 * @returns {{ tsc: string }} the tsc version used
 */
export function verifyExampleTypecheck(exampleDir) {
  const { work, tsconfigPath } = buildOfflineProject(exampleDir);
  const tsc = join(repoRoot, "node_modules", "typescript", "bin", "tsc");
  try {
    execFileSync(process.execPath, [tsc, "-p", tsconfigPath], { stdio: "pipe" });
  } catch (e) {
    throw new Error(`tsc failed:\n${String(e.stdout ?? "").trim()}`);
  } finally {
    cleanupOffline(work);
  }
  return { tsc: execFileSync(process.execPath, [tsc, "--version"], { encoding: "utf8" }).trim() };
}

/**
 * Offline **render smoke** for a framework example: bundles the example's entry
 * with esbuild and renders it with `react-dom/server`, so the component tree
 * actually executes.
 *
 * Typechecking alone cannot catch runtime errors — a hook used outside its
 * provider, a provider that throws while resolving tokens, an invalid runtime
 * prop. Those only surface when the tree renders. (This tier is still offline:
 * esbuild + react come from the workspace.)
 *
 * The result is written to a file rather than stdout, and the child exits
 * explicitly — the theme runtime leaves handles open, so the process would
 * otherwise never exit on its own.
 *
 * @param {string} exampleDir absolute path holding example.meta.json
 * @returns {{ html: number } | null} rendered size, or null when not applicable
 */
export function verifyExampleRender(exampleDir) {
  const { meta, work, tsconfigPath, usesReact, runtimePaths } = buildOfflineProject(exampleDir);
  try {
    return renderIn(exampleDir, meta, work, tsconfigPath, usesReact, runtimePaths);
  } finally {
    cleanupOffline(work);
  }
}

/** @internal Implementation detail of {@link verifyExampleRender}. */
function renderIn(exampleDir, meta, work, _tsconfigPath, usesReact, runtimePaths) {
  const entry = meta.entry ?? "";
  // Framework-free examples are executed by the dynamic tier's smoke step instead.
  if (!usesReact || !entry.endsWith(".tsx")) return null;

  const esbuild = esbuildBin();
  if (!esbuild) throw new Error("esbuild not found in the pnpm store — cannot run the render smoke");

  // esbuild reads `paths` from tsconfig, so give it the runtime (not types) map.
  const bundleTsconfig = join(work, "tsconfig.bundle.json");
  writeFileSync(
    bundleTsconfig,
    JSON.stringify({
      compilerOptions: {
        jsx: "react-jsx",
        baseUrl: repoRoot.replace(/\\/g, "/"),
        paths: runtimePaths,
      },
    }),
  );

  const entryAbs = join(exampleDir, entry).replace(/\\/g, "/");
  const renderEntry = join(work, "render.tsx");
  const resultPath = join(work, "render.json");
  writeFileSync(
    renderEntry,
    `import { writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import App from ${JSON.stringify(entryAbs)};

const html = renderToStaticMarkup(<App />);
writeFileSync(
  ${JSON.stringify(resultPath.replace(/\\/g, "/"))},
  JSON.stringify({ chars: html.length, hasElement: html.includes("<") }),
);
process.exit(0);
`,
  );

  const bundle = join(work, "bundle.cjs");
  try {
    execFileSync(
      process.execPath,
      [
        esbuild,
        renderEntry,
        "--bundle",
        "--format=cjs",
        "--platform=node",
        "--log-level=error",
        `--tsconfig=${bundleTsconfig}`,
        `--outfile=${bundle}`,
      ],
      { stdio: "pipe", timeout: 120_000 },
    );
  } catch (e) {
    throw new Error(`esbuild failed:\n${String(e.stdout ?? "").trim()}\n${String(e.stderr ?? "").trim()}`);
  }

  try {
    execFileSync(process.execPath, [bundle], { stdio: "pipe", timeout: 120_000 });
  } catch (e) {
    throw new Error(
      `rendering the example threw:\n${String(e.stderr ?? "").trim().split("\n").slice(0, 12).join("\n")}`,
    );
  }

  let result;
  try {
    result = JSON.parse(readFileSync(resultPath, "utf8"));
  } catch {
    throw new Error("the render produced no result file (the example crashed before rendering)");
  }
  if (!result.hasElement) {
    throw new Error(`the example rendered ${result.chars} characters of empty markup`);
  }
  return { html: result.chars };
}

