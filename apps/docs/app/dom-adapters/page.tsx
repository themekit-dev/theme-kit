import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "DOM Adapters",
  description:
    "The bridge between Theme Kit's runtime and the DOM: CSS variables binding, DOM attribute binding, system theme detection, scoped themes, and the diff → plan → animate transition pipeline.",
};

const cssVariablesSnippet = {
  lang: "ts",
  title: "core — CSS variables binding",
  code: `import { createThemeRuntime } from "@theme-kit/core";
import { createCSSVariablesBinding } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
});

// Writes --theme-color-* custom properties to :root.
// Each theme token becomes a CSS variable automatically.
const cssVars = createCSSVariablesBinding(runtime.store, {
  prefix: "theme-",        // default prefix
  target: document.documentElement,
  styleSheet: false,       // inline <style> or element.style
  transition: {
    enabled: true,
    duration: 360,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    useViewTransition: true,
  },
});

// A theme switch now produces:
//   --theme-color-primary: #6366f1
//   --theme-color-background: #ffffff
//   --theme-color-foreground: #171717
//   …every token in the theme definition.`,
};

const domBindingSnippet = {
  lang: "ts",
  title: "core — DOM attribute binding",
  code: `import { createDOMBinding } from "@theme-kit/core";

const dom = createDOMBinding(runtime.store, {
  target: document.documentElement,
  attributeName: "data-theme", // default
});

// On every theme change the binding writes:
//   data-theme="plum-dark"
//   data-theme-family="plum"
//   data-theme-mode="dark"
//   class="dark"               ← toggled on/off
//   color-scheme: dark         ← via inline style`,
};

const systemBindingSnippet = {
  lang: "ts",
  title: "core — system theme binding",
  code: `import { createSystemThemeBinding } from "@theme-kit/core";

const system = createSystemThemeBinding(runtime.store, {
  lightTheme: themes.find(t => t.name === "light")!,
  darkTheme: themes.find(t => t.name === "dark")!,
  mediaQuery: "(prefers-color-scheme: dark)",
});

// The binding listens for OS preference changes.
// When the user switches system appearance:
//   - "prefers-color-scheme: dark" matches → store.set(darkTheme)
//   - "prefers-color-scheme: light" matches → store.set(lightTheme)
//
// Downstream bindings (CSS vars, DOM attrs) react automatically.`,
};

const scopedBindingSnippet = {
  lang: "ts",
  title: "core — scoped theme binding",
  code: `import { createScopedThemeBinding } from "@theme-kit/core";

const sidebar = document.getElementById("sidebar")!;

const scope = createScopedThemeBinding(
  themes,
  sidebar,
  "plum-dark",  // or { family: "plum", mode: "dark" }
  {
    prefix: "theme-",
    transition: { enabled: true, duration: 200 },
    localThemes: [customTokenPack],  // optional local overrides
  },
);

// The scope element receives:
//   data-theme="plum-dark"
//   data-mode="dark"
//   class="dark"
//   --theme-color-* inline variables
//   --color-* aliases (Tailwind-style)
//
// Child elements inherit scoped variables — the page theme is
// completely isolated from this subtree.

scope.update("plum-light");       // animate to a new selection
scope.setTransition({ duration: 0 }); // instant swap
scope.destroy();                   // clean up variables + attrs`,
};

const transitionPipelineSnippet = {
  lang: "ts",
  title: "core — diff → plan → animate pipeline",
  code: `import {
  createThemeDiff,
  createTransitionPlan,
  runThemeAnimation,
  cancelThemeAnimation,
} from "@theme-kit/core";

// 1. Diff: compare old vs new variable maps
const diff = createThemeDiff(appliedVariables, newVariables);

// 2. Plan: classify changed variables into animated groups
//    (colors, radii, shadows) and compute per-group timing.
const plan = createTransitionPlan(diff, {
  enabled: true,
  duration: 360,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
}, { reducedMotion: false });

// 3. Animate: apply the plan to the target element.
if (plan) {
  runThemeAnimation({
    target: document.documentElement,
    plan,
    swap: () => {
      // Apply new CSS variables
      applyInlineVariables(element, newVariables);
    },
  });
}

// The CSS-variables binding owns this entire pipeline.
// You don't call these directly — they run inside
// createCSSVariablesBinding's store subscriber.`,
};

const disableSnippet = {
  lang: "ts",
  title: "core — disabling adapters",
  code: `// Disable DOM attribute binding entirely
const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  dom: false,  // no data-theme, no data-theme-family, no .dark class
});

// Disable CSS variable output
const cssVars = createCSSVariablesBinding(runtime.store, {
  styleSheet: true,
  layerName: "theme-kit",
});
// To skip CSS variables entirely, don't call this binding.

// Disable transitions on a specific binding
const dom = createDOMBinding(runtime.store, {
  transition: { enabled: false },  // instant attribute swap
});

// Combine: attributes + variables, no transition
const dom = createDOMBinding(runtime.store, {
  subscribe: false, // driven by CSS-variables binding's pipeline
});
const cssVars = createCSSVariablesBinding(runtime.store, {
  transition: { enabled: false },
});`,
};

export default function DOMAdaptersPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="DOM Adapters"
          title="Bridging runtime and browser"
          description={
            <>
              DOM adapters are the bridge between Theme Kit's runtime store and
              the live document. They translate theme definitions into CSS
              variables, HTML attributes, and media-query listeners — keeping
              the core logic framework-agnostic while the adapters handle the
              browser.
            </>
          }
        />

        <section id="overview" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Adapters subscribe to the theme store and apply changes to the DOM. Each adapter owns one concern — CSS variables, attributes, system preference — so they can be composed independently."
          >
            What are DOM Adapters?
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              Every adapter receives a <code className="mono text-[0.9em]">ThemeStore</code> and
              calls <code className="mono text-[0.9em]">store.subscribe()</code> to
              react to theme changes.
            </li>
            <li>
              Adapters are composable — you can use CSS variables binding without
              DOM attributes, or system binding without scoped themes.
            </li>
            <li>
              Each adapter returns a <code className="mono text-[0.9em]">destroy()</code> function
              that unsubscribes and cleans up any injected DOM nodes.
            </li>
            <li>
              The CSS-variables binding owns the transition pipeline (diff →
              plan → animate). Other bindings opt in by setting{" "}
              <code className="mono text-[0.9em]">subscribe: false</code> and
              receiving the <code className="mono text-[0.9em]">apply</code> callback
              through the shared View Transition.
            </li>
          </ul>
        </section>

        <section id="css-variables" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="createCSSVariablesBinding() writes theme tokens as --theme-color-* custom properties on :root, enabling any CSS in the page to reference theme values."
          >
            CSS Variables Binding
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            This is the primary adapter. It converts every token in a theme
            definition into a CSS custom property and keeps it synchronized. The
            default prefix <code className="mono text-[0.9em]">theme-</code> produces
            variables like{" "}
            <code className="mono text-[0.9em]">--theme-color-primary</code> and{" "}
            <code className="mono text-[0.9em]">--theme-radius-lg</code>.
          </p>
          <CodeBlock
            html={highlightCode(cssVariablesSnippet.code, "ts")}
            code={cssVariablesSnippet.code}
            language="ts"
            filename={cssVariablesSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>@property registration</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            On first apply, every color variable is registered with{" "}
            <code className="mono text-[0.9em]">@property</code> so the browser
            can interpolate between values — enabling smooth CSS-native
            transitions without per-element transition styles.
          </Callout>
        </section>

        <section id="dom-attributes" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="createDOMBinding() writes identity attributes so CSS selectors and JavaScript can react to the active theme without reading the store."
          >
            DOM Attribute Binding
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            While CSS variables deliver color values, the DOM binding delivers
            <em> identity</em>. It sets the{" "}
            <code className="mono text-[0.9em]">data-theme</code>,{" "}
            <code className="mono text-[0.9em]">data-theme-family</code>, and{" "}
            <code className="mono text-[0.9em]">data-theme-mode</code> attributes,
            toggles the <code className="mono text-[0.9em]">dark</code> class,
            and writes the{" "}
            <code className="mono text-[0.9em]">color-scheme</code> CSS property
            so native form controls and scrollbars match the theme.
          </p>
          <CodeBlock
            html={highlightCode(domBindingSnippet.code, "ts")}
            code={domBindingSnippet.code}
            language="ts"
            filename={domBindingSnippet.title}
            className="m-0"
          />
        </section>

        <section id="system-theme" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="createSystemThemeBinding() listens to the OS color scheme preference and automatically swaps between a light and dark theme."
          >
            System Theme Binding
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The system binding watches{" "}
            <code className="mono text-[0.9em]">prefers-color-scheme</code> via{" "}
            <code className="mono text-[0.9em]">matchMedia</code> and updates the
            store when the OS switches between light and dark. Downstream
            bindings (CSS variables, DOM attributes) react automatically — no
            wiring needed.
          </p>
          <CodeBlock
            html={highlightCode(systemBindingSnippet.code, "ts")}
            code={systemBindingSnippet.code}
            language="ts"
            filename={systemBindingSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Server-side resolution</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Theme Kit resolves the{" "}
            <code className="mono text-[0.9em]">system</code> mode during SSR
            using a{" "}
            <code className="mono text-[0.9em]">@media (prefers-color-scheme: dark)</code>{" "}
            fallback, so the first paint already matches the OS — no flash.
          </Callout>
        </section>

        <section id="scoped-theme" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="createScopedThemeBinding() isolates a subtree to its own theme, independent of the page-level provider."
          >
            Scoped Theme Binding
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Scoped bindings apply theme variables and attributes to a specific
            element rather than <code className="mono text-[0.9em]">:root</code>.
            Child elements inherit the scoped variables, so a sidebar can be
            permanently dark while the page stays light. The binding supports
            local theme definitions, transition inheritance from the parent
            runtime, and clean teardown.
          </p>
          <CodeBlock
            html={highlightCode(scopedBindingSnippet.code, "ts")}
            code={scopedBindingSnippet.code}
            language="ts"
            filename={scopedBindingSnippet.title}
            className="m-0"
          />
        </section>

        <section id="transition-pipeline" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="The diff → plan → animate pipeline is the internal engine that makes theme transitions smooth. The CSS variables binding owns it — other adapters opt in through the shared View Transition."
          >
            Transition Binding
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Every animated theme change flows through three stages:
          </p>
          <div className="rounded-xl border border-border overflow-hidden mb-3">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              The pipeline
            </div>
            <div className="p-4 flex flex-col gap-2 text-sm">
              {[
                "createThemeDiff() — compares old and new variable maps, groups changes by type (color, radius, shadow)",
                "createTransitionPlan() — classifies groups, checks prefers-reduced-motion, and computes per-group timing",
                "runThemeAnimation() — applies @property-registered CSS variables so the browser interpolates natively",
              ].map((step, i) => (
                <div key={step} className="flex gap-2 items-center text-sm opacity-75">
                  <span
                    className={`w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold ${
                      i === 1
                        ? ""
                        : "bg-muted text-foreground/50"
                    }`}
                    style={
                      i === 1
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
            html={highlightCode(transitionPipelineSnippet.code, "ts")}
            code={transitionPipelineSnippet.code}
            language="ts"
            filename={transitionPipelineSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>View Transition integration</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            When the browser supports it and the user doesn&apos;t prefer reduced
            motion, the CSS-variables binding wraps the swap in{" "}
            <code className="mono text-[0.9em]">document.startViewTransition()</code>{" "}
            — a single cross-fade that paints the new theme beneath a snapshot
            of the old one, eliminating white-shift on light→dark switches.
          </Callout>
        </section>

        <section id="disabling" className="scroll-mt-24">
          <SectionHeading
            num={7}
            desc="Adapters can be selectively disabled. Skip DOM attributes entirely, suppress CSS variable output, or turn off transitions for specific bindings."
          >
            Disabling Adapters
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Not every app needs every adapter. The runtime accepts a{" "}
            <code className="mono text-[0.9em]">dom: false</code> flag to skip
            attribute binding at the provider level, and individual bindings
            accept options to disable transitions or unsubscribe from the store.
          </p>
          <CodeBlock
            html={highlightCode(disableSnippet.code, "ts")}
            code={disableSnippet.code}
            language="ts"
            filename={disableSnippet.title}
            className="m-0"
          />
        </section>
      </div>
    </DocsLayout>
  );
}
