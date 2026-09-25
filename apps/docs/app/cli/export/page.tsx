import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/cli/export") },
  title: "CLI export",
  description: "Export a theme to CSS variables or JSON with the theme-kit CLI.",
};

export default function Page() {
  return <CliDocPage slug="export" />;
}