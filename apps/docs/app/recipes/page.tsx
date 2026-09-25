import type { Metadata } from "next";
import Link from "next/link";
import { RECIPES } from "../../lib/recipes";
import { Icon } from "@iconify/react";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/recipes") },
  title: "Recipes",
  description:
    "Task-oriented patterns for Theme Kit: persistent dark mode, SSR bootstrap, custom scrollbars, scoped themes, and more.",
};


export default function RecipesPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Recipes"
          title="Task-Oriented Patterns"
          description="Copy-paste patterns for common theming tasks. Each recipe is a self-contained solution you can adapt to your project."
        />

        <div className="grid gap-4">
          {RECIPES.map((recipe) => (
            <article
              key={recipe.slug}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-2">
                    <Link href={`/recipes/${recipe.slug}`} className="hover:underline">
                      {recipe.title}
                    </Link>
                  </h3>
                  <p className="text-sm opacity-70">{recipe.description}</p>
                </div>
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label={`Read recipe: ${recipe.title}`}
                >
                  <Icon icon="lucide:chevron-right" className="h-5 w-5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DocsLayout>
  );
}