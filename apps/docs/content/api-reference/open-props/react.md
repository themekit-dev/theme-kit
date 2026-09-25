## @theme-kit/open-props/react
React hook for the Open Props adapter (`@theme-kit/open-props/react`).

`useOpenPropsTheme(runtime, options?)` installs the Open Props adapter onto
an explicitly provided Theme Kit runtime and disposes it on unmount.

> Generated from `packages/open-props/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useOpenPropsTheme<T extends ThemeDefinition<string>>(runtime, options?): void`
React hook that installs the Open Props adapter onto the given Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--color-*` / `--brand` / `--size-*` / `--shadow-*` variables in
sync as the theme changes.

Call once in your app root, passing the runtime from your Theme Kit
provider (e.g. the `useThemeRuntime()` hook from `@theme-kit/react`):

```tsx
import { useOpenPropsTheme } from "@theme-kit/open-props/react";

function App() {
  useOpenPropsTheme(runtime);
  return <YourApp />;
}
```

**See also:** `createOpenPropsAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | Adapter options. Defaults to `{}`. |

**Returns** `void`

---

## Related docs

- [Open Props](/libraries/open-props) — the adapter integration
