# @theme-kit/svelte

Svelte 5 context-based provider with reactive readable stores.

## Reference snippet

```svelte
<script>
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, toggleTheme } = useTheme();
</script>

<button onclick={toggleTheme}>
  {$theme.name} · {$mode}
</button>
```

## Provider

`ThemeProvider` (context, DOM + CSS variable bindings); `getThemeRuntime()` / `setThemeRuntime()` context helpers.

## Stores

`useTheme` — reactive readable stores for `theme`, `mode`, `family` plus `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.

## Components

`ThemeScope` — scoped theming.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-prods.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
