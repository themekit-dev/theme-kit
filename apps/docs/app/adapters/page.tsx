import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Adapters",
  description:
    "How Theme Kit translates themes into Bootstrap, shadcn/ui, daisyUI, Open Props, MUI, Chakra, Ant Design, Mantine and UnoCSS — strategies, plugins, the registry, and how to use them in every framework.",
};

const shadcnHookSnippet = {
  lang: "tsx",
  title: "react — one-line binding",
  code: `import { ThemeProvider, useTheme } from "@theme-kit/react";
import { useShadcnTheme } from "@theme-kit/shadcn";

function App() {
  useShadcnTheme();                 // one line — the adapter runs itself
  const { mode, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>{mode}</button>
    // …your shadcn/ui components
  );
}`,
};

const cssVarsSnippet = {
  lang: "ts",
  title: "css-variable adapter — factory",
  code: `import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";

const handle = runtime.adapters.use(createShadcnAdapter());`,
};

const tailwindV4Snippet = {
  lang: "css",
  title: "tailwind.config.ts",
  code: `import { defineConfig } from "tailwindcss";
import { createTailwindPlugin } from "@theme-kit/tailwind";

export default defineConfig({
  plugins: [createTailwindPlugin()],
});`,
};

const shadcnAdapterSnippet = {
  lang: "ts",
  title: "manual registration",
  code: `import { createThemeRuntime } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";

const runtime = createThemeRuntime({ initial: "light" });
const handle = runtime.adapters.use(createShadcnAdapter());

// switch themes at runtime — variables update automatically
runtime.selection.setMode("dark");

// cleanup when done
handle.dispose();`,
};

const antdAdapterSnippet = {
  lang: "tsx",
  title: "antd adapter — provider",
  code: `import { ThemeProvider, useThemeRuntime } from "@theme-kit/react";
import { useAntdTheme } from "@theme-kit/antd";

function AntdZone() {
  const runtime = useThemeRuntime();
  useAntdTheme(runtime);
  return <YourAntdApp />;
}

export function App() {
  return (
    <ThemeProvider>
      <AntdZone />
    </ThemeProvider>
  );
}`,
};

const unocssPresetSnippet = {
  lang: "ts",
  title: "uno.config.ts",
  code: `import { presetThemeKit } from "@theme-kit/unocss";
import { defineConfig } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetThemeKit()],
});`,
};

const unocssStaticSnippet = {
  lang: "ts",
  title: "build-time static output",
  code: `import { createUnoTheme } from "@theme-kit/unocss";
import { resolveInitialTheme } from "@theme-kit/core";

const { theme } = resolveInitialTheme({
  themes,
  family: "berry",
  mode: "light",
});

const staticTheme = createUnoTheme(theme);`,
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const adaptersHeadings = buildPageHeadings([
  { text: "CSS Variables (default, automatic)", level: 2 },
  { text: "Tailwind CSS v4", level: 2 },
  { text: "shadcn/ui adapter", level: 2 },
  { text: "Ant Design adapter", level: 2 },
  { text: "UnoCSS adapter", level: 2 },
  { text: "What's next", level: 2 },
]);

export default function AdaptersPage() {
  return (
    <DocsLayout headings={adaptersHeadings}>
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
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
          title="Adapters"
          subtitle="@theme-kit/core — the translation layer"
          description={
            <>
              An adapter translates a Theme Kit <code>ThemeDefinition</code>{" "}
              into whatever a specific UI library needs. Core knows nothing
              about Bootstrap, MUI, shadcn/ui, Ant Design or UnoCSS — it only
              knows themes, tokens and runtimes. Adapters bridge the gap.
            </>
          }
        />

        <Callout title="Key idea">
          Adapters are <strong>framework-agnostic</strong>. The{" "}
          <code>createXxxAdapter</code> factories run in plain TypeScript with
          zero framework imports. Each framework package wraps the same
          factories with its own composable, hook or injectable, so the exact
          same adapter works in React, Vue, Svelte, Solid, Angular, Next, Nuxt,
          Remix and Astro.
        </Callout>

        <section id="css-variables" className="scroll-mt-24 mb-10 mt-10">
          <SectionHeading
            num={1}
            desc="Class / utility-first CSS libraries (Bootstrap, shadcn/ui, daisyUI, Open Props) use CSS-variable adapters. They inject a live <style> element that exposes the library's own custom properties — components restyle the instant the theme changes."
          >
            CSS Variables (default, automatic)
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Every CSS-variable adapter follows the same shape: a{" "}
            <code className="mono text-[0.9em]">factory</code> entry for
            framework-neutral use, a React hook, and a CSS injector. By default
            <code className="mono text-[0.9em]"> injectCSS: true</code> — the
            compatibility stylesheet is injected automatically at install time.
          </p>
          <CodeBlock
            html={highlightCode(cssVarsSnippet.code, cssVarsSnippet.lang)}
            code={cssVarsSnippet.code}
            language={cssVarsSnippet.lang}
            filename={cssVarsSnippet.title}
            className="rounded-lg m-0"
          />
          <div className="mt-3 text-sm opacity-70 leading-relaxed">
            <p>
              The <code className="mono text-[0.9em]">factory</code> subpath
              imports adapters <strong>without React</strong>. Vue, Svelte, Solid
              and Angular packages all consume the same entry point.
            </p>
          </div>
        </section>

        <section id="tailwind" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Tailwind CSS v4 and UnoCSS are handled through build-time presets that expose Theme Kit tokens as utility classes referencing live --theme-* variables."
          >
            Tailwind CSS v4
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The <code className="mono text-[0.9em]">@theme-kit/tailwind</code>{" "}
            plugin maps resolved tokens to{" "}
            <code className="mono text-[0.9em]">--color-*</code>,{" "}
            <code className="mono text-[0.9em]">--radius-*</code>,{" "}
            <code className="mono text-[0.9em]">--spacing-*</code>,{" "}
            <code className="mono text-[0.9em]">--font-*</code> and{" "}
            <code className="mono text-[0.9em]">--shadow-*</code> utilities
            that update at runtime.
          </p>
          <CodeBlock
            html={highlightCode(tailwindV4Snippet.code, tailwindV4Snippet.lang)}
            code={tailwindV4Snippet.code}
            language={tailwindV4Snippet.lang}
            filename={tailwindV4Snippet.title}
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed">
            With this plugin, classes like{" "}
            <code className="mono text-[0.9em]">bg-primary</code>,{" "}
            <code className="mono text-[0.9em]">text-foreground</code>,{" "}
            <code className="mono text-[0.9em]">rounded-lg</code> and{" "}
            <code className="mono text-[0.9em]">shadow-md</code> all reference
            the active theme and switch instantly.
          </p>
        </section>

        <section id="shadcn" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="The shadcn/ui adapter writes CSS custom properties (--background, --foreground, --primary, etc.) that shadcn/ui components consume directly."
          >
            shadcn/ui adapter
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Use the React hook for zero-config binding, or register manually
            via the factory for full control over strategy, plugins and CSS
            injection.
          </p>
          <CodeBlock
            html={highlightCode(shadcnHookSnippet.code, shadcnHookSnippet.lang)}
            code={shadcnHookSnippet.code}
            language={shadcnHookSnippet.lang}
            filename={shadcnHookSnippet.title}
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed mb-3">
            For framework-neutral or non-React use, register the adapter
            manually:
          </p>
          <CodeBlock
            html={highlightCode(shadcnAdapterSnippet.code, shadcnAdapterSnippet.lang)}
            code={shadcnAdapterSnippet.code}
            language={shadcnAdapterSnippet.lang}
            filename={shadcnAdapterSnippet.title}
            className="rounded-lg m-0"
          />
        </section>

        <section id="antd" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Generated-theme adapters build a native theme object (MUI Theme, Chakra system, AntD ThemeConfig, Mantine theme) that you hand to that library's own provider."
          >
            Ant Design adapter
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The <code className="mono text-[0.9em]">@theme-kit/antd</code>{" "}
            package provides <code className="mono text-[0.9em]">useAntdTheme</code> and{" "}
            <code className="mono text-[0.9em]">AntdThemeProvider</code>. The
            theme object is rebuilt automatically on every theme change.
          </p>
          <CodeBlock
            html={highlightCode(antdAdapterSnippet.code, antdAdapterSnippet.lang)}
            code={antdAdapterSnippet.code}
            language={antdAdapterSnippet.lang}
            filename={antdAdapterSnippet.title}
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed">
            The same pattern applies to MUI (
            <code className="mono text-[0.9em]">useMuiTheme</code>), Chakra (
            <code className="mono text-[0.9em]">useChakraTheme</code>) and
            Mantine (
            <code className="mono text-[0.9em]">useMantineTheme</code>) —
            each exposes a hook and provider in the same shape.
          </p>
        </section>

        <section id="unocss" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="UnoCSS gets a build-time preset that exposes Theme Kit tokens as utilities referencing live --theme-* variables."
          >
            UnoCSS adapter
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Add <code className="mono text-[0.9em]">presetThemeKit()</code> to
            your UnoCSS config. Utilities like{" "}
            <code className="mono text-[0.9em]">bg-primary</code>,{" "}
            <code className="mono text-[0.9em]">text-foreground</code>,{" "}
            <code className="mono text-[0.9em]">border-border</code> and{" "}
            <code className="mono text-[0.9em]">font-sans</code> resolve to the
            active theme.
          </p>
          <CodeBlock
            html={highlightCode(unocssPresetSnippet.code, unocssPresetSnippet.lang)}
            code={unocssPresetSnippet.code}
            language={unocssPresetSnippet.lang}
            filename={unocssPresetSnippet.title}
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed mb-3">
            For build-time static output instead of runtime variables, use{" "}
            <code className="mono text-[0.9em]">createUnoTheme</code>:
          </p>
          <CodeBlock
            html={highlightCode(unocssStaticSnippet.code, unocssStaticSnippet.lang)}
            code={unocssStaticSnippet.code}
            language={unocssStaticSnippet.lang}
            filename={unocssStaticSnippet.title}
            className="rounded-lg m-0"
          />
        </section>

        <section id="next" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="Tokens are the input — adapters consume them. Explore what else Theme Kit offers."
          >
            What&apos;s next
          </SectionHeading>
          <div className="flex flex-col gap-2">
            <Link
              href="/packages"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Packages</div>
                <div className="text-xs opacity-60">
                  Browse every @theme-kit/* package — core, react, vue, svelte,
                  solid, angular, and every adapter.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/custom-themes"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Custom Themes</div>
                <div className="text-xs opacity-60">
                  defineTheme, extendTheme, composeTheme and the generation
                  studio.
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
