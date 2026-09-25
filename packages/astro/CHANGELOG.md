# @theme-kit/astro

## 2.0.0

### Major Changes

- Split the Astro package into a framework-neutral root and an opt-in React
  client entry.

  **This is a breaking change. Please read the migration note.**

  The root entry used to be React-first: it re-exported `ThemeProviderClient`,
  `ThemeScope`, `ThemeScrollbar`, `ThemeInspector`, and the whole React hook set
  (`useTheme`, `useThemeMode`, `useThemeFamily`, `useToggleTheme`,
  `useThemeRuntime`, …), and it depended on `@theme-kit/react` plus nine adapter
  packages. That made the root entry unusable from a browser `<script>` — it
  imports `node:url` and `@theme-kit/core/config` through `themeKit()` — and it
  violated the dependency-isolation contract, which permits `@theme-kit/astro` to
  depend only on `core` and `web`.

  The React surface now lives behind the opt-in `@theme-kit/astro/client` subpath,
  which is the only entry that depends on React. The root entry is
  framework-neutral and gains the native, React-free browser API:

  - `getThemeController()` / `createThemeController()` — one shared runtime per
    document, reachable from a plain `<script>` with no hydration.
  - `ThemeToggle.astro` — a real `<button>`, no island, no `client:load`.
  - `@theme-kit/astro/runtime` — a browser-safe entry (the root entry cannot be
    imported from a `<script>`).
  - `ThemeKitScrollbar` / `ThemeKitInspector` are re-exported from
    `@theme-kit/web` instead of from React.

  The `./adapters` subpath is **removed**; the adapter bindings now live on each
  adapter package's own framework subpath (see the dependency-isolation changeset).

  ### Migration

  ```ts
  // before
  import { ThemeProviderClient, ThemeScope, useTheme } from "@theme-kit/astro";
  import { useShadcnTheme } from "@theme-kit/astro/adapters";

  // after
  import {
    ThemeProviderClient,
    ThemeScope,
    useTheme,
  } from "@theme-kit/astro/client";
  import { useShadcnTheme } from "@theme-kit/shadcn/react";
  ```

  Anything that renders inside Astro without React should now use
  `ThemeToggle.astro` or `getThemeController()` instead of importing the hooks —
  that path needs no client framework at all.

  The removed root exports cannot be re-exported from the root without restoring
  the `@theme-kit/react` dependency, so there is no shim that keeps the old import
  paths working. That is why this is a **major**.

### Minor Changes

- Make the Astro pre-paint path correct in the two cases where it silently
  disagreed with itself, and keep the CSS-only path working with JavaScript
  blocked.

  `provider.astro` had a `darkStyle` guard of `initial.selection.mode === "system"`,
  but the call above it omitted the `mode` key whenever the mode _was_ `"system"`.
  `resolveInitialTheme` therefore never saw it, so the guard was dead code and the
  dark fallback stylesheet was never emitted. The component also passed no `mode`
  to `createBlockingScript`, so the script fell back to `"system"` while the server
  had painted the `defaultTheme` mode — the same script/runtime disagreement this
  release fixes in core, reachable from the component the docs tell you to import.

  Both are fixed: the resolved mode is forwarded to the script, and a `"system"`
  selection now emits `systemModeCSSTemplate` (one `prefers-color-scheme` block per
  scheme) instead of inlining the light variables and appending a dark block. That
  combination cannot work — an inline `style` on `<html>` outranks any stylesheet
  rule — and it measurably painted the light canvas for an OS-dark visitor with
  scripts blocked. With the fix, and with page scripts disabled, an OS-dark visitor
  gets `rgb(2, 6, 23)` and an OS-light visitor still gets `rgb(248, 250, 252)`.

  The integration's injected `"system"` stylesheet is now idempotent: it is
  identified and reused across `<ClientRouter />` navigations rather than appended
  again on every swap. Verified by driving a two-page `<ClientRouter />` app and
  sampling every frame — the theme state survives the swap, and the style count is
  `1` before and after.

  `systemModeCSSTemplate` and `darkModeCSSTemplate` are now re-exported from
  `@theme-kit/core` rather than defined locally, so there is one implementation
  instead of three copies drifting apart (Angular and Nuxt apply the same rule).

- Give Astro a native, React-free client surface, and make the configuration
  declared once actually reach every consumer.

  **Basic Astro theming no longer requires React.** The package gains three
  things, and React stays an optional peer pulled in only by an island:

  - `ThemeToggle.astro` — a real `<button>` that drives the application-wide
    runtime. No island, no `client:load`, no per-page `initialMode` /
    `initialFamily`. `showMode` makes its text the visitor's live mode.
  - `getThemeController()` / `createThemeController()` — the framework-neutral
    browser API. Not a hook: a plain object with `getMode()`, `setMode()`,
    `setFamily()`, `toggleTheme()` and `subscribe()`. `getThemeController()` is
    idempotent, so the provider, the toggle, a hand-written `<script>` and a React
    island all share **one** runtime instead of several fighting over `<html>`.
  - `@theme-kit/astro/runtime` — a browser-safe entry for the two above. The root
    entry also exports `themeKit()`, which reads `theme.config.ts` from disk and
    imports `node:url` and `@theme-kit/core/config`; importing it from a `<script>`
    failed the build with
    `"fileURLToPath" is not exported by "__vite-browser-external"`.

  **One declaration, every consumer.** Two disagreements are fixed:

  - `provider.astro` now publishes the configuration on `globalThis` from its
    frontmatter. `themeKit()` transported it to the browser by injecting
    `window.__THEME_KIT_CONFIG__` into `<head>`, but `injectScript` emits a
    `<script>` tag, which does nothing during SSR — so an island rendered its
    _server_ markup from the built-in themes and its _hydrated_ markup from the
    real registry. React reported a text mismatch (error #418) and re-rendered the
    island on every load.
  - `ThemeProviderClient` now reads `initialMode` / `initialFamily` from the
    transported configuration. Its own reader dropped them, which is why the props
    had to be restated on every page — a second source of truth for a decision
    `theme.config.ts` had already made once. When the two drifted (the shipped
    example hard-coded `initialMode="light"` against a config of `"system"`) the
    panel's text visibly fluctuated on every reload. The props still win when
    passed, so a deliberate per-island override stays possible.

  `ThemeProviderClient` also adopts an already-installed runtime rather than
  creating a second one, so a page can mix native controls and React islands.

  Measured on the built example, sampling every text mutation of the readout
  elements from document-start: before, the text was wrong for 44–54 ms and then
  corrected (and with a `"system"` config, React error #418 re-rendered the
  island). After, there is no correction event at all, for `light`, `dark` and
  `system`, on both the native page and the island page.

### Patch Changes

- Never let the selection name a theme family that is not in the registry.

  A family is an invariant, not free-form text. `resolveThemeName` filters the
  registry by family and falls back to `themes[0]` when nothing matches, so a
  selection carrying an unregistered family resolves to the _first_ theme — while
  `data-theme-selection-family` (and every `data-tk-readout="family"`) keeps
  naming the family that is not on screen. The readout then contradicts
  `data-theme-family` / `data-theme`, and the browser disagrees with the server,
  which is a visible correction on load. On the Astro example with an `oat`
  family selected, the readout alternated between the applied family and a stale
  one across reloads.

  A persisted family is the usual source: a cookie or `localStorage` entry
  written before the application changed its family set. Nothing validated it,
  because a family that was once registered and has since been removed is
  indistinguishable from one that never existed.

  Three paths in `@theme-kit/core` now normalise through a single `@internal`
  `normalizeThemeFamily` helper (built on `getThemeFamilies`), which returns a
  registered family or the fallback theme's own family:

  - `resolveSelection` — the SSR/server path, for a persisted selection and for
    `initialFamily` alike. `??` only catches `null`/`undefined`, so an
    `initialFamily` of `""` (what some cookie readers yield for a missing cookie)
    previously survived into the selection too.
  - `createThemeSelectionController`'s initial state, so the client starts from a
    family the registry actually has.
  - The inline pre-paint script. `ThemeBootstrapPlan` gains a `families` list
    taken from the same registry the CSS map was built from, and the generated
    script rejects a persisted family that is not in it. The two are therefore
    either both present or both absent, so the script can never accept a family
    the map has no variables for.

  **Behaviour change, please read.** `setFamily()` now ignores a family the
  registry does not have, instead of applying it and degrading to `themes[0]`. A
  caller that passes an unregistered family has a bug; a no-op keeps the
  selection honest and the readout shows it, whereas switching the visitor to a
  _different_ family than the one requested would hide it.

  Astro is the only framework that hand-assembles its bootstrap plan, so it now
  threads `families` through `buildThemeBootstrapPayload` →
  `createBlockingScript` → `integration.ts` / `provider.astro`. Every other
  framework calls the shared serializer and inherits the guard; `@theme-kit/web`
  does too.

  Verified: 449 core tests pass, including 13 new in
  `family-normalization.test.ts`. The Astro readout regression gate runs 12/12,
  and its stale-family row was confirmed by fault injection — restoring the
  unguarded selection fails the gate with
  `readout family="mint" disagrees with data-theme-family="oat"`.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.4.0
  - @theme-kit/web@1.4.0

## 1.3.0

### Minor Changes

- React: add `createThemeRoot()` — an optional client-only root bootstrap that lets Theme Kit own the initial React root commit (synchronous first commit via the framework-documented `flushSync` boundary) for CSR applications with a measured first-render scheduling gap. Composition stays in the app: the `render({ runtime })` callback owns the whole provider tree. `ThemeProvider` remains the normal React integration and never calls `flushSync` itself.

  Core: add a `scrollbar` option to the Vite plugin to inject the pre-paint scrollbar bootstrap (`createPrePaintScrollbarScript`) head-prepend, so the custom overlay is the only scrollbar from the first frame.

  React/Vue/Solid/Svelte/Angular: wire scrollbar pre-paint on the `ThemeScrollbar` mount (idempotent — no-ops when the plugin/SSR adapter already emitted it).

  Vue: fix the selected theme not persisting to localStorage.

  Docs: add "Which React setup should I use?", an "Optimized CSR bootstrap" section with architecture diagrams and multi-provider composition, and regenerate the API reference (now including `createThemeRoot`).

### Patch Changes

- Updated dependencies
  - @theme-kit/react@1.3.0
  - @theme-kit/core@1.3.0
  - @theme-kit/mui@1.3.0
  - @theme-kit/shadcn@1.3.0
  - @theme-kit/chakra@1.3.0
  - @theme-kit/antd@1.3.0
  - @theme-kit/bootstrap@1.3.0
  - @theme-kit/daisyui@1.3.0
  - @theme-kit/open-props@1.3.0
  - @theme-kit/mantine@1.3.0
  - @theme-kit/web@1.3.0

## 1.2.2

### Patch Changes

- Updated dependencies
  - @theme-kit/core@1.2.2
  - @theme-kit/react@1.2.2
  - @theme-kit/antd@1.2.2
  - @theme-kit/bootstrap@1.2.2
  - @theme-kit/chakra@1.2.2
  - @theme-kit/daisyui@1.2.2
  - @theme-kit/mui@1.2.2
  - @theme-kit/open-props@1.2.2
  - @theme-kit/shadcn@1.2.2
  - @theme-kit/mantine@1.2.2
  - @theme-kit/web@1.2.2

## 1.0.0

### Major Changes

- Release Theme Kit 1.0.0 — the first stable release of the framework-agnostic
  theming runtime. Semantic tokens, theme families, SSR-safe hydration with zero
  flash, smooth transitions, scoped themes, persistence and history,
  multi-window sync, scheduling, a custom scrollbar, a CLI, and adapters for
  React, Next.js, Vue, Nuxt, Svelte, Solid, Angular, Astro, Remix, Tailwind, and
  the major UI libraries (shadcn/ui, Bootstrap, daisyUI, Open Props, Material UI,
  Chakra UI, Ant Design, Mantine, UnoCSS).

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.0.0
  - @theme-kit/react@1.0.0
  - @theme-kit/antd@1.0.0
  - @theme-kit/bootstrap@1.0.0
  - @theme-kit/chakra@1.0.0
  - @theme-kit/daisyui@1.0.0
  - @theme-kit/mantine@1.0.0
  - @theme-kit/mui@1.0.0
  - @theme-kit/open-props@1.0.0
  - @theme-kit/shadcn@1.0.0
