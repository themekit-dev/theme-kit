---
title: "Scoped themes: isolate a subtree without leaving the runtime"
date: 2026-08-17
description: "Scope a theme to a single region — a video player, an embedded widget, a legacy component — with ThemeScope, the theme-kit-scope element, or an imperative binding."
tags: scoped, islands, advanced
---

Global theming is the common case, but some regions of a page need their own theme: a video player with a dark chrome on a light page, an embedded widget from another team, a code editor with a custom palette. Scoped themes give you that island without spinning up a second runtime.

## The scope primitive

Every framework exposes a `ThemeScope` that wraps a subtree and themes only it:

```tsx
import { ThemeScope } from "@theme-kit/react";

export function VideoPlayerPage() {
  return (
    <div>
      <h1>Watch</h1>

      {/* Dark chrome no matter what the page theme is */}
      <ThemeScope theme="plum-dark">
        <VideoPlayer />
        <Playlist />
      </ThemeScope>
    </div>
  );
}
```

Everything inside the scope resolves `plum-dark`; everything outside keeps following the page theme. The scope renders a boundary, applies scoped CSS variables inline, and cleans up when it unmounts.

## Scope by family and mode

You don't have to pin an exact theme — a scope can follow a family while staying in sync with the page's light/dark mode:

```tsx
<ThemeScope family="plum">
  {/* Plum-light in light mode, plum-dark in dark mode */}
  <BrandedWidget />
</ThemeScope>
```

Or you can pin `family` and `mode` together. The scoped selection is resolved against the same registry as the global one, so everything stays consistent.

## Imperative scoping for raw elements

When you don't control JSX — a video player, legacy DOM, or an element from another library — scope the element directly:

```ts
import { createScopedThemeBinding } from "@theme-kit/core";

const player = document.getElementById("player")!;

const binding = createScopedThemeBinding(themes, player, "plum-dark");

// Later: update the selection in place, or tear down
binding.update("mint-light");
binding.destroy();
```

Web Components get a declarative element instead:

```html
<theme-kit-scope theme="plum-dark">
  <p>Scoped to plum-dark</p>
</theme-kit-scope>
```

## Local themes for genuinely isolated islands

Sometimes a region needs themes that don't exist in the global registry — a component that ships its own palette. The `themes` prop layers local definitions on top:

```tsx
const compactTheme = defineTheme({
  name: "compact-light",
  meta: { family: "compact", mode: "light" },
  tokens: { /* ... */ },
});

<ThemeScope themes={[compactTheme]} theme="compact-light">
  <Toolbar />
</ThemeScope>
```

Local themes resolve first, then the provider's registry falls back — no second runtime is created. A late-loaded theme pack can update the scope in place via `setLocalThemes`.

## Nesting scopes

Scopes nest naturally: the inner scope wins within its boundary, and each scope inherits transitions from its parent scope or the provider.

```tsx
<ThemeScope theme="mint-light">
  <Dashboard />
  <ThemeScope theme="plum-dark">
    <CodeEditor />
  </ThemeScope>
</ThemeScope>
```

The page, the dashboard, and the editor can all show different themes at once — each with its own scope boundary, variables, and transition timing.

## When to use scopes

- **Embedded/legacy content** you can't restyle
- **Video players, maps, editors** that ship their own dark theme
- **Multi-tenant widgets** that should look like their tenant, not the host
- **Demo/showcase surfaces** that must stay on-brand regardless of the app theme

Scopes keep those islands isolated from the global theme — while still participating in the same runtime, transition engine, and persistence layer.