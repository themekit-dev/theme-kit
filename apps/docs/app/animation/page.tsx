import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { buildPageHeadings } from "../../lib/toc";
import { AnimationGuide } from "./AnimationGuide";

export const metadata: Metadata = {
  title: "Animation & Transition",
  description:
    "How Theme Kit animates theme changes: the diff → plan → scan → coordinate pipeline, transition presets (smooth / subtle / instant), the View Transitions cross-fade, and every transition option.",
};

// Headings live inside the client AnimationGuide (invisible to the layout's
// RSC walk), so provide them here for the TOC rail.
const animationHeadings = buildPageHeadings([
  { text: "Enable it", level: 2 },
  { text: "Same prop on every framework", level: 3 },
  { text: "Enable transitions in your framework", level: 2 },
  { text: "View Transitions API", level: 2 },
  { text: "Things to avoid", level: 2 },
  { text: "API Reference", level: 2 },
]);

export default function AnimationPage() {
  return (
    <DocsLayout headings={animationHeadings}>
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
        <AnimationGuide />
      </div>
    </DocsLayout>
  );
}
