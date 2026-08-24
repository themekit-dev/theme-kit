import Link from "next/link";
import { Markdown } from "../../components/markdown";
import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { getContent } from "../../lib/content";
import { packages } from "../../lib/packages";

export const metadata = {
  title: "Packages",
  description:
    "Explore every package in the Theme Kit monorepo — core, framework integrations, CLI and devtools.",
};

export default function PackagesPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Packages"
          title="Every package, deep-dived"
          description="Each package below has its own page with install tabs, copy-paste snippets and a full API reference table. Click through to explore."
        />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {packages.map((pkg) => (
          <Link
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            className="glass-card card-lift p-5 no-underline flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--theme-color-primary), color-mix(in srgb, var(--theme-color-primary) 40%, var(--theme-color-accent)))",
                  color:
                    "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                }}
              >
                <div className="scale-110">{pkg.icon}</div>
              </span>
              <div className="min-w-0">
                <div className="font-semibold">{pkg.name}</div>
                <div className="mono text-[11px] opacity-50 truncate">
                  {pkg.pkg}
                </div>
              </div>
            </div>
            <p className="m-0 text-sm opacity-70 leading-relaxed">
              {pkg.tagline}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-wrap gap-1.5">
                {pkg.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className="text-xs font-semibold shrink-0"
                style={{ color: "var(--theme-color-primary)" }}
              >
                Open →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold tracking-tight mb-3">
        Full package map
      </h2>
      <Markdown content={getContent("packages")} />
      </div>
    </DocsLayout>
  );
}
