import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { AccessibilityLab } from "../../components/accessibility/accessibility-lab";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How Theme Kit handles accessibility: contrast and CVD simulation, focus rings, prefers-reduced-motion, color-scheme, keyboard navigation and scrollbar behavior.",
};

const reducedMotionSnippet = {
  lang: "ts",
  title: "core — reduced-motion in the transition engine",
  code: `import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  transition: {
    enabled: true,
    duration: 360,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    // The engine checks prefers-reduced-motion and collapses the
    // transition plan to an instant apply for affected users.
    preset: "smooth",
  },
});`,
};

const suppressSnippet = {
  lang: "ts",
  title: "runtime — one-off suppression",
  code: `// For a single switch that must be instantaneous
// (e.g. a user action on a big surface), suppress the
// configured animation for that update only.
runtime.store.set(runtime.registry.get("plum-dark")!, {
  suppressTransition: true,
});`,
};

export default function AccessibilityPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Accessibility"
          title="Theming that respects people"
          description={
            <>
              Theme Kit treats accessibility as a first-class runtime concern:
              WCAG contrast and CVD simulation, theme-aware focus rings,
              <code className="mono text-[0.9em]"> prefers-reduced-motion</code>,
              <code className="mono text-[0.9em]"> color-scheme</code> sync, and
              a scrollbar that stays theme-aware without breaking keyboard
              navigation.
            </>
          }
        />

        <section id="lab" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Contrast ratios and color-vision-deficiency simulations computed from the active theme by @theme-kit/core — toggle the family above to see it re-run live."
          >
            Live lab
          </SectionHeading>
          <AccessibilityLab />
        </section>

        <section id="reduced-motion" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="The transition engine reads the OS preference and collapses animated theme changes to instant applies."
          >
            prefers-reduced-motion
          </SectionHeading>
          <div className="rounded-xl border border-border overflow-hidden mb-3">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              The flow
            </div>
            <div className="p-4 flex flex-col gap-2 text-sm">
              {[
                "prefers-reduced-motion: reduce",
                "transition engine checks the media query on every plan",
                "plan collapses to suppressTransition → instant apply",
                "no fade, no cross-fade, no View-Transition orchestration",
              ].map((step, i) => (
                <div key={step} className="flex gap-2 items-center text-sm opacity-75">
                  <span
                    className={`w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold ${
                      i === 2
                        ? ""
                        : "bg-muted text-foreground/50"
                    }`}
                    style={
                      i === 2
                        ? {
                            background: "var(--theme-color-primary)",
                            color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                          }
                        : undefined
                    }
                  >
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
          <CodeBlock
            html={highlightCode(reducedMotionSnippet.code, "ts")}
            code={reducedMotionSnippet.code}
            language="ts"
            filename={reducedMotionSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Scoped themes inherit this</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            A <code className="mono text-[0.9em]">ThemeScope</code> transition
            goes through the same engine, so reduced-motion users get an
            instant scoped swap too.
          </Callout>
        </section>

        <section id="focus" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="The focus ring is a semantic token, so every theme ships a visible, accessible focus indicator."
          >
            Focus rings &amp; keyboard navigation
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <div className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold mb-2">ring token</div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  tabIndex={-1}
                >
                  Tab to me
                </button>
                <div
                  className="w-6 h-6 rounded-md"
                  style={{
                    background: "var(--theme-color-ring)",
                    boxShadow: "0 0 0 3px color-mix(in srgb, var(--theme-color-ring) 35%, transparent)",
                  }}
                />
              </div>
              <p className="mt-3 text-xs opacity-60 leading-relaxed">
                Focus styles reference{" "}
                <code className="mono text-[0.9em]">--theme-color-ring</code>{" "}
                — when a theme changes, the focus indicator re-styles with it.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold mb-2">keyboard</div>
              <p className="text-xs opacity-60 leading-relaxed">
                Theme pickers, toggles and scopes are plain interactive
                elements: tab to focus, Enter/Space to activate. Nothing in
                Theme Kit intercepts or reorders keyboard navigation.
              </p>
            </div>
          </div>
        </section>

        <section id="color-scheme" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="The effective mode is resolved against the OS and surfaced to the browser, not guessed."
          >
            color-scheme &amp; system preference
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              <code className="mono text-[0.9em]">system</code> mode resolves
              against{" "}
              <code className="mono text-[0.9em]">prefers-color-scheme</code>{" "}
              server-side and in the bootstrap — the first paint already
              matches the OS.
            </li>
            <li>
              <code className="mono text-[0.9em]">color-scheme</code> is set on{" "}
              <code className="mono text-[0.9em]">&lt;html&gt;</code> so native
              form controls and the default scrollbar match the theme.
            </li>
            <li>
              A <code className="mono text-[0.9em]">@media
              (prefers-color-scheme: dark)</code> fallback ships for{" "}
              <code className="mono text-[0.9em]">system</code> mode so even a
              pre-JS paint is correct.
            </li>
            <li>
              Contrast checking (<code className="mono text-[0.9em]">getContrastRatio</code>)
              and CVD simulation (
              <code className="mono text-[0.9em]">simulateCVD</code>) are core
              utilities you can run in CI on every theme.
            </li>
          </ul>
        </section>

        <section id="scrollbar" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="The optional overlay scrollbar stays theme-aware and never replaces native scroll behavior."
          >
            Scrollbar behavior
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              Keyboard and programmatic scrolling work exactly as with the
              native scrollbar — the overlay only draws.
            </li>
            <li>
              The overlay colors come from semantic tokens, so it updates with
              the theme and respects high-contrast profiles.
            </li>
            <li>
              When disabled, the native scrollbar is styled via{" "}
              <code className="mono text-[0.9em]">color-scheme</code> instead —
              still theme-aware, zero custom code.
            </li>
          </ul>
          <Link
            href="/custom-scrollbar"
            className="text-sm font-semibold no-underline"
            style={{ color: "var(--theme-color-primary)" }}
          >
            Custom Scrollbar guide →
          </Link>
        </section>

        <section id="suppress" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="Any theme switch can be instant for a given update, per action or per scope."
          >
            Transition suppression
          </SectionHeading>
          <CodeBlock
            html={highlightCode(suppressSnippet.code, "ts")}
            code={suppressSnippet.code}
            language="ts"
            filename={suppressSnippet.title}
            className="m-0"
          />
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/animation"
              className="rounded-xl border border-border bg-card p-4 no-underline flex items-center justify-between gap-3 card-lift"
            >
              <div>
                <div className="font-semibold">Animation &amp; Transition</div>
                <div className="text-xs opacity-60">
                  The diff → plan → run pipeline behind every theme change.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/tokens"
              className="rounded-xl border border-border bg-card p-4 no-underline flex items-center justify-between gap-3 card-lift"
            >
              <div>
                <div className="font-semibold">Tokens &amp; Typography</div>
                <div className="text-xs opacity-60">
                  Every semantic path, including the ring token.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/zero-flash"
              className="rounded-xl border border-border bg-card p-4 no-underline flex items-center justify-between gap-3 card-lift"
            >
              <div>
                <div className="font-semibold">Zero Flash</div>
                <div className="text-xs opacity-60">
                  How the first paint already matches the user.
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