# @theme-kit/remix

Remix owns the server/client boundary: loader SSR resolution, a blocking head
script, and React hydration.

```
GET request
    ↓
root loader → getInitialThemeState(request, { themes })
    ↓
HTML document (themed <html> + <ThemeHead> bootstrap)
    ↓
browser hydration → <ThemeProvider initial> → React theme runtime
```

## Reference snippet

```tsx
// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { ThemeHead, ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";
import { themes } from "./themes";

export async function loader({ request }: { request: Request }) {
  return { initial: await getInitialThemeState(request, { themes }) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <ThemeHead themes={themes} />
      </head>
      <body>
        <ThemeProvider initial={initial} themes={themes}>
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## Server

`getInitialThemeState` (from `@theme-kit/remix/server`) reads the `theme-mode` /
`theme-family` cookies off the request and resolves the initial state;
`ThemeHead` emits the pre-paint blocking bootstrap plus the
`prefers-color-scheme` dark fallback; `createRemixThemePersistence()` and
`computeFingerprint()` handle persistence and stale-cookie rejection.

## Client

`ThemeProvider` hydrates against the loader-resolved `initial` state and mirrors
the selection back to cookies. The full React hook set and `ThemeScope` are
re-exported from `@theme-kit/react`.

> `createThemeRoot()` is a React-SPA-only bootstrap — don't use it in Remix.
> Remix owns the application/document lifecycle.

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
