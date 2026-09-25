## @theme-kit/shadcn/react
React hook for the shadcn/ui adapter (`@theme-kit/shadcn/react`).

`useShadcnTheme(runtime, options?)` installs the shadcn adapter onto an
explicitly provided Theme Kit runtime and disposes it on unmount.

> Generated from `packages/shadcn/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `useShadcnTheme<T extends ThemeDefinition<string>>(runtime, options?): void`
React hook that installs the shadcn adapter onto the given Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--*` variables in sync as the theme changes.

Call once in your app root, passing the runtime from your Theme Kit
provider (e.g. the `useThemeRuntime()` hook from `@theme-kit/react`):

```tsx
import { useShadcnTheme } from "@theme-kit/shadcn/react";

function App() {
  useShadcnTheme(runtime);
  return <YourApp />;
}
```

**See also:** `createShadcnAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to install the adapter on. |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | Adapter options. Defaults to `{}`. |

**Returns** `void`

---

## Related docs

- [shadcn/ui](/libraries/shadcn) — the adapter integration
