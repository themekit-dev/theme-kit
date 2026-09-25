"use client";

import { Icon } from "@iconify/react";

import { Avatar, Btn, Card, Frame, Pill, SideNav, TopBar, type CompositionProps } from "../ui";

const NAV = [
  {
    label: "Getting started",
    items: [
      { label: "Introduction", icon: "ph:book-open" },
      { label: "Installation", icon: "ph:download-simple" },
      { label: "Quick start", icon: "ph:lightning" },
    ],
  },
  {
    label: "Guides",
    items: [
      { label: "Theming", icon: "ph:palette" },
      { label: "Persistence", icon: "ph:database" },
      { label: "Scoped themes", icon: "ph:selection" },
      { label: "Zero-flash SSR", icon: "ph:shield-check" },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "API", icon: "ph:brackets-curly" },
      { label: "Tokens", icon: "ph:swatches" },
      { label: "CLI", icon: "ph:terminal" },
    ],
  },
];

const TOC = [
  { label: "Overview", active: true },
  { label: "Defining a theme", active: false },
  { label: "Semantic tokens", active: false },
  { label: "Scoping", active: false },
  { label: "Persistence", active: false },
];

export function DocumentationComposition({ chrome = true }: CompositionProps = {}) {
  return (
    <Frame
      title="docs.acme.com/guides/theming"
      chrome={chrome}
      toolbar={
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
            v1.3
          </span>
          <Avatar label="A" />
        </div>
      }
    >
      <div className="h-full flex flex-col">
        <TopBar workspace="Acme Docs" searchHint="Search documentation…" />

        <div className="flex-1 min-h-0 flex">
          <SideNav
            groups={NAV}
            active="Theming"
            width="w-42"
            footer={
              <div className="flex items-center gap-1.5 px-1.5 py-1 text-[9px] text-muted-foreground">
                <Icon icon="ph:keyboard" width={11} height={11} />
                Press <span className="mono">/</span> to search
              </div>
            }
          />

          <main className="flex-1 min-w-0 overflow-hidden">
            <div className="flex h-full">
              <div className="flex-1 min-w-0 p-4 overflow-hidden">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                  <span>Guides</span>
                  <Icon icon="ph:caret-right" width={8} height={8} />
                  <span className="text-foreground">Theming</span>
                </div>

                {/* A div, not an <h1>: mock UI must not join the page outline. */}
                <div className="text-[17px] font-semibold tracking-tight">
                  Theming your application
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 mb-3">
                  Themes are defined as token trees and resolved into CSS custom
                  properties at runtime. Because the variables are namespaced, a
                  scoped theme overrides only inside its own subtree.
                </p>

                <div className="flex items-center gap-1.5 mb-3">
                  <Pill tone="success" dot>
                    Works in every framework
                  </Pill>
                  <Pill tone="neutral">5 min read</Pill>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary mb-0.5">
                    <Icon icon="ph:info" width={11} height={11} />
                    Note
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    Token keys are emitted verbatim —{" "}
                    <code className="mono">primaryForeground</code> becomes{" "}
                    <code className="mono">--theme-color-primaryForeground</code>. The
                    kebab-case form only exists as a Tailwind alias.
                  </div>
                </div>

                {/* code block */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/40">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="ph:file-ts" width={11} height={11} className="text-primary" />
                      <span className="mono text-[10px] text-muted-foreground">theme.ts</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Icon icon="ph:copy" width={10} height={10} />
                      Copy
                    </span>
                  </div>
                  <pre className="p-3 text-[10px] leading-[1.7] mono overflow-hidden">
                    <code>
                      <span className="text-muted-foreground select-none">1  </span>
                      <span className="text-primary">import</span> {"{ defineTheme }"}{" "}
                      <span className="text-primary">from</span>{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        &quot;@theme-kit/core&quot;
                      </span>
                      {"\n"}
                      <span className="text-muted-foreground select-none">2  </span>
                      {"\n"}
                      <span className="text-muted-foreground select-none">3  </span>
                      <span className="text-primary">export const</span> brand ={" "}
                      <span className="text-amber-600 dark:text-amber-400">defineTheme</span>({"{"}
                      {"\n"}
                      <span className="text-muted-foreground select-none">4  </span>
                      {"  "}name:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        &quot;brand-light&quot;
                      </span>
                      ,{"\n"}
                      <span className="text-muted-foreground select-none">5  </span>
                      {"  "}tokens: {"{"}
                      {"\n"}
                      <span className="text-muted-foreground select-none">6  </span>
                      {"    "}colors: {"{"} primary:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        &quot;#5b54e8&quot;
                      </span>{" "}
                      {"}"},{"\n"}
                      <span className="text-muted-foreground select-none">7  </span>
                      {"  "}
                      {"}"},{"\n"}
                      <span className="text-muted-foreground select-none">8  </span>
                      {"}"});
                    </code>
                  </pre>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Icon icon="ph:arrow-left" width={10} height={10} />
                    Installation
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                    Scoped themes
                    <Icon icon="ph:arrow-right" width={10} height={10} />
                  </span>
                </div>
              </div>

              {/* right rail */}
              <aside className="hidden lg:block w-36 shrink-0 border-l border-border p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  On this page
                </div>
                <ul className="space-y-1.5 m-0 p-0 list-none">
                  {TOC.map((t) => (
                    <li
                      key={t.label}
                      className={`text-[10px] pl-2 border-l ${
                        t.active
                          ? "border-primary text-primary font-medium"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {t.label}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-border">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Was this helpful?
                  </div>
                  <div className="flex gap-1.5">
                    <Btn variant="outline">Yes</Btn>
                    <Btn variant="outline">No</Btn>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </Frame>
  );
}
