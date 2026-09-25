import type { Metadata } from "next";

import { PresetShowcase } from "../../components/preset-showcase";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/presets") },
  title: "Built-in Presets",
  description:
    "Theme Kit ships with 9 curated preset families and 5 brand presets — click any to apply it live. Every preset includes light and dark variants with WCAG-conscious token sets.",
};

export default function PresetsPage() {
  return <PresetShowcase />;
}
