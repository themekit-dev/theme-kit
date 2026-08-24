import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI Reference",
  description: "The theme-kit CLI command reference: global options, command table, exit codes, output formats, and troubleshooting.",
};

export default function Page() {
  return <CliDocPage slug="reference" />;
}