# @theme-kit/core

## 1.4.0

### Minor Changes

- Add `computeFingerprint` to `@theme-kit/core`.

  The fingerprint is the cache-busting half of the zero-flash cookie contract
  (`theme-mode` / `theme-family` / `theme-fingerprint`): it is written on every
  SSR response and compared on the next request, so a stale value invalidates a
  persisted selection after the theme registry changes. Because it is part of that
  contract, it has to be **byte-identical** across every SSR integration.

  It was not. Astro, Next, Nuxt and Remix each carried a private, byte-identical
  copy. Nothing compared them, so editing one would have silently broken
  cross-framework persistence — a visitor's saved theme would stop being honoured
  in exactly one framework, with no error anywhere.

  The implementation now lives in core and the four integrations re-export it.
  This is an **additive** change: the format and the emitted values are unchanged
  (verified against the pre-refactor output for all four integrations, including
  the built HTML), so no persisted selection is invalidated. `@theme-kit/astro`
  and `@theme-kit/nuxt` still export `computeFingerprint` from their public entry
  with the same signature; Next and Remix keep it internal, as before.

- Make core's `createDevToolsPlugin` entry conform to the documented devtools contract.

  There are two public functions named `createDevToolsPlugin` — core's lightweight
  bridge, and the inspector in `@theme-kit/devtools`. Both register their entry on
  the same `window.__THEME_KIT_DEVTOOLS__` set, and the docs declare that set's
  member shape as:

  ```ts
  Set<{
    getState(): unknown;
    getEntries(): unknown[];
    getPerformance(): unknown[];
  }>;
  ```

  Core's entry only had `getState()`. So the consumer loop the docs actually show —
  `for (const inspector of window.__THEME_KIT_DEVTOOLS__ ?? []) inspector.getEntries()` —
  threw `TypeError: inspector.getEntries is not a function` on any page that
  installed core's plugin rather than the inspector one. Verified by running that
  exact loop against the pre-fix entry shape.

  Core's plugin records no entries and no performance samples, so the two added
  methods return empty arrays; the point is that every member of the set is now
  callable through the declared interface without a type check. With both plugins
  installed on one runtime, both entries now conform (verified).

  No declared type changed and no export was added or removed, so this is
  source-compatible. The runtime behaviour of the entry is unchanged apart from
  the two new methods.

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

- Keep `data-theme-selection-mode` / `data-theme-selection-family` in sync with
  the live selection.

  The pre-paint bootstrap and the SSR layouts publish the visitor's _selection_
  under those two attributes, and nothing maintained them afterwards. After the
  first client-side change the document advertised the selection the page had
  loaded with: pick `system`, then `dark`, and `<html>` still said
  `data-theme-selection-mode="system"` — for the rest of the session, on every
  framework.

  The resolved attributes cannot stand in for them. `data-theme-mode` and
  `data-theme` describe the theme that was _applied_, and a `"system"` selection is
  resolved to `"light"`/`"dark"` before either is written, so the choice is
  unrecoverable from them. Anything reading the selection — CSS,
  `readBootstrapState`, a framework-free control — was reading the state of the
  page as it was loaded.

  `createDOMBinding` now takes an optional `selection` source and mirrors it onto
  both attributes, in the same write batch as the resolved attributes so the two
  can never be observed disagreeing. It subscribes to the selection _as well as_
  the store: a selection change that resolves to the same theme
  (`setMode("light")` while the OS preference is already light) emits no store
  change, so a store-only binding would never run. `createThemeRuntime` and
  `ThemeKit` pass their selection controller in; a binding created without one
  writes neither attribute, exactly as before.

  Verified in the browser: after `setMode("dark")` the attribute reads `dark`, and
  it survives a reload. All 436 core tests pass.

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

## 1.3.0

### Minor Changes

- React: add `createThemeRoot()` — an optional client-only root bootstrap that lets Theme Kit own the initial React root commit (synchronous first commit via the framework-documented `flushSync` boundary) for CSR applications with a measured first-render scheduling gap. Composition stays in the app: the `render({ runtime })` callback owns the whole provider tree. `ThemeProvider` remains the normal React integration and never calls `flushSync` itself.

  Core: add a `scrollbar` option to the Vite plugin to inject the pre-paint scrollbar bootstrap (`createPrePaintScrollbarScript`) head-prepend, so the custom overlay is the only scrollbar from the first frame.

  React/Vue/Solid/Svelte/Angular: wire scrollbar pre-paint on the `ThemeScrollbar` mount (idempotent — no-ops when the plugin/SSR adapter already emitted it).

  Vue: fix the selected theme not persisting to localStorage.

  Docs: add "Which React setup should I use?", an "Optimized CSR bootstrap" section with architecture diagrams and multi-provider composition, and regenerate the API reference (now including `createThemeRoot`).

## 1.2.2

### Patch Changes

- Fix scrollbar overlay clipping to host rounded corners; update framework packages (react/solid/svelte/vue) and core internals.

## 1.0.0

### Major Changes

- Release Theme Kit 1.0.0 — the first stable release of the framework-agnostic
  theming runtime. Semantic tokens, theme families, SSR-safe hydration with zero
  flash, smooth transitions, scoped themes, persistence and history,
  multi-window sync, scheduling, a custom scrollbar, a CLI, and adapters for
  React, Next.js, Vue, Nuxt, Svelte, Solid, Angular, Astro, Remix, Tailwind, and
  the major UI libraries (shadcn/ui, Bootstrap, daisyUI, Open Props, Material UI,
  Chakra UI, Ant Design, Mantine, UnoCSS).

### Minor Changes

- `generateTheme` now produces modern, branded, accessible themes. `primaryForeground` is derived from the seed's WCAG relative luminance instead of being hardcoded white, so light/brand colors get a near-black ink (`#f59e0b` → `#0f172a`) instead of unreadable white-on-amber text. Both light and dark modes emit the complete semantic palette (`background`, `foreground`, `card`, `popover`, `secondary`, `muted`, `accent`, `destructive`, `success`, `border`, `input`, `ring` + their foregrounds) plus `radius.lg`, and `meta.order` (10/20) so generated themes slot into preset ordering. Neutrals are tinted from the seed hue, so every generated family feels cohesive and branded. The CLI `generate` command and the `/theme-studio` + playground generators pick this up automatically.

### Patch Changes

- Add a `require` condition to the `exports` map so CommonJS consumers (such as
  the `@theme-kit/cli` CJS binary) can resolve `@theme-kit/core`,
  `@theme-kit/core/vanilla`, and `@theme-kit/core/vite` (`ERR_PACKAGE_PATH_NOT_EXPORTED`
  previously). Also emit `success` and `successForeground` color tokens in
  `generateTheme` (light + dark), so generated themes satisfy the validator's
  required color set and pass `theme-kit validate` out of the box.
