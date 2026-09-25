## @theme-kit/tailwind
Theme Kit Tailwind CSS integration.

Provides `createTailwindPlugin` (emits the theme as CSS variables usable
by Tailwind utilities), `synchronizeDarkClass` (keeps Tailwind's
`dark` variant in sync with the runtime), and the `themeCSS` helper.

> Generated from `packages/tailwind/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createTailwindPlugin(options?): { name: string }`
Creates a Tailwind plugin for Theme Kit.

The plugin registers Theme Kit with Tailwind so that theme tokens can be
consumed as Tailwind utilities. It is configured with the theme definitions
and an optional default theme.

**See also:** `synchronizeDarkClass`, `themeCSS`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `TailwindPluginOptions` (optional) | The theme definitions and default theme. |

**Returns** `{ name: string }` — A Tailwind plugin object.

```ts
import { createTailwindPlugin } from "@theme-kit/tailwind";
import { getBuiltInThemes } from "@theme-kit/core";

export default {
  plugins: [
    createTailwindPlugin({
      themes: getBuiltInThemes(),
      defaultTheme: "light",
    }),
  ],
};
```

---


### `synchronizeDarkClass(theme): void`
Synchronizes the `dark` class on the document root with the given theme's
mode.

Adds the `dark` class when the theme's mode is `"dark"` and removes it
otherwise. No-op when `document` is unavailable (for example during SSR).

**See also:** `createTailwindPlugin`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `{ meta?: { mode?: string } }` | The theme whose mode determines the `dark` class. |

**Returns** `void`

---

## Interfaces

### `TailwindPluginOptions`
Options for createTailwindPlugin.

**See also:** `createTailwindPlugin`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `string` | The name of the default theme. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | The theme definitions the plugin is configured with. |

---

## Variables

### `themeCSS`
A CSS string containing the Theme Kit Tailwind theme CSS.

Points to the generated theme CSS file (`./theme.css`) that defines the
theme tokens as CSS variables for use with Tailwind.

**See also:** `createTailwindPlugin`

`"/* Theme CSS is available at ./theme.css */"`

---

## Related docs

- [Tailwind CSS](/framework-guides/tailwind) — the adapter integration
