## @theme-kit/devtools

> Generated from `packages/devtools/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createDevToolsInspector<T extends ThemeDefinition<string>>(options?): DevToolsInspector<T>`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DevToolsInspectorOptions` (optional) | — |

**Returns** `DevToolsInspector<T>`

---


### `createDevToolsPanel(inspector): HTMLElement`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `inspector` | `{ clearEntries: void; clearPerformance: void; destroy: void; exportCSS: void; exportState: void; getEntries: void; getPerformance: void; getState: void; jump: void }` | — |

**Returns** `HTMLElement`

---


### `createDevToolsPlugin<T extends ThemeDefinition<string>>(options?): { name: string; priority: number; version: string; getInspector: void; onDestroy: void; onRuntimeCreated: void }`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DevToolsInspectorOptions` (optional) | — |

**Returns** `{ name: string; priority: number; version: string; getInspector: void; onDestroy: void; onRuntimeCreated: void }`

---

## Interfaces

### `DevToolsEntry`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `data` | `Record<string, unknown>` | — |
| `label` | `string` | — |
| `timestamp` | `number` | — |
| `type` | `"theme-change" | "mode-change" | "family-change" | "persist" | "restore" | "batch"` | — |

---


### `DevToolsInspector<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `_addEntry` | `__type(type: "theme-change" | "mode-change" | "family-change" | "persist" | "restore" | "batch", label: string, data: Record<string, unknown>): void` | — |
| `_addPerfEntry` | `__type(type: string, duration: number): void` | — |
| `_bindRuntime` | `__type(runtime: any): void` | — |
| `_bindThemeToCSS` | `__type(fn: __type(theme: T): Record<string, string>): void` | — |
| `clearEntries` | `void` | — |
| `clearPerformance` | `void` | — |
| `destroy` | `void` | — |
| `exportCSS` | `Record<string, string>` | — |
| `exportState` | `string` | — |
| `getCSSVariables` | `Record<string, string>` | — |
| `getEntries` | `DevToolsEntry[]` | — |
| `getPerformance` | `DevToolsPerformanceEntry[]` | — |
| `getState` | `DevToolsState<T>` | — |
| `jump` | `void` | — |

---


### `DevToolsInspectorOptions`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `maxEntries` (optional) | `number` | — |
| `maxPerfEntries` (optional) | `number` | — |

---


### `DevToolsPerformanceEntry`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `duration` | `number` | — |
| `timestamp` | `number` | — |
| `type` | `string` | — |

---


### `DevToolsState<T extends ThemeDefinition>`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `cssVariables` | `Record<string, string>` | — |
| `currentTheme` | `T` | — |
| `entries` | `DevToolsEntry[]` | — |
| `history` | `{ index: number; point: { selection: ThemeSelectionState; theme: T } }[]` | — |
| `performance` | `DevToolsPerformanceEntry[]` | — |
| `selection` | `ThemeSelectionState` | — |

---
