# Theme Kit — Adapter Architecture Pass

Runtime-owned library-adapter architecture, with Bootstrap as the reference adapter.

## Status: DONE (verified)

### Recovery (environmental incident)
- The previous session's interrupted directory moves left `packages/core` **EMPTY** (source + `package.json` gone; repo has no git history). It was recovered verbatim from a surviving junction copy inside `packages/adapters/shared/node_modules/@theme-kit/core`.
- `packages/bootstrap` was also lost in that move. Relocated cleanly to `packages/adapters/bootstrap`:
  - Copied `src/` + `test/` only (avoided copying `node_modules`); reconstructed `package.json`, `tsup.config.ts`, `tsconfig.json`, `tsconfig.build.json`; fixed `tsconfig` `extends` path for the deeper nesting (`../../../tsconfig.base.json`); deleted the old `packages/bootstrap`; added `packages/adapters/*` to the `pnpm-workspace.yaml` globs.
- The pnpm store was corrupted for several packages (`jsdom@29.1.1`, `@types/react@19.2.17`, `@types/react-dom@19.2.3`, and the real `react@19.2.8` / `react-dom@19.2.8` blobs were empty). Repaired by clearing the empty store artifacts + `pnpm fetch --config.confirmModulesPurge=false` + targeted `pnpm add` refetches. Reverted the accidental root-level `-w` devDeps that the repair temporarily added back to their owning packages.

### Architecture implemented
- `ThemeAdapter` contract + `AdapterRegistry` already live in `@theme-kit/core` (`src/adapters/library.ts`, exported via `adapters/index.ts` -> root `src/index.ts`) and are wired into the runtime (`ThemeRuntimeOptions.adapters`; `runtime.adapters` installed at creation and destroyed in `runtime.destroy()` / store-subscribe lifecycle).
- Shared adapter helpers in `@theme-kit/adapters`:
  - `AdapterSource` / `AdapterResolvedTheme` / `resolveAdapterSource` (`source.ts`)
  - token/color readers (`tokens.ts`, `color.ts`): `readColor`, `readToken`, `readFontSize`, `readRadius*`, `readBreakpoints`, `rgbTriplet`, `hexToRgb`, `mixColors`, `generateShades`
  - React helpers (`react.ts`): `useRuntimeThemeFactory`, `useCSSVariables`
- Bootstrap adapter (`packages/adapters/bootstrap`) as the reference adapter, following
  `normalize → refine → generate → inject → observe`:
  - `defaults.ts` — options + constants (`BOOTSTRAP_STYLE_ID`, `BOOTSTRAP_VARIABLES_STYLE_ID`).
  - `tokens.ts` — resolves a theme via `resolveAdapterSource` and derives the Bootstrap semantic color set (success/warning/info fall back to accent).
  - `refine.ts` — `AdapterPluginContext` factory (`createBootstrapRefineContext`) + typed plugin application.
  - `generator.ts` — `generateBootstrapVariables` produces **concrete** `--bs-*` values **including `-rgb` triplets that plain CSS cannot derive**; `createBootstrapVariables` kept as a compat export (existing tests pass unchanged).
  - `inject.ts` — tagged `<style>` management (`injectCSS`/`removeCSS`/`toCSS`).
  - `observer.ts` — `getBootstrapVariables(runtime)` helper.
  - `adapter.ts` — `createBootstrapAdapter()` returns a `ThemeAdapter` (`id: "bootstrap"`); `install` injects `bootstrap.css` + a `:root { --bs-* }` style and subscribes to `runtime.store`; on theme change it recomputes and rewrites the variables; `uninstall` tears down the subscription + styles.
  - `index.ts` — exports `createBootstrapAdapter` + `createBootstrapVariables`; compat `useBootstrapTheme()` now **registers the adapter on the runtime** (instead of setting up its own CSS-variables binding); `injectBootstrapCSS` retained for SSR safety.
  - `bootstrap.css` — removed the redundant `:root { --bs-* = var(--theme-*) }` block; concrete `--bs-*` values are now owned solely by the adapter. Component-variant rules (`.btn-*`) read `var(--bs-*)` produced by the adapter.

### Provider wiring
- React `ThemeProvider` already accepted `adapters` (it extends `ThemeRuntimeOptions`).
- Next `ClientThemeProvider` (`packages/next/src/provider.tsx`) now exposes `adapters?: ThemeAdapter<T>[]` and forwards it to the underlying `ReactThemeProvider`.

### Verification
- `pnpm -r build` — all workspace packages compile cleanly (tsup ESM+CJS + tsc `.d.ts` emit).
  - Sole failure: `examples/solid-app` (pre-existing Vite/Solid `solid-js@1.9.14` jsx-runtime interop issue) — unrelated to this work.
- `@theme-kit/core` tests: **35 files / 236 tests pass** (jsdom-based DOM tests now run after the store repair).
- `@theme-kit/bootstrap` tests: **4/4 pass** (`createBootstrapVariables` output unchanged).
- `@theme-kit/next` tests: **3/3 files, 7/7 pass** (provider change covered).
- Playground production build (`next build`): **succeeds** (4 routes generated, no `@charset`/compile errors).
- Runtime (headless Chrome -> Next dev on :3999) probe confirms the adapter is live + reactive:
  - initial (light): `:root { --bs-primary:#ea580c; --bs-primary-rgb:"234, 88, 12"; --bs-body-bg:#fff7ed; --bs-body-color:#431407 }` injected by a `:root` rule; `.btn-primary` bg = `rgb(234,88,12)`.
  - after **Dark**: vars swapped to `#fb923c` / `#431407` bg / `#fff7ed` body; btn updated.
  - after **Toggle**: returned to light values.
  - `logs: []` (no JS/CSS exceptions). Mantine body-background theme fix still holds.

### Remaining / out of scope
- A shared `normalize`-stage factory isn't extracted into `@theme-kit/adapters` (core's `resolveAdapterSource`/`resolveTokens` already cover normalization and Bootstrap is self-contained). Low priority; revisit if more adapters share logic.
- `examples/solid-app` Vite/Solid build failure is pre-existing and unrelated.
- `apps/docs` web site was not part of this pass (documented separately in `webpage-progress.md`).
