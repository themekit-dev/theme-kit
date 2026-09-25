import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { CustomThemesGuide } from "./CustomThemesGuide";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/custom-themes") },
  title: "Custom Themes",
  description:
    "Define your own themes with semantic tokens, extend and compose them, register with any framework runtime, and generate themes from a single seed color.",
};

export default function CustomThemesPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          }
          title="Custom Themes"
          subtitle="@theme-kit/core"
description={
              <>
                Theme Kit ships with neutral, preset, brand and accessibility
                themes — but the real power is defining your own. Every theme is a
                plain object of{" "}
                <em className="mono text-[0.9em]">semantic tokens</em> plus{" "}
                <em className="mono text-[0.9em]">metadata</em>.
              </>
            }
        />
        <CustomThemesGuide />
      </div>
    </DocsLayout>
  );
}