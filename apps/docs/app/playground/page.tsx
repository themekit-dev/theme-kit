import type { Metadata } from "next";

import { Playground } from "../../components/playground/playground";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/playground") },
  title: "Playground",
  description:
    "An interactive playground built with Theme Kit itself: switch families and modes live, explore the token tree, time-travel through theme history, audit contrast, and run transitions.",
};

export default function PlaygroundPage() {
  return <Playground />;
}
