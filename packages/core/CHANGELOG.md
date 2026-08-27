# @theme-kit/core

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
