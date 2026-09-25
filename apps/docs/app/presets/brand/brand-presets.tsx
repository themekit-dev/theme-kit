"use client";

import Link from "next/link";
import { DocsLayout } from "../../../components/docs-layout";
import {
  PresetsHeader,
  usePresetGroups,
} from "../../../components/presets";
import { PresetComparison } from "../../../components/preset-preview";

export function BrandPresetsView() {
  const groups = usePresetGroups("brand");
  // The default preset's neutral family is the "Changes from Default"
  // baseline — same token vocabulary, so the diff is meaningful.
  const defaultGroups = usePresetGroups("default");
  const baseline =
    defaultGroups.find((g) => g.key === "neutral") ?? defaultGroups[0];

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PresetsHeader kind="brand" />

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            What &ldquo;Brand&rdquo; means
          </h2>
          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            Brand presets are <strong>real-world palettes</strong> — Apple,
            GitHub, Vercel, Slack, and Discord — each shipped as a complete
            light/dark family with the same semantic token vocabulary as the
            default preset. They are read-only starting points: apply one, then
            override individual tokens in your own theme.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            Compare against Default
          </h2>
          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            The same interface as the default preset, under a brand palette.
            &ldquo;Show changes from Default&rdquo; isolates exactly which
            tokens differ. This changes only the preview, not the documentation
            site. The snippet below the preview follows your selection.
          </p>
          <PresetComparison
            groups={groups}
            kind="brand"
            {...(baseline ? { baseline } : {})}
          />
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            Use it in your app
          </h2>
          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            Brand presets ship inside{" "}
            <code className="mono text-[0.9em]">@theme-kit/core</code> via{" "}
            <code className="mono text-[0.9em]">getBrandPresets()</code> — one
            light/dark family per brand. Pick your framework in the preview
            above and copy the snippet for the brand you were looking at.
          </p>
          <Link
            href="/custom-themes#presets"
            className="inline-flex items-center gap-1.5 text-sm text-primary no-underline font-medium hover:underline"
          >
            Learn how to define your own themes →
          </Link>
        </section>
      </div>
    </DocsLayout>
  );
}