## @theme-kit/remix

> Generated from `packages/remix/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `AntdThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<AntdThemeProvider runtime={runtime}>` — wraps Ant Design's own
`ConfigProvider` with a theme derived from Theme Kit's semantic tokens.

**Returns** `Element`

---


### `ChakraThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<ChakraThemeProvider runtime={runtime}>` — wraps Chakra's own `ChakraProvider`
with a system derived from Theme Kit's semantic tokens.

**Returns** `Element`

---


### `createRemixThemePersistence(themes?, defaultTheme?, options): ThemeSelectionPersistenceAdapter | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` (optional) | — |
| `defaultTheme` | `string` (optional) | — |
| `options` | `RemixThemePersistenceOptions` | — |

**Returns** `ThemeSelectionPersistenceAdapter | null`

---


### `MantineThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<MantineThemeProvider runtime={runtime}>` — wraps Mantine's own
`MantineProvider` with a theme derived from Theme Kit's semantic tokens.
The Mantine color scheme is forced to match the active Theme Kit mode so
Mantine's built-in dark styles stay in sync.

**Returns** `Element`

---


### `MuiThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<MuiThemeProvider runtime={runtime}>` — wraps MUI's own `ThemeProvider` with
a theme derived from Theme Kit's semantic tokens.

**Returns** `Element`

---


### `ThemeHead<T extends ThemeDefinition<string>>(__namedParameters): Element`
**Returns** `Element`

---


### `ThemeInspector(__namedParameters?): Element`
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


### `useAntdTheme<T extends ThemeDefinition<string>>(runtime): ThemeConfig`
Subscribes to a Theme Kit runtime and returns an Ant Design theme config that
is rebuilt automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `ThemeConfig`

---


### `useBootstrapTheme(options?): void`
React hook that installs the Bootstrap adapter onto the active Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--bs-*` variables (including `-rgb` triplets) and keeps them in
sync as the theme changes.

Call once in your app root:

```tsx
import { useBootstrapTheme } from "@theme-kit/bootstrap";

function App() {
  useBootstrapTheme();
  return <YourApp />;
}
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | — |

**Returns** `void`

---


### `useChakraTheme<T extends ThemeDefinition<string>>(runtime): SystemContext`
Subscribes to a Theme Kit runtime and returns a Chakra UI system that is
rebuilt automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `SystemContext`

---


### `useDaisyTheme(options?): void`
React hook that installs the daisyUI adapter onto the active Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--color-*` variables in sync as the theme changes.

Call once in your app root:

```tsx
import { useDaisyTheme } from "@theme-kit/daisyui";

function App() {
  useDaisyTheme();
  return <YourApp />;
}
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | — |

**Returns** `void`

---


### `useMantineTheme<T extends ThemeDefinition<string>>(runtime): { activeClassName?: string; autoContrast?: boolean; black?: string; breakpoints?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; colors?: { blue?: MantineColorsTuple; cyan?: MantineColorsTuple; dark?: MantineColorsTuple; grape?: MantineColorsTuple; gray?: MantineColorsTuple; green?: MantineColorsTuple; indigo?: MantineColorsTuple; lime?: MantineColorsTuple; orange?: MantineColorsTuple; pink?: MantineColorsTuple; red?: MantineColorsTuple; teal?: MantineColorsTuple; violet?: MantineColorsTuple; yellow?: MantineColorsTuple } { [x: string & object]: MantineColorsTuple | undefined }; components?: { [x: string]: { classNames?: any; defaultProps?: any; styles?: any; vars?: any } | undefined }; cursorType?: "default" | "pointer"; defaultGradient?: { deg?: number; from?: string; to?: string }; defaultRadius?: MantineRadius; focusClassName?: string; focusRing?: "auto" | "always" | "never"; fontFamily?: string; fontFamilyMonospace?: string; fontSizes?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; fontSmoothing?: boolean; headings?: { fontFamily?: string; fontWeight?: string; sizes?: { h1?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h2?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h3?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h4?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h5?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h6?: { fontSize?: string; fontWeight?: string; lineHeight?: string } }; textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | "stable" }; lineHeights?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; luminanceThreshold?: number; other?: { [x: string]: any }; primaryColor?: string; primaryShade?: MantineColorShade | { dark?: MantineColorShade | undefined; light?: MantineColorShade | undefined }; radius?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; respectReducedMotion?: boolean; scale?: number; shadows?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; spacing?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: number]: string | undefined } { [x: string & object]: string | undefined }; variantColorResolver?: VariantColorsResolver; white?: string }`
Subscribes to a Theme Kit runtime and returns a Mantine theme that is rebuilt
automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `{ activeClassName?: string; autoContrast?: boolean; black?: string; breakpoints?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; colors?: { blue?: MantineColorsTuple; cyan?: MantineColorsTuple; dark?: MantineColorsTuple; grape?: MantineColorsTuple; gray?: MantineColorsTuple; green?: MantineColorsTuple; indigo?: MantineColorsTuple; lime?: MantineColorsTuple; orange?: MantineColorsTuple; pink?: MantineColorsTuple; red?: MantineColorsTuple; teal?: MantineColorsTuple; violet?: MantineColorsTuple; yellow?: MantineColorsTuple } { [x: string & object]: MantineColorsTuple | undefined }; components?: { [x: string]: { classNames?: any; defaultProps?: any; styles?: any; vars?: any } | undefined }; cursorType?: "default" | "pointer"; defaultGradient?: { deg?: number; from?: string; to?: string }; defaultRadius?: MantineRadius; focusClassName?: string; focusRing?: "auto" | "always" | "never"; fontFamily?: string; fontFamilyMonospace?: string; fontSizes?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; fontSmoothing?: boolean; headings?: { fontFamily?: string; fontWeight?: string; sizes?: { h1?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h2?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h3?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h4?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h5?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h6?: { fontSize?: string; fontWeight?: string; lineHeight?: string } }; textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | "stable" }; lineHeights?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; luminanceThreshold?: number; other?: { [x: string]: any }; primaryColor?: string; primaryShade?: MantineColorShade | { dark?: MantineColorShade | undefined; light?: MantineColorShade | undefined }; radius?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; respectReducedMotion?: boolean; scale?: number; shadows?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: string & object]: string | undefined }; spacing?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [x: number]: string | undefined } { [x: string & object]: string | undefined }; variantColorResolver?: VariantColorsResolver; white?: string }`

---


### `useMuiTheme<T extends ThemeDefinition<string>>(runtime): Theme`
Subscribes to a Theme Kit runtime and returns a Material UI theme that is
rebuilt automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `Theme`

---


### `useOpenPropsTheme(options?): void`
React hook that installs the Open Props adapter onto the active Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--color-*` / `--brand` / `--size-*` / `--shadow-*` variables in
sync as the theme changes.

Call once in your app root:

```tsx
import { useOpenPropsTheme } from "@theme-kit/open-props";

function App() {
  useOpenPropsTheme();
  return <YourApp />;
}
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | — |

**Returns** `void`

---


### `useSetThemeFamily(): __type(nextFamily: string): void`
**Returns** `__type(nextFamily: string): void`

---


### `useSetThemeMode(): __type(nextMode: ThemeMode): void`
**Returns** `__type(nextMode: ThemeMode): void`

---


### `useShadcnTheme(options?): void`
React hook that installs the shadcn adapter onto the active Theme Kit
runtime. The adapter maintains a tagged `:root` style element containing
concrete `--*` variables in sync as the theme changes.

Call once in your app root:

```tsx
import { useShadcnTheme } from "@theme-kit/shadcn";

function App() {
  useShadcnTheme();
  return <YourApp />;
}
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `{ strategy?: AdapterStrategy }` (optional) | — |

**Returns** `void`

---


### `useTheme<T extends ThemeDefinition<string>>(): { family: string; mode: ThemeMode; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: T; toggleTheme: __type(): void }`
**Returns** `{ family: string; mode: ThemeMode; setFamily: __type(nextFamily: string): void; setMode: __type(nextMode: ThemeMode): void; theme: T; toggleTheme: __type(): void }`

---


### `useThemeBatch(): __type(callback: __type(): void): void`
**Returns** `__type(callback: __type(): void): void`

---


### `useThemeFamily(): string`
**Returns** `string`

---


### `useThemeHistory(): { canRedo: boolean; canUndo: boolean; clear: __type(): void; redo: __type(): void; undo: __type(): void }`
**Returns** `{ canRedo: boolean; canUndo: boolean; clear: __type(): void; redo: __type(): void; undo: __type(): void }`

---


### `useThemeLifecycle(): { on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`
**Returns** `{ on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`

---


### `useThemeMode(): ThemeMode`
**Returns** `ThemeMode`

---


### `useThemePacks(): __type(pack: ThemePack<any>): void`
**Returns** `__type(pack: ThemePack<any>): void`

---


### `useThemeRestore(): __type(snapshot: ThemeRuntimeSnapshot): void`
**Returns** `__type(snapshot: ThemeRuntimeSnapshot): void`

---


### `useThemeRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
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
**Returns** `__type(): ThemeRuntimeSnapshot`

---


### `useThemeTimeTravel(): { history: HistoryEntry<ThemeDefinition<string>>[]; jump: __type(index: number): void }`
**Returns** `{ history: HistoryEntry<ThemeDefinition<string>>[]; jump: __type(index: number): void }`

---


### `useThemeTokens<T extends ThemeDefinition<string>>(): ThemeTokens | undefined`
**Returns** `ThemeTokens | undefined`

---


### `useThemeValue<T extends ThemeDefinition<string>>(): T`
**Returns** `T`

---


### `useToggleTheme(): __type(): void`
**Returns** `__type(): void`

---

## Interfaces

### `AntdThemeProviderProps<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `runtime` | `ThemeRuntime<T>` | — |

---


### `ChakraThemeProviderProps<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `runtime` | `ThemeRuntime<T>` | — |

---


### `MantineThemeProviderProps<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `runtime` | `ThemeRuntime<T>` | — |

---


### `MuiThemeProviderProps<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `runtime` | `ThemeRuntime<T>` | — |

---


### `RemixThemePersistenceOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `cookieOptions` (optional) | `string` | — |
| `key` (optional) | `string` | — |
| `storage` (optional) | `Storage` | — |

---


### `ThemeHeadProps<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `T["name"]` | — |
| `themes` | `readonly T[]` | — |

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
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `defaultTheme` (optional) | `T["name"]` | — |
| `initial` (optional) | `InitialThemeResolution<T>` | — |
| `themes` (optional) | `readonly T[]` | — |

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
