import Link from "next/link";
import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { RelatedLinks } from "../../components/ui/related-links";
import { Badge, type BadgeTone } from "../../components/ui/badge";
import {
  LAYERS,
  PACKAGE_MAP,
  packagesInLayer,
  shortName,
  UNMAPPED_PACKAGES,
  type MappedPackage,
  type PackageLayer,
} from "../../lib/package-map";
import { PKG_VERSION } from "../../lib/version";
import { docsUrl, npmPackageUrl, sourceUrlForPackage } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/package-map") },
  title: "Package map",
  description:
    "How the Theme Kit package ecosystem fits together: what each package is responsible for, what it depends on, which packages use it, its import path and primary APIs.",
};

const ROLE_LABEL: Record<MappedPackage["role"], string> = {
  runtime: "Runtime",
  "build-time": "Build-time",
  both: "Runtime + build-time",
};

const ROLE_TONE: Record<MappedPackage["role"], BadgeTone> = {
  runtime: "accent",
  "build-time": "neutral",
  both: "success",
};

function pkgLabel(name: string): string {
  return shortName(name);
}

/** A small monospace pill linking to a package's section on this page. */
function PackagePill({ name }: { name: string }) {
  return (
    <Link
      href={`#${shortName(name)}`}
      className="mono text-[11px] px-2 py-0.5 rounded-md border border-border bg-muted/40 no-underline hover:border-ring hover:text-foreground"
    >
      {pkgLabel(name)}
    </Link>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] gap-1 sm:gap-4 py-2 border-t border-border/60 first:border-t-0">
      <dt className="text-[11px] font-semibold uppercase tracking-widest opacity-45 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm min-w-0">{children}</dd>
    </div>
  );
}

function PackageSection({ pkg }: { pkg: MappedPackage }) {
  const install = `npm i ${pkg.name}`;
  const imports = [pkg.name, ...pkg.subpaths.map((s) => `${pkg.name}${s.slice(1)}`)];

  return (
    <section id={shortName(pkg.name)} className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h3 className="text-lg font-semibold tracking-tight mono">{pkg.name}</h3>
        <Badge tone={ROLE_TONE[pkg.role]}>{ROLE_LABEL[pkg.role]}</Badge>
      </div>
      <p className="text-sm opacity-80 mb-4 max-w-2xl">{pkg.purpose}</p>

      <dl className="rounded-xl border border-border bg-card/40 px-4 py-1">
        <FieldRow label="Version">
          <span className="mono text-[13px]">v{pkg.version}</span>
        </FieldRow>

        <FieldRow label="Install">
          <code className="mono text-[12px]">{install}</code>
        </FieldRow>

        <FieldRow label="Import path">
          <div className="flex flex-wrap gap-1.5">
            {imports.map((i) => (
              <code key={i} className="mono text-[11px] px-1.5 py-0.5 rounded bg-muted/60">
                {i}
              </code>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Depends on">
          {pkg.internalDeps.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pkg.internalDeps.map((d) => (
                <PackagePill key={d} name={d} />
              ))}
            </div>
          ) : (
            <span className="opacity-60">
              Nothing — this is the only package with no Theme Kit dependency.
            </span>
          )}
        </FieldRow>

        <FieldRow label="Used by">
          {pkg.usedBy.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pkg.usedBy.map((d) => (
                <PackagePill key={d} name={d} />
              ))}
            </div>
          ) : (
            <span className="opacity-60">
              Nothing else in the monorepo depends on it — you install it directly.
            </span>
          )}
        </FieldRow>

        <FieldRow label="Works with">
          {pkg.externalPeers.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pkg.externalPeers.map((p) => (
                <code
                  key={p}
                  className="mono text-[11px] px-1.5 py-0.5 rounded bg-muted/60 opacity-80"
                >
                  {p}
                </code>
              ))}
            </div>
          ) : (
            <span className="opacity-60">No third-party peer dependencies.</span>
          )}
        </FieldRow>

        {pkg.primaryApis.length ? (
          <FieldRow label="Primary APIs">
            <div className="flex flex-wrap gap-1.5">
              {pkg.primaryApis.map((a) => (
                <code
                  key={a}
                  className="mono text-[11px] px-1.5 py-0.5 rounded border border-border bg-card"
                >
                  {a}
                </code>
              ))}
            </div>
          </FieldRow>
        ) : null}

        {pkg.useCases.length ? (
          <FieldRow label="Reach for it when">
            <ul className="list-disc pl-5 space-y-1 opacity-85">
              {pkg.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </FieldRow>
        ) : null}

        <FieldRow label="Source">
          <a
            href={sourceUrlForPackage(pkg.name)}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary hover:underline mono text-[12px]"
          >
            {pkg.repoDir} ↗
          </a>
        </FieldRow>
      </dl>

      {pkg.related.length ? (
        <p className="text-xs opacity-60 mt-3">
          Related:{" "}
          <span className="inline-flex flex-wrap gap-1.5 align-middle">
            {pkg.related.map((r) => (
              <PackagePill key={r} name={r} />
            ))}
          </span>
        </p>
      ) : null}
    </section>
  );
}

/** A vertical stack of package names, used by the relationship diagrams. */
function DiagramColumn({
  label,
  names,
  tone = "neutral",
}: {
  label: string;
  names: string[];
  tone?: "primary" | "neutral";
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-widest opacity-45 mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {names.map((n) => (
          <Link
            key={n}
            href={`#${shortName(n)}`}
            className={`mono text-[11px] px-2 py-1 rounded-md border no-underline ${
              tone === "primary"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-muted/40 hover:border-ring"
            }`}
          >
            {pkgLabel(n)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1 text-[11px] uppercase tracking-widest opacity-40">
      <span className="text-base leading-none">↓</span>
      <span>{label}</span>
    </div>
  );
}

export default function PackageMapPage() {
  const frameworks = packagesInLayer("frameworks");
  const ui = packagesInLayer("ui");

  return (
    <DocsLayout>
      <div className="max-w-4xl">
        <PageHeader
          eyebrow="Reference"
          title="Package map"
          description="How the Theme Kit packages fit together: what each one is responsible for, what it depends on, who uses it, and what you import. For “which package do I install?”, start with Choose package instead."
          verified={{ version: PKG_VERSION, date: "September 18, 2026" }}
        />

        <Callout variant="info" title="Generated from the manifests">
          Every dependency, used-by, peer-dependency and import-path claim on this
          page is read from the packages&apos; own <code>package.json</code> files
          by <code>scripts/generate-package-graph.mjs</code>, and every API name is
          checked against the built package by{" "}
          <code>scripts/verify-package-apis.mjs</code>. Neither can drift
          silently.
        </Callout>

        {/* ---------- the shape of the ecosystem ---------- */}
        <SectionHeading num={1} id="ecosystem">
          The shape of the ecosystem
        </SectionHeading>
        <p className="text-sm opacity-80 mb-6 max-w-2xl">
          One engine, four layers. Everything above the core is a binding: it
          translates the core&apos;s model into a particular framework&apos;s or
          library&apos;s idiom, and adds no theming rules of its own. That is why
          behavior is identical whether you use React, Vue or no framework at all.
        </p>

        <div className="rounded-xl border border-border bg-card/40 p-5 mb-10">
          <DiagramColumn
            label="Core — the engine"
            names={["@theme-kit/core"]}
            tone="primary"
          />
          <Arrow label="bindings over the engine" />
          <div className="flex flex-col sm:flex-row gap-6">
            <DiagramColumn
              label={`Framework integrations (${frameworks.length})`}
              names={frameworks.map((p) => p.name)}
            />
            <DiagramColumn
              label={`UI library adapters (${ui.length})`}
              names={ui.map((p) => p.name)}
            />
          </div>
          <Arrow label="tooling runs alongside, not inside" />
          <DiagramColumn
            label="Tooling & build-time"
            names={packagesInLayer("tooling").map((p) => p.name)}
          />
        </div>

        {/* ---------- request flow ---------- */}
        <SectionHeading num={2} id="flow">
          How a theme reaches your UI
        </SectionHeading>
        <p className="text-sm opacity-80 mb-6 max-w-2xl">
          The same path every time. The framework integration decides <em>when</em>{" "}
          each step runs — at build time, on the server, or in the browser — which
          is the entire reason those packages exist.
        </p>

        <div className="rounded-xl border border-border bg-card/40 p-5 mb-10 text-sm">
          <ol className="space-y-4">
            {[
              {
                title: "Theme definition",
                body: "defineTheme(...) — your tokens, or one of the built-in families from getBuiltInThemes().",
              },
              {
                title: "Theme engine",
                body: "The core runtime resolves the definition (following extends chains), stores the selection, and turns tokens into --theme-* CSS variables.",
              },
              {
                title: "Framework integration",
                body: "The adapter you installed wraps that runtime in its framework's idiom and handles SSR: resolving on the server, emitting a pre-paint script, and hydrating without a mismatch.",
              },
              {
                title: "Your UI",
                body: "Components read the variables (or Tailwind utilities, or a UI library's own theme object) and repaint instantly when the selection changes.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="mono text-[11px] w-5 shrink-0 opacity-40 pt-1">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <p className="opacity-75 mt-0.5">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- full reference ---------- */}
        <SectionHeading num={3} id="reference">
          Every package
        </SectionHeading>
        <p className="text-sm opacity-80 mb-8 max-w-2xl">
          All {PACKAGE_MAP.length} published packages, grouped by layer. Each entry
          lists what it depends on, what depends on it, what to install, what to
          import, and the APIs you will actually reach for.
        </p>

        {UNMAPPED_PACKAGES.length > 0 ? (
          <Callout variant="warning" title="Incomplete entries">
            These packages are in the monorepo but have no editorial entry yet, so
            their purpose falls back to the manifest description:{" "}
            {UNMAPPED_PACKAGES.join(", ")}.
          </Callout>
        ) : null}

        <div className="space-y-14">
          {LAYERS.map((layer, layerIndex) => {
            const pkgs = packagesInLayer(layer.id as PackageLayer);
            if (pkgs.length === 0) return null;
            return (
              <div key={layer.id} id={`layer-${layer.id}`} className="scroll-mt-24">
                <div className="flex items-baseline gap-3 mb-1">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {layerIndex + 4}. {layer.label}
                  </h2>
                  <span className="mono text-[11px] opacity-40">
                    {pkgs.length} package{pkgs.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-sm opacity-70 mb-6 max-w-2xl">{layer.blurb}</p>
                <div className="space-y-10">
                  {pkgs.map((p) => (
                    <PackageSection key={p.name} pkg={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- you probably need ---------- */}
        <SectionHeading num={4} id="you-probably-need">
          You probably need…
        </SectionHeading>
        <p className="text-sm opacity-80 mb-6 max-w-2xl">
          This page explains how the ecosystem fits together. To decide what to
          install for a specific project, use{" "}
          <Link href="/choose-package" className="text-primary hover:underline">
            Which package?
          </Link>
          .
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mb-10">
          {[
            {
              need: "A React app on Vite or React Router",
              install: "@theme-kit/core + @theme-kit/react",
              href: "/framework-guides/react",
            },
            {
              need: "A Next.js App Router app with no flash",
              install: "@theme-kit/core + @theme-kit/next",
              href: "/framework-guides/next",
            },
            {
              need: "Tailwind v4 utilities driven by tokens",
              install: "@theme-kit/core + @theme-kit/tailwind",
              href: "/framework-guides/tailwind",
            },
            {
              need: "shadcn/ui components that follow your theme",
              install: "@theme-kit/core + @theme-kit/shadcn (+ tailwind)",
              href: "/libraries/shadcn",
            },
            {
              need: "No framework at all",
              install: "@theme-kit/core (+ @theme-kit/web for DOM bindings)",
              href: "/vanilla",
            },
            {
              need: "Themes generated and validated in CI",
              install: "@theme-kit/cli",
              href: "/cli",
            },
          ].map((row) => (
            <Link
              key={row.need}
              href={row.href}
              className="glass-card card-lift p-4 no-underline flex flex-col gap-1.5"
            >
              <span className="text-sm font-medium">{row.need}</span>
              <code className="mono text-[11px] opacity-70">{row.install}</code>
              <span className="text-[11px] text-primary mt-1">Read the guide →</span>
            </Link>
          ))}
        </div>

        <Callout variant="neutral" title="Installing from npm">
          Every package is published under the{" "}
          <a
            href={npmPackageUrl("@theme-kit/core").replace("/package/@theme-kit/core", "/org/theme-kit")}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary hover:underline"
          >
            @theme-kit scope ↗
          </a>
          . Framework integrations and UI adapters declare the framework as a peer
          dependency, so you install the framework yourself and npm will not pull a
          second copy.
        </Callout>

        <RelatedLinks
          links={[
            {
              title: "Which package?",
              href: "/choose-package",
              description: "Decide what to install for your project.",
            },
            {
              title: "Packages",
              href: "/packages",
              description: "Per-package deep dives with install tabs and snippets.",
            },
            {
              title: "API reference",
              href: "/api-reference",
              description: "Generated API docs for every package.",
            },
            {
              title: "Architecture",
              href: "/architecture",
              description: "How the runtime is put together internally.",
            },
            {
              title: "Framework guides",
              href: "/framework-guides",
              description: "Step-by-step setup for each framework.",
            },
            {
              title: "Library adapters",
              href: "/libraries",
              description: "Bridge tokens into a component library.",
            },
          ]}
        />
      </div>
    </DocsLayout>
  );
}
