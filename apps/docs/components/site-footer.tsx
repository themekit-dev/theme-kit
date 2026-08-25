import Link from "next/link";
import ThemeKitLogo from "./ui/logo";
import { Badge } from "./ui/badge";
import { PKG_VERSION_BADGE } from "../lib/version";
import { GITHUB_URL, NPM_ORG_URL, CONTACT_URL, SITE_NAME } from "../lib/site";

const columns: {
  heading: string;
  row?: boolean;
  links: { href: string; label: string }[];
}[] = [
  {
    heading: "Documentation",
    links: [
      { href: "/", label: "Home" },
      { href: "/get-started", label: "Get Started" },
      { href: "/core-concepts", label: "Core Concepts" },
      { href: "/packages", label: "Packages" },
      { href: "/framework-guides", label: "Framework Guides" },
      { href: "/api-reference", label: "API Reference" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/playground", label: "Playground" },
      { href: "/adapters", label: "Adapters" },
      { href: "/presets/default", label: "Presets" },
      { href: "/custom-themes", label: "Custom Themes" },
      { href: "/custom-scrollbar", label: "Custom Scrollbar" },
      { href: "/showcase", label: "Showcase" },
    ],
  },
  {
    heading: "Ecosystem",
    links: [
      { href: "/framework-guides/react", label: "React" },
      { href: "/framework-guides/next", label: "Next.js" },
      { href: "/framework-guides/vue", label: "Vue" },
      { href: "/framework-guides/svelte", label: "Svelte" },
      { href: "/framework-guides/solid", label: "Solid" },
      { href: GITHUB_URL, label: "GitHub ↗" },
      { href: NPM_ORG_URL, label: "npm ↗" },
    ],
  },
  {
    heading: "Legal",
    row: true,
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/security", label: "Security" },
      { href: "/license", label: "License" },
      { href: CONTACT_URL, label: "Contact" },
    ],
  },
];

const socials = [
  {
    href: GITHUB_URL,
    label: "GitHub",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.36 6.84 9.7.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.9-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.88 1.55 2.32 1.1 2.88.84.09-.66.34-1.1.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.81c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
      </svg>
    ),
  },
  {
    href: NPM_ORG_URL,
    label: "npm",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M2 5h20v13H13v2H9v-2H2V5Zm2 2v9h4V9h1.5v7H11V7H4Zm13 0h-3v9h3V7Zm-1.5 2v5H16V9h-.5Z" />
      </svg>
    ),
  },
  {
    href: CONTACT_URL,
    label: "Email",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    ),
  },
];

function FooterLink({
  href,
  className,
  label,
}: {
  href: string;
  className: string;
  label: string;
}) {
  // External links (https://…) open in a new tab; mailto: stays in place;
  // everything else is an internal docs route via next/link.
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function FooterColumn({
  heading,
  links,
  row,
}: {
  heading: string;
  links: { href: string; label: string }[];
  row?: boolean;
}) {
  return (
    <nav aria-label={heading} className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest opacity-40">
        {heading}
      </p>
      {row ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {links.map((link) => (
            <FooterLink
              key={link.href}
              href={link.href}
              label={link.label}
              className="text-sm text-foreground/75 hover:text-primary transition-colors no-underline"
            />
          ))}
        </div>
      ) : (
        links.map((link) => (
          <FooterLink
            key={link.href}
            href={link.href}
            label={link.label}
            className="w-fit text-sm text-foreground/75 hover:text-primary transition-colors no-underline"
          />
        ))
      )}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm">
            <Link href="/" className="no-underline">
              <ThemeKitLogo size={30} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-foreground/65">
              A framework-agnostic theming library with theme families, semantic
              tokens, and a runtime that works everywhere.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="accent">MIT Licensed</Badge>
              <Badge tone="neutral">{PKG_VERSION_BADGE}</Badge>
              <Badge tone="neutral">Powered by Theme Kit</Badge>
            </div>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.href.startsWith("mailto:")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  aria-label={s.label}
                  title={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-foreground/70 transition-all hover:border-ring hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <FooterColumn key={col.heading} {...col} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-foreground/50 sm:flex-row sm:items-center">
          <span>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </span>
          <span className="font-mono">theming, without the friction</span>
        </div>
      </div>
    </footer>
  );
}
