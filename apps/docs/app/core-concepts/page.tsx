import type { Metadata } from "next";
import { Markdown } from "../../components/markdown";
import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { getContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Core Concepts",
  description:
    "The ideas behind Theme Kit: semantic tokens, theme families, modes, the runtime, adapters, scoped themes and zero-flash SSR.",
};

export default function CoreConceptsPage() {
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
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          }
          title="Core Concepts"
          subtitle="@theme-kit/core"
          description="The mental model behind Theme Kit: semantic tokens, theme families, modes, the runtime, adapters, scoped themes and zero-flash SSR."
        />
        <div className="prose-doc -mt-6">
          <Markdown content={getContent("core-concepts")} />
        </div>
      </div>
    </DocsLayout>
  );
}
