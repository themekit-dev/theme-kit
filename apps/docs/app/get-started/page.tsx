import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { GetStartedRouter } from "../../components/get-started/router";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/get-started") },
  title: "Get Started",
  description:
    "Choose your learning path: Quick Start for instant themes, Custom Themes for branded palettes, Framework Guides for production patterns, or Library Integration for pre-built components.",
};

export default function GetStartedPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Get Started"
          title="Get Started with Theme Kit"
          description="Choose the guide that fits your needs — from instant setup to advanced framework patterns."
        />
        <GetStartedRouter />
      </div>
    </DocsLayout>
  );
}
