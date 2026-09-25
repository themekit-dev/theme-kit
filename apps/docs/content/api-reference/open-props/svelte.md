## @theme-kit/open-props/svelte
Svelte composable for the Open Props adapter (`@theme-kit/open-props/svelte`).

`useOpenPropsTheme(runtime, options?)` installs the Open Props adapter onto
an explicitly provided Theme Kit runtime and disposes it on unmount.

> Generated from `packages/open-props/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useOpenPropsTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Svelte composable that installs the Open Props adapter onto the given Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--brand`, `--link`, `--size-*` and related variables, kept in sync as the
active theme changes.

Must be called during component initialization, passing the runtime from
your Theme Kit provider (e.g. `getThemeRuntime()` from `@theme-kit/svelte`):

```ts
import { useOpenPropsTheme } from "@theme-kit/open-props/svelte";

useOpenPropsTheme(runtime);
```

The adapter installs synchronously (guarded on `window`, so it is SSR-safe)
and is disposed via Svelte's effect tree.

**See also:** ``createOpenPropsAdapter``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `UseAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `UseAdapterOptions`
Options accepted by the Svelte adapter composables (e.g.
useOpenPropsTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use. When omitted, the adapter's default strategy applies. |

---

## Related docs

- [Open Props](/libraries/open-props) — the adapter integration
