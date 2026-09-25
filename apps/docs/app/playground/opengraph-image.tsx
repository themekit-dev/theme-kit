import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from "../../components/og/card";

export const alt = "Theme Kit — Playground";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgCard({
    eyebrow: "Interactive tool",
    title: "Playground",
    description:
      "Drive the real Theme Kit runtime: switch families and modes, inspect every token, and time-travel through theme history.",
  });
}
