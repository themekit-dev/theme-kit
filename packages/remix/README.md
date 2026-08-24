# @theme-kit/remix

Remix loader/server-side theming with a blocking script and the full hook set.

## Reference snippet

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

## Server

Loader/server-side theming resolves the theme from cookies and renders it before hydration; `blocking-script.tsx` applies the persisted theme before first paint; `createRemixThemePersistence()` adapter + `computeFingerprint()`; server entry helpers under `@theme-kit/remix/server`.

## Client

`ThemeProvider` consumes the loader-resolved selection, with the full hook set and `ThemeScope`.
