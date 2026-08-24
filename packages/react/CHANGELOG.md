# @theme-kit/react

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

- `ThemeInspector` is now a theme-aware, accessible devtools panel: it uses the
  active theme's semantic tokens (`--theme-color-*`) instead of hardcoded light
  palette colors, renders with `role="dialog"` semantics (Esc to close, focus
  moves into the panel), and the floating toggle is a clear eye icon instead of
  the placeholder "Hello" label. The docs site wires the toolbar in as a live
  theme inspector on every page.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.0.0
