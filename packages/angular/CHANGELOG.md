# @theme-kit/angular

## 2.0.0

### Major Changes

- **Removed the adapter bindings from the package root.** `injectShadcnTheme`,
  `injectBootstrapTheme`, `injectDaisyTheme`, `injectOpenPropsTheme` and the
  `InjectAdapterOptions` type are no longer exported from `@theme-kit/angular`. They
  were the only reason this package depended on four component-library adapters, which
  in turn pulled React into an Angular app.

  This is the dependency-isolation contract (2.0.0): a framework package depends only on
  `core`/`web`, and adapter framework bindings live on the adapter's own per-framework
  subpath. Angular is a framework package, so its adapter hooks move out with everyone
  else's.

  **Migration.**

  ```ts
  // before (1.3.x)
  import { injectShadcnTheme } from "@theme-kit/angular";

  // after (2.0.0)
  import { injectShadcnTheme } from "@theme-kit/shadcn/angular";
  ```

  Same for `injectBootstrapTheme` → `@theme-kit/bootstrap/angular`,
  `injectDaisyTheme` → `@theme-kit/daisyui/angular`,
  `injectOpenPropsTheme` → `@theme-kit/open-props/angular`. The
  `InjectAdapterOptions` type is exported from the same subpath.

  `@theme-kit/angular` no longer declares any adapter dependency, so it installs with
  only `core` + `web`.

### Minor Changes

- Fix the pre-paint script writing CSS variables nothing reads, and make its
  critical CSS respect the resolved mode.

  `createBlockingScriptContent` flattened tokens with a local helper that passed an
  empty prefix for the `colors` group, so it emitted `--theme-background` while
  core's `themeToCSSVariables`, the Tailwind preset, the adapters and every shipped
  example read `--theme-color-background`. The pre-paint stylesheet was therefore
  **inert**: a theme's colors only appeared once the client runtime booted, which
  is the flash the helper exists to prevent. It also dropped `borderWidths`,
  `zIndex`, `breakpoints`, `typography` and `code`, and did not flatten `extends`
  chains. It now delegates to core's `themeToCSSVariables`, so the emitted names are
  the canonical ones and every token group is covered.

  The critical CSS was also emitted as both a `prefers-color-scheme` block per
  scheme _unconditionally_, which meant a concrete `light` selection followed an
  OS-dark visitor whenever the script was blocked. A concrete mode is now a plain
  `:root` rule; only `"system"` — the one mode the server cannot resolve — uses
  media queries. Verified with scripts blocked: `light`/`dark`/`system` each paint
  the expected canvas against both OS schemes.

  `createBlockingScriptContent` gains an optional third argument,
  `BlockingScriptOptions` (`{ mode?, defaultTheme? }`). The fallback mode was
  previously derived from `themes[0]` alone, so a caller who asked the runtime for
  `"system"` had no way to tell the script, and the two disagreed. Additive: the
  existing two-argument calls compile and behave as before.

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.4.0
  - @theme-kit/web@1.4.0

## 1.3.0

### Minor Changes

- React: add `createThemeRoot()` — an optional client-only root bootstrap that lets Theme Kit own the initial React root commit (synchronous first commit via the framework-documented `flushSync` boundary) for CSR applications with a measured first-render scheduling gap. Composition stays in the app: the `render({ runtime })` callback owns the whole provider tree. `ThemeProvider` remains the normal React integration and never calls `flushSync` itself.

  Core: add a `scrollbar` option to the Vite plugin to inject the pre-paint scrollbar bootstrap (`createPrePaintScrollbarScript`) head-prepend, so the custom overlay is the only scrollbar from the first frame.

  React/Vue/Solid/Svelte/Angular: wire scrollbar pre-paint on the `ThemeScrollbar` mount (idempotent — no-ops when the plugin/SSR adapter already emitted it).

  Vue: fix the selected theme not persisting to localStorage.

  Docs: add "Which React setup should I use?", an "Optimized CSR bootstrap" section with architecture diagrams and multi-provider composition, and regenerate the API reference (now including `createThemeRoot`).

### Patch Changes

- Updated dependencies
  - @theme-kit/core@1.3.0
  - @theme-kit/shadcn@1.3.0
  - @theme-kit/bootstrap@1.3.0
  - @theme-kit/daisyui@1.3.0
  - @theme-kit/open-props@1.3.0
  - @theme-kit/web@1.3.0

## 1.2.2

### Patch Changes

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

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.0.0
  - @theme-kit/bootstrap@1.0.0
  - @theme-kit/daisyui@1.0.0
  - @theme-kit/open-props@1.0.0
  - @theme-kit/shadcn@1.0.0
