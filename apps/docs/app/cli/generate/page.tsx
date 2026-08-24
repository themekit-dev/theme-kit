import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI generate",
  description: "Generate a theme from a seed color with the theme-kit CLI: --seed, --family, --mode, and --output.",
};

export default function Page() {
  return <CliDocPage slug="generate" />;
}