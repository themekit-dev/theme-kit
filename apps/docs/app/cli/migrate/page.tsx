import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI migrate",
  description: "Migrate a legacy theme to the current Theme Kit format with the theme-kit CLI.",
};

export default function Page() {
  return <CliDocPage slug="migrate" />;
}