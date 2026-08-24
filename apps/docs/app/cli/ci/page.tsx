import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI in CI",
  description: "Validate themes in CI with the theme-kit CLI: GitHub Actions, project-local installs, non-interactive behavior, and exit codes.",
};

export default function Page() {
  return <CliDocPage slug="ci" />;
}