---
title: "Zero flash: how ThemeProvider avoids a wrong-theme flash on every load"
date: 2026-07-28
description: "The three techniques Theme Kit uses to guarantee a user never sees a flash of incorrect theme — blocking bootstrap scripts, SSR CSS variables and cookie-based fingerprinting."
tags: next, rsc, ssr, performance
---

Every theming library has to answer the same question: what does the user see
between "HTML arrives" and "JavaScript runs"? If the answer is *the wrong
theme*, you have a flash of incorrect theme (FOIT). Theme Kit attacks this from
three directions at once.

## 1. Resolve the theme on the server

With `@theme-kit/next`, the `ThemeProvider` is a server component. It reads the
`theme` cookie, validates the selection against the configured themes, and
resolves the *initial theme before a single byte of HTML is sent*:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
```

The server-rendered `<html>` arrives already carrying `data-theme="dark"` and
the correct inline `--theme-color-*` variables, so first paint is correct.

## 2. Block with a bootstrap script

Cookies aren't always there — a returning user's first request, an authenticated
route, or a misconfigured proxy. For those cases Theme Kit emits a small
**blocking bootstrap script** inside `<head>` that runs before first paint. It
reads the persisted selection from `localStorage`, falls back to
`prefers-color-scheme`, and flips `data-theme` before the browser paints:

```ts
import { createThemeBootstrapScript } from "@theme-kit/core";

const script = createThemeBootstrapScript({ themes, defaultTheme: "light" });
// → a self-contained <script> string you can inline in <head>
```

## 3. Ship the CSS variables in the SSR HTML

Because the resolved theme's tokens are flattened on the server, the
`--theme-color-*` variables are present in the initial HTML itself. There is no
"CSS loads late" gap — the tokens the first paint needs are already there, and
`@theme-kit/next` even pre-paints the dark-mode CSS via `useServerInsertedHTML`.

## The result

- **First paint is always correct** — no theme, no layout flash.
- **No runtime dependency for correctness** — the site is themed even with
  JavaScript disabled.
- **Fingerprinting** keeps the persisted selection honest: a cookie that names a
  theme you no longer ship is safely rejected.

Try it yourself — this very documentation site runs on exactly this pipeline.
