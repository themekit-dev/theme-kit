import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI inspect",
  description: "Inspect a theme's structure and token groups with the theme-kit CLI.",
};

export default function Page() {
  return <CliDocPage slug="inspect" />;
}