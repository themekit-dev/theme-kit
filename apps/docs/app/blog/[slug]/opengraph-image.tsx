import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from "../../../components/og/card";
import { getPost } from "../../../lib/blog";

export const alt = "Theme Kit blog post";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  return renderOgCard({
    eyebrow: post ? "Blog" : "Theme Kit",
    title: post?.title ?? "Theme Kit blog",
    description: post?.description,
  });
}
