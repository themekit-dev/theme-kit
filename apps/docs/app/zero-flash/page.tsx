import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { FrameworkTabs } from "../../components/framework-tabs";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { Prerequisites } from "../../components/ui/prerequisites";
import { RelatedLinks } from "../../components/ui/related-links";
import { highlightCode } from "../../lib/highlight";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/zero-flash") },
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
  resolveInitialTheme,
  systemModeCSSTemplate,
  getBuiltInThemes,
} from "@theme-kit/core";

// The built-in set — the neutral light/dark pair plus the preset families — is
// a valid registry, so no theme file is needed.
const themes = getBuiltInThemes();
const cssMap = buildThemeCssMap(themes, { prefix: "theme-" });

// 1) The blocking <script> for <head>. It reads the persisted selection,
//    resolves family + effective mode ("system" → prefers-color-scheme), and
//    writes the CSS variables and data-theme attributes before first paint.
const bootstrapScript = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
  storageKey: "theme-selection",
});

// 2) Resolve the selection the way the client runtime will, so the server and
//    the script agree on the first frame.
const { theme, selection } = resolveInitialTheme({
  themes,
  defaultTheme: "light",
  mode: "system",
});

// 3) A concrete mode means the server already knows the answer: inline that
//    theme's variables on <html>. \`cssMap\` is keyed by theme name, so this
//    works for the neutral pair (light/dark) and for families alike.
const resolvedVars = selection.mode === "system" ? null : cssMap[theme.name];

// 4) "system" is the case the server cannot answer, so it must not guess.
//    Inlining the light variables and adding a dark media block does NOT work:
//    an inline \`style\` on <html> outranks every stylesheet rule, so the dark
//    block never applies. Emit BOTH schemes as media blocks instead, and keep
//    only \`color-scheme: light dark\` inline.
const lightTheme = resolveInitialTheme({ themes, defaultTheme: "light", mode: "light" }).theme;
const darkTheme = resolveInitialTheme({ themes, defaultTheme: "light", mode: "dark" }).theme;
const systemFallback =
  selection.mode === "system"
    ? systemModeCSSTemplate(cssMap[lightTheme.name], cssMap[darkTheme.name])
    : null;
`,
};

const pipeline = [
  {
    title: "Persist",
    desc: "Every change is mirrored to persistence — localStorage in a SPA, cookies for SSR — so the server knows the selection on the next request.",
  },
  {
    title: "Resolve",
    desc: "Fingerprint-validated cookies/selection are resolved to a concrete theme: family + effective mode (system resolves against prefers-color-scheme). The fingerprint comes from computeFingerprint(themes, defaultTheme), shared from core so every integration writes a byte-identical value.",
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
    code: `// Flash-proof out of the box. The provider reads the persisted selection,
// applies it before first paint, and injects a blocking bootstrap <script>
// into <head> — no vite plugin or manual index.html script required.
import { ThemeProvider } from "@theme-kit/react";

root.render(
  <ThemeProvider defaultTheme="light" initialMode="system">
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
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}

// Reads theme-mode / theme-family / theme-fingerprint cookies, validates
// the fingerprint, resolves the initial theme, and returns:
//   <html data-theme="..." data-theme-mode="..." class="dark">
// with the resolved CSS variables inlined plus a blocking script in <head>.
// Hydration matches this SSR markup exactly — zero-flash, zero mismatch.`,
  },
  {
    label: "Vue / Nuxt",
    lang: "ts",
    code: `// nuxt.config.ts — the module wires SSR persistence + bootstrap.
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: { defaultTheme: "light", initialMode: "system" },
});

// In a plain Vue SPA the provider is flash-proof out of the box:
//   <ThemeProvider default-theme="light" initial-mode="system"> … </ThemeProvider>
// It applies the persisted theme before first paint and injects the
// blocking bootstrap automatically, handing the mode to both.`,
  },
  {
    label: "SvelteKit",
    lang: "svelte",
    code: `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
</script>

<!-- Flash-proof out of the box — the provider injects the blocking
     bootstrap and applies the persisted theme before first paint.
     initialMode="system" is the opt-in for following the OS. -->
<ThemeProvider defaultTheme="light" initialMode="system">
  {@render children()}
</ThemeProvider>`,
  },
  {
    label: "Solid",
    lang: "tsx",
    code: `// Flash-proof out of the box — the provider injects the blocking bootstrap
// and applies the persisted theme before first paint.
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";

render(
  () => (
    <ThemeProvider defaultTheme="light" initialMode="system">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);`,
  },
  {
    label: "Angular",
    lang: "ts",
    code: `// src/main.ts — the runtime side. The server side emits the <head> content.
import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { createBlockingScriptContent, provideThemeKit } from "@theme-kit/angular";
import { getBuiltInThemes } from "@theme-kit/core";

@Component({ selector: "app-root", template: "<router-outlet />" })
class AppComponent {}

// createBlockingScriptContent takes the registry positionally. Inject its
// return value RAW into the SSR <head> — it is
// \`<style id="theme-kit-critical">…</style>\` followed by
// \`<script id="theme-kit-blocking">…</script>\`. For a "system" selection the
// style carries one \`prefers-color-scheme\` block per scheme, so an OS-dark
// visitor is correct with no JavaScript at all.
const themes = getBuiltInThemes();

// The persisted selection, read from the cookies the persistence layer writes
// (\`theme-mode\` / \`theme-family\`). Pass \`null\` when there is no usable
// selection and the fallback options below decide the theme instead.
function readSavedSelection(cookieHeader: string) {
  const jar: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) jar[part.slice(0, eq).trim()] = part.slice(eq + 1);
  }
  const mode = jar["theme-mode"];
  const family = jar["theme-family"];
  if (mode !== "light" && mode !== "dark" && mode !== "system") return null;
  return family ? { mode, family } : null;
}

const savedSelection = readSavedSelection(request.headers.get("cookie") ?? "");
// \`request\` is your server's incoming request (Express, Fastify, the Angular
// SSR engine, …) — substitute whichever your server exposes.

const head = createBlockingScriptContent(
  themes,
  savedSelection,
  // Must match the runtime below — the script and the runtime resolve the
  // mode separately, so telling only one of them makes the runtime correct
  // the theme the script already painted.
  { defaultTheme: "light", mode: "system" },
);

bootstrapApplication(AppComponent, {
  providers: [
    // The same registry the script was built from, and the same mode.
    provideThemeKit({ themes, defaultTheme: "light", initialMode: "system" }),
  ],
});`,
  },
  {
    label: "Astro",
    lang: "astro",
    code: `---
import { createBlockingScript, buildThemeCssMap } from "@theme-kit/astro";
import { ThemeProviderClient } from "@theme-kit/astro/client";
import { getBuiltInThemes } from "@theme-kit/core";

// buildThemeCssMap takes the registry positionally.
const themes = getBuiltInThemes();
const cssMap = buildThemeCssMap(themes);
---
<html lang="en">
  <head>
    {/* "system" is passed explicitly, and must match the island's initialMode
        below — the script and the runtime resolve the mode independently. */}
    <Fragment set:html={createBlockingScript("my-app", cssMap, { mode: "system" })} />
  </head>
  <body>
    <ThemeProviderClient defaultTheme="light" initialMode="system" />
  </body>
</html>

// createBlockingScript reads the theme-mode / theme-family cookies,
// validates the fingerprint, and applies the persisted theme before paint.
// buildThemeCssMap keys each theme by name and by "family:mode".
// The island's initialMode must match the integration's "mode" option in
// astro.config.ts — the integration owns the script, the island owns the
// runtime, and neither can see the other's configuration.`,
  },
  {
    label: "Remix",
    lang: "tsx",
    code: `// app/root.tsx
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
} from "@remix-run/react";
import { ThemeProvider, ThemeHead } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";
import { getBuiltInThemes } from "@theme-kit/core";

// getInitialThemeState and ThemeHead both take the registry explicitly; the
// built-in set is a valid registry, so no theme file is needed.
const themes = getBuiltInThemes();

export async function loader({ request }: LoaderFunctionArgs) {
  // The SAME mode as ThemeHead below. Leaving it out resolves the fallback
  // theme's own mode (light) while the script follows the OS — so on an
  // OS-dark first visit the script paints dark and the runtime corrects it.
  return {
    initial: await getInitialThemeState(request, { themes, mode: "system" }),
  };
}

export default function App() {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        {/* blocking script — its mode must match the loader's */}
        <ThemeHead themes={themes} mode="system" />
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
    <!-- Inlined output of createThemeBootstrapScript({ themes, defaultTheme: "light", initialMode: "system" }) -->
    <script>
      /* reads "theme-selection", resolves family + effective mode,
         writes --theme-* vars + data-theme attrs before first paint */
    </script>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
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

// Where the initial mode has to be declared on each surface. The pre-paint
// script and the runtime resolve the mode independently — the script cannot
// read the runtime's config — so every surface listed with two different places
// needs the same value in both, or the runtime corrects the script's paint.
const modeWiring = [
  {
    label: "React · Solid · Vue · Svelte",
    script:
      "written by the provider, which passes its own initialMode into the script it injects",
    runtime: "the initialMode prop on the provider",
  },
  {
    label: "Web Components",
    script:
      "you inline createThemeBootstrapScript() output yourself — there is no build step to inject it",
    runtime: "the initial-mode attribute on <theme-kit-provider>",
  },
  {
    label: "Next.js",
    script: 'the theme-mode cookie, defaulting to "system"',
    runtime: "the same cookie — the provider takes no mode prop",
  },
  {
    label: "Nuxt",
    script: 'themeKit.initialMode in nuxt.config.ts, defaulting to "system"',
    runtime: "the same config key",
  },
  {
    label: "Astro",
    script: "the bootstrap the integration derives from theme.config.ts",
    runtime: "the same configuration, transported to the island",
  },
  {
    label: "Angular",
    script: "the third argument to createBlockingScriptContent()",
    runtime: "provideThemeKit({ initialMode })",
  },
  {
    label: "Remix",
    script: "mode on ThemeHead",
    runtime: "initialMode on ThemeProvider",
  },
  {
    label: "Core · Vite plugin",
    script:
      "createThemeBootstrapScript({ initialMode }) / themeKitVitePlugin()",
    runtime: "createThemeRuntime({ initialMode })",
  },
];

/**
 * The Astro split: a tiny synchronous pre-paint script, and a runtime that is
 * only created once the island mounts. Astro has no root component to own the
 * first commit, so "don't create the runtime before paint" is a structural
 * property rather than a convention.
 */
const astroHalves = [
  {
    label: "Before first paint",
    desc: "One inline script in <head>, injected by the themeKit() integration. It reads the theme cookies, rejects them when the config fingerprint is stale, resolves the effective mode, and writes the CSS variables plus the data-theme / dark-class contract. No runtime, no listeners, no framework import.",
  },
  {
    label: "At island mount",
    desc: "ThemeProviderClient creates the real runtime, installs it as the shared runtime the other islands read, and wires persistence. This happens after the document has been parsed and painted, so nothing it does can affect the first frame.",
  },
  {
    label: "On client navigation",
    desc: "The injected script is byte-identical on every page, so Astro de-duplicates it and it never re-runs. A separate listener re-applies the live theme state on astro:before-swap — before Astro copies the incoming page's <html> attributes over the live root.",
  },
  {
    label: "Installing the stylesheet",
    desc: "The system-mode stylesheet is installed behind a guard on an existing data-theme-kit=\"system\" element, so provider.astro emitting it statically and the integration installing it never stack a duplicate sheet.",
  },
];

export default function ZeroFlashPage() {
  return (
    <DocsLayout>
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
              Theme Kit prevents flash of incorrect theme on supported SSR frameworks
              and client-side applications. The server resolves the persisted selection,
              inlines the CSS variables, and a blocking bootstrap script covers the rest,
              so the very first paint is already the user&apos;s theme.
            </>
          }
        />

        <Prerequisites
          items={[
            {
              label: "Core Package",
              value: "@theme-kit/core",
              href: "/packages/core",
            },
            {
              label: "Framework",
              value: "SSR-capable framework (Next.js, Nuxt, Astro, Remix) or client provider",
            },
            {
              label: "Knowledge",
              value: "Understanding of SSR hydration and blocking scripts",
            },
          ]}
          className="mb-8"
        />

        <Callout variant="neutral" title="Known limitations" className="mb-8">
          <p className="text-sm leading-relaxed">
            Zero-flash behavior works as documented for supported SSR frameworks
            (Next.js, Nuxt, Astro, Remix) and client providers with the blocking
            bootstrap script. Some edge cases exist around{" "}
            <code className="mono text-[0.9em]">system</code> mode with JavaScript
            disabled and framework-specific SSR constraints. See{" "}
            <Link href="/known-limitations" className="underline">
              Known Limitations
            </Link>{" "}
            for complete details.
          </p>
        </Callout>

        <section id="problem" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Most theming libraries apply the theme from client-side JavaScript, which leaves a flash of the wrong theme on reload and on SSR."
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
                        color: "var(--theme-color-primaryForeground)",
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
            desc="Rules that run server-side before anything paints, plus a blocking script for everything else."
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
                            color: "var(--theme-color-primaryForeground)",
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

        <section id="client-bootstrap" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="One rule decides what the very first frame shows — and it has to be said in two places."
          >
            Zero-flash client bootstrap
          </SectionHeading>

          <Callout variant="neutral" title="The rule">
            <p className="text-sm leading-relaxed">
              <code className="mono text-[0.9em]">defaultTheme</code> picks{" "}
              <em>which</em> theme you start on.{" "}
              <code className="mono text-[0.9em]">initialMode</code> is the
              opt-in for <em>following the OS</em>, and it must reach{" "}
              <strong>both</strong> the pre-paint script and the client runtime.
            </p>
          </Callout>

          <p className="mt-4 text-sm opacity-80 leading-relaxed">
            The script and the runtime resolve the mode independently — the
            script cannot read the runtime&apos;s configuration, and the runtime
            never inspects the script. So both derive their default from the same
            place: the fallback theme&apos;s own mode. Leave the mode alone and
            they agree by construction, which is why{" "}
            <code className="mono text-[0.9em]">
              &lt;ThemeProvider defaultTheme=&quot;light&quot;&gt;
            </code>{" "}
            paints light on the first frame with no configuration at all — and
            why a dark-mode visitor stays light until you ask for{" "}
            <code className="mono text-[0.9em]">&quot;system&quot;</code>.
          </p>

          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            Tell only one of the two and they disagree: the script paints the
            mode it derived, then the runtime corrects it a frame or two later —
            exactly the flash this page exists to prevent. Measured on a
            CPU-throttled production build of the Angular example, a
            script/runtime mode disagreement showed the wrong theme for{" "}
            <strong>1.5 s</strong> before the runtime corrected it.
          </p>

          <div className="mt-4 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Where the mode has to be said
            </div>
            <div className="divide-y divide-border">
              {modeWiring.map((row) => (
                <div
                  key={row.label}
                  className="px-4 py-3 grid gap-1.5 sm:grid-cols-[150px_1fr_1fr] sm:gap-3"
                >
                  <div className="text-xs font-semibold">{row.label}</div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    <span className="opacity-50">script · </span>
                    {row.script}
                  </div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    <span className="opacity-50">runtime · </span>
                    {row.runtime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Callout className="mt-4" title="Next and Nuxt are the exception">
            <p className="text-sm leading-relaxed">
              Their module defaults the mode to{" "}
              <code className="mono text-[0.9em]">&quot;system&quot;</code> on
              both sides, so a first-time visitor follows the OS without being
              asked. Every other surface defaults to the fallback theme&apos;s
              own mode instead.
            </p>
          </Callout>

          <h3 className="mt-8 text-sm font-semibold tracking-tight mb-2">
            Astro: the two halves, kept apart
          </h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Astro has no root component to own the first commit, so the
            bootstrap there is not a runtime at all — it is a tiny synchronous
            script in <code className="mono text-[0.9em]">&lt;head&gt;</code>.
            The runtime is created later, when the island mounts. Keeping those
            two halves apart is the whole design: nothing on the pre-paint path
            imports a framework, allocates a store, or attaches a listener.
          </p>

          <div className="mt-4 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Who owns which half
            </div>
            <div className="divide-y divide-border">
              {astroHalves.map((row) => (
                <div
                  key={row.label}
                  className="px-4 py-3 grid gap-1.5 sm:grid-cols-[170px_1fr] sm:gap-3"
                >
                  <div className="text-xs font-semibold">{row.label}</div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    {row.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h4 className="mt-6 text-sm font-semibold tracking-tight mb-2">
            For <code className="mono text-[0.9em]">&quot;system&quot;</code>,
            CSS is the first line of defense — not the script
          </h4>
          <p className="text-sm opacity-80 leading-relaxed">
            A server cannot know the visitor&apos;s OS preference, so it must
            not commit to one. It is tempting to render the light variables into
            an inline <code className="mono text-[0.9em]">style</code> on{" "}
            <code className="mono text-[0.9em]">&lt;html&gt;</code> and add a{" "}
            <code className="mono text-[0.9em]">
              @media (prefers-color-scheme: dark)
            </code>{" "}
            block to correct it — but that does not work. An inline declaration
            outranks every stylesheet rule regardless of specificity, so the
            dark block is inert and the visitor stays light.
          </p>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            Measured on a production build of the Astro example with page
            scripts blocked and the OS set to dark: inline light variables plus
            a dark media block painted{" "}
            <code className="mono text-[0.9em]">rgb(248, 250, 252)</code>. Moving
            both schemes into media blocks and leaving no inline variables
            painted <code className="mono text-[0.9em]">rgb(2, 6, 23)</code>.
            That is why{" "}
            <code className="mono text-[0.9em]">provider.astro</code> emits{" "}
            <code className="mono text-[0.9em]">systemModeCSSTemplate</code> and
            keeps only{" "}
            <code className="mono text-[0.9em]">color-scheme: light dark</code>{" "}
            inline when the resolved mode is{" "}
            <code className="mono text-[0.9em]">&quot;system&quot;</code>.
          </p>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            The distinction is the <em>inline attribute</em>, not the media
            block. Emit the same light variables as a{" "}
            <code className="mono text-[0.9em]">&lt;style&gt;</code> element and
            a later{" "}
            <code className="mono text-[0.9em]">
              @media (prefers-color-scheme: dark)
            </code>{" "}
            block <em>does</em> win — both are{" "}
            <code className="mono text-[0.9em]">:root</code> rules at equal
            specificity, so source order decides. That is the mechanism Nuxt
            uses, and it is why the two integrations reach the same result by
            different routes.
          </p>
          <Callout className="mt-4" title="What that costs">
            <p className="text-sm leading-relaxed">
              With scripts blocked the{" "}
              <code className="mono text-[0.9em]">data-theme</code> attribute
              stays at the build-time value even though the canvas is correct —
              the attribute is only a marker, and the script is what updates it.
              Colors, which are what the visitor actually sees, are right
              either way.
            </p>
          </Callout>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            The builder lives in{" "}
            <code className="mono text-[0.9em]">@theme-kit/core</code>, and{" "}
            <code className="mono text-[0.9em]">@theme-kit/astro</code>{" "}
            re-exports it. That is deliberate: the integration,{" "}
            <code className="mono text-[0.9em]">provider.astro</code> and
            Angular&apos;s{" "}
            <code className="mono text-[0.9em]">
              createBlockingScriptContent
            </code>{" "}
            all need the same rule, and a private copy in each would only ever
            disagree in one place — as a wrong first paint on one surface, which
            is the hardest kind of flash to attribute.
          </p>
        </section>

        <section id="core" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Framework-agnostic — use them directly in any head, or let a framework package do it for you."
          >
            The core primitives
          </SectionHeading>
          {snippetBlock(coreSnippet)}
        </section>

        <section id="frameworks" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="Same runtime, different integration — the visual result is identical, only the wiring changes."
          >
            Every framework
          </SectionHeading>
          <Callout variant="neutral" title="Flash-proof by default (1.2.0)">
            <p className="text-sm leading-relaxed">
              The React, Vue, Svelte and Solid providers now inject the blocking
              bootstrap themselves — you just wrap your app in the provider and
              the persisted theme is applied before first paint. The core{" "}
              <code className="mono text-[0.9em]">createThemeBootstrapScript</code>{" "}
              and the{" "}
              <Link href="/vite-plugin" className="text-primary hover:underline">
                Vite plugin
              </Link>{" "}
              remain available for custom heads and the pre-bundle first frame.
            </p>
          </Callout>
          <FrameworkTabs examples={frameworkExamplesWithHtml} />
          <p className="mt-4 text-sm opacity-70 leading-relaxed">
            SSR frameworks with dedicated server integration (Next, Nuxt, Astro,
            Angular, Remix) resolve the theme on the server. Client providers
            (React, Vue, Svelte, Solid) read the persisted selection and apply
            it before first paint automatically. Either way the bootstrap runs
            before the first paint.
          </p>
        </section>

        <section id="next" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="Zero-flash is the start — theme switching should feel smooth too."
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
        <section id="api-reference" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={7}
            desc="Every export this page uses, generated from the package JSDoc."
          >
            API reference
          </SectionHeading>
          <p className="text-sm leading-relaxed opacity-80">
            The full surface, generated from source JSDoc:
          </p>
          <p className="mt-3 text-sm">
            <Link href="/api-reference/core" className="underline">
              @theme-kit/core API reference
            </Link>
          </p>
        </section>

        <RelatedLinks
          links={[
            {
              title: "Animation & Transitions",
              href: "/animation",
              description: "Cross-fade theme changes smoothly",
            },
            {
              title: "Persistence",
              href: "/persistence",
              description: "Remember user's theme selection",
            },
            {
              title: "Custom Scrollbar",
              href: "/custom-scrollbar",
              description: "Flash-free themed scrollbars",
            },
            {
              title: "Vite Plugin",
              href: "/vite-plugin",
              description: "Pre-bundle bootstrap for faster loads",
            },
          ]}
        />
      </div>
    </DocsLayout>
  );
}