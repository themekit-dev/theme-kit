## Theme

A **theme** is a named set of semantic tokens plus metadata. Themes are plain, serializable objects — no classes, no magic.

```ts
interface ThemeDefinition {
  name: string;                // e.g. "plum-dark"
  extends?: string | string[]; // inherit from another theme
  meta?: ThemeMeta;            // label, family, mode, order, tags, version...
  tokens?: ThemeTokens;        // colors, spacing, radius, shadows, ...
}
```

A concrete theme looks like this:

```ts
import { defineTheme } from "@theme-kit/core";

const plumDark = defineTheme({
  name: "plum-dark",
  meta: {
    family: "plum",
    mode: "dark",
    label: "Plum Dark",
    order: 20,
    tags: ["preset"],
  },
  tokens: {
    colors: {
      background: "#171123",
      foreground: "#f6f1fb",
      primary: "#a78bfa",
      card: "#221a33",
      border: "#3b2d55",
      // ... every semantic role
    },
    radius: { lg: "14px" },
  },
});
```

`meta` also carries `created` and `updated` timestamps (added automatically when a theme is registered), plus `version` for migrations.

## Token Groups

Tokens are grouped by **semantic meaning**, not raw values:

- `colors` — nested, recursively-addressable: `colors.surface.default`, `colors.primary`, `colors.accent.hover`
- `spacing`, `radius`, `shadows`, `borderWidths`, `zIndex`, `breakpoints`
- `typography` — `fontFamilies`, `fontSizes`, `lineHeights`

Because tokens are plain nested objects, you can address any leaf by its path — `theme.tokens.colors.primary` — and merge partial overrides safely.

## Mode & Family

- **Mode** — `"light" | "dark" | "system"`. `system` follows the OS with `prefers-color-scheme`.
- **Family** — a named set of themes (e.g. `"plum"`, `"mint"`, `"apple"`). Switching family changes the palette; switching mode changes light/dark within that family.

```ts
runtime.selection.setFamily("plum");  // plum light/dark pair
runtime.selection.setMode("dark");    // whichever plum is active, use dark
runtime.selection.toggleTheme();      // flip between light and dark
```

The active theme is always resolved from **family + mode** — the library picks the matching theme in the registry.

## Semantic Token Groups

Nested tokens produce **recursive groups** that render as CSS variables:

```
--theme-color-surface-default
--theme-color-surface-hover
--theme-radius-lg
--theme-spacing-4
```

Every token maps to a `--theme-*` variable automatically via `themeToCSSVariables`:

```ts
import { themeToCSSVariables } from "@theme-kit/core";

const vars = themeToCSSVariables(plumDark, { prefix: "theme-" });
// { "--theme-color-background": "#171123", "--theme-radius-lg": "14px", ... }
```

## The Theme Store

A minimal reactive store that holds the active theme.

```ts
import { createThemeStore } from "@theme-kit/core";

const store = createThemeStore({ initialTheme: myTheme });

store.get();                                        // current theme
store.set(nextTheme);                               // apply
store.subscribe((theme) => render(theme));          // react to changes
store.batch(() => { store.set(a); store.set(b); }); // coalesce writes
store.destroy();
```

## Model Builders

Type-safe, zero-cost helpers for composing themes:

```ts
import {
  defineTheme,
  extendTheme,
  composeTheme,
  mergeThemeDefinitions,
  mergeTokens,
  resolveTheme,
} from "@theme-kit/core";

const base = defineTheme({ name: "base", tokens: { ... } });

// Inherit from a base theme and override pieces
const plum = extendTheme("plum", base, {
  meta: { family: "plum" },
  tokens: { colors: { primary: "#a78bfa" } },
});

// Merge several definitions into one
const full = composeTheme("full", base, plum, { tokens: { radius: { lg: "12px" } } });

// Low-level merges
const mergedTokens = mergeTokens(a.tokens, b.tokens);
const mergedTheme = mergeThemeDefinitions(a, b);

// Resolve a definition, following `extends` chains
const resolved = resolveTheme([base, plum], "plum");
```

## Theme Registry

Every registered theme lives in a registry — the engine behind dynamic theming, family lookups, and theme packs.

```ts
import { createThemeRegistry } from "@theme-kit/core";

const registry = createThemeRegistry({ themes });

registry.register(theme);
registry.registerMany([a, b]);
registry.unregister("plum-dark");
registry.replace("plum-dark", newDark);
registry.get("plum-light");
registry.has("plum-light");
registry.list();

registry.getFamilies();                 // ["default", "oat", "plum", ...]
registry.getThemesByFamily("plum");     // plum light + dark

registry.use({ name: "brand", themes }); // install a theme pack
```

A **theme pack** is a named bundle of themes; every theme it installs is stamped with a `pack:<name>` tag in its meta.

## The Theme Runtime

`createThemeRuntime` wires everything together — store, registry, selection, persistence, broadcast, DOM bindings, history, lifecycle, and plugins — into one object.

```ts
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  transition: { enabled: true, duration: 300 },
  plugins: [createPersistencePlugin(), createHistoryPlugin()],
});
```

Every capability is documented with snippets in the **Architecture** section. Key surfaces: `store`, `registry`, `selection`, `themes`, `update`, `use`, `batch`, `snapshot`/`restore`, `history`, `lifecycle`, `destroy`.

## Token Resolution

Tokens support **references and derived values**, resolved lazily at runtime:

- **References** — `"$colors.primary"` or `"{colors.primary}"` point to another token (with circular-reference detection).

```ts
{
  tokens: {
    colors: { primary: "#6366f1", ring: "$colors.primary" },
  },
}
```

- **Expressions** — numeric math such as `"calc(100% + 2rem)"`-style evaluations:

```ts
spacing: { "12": "calc(3rem + 0.75rem)" }
```

- **Derived colors** — `"contrast(#123456)"` returns black/white by WCAG luminance; `"auto()"` derives a foreground from a base token:

```ts
colors: {
  primary: "#6366f1",
  primaryForeground: "auto()", // readable on primary
}
```

Utilities: `flattenTokens`, `resolveFlatTokens`, `resolveTokens`, `hasTokenReferences`, `resolveValueReferences`, `evaluateExpression`.

## Theme Generation

Generate a complete light + dark theme pair from a single seed color, deriving secondary, muted, accent, border, and ring colors with HSL math.

```ts
import { generateTheme } from "@theme-kit/core";

const { light, dark } = generateTheme({ seed: "#6366f1", family: "indigo" });
```

## Theme Validation

Validate that a theme defines all required semantic color tokens, resolving `extends` chains when a theme list is provided.

```ts
import { validateTheme } from "@theme-kit/core";

const result = validateTheme(theme, { themes });
// { valid: boolean, issues: [{ type: "missing", path, message }] }
```

## Theme Migration

Version themes with a migration chain. Old theme files automatically upgrade to the latest format.

```ts
import { migrateTheme, registerMigration } from "@theme-kit/core";

registerMigration({
  from: "1.0.0",
  to: "2.0.0",
  remapColors: { primaryColor: "primary" },
  migrate(theme) { /* arbitrary transforms */ },
});

const next = migrateTheme(theme, { targetVersion: "2.0.0" });
```

## Theme History (Undo / Redo)

History is capped (default 50 steps) and records full theme snapshots with timestamps.

```ts
runtime.history.undo();        // step back
runtime.history.redo();        // step forward
runtime.history.jump(i);       // jump to any point in time
runtime.history.canUndo();     // / canRedo()
runtime.history.getHistory();  // / clear()
```

## Lifecycle Events

`runtime.lifecycle.on(event, handler)` with typed payloads:

| Event               | Payload             |
| ------------------- | ------------------- |
| `beforeThemeChange` | `{ current, next }` |
| `afterThemeChange`  | `{ theme }`         |
| `beforePersist`     | `{ selection }`     |
| `afterPersist`      | `{ selection }`     |
| `beforeApply`       | `{ theme }`         |
| `afterApply`        | `{ theme }`         |

```ts
const off = runtime.lifecycle.on("afterThemeChange", ({ theme }) => {
  console.log("applied", theme.name);
});
```

## Plugins

Plugins hook into the lifecycle and can transform tokens.

```ts
interface ThemePlugin {
  name: string;
  priority?: number;
  onBeforeThemeChange?(data): void;
  onAfterThemeChange?(data): void;
  onBeforePersist?(data): void;
  onAfterPersist?(data): void;
  onBeforeApply?(data): void;
  onAfterApply?(data): void;
  transformTokens?(tokens, ctx): ThemeTokens;
}
```

**Official plugins:**

- `createPersistencePlugin()` — persist selection to localStorage
- `createBroadcastPlugin()` — cross-tab sync
- `createHistoryPlugin()` — undo/redo
- `createAnimationsPlugin()` — theme transition animation control
- `createAccessibilityPlugin()` — contrast / accessibility enforcement
- `createScheduledPlugin()` — auto light/dark by solar time
- `createDebuggerPlugin()` — theme change logging
- `createDevToolsPlugin()` — devtools inspector wiring
- `createGenerationPlugin()` — live theme generation from a seed

## Accessibility Toolkit

```ts
import {
  getContrastRatio,
  checkContrastPair,
  validateThemeContrast,
  simulateCVD,
  simulateThemeForCVD,
  getCVDLabel,
} from "@theme-kit/core";

const ratio = getContrastRatio("#ffffff", "#171123"); // 15.6...
const ok = checkContrastPair("#fff", "#000", 4.5);     // WCAG check
const audit = validateThemeContrast(theme);            // full theme audit

// Color Vision Deficiency simulation (protanopia, deuteranopia, ...)
const simulated = simulateCVD("#6366f1", "deuteranopia");
```

## DOM Adapters

- **CSS Variables binding** — `createCSSVariablesBinding(store, { prefix, target, transition, styleSheet, layerName })`. Writes `--theme-*` variables inline or into a `@layer` stylesheet; batches writes and diffs against previously applied variables for minimal DOM churn.
- **DOM Attribute binding** — `createDOMBinding(store, { target, attributeName, transition })`. Sets `data-theme`, `data-theme-family`, `data-theme-mode`, toggles the `.dark` class, and sets `color-scheme`.
- **System theme binding** — `createSystemThemeBinding(store, { lightTheme, darkTheme })` — follows `prefers-color-scheme`.
- **Scoped theme binding** — `createScopedThemeBinding(themes, target, themeName)` — apply a theme to a subtree.
- **Transitions** — `ThemeTransitionOptions`: `enabled`, `duration`, `easing`, `useViewTransition`, `properties[]` (40+ default animated properties).
- **View Transitions API** — native `document.startViewTransition` when switching themes.

```ts
import { createCSSVariablesBinding, createDOMBinding } from "@theme-kit/core";

const css = createCSSVariablesBinding(store, { prefix: "theme-" });
const dom = createDOMBinding(store, {
  attributeName: "data-theme",
  transition: { enabled: true, duration: 300 },
});
```

## Multi-Window Sync

Sync theme selection across tabs/windows instantly:

- **BroadcastChannel** — primary transport (`createThemeSelectionBroadcast`)
- **SharedWorker** — inline blob-based worker relay
- **StorageEvent fallback** — `createStorageEventSync`
- **Auto strategy** — `createMultiWindowSync({ prefer: "auto" | "broadcast" | "sharedworker" })` picks the best available transport and reports fallbacks
- **Zero-flicker** — transitions are suppressed while applying cross-tab syncs

```ts
import { createMultiWindowSync } from "@theme-kit/core";

const sync = createMultiWindowSync({ prefer: "auto" });
// choose the theme in one tab — every other tab follows instantly
```

## Scheduled Themes (Solar Time)

Automatically switch between light and dark themes based on actual sunrise/sunset.

```ts
const runtime = createThemeRuntime({
  scheduled: {
    // Everything is optional. lightTheme/darkTheme adapt to the currently
    // selected theme's family (fallback: neutral light/dark), and the
    // location auto-detects from each visitor's browser timezone.
    // lightTheme: "mint-light",
    // darkTheme: "mint-dark",
    // timeZone: "Asia/Kathmandu",
    // latitude: 40.7128, longitude: -74.006,
    checkInterval: 60_000,
  },
});
```

`calculateSunTimes(date, lat?, lon?)` computes NOAA solar events — with no
coordinates it auto-detects the visitor's timezone (via
`Intl.DateTimeFormat().resolvedOptions().timeZone`). When `lightTheme` /
`darkTheme` are omitted, the schedule derives them from the current theme's
family (e.g. `plum-dark` → `plum-light`/`plum-dark`) and falls back to the
neutral `light`/`dark` themes, re-resolving when the user switches family.
`timeZone` / `autoDetectLocation` / `latitude` / `longitude` are all
changeable at runtime with `runtime.schedule.set()`. `skipApplyMs` defers
changes briefly after a cross-tab sync.

## Persistence

- `createPersistencePlugin({ key })` — full selection persistence (mode + family) as a runtime plugin; default key `theme-selection`
- `createThemePersistence({ storage, key })` — mode-only persistence (`theme-mode`), returned as a `ThemePersistenceAdapter` for manual wiring (not directly assignable to the runtime `persistence` option)
- `ThemeSelectionPersistenceAdapter` — the interface the runtime persistence option expects (`get/set/remove/subscribe` over `{ mode, family }`); default runtime persistence stores `{ mode, family }` under `theme-selection` in localStorage with a `storage` event subscription

```ts
import { createPersistencePlugin } from "@theme-kit/core";

// Recommended: full selection (mode + family) persistence
const runtime = createThemeRuntime({
  themes,
  plugins: [createPersistencePlugin({ key: "my-app-theme" })],
});
```

## Bootstrap (Zero Flash of Wrong Theme)

- `createThemeBootstrapScript({ themes, defaultTheme, initialMode, initialFamily, storageKey, prefix })` — generates a **blocking inline script** that reads the persisted selection, resolves the effective mode (`system` → `prefers-color-scheme`), and applies CSS variables + DOM effects before first paint.
- `buildThemeCssMap(themes)` — maps theme names and `family:mode` keys to flat CSS variable maps.
- `darkModeCSSTemplate(variables)` — a `@media (prefers-color-scheme: dark)` block so dark-mode users get correct colors even before JS runs.

```ts
import {
  createThemeBootstrapScript,
  buildThemeCssMap,
  darkModeCSSTemplate,
} from "@theme-kit/core";

const cssMap = buildThemeCssMap(themes);
const script = createThemeBootstrapScript({ themes, defaultTheme: "light" });
const fallbackCSS = darkModeCSSTemplate(cssMap["default:dark"] ?? {});
```

## Built-in Themes

`getBuiltInThemes()` bundles everything the library ships:

- **Neutral** — `light` / `dark` with a full token scale (spacing, radius, shadows, border widths, z-index, breakpoints, typography)
- **Preset families** — Oat, Berry, Mint, Citrus, Cocoa, Plum, Iris, Sky, Graphite (light + dark)
- **Brand presets** — Apple, GitHub, Vercel, Slack, Discord (light + dark)
- **Accessibility profiles** — High Contrast (light/dark) and Large Text (light/dark), tagged `"accessibility"`

```ts
import {
  getBuiltInThemes,
  getNeutralThemes,
  getPresetThemes,
  getBrandPresets,
  getAccessibilityProfiles,
} from "@theme-kit/core";

const all = getBuiltInThemes();
const presets = getPresetThemes();          // nine signature families
const brands = getBrandPresets();           // five real-world brands
```

## Vanilla (No Framework)

`@theme-kit/core/vanilla` provides the `ThemeKit` class — framework-free drop-in theming:

```js
import { ThemeKit } from "@theme-kit/core/vanilla";

const kit = new ThemeKit();       // or ThemeKit.init()
kit.setMode("dark");
kit.setFamily("plum");
kit.toggleTheme();
kit.update({ colors: { primary: "#07f" } });
kit.use({ name: "brand", themes: [...] });
kit.toCSSVariables();
kit.on("themeChange", (theme) => console.log(theme.name));
kit.destroy();
```

Events: `themeChange`, `modeChange`, `familyChange`. Exposes `.runtime`, `.registry`, `.theme`, `.mode`, `.family`, `.themes`.

## Vite Plugin

`@theme-kit/core/vite` injects the blocking bootstrap script into `index.html` (`head-prepend`) so the persisted theme applies before first paint in client-rendered apps — no manual inline scripts.

```ts
// vite.config.ts
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin({ themes: customThemes })],
});
```

## Framework Integrations

The same runtime powers every framework integration:

- `@theme-kit/react` — provider, hooks, `ThemeScope`, `ThemeInspector`, `ThemeModeButton`
- `@theme-kit/next` — App Router SSR, cookies, zero-flash hydration
- `@theme-kit/vue`, `@theme-kit/svelte`, `@theme-kit/solid`, `@theme-kit/angular` — provider + composables/stores/signals/injectables
- `@theme-kit/web` — `<theme-kit-provider>`, `<theme-kit-toggle>`, `<theme-kit-select>`, `<theme-kit-scope>` custom elements
- `@theme-kit/tailwind` — Tailwind CSS v4 `@theme` mapping
- `@theme-kit/astro`, `@theme-kit/nuxt`, `@theme-kit/remix` — island/SSR integrations
