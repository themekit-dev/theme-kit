import type { ReactNode } from "react";

import { CodeBlock } from "../code-block";
import { Callout } from "../ui/callout";
import { InlineCode } from "../ui/inline-code";
import { InstallCommand, type PackageManager } from "../install-command";
import { highlightCode } from "../../lib/highlight";
import type {
  FrameworkItem,
  FrameworkSetupGuide,
  FrameworkSnippet,
  SetupPath,
  SetupStep,
} from "../../lib/frameworks";

/** One package-manager-keyed install command, ready to render. */
type InstallCommands = Record<PackageManager, { code: string; html: string }>;

/**
 * The install commands the two paths need.
 *
 * The paths differ in what they install — Astro-only pulls two framework-free
 * packages, Astro + React adds the React renderer — so the guide receives both
 * sets rather than one. A step picks the set that matches its own path, which
 * means the command a reader copies is complete for the shape they chose and
 * they never have to infer an extra package from prose.
 */
type InstallCommandSets = {
  base: InstallCommands;
  renderer: InstallCommands;
};

/**
 * The Astro guide, rendered from the `setupGuide` data on the Astro entry.
 *
 * Astro is not one setup. An Astro-native app and an Astro + React island app
 * install different packages and import different entries, and the difference
 * has to be visible *before* the install step — otherwise a reader meets a
 * React-specific import halfway through an otherwise Astro-native guide.
 *
 * So the guide presents the two shapes as an explicit choice first, gives each
 * one only its own steps, and explains what they share exactly once, below
 * both. This component is presentation only: every string, snippet and anchor
 * id comes from `lib/frameworks.tsx`, which stays the guide's single source.
 */
export function AstroSetupGuide({
  framework,
  installCommands,
}: {
  framework: FrameworkItem;
  installCommands: InstallCommandSets;
}) {
  const guide = framework.setupGuide;
  if (!guide) return null;

  const [only, react] = guide.choose.paths;

  return (
    <>
      <GuideNav guide={guide} />

      <section id="overview" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
        {guide.overview.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm leading-relaxed opacity-80">
            <InlineCode>{paragraph}</InlineCode>
          </p>
        ))}
        <Pre>{ARCHITECTURE}</Pre>
      </section>

      <section id="choose-your-setup" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">
          {guide.choose.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed opacity-80">
          <InlineCode>{guide.choose.intro}</InlineCode>
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {guide.choose.paths.map((path) => (
            <ChoiceCard key={path.id} path={path} />
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold">
          {guide.choose.decision.title}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          {guide.choose.decision.lines.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-sm leading-relaxed opacity-80"
            >
              <span aria-hidden="true" className="opacity-50">
                —
              </span>
              <span>
                <InlineCode>{line}</InlineCode>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-border pb-2 pr-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Area
                </th>
                {guide.choose.columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-border pb-2 pr-4 text-xs font-semibold uppercase tracking-wide opacity-60"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.choose.comparison.map((row) => (
                <tr key={row.area}>
                  <td className="border-b border-border py-2 pr-4 align-top">
                    <InlineCode>{row.area}</InlineCode>
                  </td>
                  <td className="border-b border-border py-2 pr-4 align-top">
                    <CompareCell value={row.a} />
                  </td>
                  <td className="border-b border-border py-2 pr-4 align-top">
                    <CompareCell value={row.b} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs opacity-60">
          &ldquo;Shared&rdquo; means the two paths do not differ — there is one
          implementation, described under Shared behavior below.
        </p>
      </section>

      <PathSection
        path={only}
        framework={framework}
        installCommands={installCommands}
      />

      <PathSection
        path={react}
        framework={framework}
        installCommands={installCommands}
        diagram={guide.boundary}
        diagramLabel="Where React lives"
      />

      <section id="shared-behavior" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">
          {guide.shared.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed opacity-80">
          <InlineCode>{guide.shared.intro}</InlineCode>
        </p>
        {guide.shared.sections.map((section) => (
          <div key={section.id} id={section.id} className="mt-5 scroll-mt-24">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            <p className="mt-1 text-sm leading-relaxed opacity-80">
              <InlineCode>{section.body}</InlineCode>
            </p>
          </div>
        ))}
      </section>

      <section id="examples" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight">
          {guide.examples.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed opacity-80">
          <InlineCode>{guide.examples.intro}</InlineCode>
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {guide.examples.apps.map((app) => (
            <div
              key={`${app.label}-${app.path}`}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="text-sm font-semibold">{app.label}</div>
              <a
                href="/examples"
                className="mt-0.5 inline-block font-mono text-xs text-primary no-underline hover:underline"
              >
                {app.path}
              </a>
              <p className="mt-2 text-xs leading-relaxed opacity-70">
                <InlineCode>{app.note}</InlineCode>
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/** The shape of the guide, before the reader picks a path. */
const ARCHITECTURE = `Astro
├── Astro-only
│   └── no React runtime
│
└── Astro + React
    └── Astro pages + optional React islands`;

/**
 * A compact, contextual local navigation for the Astro guide.
 *
 * Deliberately small: the global rail already lists every heading, so this
 * exists for one job — making the two setup paths reachable without scrolling.
 * The setup switch is the primary affordance; the anchor list below it is the
 * secondary one.
 */
function GuideNav({ guide }: { guide: FrameworkSetupGuide }) {
  const [only, react] = guide.choose.paths;

  const items: Array<{ id: string; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "choose-your-setup", label: "Choose your setup" },
    { id: only.id, label: only.name },
    { id: react.id, label: react.name },
    { id: "shared-behavior", label: "Shared behavior" },
    { id: "examples", label: "Examples" },
    { id: "caveats", label: "Caveats" },
  ];

  return (
    <nav
      aria-label="Astro guide sections"
      className="mt-8 rounded-xl border border-border bg-card p-4"
    >
      <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
        On this page
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {guide.choose.paths.map((path) => (
          <a
            key={path.id}
            href={`#${path.id}`}
            className="chip no-underline"
            aria-label={`Jump to the ${path.name} setup`}
          >
            {path.name}
          </a>
        ))}
      </div>
      <p className="mt-2 text-xs opacity-60">
        Two supported setups. Pick one — the guide below gives each its own
        steps and shares the rest.
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-xs opacity-70 no-underline hover:text-primary hover:opacity-100"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * One of the two choices. Both cards use the same component and the same
 * classes — they are distinguished by their badge and summary, not by an
 * arbitrary color system invented for this page.
 */
function ChoiceCard({ path }: { path: SetupPath }) {
  return (
    <a
      href={`#${path.id}`}
      className="block rounded-xl border border-border bg-card p-4 no-underline transition-colors hover:border-ring"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {path.name}
        </span>
        <span className="chip text-xs">{path.badge}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed opacity-70">{path.summary}</p>
      <p className="mt-2 text-xs leading-relaxed opacity-60">
        <InlineCode>{path.useWhen}</InlineCode>
      </p>
    </a>
  );
}

/** One path: its badge, its steps, and nothing the other path also needs. */
function PathSection({
  path,
  framework,
  installCommands,
  diagram,
  diagramLabel,
}: {
  path: SetupPath;
  framework: FrameworkItem;
  installCommands: InstallCommandSets;
  diagram?: string;
  diagramLabel?: string;
}) {
  return (
    <section id={path.id} className="mt-10 scroll-mt-24">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{path.name}</h2>
        <span className="chip text-xs">{path.badge}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed opacity-80">
        <InlineCode>{path.useWhen}</InlineCode>
      </p>

      {path.steps.map((step, index) => (
        <Step
          key={step.label}
          step={step}
          num={index + 1}
          framework={framework}
          installCommands={installCommands}
        />
      ))}

      {diagram ? (
        <>
          <h3 className="mt-6 text-sm font-semibold">
            {diagramLabel ?? "Framework boundary"}
          </h3>
          <Pre>{diagram}</Pre>
        </>
      ) : null}
    </section>
  );
}

function Step({
  step,
  num,
  framework,
  installCommands,
}: {
  step: SetupStep;
  num: number;
  framework: FrameworkItem;
  installCommands: InstallCommandSets;
}) {
  const snippets = stepSnippets(framework, step);

  // `install` names the profile, not just "show a command": the React path
  // installs a renderer the Astro-only path does not, so each path renders its
  // own complete command rather than a shared one plus a prose caveat.
  const install =
    step.install === "renderer"
      ? installCommands.renderer
      : step.install === "base"
        ? installCommands.base
        : null;

  return (
    <section className="mt-6">
      {/* The step number is a sibling of the heading, not part of it. Inside the
          heading it would join the heading's textContent ("1Install"), and the
          TOC rail strips a leading number with `^\d+\s*` — which leaves the
          separator behind ("1.Install" → ".Install"). Keeping the marker out of
          the heading means the rail shows exactly the step label. */}
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="w-5 h-5 shrink-0 rounded-full grid place-items-center text-[0.65rem] font-bold"
          style={{
            background: "var(--theme-color-primary)",
            color:
              "var(--theme-color-primaryForeground)",
          }}
        >
          {num}
        </span>
        <h3 className="text-sm font-semibold tracking-tight">{step.label}</h3>
      </div>
      <p className="mt-1 text-sm leading-relaxed opacity-80">
        <InlineCode>{step.desc}</InlineCode>
      </p>

      {install ? (
        <div className="mt-3">
          <InstallCommand commands={install} />
        </div>
      ) : null}

      {snippets.map((snippet, index) => (
        <div key={`${snippet.title}-${index}`} className="mt-3">
          <SnippetBlock snippet={snippet} />
        </div>
      ))}

      {step.note ? (
        <Callout className="mt-3">
          <InlineCode>{step.note}</InlineCode>
        </Callout>
      ) : null}
    </section>
  );
}

/**
 * A step's snippets: the framework entry's own slots first (so the Quick Start
 * page and this guide render one definition), then any guide-only snippet.
 */
function stepSnippets(
  framework: FrameworkItem,
  step: SetupStep,
): FrameworkSnippet[] {
  const fromRefs = (step.refs ?? [])
    .map((slot) => framework[slot])
    .filter((snippet): snippet is FrameworkSnippet => Boolean(snippet));

  return [...fromRefs, ...(step.snippets ?? [])];
}

function SnippetBlock({ snippet }: { snippet: FrameworkSnippet }) {
  return (
    <CodeBlock
      html={highlightCode(snippet.code, snippet.lang)}
      code={snippet.code}
      language={snippet.lang}
      filename={snippet.title}
      className="rounded-lg m-0"
    />
  );
}

/**
 * "Yes" / "No" / "shared" — the comparison table's cell vocabulary. Anything
 * else is prose and renders as written, so the table cannot flatten a nuance
 * into a checkmark.
 */
function CompareCell({ value }: { value: string }): ReactNode {
  const normalised = value.toLowerCase();
  if (normalised === "yes") {
    return <span className="font-medium text-primary">Yes</span>;
  }
  if (normalised === "no") {
    return <span className="opacity-50">No</span>;
  }
  return (
    <span className="text-xs opacity-80">
      <InlineCode>{value}</InlineCode>
    </span>
  );
}

/**
 * A monospaced diagram. Marked `aria-hidden` because it is a picture of a
 * relationship the surrounding prose already states — a screen reader reading
 * box-drawing characters is worse than not reading them.
 */
function Pre({ children }: { children: string }) {
  return (
    <pre
      aria-hidden="true"
      className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground/80"
    >
      {children}
    </pre>
  );
}
