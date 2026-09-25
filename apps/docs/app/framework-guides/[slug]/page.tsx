import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsLayout } from "../../../components/docs-layout";
import { CodeBlock } from "../../../components/code-block";
import { Callout } from "../../../components/ui/callout";
import { DocHeader } from "../../../components/ui/doc-header";
import { Prerequisites } from "../../../components/ui/prerequisites";
import { RelatedLinks } from "../../../components/ui/related-links";
import { InlineCode } from "../../../components/ui/inline-code";
import { SectionHeading } from "../../../components/ui/section-heading";
import { ApiExplorer } from "../../../components/api-explorer";
import {
  InstallCommand,
  type PackageManager,
} from "../../../components/install-command";
import {
  frameworks,
  CANONICAL_STYLES_NOTE,
  CANONICAL_STYLES_STEP,
} from "../../../lib/frameworks";
import { frameworkCompatibilityData } from "../../../lib/compatibility-data";
import type { SupportLevel } from "../../../components/ui/support-badge";
import { frameworkUseCases } from "../../../lib/use-cases";
import { highlightCode } from "../../../lib/highlight";
import { PKG_VERSION } from "../../../lib/version";
import { caveatForSlug } from "../../../lib/framework-caveats";
import { docsUrl } from "../../../lib/site";
import {
  WhichReactSetupPanel,
  OptimizedCsrBootstrap,
} from "../../../components/framework-guides/react-bootstrap";
import { AstroSetupGuide } from "../../../components/framework-guides/astro-guide";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

function installCommand(pkgs: string, manager: PackageManager): string {
  return manager === "npm" ? `npm install ${pkgs}` : `${manager} add ${pkgs}`;
}

/** Build one `InstallCommand` prop set — one entry per package manager. */
function installCommandsFor(pkgs: string) {
  return Object.fromEntries(
    MANAGERS.map((manager) => [
      manager,
      {
        code: installCommand(pkgs, manager),
        html: highlightCode(installCommand(pkgs, manager), "bash"),
      },
    ]),
  ) as Record<PackageManager, { code: string; html: string }>;
}

export function generateStaticParams() {
  return frameworks.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const framework = frameworks.find((f) => f.slug === slug);
  if (!framework) return { title: "Framework Guide" };
  return {
    title: framework.name,
    description: framework.tagline,
    alternates: { canonical: docsUrl(`/framework-guides/${slug}`) },
  };
}

export default async function FrameworkGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const framework = frameworks.find((f) => f.slug === slug);
  if (!framework) notFound();

  // Astro's guide is shape-driven (Astro-only vs Astro + React) rather than a
  // single onboarding sequence, so it renders its own steps and the generic
  // ones are skipped. See components/framework-guides/astro-guide.tsx.
  const isAstro = framework.slug === "astro";

  // The same package list Quick Start installs, so the two pages cannot tell a
  // reader to install different things: the shared core, this framework's
  // adapter, and any runtime an integration needs on top (Tailwind's).
  const pkgs = [
    "@theme-kit/core",
    framework.pkg,
    ...(framework.extraPackages ?? []),
  ].join(" ");

  const commands = installCommandsFor(pkgs);

  // Astro's two paths install different things. The Astro-only path stays
  // framework-free; the Astro + React path adds the renderer Astro needs to
  // hydrate an island. Both sets are passed so each path's install step renders
  // a command that is complete on its own — the reader never has to work out
  // which extra packages the React path needs from the prose.
  const astroInstallCommands = {
    base: commands,
    renderer: installCommandsFor(`${pkgs} @astrojs/react react react-dom`),
  };

  const snippet2Html = highlightCode(
    framework.snippet2.code,
    framework.snippet2.lang,
  );

  const quickStartHtml = highlightCode(
    framework.quickStart.code,
    framework.quickStart.lang,
  );

  const quickStartExtraHtml = framework.quickStartExtra
    ? highlightCode(
        framework.quickStartExtra.code,
        framework.quickStartExtra.lang,
      )
    : null;

  // Step 2 is the same minimal setup Quick Start shows, so the two pages cannot
  // drift apart.
  const noThemeHtml = highlightCode(
    framework.noTheme.code,
    framework.noTheme.lang,
  );

  // Step 3 uses the framework's switcher. Two frameworks have no switcher in
  // `snippet` — Tailwind's is a utility example and Astro's is a layout — so
  // they supply their own through `switchSnippet`.
  const switcher = framework.switchSnippet ?? framework.snippet;
  const switcherHtml = highlightCode(switcher.code, switcher.lang);

  // Step 4 is the canonical stylesheet. Every framework entry points its
  // `styles` slot at the same source — only the file name differs — so this is
  // one definition rendered eleven times, which is the point: the framework
  // snippets teach integration, the stylesheet teaches Theme Kit itself.
  const stylesHtml = highlightCode(framework.styles.code, framework.styles.lang);

  const setupExtraHtmlForGuide = framework.setupExtra
    ? highlightCode(framework.setupExtra.code, framework.setupExtra.lang)
    : null;

  const useCases = frameworkUseCases[framework.slug] ?? [];
  const useCaseHtml = useCases.map((useCase) => ({
    html: highlightCode(useCase.code, useCase.lang),
    useCase,
  }));

  // Read SSR and zero-flash from the compatibility table rather than from the
  // tag list, so the header can never disagree with /reference/compatibility.
  const compatibility = frameworkCompatibilityData.find(
    (entry) => entry.package === framework.pkg,
  );

  const ssrLevel: SupportLevel | undefined =
    compatibility === undefined || compatibility.ssr === "N/A"
      ? undefined
      : compatibility.ssr === "Full"
        ? "yes"
        : compatibility.ssr === "Helpers"
          ? "partial"
          : "no";

  const zeroFlashLevel: SupportLevel | undefined =
    compatibility === undefined || compatibility.zeroFlash === "N/A"
      ? undefined
      : compatibility.zeroFlash === "Auto"
        ? "yes"
        : compatibility.zeroFlash === "Manual"
          ? "partial"
          : "no";

  return (
    <DocsLayout>
      <article className="min-w-0 max-w-3xl">
        <DocHeader
          title={framework.name}
          description={framework.tagline}
          metadata={{
            package: framework.pkg,
            framework: framework.name,
            version: PKG_VERSION,
            lastVerified: "2026-09-17",
            status: "stable",
            ...(ssrLevel ? { ssr: ssrLevel } : {}),
            ...(zeroFlashLevel ? { zeroFlash: zeroFlashLevel } : {}),
          }}
        />

        {framework.slug === "react" ? <WhichReactSetupPanel /> : null}

        <Prerequisites
          items={[
            {
              label: "Runtime",
              value:
                "Node.js 18+ and a package manager (npm, pnpm, yarn, or bun)",
            },
            {
              label: "Project",
              value: `A ${framework.name} project${ssrLevel ? " with SSR support" : ""}`,
            },
            ...(framework.slug === "angular"
              ? [
                  {
                    label: "Toolchain",
                    value:
                      "Angular 17+ using the standalone bootstrap API — your Angular version also sets the TypeScript and Node versions you need",
                  },
                ]
              : []),
            ...(framework.slug === "tailwind"
              ? [
                  {
                    label: "Adapter",
                    value:
                      "A Theme Kit runtime for your framework — @theme-kit/react, -vue, -svelte, -solid, -angular or -web. Tailwind itself is build-time only.",
                  },
                ]
              : []),
          ]}
        />

        {/* Astro supports two application shapes — Astro-only and Astro + React
            — so its guide presents that choice before the install step and
            gives each path its own steps. The generic onboarding sections
            below assume a single setup and would restate one path as if it
            were the only one, so they are replaced for Astro. */}
        {isAstro ? (
          <AstroSetupGuide
            framework={framework}
            installCommands={astroInstallCommands}
          />
        ) : null}

        {!isAstro ? (
          <>
        <section id="install" className="scroll-mt-24 mt-10">
          <SectionHeading
            num={1}
            desc={
              framework.extraPackages?.length
                ? `The shared core, the ${framework.name} integration, and the runtime adapter the snippets below use.`
                : `The shared core and the adapter for ${framework.name}.`
            }
          >
            Install
          </SectionHeading>
          <InstallCommand commands={commands} />
        </section>

        <section id="setup" className="mt-10 scroll-mt-24">
          <SectionHeading
            num={2}
            desc="Wrap the app in the provider. Theme Kit ships the built-in themes, so there is nothing to define yet."
          >
            Set up
          </SectionHeading>
          <CodeBlock
            html={noThemeHtml}
            code={framework.noTheme.code}
            language={framework.noTheme.lang}
            filename={framework.noTheme.title}
            className="rounded-lg m-0"
          />
          {framework.setupExtra && setupExtraHtmlForGuide ? (
            <CodeBlock
              html={setupExtraHtmlForGuide}
              code={framework.setupExtra.code}
              language={framework.setupExtra.lang}
              filename={framework.setupExtra.title}
              className="rounded-lg m-0 mt-3"
            />
          ) : null}
          <Callout className="mt-3" title="Choosing the starting theme">
            <InlineCode>{framework.modeNote}</InlineCode>
          </Callout>
        </section>

        <section id="ui" className="mt-10 scroll-mt-24">
          <SectionHeading
            num={3}
            desc="A heading, a card and a button. The button reads the current theme and changes it — nothing is styled yet."
          >
            Add a small UI
          </SectionHeading>
          <CodeBlock
            html={switcherHtml}
            code={switcher.code}
            language={switcher.lang}
            filename={switcher.title}
            className="rounded-lg m-0"
          />
        </section>

        <section id="styling" className="mt-10 scroll-mt-24">
          <SectionHeading num={4} desc={CANONICAL_STYLES_STEP.desc}>
            {CANONICAL_STYLES_STEP.label}
          </SectionHeading>
          <CodeBlock
            html={stylesHtml}
            code={framework.styles.code}
            language={framework.styles.lang}
            filename={framework.styles.title}
            className="rounded-lg m-0"
          />
          <Callout className="mt-3" title="Why this never needs a second stylesheet">
            <InlineCode>{CANONICAL_STYLES_NOTE}</InlineCode>
          </Callout>
        </section>

        <section id="configuration" className="mt-10 scroll-mt-24">
          <SectionHeading
            desc="The same setup with your own themes and options turned on. Everything here is optional — the first result above already works."
          >
            Theme configuration
          </SectionHeading>
          <CodeBlock
            html={quickStartHtml}
            code={framework.quickStart.code}
            language={framework.quickStart.lang}
            filename={framework.quickStart.title}
            className="rounded-lg m-0"
          />
          {framework.quickStartExtra && quickStartExtraHtml ? (
            <CodeBlock
              html={quickStartExtraHtml}
              code={framework.quickStartExtra.code}
              language={framework.quickStartExtra.lang}
              filename={framework.quickStartExtra.title}
              className="rounded-lg m-0 mt-3"
            />
          ) : null}
          <Callout className="mt-3" title="Where the theme data lives">
            <InlineCode>{framework.configNote}</InlineCode>
          </Callout>
        </section>
          </>
        ) : null}

        <section id="whats-available" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold tracking-tight">
            What's Available
          </h2>
          <p className="text-sm opacity-70 mt-1 mb-4">
            <code className="mono text-[0.9em]">{framework.pkg}</code> ships{" "}
            {framework.featureCount} exports in {framework.groups.length}{" "}
            categories. This is the map — click an export to see what it does.
            Signatures and examples live in the{" "}
            <a
              href={`/api-reference/${framework.slug}`}
              className="text-primary no-underline"
            >
              API reference
            </a>
            .
          </p>
          <ApiExplorer groups={framework.groups} slug={framework.slug} />
        </section>

        <section id="use-cases" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold tracking-tight">Use Cases</h2>
          <p className="text-sm opacity-70 mt-1 mb-4">
            The important features in practice — copy any of these straight into
            your app.
          </p>
          <div className="flex flex-col gap-8">
            {useCaseHtml.map(({ html, useCase }) => (
              <div key={useCase.title}>
                <h3 className="text-sm font-semibold mb-0.5">
                  {useCase.title}
                </h3>
                <p className="text-xs opacity-60 mb-2">
                  <InlineCode>{useCase.desc}</InlineCode>
                </p>
                <CodeBlock
                  html={html}
                  code={useCase.code}
                  language={useCase.lang}
                  {...(useCase.filename ? { filename: useCase.filename } : {})}
                  className="rounded-lg m-0"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Astro's snippets all render inside its setup paths, so this section
            would show each of them a second time. */}
        {!isAstro ? (
          <>
        <section id="more-examples" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold tracking-tight">
            More Examples
          </h2>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Scoped theming, history controls, and framework-specific patterns.
          </p>
          {/* Astro and Tailwind do not use `snippet` as the toggle in step 3,
              so it is shown here rather than left unused. */}
          {framework.switchSnippet ? (
            <CodeBlock
              html={highlightCode(framework.snippet.code, framework.snippet.lang)}
              code={framework.snippet.code}
              language={framework.snippet.lang}
              filename={framework.snippet.title}
              className="rounded-lg m-0"
            />
          ) : null}
          <CodeBlock
            html={snippet2Html}
            code={framework.snippet2.code}
            language={framework.snippet2.lang}
            filename={framework.snippet2.title}
            className={`rounded-lg m-0 ${framework.switchSnippet ? "mt-4" : ""}`}
          />
          {/* React renders its snippet3 through OptimizedCsrBootstrap below,
                with extra prose. Every other framework shows it here. */}
          {framework.snippet3 && framework.slug !== "react" ? (
            <CodeBlock
              html={highlightCode(
                framework.snippet3.code,
                framework.snippet3.lang,
              )}
              code={framework.snippet3.code}
              language={framework.snippet3.lang}
              filename={framework.snippet3.title}
              className="rounded-lg m-0 mt-4"
            />
          ) : null}
          {framework.snippet4 ? (
            <CodeBlock
              html={highlightCode(
                framework.snippet4.code,
                framework.snippet4.lang,
              )}
              code={framework.snippet4.code}
              language={framework.snippet4.lang}
              filename={framework.snippet4.title}
              className="rounded-lg m-0 mt-4"
            />
          ) : null}
          <p className="text-sm opacity-70 mt-4">
            The complete runnable app behind this guide is{" "}
            <a
              href="/examples"
              className="text-primary no-underline hover:underline"
            >
              examples/apps/{framework.slug}
            </a>
            .
          </p>
        </section>
          </>
        ) : null}

        {framework.slug === "react" ? OptimizedCsrBootstrap(framework) : null}

        {caveatForSlug(framework.slug) ? (
          <section id="caveats" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              Caveats for {framework.name}
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              {framework.setupGuide?.caveatsIntro ??
                `Every integration re-exports the same core surface, but the adapter behavior below is specific to ${framework.name}.`}
            </p>
            <Callout
              variant="limitation"
              title={caveatForSlug(framework.slug)!.title}
            >
              <p className="leading-relaxed">
                <InlineCode>
                  {caveatForSlug(framework.slug)!.specific}
                </InlineCode>
              </p>
              {caveatForSlug(framework.slug)!.universal ? (
                <p className="mt-2 opacity-80">
                  <strong>Universal:</strong>{" "}
                  <InlineCode>
                    {caveatForSlug(framework.slug)!.universal}
                  </InlineCode>
                </p>
              ) : null}
              {caveatForSlug(framework.slug)!.href ? (
                <p className="mt-2">
                  <a
                    href={caveatForSlug(framework.slug)!.href}
                    className="text-primary hover:underline no-underline"
                  >
                    Read more →
                  </a>
                </p>
              ) : null}
            </Callout>
          </section>
        ) : null}

        <RelatedLinks
          className="mt-12"
          links={[
            {
              title: "Custom Themes",
              description: "Build your own color palettes and semantic tokens",
              href: "/custom-themes",
            },
            {
              title: "API Reference",
              description: `Complete ${framework.pkg} documentation`,
              href: `/api-reference/${framework.slug}`,
            },
            {
              title: "Migration Guide",
              description: "Upgrade from previous versions",
              href: "/migration",
            },
            {
              title: "Compatibility Matrix",
              description: "Check framework and library version support",
              href: "/reference/compatibility",
            },
          ]}
        />
      </article>
    </DocsLayout>
  );
}
