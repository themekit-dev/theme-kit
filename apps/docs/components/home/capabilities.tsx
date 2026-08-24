import Link from "next/link";

type Capability = {
  title: string;
  desc: string;
  href: string;
  tag: string;
  icon: React.ReactNode;
};

const capabilities: Capability[] = [
  {
    title: "Sunrise & sunset scheduling",
    desc: "Switch light/dark at each visitor's local sunrise and sunset. NOAA solar math in core, exposed through a reactive controller in every framework.",
    href: "/sunrise-sunset",
    tag: "scheduling",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v8" />
        <path d="m4.93 10.93 1.41 1.41" />
        <path d="M2 18h2" />
        <path d="M20 18h2" />
        <path d="m19.07 10.93-1.41 1.41" />
        <path d="M22 22H2" />
        <path d="m16 6-4 4-4-4" />
        <path d="M16 18a4 4 0 0 0-8 0" />
      </svg>
    ),
  },
  {
    title: "Scoped themes",
    desc: "Isolate a subtree — a video player, an embedded widget, legacy DOM — with ThemeScope, the theme-kit-scope element, or an imperative binding.",
    href: "/scoped-theme",
    tag: "islands",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    title: "Theme-aware scrollbar",
    desc: "Replace the native scrollbar with a theme-colored overlay — same physics, no layout shift, no flash. Ships in core with wrappers for every framework.",
    href: "/custom-scrollbar",
    tag: "overlay",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M10 2v20" />
        <path d="m8 6 2 2 2-2" />
      </svg>
    ),
  },
  {
    title: "Zero-flash SSR",
    desc: "The server resolves the persisted theme, a blocking script applies it before paint, and hydration takes over — no wrong-theme flash, ever.",
    href: "/zero-flash",
    tag: "ssr",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Theme families + modes",
    desc: "Palette and mode switch independently — plum-light, plum-dark, mint-light, mint-dark — all from one selection API, persisted and SSR-safe.",
    href: "/core-concepts",
    tag: "families",
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
    title: "Component-library adapters",
    desc: "Bridge tokens into MUI, Chakra, Ant Design, shadcn/ui, Bootstrap, DaisyUI, and Mantine — Theme Kit powers your library, it doesn't replace it.",
    href: "/adapters",
    tag: "adapters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export function Capabilities() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          A runtime, not a toggle
        </h2>
        <p className="opacity-70 max-w-2xl">
          Every feature below is real — implemented in{" "}
          <code className="mono text-[0.9em]">@theme-kit/core</code> and
          exposed natively by each framework adapter. Click through to see the
          actual API.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap) => (
          <Link
            key={cap.title}
            href={cap.href}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2.5 no-underline card-lift"
          >
            <div className="flex items-center justify-between">
              <div
                className="w-8 h-8 rounded-lg grid place-items-center"
                style={{
                  background: "var(--theme-color-secondary)",
                  color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
                }}
              >
                {cap.icon}
              </div>
              <span className="mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/40">
                {cap.tag}
              </span>
            </div>
            <h3 className="font-semibold text-sm leading-tight">
              {cap.title}
            </h3>
            <p className="text-xs opacity-60 leading-relaxed flex-1">
              {cap.desc}
            </p>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--theme-color-primary)" }}
            >
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
