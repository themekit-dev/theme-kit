## @theme-kit/bootstrap/factory
> Generated from `packages/bootstrap/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createBootstrapAdapter<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Creates a Bootstrap adapter.

The adapter is a DOM-only, framework-free adapter: it depends only on
`@theme-kit/core` and the DOM. On install it injects the Bootstrap
compatibility stylesheet (when enabled) and a `<style>` element of CSS
variables derived from the active theme, then subscribes to the runtime
store and rewrites the variables whenever the theme selection changes. It
does not render any component or require a React tree.

On uninstall it removes the injected styles and unsubscribes from the store.

**See also:** `useBootstrapTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `CreateBootstrapAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — A `ThemeAdapter` for Bootstrap.

```ts
import { createBootstrapAdapter } from "@theme-kit/bootstrap";

runtime.installAdapter(createBootstrapAdapter());
```

---

## Interfaces

### `BootstrapAdapterOptions`
Options for the Bootstrap adapter.

**See also:** `createBootstrapAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the Bootstrap compatibility stylesheet. Defaults to `true`. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Bootstrap's native feel. |

---


### `CreateBootstrapAdapterOptions`

**Extends** `BootstrapAdapterOptions`
Options for createBootstrapAdapter.

**See also:** `createBootstrapAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the Bootstrap compatibility stylesheet. Defaults to `true`. |
| `plugins` (optional) | `AdapterPlugin[]` | Adapter plugins that customize how the Bootstrap CSS variables are generated. Defaults to no plugins. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces Bootstrap's native feel. |

---

## Related docs

- [Bootstrap](/libraries/bootstrap) — the adapter integration
