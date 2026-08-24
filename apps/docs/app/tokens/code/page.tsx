import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../../components/docs-layout";
import { CodeBlock } from "../../../components/code-block";
import { PageHeader } from "../../../components/ui/page-header";
import { SectionHeading } from "../../../components/ui/section-heading";
import { highlightCode } from "../../../lib/highlight";
import { buildPageHeadings } from "../../../lib/toc";

export const metadata: Metadata = {
  title: "Code Tokens",
  description:
    "Theme Kit's code-specific tokens for syntax highlighting: background, foreground, comment, keyword, string, number, function, variable, type, property, operator, punctuation, tag, attribute, lineNumber, selection, highlight, and gutter colors.",
};

const codeTokensSnippet = {
  lang: "ts",
  title: "theme tokens — defineTheme with code tokens",
  code: `import { defineTheme } from "@theme-kit/core";

const brand = defineTheme({
  name: "brand-dark",
  meta: { family: "brand", mode: "dark" },
  tokens: {
    colors: {
      background: "#0d1117",
      foreground: "#e6edf3",
      primary: "#58a6ff",
      primaryForeground: "#0d1117",
      // ... other semantic colors
    },
    typography: {
      fontFamilies: { mono: "JetBrains Mono, ui-monospace, monospace" },
    },
    code: {
      background: "#161b22",
      foreground: "#e6edf3",
      comment: "#8b949e",
      keyword: "#ff7b72",
      string: "#a5d6ff",
      number: "#79c0ff",
      function: "#d2a8ff",
      variable: "#e6edf3",
      type: "#ffa657",
      property: "#79c0ff",
      operator: "#ff7b72",
      punctuation: "#8b949e",
      tag: "#ff7b72",
      attribute: "#79c0ff",
      lineNumber: "#484f58",
      selection: "rgba(88, 166, 255, 0.3)",
      highlight: "rgba(255, 255, 255, 0.08)",
      gutter: "#161b22",
    },
  },
});`,
};

const enableCodeTokensSnippet = {
  lang: "ts",
  title: "Enable code tokens in CSS (globals.css)",
  code: `/* In your global CSS — these map to --theme-code-* variables */
.code-block {
  /* These become --tk-syntax-* variables used by Shiki */
  --tk-code-bg: var(--theme-code-background, var(--theme-color-muted));
  --tk-syntax-plain: var(--theme-code-foreground, var(--theme-color-foreground));
  --tk-syntax-comment: var(--theme-code-comment, color-mix(...));
  --tk-syntax-keyword: var(--theme-code-keyword, var(--theme-color-primary));
  --tk-syntax-string: var(--theme-code-string, color-mix(...));
  --tk-syntax-number: var(--theme-code-number, color-mix(...));
  --tk-syntax-function: var(--theme-code-function, color-mix(...));
  --tk-syntax-type: var(--theme-code-type, color-mix(...));
  --tk-syntax-tag: var(--theme-code-tag, color-mix(...));
  --tk-syntax-attr: var(--theme-code-attribute, color-mix(...));
  --tk-syntax-variable: var(--theme-code-variable, var(--theme-color-foreground));
  --tk-syntax-property: var(--theme-code-property, color-mix(...));
  --tk-syntax-operator: var(--theme-code-operator, color-mix(...));
  --tk-syntax-punctuation: var(--theme-code-punctuation, color-mix(...));
  --tk-syntax-diff-add: var(--theme-code-line-number, color-mix(...));
  --tk-syntax-diff-remove: var(--theme-code-selection, color-mix(...));
  --tk-syntax-danger: var(--theme-code-highlight, var(--theme-color-destructive));
}`,
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const codeTokensHeadings = buildPageHeadings([
  { text: "Define code tokens in your theme", level: 2 },
  { text: "Code token reference", level: 2 },
  { text: "Enable code tokens in your app", level: 2 },
  { text: "Best practices", level: 2 },
  { text: "Go deeper", level: 2 },
]);

export default function CodeTokensPage() {
  return (
    <DocsLayout headings={codeTokensHeadings}>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
          title="Code Tokens"
          subtitle="@theme-kit/core — syntax highlighting tokens"
          description={
            <>
              Theme Kit includes a dedicated <code className="mono">code</code>{" "}
              token group for syntax highlighting. Every token maps to a{" "}
              <code className="mono">--theme-code-*</code> CSS variable that
              Shiki (or any highlighter) can consume directly — so your code
              blocks re-theme automatically when the user switches themes,
              families, or modes.
            </>
          }
        />

        <section id="define" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="All 22 code tokens live under tokens.code and resolve alongside colors, spacing, typography, etc."
          >
            Define code tokens in your theme
          </SectionHeading>
          <CodeBlock
            html={highlightCode(codeTokensSnippet.code, codeTokensSnippet.lang)}
            code={codeTokensSnippet.code}
            language={codeTokensSnippet.lang}
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed">
            These tokens produce CSS variables like{" "}
            <code className="mono text-[0.9em]">--theme-code-background</code>,
            <code className="mono text-[0.9em]">--theme-code-keyword</code>,
            <code className="mono text-[0.9em]">--theme-code-string</code>, and
            so on — ready for any syntax highlighter.
          </p>
        </section>

        <section id="token-reference" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Complete reference of every code token, its purpose, and the CSS variable it produces."
          >
            Code token reference
          </SectionHeading>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2 font-semibold">Token</th>
                  <th className="text-left px-4 py-2 font-semibold">
                    CSS Variable
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">Purpose</th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Fallback
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">background</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-background</code>
                  </td>
                  <td className="px-4 py-2">Code block background</td>
                  <td className="px-4 py-2">muted / background mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">foreground</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-foreground</code>
                  </td>
                  <td className="px-4 py-2">Default text color in code</td>
                  <td className="px-4 py-2">foreground</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">comment</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-comment</code>
                  </td>
                  <td className="px-4 py-2">Comments, docstrings</td>
                  <td className="px-4 py-2">foreground @ 55%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">keyword</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-keyword</code>
                  </td>
                  <td className="px-4 py-2">Keywords, control flow, storage</td>
                  <td className="px-4 py-2">primary</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">string</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-string</code>
                  </td>
                  <td className="px-4 py-2">String literals, templates</td>
                  <td className="px-4 py-2">primary + green mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">number</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-number</code>
                  </td>
                  <td className="px-4 py-2">Numeric literals</td>
                  <td className="px-4 py-2">primary + orange mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">function</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-function</code>
                  </td>
                  <td className="px-4 py-2">Function/method names</td>
                  <td className="px-4 py-2">primary + blue mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">variable</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-variable</code>
                  </td>
                  <td className="px-4 py-2">Variables, parameters</td>
                  <td className="px-4 py-2">foreground</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">type</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-type</code>
                  </td>
                  <td className="px-4 py-2">Types, classes, interfaces</td>
                  <td className="px-4 py-2">primary + purple mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">property</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-property</code>
                  </td>
                  <td className="px-4 py-2">Object properties</td>
                  <td className="px-4 py-2">foreground + primary mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">operator</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-operator</code>
                  </td>
                  <td className="px-4 py-2">Operators, punctuation</td>
                  <td className="px-4 py-2">foreground + primary mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">punctuation</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-punctuation</code>
                  </td>
                  <td className="px-4 py-2">Brackets, commas, semicolons</td>
                  <td className="px-4 py-2">foreground @ 70%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">tag</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-tag</code>
                  </td>
                  <td className="px-4 py-2">HTML/JSX/Vue/Astro tag names</td>
                  <td className="px-4 py-2">primary + pink mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">attribute</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-attribute</code>
                  </td>
                  <td className="px-4 py-2">Attribute names in markup</td>
                  <td className="px-4 py-2">foreground + primary mix</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">lineNumber</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-line-number</code>
                  </td>
                  <td className="px-4 py-2">Line number gutter color</td>
                  <td className="px-4 py-2">muted-foreground</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">selection</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-selection</code>
                  </td>
                  <td className="px-4 py-2">Text selection background</td>
                  <td className="px-4 py-2">primary @ 30%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">highlight</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-highlight</code>
                  </td>
                  <td className="px-4 py-2">Highlighted line background</td>
                  <td className="px-4 py-2">white @ 8%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">
                    <code className="mono">gutter</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-gutter</code>
                  </td>
                  <td className="px-4 py-2">Line number gutter background</td>
                  <td className="px-4 py-2">code background</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <code className="mono">border</code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="mono">--theme-code-border</code>
                  </td>
                  <td className="px-4 py-2">Code block border color</td>
                  <td className="px-4 py-2">border</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="enable" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Map theme code tokens to your syntax highlighter's CSS variables."
          >
            Enable code tokens in your app
          </SectionHeading>
          <p className="mb-4 text-sm opacity-70">
            The docs app uses Shiki with a custom theme that reads{" "}
            <code className="mono">--theme-code-*</code>
            variables. Here's the pattern to connect any highlighter:
          </p>
          <CodeBlock
            html={highlightCode(
              enableCodeTokensSnippet.code,
              enableCodeTokensSnippet.lang,
            )}
            code={enableCodeTokensSnippet.code}
            language={enableCodeTokensSnippet.lang}
            className="rounded-lg m-0"
          />
        </section>

        <section id="best-practices" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Practical tips for working with code tokens."
          >
            Best practices
          </SectionHeading>

          <div className="space-y-4">
            <h4 className="font-semibold mb-2">
              Define both light and dark variants
            </h4>
            <p className="text-sm opacity-70">
              Code tokens should adapt to the theme mode. A dark theme needs a
              dark code background (<code className="mono">#161b22</code>),
              while a light theme needs a light one (
              <code className="mono">#f6f8fa</code>). Use{" "}
              <code className="mono">extendTheme</code>
              to share the base and override just the code group:
            </p>
            <CodeBlock
              html={highlightCode(
                `const base = defineTheme({
  name: "base",
  tokens: {
    code: {
      comment: "#6a737d",
      keyword: "#d73a49",
      string: "#032f62",
      // ...shared tokens
    },
  },
});

const light = extendTheme("brand-light", base, {
  meta: { mode: "light" },
  tokens: {
    code: {
      background: "#f6f8fa",
      foreground: "#24292e",
      selection: "rgba(0, 0, 0, 0.1)",
    },
  },
});

const dark = extendTheme("brand-dark", base, {
  meta: { mode: "dark" },
  tokens: {
    code: {
      background: "#161b22",
      foreground: "#e6edf3",
      selection: "rgba(88, 166, 255, 0.3)",
    },
  },
});`,
                "typescript",
              )}
              code={`const base = defineTheme({
  name: "base",
  tokens: {
    code: {
      comment: "#6a737d",
      keyword: "#d73a49",
      string: "#032f62",
      // ...shared tokens
    },
  },
});

const light = extendTheme("brand-light", base, {
  meta: { mode: "light" },
  tokens: {
    code: {
      background: "#f6f8fa",
      foreground: "#24292e",
      selection: "rgba(0, 0, 0, 0.1)",
    },
  },
});

const dark = extendTheme("brand-dark", base, {
  meta: { mode: "dark" },
  tokens: {
    code: {
      background: "#161b22",
      foreground: "#e6edf3",
      selection: "rgba(88, 166, 255, 0.3)",
    },
  },
});`}
              language="typescript"
              className="rounded m-0 mt-3 text-[11px]"
            />

            <h4 className="font-semibold mb-2">
              Use semantic fallbacks in CSS
            </h4>
            <p className="text-sm opacity-70">
              Always provide fallbacks using semantic color tokens so code
              blocks stay readable even if a theme doesn't define code tokens:
            </p>
            <CodeBlock
              html={highlightCode(
                `.code-block {
  --tk-code-bg: var(--theme-code-background, var(--theme-color-muted));
  --tk-syntax-plain: var(--theme-code-foreground, var(--theme-color-foreground));
  --tk-syntax-comment: var(--theme-code-comment, color-mix(in srgb, var(--theme-color-foreground) 55%, transparent));
  --tk-syntax-keyword: var(--theme-code-keyword, var(--theme-color-primary));
  /* ... */
}`,
                "css",
              )}
              code={`.code-block {
  --tk-code-bg: var(--theme-code-background, var(--theme-color-muted));
  --tk-syntax-plain: var(--theme-code-foreground, var(--theme-color-foreground));
  --tk-syntax-comment: var(--theme-code-comment, color-mix(in srgb, var(--theme-color-foreground) 55%, transparent));
  --tk-syntax-keyword: var(--theme-code-keyword, var(--theme-color-primary));
  /* ... */
}`}
              language="css"
              className="rounded m-0 mt-3 text-[11px]"
            />

            <h4 className="font-semibold mb-2">Generate from a seed color</h4>
            <p className="text-sm opacity-70">
              Use <code className="mono">generateTheme</code> to create a
              complete theme pair (including harmonized code tokens) from a
              single brand color:
            </p>
            <CodeBlock
              html={highlightCode(
                `import { generateTheme } from "@theme-kit/core";

const { light, dark } = generateTheme({
  seed: "#6366f1",      // Your brand color
  family: "brand",      // Family name
  // Code tokens are auto-generated with WCAG-compliant contrast
});`,
                "typescript",
              )}
              code={`import { generateTheme } from "@theme-kit/core";

const { light, dark } = generateTheme({
  seed: "#6366f1",      // Your brand color
  family: "brand",      // Family name
  // Code tokens are auto-generated with WCAG-compliant contrast
});`}
              language="typescript"
              className="rounded m-0 mt-3 text-[11px]"
            />
          </div>
        </section>

        <section id="next" className="scroll-mt-24">
          <SectionHeading
            num={5}
            desc="Tokens are the input — here's what consumes them."
          >
            Go deeper
          </SectionHeading>
          <div className="flex flex-col gap-2">
            <Link
              href="/tokens"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">
                  Semantic Tokens & Typography
                </div>
                <div className="text-xs opacity-60">
                  Colors, spacing, radius, shadows, typography — the full token
                  system.
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
            <Link
              href="/framework-guides"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Framework Guides</div>
                <div className="text-xs opacity-60">
                  Full integration guides for React, Next, Vue, Svelte, Solid,
                  Angular, Web, Astro.
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
