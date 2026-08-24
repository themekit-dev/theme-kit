## @theme-kit/astro

> Generated from `packages/astro/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `buildThemeCssMap(themes): Record<string, Record<string, string>>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` | — |

**Returns** `Record<string, Record<string, string>>`

---


### `computeFingerprint(themes, defaultTheme?): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` | — |
| `defaultTheme` | `string` (optional) | — |

**Returns** `string`

---


### `createAstroThemePersistence(themes?, defaultTheme?): ThemeSelectionPersistenceAdapter | null`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` (optional) | — |
| `defaultTheme` | `string` (optional) | — |

**Returns** `ThemeSelectionPersistenceAdapter | null`

---


### `createBlockingScript(fingerprint, themeCssMap): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `fingerprint` | `string` | — |
| `themeCssMap` | `Record<string, Record<string, string>>` | — |

**Returns** `string`

---


### `darkModeCSSTemplate(variables): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `variables` | `Record<string, string>` | — |

**Returns** `string`

---


### `getGlobalRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T> | null`
**Returns** `ThemeRuntime<T> | null`

---


### `setGlobalRuntime(runtime): void`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<ThemeDefinition<string>>` | — |

**Returns** `void`

---


### `ThemeInspector(__namedParameters?): Element`
**Returns** `Element`

---


### `ThemeProviderClient<T extends ThemeDefinition<string>>(__namedParameters): null`
**Returns** `null`

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


### `useSetThemeFamily(): __type(nextFamily: string): void`
**Returns** `__type(nextFamily: string): void`

---


### `useSetThemeMode(): __type(nextMode: ThemeMode): void`
**Returns** `__type(nextMode: ThemeMode): void`

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


### `useThemeHistory(): { canRedo: boolean; canUndo: boolean; clear: __type(): void; history: HistoryEntry<ThemeDefinition<string>>[]; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void }`
**Returns** `{ canRedo: boolean; canUndo: boolean; clear: __type(): void; history: HistoryEntry<ThemeDefinition<string>>[]; jump: __type(index: number): void; redo: __type(): void; undo: __type(): void }`

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
Reactive sunrise/sunset schedule controller. Returns `null` when the
runtime was created without the `scheduled` option.

```tsx
const schedule = useThemeSchedule();
schedule?.enable();
schedule?.disable();
schedule?.set({ timeZone: "Asia/Kathmandu" });
```

**Returns** `ThemeSchedule | null`

---


### `useThemeSnapshot(): __type(): ThemeRuntimeSnapshot`
**Returns** `__type(): ThemeRuntimeSnapshot`

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

### `ThemeInspectorProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `bottom` (optional) | `number` | Vertical distance from the bottom of the viewport, in px. Default 104. |
| `right` (optional) | `number` | Horizontal distance from the right edge of the viewport, in px. Default 32. |
| `size` (optional) | `number` | Toggle button size (width and height), in px. Default 40. |
| `zIndex` (optional) | `number` | Z-index for the floating toggle and panel. Default 9999. |

---


### `ThemeProviderClientProps<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `string` | — |
| `initial` | `InitialThemeResolution<T>` | — |
| `themes` (optional) | `readonly T[]` | — |

---


### `ThemeScopeProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `className` (optional) | `string` | — |
| `theme` | `string` | — |
| `transition` (optional) | `ThemeTransitionOptions` | Transition applied when the scope's theme changes. Defaults to the owning
 runtime's transition (the provider's), or pass your own to override. |

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
