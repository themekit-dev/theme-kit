"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  "api-reference": "API Reference",
  "framework-guides": "Framework Guides",
  libraries: "Libraries",
  cli: "CLI",
  blog: "Blog",
  tokens: "Tokens & Typography",
  presets: "Presets",
  packages: "Packages",
  adapters: "Adapters",
  "custom-themes": "Custom Themes",
  "scoped-theme": "Scoped Theme",
  "sunrise-sunset": "Sunrise & Sunset",
  "zero-flash": "Zero Flash",
  animation: "Animation & Transition",
  "advanced-features": "Advanced Features",
  "custom-scrollbar": "Custom Scrollbar",
  architecture: "Architecture",
  persistence: "Persistence",
  "multi-window-sync": "Multi-Window Sync",
  "token-resolution": "Token Resolution",
  plugins: "Plugins",
  "dom-adapters": "DOM Adapters",
  vanilla: "Framework-Free",
  "vite-plugin": "Vite Plugin",
  playground: "Playground",
  "theme-studio": "Theme Studio",
  accessibility: "Accessibility",
  showcase: "Showcase",
  devtools: "DevTools",
  troubleshooting: "Troubleshooting",
  roadmap: "Roadmap",
  "get-started": "Get Started",
  "quick-start": "Quick Start",
  "core-concepts": "Core Concepts",
  migration: "Migration",
  "choose-package": "Which package?",
};

function humanize(segment: string): string {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Breadcrumb trail for nested routes; hidden on top-level pages. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const crumbs = segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    return {
      href,
      label: SEGMENT_LABELS[segment] ?? humanize(segment),
      isLast: i === segments.length - 1,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-foreground/60">
        <li>
          <Link
            href="/"
            className="no-underline transition-colors hover:text-primary"
          >
            Home
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="opacity-40">
              ›
            </span>
            {crumb.isLast ? (
              <span
                aria-current="page"
                className="font-medium text-foreground/80"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="no-underline transition-colors hover:text-primary"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
