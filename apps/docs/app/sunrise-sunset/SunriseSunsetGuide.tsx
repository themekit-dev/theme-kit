"use client";

import { useState } from "react";
import Link from "next/link";
import { highlightCode } from "../../lib/highlight";
import { CodeBlock } from "../../components/code-block";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { FrameworkPicker, getExample } from "../../components/framework-picker";

const frameworkSnippet = (lang: string, title: string, code: string) => ({ lang, title, code });

const mountExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: frameworkSnippet("tsx", "App.tsx", `import { ThemeProvider } from "@theme-kit/react";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
      scheduled={{
        // Everything is optional. lightTheme/darkTheme adapt to the current
        // theme family (fallback: neutral light/dark), and coordinates are
        // auto-detected from the visitor's timezone — so the schedule is
        // correct for every user anywhere, with no config at all.
        // lightTheme: "mint-light",
        // darkTheme: "mint-dark",
        // timeZone: "Asia/Kathmandu",
      }}
    >
      <ThemeSwitcher />
    </ThemeProvider>
  );
}`),
  next: frameworkSnippet("tsx", "app/layout.tsx", `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
      scheduled={{
        // No themes or coordinates needed: light/dark adapt to the current
        // theme family, and the client schedule resolves each visitor's
        // location from their browser timezone automatically.
      }}
    >
      {children}
    </ThemeProvider>
  );
}`),
  vue: frameworkSnippet("vue", "App.vue", `<script setup>
import { ThemeProvider } from "@theme-kit/vue";
import { themes } from "./themes";
</script>

<template>
  <ThemeProvider
    :themes="themes"
    defaultTheme="mint-light"
    :scheduled="{
      // Optional: light/dark adapt to the current family, coordinates
      // auto-detect from the visitor's timezone.
      // lightTheme: 'mint-light',
      // darkTheme: 'mint-dark',
    }"
  >
    <ThemeSwitcher />
  </ThemeProvider>
</template>`),
  nuxt: frameworkSnippet("ts", "nuxt.config.ts", `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "mint-light",
    scheduled: {
      // Optional: light/dark adapt to the current family, and the runtime
      // detects each visitor's timezone for their local sunrise/sunset.
    },
  },
});`),
  svelte: frameworkSnippet("svelte", "App.svelte", `<script>
  import { ThemeProvider } from "@theme-kit/svelte";
  import { themes } from "./themes";
</script>

<ThemeProvider
  themes={themes}
  defaultTheme="mint-light"
  scheduled={{
    // Optional: light/dark adapt to the current family, coordinates
    // auto-detect from the visitor's timezone.
  }}
>
  <slot />
</ThemeProvider>`),
  solid: frameworkSnippet("tsx", "App.tsx", `import { ThemeProvider } from "@theme-kit/solid";

export function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
      scheduled={{
        // Optional: light/dark adapt to the current family, coordinates
        // auto-detect from the visitor's timezone.
      }}
    >
      <YourApp />
    </ThemeProvider>
  );
}`),
  angular: frameworkSnippet("ts", "app.config.ts", `import { provideThemeKit } from "@theme-kit/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideThemeKit({
      themes,
      defaultTheme: "mint-light",
      scheduled: {
        // Optional: light/dark adapt to the current family, coordinates
        // auto-detect from the visitor's timezone.
      },
    }),
  ],
};`),
  web: frameworkSnippet("html", "index.html", `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  import { themes } from "./themes.js";

  defineCustomElements();
  const provider = document.querySelector("theme-kit-provider");
  provider.setAttribute("themes", JSON.stringify(themes));
  provider.setAttribute("default-theme", "mint-light");
  provider.setAttribute(
    "scheduled",
    JSON.stringify({
      // Optional: light/dark adapt to the current family, coordinates
      // auto-detect from the visitor's timezone.
    })
  );
</script>

<theme-kit-provider>
  <your-app></your-app>
</theme-kit-provider>`),
  astro: frameworkSnippet("astro", "src/pages/index.astro", `---
import { ThemeProviderClient } from "@theme-kit/astro";
import { themes } from "virtual:theme-kit-themes";
---

<html>
  <head>
    <title>My site</title>
  </head>
  <body>
    <ThemeProviderClient
      themes={themes}
      defaultTheme="mint-light"
      scheduled={{
        // Optional: light/dark adapt to the current family, coordinates
        // auto-detect from the visitor's timezone.
      }}
    />
    <ThemeSwitcher client:load />
  </body>
</html>`),
  tailwind: frameworkSnippet("css", "globals.css", `@import "tailwindcss";
@import "@theme-kit/tailwind";

/* Theme Kit schedules via the core runtime. Wire it in your
   framework shell (React/Vue/etc.) with createThemeRuntime({
   scheduled: {} }) — light/dark themes adapt to the current family and
   coordinates auto-detect from each visitor's timezone.
   The CSS here only maps tokens — scheduling is runtime-driven. */`),
  remix: frameworkSnippet("tsx", "app/root.tsx", `import { ThemeProvider } from "@theme-kit/remix";
import { themes } from "./themes";

export default function App() {
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme="mint-light"
      scheduled={{
        // Optional: light/dark adapt to the current family, coordinates
        // auto-detect from the visitor's timezone.
      }}
    >
      <Outlet />
    </ThemeProvider>
  );
}`),
};

const controllerExamples: Record<string, { lang: string; title: string; code: string }> = {
  react: frameworkSnippet("tsx", "ScheduleToggle.jsx", `import { useThemeSchedule } from "@theme-kit/react";

export function ScheduleToggle() {
  const schedule = useThemeSchedule();
  const state = schedule?.state;

  return (
    <div>
      <button
        onClick={() =>
          state?.enabled ? schedule?.disable() : schedule?.enable()
        }
      >
        {state?.enabled ? "Disable" : "Enable"} schedule
      </button>
      <p>Status: {state?.status}</p>
      <p>
        {state?.timeZone} ({state?.latitude?.toFixed(2)},{" "}
        {state?.longitude?.toFixed(2)}) — Sunrise{" "}
        {state?.sunrise?.toLocaleTimeString()} · Sunset{" "}
        {state?.sunset?.toLocaleTimeString()} · Next{" "}
        {state?.nextTransition?.theme} at{" "}
        {state?.nextTransition?.at.toLocaleTimeString()}
      </p>
      <select
        value={state?.timeZone ?? ""}
        onChange={(e) => schedule?.set({ timeZone: e.target.value })}
      >
        <option value="">Auto (my location)</option>
        {timeZones.map((zone) => (
          <option key={zone} value={zone}>{zone}</option>
        ))}
      </select>
    </div>
  );
}`),
  next: frameworkSnippet("tsx", "components/schedule-toggle.tsx", `// components/schedule-toggle.tsx
"use client";
import { useThemeSchedule } from "@theme-kit/next/client";

export function ScheduleToggle() {
  const schedule = useThemeSchedule();
  const state = schedule?.state;

  return (
    <div>
      <button
        onClick={() =>
          state?.enabled ? schedule?.disable() : schedule?.enable()
        }
      >
        {state?.enabled ? "Disable" : "Enable"} schedule
      </button>
      <p>Status: {state?.status}</p>
      <p>
        Timezone: {state?.timeZone ?? "auto-detected"} · Sunrise{" "}
        {state?.sunrise?.toLocaleTimeString()} · Sunset{" "}
        {state?.sunset?.toLocaleTimeString()}
      </p>
    </div>
  );
}`),
  vue: frameworkSnippet("vue", "ScheduleToggle.vue", `<script setup>
import { useThemeSchedule } from "@theme-kit/vue";
// state is a Ref — access it with .value in <script>, auto-unwrapped
// when destructured in the template.
const schedule = useThemeSchedule();
const { state } = schedule;
</script>

<template>
  <button
    @click="state.enabled ? schedule.disable() : schedule.enable()"
  >
    {{ state.enabled ? "Disable" : "Enable" }} schedule
  </button>
  <p>Status: {{ state.status }}</p>
  <p>
    Timezone: {{ state.timeZone ?? "auto-detected" }} · Sunrise
    {{ state.sunrise?.toLocaleTimeString() }}
  </p>
  <select @change="schedule.set({ timeZone: ($event.target as HTMLSelectElement).value })">
    <option value="">Auto (my location)</option>
  </select>
</template>`),
  nuxt: frameworkSnippet("vue", "ScheduleToggle.vue", `<script setup>
// useThemeSchedule is auto-imported by the module
const schedule = useThemeSchedule();
const { state } = schedule;
</script>

<template>
  <button
    @click="state.enabled ? schedule.disable() : schedule.enable()"
  >
    {{ state.enabled ? "Disable" : "Enable" }} schedule
  </button>
  <p>Status: {{ state.status }}</p>
  <p>
    Timezone: {{ state.timeZone ?? "auto-detected" }} · Sunrise
    {{ state.sunrise?.toLocaleTimeString() }}
  </p>
</template>`),
  svelte: frameworkSnippet("svelte", "ScheduleToggle.svelte", `<script>
  import { useThemeSchedule, getThemeSchedule } from "@theme-kit/svelte";

  const schedule = useThemeSchedule();
  const controller = getThemeSchedule();
</script>

<button
  onclick={() => ($schedule.enabled ? controller?.disable() : controller?.enable())}
>
  {$schedule.enabled ? "Disable" : "Enable"} schedule
</button>
<p>Status: {$schedule.status}</p>
<p>Timezone: {$schedule.timeZone ?? "auto-detected"}</p>`),
  solid: frameworkSnippet("tsx", "ScheduleToggle.jsx", `import { useThemeSchedule } from "@theme-kit/solid";

function ScheduleToggle() {
  const schedule = useThemeSchedule();

  return (
    <div>
      <button
        onClick={() =>
          schedule?.enabled ? schedule?.disable() : schedule?.enable()
        }
      >
        {schedule?.enabled ? "Disable" : "Enable"} schedule
      </button>
      <p>Status: {schedule?.status}</p>
      <p>
        Sunrise {schedule?.sunrise?.toLocaleTimeString()} · Sunset{" "}
        {schedule?.sunset?.toLocaleTimeString()}
      </p>
    </div>
  );
}`),
  angular: frameworkSnippet("ts", "schedule-toggle.ts", `import { Component, computed } from "@angular/core";
import { injectThemeSchedule } from "@theme-kit/angular";

@Component({
  selector: "app-schedule-toggle",
  standalone: true,
  template: \`
    <button (click)="toggle()">
      {{ enabled() ? "Disable" : "Enable" }} schedule
    </button>
    <p>Status: {{ status() }}</p>
    <p>Timezone: {{ timeZone() ?? "auto-detected" }}</p>
  \`,
})
export class ScheduleToggleComponent {
  private schedule = injectThemeSchedule();
  readonly enabled = computed(() => this.schedule?.state().enabled ?? false);
  readonly status = computed(
    () => this.schedule?.state().status ?? "disabled",
  );
  readonly timeZone = computed(() => this.schedule?.state().timeZone ?? null);

  toggle() {
    this.enabled() ? this.schedule?.disable() : this.schedule?.enable();
  }
}`),
  web: frameworkSnippet("ts", "schedule.ts", `import { getThemeSchedule } from "@theme-kit/web";

// Web Components expose the same reactive accessor as the hooks.
// Returns null when the provider has no scheduled option configured.
const schedule = getThemeSchedule();

schedule?.enable();   // starts the sunrise/sunset timer
schedule?.disable();  // stops it — theme stays where it is
schedule?.set({ timeZone: "Asia/Kathmandu" });           // pin a timezone
schedule?.set({ latitude: 51.5074, longitude: -0.1278 }); // …or coordinates
schedule?.set({ autoDetectLocation: true });             // back to auto-detection`),
  astro: frameworkSnippet("astro", "ScheduleToggle.astro", `---
const { useThemeSchedule } = await import("@theme-kit/astro");
---
<button id="schedule-toggle">Enable schedule</button>

<script type="module">
  const { useThemeSchedule } = await import("@theme-kit/astro/client");
  const schedule = useThemeSchedule();

  document.getElementById("schedule-toggle").addEventListener("click", () =>
    schedule?.state?.enabled ? schedule?.disable() : schedule?.enable()
  );
  // schedule.set({ timeZone: "Asia/Kathmandu" }) repositions at runtime.
</script>`),
  tailwind: frameworkSnippet("ts", "schedule.ts", `import { createThemeRuntime } from "@theme-kit/core";
import { themes } from "./themes";

// Tailwind is a CSS layer — scheduling runs in the core runtime
// (same as the React/Vue shell). Wire it wherever you boot the runtime.
const runtime = createThemeRuntime({
  themes,
  defaultTheme: "mint-light",
  scheduled: {
    // Optional: light/dark adapt to the current family, coordinates
    // auto-detect from the visitor's timezone.
  },
});

runtime.schedule.enable();
runtime.schedule.disable();
runtime.schedule.set({ timeZone: "Australia/Sydney" });`),
  remix: frameworkSnippet("tsx", "schedule-toggle.tsx", `// app/routes/schedule-toggle.tsx
"use client";
import { useThemeSchedule } from "@theme-kit/remix";

export default function ScheduleToggle() {
  const schedule = useThemeSchedule();

  return (
    <div>
      <button
        onClick={() =>
          schedule?.state?.enabled ? schedule?.disable() : schedule?.enable()
        }
      >
        {schedule?.state?.enabled ? "Disable" : "Enable"} schedule
      </button>
      <p>Status: {schedule?.state?.status}</p>
      <p>
        Timezone: {schedule?.state?.timeZone ?? "auto-detected"} · Sunrise{" "}
        {schedule?.state?.sunrise?.toLocaleTimeString()}
      </p>
    </div>
  );
}`),
};

function snippetBlock(snippet: { lang: string; title: string; code: string }) {
  return (
    <CodeBlock
      html={highlightCode(snippet.code, snippet.lang)}
      code={snippet.code}
      language={snippet.lang}
      className="rounded-lg m-0"
    />
  );
}

export function SunriseSunsetGuide({
  optionRows,
}: {
  optionRows: { name: string; type: string; desc: string }[];
}) {
  const [selectedFramework, setSelectedFramework] = useState("react");
  const mountExample = getExample(mountExamples, selectedFramework);
  const controllerExample = getExample(controllerExamples, selectedFramework);

  return (
    <>
      <FrameworkPicker
        value={selectedFramework}
        onChange={setSelectedFramework}
        label="Pick your framework"
        scrollToId="setup"
      />

      <section id="how-it-works" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={1}
          desc="One scheduling engine in core; frameworks only add native reactivity."
        >
          How it works
        </SectionHeading>
        <div className="flex flex-col gap-2 text-sm opacity-80 leading-relaxed">
          <p>
            <code className="mono text-[0.9em]">calculateSunTimes(date, lat, lon)</code>{" "}
            computes today&apos;s sunrise and sunset using the NOAA solar
            algorithm (zenith-based, corrected for the equation of time). At
            runtime the schedule checks the clock every{" "}
            <code className="mono text-[0.9em]">checkInterval</code> and
            applies <code className="mono text-[0.9em]">lightTheme</code>{" "}
            during the day or{" "}
            <code className="mono text-[0.9em]">darkTheme</code> at night.
          </p>
          <p>
            <strong className="opacity-100">No themes required either.</strong>{" "}
            <code className="mono text-[0.9em]">lightTheme</code> and{" "}
            <code className="mono text-[0.9em]">darkTheme</code> are optional.
            When omitted, the schedule derives them from the currently
            selected theme&apos;s family — pick <code className="mono text-[0.9em]">plum-dark</code>{" "}
            in your switcher and the schedule uses{" "}
            <code className="mono text-[0.9em]">plum-light</code> /{" "}
            <code className="mono text-[0.9em]">plum-dark</code> — and falls
            back to Theme Kit&apos;s neutral <code className="mono text-[0.9em]">light</code> /{" "}
            <code className="mono text-[0.9em]">dark</code> themes when the
            current theme has no family counterpart. The resolved pair
            re-derives automatically whenever the user switches family, and is
            reported in state as{" "}
            <code className="mono text-[0.9em]">lightTheme</code> /{" "}
            <code className="mono text-[0.9em]">darkTheme</code>.
          </p>
          <p>
            <strong className="opacity-100">No coordinates required.</strong>{" "}
            When you omit{" "}
            <code className="mono text-[0.9em]">latitude</code> and{" "}
            <code className="mono text-[0.9em]">longitude</code>, Theme Kit
            resolves the location from the visitor&apos;s IANA timezone (via{" "}
            <code className="mono text-[0.9em]">
              Intl.DateTimeFormat().resolvedOptions().timeZone
            </code>
            ) — each zone is anchored to the reference city the tz database
            uses, which is more than accurate enough for day/night switching.
            Pin a timezone explicitly with{" "}
            <code className="mono text-[0.9em]">timeZone</code> (it can be
            changed at runtime with{" "}
            <code className="mono text-[0.9em]">schedule.set()</code>), or set{" "}
            <code className="mono text-[0.9em]">autoDetectLocation: false</code>{" "}
            to force the default coordinates.
          </p>
          <p>
            <strong className="opacity-100">SSR boundary.</strong> The engine
            attaches its timer and DOM apply logic only on the client
            (<code className="mono text-[0.9em]">typeof window !== "undefined"</code>),
            and auto-detection runs only on the client too — so server renders
            never leak timers and stay deterministic. Your SSR framework
            resolves the initial theme as usual (zero flash of the wrong
            theme); the client-side schedule takes over activation from there.
            Configure the schedule on the server provider (Next.js / Nuxt) and
            the same settings apply to the hydrated client runtime.
          </p>
          <p>
            Because detection happens per visitor, the schedule is correct
            anywhere in the world: a user in Kathmandu gets Kathmandu&apos;s
            sunrise/sunset, a user in Helsinki gets Helsinki&apos;s — with the
            same <code className="mono text-[0.9em]">scheduled</code> block and
            no network call.
          </p>
        </div>
      </section>

      <section id="setup" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={2}
          desc="Pass `scheduled` to your provider (or module). One block, no per-framework solar engine."
        >
          Setup
        </SectionHeading>
        {snippetBlock(mountExample)}
      </section>

      <section id="read-control" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={3}
          desc="The accessor exposes the same contract everywhere: reactive `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition`, `timeZone`, `latitude`, `longitude`, plus `enable()` / `disable()` / `set()`."
        >
          Read &amp; control the schedule
        </SectionHeading>
        {snippetBlock(controllerExample)}
        <Callout className="mt-3">
          <strong>State shape</strong>
          <span className="mx-1 opacity-40">|</span>
          <code className="mono text-[0.9em]">enabled</code> — schedule is on.{" "}
          <code className="mono text-[0.9em]">active</code> — enabled{" "}
          <em>and</em> the applied theme is one of the scheduled light/dark
          themes.{" "}
          <code className="mono text-[0.9em]">status</code> —{" "}
          <code className="mono text-[0.9em]">"active"</code> or{" "}
          <code className="mono text-[0.9em]">"disabled"</code>.{" "}
          <code className="mono text-[0.9em]">timeZone</code> — the resolved
          timezone (or <code className="mono text-[0.9em]">null</code> when
          explicit coordinates are used).{" "}
          <code className="mono text-[0.9em]">latitude</code> /{" "}
          <code className="mono text-[0.9em]">longitude</code> — the resolved
          coordinates.{" "}
          <code className="mono text-[0.9em]">autoDetected</code> — coordinates
          came from a timezone rather than explicit values.{" "}
          <code className="mono text-[0.9em]">lightTheme</code> /{" "}
          <code className="mono text-[0.9em]">darkTheme</code> — the resolved
          scheduled pair (auto-derived from the current theme family when not
          configured).{" "}
          <code className="mono text-[0.9em]">nextTransition</code> —{" "}
          <code className="mono text-[0.9em]">{"{ at, theme, type }"}</code>{" "}
          where <code className="mono text-[0.9em]">type</code> is{" "}
          <code className="mono text-[0.9em]">"activation"</code> (sunrise) or{" "}
          <code className="mono text-[0.9em]">"deactivation"</code> (sunset).
        </Callout>
      </section>

      <section id="options" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={4}
          desc="Every `scheduled` option, and the runtime `set()` method for repositioning."
        >
          Options
        </SectionHeading>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-2 font-semibold">Option</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {optionRows.map((row) => (
                <tr key={row.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 mono text-[0.9em] align-top">
                    {row.name}
                  </td>
                  <td className="px-4 py-2 text-xs opacity-60 align-top">
                    {row.type}
                  </td>
                  <td className="px-4 py-2 opacity-80 leading-relaxed align-top">
                    {row.desc}
                  </td>
                </tr>
              ))}
              <tr className="last:border-0">
                <td className="px-4 py-2 mono text-[0.9em] align-top">
                  set(&#123; … &#125;)
                </td>
                <td className="px-4 py-2 text-xs opacity-60 align-top">
                  method
                </td>
                <td className="px-4 py-2 opacity-80 leading-relaxed align-top">
                  Reposition or reconfigure at runtime —{" "}
                  <code className="mono text-[0.9em]">latitude</code>,{" "}
                  <code className="mono text-[0.9em]">longitude</code>,{" "}
                  <code className="mono text-[0.9em]">timeZone</code>,{" "}
                  <code className="mono text-[0.9em]">autoDetectLocation</code>
                  , <code className="mono text-[0.9em]">checkInterval</code>,{" "}
                  <code className="mono text-[0.9em]">skipApplyMs</code> or{" "}
                  <code className="mono text-[0.9em]">enabled</code>. Pass{" "}
                  <code className="mono text-[0.9em]">
                    {"{ autoDetectLocation: true }"}
                  </code>{" "}
                  to clear explicit settings and return to per-visitor
                  detection.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="semantics" className="scroll-mt-24 mb-10">
        <SectionHeading
          num={5}
          desc="Exact semantics, so there are no surprises when a user picks a theme while the schedule is on."
        >
          Schedule vs. manual override
        </SectionHeading>
        <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            <code className="mono text-[0.9em]">enable()</code> applies the
            correct light/dark theme immediately, then re-checks every{" "}
            <code className="mono text-[0.9em]">checkInterval</code>.
          </li>
          <li>
            A manual pick of any other theme is honored until the next check,
            at which point the schedule re-applies its light/dark selection.
            While overridden, <code className="mono text-[0.9em]">active</code>{" "}
            is <code className="mono text-[0.9em]">false</code>.
          </li>
          <li>
            <code className="mono text-[0.9em]">skipApplyMs</code> widens the
            window after a manual selection (or cross-tab sync) before the
            schedule re-asserts control.
          </li>
          <li>
            <code className="mono text-[0.9em]">disable()</code> leaves the
            current theme untouched — the schedule simply stops re-applying.
          </li>
          <li>
            If a configured <code className="mono text-[0.9em]">lightTheme</code>{" "}
            or <code className="mono text-[0.9em]">darkTheme</code> doesn&apos;t
            exist in the theme registry, the schedule stays off (status{" "}
            <code className="mono text-[0.9em]">"disabled"</code>).
          </li>
        </ul>
      </section>

      <section id="next" className="scroll-mt-24">
        <SectionHeading
          num={6}
          desc="Now that the app follows the sun, explore related capabilities."
        >
          What&apos;s next
        </SectionHeading>
        <div className="flex flex-col gap-2">
          <Link
            href="/playground#solar"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Playground · Try it live</div>
              <div className="text-xs opacity-60">
                Enable the real schedule on this site, pick any timezone, and
                watch the site flip at sunrise/sunset.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
          <Link
            href="/advanced-features"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Advanced Features</div>
              <div className="text-xs opacity-60">
                Multi-window sync, history, time travel and the rest of the
                runtime.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
          <Link
            href="/api-reference"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">API Reference</div>
              <div className="text-xs opacity-60">
                Full reference for ThemeSchedule, ThemeScheduleState and
                calculateSunTimes.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
