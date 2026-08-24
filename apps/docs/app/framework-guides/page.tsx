import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { Callout } from "../../components/ui/callout";
import { frameworks } from "../../lib/frameworks";

export const metadata: Metadata = {
  title: "Framework Guides",
  description:
    "First-class integrations for React, Next.js, Vue, Svelte, Solid, Angular, Web Components, Tailwind, Astro, Nuxt and Remix — every feature of every framework.",
};

export default function FrameworkGuidesPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Frameworks"
          title="Framework Guides"
          description={
            <>
              Each integration re-exports the full{" "}
              <code className="mono text-[0.9em]">@theme-kit/core</code> surface
              and adds framework-native providers, hooks, stores, signals, or
              directives. Pick a framework to see its complete feature set, API
              reference, and copy-paste examples.
            </>
          }
        />

        <Callout className="mb-10">
          <strong>Every example is real</strong> — the snippets below are
          executed against the actual{" "}
          <code className="mono text-[0.9em]">@theme-kit/*</code> packages, and
          reference copies ship alongside each package in{" "}
          <code className="mono text-[0.9em]">packages/</code>.
        </Callout>

        <div className="grid gap-3 sm:grid-cols-2">
          {frameworks.map((framework) => (
            <Link
              key={framework.slug}
              href={`/framework-guides/${framework.slug}`}
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
                    {framework.icon}
                  </span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold">{framework.name}</span>
                  <span className="block text-xs opacity-50 mono truncate">
                    {framework.pkg}
                  </span>
                </span>
                <span className="text-xs opacity-50 shrink-0 whitespace-nowrap">
                  {framework.featureCount} feature
                  {framework.featureCount === 1 ? "" : "s"}
                </span>
              </span>
              <span className="flex flex-wrap gap-1.5">
                {framework.tags.map((tag) => (
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
    </DocsLayout>
  );
}
