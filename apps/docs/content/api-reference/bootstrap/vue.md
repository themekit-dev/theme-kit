## @theme-kit/bootstrap/vue
Vue composable for the Bootstrap adapter (`@theme-kit/bootstrap/vue`).

`useBootstrapTheme(runtime, options?)` installs the Bootstrap adapter onto
an explicitly provided Theme Kit runtime and disposes it on unmount.

> Generated from `packages/bootstrap/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useBootstrapTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Vue composable that installs the Bootstrap adapter onto the given Theme Kit
runtime. Maintains a tagged `:root` style element with concrete `--bs-*`
variables (including `-rgb` triplets), kept in sync as the active theme
changes.

Must be called in a component's `setup` scope, passing the runtime from your
Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/vue`):

```ts
import { useBootstrapTheme } from "@theme-kit/bootstrap/vue";

useBootstrapTheme(runtime);
```

**See also:** ``createBootstrapAdapter``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `UseAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `UseAdapterOptions`
Options accepted by the adapter composables (e.g. useBootstrapTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use. When omitted, the adapter's default strategy applies. |

---

## Related docs

- [Bootstrap](/libraries/bootstrap) — the adapter integration
