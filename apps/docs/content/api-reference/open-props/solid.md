## @theme-kit/open-props/solid
Solid composable for the Open Props adapter (`@theme-kit/open-props/solid`).

`useOpenPropsTheme(runtime, options?)` installs the Open Props adapter onto
an explicitly provided Theme Kit runtime and disposes it on cleanup.

> Generated from `packages/open-props/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useOpenPropsTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Solid composable that installs the Open Props adapter onto the given Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--brand`, `--link`, `--size-*` and related variables, kept in sync as the
active theme changes.

Must be called within a Solid reactive root, passing the runtime from your
Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/solid`):

```tsx
import { useOpenPropsTheme } from "@theme-kit/open-props/solid";

function App() {
  useOpenPropsTheme(runtime);
  return <YourApp />;
}
```

**See also:** ``createOpenPropsAdapter``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `UseAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `UseAdapterOptions`
Options accepted by the Solid adapter composables (e.g.
useOpenPropsTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use. When omitted, the adapter's default strategy applies. |

---

## Related docs

- [Open Props](/libraries/open-props) — the adapter integration
