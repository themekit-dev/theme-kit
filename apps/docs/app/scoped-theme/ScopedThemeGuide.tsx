"use client";

import { useState } from "react";
import Link from "next/link";
import { highlightCode } from "../../lib/highlight";
import { CodeBlock } from "../../components/code-block";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { FrameworkPicker, getExample } from "../../components/framework-picker";

const scopeExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: {
    lang: "tsx",
    title: "app.tsx",
    code: `import { ThemeScope } from "@theme-kit/react";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const scopeTransition: ThemeTransitionOptions = { duration: 300, easing: "cubic-bezier(0.4, 0, 0.2, 1)" };

<ThemeProvider themes={themes}>
  <ThemeScope theme="plum-dark" transition={scopeTransition}>
    <Sidebar />
  </ThemeScope>
</ThemeProvider>`,
  },
  next: {
    lang: "tsx",
    title: "scoped-panel.tsx",
    code: `"use client";

import { ThemeScope } from "@theme-kit/next/client";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function ScopedPanel() {
  return (
    <ThemeScope theme="slack-dark" transition={transition}>
      <Notifications />
    </ThemeScope>
  );
}`,
  },
  vue: {
    lang: "vue",
    title: "App.vue",
    code: `<script setup>
import { ThemeScope } from "@theme-kit/vue";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };
</script>

<template>
  <ThemeScope theme="plum-dark" :transition="transition">
    <YourComponent />
  </ThemeScope>
</template>`,
  },
  svelte: {
    lang: "svelte",
    title: "App.svelte",
    code: `<script>
import { ThemeScope } from "@theme-kit/svelte";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };
</script>

<ThemeProvider themes={themes}>
  <ThemeScope theme="plum-dark" {transition}>
    <YourComponent />
  </ThemeScope>
</ThemeProvider>`,
  },
  solid: {
    lang: "tsx",
    title: "app.tsx",
    code: `import { ThemeScope } from "@theme-kit/solid";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function App() {
  return (
    <ThemeProvider themes={themes}>
      <ThemeScope theme="plum-dark" transition={transition}>
        <YourComponent />
      </ThemeScope>
    </ThemeProvider>
  );
}`,
  },
  angular: {
    lang: "ts",
    title: "app-banner.ts",
    code: `import { Component } from "@angular/core";
import { ThemeScopeDirective } from "@theme-kit/angular";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

@Component({
  selector: "app-banner",
  template: \`
    <div [themeKitScope]="'plum-dark'" [themeKitScopeTransition]="transition">
      <p>This subtree uses the plum-dark palette with transition.</p>
    </div>
  \`,
  standalone: true,
  imports: [ThemeScopeDirective],
})
export class BannerComponent {}`,
  },
  web: {
    lang: "html",
    title: "index.html",
    code: `<theme-kit-provider default-theme="mint-light">
  <your-app></your-app>

  <theme-kit-scope theme="plum-dark" theme-transition='{"duration":300,"easing":"ease"}'>
    <aside>Scoped to plum-dark</aside>
  </theme-kit-scope>
</theme-kit-provider>

<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>`,
  },
  tailwind: {
    lang: "css",
    title: "scope.css",
    code: `/* Scoped themes are pure CSS-variable islands — works with Tailwind too.
   Scope a region with a custom property override layer. */
.scoped-plum {
  @apply dark:text-plum-50 bg-plum-50;
  --theme-color-primary: theme(colors.plum.700);
  --theme-color-background: theme(colors.plum.50);
}

.dark .scoped-plum {
  --theme-color-primary: theme(colors.plum.300);
  --theme-color-background: theme(colors.plum-950);
}

<div class="scoped-plum">
  This subtree uses the plum palette, isolated from the global theme.
</div>`,
  },
  astro: {
    lang: "astro",
    title: "src/components/Scoped.astro",
    code: `---
import { ThemeScope } from "@theme-kit/astro";
---

<div class="scoped-region">
  <ThemeScope theme="plum-dark">
    <slot />
  </ThemeScope>
</div>`,
  },
  nuxt: {
    lang: "vue",
    title: "ScopedPanel.vue",
    code: `<script setup>
import { ThemeScope } from "@theme-kit/nuxt";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };
</script>

<template>
  <ThemeScope theme="plum-dark" :transition="transition">
    <YourComponent />
  </ThemeScope>
</template>`,
  },
  remix: {
    lang: "tsx",
    title: "scoped-panel.tsx",
    code: `"use client";

import { ThemeScope } from "@theme-kit/remix";
import type { ThemeTransitionOptions } from "@theme-kit/core";

const transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

export function ScopedPanel() {
  return (
    <ThemeScope theme="plum-dark" transition={transition}>
      <Notifications />
    </ThemeScope>
  );
}`,
  },
};

const imperativeExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: {
    lang: "tsx",
    title: "useScopedTheme — imperative",
    code: `"use client";

import { useRef } from "react";
import { useScopedTheme } from "@theme-kit/react";

export function Preview({ themeName }: { themeName: string | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useScopedTheme(ref, themeName);

  return <div ref={ref}>This div follows {themeName ?? "the global theme"}.</div>;
}`,
  },
  next: {
    lang: "tsx",
    title: "useScopedTheme — imperative",
    code: `"use client";

import { useRef } from "react";
import { useScopedTheme } from "@theme-kit/next/client";

export function Preview({ themeName }: { themeName: string | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useScopedTheme(ref, themeName);

  return <div ref={ref}>This div follows {themeName ?? "the global theme"}.</div>;
}`,
  },
  remix: {
    lang: "tsx",
    title: "useScopedTheme — imperative",
    code: `"use client";

import { useRef } from "react";
import { useScopedTheme } from "@theme-kit/react";

export function Preview({ themeName }: { themeName: string | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useScopedTheme(ref, themeName);

  return <div ref={ref}>This div follows {themeName ?? "the global theme"}.</div>;
}`,
  },
  vue: {
    lang: "vue",
    title: "App.vue — imperative binding",
    code: `<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useThemeRuntime } from "@theme-kit/vue";
import { createScopedThemeBinding } from "@theme-kit/core";

const el = ref<HTMLElement | null>(null);
const runtime = useThemeRuntime();
let binding: ReturnType<typeof createScopedThemeBinding> | null = null;

onMounted(() => {
  binding = createScopedThemeBinding(runtime.themes, el.value!, "plum-dark");
});
onUnmounted(() => binding?.destroy());
</script>

<template>
  <div ref="el">Scoped to plum-dark</div>
</template>`,
  },
  svelte: {
    lang: "svelte",
    title: "App.svelte — imperative binding",
    code: `<script>
  import { getThemeRuntime } from "@theme-kit/svelte";
  import { createScopedThemeBinding } from "@theme-kit/core";
  import { onMount } from "svelte";

  let el: HTMLDivElement;
  const runtime = getThemeRuntime();

  onMount(() => {
    const binding = createScopedThemeBinding(runtime.themes, el, "plum-dark");
    return () => binding.destroy();
  });
</script>

<div bind:this={el}>Scoped to plum-dark</div>`,
  },
  solid: {
    lang: "tsx",
    title: "Solid — imperative binding",
    code: `import { onMount, onCleanup } from "solid-js";
import { useThemeRuntime } from "@theme-kit/solid";
import { createScopedThemeBinding } from "@theme-kit/core";

function Preview() {
  let el: HTMLDivElement | undefined;
  const runtime = useThemeRuntime();

  onMount(() => {
    const binding = createScopedThemeBinding(runtime.themes, el!, "plum-dark");
    onCleanup(() => binding.destroy());
  });

  return <div ref={el}>Scoped to plum-dark</div>;
}`,
  },
  angular: {
    lang: "ts",
    title: "Angular — ThemeScopeDirective",
    code: `import { Component } from "@angular/core";
import { ThemeScopeDirective } from "@theme-kit/angular";

@Component({
  selector: "app-preview",
  template: \`
    <div [themeKitScope]="'plum-dark'">
      Scoped to plum-dark
    </div>
  \`,
  standalone: true,
  imports: [ThemeScopeDirective],
})
export class PreviewComponent {}`,
  },
  web: {
    lang: "html",
    title: "index.html — theme-kit-scope",
    code: `<theme-kit-scope theme="plum-dark">
  <p>Scoped to plum-dark</p>
</theme-kit-scope>`,
  },
  tailwind: {
    lang: "ts",
    title: "core — createScopedThemeBinding",
    code: `// Tailwind is a CSS layer — imperative scoping
// uses the core binding, same as vanilla JS.
import { createScopedThemeBinding } from "@theme-kit/core";

const binding = createScopedThemeBinding(themes, el, "plum-dark");
binding.destroy();`,
  },
  astro: {
    lang: "astro",
    title: "Astro — ThemeScope",
    code: `---
import { ThemeScope } from "@theme-kit/astro";
---
<ThemeScope theme="plum-dark">
  <div>Scoped to plum-dark</div>
</ThemeScope>`,
  },
  nuxt: {
    lang: "vue",
    title: "Nuxt — ThemeScope",
    code: `<template>
  <ThemeScope theme="plum-dark">
    <div>Scoped to plum-dark</div>
  </ThemeScope>
</template>`,
  },
};

const localThemeExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: {
    lang: "tsx",
    title: "React — local themes",
    code: `import { ThemeScope } from "@theme-kit/react";
import type { ThemeDefinition } from "@theme-kit/core";
import { defineTheme } from "@theme-kit/core";

const compactTheme: ThemeDefinition = defineTheme({
  name: "compact-light",
  meta: { family: "compact", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#18181b",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      card: "#fafafa",
    },
  },
});

<ThemeScope themes={[compactTheme]} theme="compact-light">
  <EditorToolbar />
</ThemeScope>`,
  },
  next: {
    lang: "tsx",
    title: "Next.js — local themes",
    code: `"use client";

import { ThemeScope } from "@theme-kit/next/client";
import type { ThemeDefinition } from "@theme-kit/core";
import { defineTheme } from "@theme-kit/core";

const compactTheme: ThemeDefinition = defineTheme({
  name: "compact-light",
  meta: { family: "compact", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#18181b",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      card: "#fafafa",
    },
  },
});

export function ScopedPanel() {
  return (
    <ThemeScope themes={[compactTheme]} theme="compact-light">
      <EditorToolbar />
    </ThemeScope>
  );
}`,
  },
  vue: {
    lang: "vue",
    title: "Vue — local themes",
    code: `<script setup>
import { ThemeScope } from "@theme-kit/vue";
import type { ThemeDefinition } from "@theme-kit/core";
import { defineTheme } from "@theme-kit/core";

const compactTheme: ThemeDefinition = defineTheme({
  name: "compact-light",
  meta: { family: "compact", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#18181b",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      card: "#fafafa",
    },
  },
});
</script>

<template>
  <ThemeScope :themes="[compactTheme]" theme="compact-light">
    <EditorToolbar />
  </ThemeScope>
</template>`,
  },
  svelte: {
    lang: "svelte",
    title: "Svelte — local themes",
    code: `<script>
  import { ThemeScope } from "@theme-kit/svelte";
  import { defineTheme } from "@theme-kit/core";

  const compactTheme = defineTheme({
    name: "compact-light",
    meta: { family: "compact", mode: "light" },
    tokens: {
      colors: {
        background: "#ffffff",
        foreground: "#18181b",
        primary: "#6366f1",
        primaryForeground: "#ffffff",
        card: "#fafafa",
      },
    },
  });
</script>

<ThemeScope themes={[compactTheme]} theme="compact-light">
  <EditorToolbar />
</ThemeScope>`,
  },
  solid: {
    lang: "tsx",
    title: "Solid — local themes",
    code: `import { ThemeScope } from "@theme-kit/solid";
import type { ThemeDefinition } from "@theme-kit/core";
import { defineTheme } from "@theme-kit/core";

const compactTheme: ThemeDefinition = defineTheme({
  name: "compact-light",
  meta: { family: "compact", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#18181b",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      card: "#fafafa",
    },
  },
});

<ThemeScope themes={[compactTheme]} theme="compact-light">
  <EditorToolbar />
</ThemeScope>`,
  },
  angular: {
    lang: "ts",
    title: "core — imperative local themes",
    code: `// The Angular ThemeScopeDirective doesn't support local themes.
// Use the imperative core binding with localThemes:
import { createScopedThemeBinding } from "@theme-kit/core";

const binding = createScopedThemeBinding(themes, el, "plum-dark", {
  localThemes: [compactTheme],
});
binding.destroy();`,
  },
  web: {
    lang: "ts",
    title: "core — imperative local themes",
    code: `// The <theme-kit-scope> element doesn't support local themes.
// Use the imperative core binding with localThemes:
import { createScopedThemeBinding } from "@theme-kit/core";

const binding = createScopedThemeBinding(themes, el, "plum-dark", {
  localThemes: [compactTheme],
});
binding.destroy();`,
  },
  tailwind: {
    lang: "ts",
    title: "core — imperative local themes",
    code: `// Tailwind is a CSS layer — local themes use the core binding.
import { createScopedThemeBinding } from "@theme-kit/core";

const binding = createScopedThemeBinding(themes, el, "plum-dark", {
  localThemes: [compactTheme],
});
binding.destroy();`,
  },
  astro: {
    lang: "ts",
    title: "core — imperative local themes",
    code: `// Astro's ThemeScope doesn't support local themes.
// Use the imperative core binding with localThemes:
import { createScopedThemeBinding } from "@theme-kit/core";

const binding = createScopedThemeBinding(themes, el, "plum-dark", {
  localThemes: [compactTheme],
});
binding.destroy();`,
  },
  nuxt: {
    lang: "vue",
    title: "Nuxt — local themes",
    code: `<template>
  <ThemeScope :themes="[compactTheme]" theme="compact-light">
    <EditorToolbar />
  </ThemeScope>
</template>`,
  },
  remix: {
    lang: "tsx",
    title: "Remix — local themes",
    code: `"use client";

import { ThemeScope } from "@theme-kit/remix";
import type { ThemeDefinition } from "@theme-kit/core";
import { defineTheme } from "@theme-kit/core";

const compactTheme: ThemeDefinition = defineTheme({
  name: "compact-light",
  meta: { family: "compact", mode: "light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#18181b",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      card: "#fafafa",
    },
  },
});

export function ScopedPanel() {
  return (
    <ThemeScope themes={[compactTheme]} theme="compact-light">
      <EditorToolbar />
    </ThemeScope>
  );
}`,
  },
};

const transitionExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: {
    lang: "tsx",
    title: "React — transition prop",
    code: `import { ThemeScope } from "@theme-kit/react";

<ThemeScope theme="plum-dark" />

<ThemeScope theme="plum-dark" transition={false} />

<ThemeScope
  theme="plum-dark"
  transition={{ duration: 150 }}
/>`,
  },
  next: {
    lang: "tsx",
    title: "Next.js — transition prop",
    code: `"use client";

import { ThemeScope } from "@theme-kit/next/client";

<ThemeScope theme="plum-dark" />

<ThemeScope theme="plum-dark" transition={false} />

<ThemeScope
  theme="plum-dark"
  transition={{ duration: 150 }}
/>`,
  },
  vue: {
    lang: "vue",
    title: "Vue — transition prop",
    code: `<template>
  <ThemeScope theme="plum-dark" />
  <ThemeScope theme="plum-dark" :transition="false" />
  <ThemeScope
    theme="plum-dark"
    :transition="{ duration: 150 }"
  />
</template>`,
  },
  svelte: {
    lang: "svelte",
    title: "Svelte — transition prop",
    code: `<ThemeScope theme="plum-dark" />

<ThemeScope theme="plum-dark" transition={false} />

<ThemeScope
  theme="plum-dark"
  transition={{ duration: 150 }}
/>`,
  },
  solid: {
    lang: "tsx",
    title: "Solid — transition prop",
    code: `import { ThemeScope } from "@theme-kit/solid";

<ThemeScope theme="plum-dark" />

<ThemeScope theme="plum-dark" transition={false} />

<ThemeScope
  theme="plum-dark"
  transition={{ duration: 150 }}
/>`,
  },
  angular: {
    lang: "ts",
    title: "Angular — transition directive",
    code: `import { Component } from "@angular/core";
import { ThemeScopeDirective } from "@theme-kit/angular";

@Component({
  selector: "app-scope",
  template: \`
    <div [themeKitScope]="'plum-dark'"></div>
    <div
      [themeKitScope]="'plum-dark'"
      [themeKitScopeTransition]="{ duration: 150 }"
    ></div>
  \`,
  standalone: true,
  imports: [ThemeScopeDirective],
})
export class ScopeComponent {}`,
  },
  web: {
    lang: "html",
    title: "Web — scope element",
    code: `<theme-kit-scope theme="plum-dark"></theme-kit-scope>

<theme-kit-scope
  theme="plum-dark"
  theme-transition='{"duration":150}'
></theme-kit-scope>`,
  },
  tailwind: {
    lang: "css",
    title: "Tailwind — CSS variables",
    code: `/* Tailwind scopes use CSS custom properties.
   Transitions work via the core runtime's
   transition engine — no Tailwind-specific
   configuration needed. */
.scoped-plum {
  --theme-color-primary: theme(colors.plum.700);
  --theme-color-background: theme(colors.plum.50);
}`,
  },
  astro: {
    lang: "astro",
    title: "Astro — transition prop",
    code: `---
import { ThemeScope } from "@theme-kit/astro";
---

<ThemeScope theme="plum-dark" />

<ThemeScope
  theme="plum-dark"
  transition={{ duration: 150 }}
/>`,
  },
  nuxt: {
    lang: "vue",
    title: "Nuxt — transition prop",
    code: `<template>
  <ThemeScope theme="plum-dark" />
  <ThemeScope
    theme="plum-dark"
    :transition="{ duration: 150 }"
  />
</template>`,
  },
  remix: {
    lang: "tsx",
    title: "Remix — transition prop",
    code: `"use client";

import { ThemeScope } from "@theme-kit/remix";

<ThemeScope theme="plum-dark" />

<ThemeScope theme="plum-dark" transition={false} />

<ThemeScope
  theme="plum-dark"
  transition={{ duration: 150 }}
/>`,
  },
};

const nestedScopeExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: {
    lang: "tsx",
    title: "React — nested scopes",
    code: `<ThemeProvider themes={themes}>
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</ThemeProvider>`,
  },
  next: {
    lang: "tsx",
    title: "Next.js — nested scopes",
    code: `<ThemeProvider themes={themes}>
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</ThemeProvider>`,
  },
  vue: {
    lang: "vue",
    title: "Vue — nested scopes",
    code: `<template>
  <ThemeProvider :themes="themes">
    <ThemeScope theme="mint-light">
      <Dashboard />

      <ThemeScope theme="plum-dark">
        <CodeEditor />
      </ThemeScope>
    </ThemeScope>
  </ThemeProvider>
</template>`,
  },
  svelte: {
    lang: "svelte",
    title: "Svelte — nested scopes",
    code: `<ThemeProvider themes={themes}>
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</ThemeProvider>`,
  },
  solid: {
    lang: "tsx",
    title: "Solid — nested scopes",
    code: `<ThemeProvider themes={themes}>
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</ThemeProvider>`,
  },
  angular: {
    lang: "ts",
    title: "Angular — nested scopes",
    code: `import { Component } from "@angular/core";
import { ThemeScopeDirective } from "@theme-kit/angular";

@Component({
  selector: "app-dashboard",
  template: \`
    <div [themeKitScope]="'mint-light'">
      <Dashboard />

      <div [themeKitScope]="'plum-dark'">
        <CodeEditor />
      </div>
    </div>
  \`,
  standalone: true,
  imports: [ThemeScopeDirective],
})
export class DashboardComponent {}`,
  },
  web: {
    lang: "html",
    title: "Web — nested scopes",
    code: `<theme-kit-provider themes='...' default-theme="light">
  <theme-kit-scope theme="mint-light">
    <dashboard-component></dashboard-component>

    <theme-kit-scope theme="plum-dark">
      <code-editor></code-editor>
    </theme-kit-scope>
  </theme-kit-scope>
</theme-kit-provider>`,
  },
  tailwind: {
    lang: "css",
    title: "Tailwind — CSS scopes",
    code: `/* Tailwind scopes are CSS variable islands.
   Nest scoped containers by applying the
   scoped class to nested elements. */
.scoped-mint {
  --theme-color-primary: theme(colors.mint.700);
}

.scoped-plum {
  --theme-color-primary: theme(colors.plum.300);
}`,
  },
  astro: {
    lang: "astro",
    title: "Astro — nested scopes",
    code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
import { ThemeScope } from "@theme-kit/astro";
---
<ThemeProviderClient themes={themes} defaultTheme="light">
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</ThemeProviderClient>`,
  },
  nuxt: {
    lang: "vue",
    title: "Nuxt — nested scopes",
    code: `<template>
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</template>`,
  },
  remix: {
    lang: "tsx",
    title: "Remix — nested scopes",
    code: `<ThemeProvider themes={themes}>
  <ThemeScope theme="mint-light">
    <Dashboard />

    <ThemeScope theme="plum-dark">
      <CodeEditor />
    </ThemeScope>
  </ThemeScope>
</ThemeProvider>`,
  },
};

function snippetBlock(snippet: { lang: string; title: string; code: string }) {
  return (
    <CodeBlock
      html={highlightCode(snippet.code, snippet.lang)}
      code={snippet.code}
      language={snippet.lang}
      className="rounded-lg m-0"
    />
  );
}

export function ScopedThemeGuide() {
  const [selectedFramework, setSelectedFramework] = useState("react");
  const selectedExample = getExample(scopeExamples, selectedFramework);
  const imperativeExample = getExample(imperativeExamples, selectedFramework);
  const localThemeExample = getExample(localThemeExamples, selectedFramework);
  const transitionExample = getExample(transitionExamples, selectedFramework);
  const nestedScopeExample = getExample(nestedScopeExamples, selectedFramework);

  return (
    <>
      <FrameworkPicker
        value={selectedFramework}
        onChange={setSelectedFramework}
        label="Pick your framework"
        scrollToId="theme-scope"
      />

      <section id="theme-scope" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={1}
          desc="The same scoping primitive in every adapter. Select a framework to see the exact implementation."
        >
          ThemeScope — pick your framework
        </SectionHeading>
        {snippetBlock(selectedExample)}
        <Callout className="mt-3">
          <strong>How a scope selects its theme</strong>{" "}
          <span className="mx-1 opacity-40">|</span>
          Pass an exact theme name like{" "}
          <code className="mono text-[0.9em]">plum-dark</code>, a family name
          — the scope resolves the family&apos;s theme for the current mode —
          or split them into{" "}
          <code className="mono text-[0.9em]">family</code> +{" "}
          <code className="mono text-[0.9em]">mode</code> props. Omit both to
          mirror the global selection inside a fresh boundary. Every prop is
          reactive: when <code className="mono text-[0.9em]">theme</code>
          changes, the scope re-resolves and animates without a remount. An
          unregistered name falls back to the first theme.
        </Callout>
      </section>

      <section id="imperative" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={2}
          desc="When you don't control JSX or markup — e.g. a video player or legacy DOM — scope a raw element directly."
        >
          Imperative scoping
        </SectionHeading>
        {snippetBlock({
          lang: "ts",
          title: "core/vanilla — createScopedThemeBinding",
          code: `import {
  createThemeRuntime,
  createScopedThemeBinding,
} from "@theme-kit/core";

const runtime = createThemeRuntime({ themes, defaultTheme: "light" });

const binding = createScopedThemeBinding(themes, el, "plum-dark");

binding.destroy();`,
        })}
        <div className="mt-3">
          {snippetBlock(imperativeExample)}
        </div>
      </section>

      <section id="local-themes" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={3}
          desc="Themes defined on the scope itself — for genuinely isolated components that ship their own palette. No second runtime is created."
        >
          Local themes
        </SectionHeading>
        {snippetBlock(localThemeExample)}
        <Callout className="mt-3">
          <strong>local themes resolve first</strong>{" "}
          <span className="mx-1 opacity-40">|</span>
          A scope&apos;s <code className="mono text-[0.9em]">themes</code> are
          layered on top of the provider&apos;s registry: a local theme with
          the same name shadows the parent&apos;s, and anything a local theme
          doesn&apos;t define falls through to the app&apos;s themes (its{" "}
          <code className="mono text-[0.9em]">extends</code> chain is merged,
          so inherited tokens resolve). Late-loaded packs work too — swapping
          the <code className="mono text-[0.9em]">themes</code> array
          re-resolves the scope in place. The imperative equivalent passes{" "}
          <code className="mono text-[0.9em]">localThemes</code> to{" "}
          <code className="mono text-[0.9em]">createScopedThemeBinding</code>.
        </Callout>
      </section>

      <section id="transitions" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={4}
          desc="Scoped theme changes animate through the same transition engine — inheriting the provider's config unless you say otherwise."
        >
          Transitions
        </SectionHeading>
        {snippetBlock(transitionExample)}
        <Callout className="mt-3">
          <strong>inheritance model</strong>{" "}
          <span className="mx-1 opacity-40">|</span>
          <code className="mono text-[0.9em]">Provider transition → Scope →
          inherited defaults → local overrides</code>. Passing an object merges
          over the provider&apos;s{" "}
          <code className="mono text-[0.9em]">ThemeTransitionOptions</code>{" "}
          (duration, easing, preset, View Transitions), so a scoped change
          animates smoothly with the rest of the app while letting you tweak
          just what&apos;s different. Reduced-motion users get an instant swap.
        </Callout>
      </section>

      <section id="how-it-works" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={5}
          desc="A scope is a plain element that emits the theme's variables into its own subtree — nothing leaks outside."
        >
          How a scope works
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-2 mb-4">
          {snippetBlock(nestedScopeExample)}

          <div className="rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs leading-7">
            <div className="text-[11px] font-sans font-semibold uppercase tracking-widest opacity-40 mb-2">
              Scope tree
            </div>
            <div className="pl-2 border-l-2 border-border">
              <div>
                <span
                  className="px-2 py-0.5 rounded font-sans font-semibold text-[11px]"
                  style={{
                    background: "var(--theme-color-secondary)",
                    color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
                  }}
                >
                  Global
                </span>{" "}
                <span className="opacity-60">ThemeProvider</span>
              </div>
              <div className="mt-1 ml-4 pl-3 border-l border-border">
                <div>
                  <span
                    className="px-2 py-0.5 rounded font-sans font-semibold text-[11px]"
                    style={{
                      background: "var(--theme-color-primary)",
                      color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                    }}
                  >
                    mint-light
                  </span>{" "}
                  <span className="opacity-60">Dashboard</span>
                </div>
                <div className="mt-1 ml-4 pl-3 border-l border-border">
                  <span
                    className="px-2 py-0.5 rounded font-sans font-semibold text-[11px]"
                    style={{
                      background: "var(--theme-color-accent)",
                      color: "var(--theme-color-accent-foreground, var(--theme-color-accentForeground))",
                    }}
                  >
                    plum-dark
                  </span>{" "}
                  <span className="opacity-60">CodeEditor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            The scope element renders every token of the target theme as{" "}
            <code className="mono text-[0.9em]">--theme-*</code> CSS custom
            properties on itself, so children just consume them.
          </li>
          <li>
            Tailwind is supported directly — scopes also emit{" "}
            <code className="mono text-[0.9em]">--color-*</code> and{" "}
            <code className="mono text-[0.9em]">--radius-*</code> aliases, so
            utilities like <code className="mono text-[0.9em]">bg-card</code>{" "}
            pick up the scoped palette.
          </li>
          <li>
            Dark scoped themes add a <code className="mono text-[0.9em]">dark</code>{" "}
            class to the scope element, keeping Theme Kit&apos;s "
            <code className="mono text-[0.9em]">@custom-variant dark</code>
            " Tailwind trick working inside the island.
          </li>
          <li>
            Scopes nest arbitrarily — an inner{" "}
            <code className="mono text-[0.9em]">ThemeScope</code> overrides
            the outer one for its own subtree.
          </li>
          <li>
            The scope resolves its theme from the registry, so it updates
            automatically when the global mode changes (family fallback), and
            re-renders when the underlying theme definition is swapped.
          </li>
          <li>
            Server-rendered scopes pre-paint correctly too: an explicit
            selection (exact name, or a light/dark family mode) renders its
            variables inline, while an OS-dependent selection (a{" "}
            <code className="mono text-[0.9em]">system</code> mode, or a
            boundary scope following a system selection) ships a{" "}
            <code className="mono text-[0.9em]">@media
            (prefers-color-scheme: dark)</code> block so the first paint
            already matches the OS — no flash of the wrong scoped theme
            before hydration.
          </li>
        </ul>
      </section>

      <section id="next" className="scroll-mt-24">
        <SectionHeading
          num={6}
          desc="Scoped theming is one advanced feature — continue through the rest."
        >
          What&apos;s next
        </SectionHeading>
        <div className="flex flex-col gap-2">
          <Link
            href="/advanced-features"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Advanced Features</div>
              <div className="text-xs opacity-60">
                History, plugins, scheduled solar themes, token resolution.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
          <Link
            href="/playground"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Playground</div>
              <div className="text-xs opacity-60">
                See scoped themes demoed against a live runtime.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
          <Link
            href="/api-reference/react"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">API Reference</div>
              <div className="text-xs opacity-60">
                ThemeScopeProps and useScopedTheme for every adapter.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}