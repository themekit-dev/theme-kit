import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from "../components/og/card";

/**
 * Site-wide Open Graph card, inherited by every route that does not define its
 * own. Before this existed the site declared `twitter:card: summary_large_image`
 * with no image at all, so shared links rendered an empty card.
 */
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgCard({
    eyebrow: "Documentation",
    title: "Theme Kit",
    description:
      "One runtime, every framework. Semantic tokens, zero-flash SSR, and adapters for the UI libraries you already use.",
  });
}
