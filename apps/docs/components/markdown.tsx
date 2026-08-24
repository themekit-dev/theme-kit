import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components, ExtraProps } from "react-markdown";

import { highlightCode } from "../lib/highlight";
import { CodeBlock } from "./code-block";

function extractLanguage(className?: string): string | undefined {
  const match = /language-([\w-]+)/.exec(className ?? "");
  return match?.[1];
}

type CodeProps = ComponentProps<"code"> & ExtraProps;

function Code({ className, children, ...rest }: CodeProps) {
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
}

/** Parse the meta string on a fenced code block, e.g.
 * ` ```ts {1,3-5} title="themes.ts" ` → highlighted lines + filename. */
function parseMeta(meta?: string): {
  highlightLines: Set<number>;
  filename: string;
} {
  const highlightLines = new Set<number>();
  let filename = "";

  if (meta) {
    const linesMatch = /\{([\d,\s-]+)\}/.exec(meta);
    if (linesMatch?.[1]) {
      for (const part of linesMatch[1].split(",")) {
        const trimmed = part.trim();
        const range = /^(\d+)\s*-\s*(\d+)$/.exec(trimmed);
        if (range) {
          const start = Number(range[1]);
          const end = Number(range[2]);
          for (let i = start; i <= end; i++) highlightLines.add(i);
        } else if (/^\d+$/.test(trimmed)) {
          highlightLines.add(Number(trimmed));
        }
      }
    }

    const titleMatch = /(?:title\s*=\s*)?["']([^"']+)["']/.exec(meta);
    if (titleMatch?.[1]) filename = titleMatch[1];
  }

  return { highlightLines, filename };
}

const components: Components = {
  pre({ children }) {
    const child = Children.toArray(children)[0];

    if (isValidElement(child) && child.type === Code) {
      const { className, children: codeChildren, node } = child.props as CodeProps;
      const language = extractLanguage(className);
      const raw = String(codeChildren ?? "").replace(/\n$/, "");
      const meta = node?.data?.meta as string | undefined;
      const { highlightLines, filename } = parseMeta(meta);
      const html = highlightCode(raw, language, { highlightLines });

      return (
        <CodeBlock
          html={html}
          code={raw}
          language={language ?? "text"}
          {...(filename ? { filename } : {})}
        />
      );
    }

    return <pre>{children}</pre>;
  },
  code: Code,
};

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-doc">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
