# Animation & Transition

Theme Kit provides a first-class transition system that animates every CSS property when themes change. Use the animations plugin for zero-config CSS transitions, or the View Transitions API for page-level animations.

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

## Transition options

Every property in `ThemeTransitionOptions` is fully typed and configurable.

| Property | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Whether transitions are active |
| `duration` | `number` | `200` | Duration in milliseconds |
| `easing` | `string` | `"ease"` | CSS easing function |
| `useViewTransition` | `boolean` | `false` | Use the View Transitions API |
| `properties` | `string[]` | [see below](#default-properties) | CSS properties to animate |

## Default properties

The following CSS properties are animated by default when a theme changes:

- `color`, `background-color`, `border-color`, `outline-color`
- `fill`, `stroke`
- `border-radius`, `width`, `min-width`, `max-width`
- `height`, `min-height`, `max-height`
- `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`
- `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`
- `gap`, `inset`, `inset-block`, `inset-inline`
- `top`, `right`, `bottom`, `left`
- `font-size`, `font-weight`, `font-family`, `line-height`, `letter-spacing`
- `box-shadow`, `text-shadow`
- `opacity`, `z-index`

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

## View Transitions API

For page-level transitions, set `useViewTransition: true`:

```ts
const runtime = createThemeRuntime({
  themes,
  transition: {
    enabled: true,
    useViewTransition: true,
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