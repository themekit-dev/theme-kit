import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { Prerequisites } from "../../components/ui/prerequisites";
import { RelatedLinks } from "../../components/ui/related-links";
import { AnimationGuide } from "./AnimationGuide";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/animation") },
  title: "Animation & Transition",
  description:
    "How Theme Kit animates theme changes: the diff → plan → scan → coordinate pipeline, transition presets (smooth / subtle / instant), the View Transitions cross-fade, and every transition option.",
};

export default function AnimationPage() {
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
              <path d="M12 2v4m0 12v4M4.9 4.9l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.9 19.1l2.83-2.83m8.48-8.48 2.83-2.83" />
            </svg>
          }
          title="Animation &amp; Transition"
          subtitle="@theme-kit/core — transition pipeline"
          description={
            <>
              Theme Kit owns the entire visual update for a theme change — diff
              what actually changed, plan which properties may animate, and run
              one coordinated, lag-free transition. Enable it with a one-line{" "}
              <code className="mono text-[0.9em]">transition</code> prop and
              pick a <code className="mono text-[0.9em]">preset</code>; nothing
              else is required.
            </>
          }
        />

        <Prerequisites
          items={[
            {
              label: "Core Package",
              value: "@theme-kit/core",
              href: "/packages/core",
            },
            {
              label: "Provider Setup",
              value: "Framework provider configured with themes",
              href: "/quick-start",
            },
            {
              label: "Knowledge",
              value: "CSS transitions and interpolable properties",
            },
          ]}
          className="mb-8"
        />

        <AnimationGuide />

        <RelatedLinks
          links={[
            {
              title: "Zero Flash SSR",
              href: "/zero-flash",
              description: "Flash-free theme loading",
            },
            {
              title: "View Transitions",
              href: "/known-limitations#view-transitions",
              description: "Browser-native cross-fade API",
            },
            {
              title: "Custom Scrollbar",
              href: "/custom-scrollbar",
              description: "Animated scrollbar theming",
            },
            {
              title: "Core API Reference",
              href: "/api-reference/core",
              description: "Transition configuration options",
            },
          ]}
        />
      </div>
    </DocsLayout>
  );
}
