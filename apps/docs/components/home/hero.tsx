"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
} from "@theme-kit/next/client";
import { Button } from "../ui/button";
import { frameworks } from "../../lib/frameworks";

function DashboardPreview() {
  const { theme, family, mode } = useTheme();

  return (
    <div
      className="glass-card hero-card float-y p-5 w-full max-w-md mx-auto"
      data-preview-card
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full grid place-items-center text-sm font-bold"
            style={{
              background: "var(--theme-color-primary)",
              color:
                "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
            }}
          >
            T
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Theme Kit</div>
            <div className="text-[11px] opacity-50 leading-tight mono">
              {theme.name}
            </div>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            background: "var(--theme-color-secondary)",
            color:
              "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
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
            style={{ color: "var(--theme-color-accent)" }}
          >
            ▲ 8.1% this week
          </div>
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
          <code className="chip mono text-xs sm:text-sm px-4 py-2">
            npm install @theme-kit/core @theme-kit/react
          </code>
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

        <p className="fade-up fade-up-4 mb-3 text-xs uppercase tracking-widest opacity-40 font-semibold">
          Try a family — click to switch live
        </p>
        <div className="fade-up fade-up-4">
          <FamilyChips />
        </div>

        <div className="fade-up fade-up-4 mt-10 pt-8 border-t border-border">
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
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] opacity-40">
            <span>11 frameworks</span>
            <span>·</span>
            <span>0 flash</span>
            <span>·</span>
            <span>100% type-safe</span>
            <span>·</span>
            <span>MIT licensed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
