import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsLayout } from "../../../components/docs-layout";
import { Markdown } from "../../../components/markdown";
import { PageHeader } from "../../../components/ui/page-header";
import { formatDate, getPost, getPosts } from "../../../lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const prev = posts[index - 1];
  const next = posts[index + 1];

  return (
    <DocsLayout>
      <article className="max-w-3xl">
        <PageHeader
          eyebrow={
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--theme-color-primary)" }}
              />
              {formatDate(post.date)} · {post.readingTime} min read
            </span>
          }
          title={post.title}
          description={post.description}
        />
        <div className="flex flex-wrap gap-1.5 -mt-6 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40"
            >
              {tag}
            </span>
          ))}
        </div>
        <Markdown content={post.content} />
      </article>

      <nav
        aria-label="Blog post navigation"
        className="mt-14 pt-8 border-t border-border grid gap-4 sm:grid-cols-2"
      >
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group rounded-xl border border-border p-4 no-underline flex flex-col gap-1 card-lift"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest opacity-40">
              ← Older Post
            </span>
            <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary">
              {next.title}
            </span>
            {next.description ? (
              <span className="text-xs opacity-60 line-clamp-1">
                {next.description}
              </span>
            ) : null}
          </Link>
        ) : (
          <div />
        )}
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group rounded-xl border border-border p-4 no-underline flex flex-col gap-1 sm:text-right card-lift"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest opacity-40">
              Newer Post →
            </span>
            <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary">
              {prev.title}
            </span>
            {prev.description ? (
              <span className="text-xs opacity-60 line-clamp-1">
                {prev.description}
              </span>
            ) : null}
          </Link>
        ) : null}
      </nav>
    </DocsLayout>
  );
}
