# Theme Kit — Progress Tracker

## Overall Status

| Area | Status |
|------|--------|
| Core Engine (@theme-kit/core) | ✅ Phases 1–9 complete |
| Framework Adapters | ✅ 10 adapters built (React, Next, Vue, Svelte, Nuxt, Solid, Astro, Remix, Angular, Web) |
| Tailwind v4 Integration | ✅ Complete |
| Vite Integration (@theme-kit/core/vite) | ✅ Complete — blocking theme bootstrap plugin |
| Tests | 194 passing (@theme-kit/core), 12 passing (@theme-kit/angular) |
| DevTools (@theme-kit/devtools) | ✅ Complete |
| CLI (@theme-kit/cli) | ✅ Complete |
| Phase 12 — Playgrounds | ✅ Vanilla, Next, Angular, React, Vue, Svelte, Solid created |

---

## Completed Core Phases (Phases 1–9)

### Phase 1–3: Foundation Features
- Theme inheritance, composition, semantic tokens, runtime editing, live generation, validation, migration
- Theme transitions (CSS + View Transition API), component-scoped themes, undo/redo history
- Multi-window sync (BroadcastChannel, SharedWorker, StorageEvent)

### Phase 4: Runtime Improvements
- Automatic built-in themes, Theme Registry (register/unregister/replace/clear/list/getFamilies/getThemesByFamily)
- Theme Packs (`runtime.use(pack)`), Theme Versioning (auto-timestamped meta)

### Phase 5: Token System
- **Token References** — `$path` and `{path}` syntax resolves to other token values
- **Derived Tokens** — `contrast(background)` computes black/white foreground; `auto()` derives from base token name
- **Token Expressions** — arithmetic (`spacing.lg + 8`, `radius.sm * 2`) with unit extraction
- Integrated into `resolveTheme()`, `runtime.update()`, `themeToCSSVariables()`

### Phase 6: Runtime Features
- **Transactions** — `runtime.batch(() => { ... })` coalesces multiple changes into single DOM update
- **Snapshots** — `runtime.snapshot()` / `runtime.restore()` captures/restores full state atomically
- **Time Travel** — `runtime.history.jump(index)` / `getHistory()` for indexed history navigation
- **Lifecycle Events** — `runtime.lifecycle.on('beforeThemeChange', fn)` / `afterThemeChange` / `beforePersist` / `afterPersist`

### Phase 7: CSS Engine
- **Incremental DOM Updates** — only `setProperty` when values actually change
- **DOM Write Batching** — `createDOMWriteBatch()` coalesces attribute/class/style writes into single `flush()`
- **CSS Layers** — `styleSheet: true` option emits `@layer theme-kit { :root { ... } }` via `<style>` element
- **Configurable Prefixes** — `prefix: 'acme-'` changes `--theme-color-primary` → `--acme-color-primary`

### Phase 8: Accessibility
- **Automatic Contrast Validation** — `getContrastRatio()`, `checkContrastPair()`, `validateThemeContrast()` for WCAG AA/AAA checking on all 8 semantic color pairs
- **Color Vision Simulation** — `simulateCVD()` / `simulateThemeForCVD()` for protanopia, deuteranopia, tritanopia, achromatopsia using HPE LMS cone response model
- 30 new tests passing

### Phase 9: Plugin System
- Extensible plugin architecture via `createThemeRuntime({ plugins: [...] })`
- `ThemePlugin<T>` interface with lifecycle hooks, `transformTokens`, and priority ordering
- `PluginManager<T>` for registration/unregistration/discovery
- **9 official plugins:** persistence, broadcast, history, animations, accessibility, scheduled, debugger, devtools, generation
- Lifecycle events now fire on selection changes (`setMode`/`setFamily`/`toggleTheme`)
- 14 new tests (180 total)

---

## Phase 10 — Update Packages & Frameworks ✅ COMPLETE
- Propagated Phase 5–7 changes (token system, runtime features, CSS engine) to all framework adapters
- Updated TypeScript types, exports, and documentation per package
- Built all packages successfully

### Framework Adapters Updated:
- **React**: Added `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeTimeTravel`, `useThemeLifecycle`, `useThemePacks`
- **Vue**: Added `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`, `jump()` to history
- **Svelte**: Added `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`, `jump()` to history
- **Solid**: Added `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`, `jump()` to history
- **Astro**: Added `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`, `jump()` to history
- **Angular**: Added `injectThemeBatch`, `injectThemeSnapshot`, `injectThemeRestore`, `injectThemeTimeTravel`, `injectThemeLifecycle`, `injectThemePacks`
- **Next.js**: Re-exports all new React hooks
- **Remix**: Re-exports all new React hooks
- **Nuxt**: Re-exports all new Vue hooks
- **Tailwind**: No changes needed (CSS-only integration)

### Playground Integration:
- The vanilla playground (`examples/playground/vanilla/index.html`) now includes the `@theme-kit/devtools` panel, initialized automatically alongside the `ThemeKit` instance
- The devtools panel provides Inspector, Events, Perf, CSS Vars, and History tabs
- **New playgrounds created**: react-app, vue-app, svelte-app, solid-app (each with 10 demo components mirroring the Next.js playground)

### Build Status:
- ✅ @theme-kit/core builds successfully
- ✅ @theme-kit/react builds successfully
- ✅ @theme-kit/vue builds successfully
- ✅ @theme-kit/svelte builds successfully
- ✅ @theme-kit/solid builds successfully
- ✅ @theme-kit/astro builds successfully
- ✅ @theme-kit/angular builds successfully
- ✅ @theme-kit/next builds successfully
- ✅ @theme-kit/remix builds successfully
- ✅ @theme-kit/nuxt builds successfully
- ✅ @theme-kit/tailwind builds successfully
- ✅ @theme-kit/web builds successfully
- ✅ @theme-kit/devtools builds successfully
- ✅ @theme-kit/cli builds successfully

CLI requires `@types/node` (included in root devDependencies, linked via workspace protocol)

---

## Completed Phases (Phase 11)

### Phase 11 — Tooling ✅ COMPLETE
- **DevTools** — `@theme-kit/devtools` with runtime inspection, history, performance, events, CSS variable visualization
  - `createDevToolsInspector()` — observes runtime state, history, lifecycle events, CSS variables
  - `createDevToolsPanel()` — renders an interactive HTML devtools panel (Inspector, Events, Perf, CSS Vars, History tabs)
  - `createDevToolsPlugin()` — integrates as a core plugin, hooks into runtime lifecycle events, exposes `window.__THEME_KIT_DEVTOOLS__`
  - `inspect()`, `jump()`, `clearEntries()`, `clearPerformance()`, `exportState()`, `exportCSS()`
- **CLI** — `@theme-kit/cli` with `theme-kit generate`, `validate`, `migrate`, `inspect`, `export` commands
  - `theme-kit generate <seed> --family <name>` — generates light/dark theme pair from hex seed
  - `theme-kit validate --file <path>` — validates a theme JSON file against the ThemeDefinition schema
  - `theme-kit migrate --file <path> --output <path>` — migrates a theme to the latest format
  - `theme-kit inspect --file <path>` — prints theme metadata, tokens summary, and meta info
  - `theme-kit export --file <path> --format css|json --output <path>` — exports theme CSS variables or JSON

---

## Remaining Phases

### 🚧 Phase 12 — Examples & Playground (in progress)
- ✅ Vanilla, Next.js, Angular, React, Vue, Svelte, Solid playgrounds created
- ✅ Nuxt playground created with all theme-kit functionalities (10 sections)
- ✅ Astro playground created with all theme-kit functionalities (10 sections)
- ✅ Remix playground created with all theme-kit functionalities (10 sections)
- ✅ Web Components playground created with all theme-kit functionalities (10 sections)
- Each playground demonstrates 10 core demo sections using framework-idiomatic APIs

### 🔧 Phase 13 — Bug Fix & Playground Feature Parity ✅ COMPLETE

**Task 1 — Fix the theme-kit library bug (missing token categories):**
The core library now supports `colors`, `spacing`, `radius`, `shadows`, `borderWidths`,
`zIndex`, `breakpoints`, `typography` token categories:
- [x] Add `borderWidths` → CSS var `--theme-border-width-*`
- [x] Add `zIndex` → CSS var `--theme-z-index-*`
- [x] Add `breakpoints` → CSS var `--theme-breakpoint-*`
- [x] Update `ThemeTokens` type (`packages/core/src/model/tokens.ts`)
- [x] Emit new CSS variables in `css.ts` (`themeToCSSVariables`)
- [x] Merge new categories in `resolve-theme-definition.ts` (`mergeTokens`)
- [x] Resolve/flatten new categories in `resolve-tokens.ts` + `resolve-token-references.ts`
- [x] Add full token sets (spacing, shadows, typography, borderWidths, zIndex, breakpoints)
      to the neutral light/dark built-in themes so the demo has data
- [x] Add tests for the new token categories (5 new tests in `token-categories.test.ts`)
- [x] Rebuild `@theme-kit/core` dist

**Task 2 — Fix playground build error:**
- [x] Fix `brand-presets.tsx` type error (`ThemeColors` vs `string` for `backgroundColor`)
- [x] Fix `generator-demo.tsx` optional token handling
- [x] Fix `tokens-demo.tsx` token path mismatches so every section renders:
      `typography.fontSizes.` / `typography.lineHeights.` / `typography.fontFamilies.`,
      `shadows.`, `borderWidths.`, `zIndex.`, `breakpoints.`
- [x] Fix `useThemeLifecycle` typing bug in `@theme-kit/react`
      (`ThemeLifecycleEventName` was `keyof` of a function → `never`)

**Task 3 — Bring the main playground (`examples/playground`) to feature parity (20 sections):**
- [x] Theme Inheritance demo (`extendTheme`)
- [x] Theme Composition demo (`composeTheme`)
- [x] Semantic Token Groups demo (recursive colors: `surface.default`, `surface.hover`)
- [x] Theme Validation demo (`validateTheme`)
- [x] Theme Migration demo (`migrateTheme`)
- [x] Theme Transitions + View Transition API demo
- [x] Runtime features demo: `useThemeBatch`, `useThemeSnapshot`/`useThemeRestore`,
      `useThemeTimeTravel`, `useThemeLifecycle`, `useThemePacks`
- [x] Theme Registry demo (register/unregister/replace/list)
- [x] Plugin system demo
- [x] Contrast validation (`getContrastRatio`, `checkContrastPair`) + CVD simulation
      (`simulateCVD`, `getCVDLabel`) demo
- [x] Update HistoryDemo with time travel
- [x] Wire all new sections into `app/page.tsx`

**Task 4 — Fix vanilla playground (`vanilla/index.html`):**
- [x] Missing `createDevToolsInspector` import (only `createDevToolsPanel` is imported)
- [x] Double devtools init (`initKit()` already calls `initDevTools()`, then it is called again)

### ✅ Phase 14 — FOUC Fix (No-Flash Bootstrap) & Playground Theme Styles

**Task 1 — Provide the blocking bootstrap script out of the box (no more manual `index.html` scripts):**
- [x] Added `packages/core/src/bootstrap.ts` with framework-agnostic utilities:
      `createThemeBootstrapScript()`, `buildThemeCssMap()`, `darkModeCSSTemplate()`
- [x] `createThemeBootstrapScript()` generates a blocking inline script that reads the persisted
      selection from localStorage (`theme-selection`), resolves `system` against
      `prefers-color-scheme`, and applies CSS variables + `data-theme`/`data-theme-mode`/
      `data-theme-family` + `.dark` class + `color-scheme` before first paint
- [x] Handles persisted family/mode and falls back to resolved default light/dark themes
      (`__default-light` / `__default-dark`) so even first-time visitors get styled output
- [x] Added `packages/core/src/vite-plugin.ts` — `themeKitVitePlugin({ themes })` injects the
      bootstrap script as `head-prepend` into `index.html`
- [x] Exposed as new subpath export `@theme-kit/core/vite` (package.json + tsup entry)
- [x] React playground (`examples/react-app/vite.config.ts`) now uses `themeKitVitePlugin`
      instead of a hand-rolled `themeBootstrap` plugin
- [x] New tests in `packages/core/test/bootstrap.test.ts` (6 tests)

**Task 2 — Fix theme styles not applying on the React playground:**
- [x] `examples/react-app/src/globals.css` was missing `@import "@theme-kit/tailwind";` —
      added it so Tailwind generates `bg-card`, `text-card-foreground`, `border-border`,
      `bg-primary`, etc.
- [x] Fixed `packages/tailwind/package.json` exports ordering: `"style"` now precedes
      `"import"` so Vite's CSS resolver picks `dist/index.css` instead of `dist/index.js`
      (previously broke `@import "@theme-kit/tailwind"` for any Vite-based app)
- [x] Dark-mode variant now correctly scoped to `.dark` (`:where(.dark, .dark *)`) instead of
      `@media (prefers-color-scheme: dark)`

## Playgrounds

- Main playground: http://localhost:3000 (20 sections + DevTools panel)
- Vanilla Inspector: `examples/playground/vanilla/index.html` (open directly in browser) — includes `@theme-kit/devtools` panel
- Angular Playground: `examples/angular-app/` — `cd examples/angular-app && pnpm start`
- React Playground: `examples/react-app/` — `cd examples/react-app && pnpm dev`
- Vue Playground: `examples/vue-app/` — `cd examples/vue-app && pnpm dev`
- Svelte Playground: `examples/svelte-app/` — `cd examples/svelte-app && pnpm dev`
- Solid Playground: `examples/solid-app/` — `cd examples/solid-app && pnpm dev`
- Nuxt Playground: `examples/nuxt-app/` — `cd examples/nuxt-app && pnpm dev`
- Astro Playground: `examples/astro-app/` — `cd examples/astro-app && pnpm dev`
- Remix Playground: `examples/remix-app/` — `cd examples/remix-app && pnpm dev`
- Web Components Playground: `examples/web-components/`

---

## Tests

- `@theme-kit/core`: **194 passing**
- `@theme-kit/angular`: **12 passing**
- `@theme-kit/react`: **6 passing**
- Run: `cd packages/core && pnpm test`

## Playgrounds

- Main playground: http://localhost:3000 (20 sections + DevTools panel)
- Vanilla Inspector: `examples/playground/vanilla/index.html` (open directly in browser) — includes `@theme-kit/devtools` panel
- Angular Playground: `examples/angular-app/` — `cd examples/angular-app && pnpm start`
- React Playground: `examples/react-app/` — `cd examples/react-app && pnpm dev`
- Vue Playground: `examples/vue-app/` — `cd examples/vue-app && pnpm dev`
- Svelte Playground: `examples/svelte-app/` — `cd examples/svelte-app && pnpm dev`
- Solid Playground: `examples/solid-app/` — `cd examples/solid-app && pnpm dev`
- Nuxt Playground: `examples/nuxt-app/` — `cd examples/nuxt-app && pnpm dev`
- Astro Playground: `examples/astro-app/` — `cd examples/astro-app && pnpm dev`
- Remix Playground: `examples/remix-app/` — `cd examples/remix-app && pnpm dev`
- Web Components Playground: `examples/web-components/`
