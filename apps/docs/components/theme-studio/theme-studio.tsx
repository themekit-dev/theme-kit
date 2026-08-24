"use client";

import { useId, useMemo, useState } from "react";
import { generateTheme, type GeneratedThemePair } from "@theme-kit/core";
import { useThemeRuntime } from "@theme-kit/next/client";
import { CopyButton } from "../ui/copy-button";
import { highlightCode } from "../../lib/highlight";

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const PRESETS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#14b8a6",
];

type TokenColors = Record<string, string>;

const glassCard = cn(
  "rounded-2xl border border-border/50 bg-background/60",
  "backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-white/5",
  "transition-all motion-reduce:transition-none",
);

function ThemePreview({
  theme,
  title,
  onApply,
}: {
  theme: ReturnType<typeof generateTheme>["light"];
  title: string;
  onApply: () => void;
}) {
  const colors = (theme.tokens?.colors ?? {}) as TokenColors;
  const keys = [
    "background",
    "foreground",
    "card",
    "primary",
    "primaryForeground",
    "secondary",
    "accent",
    "muted",
    "success",
    "destructive",
    "border",
    "ring",
  ];

  return (
    <div
      className={cn(
        glassCard,
        "overflow-hidden hover:shadow-xl hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
      )}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5 sm:px-4 sm:py-3"
        style={{
          background: colors.card,
          color: colors.cardForeground,
        }}
      >
        <span className="truncate text-sm font-semibold capitalize">
          {theme.meta?.label ?? title}
        </span>
        <span className="shrink-0 font-mono text-[11px] opacity-50">
          {theme.name}
        </span>
      </div>

      {/* Card body */}
      <div
        className="p-3.5 sm:p-4"
        style={{ background: colors.background, color: colors.foreground }}
      >
        <div
          className="mb-3 flex items-center gap-3"
          style={{ color: colors.foreground }}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
            style={{
              background: colors.primary,
              color: colors.primaryForeground,
            }}
          >
            A
          </div>
          <div className="min-w-0 text-sm font-semibold leading-tight">
            <span className="block truncate">Generated {title} theme</span>
            <div className="truncate text-[11px] font-normal opacity-50">
              Derived from your seed with HSL math
            </div>
          </div>
        </div>

        {/* Color swatches */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {keys
            .filter((k) => colors[k])
            .map((k) => (
              <div
                key={k}
                className="h-7 w-7 rounded-md border border-black/10"
                style={{ background: colors[k] }}
                title={`${k}: ${colors[k]}`}
              />
            ))}
        </div>

        <button
          type="button"
          onClick={onApply}
          className={cn(
            "w-full rounded-xl px-4 py-2.5 text-sm font-semibold",
            "cursor-pointer transition-all motion-reduce:transition-none",
            "hover:brightness-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "active:translate-y-px",
          )}
          style={{
            background: colors.primary,
            color: colors.primaryForeground,
          }}
        >
          Apply {title} to this site
        </button>
      </div>
    </div>
  );
}

export function ThemeStudio({ compact = false }: { compact?: boolean }) {
  const runtime = useThemeRuntime();
  const [seed, setSeed] = useState("#6366f1");
  const [family, setFamily] = useState("indigo");
  const [applied, setApplied] = useState<string | null>(null);

  const seedInputId = useId();
  const familyInputId = useId();

  const isValid = /^#[0-9a-fA-F]{6}$/.test(seed);

  const pair: GeneratedThemePair | null = useMemo(() => {
    if (!isValid) return null;
    return generateTheme({
      seed,
      family: family.trim() || seed.replace("#", ""),
    });
  }, [seed, family, isValid]);

  const css = useMemo(() => {
    if (!pair) return "";
    return Object.entries(pair.light.tokens?.colors ?? {})
      .map(([k, v]) => `--theme-color-${k}: ${v};`)
      .join("\n");
  }, [pair]);

  const json = useMemo(() => JSON.stringify(pair ?? null, null, 2), [pair]);

  function apply(kind: "light" | "dark") {
    if (!pair) return;
    runtime.update((kind === "light" ? pair.light : pair.dark).tokens ?? {});
    setApplied(`${family.trim() || seed}-${kind}`);
  }

  return (
    <div className="w-full min-w-0">
      {!compact && (
        <header className="mb-6 sm:mb-8">
          {/* Badge / chip */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: "var(--theme-color-primary)" }}
            />
            Theme Studio
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Generate a theme from a seed
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed opacity-70 sm:text-base">
            Pick a seed color and Theme Kit derives a complete light + dark pair
            — secondary, muted, accent, border and ring colors are all computed
            with HSL math by{" "}
            <code className="font-mono text-[0.9em]">generateTheme()</code>.
            Apply it to this very site to see the runtime re-theme everything
            live.
          </p>
        </header>
      )}

      <div className="grid min-w-0 items-start gap-6 ">
        {/* Sidebar: controls only */}
        <div className="flex min-w-0 flex-col gap-6 lg:top-6 lg:self-start">
          <div className={cn(glassCard, "p-4 sm:p-5")}>
            <label
              htmlFor={seedInputId}
              className="grid gap-2 text-sm font-medium"
            >
              Seed color
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id={seedInputId}
                  type="color"
                  value={isValid ? seed : "#6366f1"}
                  onChange={(e) => setSeed(e.target.value)}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-xl border border-border bg-transparent p-1 sm:h-12 sm:w-12"
                  aria-label="Seed color picker"
                />
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className={cn(
                    "min-w-36 flex-1 rounded-xl border bg-muted px-3 py-2.5 font-mono text-sm outline-none transition-colors",
                    "focus:border-ring",
                    isValid ? "border-border" : "border-red-500/60",
                  )}
                  placeholder="#6366f1"
                  spellCheck={false}
                  inputMode="text"
                  aria-invalid={!isValid}
                />
              </div>
              {!isValid && (
                <span className="text-xs text-red-500">
                  Enter a valid 6-digit hex color, e.g. #6366f1.
                </span>
              )}
            </label>

            {/* Preset swatches */}
            <div className="mt-3 flex flex-wrap gap-2 sm:gap-1.5">
              {PRESETS.map((p) => {
                const isActive = seed.toLowerCase() === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSeed(p)}
                    aria-label={`Use ${p}`}
                    aria-pressed={isActive}
                    className={cn(
                      "h-8 w-8 shrink-0 rounded-full border-2 transition-transform hover:scale-110 motion-reduce:hover:scale-100",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "sm:h-7 sm:w-7",
                      isActive ? "scale-110 border-ring" : "border-transparent",
                    )}
                    style={{ background: p }}
                  />
                );
              })}
            </div>

            <label
              htmlFor={familyInputId}
              className="mt-4 grid gap-1.5 text-sm font-medium"
            >
              Family name
              <input
                id={familyInputId}
                type="text"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-ring"
                placeholder="indigo"
                spellCheck={false}
              />
            </label>

            <p
              className="mt-3 flex min-h-[1rem] items-center gap-1.5 text-xs opacity-60"
              role="status"
              aria-live="polite"
            >
              {applied && (
                <>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--theme-color-success)" }}
                  />
                  <span className="truncate">
                    Applied <code className="font-mono">{applied}</code> to the
                    live runtime.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Main content: theme previews */}
        <div className="flex min-w-0 flex-col gap-6">
          {!pair ? (
            <p className={cn(glassCard, "p-6 text-sm opacity-60")}>
              Enter a valid 6-digit hex color to generate a theme pair.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <ThemePreview
                theme={pair.light}
                title="light"
                onApply={() => apply("light")}
              />
              <ThemePreview
                theme={pair.dark}
                title="dark"
                onApply={() => apply("dark")}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 lg:mt-8">
        {pair ? (
          <div className="code-block overflow-hidden">
            <div className="code-block-toolbar">
              <span className="code-block-filename" title="Theme JSON">
                Theme JSON
              </span>
              <div className="flex items-center gap-1.5">
                <code className="truncate mono text-[11px] opacity-40">
                  {pair.light.name} · {pair.dark.name}
                </code>
                <span className="code-block-lang">json</span>
                <CopyButton
                  text={json}
                  label="Copy"
                  copiedLabel="Copied"
                  className="code-block-copy"
                />
              </div>
            </div>
            <div
              className="max-h-72 overflow-auto sm:max-h-96"
              dangerouslySetInnerHTML={{
                __html: highlightCode(json, "json"),
              }}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm opacity-60">
              Generated tokens will appear here once you enter a valid seed
              color.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
