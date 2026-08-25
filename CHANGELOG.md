# Changelog

## 1.0.0 — 2026-08-24

The initial public release of Theme Kit — a framework-agnostic theming runtime with semantic tokens,
theme families, SSR-safe hydration, smooth transitions, scoped themes, and ecosystem adapters.

Available on [npm](https://www.npmjs.com/org/theme-kit) · [GitHub](https://github.com/themekit-dev/theme-kit) · [Documentation](https://theme-kit-dev.vercel.app)

### Highlights

- **Core runtime** (`@theme-kit/core`): theme store, selection controller, system-mode binding,
  CSS-variable binding, DOM binding, transition engine, history, snapshots, persistence, scheduling,
  broadcast (cross-tab sync), plugin system, and adapter registry.
- **8 frameworks**: React, Next.js, Vue 3, Nuxt 3, Svelte 5, SolidJS, Angular, Astro, Remix, and
  Web Components — each with a native `ThemeProvider`, `useTheme`, and framework-specific hooks.
- **SSR-first zero-flash**: fingerprint-guarded cookie persistence, server-side theme resolution,
  blocking bootstrap script, and `@media (prefers-color-scheme: dark)` fallback — the theme is
  applied before the first paint in every framework.
- **Theme families**: independent palette and mode switching — `mint-light`, `mint-dark`,
  `plum-light`, `plum-dark`, all from one `setMode` / `setFamily` API.
- **ThemeScope**: isolate a subtree with its own theme, family, mode, local theme definitions, and
  transition config — works in all 7 frameworks.
- **ThemeScrollbar**: a theme-colored overlay scrollbar with the same physics as the native scrollbar,
  no layout shift, and pre-paint bootstrap for zero flash.
- **Scheduling**: sunrise/sunset-based theme switching using NOAA solar math, with
  `createThemeSchedule` / `useThemeSchedule` in every framework.
- **9 adapters**: MUI, Chakra UI, Ant Design, Mantine, shadcn/ui, Bootstrap, DaisyUI, Open Props,
  and UnoCSS — each with a factory function and framework hooks.
- **CLI** (`theme-kit`): generate, validate, migrate, inspect, and export themes.
- **Tailwind CSS v4 plugin**: `@theme-kit/tailwind` maps semantic tokens to Tailwind theme variables.
- **DevTools**: runtime inspector for debugging theme state, transitions, and adapter activity.

### Breaking changes

No prior releases — this is the first published version.

### What's new compared to the pre-release phases

- Coherent 1.0.0 version across all 24 packages.
- Frozen public API (24 packages, 0 source⇄dist⇄docs drift, verified via `scripts/release/export-inventory.mjs`).
- All lifecycle tests pass (install → theme update → cleanup → dispose-after-destroy for every
  adapter).
- Consumers verified via real tarball installs (vanilla ESM/CJS, React typecheck+SSR, CLI 19 tests).
- Browser-tested: zero-flash, system mode, persisted dark/light, rapid switching, reduced motion,
  scrollbar overlay, keyboard a11y.
- Nuxt SSR parity: 18 tests cover cookie parsing, fingerprint staleness, resolution, and bootstrap
  script execution against a fake DOM.
- Adapter lifecycle: 14 new lifecycle tests across 7 adapters.
- Code token system: `tokens.code` as an opt-in semantic namespace, verified with 6 tests.
- 3 zero-flash bugs fixed during browser testing (Next blocking script, React provider system-mode
  guard, Next layout mode pass-through).
- 1 publish-blocking fix (`@theme-kit/adapters` was `private: true` while 8 packages depended on it).
- 1 CLI version drift fix (`packages/cli/src/version.ts` was `0.0.1` vs `package.json` `1.0.0`).
- 1 bin path format fix (npm 11 drops `./`-prefixed bin paths).
- 1 docs generation fix (TypeAlias kind was wrong — all type aliases silently dropped from API reference).
- 1 adapter lifecycle fix (mui/chakra/antd `uninstall()` didn't reset the snapshot).
- Metadata hygiene: description/repository/homepage/bugs/keywords/engines/publishConfig for all packages.
- Audit infrastructure: 623 checks per package, 0 failures, runnable via `pnpm release:audit`.
- Consumer fixture: `node release-test/run.mjs` packs → installs from tarballs → runs all smoke tests.