## @theme-kit/daisyui/solid
Solid composable for the daisyUI adapter (`@theme-kit/daisyui/solid`).

`useDaisyTheme(runtime, options?)` installs the daisyUI adapter onto an
explicitly provided Theme Kit runtime and disposes it on cleanup.

> Generated from `packages/daisyui/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useDaisyTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Solid composable that installs the daisyUI adapter onto the given Theme Kit
runtime. Maintains a tagged `:root` style element with concrete `--color-*`
variables, kept in sync as the active theme changes.

Must be called within a Solid reactive root, passing the runtime from your
Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/solid`):

```tsx
import { useDaisyTheme } from "@theme-kit/daisyui/solid";

function App() {
  useDaisyTheme(runtime);
  return <YourApp />;
}
```

**See also:** ``createDaisyAdapter``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `UseAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `UseAdapterOptions`
Options accepted by the Solid adapter composables (e.g.
useDaisyTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use. When omitted, the adapter's default strategy applies. |

---

## Related docs

- [daisyUI](/libraries/daisyui) — the adapter integration
