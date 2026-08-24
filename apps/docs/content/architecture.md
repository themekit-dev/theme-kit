## One Runtime

The heart of the library is a single framework-agnostic runtime that wires the store, registry, selection, persistence, broadcast, DOM bindings, history, lifecycle, and plugins together.

```ts
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,            // default: built-in themes
  defaultTheme,      // fallback theme name
  initialMode,       // "light" | "dark" | "system"
  initialFamily,     // e.g. "plum"
  persistence,       // localStorage adapter by default
  broadcast,         // BroadcastChannel adapter by default
  dom,               // DOM attribute binding options (false to disable)
  cssVariables,      // CSS variable binding options (false to disable)
  transition,        // smooth transitions
  scheduled,         // sunset/sunrise auto switching
  plugins,           // lifecycle + token transform plugins
});
```

Once created, the runtime immediately:

1. Resolves the initial theme from `defaultTheme` / `initialMode` / `initialFamily` (or persisted selection).
2. Registers every theme in the registry.
3. Wires the store, selection controller, persistence, and broadcast.
4. Applies DOM attributes and CSS variables via the bindings.

## Runtime API

Every feature hangs off the `runtime` object. Each entry below shows the property and a minimal usage snippet.

### `runtime.store`

The reactive store holding the **active theme**. `get()` reads it, `set()` replaces it, `subscribe()` reacts to changes, and `batch()` coalesces multiple writes into a single notification.

```ts
const theme = runtime.store.get();              // current theme
const unsubscribe = runtime.store.subscribe((t) => {
  console.log("theme changed:", t.name);
});

runtime.store.set(myTheme);                     // apply immediately
runtime.store.batch(() => {                      // coalesce several writes
  runtime.store.set(a);
  runtime.store.set(b);
});
unsubscribe();
```

### `runtime.registry`

Every registered theme, powering dynamic theming. Register, unregister, replace, look up, and group themes by family.

```ts
runtime.registry.register(myTheme);              // add a theme
runtime.registry.registerMany([a, b, c]);        // add several
runtime.registry.unregister("plum-dark");        // remove by name
runtime.registry.replace("plum-dark", newDark);  // swap in place
runtime.registry.get("plum-light");              // find by name
runtime.registry.has("plum-light");              // boolean
runtime.registry.list();                         // all themes
runtime.registry.getFamilies();                  // ["default", "plum", ...]
runtime.registry.getThemesByFamily("plum");      // plums only
```

### `runtime.selection`

Mode + family resolution. Handles persistence and broadcast for you, and keeps the store in sync.

```ts
runtime.selection.setMode("dark");               // "light" | "dark" | "system"
runtime.selection.setFamily("mint");             // switch palette
runtime.selection.toggleTheme();                 // flip light <-> dark
runtime.selection.getSelection();
// { mode: "dark", family: "mint" }
```

### `runtime.themes`

A read-only list of all registered themes — handy for rendering pickers, galleries, or walking families.

```ts
for (const theme of runtime.themes) {
  console.log(theme.name, theme.meta?.family, theme.meta?.mode);
}

const plums = runtime.themes.filter(
  (t) => t.meta?.family === "plum",
);
```

### `runtime.update(tokens)`

**Live theme editing**: merge partial tokens into the active theme and re-apply. The perfect primitive for theme studios and design-time tweaking.

```ts
runtime.update({
  colors: {
    primary: "#6366f1",
    accent: { hover: "#4f46e5" },
  },
  radius: { lg: "16px" },
});
```

### `runtime.use(pack)`

Install a **theme pack** at runtime. A pack is a named bundle of themes; every theme in it is stamped with a `pack:<name>` tag.

```ts
runtime.use({
  name: "brand",
  themes: [
    { name: "apple-light", meta: { family: "apple", mode: "light" }, tokens },
    { name: "apple-dark", meta: { family: "apple", mode: "dark" }, tokens },
  ],
});
```

### `runtime.batch(cb)`

Run a callback atomically — intermediate state changes are suppressed until the callback finishes.

```ts
runtime.batch(() => {
  runtime.update({ colors: { primary: "#000" } });
  runtime.selection.setMode("dark");
  runtime.selection.setFamily("plum");
});
// subscribers fire exactly once, with the final theme
```

### `runtime.snapshot()` / `runtime.restore(snapshot)`

Serialize the full runtime state — theme, selection, history, and registry — and restore it later. Ideal for time travel and demo replay.

```ts
const snapshot = runtime.snapshot();
// { theme, selection, history: [], registry: { themes } }

// ... make changes ...

runtime.restore(snapshot);   // back to exactly how it was
```

### `runtime.history`

Built-in undo/redo, capped at 50 steps by default. Records full theme snapshots with timestamps.

```ts
runtime.history.undo();               // step back
runtime.history.redo();               // step forward
runtime.history.jump(2);              // jump to any point in time
runtime.history.canUndo();            // boolean
runtime.history.canRedo();            // boolean
runtime.history.getHistory();         // HistoryEntry[] { theme, timestamp }
runtime.history.clear();              // wipe the timeline
```

### `runtime.lifecycle`

A typed event bus for the theme pipeline. Subscribe with `on()` (returns an unsubscribe function) and react to typed payloads.

```ts
const off = runtime.lifecycle.on("beforeThemeChange", ({ current, next }) => {
  console.log(`leaving ${current.name}, entering ${next.name}`);
});

runtime.lifecycle.on("afterApply", ({ theme }) => {
  document.title = `Theme — ${theme.name}`;
});

off(); // unsubscribe
```

### `runtime.destroy()`

Full teardown: unsubscribes every listener, removes DOM/CSS bindings, closes the broadcast channel, and clears registry, history, and lifecycle.

```ts
runtime.destroy();
```

## Layers

- **Store** — minimal reactive state holding the active theme. `get`, `set`, `subscribe`, `batch`.
- **Registry** — every registered theme, powering dynamic theming, theme packs, and family lookups.
- **Selection** — mode + family resolution with persistence & broadcast, driving the store.
- **Adapters** — CSS variables, DOM attributes, system theme, scoped themes, scheduled themes, transitions.
- **Resolvers** — token references, expressions, and derived colors resolved lazily at runtime.
- **Plugins** — hook into the lifecycle and transform tokens; official plugins ship for persistence, history, animations, accessibility, scheduling, debugging, and devtools.
- **Bootstrap** — blocking inline script for zero flash of incorrect theme, plus a `@media (prefers-color-scheme: dark)` fallback.

## How a Theme Change Flows Through the Runtime

```
setFamily("plum")
  → selection.setFamily()
    → persistence.set({ mode, family })     // save
    → broadcast.post({ mode, family })       // sync other tabs
    → resolve theme for family + mode
    → lifecycle.emit("beforeThemeChange")
      → plugins.onBeforeThemeChange
    → store.set(theme)
      → lifecycle.emit("afterThemeChange")
      → DOM binding: data-theme, data-theme-mode, .dark class
      → CSS variables binding: --theme-* variables
      → lifecycle.emit("beforeApply" / "afterApply")
    → history records a snapshot
```

## Bootstrap: Zero Flash of Wrong Theme

Before any JS runs, a blocking inline script reads the persisted selection, resolves the effective mode (`system` → `prefers-color-scheme`), and applies CSS variables + DOM effects.

```ts
import { createThemeBootstrapScript, buildThemeCssMap } from "@theme-kit/core";

const cssMap = buildThemeCssMap(themes);         // name + family:mode → variables
const script = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
  storageKey: "theme-selection",
  prefix: "theme-",
});
// inject `script` into <head> before first paint
```

The `@theme-kit/next` provider does all of this automatically — it reads cookies on the server, renders the resolved theme, and emits the blocking script.
