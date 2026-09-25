"use client";

import { Icon } from "@iconify/react";

import { Avatar, AvatarStack, Btn, Frame, Pill, type CompositionProps } from "../ui";

/**
 * Marketing site — deliberately the odd one out.
 *
 * Every other scene is a dense application surface. This one is spacious and
 * editorial: larger type, generous whitespace, a centered hero and a logo band.
 * That contrast is the point — it proves the same tokens drive both a data-dense
 * dashboard and a marketing page without either looking like a compromise.
 */

const NAV = ["Product", "Solutions", "Pricing", "Docs", "Blog"];

const LOGOS = ["Northwind", "Vertex", "Lumen", "Cobalt", "Arclight"];

const FEATURES = [
  {
    icon: "ph:palette",
    title: "Semantic tokens",
    body: "One token set drives every surface, so a theme change lands everywhere at once.",
  },
  {
    icon: "ph:lightning",
    title: "Zero-flash",
    body: "The theme resolves before first paint, on the server, with no flicker.",
  },
  {
    icon: "ph:shield-check",
    title: "Accessible by default",
    body: "Contrast checks and CVD simulation ship with the runtime, not as an afterthought.",
  },
];

const STATS = [
  { value: "34", label: "built-in themes" },
  { value: "15", label: "families" },
  { value: "24", label: "packages" },
  { value: "0", label: "flashes" },
];

export function MarketingComposition({ chrome = true }: CompositionProps) {
  return (
    <Frame
      title="acme.com"
      chrome={chrome}
      toolbar={
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Sign in</span>
          <Avatar label="A" />
        </div>
      }
    >
      <div className="h-full w-full overflow-hidden bg-background text-foreground">
        {/* nav */}
        <div className="h-11 flex items-center gap-6 px-5 border-b border-border/60">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-5 h-5 rounded-md bg-primary" aria-hidden />
            <span className="text-[12px] font-semibold tracking-tight">Acme</span>
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-[11px] text-muted-foreground">
            {NAV.map((n, i) => (
              <span key={n} className={i === 0 ? "text-foreground font-medium" : ""}>
                {n}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[11px] text-muted-foreground">Sign in</span>
            <Btn>Get started</Btn>
          </div>
        </div>

        {/* hero */}
        <div className="relative px-5 pt-8 pb-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />
              v1.3 is out — 15 theme families
            </span>

            <div className="mt-3.5 text-[26px] sm:text-[32px] font-semibold tracking-tight leading-[1.1] max-w-2xl mx-auto">
              Theming that finally
              <br />
              <span className="text-primary">works everywhere</span>
            </div>

            <p className="mt-2.5 text-[12px] text-muted-foreground leading-relaxed max-w-md mx-auto">
              One runtime for React, Vue, Svelte, Solid, Angular and plain HTML.
              Semantic tokens, zero-flash SSR, and a theme your whole team can ship.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Btn icon="ph:rocket-launch">Start free</Btn>
              <Btn variant="outline" icon="ph:book-open">
                Read the docs
              </Btn>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              No credit card · MIT licensed · 5 minute setup
            </div>
          </div>
        </div>

        {/* logo band */}
        <div className="px-5 pb-5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground text-center mb-2.5">
            Trusted by teams shipping design systems
          </div>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {LOGOS.map((l) => (
              <span
                key={l}
                className="text-[13px] font-semibold tracking-tight text-muted-foreground/60"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* features */}
        <div className="px-5 pb-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-3.5 text-left"
              >
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
                  <Icon icon={f.icon} width={14} height={14} />
                </span>
                <div className="mt-2.5 text-[12px] font-semibold">{f.title}</div>
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed m-0">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* stats + testimonial */}
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-border bg-card p-4 grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-[20px] font-semibold tabular-nums leading-none">
                    {s.value}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
              <p className="text-[10px] leading-relaxed m-0 text-muted-foreground">
                “We replaced three bespoke theming layers with Theme Kit and shipped
                a rebrand in a day.”
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <AvatarStack labels={["M"]} max={1} />
                <div className="min-w-0">
                  <div className="text-[10px] font-medium truncate">Mira Chen</div>
                  <div className="text-[9px] text-muted-foreground truncate">
                    Head of Design, Northwind
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* pricing teaser */}
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Pill tone="primary">Free forever</Pill>
                <span className="text-[9px] text-muted-foreground">MIT licensed</span>
              </div>
              <div className="text-[13px] font-semibold mt-1">
                Everything you need, on every plan
              </div>
              <div className="text-[10px] text-muted-foreground">
                All 24 packages · every family · no seat limits
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Btn variant="outline">Compare</Btn>
              <Btn icon="ph:arrow-right">Get started</Btn>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}
