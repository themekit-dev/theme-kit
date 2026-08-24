import Link from "next/link";

type Pillar = {
  title: string;
  desc: string;
  visual: string[];
  href: string;
  icon: React.ReactNode;
};

const pillars: Pillar[] = [
  {
    title: "Semantic themes",
    desc: "Define meaning, not individual components — colors, radius, spacing and typography are named tokens.",
    visual: ["background", "foreground", "primary", "muted", "success", "border", "ring"],
    href: "/tokens",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 12H4M12 4v16" />
      </svg>
    ),
  },
  {
    title: "Theme families",
    desc: "Palette and mode switch independently — mint-light, mint-dark, plum-light, plum-dark, all from one API.",
    visual: ["mint", "plum", "cocoa", "forest"],
    href: "/core-concepts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r=".5" />
        <circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" />
        <circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    title: "SSR + zero flash",
    desc: "The server resolves the persisted theme before first paint. No flicker, no hydration mismatch.",
    visual: ["server", "resolve", "bootstrap", "paint", "hydrate"],
    href: "/zero-flash",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Runtime transitions",
    desc: "Theme change → token diff → transition plan → animated DOM update, driven by the runtime.",
    visual: ["change", "diff", "plan", "animate"],
    href: "/animation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    ),
  },
  {
    title: "Adapters",
    desc: "Theme Kit gives your component library a theme runtime — it doesn't replace it.",
    visual: ["MUI", "AntD", "Chakra", "shadcn", "Bootstrap", "DaisyUI"],
    href: "/adapters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export function Pillars() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Five primitives, one system
        </h2>
        <p className="opacity-70 max-w-2xl">
          Everything else in Theme Kit builds on these five ideas. They&apos;re
          orientation, not the whole story.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {pillars.map((pillar) => (
          <Link
            key={pillar.title}
            href={pillar.href}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2.5 no-underline card-lift"
          >
            <div
              className="w-8 h-8 rounded-lg grid place-items-center"
              style={{
                background: "var(--theme-color-secondary)",
                color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
              }}
            >
              {pillar.icon}
            </div>
            <h3 className="font-semibold text-sm leading-tight">
              {pillar.title}
            </h3>
            <p className="text-xs opacity-60 leading-relaxed flex-1">
              {pillar.desc}
            </p>
            <div className="flex flex-wrap gap-1 mt-auto pt-2">
              {pillar.visual.map((v) => (
                <span
                  key={v}
                  className="mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/40"
                >
                  {v}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}