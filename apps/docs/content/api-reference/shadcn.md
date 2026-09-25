## @theme-kit/shadcn
Theme Kit shadcn/ui adapter — framework-neutral entry.

Exports the React-free `createShadcnAdapter` factory (also available from
`@theme-kit/shadcn/factory`), the `createShadcnVariables` generator, and the
`injectShadcnCSS` helper. Framework wrappers live on their own subpaths:
`useShadcnTheme(runtime)` on `@theme-kit/shadcn/react`, and equivalent
composables/injectables on `/vue`, `/svelte`, `/solid`, and `/angular`.

> Generated from `packages/shadcn/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createShadcnAdapter<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Creates a shadcn/ui adapter.

The adapter is a DOM-only, framework-free adapter: it depends only on
`@theme-kit/core` and the DOM. On install it injects the shadcn/ui
compatibility stylesheet (when enabled) and a `<style>` element of CSS
variables derived from the active theme, then subscribes to the runtime
store and rewrites the variables whenever the theme selection changes. It
does not render any component or require a React tree.

On uninstall it removes the injected styles and unsubscribes from the store.

**See also:** `useShadcnTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `CreateShadcnAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — A `ThemeAdapter` for shadcn/ui.

```ts
import { createShadcnAdapter } from "@theme-kit/shadcn";

runtime.installAdapter(createShadcnAdapter());
```

---


### `createShadcnVariables(tokens): Record<string, string>`
Programmatic alternative to `shadcn.css`. Returns concrete shadcn/ui CSS
variable values for a given set of Theme Kit tokens.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens` | — |

**Returns** `Record<string, string>`

---


### `injectShadcnCSS(): void`
Injects the shadcn/ui compatibility CSS (idempotent, SSR-safe). Called
automatically the first time `useShadcnTheme` installs an adapter.

**Returns** `void`

---

## Interfaces

### `CreateShadcnAdapterOptions`

**Extends** `ShadcnAdapterOptions`
Options for createShadcnAdapter.

**See also:** `createShadcnAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the shadcn/ui compatibility stylesheet. Defaults to `true`. |
| `plugins` (optional) | `AdapterPlugin[]` | Adapter plugins that customize how the shadcn/ui CSS variables are generated. Defaults to no plugins. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces shadcn/ui's native feel. |

---


### `ShadcnAdapterOptions`
Options for the shadcn/ui adapter.

**See also:** `createShadcnAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `injectCSS` (optional) | `boolean` | Whether to inject the shadcn/ui compatibility stylesheet. Defaults to `true`. |
| `strategy` (optional) | `AdapterStrategy` | How faithfully the adapter reproduces shadcn/ui's native feel. |

---

## Related docs

- [shadcn/ui](/libraries/shadcn) — the adapter integration
