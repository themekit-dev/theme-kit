## @theme-kit/daisyui/factory
> Generated from `packages/daisyui/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createDaisyAdapter<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Creates a daisyUI adapter.

The adapter is a DOM-only, framework-free adapter: it depends only on
`@theme-kit/core` and the DOM. On install it injects the daisyUI
compatibility stylesheet (when enabled) and a `<style>` element of CSS
variables derived from the active theme, then subscribes to the runtime
store and rewrites the variables whenever the theme selection changes. It
does not render any component or require a React tree.

On uninstall it removes the injected styles and unsubscribes from the store.

**See also:** `useDaisyTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `CreateDaisyAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — A `ThemeAdapter` for daisyUI.

```ts
import { createDaisyAdapter } from "@theme-kit/daisyui";

runtime.installAdapter(createDaisyAdapter());
```

---

## Interfaces

### `CreateDaisyAdapterOptions`

**Extends** `DaisyAdapterOptions`
Options for createDaisyAdapter.

**See also:** `createDaisyAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the daisyUI compatibility stylesheet. Defaults to `true`. |
| `plugins` (optional) | `AdapterPlugin[]` | Adapter plugins that customize how the daisyUI CSS variables are generated. Defaults to no plugins. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces daisyUI's native feel. |

---


### `DaisyAdapterOptions`
Options for the daisyUI adapter.

**See also:** `createDaisyAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the daisyUI compatibility stylesheet. Defaults to `true`. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces daisyUI's native feel. |

---

## Related docs

- [daisyUI](/libraries/daisyui) — the adapter integration
