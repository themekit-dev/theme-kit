import type { Metadata } from "next";
import { CliDocPage } from "../../components/cli/cli-doc-page";

export const metadata: Metadata = {
  title: "CLI Overview",
  description:
    "The @theme-kit/cli command-line toolkit — generate, validate, inspect, migrate, and export themes from any shell, for any framework.",
};

export default function CliPage() {
  return <CliDocPage slug="overview" />;
}
