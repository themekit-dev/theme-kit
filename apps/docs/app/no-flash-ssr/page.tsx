import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { FrameworkTabs, type FrameworkExample } from "../../components/framework-tabs";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "No Flash SSR",
  description:
    "Zero-flash theming for every framework. Next, Nuxt, Remix, Astro and Angular resolve the theme on the server; React, Vue, Svelte and Solid providers are flash-proof out of the box.",
};

const pageHeadings = buildPageHeadings([
  { text: "Flash-proof out of the box", level: 2 },
  { text: "The mechanism", level: 2 },
  { text: "Framework snippets", level: 2 },
  { text: "When you still need the bootstrap script", level: 2 },
]);

const reactSnippet = {
  label: "React (SPA)",
  lang: "tsx",
  filename: "main.tsx",
  code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";

// Flash-proof out of the box. The provider reads the persisted selection
// (localStorage "theme-selection"), applies it before first paint, and
// injects a blocking bootstrap script — no vite plugin or manual <head>
// script required.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider themes={themes} defaultTheme="light" initialMode="system">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
`,
};

const vueSnippet = {
  label: "Vue",
  lang: "ts",
  filename: "main.ts",
  code: `import { createApp } from "vue";
import { ThemeProvider } from "@theme-kit/vue";

// Flash-proof out of the box — the provider injects the blocking bootstrap
// and applies the persisted theme before first paint. No extra setup.
createApp({
  render: () => h(ThemeProvider, { themes, defaultTheme: "light", initialMode: "system" },
    () => h(App)),
}).mount("#app");
`,
};

const svelteSnippet = {
  label: "Svelte",
  lang: "svelte",
  filename: "+layout.svelte",
  code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  import { themes } from "$lib/themes";
</script>

<!-- Flash-proof out of the box — the provider injects the blocking
     bootstrap and applies the persisted theme before first paint. -->
<ThemeProvider themes={themes} defaultTheme="light">
  <slot />
</ThemeProvider>
`,
};

const solidSnippet = {
  label: "Solid",
  lang: "tsx",
  filename: "index.tsx",
  code: `import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";

// Flash-proof out of the box — the provider injects the blocking bootstrap
// and applies the persisted theme before first paint.
render(
  () => (
    <ThemeProvider themes={themes} defaultTheme="light" initialMode="system">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);
`,
};

const examples: FrameworkExample[] = [reactSnippet, vueSnippet, svelteSnippet, solidSnippet].map(
  (s) => ({
    ...s,
    html: highlightCode(s.code, s.lang),
  }),
);

export default function NoFlashSSRPage() {
  return (
    <DocsLayout headings={pageHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Zero Flash"
          title="No Flash SSR"
          description="Every framework is flash-proof — either the server resolves the theme, or the provider applies it before first paint."
        />

        <section id="out-of-the-box" className="scroll-mt-24 mb-10">
          <SectionHeading num={1}>Flash-proof out of the box</SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-4">
            <strong>SSR integrations</strong> (Next.js, Nuxt, Remix, Astro, Angular) resolve the
            persisted theme on the server and emit the blocking bootstrap themselves — zero setup.
            <strong> Client providers</strong> (React, Vue, Svelte, Solid) are now also flash-proof
            with zero setup: they read the persisted selection, apply the theme before first paint
            via a layout effect, and inject a blocking bootstrap script. There is no vite plugin or
            manual <code className="mono text-[0.9em]">&lt;head&gt;</code> script to wire.
          </p>
          <Callout variant="neutral" title="One provider, zero overhead">
            <p className="text-sm leading-relaxed">
              You don&apos;t need the vite plugin or a manual{" "}
              <code className="mono text-[0.9em]">createThemeBootstrapScript</code> call anymore —
              the provider handles it. The plugin remains available if you want the theme applied
              on the absolute first frame before the bundle even loads.
            </p>
          </Callout>
        </section>

        <section id="mechanism" className="scroll-mt-24 mb-10">
          <SectionHeading num={2}>The mechanism</SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-3">
            Every provider does the same three things on mount, synchronously before the browser
            paints:
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-sm opacity-80">
            <li>Reads the persisted selection (<code className="mono text-[0.9em]">theme-selection</code>).</li>
            <li>Injects a blocking <code className="mono text-[0.9em]">&lt;script&gt;</code> into{" "}
              <code className="mono text-[0.9em]">&lt;head&gt;</code> that resolves the family +
              effective mode and writes the CSS variables + attributes.</li>
            <li>Creates the DOM + CSS-variable bindings, which apply the same theme.</li>
          </ol>
          <p className="text-sm leading-relaxed opacity-80 mt-3">
            Hydration matches the pre-paint markup, so there is no flash and no mismatch.
          </p>
        </section>

        <section id="framework-snippets" className="scroll-mt-24 mb-10">
          <SectionHeading num={3}>Framework snippets</SectionHeading>
          <FrameworkTabs examples={examples} scrollToId="framework-snippets" />
        </section>

        <section id="still-need-bootstrap" className="scroll-mt-24 mb-10">
          <SectionHeading num={4}>When you still want the bootstrap script</SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-3">
            The providers apply the theme before the first paint of the application content. If you
            want the theme applied on the very first frame — before the JavaScript bundle even
            loads — add the{" "}
            <Link href="/vite-plugin" className="text-primary hover:underline">
              Vite plugin
            </Link>{" "}
            (build-time, zero runtime cost) or inline{" "}
            <code className="mono text-[0.9em]">createThemeBootstrapScript</code> output into{" "}
            <code className="mono text-[0.9em]">index.html</code>. This is optional and only matters
            for slower bundles.
          </p>
        </section>
      </div>
    </DocsLayout>
  );
}
