## @theme-kit/core/vite

> Generated from `packages/core/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `themeKitVitePlugin<T extends ThemeDefinition<string>>(options): ThemeKitVitePlugin`
Vite plugin that injects the theme bootstrap as a blocking inline script at
the top of `index.html`, so the persisted theme is applied before the first
paint. Prevents the flash-of-wrong-theme on reload for client-rendered apps.

```ts
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { customThemes } from "./src/themes";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin({ themes: customThemes })],
});
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeKitVitePluginOptions<T>` | — |

**Returns** `ThemeKitVitePlugin`

---

## Interfaces

### `ThemeKitViteInjectedTag`
Structural twin of Vite's `HtmlTagDescriptor`. Kept local so the plugin does
not need a hard dependency on `vite` types; the shape is assignable to
Vite's `IndexHtmlTransformResult` in Vite 4 through 8.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `attrs` (optional) | `Record<string, string | boolean | undefined>` | — |
| `children` (optional) | `string` | — |
| `injectTo` (optional) | `"head" | "body" | "head-prepend" | "body-prepend"` | — |
| `tag` | `string` | — |

---


### `ThemeKitVitePlugin`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `enforce` | `"pre"` | — |
| `name` | `string` | — |
| `transformIndexHtml` | `string | ThemeKitViteInjectedTag[]` | — |

---


### `ThemeKitVitePluginOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | — |
| `initialFamily` (optional) | `string` | — |
| `initialMode` (optional) | `ThemeMode` | — |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `scrollbar` (optional) | `boolean | PrePaintScrollbarOptions` | Hide native scrollbars before first paint by injecting the scrollbar
 pre-paint bootstrap script. `true` hides them (desktop), an options
 object keeps native bars on coarse-pointer devices unless `touch` is
 forced. Default `false` — the script is only needed when the page uses
 the Theme Kit overlay scrollbar. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | The theme definitions registered with the runtime. |

---
