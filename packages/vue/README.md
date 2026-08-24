# @theme-kit/vue

Vue 3 composables-first theming with a provider component and scoped theming.

## Reference snippet

```vue
<script setup>
import { useTheme } from "@theme-kit/vue";
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
</template>
```

## Setup

`ThemeProvider` auto-registered via `app.use` (`.install`); `provideThemeRuntime()` / `useThemeRuntime()` for explicit provide/inject.

## Composables

`useTheme`, `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.

## Components

`ThemeScope` — scoped theming component for subtrees.
