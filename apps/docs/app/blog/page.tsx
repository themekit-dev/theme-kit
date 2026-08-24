import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { BlogExplorer } from "../../components/blog-explorer";
import { getPosts } from "../../lib/blog";

export const metadata = {
  title: "Blog",
  description:
    "Theme Kit blog — release notes, deep dives on theming architecture, multi-window sync, scheduling and accessibility.",
};

export default function BlogIndexPage() {
  const posts = getPosts();
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          }
          eyebrow="Blog"
          title="Notes from the theming front line"
          description="Release notes, architecture deep dives and guides — all written while building Theme Kit, and all dogfooding it. Search, or filter by tag."
          badges={[{ label: `${posts.length} post${posts.length === 1 ? "" : "s"}` }]}
        />

        <BlogExplorer posts={posts} />
      </div>
    </DocsLayout>
  );
}
