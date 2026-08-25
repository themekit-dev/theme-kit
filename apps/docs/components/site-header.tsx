"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useThemeMode, useSetThemeMode } from "@theme-kit/next/client";
import { ThemeQuickSwitcher } from "./theme-quick-switcher";
import { ModeToggle } from "./mode-toggle";
import { SearchButton } from "./search-dialog";
import ThemeKitLogo from "./ui/logo";
import { useFocusTrap } from "./ui/use-focus-trap";
import { GITHUB_URL, NPM_ORG_URL, SITE_NAME } from "../lib/site";

const links = [
  { href: "/get-started", label: "Get Started" },
  { href: "/quick-start", label: "Docs" },
  { href: "/packages", label: "Packages" },
  { href: "/framework-guides", label: "Guides" },
  { href: "/playground", label: "Playground" },
];

const mobileLinks = [
  ...links,
  { href: "/advanced-features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/roadmap", label: "Roadmap" },
];

const mobileGuides = [
  { href: "/framework-guides", label: "Overview" },
  { href: "/framework-guides/react", label: "React" },
  { href: "/framework-guides/next", label: "Next.js" },
  { href: "/framework-guides/vue", label: "Vue" },
  { href: "/framework-guides/svelte", label: "Svelte" },
  { href: "/framework-guides/solid", label: "Solid" },
  { href: "/framework-guides/angular", label: "Angular" },
  { href: "/framework-guides/web", label: "Web Components" },
  { href: "/framework-guides/tailwind", label: "Tailwind" },
  { href: "/framework-guides/astro", label: "Astro" },
  { href: "/framework-guides/nuxt", label: "Nuxt" },
  { href: "/framework-guides/remix", label: "Remix" },
];

const mobilePresets = [
  { href: "/presets/default", label: "Default Presets" },
  { href: "/presets/brand", label: "Brand Presets" },
];

function isActive(pathname: string, href: string): boolean {
  // Boundary-safe prefix match ("/packages" matches "/packages/core" but not
  // a hypothetical "/packages-x").
  return pathname === href || pathname.startsWith(`${href}/`);
}

const MOBILE_MODES = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);
  const [openPreset, setOpenPreset] = useState(false);
  const menuNavRef = useRef<HTMLElement>(null);

  // Trap keyboard focus inside the open mobile menu; restore focus to the
  // hamburger when it closes.
  useFocusTrap(menuNavRef, open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Move focus into the menu when it opens (the focus trap restores it to the
  // hamburger when it closes). preventScroll keeps the browser from scrolling
  // the focused link into view — which would reset the persisted scroll
  // position right after we restore it.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        menuNavRef.current
          ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
          ?.focus({ preventScroll: true });
      });
    }
  }, [open]);

  // Persist the mobile menu's scroll position (like the desktop sidebar) so a
  // closed-and-reopened menu lands where the reader left off instead of the top.
  const MOBILE_MENU_SCROLL_KEY = "tk-mobile-menu-scroll";

  // useLayoutEffect so the restore happens after DOM mutation but before paint,
  // when the nav's content height is already settled on the newly rendered page.
  useLayoutEffect(() => {
    if (!open) return;
    const saved = sessionStorage.getItem(MOBILE_MENU_SCROLL_KEY);
    const pos = saved ? Number(saved) : 0;
    if (menuNavRef.current && pos > 0) {
      const nav = menuNavRef.current;
      const prev = nav.style.scrollBehavior;
      nav.style.scrollBehavior = "auto";
      nav.scrollTop = pos;
      nav.style.scrollBehavior = prev;
    }
  }, [open, MOBILE_MENU_SCROLL_KEY]);

  const saveMobileMenuScroll = () => {
    const nav = menuNavRef.current;
    // Skip scrollTop 0 — a close/navigation can reset the menu's scroll to 0
    // and fire a scroll event while `open` is still true in this closure.
    if (nav && open && nav.scrollTop > 0) {
      sessionStorage.setItem(MOBILE_MENU_SCROLL_KEY, String(nav.scrollTop));
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onBreak = () => {
      if (!mq.matches) return;
      setOpen(false);
      setOpenGuide(false);
      setOpenPreset(false);
    };
    onBreak();
    mq.addEventListener?.("change", onBreak);
    (
      mq as MediaQueryList & { addListener?: (cb: () => void) => void }
    ).addListener?.(onBreak);
    return () => {
      mq.removeEventListener?.("change", onBreak);
      (
        mq as MediaQueryList & { removeListener?: (cb: () => void) => void }
      ).removeListener?.(onBreak);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    } else {
      // Delay scrollbar restoration until after the close animation (340ms)
      // finishes, so the width shift doesn't cause visible jitter.
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      <header className="site-header relative z-50">
        <div className="max-w-6xl mx-auto px-6 h-(--site-header-height) flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <ThemeKitLogo size={30} />
            </Link>

            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Primary"
            >
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
                      active
                        ? "text-primary"
                        : "opacity-70 hover:opacity-100 hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeQuickSwitcher />
            </div>
            <ModeToggle />
            <SearchButton />

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Source on GitHub"
              title="Source on GitHub"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card transition-colors hover:border-ring hover:shadow-sm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>

            <a
              href={NPM_ORG_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Packages on npm"
              title="Packages on npm"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card transition-colors hover:border-ring hover:shadow-sm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2 5h20v13H13v2H9v-2H2V5Zm2 2v9h4V9h1.5v7H11V7H4Zm13 0h-3v9h3V7Zm-1.5 2v5H16V9h-.5Z" />
              </svg>
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="lg:hidden relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card cursor-pointer hover:border-ring"
            >
              <span className="relative block w-4 h-3.5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-[transform,top,opacity] duration-400 ease ${
                    open ? "top-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-full rounded-full bg-current transition-[opacity,transform] duration-300 ease ${
                    open ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-0.5 w-full rounded-full bg-current transition-[transform,top,opacity] duration-400 ease ${
                    open ? "bottom-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 top-(--site-header-height) z-40 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
        tabIndex={open ? undefined : -1}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden
        />

        {/* Panel — full-width sheet on small screens,
            right-side drawer on md+ screens. Same slide-from-right
            animation for both.                                   */}
        <nav
          ref={menuNavRef}
          onScroll={saveMobileMenuScroll}
          aria-label="Mobile"
          className={`absolute inset-y-0 left-0 right-0 flex flex-col overflow-y-auto overscroll-contain bg-background border-b border-border shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:left-auto md:right-0 md:w-104 md:max-w-[85vw] md:border-l md:border-border md:shadow-2xl ${
            open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
          }`}
        >
          <div className="flex-1 px-3 py-4 flex flex-col gap-4">
            {/* — Primary links — */}
            <div className="flex flex-col gap-0.5">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                Navigate
              </div>
              {mobileLinks.map((link, i) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{
                      transitionDelay: open ? `${i * 40 + 60}ms` : "0ms",
                    }}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-medium no-underline transition-[opacity,transform] duration-300 ${
                      open
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-3"
                    } ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        Current
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div
              style={{ transitionDelay: open ? "400ms" : "0ms" }}
              className={`transition-[opacity,transform] duration-300 ${
                open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              {/* — Guides & Presets — */}
              <div className="flex flex-col gap-2">
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                  Guides &amp; Presets
                </div>

                {/* Framework Guides accordion */}
                <button
                  type="button"
                  onClick={() => setOpenGuide((v) => !v)}
                  aria-expanded={openGuide}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-medium no-underline hover:bg-muted cursor-pointer"
                >
                  <span>Framework Guides</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      openGuide ? "rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-400 ease-out ${
                    openGuide ? "max-h-130" : "max-h-0"
                  }`}
                >
                  <div className="ml-3 pl-3 border-l border-border flex flex-col gap-0.5">
                    {mobileGuides.map((link) => {
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`px-3 py-2 rounded-md text-sm no-underline ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Presets accordion */}
                <button
                  type="button"
                  onClick={() => setOpenPreset((v) => !v)}
                  aria-expanded={openPreset}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-medium no-underline hover:bg-muted cursor-pointer"
                >
                  <span>Presets</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      openPreset ? "rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                    openPreset ? "max-h-130" : "max-h-0"
                  }`}
                >
                  <div className="ml-3 pl-3 border-l border-border flex flex-col gap-0.5">
                    {mobilePresets.map((link) => {
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`px-3 py-2 rounded-md text-sm no-underline ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* — Appearance — */}
            <div
              style={{ transitionDelay: open ? "500ms" : "0ms" }}
              className={`transition-[opacity,transform] duration-300 ${
                open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="px-3 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                  Appearance
                </div>
                <ThemeQuickSwitcher variant="list" />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
