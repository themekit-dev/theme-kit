## @theme-kit/nuxt
Theme Kit Nuxt integration.

The Nuxt module wires auto-imported `useTheme*` composables, the
`ThemeScope` / `ThemeScrollbar` / `ThemeInspector` components, and the
server-side cookie + bootstrap helpers (`defineNuxtTheme`,
`resolveThemeFromCookies`, `NuxtThemeBootstrap`).

> Generated from `packages/nuxt/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `auto(tokenName, lookup): string`
Resolve an `auto()` foreground token by deriving its value from a base color
token.

Given a token name ending in `Foreground`/`foreground` (or `Fg`), the base
token is looked up via the provided resolver and its contrast foreground is
returned. When the base color cannot be resolved, `#000000` is returned.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokenName` | `string` | The foreground token name to derive (e.g. `"primaryForeground"`). |
| `lookup` | `__type(path: string): string \| undefined` | A resolver that maps a dot-path token key to its value. |

**Returns** `string` — A black or white foreground color string.

---


### `buildThemeCssMap<T extends ThemeDefinition<string>>(themes, options?): Record<string, Record<string, string>>`
Build a lookup map of theme keys to flat CSS variables.

Each theme is registered twice:
- under its own `name` (e.g. `"sunrise-light"`)
- under a `family:mode` key (e.g. `"sunrise:light"`) so that a persisted
  family + effective mode can be resolved without knowing theme names.

**See also:** `createThemeBootstrapScript`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `options` | `BuildThemeCssMapOptions` (optional) | — |

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
| ...args | `[latitude: number, longitude: number, options: SolarLocationInput] \| [options: SolarLocationInput]` | — |

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
Remove all registered migration steps, resetting the migration system to an
empty state.

**Returns** `void`

---


### `composeTheme<TName extends string>(name, sources...): ThemeDefinition<TName>`
Compose a theme by layering multiple sources (e.g. a family theme, a
   mode override, and local tokens), later sources winning.

**See also:** `mergeThemeDefinitions`, `defineTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `TName` | — |
| ...sources | `ThemeDefinition<string>[]` | — |

**Returns** `ThemeDefinition<TName>`

---


### `computeFingerprint(themes, defaultTheme?): string`
Fingerprints a theme registry so a persisted selection from an older build —
different themes, or a different `defaultTheme` — is ignored rather than
applied against themes it was never valid for.

**See also:** `ThemeBootstrapCookieSource`, `buildBootstrapPlan`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` | The theme registry to fingerprint. |
| `defaultTheme` | `string` (optional) | The fallback theme name. Included in the fingerprint, so changing it invalidates previously persisted selections. |

**Returns** `string` — A stable fingerprint string, or `""` when `themes` is empty.

The result is written to the `theme-fingerprint` cookie and compared on the
next request, so it is part of the **stable cookie contract** documented in
`VERSIONING.md` — changing the format invalidates every visitor's persisted
selection on their next visit.

It lives here, in core, because four SSR integrations
(Next, Nuxt, Astro, Remix) previously each carried a byte-identical private
copy. Any edit to one of them would have silently broken cross-framework
persistence with nothing to catch it.

---


### `contrast(background): string`
Compute a readable foreground color for a given background color.

Returns `#000000` when the background is light enough (relative luminance
above `0.179`), otherwise `#ffffff`. Accepts a hex color with or without the
leading `#`; non-hex input falls back to `#000000`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `background` | `string` | The background color to contrast against. |

**Returns** `string` — A black or white foreground color string.

---


### `createAccessibilityPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that validates theme contrast for accessibility.

The plugin runs a WCAG contrast check on the active theme after every theme
change and reports any violations that fail AA normal contrast, either by
emitting a `TK_A11Y_CONTRAST_VIOLATION` diagnostic or by invoking the
`onViolation` callback.

**See also:** `AccessibilityPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `AccessibilityPluginOptions` (optional) | Accessibility configuration. |

**Returns** `ThemePlugin<T>` — An `"accessibility"` theme plugin.

Violations are reported only when the theme fails AA normal contrast and at
least one check fails. `warnOnly` chooses the diagnostic's level. The failing
checks travel as the diagnostic's structured context, so they stay available
to the console and to any consumer of the diagnostics stream rather than
being flattened into the message.

```ts
const manager = createPluginManager();
manager.use(createAccessibilityPlugin({
  warnOnly: true,
  onViolation: ({ themeName, checks }) => report(themeName, checks),
}));
```

---


### `createAdapterRegistry<T extends ThemeDefinition<string>>(runtime): AdapterRegistry<T>`
Create the runtime-owned adapter registry for a theme runtime.

Registering an adapter installs it; the registry tracks reference counts so
composition (React Strict Mode, Svelte lifecycles, nested providers) is
deterministic. `use` is idempotent per adapter instance and returns an
`AdapterRegistration` whose `dispose()` uninstalls exactly that instance
when its own reference count drops to zero. Registering a different adapter
instance under an already-used id replaces the previous one.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | The theme runtime the adapters are installed into. |

**Returns** `AdapterRegistry<T>` — The adapter registry bound to `runtime`.

```ts
const registry = createAdapterRegistry(runtime);
const handle = registry.use(adapter);
// ... later
handle.dispose();
```

---


### `createAnimationsPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that animates theme changes with CSS transitions.

The plugin applies a CSS transition to the target element before a theme
change so the resulting token updates animate smoothly, and removes the
transition when the plugin is destroyed.

**See also:** `AnimationsPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `AnimationsPluginOptions` (optional) | Animation configuration. |

**Returns** `ThemePlugin<T>` — An `"animations"` theme plugin.

The plugin opts out of View Transitions by default; it provides CSS
transition properties rather than page-level crossfades. `onDestroy` removes
the transition from the target element.

```ts
const manager = createPluginManager();
manager.use(createAnimationsPlugin({ transition: { duration: 500 } }));
```

---


### `createBroadcastPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that synchronizes the theme selection across browser tabs
and windows.

The plugin subscribes to incoming selection messages when the runtime is
created and applies the received mode/family to the runtime, and broadcasts
the selection after every persist. It uses a `BroadcastChannel`-based
adapter by default when available.

**See also:** `BroadcastPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `BroadcastPluginOptions` (optional) | Broadcast configuration. |

**Returns** `ThemePlugin<T>` — A `"broadcast"` theme plugin.

`onDestroy` unsubscribes from incoming messages and closes the default
channel. When no adapter is available the plugin is inert.

```ts
const manager = createPluginManager();
manager.use(createBroadcastPlugin({ channelName: "my-app-theme" }));
```

---


### `createCSSVariablesBinding(store, options?): { destroy: void } | null`
Create a binding that keeps CSS custom properties (`--theme-*`) on a
   target element (default `<html>`) in sync with the store. Applies the
   current theme immediately on creation and diffs updates.

**See also:** `themeToCSSVariables`, `CSSVariablesOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `CSSVariablesOptions` (optional) | — |

**Returns** `{ destroy: void } | null`

---


### `createDebuggerPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that logs theme runtime activity to the console.

The plugin logs theme changes, active theme tokens, and persistence events
(before and after) to the console, gated by the corresponding options.

**See also:** `DebuggerPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DebuggerPluginOptions` (optional) | Debugger configuration. |

**Returns** `ThemePlugin<T>` — A `"debugger"` theme plugin.

```ts
const manager = createPluginManager();
manager.use(createDebuggerPlugin({ label: "[my-app]" }));
```

---


### `createDefaultPersistence(): ThemeSelectionPersistenceAdapter | null`
Creates the default persistence adapter: a `localStorage`-backed
selection adapter under the `"theme-selection"` key.

Returns `null` when `window` is unavailable (SSR) or storage access
throws. Cross-tab changes are surfaced through the `storage` event.

**See also:** `ThemeSelectionPersistenceAdapter`, `createThemePersistence`

**Returns** `ThemeSelectionPersistenceAdapter | null` — A persistence adapter, or `null` when storage is unavailable.

---


### `createDevToolsPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that exposes the theme runtime to browser devtools.

When enabled, the plugin registers a devtools hook on `window` that exposes
the current themes, selection, active theme, and history, so a devtools
extension can inspect the runtime state.

**See also:** `DevToolsPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DevToolsPluginOptions` (optional) | Devtools configuration. |

**Returns** `ThemePlugin<T>` — A `"devtools"` theme plugin.

The hook is only registered in browser environments. `onDestroy` clears the
internal runtime reference.

Entries are added to the same `window.__THEME_KIT_DEVTOOLS__` set that
`@theme-kit/devtools`'s inspector plugin uses, and must satisfy that set's
declared shape — `getState()`, `getEntries()`, `getPerformance()`. This
plugin records no entries or performance samples, so those two return empty
arrays; the point is that a consumer enumerating the set can call all three
on every member without a type check. Use
`@theme-kit/devtools`'s `createDevToolsPlugin` instead when you want the
recorded entries and timings.

```ts
const manager = createPluginManager();
manager.use(createDevToolsPlugin());
```

---


### `createDiagnostic(input): ThemeDiagnostic`
Create a ThemeDiagnostic.

Pure: no console access, no environment reads, no deduplication. The `docs`
link is derived from the code so call sites never repeat it.

**See also:** `emitDiagnostic`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `input` | `CreateDiagnosticInput` | The diagnostic fields. |

**Returns** `ThemeDiagnostic` — A diagnostic value. Creating one has no side effects.

```ts
const diagnostic = createDiagnostic({
  code: "TK_MODE_INVALID",
  level: "warning",
  message: 'setMode() received an unknown mode "purple".',
  context: { api: "setMode", property: "mode", received: "purple", expected: "light | dark | system" },
  hint: "Pass one of the three valid modes, or omit the call.",
});
```

---


### `createDOMBinding(store, options?): { apply: __type(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }): void; destroy: void } | null`
Create a binding that syncs the store theme to the DOM: `data-theme`,
   `data-theme-mode`, `data-theme-family`, the `dark` class, and the
   `color-scheme` style — with transition support.

**See also:** `DOMBindingOptions`, `createCSSVariablesBinding`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `DOMBindingOptions` (optional) | — |

**Returns** `{ apply: __type(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }): void; destroy: void } | null`

---


### `createGenerationPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that participates in theme generation.

The plugin registers a token transform hook that runs during theme
application, allowing generated themes to be observed or adjusted.

**See also:** `GenerationPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `GenerationPluginOptions` (optional) | Generation configuration. |

**Returns** `ThemePlugin<T>` — A `"theme-generation"` theme plugin.

```ts
const manager = createPluginManager();
manager.use(createGenerationPlugin({ onGenerate: (opts) => track(opts) }));
```

---


### `createHistoryPlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that configures the runtime's theme history.

The plugin applies the given history options (notably `maxSteps`) to the
runtime's history when the runtime is created.

**See also:** `HistoryPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `HistoryPluginOptions` (optional) | History configuration. |

**Returns** `ThemePlugin<T>` — A `"history"` theme plugin.

```ts
const manager = createPluginManager();
manager.use(createHistoryPlugin({ maxSteps: 20 }));
```

---


### `createMultiWindowSync(options?): ThemeSelectionBroadcastAdapter`
Sync theme selection across browser tabs/windows via BroadcastChannel
   (with a SharedWorker + storage fallback).

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `MultiWindowSyncOptions` (optional) | — |

**Returns** `ThemeSelectionBroadcastAdapter`

---


### `createNoopSync(): ThemeSelectionBroadcastAdapter`
Create a no-op theme-selection sync adapter.

Every method is a safe no-op: `post` discards the value, `subscribe`
returns an unsubscribe that does nothing, and `destroy` does nothing. Used
as the final fallback when no cross-tab strategy is available.

**Returns** `ThemeSelectionBroadcastAdapter` — A `ThemeSelectionBroadcastAdapter` that performs no synchronization.

---


### `createNuxtThemeBootstrapScript<T extends ThemeDefinition<string>>(options): string`
Generate the blocking, inline bootstrap script that applies the persisted
theme before first paint — the same zero-flash guarantee `@theme-kit/next`
ships.

The script reads the four theme cookies (same contract as Next), validates
the config fingerprint, resolves the theme for the effective mode
(`"system"` is resolved against `prefers-color-scheme`), and writes the CSS
variables plus DOM effects onto `document.documentElement`. It delegates to
the shared `@theme-kit/core` applier (`buildBootstrapPlan` +
`serializeThemeBootstrapScript`), so every SSR integration emits the same
correct script and cannot drift from the client runtime contract.

Emit it in `<head>` with `tagPriority: "critical"` so it runs before the app
stylesheets and the browser paints already themed.

**See also:** `NuxtThemeBootstrapOptions`, `resolveThemeFromCookies`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `NuxtThemeBootstrapOptions<T>` | — |

**Returns** `string`

---


### `createOverlayScrollbar(store, options?): OverlayScrollbarHandle | null`
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
| `options` | `OverlayScrollbarOptions` (optional) | — |

**Returns** `OverlayScrollbarHandle | null`

---


### `createPersistencePlugin<T extends ThemeDefinition<string>>(options?): ThemePlugin<T>`
Creates a plugin that persists the theme selection and restores it on
startup.

The plugin reads the saved selection when the runtime is created (if
`readOnInit` is enabled) and writes the selection to the adapter after every
persist. It uses a `localStorage`-backed adapter by default in the browser
and is inert in non-browser environments unless a custom adapter is given.

**See also:** `PersistencePluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `PersistencePluginOptions` (optional) | Persistence configuration. |

**Returns** `ThemePlugin<T>` — A `"persistence"` theme plugin.

The default adapter also subscribes to cross-tab `storage` events so the
selection stays in sync across tabs. `onDestroy` releases the adapter and
runtime references.

```ts
const manager = createPluginManager();
manager.use(createPersistencePlugin({ key: "my-app-theme" }));
```

---


### `createPluginManager<T extends ThemeDefinition<string>>(): PluginManager<T>`
Creates a PluginManager for registering and coordinating theme
plugins.

The returned manager stores plugins by name, orders them by ascending
`priority` (default `10`) for hook dispatch, and coordinates destruction.

**See also:** `PluginManager`, `ThemePlugin`

**Returns** `PluginManager<T>` — A new, empty plugin manager.

Registering a plugin whose name is already present is skipped with a
console warning and returns a no-op disposer. `destroy` invokes `onDestroy`
on every plugin (in priority order) and clears the registry.

`destroy` is failure-isolated: a plugin whose `onDestroy` throws is reported
with `TK_PLUGIN_DESTROY_FAILED` and the remaining plugins are still
destroyed, so one broken plugin cannot leak the rest.

```ts
const manager = createPluginManager<MyTheme>();
const dispose = manager.use(createPersistencePlugin());
manager.list(); // [persistence plugin]
dispose();      // removes it
```

---


### `createPrePaintScrollbarCSS(): string`
The hiding CSS, for SSR output (e.g. Next inlines it as a `<style>` in
 `<head>`). Use together with the `tk-scrollbar` class on `<html>`.

**Returns** `string`

---


### `createPrePaintScrollbarScript(options?): string`
Generate a blocking `<script>` that hides the native scrollbar before
first paint. The script is idempotent — calling it multiple times is safe.
On coarse-pointer devices it returns early (unless `touch` is forced), so
native scrollbars are kept.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `PrePaintScrollbarOptions` (optional) | — |

**Returns** `string`

---


### `createScheduledPlugin<T extends ThemeDefinition<string>>(options): ThemePlugin<T>`
Creates a plugin that switches the theme selection by time of day.

The plugin resolves a light/dark theme pair and installs a scheduled theme
binding that applies the appropriate theme based on the visitor's local
sunrise/sunset times. It re-resolves the pair when the theme family changes
so auto-derived themes follow the current selection.

**See also:** `ScheduledPluginOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ScheduledPluginOptions<T>` | Schedule configuration. |

**Returns** `ThemePlugin<T>` — A `"scheduled"` theme plugin.

When the light/dark pair cannot be resolved, the plugin emits a
`TK_SCHEDULE_THEME_UNRESOLVED` diagnostic and does not install a binding.
`onDestroy` destroys the binding, unsubscribes from the store, and clears all
internal state.

```ts
const manager = createPluginManager();
manager.use(createScheduledPlugin({
  lightTheme: "day",
  darkTheme: "night",
  timeZone: "Asia/Kathmandu",
}));
```

---


### `createScheduledThemeBinding<T>(store, options): { destroy: void; getEnabled: void; getLocation: void; setEnabled: void; setLastSyncTime: void }`
Create a scheduled theme binding that applies a light theme during daytime
and a dark theme at night.

The binding resolves a location (explicit coordinates, an explicit
`timeZone`, or browser auto-detection), computes sunrise/sunset, applies
the matching theme immediately, and re-checks on `checkInterval`. It can be
toggled at runtime via `setEnabled` and stopped via `destroy` (which is
idempotent and clears the timer).

**See also:** `ScheduledThemeBindingOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `{ get: void; set: void }` | The store the scheduled theme is applied to. |
| `options` | `ScheduledThemeBindingOptions<T>` | The scheduled-binding configuration. |

**Returns** `{ destroy: void; getEnabled: void; getLocation: void; setEnabled: void; setLastSyncTime: void }` — A controller exposing `destroy`, `setLastSyncTime`, `setEnabled`,
  `getEnabled` and `getLocation`.

```ts
const binding = createScheduledThemeBinding(store, {
  lightTheme,
  darkTheme,
  timeZone: "Asia/Kathmandu",
});
// ... later
binding.destroy();
```

---


### `createScopedThemeBinding<T extends ThemeDefinition<string>>(themes, target, selection, options?): { destroy: void; getTheme: void; setLocalThemes: void; setTransition: void; update: void }`
Create a scoped-theme binding for an element: applies the scoped theme's
   CSS variables inline on the element and cleans them up on destroy.

**See also:** `ScopedThemeBindingOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | — |
| `target` | `HTMLElement` | — |
| `selection` | `ScopedThemeSelection` | — |
| `options` | `ScopedThemeBindingOptions` (optional) | — |

**Returns** `{ destroy: void; getTheme: void; setLocalThemes: void; setTransition: void; update: void }`

---


### `createSharedWorkerSync(): ThemeSelectionBroadcastAdapter | null`
Create a theme-selection broadcast adapter backed by a `SharedWorker`.

The adapter relays theme selections between tabs/windows through a shared
worker, so every tab connected to the same worker receives the selection.
It requires `SharedWorker` support; when unavailable (or when the worker
cannot be created) it returns `null` (e.g. during SSR).

**See also:** `destroySharedWorkerUrl`

**Returns** `ThemeSelectionBroadcastAdapter | null` — A `ThemeSelectionBroadcastAdapter`, or `null` when `SharedWorker`
  is unavailable.

```ts
const sync = createSharedWorkerSync();
sync?.post({ mode: "dark", family: "plum" });
```

---


### `createStorageEventSync(key?, view?): ThemeSelectionBroadcastAdapter`
Create a theme-selection sync adapter backed by `localStorage` and the
`storage` event.

The adapter writes the selection as JSON under a single key and notifies
subscribers of cross-tab changes through the `storage` event. It requires
a `Window`; when none is available it returns a no-op adapter (e.g. during
SSR).

**See also:** `createThemeBroadcast`, `MultiWindowSyncOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` (optional) | Storage key used for the selection. |
| `view` | `Window` (optional) | The `Window` used to access storage and listen for `storage` events. Defaults to the global `window` when present. |

**Returns** `ThemeSelectionBroadcastAdapter` — A `ThemeSelectionBroadcastAdapter`.

```ts
const sync = createStorageEventSync();
sync.post({ mode: "dark", family: "plum" });
```

---


### `createSyncFirstRoot<TRoot extends SyncFirstRenderRoot>(createRoot, flushSync, options?): CreateRootLike<TRoot>`
Wraps a React `createRoot` so the **first** `render` call on each root it
creates is committed synchronously.

**See also:** `themeKitVitePlugin`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `createRoot` | `CreateRootLike<TRoot>` | The real `createRoot` to delegate to. |
| `flushSync` | `__type(callback: __type(): void): void` | React's `flushSync`. |
| `options` | `SyncFirstRootOptions` (optional) | See SyncFirstRootOptions. |

**Returns** `CreateRootLike<TRoot>` — A `createRoot` that commits its first render synchronously.

React's concurrent root *schedules* the initial commit, so the browser can
paint a frame with the container still empty before React commits — one frame,
~33 ms, visible as the UI blinking on reload. `flushSync` around that first
render closes it, and it has to happen at the root: the offending frame is
painted before any of the application's React code runs, so no provider,
insertion effect or layout effect is in time.

Only the **first** `render` of each root is flushed. Every later render keeps
React's normal concurrent scheduling, so transitions, Suspense and
time-slicing behave exactly as before.

This is deliberately a plain function of its dependencies rather than
something that reaches for React globals, so it can be unit-tested against
stubs — the behaviour it encodes (first render flushed, later renders not) is
otherwise only observable in a real browser.

---


### `createSystemThemeBinding<T extends ThemeDefinition<string>>(store, options): { destroy: void } | null`
Create a binding that applies the theme for "system" mode, following
   `prefers-color-scheme` live.

**See also:** `SystemThemeBindingOptions`

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

**See also:** `buildThemeCssMap`, `createPrePaintScrollbarScript`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeBootstrapScriptOptions<T>` | — |

**Returns** `string`

---


### `createThemeBroadcast(options?): ThemeBroadcastAdapter | null`
Create a theme-mode broadcast adapter backed by `BroadcastChannel`.

The adapter publishes the mode to a channel and notifies subscribers of
modes broadcast by other tabs/windows. It requires `BroadcastChannel`
support (or a custom `channel`); when neither is available it returns
`null` (e.g. during SSR).

**See also:** `createStorageEventSync`, `ThemeSelectionBroadcastAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeBroadcastOptions` (optional) | The broadcast configuration. |

**Returns** `ThemeBroadcastAdapter | null` — A `ThemeBroadcastAdapter`, or `null` when no channel is available.

```ts
const broadcast = createThemeBroadcast({ channelName: "my-theme-mode" });
broadcast?.post("dark");
```

---


### `createThemeDebugger<T extends ThemeDefinition<string>>(store, options?): ThemeDebugger<T>`
Create a debugger that records theme changes on a theme store.

The debugger subscribes to the store and records an event whenever the
current theme changes. Call ThemeDebugger.record before a change to
attribute it to a specific source and label; otherwise the change is
attributed to `"user"`. History is capped at `maxEvents` entries.

**See also:** `ThemeDebugger`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore<T>` | The theme store to observe. |
| `options` | `{ maxEvents?: number }` (optional) | Optional configuration. |

**Returns** `ThemeDebugger<T>` — A ThemeDebugger bound to the store.

```ts
const debugger = createThemeDebugger(store, { maxEvents: 100 });
debugger.record("user", "switched to dark");
```

---


### `createThemeDiff(prev, next, prefix?): ThemeDiff`
Theme Diff Engine.

Compares the previously applied CSS variables against the incoming theme's
variables per token group. Comparing the *final resolved values* (rather than
raw theme definitions) means two themes that resolve to identical colors
produce no diff — and nothing animates.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `prev` | `Map<string, string> \| null \| undefined` | — |
| `next` | `Record<string, string>` | — |
| `prefix` | `string` (optional) | — |

**Returns** `ThemeDiff`

---


### `createThemeHistory<T extends ThemeDefinition<string>>(store, options?): ThemeHistory<T>`
Creates an undo/redo history controller for a theme store.

**See also:** `ThemeHistory`, `ThemeStore`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore<T>` | The store to track. |
| `options` | `ThemeHistoryOptions` (optional) | History configuration (see ThemeHistoryOptions). |

**Returns** `ThemeHistory<T>` — A new theme history controller.

```ts
const history = createThemeHistory(store, { maxSteps: 20 });
history.undo();
```

---


### `createThemeLifecycle<T extends ThemeDefinition<string>>(): ThemeLifecycle<T>`
Creates a typed lifecycle event emitter for runtime events.

**See also:** `ThemeLifecycle`, `ThemeLifecycleEventMap`

**Returns** `ThemeLifecycle<T>` — A new lifecycle controller.

```ts
const lifecycle = createThemeLifecycle();
const off = lifecycle.on("afterThemeChange", ({ theme }) => log(theme));
lifecycle.emit("afterThemeChange", { theme });
off();
```

---


### `createThemeModeController<T extends ThemeDefinition<string>>(options): { setMode: __type(nextMode: ThemeMode): void; destroy: void; getMode: void }`
Create a theme-mode controller that resolves a mode into a concrete theme
and keeps it applied to the store.

In `system` mode it follows the OS color-scheme preference live via a
system binding; in `light`/`dark` mode it applies the corresponding theme
directly. `setMode` refuses a value that is not `"light"`, `"dark"` or
`"system"`: the call is ignored — nothing is applied, persisted or
broadcast — and a `TK_MODE_INVALID` diagnostic is emitted, so `getMode()`
never reports a mode the runtime cannot render. Mode changes are persisted
and broadcast when the corresponding adapters are provided. The returned
controller is safe to destroy: after `destroy()` its methods become no-ops
and all subscriptions are released.

**See also:** `ThemeSelectionState`, `createThemePersistence`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeModeControllerOptions<T>` | The controller configuration. |

**Returns** `{ setMode: __type(nextMode: ThemeMode): void; destroy: void; getMode: void }` — A controller exposing `getMode`, `setMode` and `destroy`.

```ts
const controller = createThemeModeController({
  store,
  lightTheme,
  darkTheme,
  persistence: createThemePersistence(),
});
controller.setMode("dark");
```

---


### `createThemePersistence(options?): ThemePersistenceAdapter | null`
Create a theme-mode persistence adapter backed by `Storage`.

The adapter reads/writes the mode under a single key and notifies
subscribers of cross-tab changes through the `storage` event. It requires
a `Window`; when none is available it returns `null` (e.g. during SSR).

**See also:** `createDefaultPersistence`, `ThemeSelectionPersistenceAdapter`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemePersistenceOptions` (optional) | The persistence configuration. |

**Returns** `ThemePersistenceAdapter | null` — A `ThemePersistenceAdapter`, or `null` when no `Window` is
  available.

```ts
const persistence = createThemePersistence({ key: "my-theme-mode" });
persistence?.set("dark");
```

---


### `createThemeReadoutScript(): string`
Builds the inline script that fills in **bootstrap readouts**: elements that
display a theme-derived value the server cannot know.

**See also:** `createThemeBootstrapScript`, `readBootstrapState`

**Returns** `string` — The script body to emit at the **end of `<body>`**, after the
  elements it patches exist.

A readout opts in with `data-tk-readout="theme" | "mode" | "family"`, or
`data-tk-readout="var:--theme-color-primary"` to display a resolved CSS
variable. The script reads the payload the blocking bootstrap published (see
readBootstrapState) — or, for `var:`, the variable the bootstrap
already applied to `<html>` — and writes the value into each element's
`textContent`.

Why this exists: a server-rendered readout can only show the *server's*
resolution, and for `"system"` mode that is a fallback the browser overrides
before the first paint. The canvas is corrected by the bootstrap, but the text
is not — so it settles once after hydration, which is the last visible
difference on an otherwise static page.

Patching the text before the first paint closes that, but only if the
framework then leaves the element alone. In React that means pairing it with
`suppressHydrationWarning` on the same element: React renders its own value
during hydration, sees the DOM already differs, and — with the attribute —
neither warns nor rewrites. The framework's own post-hydration render then
produces the live value, which is the same value the script wrote, so nothing
moves. Without the suppression React would rewrite the text back to the
server's fallback and re-introduce the settle.

It is deliberately placed at the end of the body: the blocking script runs in
`<head>`, before these elements have been parsed, so it cannot patch them.

---


### `createThemeRegistry<T extends ThemeDefinition<string>>(options?): ThemeRegistry<T>`
Creates a theme registry.

**See also:** `ThemeRegistry`, `resolveThemeRegistry`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeRegistryOptions<T>` (optional) | Initial themes and registry configuration. |

**Returns** `ThemeRegistry<T>` — A new ThemeRegistry.

```ts
const registry = createThemeRegistry({ themes: [lightTheme, darkTheme] });
registry.get("light");
```

---


### `createThemeRuntime<T extends ThemeDefinition<string>>(options?): ThemeRuntime<T>`
Creates an independent Theme Kit runtime — the single entry point for
theming.

The runtime wires together the theme store, selection controller
(mode/family/system binding), persistence, broadcast (cross-tab sync),
history, scheduling, the DOM + CSS-variable bindings, and the adapter
registry.

**See also:** `ThemeRuntime`, `createThemeStore`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeRuntimeOptions<T>` (optional) | Runtime configuration and initial theme definitions. |

**Returns** `ThemeRuntime<T>` — A new `ThemeRuntime` instance.

The returned runtime must be destroyed when its owning application
lifecycle ends.

```ts
const runtime = createThemeRuntime({
  themes: [lightTheme, darkTheme],
  defaultTheme: "light",
  initialMode: "system",
});
runtime.selection.setMode("dark");
```

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


### `createThemeScrollbar(store, options?): OverlayScrollbarHandle | null`
Alias landing in the public API.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `store` | `ThemeStore` | — |
| `options` | `OverlayScrollbarOptions` (optional) | — |

**Returns** `OverlayScrollbarHandle | null`

---


### `createThemeSelectionBroadcast(options?): ThemeSelectionBroadcastAdapter | null`
Create a broadcast adapter that publishes selection changes to other
   tabs/windows and applies incoming changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeSelectionBroadcastOptions` (optional) | — |

**Returns** `ThemeSelectionBroadcastAdapter | null`

---


### `createThemeStore<T extends ThemeDefinition<string>>(options): ThemeStore<T>`
Creates a theme store: a framework-free container for the active theme.

The store holds the current theme and notifies subscribers when it
changes. Use the higher-level `createThemeRuntime` for the full runtime;
use the store directly when you only need a reactive current-theme
container.

**See also:** `ThemeStore`, `createThemeRuntime`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeStoreOptions<T>` | Store configuration, including the initial theme. |

**Returns** `ThemeStore<T>` — A new theme store.

```ts
const store = createThemeStore({ initialTheme: lightTheme });
store.subscribe((theme) => console.log(theme.name));
store.set(darkTheme);
```

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
variables.

**See also:** `systemModeCSSTemplate`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `variables` | `Record<string, string>` | The CSS variables to emit under the dark media query. |

**Returns** `string` — A `@media (prefers-color-scheme: dark)` block targeting `:root`.

This is a **pre-script** fallback only, and it cannot beat an inline `style`
on the same element: inline declarations outrank every stylesheet rule
regardless of specificity. So it is only safe when nothing inlines the light
variables — do not pair it with a server render that writes them onto
`<html>`, or an OS-dark visitor keeps the light ones and this block is inert.
When the resolved mode is `"system"`, use systemModeCSSTemplate
instead: it emits both schemes and expects no inline variables.

---


### `defineTheme<Name extends string, T extends ThemeDefinition<Name>>(theme): T`
Define a theme. Currently returns the definition unchanged; it exists
   to give themes a consistent shape and future validation.

**See also:** `extendTheme`, `composeTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `T` | — |

**Returns** `T`

---


### `defineThemeKitConfig<T extends ThemeDefinition<string>>(config): ThemeKitConfig<T>`
Declares the application's Theme Kit configuration.

**See also:** `ThemeKitConfig`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `config` | `ThemeKitConfig<T>` | The configuration. |

**Returns** `ThemeKitConfig<T>` — The same object, typed.

An identity function. Its job is to give the configuration a name, a type and
a validation point, so the Vite plugin can discover it by convention and the
provider can consume the same object rather than a copy of it.

```ts
// theme.config.ts — at the project root
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
  initialMode: "system",
});
```

---


### `destroySharedWorkerUrl(): void`
Release the shared worker's blob URL.

Revokes the object URL created for the shared worker script and resets the
cached URL, so a subsequent createSharedWorkerSync call creates a
fresh worker. Safe to call multiple times; it is a no-op when no URL is
cached.

**Returns** `void`

---


### `emitDiagnostic(diagnostic, options?): void`
Emit a diagnostic to the console.

Developer-facing Theme Kit diagnostics go through here rather than calling
`console` directly, so that the level, the code, the deduplication and the
development/production formatting stay consistent across packages.

Repeated identical diagnostics are suppressed by default; see
EmitDiagnosticOptions.dedupe. Use resetDiagnosticEmission to
clear that memory.

**See also:** `createDiagnostic`, `formatDiagnostic`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `diagnostic` | `ThemeDiagnostic` | The diagnostic to emit. |
| `options` | `EmitDiagnosticOptions` (optional) | Environment, deduplication and sink overrides. |

**Returns** `void`

---


### `evaluateExpression(expr): string`
Evaluate a numeric arithmetic expression and return the result as a string.

Supports `+`, `-`, `*`, `/`, parentheses, and an optional trailing CSS unit
(e.g. `"1.5 * 2rem"` → `"3rem"`). Integer results are returned without a
decimal point; non-integer results are rounded to two decimals. When the
input is not a valid expression, or evaluation fails, the original string is
returned unchanged.

**See also:** `isExpression`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `expr` | `string` | The expression string to evaluate. |

**Returns** `string` — The evaluated result string, or `expr` unchanged when it cannot be
  evaluated.

---


### `extendTheme<TName extends string, TBase extends ThemeDefinition<string>>(name, base, overrides?): ThemeDefinition<TName>`
Create a new theme by extending a base theme with overrides, merging
   token groups recursively.

**See also:** `defineTheme`, `mergeTokens`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `TName` | — |
| `base` | `TBase` | — |
| `overrides` | `TokenOverrides & { meta?: Partial<ThemeMeta> }` (optional) | — |

**Returns** `ThemeDefinition<TName>`

---


### `flattenTokens(tokens): Record<string, string>`
Flatten a theme's token groups into a single dot-path → value map.

Nested token objects are flattened with dot-separated paths (e.g.
`colors.primary`, `typography.fontSizes.base`). Only string values are
included; non-string values are skipped. The result is the lookup surface
used to resolve token references.

**See also:** `resolveTokens`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `tokens` | `ThemeTokens` | The theme token groups to flatten. |

**Returns** `Record<string, string>` — A flat map of dot-path keys to string token values.

---


### `formatDiagnostic(diagnostic, options?): string`
Render a diagnostic as a single log line.

This is the environment-specific half of the model: the diagnostic itself is
plain data, and this decides how much of it a given environment should see.
In development the context, hint and docs link are appended, because that is
where they are actionable. Outside development the message is emitted alone —
the failure is never hidden, but the surrounding detail is not shipped to end
users.

**See also:** `emitDiagnostic`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `diagnostic` | `ThemeDiagnostic` | The diagnostic to render. |
| `options` | `{ dev?: boolean }` (optional) | `dev` overrides environment detection. Intended for tests and for callers that already know which build they are in. |

**Returns** `string` — A single-line, prefixed string.

---


### `generateTheme(options): GeneratedThemePair`
Generate a cohesive light/dark theme pair from a single seed color.

The seed drives the primary, accent, and supporting surface colors; the
foreground colors are chosen for contrast so generated themes stay
accessible regardless of the seed's lightness. When `withCode` is set, a
matching syntax-highlighting palette is also produced.

**See also:** `validateTheme`, `defineTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `GenerateThemeOptions` | The seed color and generation options. |

**Returns** `GeneratedThemePair` — A `{ light, dark }` pair of theme definitions sharing one family.

```ts
const { light, dark } = generateTheme({ seed: "#d97706", family: "brand" });
```

---


### `getAccessibilityProfiles(): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }[]`
Build the accessibility profile theme set: high-contrast and large-text
themes for both light and dark modes.

**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }[]` — An array of four accessibility theme definitions.

---


### `getBrandPresets(): { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }[]`
Build the brand preset theme set: a light and dark theme for each brand
(Apple, GitHub, Vercel, Slack, Discord), using each brand's signature colors.

**Returns** `{ meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }[]` — An array of brand theme definitions, one light and one dark per
  brand.

---


### `getBrowserTimeZone(): string | null`
Detect the visitor's IANA timezone, e.g. `"Asia/Kathmandu"`. Returns `null`
 when `Intl` is unavailable or reports an empty zone.

**Returns** `string | null`

---


### `getBuiltInThemes(): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } } | { meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens } | { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }[]`
Build the complete set of built-in themes shipped with Theme Kit.

Combines the neutral themes, preset themes, brand presets, and accessibility
profiles into a single array ready to be registered with a theme runtime.

**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } } | { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } } | { meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } } | { meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens } | { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }[]` — An array of all built-in theme definitions.

---


### `getContrastRatio(foreground, background): number`
Compute the WCAG contrast ratio between two colors.

The ratio is `(L1 + 0.05) / (L2 + 0.05)` where `L1`/`L2` are the relative
luminances of the lighter and darker colors, yielding a value in the range
1 (identical colors) to 21 (black on white). Colors are parsed as hex.

**See also:** `validateThemeContrast`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `foreground` | `string` | The foreground color (hex). |
| `background` | `string` | The background color (hex). |

**Returns** `number` — The contrast ratio, a number between 1 and 21.

---


### `getDefaultThemes(): { meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string }; radius: { lg: string } } }[]`
Build the default theme family set: a light and dark theme for each of the
built-in color families (oat, berry, mint, citrus, cocoa, plum).

**Returns** `{ meta: { family: string; label: string; mode: "light" | "dark"; order: number }; name: `${unknown}` | `${unknown}`; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string }; radius: { lg: string } } }[]` — An array of `ThemeDefinition` objects, one light and one dark per
  family, ready to be registered with a theme runtime.

---


### `getHighContrastTheme(mode): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }`
Build a high-contrast theme for the given mode.

Uses maximum-contrast colors (pure black/white surfaces, saturated primary)
to maximize legibility for users with low vision.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `mode` | `"light" \| "dark"` | The color mode of the theme. |

**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "high-contrast-light" | "high-contrast-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string } } }` — A high-contrast theme definition tagged `"accessibility"` and
  `"high-contrast"`.

---


### `getLargeTextTheme(mode): { meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }`
Build a large-text theme for the given mode.

Enlarges the typography scale and uses high-contrast colors so text remains
readable for users who need larger type.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `mode` | `"light" \| "dark"` | The color mode of the theme. |

**Returns** `{ meta: { label: string; mode: "light" | "dark"; order: number; tags: string[] }; name: "large-text-light" | "large-text-dark"; tokens: { colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { lg: string }; typography: { fontFamilies: { mono: string; sans: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; 6xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { normal: string; relaxed: string; tight: string } } } }` — A large-text theme definition tagged `"accessibility"` and
  `"large-text"`.

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
Build the neutral light and dark themes.

These are the framework's baseline themes: a full token set (colors, radius,
spacing, shadows, border widths, z-index, breakpoints, typography, and code)
with no color family applied. They are the fallback when no family is
selected.

**Returns** `readonly [{ meta: { label: string; mode: "light"; order: number }; name: "light"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } }, { meta: { label: string; mode: "dark"; order: number }; name: "dark"; tokens: { borderWidths: { 0: string; 1: string; 2: string; 4: string; 8: string }; breakpoints: { 2xl: string; lg: string; md: string; sm: string; xl: string }; code: { attribute: string; background: string; border: string; comment: string; foreground: string; function: string; gutter: string; highlight: string; keyword: string; lineNumber: string; number: string; operator: string; property: string; punctuation: string; selection: string; string: string; tag: string; type: string; variable: string }; colors: { accent: string; accentForeground: string; background: string; border: string; card: string; cardForeground: string; destructive: string; destructiveForeground: string; foreground: string; input: string; muted: string; mutedForeground: string; popover: string; popoverForeground: string; primary: string; primaryForeground: string; ring: string; secondary: string; secondaryForeground: string; success: string; successForeground: string }; radius: { 2xl: string; full: string; lg: string; md: string; sm: string; xl: string }; shadows: { 2xl: string; lg: string; md: string; sm: string; xl: string; xs: string }; spacing: { 0: string; 0.5: string; 1: string; 1.5: string; 10: string; 11: string; 12: string; 14: string; 16: string; 2: string; 2.5: string; 20: string; 24: string; 3: string; 3.5: string; 4: string; 5: string; 6: string; 7: string; 8: string; 9: string; px: string }; typography: { fontFamilies: { mono: string; sans: string; serif: string }; fontSizes: { 2xl: string; 3xl: string; 4xl: string; 5xl: string; base: string; lg: string; sm: string; xl: string; xs: string }; lineHeights: { loose: string; none: string; normal: string; relaxed: string; snug: string; tight: string } }; zIndex: { 0: string; 10: string; 20: string; 30: string; 40: string; 50: string; auto: string } } }]` — A `[light, dark]` tuple of neutral theme definitions.

---


### `getPresetThemes(overrides?): { meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens }[]`
Build the curated preset theme set: a light and dark theme for each preset
color family (oat, berry, mint, citrus, cocoa, plum, iris, sky, graphite).

Each preset is a WCAG-conscious token set with per-palette foreground colors
chosen for readability. Optional per-family, per-mode token overrides are
applied on top of the base palettes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `overrides` | `Partial<Record<PresetFamily, Partial<Record<PresetVariant, PresetVariantOverride>>>>` (optional) | Optional per-family, per-mode token overrides. |

**Returns** `{ meta: { family: "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"; label: string; mode: "light" | "dark"; order: number }; name: "oat-light" | "oat-dark" | "berry-light" | "berry-dark" | "mint-light" | "mint-dark" | "citrus-light" | "citrus-dark" | "cocoa-light" | "cocoa-dark" | "plum-light" | "plum-dark" | "iris-light" | "iris-dark" | "sky-light" | "sky-dark" | "graphite-light" | "graphite-dark"; tokens: ThemeTokens }[]` — An array of preset theme definitions, one light and one dark per
  family.

---


### `getThemeFamily(theme): string`
Get a theme's family. Themes without `meta.family` belong to the
`"default"` family.

**See also:** `resolveThemeName`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |

**Returns** `string`

---


### `getThemeMode(theme): ThemeMode`
Get the color mode of a theme. Uses `meta.mode` when present; otherwise
infers it from the theme name (e.g. `"mint-dark"` → "dark"). This keeps
simple theme definitions working:
`[{ name: "light", ... }, { name: "dark", ... }]` resolve and toggle
correctly without requiring `meta.mode`.

**See also:** `resolveThemeName`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |

**Returns** `ThemeMode`

---


### `getTimeZoneList(): string[]`
All known timezone ids, sorted alphabetically. Useful for building pickers
 (the docs site uses it for its timezone selector).

**Returns** `string[]`

---


### `isExpression(value): boolean`
Determine whether a string is a numeric arithmetic expression.

An expression is a string containing `+`, `-`, `*`, or `/` over numbers and
parentheses, optionally ending in a CSS unit (e.g. `"1.5 * 2rem"`). Function
calls such as `contrast(...)` and `auto()` are not treated as expressions.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `value` | `string` | The string to test. |

**Returns** `boolean` — `true` when `value` is a numeric arithmetic expression.

---


### `isSettled(current, target, epsilon?): boolean`
True when two positions are close enough to consider the thumb "settled".

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `current` | `number` | — |
| `target` | `number` | — |
| `epsilon` | `number` (optional) | — |

**Returns** `boolean`

---


### `isThemeMode(value): value is ThemeMode`
Narrow an unknown value to a ThemeMode.

This is the single shared predicate for the light/dark/system axis. It is
exported so that adapters which receive a mode from outside the type system —
storage, cookies, cross-tab messages, element attributes — validate it the
same way instead of each re-implementing the comparison.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `value` | `unknown` | The value to test. |

**Returns** `value is ThemeMode` — `true` when `value` is a valid mode.

```ts
if (!isThemeMode(input)) {
  emitDiagnostic(createDiagnostic({ code: "TK_MODE_INVALID", level: "warning", message: "..." }));
}
```

---


### `mergePresetTokens(base, override?): ThemeTokens`
Merge a partial token override into a base token set.

Each token group is merged shallowly, so override values replace individual
keys while leaving unspecified keys from the base intact.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `ThemeTokens` | The base token set. |
| `override` | `Partial<ThemeTokens>` (optional) | Optional partial token groups to merge on top. |

**Returns** `ThemeTokens` — A new token set combining `base` and `override`.

---


### `mergeThemeDefinitions<Name extends string>(base, override): ThemeDefinition<Name>`
Merge two theme definitions, deep-merging their `meta` and `tokens`.

`override` wins for scalar fields; `meta` and `tokens` are merged via
mergeTokens semantics.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `ThemeDefinition<Name>` | Base definition (typically the inherited theme). |
| `override` | `ThemeDefinition<Name>` | Override definition (typically the theme's own). |

**Returns** `ThemeDefinition<Name>` — A new merged definition. The inputs are not mutated.

---


### `mergeTokens(base, override): ThemeTokens | undefined`
Merge two token objects, deep-merging the `colors` group and shallowly
merging every other group.

`override` wins over `base`. Within `colors`, an explicit `undefined`
value removes a key; nested color objects merge recursively. Groups not
present in either input are omitted from the result.

**See also:** `flattenTokens`, `resolveTokens`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `ThemeTokens \| undefined` | Base tokens (typically the inherited/extended theme's). |
| `override` | `ThemeTokens \| undefined` | Override tokens (typically the theme's own). |

**Returns** `ThemeTokens | undefined` — The merged tokens, or `undefined` when both inputs are empty.

---


### `migrateTheme(theme, options?): ThemeDefinition`
Migrate a legacy theme to the current Theme Kit format using registered
   migrations.

**See also:** `registerMigration`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | — |
| `options` | `MigrateOptions` (optional) | — |

**Returns** `ThemeDefinition`

---


### `parseCookieHeader(header): ParsedCookies`
Minimal RFC 6265 header parser — enough for the four theme cookies.

**See also:** `themeKitCookieNames`, `resolveThemeFromCookies`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `header` | `string` | — |

**Returns** `ParsedCookies`

---


### `prefersReducedMotion(): boolean`
Requested motion profile. Reduced motion snaps instantly.

**Returns** `boolean`

---


### `readBootstrapState<T extends ThemeDefinition<string>>(themes, target?): ThemeBootstrapState<T> | null`
Reads the pre-paint bootstrap's state back off the DOM, validated against the
theme registry.

**See also:** `createThemeBootstrapScript`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | The registry the `data-theme` name is validated against. |
| `target` | `Element \| null` (optional) | The element to read from. Defaults to `<html>`. |

**Returns** `ThemeBootstrapState<T> | null` — The validated state, or `null` when there is no DOM, no
  `data-theme`, or the name is not in the registry.

This is the *read* half of the bootstrap handoff. The blocking script writes
`data-theme` (resolved theme), `data-theme-selection-mode` /
`data-theme-selection-family` (the selection, which is not recoverable from
the resolved theme), `data-theme-ready`, and a
`window.__THEME_KIT_BOOTSTRAP__` payload.

It exists so a client runtime can **adopt** what was already painted instead
of re-deriving it: by the time a client renders, `<html>` is the authority on
what the visitor is looking at, and anything that re-resolves can disagree
with it. The result is validated against the registry rather than trusted as
an arbitrary string, so a stale or hand-written attribute cannot inject a
theme that does not exist.

---


### `readTransportedConfig<T extends ThemeDefinition<string>>(): ThemeBootstrapConfig<T> | null`
Reads the configuration a build integration transported to the runtime.

**See also:** `resolveRuntimeOptions`

**Returns** `ThemeBootstrapConfig<T> | null` — The transported configuration, or `null` when no integration ran.

A build integration (the Vite plugin, the Astro integration) puts the
ThemeBootstrapConfig projection of `theme.config.ts` on the global
scope before any application code runs. Reading it is what lets a provider
take no theme props — and it is the mechanism that makes "one declaration,
two consumers" true rather than aspirational.

`globalThis` rather than `window`, because the same read has to work during
SSR and prerender, where there is no `window`. The server entries set the
same global for exactly that reason.

---


### `registerMigration(step): void`
Register a migration for the theme migration system.

**See also:** `clearMigrations`, `migrateTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `step` | `MigrationStep` | — |

**Returns** `void`

---


### `resetDiagnosticEmission(): void`
Forget which diagnostics have already been emitted.

Deduplication is process-wide by design, which makes it stateful across
tests. Call this between test cases so each one observes its own emissions.

**Returns** `void`

```ts
beforeEach(() => resetDiagnosticEmission());
```

---


### `resolveInitialTheme<T extends ThemeDefinition<string>>(options): InitialThemeResolution<T>`
Resolves the initial theme and selection for a runtime bootstrap.

Combines `defaultTheme`, `family`, `mode`, and `prefersDark` into a
concrete theme, resolving `"system"` mode against `prefersDark` for the
theme lookup while keeping the `"system"` mode in the returned selection.

**See also:** `resolveSelection`, `resolveThemeName`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveInitialThemeOptions<T>` | Resolution inputs. |

**Returns** `InitialThemeResolution<T>` — The resolved theme and selection.

---


### `resolveRuntimeOptions<T extends ThemeDefinition<string>>(options?): Partial<ThemeRuntimeOptions<T>>`
Merges the transported configuration under a provider's own options.

**See also:** `readTransportedConfig`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `Partial<ThemeRuntimeOptions<T>>` (optional) | The provider's own options. These win, so a local override stays possible. |

**Returns** `Partial<ThemeRuntimeOptions<T>>` — The options a runtime should be created from.

The order is the contract: transported first, provider second. A provider
that supplies `themes` is overriding the application configuration, which is
legitimate for a test or a storybook but is otherwise the duplication this
whole mechanism exists to remove.

Provider options whose value is `undefined` are dropped rather than spread.
That is not a detail — Vue and Svelte hand the provider an object containing
*every* declared prop, with `undefined` for the ones the app did not pass, so
a plain spread would overwrite the transported value with `undefined` and the
provider would silently fall back to the built-in themes.

`themes` is always resolved to a non-empty array. `createThemeRuntime` falls
back to the built-in themes only when `themes` is `undefined`, so an empty
array — a provider given `themes={[]}`, or a config whose registry was
filtered to nothing — would otherwise produce a runtime with no registry at
all, which throws on the first selection.

An explicit empty array counts as *not set*, not as "no themes": the Web
Components provider parses an absent `themes` attribute into `[]`, and
treating that as an override would shadow the transported registry with
nothing.

```ts
const resolved = resolveRuntimeOptions<T>(props);
const runtime = createThemeRuntime(resolved);
```

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


### `resolveScopedTheme<T extends ThemeDefinition<string>>(themes, selection, prefersDark?): T`
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
| `prefersDark` | `boolean` (optional) | — |

**Returns** `T`

---


### `resolveScopedThemePrePaint<T extends ThemeDefinition<string>>(themes, selection, options?): ScopedThemePrePaint`
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
| `options` | `ScopedThemePrePaintOptions` (optional) | — |

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
| `parent` | `ThemeTransitionOptions \| undefined` | — |
| `local` | `boolean \| ThemeTransitionOptions \| undefined` | — |

**Returns** `ThemeTransitionOptions | undefined`

---


### `resolveSelectedTheme<T extends ThemeDefinition<string>>(themes, selection): T`
Resolve the registered theme that best matches a selection.

Prefers an exact family + mode match, then any theme in the family, then any
theme of the requested mode, then the first registered theme. Never throws;
the fallback chain guarantees a result for non-empty theme lists.

**See also:** `resolveThemeName`, `ThemeSelection`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly T[]` | Registered themes to search. |
| `selection` | `ThemeSelection` | The family + mode selection to match. |

**Returns** `T` — The selected theme definition.

---


### `resolveSelection<T extends ThemeDefinition<string>>(options): ThemeSelectionState`
Resolves a selection state from configuration inputs.

Priority: `persistedSelection` wins; otherwise the resolved family/mode
default to the fallback theme's own family/mode. The fallback theme is
`defaultTheme` when provided and registered, else the first theme.

The returned family is always one that exists in `themes`: a requested or
persisted family that is not registered is replaced by the fallback theme's
family. See normalizeThemeFamily for why that invariant matters.

**See also:** `resolveInitialTheme`, `resolveSelectionTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveSelectionOptions<T>` | Resolution inputs. |

**Returns** `ThemeSelectionState` — The resolved selection (family + mode).

---


### `resolveSelectionTheme<T extends ThemeDefinition<string>>(options): SelectionThemeResolution<T>`
Resolves the theme that matches an existing selection state.

Convenience wrapper around resolveInitialTheme for the common
case of re-applying a persisted or scoped selection.

**See also:** `resolveSelection`, `resolveSelectedTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveSelectionThemeOptions<T>` | Resolution inputs. |

**Returns** `SelectionThemeResolution<T>` — The matching theme and the normalized selection.

---


### `resolveSolarLocation(input?): ResolvedSolarLocation`
Resolve the coordinates a solar calculation should use.

Priority: explicit `latitude`/`longitude` → explicit `timeZone` →
browser timezone auto-detection → `DEFAULT_TIMEZONE_LOCATION`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `input` | `SolarLocationInput` (optional) | — |

**Returns** `ResolvedSolarLocation`

---


### `resolveTheme<Name extends string>(themes, themeName, resolveTokenRefs?): ThemeDefinition<Name>`
Resolve a theme definition to its fully inherited form.

Walks the `extends` chain (multiple parents merge in order), producing the
effective `meta` and `tokens`. When `resolveTokenRefs` is true, token
references (`${token.path}`) and derived expressions are also resolved.

**See also:** `mergeThemeDefinitions`, `resolveThemeRegistry`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<Name>[]` | All registered themes. |
| `themeName` | `Name` | Name of the theme to resolve. |
| `resolveTokenRefs` | `boolean` (optional) | Whether to resolve token references in the result. Default `true`. |

**Returns** `ThemeDefinition<Name>` — The resolved theme definition.

---


### `resolveThemeFromCookies<T extends ThemeDefinition<string>>(options): InitialThemeResolution<T>`
SSR-first theme resolution. Reads the four theme cookies from the request,
rejects them when the config fingerprint is stale, and resolves the initial
theme for the effective selection — exactly like `@theme-kit/next`'s
`getInitialThemeState`.

The resolved `<html>` state (theme name, family, mode) can then be rendered
server-side so the browser paints already themed.

**See also:** `createNuxtThemeBootstrapScript`, `parseCookieHeader`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ResolveThemeFromCookiesOptions<T>` | — |

**Returns** `InitialThemeResolution<T>`

---


### `resolveThemeName<Name extends string>(themes, family, mode, prefersDark?): Name`
Resolve the theme name that best matches a family + mode selection.

Looks up the theme in `family` whose mode matches the requested mode,
honoring `prefersDark` when `mode` is `"system"`. Falls back to the
family's light theme, then the family's first theme, then the first
theme overall.

**See also:** `getThemeFamily`, `getThemeMode`, `resolveSelectedTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<Name>[]` | Registered themes to search. |
| `family` | `string` | Family to resolve within. |
| `mode` | `ThemeMode` | Requested mode; `"system"` resolves via `prefersDark`. |
| `prefersDark` | `boolean` (optional) | Whether the visitor prefers dark mode. Used only when `mode` is `"system"`. Default `false`. |

**Returns** `Name` — The resolved theme name.

---


### `resolveThemeRegistry<T extends ThemeDefinition<string>>(options?): readonly T[]`
Resolves the effective theme list for a registry configuration.

Returns the provided themes when non-empty; otherwise falls back to the
built-in themes.

**See also:** `ThemeRegistry`, `getBuiltInThemes`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeRegistryOptions<T>` (optional) | Registry configuration. |

**Returns** `readonly T[]` — The effective theme definitions.

---


### `resolveTokens(tokens): ThemeTokens`
Resolve a theme's token groups, evaluating expressions and references
   into concrete values.

**See also:** `flattenTokens`, `evaluateExpression`

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


### `scopeToCSSVariables(themeVars, prefix?): Record<string, string>`
Mirror the scoped binding's aliases (the `--color-*` / `--radius-*` tokens
 Tailwind-style utilities resolve against) so styling utilities on scoped
 elements use the scoped theme's values, not the page theme's.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themeVars` | `Record<string, string>` | — |
| `prefix` | `string` (optional) | — |

**Returns** `Record<string, string>`

---


### `simulateCVD(hex, type): string`
Simulate how a color appears to someone with the given color vision
deficiency.

Converts the color to linear RGB, transforms it through the LMS cone space,
collapses the affected cone channel (or, for achromatopsia, reduces to
luminance), and converts back to a hex string. Non-hex input is returned
unchanged.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `hex` | `string` | The hex color to simulate. |
| `type` | `CVDType` | The CVD type to simulate. |

**Returns** `string` — The simulated hex color, or `hex` unchanged when it is not a hex
  color.

---


### `simulateThemeForCVD(theme, type): ThemeDefinition`
Produce a copy of a theme whose color tokens are simulated for the given
color vision deficiency.

Every hex color in `tokens.colors` is passed through simulateCVD;
non-color tokens and non-hex values are preserved. The returned theme is a
new object and the input is not mutated. Themes without color tokens are
returned unchanged.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | The theme definition to simulate. |
| `type` | `CVDType` | The CVD type to simulate. |

**Returns** `ThemeDefinition` — A new theme definition with simulated color tokens.

---


### `systemModeCSSTemplate(light, dark): string`
Generate the stylesheet that resolves a `"system"` selection with CSS alone —
no script and no inline style.

**See also:** `darkModeCSSTemplate`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `light` | `Record<string, string>` | The light theme's CSS variables. |
| `dark` | `Record<string, string>` | The dark theme's CSS variables. |

**Returns** `string` — Two media blocks, one per scheme, both targeting `:root`.

Use this **instead of** inlining the resolved variables whenever the mode is
`"system"`. The two cannot be combined: an inline `style` on `<html>`
outranks any stylesheet rule, so a page that inlines the light variables and
also emits a dark media block paints light whatever the OS prefers. Measured
on a production build with page scripts blocked and the OS set to dark, that
combination painted `rgb(248, 250, 252)` (light); emitting both media blocks
and no inline variables painted `rgb(2, 6, 23)`.

`prefers-color-scheme: light` also matches when the visitor has expressed no
preference — `light` is the specified default — so the light block doubles as
the no-preference branch.

---


### `themeToCSSVariables(theme, options?): Record<string, string>`
Flatten a theme's semantic tokens into CSS custom properties
(`--theme-*`), optionally filtered by token group.

**See also:** `flattenTokens`, `ThemeToCSSVariablesOptions`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | Theme whose tokens are flattened. |
| `options` | `ThemeToCSSVariablesOptions` (optional) | Emission options (prefix, group filter). |

**Returns** `Record<string, string>` — A flat map of CSS custom property name → value.

Pass `{ groups: ["colors"] }` to emit only specific token groups.

```ts
const vars = themeToCSSVariables(theme); // { "--theme-color-background": "#fff", ... }
```

---


### `toBootstrapConfig<T extends ThemeDefinition<string>>(config): ThemeBootstrapConfig<T>`
Projects a ThemeKitConfig down to what the pre-paint bootstrap needs.

**See also:** `ThemeBootstrapConfig`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `config` | `ThemeKitConfig<T>` | The full application configuration. |

**Returns** `ThemeBootstrapConfig<T>` — The bootstrap subset.

---


### `useTheme<T extends ThemeDefinition<string>>(): { family: Ref<string, string>; mode: Ref<ThemeMode, ThemeMode>; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: Ref<T, T>; toggleTheme: __type(): void }`
Reactive access to the active theme, mode, and family plus selection
controls.

Call inside Vue `setup` scope within a `<ThemeProvider>`. Returns reactive
refs for `theme`, `mode`, and `family`, along with `setMode`, `setFamily`,
and `toggleTheme` helpers that operate on the runtime's selection.

**See also:** `useThemeValue`, `useThemeMode`, `useThemeFamily`

**Returns** `{ family: Ref<string, string>; mode: Ref<ThemeMode, ThemeMode>; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: Ref<T, T>; toggleTheme: __type(): void }` — An object of reactive state and selection helpers.

```ts
const { theme, mode, family, setMode, toggleTheme } = useTheme();
```

---


### `useThemeBatch(): __type(callback: __type(): void): void`
Returns a function that batches multiple runtime mutations into a single
history entry and notification.

Call inside Vue `setup` scope within a `<ThemeProvider>`.

**See also:** `useThemeSnapshot`, `useTheme`

**Returns** `__type(callback: __type(): void): void` — A batch function taking a callback to run inside the batch.

---


### `useThemeFamily(): Ref<string, string>`
Reactive ref of the current theme family.

Call inside Vue `setup` scope within a `<ThemeProvider>`. The returned ref
tracks both store and selection changes and is cleaned up on unmount.

**See also:** `useThemeMode`, `useTheme`

**Returns** `Ref<string, string>` — A `Ref` holding the current theme family.

---


### `useThemeHistory<T extends ThemeDefinition<string>>(): { canRedo: Ref<boolean, boolean>; canUndo: Ref<boolean, boolean>; clear: __type(): void; history: Ref<readonly { theme: UnwrapRef<T>; timestamp: number }[], readonly HistoryEntry<T>[] | readonly { theme: UnwrapRef<T>; timestamp: number }[]>; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void }`
Reactive access to the runtime's theme history (undo/redo).

Call inside Vue `setup` scope within a `<ThemeProvider>`. Returns reactive
`canUndo`, `canRedo`, and `history` refs plus `undo`, `redo`, `clear`, and
`jump` actions that operate on the runtime's history.

**See also:** `useThemeSnapshot`, `useThemeRestore`, `useThemeBatch`

**Returns** `{ canRedo: Ref<boolean, boolean>; canUndo: Ref<boolean, boolean>; clear: __type(): void; history: Ref<readonly { theme: UnwrapRef<T>; timestamp: number }[], readonly HistoryEntry<T>[] | readonly { theme: UnwrapRef<T>; timestamp: number }[]>; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void }` — An object of reactive history state and actions.

---


### `useThemeLifecycle(): { on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`
Returns an object for subscribing to runtime lifecycle events.

Call inside Vue `setup` scope within a `<ThemeProvider>`.

**See also:** `useThemeRuntime`, `useTheme`

**Returns** `{ on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }` — An object with an `on` method to register a lifecycle listener.

---


### `useThemeMode(): Ref<ThemeMode, ThemeMode>`
Reactive ref of the current theme mode (`system`, `light`, or `dark`).

Call inside Vue `setup` scope within a `<ThemeProvider>`. The returned ref
tracks both store and selection changes and is cleaned up on unmount.

**See also:** `useThemeFamily`, `useTheme`

**Returns** `Ref<ThemeMode, ThemeMode>` — A `Ref` holding the current mode.

---


### `useThemePacks(): __type(pack: ThemePack<any>): void`
Returns a function that installs a theme pack onto the runtime.

Call inside Vue `setup` scope within a `<ThemeProvider>`.

**See also:** `useThemeRuntime`, `useTheme`

**Returns** `__type(pack: ThemePack<any>): void` — A function taking a theme pack to install.

---


### `useThemeRestore(): __type(snapshot: ThemeRuntimeSnapshot<ThemeDefinition<string>>): void`
Returns a function that restores the runtime to a previously captured
snapshot.

Call inside Vue `setup` scope within a `<ThemeProvider>`.

**See also:** `useThemeSnapshot`

**Returns** `__type(snapshot: ThemeRuntimeSnapshot<ThemeDefinition<string>>): void` — A function taking a snapshot to restore.

---


### `useThemeRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
Resolves the active Theme Kit runtime from the Vue injection context.

Call inside Vue `setup` scope, within a component that is a descendant of a
`<ThemeProvider>` (or after provideThemeRuntime).

**See also:** `provideThemeRuntime`, `ThemeProvider`, `useThemeValue`

**Returns** `ThemeRuntime<T>` — The injected runtime.

```ts
const runtime = useThemeRuntime();
runtime.selection.setMode("dark");
```

---


### `useThemeSchedule<T extends ThemeDefinition<string>>(): ThemeScheduleController`
Reactive access to the runtime's sunrise/sunset scheduling controller.

Requires the runtime (or `<ThemeProvider>`) to be created with the
`scheduled` option. The returned `state` ref tracks `enabled`, `status`,
`active`, `sunrise`/`sunset` and the next transition; `enable()`/`disable()`
/`set()` control the engine.

```vue
<script setup lang="ts">
const schedule = useThemeSchedule();
</script>
```

**Returns** `ThemeScheduleController`

---


### `useThemeSnapshot(): __type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>`
Returns a function that captures a serializable snapshot of the runtime's
current state.

Call inside Vue `setup` scope within a `<ThemeProvider>`.

**See also:** `useThemeRestore`

**Returns** `__type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>` — A function returning the current runtime snapshot.

---


### `useThemeTokens<T extends ThemeDefinition<string>>(): Ref<ThemeTokens | undefined, ThemeTokens | undefined>`
Reactive ref of the active theme's token group.

Call inside Vue `setup` scope within a `<ThemeProvider>`. The returned ref
updates as the active theme changes and is cleaned up on unmount.

**See also:** `useThemeValue`

**Returns** `Ref<ThemeTokens | undefined, ThemeTokens | undefined>` — A `Ref` holding the active theme's tokens, or `undefined` when the
  theme defines none.

---


### `useThemeValue<T extends ThemeDefinition<string>>(): Ref<T, T>`
Reactive ref of the currently selected theme definition.

Call inside Vue `setup` scope within a `<ThemeProvider>`. The returned ref
updates whenever the active theme changes and is cleaned up on unmount.

**See also:** `useTheme`, `useThemeTokens`

**Returns** `Ref<T, T>` — A `Ref` holding the active theme.

---


### `validateTheme(theme, options?): ValidationResult`
Validate a theme definition against the Theme Kit schema.

Checks that the definition declares a `tokens` object and that every required
semantic colour token is present. It deliberately does **not** resolve token
references and does not check contrast: unresolved references are reported by
token resolution (which throws), and contrast has its own validator,
`validateThemeContrast`.

Returns issues rather than throwing, so a caller can report every problem at
once — the CLI does exactly this.

**See also:** `ValidationIssue`, `generateTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | The theme definition to validate. |
| `options` | `ValidateThemeOptions` (optional) | Optional registry used to resolve the theme by name first. |

**Returns** `ValidationResult` — `{ valid, issues }`, where `valid` is `true` when `issues` is empty.

---


### `validateThemeContrast(theme, options?): ContrastValidationResult`
Validate a theme's semantic color pairs against WCAG contrast thresholds.

Checks the standard foreground/background pairs (e.g. `foreground` on
`background`, `primaryForeground` on `primary`) and reports each pair's
ratio and whether it passes WCAG AA/AAA for normal and large text. Pairs
whose colors are missing or not hex are skipped. The theme is considered
valid when every checked pair passes WCAG AA for normal text.

**See also:** `getContrastRatio`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `theme` | `ThemeDefinition` | The theme definition to check. |
| `options` | `ValidateThemeContrastOptions` (optional) | Optional configuration. |

**Returns** `ContrastValidationResult` — A ContrastValidationResult with per-pair checks.

---

## Classes

### `class ThemeError`

**Extends** `Error`
The error type thrown by Theme Kit for theme-related failures.

Extends the native `Error` and sets `name` to `"ThemeError"` so callers can
distinguish Theme Kit failures from other errors via `instanceof` or the
`name` property. The `message` carries the human-readable failure detail.

When the failure corresponds to a diagnostic, the error also carries the
stable ThemeError.code and its structured context, so a caller can
branch on the code rather than matching on prose. Both are optional: the
single-argument form remains valid.

**See also:** `ThemeError.fromDiagnostic`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeError` | — |
| `cause` (optional) | `unknown` | — |
| readonly `code` (optional) | `ThemeDiagnosticCode` | Stable diagnostic code, or `undefined` for a plain Theme Kit failure. |
| readonly `context` (optional) | `ThemeDiagnosticContext` | Structured context describing the failure, when available. |
| `message` | `string` | — |
| `name` | `string` | — |
| `stack` (optional) | `string` | — |
| `stackTraceLimit` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. |
| `captureStackTrace` | `void` | — |
| `fromDiagnostic` | `ThemeError` | — |
| `prepareStackTrace` | `any` | — |

```ts
const diagnostic = createDiagnostic({
  code: "TK_MODE_INVALID",
  level: "warning",
  message: 'setMode() received an unknown mode "purple".',
  context: { api: "setMode", property: "mode", received: "purple" },
});

// A caller that treats this as fatal rather than recoverable:
throw ThemeError.fromDiagnostic(diagnostic);
```

---


### `class ThemeRegistry<T extends ThemeDefinition>`
A collection of registered theme definitions with deduplication,
inheritance-ready metadata stamps, and family queries.

The registry stores theme *definitions*; resolution of `extends` chains
and token references happens separately via resolveTheme.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeRegistry<T>` | — |
| `themes` | `void` | — |
| `clear` | `void` | — |
| `destroy` | `void` | — |
| `get` | `T \| undefined` | — |
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
Options for createAccessibilityPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `level` (optional) | `"AA" \| "AAA"` | Target WCAG contrast level. |
| `onViolation` (optional) | `__type(result: { checks: ContrastCheck[]; themeName: string }): void` | Invoked with the theme name and failing contrast checks whenever a contrast violation is detected. |
| `warnOnly` (optional) | `boolean` | When `true`, contrast violations are reported at warning level; when `false`, they are reported at error level. Default `true`. |

---


### `AdapterPlugin`
A plugin that refines or transforms the output of a library adapter.

`refine` receives the refined semantic state and may return updates to it;
`transform` receives the generated library variables and must return the
final set. Both hooks are optional.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `id` (optional) | `string` | Optional identifier for the plugin. |
| `refine` (optional) | `void \| Record<string, unknown>` | — |
| `transform` (optional) | `Record<string, string>` | — |

---


### `AdapterPluginContext`
The context passed to an adapter plugin's hooks. Describes how faithfully
the adapter should reproduce the target library's native feel and the
current theme mode.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `mode` | `"light" \| "dark" \| "system" \| undefined` | The current theme mode, or `undefined` when no mode is resolved. |
| `strategy` | `AdapterStrategy` | How faithfully the adapter reproduces the target library's native feel. |

---


### `AdapterRegistration`
A successful registration returned by `AdapterRegistry.use`. Calling
`dispose()` removes exactly the adapter instance it was created for — but
only when its own reference count drops to zero. This makes composition
(React Strict Mode, Svelte lifecycles, nested providers) deterministic.

**See also:** `AdapterRegistry`

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `id` | `string` | The registered adapter's id. |
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

**See also:** `ThemeAdapter`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `list` | `readonly ThemeAdapter<T>[]` | — |
| `unuse` | `boolean` | — |
| `use` | `AdapterRegistration` | — |

---


### `AnimationsPluginOptions`
Options for createAnimationsPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `element` (optional) | `HTMLElement` | Element to which the transition is applied. Defaults to `document.documentElement` in browser environments; `null` (no-op) in non-browser environments. |
| `transition` (optional) | `ThemeTransitionOptions` | CSS transition applied to the target element during theme changes. When omitted, a default transition of `300ms` `ease-in-out` over `all` properties is used, with View Transitions explicitly disabled. |

---


### `BroadcastChannelLike<T>`
A minimal subset of the `BroadcastChannel` API used by the broadcast
adapters. Accepts any object with the same shape, enabling custom or
polyfilled channels.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `addEventListener` | `void` | — |
| `close` | `void` | — |
| `postMessage` | `void` | — |
| `removeEventListener` | `void` | — |

---


### `BroadcastPluginOptions`
Options for createBroadcastPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapter` (optional) | `{ destroy?: void; onMessage: void; postMessage: void } \| null` | Custom broadcast adapter. When omitted, a `BroadcastChannel`-based adapter is used when available; otherwise the plugin is inert. Pass `null` to disable broadcasting. |
| `channelName` (optional) | `string` | Name of the `BroadcastChannel` used by the default adapter. Default `"theme-selection"`. |

---


### `BuildThemeCssMapOptions`
Options for buildThemeCssMap.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `prefix` (optional) | `string` | CSS custom property prefix applied to every emitted variable. |

---


### `CodeTokens`
Semantic colors for code and syntax surfaces.

Use this group when the application renders syntax-highlighted code,
terminals, editors, or documentation code blocks.

This token group is opt-in. Themes that do not define `code` do not emit
`--theme-code-*` CSS variables.

**See also:** `ThemeTokens`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `attribute` (optional) | `string` | Attribute color (markup). |
| `background` (optional) | `string` | Code surface background. |
| `border` (optional) | `string` | Border or divider color around code surfaces. |
| `comment` (optional) | `string` | Comment / documentation text color. |
| `foreground` (optional) | `string` | Default code text color. |
| `function` (optional) | `string` | Function / method name color. |
| `gutter` (optional) | `string` | Gutter background. |
| `highlight` (optional) | `string` | Highlighted line / token background. |
| `keyword` (optional) | `string` | Language keyword color. |
| `lineNumber` (optional) | `string` | Line number gutter text color. |
| `number` (optional) | `string` | Numeric literal color. |
| `operator` (optional) | `string` | Operator color. |
| `property` (optional) | `string` | Object property color. |
| `punctuation` (optional) | `string` | Punctuation color. |
| `selection` (optional) | `string` | Text selection highlight. |
| `string` (optional) | `string` | String literal color. |
| `tag` (optional) | `string` | Tag name color (markup). |
| `type` (optional) | `string` | Type / class name color. |
| `variable` (optional) | `string` | Variable identifier color. |

---


### `ContrastCheck`
The result of a single foreground/background contrast check.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `background` | `string` | The resolved background color. |
| `backgroundToken` | `string` | The background token name checked. |
| `foreground` | `string` | The resolved foreground color. |
| `foregroundToken` | `string` | The foreground token name checked. |
| `passesAAALarge` | `boolean` | Whether the pair meets WCAG AAA for large text (ratio ≥ 4.5). |
| `passesAAANormal` | `boolean` | Whether the pair meets WCAG AAA for normal text (ratio ≥ 7.0). |
| `passesAALarge` | `boolean` | Whether the pair meets WCAG AA for large text (ratio ≥ 3.0). |
| `passesAANormal` | `boolean` | Whether the pair meets WCAG AA for normal text (ratio ≥ 4.5). |
| `ratio` | `number` | The WCAG contrast ratio (1 to 21). |

---


### `ContrastValidationResult`
The outcome of validating a theme's color contrast.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `checks` | `ContrastCheck[]` | The per-pair contrast checks performed. |
| `valid` | `boolean` | `true` when every checked pair passes WCAG AA for normal text. |

---


### `CreateDiagnosticInput`
Input accepted by createDiagnostic.

`code`, `level` and `message` are required; everything else is optional so a
diagnostic carries only what it knows.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `cause` (optional) | `unknown` | The underlying error, when this reports a failure. |
| `code` | `ThemeDiagnosticCode` | Stable identifier for this diagnostic. |
| `context` (optional) | `ThemeDiagnosticContext` | Structured context, when available. |
| `hint` (optional) | `string` | What to do instead. |
| `level` | `ThemeDiagnosticLevel` | Severity, chosen deliberately rather than defaulted. |
| `message` | `string` | Concise, actionable description of what is wrong. |

---


### `CSSVariablesOptions`
Options for createCSSVariablesBinding.

The binding keeps CSS custom properties (`--theme-*`) on a target element
(default `<html>`) in sync with the store, applying the current theme
immediately on creation and diffing subsequent updates. It can write
variables inline on the target or into a single `<style>` element wrapped
in a cascade layer.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `layerName` (optional) | `string` | Cascade layer name used when `styleSheet` is enabled. |
| `onBeforeSwap` (optional) | `__type(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }): void` | Applied inside the single View Transition lightswitch right before the CSS variables are swapped, so the old snapshot shows the old attributes AND old colors together. Lets a co-binding (e.g. the DOM binding's `apply`) stay in sync with the crossfade instead of starting its own View Transition (which would skip/abort the first one). |
| `prefix` (optional) | `string` | Prefix for the emitted custom properties. |
| `styleSheet` (optional) | `boolean` | When `true`, write variables into a `<style>` element (in a cascade layer) instead of inline on the target. |
| `target` (optional) | `HTMLElement` | Element to write the CSS variables onto. |
| `transition` (optional) | `ThemeTransitionOptions` | Transition applied when the theme changes. When omitted, the default theme transition is used. |

---


### `DebuggerPluginOptions`
Options for createDebuggerPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `label` (optional) | `string` | Prefix used for all debug log output. Default `"[theme-kit:debug]"`. |
| `logHistory` (optional) | `boolean` | Log history events. Default `false`. |
| `logPersistence` (optional) | `boolean` | Log theme selection persistence events. Default `true`. |
| `logThemeChanges` (optional) | `boolean` | Log theme changes to the console. Default `true`. |
| `logTokenUpdates` (optional) | `boolean` | Log active theme tokens after a theme change. Default `true`. |

---


### `DevToolsPluginOptions`
Options for createDevToolsPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `enabled` (optional) | `boolean` | Whether the plugin exposes runtime state to the browser devtools. Default `true`. |

---


### `DOMBindingOptions`
Options for createDOMBinding.

The binding syncs the store theme to the DOM — `data-theme`,
`data-theme-mode`, `data-theme-family`, the `dark` class and the
`color-scheme` style — with optional transition support. It requires a
target element; when none is available the binding is not created.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `attributeName` (optional) | `string` | Attribute name used to expose the theme name. |
| `selection` (optional) | `DOMSelectionSource \| null` | Mirrors the visitor's **selection** onto `data-theme-selection-mode` and `data-theme-selection-family`. When omitted, neither attribute is written. |
| `subscribe` (optional) | `boolean` | Subscribe to the store on its own. Default `true`; disable when the owner (e.g. the CSS-variables binding) drives DOM updates through its transition pipeline instead. |
| `target` (optional) | `HTMLElement` | Element to apply the theme attributes/classes to. |
| `transition` (optional) | `ThemeTransitionOptions` | Transition applied when the theme changes. When omitted, changes are applied instantly. |

---


### `EmitDiagnosticOptions`
Options for emitDiagnostic.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `dedupe` (optional) | `boolean` | Whether to suppress a diagnostic already emitted with the same code and context. Default `true`. Reactive paths call the same API on every render or every store update, so without this a single mistake floods the console. The first occurrence is the informative one. |
| `dev` (optional) | `boolean` | Override environment detection. |
| `sink` (optional) | `DiagnosticSink` | Where to write. Defaults to the matching `console` method for the level. |

---


### `GeneratedThemePair`
The light and dark themes produced by generateTheme.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `dark` | `ThemeDefinition` | The generated dark theme. |
| `light` | `ThemeDefinition` | The generated light theme. |

---


### `GenerateThemeOptions`
Options for generateTheme.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` (optional) | `string` | Theme family name used for the generated themes' `meta.family` and names. |
| `seed` | `string` | Hex color seed (e.g. `"#d97706"`) that drives the generated palette. |
| `withCode` (optional) | `boolean` | Also generate a `tokens.code` block (syntax-highlighting colors) alongside the color tokens. Opt-in — most themes don't need code tokens. |

---


### `GenerationPluginOptions`
Options for createGenerationPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `onGenerate` (optional) | `__type(options: GenerateThemeOptions): void` | Callback invoked with the options used to generate a theme. |

---


### `HistoryEntry<T extends ThemeDefinition>`
A single recorded theme state.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `theme` | `T` | The theme state at this point in history. |
| `timestamp` | `number` | Epoch-milliseconds timestamp of when the entry was recorded. |

---


### `HistoryPluginOptions`
Options for createHistoryPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `maxSteps` (optional) | `number` | Maximum number of theme selections retained in history. Default `50`. |

---


### `InitialThemeResolution<T extends ThemeDefinition>`
The result of initial theme resolution: the resolved theme plus the
resolved selection state.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `selection` | `ThemeSelectionState` | The resolved selection (family + mode). |
| `theme` | `T` | The theme to activate. |

---


### `MigrateOptions`
Options for migrateTheme.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `targetVersion` (optional) | `string` | The version to migrate the theme to. |

---


### `MigrationStep`
A single step in the theme migration chain, moving themes from one version
to the next.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `description` | `string` | Human-readable description of what the step changes. |
| `from` | `string` | The version this step migrates from. |
| `migrate` (optional) | `__type(theme: ThemeDefinition): ThemeDefinition` | Optional custom transformation applied to the theme. |
| `remapColors` (optional) | `TokenRemap[]` | Optional color token renames applied to `tokens.colors`. |
| `to` | `string` | The version this step migrates to. |

---


### `ModuleOptions`
Configuration options for the `@theme-kit/nuxt` module, set under the
`themeKit` key in `nuxt.config.ts`. The module installs an app-wide theme
runtime, registers the theme components and composables, and wires the
SSR-first cookie contract so the browser paints already themed.

**See also:** `ResolveThemeFromCookiesOptions`, `NuxtThemeBootstrapOptions`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `string` | Fallback theme name when no selection is persisted. |
| `initialFamily` (optional) | `string` | Initial theme family when no selection is persisted. |
| `initialMode` (optional) | `ThemeMode` | Initial mode: `"light"`, `"dark"` or `"system"`. Default `"system"`. |
| `scheduled` (optional) | `false \| ThemeScheduleOptions<ThemeDefinition<string>>` | Sunrise/sunset scheduling. Pass `{ lightTheme, darkTheme, latitude, longitude, ... }` to auto-switch between a light and a dark theme at sunrise/sunset. `false` (default) disables scheduling. Use `useThemeSchedule()` to read `enabled`/`status`/`sunrise`/`sunset` and to enable or disable the schedule reactively. |
| `scrollbar` (optional) | `boolean \| PrePaintScrollbarOptions` | Custom scrollbar bootstrap. `true` (or options) emits the pre-paint CSS and the `tk-scrollbar` class on `<html>` so the native scrollbar is hidden from first paint; mount `<ThemeScrollbar />` to create the overlay engine (shared with every framework). |
| `storageKey` (optional) | `string` | localStorage key holding the persisted selection. Default `"theme-selection"`. |
| `themes` (optional) | `ThemeDefinition<string>[]` | Theme registry. Defaults to the built-in themes when omitted. |
| `transition` (optional) | `boolean \| ThemeTransitionOptions` | Theme transitions. `false` disables them; `true` (or an options object) enables smooth cross-fades on theme changes through the shared `@theme-kit/core` transition engine. |

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  themeKit: {
    defaultTheme: "light",
    initialMode: "system",
    scrollbar: true,
  },
});
```

---


### `MultiWindowSyncOptions`
Options for createMultiWindowSync.

Controls which cross-tab synchronization strategy is preferred and how
fallbacks are reported.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `channelName` (optional) | `string` | Name of the `BroadcastChannel` used when the broadcast strategy is selected. |
| `onFallback` (optional) | `__type(strategy: string): void` | Called with a description whenever a preferred strategy is unavailable and the sync falls back to the next one. |
| `prefer` (optional) | `"broadcast" \| "sharedworker" \| "auto"` | Preferred strategy. `"auto"` tries broadcast first, then shared worker. |

---


### `NuxtThemeBootstrapOptions<T extends ThemeDefinition>`
Options for createNuxtThemeBootstrapScript. Describes the theme
registry and the fallback selection used to build the blocking bootstrap
script and its default light/dark CSS maps.

**See also:** `createNuxtThemeBootstrapScript`, `resolveThemeFromCookies`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | Fallback theme name when no selection is persisted. |
| `initialFamily` (optional) | `string` | Initial theme family used when no valid family cookie is present. |
| `initialMode` (optional) | `ThemeMode` | Fallback mode when no valid mode cookie is present. Defaults to the fallback theme's own mode — the mode `defaultTheme` resolves to, so `"light"` for `mint-light` and `"dark"` for `mint-dark`. Pass `"system"` to follow `prefers-color-scheme` instead. |
| `themes` | `readonly T[]` | The theme registry the bootstrap resolves against. |

---


### `OverlayScrollbarHandle`
Runtime handle to a live overlay scrollbar instance.

Returned by the scrollbar factory, this handle lets callers force a
re-synchronization of layout and physics, or tear down the scrollbar and
release all of its DOM, observers, and listeners.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `update` | `void` | — |

`destroy` is idempotent: calling it more than once is safe and has no
further effect.

---


### `OverlayScrollbarOptions`
Configuration for the overlay scrollbar engine.

All properties are optional; the engine applies sensible defaults for any
omitted value. The browser always performs the actual scrolling — this
engine only renders a theme-aware, animated overlay that represents the
scrollbar and synchronizes with native scrolling.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` (optional) | `string` | Custom thumb color while the user is dragging it. When set, overrides the theme-derived active color. Default `undefined` (uses `thumbColor` or theme-derived). |
| `animationDuration` (optional) | `number` | rAF easing time constant (ms) for smooth thumb travel. Default `180`. |
| `arrowDownIcon` (optional) | `ArrowIcon` | Content for the "scroll down" button. Falls back to `arrowIcon`. |
| `arrowIcon` (optional) | `ArrowIcon` | Optional content shown inside every arrow button (overrides the built-in CSS triangle). Accepts an `innerHTML` string, a DOM node (element / inline SVG / text) or an array of both. |
| `arrowIconRenderer` (optional) | `__type(button: HTMLDivElement, dir: ScrollbarArrowDir): void` | Framework hook: invoked for every arrow button that has custom content, so framework wrappers (React/Vue/Svelte/...) can render framework-owned elements (JSX/VNodes/...) into the button. When set it replaces the `innerHTML`/node injection for `arrowIcon`-style options. |
| `arrowLeftIcon` (optional) | `ArrowIcon` | Content for the "scroll left" button. Falls back to `arrowIcon`. |
| `arrowRightIcon` (optional) | `ArrowIcon` | Content for the "scroll right" button. Falls back to `arrowIcon`. |
| `arrows` (optional) | `boolean` | Show the up/down (or left/right) navigation buttons like native browser scrollbars. Clicking scrolls a step; holding repeats. Default `true`. |
| `arrowUpIcon` (optional) | `ArrowIcon` | Content for the "scroll up" button. Falls back to `arrowIcon`. |
| `autoHide` (optional) | `boolean` | Fade the thumb/track out while idle. Default `true` (macOS-style). |
| `autoHideDelay` (optional) | `number` | Idle (ms) before a revealed strip fades out after its last activity. Each host has its own timer, so only the strip you're scrolling/hovering is revealed, then it fades after idle; other scrollbars stay hidden. Default `900`. Only takes effect when `autoHide` is `true`. |
| `axes` (optional) | `ScrollbarAxis[]` | Which axes to render. Defaults to both. |
| `clickToJump` (optional) | `boolean` | Clicking the empty track scrolls smoothly to that position. Default `true`. |
| `dir` (optional) | `"auto" \| "ltr" \| "rtl"` | Text direction. Defaults to the resolved `dir` / CSS `direction`. |
| `draggable` (optional) | `boolean` | Allow dragging the thumb to scroll. Default `true`. |
| `duration` (optional) | `number` | CSS transition duration (ms) for thickness/opacity/color. Default `250`. |
| `exclude` (optional) | `string[] \| null` | Skip these CSS selectors when tracking inner scrollables. |
| `hoverExpand` (optional) | `boolean` | Grow the strip on hover / drag. Default `false` (thickness stays constant so the scrollbar never shifts while scrolling). |
| `hoverThickness` (optional) | `number` | Thumb thickness while hovered / dragged — only used when `hoverExpand` is true. Default `thickness + 4`. |
| `include` (optional) | `string[] \| null` | Scope overlay to these CSS selectors for inner scrollables (the window is always tracked). When empty, all scrollable elements are tracked. |
| `minThumbSize` (optional) | `number` | Minimum thumb travel size. Default `32`. |
| `offset` (optional) | `number` | Gap between the thumb and the container edge in px. Default `2`. |
| `overscroll` (optional) | `boolean` | Subtly compress the thumb at the scroll boundaries (rubber-band feel). Default `true`. |
| `radius` (optional) | `number` | Thumb corner radius in px. Default `999`. |
| `smooth` (optional) | `boolean` | Use rAF-lerped (eased) thumb motion instead of a hard snap. Default `true`. |
| `thickness` (optional) | `number` | Resting thumb thickness (width for vertical, height for horizontal). Default `8`. |
| `thumbColor` (optional) | `string` | Custom thumb color (any CSS color string). When set, overrides the theme-derived color. Default `undefined` (theme-derived). |
| `thumbHoverColor` (optional) | `string` | Custom thumb color while hovered. When set, overrides the theme-derived hover color. Default `undefined` (uses `thumbColor` or theme-derived). |
| `thumbOpacity` (optional) | `number` | Thumb opacity while visible. Default `0.7`. |
| `touch` (optional) | `boolean` | Native (touch) devices: keep native scrollbars by default. Pass `true` to force the overlay on coarse-pointer devices. Default `false`. |
| `trackColor` (optional) | `string` | Custom track color (any CSS color string). When set, overrides the theme-derived color. Default `undefined` (theme-derived). |
| `trackOpacity` (optional) | `number` | Track strip opacity (0 = invisible). Default `0.25`. |
| `zIndex` (optional) | `number` | Z-index for the overlay strips. Defaults to the tracked container's own `z-index` (so the scrollbar stays inside its container's stacking order — e.g. below a sticky header). The document scrollbar defaults to `55` (above typical sticky headers, below full-screen modal backdrops) and containers without a z-index default to `30`. Overriding lets you force scrollbars above fixed headers/modals if you need to. |

Options are resolved once when the scrollbar is created. `include`/`exclude`
scope which inner scrollables are tracked; the window is always tracked.

---


### `PersistencePluginOptions`
Options for createPersistencePlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapter` (optional) | `ThemeSelectionPersistenceAdapter \| null` | Custom persistence adapter. When omitted, a `localStorage`-backed adapter is used in browser environments; in non-browser (SSR) environments the plugin is inert. Pass `null` to disable persistence entirely. |
| `key` (optional) | `string` | Storage key used by the default `localStorage` adapter. Default `"theme-selection"`. |
| `readOnInit` (optional) | `boolean` | Whether to restore the saved theme selection when the runtime is created. Default `true`. |

---


### `PluginManager<T extends ThemeDefinition>`
Registry that manages the lifecycle of ThemePlugin instances.

The manager stores plugins by name, orders them by priority for hook
dispatch, and coordinates creation and destruction. It is created by
createPluginManager.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `get` | `ThemePlugin<T> \| undefined` | — |
| `list` | `ThemePlugin<T>[]` | — |
| `remove` | `boolean` | — |
| `use` | `__type(): void` | — |

`use` is idempotent per name: registering an already-registered name is
skipped with a warning. `destroy` invokes `onDestroy` for every plugin and
clears the registry; after destruction the manager is empty.

---


### `PresetVariantOverride`
Token overrides applied to a single preset theme mode.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `tokens` (optional) | `Partial<ThemeTokens>` | Partial token groups merged over the preset's base tokens. |

---


### `ResolvedSolarLocation`
The resolved coordinates a solar calculation should use, plus how they
were derived.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetected` | `boolean` | Whether the coordinates came from timezone resolution (explicit `timeZone` or browser auto-detection) rather than explicit coordinates. |
| `latitude` | `number` | The resolved latitude. |
| `longitude` | `number` | The resolved longitude. |
| `timeZone` | `string \| null` | The timezone the coordinates were resolved from, or `null` when explicit coordinates were used (or nothing could be detected). |

---


### `ResolveInitialThemeOptions<T extends ThemeDefinition>`
Options for resolving the initial theme of a runtime.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | Theme name to prefer when no family/mode selection is given. |
| `family` (optional) | `string` | Initial family. Defaults to the fallback theme's family. |
| `mode` (optional) | `ThemeMode` | Initial mode. `"system"` is resolved via `prefersDark`. |
| `prefersDark` (optional) | `boolean` | Whether the visitor prefers dark mode. Used only when `mode` is `"system"`. |
| `themes` | `readonly T[]` | Registered themes to resolve within. |

---


### `ResolveSelectionOptions<T extends ThemeDefinition>`
Options for resolving a selection state.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | Theme name to prefer when nothing else is given. |
| `initialFamily` (optional) | `string` | Initial family. Defaults to the fallback theme's family. |
| `initialMode` (optional) | `ThemeMode` | Initial mode. Defaults to the fallback theme's mode. |
| `persistedSelection` (optional) | `ThemeSelectionState \| null` | A persisted selection that wins over the other inputs when present. |
| `themes` | `readonly T[]` | Registered themes to resolve within. |

---


### `ResolveSelectionThemeOptions<T extends ThemeDefinition>`
Options for resolving the theme for an existing selection.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `prefersDark` (optional) | `boolean` | Whether the visitor prefers dark mode. Used only when the selection mode is `"system"`. |
| `selection` | `ThemeSelectionState` | The selection (family + mode) to resolve a theme for. |
| `themes` | `readonly T[]` | Registered themes to resolve within. |

---


### `ResolveThemeFromCookiesOptions<T extends ThemeDefinition>`
Options for resolveThemeFromCookies. Describes the theme registry,
the fallback selection, and the parsed request cookies used to resolve the
initial theme server-side.

**See also:** `resolveThemeFromCookies`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `cookies` | `ParsedCookies` | The parsed request cookies (see parseCookieHeader). |
| `defaultTheme` (optional) | `T["name"]` | Fallback theme name when no selection is persisted. |
| `initialFamily` (optional) | `string` | Initial theme family used when no valid family cookie is present. |
| `initialMode` (optional) | `ThemeMode` | Fallback mode when no valid mode cookie is present. Defaults to the fallback theme's own mode — the mode `defaultTheme` resolves to, so `"light"` for `mint-light` and `"dark"` for `mint-dark`. Pass `"system"` to follow `prefers-color-scheme` instead. |
| `themes` | `readonly T[]` | The theme registry the selection is resolved against. |

---


### `ScheduledPluginOptions<T extends ThemeDefinition>`
Options for createScheduledPlugin.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | How often (ms) the schedule re-evaluates the current time. |
| `darkTheme` (optional) | `T["name"]` | Theme applied between sunset and sunrise. Optional — same derivation as `lightTheme`, falling back to the built-in neutral `"dark"` theme. |
| `enabled` (optional) | `boolean` | Start enabled. Default `true`. |
| `latitude` (optional) | `number` | Explicit coordinates. Optional — when omitted the location is resolved from `timeZone` or the visitor's browser timezone. |
| `lightTheme` (optional) | `T["name"]` | Theme applied between sunrise and sunset. Optional — when omitted the schedule derives it from the currently selected theme's family (or falls back to the built-in neutral `"light"` theme). |
| `longitude` (optional) | `number` | Explicit longitude. Optional — when omitted the location is resolved from `timeZone` or the visitor's browser timezone. |
| `skipApplyMs` (optional) | `number` | Minimum time (ms) between automatic theme applications, used to avoid rapid re-application near a boundary. |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude` are omitted (e.g. `"Asia/Kathmandu"`). |

---


### `ScheduledThemeBindingOptions<T>`
Options for createScheduledThemeBinding.

The binding applies a light theme during daytime and a dark theme at night,
based on sunrise/sunset at a resolved location, re-checking on an interval.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | How often (ms) the binding re-checks solar time. |
| `darkTheme` | `T` | Theme applied between sunset and sunrise. |
| `enabled` (optional) | `boolean` | Whether the binding should apply themes and run its timer. Defaults to `true`. Toggle at runtime via the returned `setEnabled`. |
| `getTimes` (optional) | `__type(date: Date, latitude: number, longitude: number): { sunrise: Date; sunset: Date }` | Override the sunrise/sunset computation. Defaults to calculateSunTimes. |
| `latitude` (optional) | `number` | Explicit latitude. Optional — when omitted the binding resolves the location from `timeZone` or the visitor's browser timezone. |
| `lightTheme` | `T` | Theme applied between sunrise and sunset. |
| `longitude` (optional) | `number` | Explicit longitude. Optional — see `latitude`. |
| `onBeforeApply` (optional) | `__type(theme: T): boolean` | Called before the binding applies a theme. Return `false` to block the switch for this cycle. |
| `skipApplyMs` (optional) | `number` | Ignore schedule-driven applies within this many ms after a manual selection (e.g. a cross-tab sync). |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude` are omitted (e.g. `"Asia/Kathmandu"`). |

---


### `ScheduledThemeOptions<T extends ThemeDefinition>`
Configures the runtime's automatic sunrise/sunset scheduling.

When provided, the runtime creates a schedule controller that applies the
light or dark theme of the selected family based on solar times.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | How often the schedule re-checks the solar state, in milliseconds. Passed through to the underlying schedule controller. |
| `darkTheme` (optional) | `T["name"]` | Theme applied between sunset and sunrise. Optional — same derivation as `lightTheme`, falling back to the built-in neutral `"dark"` theme. |
| `enabled` (optional) | `boolean` | Start enabled. Default `true`. |
| `latitude` (optional) | `number` | Explicit latitude. Optional — when omitted the location is resolved from `timeZone` or the visitor's browser timezone, so every user gets sunrise/sunset for their own location automatically. |
| `lightTheme` (optional) | `T["name"]` | Theme applied between sunrise and sunset. Optional — when omitted the schedule derives it from the currently selected theme's family (or falls back to the built-in neutral `"light"` theme). |
| `longitude` (optional) | `number` | Explicit longitude. Optional — see `latitude`. |
| `skipApplyMs` (optional) | `number` | Minimum time, in milliseconds, between two applications of the same theme — remote changes inside this window are ignored. |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude` are omitted (e.g. `"Asia/Kathmandu"`). Takes precedence over auto-detection. |

---


### `ScheduledThemePairInput<T extends ThemeDefinition>`
Input for resolving the scheduled light/dark theme pair.

Both fields are optional; when omitted the pair is derived from the
currently selected theme's family, falling back to the neutral `light`/`dark`
themes.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `darkTheme` (optional) | `T["name"]` | The theme applied at night. |
| `lightTheme` (optional) | `T["name"]` | The theme applied during daytime. |

---


### `ScopedThemeBindingOptions`
Options for createScopedThemeBinding.

The binding applies a scoped theme's CSS variables inline on a target
element and cleans them up on destroy. Local theme definitions are resolved
first, then the parent runtime's themes fall back — no second runtime is
ever created.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `localThemes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions for genuinely isolated components. These are resolved FIRST, then the parent runtime's themes fall back — no second runtime is ever created. |
| `prefersDark` (optional) | `boolean` | Whether the OS prefers dark (used to resolve `mode: "system"` and the default light fallback for family-only selections). |
| `prefix` (optional) | `string` | Prefix for the emitted custom properties. |
| `transition` (optional) | `ThemeTransitionOptions` | Transition applied when the scoped theme changes. When omitted, the change is applied instantly (the previous behaviour). Pass the owning runtime's `transition` to inherit the same transition the provider uses. |

---


### `ScopedThemePrePaint`
Everything a scoped region needs to render correctly at first paint,
resolved generically from its theme data.

When the scope's selection is OS-dependent, `css` carries a
`@media (prefers-color-scheme: dark)` block so the region renders light OR
dark before hydration; the live binding takes over through its own inline
variables afterwards.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `css` | `string \| null` | `[selector] { light }` + `@media (prefers-color-scheme: dark) { [selector] { dark } }`, or `null` when the scope isn't OS-dependent. Emit this into the rendered markup so the first paint already shows the correct theme. |
| `isDark` | `boolean` | Whether the default resolved theme is dark. |
| `lightVariables` | `Record<string, string>` | The default (light) scoped variables, including the `--color-*` / `--radius-*` aliases. When `systemBased`, these are the SSR/fallback values and the element should NOT carry them inline (the media-query override would lose to inline styles); when not, they become the element's inline style. |
| `name` | `string` | The default resolved theme name (for `data-theme`-style attributes). |
| `systemBased` | `boolean` | True when the scope's resolved theme depends on the OS scheme (its selection is a family / boundary following a `system` mode, so resolving with and without `prefers-color-scheme: dark` picks a different theme). These scopes need the `@media` CSS block to render correctly at first paint — the server can't know the OS preference yet. |

---


### `ScopedThemePrePaintOptions`
Options for resolveScopedThemePrePaint.

Controls how a scope's first-paint CSS is generated.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `prefix` (optional) | `string` | Prefix for the emitted custom properties. |
| `selector` (optional) | `string` | CSS selector targeting the scope element (e.g. `[data-theme-kit-scope="…"]`). Only used by the `@media` override. |

---


### `SelectionThemeResolution<T extends ThemeDefinition>`
The result of selection-theme resolution.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `selection` | `ThemeSelectionState` | The (possibly normalized) selection. |
| `theme` | `T` | The theme matching the selection. |

---


### `SolarLocationInput`
Input for resolving the coordinates a solar calculation should use.

Priority: explicit `latitude`/`longitude` → explicit `timeZone` → browser
timezone auto-detection → `DEFAULT_TIMEZONE_LOCATION`.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no explicit coordinates/timezone are given. Default `true`. On the server (no `window`) detection is skipped and the default coordinates are used so SSR output stays deterministic. |
| `latitude` (optional) | `number` | Explicit latitude. When present (alone or with `longitude`) it wins over timezone resolution. |
| `longitude` (optional) | `number` | Explicit longitude. When present (alone or with `latitude`) it wins over timezone resolution. |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from (e.g. `"Asia/Kathmandu"`). Takes precedence over auto-detection. |

---


### `StorageAdapter`
A minimal key-value contract for persisting the selected theme name.

Implementations back this with any durable store (e.g. `localStorage`).
`get` returns `null` when nothing has been stored yet or the stored value
is not a valid theme name.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `get` | `string \| null` | — |
| `remove` | `void` | — |
| `set` | `void` | — |

---


### `SyncFirstRenderRoot`
The shape this helper wraps: React's `createRoot` with a `render` method.

Typed structurally, and the render argument as `unknown`, so core carries no
React dependency — it is framework-agnostic and must stay that way.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `render` | `unknown` | — |
| `unmount` | `void` | — |

---


### `SyncFirstRootOptions`
Options for createSyncFirstRoot.

**See also:** `createSyncFirstRoot`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `onlyFirstRoot` (optional) | `boolean` | Wrap only the **first** root created, and pass every later one through untouched. Defaults to `false`. |

---


### `SystemThemeBindingOptions<T extends ThemeDefinition>`
Options for createSystemThemeBinding.

The binding follows the OS color-scheme preference live and applies the
matching theme to the store. It requires a `Window` with a working
`matchMedia`; when none is available the binding is not created.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `darkTheme` | `T` | Theme applied when the media query does not match (the OS prefers light). |
| `lightTheme` | `T` | Theme applied when the media query matches (the OS prefers dark). |
| `mediaQuery` (optional) | `string` | Media query used to detect the OS preference. |
| `view` (optional) | `Window` | The `Window` to observe. Defaults to the global `window` when present. |

---


### `ThemeAdapter<T extends ThemeDefinition>`
The contract every library adapter implements. The runtime only knows this
interface — it never knows Bootstrap, MUI, Chakra or any other library.

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `id` | `string` | Stable identifier used for reference counting and deduplication. |
| `install` | `void` | — |
| `supports` | `boolean` | — |
| `uninstall` | `void` | — |

---


### `ThemeAnimationInput`
Input consumed by the Animation Coordinator for a single theme change.

**See also:** `runThemeAnimation`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `buffer` (optional) | `number` | Extra headroom after the longest transition before cleanup. |
| `plan` | `TransitionPlan` | The concrete transition decided by the planner. |
| `swap` | `__type(): void` | Writes the new CSS custom-property values to `target`. |
| `target` | `HTMLElement` | Element receiving the theme custom properties (usually <html>). |

---


### `ThemeBootstrapScriptOptions<T extends ThemeDefinition>`
Options for createThemeBootstrapScript.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | Theme name to fall back to when no persisted selection exists. |
| `initialFamily` (optional) | `string` | Initial theme family used when no persisted selection exists. |
| `initialMode` (optional) | `ThemeMode` | Initial mode used when no persisted selection exists. |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | The theme definitions to embed in the generated script. |

---


### `ThemeBootstrapState<T extends ThemeDefinition>`
The state the pre-paint bootstrap published on `<html>`, validated against
the theme registry.

**See also:** `readBootstrapState`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `ready` | `boolean` | Whether the bootstrap reported completing its DOM write. |
| `resolvedMode` | `"light" \| "dark"` | The concrete mode the bootstrap applied (`"light"` or `"dark"`). |
| `selection` | `ThemeSelectionState` | The visitor's **selection**. For `"system"` this is still `"system"` — the resolved mode is resolvedMode, and the two are deliberately distinct so adopting this state cannot downgrade a `"system"` choice. |
| `theme` | `T` | The resolved theme — the one already painted on `<html>`. |

---


### `ThemeBroadcastAdapter`
A contract for broadcasting and observing the selected theme mode across
tabs/windows. `subscribe` returns an unsubscribe function; `destroy`
releases the underlying channel.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `destroy` | `void` | — |
| `post` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeBroadcastOptions`
Options for createThemeBroadcast.

The adapter publishes the theme mode to a `BroadcastChannel` and applies
incoming modes from other tabs/windows.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `channel` (optional) | `BroadcastChannelLike<ThemeMode>` | A custom channel to use. When omitted, a `BroadcastChannel` is created from `channelName`. |
| `channelName` (optional) | `string` | Name of the `BroadcastChannel` created when `channel` is omitted. |

---


### `ThemeChangeEvent<T extends ThemeDefinition>`
A single recorded theme change, captured by a ThemeDebugger.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `current` | `T` | The theme in effect after the change. |
| `label` (optional) | `string` | Optional caller-supplied label describing the change. |
| `previous` | `T \| null` | The theme in effect before the change, or `null` for the first event. |
| `source` | `ThemeChangeSource` | The origin of the change. |
| `timestamp` | `number` | Epoch milliseconds when the change was recorded. |

---


### `ThemeDebugger<T extends ThemeDefinition>`
A debugger that records theme changes on a theme store.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `clear` | `void` | — |
| `destroy` | `void` | — |
| `getHistory` | `readonly ThemeChangeEvent<T>[]` | — |
| `record` | `void` | — |

---


### `ThemeDefinition<Name extends ThemeName>`
A theme definition: a name plus optional metadata and token values.

**See also:** `defineTheme`, `extendTheme`, `composeTheme`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `extends` (optional) | `Name \| readonly Name[]` | Names of themes this definition extends. Extending merges the base themes' tokens before applying this definition's own tokens. |
| `meta` (optional) | `ThemeMeta` | Metadata describing the theme family, mode, and presentation labels. |
| `name` | `Name` | Stable theme identifier used for selection and lookup. |
| `tokens` (optional) | `ThemeTokens` | Semantic token values consumed by the runtime. When omitted, the theme inherits tokens entirely from its extended bases. |

---


### `ThemeDiagnostic`
A single Theme Kit diagnostic.

This is plain data: creating one has no side effects and touches no
environment. Emission and formatting are separate concerns — see
formatDiagnostic and emitDiagnostic — so the same diagnostic
can be collected, thrown, logged, or forwarded to a DevTools layer without
duplicating the logic that produced it.

**See also:** `createDiagnostic`, `ThemeDiagnosticCode`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `cause` (optional) | `unknown` | The underlying error, when this diagnostic reports a failure. |
| `code` | `ThemeDiagnosticCode` | Stable identifier. Safe to assert on in tests and to filter by. |
| `context` (optional) | `ThemeDiagnosticContext` | Structured context, when the diagnostic has any. |
| `docs` (optional) | `string` | Link to the reference entry for this code. Derived from code. |
| `hint` (optional) | `string` | What to do instead. Present only when there is a concrete correction. |
| `level` | `ThemeDiagnosticLevel` | How serious this is, and what the caller should do about it. |
| `message` | `string` | A concise, actionable description of what is wrong. |

---


### `ThemeDiagnosticContext`
Structured, machine-readable context for a diagnostic.

Every field is optional because a diagnostic should carry only what it
actually knows. The point of the structure is that a caller can act on the
failure without parsing prose.

**See also:** `ThemeDiagnostic`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `api` (optional) | `string` | The public API involved, e.g. `"setMode"`. |
| `details` (optional) | `unknown` | Extra structured payload the diagnostic carries. Used when the evidence is more than a single offending value — a list of failing checks, for example. It is emitted as part of the diagnostic object so the detail is available without being flattened into prose. |
| `expected` (optional) | `string` | The value(s) that were expected, as a human-readable description. |
| `path` (optional) | `string` | A path into the offending input, e.g. `"colors.primary"`. |
| `property` (optional) | `string` | The property or argument at fault, e.g. `"mode"`. |
| `received` (optional) | `unknown` | The value that was received. Omitted when it cannot be serialised usefully. |

---


### `ThemeDiff`
What actually changed between two themes, grouped by token category.

Produced by the Theme Diff Engine. Every downstream stage (planner,
scanner, coordinator) keys off these booleans so Theme Kit only animates
the token groups that really changed — never a blanket transition.

**See also:** `createThemeDiff`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `borders` | `boolean` | Whether border tokens changed. |
| `colors` | `boolean` | Whether color tokens changed. |
| `layout` | `boolean` | Non-animatable groups (z-index, breakpoints) that require an instant swap + relayout rather than an animation. |
| `radius` | `boolean` | Whether radius tokens changed. |
| `shadows` | `boolean` | Whether shadow tokens changed. |
| `spacing` | `boolean` | Whether spacing tokens changed. |
| `transforms` | `boolean` | Whether transform tokens changed. |
| `typography` | `boolean` | Whether typography tokens changed. |

---


### `ThemeErrorOptions`
Options for ThemeError.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `cause` (optional) | `unknown` | The underlying error, when this one wraps a failure. |
| `code` (optional) | `ThemeDiagnosticCode` | Stable diagnostic code, when this error corresponds to one. |
| `context` (optional) | `ThemeDiagnosticContext` | Structured context, when the error has any. |

---


### `ThemeHistory<T extends ThemeDefinition>`
Undo/redo history bound to a theme store.

Every theme change (outside of undo/redo/restore operations) appends an
entry and truncates any redo branch. Entries are deep-cloned on read so
callers cannot mutate recorded states.

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
Options for creating a theme history controller.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `maxSteps` (optional) | `number` | Maximum number of history entries retained (including the initial entry). When the limit is exceeded, the oldest entries are dropped. |

---


### `ThemeInspectorProps`
Props accepted by the Vue `<ThemeInspector>` component.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `bottom` (optional) | `number` | Distance from the bottom of the viewport, in px. Default 104. |
| `right` (optional) | `number` | Distance from the right edge of the viewport, in px. Default 32. |
| `size` (optional) | `number` | Toggle button size, in px. Default 40. |
| `zIndex` (optional) | `number` | Z-index for the floating toggle and panel. Default 9999. |

---


### `ThemeKitConfig<T extends ThemeDefinition>`
The application's Theme Kit configuration: one declaration, consumed by both
the runtime and the pre-paint bootstrap.

**See also:** `defineThemeKitConfig`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `readonly unknown[]` | Runtime adapters. Runtime-only, and **not serializable** — pass it to the provider, not here. |
| `defaultTheme` (optional) | `T["name"]` | Theme name to fall back to when no selection is persisted. |
| `initialFamily` (optional) | `string` | Family used when no selection is persisted. |
| `initialMode` (optional) | `ThemeMode` | Mode used when no selection is persisted. Defaults to the fallback theme's own mode. |
| `persistence` (optional) | `unknown` | Whether the selection is persisted across visits. `false` or `null` disables it. |
| `plugins` (optional) | `readonly unknown[]` | Runtime plugins. Runtime-only, and **not serializable** — pass it to the provider, not here. |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `scrollbar` (optional) | `unknown` | Overlay scrollbar options. Runtime-only. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | The theme definitions registered with the runtime. |
| `transition` (optional) | `unknown` | Transition configuration. Runtime-only. |

This exists to remove a class of bug rather than to add a feature. When the
theme registry, the fallback theme and the initial mode are declared twice —
once for the provider and once for whatever emits the pre-paint script — the
two drift, and a drift is visible: the script paints one theme, the runtime
corrects it a frame later, and any theme-name readout contradicts the control
that set it.

Two projections read this object, and neither is a second declaration:

- the **runtime projection** — everything below, handed to
  `createThemeRuntime`;
- the **bootstrap projection** — toBootstrapConfig, the subset the
  pre-paint script can act on.

---


### `ThemeKitThemeConfig<T extends ThemeDefinition>`
The deprecated inline form of the theme configuration: the registry, the
fallback theme, the initial mode/family, and the persistence key and prefix,
passed straight to themeKitVitePlugin.

**See also:** `themeKitVitePlugin`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | Theme name to fall back to when no persisted selection exists. |
| `initialFamily` (optional) | `string` | Family used when no persisted selection exists. |
| `initialMode` (optional) | `ThemeMode` | Mode used when no persisted selection exists. Defaults to the fallback theme's own mode — whatever `defaultTheme` resolves to, so a `defaultTheme="light"` app paints light from frame one. |
| `prefix` (optional) | `string` | CSS custom property prefix. Defaults to `"theme-"`. |
| `storageKey` (optional) | `string` | localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. |
| `themes` | `readonly T[]` | The theme definitions registered with the runtime. |

---


### `ThemeLifecycle<T extends ThemeDefinition>`
Typed event emitter for runtime lifecycle events.

Hooks are invoked synchronously in registration order.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `emit` | `__type<K extends keyof ThemeLifecycleEventMap<ThemeDefinition<string>>>(event: K, data: ThemeLifecycleEventMap<T>[K]): void` | Synchronously emits an event to all registered handlers. |
| `off` | `__type<K extends keyof ThemeLifecycleEventMap<ThemeDefinition<string>>>(event: K, handler: __type(data: ThemeLifecycleEventMap<T>[K]): void): void` | Removes a previously registered handler. No-op when the handler is not registered. |
| `on` | `__type<K extends keyof ThemeLifecycleEventMap<ThemeDefinition<string>>>(event: K, handler: __type(data: ThemeLifecycleEventMap<T>[K]): void): __type(): void` | Registers a handler for a lifecycle event. |
| `destroy` | `void` | — |

---


### `ThemeLifecycleEventMap<T extends ThemeDefinition>`
Payload shapes for each lifecycle event.

- `beforeThemeChange` / `afterThemeChange` fire around theme transitions.
- `beforePersist` / `afterPersist` fire around persistence writes.
- `beforeApply` / `afterApply` fire around DOM/CSS application.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `afterApply` | `{ theme: T }` | Fired after the theme was applied to the DOM/CSS bindings. |
| `afterPersist` | `{ selection: ThemeSelectionState }` | Fired after the selection was persisted. |
| `afterThemeChange` | `{ theme: T }` | Fired after the active theme changed. |
| `beforeApply` | `{ theme: T }` | Fired before the theme is applied to the DOM/CSS bindings. |
| `beforePersist` | `{ selection: ThemeSelectionState }` | Fired before the selection is persisted. |
| `beforeThemeChange` | `{ current: T; next: T }` | Fired before the active theme changes. |

---


### `ThemeMeta`
Metadata describing a theme's family, mode, and presentation.

`family` and `mode` drive selection; the remaining fields are descriptive
and may be surfaced by tooling, the inspector, or docs generators.

**See also:** `ThemeDefinition`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `created` (optional) | `string` | ISO date the theme was created. |
| `description` (optional) | `string` | Short human-readable description of the theme. |
| `family` (optional) | `string` | Theme family used for selection and toggling. Themes without a family belong to the `"default"` family. |
| `group` (optional) | `string` | Deprecated alias for family. Prefer `family`. |
| `label` (optional) | `string` | Human-readable theme name shown in pickers and the inspector. |
| `mode` (optional) | `"light" \| "dark" \| "system"` | Color mode of the theme. When omitted, the mode is inferred from the theme name (e.g. `"mint-dark"` → `"dark"`). |
| `order` (optional) | `number` | Relative sort order among themes of the same family. |
| `tags` (optional) | `string[]` | Free-form tags for filtering and classification. |
| `updated` (optional) | `string` | ISO date the theme was last updated. |
| `version` (optional) | `string` | Theme schema version this definition targets. |

---


### `ThemeModeControllerOptions<T extends ThemeDefinition>`
Options for createThemeModeController.

The controller resolves a theme mode (`light` | `dark` | `system`) into a
concrete theme applied to the store, optionally persisting the mode and
broadcasting it across tabs/windows.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `broadcast` (optional) | `ThemeBroadcastAdapter \| null` | Adapter used to broadcast and observe the mode across tabs/windows. When `null`, broadcasting is disabled. |
| `darkTheme` | `T` | Theme applied when the resolved mode is dark. |
| `initialMode` (optional) | `ThemeMode` | Initial mode used when persistence is not read (or has no value). |
| `lightTheme` | `T` | Theme applied when the resolved mode is light. |
| `persistence` (optional) | `ThemePersistenceAdapter \| null` | Adapter used to persist and observe the mode. When `null`, persistence is disabled. |
| `readPersistenceOnInit` (optional) | `boolean` | Whether to read the persisted mode on creation. |
| `store` | `ThemeStore<T>` | The store the resolved theme is applied to. |
| `view` (optional) | `Window` | The `Window` used for the system binding. Defaults to the global `window` when present. |

---


### `ThemePersistenceAdapter`
A contract for persisting and observing the selected theme mode.

`get` returns `null` when nothing is stored or the stored value is not a
valid mode. `subscribe` returns an unsubscribe function.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `get` | `ThemeMode \| null` | — |
| `remove` | `void` | — |
| `set` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemePersistenceOptions`
Options for createThemePersistence.

The adapter persists the theme mode to a `Storage` (default
`localStorage`) and observes cross-tab changes via the `storage` event.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `key` (optional) | `string` | Storage key used for the persisted mode. |
| `storage` (optional) | `Storage` | The `Storage` to read/write. Defaults to `view.localStorage`. |
| `view` (optional) | `Window` | The `Window` used to access storage and listen for `storage` events. Defaults to the global `window` when present. |

---


### `ThemePlugin<T extends ThemeDefinition>`

**Extends** `ThemePluginHooks<T>`
A named, versioned unit of behavior that hooks into the theme runtime.

A plugin combines a unique `name` with any subset of ThemePluginHooks
to observe or alter theme selection, persistence, application, and lifecycle.
Plugins are registered through a PluginManager.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `name` | `string` | Unique plugin identifier used for registration, lookup, and removal. |
| `onAfterApply` (optional) | `__type(data: { theme: T }): void` | Called after the active theme's tokens are applied to the runtime. |
| `onAfterPersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | Called after a theme selection is persisted. |
| `onAfterThemeChange` (optional) | `__type(data: { theme: T }): void` | Called after the active theme changes, with the newly active theme. |
| `onBeforeApply` (optional) | `__type(data: { theme: T }): void` | Called before the active theme's tokens are applied to the runtime. |
| `onBeforePersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | Called before a theme selection is persisted. |
| `onBeforeThemeChange` (optional) | `__type(data: { current: T; next: T }): void` | Called before the active theme changes, with the current and next theme. |
| `onDestroy` (optional) | `__type(): void` | Called when the plugin is removed or the manager is destroyed. |
| `onRuntimeCreated` (optional) | `__type(runtime: ThemeRuntime<T>): void \| __type(): void` | Called once when the runtime is created. May return a disposer invoked on plugin removal or manager destruction. |
| `priority` (optional) | `number` | Execution order for hooks; lower values run first. Default `10`. |
| `transformTokens` (optional) | `__type(tokens: ThemeTokens, context: { theme: T }): ThemeTokens` | Transforms the theme's tokens before they are applied. Must return the (possibly modified) token set. |
| `version` (optional) | `string` | Semantic version of the plugin. |

`name` must be unique within a manager; registering a duplicate name is
ignored. `priority` orders hook execution (lower runs first, default `10`).

---


### `ThemePluginHooks<T extends ThemeDefinition>`
Lifecycle hooks a plugin may implement to participate in the theme runtime.

Hooks are invoked by the plugin manager in a deterministic order: creation
and destruction hooks run once per plugin, while change/persist/apply hooks
run in plugin priority order (ascending `priority`, default `10`). All hooks
are optional; a plugin implements only the ones it needs.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `onAfterApply` (optional) | `__type(data: { theme: T }): void` | Called after the active theme's tokens are applied to the runtime. |
| `onAfterPersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | Called after a theme selection is persisted. |
| `onAfterThemeChange` (optional) | `__type(data: { theme: T }): void` | Called after the active theme changes, with the newly active theme. |
| `onBeforeApply` (optional) | `__type(data: { theme: T }): void` | Called before the active theme's tokens are applied to the runtime. |
| `onBeforePersist` (optional) | `__type(data: { selection: ThemeSelectionState }): void` | Called before a theme selection is persisted. |
| `onBeforeThemeChange` (optional) | `__type(data: { current: T; next: T }): void` | Called before the active theme changes, with the current and next theme. |
| `onDestroy` (optional) | `__type(): void` | Called when the plugin is removed or the manager is destroyed. |
| `onRuntimeCreated` (optional) | `__type(runtime: ThemeRuntime<T>): void \| __type(): void` | Called once when the runtime is created. May return a disposer invoked on plugin removal or manager destruction. |
| `transformTokens` (optional) | `__type(tokens: ThemeTokens, context: { theme: T }): ThemeTokens` | Transforms the theme's tokens before they are applied. Must return the (possibly modified) token set. |

`onRuntimeCreated` may return a disposer function that is called when the
plugin is removed or the manager is destroyed. `onDestroy` is invoked for
every registered plugin when the manager is destroyed.

---


### `ThemeProviderProps<T extends ThemeDefinition>`

**Extends** `ThemeRuntimeOptions<T>`
Props accepted by the Vue `<ThemeProvider>` component.

Extends ThemeRuntimeOptions with an optional pre-built runtime. When
`runtime` is omitted, the provider creates and owns its own runtime from the
remaining props and destroys it on unmount.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `ThemeAdapter<T>[]` | Library adapters installed when the runtime is created. The runtime owns the registry and notifies every adapter whenever the theme changes; it never knows anything about the libraries themselves. |
| `broadcast` (optional) | `ThemeSelectionBroadcastAdapter \| null` | Cross-tab broadcast adapter. When omitted, a `BroadcastChannel`-based adapter on channel `"theme-selection"` is created; pass `null` to disable cross-tab sync. |
| `cssVariables` (optional) | `false \| CSSVariablesOptions` | CSS-variable binding configuration. `false` disables the binding. |
| `defaultTheme` (optional) | `T["name"]` | Theme name to activate when no persisted or explicit selection exists. |
| `dom` (optional) | `false \| DOMBindingOptions` | DOM attribute/class binding configuration. `false` disables the binding. |
| `initial` (optional) | `InitialThemeResolution<T>` | Explicit initial theme resolution, bypassing default + persistence based resolution. |
| `initialFamily` (optional) | `string` | Initial family used when nothing else is given. |
| `initialMode` (optional) | `ThemeMode` | Initial mode used when nothing else is given. |
| `persistence` (optional) | `ThemeSelectionPersistenceAdapter \| null` | Persistence adapter for the theme selection. Pass `null` to disable persistence entirely. |
| `plugins` (optional) | `ThemePlugin<T>[]` | Runtime plugins installed at creation. |
| `readPersistenceOnInit` (optional) | `boolean` | Whether a persisted selection is read at runtime creation. |
| `runtime` (optional) | `ThemeRuntime<T>` | An existing runtime to provide. When omitted, the provider creates and owns a runtime from the other props. |
| `scheduled` (optional) | `false \| ScheduledThemeOptions<T>` | Sunrise/sunset scheduling configuration. `false` disables scheduling. |
| `themes` (optional) | `readonly T[]` | Initial theme definitions. Duplicate names are dropped (first wins). When omitted, the registry starts empty. |
| `transition` (optional) | `boolean \| ThemeTransitionOptions` | Transition configuration. `true` enables transitions with defaults, `false` disables them, and an object provides explicit options. |
| `view` (optional) | `Window` | The `window` to bind to. Defaults to the global `window` when available; omit (or pass `undefined`) in SSR environments. |

---


### `ThemeRegistryOptions<T extends ThemeDefinition>`
Options for creating a theme registry.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` (optional) | `readonly T[]` | Initial theme definitions. Duplicate names are dropped (first wins). When omitted, the registry starts empty. |

---


### `ThemeRuntime<T extends ThemeDefinition>`
A Theme Kit runtime — the single entry point for theming one application
boundary.

A runtime owns theme selection, token resolution, persistence bindings,
scheduling, lifecycle events, history, DOM/CSS-variable application, and
adapter registration. Destroy the runtime when its owning application
lifecycle ends.

**See also:** `createThemeRuntime`, `ThemeRuntimeOptions`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` | `AdapterRegistry<T>` | The adapter registry (library adapters installed via `runtime.use`). |
| `history` | `ThemeHistory<T>` | Undo/redo history of theme changes. |
| readonly `initial` | `ThemeRuntimeInitial<T>` | The state a **server render** produces — the value `useSyncExternalStore` needs as its *server* snapshot. Read-only and frozen at creation. |
| `lifecycle` | `ThemeLifecycle<T>` | Typed lifecycle event emitter. |
| `registry` | `ThemeRegistry<T>` | The theme registry holding the registered definitions. |
| `schedule` | `ThemeSchedule \| null` | The sunrise/sunset scheduling controller created from the `scheduled` runtime option. `null` when the runtime was created without one. |
| `selection` | `{ setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; toggleTheme: __type(): void; destroy: void; getFamily: void; getMode: void; getSelection: void; subscribe: void }` | The selection controller (mode/family/system binding, persistence). |
| `store` | `ThemeStore<T>` | The underlying theme store (current theme + subscription). |
| readonly `themes` | `readonly T[]` | Live view of the registered themes. |
| `transition` (optional) | `ThemeTransitionOptions` | The resolved theme-transition options the runtime was created with (`undefined` when none were supplied). Components like `ThemeScope` read this so scoped theme changes inherit the same transition as the provider. |
| `batch` | `void` | — |
| `destroy` | `void` | — |
| `restore` | `void` | — |
| `snapshot` | `ThemeRuntimeSnapshot<T>` | — |
| `update` | `void` | — |
| `use` | `void` | — |

---


### `ThemeRuntimeInitial<T extends ThemeDefinition>`

**Extends** `InitialThemeResolution<T>`
The state a **server render** produces: the fallback resolution with no
persisted override and no OS preference resolved, plus the history state
captured before the initial selection was applied.

**See also:** `ThemeRuntime.initial`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `canRedo` | `boolean` | Whether ThemeHistory.redo would have an effect on the server. |
| `canUndo` | `boolean` | Whether ThemeHistory.undo would have an effect on the server. |
| `history` | `HistoryEntry<T>[]` | The history a server render produces: a single entry holding the server-resolved theme. |
| `selection` | `ThemeSelectionState` | The resolved selection (family + mode). |
| `theme` | `T` | The theme to activate. |

This is what React's `useSyncExternalStore` must be given as its *server*
snapshot. The runtime's live state cannot serve that purpose: by the time a
client component renders, the runtime has already adopted the persisted
selection and resolved `prefers-color-scheme`, so handing the live state to
`getServerSnapshot` makes React compare it against markup the server
rendered from the *fallback* — a mismatch, reported as React error #418,
that discards the server HTML and re-renders the whole island.

A server has neither a persisted selection (no storage) nor an OS
preference (no `matchMedia`), so the server snapshot is exactly the
fallback: `options.initial` when the caller resolved one, otherwise the
`defaultTheme`/`initialFamily`/`initialMode` resolution with `prefersDark`
pinned to `false`.

---


### `ThemeRuntimeOptions<T extends ThemeDefinition>`

**Extends** `ThemeRegistryOptions<T>`
Configuration for creating a Theme Kit runtime.

Every option is optional; the runtime falls back to built-in themes,
localStorage persistence, and default bindings when an option is omitted.

**See also:** `createThemeRuntime`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `ThemeAdapter<T>[]` | Library adapters installed when the runtime is created. The runtime owns the registry and notifies every adapter whenever the theme changes; it never knows anything about the libraries themselves. |
| `broadcast` (optional) | `ThemeSelectionBroadcastAdapter \| null` | Cross-tab broadcast adapter. When omitted, a `BroadcastChannel`-based adapter on channel `"theme-selection"` is created; pass `null` to disable cross-tab sync. |
| `cssVariables` (optional) | `false \| CSSVariablesOptions` | CSS-variable binding configuration. `false` disables the binding. |
| `defaultTheme` (optional) | `T["name"]` | Theme name to activate when no persisted or explicit selection exists. |
| `dom` (optional) | `false \| DOMBindingOptions` | DOM attribute/class binding configuration. `false` disables the binding. |
| `initial` (optional) | `InitialThemeResolution<T>` | Explicit initial theme resolution, bypassing default + persistence based resolution. |
| `initialFamily` (optional) | `string` | Initial family used when nothing else is given. |
| `initialMode` (optional) | `ThemeMode` | Initial mode used when nothing else is given. |
| `persistence` (optional) | `ThemeSelectionPersistenceAdapter \| null` | Persistence adapter for the theme selection. Pass `null` to disable persistence entirely. |
| `plugins` (optional) | `ThemePlugin<T>[]` | Runtime plugins installed at creation. |
| `readPersistenceOnInit` (optional) | `boolean` | Whether a persisted selection is read at runtime creation. |
| `scheduled` (optional) | `false \| ScheduledThemeOptions<T>` | Sunrise/sunset scheduling configuration. `false` disables scheduling. |
| `themes` (optional) | `readonly T[]` | Initial theme definitions. Duplicate names are dropped (first wins). When omitted, the registry starts empty. |
| `transition` (optional) | `boolean \| ThemeTransitionOptions` | Transition configuration. `true` enables transitions with defaults, `false` disables them, and an object provides explicit options. |
| `view` (optional) | `Window` | The `window` to bind to. Defaults to the global `window` when available; omit (or pass `undefined`) in SSR environments. |

---


### `ThemeRuntimeSnapshot<T extends ThemeDefinition>`
A serializable snapshot of a runtime's state.

Produced by ThemeRuntime.snapshot and accepted by
ThemeRuntime.restore for time-travel and state transfer.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `history` | `HistoryEntry<T>[]` | Recorded history entries. |
| `registry` | `{ themes: T[] }` | The registry contents at snapshot time. |
| `selection` | `ThemeSelectionState` | The active selection (family + mode). |
| `theme` | `T` | The active theme definition. |

---


### `ThemeSchedule`
A framework-neutral sunrise/sunset scheduling controller.

Exposes an explicit on/off switch and a reactive state snapshot
(`sunrise`, `sunset`, `nextTransition`, ...) so frameworks can surface it
through their native accessors. `destroy` is idempotent and releases the
underlying binding and store subscription.

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `active` | `boolean` | Whether the schedule is enabled AND the currently applied theme is one of the scheduled light/dark themes. |
| readonly `autoDetected` | `boolean` | Whether the coordinates were resolved from a timezone rather than explicit coordinates. |
| readonly `darkTheme` | `string \| null` | The theme applied between sunset and sunrise, or `null` when not derived yet. |
| readonly `enabled` | `boolean` | Whether the schedule is currently enabled. |
| readonly `latitude` | `number \| null` | The resolved latitude used for solar calculations. |
| readonly `lightTheme` | `string \| null` | The theme applied between sunrise and sunset, or `null` when not derived yet. |
| readonly `longitude` | `number \| null` | The resolved longitude used for solar calculations. |
| readonly `nextActivation` | `Date \| null` | The next time the scheduled theme becomes active, or `null`. |
| readonly `nextDeactivation` | `Date \| null` | The next time the scheduled theme stops being active, or `null`. |
| readonly `nextTransition` | `ThemeScheduleTransition \| null` | The light→dark or dark→light transition time and target, or `null` while the schedule is disabled. |
| readonly `state` | `ThemeScheduleState` | The current reactive state snapshot (stable reference between changes). |
| readonly `status` | `ThemeScheduleStatus` | `"active"` when enabled, `"disabled"` otherwise. |
| readonly `sunrise` | `Date \| null` | Today's sunrise time, or `null` when unresolvable. |
| readonly `sunset` | `Date \| null` | Today's sunset time, or `null` when unresolvable. |
| readonly `timeZone` | `string \| null` | The timezone the coordinates were resolved from, or `null` when explicit coordinates are in use. |
| `destroy` | `void` | — |
| `disable` | `void` | — |
| `enable` | `void` | — |
| `set` | `void` | — |
| `setLastSyncTime` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeScheduleOptions<T extends ThemeDefinition>`
Options for createThemeSchedule.

The schedule applies a light theme during daytime and a dark theme at
night, based on sunrise/sunset at a resolved location. `lightTheme` and
`darkTheme` are optional: when omitted they are derived from the currently
selected theme's family (falling back to the built-in neutral `light`/`dark`
themes) and re-resolved whenever the user switches theme family.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no explicit coordinates/timezone are given. Default `true`. |
| `checkInterval` (optional) | `number` | How often (ms) the schedule re-checks solar time. Default `60000`. |
| `darkTheme` (optional) | `T["name"]` | Theme applied between sunset and sunrise. Optional — same derivation as `lightTheme`, falling back to the built-in neutral `"dark"` theme. |
| `enabled` (optional) | `boolean` | Start enabled. Default `true`. |
| `getTimes` (optional) | `__type(date: Date, latitude: number, longitude: number): { sunrise: Date; sunset: Date }` | Override the NOAA solar math. Defaults to `calculateSunTimes`. |
| `latitude` (optional) | `number` | Explicit latitude. Optional — when omitted the location is resolved from `timeZone` or the visitor's browser timezone. |
| `lightTheme` (optional) | `T["name"]` | Theme applied between sunrise and sunset. Optional — when omitted the schedule derives it from the currently selected theme's family (or falls back to the built-in neutral `"light"` theme), so it adapts as the user switches theme families. |
| `longitude` (optional) | `number` | Explicit longitude. Optional — see `latitude`. |
| `onBeforeApply` (optional) | `__type(theme: T): boolean` | Called before the schedule applies a theme. Return `false` to block the switch for this cycle. |
| `skipApplyMs` (optional) | `number` | Ignore schedule-driven applies within this many ms after a manual selection (e.g. a cross-tab sync). Default `0`. |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from when `latitude`/`longitude` are omitted (e.g. `"Asia/Kathmandu"`). Takes precedence over auto-detection. |

---


### `ThemeScheduleSetOptions`

**Extends** `SolarLocationInput`
Options for ThemeSchedule.set.

Repositions the schedule (explicit coordinates take precedence over an
explicit `timeZone`, which takes precedence over auto-detection),
reconfigures its interval/skip window, and/or toggles its enabled state.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoDetectLocation` (optional) | `boolean` | Auto-detect the visitor's location from their browser timezone when no explicit coordinates/timezone are given. Default `true`. On the server (no `window`) detection is skipped and the default coordinates are used so SSR output stays deterministic. |
| `checkInterval` (optional) | `number` | How often (ms) the schedule re-checks solar time. |
| `enabled` (optional) | `boolean` | Whether the schedule should be enabled after the update. |
| `latitude` (optional) | `number` | Explicit latitude. When present (alone or with `longitude`) it wins over timezone resolution. |
| `longitude` (optional) | `number` | Explicit longitude. When present (alone or with `latitude`) it wins over timezone resolution. |
| `skipApplyMs` (optional) | `number` | Ignore schedule-driven applies within this many ms after a manual selection. |
| `timeZone` (optional) | `string` | IANA timezone to resolve coordinates from (e.g. `"Asia/Kathmandu"`). Takes precedence over auto-detection. |

---


### `ThemeScheduleState`
Reactive snapshot of a `ThemeSchedule`. Emitted to subscribers whenever the
 enabled state, applied theme or solar times change.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `active` | `boolean` | Whether the schedule is enabled AND the currently applied theme is one of its scheduled light/dark themes (i.e. the schedule is actually driving the selection right now, not manually overridden). |
| `autoDetected` | `boolean` | Whether the coordinates were resolved from a timezone (explicit `timeZone` or browser auto-detection) rather than explicit coordinates. |
| `darkTheme` | `string \| null` | The theme applied at night. |
| `enabled` | `boolean` | Whether the schedule is enabled. |
| `latitude` | `number \| null` | The resolved latitude used for solar calculations (from explicit coordinates, an explicit `timeZone`, or browser auto-detection). |
| `lightTheme` | `string \| null` | The theme applied during daytime. |
| `longitude` | `number \| null` | The resolved longitude used for solar calculations. |
| `nextActivation` | `Date \| null` | Next time the light theme will be activated. |
| `nextDeactivation` | `Date \| null` | Next time the dark theme will be activated. |
| `nextTransition` | `ThemeScheduleTransition \| null` | The next automatic light/dark switch, with the theme it will apply. |
| `status` | `ThemeScheduleStatus` | `"active"` when enabled, `"disabled"` otherwise. |
| `sunrise` | `Date \| null` | Today's sunrise (or the sunrise of the day `state` was computed for). |
| `sunset` | `Date \| null` | Today's sunset. |
| `timeZone` | `string \| null` | The timezone the coordinates were resolved from, or `null` when explicit coordinates are in use (or detection wasn't possible — e.g. on the server). |

---


### `ThemeScheduleTransition`
Describes the next automatic light/dark switch of a ThemeSchedule.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `at` | `Date` | When the next automatic change happens. |
| `theme` | `string` | Theme that will be applied at `at`. |
| `type` | `"activation" \| "deactivation"` | `"activation"` → light theme at sunrise; `"deactivation"` → dark theme at sunset. |

---


### `ThemeScopeProps`
Props accepted by the Vue `<ThemeScope>` component.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` (optional) | `string` | Theme family for the scoped subtree. Without `mode`, follows the provider's current mode. |
| `mode` (optional) | `ThemeMode` | Mode for a family-based scope. Defaults to the provider's current mode. |
| `theme` (optional) | `string` | Exact theme name or family name. When `family`/`mode` are also set, `theme` wins. Omit to follow the provider's selection inside a boundary. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions — resolved first, parent registry falls back. No second runtime is created. |
| `transition` (optional) | `boolean \| ThemeTransitionOptions` | Transition for this scope. `undefined` inherits the provider's, `false` disables it, an object is merged over the provider config. |

---


### `ThemeScrollbarProps`

**Extends** `OverlayScrollbarOptions`
Props accepted by the Vue `<ThemeScrollbar>` component.

Extends OverlayScrollbarOptions with an optional custom element tag.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` (optional) | `string` | Custom thumb color while the user is dragging it. When set, overrides the theme-derived active color. Default `undefined` (uses `thumbColor` or theme-derived). |
| `animationDuration` (optional) | `number` | rAF easing time constant (ms) for smooth thumb travel. Default `180`. |
| `arrowDownIcon` (optional) | `ArrowIcon` | Content for the "scroll down" button. Falls back to `arrowIcon`. |
| `arrowIcon` (optional) | `ArrowIcon` | Optional content shown inside every arrow button (overrides the built-in CSS triangle). Accepts an `innerHTML` string, a DOM node (element / inline SVG / text) or an array of both. |
| `arrowIconRenderer` (optional) | `__type(button: HTMLDivElement, dir: ScrollbarArrowDir): void` | Framework hook: invoked for every arrow button that has custom content, so framework wrappers (React/Vue/Svelte/...) can render framework-owned elements (JSX/VNodes/...) into the button. When set it replaces the `innerHTML`/node injection for `arrowIcon`-style options. |
| `arrowLeftIcon` (optional) | `ArrowIcon` | Content for the "scroll left" button. Falls back to `arrowIcon`. |
| `arrowRightIcon` (optional) | `ArrowIcon` | Content for the "scroll right" button. Falls back to `arrowIcon`. |
| `arrows` (optional) | `boolean` | Show the up/down (or left/right) navigation buttons like native browser scrollbars. Clicking scrolls a step; holding repeats. Default `true`. |
| `arrowUpIcon` (optional) | `ArrowIcon` | Content for the "scroll up" button. Falls back to `arrowIcon`. |
| `autoHide` (optional) | `boolean` | Fade the thumb/track out while idle. Default `true` (macOS-style). |
| `autoHideDelay` (optional) | `number` | Idle (ms) before a revealed strip fades out after its last activity. Each host has its own timer, so only the strip you're scrolling/hovering is revealed, then it fades after idle; other scrollbars stay hidden. Default `900`. Only takes effect when `autoHide` is `true`. |
| `axes` (optional) | `ScrollbarAxis[]` | Which axes to render. Defaults to both. |
| `clickToJump` (optional) | `boolean` | Clicking the empty track scrolls smoothly to that position. Default `true`. |
| `dir` (optional) | `"auto" \| "ltr" \| "rtl"` | Text direction. Defaults to the resolved `dir` / CSS `direction`. |
| `draggable` (optional) | `boolean` | Allow dragging the thumb to scroll. Default `true`. |
| `duration` (optional) | `number` | CSS transition duration (ms) for thickness/opacity/color. Default `250`. |
| `exclude` (optional) | `string[] \| null` | Skip these CSS selectors when tracking inner scrollables. |
| `hoverExpand` (optional) | `boolean` | Grow the strip on hover / drag. Default `false` (thickness stays constant so the scrollbar never shifts while scrolling). |
| `hoverThickness` (optional) | `number` | Thumb thickness while hovered / dragged — only used when `hoverExpand` is true. Default `thickness + 4`. |
| `include` (optional) | `string[] \| null` | Scope overlay to these CSS selectors for inner scrollables (the window is always tracked). When empty, all scrollable elements are tracked. |
| `minThumbSize` (optional) | `number` | Minimum thumb travel size. Default `32`. |
| `offset` (optional) | `number` | Gap between the thumb and the container edge in px. Default `2`. |
| `overscroll` (optional) | `boolean` | Subtly compress the thumb at the scroll boundaries (rubber-band feel). Default `true`. |
| `radius` (optional) | `number` | Thumb corner radius in px. Default `999`. |
| `smooth` (optional) | `boolean` | Use rAF-lerped (eased) thumb motion instead of a hard snap. Default `true`. |
| `tag` (optional) | `string` | The element tag to apply the overlay scrollbar to. Defaults to the provider's scroll container. |
| `thickness` (optional) | `number` | Resting thumb thickness (width for vertical, height for horizontal). Default `8`. |
| `thumbColor` (optional) | `string` | Custom thumb color (any CSS color string). When set, overrides the theme-derived color. Default `undefined` (theme-derived). |
| `thumbHoverColor` (optional) | `string` | Custom thumb color while hovered. When set, overrides the theme-derived hover color. Default `undefined` (uses `thumbColor` or theme-derived). |
| `thumbOpacity` (optional) | `number` | Thumb opacity while visible. Default `0.7`. |
| `touch` (optional) | `boolean` | Native (touch) devices: keep native scrollbars by default. Pass `true` to force the overlay on coarse-pointer devices. Default `false`. |
| `trackColor` (optional) | `string` | Custom track color (any CSS color string). When set, overrides the theme-derived color. Default `undefined` (theme-derived). |
| `trackOpacity` (optional) | `number` | Track strip opacity (0 = invisible). Default `0.25`. |
| `zIndex` (optional) | `number` | Z-index for the overlay strips. Defaults to the tracked container's own `z-index` (so the scrollbar stays inside its container's stacking order — e.g. below a sticky header). The document scrollbar defaults to `55` (above typical sticky headers, below full-screen modal backdrops) and containers without a z-index default to `30`. Overriding lets you force scrollbars above fixed headers/modals if you need to. |

---


### `ThemeSelectionBroadcastOptions`
Options for createThemeSelectionBroadcast.

The adapter publishes the full theme selection (mode + family) to a
`BroadcastChannel` and applies incoming selections from other
tabs/windows.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `channel` (optional) | `BroadcastChannelLike<ThemeSelectionState>` | A custom channel to use. When omitted, a `BroadcastChannel` is created from `channelName`. |
| `channelName` (optional) | `string` | Name of the `BroadcastChannel` created when `channel` is omitted. |

---


### `ThemeSelectionPersistenceAdapter`
A contract for persisting and observing the full theme selection (mode +
family).

`get` returns `null` when nothing is stored or the stored value is not a
valid selection. `subscribe` returns an unsubscribe function.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `get` | `ThemeSelectionState \| null` | — |
| `remove` | `void` | — |
| `set` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeSelectionState`
The active selection: a family plus a color-mode.

Persistence adapters serialize this exact shape, so the fields are part
of the storage contract.

**See also:** `createThemeModeController`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` | `string` | Selected theme family. Themes without `meta.family` belong to the `"default"` family. |
| `mode` | `ThemeMode` | Selected color mode. `"system"` tracks the visitor's `prefers-color-scheme` preference. |

---


### `ThemeStore<T extends ThemeDefinition>`
The theme store: the runtime's single source of truth for the active theme.

The store is deliberately framework-free. Framework integrations wrap it
with reactive bindings; the runtime wires persistence, transitions, and
adapters around it.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `batch` | `void` | — |
| `destroy` | `void` | — |
| `get` | `T` | — |
| `set` | `void` | — |
| `subscribe` | `__type(): void` | — |

---


### `ThemeStoreOptions<T extends ThemeDefinition>`
Options for creating a theme store.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `initialTheme` | `T` | The theme the store starts with. |

---


### `ThemeToCSSVariablesOptions`
Options for themeToCSSVariables.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `groups` (optional) | `TokenGroup[]` | Restrict emission to the listed token groups. When omitted, all groups are emitted. |
| `prefix` (optional) | `string` | CSS custom property prefix. The token group name is appended to it. |

---


### `ThemeTokens`
Semantic token values consumed by the runtime.

Top-level groups map to CSS variable namespaces (`--theme-colors-*`,
`--theme-spacing-*`, …) when bound to the DOM by the runtime.

**See also:** `themeToCSSVariables`, `resolveTokens`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `borderWidths` (optional) | `Record<string, string>` | Border width values. |
| `breakpoints` (optional) | `Record<string, string>` | Responsive breakpoint values. |
| `code` (optional) | `CodeTokens` | Opt-in semantic colors for code and syntax surfaces. |
| `colors` (optional) | `ThemeColors` | Semantic color values. |
| `radius` (optional) | `Record<string, string>` | Border radius scale values. |
| `shadows` (optional) | `Record<string, string>` | Shadow values (typically CSS box-shadow strings). |
| `spacing` (optional) | `Record<string, string>` | Spacing scale values (typically CSS lengths). |
| `typography` (optional) | `{ fontFamilies?: Record<string, string>; fontSizes?: Record<string, string>; lineHeights?: Record<string, string> }` | Typography scale values. |
| `zIndex` (optional) | `Record<string, string>` | Z-index values. |

---


### `ThemeTransitionOptions`
Configures theme transition behavior.

Transition configuration is applied by the runtime when the active theme
changes. Individual updates may suppress the configured transition (see
`suppressTransition`).

**See also:** `createTransitionPlan`, `runThemeAnimation`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `duration` (optional) | `number` | Transition duration in milliseconds. |
| `easing` (optional) | `string` | CSS timing function used for the transition. |
| `enabled` (optional) | `boolean` | Whether theme transitions are enabled. |
| `preset` (optional) | `TransitionPreset` | Which properties are allowed to animate. `"smooth"`/`"subtle"` map to a curated color-property set, `"instant"` disables interpolation, and a raw array filters the diff-derived properties. |
| `properties` (optional) | `string[]` | Explicit property allowlist. Overrides `preset` when provided. |
| `useViewTransition` (optional) | `boolean` | Prefer the View Transition API when the browser supports it. When enabled and available, theme changes use a native view transition (a crossfade snapshot) instead of CSS-custom-property interpolation, avoiding intermediate gray washes during light↔dark switches. Falls back to `@property`-based interpolation when the API is unavailable or the user prefers reduced motion. |

---


### `TokenRemap`
A single token rename applied during a migration step.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `from` | `string` | The token key to rename from. |
| `to` | `string` | The token key to rename to. |

---


### `TransitionPlan`
The concrete, ready-to-apply transition decided by the Transition Planner.

`rootProperties` — registered `--theme-color-*` custom properties animated
  directly on `:root`; descendants inherit the interpolated values.
`elementProperties` — real CSS properties (padding, border-radius, …)
  transitioned on the scanned elements that actually use them.

**See also:** `createTransitionPlan`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `animatesColors` | `boolean` | Whether the plan animates the theme's color custom properties. |
| `duration` | `number` | Transition duration in milliseconds. |
| `easing` | `string` | CSS timing function for the transition. |
| `elementProperties` | `string[]` | Real CSS properties transitioned on the scanned elements that use them. |

---


### `ValidateThemeContrastOptions`
Options for validateThemeContrast.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Additional theme definitions used to resolve the target theme by name before checking. When omitted, the theme is checked as-is. |

---


### `ValidateThemeOptions`
Options for validateTheme.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Additional theme definitions used to resolve the target theme by name before validation. When omitted, the theme is validated as-is. |

---


### `ValidationIssue`
A single problem found while validating a theme definition.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `code` | `ThemeDiagnosticCode` | Stable diagnostic code. Assert on this rather than on message, which may be reworded. |
| `context` | `ThemeDiagnosticContext` | Structured context, so a caller can act without parsing message. |
| `message` | `string` | Human-readable description of the issue. |
| `path` | `string` | Dot-separated path to the offending token, e.g. `"colors.primary"`. |
| `type` | `"missing"` | The kind of issue. Currently always `"missing"` (a required token is absent). |

---


### `ValidationResult`
The outcome of validating a theme definition.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `issues` | `ValidationIssue[]` | Every issue found, empty when the theme is valid. |
| `valid` | `boolean` | `true` when no issues were found. |

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
The name of an animatable token group.

`typeof ANIMATED_GROUP_KEYS[number]`

---


### `CalculateSunTimesLocationOptions`
Options accepted by `calculateSunTimes` for resolving a location when
 `latitude`/`longitude` are omitted.

`SolarLocationInput`

---


### `CreateRootLike<TRoot extends SyncFirstRenderRoot>`
React's `createRoot`, structurally.

`__type(container: Element | DocumentFragment, options?: unknown): TRoot`

---


### `CVDType`
The type of color vision deficiency (CVD) to simulate.

`"protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"`

---


### `DiagnosticSink`
A destination for rendered diagnostics.

`__type(text: string, diagnostic: ThemeDiagnostic): void`

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
The name of a preset theme family.

`"neutral" | "oat" | "berry" | "mint" | "citrus" | "cocoa" | "plum" | "iris" | "sky" | "graphite"`

---


### `PresetOverrides`
Per-family, per-mode token overrides for the preset theme set.

`Partial<Record<PresetFamily, Partial<Record<PresetVariant, PresetVariantOverride>>>>`

---


### `PresetThemeName`
The full name of a preset theme, e.g. `"oat-light"`.

``${unknown}${unknown}``

---


### `PresetVariant`
The color mode of a preset theme.

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


### `ThemeBootstrapConfig<T extends ThemeDefinition>`
The subset of ThemeKitConfig the pre-paint bootstrap can act on.

**See also:** `toBootstrapConfig`

`Pick<ThemeKitConfig<T>, "themes" | "defaultTheme" | "initialMode" | "initialFamily" | "storageKey" | "prefix">`

Split out deliberately. The bootstrap runs before any application code and
before the runtime exists, so it can only resolve a selection from a
registry, a fallback and a persisted key — everything else in the config is a
runtime concern. Naming that subset is what keeps the two projections honest
instead of letting them grow into each other.

---


### `ThemeChangeSource`
The origin of a theme change, used to attribute debug events.

`"user" | "system" | "persistence" | "broadcast" | "update" | "init"`

---


### `ThemeDiagnosticCode`
A stable, machine-readable identifier for a Theme Kit diagnostic.

Codes are part of the public contract: they are what tests assert on and what
tooling can filter by. The human-readable message is deliberately *not* — it
may be reworded at any time.

Naming is `TK_<DOMAIN>_<CONDITION>`. Codes are added only alongside the
diagnostic that actually emits them; this union is never pre-populated with
speculative entries.

**See also:** `ThemeDiagnostic`

`"TK_MODE_INVALID" | "TK_THEME_TOKEN_MISSING" | "TK_A11Y_CONTRAST_VIOLATION" | "TK_SCHEDULE_THEME_UNRESOLVED" | "TK_PLUGIN_DESTROY_FAILED"`

---


### `ThemeDiagnosticLevel`
Severity of a Theme Kit diagnostic.

The level is a deliberate decision per diagnostic, not a default. It records
what the caller is expected to do about it:

- `"error"` — continuing would produce incorrect state.
- `"warning"` — recoverable, but the caller very likely made a mistake.
- `"deprecation"` — still supported, but scheduled to be removed.
- `"info"` — useful context; never indicates a problem.

**See also:** `ThemeDiagnostic`

`"error" | "warning" | "deprecation" | "info"`

---


### `ThemeFamilies<T extends readonly ThemeDefinition[]>`
Extract the literal theme-family union from a tuple of theme definitions.
When themes are defined with `as const`, autocomplete shows the available
families in `setFamily()` / `initialFamily`:

```ts
const themes = [
  { name: "mint-light", meta: { family: "mint", mode: "light" }, tokens: {} },
  { name: "mint-dark",  meta: { family: "mint", mode: "dark" }, tokens: {} },
] as const;
// ThemeFamilies<typeof themes> → "mint"
```

`FamilyOf<T[number]> extends never ? string : FamilyOf<T[number]>`

---


### `ThemeLifecycleEventName`
Names of the lifecycle events exposed by ThemeLifecycle.

`keyof ThemeLifecycleEventMap`

---


### `ThemeMode`
The color-mode dimension of a theme selection.

- `"light"` and `"dark"` are explicit modes.
- `"system"` follows the visitor's `prefers-color-scheme` preference and
  resolves to `"light"` or `"dark"` at selection time.

`"light" | "dark" | "system"`

---


### `ThemeModes<T extends readonly ThemeDefinition[]>`
Extract the literal theme-mode union from a tuple of theme definitions.
With `as const`, `ThemeModes<typeof themes> → "light" | "dark"`.

`ModeOf<T[number]> extends never ? ThemeMode : ModeOf<T[number]>`

---


### `ThemeName`
Stable theme identifier used for selection and lookup.

Any string is accepted; use a readable family-oriented name such as
`"mint-light"` or `"dark"`.

`string`

---


### `ThemePack<T extends ThemeDefinition>`
A named collection of theme definitions installable as a group.

Themes installed through `use` receive a `pack:<name>` tag and replace
any existing theme with the same name.

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
The name of a token group that can be emitted as CSS custom properties.

`"colors" | "spacing" | "radius" | "shadows" | "borderWidths" | "zIndex" | "breakpoints" | "typography" | "code"`

---


### `TransitionPreset`
Named or explicit transition property sets.

- `"smooth"`: full curated color set (colors, borders, radii, shadows).
- `"subtle"`: reduced color set.
- `"instant"`: only `opacity`.
- `"custom"`: reserved for explicit `properties`.
- `string[]`: explicit property list.

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


### `default`
`NuxtModule<ModuleOptions>`

---


### `DEFAULT_SCHEDULED_DARK_THEME`
The default neutral dark theme name used when `darkTheme` is omitted and
 no family counterpart can be derived.

`"dark"`

---


### `DEFAULT_SCHEDULED_LIGHT_THEME`
The default neutral theme names used when `lightTheme`/`darkTheme` are
 omitted and no family counterpart can be derived.

`"light"`

---


### `DEFAULT_THEME_TRANSITION`
The default transition configuration applied by the runtime when
transitions are enabled without explicit options.

`Omit<Required<ThemeTransitionOptions>, "preset"> & Partial<Pick<ThemeTransitionOptions, "preset">>`

---


### `DEFAULT_TIMEZONE_LOCATION`
Fallback used when nothing else can be resolved (New York).

`TimeZoneLocation`

---


### `DEFAULT_TRANSITION_PRESET`
The transition preset used when `ThemeTransitionOptions.preset` is
omitted.

`TransitionPreset`

---


### `EMPTY_THEME_DIFF`
A `ThemeDiff` with every group set to `false`, representing "nothing
changed". Used as the identity/empty diff so downstream stages can short-
circuit when no token group differs between two themes.

`ThemeDiff`

---


### `EMPTY_THEME_SCHEDULE_STATE`
The default, disabled ThemeScheduleState snapshot. Used as the
initial state before a schedule resolves its location and themes.

`ThemeScheduleState`

---


### `GROUP_PROPERTIES`
Maps each animatable token group to the CSS properties it drives.

`colors` maps to an empty list because theme colors flow through
`@property`-registered custom properties on `:root` and animate by
inheritance; every other group lists the concrete CSS properties animated
on the scanned elements that use them.

`Record<AnimatedGroupKey, string[]>`

---


### `GROUP_VAR_PREFIXES`
CSS variable prefixes each token group materializes to (see `themeToCSSVariables`).

`Record<keyof ThemeDiff, string[]>`

---


### `migrations`
The registered migration steps, ordered by their `from` version. Managed via
registerMigration and clearMigrations.

`MigrationStep[]`

---


### `PRE_PAINT_SCROLLBAR_CSS`
The CSS that hides native scrollbars while `tk-scrollbar` is present on
 `<html>`. Shared by the client bootstrap script and Next's SSR output so
 both apply identical rules.

`string`

---


### `ThemeInspector`
Vue component that renders the framework-agnostic Theme Inspector.

Renders a `<theme-kit-inspector>` custom element (defined on mount) that
shows a floating toggle opening a panel inspecting the active theme —
identity, selection, tokens, and resolved CSS variables. Can be registered
globally via `app.use(ThemeInspector)`.

**See also:** `ThemeInspectorProps`, `useTheme`

`Component & { install: void }`

---


### `themeKitCookieNames`
Cookie contract shared between the server resolver, the client persistence
adapter and the blocking bootstrap script. Same names as `@theme-kit/next`:

  theme-name       → exact resolved theme
  theme-family     → selected family
  theme-mode       → selected mode (light | dark | system)
  theme-fingerprint→ theme-config fingerprint (stale cookies are rejected)

**See also:** `parseCookieHeader`

`{ family: "theme-family"; fingerprint: "theme-fingerprint"; mode: "theme-mode"; name: "theme-name" }`

---


### `ThemeProvider`
Vue component that provides a Theme Kit runtime to its subtree and applies
the active theme to the DOM.

Renders only its default slot (no wrapper element). When no `runtime` prop
is given, it creates and owns a runtime from the other props, injects a
blocking zero-flash bootstrap script, and binds DOM/CSS variables on mount.
The owned runtime is destroyed on unmount. Can be registered globally via
`app.use(ThemeProvider)`.

**See also:** `ThemeProviderProps`, `useThemeRuntime`, `ThemeScope`

`Component & { install: void }`

---


### `ThemeScope`
Vue component that applies a scoped theme to its subtree.

Renders a `div` wrapper carrying a `data-v-tk-scope` attribute and applies
the resolved theme's CSS variables to that element, overriding the
provider's selection for the subtree. Supports an exact theme, a theme
family, local theme definitions, and per-scope transitions. Can be
registered globally via `app.use(ThemeScope)`.

**See also:** `ThemeScopeProps`, `useTheme`

`Component & { install: void }`

---


### `ThemeScrollbar`
Vue component that replaces the native scrollbar with a themed overlay
scrollbar.

Renders nothing (returns `null`) and instead installs an overlay scrollbar
on the target element (see ThemeScrollbarProps.tag) once mounted.
Injects the pre-paint hiding CSS synchronously during `setup` so the native
bar never flashes. Can be registered globally via `app.use(ThemeScrollbar)`.

**See also:** `ThemeScrollbarProps`, `ThemeProvider`

`Component & { install: void }`

---


### `TRANSITION_PRESETS`
Built-in property lists for the named transition presets.

`Record<string, string[]>`

---

## Related docs

- [Families & Modes](/core-concepts) — A selection is a family (which palette) plus a mode (light/dark/system); every framework exposes the same read/write surface for it.
- [Runtime](/architecture) — One runtime per app owns the store, selection, registry, history, lifecycle and adapters; every framework binding is a thin view over it.
- [ThemeScope](/scoped-theme) — Apply a different family/mode (or a local theme definition) to a subtree, with scoped CSS variables and pre-paint support.
- [Persistence](/persistence) — Persist the selection across reloads and requests, with fingerprint validation, storage adapters and theme migrations.
- [Scheduling](/advanced-features) — Switch family/mode on a time-of-day schedule, with an explicit binding between the schedule state and the runtime selection.
- [Zero-flash bootstrap](/zero-flash) — Paint the correct theme on the first frame: a blocking script plus server-resolved initial state, with a Vite plugin for SPA builds.
- [Nuxt](/framework-guides/nuxt) — the framework integration
