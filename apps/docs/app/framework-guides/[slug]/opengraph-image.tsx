import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from "../../../components/og/card";
import { frameworks } from "../../../lib/frameworks";

export const alt = "Theme Kit framework guide";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const framework = frameworks.find((f) => f.slug === slug);

  return renderOgCard({
    eyebrow: "Framework guide",
    title: framework?.name ?? "Theme Kit",
    description: framework?.tagline,
  });
}
