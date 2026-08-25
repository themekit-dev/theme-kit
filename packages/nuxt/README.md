# @theme-kit/nuxt

Nuxt 3 module with SSR-first theming, zero-flash bootstrap, cookie + localStorage sync, config-driven transitions and scrollbar, and auto-imported composables/components.

## Reference snippet

```ts
// nuxt.config.ts
import { themes } from "./themes";

export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
    initialFamily: "mint",
    transition: { enabled: true, duration: 360, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    scrollbar: true,
  },
});
```

```vue
<script setup>
// useTheme, useThemeRuntime, useThemeHistory, ThemeScope, ThemeScrollbar …
// are auto-imported by the module — no manual imports needed.
const { theme, mode, setMode, toggleTheme } = useTheme();
</script>

<template>
  <div>
    <span>{{ theme.name }} | {{ mode }}</span>
    <button @click="toggleTheme">Toggle</button>
    <button @click="setMode('light')">Light</button>
    <button @click="setMode('dark')">Dark</button>
    <button @click="setMode('system')">System</button>

    <ThemeScope theme="forest-light">
      <p>Scoped to forest-light</p>
    </ThemeScope>

    <ThemeScrollbar auto-hide />
  </div>
</template>
```

## Server

The module's runtime plugin resolves the initial theme on the server from the `theme-name`, `theme-mode`, `theme-family` and `theme-fingerprint` cookies, rejects stale selections via a config fingerprint, and renders a themed `<html data-theme data-theme-mode data-theme-family>` with inline CSS variables, a blocking bootstrap `<script>` in `<head>`, and a `@media (prefers-color-scheme: dark)` fallback when the persisted mode is `system`. The browser paints already themed — no flash of the incorrect theme.

## Client

After hydration, the plugin installs one app-wide runtime (provided to `useTheme()` and every auto-imported composable, plus `nuxtApp.$themeKit` / `$themeKitRuntime`). Selection changes are mirrored back to cookies via `createNuxtThemePersistence()` so the server renders the same theme on the next request, and localStorage + `storage` events keep tabs in sync.

## Config

`configKey: "themeKit"` accepts:

- `themes`, `defaultTheme`, `initialMode`, `initialFamily`
- `transition` — `false`, or `{ enabled, duration, easing }` for config-driven CSS transitions on theme changes
- `scrollbar` — `true`, or overlay options (thickness, radius, colors, auto-hide, …) for the theme-aware custom scrollbar
- `storageKey` — localStorage key (default `theme-selection`)

## Module

- Nuxt 3 module (`configKey: "themeKit"`) with `themes`, `defaultTheme`, `initialMode`, `initialFamily`, `transition`, `scrollbar` and `storageKey` options.
- Auto-imports composables, registers `ThemeProvider`, `ThemeScope` and `ThemeScrollbar`, and installs the runtime plugin.
- Re-exports the Vue integration plus the full `@theme-kit/core` surface, and the SSR helpers (`resolveThemeFromCookies`, `computeFingerprint`, `parseCookieHeader`, `themeKitCookieNames`, `createNuxtThemeBootstrapScript`).

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
