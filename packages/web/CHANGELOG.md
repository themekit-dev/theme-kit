# @theme-kit/web

## 1.4.0

### Minor Changes

- Resolve the pre-paint script's fallback mode from the same source as the client
  runtime, so the two cannot disagree.

  `buildBootstrapPlan` hardcoded `fallbackMode = initialMode ?? "system"`, while
  `resolveInitialTheme` defaults `mode` to the fallback theme's own mode. For any
  caller that omitted the mode the two therefore resolved _different_ themes: on
  an OS-dark machine the script painted the dark theme and the runtime corrected
  it to light — a measured flash of up to ~1.5 s on the shipped examples.

  The script's fallback is now derived from `resolveInitialTheme` itself, which is
  exactly the value the runtime adopts from its own call. `"system"` is now opt-in
  rather than the silent default, and reaching it requires saying so to both
  halves (`themeKitVitePlugin({ initialMode })` and the provider's `initialMode`).

  Also in this release:

  - Add `systemModeCSSTemplate(light, dark)` — the CSS-only resolution of a
    `"system"` selection. Emits one `prefers-color-scheme` block per scheme and
    expects no inline variables. See the note below for why the existing
    `darkModeCSSTemplate` cannot be combined with a server-rendered inline `style`.
  - `createThemeRuntime()` no longer requires an argument. Every other factory in
    the package defaults its options to `{}`; this one threw, so
    `createThemeRuntime()` — the form the docs show — failed at runtime.
  - A falsy `family` (`""`, which a cookie or a DOM attribute can produce) is
    normalised to the fallback's family. Previously `""` survived into the
    selection and every lookup degraded to `themes[0]`, so a `dark` selection
    silently resolved to the _light_ theme.
  - `resolveSelectedTheme` now falls back to a theme of the requested mode before
    giving up on the mode entirely.

  **Behaviour change, please read.** A `"system"` selection can no longer be
  expressed by inlining the resolved variables plus a dark media block: an inline
  `style` on `<html>` outranks every stylesheet rule, so the dark block never
  applies and an OS-dark visitor keeps the light colors. Measured on a production
  build with scripts blocked, that combination painted `rgb(248, 250, 252)`; the
  same variables emitted as a `<style>` element with both schemes painted
  `rgb(2, 6, 23)`. `systemModeCSSTemplate` is the supported way to do this. Only
  `"system"` may use media queries — a concrete mode must be a plain `:root` rule,
  or it would follow the OS when the script is blocked.

  Web: `theme-kit-provider` gains `initial-mode` and `initial-family` attributes.
  The custom element previously could not express a mode at all, so
  `initialMode` was unreachable from HTML.

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.4.0

## 1.3.0

### Minor Changes

- React: add `createThemeRoot()` — an optional client-only root bootstrap that lets Theme Kit own the initial React root commit (synchronous first commit via the framework-documented `flushSync` boundary) for CSR applications with a measured first-render scheduling gap. Composition stays in the app: the `render({ runtime })` callback owns the whole provider tree. `ThemeProvider` remains the normal React integration and never calls `flushSync` itself.

  Core: add a `scrollbar` option to the Vite plugin to inject the pre-paint scrollbar bootstrap (`createPrePaintScrollbarScript`) head-prepend, so the custom overlay is the only scrollbar from the first frame.

  React/Vue/Solid/Svelte/Angular: wire scrollbar pre-paint on the `ThemeScrollbar` mount (idempotent — no-ops when the plugin/SSR adapter already emitted it).

  Vue: fix the selected theme not persisting to localStorage.

  Docs: add "Which React setup should I use?", an "Optimized CSR bootstrap" section with architecture diagrams and multi-provider composition, and regenerate the API reference (now including `createThemeRoot`).

### Patch Changes

- Updated dependencies
  - @theme-kit/core@1.3.0

## 1.2.2

### Patch Changes

- Updated dependencies
  - @theme-kit/core@1.2.2

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
  - @theme-kit/core@1.0.0
