import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { buildPageHeadings } from "../../lib/toc";
import { SunriseSunsetGuide } from "./SunriseSunsetGuide";

export const metadata: Metadata = {
  title: "Sunrise & Sunset",
  description:
    "Switch your app between light and dark automatically at sunrise and sunset — in any framework, with one scheduling engine.",
};

const optionRows: { name: string; type: string; desc: string }[] = [
  {
    name: "lightTheme",
    type: "string (optional)",
    desc: "Theme name applied between sunrise and sunset. Optional — when omitted the schedule derives it from the currently selected theme's family (e.g. `plum-dark` → `plum-light`), falling back to the built-in neutral `light` theme.",
  },
  {
    name: "darkTheme",
    type: "string (optional)",
    desc: "Theme name applied between sunset and sunrise. Optional — same derivation as `lightTheme`, falling back to the built-in neutral `dark` theme.",
  },
  {
    name: "latitude / longitude",
    type: "number (optional)",
    desc: "Coordinates used for the solar calculation. Optional — when omitted the location is resolved from `timeZone` or each visitor's browser timezone, so the schedule is correct anywhere in the world without configuration.",
  },
  {
    name: "timeZone",
    type: "string (optional)",
    desc: "IANA timezone to resolve coordinates from when latitude/longitude are omitted (e.g. \"Asia/Kathmandu\"). Takes precedence over auto-detection. Changeable at runtime via schedule.set().",
  },
  {
    name: "autoDetectLocation",
    type: "boolean (optional)",
    desc: "Auto-detect the visitor's location from their browser timezone when no coordinates/timezone are given. Default true. Set false to force the default coordinates and keep SSR fully deterministic.",
  },
  {
    name: "checkInterval",
    type: "number (ms)",
    desc: "How often the schedule re-checks solar time. Default 60000 (1 minute).",
  },
  {
    name: "skipApplyMs",
    type: "number (ms)",
    desc: "Ignore schedule-driven applies within this window after a manual selection (e.g. a cross-tab sync). Default 0.",
  },
  {
    name: "enabled",
    type: "boolean",
    desc: "Start the schedule on. Default true.",
  },
];

// Headings live inside the client SunriseSunsetGuide (invisible to the
// layout's RSC walk), so provide them here for the TOC rail.
const sunriseSunsetHeadings = buildPageHeadings([
  { text: "How it works", level: 2 },
  { text: "Setup", level: 2 },
  { text: "Read & control the schedule", level: 2 },
  { text: "Options", level: 2 },
  { text: "Schedule vs. manual override", level: 2 },
  { text: "What's next", level: 2 },
]);

export default function SunriseSunsetPage() {
  return (
    <DocsLayout headings={sunriseSunsetHeadings}>
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
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4 1.4" />
            </svg>
          }
          title="Sunrise &amp; Sunset"
          subtitle="@theme-kit/core · every framework"
          description={
            <>
              Follow the sun: Theme Kit switches the app automatically at
              sunrise and sunset.{" "}
              <strong>No configuration required</strong> —{" "}
              <code className="mono text-[0.9em]">lightTheme</code> /{" "}
              <code className="mono text-[0.9em]">darkTheme</code> adapt to
              whichever theme family the visitor has selected (falling back to
              Theme Kit&apos;s neutral themes), and coordinates are
              auto-detected from each visitor&apos;s browser timezone — so the
              schedule works for every user anywhere in the world. Pass any of
              them explicitly when you want to pin a choice. The engine lives
              entirely in{" "}
              <code className="mono text-[0.9em]">@theme-kit/core</code>{" "}
              (NOAA-style solar math); every framework exposes it through a
              native reactive accessor —{" "}
              <code className="mono text-[0.9em]">useThemeSchedule()</code>{" "}
              in React / Next / Vue / Nuxt / Solid,{" "}
              <code className="mono text-[0.9em]">getThemeSchedule()</code>{" "}
              in Svelte, and{" "}
              <code className="mono text-[0.9em]">injectThemeSchedule()</code>{" "}
              in Angular.
            </>
          }
        />
        <SunriseSunsetGuide optionRows={optionRows} />
      </div>
    </DocsLayout>
  );
}