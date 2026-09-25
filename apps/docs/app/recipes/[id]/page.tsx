import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../../components/docs-layout";
import { PageHeader } from "../../../components/ui/page-header";
import { Callout } from "../../../components/ui/callout";
import { RelatedLinks } from "../../../components/ui/related-links";
import { CodeBlock } from "../../../components/code-block";
import { highlightCode } from "../../../lib/highlight";
import { docsUrl } from "../../../lib/site";
import {
  recipeData,
  recipeNeighbours,
  recipePackages,
  RECIPES,
  type RecipeId,
} from "../../../lib/recipes";
import {
  InstallCommand,
  type PackageManager,
} from "../../../components/install-command";

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

/**
 * Install commands for a set of packages, highlighted on the server.
 *
 * Shiki lives in the Node bundle, so the client component receives precomputed
 * HTML — the same approach the framework guides use.
 */
function buildInstallCommands(
  packages: string[],
): Record<PackageManager, { code: string; html: string }> {
  const pkgs = packages.join(" ");
  return Object.fromEntries(
    MANAGERS.map((manager) => {
      const code =
        manager === "npm" ? `npm install ${pkgs}` : `${manager} add ${pkgs}`;
      return [manager, { code, html: highlightCode(code, "bash") }];
    }),
  ) as Record<PackageManager, { code: string; html: string }>;
}

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = id ? recipeData[id as RecipeId] : undefined;
  return {
    title: recipe ? `${recipe.title} — Recipe` : "Recipe",
    description: recipe?.description,
    alternates: { canonical: docsUrl(`/recipes/${id}`) },
  };
}

/** One recipe step: numbered heading, optional lead, content. */
function Step({
  n,
  title,
  lead,
  children,
}: {
  n: number;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold tracking-tight mb-2 flex items-baseline gap-2.5">
        <span className="mono text-xs text-muted-foreground">{n}</span>
        {title}
      </h2>
      {lead ? <p className="text-sm opacity-70 mb-4 max-w-2xl">{lead}</p> : null}
      {children}
    </section>
  );
}

/** A labelled row in the Goal / Prerequisites / Stack / Result summary. */
function Fact({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[9rem_minmax(0,1fr)] gap-1 sm:gap-4 py-3 ${
        last ? "" : "border-b border-border/60"
      }`}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-widest opacity-45 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm m-0">{children}</dd>
    </div>
  );
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = id ? recipeData[id as RecipeId] : undefined;

  if (!recipe) {
    return (
      <DocsLayout>
        <div className="max-w-3xl">
          <PageHeader
            eyebrow="Recipe"
            title="Recipe not found"
            description="That recipe does not exist. Browse the full list instead."
          />
          <RelatedLinks
            links={[
              {
                title: "All recipes",
                href: "/recipes",
                description: `${RECIPES.length} task-oriented walkthroughs.`,
              },
            ]}
          />
        </div>
      </DocsLayout>
    );
  }

  const { prev, next } = recipeNeighbours(id as RecipeId);
  const packages = recipePackages(id as RecipeId);
  const installCommands = buildInstallCommands(packages);
  const isCli = packages.some((p) => p.endsWith("/cli"));

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <Link href="/recipes" className="hover:underline">
                Recipes
              </Link>
              <span aria-hidden className="opacity-40">
                /
              </span>
              <span>Recipe</span>
            </span>
          }
          title={recipe.title}
          description={recipe.description}
        />

        <dl className="rounded-xl border border-border bg-card/40 px-4 py-1 mb-10">
          <Fact label="Goal">{recipe.description}</Fact>

          <Fact label="Prerequisites">
            {recipe.prerequisites.length ? (
              <ul className="list-disc pl-5 space-y-1 m-0">
                {recipe.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ) : (
              <span className="opacity-70">None beyond a working install.</span>
            )}
          </Fact>

          <Fact label="Stack">{recipe.stack}</Fact>

          <Fact label="Result" last>
            <span className="font-medium">{recipe.result}</span>
          </Fact>
        </dl>

        <Step
          n={1}
          title="Install"
          lead={
            isCli
              ? "One package — the CLI. Pick your package manager and run it from your project root."
              : "Pick your package manager — the command updates to match."
          }
        >
          <div className="rounded-xl border border-border bg-card/40 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Install command
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Needs</span>
                {packages.map((p) => (
                  <code key={p} className="mono text-foreground">
                    {p}
                  </code>
                ))}
              </div>
            </div>

            <InstallCommand commands={installCommands} />
          </div>

          <p className="text-[11px] text-muted-foreground mt-2.5">
            {isCli ? (
              <>
                Prefer not to install it? Run it without installing with{" "}
                <code className="mono text-foreground">
                  npx --yes @theme-kit/cli generate …
                </code>
                . See the{" "}
                <Link href="/cli/installation" className="text-primary hover:underline">
                  CLI installation guide
                </Link>{" "}
                for global and project-local setups.
              </>
            ) : (
              <>
                Using a framework? Its adapter is a separate package — see the{" "}
                <Link href="/framework-guides" className="text-primary hover:underline">
                  framework guides
                </Link>{" "}
                for the provider setup, then come back for the pattern.
              </>
            )}
          </p>
        </Step>

        <Step
          n={2}
          title="Implement"
          lead="Drop this into your project. It is the whole pattern — no other setup is required."
        >
          <CodeBlock
            html={highlightCode(recipe.code, "tsx")}
            code={recipe.code}
            language="tsx"
          />
        </Step>

        <Step n={3} title="Why this works">
          <p className="text-sm opacity-80 leading-relaxed max-w-2xl m-0">
            {recipe.explanation}
          </p>
        </Step>

        <Step n={4} title="Verify">
          <ul className="space-y-2 text-sm m-0 p-0 list-none">
            {[
              "The page loads with no console errors after the change.",
              `The outcome holds: ${recipe.result.charAt(0).toLowerCase()}${recipe.result.slice(1)}`,
              "Toggling the theme in your app still works, and the state survives a reload if persistence is configured.",
              "Reduced-motion users see no animation if you enabled transitions.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="text-primary shrink-0">
                  ✓
                </span>
                <span className="opacity-85">{item}</span>
              </li>
            ))}
          </ul>
        </Step>

        <Callout variant="warning" title="Common failure">
          The most frequent cause is a prerequisite that is only half met — an
          adapter installed without the framework it wraps, or a provider mounted
          above the component that reads the theme. Re-read the prerequisites
          above, then confirm the provider wraps the tree that uses the value.
        </Callout>

        <div className="mt-10">
          <RelatedLinks
            title="Related"
            links={[
              ...recipe.nextSteps.map((s) => ({ title: s.text, href: s.href })),
              {
                title: "Core API reference",
                href: "/api-reference/core",
                description: "Generated API docs for every export used here.",
              },
              {
                title: "Framework guides",
                href: "/framework-guides",
                description: "Setup for the stack you picked in step 1.",
              },
              {
                title: "Known limitations",
                href: "/known-limitations",
                description: "Boundaries worth knowing before you ship.",
              },
            ].slice(0, 6)}
          />
        </div>

        <nav
          aria-label="Recipe pagination"
          className="mt-14 pt-8 border-t border-border grid gap-4 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/recipes/${prev.slug}`}
              className="glass-card card-lift p-4 no-underline flex flex-col gap-1"
            >
              <span className="text-[11px] uppercase tracking-widest opacity-50">
                ← Previous recipe
              </span>
              <span className="font-medium text-sm">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              href={`/recipes/${next.slug}`}
              className="glass-card card-lift p-4 no-underline flex flex-col gap-1 sm:text-right sm:items-end"
            >
              <span className="text-[11px] uppercase tracking-widest opacity-50">
                Next recipe →
              </span>
              <span className="font-medium text-sm">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </div>
    </DocsLayout>
  );
}
