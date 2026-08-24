"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  allocateId,
  stripNumberPrefix,
  type TocItem,
} from "../lib/toc";

/**
 * On-page table of contents for docs pages.
 *
 * `initialItems` comes from the render-tree collector in DocsLayout
 * (lib/toc-tree.tsx) so the rail is populated in the SSR HTML — no pop-in on
 * refresh. After mount the component still scans `[data-toc-root]`: that scan
 * is authoritative (it also finds headings rendered inside client
 * components), binds the scroll-spy observer and assigns ids to any headings
 * the collector couldn't see. Ids stay stable across the hand-off because
 * both sides allocate through the same `allocateId`.
 */
export function Toc({ initialItems, onHasToc }: { initialItems?: TocItem[]; onHasToc?: (has: boolean) => void }) {
  const [items, setItems] = useState<TocItem[]>(initialItems ?? []);
  const [activeId, setActiveId] = useState("");
  const activeRef = useRef<HTMLAnchorElement>(null);

  // useLayoutEffect (not useEffect) so the rail reconciles before the first
  // client-side paint after hydration.
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-toc-root]");
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));

    const seen = new Map<string, number>();
    const list: TocItem[] = [];

    for (const heading of headings) {
      const rawText = (heading.textContent ?? "").trim();
      if (!rawText) continue;

      const text = stripNumberPrefix(rawText);
      const id = allocateId(seen, text);
      heading.id = id;

      list.push({
        id,
        text,
        level: heading.tagName === "H2" ? 2 : 3,
      });
    }

    // Report whether the page actually has a TOC (at least two headings). The
    // layout uses this to collapse the rail column so pages without a TOC get
    // the full content width instead of a fixed-width empty rail — even in the
    // SSR HTML, since `onHasToc` is only ever true here when the client scan
    // (authoritative: it also sees client-component headings) finds one.
    onHasToc?.(list.length >= 2);

    if (list.length > 0) setItems(list);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
    // Re-scan when the page content changes so the rail visibility stays in
    // sync across same-route navigations (e.g. /blog/[slug] → /blog/[slug]).
    // `initialItems` is referentially stable between unrelated re-renders
    // (it comes from a `useMemo` keyed on `children` in DocsLayout), so the
    // effect does not re-run spuriously.
  }, [initialItems]);

  // Keep the active item visible inside the sticky rail. Never use
  // `scrollIntoView` here — it scrolls every scrollable ancestor (including
  // the window), which fights the user's own scrolling and makes the page
  // jump/jitter. Scroll only the rail's own scrollport instead.
  useEffect(() => {
    const link = activeRef.current;
    const rail = link?.closest<HTMLElement>("[data-toc-rail]");
    if (!link || !rail) return;

    const railRect = rail.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const relTop = linkRect.top - railRect.top + rail.scrollTop;
    const relBottom = relTop + linkRect.height;

    // Pin scroll-behavior: auto for the write so `html { scroll-behavior:
    // smooth }` (inherited) doesn't animate the follow.
    const prevBehavior = rail.style.scrollBehavior;
    rail.style.scrollBehavior = "auto";
    try {
      if (relTop < rail.scrollTop) {
        rail.scrollTop = relTop;
      } else if (relBottom > rail.scrollTop + rail.clientHeight) {
        rail.scrollTop = relBottom - rail.clientHeight;
      }
    } finally {
      rail.style.scrollBehavior = prevBehavior;
    }
  }, [activeId]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="w-full pl-6 pr-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest opacity-40">
        On this page
      </div>
      <ol className="flex flex-col gap-0.5 border-l border-border">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                ref={isActive ? activeRef : undefined}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveId(item.id);
                  document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block border-l-2 py-1 pr-2 text-[13px] leading-snug no-underline transition-colors ${
                  item.level === 3 ? "pl-6" : "pl-3"
                } ${
                  isActive
                    ? "-ml-px border-primary font-medium text-primary"
                    : "-ml-px border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
