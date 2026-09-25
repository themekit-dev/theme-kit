import type { Metadata } from "next";

import { DefaultPresetsView } from "./default-presets";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/presets/default") },
  title: "Default Presets",
  description:
    "Nine signature preset families — click any to apply it live. Every preset includes light and dark variants with WCAG-conscious token sets.",
};

export default function DefaultPresetsPage() {
  return <DefaultPresetsView />;
}
