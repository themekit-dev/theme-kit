## @theme-kit/tailwind

> Generated from `packages/tailwind/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createTailwindPlugin(options?): { name: string }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `TailwindPluginOptions` (optional) | — |

**Returns** `{ name: string }`

---


### `synchronizeDarkClass(theme): void`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `{ meta?: { mode?: string } }` | — |

**Returns** `void`

---

## Interfaces

### `TailwindPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `string` | — |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | — |

---

## Variables

### `themeCSS`
`"/* Theme CSS is available at ./theme.css */"`

---
