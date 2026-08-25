## @theme-kit/vue

> Generated from `packages/vue/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createVueThemeBootstrapScript<T extends ThemeDefinition<string>>(options): string`
Build the blocking zero-flash `<head>` script for a Vue app (SSR or SPA).

Inlines core's `createThemeBootstrapScript` with the Vue defaults
(`storageKey: "theme-selection"`, `prefix: "theme-"` — the same values the
Vue `ThemeProvider` persistence and CSS variables use), so the persisted
theme is applied before first paint. Emit the returned string as a
blocking `<script>` inside `<head>`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeBootstrapScriptOptions<T>` | — |

**Returns** `string`

---


### `provideThemeRuntime<T extends ThemeDefinition<string>>(runtime): void`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `void`

---


### `useBootstrapTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Vue composable that installs the Bootstrap adapter onto the active Theme Kit
runtime. Maintains a tagged `:root` style element with concrete `--bs-*`
variables (including `-rgb` triplets), kept in sync as the active theme
changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `UseAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `useDaisyTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Vue composable that installs the daisyUI adapter onto the active Theme Kit
runtime. Maintains a tagged `:root` style element with concrete `--color-*`
variables, kept in sync as the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `UseAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `useOpenPropsTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Vue composable that installs the Open Props adapter onto the active Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--brand`, `--link`, `--size-*` and related variables, kept in sync as the
active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `UseAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `useShadcnTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Vue composable that installs the shadcn/ui adapter onto the active Theme Kit
runtime. Maintains a tagged `:root` style element with concrete `--*`
variables, kept in sync as the active theme changes.

Call once in your app root:

```ts
import { useShadcnTheme } from "@theme-kit/vue";

function App() {
  useShadcnTheme();
  return <YourApp />;
}
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `UseAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `useTheme<T extends ThemeDefinition<string>>(): { family: Ref<string, string>; mode: Ref<ThemeMode, ThemeMode>; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: Ref<T, T>; toggleTheme: __type(): void }`
**Returns** `{ family: Ref<string, string>; mode: Ref<ThemeMode, ThemeMode>; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: Ref<T, T>; toggleTheme: __type(): void }`

---


### `useThemeBatch(): __type(callback: __type(): void): void`
**Returns** `__type(callback: __type(): void): void`

---


### `useThemeFamily(): Ref<string, string>`
**Returns** `Ref<string, string>`

---


### `useThemeHistory<T extends ThemeDefinition<string>>(): { canRedo: Ref<boolean, boolean>; canUndo: Ref<boolean, boolean>; clear: __type(): void; history: Ref<readonly { theme: UnwrapRef; timestamp: number }[], readonly HistoryEntry<T>[] | readonly { theme: UnwrapRef; timestamp: number }[]>; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void }`
**Returns** `{ canRedo: Ref<boolean, boolean>; canUndo: Ref<boolean, boolean>; clear: __type(): void; history: Ref<readonly { theme: UnwrapRef; timestamp: number }[], readonly HistoryEntry<T>[] | readonly { theme: UnwrapRef; timestamp: number }[]>; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void }`

---


### `useThemeLifecycle(): { on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`
**Returns** `{ on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`

---


### `useThemeMode(): Ref<ThemeMode, ThemeMode>`
**Returns** `Ref<ThemeMode, ThemeMode>`

---


### `useThemePacks(): __type(pack: ThemePack<any>): void`
**Returns** `__type(pack: ThemePack<any>): void`

---


### `useThemeRestore(): __type(snapshot: ThemeRuntimeSnapshot<ThemeDefinition<string>>): void`
**Returns** `__type(snapshot: ThemeRuntimeSnapshot<ThemeDefinition<string>>): void`

---


### `useThemeRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
**Returns** `ThemeRuntime<T>`

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
**Returns** `__type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>`

---


### `useThemeTokens<T extends ThemeDefinition<string>>(): Ref<ThemeTokens | undefined, ThemeTokens | undefined>`
**Returns** `Ref<ThemeTokens | undefined, ThemeTokens | undefined>`

---


### `useThemeValue<T extends ThemeDefinition<string>>(): Ref<T, T>`
**Returns** `Ref<T, T>`

---

## Interfaces

### `ThemeInspectorProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `bottom` (optional) | `number` | Distance from the bottom of the viewport, in px. Default 104. |
| `right` (optional) | `number` | Distance from the right edge of the viewport, in px. Default 32. |
| `size` (optional) | `number` | Toggle button size, in px. Default 40. |
| `zIndex` (optional) | `number` | Z-index for the floating toggle and panel. Default 9999. |

---


### `ThemeProviderProps<T extends ThemeDefinition>`

**Extends** `ThemeRuntimeOptions<T>`
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
| `runtime` (optional) | `ThemeRuntime<T>` | — |
| `scheduled` (optional) | `false | ScheduledThemeOptions<T>` | — |
| `themes` (optional) | `readonly T[]` | — |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | — |
| `view` (optional) | `Window` | — |

---


### `ThemeScheduleController`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `disable` | `__type(): void` | — |
| `enable` | `__type(): void` | — |
| `schedule` | `ThemeSchedule | null` | The underlying controller (`null` when the provider has no `scheduled`
 option). Methods below are safe no-ops in that case. |
| `set` | `__type(options: ThemeScheduleSetOptions): void` | — |
| `state` | `Ref<ThemeScheduleState>` | Reactive state snapshot: `enabled`, `active`, `status`, `sunrise`,
 `sunset`, `nextTransition`, `nextActivation`, `nextDeactivation`. |

---


### `ThemeScopeProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` (optional) | `string` | Theme family for the scoped subtree. Without `mode`, follows the
 provider's current mode. |
| `mode` (optional) | `ThemeMode` | Mode for a family-based scope. Defaults to the provider's current mode. |
| `theme` (optional) | `string` | Exact theme name or family name. When `family`/`mode` are also set,
 `theme` wins. Omit to follow the provider's selection inside a boundary. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions — resolved first, parent registry falls back.
 No second runtime is created. |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | Transition for this scope. `undefined` inherits the provider's,
 `false` disables it, an object is merged over the provider config. |

---


### `ThemeScrollbarProps`

**Extends** `OverlayScrollbarOptions`
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
| `dir` (optional) | `"ltr" | "rtl" | "auto"` | Text direction. Defaults to the resolved `dir` / CSS `direction`. |
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
| `tag` (optional) | `string` | — |
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


### `UseAdapterOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | — |

---

## Variables

### `ThemeInspector`
`Component & { install: void }`

---


### `ThemeKitSymbol`
`InjectionKey<ThemeRuntime<any>>`

---


### `ThemeProvider`
`Component & { install: void }`

---


### `ThemeScope`
`Component & { install: void }`

---


### `ThemeScrollbar`
`Component & { install: void }`

---
