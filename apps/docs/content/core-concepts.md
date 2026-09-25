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

Nested token objects become **recursive groups**. The emitter walks each group,
joins every nested level with `-`, and appends the key **verbatim**:

```
--theme-color-background          /* colors.background            */
--theme-color-cardForeground      /* colors.cardForeground        */
--theme-typography-font-size-2xl  /* typography.fontSizes["2xl"]  */
--theme-shadow-md                 /* shadows.md                   */
--theme-breakpoint-lg             /* breakpoints.lg               */
--theme-radius-lg
--theme-spacing-4
```

Two naming rules follow from "verbatim", and both catch people out:

- **Colour keys stay camelCase.** The real property is
  `--theme-color-cardForeground`, not `--theme-color-card-foreground`. Only
  *nested levels* gain a `-`; a key is never re-cased or split.
- **Two group prefixes are singular.** `shadows` emits `--theme-shadow-*` and
  `breakpoints` emits `--theme-breakpoint-*`, not `--theme-shadows-*` /
  `--theme-breakpoints-*`.

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

const registry = createThemeRegistry();

registry.register(theme);
registry.registerMany([a, b]);
registry.unregister("plum-dark");
registry.replace("plum-dark", newDark);
registry.get("plum-light");
registry.has("plum-light");
registry.list();

registry.getFamilies();                 // ["default", "oat", "plum", ...]
registry.getThemesByFamily("plum");     // plum light + dark

// Install a theme pack — a named bundle of themes you supply.
registry.use({ name: "brand", themes: [brandLight, brandDark] });
```

A **theme pack** is a named bundle of themes; every theme it installs is stamped with a `pack:<name>` tag in its meta.

## The Theme Runtime

`createThemeRuntime` wires everything together — store, registry, selection, persistence, broadcast, DOM bindings, history, lifecycle, and plugins — into one object.

```ts
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
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

Utilities: `flattenTokens`, `resolveTokens`, `evaluateExpression`.

## Theme Generation

Generate a complete light + dark theme pair from a single seed color, deriving secondary, muted, accent, border, and ring colors with HSL math.

```ts
import { generateTheme } from "@theme-kit/core";

const { light, dark } = generateTheme({ seed: "#6366f1", family: "indigo" });
```

## Theme Validation

Validate that a theme defines all required semantic color tokens, resolving `extends` chains when a theme list is provided.

```ts
import { getBuiltInThemes, validateTheme } from "@theme-kit/core";

// Pass a theme list to resolve `extends` chains before validating.
const result = validateTheme(theme, { themes: getBuiltInThemes() });
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
- `createDevToolsPlugin()` — exposes the runtime on `window.__THEME_KIT_DEVTOOLS__` for a devtools extension. Core's version is the lightweight bridge (state only); the inspector that records entries and timings is `@theme-kit/devtools`'s `createDevToolsPlugin`.
- `createGenerationPlugin()` — live theme generation from a seed

## Accessibility Toolkit

```ts
import {
  getContrastRatio,
  validateThemeContrast,
  simulateCVD,
  simulateThemeForCVD,
} from "@theme-kit/core";

const ratio = getContrastRatio("#ffffff", "#171123"); // 15.6...
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
  plugins: [createPersistencePlugin({ key: "my-app-theme" })],
});
```

## Bootstrap (Zero Flash of Wrong Theme)

- `createThemeBootstrapScript({ themes, defaultTheme, initialMode, initialFamily, storageKey, prefix })` — generates a **blocking inline script** that reads the persisted selection, resolves the effective mode (`system` → `prefers-color-scheme`), and applies CSS variables + DOM effects before first paint.
- `buildThemeCssMap(themes)` — maps theme names and `family:mode` keys to flat CSS variable maps.
- `darkModeCSSTemplate(variables)` — a `@media (prefers-color-scheme: dark)` block carrying one theme's variables. This is a **pre-script** fallback only. It cannot override an inline `style` on the same element — inline declarations outrank every stylesheet rule regardless of specificity — so do not pair it with a server render that inlines the *light* variables, or an OS-dark visitor keeps the light ones. When the resolved mode is `system`, express both schemes in CSS instead: `systemModeCSSTemplate(light, dark)` from `@theme-kit/core` — which emits light *and* dark media blocks and expects **no** inline variables. `@theme-kit/astro` re-exports the same two functions, and `@theme-kit/angular`'s `createBlockingScriptContent` applies the identical rule internally.

```ts
import {
  createThemeBootstrapScript,
  buildThemeCssMap,
  darkModeCSSTemplate,
  getBuiltInThemes,
} from "@theme-kit/core";

// buildThemeCssMap/createThemeBootstrapScript take the registry explicitly;
// the built-in set is a valid registry, so no theme file is needed.
const themes = getBuiltInThemes();

const cssMap = buildThemeCssMap(themes);
const script = createThemeBootstrapScript({ themes, defaultTheme: "light" });
// Neutral themes carry no family, so they are keyed by name only.
const fallbackCSS = darkModeCSSTemplate(cssMap["dark"] ?? {});
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
// theme.config.ts — the canonical application configuration
import { defineTheme, defineThemeKitConfig } from "@theme-kit/core";

const themes = [
  defineTheme({
    name: "brand-light",
    meta: { family: "brand", mode: "light" },
    tokens: { colors: { background: "#ffffff" } },
  }),
  defineTheme({
    name: "brand-dark",
    meta: { family: "brand", mode: "dark" },
    tokens: { colors: { background: "#101014" } },
  }),
];

export default defineThemeKitConfig({
  themes,
  defaultTheme: "brand-light",
  // Opt in to following the OS. The plugin's bootstrap and the client runtime
  // both read this one value, so there is nothing to keep in sync.
  initialMode: "system",
});
```

```ts
// vite.config.ts — the plugin discovers the file above
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin()],
});
```

The plugin **discovers** `theme.config.ts` at the project root, derives the
bootstrap from it, and transports the same configuration to the runtime. Do not
repeat `themes` / `defaultTheme` / `initialMode` in `vite.config.ts` — declaring
them twice is how the script and the runtime drift apart, and a drift is visible
as a flash of the wrong theme.

## Framework Integrations

The same runtime powers every framework integration:

- `@theme-kit/react` — provider, hooks, `ThemeScope`, `ThemeInspector`, `ThemeModeButton`
- `@theme-kit/next` — App Router SSR, cookies, zero-flash hydration
- `@theme-kit/vue`, `@theme-kit/svelte`, `@theme-kit/solid`, `@theme-kit/angular` — provider + composables/stores/signals/injectables
- `@theme-kit/web` — `<theme-kit-provider>`, `<theme-kit-toggle>`, `<theme-kit-select>`, `<theme-kit-scope>` custom elements
- `@theme-kit/tailwind` — Tailwind CSS v4 `@theme` mapping
- `@theme-kit/astro`, `@theme-kit/nuxt`, `@theme-kit/remix` — island/SSR integrations
