import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { Callout } from "../../components/ui/callout";
import { libraries } from "../../lib/libraries";
import { collectPageHeadings } from "../../lib/toc-tree";

export const metadata: Metadata = {
  title: "Libraries",
  description:
    "Adapters for the UI libraries you already use: shadcn/ui, Bootstrap, daisyUI, Open Props, Material UI, Chakra UI, Ant Design, Mantine, and UnoCSS.",
};

export default function LibrariesPage() {
  const cssVars = libraries.filter((l) => l.kind === "CSS Variables");
  const generated = libraries.filter((l) => l.kind === "Generated Theme");
  const buildTime = libraries.filter((l) => l.kind === "Build Time");

  const groups = [
    { label: "CSS Variable Adapters", libs: cssVars },
    { label: "Generated Theme Adapters", libs: generated },
    { label: "Build-Time Integrations", libs: buildTime },
  ];

  const content = (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Adapters"
          title="Libraries"
          description="Adapters bridge Theme Kit semantic tokens to the libraries you already use. CSS-variable adapters inject live variables; generated adapters rebuild a library theme on every theme change; build-time integrations expose tokens as utilities."
        />

        <Callout className="mb-10">
          <span className="block">
            Every snippet is real — it is executed against the actual{" "}
            <code className="mono text-[0.9em]">@theme-kit/*</code> packages,
            and reference copies ship alongside each package in{" "}
            <code className="mono text-[0.9em]">packages/</code>.
          </span>
          <span className="block mt-2">
            New to the adapter system? Start with the{" "}
            <Link
              href="/adapters"
              className="text-primary no-underline font-medium hover:underline"
            >
              Adapters guide
            </Link>{" "}
            — strategies, plugins, the registry and how to use them in every
            framework. Each library page below has an "Every Framework" tab to
            jump straight to your stack.
          </span>
        </Callout>

        {groups.map((group) => {
          if (!group.libs.length) return null;
          return (
            <div key={group.label} className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50 mb-3">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.libs.map((lib) => (
                  <Link
                    key={lib.slug}
                    href={`/libraries/${lib.slug}`}
                    className="glass-card card-lift p-4 flex items-start gap-3 no-underline flex-col group"
                  >
                    <span className="flex items-center gap-3 w-full">
                      <span
                        className="w-10 h-10 shrink-0 rounded-lg grid place-items-center font-bold text-sm select-none"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--theme-color-primary), color-mix(in srgb, var(--theme-color-primary) 40%, var(--theme-color-accent)))",
                          color:
                            "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                        }}
                      >
                        <span className="grayscale group-hover:grayscale-0 transition-all duration-100">
                          {lib.icon}
                        </span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold">{lib.name}</span>
                        <span className="block text-xs opacity-50 mono truncate">
                          {lib.pkg}
                        </span>
                      </span>
                      <span className="text-xs opacity-50 shrink-0 whitespace-nowrap">
                        {lib.featureCount} export
                        {lib.featureCount === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {lib.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-card/60 text-foreground/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
  );
  // Collect headings from the page's own tree (before RSC serialization hides
  // subtrees that share a parent with client components from the layout walk).
  const librariesHeadings = collectPageHeadings(content);
  return <DocsLayout headings={librariesHeadings}>{content}</DocsLayout>;
}
