/**
 * Release history for the Theme Kit docs changelog.
 *
 * Sources of truth, in order of preference:
 *   1. `<repo>/CHANGELOG.md` and the per-package `CHANGELOG.md` files (shipped)
 *   2. The lockstep release commits in git history (release dates)
 *   3. `<repo>/.changeset/*.md` (proposed, not yet released)
 *
 * Release dates come from the release commits, e.g.
 *   git show -s --format=%ci <release-commit-sha>
 * Do not approximate them — the changelog is a trust surface.
 *
 * When a new version is published, add a `Release` entry here and clear the
 * matching items from `proposed`. Keep `CURRENT_RELEASE` and `LAST_UPDATED`
 * in sync with `lib/version.ts`.
 */

import { PKG_VERSION } from "./version";

export const CURRENT_RELEASE = PKG_VERSION;
export const LAST_UPDATED = "2026-09-24";

export type ChangeKind = "major" | "minor" | "patch";

export type Release = {
  version: string;
  date: string;
  kind: ChangeKind;
  /** One-line summary used in lists and metadata. */
  summary: string;
  /** User-visible changes, grouped by area. */
  changes: { area: string; text: string }[];
  /** Packages whose public surface changed. */
  packages: string[];
  /** Whether upgrading can change behavior. */
  breaking: boolean;
  /** Where to go if the release affects your app. */
  migrationNote?: string;
};

export const releases: Release[] = [
  {
    version: "2.0.0",
    date: "2026-09-24",
    kind: "major",
    summary:
      "Enforce the dependency-isolation contract — adapter framework bindings moved to per-framework subpaths, removing 93 public exports across 12 packages. Adds a diagnostics system and a native React-free Astro runtime.",
    changes: [
      {
        area: "Breaking — adapters",
        text: "The adapter packages (`shadcn`, `bootstrap`, `daisyui`, `open-props`) no longer export their hook from the package root, and no longer depend on `@theme-kit/react`. Each gains one subpath per framework: `./react`, `./vue`, `./svelte`, `./solid`, `./angular`. A 1.x `import { useShadcnTheme } from \"@theme-kit/shadcn\"` must become `from \"@theme-kit/shadcn/react\"`.",
      },
      {
        area: "Breaking — signatures",
        text: "`useShadcnTheme` / `useBootstrapTheme` / `useDaisyTheme` / `useOpenPropsTheme` now take the runtime as a **required** first argument, with the options object second. The runtime is no longer read from framework context, which is what let the adapter drop its framework dependency. An existing 1.x call passes an options object where a runtime is expected — a type error, not a silent deprecation.",
      },
      {
        area: "Breaking — frameworks",
        text: "`@theme-kit/vue`, `svelte`, `solid` and `angular` drop the adapter bindings from their roots (`useShadcnTheme`-style composables plus `UseAdapterOptions`; Angular's `injectShadcnTheme`-style injectables plus `InjectAdapterOptions`); `nuxt` drops the four composables; `next/client` and `remix` drop the four adapter providers and their hooks.",
      },
      {
        area: "Breaking — Astro",
        text: "`@theme-kit/astro`'s root is now framework-neutral: the React surface moved behind the opt-in `@theme-kit/astro/client` subpath, and the `./adapters` entry point was removed. The root gains the native browser API (`getThemeController()`, `ThemeToggle.astro`, `@theme-kit/astro/runtime`), so basic Astro theming needs no React at all.",
      },
      {
        area: "Why",
        text: "The dependency-isolation contract permits an adapter to depend only on `core`/`adapters`, and a framework package only on `core`/`web` (or its own renderer). Both were violated — the framework packages hard-depended on eight to eleven adapters each, which is why `@theme-kit/vue` installed React. A deprecated alias cannot restore the old paths without re-adding the forbidden edges, so there is no shim.",
      },
      {
        area: "Diagnostics",
        text: "New diagnostics system in `@theme-kit/core`: `createDiagnostic`, `formatDiagnostic`, `emitDiagnostic`, `resetDiagnosticEmission`, `isThemeMode`, and the `ThemeDiagnostic` types. `ThemeError` was dead code — nothing ever threw it — and is now the error type the runtime actually throws, carrying the diagnostic's code and context.",
      },
      {
        area: "Framework improvements",
        text: "Astro gains a native React-free runtime with an idempotent controller shared by the provider, a plain `<script>` and any React island, ending the island hydration mismatch and the flickering readout. Nuxt re-exports its four most-used composables from the root. Remix reads the persisted selection from cookies when `initial` is omitted instead of overwriting the pre-paint script's work. Angular's pre-paint script now emits the canonical `--theme-color-*` names (it had been writing `--theme-background`, so the stylesheet was inert).",
      },
      {
        area: "Reliability",
        text: "`data-theme-selection-mode` / `data-theme-selection-family` are now kept in sync with the live selection — they had been frozen at the value the page loaded with, in every framework. `createDevToolsPlugin`'s entry now implements the documented contract (its missing `getEntries()` made the documented consumer loop throw). `computeFingerprint` moved into core so the four SSR integrations can no longer drift apart silently.",
      },
      {
        area: "Behaviour",
        text: "`setFamily()` ignores an unregistered family instead of applying it and degrading to `themes[0]`. A `\"system\"` selection can no longer be expressed by inlining resolved variables plus a dark media block — that combination never worked, and `systemModeCSSTemplate` is the supported mechanism. `createThemeRuntime()` no longer requires an argument.",
      },
      {
        area: "Docs",
        text: 'New "Migrating from 1.x to 2.0" guide covering every verified break, a curated root changelog with the breaking changes up front, and a regenerated API reference. The docs verification system (`scripts/docs/`) adds ~17 release gates including invented-symbol, internal-symbol, terminology, table and page-contract audits.',
      },
    ],
    packages: [
      "@theme-kit/angular",
      "@theme-kit/astro",
      "@theme-kit/bootstrap",
      "@theme-kit/daisyui",
      "@theme-kit/next",
      "@theme-kit/nuxt",
      "@theme-kit/open-props",
      "@theme-kit/remix",
      "@theme-kit/shadcn",
      "@theme-kit/solid",
      "@theme-kit/svelte",
      "@theme-kit/vue",
    ],
    breaking: true,
    migrationNote:
      "Twelve packages break their public API: adapter bindings moved to per-framework subpaths and `useXTheme()` now requires the runtime as its first argument. Read [Migrating from 1.x to 2.0](/migrating-to-2). Packages that do not touch an adapter binding or an Astro React import need only a version bump.",
  },
  {
    version: "1.3.0",
    date: "2026-09-08",
    kind: "minor",
    summary:
      "Optional optimized CSR bootstrap for React, pre-paint scrollbar injection via the Vite plugin, and a Vue persistence fix.",
    changes: [
      {
        area: "React",
        text: 'Add `createThemeRoot()` — an optional client-only root bootstrap that lets Theme Kit own the initial React root commit for CSR apps with a measured first-render scheduling gap. Composition stays in the app: the `render({ runtime })` callback owns the whole provider tree. `ThemeProvider` remains the normal React integration and never calls `flushSync` itself.',
      },
      {
        area: "Core / Vite",
        text: 'Add a `scrollbar` option to the Vite plugin to inject the pre-paint scrollbar bootstrap (`createPrePaintScrollbarScript`) head-prepend, so the custom overlay is the only scrollbar from the first frame.',
      },
      {
        area: "React / Vue / Solid / Svelte / Angular",
        text: "Wire scrollbar pre-paint on the `ThemeScrollbar` mount (idempotent — no-ops when the plugin or SSR adapter already emitted it).",
      },
      {
        area: "Vue",
        text: "Fix the selected theme not persisting to localStorage.",
      },
      {
        area: "Docs",
        text: 'Add "Which React setup should I use?", an "Optimized CSR bootstrap" section with architecture diagrams and multi-provider composition, and regenerate the API reference (now including `createThemeRoot`).',
      },
    ],
    packages: [
      "@theme-kit/core",
      "@theme-kit/react",
      "@theme-kit/vue",
      "@theme-kit/svelte",
      "@theme-kit/solid",
      "@theme-kit/angular",
    ],
    breaking: false,
    migrationNote:
      "No breaking changes. React apps with a slow first render can opt into `createThemeRoot()`; existing `ThemeProvider` setups need no changes.",
  },
  {
    version: "1.2.2",
    date: "2026-08-27",
    kind: "patch",
    summary:
      "Fix scrollbar overlay clipping to host rounded corners, and update framework packages and core internals.",
    changes: [
      {
        area: "Core / frameworks",
        text: "Fix scrollbar overlay clipping to host rounded corners; update framework packages (react/solid/svelte/vue) and core internals.",
      },
    ],
    packages: [
      "@theme-kit/core",
      "@theme-kit/react",
      "@theme-kit/solid",
      "@theme-kit/svelte",
      "@theme-kit/vue",
    ],
    breaking: false,
    migrationNote: "Patch upgrade — no migration steps required.",
  },
  {
    version: "1.0.0",
    date: "2026-08-24",
    kind: "major",
    summary:
      "The first stable release: semantic tokens, theme families, SSR-safe zero-flash hydration, transitions, scoped themes, persistence, scheduling, a CLI, and the framework/library adapters.",
    changes: [
      {
        area: "Core runtime",
        text: "Theme store, selection controller, system-mode binding, CSS-variable binding, DOM binding, transition engine, history, snapshots, persistence, scheduling, broadcast (cross-tab sync), plugin system, and adapter registry.",
      },
      {
        area: "Frameworks",
        text: "React, Next.js, Vue 3, Nuxt 3, Svelte 5, SolidJS, Angular, Astro, Remix, and Web Components — each with a native `ThemeProvider`, `useTheme`, and framework-specific hooks.",
      },
      {
        area: "SSR-first zero-flash",
        text: "Fingerprint-guarded cookie persistence, server-side theme resolution, blocking bootstrap script, and `@media (prefers-color-scheme: dark)` fallback — the theme is applied before the first paint in every framework.",
      },
      {
        area: "Theme families",
        text: "Independent palette and mode switching — `mint-light`, `mint-dark`, `plum-light`, `plum-dark`, all from one `setFamily` / `setMode` API.",
      },
      {
        area: "ThemeScope",
        text: "Isolate a subtree with its own theme, family, mode, local theme definitions, and transition config — works in every framework.",
      },
      {
        area: "ThemeScrollbar",
        text: "A theme-colored overlay scrollbar with the same physics as the native scrollbar, no layout shift, and pre-paint bootstrap for zero-flash.",
      },
      {
        area: "Scheduling",
        text: "Sunrise/sunset-based theme switching using NOAA solar math, with `createThemeSchedule` / `useThemeSchedule` in every framework.",
      },
      {
        area: "Adapters",
        text: "MUI, Chakra UI, Ant Design, Mantine, shadcn/ui, Bootstrap, DaisyUI, Open Props, and UnoCSS — each with a factory function and framework hooks.",
      },
      {
        area: "Tooling",
        text: "CLI (`theme-kit`): generate, validate, migrate, inspect, and export themes. Tailwind CSS v4 plugin maps semantic tokens to Tailwind theme variables. DevTools runtime inspector for theme state, transitions, and adapter activity.",
      },
      {
        area: "generateTheme",
        text: "`generateTheme` now produces modern, branded, accessible themes. `primaryForeground` is derived from the seed's WCAG relative luminance instead of being hardcoded white, so light/brand colors get a near-black ink instead of unreadable white-on-color text. Both modes emit the complete semantic palette plus `radius.lg` and `meta.order`. The CLI `generate` command and the Theme Studio / playground generators pick this up automatically.",
      },
    ],
    packages: ["all 24 packages"],
    breaking: true,
    migrationNote:
      "No prior releases — this is the first published version. Nothing to migrate from.",
  },
];

/**
 * Changesets that exist in the repo but have not been folded into a release
 * yet. Surfaced separately so the changelog never presents proposed work as
 * shipped behavior.
 */
export type ProposedChange = {
  package: string;
  kind: ChangeKind;
  text: string;
};

export const proposed: ProposedChange[] = [];

export const kindLabel: Record<ChangeKind, string> = {
  major: "Major",
  minor: "Minor",
  patch: "Patch",
};
