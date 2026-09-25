## @theme-kit/remix/server
> Generated from `packages/remix/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `getInitialThemeState<T extends ThemeDefinition<string>>(request, options): Promise<InitialThemeResolution<T>>`
Resolves the initial theme state server-side from the request's theme
cookies, so the browser paints already themed (zero-flash). Pair with
`ThemeProvider` (pass the result as `initial`) and `ThemeHead` in the
document `<head>`.

**See also:** `ThemeProvider`, `ThemeHead`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `request` | `Request` | — |
| `options` | `ResolveInitialThemeOptions<T>` | — |

**Returns** `Promise<InitialThemeResolution<T>>`

---

## Related docs

- [Remix](/framework-guides/remix) — the framework integration
