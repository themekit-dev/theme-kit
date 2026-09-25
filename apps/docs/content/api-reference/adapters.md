## @theme-kit/adapters
Theme Kit adapter toolkit.

Shared utilities for building library adapters: the `AdapterSource`
contract, token readers (`readToken`, `readNested`, font/radius/breakpoint
readers), and color math (`hexToRgb`, `rgbToHex`, `mixHex`, `mixColors`).

> Generated from `packages/adapters/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `generateShades(baseColor, count, baseIndex): string[]`
Generates a `count`-step tonal scale from a single base color. The base
color sits exactly at `baseIndex`; lighter steps blend towards white and
darker steps towards black. Non-hex colors are repeated unchanged.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `baseColor` | `string` | — |
| `count` | `number` | — |
| `baseIndex` | `number` | — |

**Returns** `string[]`

---


### `hexToRgb(color): RGB | null`
Parses a hex color string into an RGB triplet.

Accepts `#rgb` (3-digit) and `#rrggbb` (6-digit) forms. A leading `#` is
required; any other input returns `null`.

**See also:** `rgbToHex`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `color` | `string` | The hex color string to parse. |

**Returns** `RGB | null` — The parsed triplet, or `null` when the input is not a valid hex color.

---


### `mixColors(a, b, t): string`
Mixes two hex colors by interpolating their RGB channels.

When either input is not a valid hex color, the closer input (`t < 0.5`
picks `a`, otherwise `b`) is returned unchanged.

**See also:** `mixHex`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `a` | `string` | The starting hex color (`t = 0`). |
| `b` | `string` | The ending hex color (`t = 1`). |
| `t` | `number` | The interpolation factor, typically `0`–`1`. |

**Returns** `string` — The mixed color as a `#rrggbb` hex string.

---


### `mixHex(a, b, t): RGB`
Linearly interpolates between two RGB triplets.

Each channel is computed as `a + (b - a) * t` and clamped to `0`–`255`.

**See also:** `mixColors`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `a` | `RGB` | The starting triplet (`t = 0`). |
| `b` | `RGB` | The ending triplet (`t = 1`). |
| `t` | `number` | The interpolation factor, typically `0`–`1`. |

**Returns** `RGB` — The interpolated triplet.

---


### `readBreakpoints(tokens, fallback): Record<string, string>`
Reads the theme's breakpoints as a map of name to CSS value.

Only string-valued entries are kept. When no breakpoints resolve, `fallback`
is returned unchanged.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens \| undefined` | The theme's resolved tokens, or `undefined`. |
| `fallback` | `Record<string, string>` | The map returned when no breakpoints resolve. Defaults to `{}`. |

**Returns** `Record<string, string>` — A map of breakpoint name to value.

---


### `readColor(theme, key, fallback?): string | undefined`
Reads a color from resolved tokens. Accepts nested paths
(`primary.main`) and matches camelCase / kebab-case variants so both
`primaryForeground` and `primary-foreground` token keys work.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `AdapterResolvedTheme` | — |
| `key` | `string` | — |
| `fallback` | `string` (optional) | — |

**Returns** `string | undefined`

---


### `readFontFamily(tokens, fallback, preferred?): string`
Resolves a font family from the theme's `typography.fontFamilies` tokens.

When `preferred` is given and resolves to a string it wins; otherwise the
first of `sans`, `body`, `ui`, `heading` that resolves is used, then the
first family in the group, and finally `fallback`.

**See also:** `readToken`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens \| undefined` | The theme's resolved tokens, or `undefined`. |
| `fallback` | `string` | The value returned when no family resolves. Defaults to `"system-ui, sans-serif"`. |
| `preferred` | `string` (optional) | An optional family key to prefer over the built-in order. |

**Returns** `string` — A resolved font family string.

---


### `readFontSize(tokens, key, fallback): string`
Reads a font size from the theme's `typography.fontSizes` tokens.

**See also:** `readToken`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens \| undefined` | The theme's resolved tokens, or `undefined`. |
| `key` | `string` | The font-size key to read. Defaults to `"md"`. |
| `fallback` | `string` | The value returned when the key is missing or not a string. Defaults to `"0.875rem"`. |

**Returns** `string` — The font-size string, or `fallback`.

---


### `readNested(record, path): unknown`
Reads a value from a nested record using a dot-separated path
(`"primary.main"`). Returns `undefined` when the record is missing or any
segment along the path is absent.

**See also:** `readToken`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `record` | `RecordMap \| undefined` | The record to read from, or `undefined`. |
| `path` | `string` | A dot-separated key path, e.g. `"primary.main"`. |

**Returns** `unknown` — The value at the path, or `undefined` if not found.

---


### `readRadius(theme, key, fallback): string`
Reads a radius token as its raw string value.

**See also:** `readRadiusNumber`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `AdapterResolvedTheme` | The resolved theme to read from. |
| `key` | `string` | The radius key to read. Defaults to `"lg"`. |
| `fallback` | `string` | The value returned when the token is missing. Defaults to `"0.5rem"`. |

**Returns** `string` — The radius string, or `fallback`.

---


### `readRadiusNumber(theme, key, fallback): number`
Reads a radius token and converts it to a pixel number.

Accepts `px`, `rem` and `em` units (rem/em are multiplied by 16) as well as
bare numbers. Unparseable or missing values return `fallback`.

**See also:** `readRadius`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `AdapterResolvedTheme` | The resolved theme to read from. |
| `key` | `string` | The radius key to read. Defaults to `"lg"`. |
| `fallback` | `number` | The value returned when the token is missing or unparseable. Defaults to `8`. |

**Returns** `number` — The radius in pixels.

---


### `readToken(theme, category, key, fallback?): string | undefined`
Reads a string token from a resolved theme's token group.

The token is looked up by a dot-separated path within the given category
(e.g. `readToken(theme, "colors", "primary.main")`). Non-string values and
missing keys fall back to `fallback`.

**See also:** `readNested`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `AdapterResolvedTheme` | The resolved theme to read from. |
| `category` | `keyof ThemeTokens` | The token group to read from (e.g. `"colors"`, `"radius"`). |
| `key` | `string` | A dot-separated key path within the category. |
| `fallback` | `string` (optional) | The value returned when the token is missing or not a string. |

**Returns** `string | undefined` — The string token value, or `fallback`.

---


### `resolveAdapterSource<T extends ThemeDefinition<string>>(source): AdapterResolvedTheme`
Normalizes any accepted source into an `AdapterResolvedTheme` whose tokens
have already been resolved (token references, auto()/contrast() and
expressions evaluated) by the core.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `source` | `AdapterSource<T>` | — |

**Returns** `AdapterResolvedTheme`

---


### `rgbToHex(rgb): string`
Serializes an RGB triplet to a `#rrggbb` hex string.

Each channel is clamped to `0`–`255` and rounded before serialization.

**See also:** `hexToRgb`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `rgb` | `RGB` | The triplet to serialize. |

**Returns** `string` — The `#rrggbb` hex string.

---


### `rgbTriplet(color): string | undefined`
`r, g, b` triplet (used by Bootstrap `--*-rgb` variables).

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `color` | `string` | — |

**Returns** `string | undefined`

---

## Interfaces

### `AdapterResolvedTheme`
The normalized, resolved theme an adapter consumes.

Produced by resolveAdapterSource from any accepted AdapterSource.
The `tokens` are already resolved by the core (token references, `auto()` /
`contrast()` and expressions evaluated), so adapters can read them directly.

**See also:** `AdapterSource`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `mode` | `"light" \| "dark" \| "system" \| undefined` | The resolved color mode, or `undefined` when the source carries no mode. |
| `name` | `string` | The name of the active theme family. |
| `tokens` | `ThemeTokens` | The fully-resolved token groups for the active theme. |

---


### `RGB`
An 8-bit RGB color triplet, each channel in the range `0`–`255`.

**See also:** `hexToRgb`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `b` | `number` | Blue channel, `0`–`255`. |
| `g` | `number` | Green channel, `0`–`255`. |
| `r` | `number` | Red channel, `0`–`255`. |

---

## Type Aliases

### `AdapterSource<T extends ThemeDefinition>`
A thing from which an adapter can read the currently-resolved theme.

Adapters accept either the live runtime, the bare store, a single resolved
theme definition, or raw tokens. This keeps the public API ergonomic while
the core stays completely UI-library agnostic.

`ThemeRuntime<T> | ThemeStore<T> | T | ThemeTokens`

---

## Related docs

- [Adapters](/adapters) — the adapter integration
