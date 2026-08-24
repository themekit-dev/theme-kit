import { highlightCode } from "../../lib/highlight";
import { CodeBlock } from "../code-block";
import Link from "next/link";

const code = `import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
};`;

const html = highlightCode(code, "tsx");
const MAIN_ROUTE = "framework-guides";

const navigateGuides = [
  { id: 1, fname: "React", link: `${MAIN_ROUTE}/react` },
  { id: 2, fname: "Next.js", link: `${MAIN_ROUTE}/next` },
  { id: 3, fname: "Vue", link: `${MAIN_ROUTE}/vue` },
  { id: 4, fname: "Svelte", link: `${MAIN_ROUTE}/svelte` },
  { id: 5, fname: "Solid", link: `${MAIN_ROUTE}/solid` },
  { id: 6, fname: "Angular", link: `${MAIN_ROUTE}/angular` },
  { id: 7, fname: "Astro", link: `${MAIN_ROUTE}/astro` },
];

export function GetStarted() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Start in three lines
          </h2>
          <p className="opacity-70 leading-relaxed mb-6">
            Wrap your app, call a hook, ship. Theme Kit handles persistence,
            cookies, SSR hydration, and zero-flash bootstrapping for you — in
            any framework.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {navigateGuides.map((navigate) => (
              <Link key={navigate.id} href={navigate.link} className="chip">
                {navigate.fname}
              </Link>
            ))}
          </div>
          <Link
            href="/get-started"
            className="btn btn-primary inline-flex items-center gap-2 no-underline"
          >
            Full getting-started guide →
          </Link>
        </div>

        <div className="min-w-0 overflow-x-clip">
          <CodeBlock
            className="border border-accent-foreground rounded-xl"
            html={html}
            code={code}
            language="tsx"
            filename="app/layout.tsx"
          />
        </div>
      </div>
    </section>
  );
}
