import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/cli/workflows") },
  title: "CLI Workflows",
  description: "Theme authoring workflows with the theme-kit CLI: generate, validate, inspect, migrate, and export for another system.",
};

export default function Page() {
  return <CliDocPage slug="workflows" />;
}