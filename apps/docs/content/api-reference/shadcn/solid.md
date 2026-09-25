## @theme-kit/shadcn/solid
Solid composable for the shadcn/ui adapter (`@theme-kit/shadcn/solid`).

`useShadcnTheme(runtime, options?)` installs the shadcn adapter onto an
explicitly provided Theme Kit runtime and disposes it on cleanup.

> Generated from `packages/shadcn/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useShadcnTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Solid composable that installs the shadcn/ui adapter onto the given Theme
Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
variables, kept in sync as the active theme changes.

Must be called within a Solid reactive root, passing the runtime from your
Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/solid`):

```tsx
import { useShadcnTheme } from "@theme-kit/shadcn/solid";

function App() {
  useShadcnTheme(runtime);
  return <YourApp />;
}
```

**See also:** ``createShadcnAdapter``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `UseAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `UseAdapterOptions`
Options accepted by the Solid adapter composables
(e.g. useShadcnTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use. When omitted, the adapter's default strategy applies. |

---

## Related docs

- [shadcn/ui](/libraries/shadcn) — the adapter integration
