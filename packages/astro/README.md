# @theme-kit/astro

Astro-native theming: an integration for the pre-paint bootstrap, a React-free
`<html>` layout, and opt-in client islands.

`@theme-kit/astro` imports no React. React lives behind the opt-in
`@theme-kit/astro/client` entry and is an **optional peer dependency** — install
it only if you choose a React island.

## 1. Integration (build boundary)

```ts
// theme.config.ts — the single declaration
import { defineThemeKitConfig } from "@theme-kit/core";
import { themes } from "./src/themes";

export default defineThemeKitConfig({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
});

// astro.config.ts — register the integration. No theme data.
import { defineConfig } from "astro/config";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit()],
});
```

The integration discovers `theme.config.ts` at the project root, injects the
pre-paint blocking bootstrap into every page's `<head>` via
`injectScript("head-inline")`, and transports the same configuration to the
runtime as `window.__THEME_KIT_CONFIG__` — so the pages, the layout and the
islands all read one declaration instead of three that have to be kept in sync.

## 2. Astro component (SSR document)

```astro
---
// src/layouts/BaseLayout.astro — React-free.
import Provider from "@theme-kit/astro/provider.astro";
import { themes } from "../themes";
---

<Provider themes={themes} defaultTheme="mint-light" bootstrap={false}>
  <slot />
</Provider>
```

`provider.astro` resolves the selection from cookies on the server, paints the
themed `<html data-theme>` with inline CSS variables, and emits the blocking
bootstrap. Pass `bootstrap={false}` when the integration already injects it.

## 3. Client islands (opt-in)

```astro
---
import { getInitialThemeState } from "@theme-kit/astro";
import { ThemeProviderClient } from "@theme-kit/astro/client";
import { themes } from "../themes";

const initial = await getInitialThemeState(Astro.request, { themes });
---

<ThemeProviderClient client:load themes={themes} initial={initial} />
```

`@theme-kit/astro/client` is the only entry that depends on React. Install
`react`, `react-dom` and `@astrojs/react` yourself.

Use **`client:load`**, not `client:only`, and always pass `initial`. Astro
server-renders a `client:load` island, so the markup is in the first paint;
`client:only` renders nothing on the server, so the island would pop in once the
bundle executed. `initial` is what makes hydration match: without it the runtime
resolves the persisted selection on the client while the server rendered the
fallback, and React reports a mismatch and re-renders the island.

Every island that calls `useTheme()` must be rendered **inside the same island**
as `<ThemeProviderClient>`, which installs the runtime during its own render —
never as a sibling island, because Astro hydrates islands in an unspecified
order and a consumer that hydrates first throws "ThemeRuntime not initialized".

## Exports

| Entry | Contents | Client framework |
| ----- | -------- | ---------------- |
| `@theme-kit/astro` | `themeKit()`, `getInitialThemeState()`, `createBlockingScript`, `buildThemeCssMap`, `darkModeCSSTemplate`, `createAstroThemePersistence`, `computeFingerprint`, `getGlobalRuntime` / `setGlobalRuntime` | none |
| `@theme-kit/astro/provider.astro` | The SSR document component | none |
| `@theme-kit/astro/client` | `ThemeProviderClient`, the `useTheme*` hooks, `ThemeScope` | React |
| `@theme-kit/astro/ThemeInspector.astro` | Dev inspector | none |

## Documentation

Full API reference and guides: [Theme Kit docs](https://theme-kit-dev.vercel.app).
All packages: [npm](https://www.npmjs.com/org/theme-kit).
