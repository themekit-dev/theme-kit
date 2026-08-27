# Animation & Transition

Theme Kit provides a first-class transition system that animates every CSS property when themes change. Use the animations plugin for zero-config CSS transitions, or the View Transitions API for page-level animations.

> **Transitions are enabled by default.** The runtime ships with
> `DEFAULT_THEME_TRANSITION` — `enabled: true`, `300ms`,
> `cubic-bezier(0.4, 0, 0.2, 1)`, `preset: "smooth"`. You only need to pass a
> `transition` prop when you want to **change** the defaults. To turn them off
> entirely, pass `transition={{ enabled: false }}` (or `transition={false}` in
> React/Vue/Svelte/Solid).

## Quick start

```ts
import { createThemeRuntime, createAnimationsPlugin } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  plugins: [
    createAnimationsPlugin({
      transition: { enabled: true, duration: 300, easing: "ease-in-out" },
    }),
  ],
});
```

## Page-level transitions

To make theme changes visible across the whole page, paint the page background
with the theme's background token. The runtime animates the `--theme-color-*`
custom properties on `<html>`, so any element that reads them transitions
automatically:

```css
html,
body {
  margin: 0;
  min-height: 100vh;
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
}
```

Add this to your global CSS (`index.css`, `App.css`, `globals.css`, …) once, and
every light↔dark switch cross-fades the entire page.

## Transition options

Every property in `ThemeTransitionOptions` is fully typed and configurable.

| Property | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Whether transitions are active |
| `duration` | `number` | `300` | Duration in milliseconds |
| `easing` | `string` | `"cubic-bezier(0.4, 0, 0.2, 1)"` | CSS easing function |
| `preset` | `"smooth" \| "subtle" \| "instant" \| string[]` | `"smooth"` | Property filter — see below |
| `useViewTransition` | `boolean` | `true` | Use the View Transitions API (falls back to CSS-property interpolation when unsupported or on reduced-motion) |
| `properties` | `string[]` | [see below](#default-properties) | CSS properties to animate |

## Choosing what animates — `preset` vs `properties`

Transitions run on the properties that actually changed between the old and new
theme. Two fields control which of those changed properties are allowed to
animate:

- **`preset`** — a named, curated list. `"smooth"` (default) covers colors +
  radius + shadows + opacity; `"subtle"` is a quieter color-only set;
  `"instant"` disables interpolation.
- **`properties`** — an exact `string[]` of CSS properties to allow, e.g.
  `["color", "background-color"]`. When provided, **only** those properties
  animate (a filter on the changed set, not a full list of everything to
  animate).

```tsx
// React / Next / Svelte / Solid / Remix / Astro
<ThemeProvider
  themes={themes}
  transition={{
    enabled: true,
    // Animate only text and background colors — radius/shadow/opacity snap.
    properties: ["color", "background-color"],
  }}
>
  <App />
</ThemeProvider>
```

```vue
<!-- Vue / Nuxt -->
<ThemeProvider :transition="{ enabled: true, properties: ['color', 'background-color'] }">
  <App />
</ThemeProvider>
```

```ts
// Angular — provideThemeKit options
provideThemeKit({
  themes,
  transition: { enabled: true, properties: ["color", "background-color"] },
});
```

```ts
// Vanilla runtime
createThemeRuntime({
  themes,
  transition: { enabled: true, properties: ["color", "background-color"] },
});
```

### Which properties can you pass?

Any CSS property that participates in the diff is animatable. The grouped token
categories map to these concrete properties:

| Token group | CSS properties |
|---|---|
| **colors** | `color`, `background`, `background-color`, `border-color`, `outline-color`, `fill`, `stroke`, `text-decoration-color` |
| **radius** | `border-radius` |
| **spacing** | `padding`, `padding-*`, `margin`, `margin-*`, `gap`, `inset`, `inset-*`, `top/right/bottom/left` |
| **typography** | `font-size`, `font-weight`, `line-height`, `letter-spacing` |
| **shadows** | `box-shadow`, `text-shadow` |
| **borders** | `border-width`, `border-style` |
| **transforms** | `transform`, `scale`, `rotate`, `translate` |
| **opacity** | `opacity` |

Use the preset names for common combinations, or pass a raw array:

```tsx
transition={{ enabled: true, properties: ["color", "background-color", "border-radius", "box-shadow"] }}
```

### Presets

| Preset | Properties allowed to animate | When to use |
|---|---|---|
| `"smooth"` | color, background(-color), border-color, outline-color, fill, stroke, border-radius, box-shadow, text-shadow, opacity | Default — full, rich cross-fade |
| `"subtle"` | color, background(-color), border-color, outline-color, fill, stroke, background, box-shadow, opacity | Lower-motion profile |
| `"instant"` | opacity only (interpolation disabled) | Hard, instant switch |
| `string[]` | exactly the properties you list | Fine-grained control |

## Default properties

When no `preset` or `properties` is given, the `"smooth"` preset list is used
(see above). Everything that changed and is in that list animates.

## Animations plugin

The `createAnimationsPlugin` function creates a plugin that applies CSS transitions automatically before each theme change and removes them on destroy.

```ts
import { createAnimationsPlugin } from "@theme-kit/core";

const plugin = createAnimationsPlugin({
  transition: {
    enabled: true,
    duration: 300,
    easing: "ease-in-out",
    properties: ["color", "background-color", "border-color"],
  },
  element: document.documentElement,
});
```

### Plugin hooks

- **`onBeforeThemeChange`** — Applies the transition CSS to the target element.
- **`onAfterThemeChange`** — No-op (transition cleanup is handled by the browser).
- **`onDestroy`** — Removes the transition CSS from the target element.

## Disabling transitions

Transitions are **on by default**. To disable them app-wide:

```tsx
<ThemeProvider themes={themes} transition={{ enabled: false }}>
  <App />
</ThemeProvider>
```

For a single switch, pass `suppressTransition` to the store set:

```ts
runtime.store.set(theme, { suppressTransition: true });
```

## View Transitions API

`useViewTransition` is enabled by default. When the browser supports
`document.startViewTransition()`, a theme change captures a snapshot of the old
page and cross-fades to the new one — a light↔dark switch never washes through
bright intermediate colors. It falls back to CSS-property interpolation when the
API is unavailable or the user prefers reduced motion.

To opt out (back to the CSS-property interpolation) or tune the crossfade:

```ts
const runtime = createThemeRuntime({
  themes,
  transition: {
    enabled: true,
    useViewTransition: false,
    duration: 400,
    easing: "ease",
  },
});
```

This uses the browser's `document.startViewTransition()` API for smooth page-level animations.

## Runtime token updates

You can also update tokens at runtime and they will transition smoothly:

```ts
import { useThemeRuntime } from "@theme-kit/react";

function LiveEditor() {
  const runtime = useThemeRuntime();

  function softenCorners() {
    runtime.update({
      radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px" },
    });
  }

  return <button onClick={softenCorners}>Soften all corners</button>;
}
```

## Generated CSS variables

Every token becomes a CSS custom property with automatic transition support:

```css
:root {
  --theme-color-background: #f8fafc;
  --theme-color-foreground: #0f172a;
  --theme-color-primary: #576A8F;
  --theme-color-primary-foreground: #ffffff;
  --theme-radius-sm: 4px;
  --theme-radius-md: 8px;
  --theme-radius-lg: 12px;
  --theme-radius-xl: 16px;
}
```

When the animations plugin is active, transitions are applied automatically to all configured properties.