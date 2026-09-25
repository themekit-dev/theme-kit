# @theme-kit/react

## 1.3.1

### Patch Changes

- Type the `useThemeLifecycle()` handler per event name instead of `unknown`.

  `runtime.lifecycle.on` in `@theme-kit/core` is generic over the event name —
  `on("beforeThemeChange", ({ next }) => …)` gives you `next: T`. The React
  wrapper widened the handler to `(data: unknown) => void`, so the same call in a
  component lost the payload type and `data.next` did not compile, despite the
  docs describing these as "typed lifecycle events".

  ```ts
  // before — `data` is `unknown`
  on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => () => void;

  // after
  on: <K extends ThemeLifecycleEventName>(
    event: K,
    listener: (data: ThemeLifecycleEventMap<T>[K]) => void,
  ) => () => void;
  ```

  Type-only: the runtime behaviour is unchanged and no exports were added or
  removed. Handlers that took `unknown` still typecheck (a function accepting
  `unknown` is assignable to one accepting a specific payload), so this only turns
  previously-erroring code into working code.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @theme-kit/core@1.4.0

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

- Fix scrollbar overlay clipping to host rounded corners; update framework packages (react/solid/svelte/vue) and core internals.
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
