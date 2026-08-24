import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { formatDate, readingTime as calcReadingTime } from "./date-utils";

export { formatDate } from "./date-utils";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
  readingTime: number;
};

const blogDir = join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1]!.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2]! };
}

export function getPosts(): BlogPost[] {
  return readdirSync(blogDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = readFileSync(join(blogDir, f), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      const words = body.trim().split(/\s+/).length;
      const readingTime = Math.max(1, Math.round(words / 200));
      return {
        slug,
        title: meta.title ?? slug,
        date: meta.date ?? "",
        description: meta.description ?? "",
        tags: (meta.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        content: body,
        readingTime,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): BlogPost | undefined {
  return getPosts().find((p) => p.slug === slug);
}
