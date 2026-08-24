import type { Metadata } from "next";
import { CliDocPage } from "../../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI Quick Start",
  description: "A five-minute Theme Kit CLI workflow: generate, validate, inspect, export, then wire the theme into a provider.",
};

export default function Page() {
  return <CliDocPage slug="quickstart" />;
}