import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import {
  GetStartedGuide,
  type FrameworkHtml,
} from "../../components/get-started/guide";
import type { PackageManager } from "../../components/install-command";
import type { TocItem } from "../../lib/toc";
import { frameworks } from "../../lib/frameworks";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Start theming your app in five minutes. Pick your framework, install the core, define a theme, wrap your app in the provider, and call a hook.",
};

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

function installCommands(
  pkgs: string[],
): Record<PackageManager, { code: string; html: string }> {
  const pkgsArg = pkgs.join(" ");
  return Object.fromEntries(
    MANAGERS.map((manager) => {
      const code =
        manager === "npm"
          ? `npm install ${pkgsArg}`
          : `${manager} add ${pkgsArg}`;
      return [manager, { code, html: highlightCode(code, "bash") }];
    }),
  ) as Record<PackageManager, { code: string; html: string }>;
}

// All Shiki highlighting happens here, server-side (Shiki lives in the Node
// bundle, not the browser); the client guide renders precomputed HTML.
const frameworkHtml: Record<string, FrameworkHtml> = Object.fromEntries(
  frameworks.map((fw) => [
    fw.slug,
    {
      quickStartHtml: highlightCode(fw.quickStart.code, fw.quickStart.lang),
      html: highlightCode(fw.snippet.code, fw.snippet.lang),
      snippet2Html: highlightCode(fw.snippet2.code, fw.snippet2.lang),
      installCommands: installCommands(["@theme-kit/core", fw.pkg]),
    },
  ]),
);

const defineThemeCode = `// themes.ts
import { defineTheme } from "@theme-kit/core";

export const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light", label: "Mint Light" },
    tokens: {
      colors: {
        background: "#fafcf8",
        foreground: "#17211a",
        card: "#ffffff",
        primary: "#3f9d63",
        primaryForeground: "#ffffff",
        secondary: "#ecf3ec",
        accent: "#d9ecde",
        muted: "#f1f5ef",
        mutedForeground: "#64706a",
        destructive: "#dc2626",
        destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
        border: "#e2e8e2",
        input: "#e2e8e2",
        ring: "#3f9d63",
      },
      radius: { lg: "12px" },
    },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark", label: "Mint Dark" },
    tokens: {
      colors: {
        background: "#0d1210",
        foreground: "#e8f1ea",
        card: "#141b17",
        primary: "#4cb377",
        primaryForeground: "#0d1210",
        secondary: "#1a231d",
        accent: "#1d2d22",
        muted: "#161f1a",
        mutedForeground: "#93a39a",
        destructive: "#f87171",
        destructiveForeground: "#0d1210",
        success: "#4ade80",
        successForeground: "#0d1210",
        border: "#263229",
        input: "#263229",
        ring: "#4cb377",
      },
      radius: { lg: "12px" },
    },
  }),
];`;

// The guide is a client component, so its headings are invisible to the
// server-side TOC collector (RSC serializes the subtree as a template).
// Provide them here so the rail is visible from the initial HTML. The client
// scan stays authoritative: it re-derives the ids/text via `allocateId`, which
// is why "Add the Next.js provider" is listed with the default framework.
const getStartedHeadings: TocItem[] = [
  { id: "how-are-you-building", text: "How are you building?", level: 2 },
  { id: "install", text: "Install", level: 3 },
  { id: "define-your-theme", text: "Define your theme", level: 3 },
  { id: "add-the-nextjs-provider", text: "Add the Next.js provider", level: 3 },
  { id: "use-the-theme", text: "Use the theme", level: 3 },
  { id: "customize", text: "Customize", level: 3 },
  {
    id: "your-first-theme-kit-application",
    text: "Your first Theme Kit application",
    level: 2,
  },
];

export default function GetStartedPage() {
  return (
    <DocsLayout headings={getStartedHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Get-Started"
          title="Get Started"
          description="One core, one mental model, every framework. Pick your stack and follow the five steps to a live themed app."
        />
        <GetStartedGuide
          frameworkHtml={frameworkHtml}
          defineThemeHtml={highlightCode(defineThemeCode, "tsx")}
        />
      </div>
    </DocsLayout>
  );
}
