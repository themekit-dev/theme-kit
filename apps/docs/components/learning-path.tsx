import Link from "next/link";

const steps = [
  {
    href: "/core-concepts",
    label: "Core Concepts",
    desc: "Families, tokens, runtime",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 10 5.5-10 5.5L2 7.5 12 2z" />
        <path d="m2 12.2 10 5.5 10-5.5" />
        <path d="m2 16.9 10 5.5 10-5.5" />
      </svg>
    ),
  },
  {
    href: "/playground",
    label: "Playground",
    desc: "Try it yourself",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
  {
    href: "/get-started",
    label: "Get Started",
    desc: "Put it in your app",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/framework-guides",
    label: "Framework docs",
    desc: "Your stack, deeper",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h5" />
      </svg>
    ),
  },
  {
    href: "/advanced-features",
    label: "Advanced concepts",
    desc: "Scopes, history, plugins",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
    ),
  },
];

export function LearningPath() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Not a random sidebar — a path
        </h2>
        <p className="opacity-70 max-w-2xl">
          The docs are sequenced the way you actually learn: grasp the mental
          model, play with a live runtime, put it in your app, go deeper.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => (
          <div key={step.href} className="relative">
            <Link
              href={step.href}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 h-full no-underline card-lift"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-9 h-9 rounded-lg grid place-items-center"
                  style={{
                    background: "var(--theme-color-secondary)",
                    color:
                      "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
                  }}
                >
                  {step.icon}
                </span>
                <span className="mono text-[11px] opacity-30">0{i + 1}</span>
              </div>
              <div className="mt-auto">
                <div className="font-semibold text-sm">{step.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{step.desc}</div>
              </div>
            </Link>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className="hidden lg:grid place-items-center absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background text-opacity-40 opacity-40"
                style={{ color: "var(--theme-color-primary)" }}
              >
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}