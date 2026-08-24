import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsLayout } from "../../../components/docs-layout";
import { CodeBlock } from "../../../components/code-block";
import { Callout } from "../../../components/ui/callout";
import { PageHeader } from "../../../components/ui/page-header";
import { ApiExplorer } from "../../../components/api-explorer";
import {
  InstallCommand,
  type PackageManager,
} from "../../../components/install-command";
import { frameworks } from "../../../lib/frameworks";
import { frameworkUseCases } from "../../../lib/use-cases";
import { highlightCode } from "../../../lib/highlight";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

function installCommand(pkg: string, manager: PackageManager): string {
  return manager === "npm" ? `npm install ${pkg}` : `${manager} add ${pkg}`;
}

function anchor(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
  };
}

export default async function FrameworkGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const framework = frameworks.find((f) => f.slug === slug);
  if (!framework) notFound();

  const commands = Object.fromEntries(
    MANAGERS.map((manager) => [
      manager,
      {
        code: installCommand(framework.pkg, manager),
        html: highlightCode(installCommand(framework.pkg, manager), "bash"),
      },
    ]),
  ) as Record<PackageManager, { code: string; html: string }>;

  const snippet2Html = highlightCode(
    framework.snippet2.code,
    framework.snippet2.lang,
  );

  const quickStartHtml = highlightCode(
    framework.quickStart.code,
    framework.quickStart.lang,
  );

  const implementationHtml = highlightCode(
    framework.snippet.code,
    framework.snippet.lang,
  );

  const useCases = frameworkUseCases[framework.slug] ?? [];
  const useCaseHtml = useCases.map((useCase) => ({
    html: highlightCode(useCase.code, useCase.lang),
    useCase,
  }));

  return (
    <DocsLayout>
      <article className="min-w-0 max-w-3xl">
          <PageHeader
            icon={framework.icon}
            title={framework.name}
            subtitle={framework.pkg}
            description={framework.tagline}
            badges={framework.tags.map((tag) => ({ label: tag }))}
          />

          <section id="install" className="scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              Installation
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              Install the package for your framework alongside{" "}
              <code className="mono text-[0.9em]">@theme-kit/core</code>.
            </p>
            <InstallCommand commands={commands} />
          </section>

          <section id="quick-start" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              Quick Start
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              Start from scratch — install the package, then wrap your app in
              the provider at the entry point shown below.
            </p>
            <CodeBlock
              html={quickStartHtml}
              code={framework.quickStart.code}
              language={framework.quickStart.lang}
              filename={framework.quickStart.title}
              className="rounded-lg"
            />
            <Callout className="mt-3">
              Every integration re-exports the full{" "}
              <code className="mono text-[0.9em]">@theme-kit/core</code>{" "}
              surface, so history, batching, snapshots, packs and lifecycle work
              the same way across frameworks.
            </Callout>
          </section>

          <section id="implementation" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              Implementation
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              Read and update theme state from any component using the
              framework-native primitives below.
            </p>
            <CodeBlock
              html={implementationHtml}
              code={framework.snippet.code}
              language={framework.snippet.lang}
              filename={framework.snippet.title}
              className="rounded-lg m-0"
            />
          </section>

          <section id="whats-available" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              What's Available
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-4">
              <code className="mono text-[0.9em]">{framework.pkg}</code> ships{" "}
              {framework.featureCount} exports in {framework.groups.length}{" "}
              categories. Everything below is also documented in the{" "}
              <a
                href={`/api-reference/${framework.slug}`}
                className="text-primary no-underline"
              >
                full API reference
              </a>
              . Click any export to reveal what it does and how to use it.
            </p>
            <ApiExplorer groups={framework.groups} slug={framework.slug} />
          </section>

          <section id="use-cases" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">Use Cases</h2>
            <p className="text-sm opacity-70 mt-1 mb-4">
              The important features in practice — copy any of these straight
              into your app.
            </p>
            <div className="flex flex-col gap-8">
              {useCaseHtml.map(({ html, useCase }) => (
                <div key={useCase.title}>
                  <h3 className="text-sm font-semibold mb-0.5">
                    {useCase.title}
                  </h3>
                  <p className="text-xs opacity-60 mb-2">{useCase.desc}</p>
                  <CodeBlock
                    html={html}
                    code={useCase.code}
                    language={useCase.lang}
                    filename={useCase.title}
                    className="rounded-lg m-0"
                  />
                </div>
              ))}
            </div>
          </section>

          <section id="more-examples" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              More Examples
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              Scoped theming, history controls, and framework-specific patterns.
            </p>
            <CodeBlock
              html={snippet2Html}
              code={framework.snippet2.code}
              language={framework.snippet2.lang}
              filename={framework.snippet2.title}
              className="rounded-lg m-0"
            />
          </section>

          <section id="api" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              API Reference
            </h2>
            <div className="flex flex-col gap-8 mt-4">
              {framework.groups.map((group, groupIndex) => {
                const base = anchor(group.label);
                const count = framework.groups
                  .slice(0, groupIndex)
                  .filter((g) => anchor(g.label) === base).length;
                const sectionId = `api-${base}${count > 0 ? `-${count + 1}` : ""}`;
                return (
                <section
                  key={`${group.label}-${groupIndex}`}
                  id={sectionId}
                  className="scroll-mt-24"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-widest opacity-50 mb-2">
                    {group.label}
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                            Export
                          </th>
                          <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.features.map((feature) => (
                          <tr
                            key={feature.name}
                            className="border-b border-border last:border-0 align-top"
                          >
                            <td className="px-4 py-3">
                              <code
                                className="mono text-[0.85em] font-semibold"
                                style={{ color: "var(--theme-color-primary)" }}
                              >
                                {feature.name}
                              </code>
                            </td>
                            <td className="px-4 py-3 opacity-70 leading-relaxed">
                              {feature.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                );
              })}
            </div>
          </section>
        </article>
    </DocsLayout>
  );
}
