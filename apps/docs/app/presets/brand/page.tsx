import type { Metadata } from "next";

import { BrandPresetsView } from "./brand-presets";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/presets/brand") },
  title: "Brand Presets",
  description:
    "Real-world brand palettes — Apple, GitHub, Vercel, Slack and more. Click any preset to apply it live, with light and dark variants.",
};

export default function BrandPresetsPage() {
  return <BrandPresetsView />;
}
