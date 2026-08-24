import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { FrameworkTabs } from "../../components/framework-tabs";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Zero Flash",
  description:
    "How Theme Kit prevents a flash of the wrong theme: server-side resolution, inline CSS variables, a blocking bootstrap script, and clean hydration on every framework.",
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

const coreSnippet = {
  lang: "ts",
  title: "bootstrap.ts — the whole trick",
  code: `import {
  createThemeBootstrapScript,
  buildThemeCssMap,
  darkModeCSSTemplate,
} from "@theme-kit/core";

// 1) A blocking, dependency-free <script> for <head>. It reads the
//    persisted selection (localStorage "theme-selection"), resolves the
//    family + effective mode ("system" → prefers-color-scheme), and
//    writes the CSS variables + data-theme attrs before first paint.
const bootstrapScript = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
  storageKey: "theme-selection",
});

// 2) For SSR: build the CSS map once, inline the resolved theme's
//    variables into the returned <html>, and add the blocking script.
const cssMap = buildThemeCssMap(themes, { prefix: "theme-" });

// 3) When the initial mode is "system", also emit the dark-mode media
//    fallback so dark-mode users get correct colors with zero JS.
const darkVars = cssMap[resolvedFamily + ":dark"] ?? null;
if (darkVars) {
  const darkFallback = darkModeCSSTemplate(darkVars);
  // → emit as a <style> wrapped in @media (prefers-color-scheme: dark)
}
`,
};

const pipeline = [
  {
    title: "Persist",
    desc: "Every change is mirrored to persistence — localStorage in a SPA, cookies for SSR — so the server knows the selection on the next request.",
  },
  {
    title: "Resolve",
    desc: "Fingerprint-validated cookies/selection are resolved to a concrete theme: family + effective mode (system resolves against prefers-color-scheme).",
  },
  {
    title: "Generate",
    desc: "The resolved theme is flattened to semantic CSS variables (--theme-color-*, --theme-radius-*, fonts, shadows…).",
  },
  {
    title: "Render",
    desc: "The server returns <html> with data-theme, data-theme-mode, data-theme-family, the .dark class and color-scheme — with the variables inlined.",
  },
  {
    title: "Block",
    desc: "A blocking bootstrap script in <head> applies the persisted selection before the first paint for client-only/static setups.",
  },
  {
    title: "Paint",
    desc: "The very first paint is already the user's theme. There is nothing to flash.",
  },
  {
    title: "Hydrate",
    desc: "React/the framework hydrates against the exact same markup (no mismatch) and the runtime takes over all future changes.",
  },
];

const frameworkExamples = [
  {
    label: "React (SPA)",
    lang: "tsx",
    code: `// index.html is static, so inline the bootstrap output at build time.
import { createThemeBootstrapScript } from "@theme-kit/core";

const bootstrap = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
});

// → emit this into <head> as a blocking <script> in index.html:
//   <script>${"${bootstrap}"}</script>
//
// It runs before your bundle, so the correct theme is painted on the
// very first frame. Then the provider hydrates against those same vars.

import { ThemeProvider } from "@theme-kit/react";
root.render(
  <ThemeProvider themes={themes} defaultTheme="light">
    <App />
  </ThemeProvider>,
);`,
  },
  {
    label: "Next.js",
    lang: "tsx",
    code: `// app/layout.tsx — a Server Component, no "use client" required.
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider themes={themes} defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}

// Reads theme-mode / theme-family / theme-fingerprint cookies, validates
// the fingerprint, resolves the initial theme, and returns:
//   <html data-theme="..." data-theme-mode="..." class="dark">
// with the resolved CSS variables inlined plus a blocking script in <head>.
// Hydration matches this SSR markup exactly — zero flash, zero mismatch.`,
  },
  {
    label: "Vue / Nuxt",
    lang: "ts",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "light",
    initialMode: "system",
  },
});

// The module's runtime plugin wires SSR-safe persistence, so the server
// renders the persisted theme with inline CSS variables — the first paint
// is already correct, and hydration keeps it.
//
// In a plain Vue SPA, inline createThemeBootstrapScript() into <head>
// exactly like the React example.`,
  },
  {
    label: "SvelteKit",
    lang: "ts",
    code: `// src/routes/+layout.ts (or inline in the static index.html)
import { createThemeBootstrapScript } from "@theme-kit/core";

export const load = () => {
  // Return the blocking script to the +layout.svelte <svelte:head>.
  return {
    bootstrap: createThemeBootstrapScript({
      themes,
      defaultTheme: "light",
    }),
  };
};`,
  },
  {
    label: "Solid",
    lang: "tsx",
    code: `// index.html — inline the bootstrap script before your entry bundle.
import { createThemeBootstrapScript } from "@theme-kit/core";

const bootstrap = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
});
// <head> → <script>${"${bootstrap}"}</script>

import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";

render(
  () => (
    <ThemeProvider themes={themes} defaultTheme="light">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);`,
  },
  {
    label: "Angular",
    lang: "ts",
    code: `// Server/SSR bootstrap — generate the <head> script from the CSS map.
import {
  createBlockingScriptContent,
  buildThemeCSSMap,
  provideThemeKit,
} from "@theme-kit/angular";

// server: the blocking script + <style> built from the resolved map
const cssMap = buildThemeCSSMap(themes);
const head = createBlockingScriptContent(
  themes,
  savedSelection, // cookie-derived { mode, family } | null
);
// → <script>${"${head}"}</script> in the SSR <head>

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes, defaultTheme: "light" })],
});`,
  },
  {
    label: "Astro",
    lang: "astro",
    code: `---
import { createBlockingScript, buildThemeCssMap } from "@theme-kit/astro";
import { ThemeProviderClient } from "@theme-kit/astro";

const cssMap = buildThemeCssMap(themes);
---
<html lang="en">
  <head>
    <Fragment set:html={createBlockingScript("my-app", cssMap)} />
  </head>
  <body>
    <ThemeProviderClient themes={themes} defaultTheme="light" />
  </body>
</html>

// createBlockingScript reads the theme-mode / theme-family cookies,
// validates the fingerprint, and applies the persisted theme before paint.
// buildThemeCssMap keys each theme by name and by "family:mode".`,
  },
  {
    label: "Remix",
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
        <ThemeHead themes={themes} /> {/* blocking script */}
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
  {
    label: "Web Components",
    lang: "html",
    code: `<!doctype html>
<html>
  <head>
    <!-- Inlined output of createThemeBootstrapScript({ themes, defaultTheme: "light" }) -->
    <script>
      /* reads "theme-selection", resolves family + effective mode,
         writes --theme-* vars + data-theme attrs before first paint */
    </script>
  </head>
  <body>
    <theme-kit-provider themes="" default-theme="light">
      <my-app></my-app>
    </theme-kit-provider>
  </body>
</html>`,
  },
];

// Framework examples highlight server-side (Shiki lives in the Node bundle,
// not the browser) — the client tab switcher just renders precomputed HTML.
const frameworkExamplesWithHtml = frameworkExamples.map((example) => ({
  ...example,
  html: highlightCode(example.code, example.lang),
}));

const consequences = [
  {
    title: "No flash of incorrect theme",
    desc: "The dark-mode user never sees a white interstitial — the first paint is already dark.",
  },
  {
    title: "No hydration mismatch",
    desc: "React and other frameworks hydrate against the exact markup the server emitted. No attribute storms, no re-render of the wrong theme.",
  },
  {
    title: "Works across reloads",
    desc: "Cookies/localStorage + fingerprinting mean a reload renders exactly what the user last chose — even after a deploy changes the theme set.",
  },
];

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const zeroFlashHeadings = buildPageHeadings([
  { text: "The problem", level: 2 },
  { text: "How it works", level: 2 },
  { text: "The core primitives", level: 2 },
  { text: "Every framework", level: 2 },
  { text: "What's next", level: 2 },
]);

export default function ZeroFlashPage() {
  return (
    <DocsLayout headings={zeroFlashHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2 4.09 12.69a1 1 0 0 0 .77 1.63h5.23l-1 7.68a.5.5 0 0 0 .87.38L18.91 11.3a1 1 0 0 0-.77-1.63h-5.23l1-7.68a.5.5 0 0 0-.87-.38Z" />
            </svg>
          }
          title="Zero Flash"
          subtitle="@theme-kit/core — bootstrap &amp; SSR-safe hydration"
          description={
            <>
              Theme Kit never lets the wrong theme — or no theme at all — reach
              the screen. The server resolves the persisted selection, inlines
              the CSS variables, and a blocking bootstrap script covers the rest,
              so the very first paint is already the user&apos;s theme.
            </>
          }
        />

        <section id="problem" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Most theming libraries hydrate the theme from client-side JS — which leaves a flash of the wrong theme on reload and SSR."
          >
            The problem
          </SectionHeading>

          <div className="grid gap-4 sm:grid-cols-2 mb-3">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
                Without Theme Kit
              </div>
              <div className="p-4 flex flex-col gap-2 text-sm">
                {[
                  "Server returns the default (light) page",
                  "Blocking layout paint of the light theme",
                  "Client JS reads the saved dark theme",
                  "Re-render — and a visible flash of the wrong theme",
                ].map((step, i) => (
                  <div key={step} className="flex gap-2 items-center text-sm opacity-75">
                    <span
                      className={`w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold ${
                        i === 2
                          ? "bg-[color-mix(in_srgb,var(--theme-color-destructive)_15%,transparent)] text-[var(--theme-color-destructive)]"
                          : "bg-muted text-foreground/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
                With Theme Kit
              </div>
              <div className="p-4 flex flex-col gap-2 text-sm">
                {[
                  "Server resolves the persisted selection (cookies/fingerprint)",
                  "HTML renders with data-theme + inline CSS variables",
                  "First paint is already the user's theme",
                  "Hydration takes over — no re-render, no flash, no mismatch",
                ].map((step, i) => (
                  <div key={step} className="flex gap-2 items-center text-sm opacity-75">
                    <span
                      className="w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold"
                      style={{
                        background: "var(--theme-color-primary)",
                        color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                      }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {consequences.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="mt-1 text-xs opacity-60 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="One owned pipeline — rules that run server-side before anything is painted, and a blocking script for everything else."
          >
            How it works
          </SectionHeading>
          <div className="flex flex-col gap-2">
            {pipeline.map((step, i) => (
              <div key={step.title} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-bold ${
                      i === pipeline.length - 1
                        ? ""
                        : "bg-muted text-foreground/50"
                    }`}
                    style={
                      i === pipeline.length - 1
                        ? {
                            background: "var(--theme-color-primary)",
                            color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                          }
                        : undefined
                    }
                  >
                    {i + 1}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span
                      className="w-px flex-1 my-0.5"
                      style={{
                        background:
                          "linear-gradient(to bottom, color-mix(in srgb, var(--theme-color-primary) 40%, transparent), color-mix(in srgb, var(--theme-color-border) 60%, transparent))",
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <div className="text-sm font-semibold">{step.title}</div>
                  <div className="text-xs opacity-60 leading-relaxed mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-sm font-semibold mb-1">
                What about the native scrollbar?
              </div>
              <p className="text-xs opacity-70 leading-relaxed">
                A dark-mode user opening a page while the default theme is
                light sees the <em>native</em> light scrollbar flash before
                hydration — even when colors are already correct. Theme Kit&apos;s
                scrollbar story uses the same trick: the bootstrap hides the
                native scrollbar before first paint, then the theme-aware
                overlay engine takes over.
              </p>
              <Link href="/custom-scrollbar" className="text-xs font-semibold no-underline" style={{ color: "var(--theme-color-primary)" }}>
                Custom Scrollbar →
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-sm font-semibold mb-1">
                Transitions wait for the initial state
              </div>
              <p className="text-xs opacity-70 leading-relaxed">
                The transition engine only starts after the initial theme is
                established — the first paint is never animated. A user who
                arrives with the dark theme selected gets dark immediately,
                then any later switch (families, modes, scopes) animates
                through the configured plan.
              </p>
              <Link href="/animation" className="text-xs font-semibold no-underline" style={{ color: "var(--theme-color-primary)" }}>
                Animation &amp; Transition →
              </Link>
            </div>
          </div>
        </section>

        <section id="core" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Framework-agnostic — use them directly in any head, or let a framework package do it for you."
          >
            The core primitives
          </SectionHeading>
          {snippetBlock(coreSnippet)}
        </section>

        <section id="frameworks" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Same runtime, different integration — the visual result is identical, only the wiring changes."
          >
            Every framework
          </SectionHeading>
          <FrameworkTabs examples={frameworkExamplesWithHtml} />
          <p className="mt-4 text-sm opacity-70 leading-relaxed">
            SSR frameworks with dedicated server integration (Next, Nuxt, Astro,
            Angular, Remix) resolve the theme on the server. Client-only apps
            and frameworks without a server package (Svelte/SvelteKit, Solid,
            Web Components) inline{" "}
            <code className="mono text-[0.9em]">createThemeBootstrapScript</code>{" "}
            into their static <code className="mono text-[0.9em]">&lt;head&gt;</code>.
            Either way the bootstrap runs before the first paint.
          </p>
        </section>

        <section id="next" className="scroll-mt-24">
          <SectionHeading
            num={5}
            desc="Zero flash is the start — theme switching should feel smooth too."
          >
            What&apos;s next
          </SectionHeading>
          <div className="flex flex-col gap-2">
            <Link
              href="/animation"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Animation &amp; Transition</div>
                <div className="text-xs opacity-60">
                  Cross-fade theme changes with the transition pipeline and View
                  Transitions API.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/adapters"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Adapters Guide</div>
                <div className="text-xs opacity-60">
                  Bridge the resolved theme to your UI library.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/custom-scrollbar"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Custom Scrollbar</div>
                <div className="text-xs opacity-60">
                  The same flash-free pre-paint technique for scrollbars.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/core-concepts"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Core Concepts</div>
                <div className="text-xs opacity-60">
                  Themes, families &amp; modes, semantic tokens and the runtime.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}