export type UseCase = {
  title: string;
  desc: string;
  lang: string;
  code: string;
};

const react: UseCase[] = [
  {
    title: "Toggle light / dark",
    desc: "Read the active theme, mode and family and flip between them with zero config.",
    lang: "tsx",
    code: `import { useTheme } from "@theme-kit/react";

export function ThemeToggle() {
  const { theme, mode, setMode, setFamily, toggleTheme } = useTheme();
  return (
    <div className="row">
      <button onClick={toggleTheme}>{theme.name}</button>
      <button onClick={() => setMode("dark")}>Dark</button>
      <button onClick={() => setMode("light")}>Light</button>
      <select value={family} onChange={(e) => setFamily(e.target.value)}>
        {["neutral", "mint", "plum"].map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <span className="mono">{mode}</span>
    </div>
  );
}`,
  },
  {
    title: "Undo / redo + live token editing",
    desc: "Theme changes are snapshotted automatically. Undo, redo, or patch tokens at runtime.",
    lang: "tsx",
    code: `import { useThemeHistory, useThemeRuntime } from "@theme-kit/react";

export function ThemeControls() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  const runtime = useThemeRuntime();

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <button
        onClick={() => runtime.update({ colors: { primary: "#6366f1" } })}
      >
        Make primary indigo
      </button>
    </div>
  );
}`,
  },
  {
    title: "Scope a subtree",
    desc: "Apply a specific theme to a section of the tree with scoped CSS variables.",
    lang: "tsx",
    code: `import { ThemeScope, useScopedTheme, useRef, type ThemeTransitionOptions } from "@theme-kit/react";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function Dashboard() {
  return (
    <>
      <Sidebar /> {/* inherits the global theme */}
      <ThemeScope theme="forest" transition={transition}>
        <DataViz /> {/* always themed "forest" */}
      </ThemeScope>
    </>
  );
}

export function ScopedCard() {
  const ref = useRef<HTMLDivElement>(null);
  useScopedTheme(ref, "forest");
  return <div ref={ref}>Imperatively scoped</div>;
}`,
  },
  {
    title: "Lifecycle events + theme packs",
    desc: "React to every theme change, and install a ready-made pack (e.g. a11y profiles) at runtime.",
    lang: "tsx",
    code: `import { useEffect } from "react";
import { useThemeLifecycle, useThemePacks } from "@theme-kit/react";

export function Telemetry() {
  const { on } = useThemeLifecycle();
  const usePack = useThemePacks();

  useEffect(() => {
    const off = on("beforeThemeChange", (e) => {
      console.log("theme changed to", e.next.name);
    });
    return off;
  }, [on]);

  return (
    <button onClick={() => usePack({ name: "a11y", themes: highContrast })}
    >
      Apply High Contrast pack
    </button>
  );
}`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "tsx",
    code: `import { ThemeProvider } from "@theme-kit/react";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      transition={{
        enabled: true,
        duration: 300,
        easing: "ease-in-out",
        properties: [
          "color",
          "background-color",
          "border-color",
          "border-radius",
          "font-size",
          "box-shadow",
        ],
      }}
    >
      <ThemeSwitcher />
    </ThemeProvider>
  );
}`,
  },
];

const next: UseCase[] = [
  {
    title: "SSR provider with zero flash",
    desc: "The server component resolves the initial theme, renders CSS variables in the HTML, and blocks the flash.",
    lang: "tsx",
    code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="system"
      className="scroll-smooth"
      body={{ className: "font-sans" }}
    >
      {children}
    </ThemeProvider>
  );
}`,
  },
  {
    title: "Client-side switcher",
    desc: "Hooks live behind @theme-kit/next/client and update cookies + DOM together.",
    lang: "tsx",
    code: `// app/theme-switcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      {theme.name} · {mode}
    </button>
  );
}`,
  },
  {
    title: "Scoped theming in a client component",
    desc: "ThemeScope works in any client component, next to server-rendered content.",
    lang: "tsx",
    code: `// app/widgets.tsx
"use client";
import { ThemeScope, type ThemeTransitionOptions } from "@theme-kit/next/client";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function Widget() {
  return (
    <ThemeScope theme="forest" transition={transition}>
      <div className="rounded-xl p-4">Always forest here</div>
    </ThemeScope>
  );
}`,
  },
  {
    title: "Scheduled + multi-window sync",
    desc: "Every runtime capability is available to client components through hooks.",
    lang: "tsx",
    code: `// app/runtime-demo.tsx
"use client";
import { useEffect } from "react";
import { useThemeRuntime, useThemeLifecycle } from "@theme-kit/next/client";

export function RuntimeDemo() {
  const runtime = useThemeRuntime();
  const { on } = useThemeLifecycle();

  useEffect(() => {
    const off = on("beforeThemeChange", (e) => console.log(e.next.name));
    return off;
  }, [on]);

  return (
    <button onClick={() => runtime.update({ radius: { sm: 8, md: 12 } })}>
      Soften corners
    </button>
  );
}`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "tsx",
    code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="light"
      transition={{
        enabled: true,
        duration: 300,
        easing: "ease-in-out",
      }}
    >
      {children}
    </ThemeProvider>
  );
}`,
  },
];

const vue: UseCase[] = [
  {
    title: "Toggle light / dark",
    desc: "useTheme exposes refs and setters — reactive in templates and scripts.",
    lang: "vue",
    code: `<script setup>
import { useTheme } from "@theme-kit/vue";
const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
  <button @click="setMode('dark')">Dark</button>
  <select v-model="family" @change="setFamily(family)">
    <option value="neutral">Neutral</option>
    <option value="mint">Mint</option>
  </select>
</template>`,
  },
  {
    title: "Undo / redo theme changes",
    desc: "History state is reactive; use it to build undo/redo controls.",
    lang: "vue",
    code: `<script setup>
import { useThemeHistory, useThemeRuntime } from "@theme-kit/vue";
const { undo, redo, canUndo, canRedo } = useThemeHistory();
const runtime = useThemeRuntime();
</script>

<template>
  <button :disabled="!canUndo" @click="undo">Undo</button>
  <button :disabled="!canRedo" @click="redo">Redo</button>
  <button @click="runtime.update({ colors: { primary: '#6366f1' } })">
    Make primary indigo
  </button>
</template>`,
  },
  {
    title: "Scope a subtree",
    desc: "ThemeScope applies a theme to a slot with scoped CSS variables.",
    lang: "vue",
    code: `<script setup>
import { ThemeScope, type ThemeTransitionOptions } from "@theme-kit/vue";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };
</script>

<template>
  <Sidebar />
  <ThemeScope theme="forest" :transition="transition">
    <DataViz />
  </ThemeScope>
</template>`,
  },
  {
    title: "Lifecycle events",
    desc: "Subscribe to typed lifecycle events and react to changes.",
    lang: "vue",
    code: `<script setup>
import { onMounted } from "vue";
import { useThemeLifecycle, useThemePacks } from "@theme-kit/vue";

const { on } = useThemeLifecycle();
const usePack = useThemePacks();

onMounted(() => {
  on("beforeThemeChange", (e) => console.log("changed to", e.next.name));
});
</script>

<template>
  <button @click="usePack({ name: 'a11y', themes: highContrast })">
    Apply High Contrast pack
  </button>
</template>`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "vue",
    code: `<script setup>
import { ThemeProvider } from "@theme-kit/vue";
</script>

<template>
  <ThemeProvider
    :themes="themes"
    :transition="{ enabled: true, duration: 300, easing: 'ease-in-out' }"
  >
    <YourView />
  </ThemeProvider>
</template>`,
  },
];

const svelte: UseCase[] = [
  {
    title: "Toggle light / dark",
    desc: "useTheme returns readable stores — prefix with $ in Svelte.",
    lang: "svelte",
    code: `<script>
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, setMode, toggleTheme } = useTheme();
</script>

<button onclick={toggleTheme}>{$theme.name} · {$mode}</button>
<button onclick={() => setMode("dark")}>Dark</button>`,
  },
  {
    title: "Undo / redo theme changes",
    desc: "History stores are reactive, just like the theme state.",
    lang: "svelte",
    code: `<script>
  import { useThemeHistory, useThemeRuntime } from "@theme-kit/svelte";
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  const runtime = useThemeRuntime();
</script>

<button onclick={undo} disabled={!$canUndo}>Undo</button>
<button onclick={redo} disabled={!$canRedo}>Redo</button>
<button onclick={() => runtime.update({ colors: { primary: "#6366f1" } })}>
  Make primary indigo
</button>`,
  },
  {
    title: "Scope a subtree",
    desc: "ThemeScope themes a slot subtree in isolation.",
    lang: "svelte",
    code: `<ThemeScope theme="forest">
  <DataViz />
</ThemeScope>`,
  },
  {
    title: "Lifecycle events",
    desc: "Watch every theme change and install packs at runtime.",
    lang: "svelte",
    code: `<script>
  import { onMount } from "svelte";
  import { useThemeLifecycle, useThemePacks } from "@theme-kit/svelte";
  const { on } = useThemeLifecycle();
  const usePack = useThemePacks();
  onMount(() => on("beforeThemeChange", (e) => console.log(e.next.name)));
</script>

<button onclick={() => usePack({ name: "a11y", themes: highContrast })}>
  Apply High Contrast pack
</button>`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "svelte",
code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
</script>

<ThemeProvider
  themes={themes}
  transition={{ enabled: true, duration: 300, easing: "ease-in-out" }}
>
  {@render children()}
</ThemeProvider>`,
  },
];

const solid: UseCase[] = [
  {
    title: "Toggle light / dark",
    desc: "useTheme returns signals and getters for fine-grained reactivity.",
    lang: "tsx",
    code: `import { useTheme } from "@theme-kit/solid";

function ThemeToggle() {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  return (
    <div>
      <button onClick={() => toggleTheme()}>{theme().name}</button>
      <button onClick={() => setMode("dark")}>Dark</button>
      <span>{mode()}</span>
    </div>
  );
}`,
  },
  {
    title: "Undo / redo theme changes",
    desc: "History controls as signals, plus live runtime updates.",
    lang: "tsx",
    code: `import { useThemeHistory, useThemeRuntime } from "@theme-kit/solid";

function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  const runtime = useThemeRuntime();
  return (
    <div>
      <button onClick={() => undo()} disabled={!canUndo()}>Undo</button>
      <button onClick={() => redo()} disabled={!canRedo()}>Redo</button>
      <button onClick={() => runtime.update({ colors: { primary: "#6366f1" } })}>
        Make primary indigo
      </button>
    </div>
  );
}`,
  },
  {
    title: "Scope a subtree",
    desc: "ThemeScope themes a subtree with scoped CSS variables.",
    lang: "tsx",
    code: `import { ThemeScope } from "@theme-kit/solid";

function Dashboard() {
  return (
    <>
      <Sidebar />
      <ThemeScope theme="forest">
        <DataViz />
      </ThemeScope>
    </>
  );
}`,
  },
  {
    title: "Lifecycle events",
    desc: "Subscribe to lifecycle events and install theme packs.",
    lang: "tsx",
    code: `import { onMount } from "solid-js";
import { useThemeLifecycle, useThemePacks } from "@theme-kit/solid";

function Telemetry() {
  const { on } = useThemeLifecycle();
  const usePack = useThemePacks();
  onMount(() => on("beforeThemeChange", (e) => console.log(e.next.name)));
  return (
    <button onClick={() => usePack({ name: "a11y", themes: highContrast })}>
      Apply High Contrast pack
    </button>
  );
}`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "tsx",
    code: `import { ThemeProvider } from "@theme-kit/solid";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      transition={{ enabled: true, duration: 300, easing: "ease-in-out" }}
    >
      <YourApp />
    </ThemeProvider>
  );
}`,
  },
];

const angular: UseCase[] = [
  {
    title: "Provide the runtime",
    desc: "Wire Theme Kit once in your app config, then inject reactive state anywhere.",
    lang: "ts",
    code: `import { provideThemeKit } from "@theme-kit/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideThemeKit({ themes, defaultTheme: "light" }),
  ],
};`,
  },
  {
    title: "Toggle light / dark",
    desc: "injectTheme returns reactive ThemeState with setters.",
    lang: "ts",
    code: `import { Component, inject } from "@angular/core";
import { injectTheme } from "@theme-kit/angular";

@Component({ selector: "app-toggle", template: \`
  <button (click)="theme().toggleTheme()">
    {{ theme().theme.name }} · {{ theme().mode }}
  </button>
\` })
export class ThemeToggleComponent {
  readonly theme = injectTheme();
}`,
  },
  {
    title: "Undo / redo theme changes",
    desc: "Inject history controls and the runtime for live edits.",
    lang: "ts",
    code: `import { Component, inject } from "@angular/core";
import { injectThemeHistory, injectThemeRuntime } from "@theme-kit/angular";

@Component({ selector: "app-history", template: \`
  <button (click)="history.undo()" [disabled]="!history.history().canUndo">Undo</button>
  <button (click)="history.redo()" [disabled]="!history.history().canRedo">Redo</button>
  <button (click)="runtime.update({ colors: { primary: '#6366f1' } })">
    Make primary indigo
  </button>
\` })
export class ThemeHistoryComponent {
  readonly history = injectThemeHistory();
  readonly runtime = injectThemeRuntime();
}`,
  },
  {
    title: "Scope a subtree",
    desc: "ThemeScopeDirective themes a single element subtree.",
    lang: "ts",
    code: `import { Component } from "@angular/core";
import { ThemeScopeDirective } from "@theme-kit/angular";

@Component({
  selector: "app-dashboard",
  template: \`
    <div class="global-theme">Inherits global</div>
    <div [themeKitScope]="'forest'">Always forest here</div>
  \`,
  standalone: true,
  imports: [ThemeScopeDirective],
})
export class DashboardComponent {}`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "ts",
    code: `import { provideThemeKit } from "@theme-kit/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideThemeKit({
      themes,
      defaultTheme: "light",
      transition: { enabled: true, duration: 300, easing: "ease-in-out" },
    }),
  ],
};`,
  },
];

const web: UseCase[] = [
  {
    title: "Define the elements",
    desc: "One call registers every theme-kit custom element.",
    lang: "ts",
    code: `import { defineCustomElements } from "@theme-kit/web";
defineCustomElements();`,
  },
  {
    title: "Provider + toggle + select",
    desc: "Compose the elements in plain HTML — no framework required.",
    lang: "html",
    code: `<theme-kit-provider themes='[{ "name": "sunrise-light" }]' default-theme="light">
  <theme-kit-toggle></theme-kit-toggle>
  <theme-kit-select></theme-kit-select>
</theme-kit-provider>`,
  },
  {
    title: "Scope a subtree",
    desc: "theme-kit-scope applies a theme to its children.",
    lang: "html",
    code: `<theme-kit-scope theme="forest">
  <section>Always forest here</section>
</theme-kit-scope>`,
  },
  {
    title: "Imperative runtime access",
    desc: "Grab the runtime and drive it from any script.",
    lang: "ts",
    code: `import { getProviderRuntime } from "@theme-kit/web";

const runtime = getProviderRuntime();
runtime.selection.setMode("dark");
runtime.update({ colors: { primary: "#6366f1" } });
console.log(runtime.store.get().name);`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "html",
    code: `<theme-kit-provider
  themes="..."
  default-theme="light"
  transition='{"enabled": true, "duration": 300, "easing": "ease-in-out"}'
>
  <my-app></my-app>
</theme-kit-provider>`,
  },
];

const tailwind: UseCase[] = [
  {
    title: "Map tokens to Tailwind",
    desc: "Import the plugin so theme tokens become Tailwind v4 utilities.",
    lang: "css",
    code: `@import "tailwindcss";
@import "@theme-kit/tailwind";`,
  },
  {
    title: "Dark variant",
    desc: "The plugin wires the .dark class so dark: works out of the box.",
    lang: "css",
    code: `@custom-variant dark (&:where(.dark, .dark *));

/* bg-surface, text-foreground, bg-primary, ring-ring, ... are all tokens */
.card {
  @apply bg-card text-foreground border border-border rounded-lg;
}`,
  },
  {
    title: "Use tokens as utilities",
    desc: "Every semantic token maps to --color-*, --radius-*, --shadow-* and friends.",
    lang: "tsx",
    code: `export function Card() {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border">
      <button className="bg-primary text-primary-foreground hover:bg-primary/90">
        Primary action
      </button>
    </div>
  );
}`,
  },
  {
    title: "Keep the dark class in sync",
    desc: "synchronizeDarkClass bridges a theme-kit runtime with Tailwind's dark variant.",
    lang: "ts",
    code: `import { synchronizeDarkClass } from "@theme-kit/tailwind";
import { getProviderRuntime } from "@theme-kit/web";

const runtime = getProviderRuntime();
synchronizeDarkClass(runtime.store.get());`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "css",
    code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

:root {
  --theme-transition-enabled: true;
  --theme-transition-duration: 300ms;
  --theme-transition-easing: ease-in-out;
}`,
  },
];

const astro: UseCase[] = [
  {
    title: "Theme an island",
    desc: "ThemeProviderClient themes a client island with a blocking bootstrap.",
    lang: "astro",
    code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
---

<ThemeProviderClient themes={themes} defaultTheme="light">
  <ThemeSwitcher client:load />
</ThemeProviderClient>`,
  },
  {
    title: "Zero-flash script + CSS map",
    desc: "Build the blocking script and precompute CSS variables server-side.",
    lang: "astro",
    code: `---
import { createBlockingScript, buildThemeCssMap, computeFingerprint } from "@theme-kit/astro";

const fingerprint = computeFingerprint(themes, "light");
const cssMap = buildThemeCssMap(themes);
const script = createBlockingScript(fingerprint, cssMap);
---

<html data-theme="light" style={cssMap["sunrise-light"]}>
  <head><Fragment set:html={script} /></head>
  <body><slot /></body>
</html>`,
  },
  {
    title: "Scope a subtree",
    desc: "ThemeScope works inside client components too.",
    lang: "astro",
    code: `---
import { ThemeProviderClient, ThemeScope } from "@theme-kit/astro";
---

<ThemeProviderClient themes={themes}>
  <ThemeScope theme="forest" client:load>
    <DataViz />
  </ThemeScope>
</ThemeProviderClient>`,
  },
  {
    title: "Shared runtime across islands",
    desc: "getGlobalRuntime/setGlobalRuntime let islands share one runtime.",
    lang: "astro",
    code: `---
import { getGlobalRuntime } from "@theme-kit/astro";

const runtime = getGlobalRuntime();
console.log(runtime?.store.get().name ?? "not initialised yet");
---`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "astro",
    code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
---

<ThemeProviderClient
  themes={themes}
  defaultTheme="light"
  transition={{ enabled: true, duration: 300, easing: "ease-in-out" }}
>
  <slot />
</ThemeProviderClient>`,
  },
];

const nuxt: UseCase[] = [
  {
    title: "Add the module",
    desc: "Register the module and configure themes in nuxt.config.",
    lang: "ts",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
  },
});`,
  },
  {
    title: "SSR-first theming",
    desc: "Cookies are validated (fingerprint) and the initial theme is resolved and rendered server-side with a blocking bootstrap — no flash of the wrong theme.",
    lang: "ts",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
    initialFamily: "mint",
  },
});

// The module emits, before first paint:
//   <html data-theme="mint-light" data-theme-mode="light" data-theme-family="mint">
//   <style>:root{--background:…}</style>
//   <script>/* blocking bootstrap */</script>`,
  },
  {
    title: "Auto-imported composables",
    desc: "useTheme and friends are auto-imported in every component.",
    lang: "vue",
    code: `<script setup>
const { theme, mode, setMode, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme">{{ theme.name }} · {{ mode }}</button>
  <button @click="setMode('dark')">Dark</button>
</template>`,
  },
  {
    title: "Components + runtime access",
    desc: "ThemeScope, ThemeScrollbar and the runtime are available everywhere.",
    lang: "vue",
    code: `<script setup>
const runtime = useThemeRuntime();
function soften() {
  runtime.update({ radius: { sm: 8, md: 12 } });
}
</script>

<template>
  <ThemeScope theme="forest-light">
    <DataViz />
  </ThemeScope>
  <ThemeScrollbar auto-hide />
  <button @click="soften">Soften corners</button>
</template>`,
  },
  {
    title: "Runtime access in a plugin",
    desc: "The plugin-provided runtime is available as `nuxtApp.$themeKit`.",
    lang: "ts",
    code: `// plugins/theme.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const runtime = nuxtApp.$themeKit as ThemeRuntime;
  runtime.lifecycle.on("beforeThemeChange", (e) => {
    console.log("theme changed to", e.next.name);
  });
});`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable config-driven CSS transitions on theme changes.",
    lang: "ts",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "light",
    transition: { enabled: true, duration: 360, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  },
});`,
  },
];

const remix: UseCase[] = [
  {
    title: "Loader-driven initial theme",
    desc: "Resolve the theme on the server from the request, then hydrate with it.",
    lang: "tsx",
    code: `// app/root.tsx
import { useLoaderData } from "@remix-run/react";
import { ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

export async function loader({ request }: LoaderFunctionArgs) {
  return { initial: await getInitialThemeState(request, { themes }) };
}

export default function App() {
  const { initial } = useLoaderData();
  return (
    <ThemeProvider initial={initial}>
      <Outlet />
    </ThemeProvider>
  );
}`,
  },
  {
    title: "Blocking script",
    desc: "Emit the blocking head script so there is no theme flash.",
    lang: "tsx",
    code: `import { Links, Scripts } from "@remix-run/react";
import { ThemeHead } from "@theme-kit/remix";
import { themes } from "./themes";

export function Layout({ children }) {
  return (
    <html>
      <head>
        <ThemeHead themes={themes} defaultTheme="light" />
        <Links />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}`,
  },
  {
    title: "Client switcher",
    desc: "All hooks are re-exported from @theme-kit/remix for client components.",
    lang: "tsx",
    code: `import { useTheme, useThemeHistory } from "@theme-kit/remix";

export function ThemeControls() {
  const { theme, toggleTheme } = useTheme();
  const { undo, redo, canUndo } = useThemeHistory();
  return (
    <div>
      <button onClick={toggleTheme}>{theme.name}</button>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
}`,
  },
  {
    title: "Persistence",
    desc: "createRemixThemePersistence keeps the selection in sync with the server.",
    lang: "ts",
    code: `import { createRemixThemePersistence } from "@theme-kit/remix";
import { themes } from "./themes";

export const persistence = createRemixThemePersistence(themes, "light", {
  key: "theme",
});`,
  },
  {
    title: "Smooth theme transitions",
    desc: "Enable CSS transitions on theme changes for a polished user experience.",
    lang: "tsx",
    code: `// app/root.tsx
import { ThemeProvider } from "@theme-kit/remix";

export default function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="light"
      transition={{ enabled: true, duration: 300, easing: "ease-in-out" }}
    >
      <Outlet />
    </ThemeProvider>
  );
}`,
  },
];

export const frameworkUseCases: Record<string, UseCase[]> = {
  react,
  next,
  vue,
  svelte,
  solid,
  angular,
  web,
  tailwind,
  astro,
  nuxt,
  remix,
};
