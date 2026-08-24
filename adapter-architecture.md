# Theme Kit — Adapter Architecture

> This document is the reference for the Theme Kit adapter system. It is the
> source of truth that powers the **Adapters** section of the official docs
> site (which is itself built with Theme Kit — dogfooding).

## Table of Contents

1. [What is an adapter?](#what-is-an-adapter)
2. [Core concepts](#core-concepts)
3. [The adapter contract](#the-adapter-contract)
4. [The registry](#the-registry)
5. [Adapter strategies](#adapter-strategies)
6. [Adapter plugins](#adapter-plugins)
7. [Two kinds of adapters](#two-kinds-of-adapters)
8. [CSS-variable adapters (Bootstrap, shadcn/ui, daisyUI, Open Props)](#css-variable-adapters)
9. [Generated-theme adapters (MUI, Chakra, Ant Design, Mantine)](#generated-theme-adapters)
10. [Build-time adapters (UnoCSS)](#build-time-adapters-unocss)
11. [Framework integrations](#framework-integrations)
12. [Framework use cases](#framework-use-cases)
13. [Which CSS do you import?](#which-css-do-you-import)
14. [Full API reference](#full-api-reference)
15. [Examples](#examples)
16. [Authoring a custom adapter](#authoring-a-custom-adapter)

---

## What is an adapter?

An **adapter** translates a Theme Kit `ThemeDefinition` into whatever a
specific UI library needs. Theme Kit core knows nothing about Bootstrap,
MUI, daisyUI, shadcn/ui, Chakra, Ant Design, Mantine, or UnoCSS — it only
knows themes, tokens, and runtimes. Adapters are the translation layer.

There are two shapes of output:

- **CSS variables** — the adapter maintains a live `<style>` element (or a
  runtime binding) that exposes `--bs-*`, `--*`, `--daisy`, or `--*` custom
  properties that the target library's own stylesheet consumes.
- **Theme objects** — the adapter builds a native theme object (MUI `Theme`,
  Mantine theme, Chakra theme, AntD theme) that you pass to that library's
  own provider.

Adapters are **framework-agnostic**: the `createXxxAdapter` factories run in
plain TypeScript with zero framework imports. Each framework package then
wraps those factories with its own composable / hook / injectable.

---

## Core concepts

| Concept | Description |
| --- | --- |
| `ThemeDefinition` | A named theme: `name`, `mode`, `tokens`, `meta`, `adapter` info. |
| `ThemeTokens` | The raw token buckets: `colors`, `radius`, `shadows`, `typography`, etc. |
| `ThemeRuntime<T>` | The live runtime. Owns the store and the adapter registry. |
| `ThemeStore<T>` | The observable store holding the current theme. |
| `ThemeAdapter<T>` | The contract every library adapter implements. |
| `AdapterRegistry<T>` | Runtime-owned registry of installed adapters. |
| `AdapterRegistration` | The handle returned by `registry.use()`. Call `dispose()` to uninstall. |
| `AdapterStrategy` | How faithfully an adapter reproduces a library's native feel. |
| `AdapterPlugin` | Extends an adapter with custom `refine` / `transform` hooks. |
| `AdapterSource` | Anything an adapter can read from: runtime, store, theme, or raw tokens. |
| `AdapterResolvedTheme` | Normalized, token-resolved theme returned by `resolveAdapterSource`. |

---

## The adapter contract

Every adapter implements this interface (`@theme-kit/core`):

```ts
interface ThemeAdapter<T extends ThemeDefinition = ThemeDefinition> {
  readonly id: string;
  supports(runtime: ThemeRuntime<T>): boolean;
  install(runtime: ThemeRuntime<T>): void;
  uninstall(): void;
}
```

- `id` — unique string used for registry identity (e.g. `"bootstrap"`, `"mui"`).
- `supports(runtime)` — whether this adapter works with the given runtime.
  The CSS-variable adapters return `true` unconditionally.
- `install(runtime)` — called once by the registry when the adapter is first
  registered. Typically: inject the compatibility stylesheet, write the
  initial variables, and subscribe to the runtime store so variables update
  when the theme changes.
- `uninstall()` — removes the injected styles, unsubscribes, and returns the
  page to its pre-adapter state. Called when the last registration for this
  adapter id is released.

> **Idempotency guarantee.** An adapter instance is installed **exactly once**
> no matter how many times `registry.use()` is called with it, and is
> uninstalled **exactly once** no matter how many handles you dispose or
> whether the runtime is destroyed first. An entry can only transition to
> "removed" once. (See [The registry](#the-registry).)

---

## The registry

The runtime owns a single `AdapterRegistry`. It is the **source of truth**
for installed adapters.

```ts
interface AdapterRegistry<T extends ThemeDefinition = ThemeDefinition> {
  use(adapter: ThemeAdapter<T>): AdapterRegistration;
  unuse(id: string): boolean;        // deprecated — prefer use().dispose()
  list(): readonly ThemeAdapter<T>[];
  destroy(): void;
}
```

Access it via `runtime.adapters`.

### `use(adapter)`

Registers an adapter and installs it. Returns an `AdapterRegistration`:

```ts
interface AdapterRegistration {
  readonly id: string;
  dispose(): void;
}
```

Semantics:

- **Idempotent per instance.** Calling `use()` twice with the *same* adapter
  instance installs it once, with an internal reference count of two. Both
  handles must be disposed before `uninstall()` runs.
- **Replace on identity change.** Calling `use()` with a *different* adapter
  instance that claims the same `id` tears down the old one and installs the
  new one. Old handles become inert no-ops.
- **Deterministic cleanup.** `handle.dispose()` decrements the refcount and
  only uninstalls when it reaches zero. Disposing a stale or already-removed
  handle is a safe no-op.

```ts
const handle = runtime.adapters.use(adapter);

// later…
handle.dispose(); // uninstalls (when this was the last ref)
```

### `unuse(id)` — deprecated

Force-uninstalls all registrations for an id. Retained for migration; new code
should hold the handle from `use()` and call `handle.dispose()`.

### `list()`

Returns the currently-installed adapters.

```ts
const installed = runtime.adapters.list(); // e.g. [{ id: 'bootstrap', … }]
```

### `destroy()`

Uninstalls **all** adapters and clears the registry. Used by runtime teardown.
It is safe to call after individual `dispose()` calls (no double-uninstall),
and safe to call before disposing handles (those disposes become no-ops).

```ts
runtime.destroy();          // tears down every installed adapter
handle.dispose();           // safe no-op afterwards
```

### Ordering safety (the invariant)

Both cleanup paths converge on the same internal lifecycle:

| Scenario | Result |
| --- | --- |
| `handle.dispose()` then `handle.dispose()` | uninstall runs once |
| `handle.dispose()` then `runtime.destroy()` | uninstall runs once |
| `runtime.destroy()` then `handle.dispose()` | safe no-op, uninstall ran once |
| two handles from the same adapter | one install, one uninstall |
| dispose stale handle after replacement | safe no-op |

---

## Adapter strategies

```ts
type AdapterStrategy = "exact" | "native" | "aggressive";
```

Controls how faithfully an adapter reproduces the target library's native feel:

| Strategy | Behavior |
| --- | --- |
| `exact` | Only map what Theme Kit defines. Change nothing else. |
| `native` | Behave like the library: derive missing semantic concepts (e.g. success/warning/info) and make small feel adjustments. **Default.** |
| `aggressive` | Fully emulate the library: also adjust spacing, typography, elevation, saturation, and contrast. |

Pass `strategy` per-adapter:

```ts
createBootstrapAdapter({ strategy: "aggressive" });
useShadcnTheme({ strategy: "exact" });
```

---

## Adapter plugins

Plugins extend any CSS-variable adapter with custom logic:

```ts
interface AdapterPlugin {
  id?: string;
  refine?(
    state: Record<string, unknown>,
    ctx: { strategy: AdapterStrategy; mode: "light" | "dark" | "system" | undefined },
  ): void | Record<string, unknown>;
  transform?(
    variables: Record<string, string>,
    ctx: { strategy: AdapterStrategy; mode: "light" | "dark" | "system" | undefined },
  ): Record<string, string>;
}
```

- `refine` — receive the refined semantic state and return updates to it.
- `transform` — receive the generated library variables and return the final set.

```ts
createShadcnAdapter({
  plugins: [{
    transform(variables, ctx) {
      return { ...variables, "--radius-md": "0.75rem" };
    },
  }],
});
```

---

## Two kinds of adapters

```
Theme Definition
        │
        ├── CSS-variable adapters ──► live <style> element with --*-vars
        │        shadcn / daisyUI / Bootstrap / Open Props
        │
        ├── Generated-theme adapters ──► native theme object → library provider
        │        MUI / Chakra / Ant Design / Mantine
        │
        └── Build-time adapters ──► static theme maps at build time
                 UnoCSS preset
```

---

## CSS-variable adapters

Available for **Bootstrap**, **shadcn/ui**, **daisyUI**, and **Open Props**.

Each package exposes, with the same shape:

| Package | Factory (framework-neutral) | Generator | React hook | CSS injector |
| --- | --- | --- | --- | --- |
| `@theme-kit/bootstrap` | `createBootstrapAdapter` | `createBootstrapVariables` / `generateBootstrapVariables` | `useBootstrapTheme` | `injectBootstrapCSS` |
| `@theme-kit/shadcn` | `createShadcnAdapter` | `createShadcnVariables` / `generateShadcnVariables` | `useShadcnTheme` | `injectShadcnCSS` |
| `@theme-kit/daisyui` | `createDaisyAdapter` | `createDaisyVariables` / `generateDaisyVariables` | `useDaisyTheme` | `injectDaisyCSS` |
| `@theme-kit/open-props` | `createOpenPropsAdapter` | `createOpenPropsVariables` / `generateOpenPropsVariables` | `useOpenPropsTheme` | `injectOpenPropsCSS` |

### Options

```ts
interface XxxAdapterOptions {
  strategy?: AdapterStrategy; // "native" by default
  injectCSS?: boolean;        // true by default — see below
}
```

### How it works

1. `install()` injects the library's **compatibility stylesheet** (a tagged,
   idempotent `<style id="@theme-kit/<name>">` element) so class names like
   `btn`, `card`, `alert` render with Theme Kit variables.
2. It maintains a second tagged `<style>` element containing the concrete
   `--*` custom properties for the current theme.
3. It subscribes to the runtime store; whenever the active theme changes, the
   variables are regenerated and the element is rewritten — no full reload.

Because variables are emitted as `--*` custom properties, the library's CSS
picks them up automatically at runtime.

### The React hook

Each CSS-variable adapter ships a React hook that installs the adapter onto
the active runtime and disposes it on unmount:

```tsx
import { ThemeProvider, createThemeRuntime } from "@theme-kit/react";
import { useShadcnTheme } from "@theme-kit/shadcn";

function App() {
  useShadcnTheme(); // installs + auto-disposes
  return <YourApp />;
}
```

`useShadcnTheme({ strategy })` accepts an optional strategy. The hook:
1. Reads the runtime via `useThemeRuntime()` (React),
2. Creates the adapter (memoized),
3. Injects the compatibility CSS,
4. Registers via `runtime.adapters.use(adapter)` and disposes on cleanup.

> The hook targets the **active runtime**. In React, that is the runtime
> provided by `<ThemeProvider>`; in Vue/Svelte/Solid/Angular, the runtime
> provided by that framework's own provider (see
> [Framework integrations](#framework-integrations)).

### The `factory` subpath (framework-neutral)

Import the factories **without React** by deep-importing the `factory` entry:

```ts
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";
```

This is how the Vue/Svelte/Solid/Angular composables consume the adapters —
no React dependency leaks into those packages.

---

## Generated-theme adapters

For **Material UI**, **Chakra UI**, **Ant Design**, and **Mantine**, Theme Kit
builds a native theme object from your semantic tokens.

| Package | Hook | Provider | Theme builder |
| --- | --- | --- | --- |
| `@theme-kit/mui` | `useMuiTheme(runtime)` | `MuiThemeProvider` | `createMuiTheme` |
| `@theme-kit/chakra` | `useChakraTheme(runtime)` | `ChakraThemeProvider` | `createChakraTheme` |
| `@theme-kit/antd` | `useAntdTheme(runtime)` | `AntdThemeProvider` | `createAntdTheme` |
| `@theme-kit/mantine` | `useMantineTheme(runtime)` | `MantineThemeProvider` | `createMantineTheme` |

These are React packages. The pattern:

```tsx
import { MuiThemeProvider } from "@theme-kit/mui";
import { ThemeProvider } from "@theme-kit/react";
import { createThemeRuntime } from "@theme-kit/core";

function App() {
  const runtime = useMemo(() => createThemeRuntime({ ... }), []);
  return (
    <ThemeProvider runtime={runtime}>
      <MuiThemeProvider runtime={runtime}>
        <YourMuiApp />
      </MuiThemeProvider>
    </ThemeProvider>
  );
}
```

`MuiThemeProvider` wraps MUI's own `ThemeProvider` with a theme derived from
Theme Kit tokens and rebuilt automatically on theme change. Mantine's provider
also forces its color scheme to match the active Theme Kit mode, keeping Mantine's
built-in dark styles in sync.

The providers use the shared `useRuntimeThemeFactory` helper under the hood —
a React hook that re-runs a factory whenever the active theme changes:

```ts
useRuntimeThemeFactory<T, R>(runtime, (theme) => …derived value…);
```

---

## Build-time adapters (UnoCSS)

`@theme-kit/unocss` ships a UnoCSS preset that exposes Theme Kit
semantic tokens as utilities — `bg-primary`, `text-foreground`,
`border-border`, `rounded-lg`, `shadow-md`, `font-sans`, etc.

```ts
// uno.config.ts
import { presetThemeKit } from "@theme-kit/unocss";
import { defineConfig } from "unocss";

export default defineConfig({
  presets: [presetThemeKit()],
});
```

The preset values reference the live `--theme-*` variables, so they update at
runtime. For **build-time** static output instead of runtime variables, use
`createUnoTheme(source)`:

```ts
import { createUnoTheme } from "@theme-kit/unocss";
import { resolveTokens } from "@theme-kit/core";

const staticTheme = createUnoTheme(theme); // concrete values, resolved now
```

Both helpers accept an `AdapterSource` (runtime, store, theme, or raw tokens).

---

## Framework integrations

Theme Kit ships per-framework packages that wrap the framework-neutral
factories with native APIs.

### Coverage matrix

Which adapter convenience is available in which framework:

| Framework | Package | CSS-variable adapters | Generated-theme adapters |
| --- | --- | --- | --- |
| React | `@theme-kit/react` (hooks via each adapter pkg) | `useShadcnTheme` / `useBootstrapTheme` / `useDaisyTheme` / `useOpenPropsTheme` | `useMuiTheme` / `useChakraTheme` / `useAntdTheme` / `useMantineTheme` + providers |
| Vue | `@theme-kit/vue` | composables | — (React-only libs) |
| Svelte | `@theme-kit/svelte` | composables | — (React-only libs) |
| Solid | `@theme-kit/solid` | composables | — (React-only libs) |
| Angular | `@theme-kit/angular` | `injectShadcnTheme` / `injectBootstrapTheme` / `injectDaisyTheme` / `injectOpenPropsTheme` | — (React-only libs) |
| Next | `@theme-kit/next` | hooks (`./client` entry) | providers + hooks (`./client` entry) |
| Nuxt | `@theme-kit/nuxt` | composables (re-exported from Vue) | — (React-only libs) |
| Remix | `@theme-kit/remix` | hooks | providers + hooks |
| Astro | `@theme-kit/astro` | hooks (`./adapters`, `./client`) | providers + hooks (`./client`) |

> The **generated-theme adapters** (MUI, Chakra, AntD, Mantine) are React
> component libraries, so they are exposed only in **React-based** packages
> and meta-frameworks: React, Next, Remix, and Astro (client islands). They
> are intentionally absent from Vue / Svelte / Solid / Angular.

### React — `@theme-kit/react`

- `ThemeProvider` / `useThemeRuntime()`
- `useThemeRuntime()` — the active runtime
- `useShadcnTheme` / `useBootstrapTheme` / `useDaisyTheme` / `useOpenPropsTheme` (from each adapter package)
- `useMuiTheme` / `useChakraTheme` / `useAntdTheme` / `useMantineTheme` (from each generated-theme package)
- `useCSSVariables(runtime, { prefix })` — low-level CSS-variables binding

### Vue — `@theme-kit/vue`

`provideThemeRuntime(runtime)` in the app root, then use anywhere:

```vue
<script setup>
import { useShadcnTheme } from "@theme-kit/vue";
useShadcnTheme();
</script>
```

Composables: `useShadcnTheme`, `useBootstrapTheme`, `useDaisyTheme`,
`useOpenPropsTheme`. Internally they call `runtime.adapters.use(adapter)` in
`onMounted` and `handle.dispose()` in `onUnmounted`. The adapter factories
come from the `@theme-kit/<lib>/factory` subpaths — no React.

Also available: `useThemeRuntime`, `useThemeValue`, `useThemeTokens`,
`useThemeMode`, `useThemeFamily`, `useTheme`, `useThemeHistory`,
`useThemeBatch`, `useThemeSnapshot`, `useThemeRestore`, `useThemeLifecycle`,
`useThemePacks`.

### Svelte — `@theme-kit/svelte`

`setThemeRuntime(runtime)` / `getThemeRuntime()` (context), plus composables:

```svelte
<script>
  import { useShadcnTheme } from "@theme-kit/svelte";
  useShadcnTheme();
</script>
```

Composables: `useShadcnTheme`, `useBootstrapTheme`, `useDaisyTheme`,
`useOpenPropsTheme`. Registered in `onMount`, disposed in `onDestroy`.

### Solid — `@theme-kit/solid`

```tsx
import { useShadcnTheme } from "@theme-kit/solid";
import { ThemeProvider } from "@theme-kit/solid";

function App() {
  useShadcnTheme();
  return <YourApp />;
}
```

Composables: `useShadcnTheme`, `useBootstrapTheme`, `useDaisyTheme`,
`useOpenPropsTheme`. Registered in `onMount`, disposed in `onCleanup`.

### Angular — `@theme-kit/angular`

Provide the runtime via the Angular provider, then inject the theme
composables in components:

```ts
import { Component } from "@angular/core";
import { injectShadcnTheme } from "@theme-kit/angular";

@Component({ ... })
export class AppComponent {
  constructor() {
    injectShadcnTheme(); // installs, auto-disposed on component destroy
  }
}
```

Injectables: `injectShadcnTheme`, `injectBootstrapTheme`, `injectDaisyTheme`,
`injectOpenPropsTheme`. Each installs via `runtime.adapters.use(adapter)` and
disposes in `DestroyRef.onDestroy(handle.dispose)`.

### Next — `@theme-kit/next`

Next is a React meta-framework, so adapter hooks come from the `./client`
entry (prefixed with `"use client"`):

```tsx
"use client";
import { useShadcnTheme, MuiThemeProvider } from "@theme-kit/next/client";

function App({ children }: { children: React.ReactNode }) {
  useShadcnTheme();
  return <MuiThemeProvider runtime={runtime}>{children}</MuiThemeProvider>;
}
```

Exposes the four CSS-variable hooks **and** the generated-theme providers and
hooks (`MuiThemeProvider`, `ChakraThemeProvider`, `AntdThemeProvider`,
`MantineThemeProvider` + their `useXxxTheme` hooks).

### Nuxt — `@theme-kit/nuxt`

Nuxt is built on Vue, so it re-exports the Vue composables — including the
adapter composables — both from the module entry and as auto-imports:

```vue
<script setup>
import { useShadcnTheme } from "@theme-kit/nuxt";
useShadcnTheme();
</script>
```

Exposes `useShadcnTheme`, `useBootstrapTheme`, `useDaisyTheme`,
`useOpenPropsTheme` (Vue composables, no extra deps).

### Remix — `@theme-kit/remix`

Remix is a React meta-framework. Hooks come from `./hooks`; providers from the
main entry:

```tsx
import { useShadcnTheme, MuiThemeProvider } from "@theme-kit/remix";

function App() {
  useShadcnTheme();
  return <MuiThemeProvider runtime={runtime}>{children}</MuiThemeProvider>;
}
```

### Astro — `@theme-kit/astro`

Astro uses a **global runtime** (not React context), so adapter hooks are
Astro-specific and live in `@theme-kit/astro` (`./adapters` and `./client`):

```tsx
import { useShadcnTheme, MuiThemeProvider } from "@theme-kit/astro/client";
```

The four CSS-variable hooks resolve the runtime via `useThemeRuntime()` (the
global runtime) and register through the registry; the generated-theme
providers are available on the `./client` entry for React islands.

---

## Framework use cases

### React — default theme + live switching

```tsx
import { useMemo } from "react";
import { ThemeProvider } from "@theme-kit/react";
import { createThemeRuntime } from "@theme-kit/core";
import { useShadcnTheme } from "@theme-kit/shadcn";

function App() {
  const runtime = useMemo(
    () => createThemeRuntime({ initial: "light", modes: ["light", "dark"] }),
    [],
  );
  useShadcnTheme({ strategy: "native" });

  return <YourApp />;
}
```

### Vue — install on mount, dispose on unmount

```vue
<script setup>
import { provideThemeRuntime, useBootstrapTheme } from "@theme-kit/vue";
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({ initial: "dark" });
provideThemeRuntime(runtime);
useBootstrapTheme();
</script>
```

### Svelte — set runtime once, composable per root component

```svelte
<script>
  import { setThemeRuntime, useDaisyTheme } from "@theme-kit/svelte";
  import { createThemeRuntime } from "@theme-kit/core";
  setThemeRuntime(createThemeRuntime({ initial: "light" }));
  useDaisyTheme();
</script>
```

### Solid — composable in the app root

```tsx
import { ThemeProvider } from "@theme-kit/solid";
import { useOpenPropsTheme } from "@theme-kit/solid";

export function App() {
  useOpenPropsTheme();
  return <YourApp />;
}
```

### Angular — inject into the root component

```ts
@Component({ ... })
export class AppComponent {
  constructor() {
    injectOpenPropsTheme();
  }
}
```

### Next — client entry

```tsx
"use client";
import { useBootstrapTheme } from "@theme-kit/next/client";

export function RootClient() {
  useBootstrapTheme();
  return null;
}
```

### Nuxt — auto-import

```vue
<script setup>
useDaisyTheme(); // auto-imported from @theme-kit/nuxt
</script>
```

### Remix — root route

```tsx
import { useOpenPropsTheme } from "@theme-kit/remix";

export function Layout({ children }: { children: React.ReactNode }) {
  useOpenPropsTheme();
  return <>{children}</>;
}
```

### Astro — client island

```tsx
import { useShadcnTheme } from "@theme-kit/astro";
```

Use the hook inside a React client component and mount it with `client:only="react"`.

### MUI — generated theme object

```tsx
import { MuiThemeProvider } from "@theme-kit/mui";

<MuiThemeProvider runtime={runtime}>
  <YourMuiApp />
</MuiThemeProvider>
```

---

## Which CSS do you import?

Theme Kit's CSS-variable adapters **auto-inject** their compatibility
stylesheet at install time (`injectCSS: true` by default), so you do not need
to import library CSS manually. Set `injectCSS: false` if you would rather
manage the stylesheet yourself (e.g. you already import the library's official
CSS, or you are customizing it).

| Library | Auto-injected stylesheet | Manual alternative |
| --- | --- | --- |
| Bootstrap | `@theme-kit/bootstrap` (tagged `#@theme-kit/bootstrap`) | `import "@theme-kit/bootstrap"` and set `injectCSS: false` |
| shadcn/ui | `@theme-kit/shadcn` (tagged `#@theme-kit/shadcn`) | `import "@theme-kit/shadcn"` and set `injectCSS: false` |
| daisyUI | `@theme-kit/daisyui` (tagged `#@theme-kit/daisyui`) | `import "@theme-kit/daisyui"` and set `injectCSS: false` |
| Open Props | `@theme-kit/open-props` (tagged `#@theme-kit/open-props`) | `import "@theme-kit/open-props"` and set `injectCSS: false` |

To import the compatibility CSS explicitly:

```ts
// In a client entry (e.g. main.tsx / +layout.ts / layout.tsx)
import "@theme-kit/bootstrap";
```

Then disable auto-injection so it is not injected twice:

```ts
createBootstrapAdapter({ injectCSS: false });
```

> `injectCSS` is a **factory option**. The React hooks (`useBootstrapTheme`,
> `useShadcnTheme`, …) always inject the compatibility stylesheet and accept
> only `{ strategy }`; to control `injectCSS`, use the factory and register the
> adapter manually via `runtime.adapters.use(...)`.

Notes:

- Injection is **idempotent and SSR-safe** — guarded by `document` checks and
  a stable style id; it runs only once even across multiple installs.
- The **variable style element** (the `--*` values for the current theme) is
  always managed by the adapter itself; the toggle above only controls the
  static compatibility stylesheet.
- For **generated-theme adapters** (MUI, Chakra, AntD, Mantine) there is no
  CSS to import — the library's own provider + components handle styling, and
  Theme Kit supplies the theme object.

---

## Full API reference

### `@theme-kit/core`

**Types**

```ts
type AdapterStrategy = "exact" | "native" | "aggressive";

interface AdapterPluginContext {
  strategy: AdapterStrategy;
  mode: "light" | "dark" | "system" | undefined;
}

interface AdapterPlugin {
  id?: string;
  refine?(state: Record<string, unknown>, ctx: AdapterPluginContext): void | Record<string, unknown>;
  transform?(variables: Record<string, string>, ctx: AdapterPluginContext): Record<string, string>;
}

interface ThemeAdapter<T extends ThemeDefinition = ThemeDefinition> {
  readonly id: string;
  supports(runtime: ThemeRuntime<T>): boolean;
  install(runtime: ThemeRuntime<T>): void;
  uninstall(): void;
}

interface AdapterRegistration {
  readonly id: string;
  dispose(): void;
}

interface AdapterRegistry<T extends ThemeDefinition = ThemeDefinition> {
  use(adapter: ThemeAdapter<T>): AdapterRegistration;
  unuse(id: string): boolean; // deprecated
  list(): readonly ThemeAdapter<T>[];
  destroy(): void;
}
```

**Registry**

| Method | Signature | Purpose |
| --- | --- | --- |
| `runtime.adapters.use` | `(adapter) => AdapterRegistration` | Register + install (idempotent). |
| `handle.dispose` | `() => void` | Uninstall (last ref only). Safe no-op otherwise. |
| `runtime.adapters.unuse` | `(id: string) => boolean` | Deprecated force-uninstall by id. |
| `runtime.adapters.list` | `() => ThemeAdapter<T>[]` | Currently installed adapters. |
| `runtime.adapters.destroy` | `() => void` | Uninstall everything + clear. |
| `runtime.destroy` | `() => void` | Full runtime teardown (incl. adapters). |

### `@theme-kit/adapters` (shared helpers)

| Export | Purpose |
| --- | --- |
| `AdapterSource` | `ThemeRuntime \| ThemeStore \| ThemeDefinition \| ThemeTokens` |
| `resolveAdapterSource(source)` | Normalizes any source into `AdapterResolvedTheme` with tokens already resolved. |
| `AdapterResolvedTheme` | `{ name, mode, tokens }` |

**React helpers**

| Export | Purpose |
| --- | --- |
| `useRuntimeThemeFactory(runtime, factory)` | Re-run `factory` on every theme change. |
| `useCSSVariables(runtime, { prefix? })` | Keep `--theme-*` custom properties in sync. |

### CSS-variable adapters (per library)

| Export | Purpose |
| --- | --- |
| `createXxxAdapter(options?)` | Framework-neutral adapter factory. |
| `createXxxVariables(tokens)` | Pure function: tokens → `{ "--*": value }` map. |
| `generateXxxVariables(resolved, { strategy, plugins })` | Generator used by the adapter. |
| `useXxxTheme(options?)` | React hook — install + auto-dispose. |
| `injectXxxCSS()` | Idempotent compatibility CSS injection. |
| `CreateXxxAdapterOptions` | `{ strategy?, injectCSS?, plugins? }` |
| `XxxAdapterOptions` | `{ strategy?, injectCSS? }` |

Options summary:

```ts
{
  strategy?: "exact" | "native" | "aggressive"; // default "native"
  injectCSS?: boolean;                          // default true
  plugins?: AdapterPlugin[];                    // factory/options only
}
```

### Generated-theme adapters

| Export | Purpose |
| --- | --- |
| `useMuiTheme(runtime)` / `useChakraTheme(runtime)` / `useAntdTheme(runtime)` / `useMantineTheme(runtime)` | Build a native theme object, rebuild on change. |
| `MuiThemeProvider` / `ChakraThemeProvider` / `AntdThemeProvider` / `MantineThemeProvider` | Wrap the library provider with a Theme Kit theme. |
| `createMuiTheme` / `createChakraTheme` / `createAntdTheme` / `createMantineTheme` | Pure theme builders (tokens → library theme). |

### Build-time (UnoCSS)

| Export | Purpose |
| --- | --- |
| `presetThemeKit()` | UnoCSS preset with semantic utilities (`bg-primary`, …). |
| `createUnoTheme(source)` | Static, resolved UnoCSS theme for build-time generation. |

---

## Examples

### 1. Manual registration (no framework)

```ts
import { createThemeRuntime } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";

const runtime = createThemeRuntime({ initial: "light" });
const handle = runtime.adapters.use(createShadcnAdapter());

// switch themes at runtime — variables update automatically
runtime.selection.setMode("dark");

// cleanup when done
handle.dispose();
```

### 2. Two adapters at once

```ts
const bootstrap = createBootstrapAdapter({ strategy: "native" });
const daisy = createDaisyAdapter({ strategy: "exact" });
const h1 = runtime.adapters.use(bootstrap);
const h2 = runtime.adapters.use(daisy);

h1.dispose(); // bootstrap goes away, daisy stays
runtime.destroy(); // tears down daisy too; h2.dispose() is now a no-op
```

### 3. Strategy + plugin

```ts
runtime.adapters.use(
  createShadcnAdapter({
    strategy: "aggressive",
    plugins: [
      {
        transform(vars) {
          return { ...vars, "--radius-sm": "0.25rem" };
        },
      },
    ],
  }),
);
```

### 4. Reference counting (Strict Mode safe)

```ts
// Two components mount the same adapter instance (e.g. React Strict Mode
// double-invocation, or nested providers). install() runs once, uninstall()
// runs once, only after BOTH handles are disposed.
const h1 = runtime.adapters.use(adapter);
const h2 = runtime.adapters.use(adapter);

h1.dispose(); // refcount 2 → 1, still installed
h2.dispose(); // refcount 1 → 0, uninstall() runs
```

### 5. Replacement on same id

```ts
const a = createShadcnAdapter({ strategy: "exact" });
const b = createShadcnAdapter({ strategy: "aggressive" });

const ha = runtime.adapters.use(a); // installs a
const hb = runtime.adapters.use(b); // a uninstalled, b installed
ha.dispose(); // stale — safe no-op
hb.dispose(); // uninstalls b
```

### 6. Custom adapter

```ts
import type { ThemeAdapter, ThemeDefinition, ThemeRuntime } from "@theme-kit/core";

const myAdapter: ThemeAdapter<ThemeDefinition> = {
  id: "my-lib",
  supports: () => true,
  install(runtime) {
    // inject your <style>, write variables, subscribe to runtime.store
    this.unsub = runtime.store.subscribe(() => { /* rewrite variables */ });
  },
  uninstall() {
    this.unsub?.();
  },
};

runtime.adapters.use(myAdapter);
```

---

## Authoring a custom adapter

1. **Implement `ThemeAdapter`** — `id`, `supports`, `install`, `uninstall`.
2. **Resolve themes via `resolveAdapterSource`** so you accept a runtime, a
   store, a theme, or raw tokens interchangeably — your adapter stays usable
   in any context.
3. **Subscribe to `runtime.store`** in `install` so your output updates on
   theme changes; unsubscribe in `uninstall`.
4. **Keep it framework-neutral** — export a `createMyAdapter()` factory with
   zero framework imports, and let each framework package wrap it
   (hook / composable / injectable) exactly like the CSS-variable adapters do
   via their `factory` subpaths.
5. **Use the registry** — register with `runtime.adapters.use(adapter)` and
   dispose the handle in the framework lifecycle (effect cleanup, `onMounted`/
   `onUnmounted`, `onMount`/`onDestroy`, `onMount`/`onCleanup`,
   `DestroyRef.onDestroy`).
6. **Honor the idempotency contract** — your `install`/`uninstall` must be
   safe to call exactly once, and your `uninstall` must fully remove anything
   `install` created (styles, listeners, DOM).

---

## Rule of thumb

- **Class/utility-first CSS libraries** (Bootstrap, shadcn/ui, daisyUI, Open
  Props) → CSS-variable adapters + `factory` subpath for framework-neutral use.
- **Component libraries with their own theme system** (MUI, Chakra, AntD,
  Mantine) → generated-theme adapters / providers (React-first).
- **Atomic-CSS engines** (UnoCSS) → build-time presets + runtime variable
  references.
- **Any framework** → wrap a `createXxxAdapter` factory with the framework's
  native lifecycle API and expose it as a composable / hook / injectable.
