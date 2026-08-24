---
title: "Accessibility-first theming: contrast checks and CVD simulation"
date: 2026-07-07
description: "How Theme Kit's accessibility toolkit keeps themes readable — WCAG contrast ratios, full-theme audits and color-vision-deficiency simulation — all at runtime."
tags: accessibility, wcag, contrast, cvd
---

A gorgeous palette that fails WCAG contrast is a bug, not a design choice. Theme
Kit ships a runtime accessibility toolkit so you can catch contrast failures and
color-vision problems *before* your users do.

## Contrast ratios, live

`getContrastRatio(foreground, background)` returns the WCAG 2.x ratio, and
`checkContrastPair` annotates it with AA/AAA conformance and a pass/fail verdict:

```ts
import { getContrastRatio, checkContrastPair } from "@theme-kit/core";

getContrastRatio("#111111", "#ffffff"); // → 19.56
checkContrastPair("#777777", "#ffffff");
// → { foreground: "#777777", background: "#ffffff", ratio: 4.54,
//     passesAANormal: false, passesAALarge: true,
//     passesAAANormal: false, passesAAALarge: false }
```

## Auditing a whole theme

`validateThemeContrast` walks every semantic token pair — text-on-surface,
text-on-primary, borders, and more — and returns a structured report of
failures:

```ts
import { validateThemeContrast } from "@theme-kit/core";

const result = validateThemeContrast(theme, { themes: [theme] });
// { valid: false, checks: [{ foregroundToken, backgroundToken,
//   foreground, background, ratio, passesAANormal, passesAALarge,
//   passesAAANormal, passesAAALarge }] }
```

## Color-vision deficiency simulation

`simulateCVD(color, type)` converts a color as seen with protanopia,
deuteranopia or tritanopia, and `simulateThemeForCVD` does the same for an
entire theme. Combined with the runtime, you can preview *exactly* what a user
with CVD sees:

```ts
import { simulateThemeForCVD, getCVDLabel } from "@theme-kit/core";

const deuteranopic = simulateThemeForCVD(theme, "deuteranopia");
```

## Built-in accessibility profiles

For teams that need guaranteed contrast, Theme Kit ships `getAccessibilityProfiles`
with **High Contrast** and **Large Text** presets — drop them in as theme packs
and let users opt in.

Every feature above is demonstrated live on `/accessibility`, where you can
check any two colors, audit the current theme, and apply a CVD-simulated theme
to this very site.
