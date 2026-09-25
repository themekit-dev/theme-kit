import type { ReactNode } from "react";
import Link from "next/link";

export type RelatedLink = {
  title: string;
  href: string;
  description?: string;
};

export type RelatedLinksProps = {
  title?: string;
  links: RelatedLink[];
  maxColumns?: 1 | 2 | 3;
  className?: string;
};

export function RelatedLinks({
  title = "Related documentation",
  links,
  maxColumns = 3,
  className,
}: RelatedLinksProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <section className={`${className} mt-10`}>
      <h3 className="text-sm font-semibold tracking-tight mb-3 opacity-60 uppercase">
        {title}
      </h3>
      <div className={`grid gap-3 ${gridCols[maxColumns]}`}>
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="block rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors px-3 py-2.5 no-underline group"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium group-hover:underline">
                {link.title}
              </span>
              <span
                className="shrink-0 text-xs opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--theme-color-primary)" }}
              >
                →
              </span>
            </div>
            {link.description && (
              <p className="text-xs opacity-60 mt-1 leading-relaxed">
                {link.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export type RelatedSectionsProps = {
  reference?: RelatedLink[];
  guides?: RelatedLink[];
  troubleshooting?: RelatedLink[];
  className?: string;
};

export function RelatedSections({
  reference,
  guides,
  troubleshooting,
  className,
}: RelatedSectionsProps) {
  const sections = [
    { title: "Reference", links: reference },
    { title: "Guides", links: guides },
    { title: "Troubleshooting", links: troubleshooting },
  ].filter((section) => section.links && section.links.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className={`space-y-6 ${className ?? ""}`.trim()}>
      {sections.map((section) => (
        <RelatedLinks
          key={section.title}
          title={section.title}
          links={section.links!}
          maxColumns={3}
        />
      ))}
    </div>
  );
}
