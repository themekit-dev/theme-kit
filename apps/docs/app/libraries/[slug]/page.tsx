import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { use } from "react";

import { DocsLayout } from "../../../components/docs-layout";
import { CodeBlock } from "../../../components/code-block";
import { ApiExplorer } from "../../../components/api-explorer";
import type { PackageManager } from "../../../components/install-command";
import { PageHeader } from "../../../components/ui/page-header";
import { libraries } from "../../../lib/libraries";
import { libraryUseCases } from "../../../lib/use-cases-libraries";
import { highlightCode } from "../../../lib/highlight";
import { LibraryFrameworkGuide } from "../../../components/library-framework-guide";
import { collectPageHeadings } from "../../../lib/toc-tree";

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
  return libraries.map((lib) => ({ slug: lib.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lib = libraries.find((l) => l.slug === slug);
  if (!lib) return { title: "Library" };
  return {
    title: lib.name,
    description: lib.tagline,
  };
}

export default function LibraryGuidePage({ params }: PageProps) {  const { slug } = use(params);
  const lib = libraries.find((l) => l.slug === slug);
  if (!lib) notFound();

  const commands = Object.fromEntries(
    MANAGERS.map((manager) => [
      manager,
      {
        code: installCommand(lib.pkg, manager),
        html: highlightCode(installCommand(lib.pkg, manager), "bash"),
      },
    ]),
  ) as Record<PackageManager, { code: string; html: string }>;

  const snippet2Html = highlightCode(lib.snippet2.code, lib.snippet2.lang);

  // Per-framework quick-start snippets, precomputed server-side. The picker at
  // the top shows only the selected framework's native API — no React snippet
  // unless the user actually picks React.
  const frameworkExamples = (lib.frameworks ?? []).map((f) => ({
    ...f,
    html: highlightCode(f.code, f.lang),
  }));

  // CSS adapters ship a stylesheet that maps their component variables to the
  // theme-kit semantic tokens — importing it once makes the library respond to
  // theme changes. Runtime-only adapters (Ant, Chakra, MUI, Mantine, UnoCSS)
  // don't need one.
  const cssImportCode = lib.css ? `import "${lib.css}";` : "";
  const cssImportHtml = lib.css ? highlightCode(cssImportCode, "ts") : "";

  const useCases = libraryUseCases[lib.slug] ?? [];
  const useCaseHtml = useCases.map((useCase) => ({
    html: highlightCode(useCase.code, useCase.lang),
    useCase,
  }));

  const content = (
    <article className="min-w-0 max-w-3xl">
          <PageHeader
            icon={lib.icon}
            title={lib.name}
            subtitle={lib.pkg}
            description={lib.tagline}
            badges={[
              { label: `${lib.mark} ${lib.name}` },
              ...lib.tags.map((tag) => ({ label: tag })),
            ]}
          />

          {frameworkExamples.length > 0 && (
            <LibraryFrameworkGuide
              examples={frameworkExamples}
              installCommands={commands}
              description="The adapter is framework-agnostic — it's a hook, composable, directive or custom element depending on your stack. Pick yours to see the native API."
            />
          )}

          {cssImportCode && (
            <section id="css" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-semibold tracking-tight">
                Include the CSS
              </h2>
              <p className="text-sm opacity-70 mt-1 mb-3">
                The adapter ships a stylesheet that maps its component variables
                (e.g. <code className="mono text-[0.9em]">--primary</code> for
                shadcn/ui, <code className="mono text-[0.9em]">--bs-primary</code>{" "}
                for Bootstrap) to the theme-kit <code className="mono text-[0.9em]">--theme-color-*</code>{" "}
                tokens. Import it once — anywhere — and the library&apos;s
                components will respond to every theme change automatically.
              </p>
              <CodeBlock
                html={cssImportHtml}
                code={cssImportCode}
                language="ts"
                filename="main.ts"
                className="rounded-lg m-0"
              />
            </section>
          )}

          <section id="whats-available" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              What's Available
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-4">
              <code className="mono text-[0.9em]">{lib.pkg}</code> ships{" "}
              {lib.featureCount} exports in {lib.groups.length} categories.
              Click any export to reveal what it does and how to use it.
            </p>
            <ApiExplorer groups={lib.groups} slug={lib.slug} />
          </section>

          {useCases.length > 0 && (
            <section id="use-cases" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-semibold tracking-tight">
                Use Cases
              </h2>
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
          )}

          <section id="more-examples" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              More Examples
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-3">
              {lib.kind === "CSS Variables"
                ? "Static variable maps for build-time CSS, and manual adapter lifecycle control."
                : lib.kind === "Generated Theme"
                  ? "Static themes generated from concrete tokens, and runtime subscriptions."
                  : "Static UnoCSS theme objects for build-time generation."}
            </p>
            <CodeBlock
              html={snippet2Html}
              code={lib.snippet2.code}
              language={lib.snippet2.lang}
              filename={lib.snippet2.title}
              className="rounded-lg m-0"
            />
          </section>

          <section id="api" className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              API Reference
            </h2>
            <div className="flex flex-col gap-8 mt-4">
              {lib.groups.map((group, groupIndex) => {
                const base = anchor(group.label);
                const count = lib.groups
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
  );
  // Collect headings from the page's own tree (before RSC serialization hides
  // subtrees that share a parent with client components from the layout walk).
  const libraryHeadings = collectPageHeadings(content);
  return <DocsLayout headings={libraryHeadings}>{content}</DocsLayout>;
}
