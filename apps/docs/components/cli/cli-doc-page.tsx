import { Markdown } from "../markdown";
import { DocsLayout } from "../docs-layout";
import { MarkdownDoc } from "../markdown-doc";
import { getCliContent } from "../../lib/cli-content";

/**
 * Shared page shell for every docs/cli route. Each route page supplies a slug
 * into `content/cli/*.md` plus its own Next metadata. The page header is
 * parsed from the markdown's leading title + intro paragraph, so CLI pages
 * get the same visual treatment as JSX-built docs pages.
 */
export function CliDocPage({ slug }: { slug: string }) {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <MarkdownDoc content={getCliContent(slug)} eyebrow="@theme-kit/cli" />
      </div>
    </DocsLayout>
  );
}
