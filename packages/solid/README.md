# @theme-kit/solid

Signals-first theming for Solid with a context provider and scoped subtrees.

## Reference snippet

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

## Signals

`useTheme` — signals for `theme`, `mode`, `family` with getters and setters, plus `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`, `useThemePacks`.

## Components

`ThemeProvider` (context + bindings), `ThemeScope` — scoped theming.
