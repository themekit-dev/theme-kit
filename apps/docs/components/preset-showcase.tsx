"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "./code-block";
import { highlightCode } from "../lib/highlight";
import { DocsLayout } from "./docs-layout";
import { PageHeader } from "./ui/page-header";
import { SectionHeading } from "./ui/section-heading";
import { Callout } from "./ui/callout";
import {
  PRESET_KIND_META,
  DEFAULT_PRESET_SNIPPET,
  BRAND_PRESET_SNIPPET,
  PresetCard,
  CurrentThemeInspector,
  usePresetGroups,
} from "./presets";

type Tab = "default" | "brand";

export function PresetShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("default");
  const groups = usePresetGroups(activeTab);

  const defaultCount = 9;
  const brandCount = 5;

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
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8" />
            </svg>
          }
          title="Built-in Presets"
          subtitle="@theme-kit/core"
          description={
            <>
              Theme Kit ships with{" "}
              <strong>
                {defaultCount} curated families + {brandCount} brand
                presets
              </strong>{" "}
              — each with carefully chosen, WCAG-conscious light and dark
              variants. Click any preset to apply it to this site live.
            </>
          }
        />

        <section className="mb-10">
          <SectionHeading
            num={1}
            desc="Every preset is a complete design system with light and dark token pairs. The nine default families cover warm, cool, and neutral palettes. The five brand presets replicate real-world design languages."
          >
            What&apos;s included
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card p-4">
              <div className="font-semibold text-sm">Default Presets</div>
              <div className="text-xs opacity-60 mt-1 leading-relaxed">
                {defaultCount} curated families: oat, berry, mint, citrus, cocoa,
                plum, iris, sky, graphite. Each ships a light and dark variant
                with distinct border radii and accent colors.
              </div>
              <Link
                href="/presets/default"
                className="inline-flex items-center gap-1 text-xs font-medium mt-2 no-underline hover:underline"
                style={{ color: "var(--theme-color-primary)" }}
              >
                Browse all defaults →
              </Link>
            </div>
            <div className="glass-card p-4">
              <div className="font-semibold text-sm">Brand Presets</div>
              <div className="text-xs opacity-60 mt-1 leading-relaxed">
                {brandCount} real-world palettes: Apple, GitHub, Vercel, Slack,
                Discord. Faithful reproductions of each brand&apos;s color
                language, radius, and tone.
              </div>
              <Link
                href="/presets/brand"
                className="inline-flex items-center gap-1 text-xs font-medium mt-2 no-underline hover:underline"
                style={{ color: "var(--theme-color-primary)" }}
              >
                Browse all brands →
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeading
            num={2}
            desc="Click any card below to apply that theme to this entire site — live, no reload. Every card shows the preset's light and dark variants side-by-side."
          >
            Try them live
          </SectionHeading>

          <CurrentThemeInspector />

          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-4">
            {(["default", "brand"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-foreground/50 hover:text-foreground/80"
                }`}
              >
                {PRESET_KIND_META[tab].label}
                <span className="ml-1.5 text-xs opacity-50">
                  ({tab === "default" ? defaultCount : brandCount})
                </span>
              </button>
            ))}
          </div>

          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            {PRESET_KIND_META[activeTab].hint}
          </p>

          {groups.length === 0 ? (
            <p className="text-sm opacity-50">No themes in this group.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((group) => (
                <PresetCard key={group.key} group={group} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <SectionHeading
            num={3}
            desc="Import preset families and brand palettes directly from the core package. No extra styling required."
          >
            Install instructions
          </SectionHeading>

          <h3 className="text-sm font-semibold mb-2">
            Default presets
          </h3>
          <CodeBlock
            html={highlightCode(DEFAULT_PRESET_SNIPPET, "ts")}
            code={DEFAULT_PRESET_SNIPPET}
            language="ts"
            className="rounded-lg m-0 mb-4"
          />

          <h3 className="text-sm font-semibold mb-2">
            Brand presets
          </h3>
          <CodeBlock
            html={highlightCode(BRAND_PRESET_SNIPPET, "ts")}
            code={BRAND_PRESET_SNIPPET}
            language="ts"
            className="rounded-lg m-0"
          />

          <Callout title="Tip" className="mt-4">
            You can override any preset&apos;s tokens by passing a{" "}
            <code className="mono text-[0.9em]">PresetOverrides</code> map to{" "}
            <code className="mono text-[0.9em]">getPresetThemes()</code>. See
            the custom themes guide for details.
          </Callout>
        </section>

        <section>
          <SectionHeading
            num={4}
            desc="Presets are a starting point — you can compose, extend, or generate your own families."
          >
            Create your own
          </SectionHeading>
          <div className="flex flex-col gap-2">
            <Link
              href="/custom-themes"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Custom Themes Guide</div>
                <div className="text-xs opacity-60">
                  defineTheme, extendTheme, composeTheme and the generation
                  studio.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/tokens"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Semantic Tokens</div>
                <div className="text-xs opacity-60">
                  Typography, spacing, radius, shadows, border widths, z-index
                  and breakpoints.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
