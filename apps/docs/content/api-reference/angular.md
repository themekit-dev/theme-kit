## @theme-kit/angular

> Generated from `packages/angular/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `buildThemeCSSMap(themes): ThemeCSSMap`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` | — |

**Returns** `ThemeCSSMap`

---


### `createAngularPersistence(): ThemeSelectionPersistenceAdapter`
**Returns** `ThemeSelectionPersistenceAdapter`

---


### `createBlockingScriptContent(themes, savedSelection?): string`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `themes` | `readonly ThemeDefinition<string>[]` | — |
| `savedSelection` | `{ family: string; mode: ThemeMode } | null` (optional) | — |

**Returns** `string`

---


### `injectBootstrapTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Angular injectable that registers the Bootstrap adapter on the active Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--bs-*` variables (including `-rgb` triplets), kept in sync as the active
theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `InjectAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `injectDaisyTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Angular injectable that registers the daisyUI adapter on the active Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--color-*` variables, kept in sync as the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `InjectAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `injectOpenPropsTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Angular injectable that registers the Open Props adapter on the active Theme
Kit runtime. Maintains a tagged `:root` style element with concrete
`--brand`, `--link`, `--size-*` and related variables, kept in sync as the
active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `InjectAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `injectShadcnTheme<T extends ThemeDefinition<string>>(options): ThemeAdapter<T>`
Angular injectable that registers the shadcn/ui adapter on the active Theme
Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
variables, kept in sync as the active theme changes.

Call in your component (or root) constructor or field initializer:

```ts
import { injectShadcnTheme } from "@theme-kit/angular";

export class AppComponent {
  adapter = injectShadcnTheme();
}
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `InjectAdapterOptions` | — |

**Returns** `ThemeAdapter<T>`

---


### `injectTheme<T extends ThemeDefinition<string>>(): Signal<ThemeState<T>>`
**Returns** `Signal<ThemeState<T>>`

---


### `injectThemeBatch(): __type(callback: __type(): void): void`
**Returns** `__type(callback: __type(): void): void`

---


### `injectThemeHistory<T extends ThemeDefinition<string>>(): { clear: __type(): void; history: Signal<ThemeHistoryState>; redo: __type(): void; undo: __type(): void }`
**Returns** `{ clear: __type(): void; history: Signal<ThemeHistoryState>; redo: __type(): void; undo: __type(): void }`

---


### `injectThemeLifecycle(): { on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`
**Returns** `{ on: __type(event: keyof ThemeLifecycleEventMap<ThemeDefinition<string>>, listener: __type(data: unknown): void): __type(): void }`

---


### `injectThemePacks(): __type(pack: ThemePack<any>): void`
**Returns** `__type(pack: ThemePack<any>): void`

---


### `injectThemeRestore(): __type(snapshot: ThemeRuntimeSnapshot): void`
**Returns** `__type(snapshot: ThemeRuntimeSnapshot): void`

---


### `injectThemeRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
**Returns** `ThemeRuntime<T>`

---


### `injectThemeSchedule<T extends ThemeDefinition<string>>(): ThemeScheduleController | null`
Reactive access to the runtime's sunrise/sunset scheduling controller.
Returns `null` when the runtime was provided without the `scheduled` option.

```ts
const schedule = injectThemeSchedule();
schedule?.enable();
schedule?.disable();
schedule?.state().nextTransition;
```

**Returns** `ThemeScheduleController | null`

---


### `injectThemeSnapshot(): __type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>`
**Returns** `__type(): ThemeRuntimeSnapshot<ThemeDefinition<string>>`

---


### `injectThemeTimeTravel<T extends ThemeDefinition<string>>(): { history: Signal<readonly HistoryEntry<T>[]>; jump: __type(index: number): void }`
**Returns** `{ history: Signal<readonly HistoryEntry<T>[]>; jump: __type(index: number): void }`

---


### `provideThemeKit(options): EnvironmentProviders`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeKitProviderOptions` | — |

**Returns** `EnvironmentProviders`

---


### `provideThemeKitRuntime(runtime): EnvironmentProviders`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<ThemeDefinition<string>>` | — |

**Returns** `EnvironmentProviders`

---

## Classes

### `class ThemeInspectorComponent`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeInspectorComponent` | — |
| `bottom` (optional) | `number` | — |
| `class` (optional) | `string` | CSS classes forwarded to the <theme-kit-inspector> element. |
| `right` (optional) | `number` | — |
| `size` (optional) | `number` | — |
| `style` (optional) | `string` | Inline styles forwarded to the <theme-kit-inspector> element. |
| `zIndex` (optional) | `number` | — |
| `ngOnInit` | `void` | — |

---


### `class ThemeScopeDirective`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeScopeDirective` | — |
| `themeName` | `string` | — |
| `transition` (optional) | `ThemeTransitionOptions` | — |
| `ngOnDestroy` | `void` | — |
| `ngOnInit` | `void` | — |

---


### `class ThemeScrollbarDirective`
Phase 2 — ThemeScrollbarDirective: overlay only.

Creates the custom scrollbar overlay. Does NOT hide the native
scrollbar — that's the bootstrap script's job (Phase 1, tk-scrollbar).

```html
<div themeKitScrollbar [themeKitScrollbarOptions]="{ thickness: 8 }"></div>
```

| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeScrollbarDirective` | — |
| `options` | `OverlayScrollbarOptions` | — |
| `ngOnDestroy` | `void` | — |
| `ngOnInit` | `void` | — |

---

## Interfaces

### `InjectAdapterOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `strategy` (optional) | `AdapterStrategy` | — |

---


### `ThemeCSSMap`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `dark` | `Record<string, string>` | — |
| `light` | `Record<string, string>` | — |

---


### `ThemeHistoryState`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `canRedo` | `boolean` | — |
| `canUndo` | `boolean` | — |

---


### `ThemeScheduleController`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `disable` | `__type(): void` | — |
| `enable` | `__type(): void` | — |
| `set` | `__type(options: ThemeScheduleSetOptions): void` | — |
| `state` | `Signal<ThemeScheduleState>` | Reactive `Signal` of the schedule state: `enabled`, `active`, `status`,
 `sunrise`, `sunset`, `nextTransition`, `nextActivation`,
 `nextDeactivation`. |

---


### `ThemeState<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` | `string` | — |
| `mode` | `ThemeMode` | — |
| `resolvedMode` | `"light" | "dark"` | — |
| `setFamily` | `__type(family: string): void` | — |
| `setMode` | `__type(mode: ThemeMode): void` | — |
| `theme` | `T` | — |
| `toggleTheme` | `__type(): void` | — |

---

## Type Aliases

### `ThemeKitProviderOptions`
`ThemeRuntimeOptions<ThemeDefinition> & { target?: HTMLElement }`

---

## Variables

### `THEME_KIT_RUNTIME`
`InjectionToken<ThemeRuntime<ThemeDefinition<string>>>`

---


### `THEME_KIT_SCOPED_RUNTIME`
`InjectionToken<ThemeRuntime<ThemeDefinition<string>>>`

---
