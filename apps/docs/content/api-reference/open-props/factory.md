## @theme-kit/open-props/factory
> Generated from `packages/open-props/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createOpenPropsAdapter<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Creates an Open Props adapter.

The adapter is a DOM-only, framework-free adapter: it depends only on
`@theme-kit/core` and the DOM. On install it injects the Open Props
compatibility stylesheet (when enabled) and a `<style>` element of CSS
variables derived from the active theme, then subscribes to the runtime
store and rewrites the variables whenever the theme selection changes. It
does not render any component or require a React tree.

On uninstall it removes the injected styles and unsubscribes from the store.

**See also:** `useOpenPropsTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `CreateOpenPropsAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — A `ThemeAdapter` for Open Props.

```ts
import { createOpenPropsAdapter } from "@theme-kit/open-props";

runtime.installAdapter(createOpenPropsAdapter());
```

---

## Interfaces

### `CreateOpenPropsAdapterOptions`

**Extends** `OpenPropsAdapterOptions`
Options for createOpenPropsAdapter.

**See also:** `createOpenPropsAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the Open Props compatibility stylesheet. Defaults to `true`. |
| `plugins` (optional) | `AdapterPlugin[]` | Adapter plugins that customize how the Open Props CSS variables are generated. Defaults to no plugins. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Open Props' native feel. |

---


### `OpenPropsAdapterOptions`
Options for the Open Props adapter.

**See also:** `createOpenPropsAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the Open Props compatibility stylesheet. Defaults to `true`. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Open Props' native feel. |

---

## Related docs

- [Open Props](/libraries/open-props) — the adapter integration
