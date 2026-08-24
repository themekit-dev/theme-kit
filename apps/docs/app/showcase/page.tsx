import Link from "next/link";
import { DocsLayout } from "../../components/docs-layout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";

export const metadata = {
  title: "Showcase",
  description:
    "Apps and projects built with Theme Kit — the docs site itself, the interactive playground, and official example apps for every supported framework.",
};

type ShowcaseItem = {
  name: string;
  description: string;
  href: string;
  tags: string[];
};

const official: ShowcaseItem[] = [
  {
    name: "Theme Kit Docs",
    description:
      "The website you are on right now. Every route is server-rendered, re-themes live through the runtime, and features Theme Studio, the Accessibility Lab and the Playground.",
    href: "/",
    tags: ["Next.js", "App Router", "Zero-flash", "RSC"],
  },
  {
    name: "Theme Kit Playground",
    description:
      "Switch families and modes live, expand the token tree while CSS variables update in real time, time-travel through theme history, and try the multi-window sync and solar-time demos.",
    href: "/playground",
    tags: ["Interactive", "Token tree", "History"],
  },
  {
    name: "Theme Studio",
    description:
      "Pick a seed color and watch a full light + dark theme pair get generated with generateTheme(). Apply the result to the running site right away.",
    href: "/theme-studio",
    tags: ["generateTheme", "Seed color"],
  },
  {
    name: "Accessibility Lab",
    description:
      "Live WCAG contrast checks, full-theme audits with validateThemeContrast, and color-vision-deficiency simulation applied to the real theme.",
    href: "/accessibility",
    tags: ["WCAG", "CVD", "Contrast"],
  },
];

const examples: ShowcaseItem[] = [
  {
    name: "React example",
    description:
      "Vite + React 19 with ThemeProvider, hooks and a live switcher — the reference integration.",
    href: "/framework-guides/react",
    tags: ["React", "Vite"],
  },
  {
    name: "Next.js example",
    description:
      "App Router with SSR-safe hydration, cookie persistence and zero flash of incorrect theme.",
    href: "/framework-guides/next",
    tags: ["Next.js", "App Router"],
  },
  {
    name: "Vue 3 example",
    description:
      "Vue 3 with app.use(ThemeProvider, options) and composables exposed as refs.",
    href: "/framework-guides/vue",
    tags: ["Vue 3", "Composables"],
  },
  {
    name: "Svelte 5 example",
    description:
      "Svelte 5 provider and runes-based reactive stores.",
    href: "/framework-guides/svelte",
    tags: ["Svelte 5", "Runes"],
  },
  {
    name: "Solid example",
    description:
      "Solid with fine-grained signals and a context provider.",
    href: "/framework-guides/solid",
    tags: ["Solid", "Signals"],
  },
  {
    name: "Angular example",
    description:
      "Angular providers and injectables wired through the DI container.",
    href: "/framework-guides/angular",
    tags: ["Angular", "DI"],
  },
  {
    name: "Web Components example",
    description:
      "Framework-free theming with custom elements — provider, toggle and select.",
    href: "/framework-guides/web",
    tags: ["Custom Elements", "Vanilla"],
  },
  {
    name: "Astro example",
    description:
      "Islands integration with a zero-flash blocking script.",
    href: "/framework-guides/astro",
    tags: ["Astro", "Islands"],
  },
  {
    name: "Nuxt example",
    description:
      "Nuxt 3 module with auto-imported composables and components.",
    href: "/framework-guides/nuxt",
    tags: ["Nuxt 3", "Module"],
  },
  {
    name: "Remix example",
    description:
      "Loader-based SSR theming with a blocking head script.",
    href: "/framework-guides/remix",
    tags: ["Remix", "SSR"],
  },
];

function Card({ item }: { item: ShowcaseItem }) {
  return (
    <Link
      href={item.href}
      className="glass-card card-lift p-5 no-underline flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">{item.name}</div>
        <span
          className="text-xs font-semibold shrink-0"
          style={{ color: "var(--theme-color-primary)" }}
        >
          Open →
        </span>
      </div>
      <p className="m-0 text-sm opacity-70 leading-relaxed">{item.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function ShowcasePage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Showcase"
          title="Built with Theme Kit"
          description="Theme Kit powers its own docs. These are the real apps — this documentation site, the interactive tools, and official example apps for every supported framework."
        />

      <SectionHeading>Official tools</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {official.map((item) => (
          <Card key={item.name} item={item} />
        ))}
      </div>

      <SectionHeading>Example apps</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {examples.map((item) => (
          <Card key={item.name} item={item} />
        ))}
      </div>
      </div>
    </DocsLayout>
  );
}
