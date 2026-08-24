import type { ReactNode } from "react";
import { Markdown } from "./markdown";
import { PageHeader } from "./ui/page-header";

/** Strip inline markdown emphasis/links so a paragraph can head the page. */
function toPlainText(md: string): string {
  return md
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)]\(.*?\)/g, "$1")
    .trim();
}

type LeadingHeader = {
  title: string;
  rest: string;
  description?: string;
};

/**
 * Splits a leading `# Title` / `## Title` plus its immediately-following
 * intro paragraph off a markdown document, so they can be rendered as a
 * structured page header instead of a bare prose heading.
 */
function splitLeadingHeader(content: string): LeadingHeader | undefined {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length && (lines[i]?.trim() ?? "") === "") i++;
  const headingLine = lines[i];
  const heading = headingLine?.match(/^#{1,2}\s+(.*)$/);
  if (!headingLine || !heading) return undefined;

  const title = heading[1]?.trim() ?? "";
  i++;
  while (i < lines.length && (lines[i]?.trim() ?? "") === "") i++;

  // Drop generated-file provenance notes — build metadata, not reader content.
  if (lines[i]?.startsWith("> Generated from")) {
    i++;
    while (i < lines.length && (lines[i]?.trim() ?? "") === "") i++;
  }

  const paragraph: string[] = [];
  while (
    i < lines.length &&
    (lines[i]?.trim() ?? "") !== "" &&
    !lines[i]?.startsWith("#")
  ) {
    paragraph.push(lines[i]!.trim());
    i++;
  }

  const rest = lines.slice(i).join("\n").replace(/^\s+/, "");
  if (paragraph.length > 0) {
    return {
      title,
      description: toPlainText(paragraph.join(" ")),
      rest,
    };
  }
  return { title, rest };
}

/**
 * Markdown page with the shared PageHeader treatment. By default the title
 * and description are parsed from a leading heading and its intro paragraph;
 * explicit props win over parsed ones.
 */
export function MarkdownDoc({
  content,
  title,
  subtitle,
  description,
  eyebrow,
  icon,
}: {
  content: string;
  title?: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
}) {
  const parsed = splitLeadingHeader(content);
  const headerTitle = title ?? parsed?.title ?? "";

  return (
    <>
      <PageHeader
        {...(icon ? { icon } : {})}
        {...(eyebrow ? { eyebrow } : {})}
        {...(subtitle ? { subtitle } : {})}
        {...(description ? { description } : {})}
        title={headerTitle}
      />
      <div className="prose-doc -mt-6">
        <Markdown content={parsed ? parsed.rest : content} />
      </div>
    </>
  );
}
