"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { CodeBlock } from "../code-block";
import { Badge } from "../ui/badge";
import {
  COMPLEXITY_LABEL,
  COMPLEXITY_TONE,
  type Complexity,
  type ConceptGroup,
} from "../../lib/examples";

/**
 * Filterable catalog of the real examples in the `examples/` workspace.
 *
 * Everything shown here — the packages, the files, the APIs exercised and the
 * source itself — is read from the example directories at build time, so the
 * page cannot describe an implementation that does not exist.
 */

export type ExplorerConcept = {
  id: string;
  title: string;
  feature: string;
  framework: string;
  group: ConceptGroup;
  complexity: Complexity;
  whatYouLearn: string;
  whyItWorks: string;
  variations: string[];
  packages: string[];
  peerDependencies: string[];
  prerequisites: string[];
  files: string[];
  entry: string;
  exportsUsed: string[];
  dir: string;
  liveHref?: string;
  liveLabel?: string;
  docsHref: string;
  /** The entry file's real contents. */
  source: string;
  /** Pre-highlighted HTML for `source`. */
  sourceHtml: string;
  language: string;
};

export type ExplorerStarter = {
  id: string;
  framework: string;
  label: string;
  blurb: string;
  complexity: Complexity;
  packages: string[];
  devCommand: string;
  dir: string;
  docsHref: string;
};

type Props = {
  concepts: ExplorerConcept[];
  starters: ExplorerStarter[];
  frameworks: { id: string; label: string; count: number }[];
  groups: { id: ConceptGroup; label: string; blurb: string; count: number }[];
  packages: { id: string; count: number }[];
};

function humanize(slug: string): string {
  const s = slug.replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
        active
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border bg-card hover:border-ring"
      }`}
    >
      {children}
      {count !== undefined ? (
        <span className="ml-1.5 opacity-50">{count}</span>
      ) : null}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[7.5rem_minmax(0,1fr)] gap-1 sm:gap-3 py-2 border-t border-border/60 first:border-t-0">
      <dt className="text-[11px] font-semibold uppercase tracking-widest opacity-45 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm min-w-0">{children}</dd>
    </div>
  );
}

function PkgList({ packages }: { packages: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {packages.map((p) => (
        <code key={p} className="mono text-[11px] px-1.5 py-0.5 rounded bg-muted/60">
          {p}
        </code>
      ))}
    </span>
  );
}

function ConceptCard({ example }: { example: ExplorerConcept }) {
  const [open, setOpen] = useState(false);
  const install = `npm i ${example.packages.join(" ")}`;

  return (
    <article
      id={example.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card/40 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="text-base font-semibold tracking-tight">{example.title}</h3>
          <Badge tone={COMPLEXITY_TONE[example.complexity]}>
            {COMPLEXITY_LABEL[example.complexity]}
          </Badge>
          <Badge tone="neutral">{example.framework}</Badge>
        </div>

        <p className="text-sm opacity-85">{example.whatYouLearn}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[11px] opacity-70">
          <PkgList packages={example.packages} />
          <span className="mono">
            {example.files.length} file{example.files.length === 1 ? "" : "s"}
          </span>
          <span className="mono">{example.exportsUsed.length} APIs</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:border-ring cursor-pointer transition-colors"
          >
            {open ? "Hide implementation" : "Show implementation"}
          </button>
          <Link
            href={example.docsHref}
            className="text-xs text-primary hover:underline"
          >
            Read the docs →
          </Link>
          {example.liveHref ? (
            <Link
              href={example.liveHref}
              className="text-xs text-primary hover:underline"
            >
              {example.liveLabel ?? "Try it live"} →
            </Link>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background/40 p-5 space-y-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest opacity-45 mb-2">
              Why it works
            </div>
            <p className="text-sm opacity-85">{example.whyItWorks}</p>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest opacity-45 mb-2">
              Implementation
            </div>
            <CodeBlock
              html={example.sourceHtml}
              code={example.source}
              language={example.language}
              filename={`examples/${example.dir}/${example.entry}`}
            />
          </div>

          <dl className="rounded-xl border border-border bg-card/40 px-4 py-1">
            <Field label="Prerequisites">
              {example.prerequisites.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {example.prerequisites.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : (
                <span className="opacity-70">
                  None beyond a working install — every example is self-contained.
                </span>
              )}
            </Field>

            <Field label="Install">
              <code className="mono text-[12px]">{install}</code>
            </Field>

            <Field label="Configuration">
              <ul className="space-y-1">
                {example.files.map((f) => (
                  <li key={f} className="mono text-[12px]">
                    <span className={f === example.entry ? "text-primary" : "opacity-70"}>
                      {f}
                    </span>
                    {f === example.entry ? (
                      <span className="opacity-50"> — start here</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Field>

            <Field label="APIs used">
              <span className="inline-flex flex-wrap gap-1.5">
                {example.exportsUsed.map((a) => (
                  <code
                    key={a}
                    className="mono text-[11px] px-1.5 py-0.5 rounded border border-border bg-card"
                  >
                    {a}
                  </code>
                ))}
              </span>
            </Field>

            <Field label="Peer deps">
              {example.peerDependencies.length ? (
                <PkgList packages={example.peerDependencies} />
              ) : (
                <span className="opacity-70">None — core only.</span>
              )}
            </Field>
          </dl>

          {example.variations.length ? (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest opacity-45 mb-2">
                Common variations
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm opacity-85">
                {example.variations.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ExamplesExplorer({
  concepts,
  starters,
  frameworks,
  groups,
  packages,
}: Props) {
  const [framework, setFramework] = useState<string | null>(null);
  const [group, setGroup] = useState<ConceptGroup | null>(null);
  const [complexity, setComplexity] = useState<Complexity | null>(null);
  const [pkg, setPkg] = useState<string | null>(null);

  // The filters span both kinds. A concept-group filter is concept-only by
  // definition, so it hides the starter apps rather than pretending they match.
  const filteredConcepts = useMemo(
    () =>
      concepts.filter(
        (c) =>
          (!framework || c.framework === framework) &&
          (!group || c.group === group) &&
          (!complexity || c.complexity === complexity) &&
          (!pkg || c.packages.includes(pkg)),
      ),
    [concepts, framework, group, complexity, pkg],
  );

  const filteredStarters = useMemo(
    () =>
      group
        ? []
        : starters.filter(
            (s) =>
              (!framework || s.framework === framework) &&
              (!complexity || s.complexity === complexity) &&
              (!pkg || s.packages.includes(pkg)),
          ),
    [starters, framework, group, complexity, pkg],
  );

  const activeCount = [framework, group, complexity, pkg].filter(Boolean).length;

  const reset = () => {
    setFramework(null);
    setGroup(null);
    setComplexity(null);
    setPkg(null);
  };

  return (
    <div>
      {/* filter bar */}
      <div className="rounded-xl border border-border bg-card/40 p-4 mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest opacity-45 w-20">
            Framework
          </span>
          {frameworks.map((f) => (
            <Chip
              key={f.id}
              active={framework === f.id}
              onClick={() => setFramework(framework === f.id ? null : f.id)}
              count={f.count}
            >
              {f.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest opacity-45 w-20">
            Concept
          </span>
          {groups.map((g) => (
            <Chip
              key={g.id}
              active={group === g.id}
              onClick={() => setGroup(group === g.id ? null : g.id)}
              count={g.count}
            >
              {g.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest opacity-45 w-20">
            Complexity
          </span>
          {(["beginner", "intermediate", "advanced"] as Complexity[]).map((c) => (
            <Chip
              key={c}
              active={complexity === c}
              onClick={() => setComplexity(complexity === c ? null : c)}
              count={
                concepts.filter((x) => x.complexity === c).length +
                starters.filter((x) => x.complexity === c).length
              }
            >
              {COMPLEXITY_LABEL[c]}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest opacity-45 w-20">
            Package
          </span>
          {packages.map((p) => (
            <Chip
              key={p.id}
              active={pkg === p.id}
              onClick={() => setPkg(pkg === p.id ? null : p.id)}
              count={p.count}
            >
              {p.id.replace("@theme-kit/", "")}
            </Chip>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <span className="text-xs opacity-60" aria-live="polite">
            {filteredStarters.length + filteredConcepts.length} of{" "}
            {starters.length + concepts.length} examples
            {activeCount > 0
              ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} active`
              : ""}
          </span>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filteredStarters.length + filteredConcepts.length === 0 ? (
        <p className="text-sm opacity-70 py-8">
          No example matches those filters.{" "}
          <button
            type="button"
            onClick={reset}
            className="text-primary hover:underline cursor-pointer"
          >
            Clear them
          </button>
          .
        </p>
      ) : null}

      {/* ---------- starter apps ---------- */}
      {filteredStarters.length > 0 ? (
        <section id="starter-apps" className="scroll-mt-24 mb-14">
          <h2 className="text-xl font-semibold tracking-tight mb-1">
            Starter apps{" "}
            <span className="mono text-sm opacity-40">{filteredStarters.length}</span>
          </h2>
          <p className="text-sm opacity-70 mb-6 max-w-2xl">
            One complete runnable app per framework integration, each implementing
            the setup from its framework guide. Clone the repo, run the command, and
            you have a working themed app.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStarters.map((s) => (
              <div
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-xl border border-border bg-card/40 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{s.label}</span>
                  <Badge tone={COMPLEXITY_TONE[s.complexity]}>
                    {COMPLEXITY_LABEL[s.complexity]}
                  </Badge>
                </div>
                <p className="text-sm opacity-80">{s.blurb}</p>
                <PkgList packages={s.packages} />
                <code className="mono text-[11px] px-2 py-1 rounded bg-muted/60 block truncate">
                  {s.devCommand}
                </code>
                <div className="flex flex-wrap items-center gap-3 mt-auto pt-1">
                  <Link href={s.docsHref} className="text-xs text-primary hover:underline">
                    Framework guide →
                  </Link>
                  <a
                    href={`https://github.com/themekit-dev/theme-kit/tree/main/examples/${s.dir}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs text-primary hover:underline"
                  >
                    Source ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- concept examples ---------- */}
      {filteredConcepts.length > 0 ? (
        <section id="concept-examples" className="scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight mb-1">
            Concept examples{" "}
            <span className="mono text-sm opacity-40">{filteredConcepts.length}</span>
          </h2>
          <p className="text-sm opacity-70 mb-6 max-w-2xl">
            Focused implementations of a single Theme Kit feature. Each one is a real
            source tree in the repository — the code below is the file itself, read
            from <code className="mono text-[12px]">examples/</code>, not a
            transcription of it.
          </p>

          <div className="space-y-4">
            {filteredConcepts.map((c) => (
              <ConceptCard key={c.id} example={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
