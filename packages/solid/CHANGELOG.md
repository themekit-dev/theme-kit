# @theme-kit/solid

## 1.2.2

### Patch Changes

- Fix scrollbar overlay clipping to host rounded corners; update framework packages (react/solid/svelte/vue) and core internals.
- Updated dependencies
  - @theme-kit/core@1.2.2
  - @theme-kit/bootstrap@1.2.2
  - @theme-kit/daisyui@1.2.2
  - @theme-kit/open-props@1.2.2
  - @theme-kit/shadcn@1.2.2
  - @theme-kit/web@1.2.2

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

- Rewrite `ThemeScope` to be fully reactive and to scope themes locally without mutating the global theme store. The wrapper element is built with DOM APIs (the shipped `solid-js/jsx-runtime` does not export `jsx` in the supported Solid version, which previously broke any JSX-rendered scope) so a scoped CSS-variable binding is created reliably. `themes`, `transition`, `theme`, `family`, and `mode` props (including family/mode-following) plus cleanup are handled reactively via `createEffect`/`onCleanup`. Also make `ThemeScrollbar` render `null` instead of a hidden div.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.0.0
  - @theme-kit/bootstrap@1.0.0
  - @theme-kit/daisyui@1.0.0
  - @theme-kit/open-props@1.0.0
  - @theme-kit/shadcn@1.0.0
