import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { RelatedLinks } from "../../components/ui/related-links";
import {
  ExamplesExplorer,
  type ExplorerConcept,
  type ExplorerStarter,
} from "../../components/examples/example-explorer";
import {
  CONCEPTS,
  CONCEPT_GROUPS,
  FRAMEWORKS,
  PACKAGES_USED,
  STARTERS,
  type Complexity,
} from "../../lib/examples";
import { highlightCode } from "../../lib/highlight";
import { PKG_VERSION } from "../../lib/version";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/examples") },
  title: "Examples",
  description:
    "Runnable Theme Kit examples straight from the repository: a starter app for every framework, plus focused implementations of persistence, scoping, scheduling, zero-flash SSR and more.",
};

/** The `examples/` workspace lives at the repository root. */
const EXAMPLES_ROOT = join(process.cwd(), "..", "..", "examples");

const LANG_BY_EXT: Record<string, string> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  html: "html",
  css: "css",
  json: "json",
};

function languageOf(file: string): string {
  const ext = file.split(".").pop() ?? "";
  return LANG_BY_EXT[ext] ?? "ts";
}

/** Title-case a feature slug, keeping known acronyms intact. */
function titleize(feature: string): string {
  const s = feature.replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const FRAMEWORK_LABEL: Record<string, string> = {
  core: "core (no framework)",
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  solid: "Solid",
  angular: "Angular",
  web: "Web Components",
  astro: "Astro",
  nuxt: "Nuxt",
  remix: "Remix",
  tailwind: "Tailwind",
  next: "Next.js",
};

function frameworkLabel(id: string): string {
  return FRAMEWORK_LABEL[id] ?? id;
}

/**
 * Read each concept example's entry file from disk and highlight it.
 *
 * The page shows the real file, so a mismatch between what the docs claim and
 * what the repository contains is impossible by construction.
 */
function buildConcepts(): ExplorerConcept[] {
  return CONCEPTS.map((example) => {
    const entryPath = join(EXAMPLES_ROOT, example.dir, example.entry);
    let source = "";
    try {
      source = readFileSync(entryPath, "utf8").replace(/\s+$/, "");
    } catch {
      source = `// ${example.dir}/${example.entry} could not be read.`;
    }
    const language = languageOf(example.entry);

    return {
      id: example.id,
      title: `${titleize(example.feature)} in ${frameworkLabel(example.framework)}`,
      feature: example.feature,
      framework: example.framework,
      group: example.group,
      complexity: example.complexity,
      whatYouLearn: example.whatYouLearn,
      whyItWorks: example.whyItWorks,
      variations: example.variations,
      packages: example.packages,
      peerDependencies: example.peerDependencies,
      prerequisites: example.prerequisites,
      files: example.files,
      entry: example.entry,
      exportsUsed: example.exportsUsed,
      dir: example.dir,
      ...(example.liveHref ? { liveHref: example.liveHref } : {}),
      ...(example.liveLabel ? { liveLabel: example.liveLabel } : {}),
      docsHref: example.docsHref,
      source,
      sourceHtml: highlightCode(source, language),
      language,
    };
  });
}

function buildStarters(): ExplorerStarter[] {
  return STARTERS.map((s) => ({
    id: s.id,
    framework: s.framework,
    label: s.label,
    blurb: s.blurb,
    complexity: s.complexity,
    packages: s.packages,
    devCommand: s.devCommand,
    dir: s.dir,
    docsHref: s.docsHref,
  }));
}

export default function ExamplesPage() {
  const concepts = buildConcepts();
  const starters = buildStarters();

  // Filter facets are derived from the data, so a new example appears in the
  // filter bar automatically. Frameworks span both kinds — the starter apps are
  // where most frameworks live, and a framework filter that ignored them would
  // only ever offer core/react.
  const frameworks = FRAMEWORKS.map((f) => ({
    id: f,
    label: frameworkLabel(f),
    count:
      concepts.filter((c) => c.framework === f).length +
      starters.filter((s) => s.framework === f).length,
  })).filter((f) => f.count > 0);

  const groups = CONCEPT_GROUPS.map((g) => ({
    ...g,
    count: concepts.filter((c) => c.group === g.id).length,
  })).filter((g) => g.count > 0);

  const packages = PACKAGES_USED.map((p) => ({
    id: p,
    count:
      concepts.filter((c) => c.packages.includes(p)).length +
      starters.filter((s) => s.packages.includes(p)).length,
  })).filter((p) => p.count > 0);

  const complexityCounts: Record<Complexity, number> = {
    beginner: concepts.filter((c) => c.complexity === "beginner").length,
    intermediate: concepts.filter((c) => c.complexity === "intermediate")
      .length,
    advanced: concepts.filter((c) => c.complexity === "advanced").length,
  };

  return (
    <DocsLayout>
      <div className="max-w-4xl">
        <PageHeader
          eyebrow="Examples"
          title="Examples you can run"
          description="Every example here is a real source tree in the Theme Kit repository — a starter app for each framework integration, plus focused implementations of a single feature. The code shown is the file itself, read from examples/ at build time."
          verified={{ version: PKG_VERSION, date: "September 18, 2026" }}
        />

        <Callout variant="info" title="How these differ from the Showcase">
          The{" "}
          <Link href="/showcase" className="text-primary hover:underline">
            Showcase
          </Link>{" "}
          is what people have built <em>with</em> Theme Kit. This page is how to
          build it: small, runnable implementations you can copy and adapt.
        </Callout>

        <div className="grid gap-3 sm:grid-cols-3 my-8">
          {(
            [
              [
                "Starter apps",
                starters.length,
                "one per framework integration",
              ],
              [
                "Concept examples",
                concepts.length,
                "focused on a single feature",
              ],
              [
                "Complexity spread",
                `${complexityCounts.beginner} / ${complexityCounts.intermediate} / ${complexityCounts.advanced}`,
                "beginner / intermediate / advanced",
              ],
            ] as const
          ).map(([label, value, hint]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card/40 p-4"
            >
              <div className="text-2xl font-semibold tracking-tight">
                {value}
              </div>
              <div className="text-sm font-medium mt-0.5">{label}</div>
              <div className="text-[11px] opacity-60 mt-0.5">{hint}</div>
            </div>
          ))}
        </div>

        <ExamplesExplorer
          concepts={concepts}
          starters={starters}
          frameworks={frameworks}
          groups={groups}
          packages={packages}
        />

        <SectionHeading className="mt-10" num={3} id="running">
          Running an example locally
        </SectionHeading>
        <p className="text-sm opacity-80 mb-4 max-w-2xl">
          The examples are part of the pnpm workspace, so the{" "}
          <code className="mono text-[12px]">@theme-kit/*</code> packages
          resolve to the local source rather than to npm. That means an example
          always exercises the version in the repository.
        </p>
        <pre className="rounded-xl border border-border bg-card/40 p-4 overflow-x-auto text-[12px] leading-relaxed mono">
          {`# from the repository root
pnpm install

# run a starter app
pnpm --filter @theme-kit/example-react dev

# type-check and build it
pnpm --filter @theme-kit/example-react build`}
        </pre>
        <p className="text-sm opacity-80 mt-4 max-w-2xl">
          Concept examples are smaller trees inside{" "}
          <code className="mono text-[12px]">
            examples/&lt;feature&gt;/&lt;framework&gt;/
          </code>
          . Copy the files into a project that already has the packages
          installed — each one lists exactly what it needs.
        </p>

        <Callout variant="tip" title="Live demos" className="my-10">
          These examples are not deployed, so there is no hosted demo to link to
          — the code and the run command are the demo. Where this site has a
          genuinely interactive surface for the same concept (the{" "}
          <Link href="/playground" className="text-primary hover:underline">
            Playground
          </Link>
          ,{" "}
          <Link href="/theme-studio" className="text-primary hover:underline">
            Theme Studio
          </Link>
          ,{" "}
          <Link href="/accessibility" className="text-primary hover:underline">
            Accessibility Lab
          </Link>
          ), the example links to it.
        </Callout>

        <RelatedLinks
          links={[
            {
              title: "Framework guides",
              href: "/framework-guides",
              description: "The setup each starter app implements.",
            },
            {
              title: "Recipes",
              href: "/recipes",
              description: "Task-oriented walkthroughs for common goals.",
            },
            {
              title: "Showcase",
              href: "/showcase",
              description: "What people have built with Theme Kit.",
            },
            {
              title: "Playground",
              href: "/playground",
              description: "Drive the runtime live in the browser.",
            },
            {
              title: "Package map",
              href: "/package-map",
              description: "Which packages an example pulls in, and why.",
            },
            {
              title: "Quick Start",
              href: "/quick-start",
              description: "The shortest path to a themed app.",
            },
          ]}
        />
      </div>
    </DocsLayout>
  );
}
