## @theme-kit/bootstrap/angular
Angular injection helper for the Bootstrap adapter
(`@theme-kit/bootstrap/angular`).

`injectBootstrapTheme(runtime, options?)` registers the Bootstrap adapter on
an explicitly provided Theme Kit runtime and unregisters it when the current
injection context is destroyed.

> Generated from `packages/bootstrap/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `injectBootstrapTheme<T extends ThemeDefinition<string>>(runtime, options): ThemeAdapter<T>`
Angular injectable that registers the Bootstrap adapter on the given Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--bs-*` variables (including `-rgb` triplets), kept in sync as the active
theme changes.

Call in your component (or root) constructor or field initializer — the
function uses `DestroyRef` to unregister the adapter, so it must run in an
injection context (the runtime usually comes from
`injectThemeRuntime()` in `@theme-kit/angular`):

```ts
import { injectBootstrapTheme } from "@theme-kit/bootstrap/angular";

export class AppComponent {
  adapter = injectBootstrapTheme(runtime);
}
```

**See also:** `injectShadcnTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The active Theme Kit runtime to register the adapter on. |
| `options` | `InjectAdapterOptions` | Adapter options. Defaults to `{}`. |

**Returns** `ThemeAdapter<T>` — The installed adapter instance.

---

## Interfaces

### `InjectAdapterOptions`
Options for the Angular adapter injection functions (for example
injectBootstrapTheme).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | The adapter strategy to use when registering the adapter. |

---

## Related docs

- [Bootstrap](/libraries/bootstrap) — the adapter integration
