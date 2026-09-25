## @theme-kit/shadcn/svelte
Svelte composable for the shadcn/ui adapter (`@theme-kit/shadcn/svelte`).

`useShadcnTheme(runtime, options?)` installs the shadcn adapter onto an
explicitly provided Theme Kit runtime and disposes it on unmount.

> Generated from `packages/shadcn/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useShadcnTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Svelte composable that installs the shadcn/ui adapter onto the given Theme
Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
variables, kept in sync as the active theme changes.

Must be called during component initialization, passing the runtime from
your Theme Kit provider (e.g. `getThemeRuntime()` from `@theme-kit/svelte`):

```ts
import { useShadcnTheme } from "@theme-kit/shadcn/svelte";

useShadcnTheme(runtime);
```

The adapter installs synchronously (guarded on `window`, so it is SSR-safe)
and is disposed via Svelte's effect tree.

**See also:** ``createShadcnAdapter``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `UseAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `UseAdapterOptions`
Options accepted by the Svelte adapter composables
(e.g. useShadcnTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use. When omitted, the adapter's default strategy applies. |

---

## Related docs

- [shadcn/ui](/libraries/shadcn) — the adapter integration
