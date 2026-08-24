## @theme-kit/core

> Generated from `packages/core/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `auto(tokenName, lookup): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokenName` | `string` | — |
| `lookup` | `__type(path: string): string | undefined` | — |

**Returns** `string`

---


### `buildThemeCssMap<T extends ThemeDefinition<string>>(themes, options): Record<string, Record<string, string>>`
Build a lookup map of theme keys to flat CSS variables.

Each theme is registered twice:
- under its own `name` (e.g. `"sunrise-light"`)
- under a `family:mode` key (e.g. `"sunrise:light"`) so that a persisted
  family + effective mode can be resolved without knowing theme names.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `options` | `BuildThemeCssMapOptions` | — |

**Returns** `Record<string, Record<string, string>>`

---


### `calculateSunTimes(date, args...): { sunrise: Date; sunset: Date }`
Compute today's sunrise and sunset using the standard NOAA solar algorithm
(zenith-based, corrected for the equation of time).

`latitude` and `longitude` are optional: when omitted (or when an options
object is passed instead), the location is resolved from `timeZone` or the
visitor's browser timezone via `resolveSolarLocation`. Passing neither
coordinates nor a timezone means every visitor gets sunrise/sunset for their
own location automatically.

```ts
// Explicit coordinates (unchanged behavior).
calculateSunTimes(date, 48.8566, 2.3522);

// Resolve from the visitor's timezone.
calculateSunTimes(date);

// Resolve from an explicit timezone.
calculateSunTimes(date, { timeZone: "Asia/Kathmandu" });
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `date` | `Date` | — |
| ...args | `[latitude: number, longitude: number, options: SolarLocationInput] | [options: SolarLocationInput]` | — |

**Returns** `{ sunrise: Date; sunset: Date }`

---


### `cancelThemeAnimation(target): void`
Abort any in-flight theme animation for `target` and remove its styles.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `target` | `HTMLElement` | — |

**Returns** `void`

---


### `clearMigrations(): void`
**Returns** `void`

---


### `composeTheme<TName extends string>(name, sources...): ThemeDefinition<TName>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `TName` | — |
| ...sources | `ThemeDefinition<string>[]` | — |

**Returns** `ThemeDefinition<TName>`

---


### `contrast(background): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `background` | `string` | — |

**Returns** `string`

---


### `createAccessibilityPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `AccessibilityPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createAdapterRegistry<T extends ThemeDefinition<string>>(runtime): AdapterRegistry<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `AdapterRegistry<T>`

---


### `createAnimationsPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `AnimationsPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createBroadcastPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `BroadcastPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createCSSVariablesBinding(store, options): { destroy: void } | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `CSSVariablesOptions` | — |

**Returns** `{ destroy: void } | null`

---


### `createDebuggerPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DebuggerPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createDefaultPersistence(): ThemeSelectionPersistenceAdapter | null`
**Returns** `ThemeSelectionPersistenceAdapter | null`

---


### `createDevToolsPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DevToolsPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createDOMBinding(store, options): { apply: __type(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }): void; destroy: void } | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `DOMBindingOptions` | — |

**Returns** `{ apply: __type(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }): void; destroy: void } | null`

---


### `createGenerationPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `GenerationPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createHistoryPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `HistoryPluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createMultiWindowSync(options): ThemeSelectionBroadcastAdapter`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `MultiWindowSyncOptions` | — |

**Returns** `ThemeSelectionBroadcastAdapter`

---


### `createNoopSync(): ThemeSelectionBroadcastAdapter`
**Returns** `ThemeSelectionBroadcastAdapter`

---


### `createOverlayScrollbar(store, options): OverlayScrollbarHandle | null`
Framework-agnostic, theme-aware scrollbar overlay engine.

The browser performs all scrolling — this only renders + animates a visual
overlay that tracks it, so inertia, touch, wheel, keyboard and accessibility
remain native. Colors come from Theme Kit tokens, so the overlay re-themes
with the rest of the app (no flashes). It tracks the *document* plus every
scrollable element on the page by default (anywhere a native scrollbar would
appear); the native track is hidden automatically — no manual CSS required.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `OverlayScrollbarOptions` | — |

**Returns** `OverlayScrollbarHandle | null`

---


### `createPersistencePlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `PersistencePluginOptions` (optional) | — |

**Returns** `ThemePlugin<T>`

---


### `createPluginManager<T extends ThemeDefinition<string>>(): PluginManager<T>`
**Returns** `PluginManager<T>`

---


### `createPrePaintScrollbarCSS(): string`
The hiding CSS, for SSR output (e.g. Next inlines it as a `<style>` in
 `<head>`). Use together with the `tk-scrollbar` class on `<html>`.

**Returns** `string`

---


### `createPrePaintScrollbarScript(options): string`
Generate a blocking `<script>` that hides the native scrollbar before
first paint. The script is idempotent — calling it multiple times is safe.
On coarse-pointer devices it returns early (unless `touch` is forced), so
native scrollbars are kept.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `PrePaintScrollbarOptions` | — |

**Returns** `string`

---


### `createScheduledPlugin<T extends ThemeDefinition<string>>(options): ThemePlugin<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ScheduledPluginOptions<T>` | — |

**Returns** `ThemePlugin<T>`

---


### `createScheduledThemeBinding<T>(store, options): { destroy: void; getEnabled: void; getLocation: void; setEnabled: void; setLastSyncTime: void }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `{ get: void; set: void }` | — |
| `options` | `ScheduledThemeBindingOptions<T>` | — |

**Returns** `{ destroy: void; getEnabled: void; getLocation: void; setEnabled: void; setLastSyncTime: void }`

---


### `createScopedThemeBinding<T extends ThemeDefinition<string>>(themes, target, selection, options): { destroy: void; getTheme: void; setLocalThemes: void; setTransition: void; update: void }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `target` | `HTMLElement` | — |
| `selection` | `ScopedThemeSelection` | — |
| `options` | `ScopedThemeBindingOptions` | — |

**Returns** `{ destroy: void; getTheme: void; setLocalThemes: void; setTransition: void; update: void }`

---


### `createSharedWorkerSync(): ThemeSelectionBroadcastAdapter | null`
**Returns** `ThemeSelectionBroadcastAdapter | null`

---


### `createStorageEventSync(key, view): ThemeSelectionBroadcastAdapter`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | — |
| `view` | `Window | undefined` | — |

**Returns** `ThemeSelectionBroadcastAdapter`

---


### `createSystemThemeBinding<T extends ThemeDefinition<string>>(store, options): { destroy: void } | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore<T>` | — |
| `options` | `SystemThemeBindingOptions<T>` | — |

**Returns** `{ destroy: void } | null`

---


### `createThemeBootstrapScript<T extends ThemeDefinition<string>>(options): string`
Generate an inline, blocking script that applies the persisted theme before
first paint, preventing a flash of the wrong (or missing) theme on reload.

The script reads the saved selection from localStorage, resolves the theme
for the effective mode (`"system"` is resolved against `prefers-color-scheme`),
and writes the CSS variables plus DOM effects onto `document.documentElement`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeBootstrapScriptOptions<T>` | — |

**Returns** `string`

---


### `createThemeBroadcast(options): ThemeBroadcastAdapter | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeBroadcastOptions` | — |

**Returns** `ThemeBroadcastAdapter | null`

---


### `createThemeDebugger<T extends ThemeDefinition<string>>(store, options?): ThemeDebugger<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore<T>` | — |
| `options` | `{ maxEvents?: number }` (optional) | — |

**Returns** `ThemeDebugger<T>`

---


### `createThemeDiff(prev, next, prefix?): ThemeDiff`
Theme Diff Engine.

Compares the previously applied CSS variables against the incoming theme's
variables per token group. Comparing the *final resolved values* (rather than
raw theme definitions) means two themes that resolve to identical colors
produce no diff — and nothing animates.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `prev` | `Map<string, string> | null | undefined` | — |
| `next` | `Record<string, string>` | — |
| `prefix` | `string` (optional) | — |

**Returns** `ThemeDiff`

---


### `createThemeHistory<T extends ThemeDefinition<string>>(store, options?): ThemeHistory<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore<T>` | — |
| `options` | `ThemeHistoryOptions` (optional) | — |

**Returns** `ThemeHistory<T>`

---


### `createThemeLifecycle<T extends ThemeDefinition<string>>(): ThemeLifecycle<T>`
**Returns** `ThemeLifecycle<T>`

---


### `createThemeModeController<T extends ThemeDefinition<string>>(options): { setMode: __type(nextMode: ThemeMode): void; destroy: void; getMode: void }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeModeControllerOptions<T>` | — |

**Returns** `{ setMode: __type(nextMode: ThemeMode): void; destroy: void; getMode: void }`

---


### `createThemePersistence(options): ThemePersistenceAdapter | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemePersistenceOptions` | — |

**Returns** `ThemePersistenceAdapter | null`

---


### `createThemeRegistry<T extends ThemeDefinition<string>>(options?): ThemeRegistry<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeRegistryOptions<T>` (optional) | — |

**Returns** `ThemeRegistry<T>`

---


### `createThemeRuntime<T extends ThemeDefinition<string>>(options): ThemeRuntime<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeRuntimeOptions<T>` | — |

**Returns** `ThemeRuntime<T>`

---


### `createThemeSchedule<T extends ThemeDefinition<string>>(store, themes, options): ThemeSchedule`
Framework-neutral sunrise/sunset scheduling controller. Wraps the core
`createScheduledThemeBinding` engine with an explicit on/off switch and a
reactive state snapshot (`sunrise`, `sunset`, `nextTransition`, ...) so
frameworks can expose it through their native accessors.

`lightTheme` and `darkTheme` are optional: when omitted the schedule
derives them from the currently selected theme's family (e.g. current
`plum-dark` → scheduled `plum-light`/`plum-dark`) and falls back to the
built-in neutral `light`/`dark` themes, re-resolving whenever the user
switches theme family.

The engine itself lives entirely in core — every framework wrapper talks to
this single contract.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore<T>` | — |
| `themes` | `readonly T[]` | — |
| `options` | `ThemeScheduleOptions<T>` | — |

**Returns** `ThemeSchedule`

---


### `createThemeScrollbar(store, options): OverlayScrollbarHandle | null`
Alias landing in the public API.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `OverlayScrollbarOptions` | — |

**Returns** `OverlayScrollbarHandle | null`

---


### `createThemeSelectionBroadcast(options): ThemeSelectionBroadcastAdapter | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeSelectionBroadcastOptions` | — |

**Returns** `ThemeSelectionBroadcastAdapter | null`

---


### `createThemeStore<T extends ThemeDefinition<string>>(options): ThemeStore<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeStoreOptions<T>` | — |

**Returns** `ThemeStore<T>`

---


### `createTransitionPlan(diff, options?, env?): TransitionPlan | null`
Transition Planner.

Turns a ThemeDiff into a concrete TransitionPlan:
 - colors animate through the registered theme custom properties on `:root`,
 - every other changed group contributes the concrete CSS properties it maps
   to (radius → border-radius, spacing → padding/margin/gap, …).

Returns `null` when there is nothing animatable: transitions disabled,
reduced motion, an "instant" preset, or a diff where only non-animatable
groups (layout/z-index/breakpoints) changed.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `diff` | `ThemeDiff` | — |
| `options` | `ThemeTransitionOptions` (optional) | — |
| `env` | `{ reducedMotion?: boolean }` (optional) | — |

**Returns** `TransitionPlan | null`

---


### `darkModeCSSTemplate(variables): string`
Generate a `@media (prefers-color-scheme: dark)` CSS block carrying the given
variables. Useful when the initial mode is `"system"` and the light theme is
rendered statically, so dark-mode users get the correct colors without JS.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `variables` | `Record<string, string>` | — |

**Returns** `string`

---


### `defineTheme<Name extends string, T extends ThemeDefinition<Name>>(theme): T`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `T` | — |

**Returns** `T`

---


### `destroySharedWorkerUrl(): void`
**Returns** `void`

---


### `evaluateExpression(expr): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `expr` | `string` | — |

**Returns** `string`

---


### `extendTheme<TName extends string, TBase extends ThemeDefinition<string>>(name, base, overrides?): ThemeDefinition<TName>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `TName` | — |
| `base` | `TBase` | — |
| `overrides` | `TokenOverrides & { meta?: Partial<ThemeMeta> }` (optional) | — |

**Returns** `ThemeDefinition<TName>`

---


### `flattenTokens(tokens): Record<string, string>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens` | — |

**Returns** `Record<string, string>`

---


### `generateTheme(options): GeneratedThemePair`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `GenerateThemeOptions` | — |

**Returns** `GeneratedThemePair`

---


### `getAccessibilityProfiles(): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }[]`
**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }[]`

---


### `getBrandPresets(): { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }[]`
**Returns** `{ meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }[]`

---


### `getBrowserTimeZone(): string | null`
Detect the visitor's IANA timezone, e.g. `"Asia/Kathmandu"`. Returns `null`
 when `Intl` is unavailable or reports an empty zone.

**Returns** `string | null`

---


### `getBuiltInThemes(): { meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens } | { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }[]`
**Returns** `{ meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens } | { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }[]`

---


### `getContrastRatio(foreground, background): number`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `foreground` | `string` | — |
| `background` | `string` | — |

**Returns** `number`

---


### `getDefaultThemes(): { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string }; radius: { lg: string } } }[]`
**Returns** `{ meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string }; radius: { lg: string } } }[]`

---


### `getHighContrastTheme(mode): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `mode` | `"light" | "dark"` | — |

**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }`

---


### `getLargeTextTheme(mode): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `mode` | `"light" | "dark"` | — |

**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }`

---


### `getLocationForTimeZone(timeZone): TimeZoneLocation | null`
Look up the reference coordinates for an IANA timezone. Returns `null`
 when the zone is unknown (or `Etc/GMT±n`, which is derived from offset).

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `timeZone` | `string` | — |

**Returns** `TimeZoneLocation | null`

---


### `getNeutralThemes(): readonly [{ meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } }, { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } }]`
**Returns** `readonly [{ meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } }, { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } }]`

---


### `getPresetThemes(overrides?): { meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens }[]`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `overrides` | `Partial<Record<PresetFamily, Partial<Record<PresetVariant, PresetVariantOverride>>>>` (optional) | — |

**Returns** `{ meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens }[]`

---


### `getThemeFamily(theme): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |

**Returns** `string`

---


### `getTimeZoneList(): string[]`
All known timezone ids, sorted alphabetically. Useful for building pickers
 (the docs site uses it for its timezone selector).

**Returns** `string[]`

---


### `isExpression(value): boolean`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `value` | `string` | — |

**Returns** `boolean`

---


### `isSettled(current, target, epsilon): boolean`
True when two positions are close enough to consider the thumb "settled".

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `current` | `number` | — |
| `target` | `number` | — |
| `epsilon` | `number` | — |

**Returns** `boolean`

---


### `mergePresetTokens(base, override?): ThemeTokens`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `ThemeTokens` | — |
| `override` | `Partial<ThemeTokens>` (optional) | — |

**Returns** `ThemeTokens`

---


### `mergeThemeDefinitions<Name extends string>(base, override): ThemeDefinition<Name>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `ThemeDefinition<Name>` | — |
| `override` | `ThemeDefinition<Name>` | — |

**Returns** `ThemeDefinition<Name>`

---


### `mergeTokens(base, override): ThemeTokens | undefined`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `ThemeTokens | undefined` | — |
| `override` | `ThemeTokens | undefined` | — |

**Returns** `ThemeTokens | undefined`

---


### `migrateTheme(theme, options): ThemeDefinition`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |
| `options` | `MigrateOptions` | — |

**Returns** `ThemeDefinition`

---


### `prefersReducedMotion(): boolean`
Requested motion profile. Reduced motion snaps instantly.

**Returns** `boolean`

---


### `registerMigration(step): void`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `step` | `MigrationStep` | — |

**Returns** `void`

---


### `resolveInitialTheme<T extends ThemeDefinition<string>>(options): InitialThemeResolution<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveInitialThemeOptions<T>` | — |

**Returns** `InitialThemeResolution<T>`

---


### `resolveScheduledThemePair<T extends ThemeDefinition<string>>(themes, options, current?): { dark: T | null; light: T | null }`
Resolve the scheduled light/dark themes from the configured options and
 the currently selected theme. Priority: explicit `lightTheme`/`darkTheme`
 → same-family counterpart of the current theme → neutral `light`/`dark`.
 Shared by `createThemeSchedule` and `createScheduledPlugin`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `options` | `ScheduledThemePairInput<T>` | — |
| `current` | `{ meta?: { family?: string } }` (optional) | — |

**Returns** `{ dark: T | null; light: T | null }`

---


### `resolveScopedTheme<T extends ThemeDefinition<string>>(themes, selection, prefersDark): T`
Resolve a scoped selection against a theme list. `themes` should already be
the combined source: local themes FIRST, then the parent runtime's registry.

Resolution order:
 1. exact theme-name match (local wins),
 2. a name that matches a family → that family's theme for the mode,
 3. explicit family + mode → exact match, else the family's light theme,
    else the family's first theme,
 4. the first theme in the list as a last-resort fallback.

The resolved definition has its `extends` chain merged (like `resolveTheme`)
so scoped CSS variables include every inherited token.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `selection` | `ScopedThemeSelection` | — |
| `prefersDark` | `boolean` | — |

**Returns** `T`

---


### `resolveScopedThemePrePaint<T extends ThemeDefinition<string>>(themes, selection, options): ScopedThemePrePaint`
Resolve everything a scope needs for its FIRST PAINT, generically from its
theme data (no hardcoded colors — any user's scoped themes produce the same
result). When the selection is OS-dependent (a `system` mode, or a family /
boundary scope currently following a system selection), it returns a
`@media (prefers-color-scheme: dark)` CSS block so the scoped region renders
light OR dark correctly before hydration, with the live binding taking over
through its own inline variables afterwards.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `selection` | `ScopedThemeSelection` | — |
| `options` | `ScopedThemePrePaintOptions` | — |

**Returns** `ScopedThemePrePaint`

---


### `resolveScopeTransition(parent, local): ThemeTransitionOptions | undefined`
Merge a scope's transition over its parent runtime's transition.

The inheritance model is `ThemeProvider transition → ThemeScope → inherited
defaults → local overrides`:
 - `local === undefined` → inherit the parent's configuration unchanged,
 - `local === true` → inherit the parent's configuration unchanged,
 - `local === false` → transitions disabled for this scope only,
 - `local` object → merged over the parent's (local keys win).

Frameworks use this so `<ThemeScope transition={{ duration: 200 }}>` flips
just the duration without the user having to repeat the provider's easing /
preset.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `parent` | `ThemeTransitionOptions | undefined` | — |
| `local` | `boolean | ThemeTransitionOptions | undefined` | — |

**Returns** `ThemeTransitionOptions | undefined`

---


### `resolveSelectedTheme<T extends ThemeDefinition<string>>(themes, selection): T`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `selection` | `ThemeSelection` | — |

**Returns** `T`

---


### `resolveSelection<T extends ThemeDefinition<string>>(options): ThemeSelectionState`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveSelectionOptions<T>` | — |

**Returns** `ThemeSelectionState`

---


### `resolveSelectionTheme<T extends ThemeDefinition<string>>(options): SelectionThemeResolution<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveSelectionThemeOptions<T>` | — |

**Returns** `SelectionThemeResolution<T>`

---


### `resolveSolarLocation(input): ResolvedSolarLocation`
Resolve the coordinates a solar calculation should use.

Priority: explicit `latitude`/`longitude` → explicit `timeZone` →
browser timezone auto-detection → `DEFAULT_TIMEZONE_LOCATION`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `input` | `SolarLocationInput` | — |

**Returns** `ResolvedSolarLocation`

---


### `resolveTheme<Name extends string>(themes, themeName, resolveTokenRefs): ThemeDefinition<Name>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<Name>[]` | — |
| `themeName` | `Name` | — |
| `resolveTokenRefs` | `boolean` | — |

**Returns** `ThemeDefinition<Name>`

---


### `resolveThemeName<Name extends string>(themes, family, mode, prefersDark): Name`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<Name>[]` | — |
| `family` | `string` | — |
| `mode` | `ThemeMode` | — |
| `prefersDark` | `boolean` | — |

**Returns** `Name`

---


### `resolveThemeRegistry<T extends ThemeDefinition<string>>(options?): readonly T[]`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeRegistryOptions<T>` (optional) | — |

**Returns** `readonly T[]`

---


### `resolveTokens(tokens): ThemeTokens`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens` | — |

**Returns** `ThemeTokens`

---


### `runThemeAnimation(input): void`
Run the animation for one theme change. Called by the CSS-variables binding
only when the Transition Planner produced a non-null plan.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `input` | `ThemeAnimationInput` | — |

**Returns** `void`

---


### `scanForTransition(root, properties): HTMLElement[]`
Collect elements that both (a) are visible and (b) actually use one of the
provided CSS properties. Runs only when non-color groups are animating.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `root` | `Node` | — |
| `properties` | `string[]` | — |

**Returns** `HTMLElement[]`

---


### `scopeToCSSVariables(themeVars, prefix): Record<string, string>`
Mirror the scoped binding's aliases (the `--color-*` / `--radius-*` tokens
 Tailwind-style utilities resolve against) so styling utilities on scoped
 elements use the scoped theme's values, not the page theme's.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themeVars` | `Record<string, string>` | — |
| `prefix` | `string` | — |

**Returns** `Record<string, string>`

---


### `simulateCVD(hex, type): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `hex` | `string` | — |
| `type` | `CVDType` | — |

**Returns** `string`

---


### `simulateThemeForCVD(theme, type): ThemeDefinition`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |
| `type` | `CVDType` | — |

**Returns** `ThemeDefinition`

---


### `themeToCSSVariables(theme, options): Record<string, string>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |
| `options` | `ThemeToCSSVariablesOptions` | — |

**Returns** `Record<string, string>`

---


### `validateTheme(theme, options): ValidationResult`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |
| `options` | `ValidateThemeOptions` | — |

**Returns** `ValidationResult`

---


### `validateThemeContrast(theme, options): ContrastValidationResult`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |
| `options` | `ValidateThemeContrastOptions` | — |

**Returns** `ContrastValidationResult`

---

## Classes

### `class ThemeError`

**Extends** `Error`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeError` | — |
| `cause` (optional) | `unknown` | — |
| `message` | `string` | — |
| `name` | `string` | — |
| `stack` (optional) | `string` | — |
| `stackTraceLimit` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames
collected by a stack trace (whether generated by `new Error().stack` or
`Error.captureStackTrace(obj)`).

The default value is `10` but may be set to any valid JavaScript number. Changes
will affect any stack trace captured _after_ the value has been changed.

If set to a non-number value, or set to a negative number, stack traces will
not capture any frames. |
| `captureStackTrace` | `void` | — |
| `prepareStackTrace` | `any` | — |

---


### `class ThemeRegistry<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeRegistry<T>` | — |
| `themes` | `void` | — |
| `clear` | `void` | — |
| `destroy` | `void` | — |
| `get` | `T | undefined` | — |
| `getFamilies` | `string[]` | — |
| `getThemesByFamily` | `T[]` | — |
| `has` | `boolean` | — |
| `list` | `readonly T[]` | — |
| `register` | `boolean` | — |
| `registerMany` | `number` | — |
| `replace` | `boolean` | — |
| `unregister` | `boolean` | — |
| `use` | `void` | — |

---

## Interfaces

### `AccessibilityPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `level` (optional) | `"AA" | "AAA"` | — |
| `onViolation` (optional) | `__type(result: { checks: ContrastCheck[]; themeName: string }): void` | — |
| `warnOnly` (optional) | `boolean` | — |

---


### `AdapterPlugin`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `id` (optional) | `string` | — |
| `refine` (optional) | `void | Record<string, unknown>` | — |
| `transform` (optional) | `Record<string, string>` | — |

---


### `AdapterPluginContext`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `mode` | `"light" | "dark" | "system" | undefined` | — |
| `strategy` | `AdapterStrategy` | — |

---


### `AdapterRegistration`
A successful registration returned by `AdapterRegistry.use`. Calling
`dispose()` removes exactly the adapter instance it was created for — but
only when its own reference count drops to zero. This makes composition
(React Strict Mode, Svelte lifecycles, nested providers) deterministic.

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `id` | `string` | — |
| `dispose` | `void` | — |

---


### `AdapterRegistry<T extends ThemeDefinition>`
The runtime-owned adapter registry. Registering an adapter installs it;
the runtime notifies the registry when the active theme changes.

`use` is idempotent per adapter instance and returns an `AdapterRegistration`
whose `dispose()` uninstalls deterministically:

```ts
const handle = runtime.adapters.use(adapter);
// ... later
handle.dispose();
```

| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `list` | `readonly ThemeAdapter<T>[]` | — |
| `unuse` | `boolean` | — |
| `use` | `AdapterRegistration` | — |

---


### `AnimationsPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `element` (optional) | `HTMLElement` | — |
| `transition` (optional) | `ThemeTransitionOptions` | — |

---


### `BroadcastChannelLike<T>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `addEventListener` | `void` | — |
| `close` | `void` | — |
| `postMessage` | `void` | — |
| `removeEventListener` | `void` | — |

---


### `BroadcastPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapter` (optional) | `{ destroy?: void; onMessage: void; postMessage: void } | null` | — |
| `channelName` (optional) | `string` | — |

---


### `BuildThemeCssMapOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `prefix` (optional) | `string` | — |

---


### `ContrastCheck`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `background` | `string` | — |
| `backgroundToken` | `string` | — |
| `foreground` | `string` | — |
| `foregroundToken` | `string` | — |
| `passesAAALarge` | `boolean` | — |
| `passesAAANormal` | `boolean` | — |
| `passesAALarge` | `boolean` | — |
| `passesAANormal` | `boolean` | — |
| `ratio` | `number` | — |

---


### `ContrastValidationResult`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `checks` | `ContrastCheck[]` | — |
| `valid` | `boolean` | — |

---


### `CSSVariablesOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `layerName` (optional) | `string` | — |
| `onBeforeSwap` (optional) | `__type(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }): void` | Applied inside the single View Transition lightswitch right before the
 CSS variables are swapped, so the old snapshot shows the old attributes
 AND old colors together. Lets a co-binding (e.g. the DOM binding's
 `apply`) stay in sync with the crossfade instead of starting its own
 View Transition (which would skip/abort the first one). |
| `prefix` (optional) | `string` | — |
| `styleSheet` (optional) | `boolean` | — |
| `target` (optional) | `HTMLElement` | — |
| `transition` (optional) | `ThemeTransitionOptions` | — |

---


### `DebuggerPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `label` (optional) | `string` | — |
| `logHistory` (optional) | `boolean` | — |
| `logPersistence` (optional) | `boolean` | — |
| `logThemeChanges` (optional) | `boolean` | — |
| `logTokenUpdates` (optional) | `boolean` | — |

---


### `DevToolsPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `enabled` (optional) | `boolean` | — |

---


### `DOMBindingOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `attributeName` (optional) | `string` | — |
| `subscribe` (optional) | `boolean` | Subscribe to the store on its own. Default `true`; disable when the
 owner (e.g. the CSS-variables binding) drives DOM updates through its
 transition pipeline instead. |
| `target` (optional) | `HTMLElement` | — |
| `transition` (optional) | `ThemeTransitionOptions` | — |

---


### `GeneratedThemePair`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `dark` | `ThemeDefinition` | — |
| `light` | `ThemeDefinition` | — |

---


### `GenerateThemeOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` (optional) | `string` | — |
| `seed` | `string` | — |

---


### `GenerationPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `onGenerate` (optional) | `__type(options: GenerateThemeOptions): void` | — |

---


### `HistoryEntry<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `theme` | `T` | — |
| `timestamp` | `number` | — |

---


### `HistoryPluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `maxSteps` (optional) | `number` | — |

---


### `InitialThemeResolution<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `selection` | `ThemeSelectionState` | — |
| `theme` | `T` | — |

---


### `MigrateOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `targetVersion` (optional) | `string` | — |

---


### `MigrationStep`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `description` | `string` | — |
| `from` | `string` | — |
| `migrate` (optional) | `__type(theme: ThemeDefinition): ThemeDefinition` | — |
| `remapColors` (optional) | `TokenRemap[]` | — |
| `to` | `string` | — |

---


### `MultiWindowSyncOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `channelName` (optional) | `string` | — |
| `onFallback` (optional) | `__type(strategy: string): void` | — |
| `prefer` (optional) | `"broadcast" | "sharedworker" | "auto"` | — |

---


### `OverlayScrollbarHandle`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `update` | `void` | — |

---


### `OverlayScrollbarOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` (optional) | `string` | Custom thumb color while the user is dragging it. When set,
 overrides the theme-derived active color. Default `undefined`
 (uses `thumbColor` or theme-derived). |
| `animationDuration` (optional) | `number` | rAF easing time constant (ms) for smooth thumb travel. Default `180`. |
| `arrowDownIcon` (optional) | `ArrowIcon` | Content for the "scroll down" button. Falls back to `arrowIcon`. |
| `arrowIcon` (optional) | `ArrowIcon` | Optional content shown inside every arrow button (overrides the built-in
 CSS triangle). Accepts an `innerHTML` string, a DOM node (element / inline
 SVG / text) or an array of both. |
| `arrowIconRenderer` (optional) | `__type(button: HTMLDivElement, dir: ScrollbarArrowDir): void` | Framework hook: invoked for every arrow button that has custom content, so
 framework wrappers (React/Vue/Svelte/...) can render framework-owned
 elements (JSX/VNodes/...) into the button. When set it replaces the
 `innerHTML`/node injection for `arrowIcon`-style options. |
| `arrowLeftIcon` (optional) | `ArrowIcon` | Content for the "scroll left" button. Falls back to `arrowIcon`. |
| `arrowRightIcon` (optional) | `ArrowIcon` | Content for the "scroll right" button. Falls back to `arrowIcon`. |
| `arrows` (optional) | `boolean` | Show the up/down (or left/right) navigation buttons like native browser
 scrollbars. Clicking scrolls a step; holding repeats. Default `true`. |
| `arrowUpIcon` (optional) | `ArrowIcon` | Content for the "scroll up" button. Falls back to `arrowIcon`. |
| `autoHide` (optional) | `boolean` | Fade the thumb/track out while idle. Default `true` (macOS-style). |
| `autoHideDelay` (optional) | `number` | Idle (ms) before a revealed strip fades out after its last activity.
 Each host has its own timer, so only the strip you're scrolling/hovering
 is revealed, then it fades after idle; other scrollbars stay hidden.
 Default `900`. Only takes effect when `autoHide` is `true`. |
| `axes` (optional) | `ScrollbarAxis[]` | Which axes to render. Defaults to both. |
| `clickToJump` (optional) | `boolean` | Clicking the empty track scrolls smoothly to that position. Default `true`. |
| `dir` (optional) | `"auto" | "ltr" | "rtl"` | Text direction. Defaults to the resolved `dir` / CSS `direction`. |
| `draggable` (optional) | `boolean` | Allow dragging the thumb to scroll. Default `true`. |
| `duration` (optional) | `number` | CSS transition duration (ms) for thickness/opacity/color. Default `250`. |
| `exclude` (optional) | `string[] | null` | Skip these CSS selectors when tracking inner scrollables. |
| `hoverExpand` (optional) | `boolean` | Grow the strip on hover / drag. Default `false` (thickness stays
 constant so the scrollbar never shifts while scrolling). |
| `hoverThickness` (optional) | `number` | Thumb thickness while hovered / dragged — only used when `hoverExpand` is true. Default `thickness + 4`. |
| `include` (optional) | `string[] | null` | Scope overlay to these CSS selectors for inner scrollables (the window is
 always tracked). When empty, all scrollable elements are tracked. |
| `minThumbSize` (optional) | `number` | Minimum thumb travel size. Default `32`. |
| `offset` (optional) | `number` | Gap between the thumb and the container edge in px. Default `2`. |
| `overscroll` (optional) | `boolean` | Subtly compress the thumb at the scroll boundaries (rubber-band feel). Default `true`. |
| `radius` (optional) | `number` | Thumb corner radius in px. Default `999`. |
| `smooth` (optional) | `boolean` | Use rAF-lerped (eased) thumb motion instead of a hard snap. Default `true`. |
| `thickness` (optional) | `number` | Resting thumb thickness (width for vertical, height for horizontal). Default `8`. |
| `thumbColor` (optional) | `string` | Custom thumb color (any CSS color string). When set, overrides
 the theme-derived color. Default `undefined` (theme-derived). |
| `thumbHoverColor` (optional) | `string` | Custom thumb color while hovered. When set, overrides the
 theme-derived hover color. Default `undefined` (uses `thumbColor`
 or theme-derived). |
| `thumbOpacity` (optional) | `number` | Thumb opacity while visible. Default `0.7`. |
| `touch` (optional) | `boolean` | Native (touch) devices: keep native scrollbars by default. Pass `true` to
 force the overlay on coarse-pointer devices. Default `false`. |
| `trackColor` (optional) | `string` | Custom track color (any CSS color string). When set, overrides
 the theme-derived color. Default `undefined` (theme-derived). |
| `trackOpacity` (optional) | `number` | Track strip opacity (0 = invisible). Default `0.25`. |
| `zIndex` (optional) | `number` | Z-index for the overlay strips. Defaults to the tracked container's own
 `z-index` (so the scrollbar stays inside its container's stacking order —
 e.g. below a sticky header). The document scrollbar defaults to `55`
 (above typical sticky headers, below full-screen modal backdrops) and
 containers without a z-index default to `30`. Overriding lets you force
 scrollbars above fixed headers/modals if you need to. |

---


### `PersistencePluginOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapter` (optional) | `ThemeSelectionPersistenceAdapter | null` | — |
| `key` (optional) | `string` | — |
| `readOnInit` (optional) | `boolean` | — |

---


### `PluginManager<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `get` | `ThemePlugin<T> | undefined` | — |
| `list` | `ThemePlugin<T>[]` | — |
| `remove` | `boolean` | — |
| `use` | `__type(): void` | — |

---


### `PresetVariantOverride`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `tokens` (optional) | `Partial<ThemeTokens>` | — |

---


### `ResolvedSolarLocation`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetected` | `boolean` | Whether the coordinates came from timezone resolution (explicit
 `timeZone` or browser auto-detection) rather than explicit coordinates. |
| `latitude` | `number` | — |
| `longitude` | `number` | — |
| `timeZone` | `string | null` | The timezone the coordinates were resolved from, or `null` when explicit
 coordinates were used (or nothing could be detected). |

---


### `ResolveInitialThemeOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | — |
| `family` (optional) | `string` | — |
| `mode` (optional) | `ThemeMode` | — |
| `prefersDark` (optional) | `boolean` | — |
| `themes` | `readonly T[]` | — |

---


### `ResolveSelectionOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | — |
| `initialFamily` (optional) | `string` | — |
| `initialMode` (optional) | `ThemeMode` | — |
| `persistedSelection` (optional) | `ThemeSelectionState | null` | — |
| `themes` | `readonly T[]` | — |

---


### `ResolveSelectionThemeOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `prefersDark` (optional) | `boolean` | — |
| `selection` | `ThemeSelectionState` | — |
| `themes` | `readonly T[]` | — |

---


### `ScheduledPluginOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no
 explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | — |
| `darkTheme` (optional) | `T["name"]` | Theme applied between sunset and sunrise. Optional — same derivation as
 `lightTheme`, falling back to the built-in neutral `"dark"` theme. |
| `enabled` (optional) | `boolean` | Start enabled. Default `true`. |
| `latitude` (optional) | `number` | Explicit coordinates. Optional — when omitted the location is resolved
 from `timeZone` or the visitor's browser timezone. |
| `lightTheme` (optional) | `T["name"]` | Theme applied between sunrise and sunset. Optional — when omitted the
 schedule derives it from the currently selected theme's family (or falls
 back to the built-in neutral `"light"` theme). |
| `longitude` (optional) | `number` | — |
| `skipApplyMs` (optional) | `number` | — |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude`
 are omitted (e.g. `"Asia/Kathmandu"`). |

---


### `ScheduledThemeBindingOptions<T>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no
 explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | — |
| `darkTheme` | `T` | — |
| `enabled` (optional) | `boolean` | Whether the binding should apply themes and run its timer. Defaults to
 `true`. Toggle at runtime via the returned `setEnabled`. |
| `getTimes` (optional) | `__type(date: Date, latitude: number, longitude: number): { sunrise: Date; sunset: Date }` | — |
| `latitude` (optional) | `number` | Explicit coordinates. Optional — when omitted the binding resolves the
 location from `timeZone` or the visitor's browser timezone. |
| `lightTheme` | `T` | — |
| `longitude` (optional) | `number` | — |
| `onBeforeApply` (optional) | `__type(theme: T): boolean` | — |
| `skipApplyMs` (optional) | `number` | — |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude`
 are omitted (e.g. `"Asia/Kathmandu"`). |

---


### `ScheduledThemeOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no
 explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | — |
| `darkTheme` (optional) | `T["name"]` | Theme applied between sunset and sunrise. Optional — same derivation
 as `lightTheme`, falling back to the built-in neutral `"dark"` theme. |
| `enabled` (optional) | `boolean` | Start enabled. Default `true`. |
| `latitude` (optional) | `number` | Explicit latitude. Optional — when omitted the location is resolved from
 `timeZone` or the visitor's browser timezone, so every user gets
 sunrise/sunset for their own location automatically. |
| `lightTheme` (optional) | `T["name"]` | Theme applied between sunrise and sunset. Optional — when omitted the
 schedule derives it from the currently selected theme's family (or falls
 back to the built-in neutral `"light"` theme). |
| `longitude` (optional) | `number` | Explicit longitude. Optional — see `latitude`. |
| `skipApplyMs` (optional) | `number` | — |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude`
 are omitted (e.g. `"Asia/Kathmandu"`). Takes precedence over
 auto-detection. |

---


### `ScheduledThemePairInput<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `darkTheme` (optional) | `T["name"]` | — |
| `lightTheme` (optional) | `T["name"]` | — |

---


### `ScopedThemeBindingOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `localThemes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions for genuinely isolated components. These are
 resolved FIRST, then the parent runtime's themes fall back — no second
 runtime is ever created. |
| `prefersDark` (optional) | `boolean` | Whether the OS prefers dark (used to resolve `mode: "system"` and the
 default light fallback for family-only selections). |
| `prefix` (optional) | `string` | — |
| `transition` (optional) | `ThemeTransitionOptions` | Transition applied when the scoped theme changes. When omitted, the change
 is applied instantly (the previous behaviour). Pass the owning runtime's
 `transition` to inherit the same transition the provider uses. |

---


### `ScopedThemePrePaint`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `css` | `string | null` | `[selector] { light }` + `@media (prefers-color-scheme: dark) { [selector]
 { dark } }`, or `null` when the scope isn't OS-dependent. Emit this into
 the rendered markup so the first paint already shows the correct theme. |
| `isDark` | `boolean` | Whether the default resolved theme is dark. |
| `lightVariables` | `Record<string, string>` | The default (light) scoped variables, including the `--color-*` /
 `--radius-*` aliases. When `systemBased`, these are the SSR/fallback
 values and the element should NOT carry them inline (the media-query
 override would lose to inline styles); when not, they become the
 element's inline style. |
| `name` | `string` | The default resolved theme name (for `data-theme`-style attributes). |
| `systemBased` | `boolean` | True when the scope's resolved theme depends on the OS scheme (its
 selection is a family / boundary following a `system` mode, so resolving
 with and without `prefers-color-scheme: dark` picks a different theme).
 These scopes need the `@media` CSS block to render correctly at first
 paint — the server can't know the OS preference yet. |

---


### `ScopedThemePrePaintOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `prefix` (optional) | `string` | — |
| `selector` (optional) | `string` | CSS selector targeting the scope element (e.g.
 `[data-theme-kit-scope="…"]`). Only used by the `@media` override. |

---


### `ScrollbarOptionsResolved`
Resolved (defaulted) options used internally.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` | `string | undefined` | — |
| `animationDuration` | `number` | — |
| `arrowDownIcon` | `ArrowIcon` | — |
| `arrowIcon` | `ArrowIcon` | — |
| `arrowIconRenderer` | `__type(button: HTMLDivElement, dir: ScrollbarArrowDir): void | undefined` | — |
| `arrowLeftIcon` | `ArrowIcon` | — |
| `arrowRightIcon` | `ArrowIcon` | — |
| `arrows` | `boolean` | — |
| `arrowUpIcon` | `ArrowIcon` | — |
| `autoHide` | `boolean` | — |
| `autoHideDelay` | `number` | — |
| `axes` | `ScrollbarAxis[]` | — |
| `clickToJump` | `boolean` | — |
| `dir` | `"ltr" | "rtl"` | — |
| `draggable` | `boolean` | — |
| `duration` | `number` | — |
| `exclude` | `string[]` | — |
| `hoverExpand` | `boolean` | — |
| `hoverThickness` | `number` | — |
| `include` | `string[]` | — |
| `minThumbSize` | `number` | — |
| `offset` | `number` | — |
| `overscroll` | `boolean` | — |
| `radius` | `number` | — |
| `smooth` | `boolean` | — |
| `thickness` | `number` | — |
| `thumbColor` | `string | undefined` | — |
| `thumbHoverColor` | `string | undefined` | — |
| `thumbOpacity` | `number` | — |
| `touch` | `boolean` | — |
| `trackColor` | `string | undefined` | — |
| `trackOpacity` | `number` | — |
| `zIndex` | `number | undefined` | — |

---


### `SelectionThemeResolution<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `selection` | `ThemeSelectionState` | — |
| `theme` | `T` | — |

---


### `SolarLocationInput`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no
 explicit coordinates/timezone are given. Default `true`. On the server
 (no `window`) detection is skipped and the default coordinates are used
 so SSR output stays deterministic. |
| `latitude` (optional) | `number` | — |
| `longitude` (optional) | `number` | — |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from (e.g. `"Asia/Kathmandu"`).
 Takes precedence over auto-detection. |

---


### `StorageAdapter`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `get` | `string | null` | — |
| `remove` | `void` | — |
| `set` | `void` | — |

---


### `SystemThemeBindingOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `darkTheme` | `T` | — |
| `lightTheme` | `T` | — |
| `mediaQuery` (optional) | `string` | — |
| `view` (optional) | `Window` | — |

---


### `ThemeAdapter<T extends ThemeDefinition>`
The contract every library adapter implements. The runtime only knows this
interface — it never knows Bootstrap, MUI, Chakra or any other library.

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `id` | `string` | — |
| `install` | `void` | — |
| `supports` | `boolean` | — |
| `uninstall` | `void` | — |

---


### `ThemeAnimationInput`
Input consumed by the Animation Coordinator for a single theme change.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `buffer` (optional) | `number` | Extra headroom after the longest transition before cleanup. |
| `plan` | `TransitionPlan` | — |
| `swap` | `__type(): void` | Writes the new CSS custom-property values to `target`. |
| `target` | `HTMLElement` | Element receiving the theme custom properties (usually <html>). |

---


### `ThemeBootstrapScriptOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | — |
| `initialFamily` (optional) | `string` | — |
| `initialMode` (optional) | `ThemeMode` | — |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | — |

---


### `ThemeBroadcastAdapter`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `post` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeBroadcastOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `channel` (optional) | `BroadcastChannelLike<ThemeMode>` | — |
| `channelName` (optional) | `string` | — |

---


### `ThemeChangeEvent<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `current` | `T` | — |
| `label` (optional) | `string` | — |
| `previous` | `T | null` | — |
| `source` | `ThemeChangeSource` | — |
| `timestamp` | `number` | — |

---


### `ThemeDebugger<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `clear` | `void` | — |
| `destroy` | `void` | — |
| `getHistory` | `readonly ThemeChangeEvent<T>[]` | — |
| `record` | `void` | — |

---


### `ThemeDefinition<Name extends ThemeName>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `extends` (optional) | `Name | readonly Name[]` | — |
| `meta` (optional) | `ThemeMeta` | — |
| `name` | `Name` | — |
| `tokens` (optional) | `ThemeTokens` | — |

---


### `ThemeDiff`
What actually changed between two themes, grouped by token category.

Produced by the Theme Diff Engine. Every downstream stage (planner,
scanner, coordinator) keys off these booleans so Theme Kit only animates
the token groups that really changed — never a blanket transition.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `borders` | `boolean` | — |
| `colors` | `boolean` | — |
| `layout` | `boolean` | Non-animatable groups (z-index, breakpoints) that require an instant
 swap + relayout rather than an animation. |
| `radius` | `boolean` | — |
| `shadows` | `boolean` | — |
| `spacing` | `boolean` | — |
| `transforms` | `boolean` | — |
| `typography` | `boolean` | — |

---


### `ThemeHistory<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `canRedo` | `boolean` | — |
| `canUndo` | `boolean` | — |
| `clear` | `void` | — |
| `destroy` | `void` | — |
| `getHistory` | `HistoryEntry<T>[]` | — |
| `jump` | `void` | — |
| `redo` | `void` | — |
| `undo` | `void` | — |

---


### `ThemeHistoryOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `maxSteps` (optional) | `number` | — |

---


### `ThemeLifecycle<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `emit` | `__type<K extends keyof ThemeLifecycleEventMap<ThemeDefinition<string>>>(event: K, data: ThemeLifecycleEventMap<T>[K]): void` | — |
| `off` | `__type<K extends keyof ThemeLifecycleEventMap<ThemeDefinition<string>>>(event: K, handler: __type(data: ThemeLifecycleEventMap<T>[K]): void): void` | — |
| `on` | `__type<K extends keyof ThemeLifecycleEventMap<ThemeDefinition<string>>>(event: K, handler: __type(data: ThemeLifecycleEventMap<T>[K]): void): __type(): void` | — |
| `destroy` | `void` | — |

---


### `ThemeLifecycleEventMap<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `afterApply` | `{ theme: T }` | — |
| `afterPersist` | `{ selection: ThemeSelectionState }` | — |
| `afterThemeChange` | `{ theme: T }` | — |
| `beforeApply` | `{ theme: T }` | — |
| `beforePersist` | `{ selection: ThemeSelectionState }` | — |
| `beforeThemeChange` | `{ current: T; next: T }` | — |

---


### `ThemeMeta`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `created` (optional) | `string` | — |
| `description` (optional) | `string` | — |
| `family` (optional) | `string` | — |
| `group` (optional) | `string` | — |
| `label` (optional) | `string` | — |
| `mode` (optional) | `"light" | "dark" | "system"` | — |
| `order` (optional) | `number` | — |
| `tags` (optional) | `string[]` | — |
| `updated` (optional) | `string` | — |
| `version` (optional) | `string` | — |

---


### `ThemeModeControllerOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `broadcast` (optional) | `ThemeBroadcastAdapter | null` | — |
| `darkTheme` | `T` | — |
| `initialMode` (optional) | `ThemeMode` | — |
| `lightTheme` | `T` | — |
| `persistence` (optional) | `ThemePersistenceAdapter | null` | — |
| `readPersistenceOnInit` (optional) | `boolean` | — |
| `store` | `ThemeStore<T>` | — |
| `view` (optional) | `Window` | — |

---


### `ThemePersistenceAdapter`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `get` | `ThemeMode | null` | — |
| `remove` | `void` | — |
| `set` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemePersistenceOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `key` (optional) | `string` | — |
| `storage` (optional) | `Storage` | — |
| `view` (optional) | `Window` | — |

---


### `ThemePlugin<T extends ThemeDefinition>`

**Extends** `ThemePluginHooks<T>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `name` | `string` | — |
| `onAfterApply` (optional) | `__type(data: { theme: T }): void` | — |
| `onAfterPersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | — |
| `onAfterThemeChange` (optional) | `__type(data: { theme: T }): void` | — |
| `onBeforeApply` (optional) | `__type(data: { theme: T }): void` | — |
| `onBeforePersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | — |
| `onBeforeThemeChange` (optional) | `__type(data: { current: T; next: T }): void` | — |
| `onDestroy` (optional) | `__type(): void` | — |
| `onRuntimeCreated` (optional) | `__type(runtime: ThemeRuntime<T>): void | __type(): void` | — |
| `priority` (optional) | `number` | — |
| `transformTokens` (optional) | `__type(tokens: ThemeTokens, context: { theme: T }): ThemeTokens` | — |
| `version` (optional) | `string` | — |

---


### `ThemePluginHooks<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `onAfterApply` (optional) | `__type(data: { theme: T }): void` | — |
| `onAfterPersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | — |
| `onAfterThemeChange` (optional) | `__type(data: { theme: T }): void` | — |
| `onBeforeApply` (optional) | `__type(data: { theme: T }): void` | — |
| `onBeforePersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | — |
| `onBeforeThemeChange` (optional) | `__type(data: { current: T; next: T }): void` | — |
| `onDestroy` (optional) | `__type(): void` | — |
| `onRuntimeCreated` (optional) | `__type(runtime: ThemeRuntime<T>): void | __type(): void` | — |
| `transformTokens` (optional) | `__type(tokens: ThemeTokens, context: { theme: T }): ThemeTokens` | — |

---


### `ThemeRegistryOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` (optional) | `readonly T[]` | — |

---


### `ThemeRuntime<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` | `AdapterRegistry<T>` | — |
| `history` | `ThemeHistory<T>` | — |
| `lifecycle` | `ThemeLifecycle<T>` | — |
| `registry` | `ThemeRegistry<T>` | — |
| `schedule` | `ThemeSchedule | null` | The sunrise/sunset scheduling controller created from the `scheduled`
 runtime option. `null` when the runtime was created without one. |
| `selection` | `{ setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; toggleTheme: __type(): void; destroy: void; getFamily: void; getMode: void; getSelection: void; subscribe: void }` | — |
| `store` | `ThemeStore<T>` | — |
| readonly `themes` | `readonly T[]` | — |
| `transition` (optional) | `ThemeTransitionOptions` | The resolved theme-transition options the runtime was created with
 (`undefined` when none were supplied). Components like `ThemeScope` read
 this so scoped theme changes inherit the same transition as the provider. |
| `batch` | `void` | — |
| `destroy` | `void` | — |
| `restore` | `void` | — |
| `snapshot` | `ThemeRuntimeSnapshot<T>` | — |
| `update` | `void` | — |
| `use` | `void` | — |

---


### `ThemeRuntimeOptions<T extends ThemeDefinition>`

**Extends** `ThemeRegistryOptions<T>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `ThemeAdapter<T>[]` | Library adapters installed when the runtime is created. The runtime owns
 the registry and notifies every adapter whenever the theme changes; it
 never knows anything about the libraries themselves. |
| `broadcast` (optional) | `ThemeSelectionBroadcastAdapter | null` | — |
| `cssVariables` (optional) | `false | CSSVariablesOptions` | — |
| `defaultTheme` (optional) | `T["name"]` | — |
| `dom` (optional) | `false | DOMBindingOptions` | — |
| `initial` (optional) | `InitialThemeResolution<T>` | — |
| `initialFamily` (optional) | `string` | — |
| `initialMode` (optional) | `ThemeMode` | — |
| `persistence` (optional) | `ThemeSelectionPersistenceAdapter | null` | — |
| `plugins` (optional) | `ThemePlugin<T>[]` | — |
| `readPersistenceOnInit` (optional) | `boolean` | — |
| `scheduled` (optional) | `false | ScheduledThemeOptions<T>` | — |
| `themes` (optional) | `readonly T[]` | — |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | — |
| `view` (optional) | `Window` | — |

---


### `ThemeRuntimeSnapshot<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `history` | `HistoryEntry<T>[]` | — |
| `registry` | `{ themes: T[] }` | — |
| `selection` | `ThemeSelectionState` | — |
| `theme` | `T` | — |

---


### `ThemeSchedule`
| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `active` | `boolean` | — |
| readonly `autoDetected` | `boolean` | Whether the coordinates were resolved from a timezone rather than
 explicit coordinates. |
| readonly `darkTheme` | `string | null` | — |
| readonly `enabled` | `boolean` | — |
| readonly `latitude` | `number | null` | The resolved latitude used for solar calculations. |
| readonly `lightTheme` | `string | null` | — |
| readonly `longitude` | `number | null` | The resolved longitude used for solar calculations. |
| readonly `nextActivation` | `Date | null` | — |
| readonly `nextDeactivation` | `Date | null` | — |
| readonly `nextTransition` | `ThemeScheduleTransition | null` | — |
| readonly `state` | `ThemeScheduleState` | The current reactive state snapshot (stable reference between changes). |
| readonly `status` | `ThemeScheduleStatus` | — |
| readonly `sunrise` | `Date | null` | — |
| readonly `sunset` | `Date | null` | — |
| readonly `timeZone` | `string | null` | The timezone the coordinates were resolved from, or `null` when explicit
 coordinates are in use. |
| `destroy` | `void` | — |
| `disable` | `void` | — |
| `enable` | `void` | — |
| `set` | `void` | — |
| `setLastSyncTime` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeScheduleOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no
 explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | How often (ms) the schedule re-checks solar time. Default `60000`. |
| `darkTheme` (optional) | `T["name"]` | Theme applied between sunset and sunrise. Optional — same derivation as
 `lightTheme`, falling back to the built-in neutral `"dark"` theme. |
| `enabled` (optional) | `boolean` | Start enabled. Default `true`. |
| `getTimes` (optional) | `__type(date: Date, latitude: number, longitude: number): { sunrise: Date; sunset: Date }` | Override the NOAA solar math. Defaults to `calculateSunTimes`. |
| `latitude` (optional) | `number` | Explicit latitude. Optional — when omitted the location is resolved from
 `timeZone` or the visitor's browser timezone. |
| `lightTheme` (optional) | `T["name"]` | Theme applied between sunrise and sunset. Optional — when omitted the
 schedule derives it from the currently selected theme's family (or falls
 back to the built-in neutral `"light"` theme), so it adapts as the user
 switches theme families. |
| `longitude` (optional) | `number` | Explicit longitude. Optional — see `latitude`. |
| `onBeforeApply` (optional) | `__type(theme: T): boolean` | Called before the schedule applies a theme. Return `false` to block the
 switch for this cycle. |
| `skipApplyMs` (optional) | `number` | Ignore schedule-driven applies within this many ms after a manual
 selection (e.g. a cross-tab sync). Default `0`. |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude`
 are omitted (e.g. `"Asia/Kathmandu"`). Takes precedence over
 auto-detection. |

---


### `ThemeScheduleSetOptions`

**Extends** `SolarLocationInput`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no
 explicit coordinates/timezone are given. Default `true`. On the server
 (no `window`) detection is skipped and the default coordinates are used
 so SSR output stays deterministic. |
| `checkInterval` (optional) | `number` | — |
| `enabled` (optional) | `boolean` | — |
| `latitude` (optional) | `number` | — |
| `longitude` (optional) | `number` | — |
| `skipApplyMs` (optional) | `number` | — |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from (e.g. `"Asia/Kathmandu"`).
 Takes precedence over auto-detection. |

---


### `ThemeScheduleState`
Reactive snapshot of a `ThemeSchedule`. Emitted to subscribers whenever the
 enabled state, applied theme or solar times change.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `active` | `boolean` | Whether the schedule is enabled AND the currently applied theme is one of
 its scheduled light/dark themes (i.e. the schedule is actually driving
 the selection right now, not manually overridden). |
| `autoDetected` | `boolean` | Whether the coordinates were resolved from a timezone (explicit
 `timeZone` or browser auto-detection) rather than explicit coordinates. |
| `darkTheme` | `string | null` | The theme applied at night. |
| `enabled` | `boolean` | Whether the schedule is enabled. |
| `latitude` | `number | null` | The resolved latitude used for solar calculations (from explicit
 coordinates, an explicit `timeZone`, or browser auto-detection). |
| `lightTheme` | `string | null` | The theme applied during daytime. |
| `longitude` | `number | null` | The resolved longitude used for solar calculations. |
| `nextActivation` | `Date | null` | Next time the light theme will be activated. |
| `nextDeactivation` | `Date | null` | Next time the dark theme will be activated. |
| `nextTransition` | `ThemeScheduleTransition | null` | The next automatic light/dark switch, with the theme it will apply. |
| `status` | `ThemeScheduleStatus` | `"active"` when enabled, `"disabled"` otherwise. |
| `sunrise` | `Date | null` | Today's sunrise (or the sunrise of the day `state` was computed for). |
| `sunset` | `Date | null` | Today's sunset. |
| `timeZone` | `string | null` | The timezone the coordinates were resolved from, or `null` when explicit
 coordinates are in use (or detection wasn't possible — e.g. on the
 server). |

---


### `ThemeScheduleTransition`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `at` | `Date` | When the next automatic change happens. |
| `theme` | `string` | Theme that will be applied at `at`. |
| `type` | `"activation" | "deactivation"` | `"activation"` → light theme at sunrise; `"deactivation"` → dark theme at
 sunset. |

---


### `ThemeSelectionBroadcastOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `channel` (optional) | `BroadcastChannelLike<ThemeSelectionState>` | — |
| `channelName` (optional) | `string` | — |

---


### `ThemeSelectionPersistenceAdapter`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `get` | `ThemeSelectionState | null` | — |
| `remove` | `void` | — |
| `set` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeSelectionState`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` | `string` | — |
| `mode` | `ThemeMode` | — |

---


### `ThemeStore<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `batch` | `void` | — |
| `destroy` | `void` | — |
| `get` | `T` | — |
| `set` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeStoreOptions<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `initialTheme` | `T` | — |

---


### `ThemeToCSSVariablesOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `groups` (optional) | `TokenGroup[]` | — |
| `prefix` (optional) | `string` | — |

---


### `ThemeTokens`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `borderWidths` (optional) | `Record<string, string>` | — |
| `breakpoints` (optional) | `Record<string, string>` | — |
| `code` (optional) | `CodeTokens` | — |
| `colors` (optional) | `ThemeColors` | — |
| `radius` (optional) | `Record<string, string>` | — |
| `shadows` (optional) | `Record<string, string>` | — |
| `spacing` (optional) | `Record<string, string>` | — |
| `typography` (optional) | `{ fontFamilies?: Record<string, string>; fontSizes?: Record<string, string>; lineHeights?: Record<string, string> }` | — |
| `zIndex` (optional) | `Record<string, string>` | — |

---


### `ThemeTransitionOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `duration` (optional) | `number` | — |
| `easing` (optional) | `string` | — |
| `enabled` (optional) | `boolean` | — |
| `preset` (optional) | `TransitionPreset` | Which properties are allowed to animate. `"smooth"`/`"subtle"` map to a
 curated color-property set, `"instant"` disables interpolation, and a
 raw array filters the diff-derived properties. |
| `properties` (optional) | `string[]` | — |
| `useViewTransition` (optional) | `boolean` | — |

---


### `TokenRemap`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `from` | `string` | — |
| `to` | `string` | — |

---


### `TransitionPlan`
The concrete, ready-to-apply transition decided by the Transition Planner.

`rootProperties` — registered `--theme-color-*` custom properties animated
  directly on `:root`; descendants inherit the interpolated values.
`elementProperties` — real CSS properties (padding, border-radius, …)
  transitioned on the scanned elements that actually use them.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `animatesColors` | `boolean` | — |
| `duration` | `number` | — |
| `easing` | `string` | — |
| `elementProperties` | `string[]` | — |

---


### `ValidateThemeContrastOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | — |

---


### `ValidateThemeOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | — |

---


### `ValidationIssue`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `message` | `string` | — |
| `path` | `string` | — |
| `type` | `"missing"` | — |

---


### `ValidationResult`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `issues` | `ValidationIssue[]` | — |
| `valid` | `boolean` | — |

---

## Type Aliases

### `AdapterStrategy`
How faithfully an adapter reproduces the target library's native feel.

- `exact`      — only map what Theme Kit defines; change nothing.
- `native`     — behave like the library: derive missing semantic concepts
                 (e.g. success/warning/info) and make small feel adjustments.
- `aggressive` — fully emulate the library: also adjust spacing, typography,
                 elevation, saturation and contrast.

`"exact" | "native" | "aggressive"`

---


### `AnimatedGroupKey`
`typeof ANIMATED_GROUP_KEYS[number]`

---


### `CalculateSunTimesLocationOptions`
Options accepted by `calculateSunTimes` for resolving a location when
 `latitude`/`longitude` are omitted.

`SolarLocationInput`

---


### `CVDType`
`"protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"`

---


### `PrePaintScrollbarOptions`
Phase 1 — Bootstrap: hide native scrollbar before first paint.

This is a tiny, dependency-free, blocking `<script>` that runs before
React. It does ONE thing: inject a `<style>` and add `tk-scrollbar`
to `<html>` so the native scrollbar is never painted.

  No DOM creation.
  No observers.
  No listeners.
  No React.
  No rAF.

Executes in under 1 ms.

The overlay (ThemeScrollbar) handles everything else: measure, draw,
animate, drag, hover, physics. When the overlay has been painted once,
it adds `tk-scrollbar-ready` to `<html>` — enabling CSS fade-in.

Architecture:

  Phase 1 — Bootstrap (this module)
    └─ hide native scrollbar
    └─ add tk-scrollbar

  Phase 2 — ThemeScrollbar (React / Web / Angular)
    └─ create overlay
    └─ measure
    └─ attach listeners (scroll, resize, pointer, wheel, MutationObserver)

  Phase 3 — Ready
    └─ tk-scrollbar-ready
    └─ overlay fades in via CSS

Next.js (`@theme-kit/next`) server-renders the `tk-scrollbar` class on
`<html>` and inlines `createPrePaintScrollbarCSS()` as a `<style>` in
`<head>` when the `scrollbar` prop is set — so the native bar is hidden
from the very first paint AND React hydrates without a class mismatch.
Emitting `createPrePaintScrollbarScript()` yourself is only needed when
you're not on `@theme-kit/next` (no SSR of the class).

`void`

---


### `PresetFamily`
`"neutral" | "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"`

---


### `PresetOverrides`
`Partial<Record<PresetFamily, Partial<Record<PresetVariant, PresetVariantOverride>>>>`

---


### `PresetThemeName`
``${unknown}${unknown}``

---


### `PresetVariant`
`"light" | "dark"`

---


### `ScopedThemeSelection`
A scoped theme selection. Either an exact theme name (or family name), or an
explicit family + mode pair. Provided as a `string` for convenience — every
framework wrapper accepts it.

`string | { name: string } | { family: string; mode?: ThemeMode }`

---


### `ScrollbarArrowDir`
Direction of a single arrow button on an axis strip.

`"up" | "down" | "left" | "right"`

---


### `ScrollbarAxis`
Scrollbar overlay engine — public options, runtime types and per-host
runtime state.

The philosophy: the browser always performs the scrolling. This module only
renders a theme-aware, animated overlay that *represents* the scrollbar. It
never replaces or moves native scrolling — it only synchronizes with it.

`"vertical" | "horizontal"`

---


### `ThemeChangeSource`
`"user" | "system" | "persistence" | "broadcast" | "update" | "init"`

---


### `ThemeLifecycleEventName`
`keyof ThemeLifecycleEventMap`

---


### `ThemeMode`
`"light" | "dark" | "system"`

---


### `ThemeName`
`string`

---


### `ThemePack<T extends ThemeDefinition>`
`void`

---


### `ThemeScheduleStatus`
Whether the schedule is driving theme selection right now. `"active"`
 means the schedule is enabled and applying its light/dark selection;
 `"disabled"` means it has been turned off (e.g. via `schedule.disable()`).

`"active" | "disabled"`

---


### `TimeZoneLocation`
`latitude, longitude` tuple.

`[latitude: number, longitude: number]`

---


### `TokenGroup`
`"colors" | "spacing" | "radius" | "shadows" | "borderWidths" | "zIndex" | "breakpoints" | "typography" | "code"`

---


### `TransitionPreset`
`"smooth" | "subtle" | "instant" | "custom" | string[]`

---

## Variables

### `ANIMATED_GROUP_KEYS`
Token-category → CSS-property classification.

This is the single source of truth for "which token group maps to which CSS
property," so the Transition Planner builds transitions from a diff without
hardcoding property lists in multiple places.

`colors` intentionally maps to nothing here: theme colors flow through
`@property`-registered custom properties on `:root`, so the whole
`var(--theme-color-*)` graph animates by inheritance — no per-element work.
Every other group is animated on the scanned elements that use it.

`readonly ["colors", "radius", "spacing", "typography", "shadows", "borders", "transforms", "opacity"]`

---


### `DEFAULT_SCHEDULED_DARK_THEME`
`"dark"`

---


### `DEFAULT_SCHEDULED_LIGHT_THEME`
The default neutral theme names used when `lightTheme`/`darkTheme` are
 omitted and no family counterpart can be derived.

`"light"`

---


### `DEFAULT_THEME_TRANSITION`
`Omit<Required<ThemeTransitionOptions>, "preset"> & Partial<Pick<ThemeTransitionOptions, "preset">>`

---


### `DEFAULT_TIMEZONE_LOCATION`
Fallback used when nothing else can be resolved (New York).

`TimeZoneLocation`

---


### `DEFAULT_TRANSITION_PRESET`
`TransitionPreset`

---


### `EMPTY_THEME_DIFF`
`ThemeDiff`

---


### `EMPTY_THEME_SCHEDULE_STATE`
`ThemeScheduleState`

---


### `GROUP_PROPERTIES`
`Record<AnimatedGroupKey, string[]>`

---


### `GROUP_VAR_PREFIXES`
CSS variable prefixes each token group materializes to (see `themeToCSSVariables`).

`Record<keyof ThemeDiff, string[]>`

---


### `migrations`
`MigrationStep[]`

---


### `PRE_PAINT_SCROLLBAR_CSS`
The CSS that hides native scrollbars while `tk-scrollbar` is present on
 `<html>`. Shared by the client bootstrap script and Next's SSR output so
 both apply identical rules.

`string`

---


### `TRANSITION_PRESETS`
`Record<string, string[]>`

---
