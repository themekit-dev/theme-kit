"use client";

import { useState } from "react";

import { Button } from "../ui/button";
import { CodeBlock } from "../code-block";
import { Callout } from "../ui/callout";
import { PickCard } from "../ui/pick-card";
import { useScrollToOnChange } from "../ui/use-scroll-to-on-change";
import { frameworks } from "../../lib/frameworks";
import {
  InstallCommand,
  type PackageManager,
} from "../install-command";

const buildIncludedCode = `// The built-in set is just two themes, but they cover the
// complete semantic token shape. Import them explicitly when
// you want them alongside your own themes.
import { getBuiltInThemes, getNeutralThemes } from "@theme-kit/core";

const [light, dark] = getNeutralThemes();

const themes = [...getBuiltInThemes(), ...myThemes];`;

export function QuickStartGuide({
  frameworkHtml,
  installCommands,
  buildIncludedHtml,
}: {
  /** Precomputed server-side Shiki HTML per framework slug. */
  frameworkHtml: Record<string, string>;
  /** Precomputed install-command HTML per framework package name. */
  installCommands: Record<
    string,
    Record<PackageManager, { code: string; html: string }>
  >;
  buildIncludedHtml: string;
}) {
  const [slug, setSlug] = useState("next");
  const fw = frameworks.find((f) => f.slug === slug) ?? frameworks[0]!;

  const noThemeHtml = frameworkHtml[fw.slug] ?? "";

  // Scroll to the Install step after the framework change commits, so the
  // reader lands on the updated install command for the framework they picked.
  useScrollToOnChange("install", slug);

  return (
    <div>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          Pick your framework
        </h2>
        <p className="opacity-70 text-sm mb-5 max-w-2xl">
          Theme Kit ships a built-in neutral theme, so you can skip defining
          tokens entirely and still get a complete, toggleable light/dark
          theme. These snippets are the whole setup.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {frameworks.map((f) => (
            <PickCard
              key={f.slug}
              icon={f.icon}
              title={f.name}
              subtitle={f.pkg}
              active={f.slug === slug}
              onSelect={() => setSlug(f.slug)}
            />
          ))}
        </div>
      </section>

      <section id="install" className="mb-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          1 · Install
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          Two packages: the framework-agnostic core, and the adapter for your
          stack.
        </p>
        <InstallCommand commands={installCommands[fw.pkg]!} />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          2 · Wrap your app
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          Mount the provider at the root. With no{" "}
          <span className="mono">themes</span> prop, Theme Kit applies its
          built-in neutral light/dark themes.
        </p>
        <CodeBlock
          html={noThemeHtml}
          code={fw.noTheme.code}
          language={fw.noTheme.lang}
          filename={fw.noTheme.title}
          className="rounded-lg m-0"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Callout title="Picking the variant">
            <p className="text-sm leading-relaxed">
              <span className="mono">defaultTheme=&quot;light&quot;</span>{" "}
              starts on the neutral light theme,{" "}
              <span className="mono">&quot;dark&quot;</span> on dark. Omit it
              and the system preference is used.
            </p>
          </Callout>
          <Callout title="Where it comes from">
            <p className="text-sm leading-relaxed">
              The default set comes from{" "}
              <span className="mono">getBuiltInThemes()</span> — the same
              function you call when you want built-ins alongside your own
              themes.
            </p>
          </Callout>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          3 · Use the theme
        </h2>
        <p className="opacity-70 text-sm mb-4 max-w-2xl">
          You now have the full runtime: semantic tokens mapped to CSS
          variables, a{" "}
          <span className="mono">light</span>/<span className="mono">dark</span>{" "}
          toggle, persistence, and history. Style with token utilities —{" "}
          <span className="mono">bg-primary</span>,{" "}
          <span className="mono">text-foreground</span>,{" "}
          <span className="mono">border-border</span>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          Ready for real themes?
        </h2>
        <p className="opacity-70 text-sm mb-6 max-w-2xl">
          The built-in neutral theme is a starting point, not a ceiling. When
          you want your own palette, define a theme and pass it to the{" "}
          <span className="mono">themes</span> prop.
        </p>
        <CodeBlock
          html={buildIncludedHtml}
          code={buildIncludedCode}
          language="ts"
          filename="built-in + your own"
          className="rounded-lg m-0"
        />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button href="/get-started">Full get-started guide</Button>
          <Button href="/custom-themes" variant="ghost">
            Define your first theme
          </Button>
        </div>
      </section>
    </div>
  );
}