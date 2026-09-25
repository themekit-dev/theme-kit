<!--
  GENERATED FILE — DO NOT EDIT.

  Generated from apps/docs/lib/frameworks.tsx by
  apps/docs/scripts/generate-framework-guides.mjs. Every snippet, feature and
  note below is a mirror of that file, which is the single authoritative
  source for framework-guide content and what the site actually renders.

  Editing this file changes nothing on the site, and the next regeneration
  will discard the edit. Change lib/frameworks.tsx and run:

      node apps/docs/scripts/generate-framework-guides.mjs

  `--check` fails if this file is out of date.
-->

# Framework Guides

The rendered guide lives at `/framework-guides` and `/framework-guides/<slug>`.
This file is a plain-markdown mirror of the same content, generated so it
cannot drift from the pages. Hero copy and page layout are part of the
components, not the data, so they are not mirrored here.

---

## React (`@theme-kit/react`)

Provider and hooks for React, with scoped themes, transitions, and an optional build-time bootstrap.

**Tags:** SPA · Vite · Context

### Feature map

**Provider**

- **ThemeProvider** — Creates a runtime, wires DOM + CSS-variable bindings, and provides it via context. Accepts every ThemeRuntimeOptions prop.
- **Runtime injection** — Pass `runtime` to share an existing instance, or `initial` to seed the server-resolved selection for hydration.
- **scheduled prop** — Switches between `lightTheme` and `darkTheme` at each visitor's local sunrise and sunset. Latitude/longitude are optional — the location comes from the browser timezone unless you pin `timeZone`.

**Root bootstrap**

- **createThemeRoot()** — Optional client-only root bootstrap that lets Theme Kit control the initial React root commit when synchronous first-commit behavior is required.
- **Standard createRoot()** — Use the normal React root API when no special first-commit optimization is needed.

**Hooks**

- **useTheme()** — Returns `{ theme, mode, family, setMode, setFamily, toggleTheme }`.
- **useThemeValue() / useThemeTokens()** — The active theme definition, and the active theme tokens.
- **useThemeMode() / useThemeFamily()** — Granular reads for the current mode and family.
- **useSetThemeMode() / useSetThemeFamily()** — Granular setters — set mode or family independently.
- **useToggleTheme()** — Toggle function for light/dark.
- **useThemeRuntime()** — Access the full runtime: registry, history, lifecycle, plugins.
- **useThemeHistory()** — `{ undo, redo, canUndo, canRedo, clear }`.
- **useThemeBatch()** — Wrap `runtime.batch()` for atomic, coalesced updates.
- **useThemeSnapshot() / useThemeRestore()** — Serialize and restore the full runtime state.
- **useThemeTimeTravel()** — `{ history, jump }` — indexed navigation through time.
- **useThemeLifecycle()** — Subscribe to typed lifecycle events (`beforeThemeChange`, `afterPersist`, ...).
- **useThemePacks()** — Install a theme pack at runtime via `runtime.use()`.
- **useThemeSchedule()** — Reactive sunrise/sunset controller: `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`. Returns `null` when the provider has no `scheduled` option.

**Components**

- **ThemeScope** — Apply a specific theme to a subtree; emits scoped CSS vars plus Tailwind-compatible `--color-*` / `--radius-*` variables.
- **ThemeModeButton** — One-click light → dark → system cycle button.
- **ThemeInspector** — Floating dev panel: active theme, selection, flattened tokens, generated CSS variables.
- **useScopedTheme(ref, themeName)** — Imperative scoping for any element ref.
- **useThemePacks()** — Install a theme pack at runtime via `runtime.use()`.

**Library adapters**

- **createMuiAdapter() / createChakraAdapter()** — Maps Theme Kit semantic tokens into native generated themes while preserving the framework-neutral runtime contract.
- **createAntdAdapter() / createMuiAdapter() / createChakraAdapter()** — Rebuilds the library theme from the active Theme Kit theme and exposes a reactive snapshot/subscribe bridge for React providers.
- **MantineThemeProvider + createMantineTheme()** — Mantine's generated-theme bridge: `createMantineTheme(runtime)` rebuilds the native Mantine theme from Theme Kit tokens, and `MantineThemeProvider` forces the color scheme to match the active mode.
- **CSS-variable adapters** — Shadcn, Bootstrap, DaisyUI, and Open Props adapters can be registered directly with the runtime; their factories do not require React.

**Transition**

- **transition prop** — Transitions are enabled by default (300ms, smooth). Pass `transition` to tune duration/easing/preset/properties, or `transition={{ enabled: false }}` to disable.
- **runtime.store.set(theme, { suppressTransition: true })** — Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation for a single switch. For custom animation orchestration, compose the core diff/plan/runner APIs.

### Notes

- **Zero-flash:** Included. `ThemeProvider` injects a blocking script into `<head>` before the first paint, so a returning visitor sees their saved theme immediately. For an SSR app, inline it yourself with `createThemeBootstrapScript()`.
- **Starting mode:** `defaultTheme` chooses the starting theme. Add `initialMode="system"` to follow the visitor's OS on the first visit.
- **Configuration:** Themes and the starting mode come from the provider props. That is the whole setup, with or without a build tool. If you do build with Vite, you can declare them once in `theme.config.ts` instead and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.

### Quick Start

#### quickStart

```tsx title="src/App.tsx"
// src/App.tsx
import { ThemeProvider, useTheme } from "@theme-kit/react";

function Header() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme.name}</button>;
}

export function App() {
  return (
    <ThemeProvider defaultTheme="mint-light" transition={{ enabled: true }}>
      <Header />
    </ThemeProvider>
  );
}
```

#### noTheme

```tsx title="src/main.tsx"
// src/main.tsx
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" initialMode="system">
    <App />
  </ThemeProvider>,
);
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```tsx title="src/ThemeSwitcher.tsx"
// src/ThemeSwitcher.tsx
import { useTheme } from "@theme-kit/react";

const page = {
  background: "var(--theme-color-background)",
  color: "var(--theme-color-foreground)",
  minHeight: "100vh",
  padding: "2rem",
};

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main style={page}>
      <h1>Theme Kit</h1>
      <p>Current theme: {theme.name} ({mode})</p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}
```

### More Examples

#### snippet2

```tsx title="src/theme-scope.tsx"
// src/theme-scope.tsx
import { ThemeProvider, ThemeScope, useThemeHistory } from "@theme-kit/react";

function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="mint-light">
      {/* Pinned to plum-dark regardless of the app-wide selection. */}
      <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
        <p>This subtree is always plum-dark.</p>
      </ThemeScope>
      <HistoryControls />
    </ThemeProvider>
  );
}
```

#### snippet3

```tsx title="src/main.tsx — optimized CSR bootstrap"
// src/main.tsx — optimized CSR bootstrap
import { createThemeRoot } from "@theme-kit/react";
import "@theme-kit/core/scrollbar.css";
import { App } from "./App";

createThemeRoot({
  container: document.getElementById("root")!,
  defaultTheme: "mint-light",
  initialMode: "system",
  transition: { enabled: true },
  // The runtime is handed in, so library providers can share the instance.
  render: () => <App />,
});
```

---

## Next.js (`@theme-kit/next`)

App Router theming with server-resolved themes, cookie persistence, and zero-flash.

**Tags:** SSR · RSC · Zero-flash

### Feature map

**Server**

- **ThemeProvider (Server Component)** — Reads `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration.
- **Blocking bootstrap script** — Emits a blocking script in `<head>` that applies the persisted theme before first paint.
- **Dark-mode CSS fallback** — Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`.
- **scheduled prop** — Pass `scheduled={{ lightTheme, darkTheme }}` to the server ThemeProvider to enable sunrise/sunset switching app-wide. Coordinates are optional — each visitor's timezone is auto-detected on the client.

**Client**

- **@theme-kit/next/client** — The client entry point. Exports ClientThemeProvider, ThemeBootstrap, createNextThemePersistence, every React hook, and ThemeScope / ThemeInspector / ThemeModeButton.
- **ClientThemeProvider** — Runtime for client components that need theme state. Mounts the runtime, syncs the `.dark` class, and persists the selection.
- **ThemeBootstrap** — Injects the SSR dark-mode CSS via `useServerInsertedHTML`.
- **createNextThemePersistence()** — Builds the adapter `ClientThemeProvider` uses: localStorage plus the `theme-mode`, `theme-family` and `theme-fingerprint` cookies the server reads on the next request.
- **useThemeSchedule()** — Reactive sunrise/sunset controller: `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`.

**Transition**

- **transition prop** — Built-in runtime transition support. Configure duration/easing once on the provider; Theme Kit generates the transition styles at runtime, so applications do not need to maintain theme-transition rules in global CSS.
- **runtime.store.set(theme, { suppressTransition: true })** — Per-update escape hatch from `@theme-kit/next/client`: call `runtime.store.set(theme, { suppressTransition: true })` when a switch must be instantaneous.

**Scrollbar**

- **scrollbar prop** — Enables Theme Kit's custom overlay scrollbar. The SSR bootstrap hides the native scrollbar before first paint, then the overlay engine synchronizes with browser scrolling without replacing native scroll behavior.
- **scrollbar option** — Configure the overlay appearance from semantic tokens, including an explicit color token when needed. The overlay remains theme-aware and updates with runtime theme changes.

### Notes

- **Zero-flash:** Included. `ThemeProvider` resolves the first paint on the server and renders the pre-paint script into `<head>` itself. There is no bundler plugin to add.
- **Starting mode:** The server resolves the mode from the persisted cookies, so a first-time visitor starts on `defaultTheme`. Once they pick System, that choice is stored and reused on every later request.
- **Configuration:** Themes and the starting mode come from the provider in `app/layout.tsx`. Next does not use Vite, so there is no bundler plugin to add: the provider resolves the selection on the server and emits the pre-paint script itself.

### Quick Start

#### quickStart

```tsx title="app/layout.tsx"
// app/layout.tsx
import type { ReactNode } from "react";
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }: { children: ReactNode }) {
  // ThemeProvider renders <html>, <head> and <body> itself.
  return (
    <ThemeProvider defaultTheme="mint-light">
      {children}
    </ThemeProvider>
  );
}
```

#### noTheme

```tsx title="app/layout.tsx"
// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
```

#### styles

```css title="app/globals.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```tsx title="app/theme-switcher.tsx"
// app/theme-switcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main
      style={{
        background: "var(--theme-color-background)",
        color: "var(--theme-color-foreground)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Theme Kit</h1>
      <p>Current theme: {theme.name} ({mode})</p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}
```

### More Examples

#### snippet2

```tsx title="app/dashboard.tsx"
// app/dashboard.tsx — scoped theming + history controls
"use client";
import { ThemeScope, useThemeHistory } from "@theme-kit/next/client";

export function Dashboard() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();

  return (
    <div>
      <div>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>

      {/* Pinned to plum-dark, whatever the rest of the page is using. */}
      <ThemeScope theme="plum-dark">
        <p>This subtree is always plum-dark.</p>
      </ThemeScope>
    </div>
  );
}
```

---

## Vue 3 (`@theme-kit/vue`)

Provider and composables for Vue 3, with scoped themes.

**Tags:** Composition API · Provider

### Feature map

**Setup**

- **ThemeProvider** — Provider component accepting every runtime option; auto-registered via `app.use` (`.install`).
- **provideThemeRuntime() / useThemeRuntime()** — Explicit provide/inject access to the runtime.

**Composables**

- **useTheme()** — Reactive refs for `theme`, `mode`, `family` plus `setMode`, `setFamily`, `toggleTheme`.
- **useThemeHistory()** — Undo / redo / jump through theme history.
- **useThemeBatch()** — Atomic, coalesced updates via `runtime.batch()`.
- **useThemeSnapshot() / useThemeRestore()** — Serialize and restore the full runtime state.
- **useThemeLifecycle()** — Subscribe to typed lifecycle events.
- **useThemePacks()** — Install theme packs at runtime.
- **useThemeSchedule()** — Reactive schedule state (a `Ref` with `enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus `enable()`/`disable()`/`set()`. Configure via the `scheduled` prop on ThemeProvider.

**Library adapters**

- **Adapter framework subpaths** — CSS-variable adapters own their framework wrappers behind subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional peers — they are not re-exported by the framework package.
- **useShadcnTheme(runtime) / useBootstrapTheme(runtime)** — Composables on each adapter's framework subpath install the React-free CSS-variable factory and dispose the returned handle with the component lifecycle. Pass the runtime from this framework's runtime getter.
- **useDaisyTheme(runtime) / useOpenPropsTheme(runtime)** — Same contract for DaisyUI and Open Props. The adapter subpath supplies lifecycle wiring while the factory stays framework-neutral.
- **adapter factory subpaths** — Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without any framework.

**Transition**

- **transition prop** — Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.
- **runtime.store.set(theme, { suppressTransition: true })** — Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.

**Components**

- **ThemeScope** — Scoped theming component for subtrees.

### Notes

- **Zero-flash:** Included. `<ThemeProvider>` injects a blocking script into `<head>` before the first paint. For an SSR app, inline it with `createThemeBootstrapScript()` instead.
- **Starting mode:** `default-theme` chooses the starting theme. Add `initial-mode="system"` to follow the visitor's OS on the first visit.
- **Configuration:** Themes and the starting mode come from the provider props. If you do build with Vite, you can declare them once in `theme.config.ts` instead and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.

### Quick Start

#### quickStart

```vue title="src/App.vue"
<!-- src/App.vue -->
<script setup lang="ts">
import { ThemeProvider } from "@theme-kit/vue";
</script>

<template>
  <!-- `default-theme` picks the theme. Add `initial-mode="system"` to follow
       the OS preference instead of the theme's own mode. -->
  <ThemeProvider default-theme="mint-light">
    <h1>Hello, themed world</h1>
  </ThemeProvider>
</template>
```

#### noTheme

```vue title="src/App.vue"
<!-- src/App.vue — no theme definition needed -->
<script setup lang="ts">
import { ThemeProvider } from "@theme-kit/vue";
</script>

<!-- No `themes` prop → built-in neutral theme.
     default-theme picks the theme; initial-mode="system" is the opt-in for
     following the OS. The provider hands that mode to BOTH the pre-paint
     script it injects and the runtime, so the two cannot disagree. -->
<template>
  <ThemeProvider default-theme="light" initial-mode="system">
    <h1>Hello, themed world</h1>
  </ThemeProvider>
</template>
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```vue title="src/ThemeSwitcher.vue"
<!-- src/ThemeSwitcher.vue -->
<script setup lang="ts">
import { useTheme } from "@theme-kit/vue";
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <main class="page">
    <h1>Theme Kit</h1>
    <p>Current theme: {{ theme.name }} ({{ mode }})</p>

    <button class="primary" @click="toggleTheme">Toggle theme</button>

    <section class="card">
      <h2>Themed card</h2>
      <p class="muted">Surface, border and text follow the theme.</p>
    </section>
  </main>
</template>

<style scoped>
  .page {
    background: var(--theme-color-background);
    color: var(--theme-color-foreground);
    min-height: 100vh;
    padding: 2rem;
  }
  .primary {
    background: var(--theme-color-primary);
    color: var(--theme-color-primaryForeground);
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .card {
    background: var(--theme-color-card);
    border: 1px solid var(--theme-color-border);
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
  }
  .muted {
    color: var(--theme-color-mutedForeground);
  }
</style>
```

### More Examples

#### snippet2

```vue title="src/ThemeScopeExample.vue"
<!-- src/ThemeScopeExample.vue -->
<script setup lang="ts">
// Import both explicitly — `ThemeScope` is only globally registered if your
// entry does `app.use(ThemeScope)`.
import { ThemeScope, useThemeHistory } from "@theme-kit/vue";
const { undo, redo, canUndo, canRedo } = useThemeHistory();
</script>

<template>
  <div>
    <button @click="undo" :disabled="!canUndo">Undo</button>
    <button @click="redo" :disabled="!canRedo">Redo</button>

    <ThemeScope theme="plum-dark">
      <p>This subtree is always plum-dark.</p>
    </ThemeScope>
  </div>
</template>
```

---

## Svelte 5 (`@theme-kit/svelte`)

Provider and readable stores for Svelte 5, with scoped themes and transitions.

**Tags:** Context · Stores · Runes

### Feature map

**Provider**

- **ThemeProvider** — Context-based provider that wires DOM + CSS variable bindings.
- **getThemeRuntime() / setThemeRuntime()** — Context helpers for retrieving or overriding the runtime.

**Stores**

- **useTheme()** — Reactive readable stores for `theme`, `mode`, `family` and their setters.
- **useThemeHistory()** — Undo / redo / jump through theme history.
- **useThemeBatch()** — Atomic, coalesced updates.
- **useThemeSnapshot() / useThemeRestore()** — Serialize and restore runtime state.
- **useThemeLifecycle()** — Subscribe to lifecycle events.
- **useThemePacks()** — Install theme packs at runtime.
- **useThemeSchedule() / getThemeSchedule()** — Reactive readable store of the schedule state (`enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus the imperative `ThemeSchedule` controller. Configure via the `scheduled` prop on ThemeProvider.

**Library adapters**

- **Adapter framework subpaths** — CSS-variable adapters own their framework wrappers behind subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional peers — they are not re-exported by the framework package.
- **useShadcnTheme(runtime) / useBootstrapTheme(runtime)** — Composables on each adapter's framework subpath install the React-free CSS-variable factory and dispose the returned handle with the component lifecycle. Pass the runtime from this framework's runtime getter.
- **useDaisyTheme(runtime) / useOpenPropsTheme(runtime)** — Same contract for DaisyUI and Open Props. The adapter subpath supplies lifecycle wiring while the factory stays framework-neutral.
- **adapter factory subpaths** — Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without any framework.

**Transition**

- **transition prop** — Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.
- **runtime.store.set(theme, { suppressTransition: true })** — Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.

**Components**

- **ThemeScope** — Scoped theming component for subtrees.

### Notes

- **Zero-flash:** Included. `<ThemeProvider>` injects a blocking script into `<head>` before the first paint. For an SSR app, inline it with `createThemeBootstrapScript()` instead.
- **Starting mode:** `defaultTheme` chooses the starting theme. Add `initialMode="system"` to follow the visitor's OS on the first visit.
- **Configuration:** Themes and the starting mode come from the provider props. SvelteKit is Vite-based, so you can declare them once in `theme.config.ts` and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.

### Quick Start

#### quickStart

```svelte title="src/App.svelte"
<!-- src/App.svelte -->
<script lang="ts">
  import { ThemeProvider } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
</script>

<!-- `defaultTheme` picks the theme. Add `initialMode="system"` to follow the
     OS preference instead of the theme's own mode. -->
<ThemeProvider defaultTheme="mint-light">
  <ThemeSwitcher />
</ThemeProvider>
```

#### noTheme

```svelte title="src/App.svelte"
<!-- src/App.svelte — no theme definition needed -->
<script lang="ts">
  import { ThemeProvider } from "@theme-kit/svelte";
</script>

<!-- No `themes` prop → built-in neutral theme.
     defaultTheme picks the theme; initialMode="system" is the opt-in for
     following the OS. The provider hands that mode to BOTH the pre-paint
     script it injects and the runtime, so the two cannot disagree. -->
<ThemeProvider defaultTheme="light" initialMode="system">
  <h1>Hello, themed world</h1>
</ThemeProvider>
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```svelte title="src/ThemeSwitcher.svelte"
<!-- src/ThemeSwitcher.svelte -->
<script lang="ts">
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, toggleTheme } = useTheme();
</script>

<main class="page">
  <h1>Theme Kit</h1>
  <p>Current theme: {$theme.name} ({$mode})</p>

  <button class="primary" onclick={toggleTheme}>Toggle theme</button>

  <section class="card">
    <h2>Themed card</h2>
    <p class="muted">Surface, border and text follow the theme.</p>
  </section>
</main>

<style>
  .page {
    background: var(--theme-color-background);
    color: var(--theme-color-foreground);
    min-height: 100vh;
    padding: 2rem;
  }
  .primary {
    background: var(--theme-color-primary);
    color: var(--theme-color-primaryForeground);
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .card {
    background: var(--theme-color-card);
    border: 1px solid var(--theme-color-border);
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
  }
  .muted {
    color: var(--theme-color-mutedForeground);
  }
</style>
```

### More Examples

#### snippet2

```svelte title="src/App.svelte — history + scope"
<!-- src/App.svelte -->
<script lang="ts">
  import { ThemeProvider, ThemeScope, useThemeHistory } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";

  // `undo` / `redo` are functions; `canUndo` / `canRedo` are readable stores,
  // so they are read with `$` in the markup.
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
</script>

<ThemeProvider defaultTheme="mint-light">
  <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
    <p>Scoped to plum-dark</p>
  </ThemeScope>

  <button onclick={undo} disabled={!$canUndo}>Undo</button>
  <button onclick={redo} disabled={!$canRedo}>Redo</button>

  <ThemeSwitcher />
</ThemeProvider>
```

---

## Solid (`@theme-kit/solid`)

Signals-first theming with a context provider and scoped subtrees.

**Tags:** Signals · Context

### Feature map

**Provider**

- **ThemeProvider** — Context provider with DOM + CSS variable bindings.

**Signals**

- **useTheme()** — Signals for `theme`, `mode`, `family` with getter access and setters.
- **useThemeHistory()** — Undo / redo / jump through theme history.
- **useThemeBatch()** — Atomic, coalesced updates.
- **useThemeSnapshot() / useThemeRestore()** — Serialize and restore runtime state.
- **useThemeLifecycle()** — Subscribe to lifecycle events.
- **useThemePacks()** — Install theme packs at runtime.
- **useThemeSchedule()** — Reactive sunrise/sunset controller with signal-backed `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`. Configure via the `scheduled` prop on ThemeProvider.

**Library adapters**

- **Adapter framework subpaths** — CSS-variable adapters own their framework wrappers behind subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional peers — they are not re-exported by the framework package.
- **useShadcnTheme(runtime) / useBootstrapTheme(runtime)** — Composables on each adapter's framework subpath install the React-free CSS-variable factory and dispose the returned handle with the component lifecycle. Pass the runtime from this framework's runtime getter.
- **useDaisyTheme(runtime) / useOpenPropsTheme(runtime)** — Same contract for DaisyUI and Open Props. The adapter subpath supplies lifecycle wiring while the factory stays framework-neutral.
- **adapter factory subpaths** — Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without any framework.

**Transition**

- **transition prop** — Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.
- **runtime.store.set(theme, { suppressTransition: true })** — Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.

**Components**

- **ThemeScope** — Scoped theming component for subtrees.

### Notes

- **Zero-flash:** Included. `<ThemeProvider>` injects a blocking script into `<head>` before the first paint. For an SSR app, inline it with `createThemeBootstrapScript()` instead.
- **Starting mode:** `defaultTheme` chooses the starting theme. Add `initialMode="system"` to follow the visitor's OS on the first visit.
- **Configuration:** Themes and the starting mode come from the provider props. If you do build with Vite, you can declare them once in `theme.config.ts` instead and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.

### Quick Start

#### quickStart

```tsx title="src/main.tsx"
// src/main.tsx
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import { App } from "./App";

render(
  () => (
    <ThemeProvider defaultTheme="mint-light">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);
```

#### noTheme

```tsx title="src/main.tsx"
// src/main.tsx
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import { App } from "./App";

render(
  () => (
    <ThemeProvider defaultTheme="light" initialMode="system">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```tsx title="src/App.tsx"
// src/App.tsx
import { useTheme } from "@theme-kit/solid";

const page = {
  background: "var(--theme-color-background)",
  color: "var(--theme-color-foreground)",
  "min-height": "100vh",
  padding: "2rem",
};

export function App() {
  // Signals: call them to read the current value.
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main style={page}>
      <h1>Theme Kit</h1>
      <p>
        Current theme: {theme().name} ({mode()})
      </p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          "border-radius": "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          "border-radius": "0.75rem",
          "margin-top": "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}
```

### More Examples

#### snippet2

```tsx title="src/App.tsx — history + scope"
// src/App.tsx
import { ThemeProvider, ThemeScope, useThemeHistory } from "@theme-kit/solid";

function HistoryControls() {
  // `canUndo` / `canRedo` are getters — read them off the object in JSX.
  // Destructuring freezes the mount-time value and the buttons never enable.
  const history = useThemeHistory();
  return (
    <div>
      <button onClick={history.undo} disabled={!history.canUndo}>Undo</button>
      <button onClick={history.redo} disabled={!history.canRedo}>Redo</button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="mint-light">
      <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
        <span>Always plum-dark</span>
      </ThemeScope>
      <HistoryControls />
    </ThemeProvider>
  );
}
```

---

## Angular (`@theme-kit/angular`)

Standalone-API theming with DI providers, reactive injectables, and a scoping directive.

**Tags:** DI · Directive · SSR

### Feature map

**Setup**

- **provideThemeKit(options)** — App-level providers from a ThemeRuntimeOptions config.
- **provideThemeKitRuntime(runtime)** — Provide an existing shared runtime instance.

**Injectables**

- **injectThemeRuntime()** — Inject the full runtime.
- **injectTheme()** — Reactive `ThemeState` — theme, mode, family plus setters.
- **injectThemeHistory()** — Undo / redo / jump through theme history.
- **injectThemeBatch()** — Atomic, coalesced updates.
- **injectThemeSnapshot() / injectThemeRestore()** — Serialize and restore runtime state.
- **injectThemeTimeTravel()** — `{ history, jump }` — indexed time travel.
- **injectThemeLifecycle()** — Subscribe to lifecycle events.
- **injectThemePacks()** — Install theme packs at runtime.
- **injectThemeSchedule()** — Reactive sunrise/sunset controller: `state()` is a Signal of `enabled`, `status`, `sunrise`, `sunset`, `nextTransition`; plus `enable()`/`disable()`/`set()`. Configure via `scheduled` in `provideThemeKit()`.

**Transition**

- **transition in provideThemeKit()** — Pass `transition` config to `provideThemeKit()` to enable CSS transitions on theme changes.
- **runtime.store.set(theme, { suppressTransition: true })** — Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.

**Directives**

- **ThemeScopeDirective** — Element-scoped theming via a directive.

**SSR & Bootstrap**

- **createAngularPersistence()** — Angular-flavored persistence adapter.
- **createBlockingScriptContent / buildThemeCSSMap** — Blocking `<script>` plus a critical `<style>` carrying the resolved theme's CSS variables, so a server-rendered page paints themed. For `system` mode it emits both schemes as media blocks.

### Notes

- **Zero-flash:** Not automatic. Render `createBlockingScriptContent()` into `index.html`’s `<head>` to paint the persisted theme before the bundle loads — without it the first frame is the default theme.
- **Starting mode:** `provideThemeKit({ defaultTheme, initialMode })` chooses the starting theme. `initialMode: "system"` follows the visitor's OS.
- **Configuration:** Themes and the starting mode are passed to `provideThemeKit()` when the app bootstraps. Angular does not use Vite, so there is no bundler plugin to add: the provider emits the pre-paint script.

### Quick Start

#### quickStart

```ts title="src/main.ts"
// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ defaultTheme: "mint-light" })],
});
```

#### noTheme

```ts title="src/main.ts"
// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ defaultTheme: "light", initialMode: "system" })],
});
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```ts title="src/app/theme-switcher.component.ts"
// src/app/theme-switcher.component.ts
import { Component } from "@angular/core";
import { injectTheme } from "@theme-kit/angular";

@Component({
  selector: "theme-switcher",
  standalone: true,
  template: `
    <main class="page">
      <h1>Theme Kit</h1>
      <p>Current theme: {{ state().theme.name }} ({{ state().mode }})</p>

      <button class="primary" (click)="toggle()">Toggle theme</button>

      <section class="card">
        <h2>Themed card</h2>
        <p class="muted">Surface, border and text follow the theme.</p>
      </section>
    </main>
  `,
  styles: `
    .page {
      background: var(--theme-color-background);
      color: var(--theme-color-foreground);
      min-height: 100vh;
      padding: 2rem;
    }
    .primary {
      background: var(--theme-color-primary);
      color: var(--theme-color-primaryForeground);
      border: 0;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
    }
    .card {
      background: var(--theme-color-card);
      border: 1px solid var(--theme-color-border);
      border-radius: 0.75rem;
      margin-top: 1.5rem;
      padding: 1rem;
    }
    .muted {
      color: var(--theme-color-mutedForeground);
    }
  `,
})
export class ThemeSwitcherComponent {
  // Must be public — Angular templates cannot access private members.
  state = injectTheme();

  toggle() {
    this.state().toggleTheme();
  }
}
```

### More Examples

#### snippet2

```ts title="src/app/history-controls.component.ts"
// src/app/history-controls.component.ts
import { Component } from "@angular/core";
import type { ThemeTransitionOptions } from "@theme-kit/core";
import {
  injectThemeHistory,
  ThemeScopeDirective,
} from "@theme-kit/angular";

@Component({
  selector: "history-controls",
  standalone: true,
  imports: [ThemeScopeDirective],
  template: `
    <div [themeKitScope]="'plum-dark'" [themeKitScopeTransition]="transition">
      Scoped to plum-dark
    </div>
    <button (click)="undo()" [disabled]="!canUndo()">Undo</button>
    <button (click)="redo()" [disabled]="!canRedo()">Redo</button>
  `,
})
export class HistoryControlsComponent {
  // `history` is a signal of `{ canUndo, canRedo }`; `undo`/`redo` are actions.
  private history = injectThemeHistory();

  transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

  canUndo() { return this.history.history().canUndo; }
  canRedo() { return this.history.history().canRedo; }
  undo() { this.history.undo(); }
  redo() { this.history.redo(); }
}
```

#### snippet3

```ts title="src/app/app.component.ts"
// src/app/app.component.ts
import { Component } from "@angular/core";
import { ThemeSwitcherComponent } from "./theme-switcher.component";
import { HistoryControlsComponent } from "./history-controls.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ThemeSwitcherComponent, HistoryControlsComponent],
  template: `
    <header><theme-switcher /></header>
    <main><history-controls /></main>
  `,
})
export class AppComponent {}
```

---

## Web Components (`@theme-kit/web`)

Framework-free theming for any HTML page, through custom elements and CSS variables.

**Tags:** No framework · Custom elements

### Feature map

**Setup**

- **defineCustomElements()** — Registers every `<theme-kit-*>` custom element.

**Elements**

- **<theme-kit-provider>** — Root runtime provider for a page or subtree.
- **<theme-kit-scope>** — Scoped theming via the `theme` attribute.
- **<theme-kit-toggle>** — Light/dark toggle button.
- **<theme-kit-select>** — Family / mode selector.

**Adapters**

- **Framework-neutral adapter factories** — Use Theme Kit adapter factories directly with the web runtime; no React, Vue, Svelte, Solid, or Angular layer is required.
- **CSS-variable ecosystem** — CSS-variable adapters update the document's variables/styles from the active runtime theme, making them suitable for framework-free pages and custom elements.

**Transition**

- **transition attribute** — Set `transition` attribute on `<theme-kit-provider>` to enable CSS transitions.
- **getProviderRuntime()** — Reads the runtime off a `<theme-kit-provider>` element once it has upgraded — `getProviderRuntime(providerEl)`. Returns `undefined` before then, and `undefined` if you pass an element that is not a provider.

**Imperative**

- **getProviderRuntime()** — Imperative access to the runtime: `getProviderRuntime(providerEl)`. From there `runtime.selection.setMode("dark")`, `setFamily()` and `toggleTheme()` change the theme without a custom element.
- **Reading the current theme** — Read the nearest provider's current state from plain JavaScript — the vanilla equivalent of the framework hooks. They are getters, not subscriptions: re-read them inside a `runtime.store.subscribe()` callback.

### Notes

- **Zero-flash:** You supply the script. `createThemeBootstrapScript()` writes it — see Quick Start for the generator — and it must load in `<head>` before the module script. Without it the page paints the default theme and corrects on load.
- **Starting mode:** `default-theme` chooses the starting theme. `initial-mode="system"` follows the visitor's OS.
- **Configuration:** Themes and the starting mode are attributes on `<theme-kit-provider>`. The pre-paint script you generate is built from the same values, and there is nothing else to configure.

### Quick Start

#### quickStart

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My app</title>

    <!-- Written by scripts/write-bootstrap.mjs, so the page paints themed. -->
    <script src="/bootstrap.js"></script>

    <script type="importmap">
      {
        "imports": {
          "@theme-kit/core": "/node_modules/@theme-kit/core/dist/index.js",
          "@theme-kit/web": "/node_modules/@theme-kit/web/dist/index.js"
        }
      }
    </script>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
      <theme-kit-toggle></theme-kit-toggle>
      <theme-kit-select type="mode"></theme-kit-select>
      <theme-kit-select type="family"></theme-kit-select>
    </theme-kit-provider>

    <script type="module">
      import { defineCustomElements } from "@theme-kit/web";
      defineCustomElements();
    </script>
  </body>
</html>
```

#### setupExtra

```js title="scripts/write-bootstrap.mjs"
// Generates the pre-paint script index.html loads. Run it before serving:
//   node scripts/write-bootstrap.mjs
import { writeFileSync } from "node:fs";
import { createThemeBootstrapScript, getBuiltInThemes } from "@theme-kit/core";

writeFileSync(
  "bootstrap.js",
  createThemeBootstrapScript({
    themes: getBuiltInThemes(),
    defaultTheme: "light",
    initialMode: "system",
  }),
);
```

#### noTheme

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My app</title>

    <!-- Written by scripts/write-bootstrap.mjs, so the page paints themed. -->
    <script src="/bootstrap.js"></script>

    <!-- Bare specifiers need a map when no bundler rewrites them. -->
    <script type="importmap">
      {
        "imports": {
          "@theme-kit/core": "/node_modules/@theme-kit/core/dist/index.js",
          "@theme-kit/web": "/node_modules/@theme-kit/web/dist/index.js"
        }
      }
    </script>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
      <my-app></my-app>
    </theme-kit-provider>

    <script type="module">
      import { defineCustomElements } from "@theme-kit/web";
      defineCustomElements();
    </script>
  </body>
</html>
```

#### styles

```css title="styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```html title="index.html — a themed page with a toggle"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      .page {
        background: var(--theme-color-background);
        color: var(--theme-color-foreground);
        min-height: 100vh;
        padding: 2rem;
      }
      .primary {
        background: var(--theme-color-primary);
        color: var(--theme-color-primaryForeground);
        border: 0;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
      }
      .card {
        background: var(--theme-color-card);
        border: 1px solid var(--theme-color-border);
        border-radius: 0.75rem;
        margin-top: 1.5rem;
        padding: 1rem;
      }
      .muted {
        color: var(--theme-color-mutedForeground);
      }
    </style>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
      <main class="page">
        <h1>Theme Kit</h1>
        <p>Current theme: <span id="current">light</span></p>

        <theme-kit-toggle></theme-kit-toggle>

        <section class="card">
          <h2>Themed card</h2>
          <p class="muted">Surface, border and text follow the theme.</p>
        </section>
      </main>
    </theme-kit-provider>

    <script type="module">
      import {
        defineCustomElements,
        getProviderRuntime,
        useThemeValue,
      } from "@theme-kit/web";

      defineCustomElements();

      // The helpers are getters, so re-read them when the store changes.
      const runtime = getProviderRuntime(
        document.querySelector("theme-kit-provider"),
      );
      const label = document.getElementById("current");

      runtime.store.subscribe(() => {
        label.textContent = useThemeValue().name;
      });
    </script>
  </body>
</html>
```

### More Examples

#### snippet2

```html title="index.html — scope + selects"
<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<theme-kit-provider default-theme="light">
  <theme-kit-select type="mode"></theme-kit-select>
  <theme-kit-select type="family"></theme-kit-select>

  <theme-kit-scope theme="plum">
    <p>This region is always themed "plum".</p>
  </theme-kit-scope>
</theme-kit-provider>
```

---

## Tailwind CSS v4 (`@theme-kit/tailwind`)

Map every semantic token to Tailwind v4 utilities and theme variables.

**Tags:** CSS · Design tokens · v4

**Also installs:** `@theme-kit/react`

### Feature map

**Integration**

- **@import "@theme-kit/tailwind"** — One import maps tokens to `@theme` variables: `--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`.
- **Dark-mode variant** — `@custom-variant dark (&:where(.dark, .dark *))` — scoped to the `.dark` class Theme Kit maintains.
- **synchronizeDarkClass(theme)** — Keeps the `.dark` class in sync with the active theme.
- **CSS layers** — Ships `theme.css`, `dark.css` and `preflight.css` layers.

**Transition**

- **CSS transition variables** — Theme Kit exposes transition variables for Tailwind-aware styling, while the runtime owns the actual theme-change orchestration; you do not need to hand-author a global transition block just to get smooth theme changes.
- **themeCSS** — Tailwind-compatible `@theme` variable block generated from your Theme Kit tokens, imported via the package's CSS entry.

### Notes

- **Zero-flash:** Tailwind is build-time only — it maps tokens to utilities and never runs. Zero-flash comes from the runtime you mount, which here is `@theme-kit/react`, and that injects the script itself.
- **Starting mode:** Tailwind maps tokens to utilities — it has no runtime of its own, so the starting mode comes from the adapter you install alongside it.
- **Configuration:** This CSS import is the whole Tailwind integration — Tailwind maps tokens to utilities at build time and never runs in the browser. The runtime that switches themes is a separate package, installed in step 1.

### Quick Start

#### quickStart

```css title="src/globals.css"
@import "tailwindcss";
@import "@theme-kit/tailwind";

body {
  @apply bg-background text-foreground;
}
```

#### noTheme

```css title="src/globals.css"
@import "tailwindcss";
@import "@theme-kit/tailwind";

/* No custom themes? The built-in neutral light/dark set
   maps straight to utilities — bg-background, text-foreground,
   bg-primary, text-primary-foreground and the rest. */
body {
  @apply bg-background text-foreground;
}
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```tsx title="src/components/Card.tsx — semantic utilities"
// src/components/Card.tsx
export function Card() {
  return (
    <section className="bg-card text-card-foreground border border-border rounded-lg p-4">
      <h2 className="text-lg font-semibold">Your plan</h2>
      <p className="text-muted-foreground text-sm">
        Everything below inherits the active theme.
      </p>
      <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
        Upgrade
      </button>
    </section>
  );
}
```

#### switchSnippet

```tsx title="src/ThemeSwitcher.tsx"
// src/ThemeSwitcher.tsx — the runtime here is @theme-kit/react
import { useTheme } from "@theme-kit/react";

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-semibold">Theme Kit</h1>
      <p className="text-muted-foreground">
        Current theme: {theme.name} ({mode})
      </p>

      <button
        onClick={toggleTheme}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Toggle theme
      </button>

      <section className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Themed card</h2>
        <p className="text-sm text-muted-foreground">
          Every utility here resolves to a Theme Kit token.
        </p>
      </section>
    </main>
  );
}
```

### More Examples

#### snippet2

```css title="src/globals.css — token → utility map"
/* @theme-kit/tailwind maps every semantic token onto a Tailwind v4 utility.
   The ones you will reach for most:

     .bg-background          .text-foreground
     .bg-card                .text-card-foreground
     .bg-popover             .text-popover-foreground
     .bg-primary             .text-primary-foreground
     .bg-secondary           .text-secondary-foreground
     .bg-muted               .text-muted-foreground
     .bg-accent              .text-accent-foreground
     .bg-destructive         .text-destructive-foreground
     .bg-success             .text-success-foreground
     .border-border          .bg-input          .ring-ring

   Plus the token-driven scales, all reading --theme-* variables:

     .rounded-lg             --theme-radius-lg
     .p-4 .gap-2 .mt-6       --theme-spacing-*
     .shadow-md              --theme-shadow-md
     .border-2               --theme-border-width-*
     .z-40                   --theme-z-index-*

   Because the variables are live, Tailwind's `dark:` variant is optional —
   the runtime already swapped the values behind these utilities. */
```

---

## Astro (`@theme-kit/astro`)

Astro-native theming: an integration for the pre-paint bootstrap, a React-free <html> layout, a native <ThemeToggle />, and opt-in client islands.

**Tags:** Integration · Components · Islands · Zero-flash

### Feature map

**Astro integration**

- **theme.config.ts discovery** — `themeKit()` finds `theme.config.ts` at the project root and derives everything from it — the pre-paint bootstrap and the runtime's configuration. Nothing is repeated in `astro.config.mjs`.
- **Configuration transport** — Injects the bootstrap projection as `window.__THEME_KIT_CONFIG__` from `<head>`. The island reads it instead of taking theme props, so its server-rendered and hydrated markup come from the same registry.
- **themeKit() in astro.config.mjs** — Registers the integration and injects the pre-paint bootstrap into every page's <head> with `injectScript("head-inline")`.
- **Zero-flash bootstrap** — Reads the persisted cookies, resolves the effective mode against `prefers-color-scheme`, and applies the CSS variables plus `data-theme` before first paint.
- **navigation: true (default)** — Keeps the resolved theme across `<ClientRouter />` navigations — Astro otherwise copies each incoming page's `<html>` attributes over the live root. Inert without `<ClientRouter />`.
- **No client framework required** — `@theme-kit/astro` imports no React — the integration, the server helpers, the `<ThemeToggle />` component and the browser runtime are all framework-neutral. React is an optional peer, pulled in only by an island.

**Astro components (no React)**

- **provider.astro** — Server-renders the themed `<html data-theme>` from the request cookies. A concrete mode inlines that theme's variables; `system` emits both schemes as media blocks instead, since an inline variable would outrank the dark block.
- **ThemeToggle.astro** — A native Astro toggle: a real `<button>`, so keyboard and focus behaviour come from the platform. No island, no `client:load`, and no per-page `initialMode` / `initialFamily`. `showMode` makes its text the live mode.
- **getThemeController()** — The framework-neutral browser API, from `@theme-kit/astro/runtime`. Not a hook: a plain object with `getMode()`, `setMode()`, `setFamily()`, `toggleTheme()` and `subscribe()`, valid in any `<script>`. Idempotent — one runtime per document, shared with every other consumer.
- **data-tk-readout** — Marks an element whose text Theme Kit owns. The pre-paint bootstrap patches it from `<head>`, before the body is parsed, and the controller keeps it in sync afterwards — so a server-rendered label is never painted and then corrected.
- **getInitialThemeState()** — Resolves the initial state from `Astro.request` so a client island hydrates against exactly what the document rendered. Needs the registry (`config` or `themes`) and a request, so it belongs on a server-rendered page.
- **createAstroThemePersistence() / computeFingerprint()** — Cookie + localStorage persistence adapter, plus config fingerprinting to reject stale cookies.

**Client islands (opt-in)**

- **@theme-kit/astro/client** — The only entry that depends on React. Exports the `ThemeProviderClient` island, the `useTheme*` hooks, the React `ThemeScope`, and `ThemeReadout`.
- **No theme props needed** — The registry, default theme and initial mode/family come from the transported `theme.config.ts`. Restating `initialMode` / `initialFamily` is a second source of truth: when it drifts from the config, the island's server markup disagrees with its hydrated markup (React error #418) and the text fluctuates on every load.
- **client:load, not client:only** — Astro server-renders the island and hydrates it in place, so the panel is in the first paint and hydration only attaches handlers. `client:only` renders nothing on the server, which is the flash the integration exists to prevent.
- **One island, not several** — Astro hydrates islands in an unspecified order, so two separate islands would race. Write one island whose tree contains both the provider and its consumers — `ThemeProviderClient` renders nothing itself; it is the provider half of that tree.
- **One runtime, shared** — `ThemeProviderClient` adopts a runtime that already exists — one a `<ThemeToggle />` or `getThemeController()` script created — instead of making a second one, and leaves its destruction to the owner. Islands and native controls can share a page.
- **Framework renderers stay optional** — React is an optional peer dependency. Astro-only projects never install it — choosing a React island is what pulls it in.
- **Adding the renderer** — Opting in is one explicit step: install `@astrojs/react` and `react`, then add `react()` next to `themeKit()` in `astro.config.mjs`. The Astro + React path shows that config; the Astro-only path never registers a renderer.
- **Client bundle cost** — `<ThemeToggle />` and `getThemeController()` pull in the theme runtime — persistence, cross-tab sync and the DOM contract all come from `@theme-kit/core` rather than a second implementation. A page that only needs the *themed* document, with no interactive control, ships no client JavaScript at all: `provider.astro` and the inline bootstrap do that work on the server.

**Transition**

- **transition prop** — Pass `transition` to the island provider (`@theme-kit/astro/client`) to enable CSS transitions on theme changes.
- **runtime.store.set(theme, { suppressTransition: true })** — Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.

### Notes

- **Zero-flash:** Included. `themeKit()` injects the pre-paint bootstrap and `provider.astro` server-renders the themed `<html>`, so the first paint is already correct.
- **Starting mode:** `theme.config.ts` declares the starting theme and mode once, and both the integration and the provider read it.
- **Configuration:** Declared in `theme.config.ts` at the project root. `themeKit()` in `astro.config.mjs` discovers it and injects the pre-paint bootstrap, and `provider.astro` reads the same file — so nothing is repeated.

### Quick Start

#### quickStart

```ts title="theme.config.ts"
import { defineTheme, defineThemeKitConfig } from "@theme-kit/core";

const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light", label: "Mint Light", order: 10 },
    tokens: { colors: { background: "#f8fafc", foreground: "#0f172a" } },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark", label: "Mint Dark", order: 20 },
    tokens: { colors: { background: "#0f172a", foreground: "#f8fafc" } },
  }),
];

export default defineThemeKitConfig({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
  initialFamily: "mint",
});
```

#### noTheme

```js title="astro.config.mjs"
// astro.config.mjs
import { defineConfig } from "astro/config";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit()],
});
```

#### styles

```css title="src/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```astro title="src/layouts/BaseLayout.astro"
---
// src/layouts/BaseLayout.astro — the one place the provider is mounted.
import Provider from "@theme-kit/astro/provider.astro";
import themeConfig from "../../theme.config";
import "../styles.css";
---

<Provider config={themeConfig} lang="en" bootstrap={false}>
  <slot />
</Provider>
```

#### switchSnippet

```tsx title="src/components/ThemeIsland.tsx"
// src/components/ThemeIsland.tsx
import { ThemeProviderClient, useTheme } from "@theme-kit/astro/client";

function Panel() {
  const { theme, mode, setMode, toggleTheme } = useTheme();

  return (
    <main
      style={{
        background: "var(--theme-color-background)",
        color: "var(--theme-color-foreground)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Theme Kit</h1>
      <p>Current theme: {theme.name} ({mode})</p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}

// ThemeProviderClient renders nothing — it installs the runtime. Panel is a
// sibling that reads it, and both hydrate as one island.
export default function ThemeIsland() {
  return (
    <>
      {/*
        No theme props. The registry, the default theme and the initial
        mode/family all come from the theme.config.ts the integration
        transported to the browser, so restating initialMode/initialFamily here
        would be a second source of truth for a decision the app already made.
      */}
      <ThemeProviderClient />
      <Panel />
    </>
  );
}

// Mount it from a page:
//   <ThemeIsland client:load />
```

### More Examples

#### snippet2

```astro title="src/pages/index.astro"
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ThemeToggle from "@theme-kit/astro/ThemeToggle.astro";
---

<BaseLayout>
  <h1>Themed with no client framework</h1>

  <!-- class is forwarded to the real <button>, so your own token-driven class
       styles it — here the .btn the stylesheet defines. -->
  <ThemeToggle class="btn" />

  <!-- showMode makes the visible text the live mode. The accessible name stays
       an action, because "dark" does not say what the button does. -->
  <ThemeToggle class="btn" showMode ariaLabel="Toggle colour scheme" />
</BaseLayout>
```

#### snippet3

```astro title="src/pages/index.astro"
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ThemeToggle from "@theme-kit/astro/ThemeToggle.astro";
---

<BaseLayout>
  <main>
    <h1>Themed with no client framework</h1>

    <ThemeToggle />
    <ThemeToggle showMode />

    <section class="surface">
      <h2>Semantic tokens</h2>
      <p>
        This panel is themed by <code>--theme-color-card</code>, a
        <code>--theme-color-border</code> outline and
        <code>--theme-color-cardForeground</code> text — no hardcoded color.
      </p>
    </section>

    <p>
      mode:
      <span
        style="font-family: var(--theme-typography-font-family-mono)"
        data-tk-readout="mode">—</span>
    </p>
  </main>
</BaseLayout>
```

#### snippet4

```ts title="getThemeController()"
// The one runtime the provider, <ThemeToggle /> and any island share.
import { getThemeController } from "@theme-kit/astro/runtime";

const theme = getThemeController();

theme.getTheme();        // the resolved ThemeDefinition
theme.getMode();         // "light" | "dark" | "system" — the *selection*
theme.getResolvedMode(); // "light" | "dark" — what is actually painted
theme.getFamily();
theme.setMode("dark");
theme.setFamily("mint");
theme.toggleTheme();
theme.subscribe(({ theme, mode, family }) => { /* ... */ });
```

#### snippet6

```astro title="src/pages/custom-toggle.astro"
---
// src/pages/custom-toggle.astro — no <ThemeToggle />, no island.
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout>
  <h1>Your own toggle</h1>

  <button class="btn" id="theme-toggle">Toggle theme</button>

  <script>
    // The same runtime <ThemeToggle /> drives, reached directly. No component
    // import, no client framework, no hydration.
    import { getThemeController } from "@theme-kit/astro/runtime";

    const theme = getThemeController();

    document
      .getElementById("theme-toggle")
      ?.addEventListener("click", () => theme.toggleTheme());
  </script>
</BaseLayout>
```

#### reactSetup

```js title="astro.config.mjs"
// astro.config.mjs — the only addition is the React renderer.
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit(), react()],
});
```

---

## Nuxt 3 (`@theme-kit/nuxt`)

Nuxt 3 module with server-rendered theming, cookie sync, auto-imported composables, and config-driven options.

**Tags:** Module · SSR · Zero-flash · Auto-import

### Feature map

**Server**

- **SSR-first theme resolution** — Reads `theme-name`, `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration.
- **Blocking bootstrap script** — Emits a blocking script in `<head>` that applies the persisted theme before first paint.
- **Dark-mode CSS fallback** — Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`.
- **Cookie + localStorage sync** — The client mirrors selection back to cookies so the server renders the right theme on the next request — same contract as `@theme-kit/next`.

**Client**

- **Runtime plugin** — A Nuxt plugin installs one app-wide runtime, provided to `useTheme()`, `useThemeRuntime()` and every auto-imported composable.
- **Auto-imports** — Composables (`useTheme`, `useThemeMode`, `useThemeHistory`, …) and components (`ThemeScope`, `ThemeScrollbar`) are auto-imported — no manual imports. They are also re-exported from `@theme-kit/nuxt` if you prefer being explicit.
- **configKey: "themeKit"** — Configure `themes`, `defaultTheme`, `initialMode`, `initialFamily`, `transition`, `scrollbar`, `storageKey` and `scheduled` in `nuxt.config.ts`.
- **useThemeSchedule()** — Auto-imported composable exposing the sunrise/sunset schedule: reactive `state` (`enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus `enable()`/`disable()`/`set()`. Configure via `scheduled` in the module config.

**Transition**

- **transition in nuxt.config.ts** — Configure `transition` in the `themeKit` config object to enable CSS transitions on theme changes. Duration/easing are set once; Theme Kit generates the transition styles at runtime.
- **runtime.store.set(theme, { suppressTransition: true })** — Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation. For custom animation orchestration, compose the core diff/plan/runner APIs.

**Scrollbar**

- **scrollbar: true** — Enables Theme Kit's custom overlay scrollbar. The SSR bootstrap hides the native scrollbar before first paint, then the overlay engine synchronizes with browser scrolling without replacing native scroll behavior.
- **scrollbar option** — Configure the overlay appearance (thickness, radius, colors, auto-hide, …) from the `themeKit` config; the overlay stays theme-aware and updates with runtime theme changes.

### Notes

- **Zero-flash:** Included. The module emits the pre-paint bootstrap and server-renders the themed `<html>`.
- **Starting mode:** `themeKit.initialMode` in `nuxt.config.ts` decides the starting mode, and `themeKit.defaultTheme` picks the theme.
- **Configuration:** Declared in `nuxt.config.ts` under the `themeKit` key. The module reads it and emits the pre-paint bootstrap, so nothing is repeated elsewhere.

### Quick Start

#### quickStart

```ts title="nuxt.config.ts"
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  // Required when scrollbar: true — the styles ship with core, not the module.
  css: ["@theme-kit/core/scrollbar.css"],
  themeKit: {
    defaultTheme: "mint-light",
    initialMode: "system",
    transition: { duration: 360, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    scrollbar: true,
  },
});
```

#### noTheme

```ts title="nuxt.config.ts"
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    defaultTheme: "light",
  },
});
```

#### styles

```css title="assets/css/main.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```vue title="components/ThemeSwitcher.vue"
<script setup lang="ts">
// useTheme is auto-imported by the module — no import statement needed.
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <main class="page">
    <h1>Theme Kit</h1>
    <p>Current theme: {{ theme.name }} ({{ mode }})</p>

    <button class="primary" @click="toggleTheme">Toggle theme</button>

    <section class="card">
      <h2>Themed card</h2>
      <p class="muted">Surface, border and text follow the theme.</p>
    </section>
  </main>
</template>

<style scoped>
  .page {
    background: var(--theme-color-background);
    color: var(--theme-color-foreground);
    min-height: 100vh;
    padding: 2rem;
  }
  .primary {
    background: var(--theme-color-primary);
    color: var(--theme-color-primaryForeground);
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .card {
    background: var(--theme-color-card);
    border: 1px solid var(--theme-color-border);
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
  }
  .muted {
    color: var(--theme-color-mutedForeground);
  }
</style>
```

### More Examples

#### snippet2

```vue title="components/ThemeHistoryControls.vue"
<script setup lang="ts">
// Both composables and both components are auto-imported by the module.
const { undo, redo, canUndo, canRedo } = useThemeHistory();
const { theme, setFamily } = useTheme();
</script>

<template>
  <ThemeScope theme="plum-dark" :transition="{ duration: 300, easing: 'ease' }">
    <p>This subtree is always plum-dark.</p>
  </ThemeScope>

  <button @click="undo" :disabled="!canUndo">Undo</button>
  <button @click="redo" :disabled="!canRedo">Redo</button>

  <button @click="setFamily('mint')">{{ theme.name }}</button>

  <ThemeScrollbar auto-hide />
</template>
```

---

## Remix (`@theme-kit/remix`)

Resolve the theme in a loader, paint it before first paint, then hydrate a matching runtime.

**Tags:** SSR · Loaders · Hydration

### Feature map

**Server**

- **getInitialThemeState()** — Reads the `theme-mode` / `theme-family` cookies off the request and resolves the initial state. Imported from `@theme-kit/remix/server`.
- **ThemeHead** — Emits the blocking bootstrap in the document <head> so the page paints already themed, plus the `prefers-color-scheme` dark fallback.
- **SSR-first resolution** — Request → loader → resolve initial state → HTML document → browser hydration. The server resolves the theme, so the first paint already matches the hydrated client.

**Client**

- **ThemeProvider** — Hydrates against the loader-resolved `initial` state and mirrors the selection back to cookies on change.
- **createRemixThemePersistence()** — Builds the adapter `ThemeProvider` uses: localStorage plus the `theme-mode`, `theme-family` and `theme-fingerprint` cookies the loader reads on the next request.
- **Full hook set + ThemeScope** — Every React hook plus scoped subtrees — re-exported from `@theme-kit/react`.
- **Intentional React dependency** — Remix is a React framework, so `@theme-kit/remix` depends on `@theme-kit/core` + `@theme-kit/react` directly. No other framework or adapter package is pulled in.

**Routing**

- **Provider lives in the root** — Mount `ThemeProvider` in `app/root.tsx`; nested routes and layouts inherit it through `<Outlet />`.
- **Route-level scopes** — Wrap a route subtree in `ThemeScope` to pin it to a theme without changing the global selection.

**Transition**

- **transition prop** — Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.
- **runtime.store.set(theme, { suppressTransition: true })** — Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation. For custom animation orchestration, compose the core diff/plan/runner APIs.

**Scrollbar**

- **scrollbar prop** — Pass `scrollbar` to `ThemeHead` to hide the native scrollbar from the very first paint and hand over to Theme Kit's overlay engine once the runtime hydrates.
- **Import the pre-paint styles** — Needs `import "@theme-kit/core/scrollbar.css"` plus the `tk-scrollbar` class on `<html>`, which the snippet above sets. Without both, the native bar hides before the overlay exists.

### Notes

- **Zero-flash:** Included, but you wire it: the loader resolves the theme and `ThemeHead` emits the script in `<head>`. The `<html>` element declares the same attributes so hydration matches.
- **Starting mode:** The loader resolves the initial state from the request cookies, so the first paint already matches. `mode` on `ThemeHead` and `initialMode` on `ThemeProvider` decide what a first-time visitor gets — keep them in one constant.
- **Configuration:** Themes and the starting mode come from the loader and the provider props. Remix renders its own document, so there is no bundler plugin to add: `ThemeHead` emits the pre-paint script from the server.

### Quick Start

#### quickStart

```tsx title="app/root.tsx"
// app/root.tsx
import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getBuiltInThemes } from "@theme-kit/core";
import { ThemeHead, ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

const themes = getBuiltInThemes();

// One source of truth for the starting mode: the pre-paint script and the
// runtime resolve it independently, so both have to be told the same thing.
const INITIAL_MODE = "system";

// Resolve the selection server-side so hydration matches exactly.
export async function loader({ request }: { request: Request }) {
  return {
    initial: await getInitialThemeState(request, {
      themes,
      defaultTheme: "light",
      mode: INITIAL_MODE,
    }),
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const { initial } = useLoaderData<typeof loader>();
  const family = initial.theme.meta?.family ?? initial.selection.family;

  return (
    // ThemeHead writes these onto <html> before React hydrates, so the server
    // renders them too — that is what keeps the two in agreement.
    <html
      lang="en"
      data-theme={initial.theme.name}
      data-theme-mode={initial.selection.mode === "dark" ? "dark" : "light"}
      {...(family ? { "data-theme-family": family } : {})}
      data-theme-selection-mode={initial.selection.mode}
      {...(family ? { "data-theme-selection-family": family } : {})}
      data-theme-ready="true"
    >
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
        <ThemeHead themes={themes} defaultTheme="light" mode={INITIAL_MODE} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <ThemeProvider initial={initial} themes={themes} defaultTheme="light">
      <Outlet />
    </ThemeProvider>
  );
}
```

#### noTheme

```tsx title="app/root.tsx"
// app/root.tsx
import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getBuiltInThemes } from "@theme-kit/core";
import { ThemeHead, ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

const themes = getBuiltInThemes();

// One source of truth for the starting mode: the pre-paint script and the
// runtime resolve it independently, so both are told the same thing.
const INITIAL_MODE = "system";

export async function loader({ request }: { request: Request }) {
  return {
    initial: await getInitialThemeState(request, {
      themes,
      defaultTheme: "light",
      mode: INITIAL_MODE,
    }),
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const { initial } = useLoaderData<typeof loader>();
  const family = initial.theme.meta?.family ?? initial.selection.family;

  return (
    // ThemeHead writes these onto <html> before React hydrates, so the server
    // renders them too — that is what keeps the two in agreement.
    <html
      lang="en"
      data-theme={initial.theme.name}
      data-theme-mode={initial.selection.mode === "dark" ? "dark" : "light"}
      {...(family ? { "data-theme-family": family } : {})}
      data-theme-selection-mode={initial.selection.mode}
      {...(family ? { "data-theme-selection-family": family } : {})}
      data-theme-ready="true"
    >
      <head>
        <Meta />
        <Links />
        <ThemeHead themes={themes} defaultTheme="light" mode={INITIAL_MODE} />
      </head>
      <body>
        <ThemeProvider initial={initial} themes={themes} defaultTheme="light">
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
```

#### styles

```css title="app/styles.css"
/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}
```

### Use Cases

#### snippet

```tsx title="app/routes/_index.tsx"
// The provider in app/root.tsx supplies the runtime, so a route just reads it.
import { useTheme } from "@theme-kit/remix";

export default function Index() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main
      style={{
        background: "var(--theme-color-background)",
        color: "var(--theme-color-foreground)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Theme Kit</h1>
      <p>
        Current theme: {theme.name} ({mode})
      </p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}
```

### More Examples

#### snippet2

```ts title="app/themes.ts"
// Imported as `./themes` from app/root.tsx.
import { defineTheme } from "@theme-kit/core";

export const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light" },
    tokens: {
      colors: { primary: "#10b981", background: "#f0fdf9" },
    },
  }),
];
```

#### snippet3

```tsx title="app/components/history-scope.tsx"
// app/components/history-scope.tsx — used inside the root provider, so it
// does NOT create a second runtime of its own.
import { ThemeScope, useThemeHistory } from "@theme-kit/remix";

export function HistoryScope() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();

  return (
    <div>
      <div>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>

      <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
        <span>Always plum-dark</span>
      </ThemeScope>
    </div>
  );
}
```

---

11 frameworks. Generated from `lib/frameworks.tsx`.
