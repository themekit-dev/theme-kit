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
| Member | Type | Description |
| ------ | ---- | ----------- |
| `attrs` | `Record<string, string>` | — |
| `children` (optional) | `string` | — |
| `injectTo` | `string` | — |
| `tag` | `string` | — |

---


### `ThemeKitVitePlugin`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `enforce` | `"pre"` | — |
| `name` | `string` | — |
| `transformIndexHtml` | `string | { order?: "pre" | "post"; tags: ThemeKitViteInjectedTag[] } | ThemeKitViteInjectedTag[]` | — |

---


### `ThemeKitVitePluginOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | — |
| `initialFamily` (optional) | `string` | — |
| `initialMode` (optional) | `ThemeMode` | — |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | The theme definitions registered with the runtime. |

---
