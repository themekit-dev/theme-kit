import Link from "next/link";
import { Callout } from "../ui/callout";
import { frameworks } from "../../lib/frameworks";

const lifecycle = [
  "SSR theme resolution",
  "blocking bootstrap",
  "zero-flash first paint",
  "hydration",
  "runtime synchronization",
];

function SsrCard({
  slug,
  badge,
  guideLabel,
}: {
  slug: "next" | "nuxt";
  badge: string;
  guideLabel: string;
}) {
  const fw = frameworks.find((f) => f.slug === slug);
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl grid place-items-center text-xl">
            {fw?.icon}
          </span>
          <div>
            <div className="font-semibold text-sm">{fw?.name}</div>
            <div className="mono text-[10px] opacity-40">{fw?.pkg}</div>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide"
          style={{
            background: "var(--theme-color-secondary)",
            color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
          }}
        >
          {badge}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {lifecycle.map((step, i) => (
          <div key={step} className="flex items-center gap-1.5">
            <span
              className="mono text-[10px] px-2 py-1 rounded border border-border bg-muted/40"
              style={
                i === 0 || i === 2
                  ? { borderColor: "var(--theme-color-ring)" }
                  : undefined
              }
            >
              {step}
            </span>
            {i < lifecycle.length - 1 && (
              <span className="text-[10px] opacity-40">→</span>
            )}
          </div>
        ))}
      </div>

      <Link
        href={`/framework-guides/${slug}`}
        className="text-sm font-semibold no-underline mt-auto"
        style={{ color: "var(--theme-color-primary)" }}
      >
        {guideLabel} →
      </Link>
    </div>
  );
}

export function SsrIntegrations() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          SSR integrations
        </h2>
        <p className="opacity-70 max-w-2xl">
          The theme survives a hard reload. The server resolves it, a blocking
          script applies it before paint, and the runtime takes over after
          hydration — the same lifecycle on both frameworks because both share
          the core runtime.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SsrCard
          slug="next"
          badge="Full App Router integration"
          guideLabel="Next.js guide"
        />
        <SsrCard
          slug="nuxt"
          badge="Full Nuxt SSR integration"
          guideLabel="Nuxt guide"
        />
      </div>

      <Callout className="mt-4" title="One mental model">
        Next resolves from cookies, Nuxt from the module&apos;s SSR hook — the
        rendered result (themed <code className="mono text-[0.9em]">&lt;html&gt;</code>,
        inline CSS variables, blocking script) and the client takeover are
        identical. Learn how on the{" "}
        <Link
          href="/zero-flash"
          className="no-underline font-semibold"
          style={{ color: "var(--theme-color-primary)" }}
        >
          zero-flash page
        </Link>
        .
      </Callout>
    </section>
  );
}