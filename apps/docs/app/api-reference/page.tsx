import Link from "next/link";
import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { apiPackages, submoduleLabels } from "../../lib/api-reference";

export const metadata = {
  title: "API Reference",
  description:
    "Generated API reference for every Theme Kit package, produced from source with typedoc so it never drifts from the code.",
};

const packageBadges: Record<string, { label: string; core?: boolean }> = {
  core: { label: "CORE", core: true },
  react: { label: "REACT" },
  next: { label: "NEXT.JS" },
  vue: { label: "VUE" },
  svelte: { label: "SVELTE" },
  solid: { label: "SOLID" },
  angular: { label: "ANGULAR" },
  web: { label: "WEB" },
  tailwind: { label: "TAILWIND" },
  astro: { label: "ASTRO" },
  nuxt: { label: "NUXT" },
  remix: { label: "REMIX" },
  cli: { label: "CLI" },
  devtools: { label: "DEVTOOLS" },
};

export default function ApiReferenceIndexPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="API Reference"
          title="Generated from source"
          description={
            <>
              Every page below is generated straight from{" "}
              <code className="mono">packages/*/src</code> with typedoc.
              Signatures, parameters and types cannot drift from the code — run{" "}
              <code className="mono">pnpm --filter @theme-kit/docs api:generate</code>{" "}
              to regenerate after any change.
            </>
          }
        />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {apiPackages.map((pkg) => {
          const badge = packageBadges[pkg.slug];
          return (
            <Link
              key={pkg.slug}
              href={`/api-reference/${pkg.slug}`}
              className="glass-card card-lift p-5 no-underline flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-semibold mono">{pkg.name}</div>
                  {badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide shrink-0 ${
                        badge.core ? "" : "border border-border bg-muted/40"
                      }`}
                      style={
                        badge.core
                          ? {
                              background: "var(--theme-color-primary)",
                              color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
                            }
                          : undefined
                      }
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs font-semibold shrink-0"
                  style={{ color: "var(--theme-color-primary)" }}
                >
                  Open →
                </span>
              </div>
              <p className="m-0 text-sm opacity-70 leading-relaxed">
                {pkg.tagline}
              </p>
              {pkg.submodules && (
                <div className="flex flex-wrap gap-1.5">
                  {pkg.submodules.map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40"
                    >
                      {submoduleLabels[sub] ?? sub}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      </div>
    </DocsLayout>
  );
}
