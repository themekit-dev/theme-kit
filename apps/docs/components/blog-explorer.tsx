"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "../lib/date-utils";
import type { BlogPost } from "../lib/blog";

export function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) for (const t of p.tags) set.add(t);
    return [...set].sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, activeTag]);

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative w-full">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-foreground/40 transition-colors focus:border-ring"
            aria-label="Search blog posts"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`chip ${activeTag === null ? "chip-active" : ""}`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`chip ${activeTag === tag ? "chip-active" : ""}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs opacity-50 mb-4">
        {filtered.length} post{filtered.length === 1 ? "" : "s"}
        {activeTag ? ` in #${activeTag}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-10 text-center">
          <p className="text-sm opacity-50">
            No posts match{query ? ` “${query}”` : ""}
            {activeTag ? ` in #${activeTag}` : ""}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-12">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card card-lift p-5 no-underline flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{post.title}</div>
                <span
                  className="text-xs font-semibold shrink-0"
                  style={{ color: "var(--theme-color-primary)" }}
                >
                  Read →
                </span>
              </div>
              <p className="m-0 text-sm opacity-70 leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center gap-3 mt-auto pt-1">
                <span className="text-[11px] mono opacity-50">
                  {formatDate(post.date)}
                </span>
                <span className="text-[11px] mono opacity-40">
                  · {post.readingTime} min read
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTag(tag);
                        setQuery("");
                      }}
                      className="chip text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40 cursor-pointer hover:border-primary transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
