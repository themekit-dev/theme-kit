import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Vite Plugin",
  description:
    "Optional Vite plugin for Theme Kit — apply the persisted theme on the pre-bundle first frame. The providers are already flash-proof; use this for slow bundles or custom heads.",
};

const setupSnippet = {
  lang: "ts",
  title: "vite.config.ts",
  code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { themeKitVitePlugin } from "@theme-kit/core/vite";
import { customThemes } from "./src/themes";

export default defineConfig({
  plugins: [
    react(),
    themeKitVitePlugin({
      themes: customThemes,
      defaultTheme: "light",
    }),
  ],
});`,
};

const optionsSnippet = {
  lang: "ts",
  title: "themeKitVitePlugin — all options",
  code: `import { themeKitVitePlugin } from "@theme-kit/core/vite";

themeKitVitePlugin({
  // All theme definitions registered with the runtime
  themes: customThemes,

  // Theme applied on first visit (before localStorage)
  defaultTheme: "light",

  // OS-level mode: "light" | "dark" | "system"
  initialMode: "system",

  // Scoped family to activate initially
  initialFamily: "brand",

  // localStorage key for the persisted selection
  // Default: "theme-selection"
  storageKey: "theme-selection",

  // CSS custom property prefix
  // Default: "theme-"
  prefix: "theme-",
});`,
};

const bootstrapSnippet = {
  lang: "html",
  title: "index.html — what gets injected",
  code: `<!doctype html>
<html lang="en">
  <head>
    <!-- Injected by the plugin at build time -->
    <script>
      /* Theme Kit bootstrap — runs before first paint */
      (function() {
        var key = "theme-selection";
        var stored = localStorage.getItem(key);
        var theme = stored || "light";
        document.documentElement.setAttribute("data-theme", theme);
      })();
    </script>
    <title>My App</title>
  </head>
  <body>…</body>
</html>`,
};

const ssrNextSnippet = {
  lang: "ts",
  title: "next.config.mjs — Next.js integration",
  code: `// The Vite plugin is framework-agnostic, but SSR frameworks
// need the bootstrap on the server-rendered HTML too.
// For Next.js, inject the script in your root layout:

// app/layout.tsx
const ThemeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: \`
        (function() {
          var key = "theme-selection";
          var stored = localStorage.getItem(key);
          var theme = stored || "light";
          document.documentElement.setAttribute("data-theme", theme);
        })();
      \`,
    }}
  />
);

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
};

const ssrNuxtSnippet = {
  lang: "ts",
  title: "nuxt.config.ts — Nuxt integration",
  code: `export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          innerHTML: \`
            (function() {
              var key = "theme-selection";
              var stored = localStorage.getItem(key);
              var theme = stored || "light";
              document.documentElement.setAttribute("data-theme", theme);
            })();
          \`,
        },
      ],
    },
  },
});`,
};

const noFlashSnippet = {
  lang: "ts",
  title: "why it matters — zero-flash explained",
  code: `// Without the plugin:
//   1. Browser loads HTML → default theme rendered
//   2. JS hydrates → reads localStorage → swaps theme
//   3. User sees a flash of the wrong theme
//
// With the plugin:
//   1. Build injects the bootstrap script at the top of <head>
//   2. Browser loads HTML → script runs synchronously before render
//   3. data-theme is set on <html> before the first paint
//   4. CSS picks up the correct custom properties immediately
//   5. No flash, ever`,
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const vitePluginHeadings = buildPageHeadings([
  { text: "Why a Vite Plugin?", level: 2 },
  { text: "Setup", level: 2 },
  { text: "What It Does", level: 2 },
  { text: "Options", level: 2 },
  { text: "SSR Integration", level: 2 },
]);

export default function VitePluginPage() {
  return (
    <DocsLayout headings={vitePluginHeadings}>
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

        <section id="why" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
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
              <strong>SSR-compatible</strong> — works alongside server-rendered
              frameworks (Next.js, Nuxt, Remix) by mirroring the same
              bootstrap in the server-rendered HTML.
            </li>
            <li>
              <strong>Tree-shakeable</strong> — only the theme definitions you
              pass in are included in the bootstrap output. No unused code
              reaches the client.
            </li>
          </ul>
          <CodeBlock
            html={highlightCode(noFlashSnippet.code, "ts")}
            code={noFlashSnippet.code}
            language="ts"
            filename={noFlashSnippet.title}
            className="m-0 mt-3"
          />
        </section>

        <section id="setup" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Drop the plugin into your Vite config alongside your framework plugin."
          >
            Setup
          </SectionHeading>
          <CodeBlock
            html={highlightCode(setupSnippet.code, "ts")}
            code={setupSnippet.code}
            language="ts"
            filename={setupSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Import path</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            The plugin is exported from{" "}
            <code className="mono text-[0.9em]">@theme-kit/core/vite</code>,
            not the main entry point. This keeps the core bundle clean when
            you only need the runtime.
          </Callout>
        </section>

        <section id="what-it-does" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="The plugin reads your theme definitions and produces an inline script that sets the correct theme before paint."
          >
            What It Does
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              Reads the theme definitions and{" "}
              <code className="mono text-[0.9em]">localStorage</code> key at
              build time.
            </li>
            <li>
              Generates a self-contained IIFE that checks{" "}
              <code className="mono text-[0.9em]">localStorage</code>, falls
              back to the default theme, and sets{" "}
              <code className="mono text-[0.9em]">data-theme</code> on{" "}
              <code className="mono text-[0.9em]">&lt;html&gt;</code>.
            </li>
            <li>
              Injects the script as{" "}
              <code className="mono text-[0.9em]">&lt;head&gt;</code>-prepend
              with{" "}
              <code className="mono text-[0.9em]">enforce: "pre"</code> so it
              runs before any other head scripts.
            </li>
          </ul>
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
            num={4}
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
                ["themes", "readonly ThemeDefinition[]", "Required. The theme definitions to include in the bootstrap."],
                ["defaultTheme", "string", "Theme applied on first visit before localStorage has a value."],
                ["initialMode", "\"light\" | \"dark\" | \"system\"", "OS-level color scheme hint. Defaults to \"system\"."],
                ["initialFamily", "string", "Scoped family to activate on first visit."],
                ["storageKey", "string", "localStorage key for the persisted selection. Defaults to \"theme-selection\"."],
                ["prefix", "string", "CSS custom property prefix. Defaults to \"theme-\"."],
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

        <section id="ssr" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="For SSR frameworks, mirror the same bootstrap in server-rendered HTML to avoid a hydration mismatch."
          >
            SSR Integration
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The Vite plugin only transforms{" "}
            <code className="mono text-[0.9em]">index.html</code>, which is
            not used by SSR frameworks. Instead, embed the same bootstrap
            script directly in your server-rendered markup so the{" "}
            <code className="mono text-[0.9em]">data-theme</code> attribute is
            present on the first server-painted HTML.
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
          </div>
          <Callout className="mt-3">
            <strong>Hydration safety</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Always add{" "}
            <code className="mono text-[0.9em]">suppressHydrationWarning</code>{" "}
            to the{" "}
            <code className="mono text-[0.9em]">&lt;html&gt;</code> element.
            The server cannot know what the client has in{" "}
            <code className="mono text-[0.9em]">localStorage</code>, so the
            attribute will differ on first render.
          </Callout>
        </section>
      </div>
    </DocsLayout>
  );
}
