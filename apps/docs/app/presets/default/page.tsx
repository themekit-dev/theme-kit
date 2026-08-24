import type { Metadata } from "next";

import { DefaultPresetsView } from "./default-presets";

export const metadata: Metadata = {
  title: "Default Presets",
  description:
    "Nine signature preset families — click any to apply it live. Every preset includes light and dark variants with WCAG-conscious token sets.",
};

export default function DefaultPresetsPage() {
  return <DefaultPresetsView />;
}
