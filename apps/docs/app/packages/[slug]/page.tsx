import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocsLayout } from "../../../components/docs-layout";
import { CodeBlock } from "../../../components/code-block";
import { PageHeader } from "../../../components/ui/page-header";
import {
  InstallCommand,
  type PackageManager,
} from "../../../components/install-command";
import { Prerequisites } from "../../../components/ui/prerequisites";
import { NextSteps } from "../../../components/ui/next-step-card";
import { RelatedLinks } from "../../../components/ui/related-links";
import { InlineCode } from "../../../components/ui/inline-code";
import { packages } from "../../../lib/packages";
import { highlightCode } from "../../../lib/highlight";
import { docsUrl, npmPackageUrl, sourceUrlForPackage } from "../../../lib/site";
import { PKG_VERSION } from "../../../lib/version";

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
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) return { title: "Package" };
  return {
    title: `${pkg.pkg}`,
    description: pkg.tagline,
    alternates: { canonical: docsUrl(`/packages/${slug}`) },
  };
}

export default async function PackagePage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) notFound();

  const commands = Object.fromEntries(
    MANAGERS.map((manager) => [
      manager,
      {
        code: installCommand(pkg.pkg, manager),
        html: highlightCode(installCommand(pkg.pkg, manager), "bash"),
      },
    ]),
  ) as Record<PackageManager, { code: string; html: string }>;

  // Determine if this is a framework package
  const isFrameworkPackage = !["core", "cli", "devtools"].includes(pkg.slug);
  const isCorePackage = pkg.slug === "core";

  return (
    <DocsLayout>
      <article className="min-w-0 max-w-3xl">
        <PageHeader
          icon={pkg.icon}
          title={pkg.name}
          subtitle={pkg.pkg}
          description={pkg.tagline}
          badges={[
            ...pkg.tags.map((tag) => ({ label: tag })),
            { label: `${pkg.featureCount} exports` },
          ]}
          verified={{ version: PKG_VERSION, date: "2026-09-17" }}
        />

        <Prerequisites
          items={[
            {
              label: "Package Manager",
              value: "npm, pnpm, yarn, or bun",
            },
            {
              label: "Dependencies",
              value: isCorePackage
                ? "None — this is the core package"
                : "@theme-kit/core (peer dependency)",
            },
            {
              label: "Use Case",
              value: isCorePackage
                ? "Framework-agnostic runtime and tooling"
                : isFrameworkPackage
                  ? `${pkg.name} projects with theme support`
                  : "Theme Kit development and CI/CD",
            },
          ]}
        />

        <section id="install" className="scroll-mt-24 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Installation
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <a
                href={npmPackageUrl(pkg.pkg)}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary hover:underline no-underline"
              >
                View on npm ↗
              </a>
              <a
                href={sourceUrlForPackage(pkg.pkg)}
                target="_blank"
                rel="noreferrer noopener"
                className="text-foreground/70 hover:text-primary hover:underline no-underline"
              >
                Source ↗
              </a>
            </div>
          </div>
          <p className="text-sm opacity-70 mt-1 mb-3">
            {pkg.pkg === "@theme-kit/core" ? (
              "Install the framework-agnostic core directly."
            ) : (
              <>
                Install the integration —{" "}
                <code className="mono text-[0.9em]">@theme-kit/core</code> is
                pulled in automatically as a dependency.
              </>
            )}
          </p>
          <InstallCommand commands={commands} />
        </section>

        <section id="quick-start" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold tracking-tight">Quick Start</h2>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Complete copy-paste usage for this package.
          </p>
          <CodeBlock
            html={pkg.html}
            code={pkg.snippet.code}
            language={pkg.snippet.lang}
            filename={pkg.snippet.title}
            className="rounded-lg"
          />
        </section>

        {pkg.snippet2 && (
          <section id="more-examples" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              More Examples
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              Additional patterns for {pkg.name}.
            </p>
            <CodeBlock
              html={pkg.html2!}
              code={pkg.snippet2.code}
              language={pkg.snippet2.lang}
              filename={pkg.snippet2.title}
              className="rounded-lg m-0"
            />
          </section>
        )}

        <section id="api" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-semibold tracking-tight">
            API Reference
          </h2>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Curated highlights below. The complete generated reference — every
            signature, parameter and type — is at{" "}
            <Link
              href={`/api-reference/${pkg.slug}`}
              className="no-underline font-medium"
              style={{ color: "var(--theme-color-primary)" }}
            >
              /api-reference/{pkg.slug}
            </Link>
            .
          </p>
          <div className="flex flex-col gap-8 mt-4">
            {pkg.groups.map((group, groupIndex) => {
              const base = anchor(group.label);
              const count = pkg.groups
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
                                style={{
                                  color: "var(--theme-color-primary)",
                                }}
                              >
                                {feature.name}
                              </code>
                            </td>
                            <td className="px-4 py-3 opacity-70 leading-relaxed">
                              <InlineCode>{feature.desc}</InlineCode>
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

        <NextSteps
          className="mt-10"
          steps={[
            {
              title: "View Full API",
              description:
                "Complete generated reference with all signatures and types",
              href: `/api-reference/${pkg.slug}`,
            },
            {
              title: isCorePackage
                ? "Framework Integration"
                : "Quick Start Guide",
              description: isCorePackage
                ? "Choose your framework and get started"
                : `Complete ${pkg.name} setup guide`,
              href: isCorePackage
                ? "/get-started"
                : `/framework-guides/${pkg.slug}`,
            },
            {
              title: "Explore Examples",
              description: "See real-world implementations and patterns",
              href: "/showcase",
            },
          ]}
        />

        <RelatedLinks
          className="mt-10"
          links={[
            { title: "Compatibility Matrix", href: "/reference/compatibility" },
            { title: "Troubleshooting", href: "/troubleshooting" },
            { title: "Migration Guide", href: "/migration" },
            { title: "API Reference", href: `/api-reference/${pkg.slug}` },
          ]}
        />
      </article>
    </DocsLayout>
  );
}
