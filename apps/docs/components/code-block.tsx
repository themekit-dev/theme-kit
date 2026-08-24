"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { CopyButton } from "./ui/copy-button";

const COLLAPSE_THRESHOLD = 25;
const COLLAPSED_MAX_HEIGHT = 280;

export function CodeBlock({
  html,
  code,
  language,
  filename,
  className,
  bordered = true,
  showLineNumbers,
  collapsible = true,
}: {
  html: string;
  code: string;
  language: string;
  filename?: string;
  className?: string;
  bordered?: boolean;
  showLineNumbers?: boolean;
  collapsible?: boolean;
}) {
  const codeLines = code.split("\n");
  const lineCount = codeLines[codeLines.length - 1] === "" ? codeLines.length - 1 : codeLines.length;
  const canCollapse = collapsible && lineCount > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hiddenCount, setHiddenCount] = useState(lineCount - COLLAPSE_THRESHOLD);

  useLayoutEffect(() => {
    if (!canCollapse || expanded) return;
    const el = contentRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h === 0) return;
    const firstLine = el.querySelector<HTMLElement>(".line");
    if (!firstLine) return;
    const lh = firstLine.getBoundingClientRect().height;
    if (lh <= 0) return;
    const visible = Math.max(1, Math.floor(h / lh));
    setHiddenCount(Math.max(0, lineCount - visible));
  }, [canCollapse, expanded, lineCount]);

  return (
    <div
      className={`code-block group relative ${!bordered ? "code-block-unbordered" : ""} ${className ?? ""}`}
      data-collapsed={canCollapse && !expanded ? "" : undefined}
    >
      <div
        className="code-block-toolbar"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="code-block-filename" title={filename ?? language}>
          {filename ?? language}
        </span>
        <div className="flex items-center gap-1.5">
          {filename ? (
            <span className="code-block-lang">{language}</span>
          ) : null}
          <CopyButton
            text={code}
            label="Copy"
            copiedLabel="Copied"
            className="code-block-copy"
          />
        </div>
      </div>
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: html }}
        data-line-numbers={
          showLineNumbers === undefined
            ? undefined
            : showLineNumbers
              ? "true"
              : "false"
        }
        className={canCollapse && !expanded ? "code-block-collapsed" : undefined}
      />
      {canCollapse ? (
        <button
          type="button"
          className="code-block-expand"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded
            ? "Show less"
            : `Show ${hiddenCount} more lines`}
        </button>
      ) : null}
    </div>
  );
}
