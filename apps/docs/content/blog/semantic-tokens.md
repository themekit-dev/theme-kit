---
title: "Semantic tokens: why you theme meanings, not components"
date: 2026-08-16
description: "Theme Kit themes semantic tokens — background, foreground, primary, muted — instead of component classes. Here's why that scales to every framework and every component library."
tags: tokens, design-systems, concepts
---

Component-based theming asks "what color is a button?" and then writes `.button { background: #6366f1 }`. That works until you have three button variants, a dark mode, and a second component library to theme. Semantic tokens flip the question: theme *meanings*, and let every component resolve its own look from them.

## Tokens, not hex values

Instead of hard-coding colors into components, you define a small set of semantic meanings:

```ts
import { defineTheme } from "@theme-kit/core";

export const lightTheme = defineTheme({
  name: "app-light",
  meta: { family: "app", mode: "light" },
  tokens: {
    colors: {
      background: "#fafafa",
      foreground: "#18181b",
      card: "#ffffff",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      success: "#16a34a",
      successForeground: "#ffffff",
      border: "#e4e4e7",
      ring: "#6366f1",
    },
    radius: { lg: "12px" },
  },
});
```

Components consume the meaning — `primary`, `muted`, `border` — never a literal color. When the theme changes, every consumer updates together.

## The cascade: tokens → CSS variables → components

At runtime Theme Kit flattens tokens into CSS custom properties:

```
--theme-color-background: #fafafa;
--theme-color-primary: #6366f1;
--theme-color-mutedForeground: #71717a;
--theme-radius-lg: 12px;
```

Your components reference the variables (or the framework hook), so the whole tree re-themes in one DOM update:

```tsx
import { useThemeTokens } from "@theme-kit/react";

function Card() {
  const tokens = useThemeTokens();
  return (
    <div
      style={{
        background: tokens.colors?.card,
        borderColor: tokens.colors?.border,
      }}
    >
      {children}
    </div>
  );
}
```

## Why meanings scale

- **One theme, many surfaces** — `primary` means "the main action color" everywhere: buttons, links, focus rings, active states.
- **Dark mode for free** — swap the token set, not the components. A component written against tokens renders correctly in both modes with zero changes.
- **Framework-agnostic** — the same tokens feed React, Vue, Svelte, Angular, Web Components, and CSS-only Tailwind projects. The runtime is the shared contract.
- **Component-library adapters** — Theme Kit can map tokens into MUI, Chakra, Ant Design, shadcn/ui, Bootstrap, and more, because those libraries already accept token-ish inputs.

## Extending tokens safely

Tokens are plain objects, so they compose:

```ts
import { extendTheme } from "@theme-kit/core";

// Add a brand family without touching the base
export const brandLight = extendTheme("app-light", {
  meta: { family: "brand", mode: "light" },
  colors: {
    primary: "#0ea5e9",   // override just what you need
  },
});
```

`extendTheme` merges deeply — nested `colors`, `radius`, `shadows`, and the `code` block all inherit unless overridden. You can layer a family, a mode, or a brand on top of a base theme.

## Semantic tokens and accessibility

Because contrast pairs are *semantic* (`foreground` on `background`, `primary` on `primaryForeground`), Theme Kit can audit them:

```ts
import { validateThemeContrast } from "@theme-kit/core";

const result = validateThemeContrast(theme, { themes });
// { valid, checks: [{ foregroundToken, backgroundToken, ratio, passesAALarge, … }] }
```

A component that consumes `foreground` on `background` is automatically checked — no manual mapping from "component X uses color Y" required.

The whole docs site you're reading runs on this: every card, button, and code block reads from the live theme's tokens. That's the semantic-token payoff — theming that stays honest at scale.