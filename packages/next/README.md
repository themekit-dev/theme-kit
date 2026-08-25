# @theme-kit/next

Next.js App Router theming with SSR-safe hydration, cookie persistence, and zero flash of incorrect theme.

## Reference snippet

```tsx
// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// ThemeProvider accepts everything a plain <html> element does —
// className, style, dir, data-*, etc. — plus `body` for the <body> element.
export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      className="antialiased"
      dir="ltr"
      data-custom="anything"
      body={{ className: "font-sans" }}
    >
      {children}
    </ThemeProvider>
  );
}

// components/ThemeSwitcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  return (
    <div>
      <span>{theme.name} | {mode}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setMode("light")}>Light</button>
      <button onClick={() => setMode("dark")}>Dark</button>
      <button onClick={() => setMode("system")}>System</button>
    </div>
  );
}
```

## Server

`ThemeProvider` (Server Component) — reads `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables plus a blocking bootstrap script and dark-mode CSS fallback. It accepts every native `<html>` attribute (`lang`, `dir`, `className`, `style`, `data-*`, ...) and forwards them to the rendered element — user `className`/`style` are merged with the SSR theme output. Pass `body={{ className, ... }}` to forward attributes to the `<body>` element. `createNextThemePersistence()` mirrors selection to cookies.

## Client

`ClientThemeProvider` (cookie + localStorage, fingerprint, `.dark` class sync), `ThemeBootstrap`, and `@theme-kit/next/client` which re-exports every React hook plus `ThemeScope`, `ThemeInspector`, `ThemeModeButton`.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
