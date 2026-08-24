import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { use } from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs-layout";
import { MarkdownDoc } from "../../../components/markdown-doc";
import { apiPackages } from "../../../lib/api-reference";

const contentDir = join(process.cwd(), "content", "api-reference");

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [pkgSlug, pageSlug] = slug ?? [];
  if (!pkgSlug) return { title: "API Reference" };

  const pkg = apiPackages.find((p) => p.slug === pkgSlug);
  if (!pkg) notFound();

  const name = pageSlug
    ? `${pkg.name} — ${pageSlug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
    : `${pkg.name}`;

  return {
    title: `${name} — API Reference`,
    description: pkg.tagline,
    openGraph: {
      title: `${name} — API Reference`,
      description: pkg.tagline,
    },
  };
}

export function generateStaticParams() {
  const params: { slug: string[] }[] = [];
  for (const pkg of apiPackages) {
    params.push({ slug: [pkg.slug] });
    const subdir = join(contentDir, pkg.slug);
    if (existsSync(subdir)) {
      for (const file of readdirSync(subdir)) {
        if (file.endsWith(".md")) {
          params.push({ slug: [pkg.slug, file.replace(/\.md$/, "")] });
        }
      }
    }
  }
  return params;
}

export default function ApiReferencePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);

  const [pkg, page] = slug;
  if (!pkg) notFound();

  const file = page
    ? join(contentDir, pkg, `${page}.md`)
    : join(contentDir, `${pkg}.md`);

  if (!existsSync(file)) notFound();

  const content = readFileSync(file, "utf8");

  const pkgMeta = apiPackages.find((p) => p.slug === pkg);
  const pageTitle = page
    ? `${pkgMeta?.name ?? `@theme-kit/${pkg}`} · ${page
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())}`
    : (pkgMeta?.name ?? pkg);

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <MarkdownDoc
          content={content}
          title={pageTitle}
          eyebrow="API Reference"
          {...(pkgMeta?.tagline ? { description: pkgMeta.tagline } : {})}
        />
      </div>
    </DocsLayout>
  );
}
