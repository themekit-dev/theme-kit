import type { Metadata } from "next";
import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { getContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Where Theme Kit is heading — themes, adapters, tooling, and the community surface.",
};

interface RoadmapItem {
  text: string;
  completed: boolean;
}

interface RoadmapQuarter {
  title: string;
  items: RoadmapItem[];
}

function parseRoadmap(markdown: string): {
  quarters: RoadmapQuarter[];
  principles: string;
} {
  const lines = markdown.split("\n");
  const quarters: RoadmapQuarter[] = [];
  let currentQuarter: RoadmapQuarter | null = null;
  let inPrinciples = false;
  const principlesLines: string[] = [];

  for (const line of lines) {
    const quarterMatch = line.match(/^### (.+)$/);
    const checklistMatch = line.match(/^- \[([ x])\] (.+)$/);
    const principlesMatch = line.match(/^## Guiding principles$/i);

    if (principlesMatch) {
      inPrinciples = true;
      if (currentQuarter) quarters.push(currentQuarter);
      currentQuarter = null;
      continue;
    }

    if (inPrinciples) {
      principlesLines.push(line);
      continue;
    }

    if (quarterMatch) {
      if (currentQuarter) quarters.push(currentQuarter);
      currentQuarter = { title: quarterMatch[1]!, items: [] };
      continue;
    }

    if (checklistMatch && currentQuarter) {
      currentQuarter.items.push({
        completed: checklistMatch[1] === "x",
        text: checklistMatch[2]!,
      });
    }
  }

  if (currentQuarter) quarters.push(currentQuarter);

  return {
    quarters,
    principles: principlesLines.join("\n").trim(),
  };
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "var(--theme-color-primary)"
                : "color-mix(in srgb, var(--theme-color-primary) 70%, var(--theme-color-accent))",
          }}
        />
      </div>
      <span className="text-xs tabular-nums opacity-60 shrink-0">
        {completed} of {total} completed
      </span>
    </div>
  );
}

function RoadmapCheckItem({ item }: { item: RoadmapItem }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className="mt-0.5 w-5 h-5 shrink-0 rounded-md grid place-items-center text-xs"
        style={{
          background: item.completed
            ? "var(--theme-color-primary)"
            : "transparent",
          color: item.completed
            ? "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))"
            : "currentColor",
          border: item.completed
            ? "none"
            : "1.5px solid var(--theme-color-border, hsl(0 0% 80%))",
          opacity: item.completed ? 1 : 0.5,
        }}
      >
        {item.completed ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </span>
      <span
        className="text-sm leading-relaxed"
        style={{
          opacity: item.completed ? 0.55 : 1,
          textDecoration: item.completed ? "line-through" : "none",
        }}
      >
        {item.text}
      </span>
    </li>
  );
}

export default function RoadmapPage() {
  const { quarters, principles } = parseRoadmap(getContent("roadmap"));

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          }
          title="Roadmap"
          subtitle="Theme Kit"
          description="Where Theme Kit is heading — themes, adapters, tooling, and the community surface. Checked items are shipped in the current release."
        />

        <div className="flex flex-col gap-10">
          {quarters.map((quarter, i) => {
            const completed = quarter.items.filter((it) => it.completed).length;
            const total = quarter.items.length;

            return (
              <section
                key={quarter.title}
                id={`quarter-${i}`}
                className="scroll-mt-24"
              >
                <SectionHeading
                  num={i + 1}
                  desc={
                    <ProgressBar completed={completed} total={total} />
                  }
                >
                  {quarter.title}
                </SectionHeading>
                <ul className="flex flex-col gap-0.5 ml-0.5">
                  {quarter.items.map((item) => (
                    <RoadmapCheckItem key={item.text} item={item} />
                  ))}
                </ul>
              </section>
            );
          })}

          {principles ? (
            <section id="principles" className="scroll-mt-24">
              <SectionHeading num={quarters.length + 1}>
                Guiding Principles
              </SectionHeading>
              <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 text-sm leading-relaxed text-foreground/85">
                <p className="whitespace-pre-line">{principles}</p>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </DocsLayout>
  );
}
