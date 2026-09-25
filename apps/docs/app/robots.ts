import type { MetadataRoute } from "next";

import { SITE_URL } from "../lib/site";

/**
 * The docs site is fully public and has no private or preview surface, so
 * everything is crawlable. The only thing worth declaring is the sitemap, which
 * `/sitemap.xml` serves from `app/sitemap.ts`.
 *
 * Kept deliberately simple: a `disallow` list here would silently hide pages
 * from search without any test noticing, and nothing on this site needs hiding.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
