# @theme-kit/solid

Signals-first theming for Solid with a context provider and scoped subtrees.

## Reference snippet

```ts
// theme/themes.ts — one definition per mode, grouped by meta.family
import { defineTheme } from "@theme-kit/core";

export const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light" },
    tokens: {
      colors: { background: "#ffffff", foreground: "#0f172a", primary: "#0d9488" },
    },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark" },
    tokens: {
      colors: { background: "#042f2e", foreground: "#ccfbf1", primary: "#5eead4" },
    },
  }),
] as const;
```

```tsx
import { ThemeProvider, useTheme } from "@theme-kit/solid";
import { themes } from "./theme/themes";

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

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
