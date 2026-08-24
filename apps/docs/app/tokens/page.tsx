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
  title: "Semantic Tokens & Typography",
  description:
    "Theme Kit's token system goes far beyond colors: typography, spacing, radius, shadows, border widths, z-index and breakpoints all ship as semantic, theme-aware tokens.",
};

const tokenSnippet = {
  lang: "ts",
  title: "theme tokens — defineTheme",
  code: `import { defineTheme } from "@theme-kit/core";

const brand = defineTheme({
  name: "brand-light",
  tokens: {
    colors: {
      primary: "#6d28d9",
      secondary: "#ede9fe",
      mutedForeground: "#6b7280",
    },
    typography: {
      fontFamilies: { sans: "Inter, system-ui, sans-serif" },
      fontSizes: { base: "1rem", "4xl": "2.25rem" },
      lineHeights: { normal: "1.5" },
    },
    spacing: { "1": "4px", "4": "16px", "8": "32px" },
    radius: { md: "8px", xl: "16px", full: "9999px" },
    shadows: { md: "0 4px 6px rgba(0,0,0,0.07)" },
    borderWidths: { "1": "1px", "2": "2px" },
    zIndex: { dropdown: "1000", modal: "1100" },
    breakpoints: { md: "768px" },
  },
});

// themeToCSSVariables(brand) emits --theme-color-primary,
// --theme-typography-font-size-4xl, --theme-spacing-4,
// --theme-radius-full, --theme-border-width-2 and more.`,
};

const resolveSnippet = {
  lang: "ts",
  title: "reading tokens back",
  code: `import {
  themeToCSSVariables,
  flattenTokens,
  resolveTokens,
} from "@theme-kit/core";

const vars = themeToCSSVariables(brand);
// { "--theme-color-primary": "#6d28d9", "--theme-spacing-4": "16px", ... }

const flat = flattenTokens(brand.tokens);
// { "colors.primary": "#6d28d9", "spacing.4": "16px", ... }

// resolveTokens follows {colors.primary} references so dependent
// tokens always point at a concrete value, never another alias.
const resolved = resolveTokens(brand.tokens);`,
};

const referenceSnippet = {
  lang: "ts",
  title: "token references — $ and { } syntax",
  code: `import { defineTheme, resolveTokens } from "@theme-kit/core";

const brand = defineTheme({
  name: "brand",
  tokens: {
    colors: {
      primary: "#6d28d9",
      // Reference using $ prefix
      primaryHover: "$colors.primary",
      // Or using { } braces
      ring: "{colors.primary}",
      // Nested references work too
      surface: {
        primary: "$colors.primary",
        hover: "{colors.primaryHover}",
      },
    },
    spacing: {
      "4": "16px",
      // Expressions with calc()
      "8": "calc($spacing.4 * 2)",
    },
  },
});

// Resolve all references to concrete values
const resolved = resolveTokens(brand.tokens);
// resolved.colors.primaryHover === "#6d28d9"
// resolved.spacing["8"] === "32px"`,
};

const derivedColorsSnippet = {
  lang: "ts",
  title: "derived colors — contrast() and auto()",
  code: `import { defineTheme, resolveTokens } from "@theme-kit/core";

const brand = defineTheme({
  name: "brand",
  tokens: {
    colors: {
      primary: "#6d28d9",
      // Returns black or white based on WCAG luminance
      primaryForeground: "contrast(#6d28d9)",
      // Auto-derives readable foreground from base token
      secondary: "#ede9fe",
      secondaryForeground: "auto()",
      // Works with references too
      accent: "$colors.primary",
      accentForeground: "auto($colors.primary)",
    },
  },
});

const resolved = resolveTokens(brand.tokens);
// resolved.colors.primaryForeground === "#ffffff" (white on purple)
// resolved.colors.secondaryForeground === "#1e1b4b" (dark on light purple)`,
};

const themeExtensionSnippet = {
  lang: "ts",
  title: "extending themes — compose & merge",
  code: `import {
  defineTheme,
  extendTheme,
  composeTheme,
  mergeTokens,
} from "@theme-kit/core";

// Base theme with common tokens
const base = defineTheme({
  name: "base",
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      primary: "#6366f1",
    },
    radius: { md: "8px", lg: "12px" },
    spacing: { "4": "16px", "8": "32px" },
  },
});

// Extend: create a variant with overrides
const brandLight = extendTheme("brand-light", base, {
  meta: { family: "brand", mode: "light" },
  tokens: {
    colors: {
      primary: "#6d28d9",
      accent: "#f5f3ff",
    },
    radius: { lg: "16px" },
  },
});

// Compose: merge multiple themes into one
const combined = composeTheme("combined", base, brandLight, {
  tokens: { shadows: { md: "0 4px 6px rgba(0,0,0,0.1)" } },
});

// Low-level: merge token maps directly
const customTokens = mergeTokens(brandLight.tokens, {
  colors: { destructive: "#ef4444", success: "#16a34a" },
  code: { background: "#f8f8f8" },
});`,
};

const apiSnippets = {
  flatten: {
    lang: "ts",
    title: "flattenTokens(tokens) → Record<string, string>",
    code: `import { flattenTokens } from "@theme-kit/core";

const tokens = {
  colors: { primary: "#6366f1", surface: { hover: "#ede9fe" } },
  spacing: { "4": "16px" },
};

const flat = flattenTokens(tokens);
// {
//   "colors.primary": "#6366f1",
//   "colors.surface.hover": "#ede9fe",
//   "spacing.4": "16px",
// }`,
  },
  resolve: {
    lang: "ts",
    title: "resolveTokens(tokens) → ThemeTokens",
    code: `import { resolveTokens } from "@theme-kit/core";

const tokens = {
  colors: {
    primary: "#6366f1",
    ring: "$colors.primary",
    surface: { primary: "{colors.primary}" },
  },
};

const resolved = resolveTokens(tokens);
// {
//   colors: {
//     primary: "#6366f1",
//     ring: "#6366f1",
//     surface: { primary: "#6366f1" },
//   },
// }`,
  },
  themeToCSS: {
    lang: "ts",
    title: "themeToCSSVariables(theme) → Record<string, string>",
    code: `import { themeToCSSVariables } from "@theme-kit/core";

const vars = themeToCSSVariables(brand);
// {
//   "--theme-color-primary": "#6d28d9",
//   "--theme-color-secondary": "#ede9fe",
//   "--theme-typography-font-family-sans": "Inter, system-ui, sans-serif",
//   "--theme-spacing-4": "16px",
//   "--theme-radius-lg": "12px",
//   "--theme-code-background": "#161b22",
//   "--theme-code-keyword": "#ff7b72",
//   ...
// }

// Use with groups option for subset
const colorVars = themeToCSSVariables(brand, { groups: ["colors"] });
const codeVars = themeToCSSVariables(brand, { groups: ["code"] });`,
  },
  validate: {
    lang: "ts",
    title: "validateTheme(theme, options?) → { valid, issues }",
    code: `import { validateTheme, getBuiltInThemes } from "@theme-kit/core";

const customTheme = defineTheme({
  name: "custom",
  tokens: { colors: { primary: "#6366f1" } }, // Missing required colors
});

const result = validateTheme(customTheme, { themes: getBuiltInThemes() });
// {
//   valid: false,
//   issues: [
//     { type: "missing", path: "colors.background", message: "Required color token missing" },
//     { type: "missing", path: "colors.foreground", message: "Required color token missing" },
//     ...
//   ]
// }`,
  },
  generate: {
    lang: "ts",
    title: "generateTheme(options) → { light, dark }",
    code: `import { generateTheme } from "@theme-kit/core";

// Generate complete light/dark pair from one seed color
const { light, dark } = generateTheme({
  seed: "#6366f1",           // Base brand color
  family: "indigo",          // Family name
  // Auto-generates: primary, secondary, muted, accent, border, ring
  // Plus full typography, spacing, radius, shadows scales
  // And harmonized code tokens for syntax highlighting
});

console.log(light.name);  // "indigo-light"
console.log(dark.name);   // "indigo-dark"
console.log(light.tokens.code); // Full code token set`,
  },
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const tokensHeadings = buildPageHeadings([
  { text: "Define every group in one theme", level: 2 },
  { text: "Token references & derived values", level: 2 },
  { text: "Token helpers — complete examples", level: 2 },
  { text: "Code Tokens", level: 2 },
  { text: "Go deeper", level: 2 },
]);

export default function TokensPage() {
  return (
    <DocsLayout headings={tokensHeadings}>
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
              <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
            </svg>
          }
          title="Semantic Tokens &amp; Typography"
          subtitle="@theme-kit/core — the token system"
          description={
            <>
              Theme Kit isn&apos;t another dark-mode library. Every theme is a
              complete design system — colors, typography, spacing, radius,
              shadows, border widths, z-index and breakpoints — flattened into
              semantic CSS variables that swap in one atomic update.
            </>
          }
        />

        <section id="define" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="All token groups live under the same tokens map and resolve together."
          >
            Define every group in one theme
          </SectionHeading>
          <CodeBlock
            html={highlightCode(tokenSnippet.code, tokenSnippet.lang)}
            code={tokenSnippet.code}
            language={tokenSnippet.lang}
            className="rounded-lg m-0"
          />
          <p className="mt-3 text-sm opacity-70 leading-relaxed">
            Adapters and build-time integrations consume the same resolved
            tokens —{" "}
            <code className="mono text-[0.9em]">@theme-kit/tailwind</code>{" "}
            maps them to{" "}
            <code className="mono text-[0.9em]">--color-*</code>,{" "}
            <code className="mono text-[0.9em]">--radius-*</code>,{" "}
            <code className="mono text-[0.9em]">--spacing-*</code>,{" "}
            <code className="mono text-[0.9em]">--font-*</code> and{" "}
            <code className="mono text-[0.9em]">--shadow-*</code> utilities.
          </p>
          <p className="mt-3 text-sm opacity-70 leading-relaxed">
            Every theme validates against the full{" "}
            <strong className="opacity-100">semantic color set</strong> — the
            base surfaces ({" "}
            <code className="mono text-[0.9em]">background</code>,{" "}
            <code className="mono text-[0.9em]">foreground</code>,{" "}
            <code className="mono text-[0.9em]">card</code>,{" "}
            <code className="mono text-[0.9em]">popover</code>), interaction
            colors ({" "}
            <code className="mono text-[0.9em]">primary</code>,{" "}
            <code className="mono text-[0.9em]">secondary</code>,{" "}
            <code className="mono text-[0.9em]">accent</code>,{" "}
            <code className="mono text-[0.9em]">muted</code>), and the status
            colors ({" "}
            <code className="mono text-[0.9em]">destructive</code>,{" "}
            <code className="mono text-[0.9em]">success</code>) — each with its
            own <code className="mono text-[0.9em]">*Foreground</code>{" "}
            counterpart, plus <code className="mono text-[0.9em]">border</code>,{" "}
            <code className="mono text-[0.9em]">input</code> and{" "}
            <code className="mono text-[0.9em]">ring</code>. Missing any of
            them fails{" "}
            <code className="mono text-[0.9em]">validateTheme</code>.
          </p>
        </section>

        <section id="references" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Tokens support references, expressions, and derived colors — all resolved at runtime."
          >
            Token references & derived values
          </SectionHeading>

          <CodeBlock
            html={highlightCode(referenceSnippet.code, referenceSnippet.lang)}
            code={referenceSnippet.code}
            language={referenceSnippet.lang}
            className="rounded-lg m-0 mb-5"
          />

          <CodeBlock
            html={highlightCode(derivedColorsSnippet.code, derivedColorsSnippet.lang)}
            code={derivedColorsSnippet.code}
            language={derivedColorsSnippet.lang}
            className="rounded-lg m-0 mb-5"
          />

          <CodeBlock
            html={highlightCode(themeExtensionSnippet.code, themeExtensionSnippet.lang)}
            code={themeExtensionSnippet.code}
            language={themeExtensionSnippet.lang}
            className="rounded-lg m-0 mb-5"
          />
        </section>

        <section id="api" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="The token API in @theme-kit/core — complete examples with output."
          >
            Token helpers — complete examples
          </SectionHeading>

          <div className="space-y-4">
            {Object.entries(apiSnippets).map(([key, snippet]) => (
              <CodeBlock
                key={key}
                html={highlightCode(snippet.code, snippet.lang)}
                code={snippet.code}
                language={snippet.lang}
                className="m-0"
              />
            ))}
          </div>

          <div className="mt-4">
            <Callout>
              Full signatures and parameter tables for every token function
              live in the{" "}
              <Link
                href="/api-reference/core"
                className="underline underline-offset-2"
              >
                @theme-kit/core API reference
              </Link>
              .
            </Callout>
          </div>
        </section>

        <section id="code-tokens" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Dedicated tokens for syntax highlighting — background, keywords, strings, functions, types, and more."
          >
            Code Tokens
          </SectionHeading>
          <p className="mb-4 text-sm opacity-70">
            Theme Kit includes a dedicated <code className="mono">code</code> token group with 22 semantic tokens
            for syntax highlighting. Every token maps to a <code className="mono">--theme-code-*</code> CSS
            variable that any highlighter (Shiki, Prism, etc.) can consume — so code blocks re-theme
            automatically when users switch themes, families, or modes.
          </p>
          <Link
            href="/tokens/code"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Code Tokens Reference & Guide</div>
              <div className="text-xs opacity-60">
                Complete token reference, wiring guide, and best practices.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
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
              href="/adapters"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Adapters Guide</div>
                <div className="text-xs opacity-60">
                  Bridge tokens to shadcn, MUI, Chakra, AntD, Bootstrap and
                  more.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/presets/default"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Presets</div>
                <div className="text-xs opacity-60">
                  Curated families and brand palettes — click to apply live.
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