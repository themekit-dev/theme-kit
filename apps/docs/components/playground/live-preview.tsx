"use client";

import { useTheme } from "@theme-kit/next/client";

const swatchKeys = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "accent",
  "muted",
  "success",
  "destructive",
  "border",
  "ring",
  "card",
];

export function LivePreview() {
  const { theme, family, mode } = useTheme();

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      aria-label="Live theme preview"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Live preview</h2>
        <span className="mono text-[11px] px-2.5 py-1 rounded-full border border-border opacity-80">
          {family} · {mode}
        </span>
      </div>

      <div
        className="rounded-xl border p-5"
        style={{
          background: "var(--theme-color-card)",
          borderColor: "var(--theme-color-border)",
          color: "var(--theme-color-card-foreground, var(--theme-color-cardForeground))",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-lg grid place-items-center font-bold"
            style={{
              background: "var(--theme-color-primary)",
              color: "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
            }}
          >
            T
          </div>
          <div>
            <div className="font-semibold leading-tight">Theme Kit</div>
            <div className="text-[11px] opacity-50 mono">{theme.name}</div>
          </div>
          <div
            className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: "var(--theme-color-secondary)",
              color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
            }}
          >
            Re-themed live
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 mb-5">
          <div
            className="rounded-lg border px-3 py-2"
            style={{
              background: "var(--theme-color-muted)",
              borderColor: "var(--theme-color-border)",
              color: "var(--theme-color-muted-foreground, var(--theme-color-mutedForeground))",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">
              Muted card
            </div>
            <div className="text-sm font-medium">Token-driven UI</div>
          </div>
          <div
            className="rounded-lg border px-3 py-2"
            style={{
              background: "var(--theme-color-accent)",
              borderColor: "var(--theme-color-border)",
              color: "var(--theme-color-accent-foreground, var(--theme-color-accentForeground))",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">
              Accent
            </div>
            <div className="text-sm font-medium">Swaps with the theme</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">
            Semantic swatches
          </span>
          <span className="mono text-[10px] opacity-40">--theme-color-*</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {swatchKeys.map((key) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-md border border-black/10 swatch"
                style={{ background: `var(--theme-color-${key})` }}
                title={`--theme-color-${key}`}
              />
              <span className="mono text-[9px] opacity-50">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
