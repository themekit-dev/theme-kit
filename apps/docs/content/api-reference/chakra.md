## @theme-kit/chakra
Theme Kit Chakra UI adapter.

Bridges a Theme Kit runtime to Chakra UI's theme: `ChakraThemeProvider`,
`buildChakraTheme`, and the runtime adapter (`createChakraAdapter` /
`useChakraTheme`).

> Generated from `packages/chakra/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `buildChakraConfig(theme): { breakpoints: Record<string, string>; semanticTokens: { colors: { accentForeground: TokenValue; background: TokenValue; border: TokenValue; card: TokenValue; cardForeground: TokenValue; destructiveForeground: TokenValue; foreground: TokenValue; input: TokenValue; muted: TokenValue; mutedForeground: TokenValue; popover: TokenValue; popoverForeground: TokenValue; primaryContrast: TokenValue; ring: TokenValue; secondary: TokenValue; secondaryForeground: TokenValue } }; tokens: { colors: { accent: Record<string, TokenValue>; destructive: Record<string, TokenValue>; primary: Record<string, TokenValue>; secondary: Record<string, TokenValue> }; fonts: { body: TokenValue; heading: TokenValue; mono: TokenValue }; radii: { 2xl: TokenValue; lg: TokenValue; md: TokenValue; sm: TokenValue; xl: TokenValue; xs: TokenValue } } }`
Builds the Chakra UI (v3) theme config from Theme Kit semantic tokens.

**See also:** `ChakraThemeProvider`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `AdapterResolvedTheme` | — |

**Returns** `{ breakpoints: Record<string, string>; semanticTokens: { colors: { accentForeground: TokenValue; background: TokenValue; border: TokenValue; card: TokenValue; cardForeground: TokenValue; destructiveForeground: TokenValue; foreground: TokenValue; input: TokenValue; muted: TokenValue; mutedForeground: TokenValue; popover: TokenValue; popoverForeground: TokenValue; primaryContrast: TokenValue; ring: TokenValue; secondary: TokenValue; secondaryForeground: TokenValue } }; tokens: { colors: { accent: Record<string, TokenValue>; destructive: Record<string, TokenValue>; primary: Record<string, TokenValue>; secondary: Record<string, TokenValue> }; fonts: { body: TokenValue; heading: TokenValue; mono: TokenValue }; radii: { 2xl: TokenValue; lg: TokenValue; md: TokenValue; sm: TokenValue; xl: TokenValue; xs: TokenValue } } }`

---


### `ChakraThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<ChakraThemeProvider runtime={runtime}>` — wraps Chakra's own `ChakraProvider`
with a system derived from Theme Kit's semantic tokens.

The provider owns the derived Chakra system: it subscribes to the runtime and
rebuilds the system whenever the active theme changes, so the wrapped subtree
always renders with the current theme selection.

**See also:** `useChakraTheme`

**Returns** `Element`

```ts
import { ChakraThemeProvider } from "@theme-kit/chakra";

<ChakraThemeProvider runtime={runtime}>
  <App />
</ChakraThemeProvider>
```

---


### `createChakraAdapter<T extends ThemeDefinition<string>>(_options): ChakraThemeAdapter<T>`
Runtime-owned Chakra UI adapter. On install it subscribes to the Theme Kit
store and rebuilds the Chakra system whenever the active theme changes. The
generated system is available through `getSnapshot` for React consumption.

**See also:** `createChakraAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `_options` | `CreateChakraAdapterOptions` | — |

**Returns** `ChakraThemeAdapter<T>`

---


### `createChakraTheme(source): SystemContext`
Creates a Chakra UI system from a Theme Kit source.

```ts
import { createChakraTheme } from "@theme-kit/chakra";
const system = createChakraTheme(runtime);
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `source` | `AdapterSource` | — |

**Returns** `SystemContext`

---


### `useChakraTheme<T extends ThemeDefinition<string>>(runtime): SystemContext`
Subscribes to a Theme Kit runtime and returns a Chakra UI system that is
rebuilt automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `SystemContext`

---

## Interfaces

### `ChakraAdapterOptions`
Options for the Chakra UI adapter.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Chakra UI's native feel. |

---


### `ChakraThemeAdapter<T extends ThemeDefinition>`

**Extends** `ThemeAdapter<T>`
A Chakra UI adapter that exposes its generated system synchronously via
`getSnapshot` / `subscribe`, so both the runtime-owned registry and React
(`useSyncExternalStore`) can consume it.

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `id` | `string` | Stable identifier used for reference counting and deduplication. |
| `getSnapshot` | `SystemContext \| null` | — |
| `install` | `void` | — |
| `subscribe` | `__type(): void` | — |
| `supports` | `boolean` | — |
| `uninstall` | `void` | — |

---


### `ChakraThemeProviderProps<T extends ThemeDefinition>`
Props for ChakraThemeProvider.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | The React subtree rendered inside Chakra's `ChakraProvider`. |
| `runtime` | `ThemeRuntime<T>` | The Theme Kit runtime whose active theme drives the Chakra system. |

---


### `CreateChakraAdapterOptions`

**Extends** `ChakraAdapterOptions`
Options for createChakraAdapter.

**See also:** `createChakraAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Chakra UI's native feel. |

---

## Variables

### `CHAKRA_ADAPTER_ID`
The adapter id registered by the Chakra UI adapter.

**See also:** `createChakraAdapter`

`"chakra"`

---


### `DEFAULT_CHAKRA_OPTIONS`
Defaults for ChakraAdapterOptions.

`Required<ChakraAdapterOptions>`

---

## Related docs

- [Chakra UI](/libraries/chakra) — the adapter integration
