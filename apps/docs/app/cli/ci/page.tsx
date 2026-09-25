import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/cli/ci") },
  title: "CLI in CI",
  description: "Validate themes in CI with the theme-kit CLI: GitHub Actions, project-local installs, non-interactive behavior, and exit codes.",
};

export default function Page() {
  return <CliDocPage slug="ci" />;
}