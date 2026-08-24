"use client";

import { useState } from "react";
import { CodeBlock } from "./code-block";
import { InstallCommand, type PackageManager } from "./install-command";
import { useScrollToOnChange } from "./ui/use-scroll-to-on-change";
import type { FrameworkExample } from "./framework-tabs";

/**
 * Renders the top of a library page: the framework picker, the installation
 * command, and the per-framework Quick Start snippet. Picking a framework
 * updates the Quick Start snippet to that framework's native API and scrolls
 * the reader to it.
 */
export function LibraryFrameworkGuide({
  examples,
  installCommands,
  description,
}: {
  examples: FrameworkExample[];
  installCommands: Record<PackageManager, { code: string; html: string }>;
  description: string;
}) {
  const [index, setIndex] = useState(0);
  const current = examples[Math.min(index, examples.length - 1)];

  // Scroll to Quick Start after the selection commits, so the reader lands on
  // the code for the framework they just picked.
  useScrollToOnChange("quick-start", index);

  if (!current) return null;

  return (
    <>
      <section id="install" className="scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">Installation</h2>
        <p className="text-sm opacity-70 mt-1 mb-3">
          Install the adapter alongside{" "}
          <code className="mono text-[0.9em]">@theme-kit/core</code> (or a
          framework integration that provides the runtime).
        </p>
        <InstallCommand commands={installCommands} />
      </section>

      <section id="pick-framework" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">
          Pick your framework
        </h2>
        <p className="text-sm opacity-70 mt-1 mb-3">{description}</p>
        <div className="flex flex-wrap gap-1.5" role="tablist">
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
      </section>

      <section id="quick-start" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">Quick Start</h2>
        <p className="text-sm opacity-70 mt-1 mb-3">
          The snippet below uses the framework you picked — switch the picker
          above to see that framework&apos;s native API.
        </p>
        <CodeBlock
          html={current.html}
          code={current.code}
          language={current.lang}
          filename={current.filename ?? current.label}
          className="rounded-lg m-0"
        />
      </section>
    </>
  );
}
