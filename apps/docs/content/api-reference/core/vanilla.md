## @theme-kit/core/vanilla

> Generated from `packages/core/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `generateTheme(options): GeneratedThemePair`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `GenerateThemeOptions` | — |

**Returns** `GeneratedThemePair`

---

## Classes

### `class ThemeKit`
Framework-free drop-in theming with `@theme-kit/core`.

```js
import { ThemeKit } from "@theme-kit/core/vanilla";

const kit = new ThemeKit();
kit.setMode("dark");
kit.setFamily("plum");
kit.on("themeChange", (theme) => console.log(theme.name));
```

| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKit` | — |
| `family` | `void` | — |
| `mode` | `void` | — |
| `registry` | `void` | — |
| `runtime` | `void` | — |
| `schedule` | `void` | — |
| `theme` | `void` | — |
| `themes` | `void` | — |
| `destroy` | `void` | — |
| `off` | `void` | — |
| `on` | `__type(): void` | — |
| `setFamily` | `void` | — |
| `setMode` | `void` | — |
| `toCSSVariables` | `Record<string, string>` | — |
| `toggleTheme` | `void` | — |
| `update` | `void` | — |
| `use` | `void` | — |
| `init` | `ThemeKit` | — |

---

## Interfaces

### `GeneratedThemePair`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `dark` | `ThemeDefinition` | — |
| `light` | `ThemeDefinition` | — |

---


### `GenerateThemeOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` (optional) | `string` | — |
| `seed` | `string` | — |

---


### `ThemeDefinition<Name extends ThemeName>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `extends` (optional) | `Name | readonly Name[]` | — |
| `meta` (optional) | `ThemeMeta` | — |
| `name` | `Name` | — |
| `tokens` (optional) | `ThemeTokens` | — |

---


### `ThemeKitOptions`
Options for creating a ThemeKit instance.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `string` | Default theme name when no persisted selection exists. |
| `initialFamily` (optional) | `string` | Initial family. Ignored if a theme was previously persisted in localStorage. |
| `initialMode` (optional) | `ThemeMode` | Initial mode: `"light"`, `"dark"`, or `"system"`. Ignored if a theme was previously persisted in localStorage. |
| `scheduled` (optional) | `false | ScheduledThemeOptions<ThemeDefinition<string>>` | Sunrise/sunset solar scheduling config. Automatically applies light/dark themes at sunrise/sunset. |
| `target` (optional) | `HTMLElement | Document` | Target element for CSS custom properties and `data-theme` attributes. Defaults to `document.documentElement`. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Custom set of themes. Defaults to all built-in themes. |

---


### `ThemeRegistry<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` | `void` | — |
| `clear` | `void` | — |
| `destroy` | `void` | — |
| `get` | `T | undefined` | — |
| `getFamilies` | `string[]` | — |
| `getThemesByFamily` | `T[]` | — |
| `has` | `boolean` | — |
| `list` | `readonly T[]` | — |
| `register` | `boolean` | — |
| `registerMany` | `number` | — |
| `replace` | `boolean` | — |
| `unregister` | `boolean` | — |
| `use` | `void` | — |

---


### `ThemeTokens`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `borderWidths` (optional) | `Record<string, string>` | — |
| `breakpoints` (optional) | `Record<string, string>` | — |
| `code` (optional) | `CodeTokens` | — |
| `colors` (optional) | `ThemeColors` | — |
| `radius` (optional) | `Record<string, string>` | — |
| `shadows` (optional) | `Record<string, string>` | — |
| `spacing` (optional) | `Record<string, string>` | — |
| `typography` (optional) | `{ fontFamilies?: Record<string, string>; fontSizes?: Record<string, string>; lineHeights?: Record<string, string> }` | — |
| `zIndex` (optional) | `Record<string, string>` | — |

---

## Type Aliases

### `ThemeMode`
`"light" | "dark" | "system"`

---


### `ThemePack<T extends ThemeDefinition>`
`void`

---
