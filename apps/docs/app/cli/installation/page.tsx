import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "Install the CLI",
  description:
    "Install @theme-kit/cli globally, on demand with npx, or in one project. Verify the executable from a separate directory.",
};

export default function Page() {
  return <CliDocPage slug="installation" />;
}