import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/cli/generate") },
  title: "CLI generate",
  description: "Generate a theme from a seed color with the theme-kit CLI: --seed, --family, --mode, --code, and --output.",
};

export default function Page() {
  return <CliDocPage slug="generate" />;
}