# @theme-kit/astro

Islands-friendly theming for Astro with a shared global runtime and zero-flash bootstrap.

## Reference snippet

```astro
---
import { ThemeProviderClient } from "@theme-kit/astro";
import ThemeSwitcher from "../components/ThemeSwitcher.astro";
---

<ThemeProviderClient themes={themes} />

<ThemeSwitcher client:load />
```

## Provider

`ThemeProviderClient` island provider with the full hook set (`useTheme`, history, batch, snapshot, lifecycle, packs) and `ThemeScope`.

## Bootstrap & Sync

`createBlockingScript`, `buildThemeCssMap`, `darkModeCSSTemplate` — zero-flash bootstrap; `createAstroThemePersistence()` persistence adapter; `computeFingerprint()` cookie/config fingerprinting; `getGlobalRuntime()` / `setGlobalRuntime()` share one runtime across islands.
