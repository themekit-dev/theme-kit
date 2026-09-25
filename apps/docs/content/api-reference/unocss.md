## @theme-kit/unocss
Theme Kit UnoCSS integration.

Provides the `presetThemeKit` UnoCSS preset and the `createUnoTheme`
adapter-source helper that map Theme Kit tokens to UnoCSS theme values.

> Generated from `packages/unocss/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createUnoTheme(source): Record<string, unknown>`
Returns a static UnoCSS theme object with concrete values for a given set of
Theme Kit tokens (useful for build-time generation instead of runtime vars).

**See also:** `presetThemeKit`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `source` | `AdapterSource` | — |

**Returns** `Record<string, unknown>`

---


### `presetThemeKit(): Preset`
UnoCSS preset that exposes Theme Kit semantic tokens as utilities such as
`bg-primary`, `text-foreground`, `border-border`, `rounded-lg`, etc.
Values reference the live `--theme-*` variables, so they update at runtime.

**See also:** `createUnoTheme`

**Returns** `Preset`

---

## Interfaces

### `ThemeTokens`
Semantic token values consumed by the runtime.

Top-level groups map to CSS variable namespaces (`--theme-colors-*`,
`--theme-spacing-*`, …) when bound to the DOM by the runtime.

**See also:** `themeToCSSVariables`, `resolveTokens`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `borderWidths` (optional) | `Record<string, string>` | Border width values. |
| `breakpoints` (optional) | `Record<string, string>` | Responsive breakpoint values. |
| `code` (optional) | `CodeTokens` | Opt-in semantic colors for code and syntax surfaces. |
| `colors` (optional) | `ThemeColors` | Semantic color values. |
| `radius` (optional) | `Record<string, string>` | Border radius scale values. |
| `shadows` (optional) | `Record<string, string>` | Shadow values (typically CSS box-shadow strings). |
| `spacing` (optional) | `Record<string, string>` | Spacing scale values (typically CSS lengths). |
| `typography` (optional) | `{ fontFamilies?: Record<string, string>; fontSizes?: Record<string, string>; lineHeights?: Record<string, string> }` | Typography scale values. |
| `zIndex` (optional) | `Record<string, string>` | Z-index values. |

---

## Related docs

- [UnoCSS](/libraries/unocss) — the adapter integration
