"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "../ui/button";
import { CodeBlock } from "../code-block";
import { Callout } from "../ui/callout";
import { PickCard } from "../ui/pick-card";
import { InstallCommand, type PackageManager } from "../install-command";
import { frameworks, type FrameworkItem } from "../../lib/frameworks";
import { useScrollToOnChange } from "../ui/use-scroll-to-on-change";
import { ResultDemo } from "./result-demo";

/** Per-framework Shiki HTML, precomputed server-side. */
export type FrameworkHtml = {
  quickStartHtml: string;
  html: string;
  snippet2Html: string;
  installCommands: Record<PackageManager, { code: string; html: string }>;
};

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

const minimalThemeCode = `// themes.ts — meta.mode is optional; the mode is inferred from the name.
// Families: themes without meta.family belong to the "default" family.
export const themes = [
  { name: "light", tokens: { colors: { background: "#ffffff", primary: "#6366f1" } } },
  { name: "dark", tokens: { colors: { background: "#0a0a0a", primary: "#818cf8" } } },
];`;

const customizeLinks = [
  { href: "/tokens", label: "Tokens & typography" },  { href: "/custom-themes", label: "Custom themes" },
  { href: "/animation", label: "Transitions" },
  { href: "/advanced-features", label: "Advanced features" },
];

function FrameworkCard({
  fw,
  active,
  onSelect,
}: {
  fw: FrameworkItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <PickCard
      icon={fw.icon}
      title={fw.name}
      subtitle={fw.pkg}
      badge={fw.slug === "next" ? "Recommended" : undefined}
      description={
        fw.slug === "next"
          ? "SSR-first · zero-flash · cookies + RSC"
          : fw.tagline.split(". ")[0]
      }
      active={active}
      onSelect={onSelect}
    />
  );
}

function Step({
  step,
  title,
  id,
  children,
}: {
  step: string;
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24"
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-sm font-bold"
          style={{
            background: "var(--theme-color-secondary)",
            color:
              "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
          }}
        >
          {step}
        </span>
        <h3
          id={id ? `${id}-heading` : undefined}
          className="text-lg font-semibold tracking-tight"
        >
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export function GetStartedGuide({
  frameworkHtml,
  defineThemeHtml,
  minimalThemeHtml,
}: {
  frameworkHtml: Record<string, FrameworkHtml>;
  defineThemeHtml: string;
  minimalThemeHtml: string;
}) {
  const [slug, setSlug] = useState("next");
  const fw = frameworks.find((f) => f.slug === slug) ?? frameworks[0]!;
  const fwHtml = frameworkHtml[fw.slug]!;

  const handleSelect = (fwSlug: string) => {
    setSlug(fwSlug);
  };

  // Scroll after the framework change commits, so the Install step is brought
  // into view at its final (post-render) position.
  useScrollToOnChange("install", slug);

  return (
    <div>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          How are you building?
        </h2>
        <p className="opacity-70 text-sm mb-5 max-w-2xl">
          The concepts stay identical across every stack — only the wiring
          changes. The core is one package; your framework adds an adapter.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {frameworks.map((f) => (
            <FrameworkCard
              key={f.slug}
              fw={f}
              active={f.slug === slug}
              onSelect={() => handleSelect(f.slug)}
            />
          ))}
        </div>
        <p className="mt-4 text-xs opacity-50">
          Selected: <span className="font-semibold opacity-80">{fw.name}</span>{" "}
          — installing <span className="mono">{fw.pkg}</span> alongside{" "}
          <span className="mono">@theme-kit/core</span>.
        </p>
      </section>

      <div className="flex flex-col gap-12">
        <Step step="1" title="Install" id="install">
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            Theme Kit is two packages: the framework-agnostic{" "}
            <span className="mono">@theme-kit/core</span> containing themes,
            tokens and the runtime, plus a thin{" "}
            <span className="mono">{fw.pkg}</span> adapter.
          </p>
          <InstallCommand commands={fwHtml.installCommands} />
        </Step>

        <Step step="2" title="Define your theme">
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            A theme is defined with <span className="mono">defineTheme</span>: a
            name, optional metadata (family, mode, label), and a nested{" "}
            <span className="mono">tokens</span> object. Keep one entry per{" "}
            <em>family × mode</em> combo.
          </p>
          <p className="text-xs opacity-70 mb-3">
            The exported <span className="mono">themes</span> array is what you
            import into your provider in the next step —{" "}
            <span className="mono">
              import &#123; themes &#125; from "./themes"
            </span>
            .
          </p>
          <CodeBlock
            html={defineThemeHtml}
            code={defineThemeCode}
            language="tsx"
            filename="themes.ts"
            className="rounded-lg m-0"
          />
          <Callout variant="neutral" title="Two ways to define themes">
            <p className="text-sm leading-relaxed">
              The snippet above sets <span className="mono">meta.mode</span>{" "}
              explicitly. That&apos;s the recommended form, but you can also
              define themes without it — the mode is then inferred from the
              theme name:
            </p>
            <CodeBlock
              html={minimalThemeHtml}
              code={minimalThemeCode}
              language="ts"
              filename="themes.ts (minimal)"
              className="rounded-lg m-0 mt-2"
            />
            <p className="text-sm leading-relaxed mt-2">
              Both forms support <span className="mono">setMode("dark")</span>{" "}
              and <span className="mono">toggleTheme()</span> the same way. The{" "}
              <span className="mono">meta.family</span> field groups themes into
              families; without it every theme belongs to the{" "}
              <span className="mono">default</span> family.
            </p>
          </Callout>
        </Step>

        <Step step="3" title={`Add the ${fw.name} provider`}>
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            Wrap your app at the entry point —{" "}
            <span className="mono">{fw.quickStart.title}</span> — and pass your
            themes. Persistence, hydration and bootstrapping are wired for you.
          </p>
          <p className="text-xs opacity-60 mb-3">
            Provider is <span className="mono">{fw.pkg}</span> (installed in
            step 1). See the{" "}
            <Link
              href={`/framework-guides/${fw.slug}`}
              className="text-primary font-medium no-underline hover:underline"
            >
              {fw.name} guide
            </Link>{" "}
            or the{" "}
            <Link
              href="/packages"
              className="text-primary font-medium no-underline hover:underline"
            >
              package map
            </Link>{" "}
            for the full reference.
          </p>
          <CodeBlock
            html={fwHtml.quickStartHtml}
            code={fw.quickStart.code}
            language={fw.quickStart.lang}
            filename={fw.quickStart.title}
            className="rounded-lg m-0"
          />
          {fw.slug === "next" ? (
            <div className="mt-4">
              <Callout title="Why the Next.js integration differs">
                Theme Kit resolves the initial selection on the server and
                applies the theme before hydration — preventing the flash of an
                incorrect theme. It reads cookies, validates the persisted
                fingerprint, and emits inline CSS variables plus a blocking
                bootstrap script.
                <Link
                  href="/zero-flash"
                  className="inline-flex items-center gap-1 text-primary font-medium no-underline hover:underline ml-1"
                >
                  Learn how Zero Flash works →
                </Link>
              </Callout>
            </div>
          ) : (
            <div className="mt-4">
              <Callout>
                The core concepts are identical across frameworks — the adapter
                only wires the same runtime to your platform.
              </Callout>
            </div>
          )}
        </Step>

        <Step step="4" title="Use the theme">
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            Read the active theme and switch it from any component. This is the
            same example your <span className="mono">{fw.name}</span> guide
            covers in depth.
          </p>
          <CodeBlock
            html={fwHtml.html}
            code={fw.snippet.code}
            language={fw.snippet.lang}
            filename={fw.snippet.title}
            className="rounded-lg m-0"
          />
        </Step>

        <Step step="5" title="Customize">
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            Real example from the <span className="mono">{fw.name}</span> docs{" "}
            <span className="opacity-60">({fw.snippet2.title})</span> — then go
            deeper into tokens, scoping and the runtime.
          </p>
          <CodeBlock
            html={fwHtml.snippet2Html}
            code={fw.snippet2.code}
            language={fw.snippet2.lang}
            filename={fw.snippet2.title}
            className="rounded-lg m-0"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {customizeLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="chip no-underline text-sm hover:border-ring transition-colors"
              >
                {l.label} →
              </Link>
            ))}
            <Link
              href={`/framework-guides/${fw.slug}`}
              className="chip no-underline text-sm hover:border-ring transition-colors"
            >
              Full {fw.name} guide →
            </Link>
          </div>
        </Step>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Your first Theme Kit application
        </h2>
        <p className="opacity-70 max-w-2xl mb-8">
          Five minutes in — this is a real demo running the same runtime the
          docs use. The card below is built entirely from semantic tokens.
        </p>
        <div className="grid gap-8 ">
          <ResultDemo />
          <div className="rounded-xl border border-border bg-card p-5 self-start">
            <h3 className="font-semibold mb-3">You&apos;re ready.</h3>
            <p className="text-sm opacity-70 leading-relaxed mb-5">
              What you just set up is the full theming system — families,
              tokens, persistence and history. Stretch it next in the playground
              or the Theme Studio.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button href="/playground" size="sm">
                Open the Playground
              </Button>
              <Button href="/theme-studio" variant="ghost" size="sm">
                Theme Studio
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
