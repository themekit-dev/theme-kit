"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DocsPagination } from "./docs-pagination";
import { Toc } from "./toc";
import { Breadcrumbs } from "./breadcrumbs";
import { collectTocItems } from "../lib/toc-tree";
import type { TocItem } from "../lib/toc";
import { useFocusTrap } from "./ui/use-focus-trap";
import { SIDEBAR_SCROLL_KEY } from "../lib/sidebar-scroll";

function readSavedSidebarScroll(): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function saveSidebarScroll(value: number) {
  try {
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(value));
  } catch {
    // storage unavailable — fine, just don't persist
  }
}

const frameworkLinks = [
  { href: "/framework-guides/react", label: "React" },
  { href: "/framework-guides/next", label: "Next.js" },
  { href: "/framework-guides/vue", label: "Vue 3" },
  { href: "/framework-guides/svelte", label: "Svelte 5" },
  { href: "/framework-guides/solid", label: "Solid" },
  { href: "/framework-guides/angular", label: "Angular" },
  { href: "/framework-guides/web", label: "Web Components" },
  { href: "/framework-guides/tailwind", label: "Tailwind CSS" },
  { href: "/framework-guides/astro", label: "Astro" },
  { href: "/framework-guides/nuxt", label: "Nuxt" },
  { href: "/framework-guides/remix", label: "Remix" },
];

const libraryLinks = [
  { href: "/libraries/shadcn", label: "shadcn/ui" },
  { href: "/libraries/bootstrap", label: "Bootstrap" },
  { href: "/libraries/daisyui", label: "daisyUI" },
  { href: "/libraries/open-props", label: "Open Props" },
  { href: "/libraries/mui", label: "Material UI" },
  { href: "/libraries/chakra", label: "Chakra UI" },
  { href: "/libraries/antd", label: "Ant Design" },
  { href: "/libraries/mantine", label: "Mantine" },
  { href: "/libraries/unocss", label: "UnoCSS" },
];

const tokensLinks = [
  { href: "/tokens", label: "Semantic Tokens" },
  { href: "/tokens/code", label: "Code Tokens" },
];

type SidebarLink = {
  href: string;
  label: string;
  exact?: boolean;
};

type SidebarSection = {
  heading: string;
  links: SidebarLink[];
  frameworkGroup?: boolean;
  librariesGroup?: boolean;
  presetsGroup?: boolean;
  cliGroup?: boolean;
  tokensGroup?: boolean;
};

const sections: SidebarSection[] = [
  {
    heading: "Getting Started",
    links: [
      { href: "/quick-start", label: "Quick Start" },
      { href: "/get-started", label: "Get Started" },
      { href: "/core-concepts", label: "Core Concepts" },
    ],
    tokensGroup: true,
  },
  {
    heading: "",
    links: [{ href: "/choose-package", label: "Which package?" }],
  },
  {
    heading: "Themes",
    links: [
      { href: "/custom-themes", label: "Custom Themes" },
      { href: "/scoped-theme", label: "Scoped Theme" },
      { href: "/sunrise-sunset", label: "Sunrise & Sunset" },
      { href: "/migration", label: "Migration" },
    ],
    presetsGroup: true,
  },
  {
    heading: "Runtime",
    links: [
      { href: "/zero-flash", label: "Zero Flash" },
      { href: "/animation", label: "Animation & Transition" },
      { href: "/advanced-features", label: "Advanced Features" },
      { href: "/custom-scrollbar", label: "Custom Scrollbar" },
      { href: "/theme-inspector", label: "Theme Inspector" },
      { href: "/architecture", label: "Architecture" },
      { href: "/persistence", label: "Persistence" },
      { href: "/multi-window-sync", label: "Multi-Window Sync" },
    ],
  },
  {
    heading: "Deep Dives",
    links: [
      { href: "/token-resolution", label: "Token Resolution" },
      { href: "/plugins", label: "Plugins" },
      { href: "/dom-adapters", label: "DOM Adapters" },
      { href: "/vanilla", label: "Framework-Free" },
      { href: "/vite-plugin", label: "Vite Plugin" },
    ],
  },
  {
    heading: "Adapters",
    links: [{ href: "/adapters", label: "Adapters" }],
    librariesGroup: true,
  },
  {
    heading: "Frameworks",
    frameworkGroup: true,
    links: [],
  },
  {
    heading: "Use Cases",
    links: [
      { href: "/playground", label: "Playground" },
      { href: "/theme-studio", label: "Theme Studio" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/showcase", label: "Showcase" },
    ],
  },
  {
    heading: "CLI",
    links: [],
    cliGroup: true,
  },
  {
    heading: "Reference",
    links: [
      { href: "/packages", label: "Package Map" },
      { href: "/api-reference", label: "API Reference" },
      { href: "/devtools", label: "DevTools" },
      { href: "/troubleshooting", label: "Troubleshooting" },
      { href: "/known-limitations", label: "Known Limitations" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
];

function isActive(pathname: string, link: SidebarLink): boolean {
  if (link.exact) return pathname === link.href;
  // Boundary-safe prefix match: "/cli" must match "/cli/generate" but never
  // a hypothetical "/cli-x".
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

/** Sidebar link with consistent active styling and correct ARIA state. */
function NavLink({
  href,
  label,
  active,
  subtle = false,
}: {
  href: string;
  label: string;
  active: boolean;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`site-nav-link ${subtle ? "text-[13px]" : ""} ${
        active ? "site-nav-link-active" : ""
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Collapsible sidebar section. The entire header row is a single toggle
 * button — clicking anywhere on the label (not just the chevron) expands or
 * collapses the group.
 */
function NavGroup({
  label,
  href,
  pathname,
  inSection,
  maxHeight = "max-h-130",
  children,
}: {
  label: string;
  /** Optional index page; renders an "Overview" child link when set. */
  href?: string;
  pathname: string;
  inSection: boolean;
  maxHeight?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(inSection);

  useEffect(() => {
    if (inSection) setOpen(true);
  }, [inSection]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="site-nav-link w-full cursor-pointer text-left"
      >
        <span>{label}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 opacity-50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? `mt-0.5 ${maxHeight} opacity-100` : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-2 pl-2.5 border-l border-border flex flex-col gap-0.5">
          {href ? (
            <NavLink
              href={href}
              label="Overview"
              subtle
              active={pathname === href}
            />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

function FrameworkGuidesGroup({ pathname }: { pathname: string }) {
  return (
    <NavGroup
      label="Framework Guides"
      href="/framework-guides"
      pathname={pathname}
      inSection={pathname.startsWith("/framework-guides")}
    >
      {frameworkLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}
    </NavGroup>
  );
}

function LibrariesGroup({ pathname }: { pathname: string }) {
  return (
    <NavGroup
      label="Libraries"
      href="/libraries"
      pathname={pathname}
      inSection={pathname.startsWith("/libraries")}
    >
      {libraryLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}
    </NavGroup>
  );
}

const presetLinks = [
  { href: "/presets/default", label: "Default Presets" },
  { href: "/presets/brand", label: "Brand Presets" },
];

function PresetsGroup({ pathname }: { pathname: string }) {
  return (
    <NavGroup
      label="Presets"
      pathname={pathname}
      inSection={pathname.startsWith("/presets")}
      maxHeight="max-h-96"
    >
      {presetLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}
    </NavGroup>
  );
}

const cliTopLinks = [
  { href: "/cli", label: "Overview" },
  { href: "/cli/installation", label: "Installation" },
  { href: "/cli/quickstart", label: "Quick Start" },
];

const cliCommandLinks = [
  { href: "/cli/generate", label: "generate" },
  { href: "/cli/validate", label: "validate" },
  { href: "/cli/inspect", label: "inspect" },
  { href: "/cli/migrate", label: "migrate" },
  { href: "/cli/export", label: "export" },
];

const cliBottomLinks = [
  { href: "/cli/workflows", label: "Workflows" },
  { href: "/cli/ci", label: "CI & Automation" },
  { href: "/cli/reference", label: "Reference" },
];

function CliGroup({ pathname }: { pathname: string }) {
  return (
    <NavGroup
      label="CLI"
      pathname={pathname}
      inSection={pathname.startsWith("/cli")}
    >
      {cliTopLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}

      <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest opacity-40">
        Commands
      </div>
      {cliCommandLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}

      <div className="pt-1.5" />
      {cliBottomLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}
    </NavGroup>
  );
}

function TokensGroup({ pathname }: { pathname: string }) {
  return (
    <NavGroup
      label="Tokens & Typography"
      pathname={pathname}
      inSection={pathname === "/tokens" || pathname.startsWith("/tokens/")}
      maxHeight="max-h-40"
    >
      {tokensLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          subtle
          active={pathname === link.href}
        />
      ))}
    </NavGroup>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div>
      {sections.map((section) => (
        <div
          key={section.heading || "untitled"}
          className={section.heading ? "mb-6" : "mb-3"}
        >
          {section.heading ? (
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest opacity-40">
              {section.heading}
            </div>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {section.links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(pathname, link)}
              />
            ))}
            {section.frameworkGroup && (
              <FrameworkGuidesGroup pathname={pathname} />
            )}
            {section.librariesGroup && <LibrariesGroup pathname={pathname} />}
            {section.presetsGroup && <PresetsGroup pathname={pathname} />}
            {section.cliGroup && <CliGroup pathname={pathname} />}
            {section.tokensGroup && <TokensGroup pathname={pathname} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocsLayout({
  children,
  headings,
}: {
  children: ReactNode;
  /** Server-provided TOC items. Pages whose headings render inside (or
   * alongside) client components aren't visible to `collectTocItems` — RSC
   * serializes those subtrees as templates — so they pass their known
   * headings here to make the rail visible from the initial SSR HTML. The
   * client scan in `Toc` remains authoritative for the live list. */
  headings?: TocItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);

  // assign heading ids and extract the TOC list at render time (server-side
  // for the initial HTML, client-side identically during hydration) so the
  // rail has content on first paint instead of popping in after hydration.
  const { tree, items: collectedItems } = useMemo(
    () => collectTocItems(children),
    [children],
  );
  // `headings` (when provided) replaces the collected list — it covers pages
  // whose headings RSC hides inside template nodes.
  const items = headings ?? collectedItems;

  // Whether the page actually has a TOC. Initialised from the server-side
  // `items` so pages without one (Theme Studio, package map index, API index,
  // blog index, …) never render the empty rail — not even in the SSR HTML.
  // `Toc` re-reports after its authoritative client scan (it also sees
  // headings rendered inside client components), which covers pages like
  // /quick-start whose headings are invisible to the server-side collector.
  const [hasToc, setHasToc] = useState(() => items.length >= 2);

  // Trap keyboard focus inside the open mobile drawer; restore focus to the trigger when it closes
  useFocusTrap(drawerPanelRef, open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        drawerPanelRef.current?.focus({ preventScroll: true });
      });
    }
  }, [open]);

  useLayoutEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;
    const saved = readSavedSidebarScroll();
    if (saved > 0) {
      const prev = aside.style.scrollBehavior;
      aside.style.scrollBehavior = "auto";
      aside.scrollTop = saved;
      aside.style.scrollBehavior = prev;
    }
  }, []);

  const onAsideScroll = () => {
    if (asideRef.current) {
      saveSidebarScroll(asideRef.current.scrollTop);
    }
  };

  // Persist the mobile docs drawer's scroll position (like the desktop
  // sidebar) so a closed-and-reopened drawer lands where the reader left off.
  const DRAWER_SCROLL_KEY = "tk-docs-drawer-scroll";

  // Save on the true → false transition via useLayoutEffect: at that moment the
  // DOM still holds the pre-close scrollTop (the scroll event alone is racy —
  // a reset can fire while `open` is still true in the closure and save 0).
  const prevOpenRef = useRef(open);
  useLayoutEffect(() => {
    if (prevOpenRef.current && !open && drawerPanelRef.current) {
      const panel = drawerPanelRef.current;
      if (panel.scrollTop > 0) {
        sessionStorage.setItem(DRAWER_SCROLL_KEY, String(panel.scrollTop));
      }
    }
    prevOpenRef.current = open;
  }, [open, DRAWER_SCROLL_KEY]);

  useLayoutEffect(() => {
    if (!open) return;
    const saved = sessionStorage.getItem(DRAWER_SCROLL_KEY);
    const pos = saved ? Number(saved) : 0;
    if (drawerPanelRef.current && pos > 0) {
      const panel = drawerPanelRef.current;
      const prev = panel.style.scrollBehavior;
      panel.style.scrollBehavior = "auto";
      panel.scrollTop = pos;
      panel.style.scrollBehavior = prev;
    }
  }, [open, DRAWER_SCROLL_KEY]);

  const onDrawerScroll = () => {
    const panel = drawerPanelRef.current;
    // Skip scrollTop 0 — a close/navigation can reset the panel's scroll to 0
    // and fire a scroll event while `open` is still true in this closure; only
    // persist real, positive scroll positions.
    if (panel && open && panel.scrollTop > 0) {
      sessionStorage.setItem(DRAWER_SCROLL_KEY, String(panel.scrollTop));
    }
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="docs-bg" aria-hidden />
      <div className="max-w-6xl mx-auto px-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)_auto] lg:items-start">
        <aside
          ref={asideRef}
          data-docs-sidebar
          onScroll={onAsideScroll}
          className="hidden lg:block lg:sticky lg:top-(--site-header-height) lg:max-h-[calc(100vh-var(--site-header-height))] overflow-y-auto py-10 pr-5"
        >
          <SidebarContent pathname={pathname} />
        </aside>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="docs-drawer"
            className="lg:hidden mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium cursor-pointer transition-all hover:border-ring"
            aria-label="Open documentation menu"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-60"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>

          <div
            id="docs-drawer"
            inert={!open}
            className={`fixed inset-0 z-90 lg:hidden ${
              open ? "" : "pointer-events-none"
            }`}
            aria-hidden={!open}
          >
            <div
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              ref={drawerPanelRef}
              onScroll={onDrawerScroll}
              tabIndex={open ? -1 : undefined}
              className={`absolute inset-y-0 left-0 w-72.5 max-w-[85vw] bg-background/98 backdrop-blur-xl border-r border-border overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-150">
                <span className="text-[11px] font-semibold uppercase tracking-widest opacity-40">
                  Documentation
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close documentation menu"
                  className="w-8 h-8 grid place-items-center rounded-md border border-border cursor-pointer hover:bg-muted"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="px-3 py-4">
                <SidebarContent pathname={pathname} />
              </div>
            </div>
          </div>

          <div data-toc-root className="min-w-0 py-10 lg:pl-10">
            <Breadcrumbs />
            {tree}

            <DocsPagination />
          </div>
        </div>

        <div
          data-toc-rail
          className="hidden xl:block xl:sticky xl:top-(--site-header-height) xl:max-h-[calc(100vh-var(--site-header-height))] xl:overflow-y-auto py-10 xl:w-64 xl:shrink-0"
          style={{ display: hasToc ? undefined : "none" }}
        >
          <Toc initialItems={items} onHasToc={setHasToc} />
        </div>
      </div>
    </>
  );
}
