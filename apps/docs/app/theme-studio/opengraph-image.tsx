import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from "../../components/og/card";

export const alt = "Theme Kit — Theme Studio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgCard({
    eyebrow: "Interactive tool",
    title: "Theme Studio",
    description:
      "Generate a complete light/dark theme pair from a seed color, preview it live, and export it as TypeScript or JSON.",
  });
}
