import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { ThemeStudio } from "../../components/theme-studio/theme-studio";

export const metadata: Metadata = {
  title: "Theme Studio",
  description:
    "Generate a complete light and dark theme pair from a single seed color using generateTheme(), then apply it to this very site.",
};

export default function ThemeStudioPage() {
  return (
    <DocsLayout>
      <ThemeStudio />
    </DocsLayout>
  );
}
