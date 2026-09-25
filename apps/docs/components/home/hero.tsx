"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
} from "@theme-kit/next/client";
import { Button } from "../ui/button";
import { CodeBlock } from "../code-block";
import { highlightCode } from "../../lib/highlight";
import { frameworks } from "../../lib/frameworks";
import { c, colorsOf, contrastRatio } from "../../lib/contrast";
import { PKG_VERSION_BADGE } from "../../lib/version";

/** Tiny inline trend line for the stat tiles — decorative, token-colored. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 68;
  const h = 18;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - 1 - ((v - min) / range) * (h - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function DashboardPreview() {
  const { theme, family, mode } = useTheme();
  const colors = colorsOf(theme);
  const ratio = contrastRatio(
    c(colors, "foreground", "#000000"),
    c(colors, "background", "#ffffff"),
  );

  return (
    <div
      className="glass-card hero-card float-y p-5 w-full max-w-123 mx-auto"
      data-preview-card
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full grid place-items-center text-sm font-bold"
            style={{
              background: "var(--theme-color-primary)",
              color: "var(--theme-color-primaryForeground)",
            }}
          >
            T
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight flex items-center gap-1.5">
              Theme Kit
              <span
                className="w-1.5 h-1.5 rounded-full pulse-soft"
                style={{ background: "var(--theme-color-success)" }}
                aria-hidden
              />
            </div>
            <div className="text-[11px] opacity-50 leading-tight mono">
              {theme.name}
            </div>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            background: "var(--theme-color-secondary)",
            color: "var(--theme-color-secondaryForeground)",
          }}
        >
          {family} · {mode}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="rounded-lg p-3.5 border"
          style={{
            background: "var(--theme-color-background)",
            borderColor: "var(--theme-color-border)",
          }}
        >
          <div className="text-[11px] uppercase tracking-wider opacity-50 font-semibold mb-1">
            Revenue
          </div>
          <div className="text-xl font-bold tracking-tight">$48,240</div>
          <div
            className="text-[11px] font-semibold mt-0.5"
            style={{ color: "var(--theme-color-primary)" }}
          >
            ▲ 12.4% this week
          </div>
          <Sparkline
            values={[38, 44, 41, 55, 52, 68, 74]}
            color="var(--theme-color-primary)"
          />
        </div>
        <div
          className="rounded-lg p-3.5 border"
          style={{
            background: "var(--theme-color-background)",
            borderColor: "var(--theme-color-border)",
          }}
        >
          <div className="text-[11px] uppercase tracking-wider opacity-50 font-semibold mb-1">
            Users
          </div>
          <div className="text-xl font-bold tracking-tight">12,842</div>
          <div
            className="text-[11px] font-semibold mt-0.5"
            style={{ color: "var(--theme-color-primary)" }}
          >
            ▲ 8.1% this week
          </div>
          {/*
            Deliberately not `--theme-color-accent`: accent is a background-tier
            token — in the default light theme it is `#e8e6ff`, so as text it
            measures ~1.1:1 and is invisible. Text needs 4.5:1, which only
            `primary` (5.3:1) meets here. `success` is fine for the sparkline
            because a non-text graphic only needs 3:1 (it measures 3.2:1).
            A card that displays a measured-contrast badge should not itself
            ship a failing pair.
          */}
          <Sparkline
            values={[52, 48, 58, 54, 62, 59, 66]}
            color="var(--theme-color-success)"
          />
        </div>
      </div>

      <div
        className="rounded-lg p-4 mb-4 border"
        style={{
          background: "var(--theme-color-background)",
          borderColor: "var(--theme-color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider opacity-50 font-semibold">
            Activity
          </span>
          <span className="mono text-[10px] opacity-40">--theme-color-*</span>
        </div>
        <div className="flex items-end gap-2 h-14">
          {[40, 65, 45, 80, 55, 95, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background:
                  i === 5
                    ? "var(--theme-color-primary)"
                    : "var(--theme-color-muted)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-1.5">
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              className="flex-1 text-center text-[9px] font-medium"
              style={{ opacity: i === 5 ? 0.85 : 0.35 }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {[
          { key: "primary", label: "primary" },
          { key: "secondary", label: "secondary" },
          { key: "accent", label: "accent" },
          { key: "muted", label: "muted" },
          { key: "success", label: "success" },
          { key: "destructive", label: "destructive" },
          { key: "ring", label: "ring" },
        ].map((s) => (
          <div
            key={s.key}
            title={colors[s.key] ?? `--theme-color-${s.key}`}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold"
            style={{
              background: "var(--theme-color-background)",
              borderColor: "var(--theme-color-border)",
              color: "var(--theme-color-foreground)",
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: `var(--theme-color-${s.key})`,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
              }}
            />
            {s.label}
          </div>
        ))}
      </div>

      {ratio !== null ? (
        <div className="flex items-center justify-center gap-2 mb-4 text-[10px]">
          <span
            className="px-1.5 py-0.5 rounded-md font-semibold"
            style={{
              background:
                ratio >= 4.5
                  ? "color-mix(in srgb, var(--theme-color-success) 15%, transparent)"
                  : "color-mix(in srgb, var(--theme-color-destructive) 15%, transparent)",
              color:
                ratio >= 4.5
                  ? "var(--theme-color-success)"
                  : "var(--theme-color-destructive)",
            }}
          >
            {ratio >= 4.5 ? "AA" : "AA Large"} {ratio.toFixed(1)}:1
          </span>
          <span className="opacity-45 mono">foreground on background</span>
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="btn btn-primary btn-sm w-full select-none pointer-events-none"
      >
        Every token re-styles this card
      </div>
    </div>
  );
}

function FamilyChips() {
  const runtime = useThemeRuntime();
  const { family } = useTheme();
  const setFamily = useSetThemeFamily();

  const families = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of runtime.themes) {
      const f = t.meta?.family;
      if (f && !seen.has(f) && !["theme-kit", "lab", "scope"].includes(f)) {
        seen.add(f);
        result.push(f);
      }
    }
    return result;
  }, [runtime.themes]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {families.slice(0, 8).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setFamily(f)}
          aria-pressed={family === f}
          className={`chip ${family === f ? "chip-active" : ""}`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

const MODE_LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

/**
 * Live code sample. Reflects the family/mode the visitor just picked (family
 * via the chips below, mode via the top-navigation toggle), so the visible
 * result and the code that produced it stay in sync.
 */
function LiveCodeSample() {
  const { family, mode, theme } = useTheme();
  const currentFamily = family ?? "default";
  const themeName = theme?.name ?? `${currentFamily}-${mode}`;
  const currentMode = mode in MODE_LABELS ? mode : "light";

  const code = useMemo(
    () =>
      `import { createThemeRuntime } from "@theme-kit/core";

// Applied on this page right now: ${themeName}
const runtime = createThemeRuntime();

runtime.selection.setFamily("${currentFamily}"); // swap the palette
runtime.selection.setMode("${currentMode}");      // swap light/dark`,
    [themeName, currentFamily, currentMode],
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <CodeBlock
        html={highlightCode(code, "tsx", { lineNumbers: false })}
        code={code}
        language="tsx"
        filename={`Live · ${currentFamily} · ${currentMode}`}
        className="rounded-xl !m-0"
      />
    </div>
  );
}

const PARTICLES = [
  { left: "6%", size: 3, dur: 12, delay: 0, x: 18, o: 0.35 },
  { left: "18%", size: 2, dur: 15, delay: 2.5, x: -14, o: 0.28 },
  { left: "30%", size: 4, dur: 13, delay: 1.2, x: 26, o: 0.4 },
  { left: "44%", size: 2, dur: 16, delay: 4, x: -22, o: 0.25 },
  { left: "56%", size: 3, dur: 11.5, delay: 0.8, x: 16, o: 0.35 },
  { left: "66%", size: 2, dur: 14.5, delay: 3.2, x: -20, o: 0.3 },
  { left: "74%", size: 4, dur: 12.5, delay: 1.8, x: 24, o: 0.4 },
  { left: "85%", size: 3, dur: 15, delay: 5, x: -16, o: 0.3 },
  { left: "93%", size: 2, dur: 12, delay: 2.2, x: 14, o: 0.25 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-bg" aria-hidden />
      <div className="hero-aurora" aria-hidden />
      <div className="hero-particles" aria-hidden>
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hero-particle"
            style={
              {
                left: p.left,
                width: p.size,
                height: p.size,
                background:
                  p.size >= 3
                    ? "var(--theme-color-primary)"
                    : "var(--theme-color-accent)",
                "--p-dur": `${p.dur}s`,
                "--p-delay": `${p.delay}s`,
                "--p-x": `${p.x}px`,
                "--p-o": p.o,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="hero-orb hero-orb-1" aria-hidden />
      <div className="hero-orb hero-orb-2" aria-hidden />
      <div className="hero-grid" aria-hidden />
      <div className="hero-vignette" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="fade-up fade-up-1 flex justify-center mb-6">
          <span className="chip cursor-default">
            <span
              className="w-2 h-2 rounded-full pulse-soft"
              style={{ background: "var(--theme-color-primary)" }}
            />
            Framework-agnostic theming
          </span>
        </div>

        <h1 className="fade-up fade-up-2 text-4xl sm:text-6xl font-bold tracking-tight mb-5 text-balance">
          The theming runtime for{" "}
          <span className="gradient-text">modern applications.</span>
        </h1>

        <p className="fade-up fade-up-3 mx-auto max-w-2xl text-base sm:text-lg opacity-70 mb-8 leading-relaxed text-balance">
          Semantic tokens, theme families, SSR-safe hydration, smooth
          transitions, scoped themes, and adapters — a runtime designed to stay
          out of your way.
        </p>

        <div className="fade-up fade-up-3 flex flex-wrap items-center justify-center gap-3 mb-10">
          <Button href="/get-started" size="lg">
            Get started
          </Button>
          <Button href="/theme-studio" variant="ghost" size="lg">
            Explore themes
          </Button>
        </div>

        <div className="fade-up fade-up-3 mb-12 flex flex-col items-center gap-2">
          {/*
            Framework-agnostic on purpose. This used to read
            `@theme-kit/core @theme-kit/react`, which quietly framed Theme Kit as
            a React library on the page that has to communicate the opposite —
            React is one adapter among ten. `@theme-kit/<your-framework>` states
            the shape: core, plus the adapter for whichever stack you use.
          */}
          <code className="chip mono text-xs sm:text-sm px-4 py-2">
            npm install @theme-kit/core @theme-kit/&lt;your-framework&gt;
          </code>
          <span className="text-xs opacity-60">
            React · Next.js · Vue · Nuxt · Svelte · Solid · Angular · Astro ·
            Remix · Web Components
          </span>
          <Link
            href="/cli/quickstart"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity no-underline"
          >
            Build themes from the terminal with{" "}
            <code className="mono">theme-kit generate</code> → Read CLI docs →
          </Link>
        </div>

        <div className="fade-up fade-up-4 mb-6">
          <DashboardPreview />
        </div>

        <div className="fade-up fade-up-4 mb-8 flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest opacity-40 font-semibold">
            Palette —{" "}
            <span className="opacity-60 normal-case tracking-normal">
              click to switch live; use the top-nav toggle for light/dark
            </span>
          </p>
          <FamilyChips />
        </div>

        <div className="fade-up fade-up-5 mb-4">
          <p className="text-xs uppercase tracking-widest opacity-40 font-semibold mb-3 text-center">
            Try changing the theme, and see the code reflect it live
          </p>
          <LiveCodeSample />
        </div>

        <div className="fade-up fade-up-5 mt-10 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {frameworks.slice(0, 11).map((fw) => (
              <Link
                key={fw.slug}
                href={`/framework-guides/${fw.slug}`}
                className="flex items-center gap-1.5 no-underline opacity-50 hover:opacity-100 transition-opacity"
              >
                <span className="text-base">{fw.icon}</span>
                <span className="text-[11px] font-medium">{fw.name}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] opacity-50">
            <span>11 frameworks</span>
            <span aria-hidden>·</span>
            <span>MIT licensed</span>
            <span aria-hidden>·</span>
            <span>Zero runtime dependencies</span>
            <span aria-hidden>·</span>
            <Link
              href="/changelog"
              className="hover:opacity-100 transition-opacity no-underline"
            >
              {PKG_VERSION_BADGE}
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/known-limitations"
              className="hover:opacity-100 transition-opacity no-underline"
            >
              Known limitations
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
