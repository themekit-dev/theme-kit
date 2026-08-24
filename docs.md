## Theme Kit — Documentation Source

Canonical documentation source for Theme Kit.

This version is intended to sit at the top of your existing docs.md.

Why Theme Kit?

Most theme libraries solve one problem: dark mode.

Theme Kit solves theming.

Design Goals

Framework agnostic

Semantic tokens first

SSR-first

Zero flash of incorrect theme

Zero hydration mismatch

Runtime-driven architecture

Type-safe APIs

Accessible by default

Progressive enhancement

Extensible plugin system

Minimal JavaScript

Philosophy

One runtime shared across every framework.

Semantic tokens over hardcoded colors.

Server-first rendering.

Extensible architecture.

Excellent developer experience.

Documentation Structure

Overview

Core Concepts

Architecture

Packages

Framework Guides

Advanced Features

API Reference

CLI

DevTools

Roadmap

Documentation Website

# The documentation website should contain:

Documentation

Interactive Playground

Theme Studio

Theme Gallery

API Reference

Framework Guides

Showcase

Blog

Roadmap

# Recommendation

This document describes every feature of the **Theme Kit** library. It is the canonical content source for the interactive documentation site (`apps/docs`), which is built with Next.js and visualizes the library and its features.

## The Documentation Uses Theme Kit

The entire documentation website (`apps/docs`) is built using Theme Kit itself.

The docs are not a separate demonstration—they are a real-world application of the library.

Every theme change on the website is powered by Theme Kit's runtime.

The documentation showcases production usage of:

- `@theme-kit/next` for SSR-first theme management
- `@theme-kit/react` hooks and components
- `@theme-kit/tailwind` for design token mapping
- Built-in themes and theme families
- Theme history (Undo / Redo)
- Runtime theme editing
- Theme generation
- Theme transitions
- Component-scoped themes
- Accessibility profiles
- Scheduled themes
- Multi-window synchronization
- DevTools integration

The documentation itself serves as the largest real-world example of the library.

Every example shown in the docs is executed using Theme Kit—not mocked or simulated.

Whenever a new feature is added to Theme Kit, the documentation should adopt that feature internally wherever appropriate. This keeps the documentation synchronized with the library and ensures every release is validated by a production-scale application.

Theme Kit powers Theme Kit.

## Documentation Website Goals

The documentation website is considered a first-class application of Theme Kit.

Goals:

- Use Theme Kit for all theme management
- Showcase every feature in production
- Serve as the official playground
- Demonstrate every supported framework
- Generate API documentation from source
- Visualize design tokens
- Visualize theme inheritance
- Visualize runtime updates
- Visualize theme history
- Visualize plugins
- Visualize lifecycle events
- Provide interactive examples
- Provide copy-paste examples
- Host all examples used throughout the documentation

## Overview

Theme Kit is a powerful, framework-agnostic theming library. Unlike classic "dark mode" helpers, it is built around **theme families**, **semantic tokens**, and a **runtime** that works in any framework — from vanilla JS to React, Vue, Angular, Svelte, Solid, and the web platform itself.

### Monorepo Structure

```
theme-kit/
│
├── packages/                 # Library packages (all published as @theme-kit/*)
│   ├── core/                 # Framework-agnostic core
│   ├── react/                # React provider + hooks
│   ├── next/                 # Next.js App Router integration (SSR, cookies)
│   ├── vue/                  # Vue 3 provider + composables
│   ├── svelte/               # Svelte 5 provider + stores
│   ├── solid/                # Solid provider + signals
│   ├── angular/              # Angular provider, injectables, directive
│   ├── web/                  # Framework-free custom elements
│   ├── tailwind/             # Tailwind CSS v4 mappings
│   ├── astro/                # Astro islands integration
│   ├── nuxt/                 # Nuxt 3 module
│   ├── remix/                # Remix integration
│   ├── cli/                  # theme-kit CLI
│   ├── devtools/             # DevTools inspector + plugin
│   └── docs/                 # (see apps/docs)
│
├── examples/                 # Framework examples & playground
│   ├── react/
│   ├── next/
│   ├── vue/
│   ├── angular/
│   └── vanilla/
│
├── apps/
│   └── docs/                 # Next.js documentation site
│       ├── app/
│       ├── components/
│       ├── playground/
│       ├── content/
│       ├── public/
│       └── next.config.ts ...
│
└── docs.md                   # This file — documentation source
```

---

## Packages & Feature Map

| Package                   | Scope                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `@theme-kit/core`         | Store, model, registry, runtime, adapters, utils               |
| `@theme-kit/core/vanilla` | `ThemeKit` class — drop-in theming without a framework         |
| `@theme-kit/core/vite`    | Vite plugin — blocking theme bootstrap script                  |
| `@theme-kit/react`        | React provider, hooks, scopes, inspector                       |
| `@theme-kit/next`         | Next.js App Router — SSR, cookies, zero-flash hydration        |
| `@theme-kit/vue`          | Vue 3 provider, composables, scopes                            |
| `@theme-kit/svelte`       | Svelte 5 provider, readable stores, scopes                     |
| `@theme-kit/solid`        | Solid provider, signals, scopes                                |
| `@theme-kit/angular`      | Angular providers, injectables, `ThemeScope` directive         |
| `@theme-kit/web`          | Web Components — `<theme-kit-provider>`, toggle, select, scope |
| `@theme-kit/tailwind`     | Tailwind CSS v4 `@theme` mapping                               |
| `@theme-kit/astro`        | Astro islands + blocking script                                |
| `@theme-kit/nuxt`         | Nuxt 3 module + auto-imports                                   |
| `@theme-kit/remix`        | Remix loader-based SSR theming                                 |
| `@theme-kit/cli`          | Generate, validate, migrate, inspect, export themes            |
| `@theme-kit/devtools`     | Runtime inspector panel + plugin                               |

---

## Core Concepts

### Theme

A theme is a named set of semantic tokens plus metadata.

```ts
interface ThemeDefinition {
  name: string; // e.g. "plum-dark"
  extends?: string | string[]; // inherit from another theme
  meta?: ThemeMeta; // label, family, mode, order, tags, version...
  tokens?: ThemeTokens; // colors, spacing, radius, shadows, ...
}
```

### Token Groups

Tokens are grouped by **semantic meaning**, not raw values:

- `colors` — nested, recursively-addressable: `colors.surface.default`, `colors.primary`, `colors.accent.hover`
- `spacing`, `radius`, `shadows`, `borderWidths`, `zIndex`, `breakpoints`
- `typography` — `fontFamilies`, `fontSizes`, `lineHeights`

### Mode & Family

- **Mode** — `"light" | "dark" | "system"`
- **Family** — a named set of themes (e.g. `"plum"`, `"mint"`, `"apple"`). Switching family changes the palette; switching mode changes light/dark within that family.

### Semantic Token Groups

Nested tokens produce **recursive groups** that render as CSS variables:

```
--theme-color-surface-default
--theme-color-surface-hover
--theme-radius-lg
--theme-spacing-4
```

---

## `@theme-kit/core` — Core Features

### Theme Store

A minimal reactive store that holds the active theme.

- `createThemeStore({ initialTheme })`
- `store.get()` / `store.set(theme)` / `store.subscribe(listener)`
- `store.batch(cb)` — coalesce multiple updates into one notification
- `destroy()`

### Theme Model Builders

- **`defineTheme(theme)`** — type-safe, zero-cost definition helper
- **`extendTheme(name, base, overrides)`** — inherit from a base theme and override tokens/meta
- **`composeTheme(name, ...sources)`** — merge multiple theme definitions into one
- **`mergeThemeDefinitions(a, b)`** / **`mergeTokens(a, b)`** — low-level merge utilities
- **`resolveTheme(themes, name)`** — resolve a theme definition, following `extends` chains

### Theme Registry

A registry of every registered theme, powering dynamic theming.

- `createThemeRegistry({ themes })`
- `register` / `registerMany` / `unregister` / `replace` / `get` / `has` / `list`
- `getFamilies()` / `getThemesByFamily(family)`
- **Theme Packs** — `runtime.use({ name, themes })` installs a bundle of themes; pack tags are stamped into theme meta

### Theme Runtime

The heart of the library — wires store, registry, selection, persistence, broadcast, DOM bindings, history, lifecycle, and plugins together.

```ts
const runtime = createThemeRuntime({
  themes, // default: built-in themes
  defaultTheme,
  initialMode,
  initialFamily,
  persistence, // localStorage adapter by default
  broadcast, // BroadcastChannel adapter by default
  dom, // DOM attribute binding options (false to disable)
  cssVariables, // CSS variable binding options (false to disable)
  transition, // smooth transitions
  scheduled, // sunset/sunrise auto switching
  plugins,
});
```

Runtime API:

- `runtime.store` — theme store
- `runtime.registry` — theme registry
- `runtime.selection` — `setMode`, `setFamily`, `toggleTheme`, `getSelection`
- `runtime.themes` — all registered themes
- `runtime.update(tokens)` — **live theme editing**: merge partial tokens into the active theme
- `runtime.use(pack)` — install a theme pack at runtime
- `runtime.batch(cb)` — atomic updates
- `runtime.snapshot()` / `runtime.restore(snapshot)` — serialize & restore full state
- `runtime.history` — undo/redo
- `runtime.lifecycle` — event bus
- `runtime.destroy()` — full teardown

### Live Theme Generation

```ts
const { light, dark } = generateTheme({ seed: "#6366f1", family: "indigo" });
```

Generate a complete light + dark theme pair from a single seed color, deriving secondary, muted, accent, border, and ring colors with HSL math.

### Theme Validation

```ts
const result = validateTheme(theme, { themes });
// { valid: boolean, issues: [{ type: "missing", path, message }] }
```

Validates that a theme defines all required semantic color tokens (background, foreground, card, primary, ring, ...), resolving `extends` chains when a theme list is provided.

### Theme Migration

```ts
migrateTheme(theme, { targetVersion });   // returns migrated theme
registerMigration({ from, to, remapColors?, migrate? });
```

Version themes with a migration chain. Migrations can remap color token keys or run arbitrary transforms, so old theme files automatically upgrade to the latest format.

### Theme History (Undo / Redo)

```ts
runtime.history.undo(); // step back
runtime.history.redo(); // step forward
runtime.history.jump(i); // jump to any point in time
runtime.history.canUndo(); // / canRedo()
runtime.history.getHistory(); // / clear()
```

History is capped (default 50 steps) and records full theme snapshots with timestamps.

### Lifecycle Events

`runtime.lifecycle.on(event, handler)` with typed payloads:

| Event               | Payload             |
| ------------------- | ------------------- |
| `beforeThemeChange` | `{ current, next }` |
| `afterThemeChange`  | `{ theme }`         |
| `beforePersist`     | `{ selection }`     |
| `afterPersist`      | `{ selection }`     |
| `beforeApply`       | `{ theme }`         |
| `afterApply`        | `{ theme }`         |

### Plugins

Plugins hook into the lifecycle and can transform tokens.

```ts
interface ThemePlugin {
  name: string;
  priority?: number;
  onRuntimeCreated?(runtime): void;
  onBeforeThemeChange?(data): void;
  onAfterThemeChange?(data): void;
  onBeforePersist?(data): void;
  onAfterPersist?(data): void;
  onBeforeApply?(data): void;
  onAfterApply?(data): void;
  onDestroy?(): void;
  transformTokens?(tokens, ctx): ThemeTokens;
}
```

**Official plugins:**

- `createPersistencePlugin()` — persist selection to localStorage
- `createBroadcastPlugin()` — cross-tab sync
- `createHistoryPlugin()` — undo/redo
- `createAnimationsPlugin()` — theme transition animation control
- `createAccessibilityPlugin()` — contrast / accessibility enforcement
- `createScheduledPlugin()` — auto light/dark by solar time
- `createDebuggerPlugin()` — theme change logging
- `createDevToolsPlugin()` — devtools inspector wiring
- `createGenerationPlugin()` — live theme generation from a seed

### Token Resolution

Tokens support **references and derived values**, resolved lazily at runtime:

- **References** — `"$colors.primary"` or `"{colors.primary}"` point to another token (with circular-reference detection)
- **Expressions** — numeric math like `"calc(100% + 2rem)"` style evaluations (e.g. `"2 * 3rem"`, `"50% + 10px"`)
- **Derived colors** — `"contrast(#123456)"` returns black/white by WCAG luminance; `"auto()"` derives a foreground from a base token (e.g. `primaryForeground: "auto()"`)

Utilities: `flattenTokens`, `resolveFlatTokens`, `resolveTokens`, `hasTokenReferences`, `resolveValueReferences`, `evaluateExpression`.

### Accessibility Toolkit

- `getContrastRatio(a, b)` — WCAG contrast ratio
- `checkContrastPair(fg, bg, ratio)` / `validateThemeContrast(theme)` — audit a full theme
- **Color Vision Deficiency simulation** — `simulateCVD(color, type)`, `simulateThemeForCVD(theme, type)`, `getCVDLabel(type)` for protanopia, deuteranopia, tritanopia, etc.

### DOM Adapters

- **CSS Variables binding** — `createCSSVariablesBinding(store, { prefix, target, transition, styleSheet, layerName })`. Writes `--theme-*` variables inline or into a `@layer` stylesheet; batches writes and diffs against previously applied variables for minimal DOM churn.
- **DOM Attribute binding** — `createDOMBinding(store, { target, attributeName, transition })`. Sets `data-theme`, `data-theme-family`, `data-theme-mode`, toggles the `.dark` class, and sets `color-scheme`.
- **System theme binding** — `createSystemThemeBinding(store, { lightTheme, darkTheme })` — follows `prefers-color-scheme`.
- **Scoped theme binding** — `createScopedThemeBinding(themes, target, themeName)` — apply a theme to a subtree.
- **Transitions** — `ThemeTransitionOptions`: `enabled`, `duration`, `easing`, `useViewTransition`, `properties[]` (40+ default animated properties).
- **View Transitions API** — native `document.startViewTransition` when switching themes.

### Multi-Window Sync

Sync theme selection across tabs/windows instantly:

- **BroadcastChannel** — primary transport (`createThemeSelectionBroadcast`)
- **SharedWorker** — inline blob-based worker relay
- **StorageEvent fallback** — `createStorageEventSync`
- **Auto strategy** — `createMultiWindowSync({ prefer: "auto" | "broadcast" | "sharedworker" })` picks the best available transport and reports fallbacks
- **Zero-flicker** — transitions are suppressed while applying cross-tab syncs

### Scheduled Themes (Solar Time)

Automatically switch between light and dark themes based on actual sunrise/sunset.

```ts
scheduled: {
  // Everything optional: lightTheme/darkTheme adapt to the currently selected
  // theme's family (fallback: neutral light/dark); coordinates auto-detect
  // from each visitor's browser timezone.
  // lightTheme: "mint-light",
  // darkTheme: "mint-dark",
  // timeZone: "Asia/Kathmandu",
  // latitude: 40.7128, longitude: -74.006,
  checkInterval: 60_000,
}
```

`calculateSunTimes(date, lat?, lon?)` computes NOAA solar events — with no
coordinates it resolves the location from the visitor's timezone via
`resolveSolarLocation` (priority: explicit coords → `timeZone` → browser
detection → default). When `lightTheme`/`darkTheme` are omitted the schedule
derives them from the current theme's family (`resolveScheduledThemePair`) and
falls back to the neutral `light`/`dark` themes, re-resolving when the user
switches family. Change the location at runtime with
`runtime.schedule.set({ timeZone })` or
`runtime.schedule.set({ autoDetectLocation: true })` to return to detection.
`skipApplyMs` defers changes briefly after a cross-tab sync.

### Persistence

- `createThemePersistence({ storage, key })` — mode persistence (`theme-mode`)
- Default runtime persistence — stores `{ mode, family }` under `theme-selection` in localStorage, with `storage` event subscription
- `createThemeSelectionPersistence`-style adapters implement `get/set/remove/subscribe`

### Bootstrap (Zero Flash of Wrong Theme)

- `createThemeBootstrapScript({ themes, defaultTheme, initialMode, initialFamily, storageKey, prefix })` — generates a **blocking inline script** that reads the persisted selection, resolves the effective mode (`system` → `prefers-color-scheme`), and applies CSS variables + DOM effects before first paint.
- `buildThemeCssMap(themes)` — maps theme names and `family:mode` keys to flat CSS variable maps.
- `darkModeCSSTemplate(variables)` — a `@media (prefers-color-scheme: dark)` block so dark-mode users get correct colors even before JS runs.

### Built-in Themes

`getBuiltInThemes()` bundles:

- **Neutral** — `light` / `dark` with a full token scale (spacing, radius, shadows, border widths, z-index, breakpoints, typography)
- **Preset families** — Oat, Berry, Mint, Citrus, Cocoa, Plum (light + dark)
- **Brand presets** — Apple, GitHub, Vercel, Slack, Discord (light + dark)
- **Accessibility profiles** — High Contrast (light/dark) and Large Text (light/dark), tagged `"accessibility"`

### `@theme-kit/core/vanilla` — the `ThemeKit` class

Framework-free drop-in theming:

```js
import { ThemeKit } from "@theme-kit/core/vanilla";

const kit = new ThemeKit();       // or ThemeKit.init()
kit.setMode("dark");
kit.setFamily("plum");
kit.toggleTheme();
kit.update({ colors: { primary: "#07f" } });
kit.use({ name: "brand", themes: [...] });
kit.toCSSVariables();
kit.on("themeChange", (theme) => console.log(theme.name));
kit.destroy();
```

Events: `themeChange`, `modeChange`, `familyChange`. Exposes `.runtime`, `.registry`, `.theme`, `.mode`, `.family`, `.themes`.

### `@theme-kit/core/vite` — Vite Plugin

```ts
// vite.config.ts
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin({ themes: customThemes })],
});
```

`themeKitVitePlugin` injects the blocking bootstrap script into `index.html` (`head-prepend`) so the persisted theme applies before first paint in client-rendered apps — no manual inline scripts.

---

## `@theme-kit/react` — React Integration

### `ThemeProvider`

Creates a runtime, wires DOM + CSS variable bindings, and provides it via context.

```tsx
<ThemeProvider themes={themes} transition={{ enabled: true }}>
  <App />
</ThemeProvider>
```

Accepts every `ThemeRuntimeOptions` prop, plus `runtime` to inject a shared runtime and `initial` for server-resolved selections.

### Hooks

| Hook                                        | Returns                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| `useTheme()`                                | `{ theme, mode, family, setMode, setFamily, toggleTheme }` |
| `useThemeValue()`                           | The active theme definition                                |
| `useThemeTokens()`                          | Active theme tokens                                        |
| `useThemeMode()` / `useThemeFamily()`       | Current mode / family                                      |
| `useSetThemeMode()` / `useSetThemeFamily()` | Setters                                                    |
| `useToggleTheme()`                          | Toggle function                                            |
| `useThemeRuntime()`                         | The full runtime                                           |
| `useThemeHistory()`                         | `{ undo, redo, canUndo, canRedo, clear }`                  |
| `useThemeBatch()`                           | `runtime.batch`                                            |
| `useThemeSnapshot()` / `useThemeRestore()`  | Serialize / restore state                                  |
| `useThemeTimeTravel()`                      | `{ history, jump }`                                        |
| `useThemeLifecycle()`                       | `{ on(event, cb) }`                                        |
| `useThemePacks()`                           | `runtime.use`                                              |

### Components

- **`ThemeScope theme="forest"`** — apply a specific theme to a subtree; emits scoped CSS variables plus Tailwind-compatible `--color-*` / `--radius-*` variables.
- **`useScopedTheme(ref, themeName)`** — imperative scoping for any element.
- **`ThemeModeButton`** — cycles light → dark → system.
- **`ThemeInspector`** — floating dev panel showing active theme, selection, flattened tokens, and generated CSS variables.

---

## `@theme-kit/next` — Next.js App Router

Server components, SSR-safe hydration, and zero-flash theming.

### `ThemeProvider` (Server Component)

```tsx
// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

What it does:

- Reads `theme-mode`, `theme-family`, `theme-fingerprint` cookies on the server
- Resolves the initial theme & mode; validates a fingerprint so stale cookies don't corrupt a changed theme config
- Renders `<html data-theme style={{ colorScheme, ...cssVars }}>` — theme applied before hydration
- Emits a **blocking script** in `<head>` that applies the persisted theme before first paint
- Emits a `@media (prefers-color-scheme: dark)` fallback when mode is `system`
- Dynamically mounts the client provider

Props: `children`, `themes`, `defaultTheme`, `lang`.

### Client

```tsx
import { useTheme } from "@theme-kit/next/client";
```

- `ClientThemeProvider` — cookie + localStorage persistence, fingerprint, `.dark` class sync
- Re-exports every React hook and `ThemeScope`, `ThemeInspector`, `ThemeModeButton`
- `ThemeBootstrap` — injects SSR dark-mode CSS via `useServerInsertedHTML`

### SSR Persistence

`createNextThemePersistence(themes, defaultTheme)` mirrors selection to cookies (`theme-mode`, `theme-family`, `theme-name`, `theme-fingerprint`) so the server can render the correct theme on the next request.

---

## `@theme-kit/vue` — Vue 3

- `ThemeProvider` — component with all runtime options; auto-registered via `app.use` (`.install`)
- `provideThemeRuntime` / `useThemeRuntime` — provide/inject API
- `useTheme` — `{ theme, mode, family, setMode, setFamily, toggleTheme }` (refs)
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`
- `ThemeScope` — scoped theming component

---

## `@theme-kit/svelte` — Svelte 5

- `ThemeProvider` — context-based provider with DOM/CSS bindings
- `getThemeRuntime` / `setThemeRuntime` — context helpers
- `useTheme` — reactive readable stores for `theme`, `mode`, `family`
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`
- `ThemeScope` — scoped theming

---

## `@theme-kit/solid` — Solid

- `ThemeProvider` — context provider with bindings
- `useTheme` — signals for `theme`, `mode`, `family` with getters
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`
- `ThemeScope` — scoped theming

---

## `@theme-kit/angular` — Angular

- `provideThemeKit(options)` / `provideThemeKitRuntime(runtime)` — app providers
- `injectThemeRuntime()` — runtime injector
- `injectTheme()` — reactive `ThemeState` (theme, mode, family + setters)
- `injectThemeHistory`, `injectThemeBatch`, `injectThemeSnapshot`, `injectThemeRestore`, `injectThemeTimeTravel`, `injectThemeLifecycle`, `injectThemePacks`
- `ThemeScopeDirective` — element-scoped theming
- `createAngularPersistence()` — persistence adapter
- `createBlockingScriptContent` / `buildThemeCSSMap` — zero-flash bootstrap helpers

---

## `@theme-kit/web` — Web Components

Framework-free theming for any HTML page.

```ts
import { defineCustomElements } from "@theme-kit/web";
defineCustomElements();
```

Elements:

- `<theme-kit-provider>` — root runtime provider
- `<theme-kit-scope theme="...">` — scoped theming
- `<theme-kit-toggle>` — light/dark toggle button
- `<theme-kit-select>` — family/mode selector
- `getProviderRuntime()` — imperative access to the runtime

---

## `@theme-kit/tailwind` — Tailwind CSS v4

```css
@import "tailwindcss";
@import "@theme-kit/tailwind";
```

- Maps theme tokens to `@theme` variables (`--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`)
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`
- `synchronizeDarkClass(theme)` — keeps the `.dark` class in sync
- `theme.css` / `dark.css` / `preflight.css` layers

---

## `@theme-kit/astro` — Astro

- `ThemeProviderClient` — client island provider
- Full hook set (`useTheme`, `useThemeHistory`, ...) + `ThemeScope`
- `createBlockingScript` / `buildThemeCssMap` / `darkModeCSSTemplate` — zero-flash bootstrap
- `createAstroThemePersistence` — persistence adapter
- `computeFingerprint` — cookie/config fingerprinting
- `getGlobalRuntime` / `setGlobalRuntime` — shared runtime across islands

---

## `@theme-kit/nuxt` — Nuxt 3

- Nuxt module (`configKey: "themeKit"`) with `themes`, `defaultTheme`, `initialMode`, `initialFamily` options
- Auto-imports composables, registers components and a runtime plugin
- Re-exports Vue integration + full `@theme-kit/core`

---

## `@theme-kit/remix` — Remix

- Loader/server-side theming with blocking script (`blocking-script.tsx`)
- `ThemeProvider`, full hook set, `ThemeScope`
- `createRemixThemePersistence`-style adapter + `computeFingerprint`
- Server entry helpers under `server/`

---

## `@theme-kit/cli` — Command Line

```
theme-kit <command> [options]

Commands:
  generate   Generate a theme from a seed color   (--seed, --family, --output)
  validate   Validate a theme JSON file
  migrate    Migrate a theme to the latest format
  inspect    Inspect a theme's details
  export     Export a theme to CSS or JSON

Options:
  --help   Show help
  --version  Show version
```

Example: `theme-kit generate --seed "#6366f1" --family indigo --output theme.json`

---

## `@theme-kit/devtools` — DevTools

- `createDevToolsPlugin(options)` — theme-kit plugin exposing an inspector
- `createDevToolsInspector(options)` — records theme-change entries, lifecycle performance events, and state snapshots
- `createDevToolsPanel()` — UI panel
- Exposes inspectors on `window.__THEME_KIT_DEVTOOLS__` for extension debugging

---

## Visualizing the Library

The docs site (`apps/docs`) turns this document into interactive pages. Suggested visualization areas, one per feature group:

1. **Home / Overview** — hero, package grid, monorepo structure
2. **Core concepts** — animated diagrams of mode + family + semantic tokens
3. **Playground** — live theme switcher using the same themes the library ships
4. **Interactive token tree** — expand `colors.surface.default`, watch CSS variables update live
5. **Theme gallery** — visual cards for all built-in / brand / preset / accessibility themes
6. **History & time travel** — demonstrate undo/redo on a timeline
7. **Generation studio** — pick a seed color, preview the generated light/dark pair
8. **Multi-window demo** — open two panes and watch cross-tab sync
9. **Scheduling demo** — drag latitude/longitude and see sunrise/sunset switching
10. **Framework tabs** — the same example rendered in React, Vue, Svelte, Solid, Angular, Web Components
11. **Accessibility lab** — live contrast checks and CVD simulations
12. **API reference** — generated from package source (`@theme-kit/core`, etc.)

## License

MIT
