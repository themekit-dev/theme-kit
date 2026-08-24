import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { collectPageHeadings } from "../../lib/toc-tree";

export const metadata: Metadata = {
  title: "Token Resolution",
  description:
    "How Theme Kit resolves token references, evaluates expressions, derives contrast-safe foreground colors, and the full resolution pipeline from base to final output.",
};

const tokenRefCode = `import { defineTheme } from "@theme-kit/core";

const theme = defineTheme({
  name: "brand",
  tokens: {
    colors: {
      primary: "#3b82f6",
      // Reference another token with $ prefix
      primaryHover: "$colors.primary",
      // Or use the brace syntax
      primaryMuted: "{colors.primary}",
    },
    spacing: {
      sm: "8px",
      md: "16px",
      lg: "$spacing.sm + $spacing.md", // 24px
    },
  },
});`;

const expressionsCode = `import { evaluateExpression, isExpression } from "@theme-kit/core";

// Numeric expressions with +, -, *, / and parentheses
isExpression("16 + 8");        // true
isExpression("2 * (12 + 4)");  // true
isExpression("#3b82f6");       // false

// Evaluate resolves the expression, preserving units
evaluateExpression("8 + 16");         // "24"
evaluateExpression("4 * 4px");        // "16px"
evaluateExpression("(100 - 20)%");    // "80%"
evaluateExpression("2 * (12 + 4)px"); // "32px"

// Used inside token definitions
const theme = defineTheme({
  name: "computed",
  tokens: {
    spacing: {
      base: "4px",
      double: "2 * $spacing.base", // 8px
      triple: "3 * $spacing.base", // 12px
    },
  },
});`;

const derivedCode = `import { defineTheme, contrast, auto } from "@theme-kit/core";

const theme = defineTheme({
  name: "auto-contrast",
  tokens: {
    colors: {
      primary: "#3b82f6",
      // auto() infers the path from the token name
      // "primaryForeground" → looks up "primary" → returns black or white
      primaryForeground: "auto()",

      surface: "#f8fafc",
      surfaceForeground: "auto()",

      danger: "#ef4444",
      dangerForeground: "auto()",
    },
  },
});

// Or use contrast() with an explicit color
const manual = defineTheme({
  name: "manual-contrast",
  tokens: {
    colors: {
      primary: "#3b82f6",
      primaryForeground: "contrast(#3b82f6)", // → "#000000"
    },
  },
});

// Direct utility usage
contrast("#3b82f6"); // "#000000" (luminance > 0.179)
contrast("#000000"); // "#ffffff" (luminance <= 0.179)`;

const resolutionOrderCode = `import { resolveTokens } from "@theme-kit/core";

// Given a theme that uses all three mechanisms:
const theme = {
  colors: {
    // 1. Literal value
    primary: "#3b82f6",

    // 2. Reference — resolved after base/extends
    hover: "$colors.primary",

    // 3. Expression — evaluated after references resolve
    lightened: "#3b82f6 + #111111",

    // 4. Derived — computed last
    primaryForeground: "auto()",
  },
};

const resolved = resolveTokens(theme);
// resolved.colors.primary         → "#3b82f6"
// resolved.colors.hover           → "#3b82f6"
// resolved.colors.lightened       → "#4c9307" (numeric hex add)
// resolved.colors.primaryForeground → "#000000"`;

const apiResolveCode = `import { resolveTokens } from "@theme-kit/core";

const tokens = {
  colors: {
    primary: "#3b82f6",
    hover: "$colors.primary",
    foreground: "auto()",
  },
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "$spacing.sm + $spacing.md",
  },
};

const resolved = resolveTokens(tokens);
// All references, expressions, and derived values resolved
// resolved.colors.hover        → "#3b82f6"
// resolved.colors.foreground   → "#000000"
// resolved.spacing.lg          → "24"`;

const apiFlattenCode = `import { flattenTokens } from "@theme-kit/core";

const tokens = {
  colors: {
    primary: { default: "#3b82f6", hover: "#2563eb" },
    surface: "#f8fafc",
  },
  spacing: { sm: "8px" },
};

const flat = flattenTokens(tokens);
// {
//   "colors.primary.default": "#3b82f6",
//   "colors.primary.hover":    "#2563eb",
//   "colors.surface":          "#f8fafc",
//   "spacing.sm":              "8px",
// }`;

const apiHasRefsCode = `import { hasTokenReferences } from "@theme-kit/core";

hasTokenReferences("$colors.primary");   // true
hasTokenReferences("{spacing.sm}");      // true
hasTokenReferences("8px + 4px");         // false
hasTokenReferences("#3b82f6");           // false`;

const apiEvaluateCode = `import { evaluateExpression } from "@theme-kit/core";

evaluateExpression("8 + 16");          // "24"
evaluateExpression("2 * (12 + 4)px"); // "32px"
evaluateExpression("(100 - 20)%");    // "80%"
evaluateExpression("#3b82f6");        // "#3b82f6" (not an expression)`;

export default function TokenResolutionPage() {
  const content = (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Resolution"
          title="Token resolution"
          description={
            <>
              Theme Kit tokens are more than static key-value pairs. A reference
              like <code className="mono text-[0.9em]">$colors.primary</code> is
              resolved at build time, expressions like{" "}
              <code className="mono text-[0.9em]">2 * 16px</code> are evaluated,
              and derived tokens like{" "}
              <code className="mono text-[0.9em]">auto()</code> produce
              contrast-safe foreground colors automatically.
            </>
          }
        />

        <section id="references" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Reference tokens let one token alias another, keeping your palette DRY and your overrides shallow."
          >
            Token references
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Use <code className="mono text-[0.9em]">$</code> prefix or{" "}
            <code className="mono text-[0.9em]">{`{braces}`}</code> syntax to
            reference another token by its flattened path. References are resolved
            after the base theme and extends are merged, so you can override a
            single source and every reference follows.
          </p>
          <CodeBlock
            html={highlightCode(tokenRefCode, "ts")}
            code={tokenRefCode}
            language="ts"
            filename="core — token references"
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Circular references throw</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            If token A references token B which references token A, the resolver
            detects the cycle and throws an error with the full reference chain.
          </Callout>
        </section>

        <section id="expressions" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Numeric expressions let you compute spacing, sizes, and other values inline without a separate build step."
          >
            Expressions
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Token values containing only numbers, operators, and units are
            recognized as expressions. The expression evaluator supports{" "}
            <code className="mono text-[0.9em]">+</code>,{" "}
            <code className="mono text-[0.9em]">-</code>,{" "}
            <code className="mono text-[0.9em]">*</code>,{" "}
            <code className="mono text-[0.9em]">/</code>, and parentheses. Units
            are preserved through evaluation.
          </p>
          <CodeBlock
            html={highlightCode(expressionsCode, "ts")}
            code={expressionsCode}
            language="ts"
            filename="core — expressions"
            className="m-0"
          />
        </section>

        <section id="derived" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Derived tokens compute values like contrast-safe foreground colors from a background, no manual pairing needed."
          >
            Derived colors
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The <code className="mono text-[0.9em]">auto()</code> function
            infers which background token to use based on the token&apos;s own
            name — a token named{" "}
            <code className="mono text-[0.9em]">primaryForeground</code> looks up{" "}
            <code className="mono text-[0.9em]">primary</code> and returns black
            or white for WCAG-safe contrast. You can also call{" "}
            <code className="mono text-[0.9em]">contrast()</code> explicitly with
            a hex value.
          </p>
          <CodeBlock
            html={highlightCode(derivedCode, "ts")}
            code={derivedCode}
            language="ts"
            filename="core — derived colors"
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Naming convention</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            <code className="mono text-[0.9em]">auto()</code> recognizes the{" "}
            <code className="mono text-[0.9em]">*Foreground</code> and{" "}
            <code className="mono text-[0.9em]">*Fg</code> suffixes. Any token
            with one of these suffixes will automatically resolve against its
            base color.
          </Callout>
        </section>

        <section id="resolution-order" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="The resolver runs a strict pipeline so every token category is fully resolved before the next."
          >
            Resolution order
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            When <code className="mono text-[0.9em]">resolveTokens()</code> is
            called, it processes the token tree in this order:
          </p>
          <div className="rounded-xl border border-border overflow-hidden mb-3">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Pipeline
            </div>
            <ol className="p-4 flex flex-col gap-2 text-sm list-none">
              {[
                {
                  step: "Base tokens",
                  desc: "Literal values from the theme definition are collected into a flat lookup map.",
                },
                {
                  step: "Extends merge",
                  desc: "The parent theme's tokens are merged underneath — child values override parent values.",
                },
                {
                  step: "Overrides",
                  desc: "Family-scoped or runtime overrides are applied last in the merge.",
                },
                {
                  step: "References",
                  desc: "$ref and {ref} tokens are resolved by walking the flat map, with cycle detection.",
                },
                {
                  step: "Expressions",
                  desc: "Numeric expressions (16 + 8, 2 * 4px) are evaluated and replaced with computed values.",
                },
                {
                  step: "Derived tokens",
                  desc: "auto() and contrast() calls compute final values using already-resolved backgrounds.",
                },
              ].map((item, i) => (
                <li key={item.step} className="flex gap-3 items-start text-sm opacity-75">
                  <span
                    className="w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold mt-0.5"
                    style={
                      i === 5
                        ? {
                            background: "var(--theme-color-primary)",
                            color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                          }
                        : undefined
                    }
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold">{item.step}</span>
                    <span className="opacity-70 ml-1.5">— {item.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <CodeBlock
            html={highlightCode(resolutionOrderCode, "ts")}
            code={resolutionOrderCode}
            language="ts"
            filename="core — resolution order"
            className="m-0"
          />
        </section>

        <section id="api" className="scroll-mt-24">
          <SectionHeading
            num={5}
            desc="The resolve module exports focused utilities you can use individually or compose into your own pipeline."
          >
            API Reference
          </SectionHeading>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-1">
                <code className="mono">resolveTokens(tokens)</code>
              </h3>
              <p className="text-xs opacity-60 leading-relaxed mb-2">
                Takes a <code className="mono text-[0.9em]">ThemeTokens</code>{" "}
                object and returns a new object with all references, expressions,
                and derived tokens fully resolved.
              </p>
              <CodeBlock
                html={highlightCode(apiResolveCode, "ts")}
                code={apiResolveCode}
                language="ts"
                filename="resolveTokens()"
                className="m-0"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">
                <code className="mono">flattenTokens(tokens)</code>
              </h3>
              <p className="text-xs opacity-60 leading-relaxed mb-2">
                Flattens a nested{" "}
                <code className="mono text-[0.9em]">ThemeTokens</code> object
                into a dot-separated flat map. Useful for building lookup
                tables or custom resolution logic.
              </p>
              <CodeBlock
                html={highlightCode(apiFlattenCode, "ts")}
                code={apiFlattenCode}
                language="ts"
                filename="flattenTokens()"
                className="m-0"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">
                <code className="mono">hasTokenReferences(value)</code>
              </h3>
              <p className="text-xs opacity-60 leading-relaxed mb-2">
                Returns <code className="mono text-[0.9em]">true</code> if the
                string contains a <code className="mono text-[0.9em]">$</code> or{" "}
                <code className="mono text-[0.9em]">{`{}`}</code> token reference.
              </p>
              <CodeBlock
                html={highlightCode(apiHasRefsCode, "ts")}
                code={apiHasRefsCode}
                language="ts"
                filename="hasTokenReferences()"
                className="m-0"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">
                <code className="mono">evaluateExpression(expr)</code>
              </h3>
              <p className="text-xs opacity-60 leading-relaxed mb-2">
                Evaluates a numeric expression string and returns the result.
                If the input is not a valid expression, it is returned unchanged.
              </p>
              <CodeBlock
                html={highlightCode(apiEvaluateCode, "ts")}
                code={apiEvaluateCode}
                language="ts"
                filename="evaluateExpression()"
                className="m-0"
              />
            </div>
          </div>
        </section>
      </div>
  );
  // Collect headings from the page's own tree (before RSC serialization hides
  // subtrees that share a parent with client components from the layout walk).
  const tokenResolutionHeadings = collectPageHeadings(content);
  return <DocsLayout headings={tokenResolutionHeadings}>{content}</DocsLayout>;
}
