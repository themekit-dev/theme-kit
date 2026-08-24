Theme Kit ships first-class integrations for every major framework. Each integration re-exports the full `@theme-kit/core` surface and adds framework-native providers, hooks, stores, signals, or directives.

## React (`@theme-kit/react`)

`ThemeProvider` creates a runtime, wires DOM + CSS variable bindings, and provides it via context. Pass `runtime` to share an instance, or `initial` to seed the server-resolved selection.

- Hooks: `useTheme`, `useThemeValue`, `useThemeTokens`, `useThemeMode`, `useThemeFamily`, `useSetThemeMode`, `useSetThemeFamily`, `useToggleTheme`, `useThemeRuntime`, `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeTimeTravel`, `useThemeLifecycle`, `useThemePacks`.
- Components: `ThemeScope`, `ThemeModeButton`, `ThemeInspector`, plus `useScopedTheme` for imperative scoping.

```tsx
import { ThemeProvider, useTheme } from "@theme-kit/react";

export function App() {
  return (
    <ThemeProvider themes={themes} transition={{ enabled: true }}>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme.name}</button>;
}
```

## Next.js (`@theme-kit/next`)

Server components, SSR-safe hydration, and zero-flash theming.

- **Server:** `ThemeProvider` reads `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration. Emits a blocking bootstrap script plus a `@media (prefers-color-scheme: dark)` fallback.
- **Persistence:** `createNextThemePersistence()` mirrors selection to cookies so the server renders the correct theme on the next request.
- **Client:** `ClientThemeProvider` (cookie + localStorage, fingerprint, `.dark` class sync), `ThemeBootstrap`, and `@theme-kit/next/client`, which re-exports every React hook plus `ThemeScope`, `ThemeInspector`, `ThemeModeButton`.

```tsx
// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="light"
      transition={{ enabled: true, duration: 300, easing: "ease-in-out" }}
    >
      {children}
    </ThemeProvider>
  );
}
```

Pass `transition` to the server `ThemeProvider` to animate theme changes. The config is forwarded to the client runtime, so the same `ThemeTransitionOptions` (`enabled`, `duration`, `easing`, `useViewTransition`) apply to CSS transitions and the View Transitions API.

Client hooks come from `@theme-kit/next/client`.

## Vue 3 (`@theme-kit/vue`)

- `ThemeProvider` component auto-registered via `app.use` (`.install`).
- `provideThemeRuntime` / `useThemeRuntime` provide/inject API.
- `useTheme` (refs) plus `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks` composables.
- `ThemeScope` — scoped theming component.

```vue
<script setup>
import { useTheme } from "@theme-kit/vue";
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
</template>
```

## Svelte 5 (`@theme-kit/svelte`)

- Context-based `ThemeProvider` with DOM/CSS bindings.
- `getThemeRuntime` / `setThemeRuntime` context helpers.
- `useTheme` — reactive readable stores for `theme`, `mode`, `family`.
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.
- `ThemeScope` — scoped theming.

```svelte
<script>
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, toggleTheme } = useTheme();
</script>

<button onclick={toggleTheme}>{$theme.name} · {$mode}</button>
```

## Solid (`@theme-kit/solid`)

- `ThemeProvider` context provider with bindings.
- `useTheme` — signals for `theme`, `mode`, `family` with getters.
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.
- `ThemeScope` — scoped theming.

```tsx
import { ThemeProvider, useTheme } from "@theme-kit/solid";

function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme().name} · {mode()}</button>;
}

export function App() {
  return (
    <ThemeProvider themes={themes}>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}
```

## Angular (`@theme-kit/angular`)

- `provideThemeKit(options)` / `provideThemeKitRuntime(runtime)` app providers.
- `injectThemeRuntime()` runtime injector.
- `injectTheme()` — reactive `ThemeState` (theme, mode, family + setters).
- `injectThemeHistory`, `injectThemeBatch`, `injectThemeSnapshot`, `injectThemeRestore`, `injectThemeTimeTravel`, `injectThemeLifecycle`, `injectThemePacks`.
- `ThemeScopeDirective` — element-scoped theming.
- `createAngularPersistence()`, `createBlockingScriptContent`, `buildThemeCSSMap` — zero-flash bootstrap helpers.

```ts
// app.config.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { provideThemeKit, injectTheme } from "@theme-kit/angular";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes })],
});

// theme-switcher.ts
@Component({
  selector: "theme-switcher",
  template: `
    <button (click)="toggle()">
      {{ state().theme.name }} · {{ state().mode }}
    </button>
  `,
})
export class ThemeSwitcher {
  private state = injectTheme();
  toggle() {
    this.state().toggleTheme();
  }
}
```

## Web Components (`@theme-kit/web`)

Framework-free theming for any HTML page:

```ts
import { defineCustomElements } from "@theme-kit/web";
defineCustomElements();
```

Elements: `<theme-kit-provider>`, `<theme-kit-scope>`, `<theme-kit-toggle>`, `<theme-kit-select>`, plus `getProviderRuntime()` for imperative access.

## Tailwind (`@theme-kit/tailwind`)

```css
@import "tailwindcss";
@import "@theme-kit/tailwind";
```

- Maps theme tokens to `@theme` variables (`--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`).
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`.
- `synchronizeDarkClass(theme)` keeps the `.dark` class in sync.
- Ships `theme.css` / `dark.css` / `preflight.css` layers.

## Astro (`@theme-kit/astro`)

- `ThemeProviderClient` island provider with the full hook set and `ThemeScope`.
- `createBlockingScript` / `buildThemeCssMap` / `darkModeCSSTemplate` — zero-flash bootstrap.
- `createAstroThemePersistence()` persistence adapter.
- `computeFingerprint()` cookie/config fingerprinting.
- `getGlobalRuntime` / `setGlobalRuntime` — shared runtime across islands.

```astro
---
import { ThemeProviderClient } from "@theme-kit/astro";
import ThemeSwitcher from "../components/ThemeSwitcher.astro";
---

<ThemeProviderClient themes={themes} />

<ThemeSwitcher client:load />
```

## Nuxt (`@theme-kit/nuxt`)

- Nuxt 3 module (`configKey: "themeKit"`) with `themes`, `defaultTheme`, `initialMode`, `initialFamily` options.
- Auto-imports composables, registers components and a runtime plugin.
- Re-exports the Vue integration plus the full `@theme-kit/core` surface.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "light",
    initialMode: "system",
  },
});
```

```vue
<script setup>
const { theme, mode, toggleTheme } = useTheme(); // auto-imported
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
</template>
```

## Remix (`@theme-kit/remix`)

- Loader/server-side theming with a blocking script (`blocking-script.tsx`).
- `ThemeProvider`, full hook set, and `ThemeScope`.
- `createRemixThemePersistence()` adapter + `computeFingerprint()`.
- Server entry helpers under `server/`.

```tsx
// app/root.tsx
import { ThemeProvider } from "@theme-kit/remix";

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
```
