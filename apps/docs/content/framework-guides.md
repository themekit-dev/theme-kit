Theme Kit ships first-class integrations for every major framework. Each integration re-exports the full `@theme-kit/core` surface and adds framework-native providers, hooks, stores, signals, or directives.

> **Transitions are enabled by default.** Theme changes animate automatically with
> a 300ms `cubic-bezier(0.4, 0, 0.2, 1)` cross-fade (`preset: "smooth"`). Pass
> `transition={{ enabled: false }}` (or `transition={false}`) to disable them,
> or any `ThemeTransitionOptions` to tune duration/easing/preset/properties.
> See [Animation & Transition](./animation).
>
> **Make page transitions visible.** The runtime animates the `--theme-color-*`
> custom properties on `<html>`, so paint your page with them once:
>
> ```css
> html,
> body {
>   margin: 0;
>   min-height: 100vh;
>   background: var(--theme-color-background);
>   color: var(--theme-color-foreground);
> }
> ```

## React (`@theme-kit/react`)

`ThemeProvider` creates a runtime, wires DOM + CSS variable bindings, and provides it via context. Pass `runtime` to share an instance, or `initial` to seed the server-resolved selection.

- Hooks: `useTheme`, `useThemeValue`, `useThemeTokens`, `useThemeMode`, `useThemeFamily`, `useSetThemeMode`, `useSetThemeFamily`, `useToggleTheme`, `useThemeRuntime`, `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeTimeTravel`, `useThemeLifecycle`, `useThemePacks`.
- Components: `ThemeScope`, `ThemeModeButton`, `ThemeInspector`, plus `useScopedTheme` for imperative scoping.

### Full Vite setup

```tsx
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [
    react(),
    // Injects a blocking bootstrap <script> into index.html so the persisted
    // selection is applied before first paint (no flash of the wrong theme).
    themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" }),
  ],
});
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";
import App from "./App";
import { themes } from "./themes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
      initialMode="system"
      transition={{ enabled: true }}
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
);
```

```tsx
// src/App.tsx
import { useTheme } from "@theme-kit/react";

export default function App() {
  return <ThemeSwitcher />;
}

function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme.name}</button>;
}
```

`themes` is your `ThemeDefinition[]` — see [Defining themes](./themes).

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

### Full Vite setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [
    vue(),
    themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" }),
  ],
});
```

```ts
// src/main.ts
import { createApp } from "vue";
import { ThemeProvider } from "@theme-kit/vue";
import App from "./App.vue";
import { themes } from "./themes";

const app = createApp(App);

// ThemeProvider is auto-registered globally via `app.use` (`.install`), so it
// can be used anywhere in the tree.
app.use(ThemeProvider as never);

app.mount("#app");
```

```vue
<!-- src/App.vue -->
<template>
  <ThemeProvider
    :themes="themes"
    default-theme="mint-light"
    initial-mode="system"
    :transition="{ enabled: true }"
  >
    <ThemeSwitcher />
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ThemeProvider } from "@theme-kit/vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { themes } from "./themes";
</script>
```

```vue
<!-- src/ThemeSwitcher.vue -->
<script setup lang="ts">
import { useTheme } from "@theme-kit/vue";
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
</template>
```

> `theme`, `mode`, and `family` returned by `useTheme` are Vue refs — they are
> auto-unwrapped in templates, so write `theme.name` (not `theme.value.name`).

## Svelte 5 (`@theme-kit/svelte`)

- Context-based `ThemeProvider` with DOM/CSS bindings.
- `getThemeRuntime` / `setThemeRuntime` context helpers.
- `useTheme` — reactive readable stores for `theme`, `mode`, `family`.
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.
- `ThemeScope` — scoped theming.

### 1 · Wrap your app

Mount `ThemeProvider` at the root and render your app through it.

- **Vite + Svelte SPA** → wrap in `App.svelte` and render your components inside it.
- **SvelteKit** → wrap in `+layout.svelte` and render the page via `{@render children()}` (SvelteKit injects the `children` snippet prop into layouts).

```svelte
<!-- App.svelte (Vite SPA) -->
<script lang="ts">
  import { ThemeProvider } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import { themes } from "./themes";
</script>

<ThemeProvider
  themes={themes}
  defaultTheme="mint-light"
  initialMode="system"
  transition={{ enabled: true }}
>
  <ThemeSwitcher />
</ThemeProvider>
```

```svelte
<!-- +layout.svelte (SvelteKit) -->
<script lang="ts">
  import { ThemeProvider } from "@theme-kit/svelte";
  import { themes } from "./themes";
  let { children } = $props();
</script>

<ThemeProvider themes={themes} defaultTheme="mint-light" initialMode="system">
  {@render children()}
</ThemeProvider>
```

> For a Vite SPA, render your components directly inside `<ThemeProvider>` —
> `{@render children()}` only works in SvelteKit layouts, where SvelteKit itself
> supplies the `children` snippet.

### 2 · Use the theme

Any component inside the provider can read the theme through `useTheme()`:

```svelte
<script lang="ts">
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, toggleTheme } = useTheme();
</script>

<button onclick={toggleTheme}>{$theme.name} · {$mode}</button>
```

### 3 · Vite config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [
    svelte(),
    themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" }),
  ],
});
```

## Solid (`@theme-kit/solid`)

- `ThemeProvider` context provider with bindings.
- `useTheme` — signals for `theme`, `mode`, `family` with getters.
- `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.
- `ThemeScope` — scoped theming.

### Full Vite setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [
    solid(),
    themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" }),
  ],
});
```

```tsx
// src/main.tsx
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import App from "./App";
import { themes } from "./themes";

render(
  () => (
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
      initialMode="system"
      transition={{ enabled: true }}
    >
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);
```

```tsx
// src/App.tsx
import { useTheme } from "@theme-kit/solid";

export default function App() {
  return <ThemeSwitcher />;
}

function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme().name} · {mode()}</button>;
}
```

> `theme`, `mode`, and `family` from `useTheme` are Solid signals — call them
> like functions (`theme()`) to read the current value.

## Angular (`@theme-kit/angular`)

- `provideThemeKit(options)` / `provideThemeKitRuntime(runtime)` app providers.
- `injectThemeRuntime()` runtime injector.
- `injectTheme()` — reactive `ThemeState` (theme, mode, family + setters).
- `injectThemeHistory`, `injectThemeBatch`, `injectThemeSnapshot`, `injectThemeRestore`, `injectThemeTimeTravel`, `injectThemeLifecycle`, `injectThemePacks`.
- `ThemeScopeDirective` — element-scoped theming.
- `createAngularPersistence()`, `createBlockingScriptContent`, `buildThemeCSSMap` — zero-flash bootstrap helpers.

### Full Vite setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [
    angular(),
    themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" }),
  ],
});
```

```ts
// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";
import { themes } from "./themes";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes })],
});
```

```ts
// src/app/app.component.ts
import { Component } from "@angular/core";
import { ThemeSwitcherComponent } from "./theme-switcher.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ThemeSwitcherComponent],
  template: `<theme-switcher />`,
})
export class AppComponent {}
```

```ts
// src/app/theme-switcher.component.ts
import { Component } from "@angular/core";
import { injectTheme } from "@theme-kit/angular";

@Component({
  selector: "theme-switcher",
  standalone: true,
  template: `
    <button (click)="toggle()">
      {{ state().theme.name }} · {{ state().mode }}
    </button>
  `,
})
export class ThemeSwitcherComponent {
  // NOTE: must be public — Angular templates cannot access private members.
  state = injectTheme();
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

### Full Vite setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" })],
});
```

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Theme Kit · Web Components</title>
  </head>
  <body>
    <!-- Children (theme-kit-toggle etc.) look up the tree for the nearest
         provider runtime, so they must be nested INSIDE the provider. -->
    <theme-kit-provider id="tk-provider">
      <theme-kit-toggle>Toggle theme</theme-kit-toggle>
    </theme-kit-provider>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```ts
// src/main.ts
import { defineCustomElements } from "@theme-kit/web";
import { themes } from "./themes";

// Set attributes BEFORE defining custom elements: when `defineCustomElements()`
// upgrades the existing <theme-kit-provider>, its `connectedCallback` reads the
// attributes. Setting them after upgrade would re-init the runtime and orphan
// already-subscribed children like <theme-kit-toggle>.
const provider = document.querySelector<HTMLElement>("theme-kit-provider");
if (provider) {
  provider.setAttribute("themes", JSON.stringify(themes));
  provider.setAttribute("default-theme", "mint-light");
}

// Defines <theme-kit-provider>, <theme-kit-scope>, <theme-kit-toggle>,
// <theme-kit-select>, <theme-kit-scrollbar>.
defineCustomElements();
```

## Tailwind (`@theme-kit/tailwind`)

```css
@import "tailwindcss";
@import "@theme-kit/tailwind";
```

- Maps theme tokens to `@theme` variables (`--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`).
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`.
- `synchronizeDarkClass(theme)` keeps the `.dark` class in sync.
- Ships `theme.css` / `dark.css` / `preflight.css` layers.

### Full Vite setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { themes } from "./src/themes";

export default defineConfig({
  plugins: [
    tailwindcss(),
    themeKitVitePlugin({ themes, defaultTheme: "mint-light", initialMode: "system" }),
  ],
});
```

```ts
// src/main.ts
import { ThemeKit } from "@theme-kit/core/vanilla";
import { synchronizeDarkClass } from "@theme-kit/tailwind";
import { themes } from "./themes";
import "./style.css";

// Vanilla runtime wires DOM attributes + CSS variables on <html>.
const themeKit = new ThemeKit({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
});

// Keep the `.dark` class (used by Tailwind's dark: variant) in sync.
themeKit.on("themeChange", (theme) => synchronizeDarkClass(theme));

document.querySelector("#toggle")!.addEventListener("click", () => {
  themeKit.toggleTheme();
});
```

```html
<!-- index.html -->
<button id="toggle" class="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
  Toggle theme
</button>
```

> Theme Kit's `@theme` block maps your tokens to Tailwind utilities
> (`bg-background`, `text-foreground`, `bg-primary`, `rounded-lg`, …), so you
> can use them directly in class names once the runtime is active.

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
