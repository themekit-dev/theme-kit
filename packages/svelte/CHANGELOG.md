# @theme-kit/svelte

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

- Fix `ThemeProvider`, `ThemeScope`, and `ThemeScrollbar` so they render correctly with Svelte 5's `Component(anchor, props)` calling convention (previously the first argument was read as `props`, the snippet render result was ignored, and nothing was ever mounted).

  `ThemeScope` now applies a locally-scoped theme to a wrapper element via `createScopedThemeBinding` instead of mutating the global theme store. It supports the `theme`, `family`, `mode`, `themes`, and `transition` props, follows light/dark/system mode for family and boundary scopes, forwards `className` and extra attributes, and cleans up on destroy. Theme state is resolved at mount; on the server, children render without the scoping wrapper.

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.0.0
  - @theme-kit/bootstrap@1.0.0
  - @theme-kit/daisyui@1.0.0
  - @theme-kit/open-props@1.0.0
  - @theme-kit/shadcn@1.0.0
