"use client";

import { useState } from "react";
import Link from "next/link";
import { highlightCode } from "../../lib/highlight";
import { CodeBlock } from "../../components/code-block";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { FrameworkPicker, getExample } from "../../components/framework-picker";

const defineSnippet = {
  lang: "ts",
  title: "themes.ts",
  code: `import { defineTheme } from "@theme-kit/core";

export const oceanLight = defineTheme({
  name: "ocean-light",
  meta: { family: "ocean", mode: "light", label: "Ocean Light" },
  tokens: {
    colors: {
      background: "#f0f9ff",
      foreground: "#0c1e2e",
      primary: "#0284c7",
      primaryForeground: "#ffffff",
      secondary: "#e0f2fe",
      secondaryForeground: "#0369a1",
      muted: "#bae6fd",
      mutedForeground: "#075985",
      accent: "#0ea5e9",
      accentForeground: "#ffffff",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      success: "#16a34a",
      successForeground: "#ffffff",
      border: "#7dd3fc",
      ring: "#0284c7",
    },
    radius: { lg: "0.5rem" },
  },
});`,
};

const darkSnippet = {
  lang: "ts",
  title: "themes.ts",
  code: `export const oceanDark = defineTheme({
  name: "ocean-dark",
  meta: { family: "ocean", mode: "dark", label: "Ocean Dark" },
  tokens: {
    colors: {
      background: "#0c1e2e",
      foreground: "#f0f9ff",
      primary: "#38bdf8",
      primaryForeground: "#0c1e2e",
      secondary: "#0369a1",
      secondaryForeground: "#e0f2fe",
      muted: "#075985",
      mutedForeground: "#bae6fd",
      accent: "#0ea5e9",
      accentForeground: "#0c1e2e",
      destructive: "#f87171",
      destructiveForeground: "#0c1e2e",
      success: "#4ade80",
      successForeground: "#0c1e2e",
      border: "#0369a1",
      ring: "#38bdf8",
    },
    radius: { lg: "0.5rem" },
  },
});`,
};

const extendSnippet = {
  lang: "ts",
  title: "themes.ts",
  code: `import { defineTheme, extendTheme } from "@theme-kit/core";
import { oceanLight } from "./themes";

const base = defineTheme({
  name: "base",
  meta: { family: "acme", mode: "light", label: "Acme Base" },
  tokens: {
    colors: {
      background: "#fafafa",
      foreground: "#18181b",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      secondary: "#f4f4f5",
      secondaryForeground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      accent: "#f4f4f5",
      accentForeground: "#18181b",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      success: "#16a34a",
      successForeground: "#ffffff",
      border: "#e4e4e7",
      ring: "#6366f1",
    },
    radius: { lg: "10px" },
  },
});

export const acmeLight = extendTheme("acme-light", base, {
  meta: { family: "acme", mode: "light", label: "Acme Light" },
  colors: {
    background: "#fafafa",
    primary: "#4f46e5",
  },
});

export const acmeDark = extendTheme("acme-dark", base, {
  meta: { family: "acme", mode: "dark", label: "Acme Dark" },
  colors: {
    background: "#09090b",
    foreground: "#fafafa",
    primary: "#818cf8",
    ring: "#818cf8",
  },
});`,
};

const runtimeSnippet = {
  lang: "tsx",
  title: "App.tsx",
  code: `import { createThemeRuntime } from "@theme-kit/core";
import { ThemeProvider } from "@theme-kit/react";
import { oceanLight, oceanDark } from "./themes";

const themes = [oceanLight, oceanDark];

createThemeRuntime({
  themes,
  defaultTheme: "ocean-light",
  initialMode: "system",
});

export function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="ocean-light">
      <YourApp />
    </ThemeProvider>
  );
}`,
};

const vanillaSnippet = {
  lang: "ts",
  title: "main.ts",
  code: `import { ThemeKit } from "@theme-kit/core/vanilla";
import { oceanLight, oceanDark } from "./themes";

const kit = new ThemeKit({ themes: [oceanLight, oceanDark] });
kit.setFamily("ocean");
kit.setMode("light");
kit.update({ colors: { primary: "#06b6d4" } });
kit.destroy();`,
};

const generatedSnippet = {
  lang: "ts",
  title: "generate.ts",
  code: `import { generateTheme } from "@theme-kit/core";

const { light, dark } = generateTheme({
  seed: "#6366f1",
  family: "indigo",
});

import { validateTheme } from "@theme-kit/core";
const result = validateTheme(dark, { themes: [light, dark] });
`,
};

// How to wire the custom-defined theme (oceanLight / oceanDark from
// `./themes`, defined in section 1) into each supported framework.
const customThemeSnippets: Record<
  string,
  { title: string; lang: string; code: string }
> = {
  react: {
    title: "App.tsx",
    lang: "tsx",
    code: `import { ThemeProvider, useTheme } from "@theme-kit/react";
import { oceanLight, oceanDark } from "./themes";

const themes = [oceanLight, oceanDark];

export function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="ocean-light">
      <ThemeSwitcher />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { theme, setMode, setFamily } = useTheme();
  return (
    <div>
      <span>{theme.name}</span>
      <button onClick={() => setFamily("ocean")}>ocean</button>
      <button onClick={() => setMode("light")}>Light</button>
      <button onClick={() => setMode("dark")}>Dark</button>
    </div>
  );
}`,
  },
  next: {
    title: "app/layout.tsx",
    lang: "tsx",
    code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";
import { oceanLight, oceanDark } from "./themes";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={[oceanLight, oceanDark]}
      defaultTheme="ocean-light"
    >
      {children}
    </ThemeProvider>
  );
}`,
  },
  vue: {
    title: "App.vue",
    lang: "vue",
    code: `<script setup>
import { ThemeProvider } from "@theme-kit/vue";
import { oceanLight, oceanDark } from "./themes";

const themes = [oceanLight, oceanDark];
</script>

<template>
  <ThemeProvider :themes="themes" default-theme="ocean-light">
    <YourView />
  </ThemeProvider>
</template>`,
  },
  svelte: {
    title: "+layout.svelte",
    lang: "svelte",
    code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  import { oceanLight, oceanDark } from "./themes";

  const themes = [oceanLight, oceanDark];
</script>

<ThemeProvider {themes} defaultTheme="ocean-light">
  <slot />
</ThemeProvider>`,
  },
  solid: {
    title: "main.tsx",
    lang: "tsx",
    code: `import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import { oceanLight, oceanDark } from "./themes";

render(() => (
  <ThemeProvider themes={[oceanLight, oceanDark]} defaultTheme="ocean-light">
    <App />
  </ThemeProvider>
), document.getElementById("root")!);`,
  },
  angular: {
    title: "main.ts",
    lang: "ts",
    code: `import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";
import { oceanLight, oceanDark } from "./themes";

bootstrapApplication(AppComponent, {
  providers: [
    provideThemeKit({
      themes: [oceanLight, oceanDark],
      defaultTheme: "ocean-light",
    }),
  ],
});`,
  },
  web: {
    title: "index.html",
    lang: "html",
    code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<!-- \`themes\` accepts a JSON array of theme definitions -->
<theme-kit-provider
  default-theme="ocean-light"
  themes='[
    {
      "name": "ocean-light",
      "meta": { "family": "ocean", "mode": "light", "label": "Ocean Light" },
      "tokens": { "colors": { "background": "#f0f9ff", "primary": "#0284c7" } }
    },
    {
      "name": "ocean-dark",
      "meta": { "family": "ocean", "mode": "dark", "label": "Ocean Dark" },
      "tokens": { "colors": { "background": "#0c1e2e", "primary": "#38bdf8" } }
    }
  ]'
>
  <my-app></my-app>
</theme-kit-provider>`,
  },
  tailwind: {
    title: "main.ts + globals.css",
    lang: "ts",
    code: `// main.ts — register the ocean themes with the runtime
import { createThemeRuntime } from "@theme-kit/core";
import { oceanLight, oceanDark } from "./themes";

createThemeRuntime({
  themes: [oceanLight, oceanDark],
  defaultTheme: "ocean-light",
});

// globals.css — tokens map to utilities automatically
// @import "tailwindcss";
// @import "@theme-kit/tailwind";
//
// body { @apply bg-background text-foreground; }`,
  },
  astro: {
    title: "src/pages/index.astro",
    lang: "astro",
    code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
import { oceanLight, oceanDark } from "../themes";
---

<ThemeProviderClient
  themes={[oceanLight, oceanDark]}
  defaultTheme="ocean-light"
/>`,
  },
  nuxt: {
    title: "nuxt.config.ts",
    lang: "ts",
    code: `import { oceanLight, oceanDark } from "./themes";

export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes: [oceanLight, oceanDark],
    defaultTheme: "ocean-light",
    initialMode: "system",
  },
});`,
  },
  remix: {
    title: "app/root.tsx",
    lang: "tsx",
    code: `import { ThemeProvider } from "@theme-kit/remix";
import { oceanLight, oceanDark } from "./themes";

export default function App() {
  return (
    <ThemeProvider themes={[oceanLight, oceanDark]} defaultTheme="ocean-light">
      <Outlet />
    </ThemeProvider>
  );
}`,
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

export function CustomThemesGuide() {
  const [selectedFramework, setSelectedFramework] = useState("react");
  const customSnippet = getExample(customThemeSnippets, selectedFramework);

  return (
    <>
      <section id="define" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={1}
          desc="The smallest building block. A name, an optional family + mode, and nested tokens that become CSS variables."
        >
          Define a theme
        </SectionHeading>
        {snippetBlock(defineSnippet)}
        <Callout className="mt-3">
          <strong>Mode + family</strong>{" "}
          <span className="mx-1 opacity-40">|</span>
          Give light and dark variants the same{" "}
          <code className="mono text-[0.9em]">family</code> so switching mode
          stays within your palette. See{" "}
          <Link href="/core-concepts" className="text-primary no-underline">
            Core Concepts
          </Link>{" "}
          for how families work.
        </Callout>
        <div className="mt-3">{snippetBlock(darkSnippet)}</div>
      </section>

      <section id="extend" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={2}
          desc="Inherit from a base theme and override only the tokens that change."
        >
          Extend & compose
        </SectionHeading>
        {snippetBlock(extendSnippet)}
      </section>

      <section id="register" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={3}
          desc="Pass your themes to the runtime or provider in any framework. The same list works everywhere."
        >
          Register with the runtime
        </SectionHeading>
        {snippetBlock(runtimeSnippet)}
        <div className="mt-3">{snippetBlock(vanillaSnippet)}</div>
      </section>

      <section id="generate" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={4}
          desc="No token math needed — derive an entire light/dark pair from one color, then validate it."
        >
          Generate from a seed
        </SectionHeading>
        {snippetBlock(generatedSnippet)}
      </section>

      <section id="presets" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={5}
          desc="Compose on top of the built-in palettes instead of starting from scratch."
        >
          Presets & brand themes
        </SectionHeading>
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">
            Default presets
          </h3>
          <p className="text-sm opacity-80 mb-3 leading-relaxed">
            Nine curated families —{" "}
            <code className="mono text-[0.9em]">
              oat, berry, mint, citrus, cocoa, plum, iris, sky, graphite
            </code>{" "}
            — each with light + dark. Grab them via{" "}
            <code className="mono text-[0.9em]">getPresetThemes()</code> or
            restyle with{" "}
            <code className="mono text-[0.9em]">
              getPresetThemes(overrides)
            </code>
            .
          </p>
          <CodeBlock
            html={highlightCode(
              `import { getPresetThemes } from "@theme-kit/core";

const themes = getPresetThemes();

const themes = getPresetThemes({
  plum: {
    light: { tokens: { colors: { primary: "#6d28d9" } } },
  },
});`,
              "ts",
            )}
            code={`import { getPresetThemes } from "@theme-kit/core";

const themes = getPresetThemes();

const themes = getPresetThemes({
  plum: {
    light: { tokens: { colors: { primary: "#6d28d9" } } },
  },
});`}
            language="ts"
            className="rounded-lg m-0"
          />
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">
          Brand presets
        </h3>
        <p className="text-sm opacity-80 mb-3 leading-relaxed">
          Real-world brand palettes — Apple, GitHub, Vercel, Slack, Discord —
          via <code className="mono text-[0.9em]">getBrandPresets()</code>. Each
          is a ready-to-register theme pair.
        </p>
        <CodeBlock
          html={highlightCode(
            `import { getBrandPresets } from "@theme-kit/core";

const themes = getBrandPresets();

const brand = themes.filter((t) => t.meta?.family === "github");
createThemeRuntime({ themes: brand, defaultTheme: "github-light" });`,
            "ts",
          )}
          code={`import { getBrandPresets } from "@theme-kit/core";

const themes = getBrandPresets();

const brand = themes.filter((t) => t.meta?.family === "github");
createThemeRuntime({ themes: brand, defaultTheme: "github-light" });`}
          language="ts"
          className="rounded-lg m-0"
        />

        <div className="rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">
            Accessibility profiles
          </h3>
          <p className="text-sm opacity-80 leading-relaxed">
            High-contrast and large-text variants ship via{" "}
            <code className="mono text-[0.9em]">
              getAccessibilityProfiles()
            </code>{" "}
            and are tagged{" "}
            <code className="mono text-[0.9em]">"accessibility"</code> for
            filtering.
          </p>
        </div>
      </section>

      <section id="use-your-theme" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={6}
          desc="The theme you defined above is a plain object — the same two objects register in every framework. Pick yours to see the exact integration with the custom ocean family."
        >
          Use your custom theme
        </SectionHeading>
        <FrameworkPicker
          value={selectedFramework}
          onChange={setSelectedFramework}
          label="Pick your framework"
        />
        <CodeBlock
          html={highlightCode(customSnippet.code, customSnippet.lang)}
          code={customSnippet.code}
          language={customSnippet.lang}
          filename={customSnippet.title}
          className="rounded-lg m-0"
        />
        <Callout className="mt-3">
          The <code className="mono text-[0.9em]">oceanLight</code> and{" "}
          <code className="mono text-[0.9em]">oceanDark</code> themes come from
          section 1. Register both, set{" "}
          <code className="mono text-[0.9em]">ocean-light</code> as the default,
          and mode toggling stays inside your family. See{" "}
          <Link href="/framework-guides" className="text-primary no-underline">
            Framework Guides
          </Link>{" "}
          for a deeper walkthrough of each integration.
        </Callout>
      </section>

      <section id="next" className="scroll-mt-24">
        <SectionHeading
          num={7}
          desc="Now that you have a custom theme, make it a first-class part of your product."
        >
          What&apos;s next
        </SectionHeading>
        <div className="flex flex-col gap-2">
          <Link
            href="/theme-studio"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Theme Studio</div>
              <div className="text-xs opacity-60">
                Preview a generated light/dark pair live and apply it.
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
                Explore families, history, multi-window sync and scheduling.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
          <Link
            href="/packages/core"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">@theme-kit/core</div>
              <div className="text-xs opacity-60">
                Full reference for every model, registry and runtime API.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
