# Theme Kit — Webpage & Docs Site Progress

Tracking status of the official documentation website (`apps/docs`), what's live, what's remaining, and improvement opportunities as a documentation + official library site.

**Canonical content source:** `docs.md`
**Site location:** `apps/docs` (Next.js App Router)

---

## Next (Done)

Immediate, ordered work items (most valuable first). Check items off as they land.

- [x] **Full code snippets on every framework guide** — every `/framework-guides/{slug}` page ships complete copy-paste snippets (React, Next.js, Vue 3, Svelte 5, Solid, Angular, Web, Tailwind, Astro, Nuxt, Remix), not just function-name bullet lists. Same snippets also live in `packages/*/README.md` for reference.
- [x] **Modern documentation layout** — `/framework-guides/{slug}` pages are now real doc pages: package-manager install tabs (pnpm/npm/yarn/bun), Quick Start, More Examples (per-framework advanced snippets), an API Reference table per group, a sticky "On this page" TOC, and prev/next navigation. Pages are statically generated (`generateStaticParams`).
- [x] **Theme Studio / Generation studio** — seed-color picker that previews a generated light/dark pair via `generateTheme`, then drops it into the runtime (`/theme-studio`).
- [x] **Individual package pages** — deep-dive pages per package (`/packages/{pkg}`), reusing the package README snippets, with install tabs, quick-start, more examples and grouped API reference tables.
- [x] **API Reference generation** — `/api-reference/{package}` pages generated from `packages/*/src` via typedoc (JSON) + a custom renderer (`apps/docs/scripts/generate-api-reference.mjs`); regenerate with `pnpm --filter @theme-kit/docs api:generate`. Covers all 14 packages + `@theme-kit/core/vanilla` and `/vite` submodules.
- [x] **Multi-window demo** — two-pane demo demonstrating cross-tab sync (BroadcastChannel / SharedWorker / StorageEvent) inside `/playground`.
- [x] **Scheduling demo** — drag latitude/longitude and watch sunrise/sunset mode switching live (NOAA solar math via `calculateSunTimes`) inside `/playground`.
- [x] **404 page** — styled not-found page matching the design system.
- [x] **Search** — site-wide full-text search over `content/*.md` + interactive pages, with a ⌘K command-palette dialog in the header. Polished: increased backdrop opacity, switched dialog background to bg-background for proper opacity. click-outside-to-close, header stays above backdrop.
- [x] **Hydration fix** — formatTime in history-timeline.tsx and sync-demo.tsx now uses locale-independent formatting; timestamps deferred to client with useState/useEffect to prevent SSR/client mismatch.
- [x] **Custom font support** — ThemeProvider in @theme-kit/next now accepts a font prop to apply custom fonts to the body element.
- [x] **Theme generator in playground** — seed-color picker generates light/dark theme pairs via generateTheme, with JSON and CSS variables tabs and copy-to-clipboard.
- [x] **Getting-started code blocks** — replaced raw <pre><code> with <CodeBlock> component for proper highlighting, copy button, and toolbar styling.
- [x] **Hydration fix** — formatTime in history-timeline.tsx now uses locale-independent formatting to prevent SSR/client mismatch.
- [x] **Custom font support** — ThemeProvider in @theme-kit/next now accepts a font prop to apply custom fonts to the body element.
- [x] **Theme generator in playground** — seed-color picker generates light/dark theme pairs via generateTheme, with JSON and CSS variables tabs and copy-to-clipboard.
- [x] **Accessibility lab** — live WCAG contrast checks, full-theme audits, and CVD simulations with apply-to-site (`/accessibility`).
- [x] **Mobile docs sidebar** — animated mobile menu (header) + slide-in docs drawer (`docs-layout.tsx`).
- [x] **Roadmap page** — dated, actionable roadmap with checked-off shipped items.
- [x] **Showcase page** — gallery of official tools (docs site, Playground, Theme Studio, Accessibility Lab) + framework example apps, wired into the sidebar and header (`/showcase`).
- [x] **Hydration fix** — `formatTime` in `history-timeline.tsx` now uses locale-independent formatting to prevent SSR/client mismatch.
- [x] **Solar-time: location auto-detection** — `scheduled` no longer requires `latitude`/`longitude`. The location resolves from the visitor's IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`, anchored to the tzdb reference city) via the new `@theme-kit/core` timezone map (`resolveSolarLocation`, `getLocationForTimeZone`, `getBrowserTimeZone`, `getTimeZoneList`), with `timeZone` / `autoDetectLocation` options and runtime `schedule.set({ timeZone })` / `set({ autoDetectLocation: true })`. `calculateSunTimes(date, lat?, lon?)` accepts optional coordinates or an options bag.
- [x] **Solar-time: timezone picker in the playground** — `/playground#solar` now has a timezone `<select>` (Auto = detected location, plus every IANA zone) driving the real schedule; lat/lon sliders + city presets remain as a manual preview and sync to the detected location on load.
- [x] **Solar-time: optional light/dark themes** — `scheduled.lightTheme`/`darkTheme` are now optional. When omitted the schedule derives them from the currently selected theme's family (`resolveScheduledThemePair`, e.g. `plum-dark` → `plum-light`/`plum-dark`) and falls back to Theme Kit's neutral `light`/`dark` themes, re-resolving when the user switches family (wired through `createThemeSchedule` + `createScheduledPlugin`).
- [x] **Solar-time: SSR hydration fixes** — React `useThemeSchedule` now hydrates with the stable `EMPTY_THEME_SCHEDULE_STATE` server snapshot; Vue/Nuxt `useThemeSchedule` initializes its `state` ref with the empty snapshot and fills it in `onMounted`. Auto-detected timezone/theme state no longer causes server/client hydration mismatches.

---

## 1. What's on the webpage today

### Routing / Pages

| Route                | Purpose                                                       | Status |
| -------------------- | ------------------------------------------------------------- | ------ |
| `/`                  | Marketing / discovery landing (interactive hero, family gallery, ecosystem, learning-path band, CTA) | Live   |
| `/overview`          | Architecture & mental model (standalone interactive page: why, one-runtime framework picker, family×mode demo, live token tree, ecosystem, learning path) | Live   |
| `/get-started`       | Framework chooser guide (5 steps, Next.js recommended, live "first app" demo) | Live   |
| `/core-concepts`     | Theme, token groups, mode & family docs                       | Live   |
| `/tokens`            | Tokens & typography reference                                 | Live   |
| `/zero-flash`        | Zero-flash SSR-first theming deep dive                        | Live   |
| `/custom-themes`     | Custom theme definition/generation                            | Live   |
| `/architecture`      | Runtime API, layers, architecture overview                    | Live   |
| `/packages`          | Package map table                                             | Live   |
| `/framework-guides`  | React, Next, Vue, Svelte, Solid, Angular, Web, Tailwind, etc. | Live   |
| `/advanced-features` | Generation, validation, history, plugins, sync, a11y, etc.    | Live   |
| `/api-reference`     | Function/hook listing per package                             | Live   |
| `/cli`               | CLI command reference                                         | Live   |
| `/devtools`          | DevTools plugin/panel reference                               | Live   |
| `/playground`        | Interactive theme switcher, token tree, history/time-travel   | Live   |
| `/theme-studio`      | Seed-color → generated light/dark pair studio                 | Live   |
| `/accessibility`     | WCAG contrast checks, CVD simulation lab                      | Live   |
| `/animation`         | Animation/transition docs (API reference, presets, cross-fade)           | Live   |
| `/custom-scrollbar`  | ThemeScrollbar overlay engine docs (per-framework integration incl. Nuxt & Remix, options, CSS) | Live   |
| `/showcase`          | Official tools + framework example apps                       | Live   |
| `/blog`              | Engineering posts (zero-flash, multi-window sync, solar-time, a11y) | Live   |
| `/roadmap`           | Docs-site goals + visualization areas                         | Live   |

### Interactive / Product Features (dogfooding Theme Kit)

- **Live theme switching** — every page is wrapped in `@theme-kit/next` `ThemeProvider`; switching a family/mode re-themes the entire site with no reload.
- **Zero-flash SSR** — blocking bootstrap script, cookie persistence, `prefers-color-scheme` dark fallback.
- **Landing page family chips** — click a family (oat, mint, plum, cocoa, ...) to apply it site-wide.
- **Theme gallery** — cards for all built-in preset + brand families with light/dark swatches; click-to-apply, active theme highlighted.
- **Live preview card** — semantic token swatches (`--theme-color-*`) rendered from the active theme.
- **Mode toggle** — light / dark / system cycle with icons.
- **ThemeInspector** — floating dev panel (real `@theme-kit/react` feature) toggled from `components/site-toolbar.tsx`.
- **Playground page** — `/playground` with live family/mode switcher, an interactive expandable token tree (CSS vars re-render live), and a history timeline with undo/redo/jump.
- **Overview is a live mental model** — `/overview` is an interactive architecture page: a family × mode diagram with real `ThemeDefinition` swatches (clicking applies the actual runtime theme), an embedded live `TokenTree` of the docs' own tokens, and a "one runtime, every framework" picker that swaps the install line per framework.
- **Get-started framework chooser** — `/get-started` lets users pick a stack (Next.js marked "Recommended"), then serves a dynamic 5-step guide (install → `defineTheme` → provider → use → customize) with a zero-flash explainer for Next.js and a live "first app" demo card.
- **Learning path everywhere** — a shared `LearningPath` band (Overview → Playground → Get Started → Framework docs → Advanced) anchors home + overview, and `DocsPagination` adds prev/next through the sequence on every docs page; header/footer/sidebar reordered to lead with Overview/Get Started.
- **Copy-to-clipboard everywhere** — every code block (docs markdown + landing "Get Started") has a copy button; highlighting is real Shiki output, not mocked.

### Design / UX

- Sticky, blurred glass header with active nav states + mobile hamburger menu.
- Grouped docs sidebar (Basics / Packages / Guides / Tooling / Project) with active highlighting.
- Glassmorphic cards, animated gradient orbs, gradient text, hover-lift, reduced-motion support.
- Fully token-driven styling (`--theme-color-*`) so the design re-themes live.
- Markdown rendering via `react-markdown` + `remark-gfm` (tables, code blocks, lists).
- **Shiki syntax highlighting** — all fenced code blocks (docs pages + landing "Get Started") render with GitHub Light/Dark themes that adapt to the active site theme (`.dark` class), with a language label + copy button. Highlighting runs server-side via a sync Shiki core (zero client bundle cost). Code blocks are compact: controls overlay the corner on hover instead of a header bar.

---

## 2. What's remaining

### Content gaps (vs `docs.md`)

- [x] **Playground** — dedicated interactive playground page with live theme switcher, token tree, and history/time-travel demos.
- [x] **Interactive token tree** — expand `colors.surface.default`, watch CSS variables update live (inside `/playground`).
- [x] **Copy-paste code snippets** — every markdown code block and the landing "Get Started" snippet are copyable via Shiki `CodeBlock`.
- [x] **Theme Studio / Generation studio** — pick a seed color, preview generated light/dark pair via `generateTheme`, and apply it to the live runtime (`/theme-studio`).
- [x] **API Reference generation** — `/api-reference/{package}` generated from package source (`packages/*/src`) via typedoc JSON + a custom markdown renderer, so signatures/params/types never drift. (Previously a hand-written markdown list; `content/api-reference.md` removed.)
- [x] **Framework guides** — **per-framework documentation pages** (`/framework-guides/{slug}`) reachable from a **sidebar dropdown** ("Framework Guides ›" expands to an Overview link + React, Next.js, Vue 3, Svelte 5, Solid, Angular, Web Components, Tailwind CSS, Astro, Nuxt, Remix). Each page is a real docs page: **package-manager install tabs**, a **Quick Start** copy-paste Shiki snippet, **More Examples**, a grouped **API Reference table**, a sticky "On this page" TOC, and prev/next navigation — for **every** framework, not just function names. `/framework-guides` is a clean overview index with tag chips; pages are statically generated. (Replaces the earlier single-page accordion; also covers the former "Framework tabs" gap.)
- [x] **Reference snippets in `packages/`** — every framework package now ships a `README.md` with a complete copy-paste usage snippet for reference (`packages/react/README.md`, `packages/next/README.md`, `packages/vue/README.md`, `packages/svelte/README.md`, `packages/solid/README.md`, `packages/angular/README.md`, `packages/web/README.md`, `packages/tailwind/README.md`, `packages/astro/README.md`, `packages/nuxt/README.md`, `packages/remix/README.md`). `apps/docs/content/framework-guides.md` was updated so **every** framework section has a runnable snippet, not just an API-name bullet list.
- [x] **Multi-window demo** — two-pane demo inside `/playground` showing cross-tab sync over BroadcastChannel with SharedWorker/StorageEvent detection, remote-change counters, and "open a real second tab".
- [x] **Scheduling demo** — drag latitude/longitude (with city presets) and watch sunrise/sunset and the suggested light/dark mode switch live via `calculateSunTimes`, inside `/playground`.
- [x] **Accessibility lab** — live WCAG contrast checks, full-theme audits (`validateThemeContrast`), and CVD simulations (`simulateCVD` / `simulateThemeForCVD`) with apply-to-site (`/accessibility`).
- [x] **Individual package pages** — deep-dive pages per package (`/packages/core`, `/packages/react`, `/packages/next`, ...) with install tabs, snippets and grouped API reference tables, driven from `lib/packages.tsx` and cross-linking to the generated API reference.
- [x] **Showcase page** — `/showcase` gallery of official tools (docs site, Playground, Theme Studio, Accessibility Lab) and official framework example apps.
- [x] **Blog** — `/blog` index + post pages rendered from `content/blog/*.md` (frontmatter parsed in `lib/blog.ts`), with sample posts on zero-flash theming, multi-window sync, solar-time theming and accessibility.
- [ ] **Blog (more content)** — publish ongoing release notes and deep dives.
- [x] **Search** — site-wide search over `content/*.md` plus static entries for interactive pages; ⌘K command-palette dialog in the header.
- [x] **404 page** — styled not-found page matching the design system.
- [x] **Docs/API parity audit** — full audit of every documented API against real package exports (`update.md`). **10 documented-but-nonexistent APIs found and corrected** (documentation-only). Example fixes: `runtime.setTheme()` → `runtime.selection.setMode()`, `useTheme().setTheme` → `setFamily`, `useBootstrapTheme({ injectCSS })` → factory-only, `createMantineAdapter()`/`synchronizeTransition()` removed, `ThemeKitProvider` → `ThemeProvider`, Angular signal `theme()` calls, web/astro `store.get()`. Scoped-theme page expanded to cover the implemented `themes`/local-themes, transition-inheritance and SSR pre-paint contract. Site builds clean (84 pages).

### Content sync

- [ ] Keep `content/*.md` in sync with `docs.md` (currently manually copied subsets).
- [ ] Keep `packages/*/README.md` reference snippets in sync with `apps/docs/lib/frameworks.ts` snippets (three sources: framework pages, `content/framework-guides.md`, package READMEs).
- [ ] Add a sync script or tooling so `docs.md` remains canonical.
- [ ] Fill remaining doc pages that map to sections in `docs.md` (e.g. dedicated Vue/Svelte/Solid/Angular/Web/Tailwind/Astro/Nuxt/Remix sections).

### Architecture / infra

- [ ] `next.config.ts` already transpiles workspace packages; consider aliasing `@theme-kit/*` to source for HMR during development.
- [ ] Re-add `/apps/docs` to CI lint/typecheck/test pipeline.
- [ ] Publish workflow: versioning, release notes page.

---

## 3. What could be improved (as a documentation + official library site)

### Content & documentation quality

- **Split package docs into dedicated pages** with code samples, API tables, and copy-paste examples per package — the current single-page guides are too dense.
- **Add "every example is real" enforcement** — docs.md states examples are executed with Theme Kit, not mocked. Ensure demo components are the actual library output.
- **Copy-paste code snippets** — make every snippet on docs pages copyable. **Done via Shiki `CodeBlock`** (docs markdown + landing "Get Started"); still worth sweeping for any hardcoded snippets outside markdown.
- **Shiki code block enhancements** — line numbers, per-line highlight/focus (e.g. `// [!code highlight]` or line ranges), filename tab, and copy of just the highlighted region. `lib/highlight.ts` is ready to grow transformers.
- **Version-pinned API reference** — show version badges and deprecation/breaking-change notes per API.
- **Changelog / migration guides** — surface `migrate-theme` and versioning story on the site.
- **Accessibility page** — explain High Contrast / Large Text profiles with live toggles (WCAG, CVD).
- **Interactive diagrams** — animated mode + family + token diagrams in Core Concepts.

### Site experience

- **Keyboard-accessible everywhere** — focus rings, skip-to-content link, aria labels audit (chips/buttons currently rely on native behavior).
- **Mobile docs sidebar** — **Done** — animated mobile menu (header) + slide-in docs drawer (`docs-layout.tsx`) replacing the previously hidden-below-`lg` sidebar.
- **Fixed site header** — main navbar (`site-header.tsx`) changed from `position: sticky` to `position: fixed` so it stays at the top of the viewport at all times; main content area gets `pt-16` to prevent content from being hidden behind the header.
- **Sticky docs sidebar** — the docs navigation sidebar in `docs-layout.tsx` uses `position: sticky; top: 80px` so it remains visible while scrolling through long documentation pages.
- **Search** — **Done** — full-text search over `content/*.md` + interactive pages via a ⌘K command-palette dialog (`lib/search.ts` + `components/search-dialog.tsx`).
- **Table of contents** — per-page sticky TOC on framework-guide and package pages (derived from sections).
- **Prev/Next navigation** — between framework-guide and package pages.
- **Theme persistence UX** — show a "reset to default" control; system-mode indicator.
- **Page transitions** — smooth route transitions using Theme Kit's View Transitions support.
- **Playground follow-ups** — token tree search/filter, "copy token path" and "copy CSS var", token diff between two themes, and a live preview of `runtime.update()` on the active theme.
- **Perf** — audit bundle: landing page First Load JS is ~124 kB; consider code splitting heavier demo components.

### Branding & polish

- **Favicon / OG meta / Twitter cards** with themed preview image.
- **Fonts** — currently system stack; consider a branded display font (self-hosted for SSR).
- **Landing page polish** — animated token preview, real install command, package health badges. (Animated hero background shipped: aurora gradient, rising particles, shimmer sweep, panning dot grid, multi-keyframe hue-shifting orbs, vignette — all `prefers-reduced-motion` aware.)
- **Dark-mode-specific assets** — logo/hero imagery that adapts to the active theme.
- **Roadmap page** — replace generic goals with a dated, actionable roadmap with issue links.

### Governance / maintenance

- **CI checks** — lint, typecheck, build, and a link checker for all routes.
- **Content ownership** — define where canonical content lives and how the site consumes it.
- **Analytics** — optional lightweight analytics to guide documentation priorities.
- **Accessibility conformance** — run axe/WCAG audits across pages.
- **Automated API reference** — generate from TypeScript source (typedoc/API Extractor) so it never drifts.

---

## Notes

- `components/site-nav.tsx` is **no longer used** (replaced by `components/docs-layout.tsx`) — candidate for removal.
- `components/site-header.tsx` renders the ⌘K `SearchDialog` (data from `lib/search.ts`) and the animated mobile menu; `components/docs-layout.tsx` renders a mobile docs drawer (both client components).
- The site header (`site-header.tsx`) uses `position: fixed` so it stays at the top of the viewport at all times. The docs sidebar (`docs-layout.tsx`) uses `position: sticky` so it remains visible while scrolling.
- The CSS double-scrollbar issue (both `html` and `body` having `overflow-y: scroll`) was fixed by changing `body` to `overflow-y: auto` while keeping `html` at `overflow-y: scroll` to prevent layout shift.
- Interactive feature pages: `/theme-studio` (`components/theme-studio/theme-studio.tsx`), `/accessibility` (`components/accessibility/accessibility-lab.tsx`), and the playground demos in `components/playground/` (`sync-demo.tsx`, `scheduled-demo.tsx`).
- Individual package pages are data-driven from `apps/docs/lib/packages.tsx` (snippets + API groups per package) — mirrors `apps/docs/lib/frameworks.tsx` and the package READMEs.
- Generated API reference: `apps/docs/scripts/generate-api-reference.mjs` runs typedoc (JSON mode) over every `packages/*/src` entry and renders clean markdown into `apps/docs/content/api-reference/`. Regenerate with `pnpm --filter @theme-kit/docs api:generate`. The catch-all route `app/api-reference/[...slug]/page.tsx` serves `{package}` and `{package}/{submodule}` pages statically.
- Showcase (`app/showcase`) and Blog (`app/blog`, content in `apps/docs/content/blog/`, frontmatter parsed by `lib/blog.ts`) are both data-driven and appear in the sidebar, header (Showcase) and site search.
- Search (`lib/search.ts`) walks `content/` recursively, so generated API-reference pages and blog posts are indexed automatically.
- `components/home/get-started.tsx` is now a **server component** (highlights via `lib/highlight.ts` + `CodeBlock`); keep it out of the client bundle.
- Shiki is wired in `components/markdown.tsx` + `lib/highlight.ts` — `highlightCode(code, lang)` returns dual-theme HTML consumed by `components/code-block.tsx`. To add languages/themes, extend the imports there.
- Content files under `apps/docs/content/` are hand-written subsets of `docs.md`; keep the two in sync when editing.
- Framework-guide pages are data-driven from `apps/docs/lib/frameworks.tsx` (features + two snippets per framework); `apps/docs/content/framework-guides.md` and `packages/*/README.md` are the canonical markdown mirrors of the same snippets.
- `@theme-kit/next` `ThemeProvider` now accepts every native `<html>` attribute (`className`, `style`, `dir`, `data-*`, ...) plus a `body` prop, merging user styles with the SSR theme output.
- `components/install-command.tsx` renders package-manager tabs; each tab's code is highlighted server-side via `lib/highlight.ts` and rendered through the client `CodeBlock`.
- Every route is server-rendered on demand (`ƒ Dynamic`); consider static generation where content is fixed.

## What's Included (Done ✅)

- Inside framework guides,for each framework, there is section called what's available, when clicking on the provider/hooks/components or what each framework api reveals, it should reveal the useCase, or how to use it there.
- Inside side navbar on the page, add custom theme, i.e. how can a user can define a custom theme in theme-kit. Use packages/frameworks...for reference..It should be added after the framework guides.
- Inside Tooling section, inside CLI there should be very openly mentioned what each commands generats with examples and inside the DevTools, there should be detailed examples.
- The overview section should not navigate to the homepage, create a new overview page, and add there the real overview of the theme-kit library.
- Create a presets section, add two dropdowns, one for default presets, with examples, another for brand presets in the side navigation/docs navigation. Use packages/core for references.
- Add dropdowns to the mobile naviagations too..
- Add all of the remaining features on the playground, and side naviagtion too.
- Enhance the code snippets part, which are rendered, and it's styles, make it readable, subtle backgrounds on any theme..
- Inside landing page, add animations on the elements..as well as also add section for what theme-kit solves, and provides.
- Inside the docs page..add subtle gradient background..you can animate it, it uses the applied theme-colors/backgrounds.
- On the copy, and language button component, add blurish/glass effect background, so it is visible on any theme mode.
- The search the docs/search bar component should be hidden clicking outside of it, when clicking on it the background of main navbar changes closer to dark/black, which feels akward..
- Add all the remaining features of the theme-kit on the docs site, and the playground too.
- Make the blog page more interactive

## Completed Build Fixes (2026-08-02)

### `@theme-kit/nuxt` — runtime files missing from dist

- `tsup.config.ts` only bundled `src/index.ts`; runtime files (`plugin/`, `composables/`, `components/`) never reached `dist`.
- Fixed: added runtime entries to tsup (`runtime/plugin/index`, `runtime/composables/index`) and a `node -e` copy step for `.vue` components.
- `src/runtime/plugin/index.ts` imported from `"nuxt"` directly; Nuxt's import-protection blocks this in Vue components. Changed to `#app`/`#imports` aliases.
- `src/runtime/composables/index.ts` only exported 3 hooks; expanded to export all hooks the example components use (`useThemeValue`, `useThemeTokens`, `useThemeMode`, `useThemeFamily`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`).
- Example `.vue` components imported hooks from `@theme-kit/nuxt` (module entry-point), which Nuxt's import-protection blocks. Removed all explicit imports; Nuxt auto-imports from `addImportsDir`/`addComponentsDir` now provide them.
- `examples/nuxt-app/src/components/ScopedDemo.vue` removed explicit `ThemeScope` import (auto-registered via `addComponentsDir`).
- `examples/nuxt-app/tsconfig.json` added `paths` for `~/*` alias.

### `remix-playground` — multiple build failures

- `remix.config.js` used `defineConfig` from `@remix-run/dev` (not a named export) and `remix-flat-routes` (not installed). Replaced with `vite.config.ts` using `vitePlugin as remix` + `@tailwindcss/vite`.
- `app/tailwind.css` used v3 directives (`@tailwind base/components/utilities`); updated to v4 (`@import "tailwindcss"`).
- `app/root.tsx` imported CSS via `links()` returning `/tailwind.css` (classic compiler style); updated to `import styles from "./tailwind.css?url"` (vite `?url` emission).
- `remix.config.js` deleted; `package.json` build script changed from `remix build` to `remix vite:build`.
- `package.json` added `@tailwindcss/vite` and `vite-tsconfig-paths` devDependencies; `vite.config.ts` includes `tsconfigPaths()` for `~/` alias resolution.
- `@theme-kit/remix` didn't export `ThemeScope`; added `export { ThemeScope } from "@theme-kit/react"` to `packages/remix/src/index.ts`.

### `@theme-kit/next` — already fixed (previous session)

### `@theme-kit/svelte`, `@theme-kit/vue`, `@theme-kit/web` — hooks added (previous session)

### `@theme-kit/astro` — `shared-runtime.ts` window guard (previous session)

### `examples/nuxt-app` — tailwindcss v4 fix (previous session)

- [x] **Overlay scrollbar** — built a VS Code / Figma / Linear-style overlay scrollbar **in `@theme-kit/core`** (`packages/core/src/utils/overlay-scrollbar.ts`) as a framework-agnostic DOM utility. It is a **true overlay: it attaches to every scrollable container**, not just the window — the document/page AND every nested scrollable element (`overflow-x/y: auto|scroll`, e.g. the fixed docs sidebar, code blocks, tables). A `MutationObserver` (+ rAF-throttled rescan + `ResizeObserver` + capture `scroll`/`wheel`) keeps thumbnails in sync across **navigations**, so the overlay never "vanishes" and appears wherever the native scrollbar would. Native scrollbars are hidden but left in place so layout is never affected. Frame-batched updates; `transform: translateY/translateX` only (never `top`); browser-equivalent thumb sizing (`viewport² / scrollHeight`); vertical + horizontal axes; hover/drag (grab/grabbing) with `--tk-scrollbar-*` Theme Kit tokens so it re-themes live. Wrappers: **React** `<ThemeScrollbar />`, **Vue** `<ThemeScrollbar>`, **Solid** `<ThemeScrollbar>`, **Svelte** `<ThemeScrollbar>`, **Web** `<theme-kit-scrollbar>`. Enabled in the docs layout.
- [x] **Docs navigation fixed** — the docs sidebar (`docs-layout.tsx`) changed from `sticky` to `position: fixed` so it never scrolls with the main content; its native track is hidden (`.tk-sidebar-scroll`) to match the overlay aesthetic while remaining scrollable.
- [x] **Search backdrop blur** — `search-dialog.tsx` blur backdrop now applies a soft frosted-glass blur over the whole page (`backdrop-filter: blur(16px) saturate(120%)` with a light `--theme-color-background` tint) instead of darkening.
- [x] **Smooth, flash-free theme transitions** — disabled the View Transition crossfade (which was flashing white through the page's transparent backgrounds); the docs now paints a themed `html`/`body`/`.docs-bg` backdrop at all times and transitions color/background smoothly on the surface elements (`body`, `.docs-bg`, `.site-header`) with `prefers-reduced-motion` respected.

## Completed Build Fixes (2026-08-05)

### `@theme-kit/react` — thumb appearance customization (`thumbColor`, `trackColor`, `activeThumbColor`, `thumbHoverColor`)

- **New options** added to `OverlayScrollbarOptions` (core types) and exposed via the grouped `appearance` prop in the React wrapper (`ThemeScrollbarAppearance`).
- **CSS custom properties** for theming: `--tk-scrollbar-thumb`, `--tk-scrollbar-track`, `--tk-scrollbar-thumb-hover`, `--tk-scrollbar-thumb-active` with defaults derived from `--theme-color-accent`/`--theme-color-primary`.
- **Usage** — pass colors via grouped props or flat props:
  ```tsx
  <ThemeScrollbar
    appearance={{
      thumbColor: "#ff6b6b",
      trackColor: "#2d2d2d",
      activeThumbColor: "#ff4444",
      thumbHoverColor: "#ff8888"
    }}
  />
  ```
  Or via CSS:
  ```css
  :root {
    --tk-scrollbar-thumb: #ff6b6b;
    --tk-scrollbar-track: #2d2d2d;
    --tk-scrollbar-thumb-hover: #ff8888;
    --tk-scrollbar-thumb-active: #ff4444;
  }
  ```
- **Theme integration** — by default, colors come from the active theme (`primary → accent → foreground`), so the scrollbar re-themes live with no configuration. Custom colors override theme-derived values.
- **Tests:** core 219/219, react 6/6, next 7/7 stay green; docs `next build` succeeds.

### `@theme-kit/core` — inner overlay scrollbars (code blocks / nested containers) not rendering

- **Symptom:** only the document scrollbar appeared (and only its arrows on hover); inner scrollables — docs nav sidebar, `pre`/`code` blocks, any `overflow:auto|scroll` container — had no custom strip, no thumb, and no arrows.
- **Root cause (discovery):** the scrollable-discovery guard `el.closest(".tk-scrollbar")` was meant to skip the overlay's own fixed strip DOM, but the bootstrap adds the `tk-scrollbar` class to `<html>` to hide native bars. Since `<html>` is an ancestor of every element, `closest(".tk-scrollbar")` matched for *every* element → `collectScrollables()` returned `[]` → no inner hosts were ever created → no inner strips/arrows.
- **Root cause (CSS collision):** the overlay base rule `.tk-scrollbar { position:fixed; opacity:0; contain:layout style }` also matched `<html class="tk-scrollbar">` (the bootstrap class). Without an app-level reset this forced `position:fixed` and `opacity:0` on the document root, which additionally made `isEffectivelyVisible()` walk up to an `opacity:0` root and hide every inner strip.
- **Fix:**
  - `scrollbar/manager.ts`: mark each overlay strip root with `data-theme-kit-host=""` and change the discovery guard to `el.closest("[data-theme-kit-host]")` so the bootstrap marker on `<html>` no longer filters out real scrollables.
  - `scrollbar.css`: scope the overlay strip base styles to `[data-theme-kit-host]` and add `html.tk-scrollbar { position:static !important; opacity:1 !important; contain:normal !important; … }` so the bootstrap class on the document element can never inherit the overlay strip styles.
- **Verified:** headless harness reproducing the exact SSR markup (`<html class="tk-scrollbar">` + inline pre-paint style, no app reset, `touch:true` = fine-pointer semantics) — after the fix, inner hosts are discovered (`data-theme-kit-scrollbar="overlay"` on 2 inner containers), 12 arrow buttons render, and inner strips are `display:block` (visible) instead of `display:none`. Root cause isolated from the coarse-pointer guard (intended: coarse devices keep native bars). `HAS_TK_CLASS` and the pre-paint `<style data-theme-kit-pre-paint="scrollbar">` confirmed in the Next.js production SSR HTML (no client script mutating `<html>` → no hydration mismatch).
- **Tests:** core 219/219, react 6/6, next 7/7 stay green; docs `next build` succeeds.

### `@theme-kit/react` — grouped props API (`behavior`/`appearance`/`icons`) + `autoHideDelay`

- **`autoHideDelay`** added to `OverlayScrollbarOptions` (core types) and consumed in `resolveOptions` + `scheduleAutoHide` in manager.ts. Default `900` ms. Only takes effect when `autoHide` is `true`.
- **Grouped props API** (`behavior`/`appearance`/`icons`) implemented in `ThemeScrollbar` React wrapper. Flat top-level props override grouped ones (backwards-compatible). `autoHideDelay` now properly typed in `ThemeScrollbarBehavior` and `ThemeScrollbarProps`.
- **Fixed** `bGet` generic helper that caused `exactOptionalPropertyTypes` build errors — replaced with explicit inline merge logic.
- **Tests:** core 219/219, react 6/6, next 7/7 stay green; docs `next build` succeeds.

### Docs — Custom Scrollbar page restyled + CSS import docs + layout.tsx grouped props

- **Custom Scrollbar page** (`apps/docs/app/custom-scrollbar/page.tsx`) restructured to match the Custom Themes page appearance:
  - Header with scrollbar SVG icon, title, and description
  - Numbered sections using `sectionHeader` (numbered circle + title + description)
  - New **CSS setup** section documenting `@import "@theme-kit/core/scrollbar.css";` in `globals.css`, `app.css`, or `style.css`
  - All code snippets updated to use the grouped `behavior`/`appearance`/`icons` props API
  - "What's next" section with glass-card links (API Reference, Custom Themes, Core Concepts)
- **Docs layout.tsx** (`apps/docs/app/layout.tsx`) updated to use the grouped props API: `behavior={{ autoHide: true }}` and `icons={{ up: ArrowUpIcon, down: ArrowDownIcon }}`.
- **Added "Recommended setup" section** to the Custom Scrollbar page covering: root layout placement, CSS import requirement, recommended configuration (autoHide, autoHideDelay, thickness, radius, arrows, hoverExpand), theme integration (strips inherit `--theme-color-*` tokens automatically), and best practices (don't manually hide native scrollbars, use include/exclude, use grouped icons).
- **Tests:** core 219/219, react 6/6, next 7/7 stay green; docs `next build` succeeds.

## Completed Build Fixes (2026-08-05) — Theme transition engine + white-shift fix

### `@theme-kit/core` — theme transitions rebuilt end-to-end (diff → plan → scan → coordinate → cleanup)

Re-architected how theme changes animate: instead of "animate every CSS variable + preset string on `:root` and hope descendants behave", the runtime now owns the whole visual-update pipeline.

- **New animation module** (`packages/core/src/animation/`):
  - `types.ts` — `ThemeDiff`, `EMPTY_THEME_DIFF`, `TransitionPlan` (`animatesColors`, `elementProperties`, `duration`, `easing`), `ThemeAnimationInput`.
  - `classify.ts` — single source of truth mapping token groups (colors, radius, spacing, typography, shadows, borders, layout, transforms) to concrete CSS properties.
  - `diff.ts` — `createThemeDiff(prev, next)` compares resolved CSS-variable values per token group; an empty/absent baseline is treated as "nothing changed", so the first apply is always instant.
  - `planner.ts` — `createTransitionPlan(diff, options?, env?)` returns `null` for non-animatable changes (layout/z-index/breakpoints), when transitions are disabled, `preset: "instant"`, or reduced motion.
  - `scan.ts` — TreeWalker DOM scan that skips invisible/detached nodes and only transitions elements whose computed style actually uses a planned property.
  - `coordinator.ts` — `runThemeAnimation`/`cancelThemeAnimation`: one active run per target (rapid toggles cancel the previous run instead of stacking loops); attach → flush (`offsetHeight`) → swap vars next rAF → cleanup after the longest transition + buffer.
- **Wiring** — `css-variables.ts` `applyTheme` now runs `createThemeDiff` → `createTransitionPlan` → `runThemeAnimation`, with an instant path when suppressed, reduced motion, or nothing animatable changed. The old `applyThemeTransition`/effect-driven transitions were removed (the DOM binding no longer starts transitions).
- **New `preset` option** on `ThemeTransitionOptions` — `"smooth"` / `"subtle"` / `"instant"` (or a raw property filter) curates which properties may animate.
- **Root-cause fixes** — no more per-toggle `<style>` `textContent` rewrite (persistent, content-stable transition node); no more `:root` transition on preset strings + every registered var; colors animate purely through the `@property`-registered `--theme-color-*` vars on `:root` and inherit into descendants.

### `@theme-kit/core` — white-shift fix on theme toggle (double-easing suppression + real View Transition crossfade)

- **Double-easing suppressed** — during an animated switch the coordinator tags the root with `data-theme-kit-animating`, and a persistent, content-stable stylesheet mutes *every* descendant transition (`[data-theme-kit-animating] :not([data-theme-kit-animating]) { transition: none !important }`). Elements with their own Tailwind `transition-colors`/`transition-all` can no longer re-ease the same resolved colors on top of the inherited interpolation; only the explicitly planned element properties are re-enabled (inline `!important`), and all original transitions are restored after the swap settles.
- **View Transition crossfade actually works now** — the old `useViewTransition` path was dead: the planner returned `null` (instant snap) and `document.startViewTransition` was never called. The binding now owns it: `useViewTransition: true` + API support → a real `startViewTransition(() => swap)` cross-fade. The new theme is painted *beneath* a fading snapshot of the old one, so a light→dark toggle never washes through white intermediates — this is the actual fix for the "white shifting on bordered cards" during toggles. (Supersedes the earlier "disable the View Transition" workaround from 2026-08-02 — the flash there was because the API was never actually invoked, not because the crossfade itself was wrong.)
- **Graceful fallback** — when `startViewTransition` is unsupported (Firefox/Safari), the binding falls back to the smooth CSS-variable interpolation instead of snapping.
- **Docs config** — `apps/docs/app/layout.tsx` now uses `transition={{ enabled: true, preset: "smooth", duration: 100, useViewTransition: true }}`.
- **Tests** — new `test/animation.test.ts` (diff engine, planner classifier, coordinator attach→swap→cleanup, invisible-node skip, run cancellation, suppression); `transitions`, `css-variables`, `runtime`, and `ssr-adapters` updated for the frame-batched swap and the real View Transition path; fixed a test-isolation issue where persisted theme selection (localStorage) leaked across tests. **236/236 pass**, core + docs typecheck, docs `next build` succeeds.

### Docs — custom scrollbar search, code-block theming/radius, transition fixes

- **Custom Scrollbar now searchable** — the `/custom-scrollbar` page is a hand-written React page (not `content/` markdown), so it was missing from the docs search index (`apps/docs/lib/search.ts`, which only covered `STATIC_ENTRIES` + `content/*.md`). Added a `Custom Scrollbar` static entry (title, `/custom-scrollbar`, blurb covering ThemeScrollbar setup per framework, grouped options, thumb colors / CSS custom properties, container-scoped bars, and the pre-paint engine). Searching "scrollbar"/"custom scrollbar" now matches.

- **Code-block background + border-radius** — Shiki was inlining `--shiki-light-bg:#fff;--shiki-dark-bg:#24292e` on `<pre>`, and `.code-block pre.shiki` used those as the background, so code blocks ignored the theme-kit `muted` surface (pure white in light, GitHub gray in dark) instead of the subtle `--theme-color-muted` token. Fixed by:
  - `apps/docs/lib/highlight.ts` — `highlightCode` now strips `--shiki-light-bg`/`--shiki-dark-bg` from the Shiki output after `codeToHtml`.
  - `apps/docs/app/globals.css` — `.code-block pre.shiki` and `html.dark .code-block pre.shiki` now use `background: var(--theme-color-muted)` in both modes (subtle/low surface).
  - **Radius mismatch** — the rounded `.code-block` border (0.6rem) previously didn't clip the square `pre` corners reliably; the scroll container `.code-block > div:last-child` now inherits the same `border-radius: 0.6rem` so the pre background is clipped to matching rounded corners.
- **Transition fixes** — two `startViewTransition` calls per toggle (one from each binding) made the second call skip the first and reject with `Uncaught (in promise) AbortError: Transition was skipped`. Fixed by making the CSS-variables binding the single owner:
  - `adapters/dom/index.ts` — removed its own `startViewTransition`; the DOM binding now flips identity attributes instantly, gained a `subscribe?: boolean` option, and exposes an `apply` handle.
  - `adapters/css-variables.ts` — added `onBeforeSwap` hook invoked inside its single View Transition lightswitch before the variable swap, so old attributes + old colors are captured together (white-shift fix preserved).
  - `react/provider.tsx` — DOM binding defers to the CSS binding (`subscribe: !cssBindingDrivesDom`); its `apply` is passed as `onBeforeSwap`. The DOM binding still self-subscribes when the CSS binding is absent or stylesheet-backed.
  - Rebuilt core + react dists (docs consume via junction; stale dist was also masking earlier fixes). **236/236 core + 6/6 react tests pass**, core/react/docs typecheck, docs `next build` succeeds.
- **Stale dist caveat** — core dist was previously missing the View Transition branch in `createCSSVariablesBinding` and still had the planner's old `useViewTransition` early-return, so toggling used an instant snap. Rebuilding `packages/core` (`npm run build`) fixed it.

## TODO

I actually think this is one of the biggest opportunities for Theme Kit to differentiate itself.

Most libraries either:

rely on ::-webkit-scrollbar
tell users to install another library
don't address scrollbars at all

None of them provide a fully theme-aware, animated, framework-independent scrollbar.

I would not build it as "just another custom scrollbar." I'd build it as a scrollbar overlay engine.

Philosophy

The browser still performs all scrolling.

Theme Kit never replaces scrolling.

Instead, it renders an overlay that visually represents the scrollbar.

So:

Document

│
├── Native scrolling
│
└── ThemeScrollbar Overlay

The overlay is only UI.

Scrolling stays native.

That means:

inertia scrolling still works
touch still works
wheel scrolling works
keyboard scrolling works
PageUp/PageDown works
Home/End works
accessibility stays intact

The overlay is only synchronized.

Architecture

I'd split it into five layers.

ThemeScrollbar

├── Scroll Manager
├── Thumb Physics
├── Renderer
├── Interaction Layer
└── Theme Integration
Scroll Manager

Responsible for:

currentScroll

maxScroll

viewportHeight

documentHeight

thumbPosition

thumbSize

Listen to

scroll

resize

MutationObserver

ResizeObserver

Nothing else.

Thumb Physics

This is where the scrollbar becomes premium.

Instead of

thumb = linear

Use easing.

Scrolling

↓

thumb interpolates

↓

very smooth

scroll position

↓

target position

↓

requestAnimationFrame

↓

lerp()

↓

render

Example

thumb += (target - thumb) * 0.15

Every modern premium UI does this.

Renderer

Responsible only for

track

thumb

Nothing else.

DOM

<div class="tk-scrollbar">

    <div class="track">

        <div class="thumb"/>

    </div>

</div>

Track

position:fixed;

right:2px;

top:0;

bottom:0;

Thumb

position:absolute;

transform:translateY(...)

Never animate

top

Always

transform

GPU accelerated.

Interaction Layer

Makes the overlay interactive.

Supports

drag thumb

↓

scroll page

Also

click track

↓

jump

↓

smooth scroll

Hover

hover

↓

expand width

↓

fade in

↓

increase opacity

Dragging

pointerdown

↓

capturePointer()

↓

pointermove

↓

scrollTo()

↓

releasePointer()
Theme Integration

This is where Theme Kit shines.

Scrollbar colors come directly from tokens.

background

↓

track
accent

↓

thumb
primary

↓

active thumb

Example

track

background

↓

muted
thumb

↓

border

↓

accent

↓

primary hover
Animation

Never animate

background

color

individually.

Instead

CSS Variables

↓

transition

↓

automatic

So

--theme-scrollbar-thumb

↓

changes

↓

thumb animates

No flash.

Auto Hide

Very important.

Behavior

Idle

↓

opacity 0

Scroll

↓

opacity 1

↓

timer

↓

fade out

Exactly like macOS.

---

# Hover Expand

Idle

6px

Hover

10px

Dragging

12px

Very premium feeling.

---

# Dynamic Thumb Size

Native browsers already do this.

Compute

thumbHeight

=

viewportHeight²

/

documentHeight

Clamp

minimum

32px

Maximum

100%

---

# Overscroll

Optional.

When user reaches bottom

thumb

↓

compress slightly

↓

bounce back

Very subtle.

Feels excellent.

---

# Momentum

If user flicks quickly

Thumb should continue

slightly

using interpolation

instead of instantly jumping.

---

# Multiple Scroll Areas

This is where I think Theme Kit can be unique.

Instead of only

window

Support

<div overflow:auto> ```

Example

<ThemeScrollbar target={ref}/>

or

<ThemeScrollbar
    selector=".scrollable"
/>
Accessibility

Respect

prefers-reduced-motion

Disable

lerp

bounce

animations

Automatically.

RTL

Support

left side

right side

automatic
Mobile

Hide.

Native mobile scrollbars are already excellent.

Desktop only by default.

API

Instead of

scrollbar={{
...
}}

I'd expose

<ThemeScrollbar

    autoHide

    hoverExpand

    draggable

    smooth

    thickness={8}

    radius={999}

    minThumbSize={32}

    offset={2}

    trackOpacity={0.25}

    thumbOpacity={0.7}

    animationDuration={180}

    target="window"

/>
Internal structure
packages/react

components/

    ThemeScrollbar/

        index.tsx

        Track.tsx

        Thumb.tsx

        useScrollbar.ts

        physics.ts

        observer.ts

        animation.ts

        styles.css

Core logic

packages/core

scrollbar/

    manager.ts

    calculations.ts

    observers.ts

    physics.ts

    types.ts

Then every framework can reuse the same engine:

React
Vue
Svelte
Solid
Angular
Web Components

Only the rendering layer changes.

Future Features

Because it's your own scrollbar, you can add features that native scrollbars simply can't provide:

Scroll progress indicator (reading progress for documentation pages).
Section markers (small ticks showing headings or search results along the track).
Current section highlight synchronized with the table of contents.
Error/warning markers for code editors or playgrounds.
Search result markers similar to browser "Find" highlighting.
Timeline mode for undo/redo history visualization.
Mini-map mode for long code files or documentation.

These can all be layered onto the same overlay without changing the scrolling behavior.

The principle I'd follow

The scrollbar should never feel like a replacement for the browser's scrollbar. It should feel like a native enhancement: smooth, theme-aware, performant, accessible, and composable. If someone turns Theme Kit off, the page should still scroll exactly as expected. If they turn ThemeScrollbar on, the experience becomes visually richer without sacrificing the reliability and performance of native scrolling.

I think that philosophy fits perfectly with Theme Kit's broader goal: improving existing theming behavior without fighting the platform.

Integrate the scrollbar on the apps/docs page, it should be available for all of the frameworks.

- [x] **Scrollbar rebuilt from scratch as a layered overlay engine** — implemented the five-layer architecture in `packages/core/src/scrollbar/` (`types.ts`, `calculations.ts`, `physics.ts`, `observers.ts`, `manager.ts`): the browser still performs all scrolling; Theme Kit only renders a theme-aware `div.tk-scrollbar > .track > .thumb` overlay. Includes:
  - **Thumb physics** — rAF `lerp(current, target, α)` easing (`animationDuration` time constant, default 180ms) so the thumb interpolates smoothly toward the scroll target instead of snapping; momentum emerges naturally from the interpolation. Respects `prefers-reduced-motion` (snaps instantly).
  - **Renderer** — real `.track` + `.thumb` elements, `transform: translate3d()` only (GPU accelerated, never `top`/`left`), `.tk-v`/`.tk-h` strips, `border-radius`.
  - **Interaction layer** — drag the thumb (`setPointerCapture` → scroll), click the empty track to jump/smooth-scroll, hover to expand + fade in, auto-hide like macOS (1.2s idle timer), grab/grabbing cursor, RTL mirroring.
  - **Theme integration** — colors come from `--tk-scrollbar-track/thumb/thumb-hover/thumb-active` tokens w/ CSS fallbacks to `--theme-color-*`, so it re-themes live with no flashes.
  - **Dynamic thumb size** — `clientSize² / contentSize` clamped to `[minThumbSize, clientSize − 2·offset]`; subtle overscroll compression at bounds (rubber-band, default on); desktop-only by default (coarse-pointer detection, opt-in via `touch`).
  - **Multiple scroll areas** — document + every nested scrollable (with `include`/`exclude` selectors), synced via Mutation/Resize/scroll/wheel observers.
  - **New public options** — `autoHide, hoverExpand, draggable, clickToJump, smooth, overscroll, thickness, hoverThickness, radius, minThumbSize, offset, trackOpacity, thumbOpacity, duration, animationDuration, axes, include, exclude, touch, dir`.
  - Public entry kept backward compatible: `createOverlayScrollbar` (+ new `createThemeScrollbar` alias) re-exported through `utils/overlay-scrollbar.ts`; tests extended to 9 cases.
- [x] **Available for all of the frameworks** — wrappers expose the full new options: `@theme-kit/react` (`<ThemeScrollbar />`), `@theme-kit/web` (`<theme-kit-scrollbar>` custom element), `@theme-kit/vue`, `@theme-kit/svelte`, `@theme-kit/solid`, and **new `@theme-kit/angular`** (`[themeKitScrollbar]` standalone directive, `ThemeScrollbarDirective`). Meta-frameworks re-export it: `@theme-kit/next`, `@theme-kit/remix`, `@theme-kit/astro` (from React), `@theme-kit/nuxt` (from Vue).
- [x] **Integrated on apps/docs** — the root layout now mounts `<ThemeScrollbar thickness={8} hoverThickness={12} offset={2} minThumbSize={40} radius={999} trackOpacity={0.2} thumbOpacity={0.7} smooth draggable clickToJump overscroll animationDuration={180} />` so the whole docs site scrolls on the theme-aware overlay. All 14 packages + docs build and typecheck.
- [x] **Native-behavior fixes (out-of-the-box, no flash)** — made the overlay behave exactly like the browser scrollbar:
  - **No reload flash** — native scrollbar is now hidden from first paint. `@theme-kit/core` ships `scrollbar.css` (exported as `@theme-kit/core/scrollbar.css`, imported by the docs `globals.css`) and the React wrapper creates the engine in `useLayoutEffect` so the overlay replaces the native scrollbar *before* first paint.
  - **Document-only by default** — the overlay now tracks **only the document scrollbar** out of the box (exactly like native). Inner scrollables (code blocks, tables, the fixed docs sidebar) are no longer overlaid and keep their native scrollbar; they can be opted into per-container via `include`/`exclude` selectors. Native-hiding CSS is scoped to `html`/`body` only, so other content's scrollbars are never wiped out.
  - **Touch stays native** — `createOverlayScrollbar` returns `null` on coarse-pointer devices unless `touch: true`, and the wrappers no longer force the `data-theme-kit-scrollbar` attribute themselves (the engine owns it), so mobile never breaks.
  - The engine keeps the premium physics (rAF lerp, hover expand, click-to-jump, overscroll, RTL, reduced-motion), but now only on the document scrollbar by default.
- [x] **144Hz / visibility / cursor / arrow refinements** — addressed the user-visible polish issues:
  - **Accurate physics at any refresh rate** — easing now uses real elapsed `dt` from `performance.now()` (capped at 50ms, `FRAME_MS` fallback), so the thumb moves at the same speed on 60Hz, 144Hz and 240Hz displays instead of stuttering or racing.
  - **Visible on light backgrounds** — the engine derives the thumb/track/button colors from the theme `foreground` token via `hexToRgb` → `rgba()` (fallback `rgba(115,115,115)`), so it contrasts in both light and dark themes. Docs `globals.css` tokens no longer override with `transparent` / border-derived colors; thumb defaults to `0.85` opacity, track to `0.18`.
  - **No cursor change** — `cursor: grab/grabbing` removed; the default cursor is preserved while hovering, clicking or holding.
  - **Native arrow buttons** — new `arrows` option (default `true`): `.tk-arrow` up/down (and left/right) buttons like browser scrollbars. Clicking scrolls a 12% page step (min 32px); holding repeats after a 350ms delay then every 60ms. Set `arrows={false}` to remove them entirely.
  - **Location always discoverable** — the thumb fades fully when idle, but a faint track (opacity `min(trackOpacity, 0.06)`) stays so the scrollbar is still findable.
  - **Sidebar now overlaid** — the fixed docs nav (`.tk-sidebar-scroll`) is included via `<ThemeScrollbar include={[".tk-sidebar-scroll"]} />`, so the docs navigation menu gets the theme-aware overlay too instead of no scrollbar at all.
  - Tests extended to 12 cases (arrow rendering + foreground-derived colors); all 245 tests pass, all packages + docs build.
- [x] **Out-of-the-box overlay, everywhere + polish round 2** — fixed the remaining felt-issues:
  - **Behaves correctly while scrolling up/down** — dragging the thumb and clicking the arrows now scroll **instantly** (direct `scrollTop`/`scrollLeft` writes that ignore `scroll-behavior: smooth`), so the thumb is 1:1 with the pointer and never lags; track-click still smooth-scrolls. The strip no longer changes width on hover, so it never "jumps" or feels stuck while scrolling.
  - **Appears everywhere a scrollbar should** — the engine now tracks the document **plus every scrollable element** (sidebar, code blocks, tables, preview panes) by default; `include` selectors narrow the scope, `exclude` skips targets. The DOM walk is cached (warm rescans on mutation, full recompute every 4s) so large pages don't jank.
  - **No reload flash, no manual scrollbar CSS** — the engine injects its own stylesheet (hiding native `html`/`body` and every managed container via `data-theme-kit-scrollbar`), and `@theme-kit/core/scrollbar.css` (now imported by the docs) hides the document track from the very first paint. Nothing needs to be configured in user projects.
  - **No hover width change** — `hoverExpand` now defaults to `false`; the strip thickness stays constant (the option still exists for opt-in growth).
  - **Bigger, customizable arrow buttons** — buttons are now a generous `max(18, thickness·1.6)`px hit area (were `8`px) with larger CSS triangles; new `arrowIcon` / `arrowUpIcon` / `arrowDownIcon` / `arrowLeftIcon` / `arrowRightIcon` options accept any `innerHTML` (inline SVG, text, HTML) and are exposed on `<ThemeScrollbar />` (React/Vue/Solid/Svelte/Web).
  - **Unwanted CSS removed from docs** — the `--tk-scrollbar-*` token block is gone from `globals.css`; only the library's `scrollbar.css` import remains.
  - **Smooth theme transitions, no color flashes** — `applyThemeTransition` now injects the transition globally (`*, *::before, *::after`) for the duration of a switch, so the `<body>` background and every element using theme color tokens cross-fade instead of snapping; cleanup is auto-scheduled (old code removed the transition after 2 frames, cutting animations short and causing flashes). Docs `transition.duration` bumped to 200ms.
  - Tests extended to 13 cases (custom arrow icons, all-scrollables default, auto attribute); **246/246 pass**, all packages + docs build.
- [x] **Exact tracking, themed out of the box, clean arrows + autoHide** — final polish round:
  - **Exact value, zero delay** — `smooth` now defaults to `false`, so the thumb always sits exactly at the scroll position (no easing lag); pressing the arrows or dragging already scrolls instantly. `smooth: true` still opts into eased travel.
  - **Theme colors out of the box** — the thumb and arrows now take the active theme's `primary → accent → foreground` color (`hexToRgb` → `rgba()` fallback) and the track a faint wash of the same. No `--tk-scrollbar-*` configuration needed; the scrollbar is always visible and follows the selected theme.
  - **autoHide option** — `autoHide` (default `true`): the scrollbar is completely invisible when idle and appears the moment scrolling starts. On boot only the document scrollbar is revealed, so inner scrollables never flash a stack of overlays on page load.
  - **Arrows: no background, always fits** — arrow buttons are transparent (just a themed glyph, no pill background) and the glyph scales via a `--tk-arrow` CSS var (`thickness`-derived) so it always fits within the strip width.
  - **No more squeezed content** — `scrollbar-gutter: stable` is applied to `html`/`body` (injected + `scrollbar.css`), so hiding the native track reserves the gutter and the page never reflows.
-   Tests extended (themed color + transparent-arrow assertions); **246/246 pass**, all packages + docs build.

## Completed Build Fixes (2026-08-11)

### Docs — transition-API docs reconciled with the public API

The framework pages and animation docs advertised several APIs that don't exist in the public surface; every entry now documents the real mechanism.

- **`lib/frameworks.tsx` — fake transition hooks removed.** All 8 `useThemeTransition()` entries (React, Next, Vue, Svelte, Solid, Astro, Nuxt, Remix) and the Angular `injectThemeTransition()` entry were replaced with the real runtime toggle: `runtime.store.set(theme, { suppressTransition: true })`. Each framework's entry now uses its actual runtime accessor (`useThemeRuntime()`, `getThemeRuntime()`, `getGlobalRuntime()`, `injectThemeRuntime()`) and points custom-animation users at the real core exports (`createThemeDiff` + `createTransitionPlan` + `runThemeAnimation`).
- **`app/animation/page.tsx` — API table corrected.** `createAnimationsPlugin` (a real public export of `@theme-kit/core`, verified against the built dist) is now documented accurately instead of "Legacy"; the `applyThemeTransition` row (an internal `adapters/dom` helper, not re-exported) was replaced with the actual `runtime.store.set(theme, { suppressTransition: true })` per-update suppression toggle.
- **Verification:** docs typecheck passes; every `useThemeTransition`/`injectThemeTransition` reference in the docs is gone.

### `@theme-kit/core` — `createScopedThemeBinding` accepts optional `transition`

`ScopedThemeBindingOptions` now accepts `transition?: ThemeTransitionOptions`. The scoped binding stores it and uses it for its internal CSS-variable updates, so scope-internal theme changes animate consistently with the parent runtime.

- **New tests** in `test/scoped-theme.test.ts`: "passes transition through when provided" + "does not crash when no transition is provided". **257/257 core tests pass**.

### `@theme-kit/react` / `@theme-kit/astro` — `ThemeScope` gains `transition` prop

- **`packages/react/src/theme-scope.tsx`** and **`packages/astro/src/theme-scope.tsx`**: `ThemeScopeProps` now accepts `transition?: ThemeTransitionOptions`. Defaults to the owning provider's `runtime.transition` when unset; the scope-level prop wins when supplied. Passed through via conditional spread to `createScopedThemeBinding` so `exactOptionalPropertyTypes` stays happy.

### `@theme-kit/vue` — `ThemeScope` rewritten to use scoped binding

- Previously `ThemeScope` called `runtime.store.set(theme)` (global mutation). Now it renders a `<div>` wrapper and drives scoped CSS variables through `createScopedThemeBinding`, matching React/Astro behavior.
- Accepts `transition?: ThemeTransitionOptions`.

### `@theme-kit/angular` — `ThemeScopeDirective` rewritten to use scoped binding

- Previously the directive called `runtime.store.set(theme)` on the host element. Now it injects `ElementRef` and applies scoped CSS variables via `createScopedThemeBinding(this.el.nativeElement, ...)`.
- New `@Input("themeKitScopeTransition") transition?: ThemeTransitionOptions`.

### `@theme-kit/web` — `ThemeKitScope` supports `theme-transition` attribute

- Observed attributes expanded to `["theme", "theme-transition"]`. The JSON `theme-transition` attribute is parsed and forwarded to `createScopedThemeBinding`.

### `@theme-kit/next` — re-exports `ThemeScope` from React

- `packages/next/src/index.ts` now exports `ThemeScope` and `ThemeScopeProps` so Next.js users can import from `@theme-kit/next/client`.

### Docs — `ThemeScope` snippets updated across all framework guides

- **`apps/docs/app/scoped-theme/page.tsx`** — all 9 framework snippets (React, Next.js, Vue, Nuxt, Svelte, Solid, Angular, Web Components, Vanilla JS) now show the `transition` prop (`duration` + `easing`).
- **`apps/docs/lib/packages.tsx`** — React scoped-subtree snippet updated.
- **`apps/docs/lib/frameworks.tsx`** — React, Svelte, Solid, Angular history+scope snippets updated.
- **`apps/docs/lib/use-cases.ts`** — React dashboard, Next.js widget, Vue subtree snippets updated.

- **Verification:** core tsc + 257/257 tests pass; react tsc + 8/8 tests pass; docs tsc passes; core/react/astro builds succeed.

### Docs — `AnimationLab` uses `ThemeScope` and enhanced scoped region

The live demo now uses `<ThemeScope>` from `@theme-kit/react` for the scoped/nested region instead of manual CSS variables. The scoped subtree cross-fades on its own timeline, driven by the same `transition` config the provider uses.

- **`apps/docs/components/animation/animation-lab.tsx`** — scoped region updated to use `ThemeScope` with `theme="scope-light"` / `theme="scope-dark"` and `transition={{ enabled, duration, easing, preset }}`. Removed manual `MINI_VARS` / `scopedRef` logic; the component now toggles `scopedTheme` state and lets `ThemeScope` handle the rest.

### Docs — Animation page restructured: framework-specific transition section

The "How theme transitions work" section was removed. Replaced with a clearer "Enable transitions in your framework" section that shows step-by-step examples for React, Next.js, Vue, Svelte, Solid, Angular, Astro, and Nuxt.

- **`apps/docs/app/animation/page.tsx`** — section numbers re-sequenced after removing the pipeline explanation. New framework-specific code blocks with `ThemeScope` examples for each framework, plus a concise step-by-step list (Install → Register → Enable → Choose preset → Scope).

### Docs — information-architecture restructure (Overview / Get Started / Home / learning path)

The docs moved from "sidebar → random pages" to a sequenced learning path with three distinct jobs: the homepage sells/discovery, `/overview` builds the mental model, `/get-started` gets the user running.

- **`/overview` rebuilt as a standalone interactive architecture page** (no longer a tile grid + markdown). Sections, in order:
  - Hero ("Theme Kit — a framework-agnostic theme system built around families, semantic tokens, and a runtime") with `[Try the playground]` / `[Get started]` CTAs that re-theme with the docs.
  - "Why Theme Kit?" — 8 concept cards (Theme families, Semantic tokens, SSR/zero flash, Runtime, Scoped themes, Theme generation, Accessibility, Adapters), each linking to its page.
  - "One runtime. Every framework." — `FrameworkCompare` (client): pick any framework and the aside shows its package, tagline, and install command.
  - "Themes aren't just light and dark" — `MentalModel` (client): a real family × mode diagram. Family chips + light/dark/system buttons drive the *actual* runtime, and both theme cards render real `ThemeDefinition` token swatches from the registry.
  - "Semantic tokens" — embeds the live `TokenTree` (same component as `/playground`), showing the docs' own active theme tokens.
  - "Built for real applications" — checklist of runtime features (SSR, zero flash, persistence, cross-tab sync, scoped themes, transitions, accessibility).
  - "Works with your ecosystem" — chip links to every `/libraries/*` page (shadcn, MUI, Ant, Chakra, Bootstrap, daisyUI, Open Props, Mantine, UnoCSS).
  - `LearningPath` band + closing "Start building" CTA.
- **`/get-started` rebuilt as a framework-chooser guide**:
  - "How are you building?" — grid of all 11 framework cards; **Next.js is flagged "Recommended — SSR-first · zero-flash"** and is the default selection.
  - Dynamic 5-step guide driven by the selected framework: **1) Install** (`@theme-kit/core` + the adapter, pnpm/npm/yarn/bun tabs), **2) Create your themes** (real `defineTheme` example), **3) Add the provider** (the framework's own `quickStart` snippet + entry-point label; Next.js gets a Zero-Flash callout explaining server-side resolution before hydration, linking to `/zero-flash`), **4) Use the theme** (the framework's real usage snippet), **5) Customize** (its deeper snippet + chip links to tokens/custom-themes/animation/advanced features).
  - **"Your first Theme Kit application"** — `ResultDemo` live card built entirely from semantic tokens with "Try changing: Theme / Family / Mode / Primary color / Radius" controls (family chips + light/dark/system buttons run the real runtime; primary color / radius route to Theme Studio / Playground).
- **Homepage `/` — distinct marketing/discovery job.** Dropped the encyclopedic `Solves` + `OutOfBox` blocks (their content lives on `/overview` and the leaf pages) so home doesn't duplicate Overview. Hero CTAs now route `Get started` → `/get-started` and `Try the playground` → `/playground`; a `LearningPath` band links the full flow. Kept the interactive hero, framework ecosystem strip, theme-family gallery and the "Start in three lines" CTA.
- **Learning-path navigation** — shares the sequence Overview → Playground → Get Started → Framework guides → Core Concepts → Tokens → Zero Flash → Custom Themes → Advanced → Architecture:
  - New `DocsPagination` renders prev/next cards at the bottom of every `DocsLayout` page along that path.
  - Sidebar (`docs-layout.tsx`) "Learn · Concepts" reordered to lead with Overview then Get Started; header nav gained a "Get Started" item; footer Documentation column leads with Overview/Get Started.
- **New files:** `components/overview/mental-model.tsx`, `components/overview/framework-compare.tsx`, `components/get-started/guide.tsx`, `components/get-started/result-demo.tsx`, `components/learning-path.tsx`, `components/docs-pagination.tsx`.
- **Correctness notes:** family/mode lists are derived from the live theme registry (so the diagrams stay honest to the real presets, e.g. Plum/Mint); Tailwind v4 important-syntax used (`px-2!`), `m[0]` indexing avoided for `noUncheckedIndexedAccess`.
- **Verification:** docs typecheck clean; `next build` succeeds; live smoke tests on `/`, `/overview`, `/get-started` return 200 with all key sections rendered.

## Completed Build Fixes (2026-08-14) — `@theme-kit/nuxt` Tier-1 SSR-first integration

`@theme-kit/nuxt` is now the Vue-ecosystem equivalent of the `@theme-kit/next` flagship: SSR-first theme resolution, zero-flash blocking bootstrap, cookie + localStorage sync, native Nuxt composables, config-driven transitions, custom scrollbar, theme-aware `<html>`, and declarative `themeKit` config.

- **`packages/vue/src/index.ts`** — exported `ThemeKitSymbol` (InjectionKey) so the Nuxt plugin can provide its runtime app-wide.
- **`packages/nuxt/src/server/`** — new SSR helpers mirroring the Next contract: `fingerprint.ts` (`computeFingerprint` = `` `${defaultTheme}|${sorted names}` ``), `cookies.ts` (`themeKitCookieNames`, `parseCookieHeader`, `encodeCookieValue`; names: `theme-name`, `theme-family`, `theme-mode`, `theme-fingerprint`), `resolve.ts` (`resolveThemeFromCookies` — validates the fingerprint, rejects stale cookies, resolves family+mode+theme), `bootstrap.ts` (`createNuxtThemeBootstrapScript`, `cssVariablesStyle`).
- **`packages/nuxt/src/runtime/plugin/index.ts`** — rewritten core plugin:
  - Server: reads `useRequestHeaders(["cookie"])`, resolves via `resolveThemeFromCookies`, renders themed `<html data-theme data-theme-mode data-theme-family class="dark tk-scrollbar">`, emits `:root` CSS variables + `html{color-scheme}` with `tagPriority:"critical"`, a `@media (prefers-color-scheme: dark)` block for `system` mode, pre-paint scrollbar CSS, and the blocking bootstrap `<script>` first in `<head>`. SSR runtime created with `dom:false, cssVariables:false` and provided via `ThemeKitSymbol` so `useTheme()`/`useThemeRuntime()` work during SSR. Initial state pushed through `useState("theme-kit:initial")`.
  - Client: single app-wide runtime created with `readPersistenceOnInit: !initialFromPayload.value`, provided via `nuxtApp.vueApp.provide(ThemeKitSymbol, …)` + `nuxtApp.provide("themeKit"|"themeKitRuntime", …)`; a cookie sync subscription mirrors selection back (`theme-name`/`family`/`mode`/`fingerprint` + `.dark` class toggle) so the server renders the same theme next request.
- **`packages/nuxt/src/runtime/utils/persistence.ts`** — `createNuxtThemePersistence` (localStorage + cookie mirror + `storage`-event cross-tab sync; default key `theme-selection`).
- **`packages/nuxt/src/runtime/components/`** — `ThemeProvider.vue` now delegates to the plugin runtime (`useThemeRuntime()` + `v-bind`); new `ThemeScrollbar.vue` wrapper; `ThemeScope.vue` delegates to the Vue scoped binding.
- **`packages/nuxt/src/index.ts`** — `ModuleOptions` extended with `transition` (bool | `ThemeTransitionOptions`), `scrollbar` (bool | `PrePaintScrollbarOptions`) and `storageKey`; server helpers re-exported.
- **`examples/nuxt-app`** — declarative config (`themes` from `customThemes` + presets/brands/accessibility, `defaultTheme:"mint-light"`, `initialMode:"system"`, `initialFamily:"mint"`, `transition:{duration:360,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}`, `scrollbar:true`); `app.vue` no longer wraps a `<ThemeProvider>`.
- **Bugfix (found during SSR verification):** the Nuxt `ThemeScope.vue` mutated the *global* store during SSR (`store.set(t)` with `immediate:true`). Because the selection controller subscribes to the store (theme-selection.ts), the shared selection was rewritten to `ocean/light` for every component rendered after the scope (SyncDemo SSR-rendered `ocean/light` while ThemeSwitcher showed `mint/system`). Fixed by delegating to the Vue scoped `ThemeScope`.
- **Docs updated:** `lib/frameworks.tsx` (Nuxt entry — Server/Client/Transition/Scrollbar groups, SSR-first tagline, config-driven snippets), `lib/packages.tsx` (Nuxt entry — SSR + zero-flash groups, `transition`/`scrollbar` snippet), `lib/use-cases.ts` (nuxt section — SSR-first resolution, `$themeKit` plugin access, `ThemeScope`/`ThemeScrollbar`, fixed a bogus `ThemeModeButton` reference), `lib/api-reference.ts` (nuxt tagline), `packages/nuxt/README.md` (rewritten: Server / Client / Config / Module sections).
- **Verification:** `@theme-kit/vue` + `@theme-kit/nuxt` build clean; `nuxt build` for `examples/nuxt-app` succeeds (Nuxt 3.21.10); `pnpm --filter @theme-kit/docs typecheck` passes; SSR smoke tests on `.output/server/index.mjs`: no-cookie request → `data-theme="mint-light"` + `data-theme-mode="light"` + `data-theme-family="mint"` + `tk-scrollbar`; dark cookie with valid fingerprint → `data-theme="mint-dark"` + `class="dark tk-scrollbar"`; stale fingerprint → rejected, falls back to default; blocking bootstrap present in `<head>`; both scoped cards (`data-v-tk-scope`), dark-media block and CSS-variable `<style>` render server-side.

## Completed Docs/API Parity Audit (2026-08-14) — `update.md`

Full parity audit of every documented API against the real package exports. Result: **10 documented-but-nonexistent APIs found and corrected** (all documentation-only — no package source changed), plus a written parity report at `update.md`.

- **`runtime.setTheme("dark")` → `runtime.selection.setMode("dark")`** — the runtime has no `setTheme` (only `selection.setMode/setFamily/toggleTheme` and `store.set`). Fixed in `apps/docs/content/adapters.md` and `adapter-architecture.md`.
- **`useTheme().setTheme` → `useTheme().setFamily`** — the React hook returns `{ theme, mode, family, setMode, setFamily, toggleTheme }`, never `setTheme`. Fixed the daisyUI picker in `lib/use-cases-libraries.ts`.
- **`useBootstrapTheme({ injectCSS: false })`** — hooks (React/Vue/Svelte/Solid) accept only `{ strategy }`; `injectCSS` is a factory-only option. Removed the false "options flow through to the adapter" claim in `content/adapters.md` + `adapter-architecture.md` and documented the factory route.
- **`createMantineAdapter()`** — does not exist; Mantine ships a provider-based bridge (`createMantineTheme` + `MantineThemeProvider`). Corrected the React framework-guide feature list (`lib/frameworks.tsx`).
- **`synchronizeTransition(theme)` (Tailwind)** — does not exist; Tailwind exports `createTailwindPlugin`, `synchronizeDarkClass`, `themeCSS`. Replaced in `lib/frameworks.tsx`.
- **`createUnoTheme({ family: "berry" })`** — `createUnoTheme` accepts an `AdapterSource` (runtime/store/theme/tokens), not a selection. Rewrote with `resolveInitialTheme(...).theme` in `content/adapters.md`.
- **`ThemeKitProvider` from `@theme-kit/core`/`@theme-kit/react`** — React exports `ThemeProvider`; `createThemeRuntime` comes from `@theme-kit/core`. Corrected 4 spots in `adapter-architecture.md`.
- **Web runtime `runtime.setMode()` / `runtime.theme.name`** → `runtime.selection.setMode()` / `runtime.store.get().name` (`lib/use-cases.ts`).
- **Astro `runtime?.theme.name`** → `runtime?.store.get().name` (`lib/use-cases.ts`).
- **Angular signal misuse** — `injectTheme()` returns a `Signal<ThemeState>`; `theme.toggleTheme()`/`theme.theme()` must be `theme().toggleTheme()`/`theme().theme()`. Fixed in `lib/use-cases.ts`, `lib/packages.tsx`, `lib/frameworks.tsx`.
- **Zero-flash classification fix** — Svelte/SvelteKit reclassified as client-bootstrap (no SSR server package), not server-resolved, in `app/zero-flash/page.tsx`.
- **Scoped-theme page expanded** — `app/scoped-theme/page.tsx` now documents the fully-implemented contract it previously under-specified: local themes (`themes` prop / `localThemes` option — resolved first, shadow same-named parent themes, no second runtime), the scope `transition` inheritance model (`undefined`/`true` inherit, `false` disables, object merged over the provider config), reactive `{ family, mode }`/`family`+`mode` selection, and SSR pre-paint (system-based scopes ship a `@media (prefers-color-scheme: dark)` block). Verified against `packages/core/src/adapters/scoped-theme.ts` + all framework `ThemeScopeProps` (`themes` is consistent across React/Vue/Svelte/Solid).
- **Orphaned-content finding corrected** — `content/animation.md` and `content/framework-guides.md` are NOT rendered by any route (animation/framework-guides are JSX-driven) but ARE consumed by the site search index (`lib/search.ts` walks all of `content/*.md`), feeding `/animation` and `/framework-guides` results. Recorded as stale-but-live in `update.md` (re-sync or drop later), not deleted.
- **Verified accurate (no change):** core runtime surface + `suppressTransition`, adapter contract (`ThemeAdapter`/`AdapterStrategy`/`AdapterPlugin`/registry disposal), generated-theme adapters (MUI/Chakra/AntD), transition/animation exports, ThemeScope implemented semantics, Next `transition`/`scrollbar` props, `@theme-kit/core/vanilla` `ThemeKit` class, adapter coverage matrix, CSS-injection behavior.
- **Known gaps recorded in `update.md`:** `@theme-kit/tailwind` `createTailwindPlugin` is a stub (real integration is the CSS import); React hooks don't pass `injectCSS` (factory-only); no `@theme-kit/sveltekit` SSR package; `content/animation.md` and `content/framework-guides.md` are orphaned (not routed).
- **Verification:** `tsc --noEmit` passes; `next build` passes (84 static pages).

## Completed Build Fixes (2026-08-18) — Sunrise/sunset scheduling exposed to every framework

The existing core solar-time engine (`createScheduledThemeBinding`) is now surfaced as a framework-neutral reactive controller (`createThemeSchedule`) with an explicit enable/disable switch, wired through the runtime, and exposed via native accessors in every framework package. New `/sunrise-sunset` docs page + upgraded playground demo.

### `@theme-kit/core` — `createThemeSchedule` controller + runtime wiring

- **`packages/core/src/adapters/schedule.ts` (new)** — `createThemeSchedule(store, themes, options)` returns a `ThemeSchedule` controller:
  - **Controls:** `enable()` (applies the correct light/dark theme immediately + starts the check timer), `disable()` (leaves the current theme untouched, stops re-applying), `set({ latitude, longitude, checkInterval, skipApplyMs, enabled })` (reposition/reconfigure at runtime), `setLastSyncTime()` (feeds the `skipApplyMs` window from cross-tab syncs).
  - **Reactive state:** `enabled`, `active` (enabled AND the applied theme is one of the scheduled light/dark themes), `status` (`"active" | "disabled"`), `sunrise`, `sunset`, `nextTransition` (`{ at, theme, type: "activation" | "deactivation" }`), `nextActivation`, `nextDeactivation`, `lightTheme`, `darkTheme` — stable snapshot references via `subscribe()`.
  - **SSR-safe:** `ensureBinding()` is gated on `typeof window !== "undefined"` — no server timers; `state` still computes (so SSR render of a status badge works).
  - Types: `ThemeSchedule`, `ThemeScheduleState`, `ThemeScheduleStatus`, `ThemeScheduleTransition`, `ThemeScheduleOptions`, `ThemeScheduleSetOptions`, `EMPTY_THEME_SCHEDULE_STATE`. Exported via `adapters/index.ts`.
- **`packages/core/src/adapters/scheduled.ts`** — `createScheduledThemeBinding` extended with an `enabled` option + `setEnabled()`/`getEnabled()` on the returned binding (the engine-level on/off switch the controller drives).
- **`packages/core/src/runtime.ts`** — `ScheduledThemeOptions` gained `enabled`; the runtime now exposes `runtime.schedule: ThemeSchedule | null` (created from the `scheduled` option), wires `onSyncApply` → `schedule.setLastSyncTime(Date.now())`, and destroys the schedule in `runtime.destroy()`. `ScheduledPluginOptions` (`plugin/official/scheduled-plugin.ts`) gained `enabled` passthrough.
- **Tests:** new `packages/core/test/schedule.test.ts` — 13 cases (state shape, day/night next-transition math, enable/disable lifecycle + subscriber emits, `set()` repositioning, manual-override → `active:false` → schedule re-applies on next tick, `runtime.schedule` present/null). **295/295 core tests pass**, core builds clean.

### Framework accessors (all typecheck + build)

- **React** (`packages/react/src/hooks.ts`) — `useThemeSchedule(): ThemeSchedule | null`, a `useSyncExternalStore` subscription to schedule state. `hooks.test.tsx` extended (reactive status on enable/disable; null when unconfigured). **16/16 react tests pass**.
- **Next** (`packages/next`) — `useThemeSchedule` re-exported; `scheduled` prop threaded through the server `ThemeProvider` (`layout.tsx`) → `ClientThemeProvider` (`provider.tsx`). **7/7 next tests pass**.
- **Vue** (`packages/vue/src/index.ts`) — `useThemeSchedule()` composable → `{ schedule, state: Ref<ThemeScheduleState>, enable, disable, set }`; `scheduled` prop already accepted by `ThemeProvider`. New `packages/vue/test/schedule.test.ts` (2 cases). **6/6 vue tests pass**.
- **Nuxt** (`packages/nuxt`) — `useThemeSchedule` re-exported + auto-imported; `scheduled?: false | ThemeScheduleOptions` added to `ModuleOptions`, `ThemeKitRuntimeConfig` and threaded into both the SSR and client runtimes in the plugin.
- **Svelte** (`packages/svelte/src/index.ts`) — `getThemeSchedule()` (imperative controller) + `useThemeSchedule()` (readable store of state).
- **Solid** (`packages/solid/src/index.tsx`) — `useThemeSchedule()` returning a controller with signal-backed `enabled`/`active`/`status`/`sunrise`/`sunset`/`nextTransition` getters.
- **Angular** (`packages/angular/src/lib/hooks.ts` + `public-api.ts`) — `injectThemeSchedule(): ThemeScheduleController | null` → `{ state: Signal<ThemeScheduleState>, enable, disable, set }`, self-cleaning via `DestroyRef`; configurable through `scheduled` in `provideThemeKit()`.

### Docs site

- **`/sunrise-sunset` (new page)** — number sections: How it works (NOAA solar math + auto-detected timezone + auto-derived themes + SSR boundary), Setup (per-framework `scheduled` config tabs), Read & control (`useThemeSchedule`/`getThemeSchedule`/`injectThemeSchedule` tabs), Options table (lightTheme/darkTheme/latitude/longitude/timeZone/autoDetectLocation/checkInterval/skipApplyMs/enabled/set), Schedule-vs-manual-override semantics, What's next (→ `/playground#solar` for the live timezone demo).
- **Playground** (`components/playground/scheduled-demo.tsx`) — upgraded to run the **real** schedule controller against the docs site runtime: enable/disable buttons, status badge (Scheduled · Light/Dark / manual override / off), applied theme, sunrise/sunset/next-transition from `useThemeSchedule().state`, plus the existing solar path explorer. Docs layout now configures `scheduled={{ autoDetectLocation: true, enabled: false }}` so browsing is unchanged until you enable it in the demo (coordinates and light/dark themes are auto-derived per visitor).
- **Capability matrix** — `lib/frameworks.tsx`: added `scheduled` prop + `useThemeSchedule()` / `getThemeSchedule()` / `injectThemeSchedule()` feature entries for React, Next, Vue, Nuxt, Svelte, Solid, Angular.
- **Home + sidebar** — "Scheduled themes" card now links to `/sunrise-sunset`; sidebar gained a "Sunrise & Sunset" entry under Explore · Interactive.
- **Verification:** docs `tsc --noEmit` passes; core/react/vue/next/nuxt/svelte/solid/angular all build; react/next/vue test suites green.

## Completed Docs Page Reorg (Animation & Scrollbar)

- **`/animation` page** — removed the standalone "Try it live" section entirely. The interactive `AnimationLab` now lives only in the playground (which already has an "Animation & transition lab" section); the `/animation` page is now a focused reference (Quick start, framework steps, View Transitions, best practices, API table). Sections renumbered 1–5.
- **`/custom-scrollbar` page** — removed the "Integrate the actual scrollbar" section (live scrollable panel + framework snippet tabs) and relocated the live panel to the playground as a reusable `ScrollbarDemo`. The page now keeps its reference material (Quick start, Recommended setup, Flash-free Next.js, Options, Thumb appearance, Arrow icons, Container scrollbars, Framework-agnostic, How it works, Next). Added a new **"Framework implementations"** section with per-framework snippet tabs for every supported stack — including the newly added **Nuxt** (`scrollbar: true` module config + auto-imported `<ThemeScrollbar />`) and **Remix** (`<ThemeScrollbar>` inside its `ThemeProvider`). `lib/search.ts` blurb updated to list Nuxt & Remix.
- **`/playground`** — added a "Custom scrollbar" nav entry + section showing the real overlay engine integrated on this site (scrollable panel that reveals the theme-colored strip), pointing at `/custom-scrollbar` for per-framework setup. Framework snippet tabs intentionally omitted from the playground to keep it a demo surface.
- **Style consistency** — unified `sectionHeader` across pages to `mb-4` + `w-6 h-6` circles and header to `mb-8` (the `/animation` page was the outlier with `mb-6`/`w-7 h-7`/`mb-10`); header `<h1>`, icon, subtitle and intro-paragraph classes now match across animation, custom-scrollbar, and scoped-theme pages.
- **Verification:** `tsc --noEmit` passes; `next build` passes (84 static pages).

## 1.0.0 Docs Freeze Pass

Product-surface pass for the docs, per the freeze spec: the site should feel like the reference implementation of Theme Kit, not a feature list.

### Landing revamp

- **Hero (components/home/hero.tsx)** ??" rewritten from a centered one-column layout to a two-column product hero. Left: chip, headline ("The theming runtime for modern applications."), positioning copy, **Get started / Explore themes** CTAs, framework strip, stats. Right: a **live dashboard demo** (Revenue / Users stat cards, token bars, semantic-token swatches, focus-ring button, family chips that switch the whole site live) plus a **real defineTheme + ThemeProvider code block** (`app.tsx`) with the new filename header. Toned the decorative background layers down to grid + vignette.
- **Pillars (components/home/pillars.tsx)** ??" new compact section: Semantic themes, Theme families, SSR + zero flash, Runtime transitions, Adapters. Each card shows the actual token/family/pipeline words it stands for.
- **Why Theme Kit? (components/home/why-theme-kit.tsx)** ??" new comparison table: Traditional theme switching vs Theme Kit (families, semantic tokens, framework-agnostic core, runtime transitions, overlay scrollbar, SSR-first, scoped themes, adapters). Rows link to their concept pages.
- **Framework matrix (components/home/framework-matrix.tsx)** ??" replaced the old `framework-strip` grid with a clean 11-framework matrix (React / Next / Vue / Nuxt / Svelte / Solid / Angular / Astro / Remix / Web Components) + "One runtime. Native integrations. Shared semantics."
- **Adapter story (components/home/adapter-story.tsx)** ??" replaced `ecosystem.tsx`: "Bring your existing UI system" with the **two adapter classes** (CSS-variable adapters: tokens?CSS vars?shadcn/Bootstrap/DaisyUI/Open Props; generated-theme adapters: tokens?library theme?MUI/Chakra/AntD/Mantine) plus the UnoCSS preset.
- `app/page.tsx` reordered: Hero ? Pillars ? Why Theme Kit ? Framework matrix ? Adapter story ? Theme gallery ? Learning path ? Get started. Old `solves`/`features`/`framework-strip`/`ecosystem` left in the repo but no longer imported.

### Docs navigation restructure (user-intent IA)

- `docs-layout.tsx` sidebar reorganized: **Getting Started** (Get Started, Core Concepts, Tokens & Typography, Which package?), **Themes** (Custom Themes, Scoped Theme, Sunrise & Sunset, Presets), **Runtime** (Zero Flash, Animation & Transition, Advanced Features, Custom Scrollbar, Architecture), **Adapters** (Adapters + Libraries group), **Frameworks** (collapsible framework guides), **Use Cases** (Playground, Theme Studio, Accessibility, Showcase), **Reference** (Package Map, API Reference, CLI, DevTools), **Project** (Blog, Roadmap).

### New pages

- **`/choose-package`** ??" "Which package should I install?" decision page: pick by need/framework (core / react / next / vue / nuxt / svelte / solid / angular / astro / remix / web / tailwind), a **combinations** grid (Next+MUI, Next+shadcn, React+Chakra, Vue+Bootstrap, Nuxt+daisyUI, React+Mantine) with the exact packages, and an install example. Linked from the sidebar and the docs learning path.
- **`RELEASE_CHECKLIST.md`** (repo root, internal) ??" pre-1.0 checklist: API / Frameworks / Runtime / UX / Examples / Publishing.

### Global snippet & badge polish

- **CodeBlock** ??" toolbar is now a full-width header: **filename** (mono, left) + **language badge** + **Copy** (right). Filename passed via a new `filename` prop; language badge renders only when a filename is present (backwards-compatible). CSS updated in `globals.css`.
- **API reference index** ??" each package card now carries a **CORE / REACT / NEXT.JS / VUE / ... badge**; `CORE` is accented, framework/tooling badges are outline. (Individual API pages remain generated markdown.)
- **Footer** ??" added a **Packages** row (Core � React � Next � Vue � Nuxt � Svelte � Solid � Angular) linking into the API reference.

### Deeper pages

- **`/zero-flash`** ??" "How it works" pipeline is now a connected vertical diagram (numbered nodes + gradient connector line); added two callouts: the **native scrollbar flash** (how Theme Kit hides it before paint) and **transitions start only after the initial state** (first paint is never animated).
- **`/accessibility`** ??" rewritten from a bare lab into a full page: Live lab (contrast + CVD), **prefers-reduced-motion flow** (reduce ? engine ? suppress ? instant apply), focus rings & keyboard navigation, color-scheme & system preference, scrollbar behavior, transition suppression (`suppressTransition`). Keeps the live AccessibilityLab.
- **`/scoped-theme`** ??" "How a scope works" gained the canonical **nested-scope visualization**: code (ThemeProvider ? mint-light ? Dashboard ? plum-dark ? CodeEditor) beside a rendered scope-tree diagram.

### Verification

- Docs `tsc --noEmit` passes; `next build` passes (**86 static pages**, incl. the new `/choose-package`). No package source changed in this pass.

### Freeze pass continuation

- **SSR integrations flagship (components/home/ssr-integrations.tsx)** ??" new landing section right after the framework matrix: two flagship cards, Next.js (**Full App Router integration**) and Nuxt (**Full Nuxt SSR integration**), each showing the shared 5-step lifecycle (SSR theme resolution ? blocking bootstrap ? zero-flash first paint ? hydration ? runtime synchronization) and linking to its guide, plus a "One mental model" callout pointing at /zero-flash.
- **Global snippet filenames** ??" CodeBlock's new ilename header is now wired site-wide:
  - ramework-tabs.tsx (used by /sunrise-sunset, /zero-flash, /scoped-theme, library "Every Framework" tabs) passes the example title as the filename.
  - ramework-guides/[slug] (Quick Start / Implementation / Use Cases / More Examples), libraries/[slug], packages/[slug], and the /get-started guide all pass their snippet .title as the filename header.
  - custom-scrollbar/scrollbar-framework.tsx threads the optional filename (conditional spread for exactOptionalPropertyTypes).
- **Verification:** 	sc --noEmit passes; 
ext build passes (**86 static pages**).

### Docs consistency + get-started redesign

- **Get Started redesign** (components/get-started/guide.tsx): step cards lost their boxed `rounded-2xl border bg-card/40` treatment � steps are now borderless sections with a numbered badge + heading and wider vertical rhythm (gap-12). Borders now appear only on code blocks and the framework-selection cards (plus the two demo glass-cards and callouts). All 5 code blocks use the uniform `rounded-lg m-0` styling.
- **Shared components**:
  - `ui/page-header.tsx` extended: optional `icon` tile (gradient, matches the old inline style), `eyebrow`, `title`, `subtitle` (mono), `description`, `badges`, `actions`.
  - New `ui/section-heading.tsx`: numbered-circle h2 + optional desc, replacing the ~8 copy-pasted `sectionHeader()` helpers.
- **Header unification** (was 4 competing styles ? one `PageHeader`):
  - Icon headers ? icon + title + subtitle: animation, zero-flash, tokens, scoped-theme, custom-themes, custom-scrollbar, sunrise-sunset.
  - Chip eyebrows ? text eyebrow: accessibility, choose-package, showcase, blog, blog/[slug] (date�read chip becomes the eyebrow), packages, api-reference.
  - No-eyebrow pages ? eyebrow: libraries, framework-guides.
  - PresetsHeader rewritten on top of `PageHeader`; Playground header converted (stays a full-width tool, no DocsLayout by design).
- **Containers**: added `max-w-3xl` to showcase, blog, packages, api-reference, blog/[slug] (grid pages now match text pages).
- **Section headings**: 46 `sectionHeader()` calls across 7 pages converted to `SectionHeading`.
- **Callouts**: 11 hand-rolled `border-l-2` callouts on pages + 3 in shared components (api-explorer, ssr-integrations, animation-lab) converted to the shared `Callout`.
- **Hardcoded color fixed**: zero-flash status pill now uses a `color-mix` destructive token instead of `bg-red-500/15 text-red-500`.
- **Markdown pages aligned**: `.prose-doc` max-width 76ch ? 768px (matches `max-w-3xl`), h2 restyled to `1.125rem/600` without the bottom border to match JSX section headings; added `metadata` exports to core-concepts, cli, devtools, roadmap, advanced-features, architecture.
- **Verification**: `tsc --noEmit` clean; `next build` passes (**86 static pages**).

### Get-started: framework-aware "no theme" snippet

The `No theme defined?` code block was hardcoded to React/TSX regardless of the selected framework. Added a per-framework `noTheme` snippet (title/lang/code) to all 11 entries in `lib/frameworks.tsx` and switched `components/get-started/guide.tsx` to render `fw.noTheme` (React, Next layout, Vue `default-theme` kebab-case, Svelte, Solid, Angular providers, Web Components attributes, Tailwind CSS-only import, Astro island, Nuxt module config, Remix root). Verified: `tsc --noEmit` + `next build` (86 pages).

---

## 2.0.0 Docs Framework Picker Pass

Unified a **single, top-of-page framework selector** across the advanced concept pages so the selected framework drives every code snippet, and removed the now-redundant live-demo sections.

- **New shared `FrameworkPicker`** (`components/framework-picker.tsx`): chip row over all 11 frameworks (react, next, vue, svelte, solid, angular, web, tailwind, astro, nuxt, remix), plus a typed `getExample<T>(map, slug)` helper.
- **Custom Themes** (`app/custom-themes`): converted page body into a client `CustomThemesGuide` component holding the picker state; "Every framework, one theme" now renders `fw.quickStart` for the selected framework (covers all 11). Static core sections (define, extend, register, generate, presets) unchanged. Verified: `tsc` + build (86 pages).
- **Scoped Theme** (`app/scoped-theme`): removed the "See it live" demo section; picker drives the "ThemeScope — pick your framework" section via a 11-framework `scopeExamples` map (authored tailwind/astro/remix entries alongside the existing 8). Renumbered sections 1→6. Verified.
- **Sunrise & Sunset** (`app/sunrise-sunset`): removed the "Try it live" section; picker drives both "Setup" (`scheduled` config) and "Read & control the schedule" (`useThemeSchedule`/`getThemeSchedule`/`injectThemeSchedule`) via 11-framework `mountExamples` + `controllerExamples` maps (authored web/vanilla/tailwind/astro/remix entries). Renumbered sections. Verified.
- **Animation & Transition** (`app/animation`): picker drives BOTH "Enable it" (per-framework `enableExamples` map with API-accurate `transition` prop syntax for all 11 frameworks) and "Enable transitions in your framework" (full `frameworkSnippets` map with ThemeScope); kept the framework-agnostic "Same prop on every framework" table. Verified.
- **Shared CopyButton**: replaced the manual clipboard implementation in `components/playground/token-tree.tsx` with the shared `ui/copy-button`. `theme-generator` JSON/CSS previews already use the shared button.
- **Theme Studio JSON unification**: `components/theme-studio/theme-studio.tsx` JSON output now renders as a single `code-block` container (Theme JSON label + theme name + json lang + Copy via the shared `CopyButton`) — the JSON `<pre>` is flush (no double border/bg). `components/playground/theme-generator.tsx` JSON preview similarly unified through the same `code-block` container pattern.
- **Blog enhancement**: added an icon tile to the `/blog` PageHeader for visual parity with other docs concept pages; switched blog index + post tag chips to the shared `chip`/`chip-active` classes and removed a dead `group-hover` reference. `tsc` + build (86 pages) verified.

## Completed — Modern/branded theme generation + accurate CLI docs (2026-08-20)

### `@theme-kit/core` — `generateTheme` produces modern, branded, accessible themes

`generateTheme` (the engine behind `theme-kit generate` and the `/theme-studio` + playground generators) was enhanced so a single seed yields a complete, modern light/dark pair with correct on-color contrast for any brand color:

- **Contrast-aware primary foreground** — new `relativeLuminance()` (WCAG) + `contrastForeground(hex, darkInk)` helpers. The generated `primaryForeground` is now derived from the seed's luminance instead of being hardcoded white: dark seeds keep white text (`#3b82f6` → `#ffffff`), while light/brand seeds get a near-black ink (`#f59e0b` → `#0f172a`; light dark-mode primaries like `#91b4ee`/`#9596ea` → `#020617`). No more white-on-amber.
- **Full semantic token set** — both modes emit the complete modern surface palette: `background`, `foreground`, `card`/`cardForeground`, `popover`/`popoverForeground`, `primary`/`primaryForeground`, `secondary`/`secondaryForeground`, `muted`/`mutedForeground`, `accent`/`accentForeground`, `destructive`/`destructiveForeground`, `success`/`successForeground`, `border`, `input`, `ring`, plus `radius.lg`. Neutrals are tinted from the seed hue (low-saturation HSL) so every generated family feels cohesive and branded rather than generic gray.
- **Meta completeness** — `order: 10` / `order: 20` on light/dark so generated themes slot into the preset ordering.
- **Cleaned up** — removed the dead `hueShift()` helper.
- **Verification:** output for `generateTheme({ seed: "#3b82f6", family: "custom" })` exactly matches the documented modern spec (light primary `#3b82f6` / dark primary `#91b4ee` with correct foregrounds); **293/293 core tests pass** (3 new: meta ordering + contrast-safe foregrounds for dark and light seeds); core builds clean.

### Docs — CLI `generate` page shows the real output

- **`apps/docs/content/cli/generate.md`** — the "Writes:" example previously showed a truncated/minimal JSON (`{ primary, background }` only). Replaced with the actual full modern output for `theme-kit generate --seed "#6366f1" --family indigo` (all 22 semantic colors + `radius.lg` + `order` in meta for both light and dark), so the docs match what the CLI prints today. The CLI dist was rebuilt so `theme-kit generate` emits this full shape. Docs `tsc --noEmit` passes.

## Completed (2026-08-21) — Solar-time auto-detection, optional themes & SSR hydration

### `@theme-kit/core` — timezone auto-detection + optional coordinates/themes

- **New `packages/core/src/adapters/timezone-location.ts`** — a comprehensive IANA timezone → reference-coordinates map (~400 entries covering every populated region, plus legacy aliases like `Asia/Katmandu` → `Asia/Kathmandu` and `US/Eastern` → `America/New_York`). Exports:
  - `getLocationForTimeZone(timeZone)` — resolves a zone to `[lat, lon]`; handles `Etc/GMT±n` by deriving longitude from the UTC offset.
  - `getBrowserTimeZone()` — reads `Intl.DateTimeFormat().resolvedOptions().timeZone` (SSR-safe).
  - `getTimeZoneList()` — all known zone ids, sorted; used by the docs timezone picker.
  - `resolveSolarLocation(input)` — resolution priority: explicit `latitude`/`longitude` → explicit `timeZone` → browser auto-detection → default coordinates (New York).
  - `SolarLocationInput`, `ResolvedSolarLocation` types.
- **`calculateSunTimes(date, lat?, lon?, opts?)`** — latitude/longitude now optional. Accepts an options object (`{ timeZone, autoDetectLocation }`) or nothing (auto-detects the visitor's timezone). Backward-compatible: `calculateSunTimes(date, 40.7, -74)` still works.
- **`scheduled` options extended** — `ScheduledThemeOptions`, `ThemeScheduleOptions`, `ScheduledPluginOptions` all gained `timeZone?: string` and `autoDetectLocation?: boolean`. `ThemeScheduleState` now reports `timeZone`, `latitude`, `longitude`, `autoDetected`. `schedule.set()` accepts `timeZone`, `autoDetectLocation: true` (resets to detection), and explicit coords (which clear the timezone).
- **`lightTheme`/`darkTheme` now optional** — shared `resolveScheduledThemePair` resolves: explicit values → same-family counterpart of the current theme (e.g. `plum-dark` → `plum-light`/`plum-dark`) → neutral `light`/`dark` themes. Re-resolves automatically when the user switches theme family (wired through the store subscription in both `createThemeSchedule` and `createScheduledPlugin`). `DEFAULT_SCHEDULED_LIGHT_THEME` / `DEFAULT_SCHEDULED_DARK_THEME` exports.
- **New tests** — 5 new auto-derived-theme tests (explicit pair, single theme + family derivation, no themes → family fallback, family switch re-resolution, runtime.scheduled without themes). **320/320 core tests pass**.
- **All 20+ packages rebuild** — types flow through core; Vue's `scheduled` prop type tightened from `boolean | any` to `false | ScheduledThemeOptions`.

### Framework SSR hydration fixes

- **React** (`packages/react/src/hooks.ts`) — `useThemeSchedule` now passes a stable `EMPTY_THEME_SCHEDULE_STATE` as the `getServerSnapshot` for `useSyncExternalStore`. Auto-detected timezone/theme state no longer causes server/client hydration mismatches. **16/16 react tests pass**.
- **Vue/Nuxt** (`packages/vue/src/index.ts`) — `useThemeSchedule` initializes its `state` ref with `EMPTY_THEME_SCHEDULE_STATE` and fills it in `onMounted`. **6/6 vue tests pass**.

### Docs site

- **Site `scheduleConfig`** (`apps/docs/app/theme/theme-config.tsx`) — now uses `autoDetectLocation: true` and omits `lightTheme`/`darkTheme` (demonstrates auto-adaptation to whatever theme family the visitor has selected).
- **`/sunrise-sunset`** — updated "How it works" (no themes required either, no coordinates required), options table (`lightTheme`/`darkTheme` = "string (optional)"), all 11 framework setup + controller snippets (zero-config `scheduled={{}}` form), state-shape callout (auto-derived themes noted). No "Try it live" section (moved to playground per earlier instruction).
- **`/playground#solar`** — timezone `<select>` (Auto + all IANA zones) drives the real schedule; lat/lon sliders sync to the detected location on mount; enable/disable, sunrise/sunset/next-transition display. Switching theme family (e.g. to Plum) re-adapts the scheduled themes to `plum-light`/`plum-dark`.
- **Content docs** — `core-concepts.md`, `docs.md`, and the solar-time blog post updated to document optional coordinates/themes.
- **API reference regenerated** — includes `getLocationForTimeZone`, `getTimeZoneList`, `getBrowserTimeZone`, `resolveSolarLocation`, `resolveScheduledThemePair`, `DEFAULT_SCHEDULED_LIGHT_THEME`/`DARK`, and the updated `calculateSunTimes` signature.
- **Verification** — docs `tsc --noEmit` passes; `next build` succeeds (86 pages); production build tested in browser with zero console errors.

## Completed (2026-08-22) — Framework-reactive snippets pass (scoped-theme, sunrise-sunset, custom-scrollbar) + schedule API parity

Full framework-picker audit across the docs: every page that exposes a framework selector now shows the **actual framework's code** in every section, not just the first snippet. The `/sunrise-sunset` page gained the missing picker; `/scoped-theme` sections 2–5 and `/custom-scrollbar` arrow/container sections were made framework-reactive; and the three framework packages that lacked a schedule accessor now expose one.

### `@theme-kit/remix` — `useThemeSchedule` added

- **`packages/remix/src/hooks.ts`** — added `useThemeSchedule` to the re-export list from `@theme-kit/react`. The package previously exported every other React hook but not the schedule accessor, so Remix users could not reach solar-time state through the adapter package.
- Rebuilt dist (`pnpm --filter @theme-kit/remix build`), **4/4 remix tests pass**, typecheck clean.

### `@theme-kit/astro` — `useThemeSchedule` added

- **`packages/astro/src/hooks.ts`** — new `useThemeSchedule(): ThemeSchedule | null` hook mirroring the React implementation: `useSyncExternalStore` over `runtime.schedule.subscribe`, SSR-hydrating with the stable `EMPTY_THEME_SCHEDULE_STATE`. Runtime access via `requireGlobalRuntime()` (the existing Astro shared-runtime pattern).
- Exported from both entry points: **`packages/astro/src/index.ts`** and **`packages/astro/src/client.tsx`** (so islands can import from `@theme-kit/astro` or `@theme-kit/astro/client`).
- Rebuilt dist, **10/10 astro tests pass**, typecheck clean.

### `@theme-kit/web` — `getThemeSchedule()` + `scheduled` attribute

- **`packages/web/src/index.ts`** — new `getThemeSchedule(): ThemeSchedule | null` accessor (returns `useThemeRuntime().schedule ?? null`), matching the `getThemeSchedule()` naming Svelte uses so Web Components get a first-class reactive schedule handle instead of reaching into `runtime.schedule` manually.
- **`packages/web/src/provider.ts`** — `<theme-kit-provider>` now observes and parses a `scheduled` attribute (JSON `ThemeScheduleOptions`), forwards it to `createThemeRuntime`, and exposes the `scheduled` prop on `ThemeKitProviderProps`. Previously the element could not enable solar scheduling declaratively. Rebuilt dist.

### Docs — `/sunrise-sunset` framework picker restored

- **`apps/docs/app/sunrise-sunset/SunriseSunsetGuide.tsx`** — the `FrameworkPicker` was imported but **never rendered**, so the page always showed the React snippet regardless of selection (the 11-framework `mountExamples`/`controllerExamples` maps were dead code). Added the picker at the top of the guide (same position as `/scoped-theme`); both Setup and Read & control now react to the selected framework. Verified in-browser: Vue shows `@theme-kit/vue` setup + `useThemeSchedule` controller; Remix shows the `@theme-kit/remix` variant.
- **Remix/Web controller examples corrected** — the Remix snippet imported `useThemeSchedule` from `@theme-kit/remix` (which did not exist) and the Web snippet drove scheduling from `createThemeRuntime` directly. Both now use the real per-package accessors added above (`useThemeSchedule` from `@theme-kit/remix`; `getThemeSchedule` from `@theme-kit/web`). Astro controller example now imports `useThemeSchedule` from `@theme-kit/astro/client` (real export).
- **API reference regenerated** (`pnpm --filter @theme-kit/docs api:generate`) so `remix.md`/`astro.md`/`web.md` document the new schedule accessors.

### Docs — `/scoped-theme` fully framework-reactive

Previously only section 1 (ThemeScope) switched snippets; sections 2–5 were hardcoded React. Added four 11-framework snippet maps and wired them to the picker (`apps/docs/app/scoped-theme/ScopedThemeGuide.tsx`):

- **Imperative scoping (section 2)** — the core `createScopedThemeBinding` example is kept verbatim (framework-agnostic, per user instruction "it uses core"), and the second block now switches per framework: `useScopedTheme` (react / next / remix, correct package import), Vue/Svelte/Solid imperative `createScopedThemeBinding` with their real runtime accessors (`useThemeRuntime`/`getThemeRuntime`), Angular `ThemeScopeDirective`, Web `<theme-kit-scope>`, Astro `ThemeScope`, Tailwind core-binding note, Nuxt `ThemeScope`.
- **Local themes (section 3)** — per-framework `themes`-prop syntax for the JSX/template frameworks; Angular/Web/Astro/Tailwind (no local-themes prop on their scope primitive) show the imperative `createScopedThemeBinding(..., { localThemes })` equivalent.
- **Transitions (section 4)** — per-framework `transition` prop syntax (`:transition` for Vue/Nuxt, `transition={…}` for Svelte, `[themeKitScopeTransition]` for Angular, `theme-transition='{...}'` JSON for Web, `transition={…}` for Astro).
- **How a scope works (section 5)** — the nested-scope example (mint-light Dashboard / plum-dark CodeEditor) now renders in the selected framework's syntax; the scope-tree diagram is unchanged.
- Verified in-browser: selecting Vue updates all four sections to `@theme-kit/vue` syntax; Remix/Svelte/Web variants render correctly.

### Docs — `/custom-scrollbar` arrow + container snippets framework-aware

- **`apps/docs/components/custom-scrollbar/scrollbar-framework.tsx`** — added `ARROW_SNIPPETS` and `CONTAINER_SNIPPETS` maps (react, next, vue, svelte, solid, angular, web, nuxt, remix, vanilla), so the "Arrow icons" and "Container scrollbars" sections — previously hardcoded React — switch with the page's framework tabs (`icons` group for React/Vue/Svelte/Solid/Nuxt/Remix, `arrowUpIcon`/`arrowDownIcon` inputs for Angular, `arrow-up-icon`/`arrow-down-icon` attributes for Web, `arrowUpIcon`/`arrowDownIcon` options for vanilla; `include` selector per framework).
- **`apps/docs/app/custom-scrollbar/page.tsx`** — removed the hardcoded `arrowSnippet`/`containerSnippet` constants and render the new maps through the existing `ScrollbarFrameworkCode` component. Verified in-browser: Vue tab shows `:appearance="{ include: ['.panel'] }"`.

### UI/UX consistency review

- **Framework-picker placement** — `/sunrise-sunset` picker now sits at the top of the guide, matching `/scoped-theme`, `/animation`, and `/custom-themes` (chip row above section 1). All picker pages now react consistently across every code section.
- **No other hardcoded snippet gaps found** — audited every page for snippets rendered under a framework selector: `/animation` (enable + framework snippets already per-framework; view-transition/best-practices are framework-agnostic core), `/custom-themes` (picker-driven `customThemeSnippets`; define/extend/presets are core), `/zero-flash` (FrameworkTabs per-framework examples), `/adapters`, `/dom-adapters`, `/persistence`, `/vanilla` (core/vanilla by design, no picker). No React-hardcoded snippet remains under an active framework selector.

### Verification

- `pnpm --filter @theme-kit/remix build` + test (4/4), `@theme-kit/astro` build + test (10/10), `@theme-kit/web` build (no test files) — all pass.
- Docs `pnpm --filter @theme-kit/docs typecheck` clean; `pnpm --filter @theme-kit/docs build` succeeds (86 static pages).
- Browser smoke tests on `/sunrise-sunset`, `/scoped-theme`, `/custom-scrollbar`: picker switches all sections; no console errors.

## Completed (2026-08-22) — Presets cleanup, picker scroll-to, API parity fix round, blog + roadmap + landing pass

### `/presets/default` shows pure library presets only

- **`apps/docs/app/theme/theme-config.tsx`** — the docs-site themes (`theme-kit`, `lab`, `scope` families) now carry `meta.tags: ["docs-site"]` on all 6 theme definitions.
- **`apps/docs/components/presets.tsx`** — `buildGroups()` skips any theme tagged `docs-site`, so `/presets/default` (and the `/presets` showcase tabs) show only the nine signature families (oat, berry, mint, citrus, cocoa, plum, iris, sky, graphite). Verified in-browser: theme-kit/lab/scope cards are gone.

### Framework picker scrolls to the setup section

- **`apps/docs/components/framework-picker.tsx`** — new optional `scrollToId` prop; clicking a framework button smooth-scrolls to that element after `onChange`.
- **`apps/docs/components/custom-scrollbar/scrollbar-framework.tsx`** — `ScrollbarFrameworkSelector` gained the same `scrollToId` behavior.
- Wired per page: `/sunrise-sunset` → `#setup`, `/scoped-theme` → `#theme-scope`, `/animation` → `#enable`, `/custom-scrollbar` → `#quick-start`. Verified: selecting Vue on sunrise-sunset lands the Setup section at the top of the viewport.

### `/troubleshooting` snippets updated to the real API

Six snippets used deprecated/non-existent APIs; all corrected against `packages/*/dist`:

- **FOUC** — `createThemeBootstrapScript()` was called with no args; now `createThemeBootstrapScript({ themes, defaultTheme })` (the real signature requires a `ThemeBootstrapScriptOptions` object).
- **Persistence** — `storage: { key, driver }` runtime option doesn't exist; now `plugins: [createPersistencePlugin({ key: "my-app-theme" })]`.
- **CSS variables** — `cssVariables={true}` + `adapter="css-variables"` don't exist; now `cssVariables={{ prefix: "theme-" }}` + `dom={{}}`.
- **Scoped theme** — `<ThemeScope themes={["corporate-light", ...]}>` passed string names to the `themes` prop (which expects `ThemeDefinition[]`); now `<ThemeScope theme="corporate-light">`.
- **Contrast audit** — `validateThemeContrast(themes, {...}).failures` didn't match the real `validateThemeContrast(theme, { themes })` → `{ valid, checks }` shape; rewritten to iterate `checks` and read `passesAALarge`.
- **Multi-window** — `sync: { crossTab, transport }` doesn't exist; now `broadcast: createMultiWindowSync({ prefer: "auto" })`.
- Related Callout texts updated to describe the real adapters (persistence key `theme-selection`, `ThemeSelectionPersistenceAdapter`).

### Docs-wide API parity audit (30 findings)

Systematic audit of every docs snippet against the built `.d.ts` exports. All real issues fixed:

- **`app/animation/AnimationGuide.tsx`** — vanilla `runtime.scope(...)` (no such method) → `createScopedThemeBinding(...)`; `synchronizeDarkClass(runtime)` → `synchronizeDarkClass(runtime.store.get())`; Web Components provider snippet had a missing closing quote.
- **`lib/use-cases.ts`** — `BlockingScript` → `ThemeHead` (real remix export); `createRemixThemePersistence` imported from the wrong path with the wrong arg order → `createRemixThemePersistence(themes, "light", { key })` from `@theme-kit/remix`; lifecycle `on("themeChange", ...)` → `on("beforeThemeChange", ...)`/`on("afterThemeChange", ...)` (6 sites); `synchronizeDarkClass(runtime)` → `runtime.store.get()`; Astro `createBlockingScript({ themes, defaultTheme })` → `createBlockingScript(computeFingerprint(...), buildThemeCssMap(...))`; Angular `theme().theme().name`/`theme().mode()` → `theme().theme.name`/`theme().mode`; Angular `history.canUndo()` → `history.history().canUndo`; `themeScope="forest"` → `[themeKitScope]="'forest'"` with the directive imported.
- **`app/plugins/page.tsx`** — `theme.id` → `theme.name`; `theme.mode` → `theme.meta?.mode`; `tokens.color` → `tokens.colors` (both the token-transform and full-example snippets).
- **`app/persistence/page.tsx`** — `createThemeSelectionPersistenceAdapter` (non-existent) → `createPersistencePlugin({ key })` in `plugins`; the vs-sync snippet now uses `createThemeSelectionBroadcast()` + `createPersistencePlugin()`.
- **`app/vanilla/page.tsx`** — `kit.update({ color: ... })` → `kit.update({ colors: ... })`.
- **`app/accessibility/page.tsx`** — `respectReducedMotion: true` (not a transition option) removed; `runtime.store.set("plum-dark", ...)` → `runtime.store.set(runtime.registry.get("plum-dark")!, ...)`.
- **`app/multi-window-sync/page.tsx`** — `runtime.store.set(selection.family, selection.mode)` (2-string call) → `runtime.selection.setMode(...)` + `setFamily(...)` (5 sites).
- **`lib/libraries.tsx`** — `resolveTheme({ family: "mint" })` (wrong signature) → `resolveInitialTheme({ themes: getBuiltInThemes(), family: "mint" }).theme` for shadcn and MUI.
- **`app/custom-scrollbar/page.tsx` + `scrollbar-framework.tsx`** — `createThemeStore({ themes, defaultTheme })` (wrong options) → `createThemeRuntime(...)` + `createThemeScrollbar(runtime.store, ...)`; `store.set("dark")` → `runtime.selection.setMode("dark")`.
- **`app/sunrise-sunset/SunriseSunsetGuide.tsx`** — Solid `schedule.timeZone` (not exposed) removed; Vue/Nuxt `schedule.state.enabled` in templates → destructure `const { state } = schedule` (state is a `Ref`).
- **Content markdown** — `core-concepts.md` persistence section rewritten (mode-only `createThemePersistence` caveat + `createPersistencePlugin`); `advanced-features.md` `validateThemeContrast` result shape corrected and `runtime.adapters.use(plugin)` (wrong registry) removed; `blog/accessibility-first-theming.md` + `blog/multi-window-sync.md` API shapes corrected.
- **`components/ui/section-heading.tsx`** — `desc` wrapped in `<p>`; roadmap passes a `<div>` ProgressBar causing a hydration error. Changed to a `<div>` wrapper (roadmap page console is now clean).

### Blog: 4 new posts (8 total)

`content/blog/theme-families.md`, `semantic-tokens.md`, `scoped-themes.md`, `persistence-sync.md` — practical deep dives with real API snippets (families/modes, semantic tokens + adapters, scoped islands, persistence + multi-window sync).

### Roadmap refreshed

`content/roadmap.md` — Q3 current quarter now reflects shipped work (framework picker pass, schedule accessors in every framework, custom scrollbar engine, Nuxt SSR-first integration, API parity audit); Q3 next / Q4 / 2027-H1 re-scoped; removed a duplicated "Theme inheritance visualizer" line.

### Landing page

- **New `components/home/capabilities.tsx`** — "A runtime, not a toggle" section showcasing real shipped features (sunrise/sunset scheduling, scoped themes, theme-aware scrollbar, zero-flash SSR, families + modes, adapters) each linking to its page; wired into `app/page.tsx` after SSR integrations.
- **`components/home/theme-gallery.tsx`** — filters out the `theme-kit` docs-site family (was showing alongside library presets); now excludes `theme-kit`/`lab`/`scope`.
- **`components/home/hero.tsx`** — family chips exclude the docs-site families so the hero previews only real library palettes.

### Verification

- Docs `tsc --noEmit` clean; `pnpm --filter @theme-kit/docs build` succeeds (86 static pages).
- Browser smoke tests: `/presets/default` (9 pure families only), `/roadmap` (no console errors after SectionHeading fix), `/blog` (8 posts, new posts render), `/blog/persistence-sync` (updated snippets), `/` (capabilities section renders, gallery excludes docs-site families).
