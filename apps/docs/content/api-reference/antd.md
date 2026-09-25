## @theme-kit/antd
Theme Kit Ant Design adapter.

Bridges a Theme Kit runtime to Ant Design's theme: `AntdThemeProvider`,
`buildAntdConfig`, and the runtime adapter (`createAntdAdapter` /
`useAntdTheme`).

> Generated from `packages/antd/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `AntdThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<AntdThemeProvider runtime={runtime}>` — wraps Ant Design's own
`ConfigProvider` with a theme derived from Theme Kit's semantic tokens.

The provider owns the derived Ant Design theme: it subscribes to the runtime
and rebuilds the theme whenever the active theme changes, so the wrapped
subtree always renders with the current theme selection.

**See also:** `useAntdTheme`

**Returns** `Element`

```ts
import { AntdThemeProvider } from "@theme-kit/antd";

<AntdThemeProvider runtime={runtime}>
  <App />
</AntdThemeProvider>
```

---


### `buildAntdConfig(theme): ThemeConfig`
Builds an Ant Design `ThemeConfig` from a resolved Theme Kit theme.

Maps Theme Kit semantic tokens (colors, radius, typography) onto Ant Design's
design tokens and component overrides. The algorithm is Ant's default
algorithm; the palette follows the resolved theme mode.

**See also:** `AntdThemeProvider`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `AdapterResolvedTheme` | The resolved theme to map from. |

**Returns** `ThemeConfig` — An Ant Design `ThemeConfig` object.

---


### `createAntdAdapter<T extends ThemeDefinition<string>>(_options): AntdThemeAdapter<T>`
Runtime-owned Ant Design adapter. On install it subscribes to the Theme Kit
store and rebuilds the `ThemeConfig` whenever the active theme changes. The
generated config is available through `getSnapshot` for React consumption.

**See also:** `createAntdAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `_options` | `CreateAntdAdapterOptions` | — |

**Returns** `AntdThemeAdapter<T>`

---


### `createAntdTheme(source): ThemeConfig`
Maps Theme Kit semantic tokens onto an Ant Design theme config.

```ts
import { createAntdTheme } from "@theme-kit/antd";
const antdTheme = createAntdTheme(runtime);
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `source` | `AdapterSource` | — |

**Returns** `ThemeConfig`

---


### `useAntdTheme<T extends ThemeDefinition<string>>(runtime): ThemeConfig`
Subscribes to a Theme Kit runtime and returns an Ant Design theme config that
is rebuilt automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `ThemeConfig`

---

## Interfaces

### `AntdAdapterOptions`
Options for the Ant Design adapter.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Ant Design's native feel. |

---


### `AntdThemeAdapter<T extends ThemeDefinition>`

**Extends** `ThemeAdapter<T>`
An Ant Design adapter that exposes its generated theme config synchronously
via `getSnapshot` / `subscribe`, so both the runtime-owned registry and React
(`useSyncExternalStore`) can consume it.

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `id` | `string` | Stable identifier used for reference counting and deduplication. |
| `getSnapshot` | `ThemeConfig \| null` | — |
| `install` | `void` | — |
| `subscribe` | `__type(): void` | — |
| `supports` | `boolean` | — |
| `uninstall` | `void` | — |

---


### `AntdThemeProviderProps<T extends ThemeDefinition>`
Props for AntdThemeProvider.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | The React subtree rendered inside Ant Design's `ConfigProvider`. |
| `runtime` | `ThemeRuntime<T>` | The Theme Kit runtime whose active theme drives the Ant Design theme. |

---


### `CreateAntdAdapterOptions`

**Extends** `AntdAdapterOptions`
Options for createAntdAdapter.

**See also:** `createAntdAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Ant Design's native feel. |

---

## Variables

### `ANTD_ADAPTER_ID`
The adapter id registered by the Ant Design adapter.

**See also:** `createAntdAdapter`

`"antd"`

---


### `DEFAULT_ANTD_OPTIONS`
Defaults for AntdAdapterOptions.

`Required<AntdAdapterOptions>`

---

## Related docs

- [Ant Design](/libraries/antd) — the adapter integration
