# Theme Kit — Docs/API Parity Audit (update.md)

Date: 2026-08-14 · Scope: `packages/*`, `apps/docs`, canonical docs (`docs.md`,
`adapter-architecture.md`, `webpage-progress.md`).

## Rule applied

- Source exports an API → it is documented.
- Docs claim an API the source does not export → the docs are corrected
  (never invented).
- Designed but unimplemented → kept out of 1.0 docs; listed as future work.
- Every public API should have at least one working snippet that reflects the
  real exports.

## Result

- Build: `next build` — **pass** (84 static pages).
- Typecheck: `tsc --noEmit` — **pass**.
- API drifts found: **10**; all corrected.
- No source/package code was changed — all fixes were documentation-only.
- No public API is missing a docs page. One documented-but-nonexistent API
  (`createMantineAdapter`) was corrected rather than implemented, because
  Mantine deliberately ships a provider-based bridge (`createMantineTheme` +
  `MantineThemeProvider`) instead of a `ThemeAdapter` factory.

## 1. Confirmed & fixed API drifts

| # | Docs claimed | Actual API | Where | Fix |
| --- | --- | --- | --- | --- |
| 1 | `runtime.setTheme("dark")` | `runtime.selection.setMode("dark")` (or `runtime.store.set(theme)`) — runtime has no `setTheme` | `content/adapters.md`, `adapter-architecture.md` | Rewrote snippet |
| 2 | `useTheme()` returns `setTheme` | Returns `{ theme, mode, family, setMode, setFamily, toggleTheme }` | `lib/use-cases-libraries.ts` (daisyUI picker) | `setTheme` → `setFamily` |
| 3 | `useBootstrapTheme({ injectCSS: false })` — "options flow through" | React/Vue/Svelte/Solid hooks accept only `{ strategy }`; `injectCSS` is a factory option | `content/adapters.md`, `adapter-architecture.md` | Removed hook claim; documented factory-only `injectCSS` |
| 4 | `createMantineAdapter()` exists | Mantine exports `createMantineTheme`, `useMantineTheme`, `MantineThemeProvider` only | `lib/frameworks.tsx` (React page) | Replaced with real Mantine provider API |
| 5 | `synchronizeTransition(theme)` exists (Tailwind) | Tailwind exports `createTailwindPlugin`, `synchronizeDarkClass`, `themeCSS` | `lib/frameworks.tsx` (Tailwind page) | Replaced with `themeCSS` |
| 6 | `createUnoTheme({ family: "berry" })` | `createUnoTheme(source: AdapterSource)` — runtime \| store \| theme \| tokens; a selection object is not a source | `content/adapters.md` | Rewrote with `resolveInitialTheme` → theme |
| 7 | `ThemeKitProvider` imported from `@theme-kit/core` / `@theme-kit/react` | React exports `ThemeProvider` (not `ThemeKitProvider`); `createThemeRuntime` is from `@theme-kit/core` | `adapter-architecture.md` (4 spots) | Corrected imports/components |
| 8 | Web runtime `runtime.setMode()` / `runtime.theme.name` | Core runtime exposes `selection.setMode()` / `store.get().name` | `lib/use-cases.ts` (web-components) | Rewrote snippet |
| 9 | Astro `runtime?.theme.name` | `getGlobalRuntime()` → core runtime → `store.get().name` | `lib/use-cases.ts` (astro) | Rewrote snippet |
| 10 | Angular signal `theme.toggleTheme()` / `theme.theme()` | `injectTheme()` returns a `Signal<ThemeState>` — must be called: `theme().toggleTheme()` | `lib/use-cases.ts`, `lib/packages.tsx`, `lib/frameworks.tsx` | Added `()` calls |

## 2. Verified accurate (no change)

- Core runtime surface: `store` (`.get/.set/.subscribe/.batch/.destroy` with
  `{ force?, suppressTransition? }`), `selection` (`setMode/setFamily/
  toggleTheme`), `registry`, `themes`, `history`, `lifecycle`, `adapters`
  (`use()` → handle `.dispose()`), `transition?`, `update`, `use`, `batch`,
  `snapshot`, `restore`, `destroy`.
- `store.set(theme, { suppressTransition: true })` — real, and used throughout
  the framework pages as the per-update escape hatch.
- Adapter contract: `ThemeAdapter { id, supports, install, uninstall }`,
  `AdapterStrategy = "exact" | "native" | "aggressive"`, `AdapterPlugin`
  (`refine`/`transform`), registry disposal semantics.
- Generated-theme adapters (MUI, Chakra, AntD): `createMuiAdapter`,
  `createChakraAdapter`, `createAntdAdapter` with `getSnapshot`/`subscribe`,
  plus `MuiThemeProvider`-style providers and `useRuntimeThemeFactory`.
- Transition/animation exports: `ThemeTransitionOptions`, `TransitionPreset`,
  `TRANSITION_PRESETS`, `DEFAULT_TRANSITION_PRESET`,
  `DEFAULT_THEME_TRANSITION`, `createThemeDiff`, `createTransitionPlan`,
  `scanForTransition`, `runThemeAnimation`, `cancelThemeAnimation`,
  `createAnimationsPlugin` — all present, all documented.
- ThemeScope implemented semantics (`scoped-theme.ts`): name/family/`{family,
  mode}` selections, `localThemes` (local theme definitions), reactive
  updates, scoped token overrides, `resolveScopeTransition` inheritance.
- Next `ThemeProvider` props: `transition`, `scrollbar: boolean |
  PrePaintScrollbarOptions`, `font`, `body`, passthrough `<html>` attrs.
- `@theme-kit/core/vanilla` `ThemeKit` class API (`setMode`, `setFamily`,
  `toggleTheme`, `update`, `use`, `toCSSVariables`, `on`, `off`, `destroy`,
  getters) — accurate in `packages.tsx`.
- Adapter framework-coverage table (React/Vue/Svelte/Solid; generated-theme
  adapters React-only) — accurate.
- CSS-injection behavior: factory `injectCSS` toggle + hooks always inject;
  idempotent/SSR-safe — now documented correctly.

## 3. Docs claim an API that IS now verified (was under-specified)

- `synchronizeDarkClass(theme)` — exported by `@theme-kit/tailwind`, documented.
- `presetThemeKit()` / `createUnoTheme(source)` — exported by `@theme-kit/unocss`.
- Svelte `setThemeRuntime`/`getThemeRuntime` — exported; used correctly in
  `content/adapters.md`.
- `getGlobalRuntime`/`setGlobalRuntime` (Astro), `getProviderRuntime`
  (Web Components) — exported; snippet corrected to the real core-runtime API.

## 4. Missing/weak areas (recommended follow-ups, not blockers)

| Area | Status | Note |
| --- | --- | --- |
| ThemeScope "local themes" + token overrides | Partial | Contract implemented (`localThemes`, `prefix`, `transition`, `prefersDark`); `app/scoped-theme` covers name/family/nesting/imperative, but not `localThemes`. |
| Nuxt framework-guide depth | Good | Nuxt page already at Tier-1 (config-driven SSR, blocking bootstrap, cookie sync, auto-imports). |
| Orphaned content | Partial | `content/animation.md` and `content/framework-guides.md` are **not rendered by any route** (animation/framework-guides are JSX-driven), but the site search index (`lib/search.ts`) walks all of `content/*.md`, so they ARE consumed — they feed `/animation` and `/framework-guides` search results. Their content is stale vs. the JSX pages. Recommendation: re-sync or drop them. |
| Scoped-theme page | Fixed | Expanded `app/scoped-theme/page.tsx` with the implemented `themes`/local-themes contract, the scope `transition` inheritance model (`undefined`/`true`/`false`/merge), reactive `{family, mode}` selection, and SSR pre-paint (system-based `@media` block). |
| Zero-flash page | Fixed | SvelteKit reclassified as client-bootstrap (no SSR server package), not server-resolved. |
| Mantine as "adapter" | By design | Mantine ships provider-based bridge, not a `ThemeAdapter`. Docs now reflect that. |

## 5. Future work (deliberately not documented as 1.0 API)

- `@theme-kit/tailwind` `createTailwindPlugin` returns a stub (`{ name }`);
  real integration is the CSS import. A full runtime-bridging plugin
  (`synchronizeTransition`) is future work.
- React hooks passing `injectCSS` through to adapters (currently factory-only).
- `@theme-kit/sveltekit` dedicated SSR package (none exists; Svelte is
  client-first via core bootstrap primitives).

## 6. Verification commands

```sh
# from repo root
pnpm --filter @theme-kit/docs typecheck
# from apps/docs
next build
```