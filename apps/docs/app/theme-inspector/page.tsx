import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { FrameworkTabs } from "../../components/framework-tabs";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "Theme Inspector",
  description:
    "A floating panel that inspects the active theme live — identity, selection, tokens, and the resolved CSS variables — available in every framework.",
};

const snippets: Record<string, { lang: string; title: string; label: string; code: string }> = {
  react: {
    label: "React",
    lang: "tsx",
    title: "App.tsx",
    code: `import { ThemeProvider, ThemeInspector } from "@theme-kit/react";

export function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="plum-light">
      <YourApp />
      <ThemeInspector />
    </ThemeProvider>
  );
}`,
  },
  next: {
    label: "Next.js",
    lang: "tsx",
    title: "components/site-toolbar.tsx",
    code: `"use client";
import { ThemeInspector } from "@theme-kit/next/client";

export function SiteToolbar() {
  return <ThemeInspector bottom={104} right={32} zIndex={50} />;
}`,
  },
  vue: {
    label: "Vue",
    lang: "vue",
    title: "App.vue",
    code: `<script setup>
import { ThemeProvider, ThemeInspector } from "@theme-kit/vue";
</script>

<template>
  <ThemeProvider :themes="themes" defaultTheme="plum-light">
    <YourApp />
    <ThemeInspector :bottom="104" :right="32" />
  </ThemeProvider>
</template>`,
  },
  svelte: {
    label: "Svelte",
    lang: "svelte",
    title: "App.svelte",
    code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  import { themeInspector } from "@theme-kit/svelte";
</script>

<ThemeProvider themes={themes} defaultTheme="plum-light">
  <YourApp />
  <!-- The action mounts a <theme-kit-inspector> into the div -->
  <div use:themeInspector={{ bottom: 104, right: 32 }} />
</ThemeProvider>`,
  },
  solid: {
    label: "Solid",
    lang: "tsx",
    title: "App.tsx",
    code: `import { ThemeProvider, ThemeInspector } from "@theme-kit/solid";

export function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="plum-light">
      <YourApp />
      <ThemeInspector bottom={104} right={32} />
    </ThemeProvider>
  );
}`,
  },
  angular: {
    label: "Angular",
    lang: "ts",
    title: "app.component.ts",
    code: `import { Component } from "@angular/core";
import { provideThemeKit, ThemeInspectorComponent } from "@theme-kit/angular";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ThemeInspectorComponent],
  providers: [provideThemeKit({ themes, defaultTheme: "plum-light" })],
  template: \`
    <your-app />
    <theme-kit-inspector-component [bottom]="104" [right]="32" />
  \`,
})
export class AppComponent {}`,
  },
  astro: {
    label: "Astro",
    lang: "astro",
    title: "src/pages/index.astro",
    code: `---
import ThemeInspector from "@theme-kit/astro/ThemeInspector.astro";
---

<ThemeInspector bottom={104} right={32} />`,
  },
  nuxt: {
    label: "Nuxt",
    lang: "vue",
    title: "app.vue",
    code: `<template>
  <ThemeProvider>
    <YourApp />
    <!-- Auto-imported by the @theme-kit/nuxt module -->
    <ThemeInspector :bottom="104" :right="32" />
  </ThemeProvider>
</template>`,
  },
  remix: {
    label: "Remix",
    lang: "tsx",
    title: "app/root.tsx",
    code: `import { ThemeProvider, ThemeInspector } from "@theme-kit/remix";

export default function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="plum-light">
      <Outlet />
      <ThemeInspector />
    </ThemeProvider>
  );
}`,
  },
  vanilla: {
    label: "Web / Vanilla",
    lang: "html",
    title: "index.html",
    code: `<!DOCTYPE html>
<html>
  <body>
    <theme-kit-provider default-theme="plum-light">
      <your-app></your-app>
      <theme-kit-inspector
        bottom="104"
        right="32"
        z-index="50"
      ></theme-kit-inspector>
    </theme-kit-provider>
    <script type="module">
      import { ThemeKitInspector } from "@theme-kit/web";
      ThemeKitInspector.define();
    </script>
  </body>
</html>`,
  },
};

// Precompute Shiki HTML server-side; the client tab switcher renders only the
// selected framework's snippet.
const frameworkExamples = Object.entries(snippets).map(([key, snippet]) => ({
  label: snippet.label,
  lang: snippet.lang,
  code: snippet.code,
  filename: `${key} — ${snippet.title}`,
  html: highlightCode(snippet.code, snippet.lang),
}));

const propsRows = [
  ["bottom", "number", "104", "Distance from the bottom of the viewport, in px."],
  ["right", "number", "32", "Distance from the right edge of the viewport, in px."],
  ["size", "number", "40", "Toggle button size (width and height), in px."],
  ["zIndex", "number", "9999", "Z-index for the floating toggle and panel."],
];

const stylingRows = [
  ["::part(inspector-toggle)", "Style the floating toggle (background, border, radius, …)."],
  ["::part(inspector-panel)", "Style the popover panel (surface, radius, shadow, …)."],
  ["--theme-color-*", "Every surface uses the active theme's semantic tokens automatically."],
];

export default function ThemeInspectorPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Developer Tools"
          title="Theme Inspector"
          subtitle="@theme-kit/core — the token system"
          description={
            <>
              The <strong className="opacity-100">Theme Inspector</strong> is a
              floating panel that inspects whatever theme is live — its identity,
              the current selection, every flattened token, and the resolved CSS
              variables — and updates in real time as you switch families or
              modes. It&apos;s the fastest way to see what your theme is actually
              producing.
            </>
          }
        />

        <section id="live" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="The eye button floating at the bottom-right of this page is a live Theme Inspector — click it to inspect the theme you're viewing right now."
          >
            Try it on this page
          </SectionHeading>
          <Callout>
            The floating <em>eye</em> button in the corner is the live{" "}
            <code className="mono text-[0.9em]">ThemeInspector</code> mounted by
            this site&apos;s toolbar. Click it and the panel shows the active
            theme&apos;s name, family, mode, tokens and CSS variables — then
            switch families in the header to watch it update in place.
          </Callout>
        </section>

        <section id="usage" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Every framework adapter exposes the inspector as a first-class component — pick your stack."
          >
            Framework usage
          </SectionHeading>
          <FrameworkTabs examples={frameworkExamples} scrollToId="usage" />
          <p className="mt-4 text-sm opacity-70 leading-relaxed">
            Under the hood every framework wrapper mounts the same{" "}
            <code className="mono text-[0.9em]">@theme-kit/web</code>{" "}
            <code className="mono text-[0.9em]">&lt;theme-kit-inspector&gt;</code>{" "}
            custom element, so the behavior and visuals are identical across
            React, Vue, Svelte, Solid, Angular, Astro and vanilla HTML. React and
            Next also ship a native React implementation with the same props.
          </p>
        </section>

        <section id="props" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="All wrappers accept the same positioning and stacking props."
          >
            Props
          </SectionHeading>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-3 py-2 font-semibold">Prop</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Default</th>
                  <th className="px-3 py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {propsRows.map(([prop, type, def, desc]) => (
                  <tr key={prop} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">{prop}</td>
                    <td className="px-3 py-2 text-xs opacity-70">{type}</td>
                    <td className="px-3 py-2 font-mono text-xs opacity-70">{def}</td>
                    <td className="px-3 py-2 text-xs opacity-80">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="styling" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Style the inspector from any framework with CSS ::part() — the toggle and panel are exposed as parts."
          >
            Styling
          </SectionHeading>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {stylingRows.map(([sel, desc]) => (
                  <tr key={sel} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{sel}</td>
                    <td className="px-3 py-2 text-xs opacity-80">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <CodeBlock
              html={highlightCode(
                `/* Works in any framework — plain CSS. */
theme-kit-inspector::part(inspector-toggle) {
  border-radius: 9999px;   /* pill toggle */
  background: var(--theme-color-accent);
}
theme-kit-inspector::part(inspector-panel) {
  border-radius: 20px;
  border-color: var(--theme-color-ring);
}`,
                "css",
              )}
              code={`/* Works in any framework — plain CSS. */
theme-kit-inspector::part(inspector-toggle) {
  border-radius: 9999px;   /* pill toggle */
  background: var(--theme-color-accent);
}
theme-kit-inspector::part(inspector-panel) {
  border-radius: 20px;
  border-color: var(--theme-color-ring);
}`}
              language="css"
              filename="inspector.css"
              className="rounded-lg m-0"
            />
          </div>
        </section>

        <section id="api" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="The web component is the shared implementation — usable directly, or through any wrapper."
          >
            Web component API
          </SectionHeading>
          <CodeBlock
            html={highlightCode(snippets.vanilla!.code, "html")}
            code={snippets.vanilla!.code}
            language="html"
            filename="vanilla — index.html"
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed">
            The custom element reads the nearest{" "}
            <code className="mono text-[0.9em]">&lt;theme-kit-provider&gt;</code>{" "}
            runtime, subscribes to the store, and re-renders the panel whenever
            the theme changes. Attributes mirror the props:{" "}
            <code className="mono text-[0.9em]">bottom</code>,{" "}
            <code className="mono text-[0.9em]">right</code>,{" "}
            <code className="mono text-[0.9em]">size</code>,{" "}
            <code className="mono text-[0.9em]">z-index</code>. Pick a{" "}
            <code className="mono text-[0.9em]">z-index</code> below your modal
            overlays (e.g. a search dialog) so the inspector tucks behind them
            automatically.
          </p>
        </section>

        <section id="next" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="The inspector reads the same runtime that powers everything else."
          >
            Go deeper
          </SectionHeading>
          <div className="flex flex-col gap-2">
            <a
              href="/theme-studio"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Theme Studio</div>
                <div className="text-xs opacity-60">
                  Generate, preview and apply themes from a seed color.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </a>
            <a
              href="/playground"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Playground</div>
                <div className="text-xs opacity-60">
                  Live preview and theme generator.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </a>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
