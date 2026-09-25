# Adapters

> An **adapter** translates a Theme Kit `ThemeDefinition` into whatever a
> specific UI library needs. Core knows nothing about Bootstrap, MUI, daisyUI,
> shadcn/ui, Chakra, Ant Design, Mantine or UnoCSS — it only knows themes,
> tokens and runtimes. Adapters are the translation layer between Theme Kit and
> your component library.

Adapters are **framework-agnostic**: the `createXxxAdapter` factories run in
plain TypeScript with zero framework imports. Each adapter package ships its
own framework wrappers on subpaths (`/react`, `/vue`, `/svelte`, `/solid`,
`/angular`) with optional peers, so the exact same adapter works in React, Vue,
Svelte, Solid, Angular, Next, Nuxt, Remix and Astro — without installing any
framework you don't use.

```tsx
import { ThemeProvider, useTheme, useThemeRuntime } from "@theme-kit/react";
import { useShadcnTheme } from "@theme-kit/shadcn/react";

function App() {
  const runtime = useThemeRuntime();
  useShadcnTheme(runtime);          // one line — the adapter runs itself
  const { mode, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>{mode}</button>
    // …your shadcn/ui components
  );
}
```

Prefer the per-framework quick starts in the
[Libraries](/libraries) pages. This page explains *how* the adapter system
works, so you can use it confidently in any framework, tune it with strategies
and plugins, or write your own adapter.

---

## The two kinds of adapters

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

- **CSS-variable adapters** maintain a live `<style>` element that exposes the
  library's own custom properties (`--bs-*`, `--background`, `--color-base-*`,
  `--op-*`). The library's stylesheet consumes them automatically, so its
  components restyle the instant the theme changes.
- **Generated-theme adapters** build a native theme object (MUI `Theme`,
  Chakra system, AntD `ThemeConfig`, Mantine theme) that you hand to that
  library's own provider. They rebuild the object on every theme change.
- **Build-time adapters** (the UnoCSS preset) expose tokens as utilities
  (`bg-primary`, `border-border`) that reference the live `--theme-*`
  variables.

---

## Core concepts

| Concept | Description |
| --- | --- |
| `ThemeAdapter<T>` | The contract every library adapter implements. |
| `AdapterRegistry<T>` | Runtime-owned registry of installed adapters. |
| `AdapterRegistration` | The handle returned by `registry.use()`. Call `dispose()` to uninstall. |
| `AdapterStrategy` | How faithfully an adapter reproduces a library's native feel. |
| `AdapterPlugin` | Extends an adapter with custom `refine` / `transform` hooks. |
| `AdapterSource` | Anything an adapter can read: runtime, store, theme, or raw tokens. |
| `AdapterResolvedTheme` | Normalized, token-resolved theme returned by `resolveAdapterSource`. |

---

## The adapter contract

```ts
interface ThemeAdapter<T extends ThemeDefinition = ThemeDefinition> {
  readonly id: string;
  supports(runtime: ThemeRuntime<T>): boolean;
  install(runtime: ThemeRuntime<T>): void;
  uninstall(): void;
}
```

- `id` — a unique string used for registry identity (`"shadcn"`, `"mui"`, ...).
- `supports(runtime)` — whether the adapter works with the given runtime. CSS
  variable adapters return `true` unconditionally.
- `install(runtime)` — called **once** when the adapter is first registered:
  inject the compatibility stylesheet, write the initial variables, and
  subscribe to the runtime store so variables update when the theme changes.
- `uninstall()` — removes the injected styles, unsubscribes, and returns the
  page to its pre-adapter state.

> **Idempotency guarantee.** An adapter instance is installed **exactly once**
> no matter how many times `registry.use()` is called with it, and uninstalled
> **exactly once** no matter how many handles you dispose or whether the
> runtime is destroyed first. This is what makes the bindings React
> Strict-Mode safe and safe to nest.

---

## The registry

The runtime owns a single `AdapterRegistry` — the source of truth for installed
adapters. Access it via `runtime.adapters`.

```ts
interface AdapterRegistry<T extends ThemeDefinition = ThemeDefinition> {
  use(adapter: ThemeAdapter<T>): AdapterRegistration;
  unuse(id: string): boolean;        // deprecated — prefer use().dispose()
  list(): readonly ThemeAdapter<T>[];
  destroy(): void;
}
```

### `use(adapter)` → `AdapterRegistration`

`use()` registers an adapter and installs it, returning a handle with a single
method:

```ts
interface AdapterRegistration {
  readonly id: string;
  dispose(): void;
}
```

Semantics:

- **Idempotent per instance.** `use()` twice with the same adapter instance
  installs it once, with an internal reference count of two. Both handles must
  be disposed before `uninstall()` runs.
- **Replace on identity change.** `use()` with a *different* adapter instance
  that claims the same `id` tears down the old one and installs the new one.
  Old handles become inert no-ops.
- **Deterministic cleanup.** `handle.dispose()` decrements the refcount and
  only uninstalls when it reaches zero. Disposing a stale or already-removed
  handle is a safe no-op.

```ts
const handle = runtime.adapters.use(createShadcnAdapter());

// later…
handle.dispose(); // uninstalls (when this was the last reference)
```

`unuse(id)` force-uninstalls all registrations for an id and is deprecated —
hold the handle from `use()` instead. `list()` returns installed adapters, and
`destroy()` uninstalls everything (used by runtime teardown; safe to call after
individual disposes).

The same lifecycle path handles every cleanup in the framework bindings, so a
composition API, an effect cleanup, `onUnmounted`, `onDestroy`, `onCleanup` and
`DestroyRef.onDestroy` all behave identically.

---

## Strategies

The `strategy` option controls how faithfully an adapter reproduces the target
library's native feel — you trade strictness for how "at home" the library's
components look.

```ts
type AdapterStrategy = "exact" | "native" | "aggressive";
```

| Strategy | Behavior |
| --- | --- |
| `exact` | Only map what Theme Kit defines. Change nothing else. |
| `native` | Behave like the library: derive missing semantic concepts (e.g. success/warning/info) and make small feel adjustments. **Default.** |
| `aggressive` | Fully emulate the library: also adjust spacing, typography, elevation, saturation and contrast. |

```ts
createBootstrapAdapter({ strategy: "aggressive" });
useShadcnTheme(runtime, { strategy: "exact" }); // options flow through to the adapter
```

---

## Adapter plugins

Plugins extend any CSS-variable adapter with custom logic. You can add them to
the factory options:

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
runtime.adapters.use(
  createShadcnAdapter({
    strategy: "aggressive",
    plugins: [
      {
        transform(vars) {
          return { ...vars, "--radius-md": "0.75rem" };
        },
      },
    ],
  }),
);
```

---

## CSS-variable adapters

Available for **Bootstrap**, **daisyUI**, **Open Props** and **shadcn/ui**.
Each package exposes the same shape:

| Package | Factory (framework-neutral) | Generator | Framework wrappers (subpaths) | CSS injector |
| --- | --- | --- | --- | --- |
| `@theme-kit/bootstrap` | `createBootstrapAdapter` | `createBootstrapVariables` / `generateBootstrapVariables` | `useBootstrapTheme` (`/react`, `/vue`, `/svelte`, `/solid`) · `injectBootstrapTheme` (`/angular`) | `injectBootstrapCSS` |
| `@theme-kit/shadcn` | `createShadcnAdapter` | `createShadcnVariables` / `generateShadcnVariables` | `useShadcnTheme` (`/react`, `/vue`, `/svelte`, `/solid`) · `injectShadcnTheme` (`/angular`) | `injectShadcnCSS` |
| `@theme-kit/daisyui` | `createDaisyAdapter` | `createDaisyVariables` / `generateDaisyVariables` | `useDaisyTheme` (`/react`, `/vue`, `/svelte`, `/solid`) · `injectDaisyTheme` (`/angular`) | `injectDaisyCSS` |
| `@theme-kit/open-props` | `createOpenPropsAdapter` | `createOpenPropsVariables` / `generateOpenPropsVariables` | `useOpenPropsTheme` (`/react`, `/vue`, `/svelte`, `/solid`) · `injectOpenPropsTheme` (`/angular`) | `injectOpenPropsCSS` |

### Options

```ts
interface XxxAdapterOptions {
  strategy?: AdapterStrategy; // "native" by default
  injectCSS?: boolean;        // true by default
}
```

### How it works

1. `install()` injects the library's **compatibility stylesheet** (a tagged,
   idempotent `<style id="@theme-kit/<name>">` element) so class names like
   `btn`, `card`, `alert` render with Theme Kit variables.
2. It maintains a second tagged `<style>` element containing the concrete
   `--*` custom properties for the current theme.
3. It subscribes to the runtime store; whenever the active theme changes, the
   variables are regenerated and the element is rewritten — **no full reload**.

### The `factory` subpath (framework-neutral)

Import the factories **without any framework** by deep-importing the `factory`
entry. This is exactly how the Vue / Svelte / Solid / Angular wrappers on each
adapter's subpath consume the adapters — no React dependency leaks into those
packages:

```ts
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";

const handle = runtime.adapters.use(createShadcnAdapter());
```

---

## Generated-theme adapters

For **Material UI**, **Chakra UI**, **Ant Design** and **Mantine**, Theme Kit
builds a native theme object from your semantic tokens. These are React
component libraries, so the convenience is exposed in **React-based**
frameworks — React, Next, Remix and Astro (client islands):

| Package | Hook | Provider | Theme builder |
| --- | --- | --- | --- |
| `@theme-kit/mui` | `useMuiTheme(runtime)` | `MuiThemeProvider` | `createMuiTheme` |
| `@theme-kit/chakra` | `useChakraTheme(runtime)` | `ChakraThemeProvider` | `createChakraTheme` |
| `@theme-kit/antd` | `useAntdTheme(runtime)` | `AntdThemeProvider` | `createAntdTheme` |
| `@theme-kit/mantine` | `useMantineTheme(runtime)` | `MantineThemeProvider` | `createMantineTheme` |

```tsx
import { MuiThemeProvider } from "@theme-kit/mui";
import { ThemeProvider, useThemeRuntime } from "@theme-kit/react";

function MuiZone() {
  const runtime = useThemeRuntime();
  return (
    <MuiThemeProvider runtime={runtime}>
      <YourMuiApp />
    </MuiThemeProvider>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <MuiZone />
    </ThemeProvider>
  );
}
```

`MuiThemeProvider` wraps MUI's own `ThemeProvider` with a theme derived from
Theme Kit tokens and rebuilt automatically on theme change. Mantine's provider
also forces its color scheme to match the active Theme Kit mode so Mantine's
built-in dark styles stay in sync. Under the hood the providers use
`useRuntimeThemeFactory(runtime, factory)` — a React hook that re-runs a
factory whenever the active theme changes.

---

## Build-time adapters (UnoCSS)

`@theme-kit/unocss` ships a UnoCSS preset that exposes Theme Kit semantic
tokens as utilities — `bg-primary`, `text-foreground`, `border-border`,
`rounded-lg`, `shadow-md`, `font-sans`, and more:

```ts
// uno.config.ts
import { defineConfig, presetWind3 } from "unocss";
import { presetThemeKit } from "@theme-kit/unocss";

export default defineConfig({
  presets: [presetWind3(), presetThemeKit()],
});
```

```tsx
<div className="bg-primary text-primary-foreground rounded-lg shadow-md">
  Themed with UnoCSS
</div>
```

The preset values reference the live `--theme-*` variables, so they update at
runtime. For **build-time static output** instead of runtime variables, use
`createUnoTheme(source)`:

```ts
import { createUnoTheme } from "@theme-kit/unocss";
import { getBuiltInThemes, resolveInitialTheme } from "@theme-kit/core";

// resolveInitialTheme takes the registry explicitly; the built-in set is a
// valid registry, so no theme file is needed.
const themes = getBuiltInThemes();

const { theme } = resolveInitialTheme({
  themes,
  family: "berry",
  mode: "light",
});

const staticTheme = createUnoTheme(theme);
```

Both helpers accept an `AdapterSource` (runtime, store, theme, or raw tokens).

---

## Framework coverage

Every adapter is framework-neutral at the core. Each adapter package ships its
own framework wrappers on subpaths, so the same adapter registers and disposes
correctly in any lifecycle — and installing a framework integration never pulls
in unrelated framework packages or component-library adapters.

| Framework | Package | CSS-variable adapters | Generated-theme adapters |
| --- | --- | --- | --- |
| React | `@theme-kit/react` | `useShadcnTheme(runtime)` / `useBootstrapTheme(runtime)` / `useDaisyTheme(runtime)` / `useOpenPropsTheme(runtime)` from each adapter's `/react` | `useMuiTheme(runtime)` / `useChakraTheme(runtime)` / `useAntdTheme(runtime)` / `useMantineTheme(runtime)` + providers from each adapter pkg |
| Vue 3 | `@theme-kit/vue` | same composables from each adapter's `/vue` | — (React-only libs) |
| Svelte | `@theme-kit/svelte` | same composables from each adapter's `/svelte` | — |
| Solid | `@theme-kit/solid` | same hooks from each adapter's `/solid` | — |
| Angular | `@theme-kit/angular` | `injectShadcnTheme(runtime)` / `injectBootstrapTheme(runtime)` / `injectDaisyTheme(runtime)` / `injectOpenPropsTheme(runtime)` from each adapter's `/angular` | — |
| Next.js | `@theme-kit/next` (`./client`) | hooks from each adapter's `/react` | providers from each adapter pkg + `useThemeRuntime` from `@theme-kit/next/client` |
| Nuxt | `@theme-kit/nuxt` | composables from each adapter's `/vue` | — |
| Remix | `@theme-kit/remix` | hooks from each adapter's `/react` | providers from each adapter pkg + `useThemeRuntime` from `@theme-kit/remix` |
| Astro | `@theme-kit/astro` (`./client`) | hooks from each adapter's `/react` (client islands) | providers from each adapter pkg + `useThemeRuntime` from `@theme-kit/astro/client` |

> The generated-theme adapters (MUI, Chakra, AntD, Mantine) are React component
> libraries, so their providers/hooks are used in React-based apps and
> meta-frameworks — React, Next, Remix, and Astro (client islands). Import them
> from the adapter package directly (e.g. `@theme-kit/mui`).

### React

```tsx
import { ThemeProvider, useThemeRuntime } from "@theme-kit/react";
import { useDaisyTheme } from "@theme-kit/daisyui/react";

function Inside() {
  const runtime = useThemeRuntime();
  useDaisyTheme(runtime);
  return null;
}

export function App() {
  return (
    <ThemeProvider>
      <Inside />
      <YourApp />
    </ThemeProvider>
  );
}
```

### Vue 3

```vue
<script setup>
import { createThemeRuntime } from "@theme-kit/core";
import { provideThemeRuntime, useThemeRuntime } from "@theme-kit/vue";
import { useShadcnTheme } from "@theme-kit/shadcn/vue";

provideThemeRuntime(createThemeRuntime({ defaultTheme: "light" }));
useShadcnTheme(useThemeRuntime());
</script>

<template>
  <YourApp />
</template>
```

### Svelte

```svelte
<script>
  import { createThemeRuntime } from "@theme-kit/core";
  import { setThemeRuntime, getThemeRuntime } from "@theme-kit/svelte";
  import { useBootstrapTheme } from "@theme-kit/bootstrap/svelte";

  setThemeRuntime(createThemeRuntime({ defaultTheme: "light" }));
  useBootstrapTheme(getThemeRuntime());
</script>

<YourApp />
```

### Solid

```tsx
import { ThemeProvider, useThemeRuntime } from "@theme-kit/solid";
import { useOpenPropsTheme } from "@theme-kit/open-props/solid";

export function App() {
  const runtime = useThemeRuntime();
  useOpenPropsTheme(runtime);
  return <YourApp />;
}
```

### Angular

```ts
import { provideThemeKit, injectThemeRuntime } from "@theme-kit/angular";
import { injectShadcnTheme } from "@theme-kit/shadcn/angular";

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideThemeKit({ themes: getBuiltInThemes() })],
};

// app.component.ts
@Component({})
export class AppComponent {
  constructor() {
    injectShadcnTheme(injectThemeRuntime());
  }
}
```

### Next.js (client)

```tsx
"use client";
import { useThemeRuntime } from "@theme-kit/next/client";
import { useShadcnTheme } from "@theme-kit/shadcn/react";

export function RootClient() {
  const runtime = useThemeRuntime();
  useShadcnTheme(runtime);
  return null;
}
```

### Nuxt

```vue
<script setup>
import { useThemeRuntime } from "@theme-kit/nuxt";
import { useDaisyTheme } from "@theme-kit/daisyui/vue";

useDaisyTheme(useThemeRuntime());
</script>
```

### Remix

```tsx
import { useThemeRuntime } from "@theme-kit/remix";
import { useOpenPropsTheme } from "@theme-kit/open-props/react";

export function Layout({ children }: { children: React.ReactNode }) {
  const runtime = useThemeRuntime();
  useOpenPropsTheme(runtime);
  return <>{children}</>;
}
```

### Astro (client island)

```tsx
// src/components/theme-adapter.tsx
import { useThemeRuntime } from "@theme-kit/astro/client";
import { useShadcnTheme } from "@theme-kit/shadcn/react";

export default function ThemeAdapter() {
  const runtime = useThemeRuntime();
  useShadcnTheme(runtime);
  return null;
}
```

```astro
---
// src/layouts/Base.astro
import ThemeAdapter from "../components/theme-adapter";
---
<ThemeAdapter client:only="react" />
<slot />
```

---

## Which CSS do you import?

The CSS-variable adapters **auto-inject** their compatibility stylesheet at
install time (`injectCSS: true` by default), so you don't need to import
library CSS manually. Set `injectCSS: false` if you want to manage the
stylesheet yourself (e.g. you already import the library's official CSS).

| Library | Auto-injected stylesheet | Manual alternative |
| --- | --- | --- |
| Bootstrap | `@theme-kit/bootstrap` (tagged `#@theme-kit/bootstrap`) | `import "@theme-kit/bootstrap"` + `injectCSS: false` |
| shadcn/ui | `@theme-kit/shadcn` (tagged `#@theme-kit/shadcn`) | `import "@theme-kit/shadcn"` + `injectCSS: false` |
| daisyUI | `@theme-kit/daisyui` (tagged `#@theme-kit/daisyui`) | `import "@theme-kit/daisyui"` + `injectCSS: false` |
| Open Props | `@theme-kit/open-props` (tagged `#@theme-kit/open-props`) | `import "@theme-kit/open-props"` + `injectCSS: false` |

```ts
// In a client entry (e.g. main.tsx / +layout.ts / layout.tsx)
import "@theme-kit/bootstrap";
```

Then disable auto-injection so the stylesheet isn't injected twice:

```ts
createBootstrapAdapter({ injectCSS: false });
```

> Note: `injectCSS` is a **factory option**. The framework wrappers
> (`useBootstrapTheme`, `useShadcnTheme`, …) always inject the compatibility
> stylesheet and accept `(runtime, { strategy })`; to control `injectCSS` you
> must use the factory and register the adapter manually via
> `runtime.adapters.use(...)`.

Notes:

- Injection is **idempotent and SSR-safe** — guarded by `document` checks and a
  stable style id; it runs only once even across multiple installs.
- The **variable style element** (the `--*` values for the current theme) is
  always managed by the adapter; `injectCSS` only toggles the static
  compatibility stylesheet.
- For **generated-theme adapters** there is no CSS to import — the library's
  own provider + components handle styling, and Theme Kit supplies the theme.

---

## Examples

### Manual registration (no framework)

```ts
import { createThemeRuntime } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";

const runtime = createThemeRuntime({ defaultTheme: "light" });
const handle = runtime.adapters.use(createShadcnAdapter());

// switch themes at runtime — variables update automatically
runtime.selection.setMode("dark");

// cleanup when done
handle.dispose();
```

### Two adapters at once

```ts
const bootstrap = createBootstrapAdapter({ strategy: "native" });
const daisy = createDaisyAdapter({ strategy: "exact" });
const h1 = runtime.adapters.use(bootstrap);
const h2 = runtime.adapters.use(daisy);

h1.dispose();          // bootstrap goes away, daisy stays
runtime.destroy();     // tears down daisy too; h2.dispose() is now a no-op
```

### Reference counting (Strict Mode safe)

```ts
const h1 = runtime.adapters.use(adapter);
const h2 = runtime.adapters.use(adapter);

h1.dispose(); // refcount 2 → 1, still installed
h2.dispose(); // refcount 1 → 0, uninstall() runs once
```

### Replacement on the same id

```ts
const a = createShadcnAdapter({ strategy: "exact" });
const b = createShadcnAdapter({ strategy: "aggressive" });

const ha = runtime.adapters.use(a); // installs a
const hb = runtime.adapters.use(b); // a uninstalled, b installed
ha.dispose(); // stale — safe no-op
hb.dispose(); // uninstalls b
```

---

## Authoring a custom adapter

1. **Implement `ThemeAdapter`** — `id`, `supports`, `install`, `uninstall`.
2. **Resolve themes via `resolveAdapterSource`** so your adapter accepts a
   runtime, a store, a theme, or raw tokens interchangeably and stays usable in
   any context.
3. **Subscribe to `runtime.store`** in `install` so your output updates on
   theme changes; unsubscribe in `uninstall`.
4. **Keep it framework-neutral** — export a `createMyAdapter()` factory with
   zero framework imports, and let each framework package wrap it (hook /
   composable / injectable) exactly like the CSS-variable adapters do via their
   `factory` subpaths.
5. **Use the registry** — register with `runtime.adapters.use(adapter)` and
   dispose the handle in the framework lifecycle (React effect cleanup,
   `onMounted`/`onUnmounted`, `onMount`/`onDestroy`, `onMount`/`onCleanup`,
   `DestroyRef.onDestroy`).
6. **Honor the idempotency contract** — your `install`/`uninstall` must be safe
   to call exactly once, and `uninstall` must fully remove anything `install`
   created (styles, listeners, DOM).

```ts
import type { ThemeAdapter, ThemeDefinition } from "@theme-kit/core";

const myAdapter: ThemeAdapter<ThemeDefinition> = {
  id: "my-lib",
  supports: () => true,
  install(runtime) {
    this.unsub = runtime.store.subscribe(() => {
      /* rewrite your variables */
    });
  },
  uninstall() {
    this.unsub?.();
  },
};

runtime.adapters.use(myAdapter);
```

---

## Rule of thumb

- **Class / utility-first CSS libraries** (Bootstrap, shadcn/ui, daisyUI, Open
  Props) → CSS-variable adapters + the `factory` subpath for framework-neutral
  use.
- **Component libraries with their own theme system** (MUI, Chakra, AntD,
  Mantine) → generated-theme adapters / providers (React-first).
- **Atomic-CSS engines** (UnoCSS) → build-time presets + runtime variable
  references.
- **Any framework** → wrap a `createXxxAdapter` factory with the framework's
  native lifecycle API and expose it as a composable / hook / injectable.