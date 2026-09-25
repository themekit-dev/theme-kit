"use client";

import { useMemo, useState } from "react";
import { ThemeScope, useTheme, useThemeRuntime } from "@theme-kit/next/client";
import type { ThemeDefinition } from "@theme-kit/core";

type PreviewMode = "light" | "dark";

interface PresetGroup {
  family: string;
  label: string;
  light?: ThemeDefinition | undefined;
  dark?: ThemeDefinition | undefined;
}

/**
 * Families that belong to other playground demos (`ThemeScope` and the
 * accessibility lab), not to the preset grid.
 */
const HIDDEN_FAMILIES = new Set(["lab", "scope"]);

const MODES: readonly PreviewMode[] = ["light", "dark"];

const SWATCHES = [
  { token: "primary", className: "bg-primary" },
  { token: "secondary", className: "bg-secondary" },
  { token: "accent", className: "bg-accent" },
  { token: "muted", className: "bg-muted" },
] as const;

function modeOf(theme: ThemeDefinition): PreviewMode {
  return theme.meta?.mode === "dark" ? "dark" : "light";
}

/**
 * Read a flat color token. `ThemeColors` allows nested objects and
 * `undefined`, so anything that is not a plain string is ignored.
 */
function colorOf(
  theme: ThemeDefinition | undefined,
  token: string,
): string | undefined {
  const value = theme?.tokens?.colors?.[token];
  return typeof value === "string" ? value : undefined;
}

/**
 * Collapse the registry into one card per family, keeping BOTH the light and
 * the dark definition.
 *
 * The previous implementation bailed out of a family as soon as it had seen
 * one theme (`seen` set), so each group only ever carried a single mode. Every
 * card therefore had no counterpart for the other mode, `themeForCard` came
 * back `undefined`, and the preview fell through to hardcoded placeholder
 * hexes instead of the preset's real colors.
 */
function groupByFamily(themes: readonly ThemeDefinition[]): PresetGroup[] {
  const groups = new Map<string, PresetGroup>();

  for (const theme of themes) {
    const family = theme.meta?.family;
    if (!family || HIDDEN_FAMILIES.has(family)) continue;

    let group = groups.get(family);
    if (!group) {
      const created: PresetGroup = {
        family,
        label: theme.meta?.label?.replace(/\s+(Light|Dark)$/i, "") ?? family,
        light: undefined,
        dark: undefined,
      };
      groups.set(family, created);
      group = created;
    }

    if (modeOf(theme) === "dark") {
      group.dark ??= theme;
    } else {
      group.light ??= theme;
    }
  }

  return [...groups.values()].filter((group) => group.light || group.dark);
}

/**
 * One card per theme family. Each card previews its own family through
 * `ThemeScope`, so the preset's real Theme Kit colors apply inside the card
 * and the light/dark toggle is local to that card — it never touches the
 * global runtime. "Use this theme" is the only thing that does: it applies the
 * previewed family *and* mode to the whole documentation site.
 */
export function PresetCards() {
  const runtime = useThemeRuntime();
  const { theme, family, mode, setFamily, setMode } = useTheme();

  const groups = useMemo(() => groupByFamily(runtime.themes), [runtime.themes]);

  // The site's effective mode — a "system" selection is already resolved into
  // the active theme. Cards default to it (and keep following it) until the
  // visitor toggles that specific card, after which the card is pinned.
  const siteMode: PreviewMode = theme?.meta?.mode === "dark" ? "dark" : "light";

  const [previewModes, setPreviewModes] = useState<Record<string, PreviewMode>>(
    {},
  );
  const previewModeOf = (group: PresetGroup): PreviewMode =>
    previewModes[group.family] ?? siteMode;

  const setPreviewMode = (group: PresetGroup, value: PreviewMode) => {
    setPreviewModes((prev) => ({ ...prev, [group.family]: value }));
  };

  // Active family first, everything else in registry order.
  const ordered = useMemo(() => {
    const active = groups.filter((group) => group.family === family);
    const rest = groups.filter((group) => group.family !== family);
    return [...active, ...rest];
  }, [groups, family]);

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      aria-label="Theme preset cards"
    >
      <div className="mb-4">
        <h2 className="font-semibold">Theme presets</h2>
        <p className="max-w-2xl text-xs opacity-60">
          Every card previews one preset family using that family&apos;s real
          Theme Kit tokens, with its own light/dark toggle — switching a card
          never changes the site. “Use this theme” is what applies it: the whole
          documentation site switches to the previewed family and mode.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mono text-[11px] uppercase tracking-widest opacity-50">
          Site mode
        </span>
        {(["light", "dark", "system"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
            className={`chip ${mode === value ? "chip-active" : ""}`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((group) => {
          const isActive = family === group.family;
          const previewMode = previewModeOf(group);
          const previewTheme =
            previewMode === "dark"
              ? (group.dark ?? group.light)
              : (group.light ?? group.dark);
          if (!previewTheme) return null;

          const applied = isActive && siteMode === previewMode;

          return (
            <ThemeScope
              key={group.family}
              theme={String(previewTheme.name)}
              transition={false}
              className={[
                "flex flex-col rounded-lg border border-border bg-card p-4 text-card-foreground",
                isActive ? "ring-2 ring-primary" : "hover:shadow-md",
              ].join(" ")}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {group.label}
                  </div>
                  <div className="mono truncate text-[11px] opacity-50">
                    {group.family}
                  </div>
                </div>
                {isActive && (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Active
                  </span>
                )}
              </div>

              <div
                role="group"
                aria-label={`${group.label} preview mode`}
                className="mb-3 flex gap-0.5 rounded-md bg-muted p-0.5"
              >
                {MODES.map((value) => {
                  const unavailable = value === "dark" && !group.dark;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreviewMode(group, value)}
                      aria-pressed={previewMode === value}
                      disabled={unavailable}
                      className={[
                        "flex-1 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                        previewMode === value
                          ? "bg-secondary-foreground/30 text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                        unavailable
                          ? "cursor-not-allowed opacity-40"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>

              <div className="mb-3 overflow-hidden rounded-md border border-border bg-background">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="h-2 w-2 rounded-full bg-success" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-foreground">
                    {group.label}
                  </div>
                  <div className="mono mt-0.5 text-[10px] text-muted-foreground">
                    {colorOf(previewTheme, "foreground")} on{" "}
                    {colorOf(previewTheme, "background")}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {SWATCHES.map(({ token, className }) => (
                      <div
                        key={token}
                        className="flex items-center gap-1"
                        title={`${token}: ${colorOf(previewTheme, token) ?? "—"}`}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full border border-border ${className}`}
                        />
                        <span className="mono text-[9px] text-muted-foreground">
                          {token}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFamily(group.family);
                  setMode(previewMode);
                }}
                disabled={applied}
                className="mt-auto w-full cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applied ? "Applied" : "Use this theme"}
              </button>
            </ThemeScope>
          );
        })}
      </div>
    </section>
  );
}
