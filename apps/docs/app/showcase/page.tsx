import Link from "next/link";
import type { Metadata } from "next";

import { ShowcaseGallery } from "../../components/showcase/showcase-gallery";
import { PKG_VERSION } from "../../lib/version";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/showcase") },
  title: "Showcase",
  description:
    "Beautiful interfaces, one theming system. Six interfaces themed with Theme Kit — dashboards, analytics, settings, a storefront, a documentation layout and a component gallery. Switch theme or mode and every preview restyles live.",
};

/**
 * Navigation destinations, not showcase items. Deliberately short: the Showcase's
 * job is “look what Theme Kit can make possible”, not “here is another page that
 * links to everything on the site”.
 */
const EXPLORE_MORE = [
  {
    name: "Examples",
    description: "Runnable implementation examples",
    href: "/examples",
  },
  {
    name: "Playground",
    description: "Experiment with Theme Kit",
    href: "/playground",
  },
  {
    name: "Theme Studio",
    description: "Create a theme visually",
    href: "/theme-studio",
  },
  {
    name: "Presets",
    description: "Ready-to-use theme presets",
    href: "/presets/default",
  },
  {
    name: "Framework guides",
    description: "Integrate Theme Kit into your stack",
    href: "/framework-guides",
  },
  {
    name: "Accessibility Lab",
    description: "Check contrast and simulate CVD",
    href: "/accessibility",
  },
];

/**
 * The Showcase deliberately does **not** use `DocsLayout`.
 *
 * A documentation page earns a sidebar and a table of contents because readers
 * navigate sections of a long article. A gallery has a different interaction
 * model — visual, exploratory, filter-driven — and the sidebar plus TOC rail
 * cost a third of the width the previews want. Navigation here is the filter bar
 * inside `ShowcaseGallery`.
 *
 * The page also ends cleanly: no related-docs block, no second navigation list.
 * The last two sections are "Explore more" and "Build it yourself", then the
 * site footer.
 */
export default function ShowcasePage() {
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent"
        />
        <div className="relative mx-auto max-w-[1400px] px-6 pt-14 pb-10 sm:pt-20 sm:pb-12">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Showcase
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            Beautiful interfaces.
            <br />
            One theming system.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Explore what can be built with Theme Kit.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>
              Verified with Theme Kit{" "}
              <span className="mono text-foreground">{PKG_VERSION}</span>
            </span>
            <span aria-hidden className="opacity-40">
              ·
            </span>
            <Link href="/examples" className="text-primary hover:underline">
              Want runnable code? See Examples →
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- canvas */}
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:py-14">
        <ShowcaseGallery />

        {/* ------------------------------------------------- explore more */}
        <section className="mt-20">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
            Explore more
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORE_MORE.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="glass-card card-lift p-4 no-underline flex items-start justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-sm">{item.name}</span>
                  <span className="block text-[13px] text-muted-foreground mt-0.5">
                    {item.description}
                  </span>
                </span>
                <span className="text-primary text-sm shrink-0" aria-hidden>
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- build it yourself */}
        <section className="mt-16 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Want to build one of these?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Start with a runnable example or explore the framework guide for your
            stack. Each composition above maps to a real integration — persistence,
            scoping, zero-flash SSR, scheduling and more.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/examples"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground no-underline"
            >
              Browse examples
            </Link>
            <Link
              href="/choose-package"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-border bg-card no-underline hover:border-ring"
            >
              Choose your framework
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
