## @theme-kit/daisyui/react
React hook for the daisyUI adapter (`@theme-kit/daisyui/react`).

`useDaisyTheme(runtime, options?)` installs the daisyUI adapter onto an
explicitly provided Theme Kit runtime and disposes it on unmount.

> Generated from `packages/daisyui/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useDaisyTheme<T extends ThemeDefinition<string>>(runtime, options?): void`
React hook that installs the daisyUI adapter onto the given Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--color-*` variables in sync as the theme changes.

Call once in your app root, passing the runtime from your Theme Kit
provider (e.g. the `useThemeRuntime()` hook from `@theme-kit/react`):

```tsx
import { useDaisyTheme } from "@theme-kit/daisyui/react";

function App() {
  useDaisyTheme(runtime);
  return <YourApp />;
}
```

**See also:** `createDaisyAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | Adapter options. Defaults to `{}`. |

**Returns** `void`

---

## Related docs

- [daisyUI](/libraries/daisyui) — the adapter integration
