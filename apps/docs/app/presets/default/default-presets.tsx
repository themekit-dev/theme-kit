"use client";

import Link from "next/link";
import { DocsLayout } from "../../../components/docs-layout";
import {
  PresetsHeader,
  usePresetGroups,
} from "../../../components/presets";
import { PresetComparison } from "../../../components/preset-preview";

export function DefaultPresetsView() {
  const groups = usePresetGroups("default");

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PresetsHeader kind="default" />

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            Preview a preset and use it in your app
          </h2>
          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            Pick a family and a mode to see the same interface under each. This
            changes only the preview — not the documentation site. Everything
            below the preview follows your selection: the setup snippet, the
            resolved CSS variables, and a ready-to-paste{" "}
            <code className="mono text-[12px]">defineTheme()</code> call you can
            copy or download.
          </p>
          <PresetComparison groups={groups} kind="default" />
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            Use it in your app
          </h2>
          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            Every preset ships inside{" "}
            <code className="mono text-[0.9em]">@theme-kit/core</code> as a
            complete light/dark family. Pick your framework in the preview above
            and copy the snippet for the preset you were looking at.
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