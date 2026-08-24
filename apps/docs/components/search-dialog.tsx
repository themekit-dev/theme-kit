"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { SearchEntry, SearchEntryType } from "../lib/search";
import { useFocusTrap } from "./ui/use-focus-trap";

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim().toLowerCase();

  if (!q) return text;

  const escapedQuery = escapeRegExp(q);

  const parts = text.split(new RegExp(`(${escapedQuery})`, "ig"));

  return parts.map((part, i) =>
    part.toLowerCase() === q ? (
      <mark
        key={i}
        className="rounded-sm bg-transparent"
        style={{ color: "var(--theme-color-primary)" }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Cut a snippet at a word boundary instead of mid-word. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`;
}

const GROUP_LABELS: Record<SearchEntryType, string> = {
  docs: "Docs",
  guides: "Guides",
  cli: "CLI",
  api: "API Reference",
  blog: "Blog",
};

const GROUP_ORDER: SearchEntryType[] = ["docs", "guides", "cli", "api", "blog"];

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const useSearch = () => {
  const ctx = useContext(SearchContext);

  if (!ctx) {
    throw new Error("useSearch must be used within SearchProvider");
  }

  return ctx;
};

function useIsMac(): boolean {
  const [isMac] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iP(hone|ad|od)/.test(navigator.userAgent),
  );
  return isMac;
}

export function SearchButton() {
  const { open, setOpen } = useSearch();
  const isMac = useIsMac();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="search-dialog"
      aria-label="Search documentation"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium cursor-pointer transition-shadow hover:border-ring hover:shadow-sm"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <kbd className="hidden md:inline mono w-fit rounded-xs border border-border bg-muted/20 px-1.5 py-0.5 text-[10px] text-foreground/50 dark:bg-muted">
        {isMac ? "⌘ K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

export function SearchProvider({
  entries,
  children,
}: {
  entries: SearchEntry[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Trap Tab inside the dialog and restore focus to the trigger on close.
  useFocusTrap(panelRef, open);

  const results = useMemo(() => {
    const q = query.trim();

    if (!q) {
      return entries.slice(0, 8);
    }

    const full = q.toLowerCase();
    const tokens = full.split(/\s+/).filter(Boolean);

    const scored = entries
      .map((entry) => {
        const title = entry.title.toLowerCase();
        const text = entry.text.toLowerCase();
        const route = entry.route.toLowerCase();

        let score = 0;

        for (const token of tokens) {
          if (title.includes(token)) {
            score += 10;
            // Word-boundary and prefix matches rank above loose substrings.
            if (new RegExp(`\\b${escapeRegExp(token)}`).test(title)) score += 4;
            if (title.startsWith(token)) score += 2;
          }
          if (text.includes(token)) score += 3;
          if (route.includes(token)) score += 2;
        }

        // Full-query bonus on the title.
        if (title === full) score += 20;
        else if (title.startsWith(full)) score += 8;
        else if (title.includes(full)) score += 3;

        return { entry, score };
      })
      .filter((result) => result.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.entry.title.length - b.entry.title.length,
      )
      .slice(0, 10);

    return scored.map((result) => result.entry);
  }, [query, entries]);

  // Group the flat (score-ordered) results by content type while keeping each
  // item's original index so keyboard navigation stays consistent.
  const groups = useMemo(() => {
    const map = new Map<SearchEntryType, { entry: SearchEntry; index: number }[]>();
    results.forEach((entry, index) => {
      const type = entry.type;
      if (!map.has(type)) map.set(type, []);
      map.get(type)!.push({ entry, index });
    });
    return GROUP_ORDER.filter((type) => map.has(type)).map((type) => ({
      type,
      items: map.get(type)!,
    }));
  }, [results]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const element = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );

    element?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(index: number) {
    const result = results[index];

    if (!result) return;

    router.push(result.route);
    setOpen(false);
  }

  const popularLinks = [
    { href: "/quick-start", label: "Quick Start" },
    { href: "/custom-themes", label: "Custom Themes" },
    { href: "/framework-guides", label: "Framework Guides" },
    { href: "/api-reference", label: "API Reference" },
  ];

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-60 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        style={{
          background:
            "color-mix(in srgb, var(--theme-color-background) 65%, transparent)",
          backdropFilter: "blur(3px) saturate(160%)",
          WebkitBackdropFilter: "blur(3px) saturate(160%)",
        }}
      />

      {/* Dialog */}
      <div
        inert={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-100 flex items-start justify-center px-4 pt-[12vh] ${
          open ? "" : "pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Search documentation"
      >
        <div
          ref={panelRef}
          id="search-dialog"
          className={`relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200 ease-out ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-2 scale-[0.98] opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="search-input-wrap flex items-center gap-3 border-b border-border px-5 py-3.5 transition-colors duration-200">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 opacity-50"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              ref={inputRef}
              value={query}
              className="search-dialog-input flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-foreground/40"
              aria-label="Search documentation"
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();

                  if (results.length > 0) {
                    setActive((current) =>
                      Math.min(results.length - 1, current + 1),
                    );
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((current) => Math.max(0, current - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(active);
                }
              }}
              placeholder="Search the docs…"
              autoComplete="off"
              spellCheck={false}
            />

            <div className="flex shrink-0 items-center gap-1.5">
              <kbd className="mono rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-foreground/50">
                esc
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className={`max-h-[52vh] p-2 pr-5 ${
              open ? "overflow-y-auto" : "overflow-y-hidden"
            }`}
          >
            {query && results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-2 opacity-30"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>

                <p className="text-sm opacity-50">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                  {popularLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-border px-3 py-1 font-medium no-underline transition-colors hover:border-ring hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm opacity-50">Start typing to search…</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {groups.map((group) => (
                  <div key={group.type} className="flex flex-col gap-0.5">
                    <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                      {GROUP_LABELS[group.type]}
                    </div>
                    {group.items.map(({ entry, index }) => {
                      const isActive = index === active;

                      return (
                        <button
                          key={`${entry.route}-${entry.title}`}
                          type="button"
                          data-index={index}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(index)}
                          className={`flex cursor-pointer flex-col items-start gap-1 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span className="flex w-full items-center gap-2 text-sm font-semibold">
                            {highlight(entry.title, query)}

                            <span
                              className="ml-auto shrink-0 mono text-[10px] opacity-40"
                              style={{
                                color: isActive
                                  ? "var(--theme-color-primary)"
                                  : undefined,
                              }}
                            >
                              {entry.route}
                            </span>
                          </span>

                          <span className="line-clamp-1 max-w-full text-xs opacity-50">
                            {highlight(truncate(entry.text, 120), query)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard hints */}
          <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-[11px] opacity-40">
            <span className="flex items-center gap-3">
              <kbd className="mono rounded border border-border bg-muted px-1.5 py-0.5">
                ↑↓
              </kbd>
              <span>navigate</span>

              <kbd className="mono rounded border border-border bg-muted px-1.5 py-0.5">
                ↵
              </kbd>
              <span>open</span>
            </span>

            <span>esc to close</span>
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
