import { type ReactElement } from "react";
import { Icon } from "@iconify/react";

const icons = {
  react: <Icon icon="devicon:react" width={24} height={24} />,
  next: <Icon icon="devicon:nextjs" width={24} height={24} />,
  vue: <Icon icon="devicon:vuejs" width={24} height={24} />,
  svelte: <Icon icon="devicon:svelte" width={24} height={24} />,
  solid: <Icon icon="devicon:solidjs" width={24} height={24} />,
  angular: <Icon icon="devicon:angular" width={24} height={24} />,
  web: <Icon icon="simple-icons:webcomponentsdotorg" width={24} height={24} />,
  tailwind: <Icon icon="devicon:tailwindcss" width={24} height={24} />,
  astro: <Icon icon="simple-icons:astro" width={24} height={24} />,
  nuxt: <Icon icon="devicon:nuxtjs" width={24} height={24} />,
  remix: <Icon icon="simple-icons:remix" width={24} height={24} />,
};

export type FrameworkFeature = {
  name: string;
  desc: string;
};

export type FrameworkGroup = {
  label: string;
  features: FrameworkFeature[];
};

export type FrameworkSnippet = {
  title: string;
  lang: string;
  code: string;
};

export type FrameworkItem = {
  slug: string;
  name: string;
  icon: ReactElement;
  pkg: string;
  tagline: string;
  mark: string;
  tags: string[];
  groups: FrameworkGroup[];
  quickStart: FrameworkSnippet;
  snippet: FrameworkSnippet;
  snippet2: FrameworkSnippet;
  noTheme: FrameworkSnippet;
  featureCount: number;
};

type RawFramework = Omit<FrameworkItem, "featureCount">;

export const rawFrameworks: RawFramework[] = [
  {
    slug: "react",
    name: "React",
    icon: icons.react,
    pkg: "@theme-kit/react",
    tagline:
      "Provider + hooks for React 18/19. The reference integration, and the base that Next.js and Remix re-export.",
    mark: "R",
    tags: ["SPA", "Vite", "Context"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProvider",
            desc: "Creates a runtime, wires DOM + CSS-variable bindings, and provides it via context. Accepts every ThemeRuntimeOptions prop.",
          },
          {
            name: "Runtime injection",
            desc: "Pass `runtime` to share an existing instance, or `initial` to seed the server-resolved selection for hydration.",
          },
          {
            name: "scheduled prop",
            desc: "Pass `scheduled={{ lightTheme, darkTheme }}` to ThemeProvider to switch the app between light and dark at each visitor's local sunrise/sunset. Latitude/longitude are optional — the location is auto-detected from the browser timezone (or pin it with `timeZone`).",
          },
        ],
      },
      {
        label: "Hooks",
        features: [
          {
            name: "useTheme()",
            desc: "Returns `{ theme, mode, family, setMode, setFamily, toggleTheme }`.",
          },
          {
            name: "useThemeValue() / useThemeTokens()",
            desc: "The active theme definition, and the active theme tokens.",
          },
          {
            name: "useThemeMode() / useThemeFamily()",
            desc: "Granular reads for the current mode and family.",
          },
          {
            name: "useSetThemeMode() / useSetThemeFamily()",
            desc: "Granular setters — set mode or family independently.",
          },
          {
            name: "useToggleTheme()",
            desc: "Toggle function for light/dark.",
          },
          {
            name: "useThemeRuntime()",
            desc: "Access the full runtime: registry, history, lifecycle, plugins.",
          },
          {
            name: "useThemeHistory()",
            desc: "`{ undo, redo, canUndo, canRedo, clear }`.",
          },
          {
            name: "useThemeBatch()",
            desc: "Wrap `runtime.batch()` for atomic, coalesced updates.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore the full runtime state.",
          },
          {
            name: "useThemeTimeTravel()",
            desc: "`{ history, jump }` — indexed navigation through time.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to typed lifecycle events (`beforeThemeChange`, `afterPersist`, ...).",
          },
          {
            name: "useThemePacks()",
            desc: "Install a theme pack at runtime via `runtime.use()`.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive sunrise/sunset controller: `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`. Returns `null` when the provider has no `scheduled` option.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Apply a specific theme to a subtree; emits scoped CSS vars plus Tailwind-compatible `--color-*` / `--radius-*` variables.",
          },
          {
            name: "ThemeModeButton",
            desc: "One-click light → dark → system cycle button.",
          },
          {
            name: "ThemeInspector",
            desc: "Floating dev panel: active theme, selection, flattened tokens, generated CSS variables.",
          },
          {
            name: "useScopedTheme(ref, themeName)",
            desc: "Imperative scoping for any element ref.",
          },
          {
            name: "useThemePacks()",
            desc: "Install a theme pack at runtime via `runtime.use()`.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "createMuiAdapter() / createChakraAdapter()",
            desc: "Maps Theme Kit semantic tokens into native generated themes while preserving the framework-neutral runtime contract.",
          },
          {
            name: "createAntdAdapter() / createMuiAdapter() / createChakraAdapter()",
            desc: "Rebuilds the library theme from the active Theme Kit theme and exposes a reactive snapshot/subscribe bridge for React providers.",
          },
          {
            name: "MantineThemeProvider + createMantineTheme()",
            desc: "Mantine's generated-theme bridge: `createMantineTheme(runtime)` rebuilds the native Mantine theme from Theme Kit tokens, and `MantineThemeProvider` forces the color scheme to match the active mode.",
          },
          {
            name: "CSS-variable adapters",
            desc: "Shadcn, Bootstrap, DaisyUI, and Open Props adapters can be registered directly with the runtime; their factories do not require React.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Transitions are enabled by default (300ms, smooth). Pass `transition` to tune duration/easing/preset/properties, or `transition={{ enabled: false }}` to disable.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation for a single switch. For custom animation orchestration, compose the core diff/plan/runner APIs.",
          },
        ],
      },
    ],
    quickStart: {
      title: "main.tsx",
      lang: "tsx",
      code: `// main.tsx
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";
import App from "./App";
import { themes } from "./themes";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider themes={themes} defaultTheme="mint-light">
    <App />
  </ThemeProvider>,
);`,
    },
    snippet: {
      title: "app.tsx",
      lang: "tsx",
      code: `import { ThemeProvider, useTheme } from "@theme-kit/react";

export function App() {
  return (
    <ThemeProvider themes={themes} transition={{ enabled: true }}>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { theme, family, setFamily, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      {theme.name} · {family}
    </button>
  );
}`,
    },
    snippet2: {
      title: "theme-scope.tsx",
      lang: "tsx",
      code: `import { ThemeProvider, ThemeScope, useThemeHistory, type ThemeTransitionOptions } from "@theme-kit/react";

const scopeTransition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function App() {
  return (
    <ThemeProvider themes={themes}>
      <ThemeScope theme="forest" transition={scopeTransition}>
        <PremiumPanel />
      </ThemeScope>
      <HistoryControls />
    </ThemeProvider>
  );
}`,
    },
    noTheme: {
      title: "main.tsx",
      lang: "tsx",
      code: `// main.tsx — no theme definition needed
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";

createRoot(document.getElementById("root")!).render(
  // No \`themes\` prop → Theme Kit applies its built-in neutral theme.
  // Pick the variant: "light" | "dark" (or omit → system preference).
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>,
);`,
    },
  },
  {
    slug: "next",
    name: "Next.js",
    icon: icons.next,
    pkg: "@theme-kit/next",
    tagline:
      "App Router theming with SSR-safe hydration, cookie persistence, and zero flash of incorrect theme.",
    mark: "N",
    tags: ["SSR", "RSC", "Zero-flash"],
    groups: [
      {
        label: "Server",
        features: [
          {
            name: "ThemeProvider (Server Component)",
            desc: "Reads `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration.",
          },
          {
            name: "Blocking bootstrap script",
            desc: "Emits a blocking script in `<head>` that applies the persisted theme before first paint.",
          },
          {
            name: "Dark-mode CSS fallback",
            desc: "Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`.",
          },
          {
            name: "createNextThemePersistence()",
            desc: "Mirrors selection to cookies (`theme-mode`, `theme-family`, `theme-name`, `theme-fingerprint`) so the server renders the right theme next request.",
          },
          {
            name: "scheduled prop",
            desc: "Pass `scheduled={{ lightTheme, darkTheme }}` to the server ThemeProvider to enable sunrise/sunset switching app-wide. Coordinates are optional — each visitor's timezone is auto-detected on the client.",
          },
        ],
      },
      {
        label: "Client",
        features: [
          {
            name: "ClientThemeProvider",
            desc: "Cookie + localStorage persistence, fingerprint check, and `.dark` class sync after hydration.",
          },
          {
            name: "@theme-kit/next/client",
            desc: "Re-exports every React hook plus ThemeScope, ThemeInspector and ThemeModeButton for client components.",
          },
          {
            name: "ThemeBootstrap",
            desc: "Injects SSR dark-mode CSS via `useServerInsertedHTML`.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive sunrise/sunset controller (via `@theme-kit/next/client`): `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Built-in runtime transition support. Configure duration/easing once on the provider; Theme Kit generates the transition styles at runtime, so applications do not need to maintain theme-transition rules in global CSS.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch from `@theme-kit/next/client`: call `runtime.store.set(theme, { suppressTransition: true })` when a switch must be instantaneous.",
          },
        ],
      },
      {
        label: "Scrollbar",
        features: [
          {
            name: "scrollbar prop",
            desc: "Enables Theme Kit's custom overlay scrollbar. The SSR bootstrap hides the native scrollbar before first paint, then the overlay engine synchronizes with browser scrolling without replacing native scroll behavior.",
          },
          {
            name: "scrollbar option",
            desc: "Configure the overlay appearance from semantic tokens, including an explicit color token when needed. The overlay remains theme-aware and updates with runtime theme changes.",
          },
        ],
      },
    ],
    quickStart: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";
import { themes } from "./theme/themes";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
    >
      {children}
    </ThemeProvider>
  );
}`,
    },
    snippet: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";
import { themes } from "./theme/themes";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="mint-light">
      {children}
    </ThemeProvider>
  );
}

// components/ThemeSwitcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";`,
    },
    snippet2: {
      title: "layout + theme-switcher",
      lang: "tsx",
      code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="mint-light"> {/* mint-light | mint-dark | light | dark | system */}
      {children}
    </ThemeProvider>
  );
}

// app/theme-switcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  return (
    <div>
      <button onClick={toggleTheme}>{theme.name} · {mode}</button>
      <button onClick={() => setMode("dark")}>Dark</button>
      <button onClick={() => setMode("light")}>Light</button>
    </div>
  );
}`,
    },
    noTheme: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `// app/layout.tsx — no theme definition needed
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  // No \`themes\` prop → the server resolves the built-in neutral theme
  // and inlines it before hydration. Pick "light" | "dark" (or omit → system).
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}`,
    },
  },
  {
    slug: "vue",
    name: "Vue 3",
    icon: icons.vue,
    pkg: "@theme-kit/vue",
    tagline:
      "Composables-first theming for Vue 3 with a provider component and scoped theming.",
    mark: "V",
    tags: ["Composition API", "Provider"],
    groups: [
      {
        label: "Setup",
        features: [
          {
            name: "ThemeProvider",
            desc: "Provider component accepting every runtime option; auto-registered via `app.use` (`.install`).",
          },
          {
            name: "provideThemeRuntime() / useThemeRuntime()",
            desc: "Explicit provide/inject access to the runtime.",
          },
        ],
      },
      {
        label: "Composables",
        features: [
          {
            name: "useTheme()",
            desc: "Reactive refs for `theme`, `mode`, `family` plus `setMode`, `setFamily`, `toggleTheme`.",
          },
          {
            name: "useThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "useThemeBatch()",
            desc: "Atomic, coalesced updates via `runtime.batch()`.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore the full runtime state.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to typed lifecycle events.",
          },
          {
            name: "useThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive schedule state (a `Ref` with `enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus `enable()`/`disable()`/`set()`. Configure via the `scheduled` prop on ThemeProvider.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "useShadcnTheme() / useBootstrapTheme()",
            desc: "Framework composables install the React-free CSS-variable adapter factories and dispose the returned adapter handle with the component lifecycle.",
          },
          {
            name: "useDaisyTheme() / useOpenPropsTheme()",
            desc: "Same adapter contract for DaisyUI and Open Props; the framework package supplies lifecycle wiring while the adapter factory stays framework-neutral.",
          },
          {
            name: "adapter factory subpaths",
            desc: "Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without React.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Runtime toggle — no mutation hook exists. The transition prop is fixed at runtime creation; for a one-off instant switch, get the runtime (useThemeRuntime() / getThemeRuntime()) then runtime.store.set(theme, { suppressTransition: true }) applies immediately without animating. For full control, compose createThemeDiff + createTransitionPlan + runThemeAnimation from @theme-kit/core.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Scoped theming component for subtrees.",
          },
        ],
      },
    ],
    quickStart: {
      title: "App.vue",
      lang: "vue",
      code: `<script setup>
import { ThemeProvider } from "@theme-kit/vue";
import { themes } from "./themes";
</script>

<template>
  <ThemeProvider :themes="themes" default-theme="mint-light">
    <YourView />
  </ThemeProvider>
</template>`,
    },
    snippet: {
      title: "ThemeSwitcher.vue",
      lang: "vue",
      code: `<script setup>
import { useTheme } from "@theme-kit/vue";
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
</template>`,
    },
    snippet2: {
      title: "history + scope",
      lang: "vue",
      code: `<script setup>
import { useThemeHistory } from "@theme-kit/vue";
const { undo, redo, canUndo, canRedo } = useThemeHistory();
</script>

<template>
  <button @click="undo" :disabled="!canUndo">Undo</button>
  <button @click="redo" :disabled="!canRedo">Redo</button>

  <ThemeScope theme="forest">
    <p>This subtree is always themed "forest".</p>
  </ThemeScope>
</template>`,
    },
    noTheme: {
      title: "App.vue",
      lang: "vue",
      code: `<script setup>
import { ThemeProvider } from "@theme-kit/vue";
</script>

<!-- No \`themes\` prop → built-in neutral theme.
     Pick the variant: default-theme="light" | "dark" (or omit → system). -->
<template>
  <ThemeProvider default-theme="light">
    <YourView />
  </ThemeProvider>
</template>`,
    },
  },
  {
    slug: "svelte",
    name: "Svelte 5",
    icon: icons.svelte,
    pkg: "@theme-kit/svelte",
    tagline:
      "Context-based provider with reactive readable stores for Svelte 5 runes-era components.",
    mark: "S",
    tags: ["Context", "Stores", "Runes"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProvider",
            desc: "Context-based provider that wires DOM + CSS variable bindings.",
          },
          {
            name: "getThemeRuntime() / setThemeRuntime()",
            desc: "Context helpers for retrieving or overriding the runtime.",
          },
        ],
      },
      {
        label: "Stores",
        features: [
          {
            name: "useTheme()",
            desc: "Reactive readable stores for `theme`, `mode`, `family` and their setters.",
          },
          {
            name: "useThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "useThemeBatch()",
            desc: "Atomic, coalesced updates.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore runtime state.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to lifecycle events.",
          },
          {
            name: "useThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "useThemeSchedule() / getThemeSchedule()",
            desc: "Reactive readable store of the schedule state (`enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus the imperative `ThemeSchedule` controller. Configure via the `scheduled` prop on ThemeProvider.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "useShadcnTheme() / useBootstrapTheme()",
            desc: "Framework composables install the React-free CSS-variable adapter factories and dispose the returned adapter handle with the component lifecycle.",
          },
          {
            name: "useDaisyTheme() / useOpenPropsTheme()",
            desc: "Same adapter contract for DaisyUI and Open Props; the framework package supplies lifecycle wiring while the adapter factory stays framework-neutral.",
          },
          {
            name: "adapter factory subpaths",
            desc: "Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without React.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Runtime toggle — no mutation hook exists. The transition prop is fixed at runtime creation; for a one-off instant switch, get the runtime (useThemeRuntime() / getThemeRuntime()) then runtime.store.set(theme, { suppressTransition: true }) applies immediately without animating. For full control, compose createThemeDiff + createTransitionPlan + runThemeAnimation from @theme-kit/core.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Scoped theming component for subtrees.",
          },
        ],
      },
    ],
    quickStart: {
      title: "App.svelte",
      lang: "svelte",
      code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import { themes } from "./themes";
</script>

<ThemeProvider themes={themes} defaultTheme="mint-light">
  <ThemeSwitcher />
</ThemeProvider>`,
    },
    snippet: {
      title: "ThemeSwitcher.svelte",
      lang: "svelte",
      code: `<script>
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, toggleTheme } = useTheme();
</script>

<button onclick={toggleTheme}>
  {$theme.name} · {$mode}
</button>`,
    },
    snippet2: {
      title: "App.svelte",
      lang: "svelte",
      code: `<script>
  import { ThemeProvider, ThemeScope, useThemeHistory, type ThemeTransitionOptions } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";

  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };
</script>

<ThemeProvider themes={themes}>
  <ThemeScope theme="forest" {transition}>
    <p>Scoped to forest</p>
  </ThemeScope>

  <button onclick={undo} disabled={!$canUndo}>Undo</button>
  <button onclick={redo} disabled={!$canRedo}>Redo</button>

  <ThemeSwitcher />
</ThemeProvider>`,
    },
    noTheme: {
      title: "App.svelte",
      lang: "svelte",
      code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  import { themes } from "./themes";
</script>

<!-- No \`themes\` prop → built-in neutral theme.
     Pick the variant: defaultTheme="light" | "dark" (or omit → system). -->
<ThemeProvider defaultTheme="light">
  <YourView />
</ThemeProvider>`,
    },
  },
  {
    slug: "solid",
    name: "Solid",
    icon: icons.solid,
    pkg: "@theme-kit/solid",
    tagline:
      "Signals-first theming with context provider, getters and scoped subtrees.",
    mark: "So",
    tags: ["Signals", "Context"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProvider",
            desc: "Context provider with DOM + CSS variable bindings.",
          },
        ],
      },
      {
        label: "Signals",
        features: [
          {
            name: "useTheme()",
            desc: "Signals for `theme`, `mode`, `family` with getter access and setters.",
          },
          {
            name: "useThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "useThemeBatch()",
            desc: "Atomic, coalesced updates.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore runtime state.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to lifecycle events.",
          },
          {
            name: "useThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive sunrise/sunset controller with signal-backed `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`. Configure via the `scheduled` prop on ThemeProvider.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "useShadcnTheme() / useBootstrapTheme()",
            desc: "Framework composables install the React-free CSS-variable adapter factories and dispose the returned adapter handle with the component lifecycle.",
          },
          {
            name: "useDaisyTheme() / useOpenPropsTheme()",
            desc: "Same adapter contract for DaisyUI and Open Props; the framework package supplies lifecycle wiring while the adapter factory stays framework-neutral.",
          },
          {
            name: "adapter factory subpaths",
            desc: "Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without React.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Runtime toggle — no mutation hook exists. The transition prop is fixed at runtime creation; for a one-off instant switch, get the runtime (useThemeRuntime() / getThemeRuntime()) then runtime.store.set(theme, { suppressTransition: true }) applies immediately without animating. For full control, compose createThemeDiff + createTransitionPlan + runThemeAnimation from @theme-kit/core.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Scoped theming component for subtrees.",
          },
        ],
      },
    ],
    quickStart: {
      title: "main.tsx",
      lang: "tsx",
      code: `import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import App from "./App";
import { themes } from "./themes";

render(() => (
  <ThemeProvider themes={themes} defaultTheme="mint-light">
    <App />
  </ThemeProvider>
), document.getElementById("root")!);`,
    },
    snippet: {
      title: "ThemeSwitcher.tsx",
      lang: "tsx",
      code: `import { ThemeProvider, useTheme } from "@theme-kit/solid";

function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme().name}</button>;
}

export function App() {
  return (
    <ThemeProvider themes={themes}>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}`,
    },
    snippet2: {
      title: "history + scope",
      lang: "tsx",
      code: `import { ThemeProvider, ThemeScope, useThemeHistory, type ThemeTransitionOptions } from "@theme-kit/solid";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function App() {
  return (
    <ThemeProvider themes={themes}>
      <ThemeScope theme="forest" transition={transition}>
        <span>Always forest</span>
      </ThemeScope>
      <HistoryControls />
    </ThemeProvider>
  );
}

function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}`,
    },
    noTheme: {
      title: "main.tsx",
      lang: "tsx",
      code: `// main.tsx — no theme definition needed
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";

render(() => (
  // No \`themes\` prop → Theme Kit applies its built-in neutral theme.
  // Pick the variant: "light" | "dark" (or omit → system preference).
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>
), document.getElementById("root")!);`,
    },
  },
  {
    slug: "angular",
    name: "Angular",
    icon: icons.angular,
    pkg: "@theme-kit/angular",
    tagline:
      "NgModule-free theming: DI providers, reactive injectables, a scoping directive and zero-flash bootstrap helpers.",
    mark: "A",
    tags: ["DI", "Directive", "SSR"],
    groups: [
      {
        label: "Setup",
        features: [
          {
            name: "provideThemeKit(options)",
            desc: "App-level providers from a ThemeRuntimeOptions config.",
          },
          {
            name: "provideThemeKitRuntime(runtime)",
            desc: "Provide an existing shared runtime instance.",
          },
        ],
      },
      {
        label: "Injectables",
        features: [
          {
            name: "injectThemeRuntime()",
            desc: "Inject the full runtime.",
          },
          {
            name: "injectTheme()",
            desc: "Reactive `ThemeState` — theme, mode, family plus setters.",
          },
          {
            name: "injectThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "injectThemeBatch()",
            desc: "Atomic, coalesced updates.",
          },
          {
            name: "injectThemeSnapshot() / injectThemeRestore()",
            desc: "Serialize and restore runtime state.",
          },
          {
            name: "injectThemeTimeTravel()",
            desc: "`{ history, jump }` — indexed time travel.",
          },
          {
            name: "injectThemeLifecycle()",
            desc: "Subscribe to lifecycle events.",
          },
          {
            name: "injectThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "injectThemeSchedule()",
            desc: "Reactive sunrise/sunset controller: `state()` is a Signal of `enabled`, `status`, `sunrise`, `sunset`, `nextTransition`; plus `enable()`/`disable()`/`set()`. Configure via `scheduled` in `provideThemeKit()`.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition in provideThemeKit()",
            desc: "Pass `transition` config to `provideThemeKit()` to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Runtime toggle — no mutation hook exists. The transition prop is fixed at runtime creation; for a one-off instant switch, injectThemeRuntime() then runtime.store.set(theme, { suppressTransition: true }) applies immediately without animating. For full control, compose createTransitionPlan + runThemeAnimation from @theme-kit/core.",
          },
        ],
      },
      {
        label: "Directives",
        features: [
          {
            name: "ThemeScopeDirective",
            desc: "Element-scoped theming via a directive.",
          },
        ],
      },
      {
        label: "SSR & Bootstrap",
        features: [
          {
            name: "createAngularPersistence()",
            desc: "Angular-flavored persistence adapter.",
          },
          {
            name: "createBlockingScriptContent / buildThemeCSSMap",
            desc: "Zero-flash bootstrap helpers for server-rendered apps.",
          },
        ],
      },
    ],
    quickStart: {
      title: "main.ts",
      lang: "ts",
      code: `import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";
import { themes } from "./themes";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes, defaultTheme: "mint-light" })],
});`,
    },
    snippet: {
      title: "theme-switcher.ts",
      lang: "ts",
      code: `import { Component } from "@angular/core";
import { provideThemeKit, injectTheme } from "@theme-kit/angular";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes })],
});

@Component({
  selector: "theme-switcher",
  template: \`
    <button (click)="toggle()">
      {{ state().theme.name }} · {{ state().mode }}
    </button>
  \`,
})
export class ThemeSwitcher {
  // Must be public — Angular templates cannot access private members.
  state = injectTheme();
  toggle() {
    this.state().toggleTheme();
  }
}`,
    },
    snippet2: {
      title: "history-controls.ts",
      lang: "ts",
      code: `import { Component } from "@angular/core";
import {
  provideThemeKit,
  injectThemeHistory,
  ThemeScopeDirective,
} from "@theme-kit/angular";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes })],
});

@Component({
  selector: "history-controls",
  standalone: true,
  imports: [ThemeScopeDirective],
  template: \`
    <div [themeKitScope]="'forest'" [themeKitScopeTransition]="transition">Scoped to forest</div>
    <button (click)="undo()" [disabled]="!canUndo()">Undo</button>
    <button (click)="redo()" [disabled]="!canRedo()">Redo</button>
  \`,
})
export class HistoryControls {
  private history = injectThemeHistory();
  canUndo() { return this.history.history().canUndo; }
  canRedo() { return this.history.history().canRedo; }
  undo() { this.history.undo(); }
  redo() { this.history.redo(); }

  transition: import("@theme-kit/core").ThemeTransitionOptions = { duration: 300, easing: "ease" };
}`,
    },
    noTheme: {
      title: "main.ts",
      lang: "ts",
      code: `// main.ts — no theme definition needed
import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";

// No \`themes\` → Theme Kit applies its built-in neutral theme.
// Pick the variant: "light" | "dark" (or omit → system preference).
bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ defaultTheme: "light" })],
});`,
    },
  },
  {
    slug: "web",
    name: "Web Components",
    icon: icons.web,
    pkg: "@theme-kit/web",
    tagline:
      "Framework-free theming for any HTML page — no build step required.",
    mark: "W",
    tags: ["No build", "Custom elements"],
    groups: [
      {
        label: "Setup",
        features: [
          {
            name: "defineCustomElements()",
            desc: "Registers every `<theme-kit-*>` custom element.",
          },
        ],
      },
      {
        label: "Elements",
        features: [
          {
            name: "<theme-kit-provider>",
            desc: "Root runtime provider for a page or subtree.",
          },
          {
            name: "<theme-kit-scope>",
            desc: "Scoped theming via the `theme` attribute.",
          },
          {
            name: "<theme-kit-toggle>",
            desc: "Light/dark toggle button.",
          },
          {
            name: "<theme-kit-select>",
            desc: "Family / mode selector.",
          },
        ],
      },
      {
        label: "Adapters",
        features: [
          {
            name: "Framework-neutral adapter factories",
            desc: "Use Theme Kit adapter factories directly with the web runtime; no React, Vue, Svelte, Solid, or Angular layer is required.",
          },
          {
            name: "CSS-variable ecosystem",
            desc: "CSS-variable adapters update the document's variables/styles from the active runtime theme, making them suitable for framework-free pages and custom elements.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition attribute",
            desc: "Set `transition` attribute on `<theme-kit-provider>` to enable CSS transitions.",
          },
          {
            name: "getProviderRuntime()",
            desc: "Imperative access to the nearest provider's runtime, including transition config.",
          },
        ],
      },
      {
        label: "Imperative",
        features: [
          {
            name: "getProviderRuntime()",
            desc: "Imperative access to the nearest provider's runtime.",
          },
        ],
      },
    ],
    quickStart: {
      title: "index.html",
      lang: "html",
      code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<theme-kit-provider default-theme="light">
  <my-app></my-app>
</theme-kit-provider>`,
    },
    snippet: {
      title: "index.html",
      lang: "html",
      code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<theme-kit-provider>
  <theme-kit-toggle></theme-kit-toggle>
  <theme-kit-select></theme-kit-select>
</theme-kit-provider>`,
    },
    snippet2: {
      title: "scope + selects",
      lang: "html",
      code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<theme-kit-provider default-theme="light">
  <theme-kit-select type="mode"></theme-kit-select>
  <theme-kit-select type="family"></theme-kit-select>

  <theme-kit-scope theme="plum">
    <p>This region is always themed "plum".</p>
  </theme-kit-scope>
</theme-kit-provider>`,
    },
    noTheme: {
      title: "index.html",
      lang: "html",
      code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<!-- No \`themes\` attribute → built-in neutral theme.
     Pick the variant: default-theme="light" | "dark" (or omit → system). -->
<theme-kit-provider default-theme="light">
  <my-app></my-app>
</theme-kit-provider>`,
    },
  },
  {
    slug: "tailwind",
    name: "Tailwind CSS v4",
    icon: icons.tailwind,
    pkg: "@theme-kit/tailwind",
    tagline:
      "Map every semantic token to Tailwind v4 utilities and theme variables.",
    mark: "TW",
    tags: ["CSS", "Design tokens", "v4"],
    groups: [
      {
        label: "Integration",
        features: [
          {
            name: '@import "@theme-kit/tailwind"',
            desc: "One import maps tokens to `@theme` variables: `--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`.",
          },
          {
            name: "Dark-mode variant",
            desc: "`@custom-variant dark (&:where(.dark, .dark *))` — scoped to the `.dark` class Theme Kit maintains.",
          },
          {
            name: "synchronizeDarkClass(theme)",
            desc: "Keeps the `.dark` class in sync with the active theme.",
          },
          {
            name: "CSS layers",
            desc: "Ships `theme.css`, `dark.css` and `preflight.css` layers.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "CSS transition variables",
            desc: "Theme Kit exposes transition variables for Tailwind-aware styling, while the runtime owns the actual theme-change orchestration; you do not need to hand-author a global transition block just to get smooth theme changes.",
          },
          {
            name: "themeCSS",
            desc: "Tailwind-compatible `@theme` variable block generated from your Theme Kit tokens, imported via the package's CSS entry.",
          },
        ],
      },
    ],
    quickStart: {
      title: "globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

body {
  @apply bg-background text-foreground;
}`,
    },
    snippet: {
      title: "globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

body {
  @apply bg-background text-foreground;
}

.card {
  @apply bg-card text-card-foreground border-border;
}

.btn-primary {
  @apply bg-primary text-primary-foreground;
}`,
    },
    snippet2: {
      title: "semantic utilities",
      lang: "html",
      code: `<header class="bg-surface text-foreground dark:bg-surface-muted">
  <button class="bg-primary text-primary-foreground rounded-lg px-4 py-2">
    Get started
  </button>
  <span class="text-muted-foreground">Ready</span>
</header>`,
    },
    noTheme: {
      title: "globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

/* No custom themes? The built-in neutral light/dark set
   maps straight to utilities — bg-background, text-foreground,
   bg-primary, text-primary-foreground and the rest. */
body {
  @apply bg-background text-foreground;
}`,
    },
  },
  {
    slug: "astro",
    name: "Astro",
    icon: icons.astro,
    pkg: "@theme-kit/astro",
    tagline:
      "Islands-friendly theming with a shared global runtime, zero-flash bootstrap, and the same framework-neutral adapter boundary.",
    mark: "As",
    tags: ["Islands", "Zero-flash"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProviderClient",
            desc: "Client island provider that wires the runtime.",
          },
          {
            name: "Full hook set + ThemeScope",
            desc: "`useTheme`, history, batch, snapshot, lifecycle, packs, and scoped subtrees.",
          },
        ],
      },
      {
        label: "Bootstrap & Sync",
        features: [
          {
            name: "createBlockingScript / buildThemeCssMap / darkModeCSSTemplate",
            desc: "Zero-flash bootstrap utilities for server-rendered islands.",
          },
          {
            name: "createAstroThemePersistence()",
            desc: "Astro-flavored persistence adapter.",
          },
          {
            name: "computeFingerprint()",
            desc: "Cookie/config fingerprinting for stale-state detection.",
          },
          {
            name: "getGlobalRuntime() / setGlobalRuntime()",
            desc: "Share one runtime across all islands on the page.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProviderClient to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Runtime toggle — no mutation hook exists. The transition prop is fixed at runtime creation; for a one-off instant switch, getGlobalRuntime() then runtime.store.set(theme, { suppressTransition: true }) applies immediately without animating. For full control, compose createTransitionPlan + runThemeAnimation from @theme-kit/core.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/pages/index.astro",
      lang: "astro",
      code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
import ThemeSwitcher from "../components/ThemeSwitcher.astro";
import { themes } from "./themes";
---

<html>
  <head>
    <title>My site</title>
  </head>
  <body>
    <ThemeProviderClient themes={themes} defaultTheme="mint-light" />
    <ThemeSwitcher client:load />
  </body>
</html>`,
    },
    snippet: {
      title: "src/pages/index.astro",
      lang: "astro",
      code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
import ThemeSwitcher from "../components/ThemeSwitcher.astro";
---

<ThemeProviderClient themes={themes} />

<ThemeSwitcher client:load />`,
    },
    snippet2: {
      title: "theme-switcher.astro",
      lang: "astro",
      code: `---
// A client island consuming the shared global runtime
---
<button id="theme-switcher">Toggle</button>

<script>
  import { useTheme, getGlobalRuntime } from "@theme-kit/astro";

  // Runs after ThemeProviderClient hydrated the shared runtime
  const { toggleTheme } = useTheme();
  document
    .getElementById("theme-switcher")
    ?.addEventListener("click", toggleTheme);

  const runtime = getGlobalRuntime(); // same instance across islands
</script>`,
    },
    noTheme: {
      title: "src/pages/index.astro",
      lang: "astro",
      code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
---

<!-- No \`themes\` prop → built-in neutral theme.
     Pick the variant: defaultTheme="light" | "dark" (or omit → system). -->
<ThemeProviderClient defaultTheme="light" />
`,
    },
  },
  {
    slug: "nuxt",
    name: "Nuxt 3",
    icon: icons.nuxt,
    pkg: "@theme-kit/nuxt",
    tagline:
      "Nuxt 3 module with SSR-first theming, zero-flash bootstrap, cookie sync, config-driven transitions, custom scrollbar, and auto-imported composables.",
    mark: "Nu",
    tags: ["Module", "SSR", "Zero-flash", "Auto-import"],
    groups: [
      {
        label: "Server",
        features: [
          {
            name: "SSR-first theme resolution",
            desc: "Reads `theme-name`, `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration.",
          },
          {
            name: "Blocking bootstrap script",
            desc: "Emits a blocking script in `<head>` that applies the persisted theme before first paint.",
          },
          {
            name: "Dark-mode CSS fallback",
            desc: "Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`.",
          },
          {
            name: "Cookie + localStorage sync",
            desc: "The client mirrors selection back to cookies so the server renders the right theme on the next request — same contract as `@theme-kit/next`.",
          },
        ],
      },
      {
        label: "Client",
        features: [
          {
            name: "Runtime plugin",
            desc: "A Nuxt plugin installs one app-wide runtime, provided to `useTheme()`, `useThemeRuntime()` and every auto-imported composable.",
          },
          {
            name: "Auto-imports",
            desc: "Composables (`useTheme`, `useThemeMode`, `useThemeFamily`, `useThemeHistory`, …) and components (`ThemeScope`, `ThemeScrollbar`) are registered automatically — no manual imports.",
          },
          {
            name: 'configKey: "themeKit"',
            desc: "Configure `themes`, `defaultTheme`, `initialMode`, `initialFamily`, `transition`, `scrollbar`, `storageKey` and `scheduled` in `nuxt.config.ts`.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Auto-imported composable exposing the sunrise/sunset schedule: reactive `state` (`enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus `enable()`/`disable()`/`set()`. Configure via `scheduled` in the module config.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition in nuxt.config.ts",
            desc: "Configure `transition` in the `themeKit` config object to enable CSS transitions on theme changes. Duration/easing are set once; Theme Kit generates the transition styles at runtime.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation. For custom animation orchestration, compose the core diff/plan/runner APIs.",
          },
        ],
      },
      {
        label: "Scrollbar",
        features: [
          {
            name: "scrollbar: true",
            desc: "Enables Theme Kit's custom overlay scrollbar. The SSR bootstrap hides the native scrollbar before first paint, then the overlay engine synchronizes with browser scrolling without replacing native scroll behavior.",
          },
          {
            name: "scrollbar option",
            desc: "Configure the overlay appearance (thickness, radius, colors, auto-hide, …) from the `themeKit` config; the overlay stays theme-aware and updates with runtime theme changes.",
          },
        ],
      },
    ],
    quickStart: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `import { themes } from "./themes";

export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
    transition: { duration: 360, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    scrollbar: true,
  },
});`,
    },
    snippet: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
  },
});`,
    },
    snippet2: {
      title: "config + components",
      lang: "vue",
      code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
    initialFamily: "mint",
    transition: { duration: 300, easing: "ease" },
    scrollbar: true,
  },
});

// components/ThemeSwitcher.vue
<script setup>
// useTheme, useThemeRuntime, ThemeScope and ThemeScrollbar
// are auto-imported by the module — no imports needed.
const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">Toggle</button>
  <button @click="setFamily('forest')">Forest</button>

  <ThemeScope theme="forest-light">
    <p>Scoped to forest-light</p>
  </ThemeScope>

  <ThemeScrollbar auto-hide />
</template>`,
    },
    noTheme: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `// nuxt.config.ts — no \`themes\` → built-in neutral theme.
// Pick the variant: defaultTheme: "light" | "dark" (or omit → system).
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    defaultTheme: "light",
  },
});`,
    },
  },
  {
    slug: "remix",
    name: "Remix",
    icon: icons.remix,
    pkg: "@theme-kit/remix",
    tagline:
      "Loader-based SSR theming with a blocking bootstrap and the same React/runtime adapter contract as the core React integration.",
    mark: "Re",
    tags: ["SSR", "Loaders"],
    groups: [
      {
        label: "Server",
        features: [
          {
            name: "Loader / server-side theming",
            desc: "Resolve the theme from cookies in a loader and render it before hydration.",
          },
          {
            name: "blocking-script.tsx",
            desc: "Blocking script that applies the persisted theme before first paint.",
          },
          {
            name: "createRemixThemePersistence()",
            desc: "Remix-flavored persistence adapter with cookie mirroring.",
          },
          {
            name: "computeFingerprint()",
            desc: "Fingerprint the theme config to reject stale cookies.",
          },
        ],
      },
      {
        label: "Client",
        features: [
          {
            name: "ThemeProvider",
            desc: "Client provider consuming the loader-resolved selection.",
          },
          {
            name: "Full hook set + ThemeScope",
            desc: "Every React hook plus scoped subtrees.",
          },
          {
            name: "Server entry helpers",
            desc: "Utilities under `@theme-kit/remix/server` for SSR wiring.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation. For custom animation orchestration, compose the core diff/plan/runner APIs.",
          },
        ],
      },
    ],
    quickStart: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `import { ThemeProvider } from "@theme-kit/remix";
import { themes } from "./themes";

export default function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="mint-light">
      <Outlet />
    </ThemeProvider>
  );
}`,
    },
    snippet: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `import { ThemeProvider } from "@theme-kit/remix";

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}`,
    },
    snippet2: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `// app/root.tsx
import { useLoaderData } from "@remix-run/react";
import { ThemeProvider, ThemeHead } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

export async function loader({ request }: LoaderFunctionArgs) {
  return { initial: await getInitialThemeState(request, { themes }) };
}

export default function App() {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <ThemeHead themes={themes} />
      </head>
      <body>
        <ThemeProvider initial={initial}>
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  );
}`,
    },
    noTheme: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `// app/root.tsx — no theme definition needed
import { ThemeProvider } from "@theme-kit/remix";

export default function App() {
  // No \`themes\` prop → Theme Kit applies its built-in neutral theme.
  // Pick the variant: "light" | "dark" (or omit → system preference).
  return (
    <ThemeProvider defaultTheme="light">
      <Outlet />
    </ThemeProvider>
  );
}`,
    },
  },
];

export const frameworks: FrameworkItem[] = rawFrameworks.map((f) => ({
  ...f,
  featureCount: f.groups.reduce((sum, g) => sum + g.features.length, 0),
}));
