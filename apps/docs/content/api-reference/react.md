## @theme-kit/react

> Generated from `packages/react/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createThemeRoot<T extends ThemeDefinition<string>>(options): ThemeRootHandle<T>`
Create a Theme Kit-owned React root for client-rendered (CSR) applications.

Theme Kit owns the root boundary: the runtime is created once, and the
initial commit is flushed synchronously so the browser's very first frame is
already the themed UI. Without it, React's concurrent root can schedule the
initial commit after the browser paints an empty/partial frame — visible as
a flicker on reload in some applications.

This is an **optional, opt-in** helper. Most applications can use the plain
React API and it will be smooth:

```tsx
const root = createRoot(container);
root.render(
  <ThemeProvider themes={themes} defaultTheme="mint-light" initialMode="system">
    <App />
  </ThemeProvider>,
);
```

Reach for `createThemeRoot` when you want Theme Kit to own the root
initialization boundary — for example a reload-sensitive demo, or an app
whose providers need the Theme Kit runtime at composition time:

```tsx
import { createThemeRoot } from "@theme-kit/react";

const handle = createThemeRoot({
  container: document.getElementById("root")!,
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
  transition: { enabled: true },
  render: ({ runtime }) => (
    <MuiThemeProvider theme={createMuiTheme(runtime)}>
      <App />
    </MuiThemeProvider>
  ),
});

handle.unmount();
```

Only the FIRST commit is flushed synchronously; subsequent renders keep
React's normal concurrent scheduling. `ThemeProvider` itself never calls
`flushSync` — the helper owns the root, which is the one place React
documents `flushSync` as appropriate.

Do **not** use this helper for SSR/SSG applications — server-rendered HTML
must be hydrated with `hydrateRoot()` (or a framework integration such as
`@theme-kit/next`), not replaced by a fresh `createRoot`.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `CreateThemeRootOptions<T>` | — |

**Returns** `ThemeRootHandle<T>`

---


### `ThemeInspector(__namedParameters): Element`
**Returns** `Element`

---


### `ThemeModeButton(): Element`
**Returns** `Element`

---


### `ThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
**Returns** `Element`

---


### `ThemeScope(__namedParameters): Element`
**Returns** `Element`

---


### `ThemeScrollbar(props): null`
ThemeScrollbar — overlay only.

Creates the custom scrollbar overlay.

Lifecycle:
  mount  → create overlay → measure → attach listeners
  paint  → add tk-scrollbar-ready
  destroy → remove overlay

Props are organized into three optional groups — `behavior`, `appearance`
and `icons` — but every option is also accepted as a flat, top-level prop
(flat props win over the grouped ones).

  <ThemeScrollbar
    behavior={{ autoHide: true, smooth: true }}
    appearance={{ thickness: 8, radius: 999 }}
    icons={{ up: <ArrowUpIcon />, down: <ArrowDownIcon /> }}
  />

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `props` | `ThemeScrollbarProps` | — |

**Returns** `null`

---


### `useScopedTheme(ref, selection, transition?): RefObject<{ destroy: void; getTheme: void; setLocalThemes: void; setTransition: void; update: void } | null>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `ref` | `RefObject<HTMLElement | null>` | — |
| `selection` | `ScopedThemeSelection | null` | — |
| `transition` | `boolean | ThemeTransitionOptions` (optional) | — |

**Returns** `RefObject<{ destroy: void; getTheme: void; setLocalThemes: void; setTransition: void; update: void } | null>`

---


### `useSetThemeFamily<T extends ThemeDefinition<string>>(): __type(family: ThemeFamilies<readonly T[]>): void`
Get a stable `setFamily` function (does not re-render on change).

**Returns** `__type(family: ThemeFamilies<readonly T[]>): void`

---


### `useSetThemeMode<T extends ThemeDefinition<string>>(): __type(mode: ModesOf<T>): void`
Get a stable `setMode` function (does not re-render on change).

**Returns** `__type(mode: ModesOf<T>): void`

---


### `useTheme<T extends ThemeDefinition<string>>(): { family: string; mode: ThemeMode; setFamily: __type(family: ThemeFamilies): void; setMode: __type(mode: ModesOf): void; theme: T; toggleTheme: __type(): void }`
The primary Theme Kit hook. Returns the current theme, mode, family and
   the selection controls.

   When you pass the theme tuple element type, `setFamily` and `setMode`
   are constrained to the families/modes defined in your themes:

   ```ts
   const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme<typeof themes[number]>();
   setFamily("mint");   // autocomplete suggests your families
   setMode("dark");
   ```

**Returns** `{ family: string; mode: ThemeMode; setFamily: __type(family: ThemeFamilies): void; setMode: __type(mode: ModesOf): void; theme: T; toggleTheme: __type(): void }`

---


### `useThemeBatch(): __type(callback: __type(): void): void`
Get a batch function that defers all selection changes and DOM writes
   to a single flush.

**Returns** `__type(callback: __type(): void): void`

---


### `useThemeFamily(): string`
Subscribe to the current selection family.

**Returns** `string`

---


### `useThemeHistory(): { canRedo: boolean; canUndo: boolean; clear: __type(): void; redo: __type(): void; undo: __type(): void }`
Subscribe to the runtime history (undo/redo/canUndo/canRedo/clear).

**Returns** `{ canRedo: boolean; canUndo: boolean; clear: __type(): void; redo: __type(): void; undo: __type(): void }`

---


### `useThemeLifecycle(): { on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`
Subscribe to runtime lifecycle events (theme changed, mode changed, …).

**Returns** `{ on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`

---


### `useThemeMode(): ThemeMode`
Subscribe to the current selection mode ("light" | "dark" | "system").

**Returns** `ThemeMode`

---


### `useThemePacks(): __type(pack: ThemePack<any>): void`
Get a function that applies a theme pack to the runtime.

**Returns** `__type(pack: ThemePack<any>): void`

---


### `useThemeRestore(): __type(snapshot: ThemeRuntimeSnapshot): void`
Get a restore function that re-applies a previously captured snapshot.

**Returns** `__type(snapshot: ThemeRuntimeSnapshot): void`

---


### `useThemeRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
Get the active Theme Kit runtime from context. Throws when used outside a
`ThemeProvider`. Pass the theme tuple element type to type the runtime's
store/selection against your themes:

```ts
const runtime = useThemeRuntime<typeof themes[number]>();
```

**Returns** `ThemeRuntime<T>`

---


### `useThemeSchedule(): ThemeSchedule | null`
Reactive access to the runtime's sunrise/sunset scheduling controller.

Requires the runtime to be created with the `scheduled` option (see
`ThemeProvider` / `createThemeRuntime`). Returns `null` when the provider has
no schedule configured.

```tsx
const schedule = useThemeSchedule();
schedule?.enable();
schedule?.disable();
// schedule.enabled, schedule.active, schedule.sunrise, schedule.sunset,
// schedule.nextTransition ... re-render reactively.
```

**Returns** `ThemeSchedule | null`

---


### `useThemeSnapshot(): __type(): ThemeRuntimeSnapshot`
Get a snapshot function that captures the full runtime state.

**Returns** `__type(): ThemeRuntimeSnapshot`

---


### `useThemeTimeTravel(): { history: HistoryEntry<ThemeDefinition<string>>[]; jump: __type(index: number): void }`
Subscribe to the history timeline and get a `jump(index)` function.

**Returns** `{ history: HistoryEntry<ThemeDefinition<string>>[]; jump: __type(index: number): void }`

---


### `useThemeTokens<T extends ThemeDefinition<string>>(): ThemeTokens | undefined`
Subscribe to the current theme's token groups.

**Returns** `ThemeTokens | undefined`

---


### `useThemeValue<T extends ThemeDefinition<string>>(): T`
Subscribe to the current theme definition (re-renders on change).

**Returns** `T`

---


### `useToggleTheme(): __type(): void`
Get a stable `toggleTheme` function (flips light ⇄ dark).

**Returns** `__type(): void`

---

## Interfaces

### `CreateThemeRootOptions<T extends ThemeDefinition>`

**Extends** `Omit<ThemeProviderProps<T>, "children" | "runtime">`
Options for `createThemeRoot`.

Everything `ThemeProvider` accepts (except `children` and `runtime`, which
this helper manages), plus:

- `container` — the DOM node the root mounts into.
- `render` — the application's full composition. Receives the Theme Kit
  runtime so dependent library configuration can be derived from it:

  ```tsx
  createThemeRoot({
    container,
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
    render: ({ runtime }) => (
      <MuiThemeProvider theme={createMuiTheme(runtime)}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MuiThemeProvider>
    ),
  });
  ```

  Composition belongs in JSX, so arbitrary provider trees (MUI, Chakra,
  React Query, Redux, Router, …) are fully under the application's control.
  `render` is the primary (and only) composition mechanism — there is no
  separate `children` option.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `ThemeAdapter<T>[]` | Library adapters installed when the runtime is created. The runtime owns
 the registry and notifies every adapter whenever the theme changes; it
 never knows anything about the libraries themselves. |
| `broadcast` (optional) | `ThemeSelectionBroadcastAdapter | null` | — |
| `container` | `Element | DocumentFragment` | The DOM node this root mounts into. |
| `cssVariables` (optional) | `false | CSSVariablesOptions` | — |
| `defaultTheme` (optional) | `T["name"]` | — |
| `dom` (optional) | `false | DOMBindingOptions` | — |
| `initial` (optional) | `InitialThemeResolution<T>` | — |
| `initialFamily` (optional) | `ThemeFamilies<readonly T[]>` | The family resolved on first load. When themes are defined with `as const`,
this is constrained to the families defined in `themes` (autocomplete). |
| `initialMode` (optional) | `"system" | ThemeModes<readonly T[]>` | The mode resolved on first load: `"light" | "dark" | "system"`.
When themes are defined with `as const`, this is constrained to the
modes defined in `themes` plus `"system"` (autocomplete). |
| `persistence` (optional) | `ThemeSelectionPersistenceAdapter | null` | — |
| `plugins` (optional) | `ThemePlugin<T>[]` | — |
| `readPersistenceOnInit` (optional) | `boolean` | — |
| `render` | `__type(context: { runtime: ThemeRuntime<T> }): ReactNode` | Render the application tree. Called with the Theme Kit runtime so other
library providers can derive their configuration from it. |
| `scheduled` (optional) | `false | ScheduledThemeOptions<T>` | — |
| `themes` (optional) | `readonly T[]` | — |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | — |
| `view` (optional) | `Window` | — |

---


### `ThemeInspectorProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `bottom` (optional) | `number` | Vertical distance from the bottom of the viewport, in px. Default 104. |
| `right` (optional) | `number` | Horizontal distance from the right edge of the viewport, in px. Default 32. |
| `size` (optional) | `number` | Toggle button size (width and height), in px. Default 40. |
| `zIndex` (optional) | `number` | Z-index for the floating toggle and panel. Default 9999. |

---


### `ThemeProviderProps<T extends ThemeDefinition>`

**Extends** `Omit<ThemeRuntimeOptions<T>, "initialFamily" | "initialMode">`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `adapters` (optional) | `ThemeAdapter<T>[]` | Library adapters installed when the runtime is created. The runtime owns
 the registry and notifies every adapter whenever the theme changes; it
 never knows anything about the libraries themselves. |
| `broadcast` (optional) | `ThemeSelectionBroadcastAdapter | null` | — |
| `children` | `ReactNode` | — |
| `cssVariables` (optional) | `false | CSSVariablesOptions` | — |
| `defaultTheme` (optional) | `T["name"]` | — |
| `dom` (optional) | `false | DOMBindingOptions` | — |
| `initial` (optional) | `InitialThemeResolution<T>` | — |
| `initialFamily` (optional) | `ThemeFamilies<readonly T[]>` | The family resolved on first load. When themes are defined with `as const`,
this is constrained to the families defined in `themes` (autocomplete). |
| `initialMode` (optional) | `"system" | ThemeModes<readonly T[]>` | The mode resolved on first load: `"light" | "dark" | "system"`.
When themes are defined with `as const`, this is constrained to the
modes defined in `themes` plus `"system"` (autocomplete). |
| `persistence` (optional) | `ThemeSelectionPersistenceAdapter | null` | — |
| `plugins` (optional) | `ThemePlugin<T>[]` | — |
| `readPersistenceOnInit` (optional) | `boolean` | — |
| `runtime` (optional) | `ThemeRuntime<T>` | — |
| `scheduled` (optional) | `false | ScheduledThemeOptions<T>` | — |
| `themes` (optional) | `readonly T[]` | — |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | — |
| `view` (optional) | `Window` | — |

---


### `ThemeRootHandle<T extends ThemeDefinition>`
The handle returned by `createThemeRoot`.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `root` | `Root` | The underlying React root (for manual re-renders if needed). |
| `runtime` | `ThemeRuntime<T>` | The Theme Kit runtime created for this root. |
| `unmount` | `void` | — |

---


### `ThemeScopeProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `className` (optional) | `string` | — |
| `family` (optional) | `string` | Theme family for the scoped subtree. When `mode` is omitted the scope
 follows the provider's current mode (light/dark/system). |
| `mode` (optional) | `ThemeMode` | Mode for a family-based scope. Optional — defaults to the provider's
 current mode so `family="plum"` flips light/dark with the page. |
| `style` (optional) | `CSSProperties` | — |
| `theme` (optional) | `string` | Exact theme name, family name, or a `{ family, mode }`-style object.
 When `family`/`mode` are also passed, `theme` wins (it's the explicit
 selection). Omit to follow the global selection inside a new boundary. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions for genuinely isolated components. Resolved FIRST
 (they shadow same-named parent themes), then the provider's registry
 falls back — no second runtime is created. |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | Transition for this scope's own theme changes. `undefined` inherits the
 `<ThemeProvider/>` transition, `false` disables it, `true` inherits, and
 an object is merged over the provider's config (local keys win). |

---


### `ThemeScrollbarAppearance`

**Extends** `Pick<OverlayScrollbarOptions, "arrows" | "thickness" | "hoverThickness" | "radius" | "minThumbSize" | "offset" | "trackOpacity" | "thumbOpacity" | "zIndex" | "duration" | "animationDuration" | "thumbColor" | "trackColor" | "activeThumbColor" | "thumbHoverColor">`
Appearance — the look/size of every strip.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` (optional) | `string` | Custom thumb color while the user is dragging it. When set,
 overrides the theme-derived active color. Default `undefined`
 (uses `thumbColor` or theme-derived). |
| `animationDuration` (optional) | `number` | rAF easing time constant (ms) for smooth thumb travel. Default `180`. |
| `arrows` (optional) | `boolean` | Show the up/down (or left/right) navigation buttons like native browser
 scrollbars. Clicking scrolls a step; holding repeats. Default `true`. |
| `duration` (optional) | `number` | CSS transition duration (ms) for thickness/opacity/color. Default `250`. |
| `exclude` (optional) | `string[] | null` | Skip these containers when tracking. |
| `hoverThickness` (optional) | `number` | Thumb thickness while hovered / dragged — only used when `hoverExpand` is true. Default `thickness + 4`. |
| `include` (optional) | `string[] | null` | Scope the overlay to these containers (document is always tracked). |
| `minThumbSize` (optional) | `number` | Minimum thumb travel size. Default `32`. |
| `offset` (optional) | `number` | Gap between the thumb and the container edge in px. Default `2`. |
| `radius` (optional) | `number` | Thumb corner radius in px. Default `999`. |
| `thickness` (optional) | `number` | Resting thumb thickness (width for vertical, height for horizontal). Default `8`. |
| `thumbColor` (optional) | `string` | Custom thumb color (any CSS color string). When set, overrides
 the theme-derived color. Default `undefined` (theme-derived). |
| `thumbHoverColor` (optional) | `string` | Custom thumb color while hovered. When set, overrides the
 theme-derived hover color. Default `undefined` (uses `thumbColor`
 or theme-derived). |
| `thumbOpacity` (optional) | `number` | Thumb opacity while visible. Default `0.7`. |
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


### `ThemeScrollbarBehavior`

**Extends** `Pick<OverlayScrollbarOptions, "autoHide" | "hoverExpand" | "draggable" | "clickToJump" | "smooth" | "overscroll" | "axes" | "touch" | "dir">`
Behavior — how the overlay scrolls and hides.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `autoHide` (optional) | `boolean` | Fade the thumb/track out while idle. Default `true` (macOS-style). |
| `autoHideDelay` (optional) | `number` | Idle (ms) before a revealed strip fades out. Default `900`. |
| `axes` (optional) | `ScrollbarAxis[]` | Which axes to render. Defaults to both. |
| `clickToJump` (optional) | `boolean` | Clicking the empty track scrolls smoothly to that position. Default `true`. |
| `dir` (optional) | `"ltr" | "rtl" | "auto"` | Text direction. Defaults to the resolved `dir` / CSS `direction`. |
| `draggable` (optional) | `boolean` | Allow dragging the thumb to scroll. Default `true`. |
| `hoverExpand` (optional) | `boolean` | Grow the strip on hover / drag. Default `false` (thickness stays
 constant so the scrollbar never shifts while scrolling). |
| `overscroll` (optional) | `boolean` | Subtly compress the thumb at the scroll boundaries (rubber-band feel). Default `true`. |
| `smooth` (optional) | `boolean` | Use rAF-lerped (eased) thumb motion instead of a hard snap. Default `true`. |
| `touch` (optional) | `boolean` | Native (touch) devices: keep native scrollbars by default. Pass `true` to
 force the overlay on coarse-pointer devices. Default `false`. |

---


### `ThemeScrollbarIcons`
Arrow button icons (any `ReactNode` — JSX, inline SVG, text, …).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `arrow` (optional) | `ReactNode` | — |
| `down` (optional) | `ReactNode` | — |
| `left` (optional) | `ReactNode` | — |
| `right` (optional) | `ReactNode` | — |
| `up` (optional) | `ReactNode` | — |

---


### `ThemeScrollbarProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` (optional) | `string` | — |
| `animationDuration` (optional) | `number` | — |
| `appearance` (optional) | `ThemeScrollbarAppearance` | Grouped appearance options. Flat props override these. |
| `arrowDownIcon` (optional) | `ReactNode` | JSX / element for the "scroll down" button. Falls back to `arrowIcon`. |
| `arrowIcon` (optional) | `ReactNode` | JSX / element rendered inside every arrow button (overrides the built-in
 CSS triangle). Accepts any `ReactNode`. |
| `arrowLeftIcon` (optional) | `ReactNode` | JSX / element for the "scroll left" button. Falls back to `arrowIcon`. |
| `arrowRightIcon` (optional) | `ReactNode` | JSX / element for the "scroll right" button. Falls back to `arrowIcon`. |
| `arrows` (optional) | `boolean` | — |
| `arrowUpIcon` (optional) | `ReactNode` | JSX / element for the "scroll up" button. Falls back to `arrowIcon`. |
| `autoHide` (optional) | `boolean` | Flat aliases mirroring `OverlayScrollbarOptions` (for convenience /
 backwards compatibility). Each is overridden by the matching flat prop. |
| `autoHideDelay` (optional) | `number` | Idle (ms) before a revealed strip fades out after its last activity.
 Each host has its own timer, so only the strip you're scrolling/hovering
 is revealed, then it fades after idle; other scrollbars stay hidden.
 Default `900`. Only takes effect when `autoHide` is `true`. |
| `axes` (optional) | `ScrollbarAxis[]` | — |
| `behavior` (optional) | `ThemeScrollbarBehavior` | Grouped behavior options. Flat props (e.g. `autoHide`) override these. |
| `children` (optional) | `ReactNode` | — |
| `clickToJump` (optional) | `boolean` | — |
| `dir` (optional) | `"ltr" | "rtl" | "auto"` | — |
| `draggable` (optional) | `boolean` | — |
| `duration` (optional) | `number` | — |
| `exclude` (optional) | `string[] | null` | — |
| `hoverExpand` (optional) | `boolean` | — |
| `hoverThickness` (optional) | `number` | — |
| `icons` (optional) | `ThemeScrollbarIcons` | Grouped arrow button icons. Flat `arrow*Icon` props override these. |
| `include` (optional) | `string[] | null` | — |
| `minThumbSize` (optional) | `number` | — |
| `offset` (optional) | `number` | — |
| `overscroll` (optional) | `boolean` | — |
| `radius` (optional) | `number` | — |
| `smooth` (optional) | `boolean` | — |
| `thickness` (optional) | `number` | — |
| `thumbColor` (optional) | `string` | — |
| `thumbHoverColor` (optional) | `string` | — |
| `thumbOpacity` (optional) | `number` | — |
| `touch` (optional) | `boolean` | — |
| `trackColor` (optional) | `string` | — |
| `trackOpacity` (optional) | `number` | — |
| `zIndex` (optional) | `number` | — |

---
