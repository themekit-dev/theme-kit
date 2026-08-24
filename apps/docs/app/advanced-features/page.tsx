import type { Metadata } from "next";
import { Markdown } from "../../components/markdown";
import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { getContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Advanced Features",
  description:
    "Deep dives into Theme Kit's advanced capabilities — theme packs, snapshots, scheduling, adapters, scoping and multi-window sync.",
};

export default function AdvancedFeaturesPage() {
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
              <path d="m18 15-6-6-6 6" />
            </svg>
          }
          title="Advanced Features"
          subtitle="@theme-kit/core"
          description="Deep dives into live theme generation, validation, migration, token resolution, plugin authoring, runtime snapshots, and accessibility profiles."
        />
        <div className="prose-doc -mt-6">
          <Markdown content={getContent("advanced-features")} />
        </div>
      </div>
    </DocsLayout>
  );
}
