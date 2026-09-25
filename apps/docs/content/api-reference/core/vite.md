## @theme-kit/core/vite
Theme Kit Vite plugin — injects the zero-flash bootstrap script and the
pre-paint scrollbar CSS into the served HTML.

Imported from the `@theme-kit/core/vite` subpath. Use with the Vite
configuration of vanilla or framework apps that render HTML on the
server.

> Generated from `packages/core/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `themeKitVitePlugin<T extends ThemeDefinition<string>>(options): ThemeKitVitePlugin`
Vite plugin that injects the theme bootstrap as a blocking inline script at
the top of `index.html`, so the persisted theme is applied before the first
paint. Prevents the flash-of-wrong-theme on reload for client-rendered apps.

**See also:** `ThemeKitVitePluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeKitVitePluginOptions<T>` | Build-time options. Optional; the default discovery path needs none. |

**Returns** `ThemeKitVitePlugin` — A Vite plugin, to be added to `plugins`.

**Config discovery.** The plugin looks for the application's
`theme.config.ts` in Vite's root (`config.root`, or `process.cwd()` when
unset), trying `theme.config.ts`, `.tsx`, `.mts`, `.mjs`, `.js` and `.cjs` in
that order. The file must have a default export — the object
defineThemeKitConfig returns. Discovery goes through Vite's own
`loadConfigFromFile`, so a TypeScript config resolves its imports exactly as
`vite.config.ts` does.

**What it injects.** Two things, both derived from that one configuration:
the blocking bootstrap script (`head-prepend`, `enforce: "pre"`) and, when
`scrollbar` is enabled, the pre-paint scrollbar CSS. The bootstrap payload is
the ThemeBootstrapConfig projection of the config — the registry, the
fallback theme, the initial mode/family, the storage key and the prefix. It is
also published to the browser as `window.__THEME_KIT_CONFIG__`, which is what
lets the provider take no theme props.

**Development.** `transformIndexHtml` runs on every dev page load, so the
injected script is always current for the running process. The *discovered
config* is resolved once and memoized, so editing `theme.config.ts` needs a
dev-server restart; editing `vite.config.ts` restarts Vite anyway, so the
plugin's own options do not.

**Production.** The script is injected into the generated HTML at build time
and runs before the application bundle. It is not emitted as a separate chunk.

**Limitations.** The plugin does not inspect provider props — Vite runs in the
build pipeline and props are runtime state, so the two sides share the
project-level config instead. It does not serve SSR HTML: frameworks that
render on the server (Next.js, Nuxt, Remix, Astro) have their own packages,
which emit the same bootstrap from the server. If the config cannot be
discovered, the plugin warns and falls back to the built-in themes rather than
failing the build.

```ts
// vite.config.ts — nothing to configure beyond registering the plugin.
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin()],
});
```

---

## Interfaces

### `ThemeKitThemeConfig<T extends ThemeDefinition>`
The deprecated inline form of the theme configuration: the registry, the
fallback theme, the initial mode/family, and the persistence key and prefix,
passed straight to themeKitVitePlugin.

**See also:** `themeKitVitePlugin`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | Theme name to fall back to when no persisted selection exists. |
| `initialFamily` (optional) | `string` | Family used when no persisted selection exists. |
| `initialMode` (optional) | `ThemeMode` | Mode used when no persisted selection exists. Defaults to the fallback theme's own mode — whatever `defaultTheme` resolves to, so a `defaultTheme="light"` app paints light from frame one. |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | The theme definitions registered with the runtime. |

---


### `ThemeKitViteInjectedTag`
Structural twin of Vite's `HtmlTagDescriptor`. Kept local so the plugin does
not need a hard dependency on `vite` types; the shape is assignable to
Vite's `IndexHtmlTransformResult` in Vite 4 through 8.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `attrs` (optional) | `Record<string, string \| boolean \| undefined>` | — |
| `children` (optional) | `string` | — |
| `injectTo` (optional) | `"head" \| "body" \| "head-prepend" \| "body-prepend"` | — |
| `tag` | `string` | — |

---


### `ThemeKitVitePlugin`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `enforce` | `"pre"` | — |
| `name` | `string` | — |
| `configResolved` (optional) | `void` | — |
| `configureServer` (optional) | `void` | — |
| `load` (optional) | `string \| Promise<string \| null \| undefined> \| null \| undefined` | — |
| `resolveId` (optional) | `string \| Promise<string \| null \| undefined> \| null \| undefined` | — |
| `transformIndexHtml` | `string \| ThemeKitViteInjectedTag[] \| { html: string; tags: ThemeKitViteInjectedTag[] } \| Promise<string \| ThemeKitViteInjectedTag[] \| { html: string; tags: ThemeKitViteInjectedTag[] }>` | — |

---


### `ThemeKitVitePluginOptions<T extends ThemeDefinition>`
Options for themeKitVitePlugin: where the application configuration
lives, plus the concerns that only exist at build time.

**See also:** `themeKitVitePlugin`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `config` (optional) | `string \| ThemeKitThemeConfig<T>` | The application's theme configuration, when discovery is not enough. |
| `defaultTheme` (optional) | `T["name"]` | Theme name to fall back to when no persisted selection exists. |
| `initialFamily` (optional) | `string` | Family the pre-paint script uses when no persisted selection exists. |
| `initialMode` (optional) | `ThemeMode` | Mode the pre-paint script uses when no persisted selection exists. |
| `prefix` (optional) | `string` | CSS custom property prefix. |
| `scrollbar` (optional) | `boolean \| PrePaintScrollbarOptions` | Hide native scrollbars before first paint by injecting the scrollbar pre-paint bootstrap script. `true` hides them (desktop), an options object keeps native bars on coarse-pointer devices unless `touch` is forced. Default `false` — the script is only needed when the page uses the Theme Kit overlay scrollbar. |
| `ssrContainer` (optional) | `string` | `id` of the element `ssrEntry`'s markup is injected into. |
| `ssrEntry` (optional) | `string \| null` | Module that exports `render(): string` — the app's markup, server-rendered. Set it and the plugin prerenders `#root` in the **dev server** as well as in a build. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. |
| `syncFirstRender` (optional) | `boolean` | Make React's first render commit synchronously, so the browser's first painted frame is already the app. Defaults to `true`. |
| `themes` (optional) | `readonly T[]` | The theme definitions registered with the runtime. |

---

## Related docs

- [Zero-flash bootstrap](/zero-flash) — Paint the correct theme on the first frame: a blocking script plus server-resolved initial state, with a Vite plugin for SPA builds.
