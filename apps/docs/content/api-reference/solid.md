## @theme-kit/solid
Theme Kit Solid integration.

Provides the `ThemeProvider`, `ThemeScope`, `ThemeScrollbar`, and
`ThemeInspector` components, the `useTheme*` hooks, and the SSR
bootstrap-script helper.

> Generated from `packages/solid/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createSolidThemeBootstrapScript<T extends ThemeDefinition<string>>(options): string`
Build the blocking zero-flash `<head>` script for a SolidJS app (SSR or SPA).

Inlines core's `createThemeBootstrapScript` with the Solid defaults
(`storageKey: "theme-selection"`, `prefix: "theme-"` — the same values the
Solid `ThemeProvider` persistence and CSS variables use), so the persisted
theme is applied before first paint. Emit the returned string as a
blocking `<script>` inside `<head>`.

**See also:** ``createThemeBootstrapScript``

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeBootstrapScriptOptions<T>` | — |

**Returns** `string`

---


### `ThemeInspector(props): Element`
Renders the floating theme inspector for the active runtime.

Defines and mounts the `<theme-kit-inspector>` custom element, forwarding the
given position, size, z-index, `class`, and `style` props. The inspector
reads the active theme from the runtime and lets users inspect and switch
themes at runtime.

**See also:** `ThemeProvider`, `useTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `props` | `ThemeInspectorProps` | The inspector configuration. |

**Returns** `Element`

---


### `ThemeProvider<T extends ThemeDefinition<string>>(props): Element`
Provides a ThemeRuntime to the Solid component tree via context.

When no `runtime` prop is given the provider creates and owns a runtime from
the remaining ThemeProviderProps (which extend
ThemeRuntimeOptions), wiring up DOM and CSS-variable bindings on
mount and destroying the runtime on cleanup. When a `runtime` prop is
supplied the provider adopts that caller-owned runtime and does not destroy
it. Renders no DOM of its own — it only supplies context to its children.

**See also:** `useTheme`, `ThemeScope`, `useThemeRuntime`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `props` | `ThemeProviderProps<T>` | The provider options and children. |

**Returns** `Element`

The provider must be mounted before any hook that reads the runtime
(`useTheme`, `useThemeRuntime`, …) is called, since those hooks throw when
no provider context exists. On the server the provider renders its children
without DOM bindings; the persisted selection is applied client-side before
first paint via an injected bootstrap script.

```ts
import { ThemeProvider } from "@theme-kit/solid";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <YourApp />
    </ThemeProvider>
  );
}
```

---


### `ThemeScope(props): Element`
Creates a nested theme boundary that overrides the selection for its subtree.

Renders a wrapper `<div>` carrying the resolved theme's `data-theme`,
`data-mode`, and CSS-variable inline styles, and keeps it in sync as the
scope's props or the provider's selection change. On the server no wrapper
is rendered — the children are returned directly so the provider's `:root`
attributes apply client-side.

**See also:** `ThemeProvider`, `useTheme`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `props` | `ThemeScopeProps` | The scope configuration and children. |

**Returns** `Element`

The scope does not create a second runtime; it resolves against the
provider's theme registry, with any `themes` prop shadowing same-named
parent themes. Family-based and boundary-only scopes follow the provider's
live mode, flipping light/dark when the global mode changes.

---


### `ThemeScrollbar(props): null`
Applies an overlay scrollbar to the runtime's scrollable content.

Installs an overlay scrollbar bound to the active theme's store on mount and
destroys it on cleanup. Renders no DOM of its own — it returns `null` and
only manages the scrollbar lifecycle for the surrounding content.

**See also:** `ThemeProvider`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `props` | `ThemeScrollbarProps` | The scrollbar options and children. |

**Returns** `null`

---


### `useTheme<T extends ThemeDefinition<string>>(): { family: Accessor<string>; mode: Accessor<ThemeMode>; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: Accessor<T>; toggleTheme: __type(): void }`
Reactive access to the current theme selection plus actions to change it.

Combines the reactive signals from `useThemeValue`, `useThemeMode`, and
`useThemeFamily` with imperative setters that drive the runtime selection.
Must be called inside a component rendered within a `ThemeProvider`.

**See also:** `useThemeValue`, `useThemeMode`, `useThemeFamily`

**Returns** `{ family: Accessor<string>; mode: Accessor<ThemeMode>; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: Accessor<T>; toggleTheme: __type(): void }` — An object with reactive `theme`, `mode`, and `family` signals and
  the `setMode`, `setFamily`, and `toggleTheme` actions.

```ts
import { useTheme } from "@theme-kit/solid";

function ThemeToggle() {
  const { mode, setMode, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      Current mode: {mode()}
    </button>
  );
}
```

---


### `useThemeBatch(): __type(callback: __type(): void): void`
Returns a function that batches multiple runtime mutations into a single
store update.

The returned callback forwards to the runtime's `batch` method, coalescing
several selection changes so subscribers observe one consolidated change.

**See also:** `useThemeRuntime`, `useTheme`

**Returns** `__type(callback: __type(): void): void` — A function accepting a callback whose mutations are batched.

---


### `useThemeFamily(): Accessor<string>`
Reactive access to the current theme family as a Solid signal.

Returns a signal tracking the runtime selection's theme family name. The
signal is seeded on mount and kept in sync with the store; the subscription
is disposed on component cleanup.

**See also:** `useTheme`

**Returns** `Accessor<string>` — A Solid signal holding the current theme family name.

---


### `useThemeHistory<T extends ThemeDefinition<string>>(): { clear: __type(): void; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void; canRedo: void; canUndo: void; history: void }`
Reactive access to the runtime's theme history (undo/redo).

Returns reactive `canUndo`, `canRedo`, and `history` getters plus the
`undo`, `redo`, `clear`, and `jump` actions. The reactive state is seeded on
mount and refreshed whenever the store changes; the subscription is disposed
on component cleanup.

**See also:** `useThemeRuntime`, `useThemeBatch`

**Returns** `{ clear: __type(): void; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void; canRedo: void; canUndo: void; history: void }` — An object exposing the history state and navigation actions.

---


### `useThemeLifecycle(): { on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`
Returns a function that subscribes to runtime lifecycle events.

The returned `on` callback forwards to the runtime's lifecycle emitter,
registering a listener for the given ThemeLifecycleEventName.

**See also:** `useThemeRuntime`, `useTheme`

**Returns** `{ on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }` — An object exposing an `on` function to register lifecycle listeners.

---


### `useThemeMode(): Accessor<ThemeMode>`
Reactive access to the current theme mode as a Solid signal.

Returns a signal tracking the runtime selection's mode (`light`, `dark`, or
`system`). The signal is seeded on mount and kept in sync with the store;
the subscription is disposed on component cleanup.

**See also:** `useTheme`

**Returns** `Accessor<ThemeMode>` — A Solid signal holding the current theme mode.

---


### `useThemePacks(): __type(pack: ThemePack<any>): void`
Returns a function that installs a theme pack onto the runtime.

The returned callback forwards to the runtime's `use` method, registering a
ThemePack so its themes become available to the selection.

**See also:** `useThemeRuntime`, `useTheme`

**Returns** `__type(pack: ThemePack<any>): void` — A function accepting a theme pack to install.

---


### `useThemeRestore(): __type(snapshot: ThemeRuntimeSnapshot): void`
Returns a function that restores the runtime from a previously captured
snapshot.

The returned callback forwards to the runtime's `restore` method, applying
the given ThemeRuntimeSnapshot back onto the runtime.

**See also:** `useThemeSnapshot`

**Returns** `__type(snapshot: ThemeRuntimeSnapshot): void` — A function accepting a snapshot to restore.

---


### `useThemeRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
Returns the active ThemeRuntime from the nearest ThemeProvider.

Must be called inside a component (owner) rendered within a `ThemeProvider`;
otherwise it throws. The returned runtime is the same object the provider
owns or adopts, so it is not reactive by itself — use the dedicated hooks
(`useThemeValue`, `useThemeMode`, …) for reactive reads.

**See also:** `ThemeProvider`, `useThemeValue`

**Returns** `ThemeRuntime<T>` — The active theme runtime.

---


### `useThemeSchedule<T extends ThemeDefinition<string>>(): { disable: __type(): void; enable: __type(): void; set: __type(options: ThemeScheduleSetOptions): void; active: void; darkTheme: void; enabled: void; lightTheme: void; nextActivation: void; nextDeactivation: void; nextTransition: void; status: void; sunrise: void; sunset: void } | null`
Reactive access to the runtime's sunrise/sunset scheduling controller.
Returns `null` when the provider was created without the `scheduled` option.
Reads of `enabled`/`active`/`status`/`sunrise`/`sunset`/`nextTransition`
track the underlying state reactively.

```tsx
const schedule = useThemeSchedule();
schedule?.enable();
schedule?.disable();
```

**Returns** `{ disable: __type(): void; enable: __type(): void; set: __type(options: ThemeScheduleSetOptions): void; active: void; darkTheme: void; enabled: void; lightTheme: void; nextActivation: void; nextDeactivation: void; nextTransition: void; status: void; sunrise: void; sunset: void } | null`

---


### `useThemeSnapshot(): __type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>`
Returns a function that captures the runtime's current state as a snapshot.

The returned callback forwards to the runtime's `snapshot` method, producing
a ThemeRuntimeSnapshot that can later be passed to `useThemeRestore`.

**See also:** `useThemeRestore`

**Returns** `__type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>` — A function returning the current runtime snapshot.

---


### `useThemeTokens<T extends ThemeDefinition<string>>(): Accessor<ThemeTokens | undefined>`
Reactive access to the active theme's token group as a Solid signal.

Returns a signal whose value is the `tokens` object of the current theme
selection, or `undefined` when the active theme defines no tokens. The
signal updates whenever the store's theme changes and the subscription is
disposed on component cleanup.

**See also:** `useThemeValue`

**Returns** `Accessor<ThemeTokens | undefined>` — A Solid signal holding the active theme's tokens.

---


### `useThemeValue<T extends ThemeDefinition<string>>(): Accessor<T>`
Reactive access to the current theme selection as a Solid signal.

Returns a signal whose value tracks the runtime store's active theme. The
signal is seeded from the store on mount and updated on every store change;
the subscription is disposed automatically when the owning component is
cleaned up.

**See also:** `useTheme`, `useThemeRuntime`

**Returns** `Accessor<T>` — A Solid signal holding the active theme.

---

## Interfaces

### `ThemeInspectorProps`
Props accepted by ThemeInspector.

Configures the floating theme inspector's position, size, and z-index, plus
optional `class` and `style` forwarded to the underlying
`<theme-kit-inspector>` element.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `bottom` (optional) | `number` | Distance from the bottom of the viewport, in px. Default 104. |
| `class` (optional) | `string` | Forwarded to the underlying <theme-kit-inspector> element. |
| `right` (optional) | `number` | Distance from the right edge of the viewport, in px. Default 32. |
| `size` (optional) | `number` | Toggle button size, in px. Default 40. |
| `style` (optional) | `string` | Inline styles forwarded to the underlying <theme-kit-inspector> element. |
| `zIndex` (optional) | `number` | Z-index for the floating toggle and panel. Default 9999. |

---


### `ThemeProviderProps<T extends ThemeDefinition>`

**Extends** `ThemeRuntimeOptions<T>`
Props accepted by ThemeProvider.

Extends ThemeRuntimeOptions so the provider can build and own a
runtime from the same options used by `createThemeRuntime`. When `runtime`
is supplied the provider adopts that caller-owned runtime instead of
creating one.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `ThemeAdapter<T>[]` | Library adapters installed when the runtime is created. The runtime owns the registry and notifies every adapter whenever the theme changes; it never knows anything about the libraries themselves. |
| `broadcast` (optional) | `ThemeSelectionBroadcastAdapter \| null` | Cross-tab broadcast adapter. When omitted, a `BroadcastChannel`-based adapter on channel `"theme-selection"` is created; pass `null` to disable cross-tab sync. |
| `children` (optional) | `Element` | The subtree rendered inside the provider's context. |
| `cssVariables` (optional) | `false \| CSSVariablesOptions` | CSS-variable binding configuration. `false` disables the binding. |
| `defaultTheme` (optional) | `T["name"]` | Theme name to activate when no persisted or explicit selection exists. |
| `dom` (optional) | `false \| DOMBindingOptions` | DOM attribute/class binding configuration. `false` disables the binding. |
| `initial` (optional) | `InitialThemeResolution<T>` | Explicit initial theme resolution, bypassing default + persistence based resolution. |
| `initialFamily` (optional) | `string` | Initial family used when nothing else is given. |
| `initialMode` (optional) | `ThemeMode` | Initial mode used when nothing else is given. |
| `persistence` (optional) | `ThemeSelectionPersistenceAdapter \| null` | Persistence adapter for the theme selection. Pass `null` to disable persistence entirely. |
| `plugins` (optional) | `ThemePlugin<T>[]` | Runtime plugins installed at creation. |
| `readPersistenceOnInit` (optional) | `boolean` | Whether a persisted selection is read at runtime creation. |
| `runtime` (optional) | `ThemeRuntime<T>` | An existing runtime to adopt. When omitted the provider creates and owns its own runtime from the remaining props. |
| `scheduled` (optional) | `false \| ScheduledThemeOptions<T>` | Sunrise/sunset scheduling configuration. `false` disables scheduling. |
| `themes` (optional) | `readonly T[]` | Initial theme definitions. Duplicate names are dropped (first wins). When omitted, the registry starts empty. |
| `transition` (optional) | `boolean \| ThemeTransitionOptions` | Transition configuration. `true` enables transitions with defaults, `false` disables them, and an object provides explicit options. |
| `view` (optional) | `Window` | The `window` to bind to. Defaults to the global `window` when available; omit (or pass `undefined`) in SSR environments. |

---


### `ThemeScopeProps`
Props accepted by ThemeScope.

Configures a nested theme boundary that overrides the global selection for
its subtree. `theme` wins over `family`/`mode`; when none are given the
scope mirrors the provider's selection inside its own boundary.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` (optional) | `Element` | The subtree rendered inside the scope's wrapper. |
| `className` (optional) | `string` | CSS class applied to the scope's wrapper `<div>`. |
| `family` (optional) | `string` | Theme family for the scoped subtree. When `mode` is omitted the scope follows the provider's current mode (light/dark/system). |
| `mode` (optional) | `ThemeMode` | Mode for a family-based scope. Optional — defaults to the provider's current mode so `family="plum"` flips light/dark with the page. |
| `theme` (optional) | `string` | Exact theme name, family name, or a `{ family, mode }`-style object. When `family`/`mode` are also passed, `theme` wins (it's the explicit selection). Omit to follow the global selection inside a new boundary. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions for genuinely isolated components. Resolved FIRST (they shadow same-named parent themes), then the provider's registry falls back — no second runtime is created. |
| `transition` (optional) | `boolean \| ThemeTransitionOptions` | Transition for this scope's own theme changes. `undefined` inherits the `<ThemeProvider/>` transition, `false` disables it, `true` inherits, and an object is merged over the provider's config (local keys win). |

---


### `ThemeScrollbarProps`

**Extends** `OverlayScrollbarOptions`
Props accepted by ThemeScrollbar.

Extends OverlayScrollbarOptions so the scrollbar can be configured
with the same options used by `createOverlayScrollbar`.

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
| `children` (optional) | `Element` | The subtree the scrollbar is applied to. |
| `clickToJump` (optional) | `boolean` | Clicking the empty track scrolls smoothly to that position. Default `true`. |
| `dir` (optional) | `"ltr" \| "rtl" \| "auto"` | Text direction. Defaults to the resolved `dir` / CSS `direction`. |
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

---

## Related docs

- [Families & Modes](/core-concepts) — A selection is a family (which palette) plus a mode (light/dark/system); every framework exposes the same read/write surface for it.
- [Runtime](/architecture) — One runtime per app owns the store, selection, registry, history, lifecycle and adapters; every framework binding is a thin view over it.
- [ThemeScope](/scoped-theme) — Apply a different family/mode (or a local theme definition) to a subtree, with scoped CSS variables and pre-paint support.
- [Persistence](/persistence) — Persist the selection across reloads and requests, with fingerprint validation, storage adapters and theme migrations.
- [Scheduling](/advanced-features) — Switch family/mode on a time-of-day schedule, with an explicit binding between the schedule state and the runtime selection.
- [Plugins](/plugins) — Extend the runtime through a first-class plugin manager and adapter registry; theme packs install ready-made behaviour.
- [Zero-flash bootstrap](/zero-flash) — Paint the correct theme on the first frame: a blocking script plus server-resolved initial state, with a Vite plugin for SPA builds.
- [Custom scrollbar](/custom-scrollbar) — Themed overlay scrollbars that match the active theme and pre-paint before hydration.
- [DevTools](/devtools) — Inspect and drive the live runtime from a panel: adapters, history, snapshots and performance entries.
- [Solid](/framework-guides/solid) — the framework integration
