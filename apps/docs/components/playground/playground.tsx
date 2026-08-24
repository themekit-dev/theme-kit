"use client";

import type { ReactNode } from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { TokenTree } from "./token-tree";
import { HistoryTimeline } from "./history-timeline";
import { LivePreview } from "./live-preview";
import { SyncDemo } from "./sync-demo";
import { ScheduledDemo } from "./scheduled-demo";
import { ThemeGenerator } from "./theme-generator";
import ThemeScope from "./theme-scope";
import { ScrollbarDemo } from "./scrollbar-demo";
import { AccessibilityLab } from "../accessibility/accessibility-lab";
import { AnimationLab } from "../animation/animation-lab";
import { ThemeStudio } from "../theme-studio/theme-studio";
import { PageHeader } from "../ui/page-header";

const NAV = [
  { href: "#tokens", label: "Token tree" },
  { href: "#history", label: "History" },
  { href: "#sync", label: "Sync" },
  { href: "#solar", label: "Solar time" },
  { href: "#generator", label: "Generator" },
  { href: "#animation", label: "Animation" },
  { href: "#scrollbar", label: "Scrollbar" },
  { href: "#a11y", label: "Accessibility" },
  { href: "#studio", label: "Studio" },
];

/**
 * Shared shell for every playground section: consistent heading scale,
 * description width, anchor offset and card treatment.
 */
function PlaygroundSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold tracking-tight mb-1">{title}</h2>
      <p className="text-sm opacity-60 mb-5 max-w-2xl leading-relaxed">
        {description}
      </p>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Playground() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        eyebrow="Interactive playground"
        title="Theme Kit Playground"
        description="Everything below runs on Theme Kit's real runtime — the same store, history, and resolver that ships in the library. Switch a family or mode, explore the token tree, audit contrast, run a transition, and watch CSS variables update live."
      />

      {/* Section nav — wraps naturally on small screens. */}
      <nav aria-label="Playground sections" className="mb-10">
        <div className="flex flex-wrap gap-1.5">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="chip no-underline">
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="flex flex-col gap-6 min-w-0">
        <ThemeSwitcher />
        <ThemeScope />

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="min-w-0">
            <LivePreview />
          </div>
          <div id="history" className="scroll-mt-24 min-w-0">
            <HistoryTimeline />
          </div>
        </div>

        <div id="tokens" className="scroll-mt-24 min-w-0">
          <TokenTree />
        </div>

        <PlaygroundSection
          id="sync"
          title="Multi-window sync"
          description={
            <>
              Theme selections sync across tabs and windows in real time via{" "}
              <code className="mono text-[0.9em]">BroadcastChannel</code> (with
              SharedWorker and StorageEvent fallbacks).
            </>
          }
        >
          <SyncDemo />
        </PlaygroundSection>

        <PlaygroundSection
          id="solar"
          title="Scheduled themes · solar time"
          description={
            <>
              Run the real{" "}
              <code className="mono text-[0.9em]">useThemeSchedule()</code>{" "}
              controller: enable the schedule to flip the whole site between
              light and dark at sunrise/sunset. Leave it on{" "}
              <strong>Auto</strong> to use your own detected timezone — no
              coordinates needed — or pick any timezone in the world and watch
              the sun path follow it. See the{" "}
              <a
                href="/sunrise-sunset"
                className="underline decoration-primary/50 underline-offset-2"
              >
                Sunrise &amp; Sunset
              </a>{" "}
              page for per-framework setup.
            </>
          }
        >
          <ScheduledDemo />
        </PlaygroundSection>

        <PlaygroundSection
          id="generator"
          title="Theme generator"
          description="Generate a complete light/dark theme pair from a seed color, then copy the JSON or CSS variables."
        >
          <ThemeGenerator />
        </PlaygroundSection>

        <PlaygroundSection
          id="animation"
          title="Animation & transition lab"
          description={
            <>
              Run the real transition pipeline —{" "}
              <code className="mono text-[0.9em]">createThemeDiff</code>,{" "}
              <code className="mono text-[0.9em]">createTransitionPlan</code>{" "}
              and <code className="mono text-[0.9em]">runThemeAnimation</code>{" "}
              — and tune duration, easing and presets live.
            </>
          }
        >
          <AnimationLab />
        </PlaygroundSection>

        <PlaygroundSection
          id="scrollbar"
          title="Custom scrollbar"
          description={
            <>
              The real overlay engine, integrated on this site — scroll the
              panel to see the theme-colored strip replace the native bar. For
              per-framework setup, see{" "}
              <a
                href="/custom-scrollbar"
                className="underline decoration-primary/50 underline-offset-2"
              >
                Custom Scrollbar
              </a>
              .
            </>
          }
        >
          <ScrollbarDemo />
        </PlaygroundSection>

        <PlaygroundSection
          id="a11y"
          title="Accessibility lab"
          description="Check WCAG contrast on any pair, simulate color-vision deficiency, and audit the active theme's semantic pairs."
        >
          <AccessibilityLab compact />
        </PlaygroundSection>

        <PlaygroundSection
          id="studio"
          title="Theme studio"
          description={
            <>
              Generate a full light/dark pair from a seed with{" "}
              <code className="mono text-[0.9em]">generateTheme()</code>,
              preview it, and apply it to this site live.
            </>
          }
        >
          <ThemeStudio compact />
        </PlaygroundSection>
      </div>
    </div>
  );
}
