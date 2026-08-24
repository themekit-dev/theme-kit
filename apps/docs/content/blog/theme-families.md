---
title: "Beyond light and dark: theming with independent families and modes"
date: 2026-08-15
description: "Theme families let users switch colors independently from light/dark mode — giving you plum-light, plum-dark, mint-light, mint-dark, and every combination from a single API."
tags: families, modes, concepts
---

A single light/dark toggle is enough for many apps, but it breaks down when you need more than one palette. A corporate dashboard might offer "Plum" and "Mint" families — each with its own light and dark mode. With families, those modes are independent dimensions.

## The problem with one-dimensional toggles

A typical dark mode implementation stores a single boolean: `isDark`. Your app is either light or dark. But what if you want:

- A **Plum** palette (purple primary) with both light and dark modes
- A **Mint** palette (green primary) with its own light and dark
- A **High Contrast** family for accessibility

With a boolean toggle, every palette is a separate theme. You'd need `plum-light`, `plum-dark`, `mint-light`, `mint-dark` — and the user can't switch palette without switching mode.

## Families: two independent dials

Theme Kit separates the concept of **family** (the color palette) from **mode** (light/dark/system):

```ts
import { useTheme } from "@theme-kit/react";

function ThemePicker() {
  const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme();

  return (
    <div>
      <select value={family} onChange={(e) => setFamily(e.target.value)}>
        <option value="plum">Plum</option>
        <option value="mint">Mint</option>
        <option value="cocoa">Cocoa</option>
      </select>

      <button onClick={toggleTheme}>
        Switch to {mode === "light" ? "dark" : "light"}
      </button>

      <p>Active: {theme.name}</p>
    </div>
  );
}
```

The user picks a family (Plum → Mint) and a mode (light → dark) independently. The runtime resolves `family: "plum", mode: "dark"` to `plum-dark` automatically.

## How themes are organized

Themes in Theme Kit carry a `meta` field that declares their family and mode:

```ts
import { defineTheme } from "@theme-kit/core";

export const plumLight = defineTheme({
  name: "plum-light",
  meta: { family: "plum", mode: "light", label: "Plum Light" },
  tokens: { /* ... */ },
});

export const plumDark = defineTheme({
  name: "plum-dark",
  meta: { family: "plum", mode: "dark", label: "Plum Dark" },
  tokens: { /* ... */ },
});
```

The registry indexes themes by family and mode, so `resolveInitialTheme({ themes, family: "plum", mode: "system" })` resolves to the correct theme — and re-resolves when the user switches family or the OS preference changes.

## The nine built-in families

Theme Kit ships nine families out of the box — oat, berry, mint, citrus, cocoa, plum, iris, sky, and graphite — each with a light and dark mode. You can add your own by defining themes with the same `meta.family` and `meta.mode` structure.

## Families in the runtime

The runtime's `selection` controller manages both dimensions:

```ts
runtime.selection.setFamily("mint");  // switches the palette
runtime.selection.setMode("dark");    // switches the mode
runtime.selection.toggleTheme();      // light ↔ dark, same family

// Read the current state
const { family, mode } = runtime.selection.getSelection();
```

The theme resolves forward: `family + mode → theme name → theme definition`. This means every family/mode combination is valid, even if you haven't defined a theme for it — the runtime falls back to the family's default.

## Why families matter

- **User choice** — let users pick both personality (family) and comfort (mode)
- **Brand consistency** — every family carries its own on-brand colors, but the mode switch is independent
- **Accessibility** — a high-contrast family coexists with your main palette, and users can combine it with their preferred mode
- **SSR-safe** — both dimensions are persisted, bootstrapped, and restored across reloads with no extra effort