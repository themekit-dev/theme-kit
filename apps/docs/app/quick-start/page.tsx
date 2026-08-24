import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { QuickStartGuide } from "../../components/quick-start/guide";
import type { PackageManager } from "../../components/install-command";
import type { TocItem } from "../../lib/toc";
import { frameworks } from "../../lib/frameworks";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "Quick Start",
  description:
    "From zero to a themed app with no token definitions: install the core and your framework adapter, wrap your app, and toggle light/dark.",
};

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

type InstallCommandEntry = { code: string; html: string };

// All code highlighting happens here, server-side (Shiki lives in the Node
// bundle, not the browser). The client guide receives precomputed HTML.
const frameworkHtml: Record<string, string> = Object.fromEntries(
  frameworks.map((fw) => [
    fw.slug,
    highlightCode(fw.noTheme.code, fw.noTheme.lang),
  ]),
);

const installCommands: Record<
  string,
  Record<PackageManager, InstallCommandEntry>
> = Object.fromEntries(
  frameworks.map((fw) => {
    const pkgsArg = `@theme-kit/core ${fw.pkg}`;
    const byManager = Object.fromEntries(
      MANAGERS.map((manager) => {
        const code =
          manager === "npm"
            ? `npm install ${pkgsArg}`
            : `${manager} add ${pkgsArg}`;
        return [manager, { code, html: highlightCode(code, "bash") }];
      }),
    ) as Record<PackageManager, InstallCommandEntry>;
    return [fw.pkg, byManager];
  }),
);

const buildIncludedCode = `// The built-in set is just two themes, but they cover the
// complete semantic token shape. Import them explicitly when
// you want them alongside your own themes.
import { getBuiltInThemes, getNeutralThemes } from "@theme-kit/core";

const [light, dark] = getNeutralThemes();

const themes = [...getBuiltInThemes(), ...myThemes];`;

// The guide is a client component, so its h2s are invisible to the server-side
// TOC collector (RSC serializes the subtree as a template). Provide them here
// so the rail is visible from the initial HTML and the ids match what the
// client scan assigns via `allocateId`.
const quickStartHeadings: TocItem[] = [
  { id: "pick-your-framework", text: "Pick your framework", level: 2 },
  { id: "install", text: "Install", level: 2 },
  { id: "wrap-your-app", text: "Wrap your app", level: 2 },
  { id: "use-the-theme", text: "Use the theme", level: 2 },
  { id: "ready-for-real-themes", text: "Ready for real themes?", level: 2 },
];

export default function QuickStartPage() {
  return (
    <DocsLayout headings={quickStartHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Quickstart"
          title="Quick Start"
          description="The shortest path to a working light/dark theme. No token definitions, no configuration — install, wrap, and toggle."
        />
        <QuickStartGuide
          frameworkHtml={frameworkHtml}
          installCommands={installCommands}
          buildIncludedHtml={highlightCode(buildIncludedCode, "ts")}
        />
      </div>
    </DocsLayout>
  );
}
