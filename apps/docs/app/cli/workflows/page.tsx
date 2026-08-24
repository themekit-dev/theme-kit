import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI Workflows",
  description: "Theme authoring workflows with the theme-kit CLI: generate, validate, inspect, migrate, and export for another system.",
};

export default function Page() {
  return <CliDocPage slug="workflows" />;
}