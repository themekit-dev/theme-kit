import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI export",
  description: "Export a theme to CSS variables or JSON with the theme-kit CLI.",
};

export default function Page() {
  return <CliDocPage slug="export" />;
}