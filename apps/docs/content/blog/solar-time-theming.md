---
title: "Theming by the clock: switch to dark mode at your local sunset"
date: 2026-07-14
description: "Use Theme Kit's scheduled option and NOAA solar math to switch light and dark modes based on actual sunrise and sunset for the user's coordinates."
tags: scheduling, solartimes, dark-mode
---

Hard-coded "dark mode starts at 8pm" ignores where your user lives. In summer a
Mumbai user's sunset is minutes away from a Helsinki user's sunrise. Theme Kit's
`calculateSunTimes` implements the standard NOAA solar calculation so your
theme follows the *actual* sun.

## Scheduled runtime option

Pass `scheduled` to the runtime and it computes today's sunrise/sunset, then
switches the theme at the right moment:

```ts
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  scheduled: {
    // Everything optional. lightTheme/darkTheme adapt to the currently
    // selected theme family (fallback: neutral light/dark), and each
    // visitor's timezone is detected for their local sunrise/sunset.
    // Optional overrides:
    // lightTheme: "mint-light", darkTheme: "mint-dark",
    // timeZone: "Asia/Kathmandu",           // pin a timezone
    // latitude: 51.5072, longitude: -0.1276 // …or exact coordinates
  },
});
```

No `latitude`/`longitude` means the location is resolved from the visitor's
IANA timezone (the tz database's reference city per zone) on the client, so a
Mumbai user gets Mumbai's sunrise/sunset and a Helsinki user gets
Helsinki's — the same `scheduled` block works for everyone, anywhere, with no
network call. No `lightTheme`/`darkTheme` means the schedule follows the
visitor's selected theme family (e.g. `plum-dark` → `plum-light`/`plum-dark`),
falling back to Theme Kit's neutral `light`/`dark` themes. The runtime
re-checks on an interval, so a visitor crossing time zones re-themes
correctly.

## Standalone utility

`calculateSunTimes(date, latitude?, longitude?)` returns `{ sunrise, sunset }`
as `Date`s — with no coordinates it auto-detects the visitor's timezone. It's
usable for any scheduling you want to build yourself, from theme switching to
"good morning" toasts:

```ts
import { calculateSunTimes } from "@theme-kit/core";

// Auto-detected from the visitor's timezone.
const { sunrise, sunset } = calculateSunTimes(new Date());

// …or pin a location.
const { sunrise: london, sunset: londonSet } = calculateSunTimes(
  new Date(),
  { timeZone: "Europe/London" },
);
const { sunrise: paris, sunset: parisSet } = calculateSunTimes(
  new Date(),
  48.8566, 2.3522,
);
```

## The Playground shows it live

Open `/playground` and pick any timezone in the world (or drag the
latitude/longitude sliders, or pick a city). The sun-path diagram redraws and
the suggested mode flips the live site theme as you cross a location's daylight
boundary — the demo and the library are the same code path.
