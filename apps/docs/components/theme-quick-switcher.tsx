"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBuiltInThemes } from "@theme-kit/core";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
} from "@theme-kit/next/client";
import { useFocusTrap } from "./ui/use-focus-trap";
import { useClickOutside } from "./ui/use-click-outside";

type FamilyOption = {
  family: string;
  label: string;
  color: string;
};

function formatFamilyName(family: string): string {
  return family
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function primaryOf(theme: {
  tokens?: { colors?: { primary?: string } } | undefined;
}): string {
  return (
    theme.tokens?.colors?.primary ?? "var(--theme-color-primary)"
  );
}

function sortFamily(list: FamilyOption[]): FamilyOption[] {
  // Neutral first — it's the zero-config starting point — then the rest in
  // stable registration order.
  return [
    ...list.filter((f) => f.family === "default"),
    ...list.filter((f) => f.family !== "default"),
  ];
}

// Families that only exist on the docs site but ARE part of the persisted
// selection (theme-kit-default-light/dark). Lab and scope are demo-only scoped
// themes that don't survive a refresh, so offering them here would be a
// dead-end — they're deliberately excluded.
const PERSISTED_SITE_FAMILIES = new Set(["theme-kit"]);

/**
 * Quick theme-family switcher.
 *
 * Lists the built-in families Theme Kit ships out of the box (Neutral, the
 * preset families, the brand families) plus, in a separate "Theme Kit Site
 * Family" section, the families that only exist on the docs site itself
 * (theme-kit, lab, scope) — so a visitor can always switch back to the docs'
 * own default theme.
 *
 * `variant="popover"` renders the compact header pill (desktop). `variant="list"`
 * renders a full-width, always-open list (used inside the mobile menu, where
 * the popover would be unreachable).
 */
export function ThemeQuickSwitcher({
  variant = "popover",
}: {
  variant?: "popover" | "list";
}) {
  const { theme, family } = useTheme();
  const runtime = useThemeRuntime();
  const setFamily = useSetThemeFamily();

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const isPopover = variant === "popover";
  // Focus trap only makes sense for the desktop popover; the mobile dropdown
  // lives inside the mobile menu's own focus-managed nav. Click-outside and
  // Escape-to-close apply to both.
  useFocusTrap(panelRef, isPopover && open);
  // Click-outside only applies to the desktop popover. In the mobile list
  // variant the panel lives inside the mobile menu's own scroll container, so
  // click-outside would close the dropdown on the very taps meant to select an
  // option.
  useClickOutside({ rootRef, open: isPopover ? open : false, setOpen });

  const families = useMemo<{
    builtIn: FamilyOption[];
    site: FamilyOption[];
  }>(() => {
    // Which families ship in @theme-kit/core? Those go under "Theme family";
    // anything extra registered by the docs site (theme-kit, lab, scope) goes
    // under "Theme Kit Site Family".
    const builtInSet = new Set<string>();
    for (const t of getBuiltInThemes()) {
      builtInSet.add((t.meta as { family?: string } | undefined)?.family ?? "default");
    }

    const themes =
      runtime.themes.length > 0 ? runtime.themes : getBuiltInThemes();

    const seen = new Set<string>();
    const builtIn: FamilyOption[] = [];
    const site: FamilyOption[] = [];
    for (const t of themes) {
      const f =
        (t.meta as { family?: string } | undefined)?.family ?? "default";
      if (seen.has(f)) continue;
      seen.add(f);
      const option: FamilyOption = {
        family: f,
        label: f === "default" ? "Neutral" : formatFamilyName(f),
        color: primaryOf(t as never),
      };
      if (builtInSet.has(f)) {
        builtIn.push(option);
      } else if (PERSISTED_SITE_FAMILIES.has(f)) {
        site.push(option);
      }
    }

    return { builtIn: sortFamily(builtIn), site: sortFamily(site) };
  }, [runtime]);

  const allFamilies = useMemo(
    () => [...families.builtIn, ...families.site],
    [families],
  );
  const activeFamily = allFamilies.find(
    (f) => f.family === (family ?? "default"),
  );

  const select = (f: FamilyOption) => {
    setFamily(f.family);
    setOpen(false);
  };

  const renderOption = (f: FamilyOption, index: number, firstFocus: boolean) => {
    const isActive = f.family === family;
    return (
      <button
        key={f.family}
        type="button"
        data-first-focus={firstFocus ? "" : undefined}
        role="option"
        aria-selected={isActive}
        onClick={() => select(f)}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium cursor-pointer ${
          isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
        }`}
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            background: f.color,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
          }}
        />
        <span className="truncate">{f.label}</span>
      </button>
    );
  };

  // Move focus into the popover panel when opened; back to the trigger when
  // closed. Don't steal focus on initial mount (open is already false).
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        panelRef.current
          ?.querySelector<HTMLElement>("[data-first-focus]")
          ?.focus();
      });
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      buttonRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open]);

  // ── Mobile: collapsible dropdown ─────────────────────────────────────────
  if (variant === "list") {
    return (
      <div ref={rootRef} className="px-3 pb-2">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="mobile-theme-families"
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-[13px] font-medium text-card-foreground cursor-pointer hover:border-ring"
        >
          <span className="flex min-w-0 items-center gap-2">
            {activeFamily ? (
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: activeFamily.color,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                }}
              />
            ) : null}
            <span className="truncate">{activeFamily?.label ?? theme.name}</span>
          </span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`shrink-0 opacity-70 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open ? (
          <div
            id="mobile-theme-families"
            ref={panelRef}
            role="listbox"
            aria-label="Theme families"
            className="mt-1.5 max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-border bg-card shadow-lg"
          >
            {families.builtIn.length > 0 && (
              <>
                <div className="border-b border-border bg-card px-3 py-2 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                  Theme family
                </div>
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  {families.builtIn.map((f, i) =>
                    renderOption(f, i, i === 0),
                  )}
                </div>
              </>
            )}
            {families.site.length > 0 && (
              <>
                <div className="border-b border-border bg-card px-3 py-2 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                  Theme Kit Site Family
                </div>
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  {families.site.map((f, i) => renderOption(f, i, false))}
                </div>
              </>
            )}
            {families.builtIn.length === 0 && families.site.length === 0 && (
              <div className="px-3 py-3 text-center text-xs opacity-40">
                No families available
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  // ── Desktop: compact pill + popover ────────────────────────────────────
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch theme family"
        title="Switch theme family"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-card-foreground cursor-pointer hover:border-ring"
      >
        {activeFamily ? (
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              background: activeFamily.color,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
            }}
          />
        ) : null}
        <span className="max-w-28 truncate">
          {activeFamily?.label ?? theme.name}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 opacity-70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-2xl backdrop-blur-xl">
          <div className="px-3 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-40">
            Theme family
          </div>
          <div
            ref={panelRef}
            role="listbox"
            aria-label="Theme families"
            className="max-h-[60vh] overflow-y-auto px-2 pb-2"
          >
            {families.builtIn.length > 0 && (
              <div className="grid grid-cols-2 gap-1">
                {families.builtIn.map((f, i) =>
                  renderOption(f, i, i === 0),
                )}
              </div>
            )}
            {families.site.length > 0 && (
              <>
                <div className="px-1 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                  Theme Kit Site Family
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {families.site.map((f, i) =>
                    renderOption(f, i, false),
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
