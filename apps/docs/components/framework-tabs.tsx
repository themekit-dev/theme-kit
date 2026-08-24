"use client";

import { useState } from "react";
import { CodeBlock } from "./code-block";
import { useScrollToOnChange } from "./ui/use-scroll-to-on-change";

export type FrameworkExample = {
  label: string;
  lang: string;
  code: string;
  filename?: string;
  /** Precomputed server-side Shiki output for `code`. */
  html: string;
};

export function FrameworkTabs({
  examples,
  scrollToId,
}: {
  examples: FrameworkExample[];
  /** When set, selecting a tab scrolls to this section id after the render. */
  scrollToId?: string;
}) {
  const [index, setIndex] = useState(0);
  const current = examples[Math.min(index, examples.length - 1)];

  // Scroll to the section after the tab change commits, so the target's
  // position is measured with the new snippet laid out.
  useScrollToOnChange(scrollToId, index);

  if (!current) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3" role="tablist">
        {examples.map((example, i) => (
          <button
            key={example.label}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={`chip ${i === index ? "chip-active" : ""}`}
          >
            {example.label}
          </button>
        ))}
      </div>
      <CodeBlock
        html={current.html}
        code={current.code}
        language={current.lang}
        filename={current.filename ?? current.label}
        className="rounded-lg m-0"
      />
    </div>
  );
}