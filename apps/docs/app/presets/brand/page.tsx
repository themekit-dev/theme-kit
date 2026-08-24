import type { Metadata } from "next";

import { BrandPresetsView } from "./brand-presets";

export const metadata: Metadata = {
  title: "Brand Presets",
  description:
    "Real-world brand palettes — Apple, GitHub, Vercel, Slack and more. Click any preset to apply it live, with light and dark variants.",
};

export default function BrandPresetsPage() {
  return <BrandPresetsView />;
}
