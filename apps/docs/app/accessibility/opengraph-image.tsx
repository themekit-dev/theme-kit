import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from "../../components/og/card";

export const alt = "Theme Kit — Accessibility Lab";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgCard({
    eyebrow: "Interactive tool",
    title: "Accessibility Lab",
    description:
      "Check WCAG contrast on any pair, simulate color-vision deficiency, and audit the active theme.",
  });
}
