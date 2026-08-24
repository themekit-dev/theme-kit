## Roadmap

Theme Kit's roadmap is tracked here and kept in sync with the codebase. Checked items are shipped in the current release.

### 2026 — Q3 (current)

- [x] **Framework picker pass** — a single top-of-page framework selector drives every code snippet on `/custom-themes`, `/scoped-theme`, `/sunrise-sunset`, `/animation`, and `/custom-scrollbar`.
- [x] **Sunrise/sunset scheduling in every framework** — `useThemeSchedule()` / `getThemeSchedule()` / `injectThemeSchedule()` exposed across React, Next, Vue, Nuxt, Svelte, Solid, Angular, Remix, Astro, and Web Components.
- [x] **Custom scrollbar overlay engine** — theme-aware overlay with native physics, arrows, auto-hide, and pre-paint CSS; shipped as `@theme-kit/core` + wrappers for every framework.
- [x] **Nuxt Tier-1 SSR-first integration** — SSR theme resolution, cookie + localStorage sync, zero-flash bootstrap, config-driven transitions and scrollbar (`@theme-kit/nuxt`).
- [x] **Playground** — live theme switcher, interactive token tree, history / time-travel timeline, solar schedule demo, and scrollbar lab.
- [x] **Theme Studio** — generate a light/dark pair from a seed color and apply it to the runtime (`/theme-studio`).
- [x] **Accessibility lab** — live WCAG contrast checks and CVD simulations (`/accessibility`).
- [x] **Multi-window sync** — cross-tab theming over BroadcastChannel / SharedWorker / StorageEvent, documented on `/multi-window-sync`.
- [x] **Individual package pages** — deep-dive pages per package with install tabs and API tables (`/packages/{slug}`).
- [x] **Site search** — full-text search over all content (⌘K).
- [x] **API Reference generation** — `/api-reference/{package}` generated from `packages/*/src` with typedoc (signatures, parameters and types can't drift); regenerate via `pnpm --filter @theme-kit/docs api:generate`.
- [x] **Docs/API parity audit** — every documented API verified against the real package exports; deprecated snippets corrected.
- [x] **Blog** — markdown-driven publishing for release notes and deep dives (`/blog`).
- [x] **Showcase page** — gallery of official tools and framework example apps (`/showcase`).
- [x] **Styled 404 page** matching the design system.
- [x] **Mobile docs navigation** — animated mobile menu + drawer for the docs sidebar.

### 2026 — Q3 (next)

- [ ] **Interactive token diffing** — compare two themes side by side in the Playground.
- [ ] **Playground live runtime preview** — a `runtime.update()` sandbox showing token edits re-theme a real component tree.
- [ ] **Theme inheritance visualizer** — animate `extends` chains and token overrides in Core Concepts.

### 2026 — Q4

- [ ] **Version-pinned API reference** — version badges and deprecation / breaking-change notes per API.
- [ ] **Changelog / migration guides** — surface `migrate-theme` and the versioning story on the site.
- [ ] **Page transitions** — smooth route transitions using Theme Kit's View Transitions support.
- [ ] **Analytics** — lightweight, privacy-friendly analytics to guide documentation priorities.

### 2027 — H1

- [ ] **Interactive diagrams** — animated mode + family + token diagrams in Core Concepts.
- [ ] **Plugins / lifecycle lab** — interactive plugin playground with lifecycle event logging.
- [ ] **Automated a11y conformance** — run axe / WCAG audits across every route in CI.
- [ ] **Link checker + CI** — lint, typecheck, build and link-check all routes on every PR.

## Guiding principles

The entire documentation website is built using Theme Kit itself. Every theme
change on the website is powered by Theme Kit's runtime. Every example shown in
the docs is executed using Theme Kit — not mocked or simulated. Whenever a new
feature is added to Theme Kit, the documentation adopts that feature internally
wherever appropriate. **Theme Kit powers Theme Kit.**
