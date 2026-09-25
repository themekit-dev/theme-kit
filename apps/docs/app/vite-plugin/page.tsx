import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { FrameworkTabs } from "../../components/framework-tabs";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { Prerequisites } from "../../components/ui/prerequisites";
import { NextSteps } from "../../components/ui/next-step-card";
import { RelatedLinks } from "../../components/ui/related-links";
import { highlightCode } from "../../lib/highlight";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/vite-plugin") },
  title: "Vite Plugin",
  description:
    "Connect your theme.config.ts to Vite's HTML pipeline: the plugin discovers the configuration and injects the pre-paint bootstrap into index.html, so you never repeat themes, defaultTheme or initialMode in vite.config.ts.",
};

const antiPatternSnippet = {
  lang: "tsx",
  title: "the duplication this replaces",
  code: `themeKitVitePlugin({
  themes,
  initialMode: "system",
});

<ThemeProvider themes={themes} initialMode="system">
  <App />
</ThemeProvider>`,
};

const declaredOnceSnippet = {
  lang: "tsx",
  title: "declared once, in theme.config.ts",
  code: `themeKitVitePlugin();

<ThemeProvider>
  <App />
</ThemeProvider>`,
};

/**
 * The canonical `theme.config.ts`, shown once.
 *
 * Kept separate from the per-framework registrations below on purpose: the file
 * is identical for every Vite-hosted framework, so repeating it in each tab
 * would teach the opposite of what this page is about.
 */
const themeConfigSnippet = {
  lang: "ts",
  title: "theme.config.ts",
  code: `import { defineThemeKitConfig } from "@theme-kit/core";
import { themes } from "./src/themes";

export default defineThemeKitConfig({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
  initialFamily: "mint",
});`,
};

/**
 * Registration, per Vite-hosted framework.
 *
 * Every entry is the same one line in a different config file — that is the
 * point. The framework's own plugin stays as it was; Theme Kit's is appended.
 */
const registrationExamples = [
  {
    label: "React",
    lang: "ts",
    filename: "vite.config.ts",
    code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin()],
});`,
  },
  {
    label: "Vue",
    lang: "ts",
    filename: "vite.config.ts",
    code: `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [vue(), themeKitVitePlugin()],
});`,
  },
  {
    label: "Svelte",
    lang: "ts",
    filename: "vite.config.ts",
    code: `import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [svelte(), themeKitVitePlugin()],
});`,
  },
  {
    label: "Solid",
    lang: "ts",
    filename: "vite.config.ts",
    code: `import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [solid(), themeKitVitePlugin()],
});`,
  },
  {
    label: "Astro",
    lang: "ts",
    filename: "astro.config.ts",
    code: `import { defineConfig } from "astro/config";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit()],
});`,
  },
  {
    label: "Nuxt",
    lang: "ts",
    filename: "nuxt.config.ts",
    code: `export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    initialMode: "system",
  },
});`,
  },
  {
    label: "Vanilla",
    lang: "ts",
    filename: "vite.config.ts",
    code: `import { defineConfig } from "vite";
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [themeKitVitePlugin()],
});`,
  },
];

const registrationExamplesWithHtml = registrationExamples.map((example) => ({
  ...example,
  html: highlightCode(example.code, example.lang),
}));

/**
 * The keys of `ThemeKitConfig`, derived from the shipped type rather than
 * invented: the first six are exactly `ThemeBootstrapConfig` — the projection
 * both integrations serialize into the page.
 */
const themeConfigKeys = [
  {
    key: "themes",
    optional: false,
    decides: "The registry both the runtime and the pre-paint script resolve from. Required.",
  },
  {
    key: "defaultTheme",
    optional: true,
    decides:
      "The theme painted when nothing is persisted. Defaults to the first theme in the registry.",
  },
  {
    key: "initialMode",
    optional: true,
    decides:
      "The mode on a first visit. `system` follows the OS preference; omitting it keeps `defaultTheme`'s own mode.",
  },
  {
    key: "initialFamily",
    optional: true,
    decides:
      "The family on a first visit, when the registry groups themes into families.",
  },
  {
    key: "storageKey",
    optional: true,
    decides:
      "The localStorage key holding the selection. Both consumers read this one key. Defaults to `theme-selection`.",
  },
  {
    key: "prefix",
    optional: true,
    decides:
      "The CSS custom property prefix written by the bindings. Defaults to `theme-`.",
  },
];

/**
 * The registry the config above points at. Declared on the page because every
 * snippet here imports it: a page whose examples import a file it never shows
 * is not copy-pasteable.
 */
const themesModuleSnippet = {
  lang: "ts",
  title: "src/themes.ts",
  code: `import { defineTheme } from "@theme-kit/core";

export const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light", label: "Mint Light", order: 10 },
    tokens: { colors: { background: "#f8fafc", foreground: "#0f172a" } },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark", label: "Mint Dark", order: 20 },
    tokens: { colors: { background: "#0f172a", foreground: "#f8fafc" } },
  }),
];`,
};

/**
 * The runtime side, shown as `App.tsx` rather than `main.tsx` so the snippet
 * stands alone — a `main.tsx` that imports `./App` would be a file the page
 * never declares.
 */
const providerSnippet = {
  lang: "tsx",
  title: "src/App.tsx",
  code: `import { ThemeProvider, useTheme } from "@theme-kit/react";

function Header() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme.name}</button>;
}

export function App() {
  return (
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}`,
};

const optionsSnippet = {
  lang: "ts",
  title: "themeKitVitePlugin — every option, at once",
  code: `import { themeKitVitePlugin } from "@theme-kit/core/vite";

themeKitVitePlugin({
  config: "./src/theme.config.ts",
  scrollbar: true,
  syncFirstRender: true,
  ssrEntry: "/src/entry-server.tsx",
  ssrContainer: "root",
});`,
};

/**
 * The pipeline, rendered as a list rather than an ASCII block in a CodeBlock:
 * it is a sequence to read, not code to copy.
 *
 * The two `@internal` steps are named deliberately. They are real functions in
 * `packages/core/src/bootstrap.ts`, but they are tagged internal and are absent
 * from the public API manifest — so the page says which step is the public
 * entry point instead of presenting all of them as callable API.
 */
const pipelineSteps = [
  {
    label: "theme.config.ts",
    detail: "The application's configuration, at the project root.",
    internal: false,
  },
  {
    label: "themeKitVitePlugin()",
    detail:
      "Discovers the file and projects it with `toBootstrapConfig` — the six keys the pre-paint script can act on.",
    internal: false,
  },
  {
    label: "buildBootstrapPlan()",
    detail:
      "Turns the registry into the CSS-variable tables and the resolution plan.",
    internal: true,
  },
  {
    label: "serializeThemeBootstrapScript()",
    detail: "Serializes the plan into the self-contained IIFE.",
    internal: true,
  },
  {
    label: "index.html <head>",
    detail:
      "The script is injected head-prepend with `enforce: \"pre\"`, so it runs before any other head script.",
    internal: false,
  },
  {
    label: "The browser resolves the theme",
    detail:
      "The script reads the persisted selection and resolves `system` against `prefers-color-scheme`.",
    internal: false,
  },
  {
    label: "ThemeProvider initializes",
    detail:
      "The runtime starts from the same configuration, so it confirms what the script painted instead of correcting it.",
    internal: false,
  },
];

/**
 * Configuration-mismatch troubleshooting.
 *
 * Each answer describes what the shipped code does, not generic plugin advice.
 * The warning strings are copied from `packages/core/src/config-loader.ts` —
 * keep them in sync when that file changes.
 */
const configTroubleshooting = [
  {
    symptom: "I already have themes in vite.config.ts",
    fix: "Move them to theme.config.ts and call themeKitVitePlugin() with no theme options. The theme options on the plugin are a deprecated escape hatch — when a config is discovered they are ignored, so leaving them in place means editing values that no longer take effect.",
  },
  {
    symptom: "The plugin can't find my config",
    fix: "Discovery looks for theme.config.ts (then .tsx, .mts, .mjs, .js, .cjs) in Vite's root — config.root, or process.cwd() when unset. If the file lives elsewhere, name it: themeKitVitePlugin({ config: \"./src/theme.config.ts\" }).",
  },
  {
    symptom: "My provider and the bootstrap disagree",
    fix: "They should be reading the same object. Both the plugin's bootstrap and the provider's runtime come from the discovered theme.config.ts, so a disagreement means one of them was given an override — provider props win over the transported config. Drop the override and the source of truth is single again.",
  },
  {
    symptom: "I edited theme.config.ts and nothing changed",
    fix: "The discovered config is resolved once and memoized for the life of the Vite process, so `vite dev` keeps serving the bootstrap it derived on startup. Restart the dev server. (A production build re-derives it every time.)",
  },
  {
    symptom: "I use more than one Vite config",
    fix: "Each one resolves its own root, so each discovers its own theme.config.ts. Two Vite configs sharing one root share one configuration; a config with an explicit root gets that root's file.",
  },
];

const discoveryWarnings = `[theme-kit] could not find Vite to load /app/theme.config.ts. Pass \`config\` explicitly, or declare \`vite\` as a dependency.
[theme-kit] could not load /app/theme.config.ts: config must export or return an object`;

const bootstrapSnippet = {
  lang: "html",
  title: "index.html — the script the plugin injects",
  code: `<!doctype html>
<html lang="en">
  <head>
    <!-- injected by themeKitVitePlugin(); the theme tables are collapsed to … -->
    <script id="theme-kit-bootstrap">
(function(){try{
  var raw=localStorage.getItem("theme-selection");
  var sel=null;try{sel=raw?JSON.parse(raw):null;}catch(e){}
  var mode0=sel&&(sel.mode==='light'||sel.mode==='dark'||sel.mode==='system')?sel.mode:null;
  var fam0=sel&&typeof sel.family==='string'?sel.family:null;
  var mode=mode0||"light";   // defaultTheme's own mode, or your initialMode
  var family=fam0||"default";
  var sysDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  var eff=mode==='dark'||(mode==='system'&&sysDark)?'dark':'light';
  var map={ … };             // theme key -> { "--theme-*": value }
  var names={ … };           // theme key -> data-theme value
  var key=(family&&map[family+':'+eff])?family+':'+eff:'__default-'+eff;
  var i=key.indexOf(':');var fam=i>=0?key.slice(0,i):"default";
  var vars=map[key]||map['__default-light'];
  var name=names[key]||names['__default-'+eff]||null;
  var el=document.documentElement;
  if(eff==='dark'){el.classList.add('dark');}else{el.classList.remove('dark');}
  el.style.colorScheme=eff;
  el.setAttribute('data-theme-mode',eff);
  if(fam){el.setAttribute('data-theme-family',fam);}
  if(name){el.setAttribute('data-theme',name);}
  if(vars){for(var p in vars){el.style.setProperty(p,vars[p]);}}
}catch(e){}})()
    </script>
    <title>My App</title>
  </head>
  <body>…</body>
</html>`,
};

const ssrNextSnippet = {
  lang: "tsx",
  title: "app/layout.tsx — Next.js",
  code: `import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}`,
};

const ssrNuxtSnippet = {
  lang: "ts",
  title: "nuxt.config.ts — Nuxt",
  code: `export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    defaultTheme: "light",
    initialMode: "system",
  },
});`,
};

const ssrRemixSnippet = {
  lang: "tsx",
  title: "app/root.tsx — Remix",
  code: `import { ThemeHead, ThemeProvider } from "@theme-kit/remix";

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <ThemeHead mode="system" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" initialMode="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`,
};

export default function VitePluginPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Vite Plugin"
          title="Optional: zero-flash before the bundle loads"
          description={
            <>
              The{" "}
              <code className="mono text-[0.9em]">themeKitVitePlugin</code>{" "}
              injects a synchronous bootstrap script into your{" "}
              <code className="mono text-[0.9em]">index.html</code> at build
              time so the persisted theme is applied on the{" "}
              <strong>very first frame</strong> — before the JavaScript bundle
              even loads.
            </>
          }
        />

        <Prerequisites
          items={[
            {
              label: "Vite project",
              value: "A Vite-based application (React, Vue, Svelte, or vanilla)",
              href: "https://vitejs.dev/guide/",
            },
            {
              label: "Theme Kit provider installed",
              value: "@theme-kit/react, vue, svelte, or core/vanilla",
              href: "/get-started",
            },
          ]}
        />

        <section id="configuration" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="One configuration. Two consumers. Zero duplicated theme configuration."
          >
            Configuration
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Theme Kit&apos;s Vite plugin connects your project-level Theme Kit
            configuration to Vite&apos;s HTML pipeline. It discovers{" "}
            <code className="mono text-[0.9em]">theme.config.ts</code> at the
            project root and injects the pre-paint bootstrap from it, so you do
            not repeat{" "}
            <code className="mono text-[0.9em]">themes</code>,{" "}
            <code className="mono text-[0.9em]">defaultTheme</code>,{" "}
            <code className="mono text-[0.9em]">initialMode</code> or{" "}
            <code className="mono text-[0.9em]">initialFamily</code> in{" "}
            <code className="mono text-[0.9em]">vite.config.ts</code>.
          </p>

          {/* The mental model, drawn with the page's own tokens rather than an
              ASCII block in a CodeBlock — a diagram is not copy-pasteable code,
              so it should not offer a copy button. */}
          <div className="my-5 rounded-xl border border-border bg-muted/10 p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-full max-w-[16rem] rounded-lg border border-border bg-card px-4 py-2.5 text-center">
                <div className="mono text-sm font-semibold">theme.config.ts</div>
                <div className="text-[11px] opacity-55 mt-0.5">
                  the single declaration
                </div>
              </div>

              <span aria-hidden className="text-xs opacity-35 leading-none">
                ↓
              </span>

              <div className="grid w-full gap-3 sm:grid-cols-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-center">
                    <div className="text-sm font-semibold">ThemeProvider</div>
                    <div className="text-[11px] opacity-55 mt-0.5">runtime</div>
                  </div>
                  <span aria-hidden className="text-xs opacity-35 leading-none">
                    ↓
                  </span>
                  <div className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-center">
                    <div className="text-sm font-semibold">your app</div>
                    <div className="text-[11px] opacity-55 mt-0.5">
                      selection · bindings · persistence
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-center">
                    <div className="text-sm font-semibold">Vite plugin</div>
                    <div className="text-[11px] opacity-55 mt-0.5">bootstrap</div>
                  </div>
                  <span aria-hidden className="text-xs opacity-35 leading-none">
                    ↓
                  </span>
                  <div className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-center">
                    <div className="text-sm font-semibold">
                      index.html &lt;head&gt;
                    </div>
                    <div className="text-[11px] opacity-55 mt-0.5">
                      before the first paint
                    </div>
                  </div>
                </div>
              </div>

              <span aria-hidden className="text-xs opacity-35 leading-none">
                ↓
              </span>

              <div className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold">
                one theme model
              </div>
            </div>
          </div>

          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The left column is the runtime: the provider creates it, owns the
            reactive selection, applies the DOM and CSS-variable bindings, and
            handles persistence, transitions, scopes, adapters and plugins. It
            takes no theme props, because the plugin already put the
            configuration in the page for it:
          </p>
          <CodeBlock
            html={highlightCode(providerSnippet.code, "tsx")}
            code={providerSnippet.code}
            language="tsx"
            filename={providerSnippet.title}
            className="m-0"
          />
          <p className="text-sm opacity-80 leading-relaxed mt-3 mb-3">
            The right column is the bootstrap: the plugin discovers the
            configuration, derives the blocking script from it, and injects that
            script into <code className="mono text-[0.9em]">index.html</code>.
            Neither reads the other&apos;s state, because neither declares any —
            both read the file at the top.
          </p>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Declaring the same values twice is therefore not just redundant, it is
            the bug this architecture removes:
          </p>
          <CodeBlock
            html={highlightCode(antiPatternSnippet.code, "tsx")}
            code={antiPatternSnippet.code}
            language="tsx"
            filename={antiPatternSnippet.title}
            className="m-0"
          />
          <p className="text-sm opacity-80 leading-relaxed mt-3 mb-3">
            The plugin and the provider each keep a copy, and nothing keeps the
            copies equal. When they drift, the script paints one theme and the
            runtime corrects it a frame later — the flash you installed the plugin
            to prevent is exactly what you get. Read the configuration from one
            place instead:
          </p>
          <CodeBlock
            html={highlightCode(declaredOnceSnippet.code, "tsx")}
            code={declaredOnceSnippet.code}
            language="tsx"
            filename={declaredOnceSnippet.title}
            className="m-0"
          />
          <Callout variant="neutral" className="mt-3">
            <p className="text-sm leading-relaxed">
              See{" "}
              <Link
                href="/architecture#configuration"
                className="text-primary hover:underline"
              >
                Architecture → Configuration
              </Link>{" "}
              for the full contract, including a table of which keys each
              consumer reads.
            </p>
          </Callout>
        </section>

        <section id="theme-config" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="The one file the plugin and the provider both read."
          >
            Create theme.config.ts
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Put it at the project root — the same level as{" "}
            <code className="mono text-[0.9em]">vite.config.ts</code>. It is an
            ordinary module, so{" "}
            <code className="mono text-[0.9em]">themes</code> can come from
            anywhere: a local file, a package, or the built-in set. Here it is a
            local file, which is the usual shape:
          </p>
          <CodeBlock
            html={highlightCode(themeConfigSnippet.code, "ts")}
            code={themeConfigSnippet.code}
            language="ts"
            filename={themeConfigSnippet.title}
            className="m-0"
          />
          <CodeBlock
            html={highlightCode(themesModuleSnippet.code, "ts")}
            code={themesModuleSnippet.code}
            language="ts"
            filename={themesModuleSnippet.title}
            className="m-0 mt-3"
          />
          <div className="mt-4 rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      Key
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                      What it decides
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {themeConfigKeys.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-border last:border-0 align-top"
                    >
                      <td className="px-4 py-2.5 mono text-[0.85em] whitespace-nowrap">
                        {row.key}
                        {row.optional ? (
                          <span className="opacity-45"> ?</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 opacity-70">{row.decides}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Callout variant="neutral" className="mt-3" title="Which keys reach the page">
            <p className="text-sm leading-relaxed">
              The bootstrap needs a registry, a fallback theme, an initial
              mode/family, a storage key and a prefix — and nothing else, because
              nothing else can affect a frame painted before the runtime exists.
              Runtime-only keys such as{" "}
              <code className="mono text-[0.9em]">transition</code>,{" "}
              <code className="mono text-[0.9em]">persistence</code>,{" "}
              <code className="mono text-[0.9em]">scrollbar</code>,{" "}
              <code className="mono text-[0.9em]">plugins</code> and{" "}
              <code className="mono text-[0.9em]">adapters</code> are never
              serialized into the page. Pass those to the provider directly —
              they are not serializable, so they cannot make the round trip.
            </p>
          </Callout>
          <p className="text-sm opacity-80 leading-relaxed mt-4">
            No file at all is also valid: with nothing to discover, the plugin and
            the provider both fall back to the built-in neutral themes. You lose
            your own registry, not the theming.
          </p>
        </section>

        <section id="register" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="One line appended to the build config you already have."
          >
            Register the Plugin
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Every framework below hosts its build on Vite, so the registration is
            the same call in a different config file. Your framework&apos;s own
            plugin is untouched — Theme Kit&apos;s is appended to it. Astro and
            Nuxt register their own integration instead, because their module
            systems are the canonical configuration surface; both discover the
            same{" "}
            <code className="mono text-[0.9em]">theme.config.ts</code>.
          </p>
          <FrameworkTabs examples={registrationExamplesWithHtml} />
          <Callout className="mt-3">
            <strong>Import path</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            The plugin is exported from{" "}
            <code className="mono text-[0.9em]">@theme-kit/core/vite</code>,
            not the main entry point. This keeps the core bundle clean when you
            only need the runtime.
          </Callout>
          <Link
            href="/examples#starter-apps"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3 mt-3"
          >
            <div>
              <div className="font-semibold">
                See the complete Vite + React example
              </div>
              <div className="text-xs opacity-60">
                <code className="mono">examples/apps/react</code> —
                theme.config.ts,
                vite.config.ts, the provider with no props, and the dev
                prerender. A real source tree, read from the repository.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
        </section>


        <section id="why" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Providers are already flash-proof; the plugin covers the pre-bundle frame."
          >
            Why a Vite Plugin?
          </SectionHeading>
          <Callout variant="neutral" title="Do you still need this?">
            <p className="text-sm leading-relaxed">
              Since <code className="mono text-[0.9em]">@theme-kit/react</code>{" "}
              (and Vue, Svelte, Solid) <strong>1.2.0</strong>, the providers are
              flash-proof out of the box — they inject the blocking bootstrap
              themselves before first paint. The vite plugin is only needed if
              you want the theme applied on the absolute first frame{" "}
              <em>before the bundle loads</em> (relevant for slow bundles or
              network-sensitive previews).
            </p>
          </Callout>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              <strong>Pre-bundle first frame</strong> — the bootstrap script
              runs synchronously from <code className="mono text-[0.9em]">index.html</code>{" "}
              before the bundle loads, so even the raw HTML frame is themed.
            </li>
            <li>
              <strong>No runtime overhead</strong> — the script is injected at
              build time and does not ship as a separate chunk. It runs once
              and is never re-evaluated.
            </li>
            <li>
              <strong>SSR-compatible</strong> — the SSR framework packages
              (Next.js, Nuxt, Remix) emit this same bootstrap into the
              server-rendered HTML, so the client script and the server markup
              agree instead of fighting over the first frame.
            </li>
            <li>
              <strong>Tree-shakeable</strong> — only the theme definitions you
              pass in are included in the bootstrap output. No unused code
              reaches the client.
            </li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            <div className="rounded-lg border border-border bg-muted/10 px-3.5 py-3">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                Without the plugin
              </div>
              <ol className="text-xs opacity-70 leading-relaxed list-decimal pl-4 space-y-1">
                <li>The browser paints the default theme.</li>
                <li>The bundle loads and the app hydrates.</li>
                <li>The runtime reads the persisted selection and swaps.</li>
                <li>The visitor saw the wrong theme for that whole gap.</li>
              </ol>
            </div>
            <div className="rounded-lg border border-border bg-muted/10 px-3.5 py-3">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                With the plugin
              </div>
              <ol className="text-xs opacity-70 leading-relaxed list-decimal pl-4 space-y-1">
                <li>The script is injected at the top of the head at build time.</li>
                <li>It runs synchronously, before anything is painted.</li>
                <li>It writes the theme and its variables onto the root element.</li>
                <li>The first paint is already the right theme.</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="what-it-does" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="The plugin reads theme.config.ts and produces an inline script that sets the correct theme before paint. It is not a second runtime."
          >
            What It Does
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              Flattens the theme definitions you pass into two inlined tables —
              every theme&apos;s{" "}
              <code className="mono text-[0.9em]">--theme-*</code> variables,
              keyed by theme name and by{" "}
              <code className="mono text-[0.9em]">family:mode</code>.
            </li>
            <li>
              Generates a self-contained IIFE that reads the persisted selection
              from{" "}
              <code className="mono text-[0.9em]">localStorage</code>, resolves
              the effective mode ({" "}
              <code className="mono text-[0.9em]">&quot;system&quot;</code>{" "}
              against{" "}
              <code className="mono text-[0.9em]">prefers-color-scheme</code>),
              then writes the variables,{" "}
              <code className="mono text-[0.9em]">data-theme</code>,{" "}
              <code className="mono text-[0.9em]">data-theme-mode</code>,{" "}
              <code className="mono text-[0.9em]">data-theme-family</code>,{" "}
              <code className="mono text-[0.9em]">color-scheme</code> and the{" "}
              <code className="mono text-[0.9em]">.dark</code> class onto{" "}
              <code className="mono text-[0.9em]">&lt;html&gt;</code>.
            </li>
            <li>
              Injects the script as{" "}
              <code className="mono text-[0.9em]">&lt;head&gt;</code>-prepend
              with{" "}
              <code className="mono text-[0.9em]">enforce: "pre"</code> so it
              runs before any other head scripts.
            </li>
            <li>
              Fills in any element marked{" "}
              <code className="mono text-[0.9em]">
                data-tk-readout=&quot;theme&quot; | &quot;mode&quot; |
                &quot;family&quot; | &quot;var:&lt;name&gt;&quot;
              </code>
              . The script owns that element&apos;s text: it writes the value it
              resolved, and watches for readouts that appear later so a
              prerendered label is corrected before it can be painted. Use it
              for static markup — inside a component that renders its own text,
              the component and the script will overwrite each other.
            </li>
          </ul>
          <p className="text-sm opacity-80 leading-relaxed mt-4 mb-3">
            End to end, from your config file to the runtime:
          </p>
          <ol className="flex flex-col gap-2">
            {pipelineSteps.map((step, i) => (
              <li key={step.label} className="flex gap-3 items-start">
                <span
                  aria-hidden
                  className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-[11px] font-bold bg-muted text-foreground/50 mt-0.5"
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="mono text-[0.9em] font-semibold">
                      {step.label}
                    </code>
                    {step.internal ? (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-border opacity-55">
                        internal
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs opacity-60 leading-relaxed mt-0.5">
                    {step.detail}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <Callout variant="neutral" className="mt-3">
            <p className="text-sm leading-relaxed">
              The two steps marked internal are shared implementation detail, not
              API — they are absent from the public export surface. The public
              entry point for the same pipeline is{" "}
              <code className="mono text-[0.9em]">
                createThemeBootstrapScript
              </code>
              , for an app that manages its own{" "}
              <code className="mono text-[0.9em]">&lt;head&gt;</code>.
            </p>
          </Callout>
          <Callout variant="neutral" title="Why doesn't the plugin read my provider's props?">
            <p className="text-sm leading-relaxed">
              Vite runs in the build/dev pipeline; provider props are runtime
              application state. The plugin does not inspect React/Vue/Solid
              components to discover configuration — both the plugin and the
              provider read the same project-level{" "}
              <code className="mono text-[0.9em]">theme.config.ts</code> instead.
              Nothing is parsed, so nothing can be missed by a dynamic prop
              expression.
            </p>
          </Callout>
          <p className="text-sm opacity-80 leading-relaxed mt-4 mb-3">
            What ends up in the served HTML is a single inline script, prepended
            to the head. It carries two inlined tables — every theme&apos;s
            variables, keyed by name and by{" "}
            <code className="mono text-[0.9em]">family:mode</code> — which is
            what makes it tens of kilobytes, and what lets it resolve the right
            theme without loading anything:
          </p>
          <CodeBlock
            html={highlightCode(bootstrapSnippet.code, "html")}
            code={bootstrapSnippet.code}
            language="html"
            filename={bootstrapSnippet.title}
            className="m-0 mt-3"
          />
        </section>

        <section id="options" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="Full control over which themes are bundled, the default selection, and the storage key."
          >
            Options
          </SectionHeading>
          <CodeBlock
            html={highlightCode(optionsSnippet.code, "ts")}
            code={optionsSnippet.code}
            language="ts"
            filename={optionsSnippet.title}
            className="m-0"
          />
          <div className="mt-3 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Options reference
            </div>
            <div className="divide-y divide-border text-sm">
              {[
                ["config", "ThemeKitConfig | string", "Optional. Normally omitted: the plugin discovers theme.config.ts at the project root. Pass a path when the file lives elsewhere, or the config object itself. The object wins outright, and the deprecated inline theme options are ignored when it is present."],
                ["scrollbar", "boolean | PrePaintScrollbarOptions", "Injects the pre-paint scrollbar script so the native bar is hidden from the first frame. Defaults to false."],
                ["syncFirstRender", "boolean", "Commits React's first render synchronously, so the first painted frame is the app rather than an empty root. Defaults to true; ignored when React is absent."],
                ["ssrEntry", "string | null", "Module exporting `render(): string`. Prerenders #root in the dev server, where unbundled modules would otherwise leave it empty for seconds. Defaults to \"/src/entry-server.tsx\"; pass null to opt out. Builds prerender separately."],
                ["ssrContainer", "string", "id of the element ssrEntry's markup is injected into. Defaults to \"root\"."],
              ].map(([name, type, desc]) => (
                <div key={name} className="px-4 py-3 grid grid-cols-[120px_1fr] sm:grid-cols-[140px_160px_1fr] gap-2 items-baseline">
                  <code className="mono text-[0.85em] font-semibold">{name}</code>
                  <code className="mono text-[0.8em] opacity-50 hidden sm:block">{type}</code>
                  <span className="text-xs opacity-60 sm:col-span-1">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="first-render" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={7}
            desc="React schedules its first commit; one frame with an empty root can be painted first. The plugin commits it synchronously for you."
          >
            The first render
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            A client-rendered React app can paint one frame — ~33&nbsp;ms —
            with the root still empty before React commits, which reads as the
            UI <strong>blinking</strong> on reload. It is not a theming problem:
            the canvas is already correct (that is what the bootstrap above is
            for). It is React&apos;s concurrent root scheduling the initial
            commit.
          </p>
          <Callout variant="neutral" title="Why a provider cannot fix it">
            <p className="text-sm leading-relaxed">
              That frame is painted <em>before any of your React code runs</em>,
              so no component, insertion effect or layout effect is in time.
              It has to happen at the root.{" "}
              <code className="mono text-[0.9em]">syncFirstRender</code> (on by
              default) resolves{" "}
              <code className="mono text-[0.9em]">react-dom/client</code> to a
              shim that flushes the <strong>first</strong>{" "}
              <code className="mono text-[0.9em]">render</code> call
              synchronously. Every later render keeps React&apos;s normal
              concurrent scheduling,{" "}
              <code className="mono text-[0.9em]">hydrateRoot</code> is
              untouched so SSR apps are unaffected, and your application code
              does not change —{" "}
              <code className="mono text-[0.9em]">&lt;ThemeProvider&gt;</code>{" "}
              alone is enough. The alias applies only to imports from{" "}
              <strong>your own source</strong>: a dependency that creates its
              own root resolves the real{" "}
              <code className="mono text-[0.9em]">react-dom/client</code> and is
              left exactly as it was.
            </p>
          </Callout>
          <p className="text-sm opacity-80 leading-relaxed mt-3">
            The window <em>before the bundle runs</em> is out of scope for
            anything library-side: until your entry module executes, the root is
            empty by definition. A themed canvas keeps that window from reading
            as a flash, and only a prerendered first paint puts content in it.
          </p>
        </section>

        <section id="ssr" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={8}
            desc="SSR frameworks don't serve index.html — use their own package, which emits the same bootstrap from the server."
          >
            SSR Integration
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The Vite plugin only transforms{" "}
            <code className="mono text-[0.9em]">index.html</code>, which an SSR
            framework never serves. Those frameworks have their own package that
            resolves the theme on the server and emits the same bootstrap into
            the response, so the first server-painted HTML already carries{" "}
            <code className="mono text-[0.9em]">data-theme</code> and the
            variables.
          </p>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                Next.js
              </div>
              <CodeBlock
                html={highlightCode(ssrNextSnippet.code, "ts")}
                code={ssrNextSnippet.code}
                language="ts"
                filename={ssrNextSnippet.title}
                className="m-0"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                Nuxt
              </div>
              <CodeBlock
                html={highlightCode(ssrNuxtSnippet.code, "ts")}
                code={ssrNuxtSnippet.code}
                language="ts"
                filename={ssrNuxtSnippet.title}
                className="m-0"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                Remix
              </div>
              <CodeBlock
                html={highlightCode(ssrRemixSnippet.code, "tsx")}
                code={ssrRemixSnippet.code}
                language="tsx"
                filename={ssrRemixSnippet.title}
                className="m-0"
              />
            </div>
          </div>
          <Callout className="mt-3">
            <strong>Hydration safety</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            The framework package renders every attribute the pre-paint script
            writes —{" "}
            <code className="mono text-[0.9em]">data-theme</code>,{" "}
            <code className="mono text-[0.9em]">data-theme-mode</code>,{" "}
            <code className="mono text-[0.9em]">data-theme-family</code>,{" "}
            <code className="mono text-[0.9em]">data-theme-selection-mode</code>,{" "}
            <code className="mono text-[0.9em]">data-theme-selection-family</code>{" "}
            and{" "}
            <code className="mono text-[0.9em]">data-theme-ready</code> — so
            React finds nothing the script added that the server did not already
            declare. Its hooks also return the server&apos;s values for the
            hydration render, then switch to the live ones. If you hand-roll the
            script instead of using the framework package, declaring those
            attributes is yours to do.
          </Callout>
        </section>

        <section id="troubleshooting" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={9}
            desc="The failures this architecture actually produces — and what each one means."
          >
            Troubleshooting
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {configTroubleshooting.map((item) => (
              <div
                key={item.symptom}
                className="rounded-lg border border-border bg-muted/20 px-3.5 py-3"
              >
                <div className="text-sm font-semibold mb-1">
                  &ldquo;{item.symptom}&rdquo;
                </div>
                <p className="text-sm opacity-70 leading-relaxed">{item.fix}</p>
              </div>
            ))}
          </div>
          <p className="text-sm opacity-80 leading-relaxed mt-4 mb-3">
            Two warnings are worth recognising on sight. Both come from the
            loader, and both mean discovery returned{" "}
            <code className="mono text-[0.9em]">null</code> — so the bootstrap
            silently fell back to the built-in themes rather than failing the
            build:
          </p>
          <CodeBlock
            html={highlightCode(discoveryWarnings, "bash")}
            code={discoveryWarnings}
            language="bash"
            filename="what a failed discovery looks like"
            className="m-0"
          />
          <p className="text-sm opacity-80 leading-relaxed mt-3">
            The first means Vite could not be resolved from your project, which a
            TypeScript config needs in order to load — declare{" "}
            <code className="mono text-[0.9em]">vite</code>, or pass the config
            object directly. The second means the file was found but Vite rejected
            its shape, which in practice is a config with only a named export;
            discovery reads the default export.
          </p>
        </section>

        <NextSteps
          steps={[
            {
              title: "Understand zero-flash",
              description: "Learn how the bootstrap script prevents theme flashing",
              href: "/zero-flash",
            },
            {
              title: "Configure persistence",
              description: "Storage key, cookie sync, and SSR considerations",
              href: "/persistence",
            },
          ]}
        />

        <RelatedLinks
          links={[
            {
              title: "Zero Flash",
              description: "The complete story on flash-free theme loading",
              href: "/zero-flash",
            },
            {
              title: "Persistence",
              description: "Storage keys, cookies, and SSR considerations",
              href: "/persistence",
            },
            {
              title: "Custom Scrollbar",
              description: "Coordinate scrollbar hiding with the plugin",
              href: "/custom-scrollbar",
            },
          ]}
        />
      </div>
    </DocsLayout>
  );
}
