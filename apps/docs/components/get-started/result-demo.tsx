"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
  useSetThemeMode,
} from "@theme-kit/next/client";

const TOKEN_KEYS = ["background", "card", "primary", "secondary", "accent", "muted", "success", "border"];

export function ResultDemo() {
  const runtime = useThemeRuntime();
  const { theme, family, mode } = useTheme();
  const setFamily = useSetThemeFamily();
  const setMode = useSetThemeMode();

  const families = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of runtime.themes) {
      const f = t.meta?.family;
      if (f && !seen.has(f)) {
        seen.add(f);
        result.push(f);
      }
    }
    return result.slice(0, 8);
  }, [runtime.themes]);

  const controls = [
    {
      label: "Theme",
      action: (
        <span className="mono text-[11px] opacity-70 bg-muted/50 px-2 py-1 rounded-md">
          {theme.name}
        </span>
      ),
    },
    {
      label: "Family",
      action: (
        <span className="flex flex-wrap gap-1.5">
          {families.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFamily(f)}
              className={`chip px-2! py-0.5! text-[11px]! ${f === family ? "chip-active" : ""}`}
            >
              {f}
            </button>
          ))}
        </span>
      ),
    },
    {
      label: "Mode",
      action: (
        <span className="flex gap-1.5">
          {(["light", "dark", "system"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`chip px-2! py-0.5! text-[11px]! ${mode === m ? "chip-active" : ""}`}
            >
              {m === "system" ? "System" : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </span>
      ),
    },
    {
      label: "Primary color",
      action: (
        <Link
          href="/theme-studio"
          className="text-[11px] font-semibold text-primary no-underline hover:underline"
        >
          Theme Studio →
        </Link>
      ),
    },
    {
      label: "Radius",
      action: (
        <Link
          href="/playground"
          className="text-[11px] font-semibold text-primary no-underline hover:underline"
        >
          Playground →
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/30">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--theme-color-destructive, #ef4444)" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--theme-color-accent, #eab308)" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--theme-color-primary)" }} />
          <span className="ml-2 mono text-[10px] opacity-40">
            your-app · semantic tokens are powering this UI
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center text-lg font-bold"
              style={{
                background: "var(--theme-color-primary)",
                color: "var(--theme-color-primary-foreground, #fff)",
              }}
            >
              T
            </div>
            <div>
              <div className="font-semibold">Welcome to Theme Kit</div>
              <div className="mono text-[11px] opacity-50">
                {theme.name} · {family} · {mode}
              </div>
            </div>
            <span
              className="ml-auto px-3 py-1.5 rounded-md text-xs font-semibold"
              style={{
                background: "var(--theme-color-secondary)",
                color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
              }}
            >
              Live · no refresh
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div
              className="rounded-lg p-4 border"
              style={{
                background: "var(--theme-color-card)",
                borderColor: "var(--theme-color-border)",
                color: "var(--theme-color-card-foreground, var(--theme-color-cardForeground))",
              }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-50 mb-3">
                Semantic tokens
              </div>
              <div className="flex gap-2 mb-3">
                {TOKEN_KEYS.map((key) => (
                  <span
                    key={key}
                    className="w-6 h-6 rounded-md border border-black/10"
                    style={{ background: `var(--theme-color-${key})` }}
                    title={`colors.${key}`}
                  />
                ))}
              </div>
              <div
                className="px-3 py-2 rounded-lg text-xs font-semibold inline-block"
                style={{
                  background: "var(--theme-color-primary)",
                  color: "var(--theme-color-primary-foreground, #fff)",
                }}
              >
                Get started
              </div>
            </div>

            <div
              className="rounded-lg p-4 border"
              style={{
                background: "var(--theme-color-card)",
                borderColor: "var(--theme-color-border)",
                color: "var(--theme-color-card-foreground, var(--theme-color-cardForeground))",
              }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-50 mb-3">
                Theme switcher
              </div>
              <div className="flex flex-wrap gap-2">
                {(["Light", "Dark"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setMode(label.toLowerCase() as "light" | "dark")}
                    className={`chip px-3! py-1.5! text-xs! ${
                      mode === label.toLowerCase() ? "chip-active" : ""
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] opacity-50 mt-3 leading-relaxed">
                One <span className="mono">setMode()</span> call — everything on
                this screen follows.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-semibold mb-3">Try changing:</h3>
      <div className="flex flex-col gap-3">
        {controls.map((row) => (
          <div
            key={row.label}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3"
          >
            <span className="text-sm font-medium">{row.label}</span>
            {row.action}
          </div>
        ))}
      </div>
    </div>
  );
}