# @theme-kit/cli

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

## 1.2.2

### Patch Changes

- Updated dependencies
  - @theme-kit/core@1.2.2

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

- Add a stable, documented exit-code scheme to the `theme-kit` CLI — `0` success,
  `1` runtime/command error, `2` invalid arguments, `3` validation failure — via a
  public `UsageError` and `ExitCodes` from the library API. Commands report bad
  arguments as `UsageError` (exit `2`), `validate` exits `3` on failure, and
  `theme-kit --version` prints a clean semver. The transaction also ships a
  package `README.md` and `LICENSE` (added to `files`), a `prepublishOnly`
  build-before-publish guard, and a first-run help screen with per-command
  `--help` output. The docs site now treats the CLI as a full-class product area:
  overview, installation, quick start, one page per command, workflows, and a
  CI & automation page with exit codes and GitHub Actions.

### Patch Changes

- Make the CLI work end-to-end. `validate` now checks `validateTheme`'s returned
  `valid` flag and lists the exact missing token paths instead of always reporting
  success. `generate` accepts `--mode light|dark|both` (default `both`) so it can
  write a single `ThemeDefinition` as well as a `{ light, dark }` pair. The
  `validate`, `inspect`, `export`, and `migrate` commands now transparently accept
  both the single-theme and pair shapes, so the full pipeline (generate → validate
  → inspect → export → migrate) works on its own output — previously `export`
  emitted empty CSS and `inspect` showed "unnamed" for a generated pair. `export`
  of a pair emits `:root` for light and `.dark, [data-theme="dark"]` for dark.
  Also build the `@theme-kit/cli` library entry (`dist/index`), add the `banner`
  shebang, point the `theme-kit` bin at the CJS build for cross-shell
  compatibility, and add a `require` export so CJS consumers resolve the package.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.0.0
