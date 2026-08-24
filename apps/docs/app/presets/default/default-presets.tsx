"use client";

import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { highlightCode } from "../../../lib/highlight";
import { DocsLayout } from "../../../components/docs-layout";
import {
  PRESET_KIND_META,
  DEFAULT_PRESET_SNIPPET,
  PresetCard,
  PresetsHeader,
  CurrentThemeInspector,
  usePresetGroups,
} from "../../../components/presets";
import { buildPageHeadings } from "../../../lib/toc";

// One heading renders inside PresetsHeader and one is a direct h2 here —
// neither is visible to the layout's RSC tree walk (client components + the
// template serialization), so provide them for the TOC rail.
const defaultPresetsHeadings = buildPageHeadings([
  { text: "Applied now on this site", level: 2 },
  { text: "Use them in code", level: 2 },
]);

export function DefaultPresetsView() {
  const groups = usePresetGroups("default");

  return (
    <DocsLayout headings={defaultPresetsHeadings}>
      <div className="max-w-3xl">
        <PresetsHeader kind="default" />

        <CurrentThemeInspector />

        <p className="text-sm opacity-70 mb-4 leading-relaxed">
          {PRESET_KIND_META.default.hint}
        </p>

        {groups.length === 0 ? (
          <p className="text-sm opacity-50">No themes in this group.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <PresetCard key={`probe-${group.key}`} group={group} />
            ))}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            Use them in code
          </h2>
          <p className="text-sm opacity-70 mb-4">
            All presets come from{" "}
            <code className="mono text-[0.9em]">@theme-kit/core</code>. Grab
            what you need — no styling required.
          </p>
          <CodeBlock
            html={highlightCode(DEFAULT_PRESET_SNIPPET, "ts")}
            code={DEFAULT_PRESET_SNIPPET}
            language="ts"
            className="rounded-lg m-0"
          />
          <Link
            href="/custom-themes#presets"
            className="inline-flex items-center gap-1.5 text-sm text-primary no-underline font-medium mt-4 hover:underline"
          >
            Learn how to define your own themes →
          </Link>
        </section>
      </div>
    </DocsLayout>
  );
}
