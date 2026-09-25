## Roadmap

What has shipped, and what is next. Checked items are in the current release
(2.0.0). This list is kept in step with the codebase, not with intentions.

### 2026 — Q3 (current)

- [x] **Framework picker pass.** One selector at the top of a page drives every snippet below it, across `/custom-themes`, `/scoped-theme`, `/sunrise-sunset`, `/animation` and `/custom-scrollbar`. The picker leaves out Tailwind and UnoCSS, because they are CSS integrations with no provider to mount.
- [x] **Scheduling in every framework.** `useThemeSchedule()`, `getThemeSchedule()` and `injectThemeSchedule()` exist for React, Next, Vue, Nuxt, Svelte, Solid, Angular, Remix, Astro and Web Components.
- [x] **Custom scrollbar overlay.** Theme-aware overlay with native physics, arrows, auto-hide and pre-paint CSS. Ships in `@theme-kit/core` with a wrapper per framework.
- [x] **Nuxt integration.** SSR theme resolution, cookie and localStorage sync, zero-flash bootstrap, config-driven transitions and scrollbar.
- [x] **Playground.** Live theme switcher, interactive token tree, history and time-travel, solar schedule demo, scrollbar lab.
- [x] **Theme Studio.** Generate a light/dark pair from a seed colour and apply it to the running site.
- [x] **Accessibility Lab.** Live WCAG contrast checks, full-theme audits, CVD simulation.
- [x] **Multi-window sync.** Cross-tab theming over BroadcastChannel, SharedWorker and StorageEvent.
- [x] **Package pages.** A deep-dive page per package with install tabs and API tables.
- [x] **Site search.** Full-text search over all content (⌘K).
- [x] **API reference generation.** `/api-reference/{package}` is generated from `packages/*/src` with TypeDoc, so signatures cannot drift from the code.
- [x] **Docs/API parity audit.** Every documented API is checked against the real package exports.
- [x] **Blog.** Markdown-driven release notes and deep dives.
- [x] **Recipes.** Nine task-oriented patterns at `/recipes`, each with a package-manager install command and prev/next navigation.
- [x] **Showcase.** Seven themed interfaces you can filter and restyle live, plus the real surfaces Theme Kit runs on.
- [x] **Styled 404 page** that matches the design system.
- [x] **Mobile docs navigation.** Animated menu and drawer for the docs sidebar.

Later in Q3 we closed out the documentation system itself:

- [x] **Package map.** `/package-map` — the four-layer architecture, the dependency graph, and a reference entry for all 24 packages. Generated from the manifests, so the dependencies cannot go stale.
- [x] **Examples.** `/examples` — ten runnable starter apps (one per framework) and twenty-one focused concept examples, filterable by framework, concept, complexity and package. Each concept shows its real source file, read from `examples/` at build time.
- [x] **Canonical URLs.** Every route declares its own. Previously all 66 routes claimed the homepage as canonical, which told search engines the entire site was a duplicate of `/`.
- [x] **Sitemap and robots.** `/sitemap.xml` and `/robots.txt`, with a coverage check in `pnpm links` so a new page cannot silently go unlisted.
- [x] **Open Graph images.** A shared renderer plus per-section cards for framework guides, library adapters, blog posts, Playground, Theme Studio and Accessibility Lab. Before this the site declared a large-image Twitter card with no image at all.
- [x] **Accessibility pass.** Navigation landmarks, `aria-current` on every active nav link, accessible names on every control, and a real tablist for the package-manager selector.
- [x] **CLI reference generated from source.** The CLI's own help text now drives the reference and every command page, so a new flag cannot be documented everywhere except the docs.
- [x] **Snippet accuracy audit.** All 709 documentation snippets extracted and checked against the built packages; the invented CSS variable name it found was fixed in six places.
- [x] **Internal style guide.** `docs/style-guide.md` — how the docs are written, kept internal rather than published as a route.

### 2026 — Q3 (next)

- [ ] **Playground live runtime preview.** A `runtime.update()` sandbox where token edits re-theme a real component tree.
- [ ] **Theme inheritance visualizer.** Animate `extends` chains and token overrides in Core Concepts.
- [ ] **Per-API deprecation notes.** Version badges shipped; what is missing is the deprecation and breaking-change note attached to the specific API that changed.

### 2026 — Q4

- [ ] **Page transitions.** Smooth route transitions using Theme Kit's View Transitions support. Theme transitions already use it; routes do not.
- [ ] **Interactive diagrams.** Animated mode, family and token diagrams in Core Concepts.
- [ ] **Plugins and lifecycle lab.** A plugin playground that logs lifecycle events as they fire.

### 2027 — H1

- [ ] **Automated a11y conformance.** Run axe and WCAG audits across every route in CI. The current pass was manual, so it can regress.
- [ ] **Search that understands tokens.** Today search matches text; it should find `--theme-color-primary` when you type "primary colour".

## Guiding principles

The documentation website is built with Theme Kit itself. Every theme change on
this site goes through Theme Kit's runtime. Every example in the docs runs against
the real packages — nothing is mocked or simulated. When a feature lands, the
documentation adopts it internally wherever that makes sense. Theme Kit powers
Theme Kit.
