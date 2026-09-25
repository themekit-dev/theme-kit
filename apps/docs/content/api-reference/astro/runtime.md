## @theme-kit/astro/runtime
Browser entry for the Theme Kit Astro integration
(`@theme-kit/astro/runtime`).

This is the **framework-neutral client API**, and it is the entry a `<script>`
in a `.astro` file should import. It ships the global runtime controller —
`getThemeController()` / `createThemeController()` — plus the low-level
shared-runtime accessors, and it imports no client framework.

> Generated from `packages/astro/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createThemeController<T extends ThemeDefinition<string>>(options): ThemeController<T>`
Creates a controller over a **new** runtime and installs it as the app-wide
runtime.

**See also:** `getThemeController`, `ThemeController`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeControllerOptions<T>` | Overrides for the transported application configuration (see ThemeControllerOptions). |

**Returns** `ThemeController<T>` — A new controller owning a new runtime.

Prefer getThemeController in application code: this function replaces
any runtime already installed, so two calls give two runtimes racing to write
`<html>`.

```ts
import { createThemeController } from "@theme-kit/astro";

const theme = createThemeController({ themes: myTestThemes });
theme.setMode("dark");
```

---


### `getGlobalRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T> | null`
Returns the app-wide global runtime, or `null` when none has been installed
yet (e.g. before `ThemeProviderClient` mounts).

**See also:** `setGlobalRuntime`

**Returns** `ThemeRuntime<T> | null` — The installed runtime, or `null`.

---


### `getThemeController<T extends ThemeDefinition<string>>(options): ThemeController<T>`
The app-wide ThemeController, created on first call.

**See also:** `ThemeController`, `createThemeController`, `getGlobalRuntime`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `options` | `ThemeControllerOptions<T>` | Overrides, honoured only on the call that creates the controller (see ThemeControllerOptions). |

**Returns** `ThemeController<T>` — The shared controller.

**One runtime per document.** The provider, `<ThemeToggle />`, a hand-written
`<script>` and a React island all end up here, and the first caller wins:
every later call returns the same controller rather than building a second
runtime that would fight the first over `<html>`. That is what lets a page go
from `<Provider>` to `<ThemeToggle />` with no per-page `initialMode` /
`initialFamily` and no React island.

If a runtime is already installed — a React island created one — this adopts
it instead of replacing it, so the two surfaces share one runtime and one
state.

Browser-only. It reads the transported configuration, the persisted selection
and `prefers-color-scheme`, none of which exist on a server — call it from a
`<script>`, never from Astro frontmatter.

```ts
<button id="theme-toggle">Toggle theme</button>

<script>
  import { getThemeController } from "@theme-kit/astro";

  const theme = getThemeController();

  document
    .querySelector("#theme-toggle")
    ?.addEventListener("click", () => theme.toggleTheme());
</script>
```

---


### `requireGlobalRuntime<T extends ThemeDefinition<string>>(): ThemeRuntime<T>`
Returns the app-wide global runtime, throwing when none has been installed.

**See also:** `getGlobalRuntime`, `setGlobalRuntime`

**Returns** `ThemeRuntime<T>` — The installed runtime.

---


### `setGlobalRuntime(runtime): void`
Installs the given runtime as the app-wide global runtime and, in the
browser, publishes it where the rest of Theme Kit looks for it.

**See also:** `getGlobalRuntime`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<ThemeDefinition<string>>` | The theme runtime to install globally. |

**Returns** `void`

Three publications, all of them the same runtime:

1. the module-level `globalRuntime` — what this package's hooks read;
2. `window.__themeKitRuntime` — the documented escape hatch;
3. `document.documentElement.__themeKitRuntime` plus a `theme-ready` event —
   which is how `@theme-kit/web`'s custom elements (`<theme-kit-scrollbar>`,
   `<theme-kit-inspector>`, `<theme-kit-toggle>`, …) find a runtime. They
   resolve it by walking **DOM ancestors** for that property, and they only
   fall back to waiting for `theme-ready`, which until now was dispatched
   solely by `<theme-kit-provider>`. Without these two lines an Astro app
   that installs its runtime from a React island had no way to use the
   framework-neutral elements at all — the runtime existed, but nothing in
   the element tree could see it.

---

## Interfaces

### `ThemeController<T extends ThemeDefinition>`
A framework-neutral controller over the app-wide Theme Kit runtime.

**See also:** `getThemeController`, `createThemeController`

| Member | Type | Description |
| ------ | ---- | ----------- |
| readonly `runtime` | `ThemeRuntime<T>` | The underlying runtime, for anything the controller does not wrap. |
| `destroy` | `void` | — |
| `getFamily` | `string` | — |
| `getMode` | `ThemeMode` | — |
| `getResolvedMode` | `"light" \| "dark"` | — |
| `getTheme` | `T` | — |
| `setFamily` | `void` | — |
| `setMode` | `void` | — |
| `subscribe` | `__type(): void` | — |
| `toggleTheme` | `void` | — |

This is **not** a React hook, and not a hook of any kind: it is a plain
object with getters and setters, valid in any browser context — an Astro
`<script>`, a custom element, an event handler, a devtools console. Nothing
here re-renders; ThemeController.subscribe is how a caller observes
change.

It exists so Astro does not have to borrow React's shape. A `.astro` file has
no reactive component runtime, so `useTheme()` — a React hook, valid only
inside a React island — is the wrong abstraction there. The Astro-idiomatic
spelling is:

```ts
const theme = getThemeController();
theme.toggleTheme();
```

The React hook keeps its own shape, for React islands:

```tsx
const { theme, mode, toggleTheme } = useTheme();
```

---


### `ThemeControllerState<T extends ThemeDefinition>`
The reactive state a ThemeController publishes to its subscribers.

**See also:** `ThemeController.subscribe`

| Member | Type | Description |
| ------ | ---- | ----------- |
| `family` | `string` | The visitor's family selection. |
| `mode` | `ThemeMode` | The visitor's mode selection — `"light"`, `"dark"` or `"system"`. |
| `resolvedMode` | `"light" \| "dark"` | The mode actually applied — `"light"` or `"dark"`, never `"system"`. |
| `theme` | `T` | The resolved theme definition. |

---

## Type Aliases

### `ThemeControllerOptions<T extends ThemeDefinition>`
Options for createThemeController / getThemeController.

**See also:** `getThemeController`

`Partial<Omit<ThemeRuntimeOptions<T>, "persistence" | "readPersistenceOnInit">> & { readouts?: boolean }`

Every field is optional, and every field is an *override*. The application
configuration is already in the browser — `themeKit()` transports
`theme.config.ts` as `window.__THEME_KIT_CONFIG__` from `<head>` — so the
runtime is built from that. Passing `themes` / `defaultTheme` /
`initialMode` / `initialFamily` here is for a test, a storybook, or an
island that deliberately wants a different registry.

---

## Variables

### `THEME_READOUT_ATTRIBUTE`
Opts an element into the **bootstrap readout** contract: its text is owned by
Theme Kit.

**See also:** `THEME_TOGGLE_ATTRIBUTE`

`"data-tk-readout"`

---


### `THEME_TOGGLE_ATTRIBUTE`
Marks an element as a Theme Kit theme toggle.

**See also:** `THEME_READOUT_ATTRIBUTE`

`"data-tk-toggle"`

---

## Related docs

- [Astro](/framework-guides/astro) — the framework integration
