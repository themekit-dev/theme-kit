import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { buildPageHeadings } from "../../lib/toc";
import { ScopedThemeGuide } from "./ScopedThemeGuide";

export const metadata: Metadata = {
  title: "Scoped Theme",
  description:
    "Apply a theme to a subtree — a sandboxed island inside the app. ThemeScope, the themeKitScope directive, and per-framework scope theming snippets.",
};

// Headings live inside the client ScopedThemeGuide (invisible to the layout's
// RSC walk), so provide them here for the TOC rail.
const scopedThemeHeadings = buildPageHeadings([
  { text: "ThemeScope — pick your framework", level: 2 },
  { text: "Imperative scoping", level: 2 },
  { text: "Local themes", level: 2 },
  { text: "Transitions", level: 2 },
  { text: "How a scope works", level: 2 },
  { text: "What's next", level: 2 },
]);

export default function ScopedThemePage() {
  return (
    <DocsLayout headings={scopedThemeHeadings}>
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
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          title="Scoped Theme"
          subtitle="@theme-kit/core · ThemeScope"
          description={
            <>
              Most theming is global. Scoped theming is not: it lets you apply a
              whole theme — palette, radius, typography — to a{" "}
              <em>subtree</em>, turning it into a sandboxed island that ignores
              the global theme. Great for embedded widgets, preview panes,
              marketing sections, and multi-brand surfaces inside one app.
            </>
          }
        />
        <ScopedThemeGuide />
      </div>
    </DocsLayout>
  );
}