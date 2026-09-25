## @theme-kit/adapters/react
> Generated from `packages/adapters/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useCSSVariables(runtime, options?): void`
Sets up a CSS variables binding that keeps `--theme-*` custom properties
in sync with the active Theme Kit theme. Call this in a client component
(e.g. at the app root) to enable CSS-based adapters like shadcn, daisyUI,
Bootstrap, and Open Props.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<any>` | — |
| `options` | `{ prefix?: string }` (optional) | — |

**Returns** `void`

---


### `useRuntimeThemeFactory<T extends ThemeDefinition<string>, R>(runtime, factory): R`
Subscribes to a Theme Kit runtime and re-runs `factory` whenever the active
theme changes, returning the latest derived value (e.g. a MUI / Mantine /
Chakra / Ant Design theme object). The factory must be referentially stable
or wrapped in `useCallback` to avoid recomputing on every render.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |
| `factory` | `__type(theme: T): R` | — |

**Returns** `R`

---

## Related docs

- [Adapters](/adapters) — the adapter integration
