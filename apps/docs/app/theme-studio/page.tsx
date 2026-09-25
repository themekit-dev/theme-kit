import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { ThemeStudio } from "../../components/theme-studio/theme-studio";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/theme-studio") },
  title: "Theme Studio",
  description:
    "Generate a complete light and dark theme pair from a single seed color using generateTheme(), then apply it to this very site.",
};

export default function ThemeStudioPage() {
  return (
    <DocsLayout>
      <ThemeStudio />
      <p className="mt-10 text-sm leading-relaxed opacity-80">
        Generated from source JSDoc: <a href="/api-reference/core" className="underline">@theme-kit/core API reference</a>
      </p>
    </DocsLayout>
  );
}
