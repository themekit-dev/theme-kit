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

## Entry point (CSR)

For a client-rendered Vite/SPA app, mount the provider at the app root:

```tsx
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider themes={themes} defaultTheme="mint-light" initialMode="system">
    <App />
  </ThemeProvider>,
);
```

### Optional: `createThemeRoot` (flash-free initial commit)

React's concurrent root schedules the initial commit, so the browser can paint
an empty/partial frame before the themed tree is in the DOM — visible as a
brief flicker on reload in some applications. `createThemeRoot` is an opt-in
root helper that owns the root boundary and flushes **only the first** commit
synchronously, so the very first frame is already the themed UI:

```tsx
import { createThemeRoot } from "@theme-kit/react";

const handle = createThemeRoot({
  container: document.getElementById("root")!,
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
  transition: { enabled: true },
  render: ({ runtime }) => <App />,
});
```

The `render({ runtime })` callback is the application's full composition —
arbitrary provider trees (MUI, Chakra, React Query, Redux, Router, …) stay
entirely under the application's control, and can derive their configuration
from the Theme Kit runtime:

```tsx
render: ({ runtime }) => (
  <MuiThemeProvider theme={createMuiTheme(runtime)}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MuiThemeProvider>
),
```

The handle exposes `root` (the underlying React root), `runtime` (the runtime
created for this root), and `unmount()`. Only the initial render is flushed;
subsequent renders keep React's normal concurrent scheduling.

Use it when you want Theme Kit to own the root initialization boundary —
reload-sensitive demos, blank-frame-sensitive apps, or apps whose providers
need the Theme Kit runtime at composition time. **SSR/SSG apps must not use
it** — server-rendered HTML is hydrated with `hydrateRoot()` or a framework
integration (`@theme-kit/next`, `@theme-kit/remix`), never replaced by a fresh
`createRoot`.

## Hooks

`useTheme`, `useThemeValue`, `useThemeTokens`, `useThemeMode`, `useThemeFamily`, `useSetThemeMode`, `useSetThemeFamily`, `useToggleTheme`, `useThemeRuntime`, `useThemeHistory`, `useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeTimeTravel`, `useThemeLifecycle`, `useThemePacks`.

## Components

`ThemeProvider`, `ThemeScope`, `ThemeModeButton`, `ThemeInspector`, plus `useScopedTheme(ref, themeName)` for imperative scoping.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
