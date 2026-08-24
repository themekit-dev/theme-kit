import { type ReactElement } from "react";
import { Icon } from "@iconify/react";
import { highlightCode } from "./highlight";

const icons = {
  core: <Icon icon="ph:hexagon-fill" width={24} height={24} />,
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
  cli: <Icon icon="ph:terminal-fill" width={24} height={24} />,
  devtools: <Icon icon="ph:bug-fill" width={24} height={24} />,
};

export type PackageFeature = { name: string; desc: string };
export type PackageGroup = { label: string; features: PackageFeature[] };
export type PackageSnippet = { title: string; lang: string; code: string };

export type PackageItem = {
  slug: string;
  name: string;
  icon: ReactElement;
  pkg: string;
  tagline: string;
  tags: string[];
  groups: PackageGroup[];
  snippet: PackageSnippet;
  snippet2?: PackageSnippet;
  featureCount: number;
  html: string;
  html2?: string;
};

type RawPackage = Omit<PackageItem, "html" | "html2" | "featureCount">;

export const rawPackages: RawPackage[] = [
  {
    slug: "core",
    name: "Core",
    icon: icons.core,
    pkg: "@theme-kit/core",
    tagline:
      "The framework-agnostic heart of Theme Kit: store, model, registry, runtime, adapters, generation, validation and more.",
    tags: ["Vanilla JS", "Runtime", "SSR-safe"],
    groups: [
      {
        label: "Store & Model",
        features: [
          { name: "createThemeStore", desc: "Minimal reactive store — get / set / subscribe / batch / destroy." },
          { name: "defineTheme", desc: "Type-safe, zero-cost theme definition helper." },
          { name: "extendTheme / composeTheme", desc: "Inherit from a base theme and override, or merge multiple definitions." },
          { name: "mergeThemeDefinitions / mergeTokens", desc: "Low-level merge utilities." },
          { name: "resolveTheme", desc: "Resolve a theme definition, following `extends` chains." },
        ],
      },
      {
        label: "Registry",
        features: [
          { name: "createThemeRegistry", desc: "Registry of every registered theme." },
          { name: "register / registerMany / unregister / replace", desc: "Manage registered themes at runtime." },
          { name: "getFamilies / getThemesByFamily", desc: "Query themes by family." },
        ],
      },
      {
        label: "Runtime",
        features: [
          { name: "createThemeRuntime", desc: "Wires store, registry, selection, persistence, broadcast, DOM bindings, history, lifecycle and plugins." },
          { name: "runtime.update(tokens)", desc: "Live theme editing — merge partial tokens into the active theme." },
          { name: "runtime.use(pack)", desc: "Install a theme pack at runtime." },
          { name: "runtime.history", desc: "Undo / redo / jump through full theme snapshots." },
          { name: "runtime.snapshot / restore", desc: "Serialize and restore full runtime state." },
          { name: "runtime.lifecycle", desc: "Typed event bus for theme changes." },
        ],
      },
      {
        label: "Tooling",
        features: [
          { name: "generateTheme", desc: "Generate a complete light + dark pair from a seed color." },
          { name: "validateTheme", desc: "Validate required semantic color tokens." },
          { name: "migrateTheme / registerMigration", desc: "Version themes with a migration chain." },
          { name: "getBuiltInThemes", desc: "Neutral, preset, brand and accessibility themes." },
          { name: "flattenTokens / resolveTokens", desc: "Token resolution with references, expressions and derived colors." },
          { name: "getContrastRatio / simulateCVD", desc: "Accessibility toolkit — WCAG contrast and color-vision-deficiency simulation." },
        ],
      },
    ],
    snippet: {
      title: "vanilla.ts",
      lang: "ts",
      code: `import { ThemeKit } from "@theme-kit/core/vanilla";

const kit = new ThemeKit();
kit.setMode("dark");
kit.setFamily("plum");
kit.toggleTheme();
kit.update({ colors: { primary: "#07f" } });
kit.use({ name: "brand", themes: customThemes });
kit.toCSSVariables();
kit.on("themeChange", (theme) => console.log(theme.name));
kit.destroy();`,
    },
    snippet2: {
      title: "generate.ts",
      lang: "ts",
      code: `import { generateTheme } from "@theme-kit/core";

const { light, dark } = generateTheme({ seed: "#6366f1", family: "indigo" });

// Validate a full theme against required tokens
const result = validateTheme(dark, { themes: [light, dark] });
// { valid: boolean, issues: [{ type, path, message }] }`,
    },
  },
  {
    slug: "react",
    name: "React",
    icon: icons.react,
    pkg: "@theme-kit/react",
    tagline:
      "Provider + hooks for React 18/19. The reference integration, and the base that Next.js and Remix re-export.",
    tags: ["SPA", "Vite", "Context"],
    groups: [
      {
        label: "Provider",
        features: [
          { name: "ThemeProvider", desc: "Creates a runtime, wires DOM + CSS-variable bindings, and provides it via context." },
          { name: "Runtime injection", desc: "Pass `runtime` to share an instance, or `initial` to seed the server-resolved selection." },
        ],
      },
      {
        label: "Hooks",
        features: [
          { name: "useTheme()", desc: "`{ theme, mode, family, setMode, setFamily, toggleTheme }`." },
          { name: "useThemeValue / useThemeTokens", desc: "The active theme definition / its tokens." },
          { name: "useThemeMode / useThemeFamily", desc: "Current mode and family." },
          { name: "useThemeHistory / useThemeTimeTravel", desc: "Undo / redo and time-travel through history." },
          { name: "useThemeRuntime", desc: "The full runtime instance." },
        ],
      },
      {
        label: "Components",
        features: [
          { name: "ThemeScope", desc: "Apply a theme to a subtree with scoped CSS variables." },
          { name: "ThemeModeButton", desc: "Cycles light → dark → system." },
          { name: "ThemeInspector", desc: "Floating dev panel showing the active theme and tokens." },
          { name: "useScopedTheme", desc: "Imperative scoping for any element." },
        ],
      },
    ],
    snippet: {
      title: "App.tsx",
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
      title: "Scoped.tsx",
      lang: "tsx",
      code: `import { ThemeScope, type ThemeTransitionOptions } from "@theme-kit/react";

const scopeTransition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

// Apply a specific theme to just this subtree
<ThemeScope theme="forest" transition={scopeTransition}>
  <Card />
</ThemeScope>`,
    },
  },
  {
    slug: "next",
    name: "Next.js",
    icon: icons.next,
    pkg: "@theme-kit/next",
    tagline:
      "App Router integration: SSR-safe hydration, cookie persistence and zero flash of incorrect theme.",
    tags: ["App Router", "RSC", "Zero-flash"],
    groups: [
      {
        label: "Server",
        features: [
          { name: "ThemeProvider (RSC)", desc: "Reads cookies, validates the fingerprint, resolves the initial theme and renders `<html data-theme>` with a blocking bootstrap script." },
          { name: "HTML passthrough", desc: "Accepts every native `<html>` attribute — className, style, dir, data-* — plus `body` for the `<body>` element." },
          { name: "SSR Persistence", desc: "`createNextThemePersistence(themes, defaultTheme)` mirrors selection to cookies." },
        ],
      },
      {
        label: "Client",
        features: [
          { name: "ClientThemeProvider", desc: "Cookie + localStorage persistence, fingerprint, `.dark` class sync." },
          { name: "@theme-kit/next/client", desc: "Re-exports every React hook plus ThemeScope, ThemeInspector, ThemeModeButton." },
          { name: "ThemeBootstrap", desc: "Injects SSR dark-mode CSS via useServerInsertedHTML." },
        ],
      },
    ],
    snippet: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="light"
      className="antialiased"
      body={{ className: "font-sans" }}
    >
      {children}
    </ThemeProvider>
  );
}`,
    },
    snippet2: {
      title: "ThemeSwitcher.tsx",
      lang: "tsx",
      code: `// components/ThemeSwitcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  return (
    <div>
      <span>{theme.name} | {mode}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setMode("light")}>Light</button>
      <button onClick={() => setMode("dark")}>Dark</button>
      <button onClick={() => setMode("system")}>System</button>
    </div>
  );
}`,
    },
  },
  {
    slug: "vue",
    name: "Vue 3",
    icon: icons.vue,
    pkg: "@theme-kit/vue",
    tagline: "Vue 3 provider, composables and scopes over the shared runtime.",
    tags: ["Vue 3", "Composables"],
    groups: [
      {
        label: "Provider",
        features: [
          { name: "ThemeProvider", desc: "Component with all runtime options; auto-registered via app.use (`.install`)." },
          { name: "provideThemeRuntime / useThemeRuntime", desc: "Provide / inject API." },
        ],
      },
      {
        label: "Composables",
        features: [
          { name: "useTheme", desc: "`{ theme, mode, family, setMode, setFamily, toggleTheme }` as refs." },
          { name: "useThemeHistory / useThemeBatch", desc: "History and atomic batching." },
          { name: "useThemeSnapshot / useThemeRestore", desc: "Serialize / restore state." },
          { name: "useThemeLifecycle / useThemePacks", desc: "Events and runtime theme packs." },
        ],
      },
      {
        label: "Components",
        features: [{ name: "ThemeScope", desc: "Scoped theming component." }],
      },
    ],
    snippet: {
      title: "main.ts",
      lang: "ts",
      code: `import { createApp } from "vue";
import { ThemeProvider } from "@theme-kit/vue";

const app = createApp(App);
app.use(ThemeProvider, {
  themes,
  defaultTheme: "light",
  transition: { enabled: true },
});
app.mount("#app");`,
    },
    snippet2: {
      title: "App.vue",
      lang: "vue",
      code: `<script setup lang="ts">
import { useTheme } from "@theme-kit/vue";

const { theme, mode, setMode, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">
    {{ theme.name }} · {{ mode }}
  </button>
</template>`,
    },
  },
  {
    slug: "svelte",
    name: "Svelte 5",
    icon: icons.svelte,
    pkg: "@theme-kit/svelte",
    tagline: "Svelte 5 provider, context stores and runes-based reactivity.",
    tags: ["Svelte 5", "Stores"],
    groups: [
      {
        label: "Provider",
        features: [
          { name: "ThemeProvider", desc: "Context-based provider with DOM / CSS bindings." },
          { name: "getThemeRuntime / setThemeRuntime", desc: "Context helpers." },
        ],
      },
      {
        label: "Stores",
        features: [
          { name: "useTheme", desc: "Reactive readable stores for theme, mode and family." },
          { name: "useThemeHistory / useThemeBatch", desc: "History and batching." },
          { name: "useThemeSnapshot / useThemeRestore", desc: "Serialize / restore." },
          { name: "useThemeLifecycle / useThemePacks", desc: "Events and packs." },
        ],
      },
      {
        label: "Components",
        features: [{ name: "ThemeScope", desc: "Scoped theming." }],
      },
    ],
    snippet: {
      title: "app.svelte",
      lang: "svelte",
      code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
</script>

<ThemeProvider {themes} defaultTheme="light">
  <App />
</ThemeProvider>`,
    },
  },
  {
    slug: "solid",
    name: "Solid",
    icon: icons.solid,
    pkg: "@theme-kit/solid",
    tagline: "Solid provider, signals and scopes with fine-grained reactivity.",
    tags: ["Solid", "Signals"],
    groups: [
      {
        label: "Provider",
        features: [
          { name: "ThemeProvider", desc: "Context provider with bindings." },
          { name: "useTheme", desc: "Signals for theme, mode and family with getters." },
        ],
      },
      {
        label: "Hooks",
        features: [
          { name: "useThemeHistory / useThemeBatch", desc: "History and batching." },
          { name: "useThemeSnapshot / useThemeRestore", desc: "Serialize / restore." },
          { name: "useThemeLifecycle / useThemePacks", desc: "Events and packs." },
        ],
      },
      {
        label: "Components",
        features: [{ name: "ThemeScope", desc: "Scoped theming." }],
      },
    ],
    snippet: {
      title: "App.tsx",
      lang: "tsx",
      code: `import { ThemeProvider, useTheme } from "@theme-kit/solid";

function App() {
  return (
    <ThemeProvider themes={themes}>
      <Switcher />
    </ThemeProvider>
  );
}

function Switcher() {
  const theme = useTheme();
  return (
    <button onClick={() => theme.toggleTheme()}>
      {theme.theme().name} · {theme.mode()}
    </button>
  );
}`,
    },
  },
  {
    slug: "angular",
    name: "Angular",
    icon: icons.angular,
    pkg: "@theme-kit/angular",
    tagline: "Angular providers, injectables and an element-scoped directive.",
    tags: ["Angular", "DI"],
    groups: [
      {
        label: "Providers",
        features: [
          { name: "provideThemeKit(options)", desc: "App provider that wires the runtime." },
          { name: "provideThemeKitRuntime(runtime)", desc: "Share an existing runtime." },
        ],
      },
      {
        label: "Injectables",
        features: [
          { name: "injectThemeRuntime()", desc: "Runtime injector." },
          { name: "injectTheme()", desc: "Reactive ThemeState — theme, mode, family + setters." },
          { name: "injectThemeHistory / injectThemeBatch", desc: "History and batching." },
          { name: "injectThemeSnapshot / injectThemeRestore", desc: "Serialize / restore." },
        ],
      },
      {
        label: "Directives",
        features: [{ name: "ThemeScopeDirective", desc: "Element-scoped theming." }],
      },
    ],
    snippet: {
      title: "app.config.ts",
      lang: "ts",
      code: `import { provideThemeKit } from "@theme-kit/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideThemeKit({
      themes,
      defaultTheme: "light",
    }),
  ],
};`,
    },
    snippet2: {
      title: "app.ts",
      lang: "ts",
      code: `import { injectTheme } from "@theme-kit/angular";

@Component({ ... })
export class AppComponent {
  private theme = injectTheme();

  toggle() {
    this.theme().toggleTheme();
  }
}`,
    },
  },
  {
    slug: "web",
    name: "Web Components",
    icon: icons.web,
    pkg: "@theme-kit/web",
    tagline: "Framework-free theming for any HTML page via custom elements.",
    tags: ["Custom Elements", "No framework"],
    groups: [
      {
        label: "Elements",
        features: [
          { name: "<theme-kit-provider>", desc: "Root runtime provider." },
          { name: "<theme-kit-scope theme>", desc: "Scoped theming." },
          { name: "<theme-kit-toggle>", desc: "Light / dark toggle button." },
          { name: "<theme-kit-select>", desc: "Family / mode selector." },
          { name: "getProviderRuntime()", desc: "Imperative access to the runtime." },
        ],
      },
    ],
    snippet: {
      title: "index.html",
      lang: "html",
      code: `import { defineCustomElements } from "@theme-kit/web";
defineCustomElements();

<theme-kit-provider themes="...">
  <theme-kit-toggle></theme-kit-toggle>
  <theme-kit-select></theme-kit-select>
</theme-kit-provider>`,
    },
  },
  {
    slug: "tailwind",
    name: "Tailwind CSS",
    icon: icons.tailwind,
    pkg: "@theme-kit/tailwind",
    tagline: "Tailwind CSS v4 mappings from theme tokens to utility variables.",
    tags: ["Tailwind v4", "Tokens"],
    groups: [
      {
        label: "CSS",
        features: [
          { name: "@theme mapping", desc: "Maps tokens to --color-*, --radius-*, --spacing-*, --font-*, --shadow-*." },
          { name: "Dark variant", desc: "@custom-variant dark (&:where(.dark, .dark *))." },
          { name: "Layers", desc: "theme.css / dark.css / preflight.css." },
        ],
      },
      {
        label: "Helpers",
        features: [{ name: "synchronizeDarkClass(theme)", desc: "Keeps the .dark class in sync." }],
      },
    ],
    snippet: {
      title: "globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";`,
    },
  },
  {
    slug: "astro",
    name: "Astro",
    icon: icons.astro,
    pkg: "@theme-kit/astro",
    tagline: "Astro islands integration with a zero-flash blocking script.",
    tags: ["Islands", "Zero-flash"],
    groups: [
      {
        label: "Components",
        features: [
          { name: "ThemeProviderClient", desc: "Client island provider." },
          { name: "ThemeScope", desc: "Scoped theming." },
        ],
      },
      {
        label: "Server helpers",
        features: [
          { name: "createBlockingScript / buildThemeCssMap / darkModeCSSTemplate", desc: "Zero-flash bootstrap." },
          { name: "computeFingerprint", desc: "Cookie / config fingerprinting." },
          { name: "getGlobalRuntime / setGlobalRuntime", desc: "Shared runtime across islands." },
        ],
      },
    ],
    snippet: {
      title: "index.astro",
      lang: "astro",
      code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
---

<ThemeProviderClient themes={themes} defaultTheme="light">
  <Switcher client:load />
</ThemeProviderClient>`,
    },
  },
  {
    slug: "nuxt",
    name: "Nuxt",
    icon: icons.nuxt,
    pkg: "@theme-kit/nuxt",
    tagline:
      "Nuxt 3 module: SSR-first theming, zero-flash bootstrap, cookie + localStorage sync, config-driven transitions and scrollbar.",
    tags: ["Nuxt 3", "Module", "SSR", "Zero-flash"],
    groups: [
      {
        label: "Server",
        features: [
          { name: "SSR-first resolution", desc: "Reads `theme-name`, `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint and resolves the initial theme before hydration." },
          { name: "Themed <html> + bootstrap", desc: "Renders `<html data-theme>` with inline CSS variables and a blocking bootstrap script in `<head>` for zero flash." },
          { name: "Dark-mode CSS fallback", desc: "Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`." },
        ],
      },
      {
        label: "Client",
        features: [
          { name: "Runtime plugin", desc: "One app-wide runtime installed by the module and provided to every auto-imported composable." },
          { name: "Cookie + localStorage sync", desc: "Selection mirrors to cookies so the server renders the right theme on the next request." },
          { name: "ThemeScope / ThemeScrollbar", desc: "Scoped subtrees and the theme-aware overlay scrollbar, registered automatically." },
        ],
      },
    ],
    snippet: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `// nuxt.config.ts
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
    snippet2: {
      title: "ThemeSwitcher.vue",
      lang: "vue",
      code: `<script setup>
// useTheme, useThemeMode, useThemeFamily are auto-imported by the module
const { theme, mode, setMode, toggleTheme } = useTheme();
</script>

<template>
  <div>
    <span>{{ theme.name }} | {{ mode }}</span>
    <button @click="toggleTheme">Toggle</button>
    <button @click="setMode('light')">Light</button>
    <button @click="setMode('dark')">Dark</button>
    <button @click="setMode('system')">System</button>
  </div>
</template>`,
    },
  },
  {
    slug: "remix",
    name: "Remix",
    icon: icons.remix,
    pkg: "@theme-kit/remix",
    tagline: "Remix loader-based SSR theming with a blocking head script.",
    tags: ["Remix", "SSR"],
    groups: [
      {
        label: "Server",
        features: [
          { name: "Loader theming", desc: "getInitialThemeState from the request." },
          { name: "Blocking script", desc: "blocking-script.tsx applies the theme before paint." },
          { name: "createRemixThemePersistence / computeFingerprint", desc: "Persistence and fingerprinting." },
        ],
      },
      {
        label: "Client",
        features: [
          { name: "ThemeProvider", desc: "Full hook set + ThemeScope." },
        ],
      },
    ],
    snippet: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `// app/root.tsx
import { useLoaderData } from "@remix-run/react";
import { ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

export async function loader({ request }) {
  return { initial: await getInitialThemeState(request, { themes }) };
}

export default function App() {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <ThemeProvider initial={initial}>
      <Outlet />
    </ThemeProvider>
  );
}`,
    },
  },
  {
    slug: "cli",
    name: "CLI",
    icon: icons.cli,
    pkg: "@theme-kit/cli",
    tagline: "Generate, validate, migrate, inspect and export themes from the command line.",
    tags: ["CLI", "Tooling"],
    groups: [
      {
        label: "Commands",
        features: [
          { name: "generate", desc: "Generate a theme from a seed color (--seed, --family, --output)." },
          { name: "validate", desc: "Validate a theme JSON file." },
          { name: "migrate", desc: "Migrate a theme to the latest format." },
          { name: "inspect", desc: "Inspect a theme's details." },
          { name: "export", desc: "Export a theme to CSS or JSON." },
        ],
      },
    ],
    snippet: {
      title: "terminal",
      lang: "bash",
      code: `theme-kit generate --seed "#6366f1" --family indigo --output theme.json
theme-kit validate theme.json
theme-kit export theme.json --format css`,
    },
  },
  {
    slug: "devtools",
    name: "DevTools",
    icon: icons.devtools,
    pkg: "@theme-kit/devtools",
    tagline: "Runtime inspector, plugin and panel for debugging theme changes.",
    tags: ["Inspector", "Debugging"],
    groups: [
      {
        label: "API",
        features: [
          { name: "createDevToolsPlugin(options)", desc: "Theme-kit plugin exposing an inspector." },
          { name: "createDevToolsInspector(options)", desc: "Records theme-change entries, lifecycle performance events and state snapshots." },
          { name: "createDevToolsPanel()", desc: "UI panel." },
          { name: "window.__THEME_KIT_DEVTOOLS__", desc: "Exposed inspectors for extension debugging." },
        ],
      },
    ],
    snippet: {
      title: "plugin.ts",
      lang: "ts",
      code: `import { createThemeRuntime } from "@theme-kit/core";
import { createDevToolsPlugin } from "@theme-kit/devtools";

const runtime = createThemeRuntime({
  themes,
  plugins: [createDevToolsPlugin()],
});`,
    },
  },
];

export const packages: PackageItem[] = rawPackages.map((f) => ({
  ...f,
  featureCount: f.groups.reduce((sum, g) => sum + g.features.length, 0),
  html: highlightCode(f.snippet.code, f.snippet.lang),
  ...(f.snippet2
    ? { html2: highlightCode(f.snippet2.code, f.snippet2.lang) }
    : {}),
}));
