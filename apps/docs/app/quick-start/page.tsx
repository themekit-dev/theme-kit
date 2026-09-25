import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Prerequisites } from "../../components/ui/prerequisites";
import { QuickStartGuide } from "../../components/quick-start/guide";
import { CodeBlock } from "../../components/code-block";
import { Button } from "../../components/ui/button";
import type { PackageManager } from "../../components/install-command";
import { frameworks } from "../../lib/frameworks";
import { highlightCode } from "../../lib/highlight";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/quick-start") },
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

const setupExtraHtml: Record<string, string> = Object.fromEntries(
  frameworks.map((fw) => [
    fw.slug,
    fw.setupExtra ? highlightCode(fw.setupExtra.code, fw.setupExtra.lang) : "",
  ]),
);

const switchHtml: Record<string, string> = Object.fromEntries(
  frameworks.map((fw) => {
    const snippet = fw.switchSnippet ?? fw.snippet;
    return [fw.slug, highlightCode(snippet.code, snippet.lang)];
  }),
);

const installCommands: Record<
  string,
  Record<PackageManager, InstallCommandEntry>
> = Object.fromEntries(
  frameworks.map((fw) => {
    const pkgsArg = ["@theme-kit/core", fw.pkg, ...(fw.extraPackages ?? [])].join(
      " ",
    );
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

/**
 * Astro's Quick Start offers the same two shapes the framework guide explains,
 * so a reader meets the React island as an explicit choice rather than as step 3
 * of an otherwise React-free setup.
 *
 * The snippets come from the Astro entry itself — `snippet2` is the
 * framework-free switch, `reactSetup` is the config with the renderer — so the
 * two pages render one definition. Only the highlighting happens here, because
 * Shiki lives in the Node bundle and the guide is a client component.
 */
const astro = frameworks.find((fw) => fw.slug === "astro");

/**
 * The canonical stylesheet, highlighted once.
 *
 * Every framework entry points its `styles` slot at the same source — only the
 * file name differs — so this is one string rather than a per-framework map.
 * Highlighting it from the first entry keeps the page reading the same data the
 * guide does, instead of a copy.
 */
const stylesHtml = highlightCode(
  frameworks[0]!.styles.code,
  frameworks[0]!.styles.lang,
);

// Astro's setup is three files — `theme.config.ts`, `astro.config.ts` and the
// layout — so the guide renders them from the entry's own slots rather than the
// generic `noTheme` + `setupExtra` pair. Keyed by the snippet's title so the
// component cannot pair the wrong HTML with a snippet if the order changes.
const astroSetupHtml: Record<string, string> = {};
if (astro) {
  for (const snippet of [
    astro.quickStart,
    astro.noTheme,
    astro.snippet,
    astro.reactSetup,
  ]) {
    if (snippet) {
      astroSetupHtml[snippet.title] = highlightCode(snippet.code, snippet.lang);
    }
  }
}

const astroHtml = astro
  ? {
      onlySwitch: highlightCode(astro.snippet2.code, astro.snippet2.lang),
      reactSetup: astro.reactSetup
        ? highlightCode(astro.reactSetup.code, astro.reactSetup.lang)
        : "",
      setupHtml: astroSetupHtml,
      reactInstall: Object.fromEntries(
        MANAGERS.map((manager) => {
          const pkgsArg = [
            "@theme-kit/core",
            astro.pkg,
            "@astrojs/react",
            "react",
            "react-dom",
          ].join(" ");
          const code =
            manager === "npm"
              ? `npm install ${pkgsArg}`
              : `${manager} add ${pkgsArg}`;
          return [manager, { code, html: highlightCode(code, "bash") }];
        }),
      ) as Record<PackageManager, InstallCommandEntry>,
    }
  : undefined;

const buildIncludedCode = `// The provider falls back to these two when you pass no \`themes\` prop:
// the neutral "light" and "dark" themes.
import { getBuiltInThemes, getNeutralThemes } from "@theme-kit/core";

const [light, dark] = getNeutralThemes();

// The full built-in set is 34 themes — 14 color families plus the neutral,
// high-contrast and large-text pairs. Merge it with your own. Theme names must
// be unique, so don't redefine a built-in name.
const themes = [...getBuiltInThemes(), ...myThemes];`;

// The guide is a client component, so its h2s are invisible to the server-side
// TOC collector (RSC serializes the subtree as a template). Provide them here
// so the rail is visible from the initial HTML and the ids match what the
// client scan assigns via `allocateId`.
export default function QuickStartPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Quickstart"
          title="Quick Start"
          description="The shortest path to a working light/dark theme. No token definitions, no configuration — install, wrap, and toggle."
        />
        <Prerequisites
          items={[
            { label: "Node.js", value: "18.x or later" },
            { label: "Package manager", value: "npm, pnpm, yarn, or bun" },
            { label: "Framework", value: "Any supported framework", href: "/framework-guides" },
          ]}
          className="mb-8"
        />
        <QuickStartGuide
          frameworkHtml={frameworkHtml}
          setupExtraHtml={setupExtraHtml}
          switchHtml={switchHtml}
          stylesHtml={stylesHtml}
          installCommands={installCommands}
          astroHtml={astroHtml}
        />

        <SectionHeading id="real-themes" className="mt-12">
          Ready for real themes?
        </SectionHeading>
        <p className="text-sm opacity-80 mb-4">
          The built-in themes cover the full semantic token set, so staying on
          them is a valid choice. When you want your own palette, define a theme
          and pass it in — the built-ins stay available alongside it.
        </p>
        <CodeBlock
          html={highlightCode(buildIncludedCode, "ts")}
          code={buildIncludedCode}
          language="ts"
          filename="your themes alongside the built-in set"
          className="rounded-lg m-0"
        />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button href="/get-started">Full get-started guide</Button>
          <Button href="/custom-themes" variant="ghost">
            Define your first theme
          </Button>
        </div>
      </div>
    </DocsLayout>
  );
}
