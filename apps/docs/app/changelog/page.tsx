import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { VersionBadge } from "../../components/ui/version-badge";
import {
  releases,
  proposed,
  kindLabel,
  CURRENT_RELEASE,
  LAST_UPDATED,
  type ChangeKind,
} from "../../lib/changelog";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/changelog") },
  title: "Changelog",
  description:
    "Theme Kit release history: what changed in each version, which packages were affected, whether a release is breaking, and how to upgrade.",
};

const kindTone: Record<ChangeKind, string> = {
  major: "bg-red-500/10 text-red-600 dark:text-red-400",
  minor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  patch: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export default function ChangelogPage() {
  const latest = releases[0];
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Reference"
          icon="📜"
          title="Changelog"
          subtitle={`Current release v${CURRENT_RELEASE} · Updated ${LAST_UPDATED}`}
          description="Every Theme Kit release, what it changed, which packages it touched, and whether upgrading can affect your app. Proposed work is listed separately so it is never mistaken for shipped behavior."
        />

        <section id="upgrade-policy" className="scroll-mt-24 mb-10">
          <SectionHeading num={1} desc="How to read this page and what a version bump means for your app.">
            Upgrade policy
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            {(["major", "minor", "patch"] as const).map((kind) => (
              <div
                key={kind}
                className="rounded-xl border border-border p-4"
              >
                <span
                  className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md mb-2 ${kindTone[kind]}`}
                >
                  {kindLabel[kind]}
                </span>
                <p className="text-xs opacity-70 leading-relaxed">
                  {kind === "major" &&
                    "Can break your build or runtime. Read the breaking-changes table and migration note before upgrading."}
                  {kind === "minor" &&
                    "Adds features and fixes. Backward compatible — upgrade freely."}
                  {kind === "patch" &&
                    "Bug fixes only. Backward compatible — safe to adopt immediately."}
                </p>
              </div>
            ))}
          </div>
          <Callout title="All packages release together">
            <p className="text-sm leading-relaxed">
              Theme Kit ships one version number across every package. When you
              upgrade, move <em>all</em> installed <code className="mono text-[0.9em]">@theme-kit/*</code>{" "}
              packages to the same version — mismatched versions cause module
              resolution failures because the packages share internal modules.
            </p>
          </Callout>
        </section>

        <section id="current-release" className="scroll-mt-24 mb-10">
          <SectionHeading num={2} desc="The version installed by the docs site right now.">
            Current release
          </SectionHeading>
          <div className="rounded-xl border border-border bg-card p-5 flex flex-wrap items-center gap-3">
            <VersionBadge version={CURRENT_RELEASE} label="Latest" />
            <span className="text-sm opacity-70">Released {latest?.date}</span>
            <Link
              href="#upgrade-policy"
              className="ml-auto text-sm text-primary hover:underline no-underline"
            >
              Upgrade policy →
            </Link>
          </div>
          <ul className="mt-4 text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              Upgrading from 1.x? Every release since 1.0.0 is backward
              compatible — see the table below.
            </li>
            <li>
              Migrating an older theme definition to the current token schema?
              Use the <Link href="/migration" className="text-primary hover:underline">migration engine</Link>.
            </li>
            <li>
              Installing fresh? Start at <Link href="/quick-start" className="text-primary hover:underline">Quick Start</Link>.
            </li>
          </ul>
        </section>

        {releases.map((release, index) => (
          <section
            key={release.version}
            id={release.version}
            className="scroll-mt-24 mb-10"
          >
            <SectionHeading
              num={index + 3}
              desc={`${release.kind === "major" ? "Major" : release.kind === "minor" ? "Minor" : "Patch"} release · ${release.date}`}
            >
              <span className="flex flex-wrap items-center gap-2">
                {release.version}
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${kindTone[release.kind]}`}
                >
                  {kindLabel[release.kind]}
                </span>
                {release.breaking ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Breaking
                  </span>
                ) : null}
              </span>
            </SectionHeading>

            <p className="text-sm opacity-80 leading-relaxed mb-3">
              {release.summary}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <span className="text-xs opacity-50 mr-1">Packages</span>
              {release.packages.map((pkg) => (
                <code
                  key={pkg}
                  className="mono text-[10px] px-2 py-0.5 rounded bg-muted/60"
                >
                  {pkg}
                </code>
              ))}
            </div>

            <div className="rounded-xl border border-border overflow-hidden mb-4">
              <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
                What changed
              </div>
              <ul className="p-4 text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-2">
                {release.changes.map((change, i) => (
                  <li key={i}>
                    <span className="font-semibold not-italic">{change.area}:</span>{" "}
                    {change.text}
                  </li>
                ))}
              </ul>
            </div>

            {release.migrationNote ? (
              <Callout variant={release.breaking ? "warning" : "info"} title="Upgrading">
                <p className="text-sm leading-relaxed">{release.migrationNote}</p>
              </Callout>
            ) : null}
          </section>
        ))}

        <section id="proposed" className="scroll-mt-24">
          <SectionHeading
            num={releases.length + 3}
            desc="Changesets in the repository that have not been folded into a release yet. Do not rely on these as shipped behavior."
          >
            Proposed
          </SectionHeading>
          <Callout variant="important" className="mb-4">
            <p className="text-sm leading-relaxed">
              These changes are accepted into the repository but{" "}
              <strong>not yet released</strong>. They land in the next version.
              Nothing here is a current API guarantee.
            </p>
          </Callout>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Pending changesets
            </div>
            <ul className="divide-y divide-border">
              {proposed.map((item, i) => (
                <li
                  key={i}
                  className="px-4 py-3 flex flex-wrap items-start gap-2 text-sm"
                >
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${kindTone[item.kind]}`}
                  >
                    {kindLabel[item.kind]}
                  </span>
                  <code className="mono text-[10px] px-1.5 py-0.5 rounded bg-muted/60 shrink-0 mt-0.5">
                    {item.package}
                  </code>
                  <span className="opacity-80 leading-relaxed min-w-0">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
