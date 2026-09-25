## @theme-kit/devtools
Theme Kit devtools.

Provides the runtime plugin (`createDevToolsPlugin`) that records
theme-change entries and performance measurements per runtime, the
standalone `createDevToolsInspector`, and the `createDevToolsPanel`
UI factory for custom devtools integrations.

> Generated from `packages/devtools/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createDevToolsInspector<T extends ThemeDefinition<string>>(options?): DevToolsInspector<T>`
Creates a devtools inspector that records theme events and performance
measurements for a runtime.

The inspector retains a bounded number of event and performance entries
(see DevToolsInspectorOptions), exposes the current state, and
provides export and destroy operations. It is bound to a runtime by the
devtools plugin.

**See also:** `createDevToolsPlugin`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DevToolsInspectorOptions` (optional) | Optional limits for the number of retained entries. |

**Returns** `DevToolsInspector<T>` — A DevToolsInspector.

---


### `createDevToolsPanel(inspector): HTMLElement`
Creates a devtools panel DOM element bound to an inspector.

Renders a tabbed panel (Inspector, Events, Perf, CSS Vars, History) that
reads from the inspector and wires up the clear and export buttons. The
returned element is a live DOM node; attach it to the document to display
the panel.

**See also:** `createDevToolsInspector`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `inspector` | `{ clearEntries: void; clearPerformance: void; destroy: void; exportCSS: void; exportState: void; getEntries: void; getPerformance: void; getState: void; jump: void }` | The inspector to render and control. |

**Returns** `HTMLElement` — An `HTMLElement` containing the devtools panel.

---


### `createDevToolsPlugin<T extends ThemeDefinition<string>>(options?): { name: string; priority: number; version: string; getInspector: void; onDestroy: void; onRuntimeCreated: void }`
Creates a Theme Kit devtools plugin.

The plugin binds an inspector to each runtime it is applied to, records
theme-change events and performance measurements, and registers the
inspector on `window.__THEME_KIT_DEVTOOLS__` in the browser. Use it with the
runtime's plugin system.

**See also:** `createDevToolsInspector`, `createDevToolsPanel`, `DevToolsInspector`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `DevToolsInspectorOptions` (optional) | Optional limits for the inspector's retained entries. |

**Returns** `{ name: string; priority: number; version: string; getInspector: void; onDestroy: void; onRuntimeCreated: void }` — A plugin object with `onRuntimeCreated`, `getInspector`, and
  `onDestroy` hooks.

```ts
import { createDevToolsPlugin } from "@theme-kit/devtools";
import { createThemeRuntime, getBuiltInThemes } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes: getBuiltInThemes(),
  plugins: [createDevToolsPlugin()],
});
```

---

## Interfaces

### `DevToolsEntry`
A single recorded devtools event entry.

Records a lifecycle or selection event with a timestamp, label, and
arbitrary data payload.

**See also:** `DevToolsInspector`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `data` | `Record<string, unknown>` | Arbitrary data associated with the event. |
| `label` | `string` | A human-readable label describing the event. |
| `timestamp` | `number` | The time the event was recorded, in milliseconds since the epoch. |
| `type` | `"theme-change" \| "mode-change" \| "family-change" \| "persist" \| "restore" \| "batch"` | The kind of event that was recorded. |

---


### `DevToolsInspector<T extends ThemeDefinition>`
The devtools inspector interface.

Records theme events and performance measurements, exposes the current
state, and provides export and destroy operations.

**See also:** `createDevToolsPlugin`

| Member | Type | Description |
| ------ | ---- | ----------- |
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
Options for createDevToolsInspector.

**See also:** `createDevToolsInspector`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `maxEntries` (optional) | `number` | The maximum number of event entries to retain. Defaults to `200`. |
| `maxPerfEntries` (optional) | `number` | The maximum number of performance entries to retain. Defaults to `100`. |

---


### `DevToolsPerformanceEntry`
A single recorded performance measurement.

Captures the duration of a lifecycle phase (for example a theme change).

**See also:** `DevToolsInspector`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `duration` | `number` | The measured duration in milliseconds. |
| `timestamp` | `number` | The time the measurement was recorded, in milliseconds since the epoch. |
| `type` | `string` | The lifecycle phase that was measured. |

---


### `DevToolsState<T extends ThemeDefinition>`
A snapshot of the devtools inspector's full state.

Combines the current theme, selection, history, recorded entries,
performance measurements, and the current CSS variables.

**See also:** `DevToolsInspector`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `cssVariables` | `Record<string, string>` | The current CSS variables for the active theme. |
| `currentTheme` | `T` | The currently active theme definition. |
| `entries` | `DevToolsEntry[]` | The recorded event entries. |
| `history` | `{ index: number; point: { selection: ThemeSelectionState; theme: T } }[]` | The recorded history, each entry with its index and point. |
| `performance` | `DevToolsPerformanceEntry[]` | The recorded performance measurements. |
| `selection` | `ThemeSelectionState` | The current theme selection (mode and theme family). |

---

## Related docs

- [DevTools](/devtools) — Inspect and drive the live runtime from a panel: adapters, history, snapshots and performance entries.
