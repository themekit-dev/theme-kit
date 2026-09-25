# Changelog

## 2.0.0 — 2026-09-24

Theme Kit 2.0.0 enforces the **dependency-isolation contract** that the ecosystem was always
supposed to obey, adds a first-class **diagnostics system**, and gives Astro a native React-free
runtime. Enforcing that contract removed public exports, so this is a **breaking release** —
read [Breaking changes](#breaking-changes) before upgrading.

Available on [npm](https://www.npmjs.com/org/theme-kit) · [GitHub](https://github.com/themekit-dev/theme-kit) · [Documentation](https://theme-kit-dev.vercel.app)

> **Versioning model change.** Releases are no longer lockstep. Packages are organised into
> release groups (`.changeset/config.json` → `fixed`); only `@theme-kit/core` + `@theme-kit/web`
> move together, and everything else versions independently. So `2.0.0` is the version of the
> **12 packages whose public API broke**, while `core`/`web` ship `1.4.0` and
> `react` ships `1.3.1` in the same release. Mixed-version installs are now supported; the caret
> internal ranges (`workspace:^`) are what keep them compatible. See `VERSIONING.md`.

### Breaking changes

Twelve packages break their public API. All of it is one change with two faces: adapter
framework bindings moved **out of framework packages** and **off the adapter root entries**, and
the exports that existed only to wire that up were removed.

| Package | New version | Break |
|---|---|---|
| `@theme-kit/astro` | 2.0.0 | React surface moved to `/client`; `./adapters` subpath **removed** |
| `@theme-kit/next` | 2.0.0 | `./client` no longer exports the adapter providers/hooks |
| `@theme-kit/remix` | 2.0.0 | root no longer exports the adapter providers |
| `@theme-kit/angular` | 2.0.0 | root no longer exports `injectShadcnTheme` / `injectBootstrapTheme` / `injectDaisyTheme` / `injectOpenPropsTheme` or `InjectAdapterOptions` |
| `@theme-kit/nuxt` | 2.0.0 | root no longer exports the four adapter composables |
| `@theme-kit/vue` | 2.0.0 | root no longer exports the adapter composables |
| `@theme-kit/svelte` | 2.0.0 | root no longer exports the adapter composables |
| `@theme-kit/solid` | 2.0.0 | root no longer exports the adapter composables |
| `@theme-kit/shadcn` | 2.0.0 | root no longer exports `useShadcnTheme` |
| `@theme-kit/bootstrap` | 2.0.0 | root no longer exports `useBootstrapTheme` |
| `@theme-kit/daisyui` | 2.0.0 | root no longer exports `useDaisyTheme` |
| `@theme-kit/open-props` | 2.0.0 | root no longer exports `useOpenPropsTheme` |

93 named exports were removed across those 12 packages, plus the `@theme-kit/astro/adapters`
entry point.

#### 1. Adapter bindings moved to per-framework subpaths

**What changed.** The adapter packages (`shadcn`, `bootstrap`, `daisyui`, `open-props`) no longer
export their hook from the package root, and no longer depend on `@theme-kit/react`. Each gains
one subpath per framework instead: `./react`, `./vue`, `./svelte`, `./solid`, `./angular`.

**Why.** The dependency-isolation contract (`scripts/release/dependency-policy.json`, enforced by
`audit-dependencies.mjs` as part of `release:audit`) permits an adapter to depend only on
`core`/`adapters`, and a framework package only on `core`/`web` (or its own renderer). Both were
violated: the framework packages hard-depended on eight to eleven adapter packages each, and every
adapter root imported `@theme-kit/react` because its hook *was* a React hook. That is why
`@theme-kit/vue` used to install React. The contract is what the release is for; the export removal
is its visible cost.

**Migration from 1.3.x.**

```ts
// before (1.3.x)
import { useShadcnTheme } from "@theme-kit/shadcn";        // React
import { useShadcnTheme } from "@theme-kit/vue";           // Vue
import { useShadcnTheme } from "@theme-kit/next/client";   // Next

// after (2.0.0)
import { useShadcnTheme } from "@theme-kit/shadcn/react";  // React
import { useShadcnTheme } from "@theme-kit/shadcn/vue";    // Vue
import { useShadcnTheme } from "@theme-kit/shadcn/react";  // Next
```

The same shape applies to `useBootstrapTheme`, `useDaisyTheme` and `useOpenPropsTheme`.

**There is no shim.** A deprecated alias re-exported from the old entry would reintroduce exactly
the dependency edge the policy forbids, and `release:audit` rejects it — verified directly by
re-adding one edge and watching the gate fail with `framework-leak`. This is why the packages take
a major rather than a minor.

#### 2. `useXTheme()` now takes the runtime as a required first argument

**What changed.** The hook's first parameter is the runtime, and the options object moved to second
position.

```ts
// before (1.3.x)
useShadcnTheme();
useShadcnTheme({ strategy: "exact" });

// after (2.0.0)
useShadcnTheme(runtime);
useShadcnTheme(runtime, { strategy: "exact" });
```

**Why.** The runtime is no longer read from framework context inside the adapter — that indirection
is precisely what forced the adapter to depend on the framework. Callers now pass it from their own
framework's accessor (`useThemeRuntime()` in React and Vue, `getThemeRuntime()` in Svelte, and so
on).

**This fails loudly.** An existing 1.3.x call `useShadcnTheme({ strategy: "exact" })` now passes an
options object where a runtime is expected — a type error and a runtime failure, not a silent
deprecation.

#### 3. `@theme-kit/astro`: root is now framework-neutral

**What changed.** The React surface moved behind the opt-in `@theme-kit/astro/client` subpath, and
the `./adapters` subpath was removed entirely.

```ts
// before (1.3.x)
import { ThemeProviderClient, ThemeScope, useTheme } from "@theme-kit/astro";
import { useShadcnTheme } from "@theme-kit/astro/adapters";

// after (2.0.0)
import { ThemeProviderClient, ThemeScope, useTheme } from "@theme-kit/astro/client";
import { useShadcnTheme } from "@theme-kit/shadcn/react";
```

**Why.** The root entry re-exported React hooks and depended on `@theme-kit/react` plus nine adapter
packages, which made it unusable from a browser `<script>` — it reached `node:url` through
`themeKit()` — and violated the isolation contract. The root is now React-free and gains the native
browser API (`getThemeController()`, `createThemeController()`, `ThemeToggle.astro`,
`@theme-kit/astro/runtime`). Anything rendering in Astro without React should use `ThemeToggle.astro`
or `getThemeController()` instead of the hooks — that path needs no client framework at all.

#### Documented behaviour changes (not version-breaking, but read them)

Both are fixes for behaviour that was measurably wrong, so they ship in the **minor** `core` bump
rather than as breaks. They are still observable:

- **`setFamily()` ignores an unregistered family** instead of applying it and degrading to
  `themes[0]`. A caller passing a family the registry does not have has a bug; a no-op keeps the
  selection honest, where switching the visitor to a *different* family would hide it.
- **A `"system"` selection can no longer be expressed by inlining resolved variables plus a dark
  media block.** That combination never worked — an inline `style` on `<html>` outranks every
  stylesheet rule — so `systemModeCSSTemplate` is the supported mechanism.

### Features and improvements

#### Diagnostics — a first-class diagnostic system (`@theme-kit/core`)

New in this release. `ThemeError` existed but was **dead code** (nothing in the repository ever
threw it, so `instanceof ThemeError` never matched); it is now the error type the runtime actually
throws, and it carries a diagnostic's code and context. Added: `createDiagnostic`,
`formatDiagnostic`, `emitDiagnostic`, `resetDiagnosticEmission`, `isThemeMode`, and the
`ThemeDiagnostic` / `ThemeDiagnosticLevel` / `ThemeDiagnosticCode` / `ThemeDiagnosticContext` types.
A diagnostic is plain data — building one touches no environment — so the same value can be
formatted, logged or escalated without repeating the logic that produced it.

#### Validation

- **Mode validation** is unified behind a shared `isThemeMode` guard, replacing three separate
  implementations, and is now applied in the resolver where its absence mattered most.
- **Family normalisation** goes through a single `@internal` helper built on `getThemeFamilies`,
  covering the SSR path, the selection controller's initial state and the inline pre-paint script.
  A persisted family that is no longer registered can no longer survive into the selection.
- **The pre-paint script's fallback mode** is derived from `resolveInitialTheme` itself, so the
  script and the client runtime can no longer disagree — previously a measured flash of up to ~1.5 s
  on the shipped examples.
- `createThemeRuntime()` no longer requires an argument (the form the docs show used to throw).

#### Framework improvements

- **Astro** gains a native, React-free runtime: `ThemeToggle.astro` (a real `<button>`, no island,
  no `client:load`), `getThemeController()` / `createThemeController()` (idempotent — the provider,
  a hand-written `<script>` and a React island share **one** runtime), `ThemeScrollbar.astro`, and
  the browser-safe `@theme-kit/astro/runtime` entry. The configuration declared in
  `theme.config.ts` now reaches every consumer, ending the island hydration mismatch (React error
  #418) and the readout that flickered on every reload.
- **Nuxt** re-exports `useThemeMode`, `useThemeFamily`, `useThemeValue` and `useThemeTokens` from
  the package root — the four most-used accessors were auto-imports only, so an explicit import
  failed while nine rarer siblings worked.
- **Remix** reads the persisted selection from cookies when `initial` is omitted, so the client
  runtime adopts the theme the pre-paint script already painted instead of overwriting it
  (measured: a correction from `rgb(15, 5, 32)` to `rgb(248, 250, 252)` at 125 ms, now gone, along
  with the React hydration error it caused). `ThemeHead` and `ThemeProvider` accept `mode` /
  `initialMode` / `initialFamily`.
- **Svelte** gains `ThemeScrollbar` with typed options, and a shared context module.
- **Web components** gain a shared custom-element base, and `theme-kit-provider` accepts
  `initial-mode` / `initial-family` (a mode was previously inexpressible from HTML).
- **Angular**'s pre-paint script now delegates to core's `themeToCSSVariables`. It had been emitting
  `--theme-background` while everything else read `--theme-color-background`, so the pre-paint
  stylesheet was **inert**; it also dropped five token groups and ignored `extends` chains.

#### Configuration

Core gains a configuration subsystem (`app-config`, `config-loader`, `config`) exposed on the new
`@theme-kit/core/config` subpath.

#### Documentation

- New **"Migrating from 1.x to 2.0"** guide covering every verified break.
- The generated API reference, TOC manifest, framework guides and package graph are all regenerated
  and versioned.
- Docs-system verification: a **canonical capability registry** (`docs/reference/capabilities.ts`)
  as the single feature → package → symbol mapping, so no page can reference a symbol that is
  neither shipped nor classified.
- A **diagnostics coverage sweep** of every `throw`, `console.warn/error/info`, validator, type
  guard and swallowing `catch` across `packages/*/src` and `packages/adapters/*/src`, which is what
  the new diagnostics system was built against.

#### Release gates

An entire docs verification system (`scripts/docs/`, 18 modules) is new. `docs:release-gate` runs
~17 gates sequentially and blocks the release on any failure: API classification, source ⇄ dist ⇄
docs drift, snippet-import validity, example completeness, export→destination coverage, dependency
correctness, invented symbols, internal symbols, terminology, generated-table well-formedness,
information architecture and page contracts, generated-file freshness, links/titles/sitemap, and
package-name verification. Two distinct documentation contracts are now checked separately, because
neither implies the other: *zero import drift* (the imports resolve) and *examples complete* (the
example is copy-pasteable).

#### Examples

- New `examples/diagnostics/core` consumer fixture exercising the diagnostics surface.
- New Astro integration fixtures covering the bootstrap contract, config discovery, the readout
  contract and integration wiring.

#### Reliability

- The `data-theme-selection-mode` / `data-theme-selection-family` attributes are now kept in sync
  with the live selection. They had been frozen at the value the page loaded with — pick `system`,
  then `dark`, and `<html>` still advertised `system` for the rest of the session, in every
  framework. They are written in the same batch as the resolved attributes, so the two can never be
  observed disagreeing.
- `createDevToolsPlugin`'s entry now conforms to the documented devtools contract. It had only
  `getState()`, so the consumer loop the docs actually show —
  `for (const i of window.__THEME_KIT_DEVTOOLS__ ?? []) i.getEntries()` — threw a `TypeError` on any
  page that installed core's plugin rather than the inspector's.
- `computeFingerprint` moved into core and the four SSR integrations re-export it. Astro, Next, Nuxt
  and Remix each carried a private byte-identical copy that nothing compared, so editing one would
  have silently broken cross-framework persistence in exactly one framework. Format and emitted
  values are unchanged, so no persisted selection is invalidated.
- New test suites: diagnostics, app-config, bootstrap-plan, family-normalisation, sync-first-root,
  vite-plugin, Astro integration/readout/config-discovery/bootstrap-contract, Remix blocking-script,
  Svelte scrollbar options, and per-adapter Vue tests.

## 1.0.0 — 2026-08-24

The initial public release of Theme Kit — a framework-agnostic theming runtime with semantic tokens,
theme families, SSR-safe hydration, smooth transitions, scoped themes, and ecosystem adapters.

Available on [npm](https://www.npmjs.com/org/theme-kit) · [GitHub](https://github.com/themekit-dev/theme-kit) · [Documentation](https://theme-kit-dev.vercel.app)

### Highlights

- **Core runtime** (`@theme-kit/core`): theme store, selection controller, system-mode binding,
  CSS-variable binding, DOM binding, transition engine, history, snapshots, persistence, scheduling,
  broadcast (cross-tab sync), plugin system, and adapter registry.
- **8 frameworks**: React, Next.js, Vue 3, Nuxt 3, Svelte 5, SolidJS, Angular, Astro, Remix, and
  Web Components — each with a native `ThemeProvider`, `useTheme`, and framework-specific hooks.
- **SSR-first zero-flash**: fingerprint-guarded cookie persistence, server-side theme resolution,
  blocking bootstrap script, and `@media (prefers-color-scheme: dark)` fallback — the theme is
  applied before the first paint in every framework.
- **Theme families**: independent palette and mode switching — `mint-light`, `mint-dark`,
  `plum-light`, `plum-dark`, all from one `setMode` / `setFamily` API.
- **ThemeScope**: isolate a subtree with its own theme, family, mode, local theme definitions, and
  transition config — works in all 7 frameworks.
- **ThemeScrollbar**: a theme-colored overlay scrollbar with the same physics as the native scrollbar,
  no layout shift, and pre-paint bootstrap for zero flash.
- **Scheduling**: sunrise/sunset-based theme switching using NOAA solar math, with
  `createThemeSchedule` / `useThemeSchedule` in every framework.
- **9 adapters**: MUI, Chakra UI, Ant Design, Mantine, shadcn/ui, Bootstrap, DaisyUI, Open Props,
  and UnoCSS — each with a factory function and framework hooks.
- **CLI** (`theme-kit`): generate, validate, migrate, inspect, and export themes.
- **Tailwind CSS v4 plugin**: `@theme-kit/tailwind` maps semantic tokens to Tailwind theme variables.
- **DevTools**: runtime inspector for debugging theme state, transitions, and adapter activity.

### Breaking changes

No prior releases — this is the first published version.

### What's new compared to the pre-release phases

- Coherent 1.0.0 version across all 24 packages.
- Frozen public API (24 packages, 0 source⇄dist⇄docs drift, verified via `scripts/release/export-inventory.mjs`).
- All lifecycle tests pass (install → theme update → cleanup → dispose-after-destroy for every
  adapter).
- Consumers verified via real tarball installs (vanilla ESM/CJS, React typecheck+SSR, CLI 19 tests).
- Browser-tested: zero-flash, system mode, persisted dark/light, rapid switching, reduced motion,
  scrollbar overlay, keyboard a11y.
- Nuxt SSR parity: 18 tests cover cookie parsing, fingerprint staleness, resolution, and bootstrap
  script execution against a fake DOM.
- Adapter lifecycle: 14 new lifecycle tests across 7 adapters.
- Code token system: `tokens.code` as an opt-in semantic namespace, verified with 6 tests.
- 3 zero-flash bugs fixed during browser testing (Next blocking script, React provider system-mode
  guard, Next layout mode pass-through).
- 1 publish-blocking fix (`@theme-kit/adapters` was `private: true` while 8 packages depended on it).
- 1 CLI version drift fix (`packages/cli/src/version.ts` was `0.0.1` vs `package.json` `1.0.0`).
- 1 bin path format fix (npm 11 drops `./`-prefixed bin paths).
- 1 docs generation fix (TypeAlias kind was wrong — all type aliases silently dropped from API reference).
- 1 adapter lifecycle fix (mui/chakra/antd `uninstall()` didn't reset the snapshot).
- Metadata hygiene: description/repository/homepage/bugs/keywords/engines/publishConfig for all packages.
- Audit infrastructure: 623 checks per package, 0 failures, runnable via `pnpm release:audit`.
- Consumer fixture: `node release-test/run.mjs` packs → installs from tarballs → runs all smoke tests.