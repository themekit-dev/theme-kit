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
    "Zero-flash theming for frameworks without a built-in bootstrap: Vue, Svelte, Solid, and React SPAs — inline the blocking script and never flash the wrong theme again.",
};

const pageHeadings = buildPageHeadings([
  { text: "Which frameworks need this?", level: 2 },
  { text: "The pattern", level: 2 },
  { text: "Framework snippets", level: 2 },
  { text: "Matching the provider", level: 2 },
]);

const vueSnippet = {
  label: "Vue",
  lang: "ts",
  filename: "head.ts",
  code: `import { createVueThemeBootstrapScript } from "@theme-kit/vue";
import { themes } from "./themes";

// A blocking <script> that reads the persisted selection (localStorage
// "theme-selection"), resolves the theme, and applies the CSS variables
// before first paint. Emit it inside <head>:
//
//   <script>${"${bootstrap}"}</script>
//
// For a plain Vue SPA, inline it into index.html (or the head at build time).
// For Vite, the @theme-kit/core/vite plugin does this for you.
const bootstrap = createVueThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
});
`,
};

const svelteSnippet = {
  label: "Svelte",
  lang: "ts",
  filename: "+layout.ts",
  code: `import { createSvelteThemeBootstrapScript } from "@theme-kit/svelte";
import { themes } from "$lib/themes";

// Return the blocking script from a SvelteKit load function and emit it in
// the layout's <svelte:head> so it runs before first paint:
//
//   <svelte:head><script>{bootstrap}</script></svelte:head>
//
// In a plain Svelte SPA, inline it into index.html instead.
export const load = () => ({
  bootstrap: createSvelteThemeBootstrapScript({
    themes,
    defaultTheme: "light",
  }),
});
`,
};

const solidSnippet = {
  label: "Solid",
  lang: "tsx",
  filename: "index.html (head)",
  code: `import { createSolidThemeBootstrapScript } from "@theme-kit/solid";
import { themes } from "./themes";

// A blocking <script> for <head>, applied before your entry bundle:
//
//   <script>${"${bootstrap}"}</script>
//
// For a Solid SPA, inline it into index.html (or use the
// @theme-kit/core/vite plugin). For SolidStart SSR, emit it in the head.
const bootstrap = createSolidThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
});
`,
};

const reactSnippet = {
  label: "React (SPA)",
  lang: "tsx",
  filename: "index.html (head)",
  code: `import { createThemeBootstrapScript } from "@theme-kit/core";
import { themes } from "./themes";

// React SPAs have no server to resolve the theme, so inline a blocking
// script at build time. The @theme-kit/core/vite plugin does this
// automatically; manually it looks like:
//
//   <script>${"${bootstrap}"}</script>
//
// It reads the persisted selection and applies the theme before first paint.
// Then <ThemeProvider themes={themes} defaultTheme="light"> hydrates against
// the same variables.
const bootstrap = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
});
`,
};

const examples: FrameworkExample[] = [vueSnippet, svelteSnippet, solidSnippet, reactSnippet].map(
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
          description="Frameworks without a built-in bootstrap (Vue, Svelte, Solid, React SPAs) need one blocking script in the head — here's exactly how."
        />

        <section id="which-frameworks" className="scroll-mt-24 mb-10">
          <SectionHeading num={1}>Which frameworks need this?</SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-4">
            The following integrations provide zero-flash <strong>out of the box</strong> — the
            server resolves the persisted selection and the provider emits the blocking
            bootstrap for you:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm opacity-80">
            <li>
              <Link href="/framework-guides/next" className="text-primary hover:underline">
                Next.js
              </Link>{" "}
              — cookies + fingerprint + blocking script in the layout
            </li>
            <li>
              <Link href="/framework-guides/nuxt" className="text-primary hover:underline">
                Nuxt
              </Link>{" "}
              — module wires SSR persistence + bootstrap
            </li>
            <li>
              <Link href="/framework-guides/remix" className="text-primary hover:underline">
                Remix
              </Link>{" "}
              — <code className="mono text-[0.9em]">getInitialThemeState</code> +{" "}
              <code className="mono text-[0.9em]">&lt;ThemeHead&gt;</code>
            </li>
            <li>
              <Link href="/framework-guides/astro" className="text-primary hover:underline">
                Astro
              </Link>{" "}
              — <code className="mono text-[0.9em]">createBlockingScript</code>
            </li>
            <li>
              <Link href="/framework-guides/angular" className="text-primary hover:underline">
                Angular
              </Link>{" "}
              — <code className="mono text-[0.9em]">createBlockingScriptContent</code>
            </li>
          </ul>
          <p className="text-sm leading-relaxed opacity-80 mt-4">
            <strong>Vue, Svelte, Solid, and React SPAs</strong> do not — their providers are
            client-side, so the persisted theme applies only after hydration. Use the snippet
            below for your framework.
          </p>
        </section>

        <section id="the-pattern" className="scroll-mt-24 mb-10">
          <SectionHeading num={2}>The pattern</SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-3">
            Every framework follows the same shape: build a blocking script that reads the
            persisted selection from <code className="mono text-[0.9em]">localStorage</code>{" "}
            (<code className="mono text-[0.9em]">theme-selection</code>), resolves the family +
            effective mode, and writes the CSS variables +{" "}
            <code className="mono text-[0.9em]">data-theme</code> attributes — then inline it in{" "}
            <code className="mono text-[0.9em]">&lt;head&gt;</code> so it runs before first
            paint. The provider hydrates against the same variables, so there is no flash and no
            hydration mismatch.
          </p>
          <Callout variant="neutral" title="Framework-named helpers">
            <p className="text-sm leading-relaxed">
              <code className="mono text-[0.9em]">createVueThemeBootstrapScript</code>,{" "}
              <code className="mono text-[0.9em]">createSvelteThemeBootstrapScript</code>, and{" "}
              <code className="mono text-[0.9em]">createSolidThemeBootstrapScript</code> are thin
              wrappers over core&apos;s{" "}
              <code className="mono text-[0.9em]">createThemeBootstrapScript</code>, typed for
              each framework so you import from the package you already use.
            </p>
          </Callout>
        </section>

        <section id="framework-snippets" className="scroll-mt-24 mb-10">
          <SectionHeading num={3}>Framework snippets</SectionHeading>
          <FrameworkTabs examples={examples} scrollToId="framework-snippets" />
        </section>

        <section id="matching-the-provider" className="scroll-mt-24 mb-10">
          <SectionHeading num={4}>Matching the provider</SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-3">
            The <code className="mono text-[0.9em]">defaultTheme</code> and{" "}
            <code className="mono text-[0.9em]">initialMode</code> you pass to the script must
            match the <code className="mono text-[0.9em]">ThemeProvider</code> props, and the
            script&apos;s <code className="mono text-[0.9em]">storageKey</code> must match the
            provider&apos;s persistence key (both default to{" "}
            <code className="mono text-[0.9em]">"theme-selection"</code>). When they match, the
            first paint and the hydrated runtime agree.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto">
            <pre className="mono text-xs leading-relaxed">{`<script>{bootstrap}</script>
<ThemeProvider themes={themes} defaultTheme="light" initialMode="system">`}</pre>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
