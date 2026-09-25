"use client";

import { useState } from "react";

import { CodeBlock } from "../code-block";
import { Callout } from "../ui/callout";
import { PickCard } from "../ui/pick-card";
import { NextSteps } from "../ui/next-step-card";
import { useScrollToOnChange } from "../ui/use-scroll-to-on-change";
import {
  frameworks,
  CANONICAL_STYLES_NOTE,
  CANONICAL_STYLES_STEP,
} from "../../lib/frameworks";
import { InstallCommand, type PackageManager } from "../install-command";

export function QuickStartGuide({
  frameworkHtml,
  setupExtraHtml,
  switchHtml,
  stylesHtml,
  installCommands,
  astroHtml,
}: {
  /** Precomputed server-side Shiki HTML per framework slug. */
  frameworkHtml: Record<string, string>;
  /** Shiki HTML for a second setup file, where a framework needs one. */
  setupExtraHtml: Record<string, string>;
  /** Shiki HTML for the switching snippet. */
  switchHtml: Record<string, string>;
  /**
   * Shiki HTML for the canonical stylesheet.
   *
   * One string, not a per-framework map: every entry points at the same
   * stylesheet, and only the file name differs — the name comes from the entry,
   * the highlighted source does not.
   */
  stylesHtml: string;
  /** Precomputed install-command HTML per framework package name. */
  installCommands: Record<
    string,
    Record<PackageManager, { code: string; html: string }>
  >;
  /**
   * Astro only — its two application shapes, as pre-highlighted HTML.
   *
   * Astro is the one framework here with two supported setups, so without this
   * the page would teach one shape's install and config and the other's
   * switcher. `undefined` for every single-setup framework.
   */
  astroHtml?:
    | {
        /** `snippet2` — the framework-free switch (`<ThemeToggle />`). */
        onlySwitch: string;
        /** `reactSetup` — the integration config with the React renderer. */
        reactSetup: string;
        /** Shiki HTML for each setup file, keyed by the snippet's title. */
        setupHtml: Record<string, string>;
        /** Install commands that include the React renderer. */
        reactInstall: Record<PackageManager, { code: string; html: string }>;
      }
    | undefined;
}) {
  const [slug, setSlug] = useState("next");
  const fw = frameworks.find((f) => f.slug === slug) ?? frameworks[0]!;

  const noThemeHtml = frameworkHtml[fw.slug] ?? "";
  const switcher = fw.switchSnippet ?? fw.snippet;

  // Astro has two shapes; every other framework has one setup, so the shape
  // state is inert for them. The framework-free shape is the default, because
  // Quick Start's promise is the shortest path and that one needs no client
  // framework at all.
  const isAstro = fw.slug === "astro" && astroHtml !== undefined;
  const [astroShape, setAstroShape] = useState<"only" | "react">("only");
  const reactShape = isAstro && astroShape === "react";
  // Captured in a local so the narrowing survives into the render callback.
  const astroGuide = isAstro ? fw.setupGuide : undefined;

  // Step 1 — the React shape installs a renderer the framework-free shape does
  // not, so the command follows the shape rather than being shared.
  const install = reactShape
    ? astroHtml!.reactInstall
    : installCommands[fw.pkg]!;

  // Step 2 — registration. Astro's setup is three files (the theme config, the
  // integration config, and the layout that mounts the provider); every other
  // framework needs one or two. The React shape swaps only the integration
  // config, because `theme.config.ts` and the layout are identical in both.
  const useReactSetup = reactShape && fw.reactSetup !== undefined;
  const setup = useReactSetup ? fw.reactSetup! : fw.noTheme;
  const setupHtml = useReactSetup ? astroHtml!.reactSetup : noThemeHtml;
  const astroSetup = isAstro
    ? [fw.quickStart, useReactSetup ? fw.reactSetup! : fw.noTheme, fw.snippet]
    : null;

  // Step 3 — the switcher. The framework-free shape uses the native
  // `<ThemeToggle />`; the React shape uses the island.
  const showReactSwitcher = reactShape || !isAstro;
  const switchSnippet = showReactSwitcher ? switcher : fw.snippet2;
  const switchSnippetHtml = showReactSwitcher
    ? (switchHtml[fw.slug] ?? "")
    : astroHtml!.onlySwitch;

  // Scroll to the Install step after the framework change commits, so the
  // reader lands on the updated install command for the framework they picked.
  useScrollToOnChange("install", slug);

  return (
    <div>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          Pick your framework
        </h2>
        <p className="opacity-70 text-sm mb-5 max-w-2xl">
          Theme Kit ships a built-in neutral theme, so you can skip defining
          tokens entirely and still get a complete, toggleable light/dark theme.
          These snippets are the whole setup.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {frameworks.map((f) => (
            <PickCard
              key={f.slug}
              icon={f.icon}
              title={f.name}
              subtitle={f.pkg}
              active={f.slug === slug}
              onSelect={() => setSlug(f.slug)}
            />
          ))}
        </div>
      </section>

      {/* Astro is the one framework here with two supported shapes, so the
          reader picks one before installing rather than discovering a
          React-specific import halfway down a React-free setup. Deliberately
          not an <h2>: this is a control over the steps below, not a section of
          its own, and keeping it out of the heading set leaves the TOC rail's
          manifest untouched. */}
      {astroGuide ? (
        <div className="mb-10" role="group" aria-label="Astro setup">
          <p className="text-sm font-semibold mb-2">Astro setup</p>
          <p className="opacity-70 text-sm mb-3 max-w-2xl">
            Astro supports two shapes here, and they differ in whether the app
            ships a client framework at all. Pick one — the steps below follow
            it, and the framework guide explains what the two share.
          </p>
          <div className="flex flex-wrap gap-2">
            {astroGuide.choose.paths.map((path, index) => {
              const value = index === 0 ? "only" : "react";
              const active = astroShape === value;
              return (
                <button
                  key={path.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setAstroShape(value)}
                  className={`chip ${active ? "chip-active" : ""}`}
                >
                  {path.name}
                  <span className="opacity-70 text-xs">{path.badge}</span>
                </button>
              );
            })}
          </div>
          <p className="opacity-70 text-xs mt-2">
            <a
              href={`/framework-guides/astro#${astroGuide.choose.paths[reactShape ? 1 : 0].id}`}
              className="text-primary no-underline hover:underline"
            >
              Read the full Astro guide →
            </a>
          </p>
        </div>
      ) : null}

      <section id="install" className="mb-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          1 · Install
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          {reactShape
            ? "The same Theme Kit packages, plus the React renderer Astro needs to hydrate an island."
            : fw.extraPackages?.length
              ? "Install the core package, the integration, and the runtime adapter the snippets below use."
              : "Install the core package and the adapter for your framework."}
        </p>
        <InstallCommand commands={install} />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          2 · Set up
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          {astroSetup
            ? "Three files. theme.config.ts declares the themes and the starting mode, the integration config registers themeKit(), and the layout mounts the provider that server-renders the themed <html>."
            : "Theme Kit ships the built-in themes, so there is nothing to define yet. Mount the provider and you have a working light/dark theme."}
        </p>
        {astroSetup ? (
          astroSetup.map((snippet, index) => (
            <CodeBlock
              key={snippet.title}
              html={astroHtml!.setupHtml[snippet.title] ?? ""}
              code={snippet.code}
              language={snippet.lang}
              filename={snippet.title}
              className={`rounded-lg m-0 ${index ? "mt-3" : ""}`}
            />
          ))
        ) : (
          <>
            <CodeBlock
              html={setupHtml}
              code={setup.code}
              language={setup.lang}
              filename={setup.title}
              className="rounded-lg m-0"
            />
            {fw.setupExtra ? (
              <CodeBlock
                html={setupExtraHtml[fw.slug] ?? ""}
                code={fw.setupExtra.code}
                language={fw.setupExtra.lang}
                filename={fw.setupExtra.title}
                className="rounded-lg m-0 mt-3"
              />
            ) : null}
          </>
        )}
        <Callout className="mt-3" title="Choosing the starting theme">
          <p className="text-sm leading-relaxed">{fw.modeNote}</p>
        </Callout>
        <Callout className="mt-3" title="Where the configuration lives">
          <p className="text-sm leading-relaxed">{fw.configNote}</p>
        </Callout>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          3 · Add a small UI
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          {reactShape
            ? "A heading, a card and a button, rendered inside the island. The native <ThemeToggle /> still works alongside it with no client runtime; nothing is styled yet."
            : "A heading, a card and a button. The button reads the current theme and changes it; nothing is styled yet."}
        </p>
        <CodeBlock
          html={switchSnippetHtml}
          code={switchSnippet.code}
          language={switchSnippet.lang}
          filename={switchSnippet.title}
          className="rounded-lg m-0"
        />
        {reactShape ? (
          <>
            <Callout className="mt-3" title="Mount the island">
              <p className="text-sm leading-relaxed">
                Write one island whose tree holds both the provider and its
                consumers — <span className="mono">ThemeProviderClient</span>{" "}
                renders nothing, it installs the runtime — then mount it from a
                page with <span className="mono">client:load</span>. React hooks
                are not available in <span className="mono">.astro</span> files.
              </p>
            </Callout>
            {/* The React shape still owns the native component. Adding a
                renderer does not remove it, so the reader sees both: the
                island for React UI, <ThemeToggle /> for no client runtime. */}
            <CodeBlock
              html={astroHtml?.onlySwitch ?? ""}
              code={fw.snippet2.code}
              language={fw.snippet2.lang}
              filename={fw.snippet2.title}
              className="rounded-lg m-0 mt-3"
            />
            <Callout
              className="mt-3"
              title="The native toggle still needs no client runtime"
            >
              <p className="text-sm leading-relaxed">
                Adding a renderer does not take the component away.{" "}
                <span className="mono">{"<ThemeToggle />"}</span> is a real{" "}
                <span className="mono">{"<button>"}</span> with no island and no{" "}
                <span className="mono">client:load</span>, and{" "}
                <span className="mono">class</span> is forwarded to it — so the
                same token-driven class styles it on either shape.
              </p>
            </Callout>
          </>
        ) : null}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          4 · {CANONICAL_STYLES_STEP.label}
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          {CANONICAL_STYLES_STEP.desc}
        </p>
        <CodeBlock
          html={stylesHtml}
          code={fw.styles.code}
          language={fw.styles.lang}
          filename={fw.styles.title}
          className="rounded-lg m-0"
        />
        <Callout
          className="mt-3"
          title="Why this never needs a second stylesheet"
        >
          <p className="text-sm leading-relaxed">{CANONICAL_STYLES_NOTE}</p>
        </Callout>
      </section>

      <NextSteps
        className="mt-12"
        steps={[
          {
            title: "Define custom themes",
            description: "Create your own color palettes and design tokens",
            href: "/custom-themes",
          },
          {
            title: "Framework-specific setup",
            description:
              "Deep dive into SSR, zero-flash, and framework patterns",
            href: "/framework-guides",
          },
          {
            title: "Library adapters",
            description:
              "Integrate with shadcn/ui, Bootstrap, daisyUI, and more",
            href: "/libraries",
          },
        ]}
      />
    </div>
  );
}
