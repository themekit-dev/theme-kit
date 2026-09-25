"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getBuiltInThemes } from "@theme-kit/core";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
  useSetThemeMode,
} from "@theme-kit/next/client";

import { COMPOSITIONS, type CompositionId } from "./compositions";
import {
  PRESENT_CATEGORIES,
  SHOWCASE,
  type ShowcaseCategory,
  type ShowcaseEntry,
} from "../../lib/showcase";
import { useFocusTrap } from "../ui/use-focus-trap";
import { useClickOutside } from "../ui/use-click-outside";

/**
 * Interactive showcase gallery.
 *
 * Navigation is a **filter bar**, not a table of contents: a gallery grows by
 * adding pieces, and a filter stays the same size while a TOC grows into a wall
 * of links. Tabs are derived from the categories that actually have pieces, so
 * an empty category never renders a dead end.
 *
 * Hierarchy is deliberate — one featured piece, then a two-column gallery.
 * Six equally-weighted full-width cards read as a documentation index; a
 * featured hero followed by a grid reads as a gallery.
 *
 * The Theme and Mode controls drive the *real* runtime, so every composition
 * restyles live — that is the page's whole argument.
 */

type Mode = "light" | "dark" | "system";
type Filter = ShowcaseCategory | "all";

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: "light", label: "Light", icon: "ph:sun" },
  { id: "system", label: "System", icon: "ph:circle-half" },
  { id: "dark", label: "Dark", icon: "ph:moon" },
];

function formatFamily(family: string): string {
  if (family === "default") return "Neutral";
  return family
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function primaryOf(theme: { tokens?: { colors?: { primary?: string } } | undefined }): string {
  return theme.tokens?.colors?.primary ?? "var(--theme-color-primary)";
}

/** A cropped viewport onto a composition. */
function Preview({
  id,
  height,
  chrome,
  interactive = false,
}: {
  id: CompositionId;
  height: string;
  chrome: boolean;
  interactive?: boolean;
}) {
  const Composition = COMPOSITIONS[id];
  return (
    <div
      className={`relative w-full ${height} overflow-hidden bg-background ${
        interactive ? "" : "pointer-events-none select-none"
      }`}
      aria-hidden={!interactive}
    >
      <Composition chrome={chrome} />
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
      <span
        className="w-1.5 h-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse"
        aria-hidden
      />
      Live preview
    </span>
  );
}

/* ------------------------------------------------------------- featured */

function FeaturedCard({
  entry,
  onOpen,
}: {
  entry: ShowcaseEntry;
  onOpen: (id: CompositionId) => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="relative border-b border-border">
        <LiveBadge />
        <Preview id={entry.id} height="h-[22rem] sm:h-[30rem]" chrome />
      </div>

      <div className="p-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">{entry.title}</h3>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed m-0 max-w-xl">
            {entry.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => onOpen(entry.id)}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground cursor-pointer"
            >
              Open showcase
            </button>
            <Link
              href={entry.implementationHref}
              className="text-sm text-primary hover:underline"
            >
              {entry.implementationLabel} →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            What it demonstrates
          </div>
          <ul className="space-y-2 m-0 p-0 list-none">
            {entry.demonstrates.map((d) => (
              <li key={d} className="flex gap-2 text-[13px] text-muted-foreground">
                <Icon
                  icon="ph:check-circle"
                  width={14}
                  height={14}
                  className="text-primary mt-0.5 shrink-0"
                />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- card */

function GalleryCard({
  entry,
  onOpen,
}: {
  entry: ShowcaseEntry;
  onOpen: (id: CompositionId) => void;
}) {
  return (
    <article className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="relative border-b border-border">
        <Preview id={entry.id} height="h-60 sm:h-72" chrome={false} />
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold tracking-tight">{entry.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed m-0 mt-1">
            {entry.tagline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {entry.tags.slice(0, 4).map((t, i) => (
            <span key={t} className="inline-flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="opacity-40">
                  ·
                </span>
              ) : null}
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-auto pt-1">
          <button
            type="button"
            onClick={() => onOpen(entry.id)}
            className="text-xs font-medium px-3.5 py-2 rounded-lg border border-border hover:border-ring cursor-pointer transition-colors"
          >
            Open
          </button>
          <Link
            href={entry.implementationHref}
            className="text-xs text-primary hover:underline"
          >
            {entry.implementationLabel} →
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- gallery */

export function ShowcaseGallery() {
  const { theme, family } = useTheme();
  const runtime = useThemeRuntime();
  const setFamily = useSetThemeFamily();
  const setMode = useSetThemeMode();

  const [mode, setLocalMode] = useState<Mode>("system");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<CompositionId | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open !== null);
  useClickOutside({ rootRef: dialogRef, open: false, setOpen: () => undefined });

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /**
   * Only the families Theme Kit ships with, out of the box.
   *
   * The docs site registers three extra families of its own (`theme-kit`, `lab`,
   * `scope`). Showing those would overstate the library — a reader would
   * reasonably assume they could install Theme Kit and select "Lab". Membership
   * in `getBuiltInThemes()` is the test, so a family the site adds later cannot
   * leak in.
   */
  const families = useMemo(() => {
    const themes = runtime.themes.length > 0 ? runtime.themes : getBuiltInThemes();
    const builtIn = new Set<string>();
    for (const t of getBuiltInThemes()) {
      builtIn.add((t.meta as { family?: string } | undefined)?.family ?? "default");
    }

    const seen = new Set<string>();
    const out: { family: string; label: string; color: string }[] = [];
    for (const t of themes) {
      const f = (t.meta as { family?: string } | undefined)?.family ?? "default";
      if (seen.has(f)) continue;
      seen.add(f);
      if (!builtIn.has(f)) continue; // site-only family — not part of the library
      out.push({ family: f, label: formatFamily(f), color: primaryOf(t as never) });
    }

    return out.sort((a, b) => {
      if (a.family === "default") return -1;
      if (b.family === "default") return 1;
      return a.label.localeCompare(b.label);
    });
  }, [runtime]);

  /**
   * A miniature of the semantic system: the same three tokens every composition
   * uses (surface, text, action), so switching family shows the tokens changing
   * rather than a row of near-white swatches.
   */
  const tokenPreview = useMemo(() => {
    const c = (theme as { tokens?: { colors?: Record<string, string> } } | null)?.tokens
      ?.colors;
    if (!c) return null;
    const bg = c.background ?? c.card;
    const fg = c.foreground;
    const primary = c.primary;
    const pf = c.primaryForeground;
    if (!bg || !fg || !primary) return null;
    return { bg, fg, primary, pf: pf ?? bg };
  }, [theme]);

  const visible = useMemo(
    () => (filter === "all" ? SHOWCASE : SHOWCASE.filter((s) => s.category === filter)),
    [filter],
  );

  const featured = visible.find((s) => s.hero) ?? visible[0];
  const rest = visible.filter((s) => s !== featured);

  const chooseMode = (next: Mode) => {
    setLocalMode(next);
    setMode(next);
  };

  const openEntry = SHOWCASE.find((s) => s.id === open) ?? null;
  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: SHOWCASE.length },
    ...PRESENT_CATEGORIES.map((c) => ({
      id: c.id as Filter,
      label: c.label,
      count: SHOWCASE.filter((s) => s.category === c.id).length,
    })),
  ];

  return (
    <div>
      {/* ------------------------------------------------ try theme kit */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <div className="text-base font-semibold">Try Theme Kit</div>
            <p className="text-[13px] text-muted-foreground m-0 mt-0.5 max-w-lg">
              These controls drive the real runtime. Pick a family or mode and every
              preview on this page restyles — same UI, same semantic tokens.
            </p>
          </div>
          {tokenPreview ? (
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Tokens
              </span>
              {/* surface · text · action — the three every composition reads */}
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5"
                style={{ background: tokenPreview.bg }}
                title="background · foreground · primary"
              >
                <span
                  className="w-9 h-1.5 rounded-full"
                  style={{ background: tokenPreview.fg }}
                />
                <span
                  className="w-7 h-3.5 rounded-[4px]"
                  style={{ background: tokenPreview.primary }}
                />
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-16">
            Theme
          </span>
          {families.map((f) => {
            const active = family === f.family;
            return (
              <button
                key={f.family}
                type="button"
                onClick={() => setFamily(f.family)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:border-ring"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                  style={{ background: f.color }}
                  aria-hidden
                />
                {f.label}
              </button>
            );
          })}
          {/*
            The docs site defaults to its own family, which is not part of the
            library. Without this the row would show nothing selected on first
            load and look broken.
          */}
          {!families.some((f) => f.family === family) ? (
            <span className="text-[10px] px-2 py-1 rounded-lg border border-dashed border-border text-muted-foreground">
              this site is using its own family ({formatFamily(family)}) — pick one
              to preview a shipped family
            </span>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0 mb-3 pl-[4.5rem]">
          These {families.length} families ship with Theme Kit. The site&apos;s own
          families are not listed.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-16">
            Mode
          </span>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => chooseMode(m.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:border-ring"
                }`}
              >
                <Icon icon={m.icon} width={12} height={12} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------- explore */}
      <div className="mt-8 mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Explore
          </h2>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {visible.length} of {SHOWCASE.length} showcases
          </span>
        </div>
        <div
          role="group"
          aria-label="Filter showcases by category"
          className="flex flex-wrap items-center gap-2"
        >
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                aria-pressed={active}
                className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary text-primary-foreground font-medium"
                    : "border-border bg-card text-muted-foreground hover:border-ring hover:text-foreground"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 text-[11px] ${active ? "opacity-70" : "opacity-50"}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------ featured */}
      {featured ? (
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Featured
          </h2>
          <FeaturedCard entry={featured} onOpen={setOpen} />
        </section>
      ) : null}

      {/* ------------------------------------------------------- gallery */}
      {rest.length > 0 ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Gallery
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((entry) => (
              <GalleryCard key={entry.id} entry={entry} onOpen={setOpen} />
            ))}
          </div>
        </section>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10">
          Nothing in this category yet.
        </p>
      ) : null}

      {/* ----------------------------------------------------- immersive */}
      {/*
        The wrapper fades as a whole. Putting the opacity only on the backdrop
        left the panel painted (scaled down) over the page whenever the overlay
        was closed — it stayed `inert` for assistive tech, but it was still
        visible. `inert` + `aria-hidden` handle semantics; this handles pixels.
      */}
      <div
        className={`fixed inset-0 z-90 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={open === null}
        inert={open === null}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(null)}
          aria-hidden
        />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={openEntry ? `${openEntry.title} preview` : "Showcase preview"}
          tabIndex={open === null ? undefined : -1}
          className={`absolute inset-3 sm:inset-6 lg:inset-10 rounded-2xl border border-border bg-card overflow-hidden flex flex-col transition-transform duration-200 ${
            open ? "scale-100" : "scale-95"
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border shrink-0">
            <div className="min-w-0">
              <div className="font-semibold truncate">{openEntry?.title ?? "Preview"}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {openEntry?.tagline}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {openEntry ? (
                <Link
                  href={openEntry.implementationHref}
                  className="text-xs text-primary hover:underline"
                >
                  {openEntry.implementationLabel} →
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close preview"
                className="w-8 h-8 grid place-items-center rounded-lg border border-border hover:border-ring cursor-pointer"
              >
                <Icon icon="ph:x" width={14} height={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-background">
            {openEntry ? (
              <div className="min-h-full">
                <Preview id={openEntry.id} height="min-h-[32rem] h-full" chrome interactive />
              </div>
            ) : null}
          </div>

          <div className="px-5 py-3 border-t border-border shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {(openEntry?.demonstrates ?? []).map((d) => (
                <span
                  key={d}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
