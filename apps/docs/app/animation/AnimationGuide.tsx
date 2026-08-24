"use client";

import { useState } from "react";
import Link from "next/link";
import { highlightCode } from "../../lib/highlight";
import { CodeBlock } from "../../components/code-block";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { FrameworkPicker, getExample } from "../../components/framework-picker";

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

const presetTable = [
  {
    name: "smooth",
    props:
      "color, background(-color), border-color, outline-color, fill, stroke, border-radius, box-shadow, text-shadow, opacity",
    when:
      "Default. Full, rich cross-fade for the whole site — pick this unless you have a reason not to.",
  },
  {
    name: "subtle",
    props:
      "color, background(-color), border-color, outline-color, fill, stroke, box-shadow, opacity",
    when:
      "Lower motion profile — skips radius/shadow/text-shadow so the switch reads quieter.",
  },
  {
    name: "instant",
    props: "none (interpolation disabled)",
    when: "Never interpolate — always a hard, instant switch (also respects reduced motion).",
  },
  {
    name: "[string, ...]",
    props: "exactly the properties you list",
    when:
      "Fine-grained control — e.g. animate only color and background-color, nothing else.",
  },
];

// Concise, API-accurate "enable a transition" snippet per framework.
const enableExamples: Record<
  string,
  { label: string; lang: string; title: string; code: string }
> = {
  react: {
    label: "React",
    lang: "tsx",
    title: "App.tsx",
    code: `import { ThemeProvider } from "@theme-kit/react";

<ThemeProvider
  themes={themes}
  defaultTheme="theme-kit-default-light"
  transition={{ enabled: true, preset: "smooth" }}
>
  <YourApp />
</ThemeProvider>`,
  },
  next: {
    label: "Next.js",
    lang: "tsx",
    title: "app/layout.tsx",
    code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

<ThemeProvider
  themes={themes}
  defaultTheme="theme-kit-default-light"
  transition={{ enabled: true, preset: "smooth" }}
>
  {children}
</ThemeProvider>`,
  },
  vue: {
    label: "Vue",
    lang: "vue",
    title: "App.vue",
    code: `<script setup>
import { ThemeProvider } from "@theme-kit/vue";
</script>

<template>
  <ThemeProvider
    :themes="themes"
    defaultTheme="theme-kit-default-light"
    :transition="{ enabled: true, preset: 'smooth' }"
  >
    <YourApp />
  </ThemeProvider>
</template>`,
  },
  svelte: {
    label: "Svelte",
    lang: "svelte",
    title: "app.svelte",
    code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
</script>

<ThemeProvider
  themes={themes}
  defaultTheme="theme-kit-default-light"
  transition={{ enabled: true, preset: "smooth" }}
>
  <YourApp />
</ThemeProvider>`,
  },
  solid: {
    label: "Solid",
    lang: "tsx",
    title: "App.tsx",
    code: `import { ThemeProvider } from "@theme-kit/solid";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    >
      <YourApp />
    </ThemeProvider>
  );
}`,
  },
  angular: {
    label: "Angular",
    lang: "ts",
    title: "app.config.ts",
    code: `import { provideThemeKit } from "@theme-kit/angular";

bootstrapApplication(AppComponent, {
  providers: [
    provideThemeKit({
      themes,
      defaultTheme: "theme-kit-default-light",
      transition: { enabled: true, preset: "smooth" },
    }),
  ],
});`,
  },
  web: {
    label: "Web Components",
    lang: "html",
    title: "index.html",
    code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();

  const provider = document.querySelector("theme-kit-provider");
  provider.setAttribute("themes", JSON.stringify(themes));
  provider.setAttribute("default-theme", "theme-kit-default-light");
  provider.setAttribute(
    "transition",
    JSON.stringify({ enabled: true, preset: "smooth" })
  );
</script>

<theme-kit-provider>
  <your-app></your-app>
</theme-kit-provider>`,
  },
  astro: {
    label: "Astro",
    lang: "astro",
    title: "src/pages/index.astro",
    code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
import { themes } from "./themes";
---

<ThemeProviderClient
  themes={themes}
  defaultTheme="theme-kit-default-light"
  transition={{ enabled: true, preset: "smooth" }}
/>
<ThemeSwitcher client:load />`,
  },
  tailwind: {
    label: "Tailwind CSS",
    lang: "ts",
    title: "runtime.ts",
    code: `import { createThemeRuntime } from "@theme-kit/core";
import { synchronizeDarkClass } from "@theme-kit/tailwind";
import { themes } from "./themes";

// Tailwind maps tokens to CSS variables (via @import "@theme-kit/tailwind");
// the actual transition is owned by the runtime in your framework shell.
const runtime = createThemeRuntime({
  themes,
  defaultTheme: "theme-kit-default-light",
  transition: { enabled: true, preset: "smooth" },
});
synchronizeDarkClass(runtime.store.get());`,
  },
  nuxt: {
    label: "Nuxt",
    lang: "ts",
    title: "nuxt.config.ts",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "theme-kit-default-light",
    transition: { enabled: true, preset: "smooth" },
  },
});`,
  },
  remix: {
    label: "Remix",
    lang: "tsx",
    title: "app/root.tsx",
    code: `import { ThemeProvider } from "@theme-kit/remix";

export default function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    >
      <Outlet />
    </ThemeProvider>
  );
}`,
  },
  vanilla: {
    label: "Vanilla JS",
    lang: "ts",
    title: "main.ts",
    code: `import { createThemeRuntime } from "@theme-kit/core";
import { themes } from "./themes";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "theme-kit-default-light",
  transition: { enabled: true, preset: "smooth" },
});`,
  },
};

const viewTransitionSnippet = {
  lang: "ts",
  title: "view-transition.ts",
  code: `import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  transition: {
    enabled: true,
    useViewTransition: true,
    duration: 300,
  },
});`,
};

const bestPracticesSnippet = {
  lang: "ts",
  title: "do-and-dont.css",
  code: `/* ── Tailwind ─────────────────────────────────────────────────────── */
/* ✗ DON'T — animating theme tokens via Tailwind utility classes     */
.btn {
  @apply transition-colors;            /* ← re-eases theme colors → lag */
}
.card {
  @apply transition-all;               /* ← catches managed properties too */
}

/* ✓ DO — animate non-theme properties with Tailwind                  */
.btn {
  @apply transition-transform duration-200;
}
.btn:hover {
  @apply -translate-y-0.5;             /* hover lift — fine */
}

/* ── Native CSS ───────────────────────────────────────────────────── */
/* ✗ DON'T — color transition on themed elements                      */
button {
  transition: background-color 0.3s;   /* ← re-eases inherited var → lag */
}
* {
  transition: color 0.2s, background-color 0.2s; /* ← catches everything */
}

/* ✓ DO — animate properties the theme doesn't manage                 */
.toast {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}`,
};

const frameworkSnippets: Record<
  string,
  { label: string; lang: string; title: string; code: string }
> = {
  react: {
    label: "React",
    lang: "tsx",
    title: "App.tsx",
    code: `import { ThemeProvider, ThemeScope } from "@theme-kit/react";
import { themes } from "./themes";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    >
      <YourApp />

      {/* Nested region with its own theme + transition */}
      <ThemeScope
        theme="plum-dark"
        transition={{ enabled: true, duration: 300, easing: "ease" }}
      >
        <Widget />
      </ThemeScope>
    </ThemeProvider>
  );
}`,
  },
  next: {
    label: "Next.js",
    lang: "tsx",
    title: "app/layout.tsx",
    code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";
import { themes } from "./theme/themes";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    >
      {children}
    </ThemeProvider>
  );
}`,
  },
  vue: {
    label: "Vue",
    lang: "vue",
    title: "App.vue",
    code: `<script setup>
import { ThemeProvider, ThemeScope } from "@theme-kit/vue";
import { themes } from "./themes";
</script>

<template>
  <ThemeProvider
    :themes="themes"
    defaultTheme="theme-kit-default-light"
    :transition="{ enabled: true, preset: 'smooth' }"
  >
    <YourApp />

    <!-- Nested scoped region -->
    <ThemeScope
      theme="plum-dark"
      :transition="{ enabled: true, duration: 300, easing: 'ease' }"
    >
      <Widget />
    </ThemeScope>
  </ThemeProvider>
</template>`,
  },
  svelte: {
    label: "Svelte",
    lang: "svelte",
    title: "app.svelte",
    code: `<script>
  import { ThemeProvider, ThemeScope } from "@theme-kit/svelte";
  import { themes } from "./themes";
</script>

<ThemeProvider
  themes={themes}
  defaultTheme="theme-kit-default-light"
  transition={{ enabled: true, preset: "smooth" }}
>
  <YourApp />

  <!-- Nested scoped region -->
  <ThemeScope
    theme="plum-dark"
    transition={{ enabled: true, duration: 300, easing: "ease" }}
  >
    <Widget />
  </ThemeScope>
</ThemeProvider>`,
  },
  solid: {
    label: "Solid",
    lang: "tsx",
    title: "App.tsx",
    code: `import { ThemeProvider, ThemeScope } from "@theme-kit/solid";
import { themes } from "./themes";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    >
      <YourApp />

      {/* Nested scoped region */}
      <ThemeScope
        theme="plum-dark"
        transition={{ enabled: true, duration: 300, easing: "ease" }}
      >
        <Widget />
      </ThemeScope>
    </ThemeProvider>
  );
}`,
  },
  angular: {
    label: "Angular",
    lang: "ts",
    title: "app.config.ts",
    code: `import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app.component";
import { themes } from "./themes";

bootstrapApplication(AppComponent, {
  providers: [
    provideThemeKit({
      themes,
      defaultTheme: "theme-kit-default-light",
      transition: { enabled: true, preset: "smooth" },
    }),
  ],
});

// app.component.html
<app-root>
  <your-app></your-app>

  <!-- Nested scoped region via directive -->
  <div
    themeKitScope="plum-dark"
    themeKitScopeTransition="{ enabled: true, duration: 300, easing: 'ease' }"
  >
    <app-widget></app-widget>
  </div>
</app-root>`,
  },
  web: {
    label: "Web Components",
    lang: "html",
    title: "index.html",
    code: `<!-- Themes register as a JSON attribute so they survive server render -->
<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  import { themes } from "./themes.js";

  defineCustomElements();
  const provider = document.querySelector("theme-kit-provider");
  provider.setAttribute("themes", JSON.stringify(themes));
  provider.setAttribute("default-theme", "theme-kit-default-light");
  provider.setAttribute(
    "transition",
    JSON.stringify({ enabled: true, preset: "smooth" })
  );
</script>

<theme-kit-provider>
  <your-app></your-app>

  <!-- Nested scoped region -->
  <theme-kit-scope
    theme="plum-dark"
    theme-transition='{"enabled":true,"duration":300,"easing":"ease"}'
  >
    <your-widget></your-widget>
  </theme-kit-scope>
</theme-kit-provider>`,
  },
  tailwind: {
    label: "Tailwind CSS",
    lang: "css",
    title: "globals.css",
    code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

/* Tailwind is a CSS layer — transitions are owned by the runtime
   (React/Vue/Svelte shell above). Theme Kit exposes transition
   variables so you can animate token-driven utilities. */
@theme {
  --transition-duration: 300ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-primary { transition: background-color var(--transition-duration) var(--transition-easing); }`,
  },
  astro: {
    label: "Astro",
    lang: "astro",
    title: "src/pages/index.astro",
    code: `---
import { ThemeProviderClient } from "@theme-kit/astro";
import { themes } from "./themes";
---

<html>
  <head>
    <title>My site</title>
  </head>
  <body>
    <ThemeProviderClient
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    />
    <ThemeSwitcher client:load />
  </body>
</html>`,
  },
  nuxt: {
    label: "Nuxt",
    lang: "ts",
    title: "nuxt.config.ts",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "theme-kit-default-light",
    transition: { enabled: true, preset: "smooth" },
  },
});

// app.vue
<template>
  <ThemeProvider :transition="{ enabled: true, preset: 'smooth' }">
    <NuxtPage />

    <!-- Nested scoped region -->
    <ThemeScope
      theme="plum-dark"
      :transition="{ enabled: true, duration: 300, easing: 'ease' }"
    >
      <Widget />
    </ThemeScope>
  </ThemeProvider>
</template>`,
  },
  remix: {
    label: "Remix",
    lang: "tsx",
    title: "app/root.tsx",
    code: `import { ThemeProvider } from "@theme-kit/remix";
import { themes } from "./themes";

export default function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={{ enabled: true, preset: "smooth" }}
    >
      <Outlet />
    </ThemeProvider>
  );
}`,
  },
  vanilla: {
    label: "Vanilla JS",
    lang: "ts",
    title: "main.ts",
    code: `import { createThemeRuntime, createScopedThemeBinding } from "@theme-kit/core";
import { themes } from "./themes";

// The transition prop is set once, at runtime creation.
const runtime = createThemeRuntime({
  themes,
  defaultTheme: "theme-kit-default-light",
  transition: { enabled: true, preset: "smooth" },
});

// Apply a scoped theme inside a vanilla element
const binding = createScopedThemeBinding(themes, element, "plum-dark", {
  transition: { duration: 300, easing: "ease" },
});`,
  },
};

export function AnimationGuide() {
  const [selectedFramework, setSelectedFramework] = useState("react");
  const selected = getExample(frameworkSnippets, selectedFramework);
  const enableExample = getExample(enableExamples, selectedFramework);

  return (
    <>
      <FrameworkPicker
        value={selectedFramework}
        onChange={setSelectedFramework}
        label="Pick your framework"
        scrollToId="enable"
      />

      <section id="enable" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={1}
          desc="One prop on the provider — pick a preset, done."
        >
          Enable it
        </SectionHeading>
        {snippetBlock(enableExample)}
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-3">
            Same prop on every framework
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            {[
              ["React / Next / Svelte / Solid / Remix / Astro", 'transition={{ enabled: true, preset: "smooth" }}'],
              ["Vue / Nuxt", `:transition="{ enabled: true, preset: 'smooth' }"`],
              ["Angular", `provideThemeKit({ transition: { enabled: true, preset: "smooth" } })`],
              ["Web Components", `<theme-kit-provider transition='{"enabled":true,"preset":"smooth"}'></theme-kit-provider>`],
              ["Vanilla JS", `createThemeRuntime({ transition: { enabled: true, preset: "smooth" } })`],
              ["Tailwind", `@import "@theme-kit/tailwind"`],
            ].map(([framework, syntax]) => (
              <div key={framework} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium opacity-60">{framework}</span>
                <code className="mono text-xs px-2 py-1 rounded bg-muted/60 block">
                  {syntax}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="frameworks" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={2}
          desc="Step-by-step examples for every supported framework."
        >
          Enable transitions in your framework
        </SectionHeading>
        <p className="text-sm opacity-70 leading-relaxed">
          Pass the same <code className="mono text-xs">transition</code> object
          to your provider (or runtime). Every framework exposes it with the
          same shape — only the binding syntax changes.
        </p>
        <div className="mt-4">
          {snippetBlock(selected)}
        </div>
        <Callout className="mt-4" title="Step-by-step:">
          <ol className="list-decimal list-inside mt-2 flex flex-col gap-1">
            <li>
              <strong>Install</strong> the framework package (
              <code className="mono text-xs">@theme-kit/react</code>,{" "}
              <code className="mono text-xs">@theme-kit/vue</code>, etc.).
            </li>
            <li>
              <strong>Register</strong> your themes with the provider or runtime.
            </li>
            <li>
              <strong>Enable</strong> transitions by adding the{" "}
              <code className="mono text-xs">transition</code> prop (
              <code className="mono text-xs">:transition</code> in Vue/Svelte/Nuxt,
              attribute JSON in Web Components).
            </li>
            <li>
              <strong>Choose</strong> a preset —{" "}
              <code className="mono text-xs">"smooth"</code> works for most
              sites.
            </li>
            <li>
              <strong>Scope</strong> a nested region with{" "}
              <code className="mono text-xs">ThemeScope</code> (
              <code className="mono text-xs">themeKitScope</code> in Angular,
              <code className="mono text-xs">theme-kit-scope</code> in Web
              Components) for independent subtrees.
            </li>
          </ol>
        </Callout>
      </section>

      <section id="view-transitions" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={3}
          desc="The cleanest cross-fade — no white intermediates, ever."
        >
          View Transitions API
        </SectionHeading>
        {snippetBlock(viewTransitionSnippet)}
        <Callout className="mt-3">
          With <code className="mono text-[0.9em]">useViewTransition: true</code>{" "}
          the new theme is painted <em>beneath</em> a fading snapshot of the
          old one — the opposite of interpolating directly from near-white
          colors — so light→dark switches never wash through white. Browsers
          without the API (Firefox/Safari) fall back to the inherited{" "}
          <code className="mono text-[0.9em]">--theme-color-*</code>{" "}
          interpolation automatically.
        </Callout>
      </section>

      <section id="things-to-avoid" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={4}
          desc="Theme colors animate through the provider — adding your own color transition on top re-eases the same value and lags. Everything else (hover, transform, opacity, shadow) is yours to animate freely."
        >
          Things to avoid
        </SectionHeading>

        <p className="text-sm opacity-70 leading-relaxed mb-4">
          <strong className="opacity-100">Theme transitions are owned by theme-kit.</strong>{" "}
          The provider&apos;s transition engine (configured via the{" "}
          <code className="mono text-[0.9em]">transition</code> prop on{" "}
          <code className="mono text-[0.9em]">ThemeProvider</code> or{" "}
          <code className="mono text-[0.9em]">createThemeRuntime</code>)
          interpolates the inherited <code className="mono text-[0.9em]">--theme-color-*</code>{" "}
          variables every time the active theme changes — automatically, with
          no extra CSS from you. This is how every theme switch on this docs
          site animates smoothly, and it works the same way in your app.
          You don&apos;t need to (and should not) add your own color transition.
        </p>
        <p className="text-sm opacity-70 leading-relaxed mb-4">
          If you do add one — a{" "}
          <code className="mono text-[0.9em]">transition-colors</code> utility
          class in Tailwind, or a plain{" "}
          <code className="mono text-[0.9em]">transition: background-color 0.3s</code>{" "}
          in native CSS — that element re-eases the same value{" "}
          <em>again</em>, on top of theme-kit&apos;s own interpolation. The
          result is a double-eased, laggy switch. Leave color transitions to
          the library, in both Tailwind and hand-written CSS.
        </p>

        {snippetBlock(bestPracticesSnippet)}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success text-[11px] font-bold">✓</span>
              <span className="font-semibold text-sm">DO</span>
            </div>
            <ul className="flex flex-col gap-1.5 text-[13px] opacity-80 leading-relaxed">
              <li>
                <strong>Tailwind:</strong> use{" "}
                <code className="mono text-[0.9em]">transition-transform</code> /{" "}
                <code className="mono text-[0.9em]">transition-opacity</code>{" "}
                with <code className="mono text-[0.9em]">hover:scale</code>,{" "}
                <code className="mono text-[0.9em]">hover:translate</code>,{" "}
                <code className="mono text-[0.9em]">hover:shadow</code>.
              </li>
              <li>
                <strong>Native CSS:</strong> write{" "}
                <code className="mono text-[0.9em]">transition: transform 0.2s ease</code>,{" "}
                <code className="mono text-[0.9em]">opacity 0.2s</code>,{" "}
                <code className="mono text-[0.9em]">box-shadow 0.2s</code> on
                toasts, overlays, and cards — none of these are theme-managed.
              </li>
              <li>Both: animate <code className="mono text-[0.9em]">outline</code> / <code className="mono text-[0.9em]">outline-offset</code> for focus rings.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15 text-destructive text-[11px] font-bold">✗</span>
              <span className="font-semibold text-sm">DON'T</span>
            </div>
            <ul className="flex flex-col gap-1.5 text-[13px] opacity-80 leading-relaxed">
              <li>
                <strong>Tailwind:</strong> don&apos;t add{" "}
                <code className="mono text-[0.9em]">transition-colors</code> to
                buttons, cards, or links whose colors are theme tokens — the
                provider already animates those colors on theme change. Avoid{" "}
                <code className="mono text-[0.9em]">transition-all</code> too,
                which catches the managed properties.
              </li>
              <li>
                <strong>Native CSS:</strong> don&apos;t write a{" "}
                <code className="mono text-[0.9em]">transition</code> for{" "}
                <code className="mono text-[0.9em]">color</code>,{" "}
                <code className="mono text-[0.9em]">background-color</code>,{" "}
                <code className="mono text-[0.9em]">border-color</code> on{" "}
                <code className="mono text-[0.9em]">:root</code>,{" "}
                <code className="mono text-[0.9em]">*</code>, or any themed
                element — theme-kit handles that interpolation for you.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="api-reference" className="scroll-mt-24">
        <SectionHeading
          num={5}
          desc="Exports from the transition and animation modules."
        >
          API Reference
        </SectionHeading>
        <div className="flex flex-col gap-4 mt-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                    Export
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "ThemeTransitionOptions",
                    module: "transition",
                    desc: "Interface for configuring transitions — enabled, duration, easing, useViewTransition, preset, properties.",
                  },
                  {
                    name: "TransitionPreset",
                    module: "transition",
                    desc: "\"smooth\" | \"subtle\" | \"instant\" | \"custom\" | string[] — how the transition is filtered.",
                  },
                  {
                    name: "TRANSITION_PRESETS",
                    module: "transition",
                    desc: "The curated property lists behind the smooth / subtle / instant presets.",
                  },
                  {
                    name: "DEFAULT_TRANSITION_PRESET",
                    module: "transition",
                    desc: "The default preset — \"smooth\".",
                  },
                  {
                    name: "DEFAULT_THEME_TRANSITION",
                    module: "transition",
                    desc: "Built-in defaults: enabled, 300ms, cubic-bezier(0.4, 0, 0.2, 1), smooth property list.",
                  },
                  {
                    name: "createThemeDiff",
                    module: "animation",
                    desc: "Compare two variable maps and report which token groups changed.",
                  },
                  {
                    name: "createTransitionPlan",
                    module: "animation",
                    desc: "Turn a ThemeDiff into a TransitionPlan; null when nothing can or should animate.",
                  },
                  {
                    name: "scanForTransition",
                    module: "animation",
                    desc: "TreeWalker scan for elements whose computed style uses a planned property.",
                  },
                  {
                    name: "runThemeAnimation",
                    module: "animation",
                    desc: "Run the attach → flush → swap → cleanup sequence for a theme change.",
                  },
                  {
                    name: "cancelThemeAnimation",
                    module: "animation",
                    desc: "Abort an in-flight theme animation and remove its temporary styles.",
                  },
                  {
                    name: "ThemeDiff / TransitionPlan",
                    module: "animation",
                    desc: "Types describing what changed and how to animate it.",
                  },
                  {
                    name: "createAnimationsPlugin",
                    module: "@theme-kit/core",
                    desc: "Official plugin — attaches a CSS transition to <html> (options.transition) via onBeforeThemeChange. A lightweight, manual alternative to the built-in runtime pipeline.",
                  },
                  {
                    name: "runtime.store.set(theme, { suppressTransition: true })",
                    module: "@theme-kit/core",
                    desc: "The runtime-level toggle. Transitions are configured once at runtime creation; this per-update option forces an instant, non-animated apply for a single switch.",
                  },
                ].map((item) => (
                  <tr key={item.name} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3">
                      <code className="mono text-[0.85em] font-semibold" style={{ color: "var(--theme-color-primary)" }}>
                        {item.name}
                      </code>
                    </td>
                    <td className="px-4 py-3 mono text-xs opacity-50">{item.module}</td>
                    <td className="px-4 py-3 text-sm opacity-70 leading-relaxed">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}