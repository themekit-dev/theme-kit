# @theme-kit/react

React 18/19 integration for Theme Kit. Provider + hooks over the framework-agnostic `@theme-kit/core` runtime.

## Reference snippet

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
  const { theme, family, setFamily, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      {theme.name} · {family}
    </button>
  );
}
```

## Hooks

`useTheme`, `useThemeValue`, `useThemeTokens`, `useThemeMode`, `useThemeFamily`, `useSetThemeMode`, `useSetThemeFamily`, `useToggleTheme`, `useThemeRuntime`, `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeTimeTravel`, `useThemeLifecycle`, `useThemePacks`.

## Components

`ThemeProvider`, `ThemeScope`, `ThemeModeButton`, `ThemeInspector`, plus `useScopedTheme(ref, themeName)` for imperative scoping.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
