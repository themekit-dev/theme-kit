import Link from "next/link";
import { frameworks } from "../../lib/frameworks";

const matrixSlugs = [
  "react",
  "next",
  "vue",
  "nuxt",
  "svelte",
  "solid",
  "angular",
  "astro",
  "remix",
  "web",
];

export function FrameworkMatrix() {
  const items = matrixSlugs
    .map((slug) => frameworks.find((f) => f.slug === slug))
    .filter((f) => f !== undefined);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Works everywhere
        </h2>
        <p className="opacity-70 max-w-xl mx-auto">
          One runtime. Native integrations. Shared semantics. Pick your
          framework — the concepts stay the same, only the wiring changes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((fw) => (
          <Link
            key={fw.slug}
            href={`/framework-guides/${fw.slug}`}
            className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2 no-underline text-center card-lift"
          >
            <span className="w-11 h-11 rounded-xl grid place-items-center text-xl">
              {fw.icon}
            </span>
            <div className="font-semibold text-sm">{fw.name}</div>
            <div className="mono text-[10px] opacity-40">{fw.pkg}</div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm opacity-60">
        Every integration shares the same core runtime and semantic contract.
        See the{" "}
        <Link
          href="/framework-guides"
          className="no-underline font-semibold"
          style={{ color: "var(--theme-color-primary)" }}
        >
          framework guides →
        </Link>
      </p>
    </section>
  );
}