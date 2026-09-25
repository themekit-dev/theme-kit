import type { MetadataRoute } from "next";

import { DOCS_ROUTES } from "../lib/docs-routes";
import { SITE_URL } from "../lib/site";
import { getPosts } from "../lib/blog";
import { apiPackages } from "../lib/api-reference";
import { recipeData } from "../lib/recipes";

/**
 * Every indexable route, generated from the same data the app renders from so
 * the sitemap cannot drift:
 *
 *   - the docs surface comes from `DOCS_ROUTES`, the canonical route list that
 *     already drives prev/next pagination and the search index;
 *   - blog posts come from the markdown in `content/blog`;
 *   - API reference pages come from `apiPackages` (+ their `submodules`);
 *   - recipes come from `recipeData`;
 *   - the handful of non-docs pages are listed once, below.
 *
 * `scripts/check-links.mjs` asserts that this file covers every route the app
 * actually renders, so adding a page without listing it here fails the QA gate.
 */

/** Pages outside the docs navigation (home, catalog surfaces, legal). */
const STANDALONE_ROUTES = [
  "/",
  "/presets",
  "/packages",
  "/framework-guides",
  "/libraries",
  "/blog",
  "/roadmap",
  "/showcase",
  "/recipes",
  "/accessibility",
  "/theme-studio",
  "/playground",
  "/reference/compatibility",
  "/reference/diagnostics",
  "/api-reference",
  "/cli",
  "/changelog",
  "/privacy",
  "/terms",
  "/security",
  "/license",
] as const;

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  const push = (
    path: string,
    priority: number,
    out: MetadataRoute.Sitemap,
  ): void => {
    if (seen.has(path)) return;
    seen.add(path);
    out.push(entry(path, priority));
  };

  const routes: MetadataRoute.Sitemap = [];

  // The canonical docs list is the primary source.
  for (const route of DOCS_ROUTES) push(route.href, 0.8, routes);
  for (const path of STANDALONE_ROUTES) push(path, path === "/" ? 1 : 0.7, routes);

  // Dynamic surfaces — enumerated from their own data.
  for (const post of getPosts()) push(`/blog/${post.slug}`, 0.6, routes);

  for (const pkg of apiPackages) {
    push(`/api-reference/${pkg.slug}`, 0.6, routes);
    for (const submodule of pkg.submodules ?? []) {
      push(`/api-reference/${pkg.slug}/${submodule}`, 0.5, routes);
    }
  }

  for (const id of Object.keys(recipeData)) push(`/recipes/${id}`, 0.6, routes);

  return routes;
}
