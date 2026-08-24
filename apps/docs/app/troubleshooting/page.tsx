import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Troubleshooting",
  description:
    "Common issues and fixes when working with Theme Kit: flash of unstyled content, hydration mismatches, theme persistence, CSS variable binding, and more.",
};

const foucFix = {
  lang: "tsx",
  title: "layout.tsx — bootstrap script in <head>",
  code: `import { createThemeBootstrapScript } from "@theme-kit/core";
import { themes } from "./themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: createThemeBootstrapScript({
              themes,
              defaultTheme: "mint-light",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
};`,
};

const persistenceFix = {
  lang: "ts",
  title: "runtime — persistence plugin with a custom key",
  code: `import { createThemeRuntime, createPersistencePlugin } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  plugins: [createPersistencePlugin({ key: "my-app-theme" })],
});`,
};

const cssVarsFix = {
  lang: "tsx",
  title: "provider — cssVariables binding enabled",
  code: `import { ThemeProvider } from "@theme-kit/react";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="light"
      cssVariables={{ prefix: "theme-" }}
      dom={{}}
    >
      {children}
    </ThemeProvider>
  );
}`,
};

const hydrationFix = {
  lang: "tsx",
  title: "layout.tsx — matching server & client themes",
  code: `// 1. Resolve the theme server-side the same way the runtime does
// 2. Pass it as defaultTheme to the provider
// 3. suppressHydrationWarning on <html> handles the attribute diff
import { createThemeBootstrapScript } from "@theme-kit/core";
import { ThemeProvider } from "@theme-kit/react";
import { themes } from "./themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: createThemeBootstrapScript({
              themes,
              defaultTheme: resolvedTheme,
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider themes={themes} defaultTheme={resolvedTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`,
};

const flickerFix = {
  lang: "tsx",
  title: "layout.tsx — provider wraps the router",
  code: `// Ensure the ThemeProvider is ABOVE the router so the runtime
// survives client-side navigation without re-mounting.
import { createThemeBootstrapScript } from "@theme-kit/core";
import { ThemeProvider } from "@theme-kit/react";
import { themes } from "./themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: createThemeBootstrapScript({
              themes,
              defaultTheme: "light",
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider themes={themes} defaultTheme="light">
          {/* AppRouter / layout from next/navigation lives here */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`,
};

const scopedFix = {
  lang: "tsx",
  title: "page.tsx — wrapping a subtree with ThemeScope",
  code: `import { ThemeScope } from "@theme-kit/react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ThemeScope theme="corporate-light">
        {/* Only this subtree uses the scoped theme */}
        <WidgetPanel />
        <AnalyticsCard />
      </ThemeScope>
    </div>
  );
}`,
};

const transitionsFix = {
  lang: "ts",
  title: "runtime — enabling transitions",
  code: `const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  transition: {
    enabled: true,
    preset: "smooth",
    duration: 360,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
});`,
};

const moduleNotFoundFix = {
  lang: "bash",
  title: "terminal — pin matching versions",
  code: `# Ensure @theme-kit/core and the framework integration share
# the exact same version — mismatched versions cause module
# resolution failures.

npm install @theme-kit/core@latest @theme-kit/react@latest

# Or with pnpm
pnpm add @theme-kit/core@latest @theme-kit/react@latest`,
};

const a11yFix = {
  lang: "ts",
  title: "audit — validate contrast at build time",
  code: `import { validateThemeContrast } from "@theme-kit/core";

// validateThemeContrast checks one theme against its registry
const result = validateThemeContrast(theme, { themes });

if (!result.valid) {
  console.error("Failing token pairs (AA large text):");
  result.checks
    .filter((check) => !check.passesAALarge)
    .forEach((check) => {
      console.error(
        \`  \${check.foregroundToken} on \${check.backgroundToken}:\`,
      );
      console.error(\`    ratio \${check.ratio.toFixed(2)}:1\`);
    });
  process.exit(1);
}`,
};

const multiWindowFix = {
  lang: "ts",
  title: "runtime — explicit multi-window sync",
  code: `import { createThemeRuntime, createMultiWindowSync } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  // BroadcastChannel is used by default. If it is blocked or unavailable
  // the sync falls back to a SharedWorker, then to window "storage" events
  // (works in all browsers that support localStorage). Prefer "sharedworker"
  // to start from the worker strategy:
  broadcast: createMultiWindowSync({ prefer: "auto" }),
});`,
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const troubleshootingHeadings = buildPageHeadings([
  { text: "Flash of Unstyled Content (FOUC)", level: 2 },
  { text: "Theme Not Persisting", level: 2 },
  { text: "CSS Variables Not Updating", level: 2 },
  { text: "Hydration Mismatch", level: 2 },
  { text: "Theme Flicker on Navigation", level: 2 },
  { text: "Scoped Theme Not Working", level: 2 },
  { text: "Transitions Not Animating", level: 2 },
  { text: "Build Error: Module Not Found", level: 2 },
  { text: "Accessibility Audit Failing", level: 2 },
  { text: "Multi-Window Out of Sync", level: 2 },
]);

export default function TroubleshootingPage() {
  return (
    <DocsLayout headings={troubleshootingHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Troubleshooting"
          icon="alert-triangle"
          title="Common issues and fixes"
          description={
            <>
              Run into something unexpected? This page covers the most common
              issues developers encounter when integrating Theme Kit and how to
              resolve them quickly.
            </>
          }
        />

        <section id="fouc" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="A flash of unstyled or incorrectly-styled content before the theme loads."
          >
            Flash of Unstyled Content (FOUC)
          </SectionHeading>
          <Callout>
            The bootstrap script must run before the browser paints any
            content. If it is placed in the body or loaded asynchronously,
            the first paint uses the browser default and then snaps to the
            correct theme — causing a visible flash.
          </Callout>
          <CodeBlock
            html={highlightCode(foucFix.code, "tsx")}
            code={foucFix.code}
            language="tsx"
            filename={foucFix.title}
            className="m-0"
          />
        </section>

        <section id="persistence" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="The selected theme resets after a page reload or closes and reopens."
          >
            Theme Not Persisting
          </SectionHeading>
          <Callout>
            Theme persistence is provided by a persistence adapter. The default
            adapter uses localStorage under the key{" "}
            <code className="mono text-[0.9em]">theme-selection</code> — if
            another script writes to the same key, or if the user is in
            incognito mode with restricted storage, the theme will not
            persist. Create an explicit adapter with{" "}
            <code className="mono text-[0.9em]">createThemePersistence()</code>{" "}
            and a custom key, and verify that{" "}
            <code className="mono text-[0.9em]">localStorage</code> is
            accessible.
          </Callout>
          <CodeBlock
            html={highlightCode(persistenceFix.code, "ts")}
            code={persistenceFix.code}
            language="ts"
            filename={persistenceFix.title}
            className="m-0"
          />
        </section>

        <section id="css-variables" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="CSS custom properties on <html> or <body> are not reflecting the active theme."
          >
            CSS Variables Not Updating
          </SectionHeading>
          <Callout>
            CSS variable injection is handled by the{" "}
            <code className="mono text-[0.9em]">cssVariables</code> binding. If
            it is set to <code className="mono text-[0.9em]">false</code> (or
            omitted), the runtime will not write{" "}
            <code className="mono text-[0.9em]">--theme-*</code> variables to the
            DOM. Ensure the provider is mounted and the binding is configured
            (it accepts a <code className="mono text-[0.9em]">prefix</code> and
            a <code className="mono text-[0.9em]">target</code> element).
          </Callout>
          <CodeBlock
            html={highlightCode(cssVarsFix.code, "tsx")}
            code={cssVarsFix.code}
            language="tsx"
            filename={cssVarsFix.title}
            className="m-0"
          />
        </section>

        <section id="hydration" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Next.js or React reports a hydration mismatch warning in the console."
          >
            Hydration Mismatch
          </SectionHeading>
          <Callout>
            During server rendering the theme is resolved from cookies, headers,
            or the default. On the client the bootstrap script resolves it
            independently. If these two resolutions disagree, React detects a
            mismatch. Ensure{" "}
            <code className="mono text-[0.9em]">defaultTheme</code> matches
            the server-side resolution and add{" "}
            <code className="mono text-[0.9em]">suppressHydrationWarning</code> to{" "}
            <code className="mono text-[0.9em]">&lt;html&gt;</code>.
          </Callout>
          <CodeBlock
            html={highlightCode(hydrationFix.code, "tsx")}
            code={hydrationFix.code}
            language="tsx"
            filename={hydrationFix.title}
            className="m-0"
          />
        </section>

        <section id="flicker" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="The theme briefly flashes to the default on client-side route changes."
          >
            Theme Flicker on Navigation
          </SectionHeading>
          <Callout>
            In SPA frameworks the provider must wrap the router. If the provider
            is inside a route or a layout that unmounts during navigation, the
            runtime is destroyed and re-created — causing a brief flicker as it
            re-reads from storage. Move the provider above the router so the
            runtime persists across all route changes.
          </Callout>
          <CodeBlock
            html={highlightCode(flickerFix.code, "tsx")}
            code={flickerFix.code}
            language="tsx"
            filename={flickerFix.title}
            className="m-0"
          />
        </section>

        <section id="scoped" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="A ThemeScope has no visible effect on the targeted subtree."
          >
            Scoped Theme Not Working
          </SectionHeading>
          <Callout>
            <code className="mono text-[0.9em]">ThemeScope</code> must directly
            wrap the subtree it should affect. If the scope is a sibling or
            ancestor at the wrong level, the scoped tokens will not reach the
            target components. Pass the scope as a theme name, a family, or a{" "}
            <code className="mono text-[0.9em]">{'{ family, mode }'}</code>{" "}
            object — the <code className="mono text-[0.9em]">themes</code> prop
            is for local <em>definitions</em>, not theme names. Verify the
            wrapping hierarchy.
          </Callout>
          <CodeBlock
            html={highlightCode(scopedFix.code, "tsx")}
            code={scopedFix.code}
            language="tsx"
            filename={scopedFix.title}
            className="m-0"
          />
        </section>

        <section id="transitions" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={7}
            desc="Theme switches are instant instead of animated."
          >
            Transitions Not Animating
          </SectionHeading>
          <Callout>
            Transitions are opt-in. If{" "}
            <code className="mono text-[0.9em]">transition.enabled</code> is{" "}
            <code className="mono text-[0.9em]">false</code> (the default),
            every theme switch is instant. Set{" "}
            <code className="mono text-[0.9em]">enabled: true</code> and choose a
            preset to enable animated transitions.
          </Callout>
          <CodeBlock
            html={highlightCode(transitionsFix.code, "ts")}
            code={transitionsFix.code}
            language="ts"
            filename={transitionsFix.title}
            className="m-0"
          />
        </section>

        <section id="module-not-found" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={8}
            desc="Your bundler throws a Module Not Found error for @theme-kit packages."
          >
            Build Error: Module Not Found
          </SectionHeading>
          <Callout>
            This typically happens when{" "}
            <code className="mono text-[0.9em]">@theme-kit/core</code> and the
            framework integration (e.g.{" "}
            <code className="mono text-[0.9em]">@theme-kit/react</code>) are on
            different versions. The packages share internal modules and must be
            the exact same version. Reinstall both packages at the latest version.
          </Callout>
          <CodeBlock
            html={highlightCode(moduleNotFoundFix.code, "bash")}
            code={moduleNotFoundFix.code}
            language="bash"
            filename={moduleNotFoundFix.title}
            className="m-0"
          />
        </section>

        <section id="a11y-audit" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={9}
            desc="Automated accessibility audits flag color contrast failures in your theme."
          >
            Accessibility Audit Failing
          </SectionHeading>
          <Callout>
            Theme tokens must meet WCAG contrast ratios for the text sizes
            where they are used. Use{" "}
            <code className="mono text-[0.9em]">validateThemeContrast()</code>{" "}
            from <code className="mono text-[0.9em]">@theme-kit/core</code> to
            audit every token pair at build time and catch failures before they
            reach production.
          </Callout>
          <CodeBlock
            html={highlightCode(a11yFix.code, "ts")}
            code={a11yFix.code}
            language="ts"
            filename={a11yFix.title}
            className="m-0"
          />
        </section>

        <section id="multi-window" className="scroll-mt-24">
          <SectionHeading
            num={10}
            desc="Changing the theme in one tab does not update other open tabs."
          >
            Multi-Window Out of Sync
          </SectionHeading>
          <Callout>
            Theme Kit uses{" "}
            <code className="mono text-[0.9em]">BroadcastChannel</code> to sync
            theme changes across tabs, and falls back to a SharedWorker and
            then to window <code className="mono text-[0.9em]">storage</code>{" "}
            events when it is unavailable (e.g. incognito, third-party
            iframes). Pass an explicit{" "}
            <code className="mono text-[0.9em]">broadcast</code> adapter from{" "}
            <code className="mono text-[0.9em]">createMultiWindowSync()</code>{" "}
            to control the strategy.
          </Callout>
          <CodeBlock
            html={highlightCode(multiWindowFix.code, "ts")}
            code={multiWindowFix.code}
            language="ts"
            filename={multiWindowFix.title}
            className="m-0"
          />
        </section>
      </div>
    </DocsLayout>
  );
}
