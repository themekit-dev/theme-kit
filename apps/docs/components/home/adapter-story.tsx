import Link from "next/link";
import { libraries } from "../../lib/libraries";

const cssVarLibraries = ["shadcn", "bootstrap", "daisyui", "open-props"];
const generatedLibraries = ["mui", "chakra", "antd", "mantine"];

function kind(libSlug: string) {
  return libraries.find((l) => l.slug === libSlug);
}

export function AdapterStory() {
  const cssItems = cssVarLibraries.map(kind).filter((l) => l !== undefined);
  const generatedItems = generatedLibraries
    .map(kind)
    .filter((l) => l !== undefined);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Bring your existing UI system
        </h2>
        <p className="opacity-70 max-w-2xl">
          Theme Kit doesn&apos;t replace your component library. It gives your
          component library a theme runtime. Two adapter classes cover the
          ecosystem.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col">
          <div className="text-sm font-semibold mb-1">
            CSS-variable adapters
          </div>
          <div className="mono text-[11px] opacity-50 mb-4">
            Theme tokens → CSS variables → existing library
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {cssItems.map((lib) => (
              <Link
                key={lib.slug}
                href={`/libraries/${lib.slug}`}
                className="chip no-underline hover:border-ring transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{lib.icon}</span>
                  {lib.name}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-xs opacity-60 leading-relaxed text-sm">
            The adapter writes the active theme&apos;s tokens as a live{" "}
            <code className="mono text-[0.9em]">:root</code> stylesheet. Your
            components keep consuming CSS variables — nothing re-renders when
            the theme changes.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 flex flex-col">
          <div className="text-sm font-semibold mb-1">
            Generated-theme adapters
          </div>
          <div className="mono text-[11px] opacity-50 mb-4">
            Theme tokens → library theme object → provider
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {generatedItems.map((lib) => (
              <Link
                key={lib.slug}
                href={`/libraries/${lib.slug}`}
                className="chip no-underline hover:border-ring transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{lib.icon}</span>
                  {lib.name}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-xs opacity-60 leading-relaxed text-sm">
            The adapter rebuilds the library&apos;s native theme object (MUI{" "}
            <code className="mono text-[0.9em]">Theme</code>, Chakra system,
            Ant Design config) whenever the runtime theme changes, then hands
            it to the library&apos;s own provider.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs opacity-50 mr-1">Also:</span>
        <Link
          href="/libraries/unocss"
          className="chip no-underline hover:border-ring transition-colors"
        >
          UnoCSS preset
        </Link>
        <Link
          href="/adapters"
          className="chip no-underline hover:border-ring transition-colors"
        >
          Full adapters guide →
        </Link>
      </div>
    </section>
  );
}