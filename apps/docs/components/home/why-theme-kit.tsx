const rows: { traditional: string; themeKit: string; href: string }[] = [
  {
    traditional: "Light / dark only",
    themeKit: "Theme families",
    href: "/core-concepts",
  },
  {
    traditional: "Component-specific values",
    themeKit: "Semantic tokens",
    href: "/tokens",
  },
  {
    traditional: "Framework-specific runtime",
    themeKit: "Framework-agnostic core",
    href: "/architecture",
  },
  {
    traditional: "Manual transition CSS",
    themeKit: "Runtime transitions",
    href: "/animation",
  },
  {
    traditional: "Native scrollbar",
    themeKit: "Theme-aware overlay",
    href: "/custom-scrollbar",
  },
  {
    traditional: "Client-first",
    themeKit: "SSR-first integrations",
    href: "/zero-flash",
  },
  {
    traditional: "One global theme",
    themeKit: "Scoped themes",
    href: "/scoped-theme",
  },
  {
    traditional: "Library-specific glue",
    themeKit: "Adapters",
    href: "/adapters",
  },
];

export function WhyThemeKit() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Why Theme Kit?
        </h2>
        <p className="opacity-70 max-w-2xl">
          Most libraries stop at a dark-mode toggle. Theme Kit treats theming
          as a runtime — and that changes every part of the architecture.
        </p>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-widest">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 opacity-60">
            Traditional theme switching
          </div>
          <div
            className="px-4 py-2.5 border-b border-l border-border bg-muted/30"
            style={{ color: "var(--theme-color-primary)" }}
          >
            Theme Kit
          </div>
        </div>
        {rows.map((row, i) => (
          <a
            key={row.traditional}
            href={row.href}
            className={`grid grid-cols-2 text-sm no-underline transition-colors hover:bg-muted/40 ${
              i < rows.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <div className="px-4 py-3 opacity-40 line-through decoration-1">
              {row.traditional}
            </div>
            <div className="px-4 py-3 border-l border-border/60 font-semibold">
              {row.themeKit}
              <span
                className="ml-2 text-[11px] opacity-40 font-normal"
                style={{ color: "var(--theme-color-primary)" }}
              >
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}