# DevTools Reference

`@theme-kit/devtools` ships an inspector, a plugin, and a ready-made panel for
debugging every theme change. It records lifecycle events, performance timings,
state snapshots and the flattened CSS-variable output of the active theme.

## Quick start

Attach the plugin to your runtime and a panel to your page:

```ts
import { createThemeRuntime } from "@theme-kit/core";
import { createDevToolsPlugin, createDevToolsPanel } from "@theme-kit/devtools";

const runtime = createThemeRuntime({
  themes,
  plugins: [createDevToolsPlugin()],
});

// Optional: mount the UI panel anywhere
const panel = createDevToolsPanel(
  runtime.plugins.get("devtools-inspector") as any,
);
document.body.appendChild(panel);
```

## createDevToolsPlugin(options)

A Theme Kit plugin that instantiates an inspector, binds it to the runtime and
exposes it on `window.__THEME_KIT_DEVTOOLS__` so extensions can find it.

```ts
const plugin = createDevToolsPlugin({ maxEntries: 200, maxPerfEntries: 100 });

const runtime = createThemeRuntime({ themes, plugins: [plugin] });

plugin.getInspector().getState();
// {
//   currentTheme: ThemeDefinition,
//   selection: { mode, family },
//   history: [{ index, point: { theme, selection } }],
//   entries: [{ type, timestamp, label, data }],
//   performance: [{ duration, type, timestamp }],
//   cssVariables: { "--theme-color-primary": "#6366f1", ... },
// }
```

Internally it subscribes to `beforeThemeChange` / `afterThemeChange` to record
perf entries and emits a `theme-change` event entry on every switch.

## createDevToolsInspector(options)

The standalone recorder — use it directly if you are not going through the
plugin. Records theme-change entries, lifecycle performance events and state
snapshots, capped at `maxEntries` (default 200) and `maxPerfEntries` (default
100).

```ts
const inspector = createDevToolsInspector();

// Read what has happened
inspector.getEntries();
// [{ type: "theme-change", timestamp: 1712345678901, label: "Theme changed", data: {} }]

inspector.getPerformance();
// [{ duration: 0, type: "afterThemeChange", timestamp: 1712345678901 }]

// Jump through history
inspector.jump(0); // restores snapshot at index 0

// Inspect live state
inspector.getState();
inspector.getCSSVariables();

// Export
inspector.exportState(); // JSON string of the full state
inspector.exportCSS();   // { "--theme-color-primary": "#6366f1", ... }

inspector.clearEntries();
inspector.clearPerformance();
inspector.destroy();
```

## createDevToolsPanel(inspector)

Renders a floating, framework-free panel (plain DOM, no dependencies) with five
tabs:

- **Inspector** — the current theme and selection as pretty-printed JSON
- **Events** — chronological lifecycle event entries
- **Perf** — `beforeThemeChange` / `afterThemeChange` timings as bars
- **CSS Vars** — the flattened `--theme-*` variables of the active theme with
  color swatches
- **History** — every snapshot with a one-click "Jump" to restore it

Footer buttons clear events/perf and export the state to JSON or the CSS
variables to a `.css` file.

```ts
const panel = createDevToolsPanel(inspector);
document.body.appendChild(panel);
```

## Global hook

Every inspector registered via the plugin is added to a Set on
`window.__THEME_KIT_DEVTOOLS__`, so a browser extension or your own code can
enumerate and inspect all live runtimes:

```ts
declare global {
  interface Window {
    __THEME_KIT_DEVTOOLS__?: Set<{
      getState(): unknown;
      getEntries(): unknown[];
      getPerformance(): unknown[];
    }>;
  }
}

for (const inspector of window.__THEME_KIT_DEVTOOLS__ ?? []) {
  console.log(inspector.getState());
}
```

## Entry types

Every recorded entry has a `type`:

| Type            | Meaning                                            |
| --------------- | -------------------------------------------------- |
| `theme-change`  | The active theme changed                            |
| `mode-change`   | The mode changed (light / dark / system)            |
| `family-change` | The family changed (e.g. `plum` → `mint`)           |
| `persist`       | Selection was persisted to storage                  |
| `restore`       | A snapshot was restored (undo / redo / jump)        |
| `batch`         | An atomic batched update ran                        |
