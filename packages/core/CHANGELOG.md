# @theme-kit/core

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
