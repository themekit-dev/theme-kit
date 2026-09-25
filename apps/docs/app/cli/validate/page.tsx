import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/cli/validate") },
  title: "CLI validate",
  description: "Validate a theme with the theme-kit CLI: schema, required tokens, references, and contrast, with exit-code gates for CI.",
};

export default function Page() {
  return <CliDocPage slug="validate" />;
}