import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/ui/callout";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";

import { highlightCode } from "../../lib/highlight";
import { docsUrl } from "../../lib/site";
import { PKG_VERSION } from "../../lib/version";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/migrating-to-2") },
  title: "Migrating from 1.x to 2.0",
  description:
    "Every breaking change in Theme Kit 2.0.0 and how to migrate: adapter framework bindings moved to per-framework subpaths, useXTheme() now requires the runtime, and the Astro root entry became framework-neutral.",
};

function Snippet({ code, title }: { code: string; title: string }) {
  return (
    <CodeBlock
      html={highlightCode(code, "ts")}
      code={code}
      language="ts"
      filename={title}
      className="m-0"
    />
  );
}

const TH = "px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider";
const TD = "px-4 py-2.5 align-top";

export default function MigratingTo2Page() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Upgrading"
          title="Migrating from 1.x to 2.0"
          description="2.0.0 enforces the dependency-isolation contract. That removed public exports from twelve packages, so the upgrade is a real one — but every change is a moved import path or one extra argument, and this page covers all of them."
          verified={{ version: PKG_VERSION, date: "September 24, 2026" }}
        />

        <Callout variant="warning" title="Read this before you upgrade">
          <p className="text-sm leading-relaxed">
            The removed symbols are <strong>not</strong> deprecated aliases — they cannot be
            re-exported from their old locations without restoring a dependency the release gate
            forbids. There is no shim and no codemod. If you import a Theme Kit adapter binding
            from a framework package or from an adapter root, that import <strong>will</strong>{" "}
            break.
          </p>
        </Callout>

        <section id="who-is-affected" className="scroll-mt-24 mb-10">
          <SectionHeading num={1} desc="2.0.0 is not a whole-ecosystem major. Only the packages whose public API actually changed took it.">
            Which packages changed
          </SectionHeading>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className={TH}>Package</th>
                  <th className={TH}>Version</th>
                  <th className={TH}>Breaking change</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["@theme-kit/astro", "2.0.0", "React surface moved to /client; ./adapters removed"],
                  ["@theme-kit/next", "2.0.0", "./client no longer exports the adapter providers"],
                  ["@theme-kit/remix", "2.0.0", "root no longer exports the adapter providers"],
                  ["@theme-kit/nuxt", "2.0.0", "root no longer exports the four adapter composables"],
                  ["@theme-kit/vue", "2.0.0", "root no longer exports the adapter composables"],
                  ["@theme-kit/svelte", "2.0.0", "root no longer exports the adapter composables"],
                  ["@theme-kit/solid", "2.0.0", "root no longer exports the adapter composables"],
                  ["@theme-kit/shadcn", "2.0.0", "root no longer exports useShadcnTheme"],
                  ["@theme-kit/bootstrap", "2.0.0", "root no longer exports useBootstrapTheme"],
                  ["@theme-kit/daisyui", "2.0.0", "root no longer exports useDaisyTheme"],
                  ["@theme-kit/open-props", "2.0.0", "root no longer exports useOpenPropsTheme"],
                  ["@theme-kit/angular", "2.0.0", "root no longer exports the inject* adapter hooks"],
                  ["@theme-kit/core", "1.4.0", "none — additive (diagnostics, config)"],
                  ["@theme-kit/web", "1.4.0", "none — additive"],
                  ["@theme-kit/react", "1.3.1", "none — type-only"],
                  ["adapters, cli, devtools, mantine, mui, chakra, antd, tailwind, unocss", "1.3.0", "unchanged in this release"],
                ].map(([pkg, version, note]) => (
                  <tr key={pkg} className="border-b border-border last:border-0">
                    <td className={`${TD} mono text-xs whitespace-nowrap`}>{pkg}</td>
                    <td className={`${TD} mono text-xs whitespace-nowrap`}>{version}</td>
                    <td className={`${TD} opacity-80`}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout className="mt-4">
            <strong>Versions are no longer lockstep.</strong> Releases are organised into release
            groups, and only <span className="mono text-xs">core</span> +{" "}
            <span className="mono text-xs">web</span> move together. Everything else versions
            independently, so a mixed-version install is now a supported configuration — a{" "}
            <span className="mono text-xs">2.0.0</span> framework package works against a{" "}
            <span className="mono text-xs">1.4.0</span> core.
          </Callout>
        </section>

        <section id="adapter-bindings" className="scroll-mt-24 mb-10">
          <SectionHeading num={2} desc="The single change behind all eleven breaks: adapter bindings left the framework packages and the adapter roots.">
            Adapter bindings moved to per-framework subpaths
          </SectionHeading>
          <p className="text-sm leading-relaxed opacity-80 mb-4">
            Each adapter package (<span className="mono text-xs">shadcn</span>,{" "}
            <span className="mono text-xs">bootstrap</span>,{" "}
            <span className="mono text-xs">daisyui</span>,{" "}
            <span className="mono text-xs">open-props</span>) no longer exports its hook from the
            package root, and no longer depends on{" "}
            <span className="mono text-xs">@theme-kit/react</span>. It gains one subpath per
            framework instead.
          </p>
          <Snippet
            title="before — 1.x"
            code={`import { useShadcnTheme } from "@theme-kit/shadcn";        // React
import { useShadcnTheme } from "@theme-kit/vue";           // Vue
import { useShadcnTheme } from "@theme-kit/next/client";   // Next
import { useShadcnTheme } from "@theme-kit/remix";         // Remix`}
          />
          <div className="h-3" />
          <Snippet
            title="after — 2.0"
            code={`import { useShadcnTheme } from "@theme-kit/shadcn/react";  // React
import { useShadcnTheme } from "@theme-kit/shadcn/vue";    // Vue
import { useShadcnTheme } from "@theme-kit/shadcn/react";  // Next
import { useShadcnTheme } from "@theme-kit/shadcn/react";  // Remix`}
          />
          <p className="text-sm leading-relaxed opacity-80 mt-4">
            The same shape applies to{" "}
            <span className="mono text-xs">useBootstrapTheme</span>,{" "}
            <span className="mono text-xs">useDaisyTheme</span> and{" "}
            <span className="mono text-xs">useOpenPropsTheme</span>. Each adapter exposes{" "}
            <span className="mono text-xs">/react</span>,{" "}
            <span className="mono text-xs">/vue</span>,{" "}
            <span className="mono text-xs">/svelte</span>,{" "}
            <span className="mono text-xs">/solid</span> and{" "}
            <span className="mono text-xs">/angular</span>.
          </p>
          <Callout className="mt-4" variant="neutral" title="Why it had to break">
            <p className="text-sm leading-relaxed">
              The isolation contract permits an adapter to depend only on{" "}
              <span className="mono text-xs">core</span>/
              <span className="mono text-xs">adapters</span>. The adapter roots violated it by
              importing <span className="mono text-xs">@theme-kit/react</span>, and the framework
              packages violated it by hard-depending on eight to eleven adapters each — which is
              why <span className="mono text-xs">@theme-kit/vue</span> used to install React. A
              deprecated alias would reintroduce exactly those edges, so a shim is not possible.
            </p>
          </Callout>
        </section>

        <section id="runtime-argument" className="scroll-mt-24 mb-10">
          <SectionHeading num={3} desc="One extra argument, and it is required. This fails at compile time, not silently.">
            The runtime is now the first argument
          </SectionHeading>
          <Snippet
            title="before — 1.x"
            code={`useShadcnTheme();
useShadcnTheme({ strategy: "exact" });`}
          />
          <div className="h-3" />
          <Snippet
            title="after — 2.0"
            code={`// React / Vue
const runtime = useThemeRuntime();
useShadcnTheme(runtime);
useShadcnTheme(runtime, { strategy: "exact" });

// Svelte
const runtime = getThemeRuntime();
useShadcnTheme(runtime);`}
          />
          <p className="text-sm leading-relaxed opacity-80 mt-4">
            The runtime is no longer read from framework context inside the adapter — that
            indirection is precisely what forced the adapter to depend on the framework. Callers
            pass it from their own framework&apos;s accessor.
          </p>
        </section>

        <section id="astro" className="scroll-mt-24 mb-10">
          <SectionHeading num={4} desc="Astro&apos;s root entry no longer pulls in React, and the ./adapters subpath is gone.">
            Astro: root is framework-neutral
          </SectionHeading>
          <Snippet
            title="before — 1.x"
            code={`import { ThemeProviderClient, ThemeScope, useTheme } from "@theme-kit/astro";
import { useShadcnTheme } from "@theme-kit/astro/adapters";`}
          />
          <div className="h-3" />
          <Snippet
            title="after — 2.0"
            code={`import { ThemeProviderClient, ThemeScope, useTheme } from "@theme-kit/astro/client";
import { useShadcnTheme } from "@theme-kit/shadcn/react";`}
          />
          <p className="text-sm leading-relaxed opacity-80 mt-4">
            The React surface now lives behind the opt-in{" "}
            <span className="mono text-xs">@theme-kit/astro/client</span> subpath — the only entry
            that depends on React. If you render in Astro <em>without</em> React, use{" "}
            <span className="mono text-xs">ThemeToggle.astro</span> or{" "}
            <span className="mono text-xs">getThemeController()</span> instead of the hooks; that
            path needs no client framework at all.
          </p>
          <Callout className="mt-4">
            The root entry is now browser-safe, so it can be imported from a plain{" "}
            <span className="mono text-xs">&lt;script&gt;</span>. If you need a
            framework-neutral module for that, prefer{" "}
            <span className="mono text-xs">@theme-kit/astro/runtime</span>.
          </Callout>
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-1.5">
              ThemeScrollbar and ThemeInspector did not move to /client
            </h3>
            <p className="text-sm leading-relaxed opacity-80">
              These two are the one part of the old root surface with no{" "}
              <span className="mono text-xs">/client</span> equivalent. Astro&apos;s root now
              re-exports the <strong>web-component</strong> forms —{" "}
              <span className="mono text-xs">ThemeKitScrollbar</span> and{" "}
              <span className="mono text-xs">ThemeKitInspector</span> — from{" "}
              <span className="mono text-xs">@theme-kit/web</span>, and ships{" "}
              <span className="mono text-xs">./ThemeScrollbar.astro</span> /{" "}
              <span className="mono text-xs">./ThemeInspector.astro</span> subpaths. The React
              components named <span className="mono text-xs">ThemeScrollbar</span> /{" "}
              <span className="mono text-xs">ThemeInspector</span> still exist, unchanged, in{" "}
              <span className="mono text-xs">@theme-kit/react</span>.
            </p>
          </div>
        </section>

        <section id="behaviour-changes" className="scroll-mt-24 mb-10">
          <SectionHeading num={5} desc="Not version-breaking — these fix behaviour that was measurably wrong — but they are observable.">
            Behaviour changes to be aware of
          </SectionHeading>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-1.5">
                setFamily() ignores an unregistered family
              </h3>
              <p className="text-sm leading-relaxed opacity-80">
                Previously it applied the family and then degraded to{" "}
                <span className="mono text-xs">themes[0]</span>, while{" "}
                <span className="mono text-xs">data-theme-selection-family</span> kept naming a
                family that was not on screen — so the readout contradicted the applied theme. It
                is now a no-op. A caller passing an unregistered family has a bug; switching the
                visitor to a <em>different</em> family would have hidden it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1.5">
                A &quot;system&quot; selection needs systemModeCSSTemplate
              </h3>
              <p className="text-sm leading-relaxed opacity-80">
                Expressing a <span className="mono text-xs">&quot;system&quot;</span> selection by
                inlining the resolved variables plus a dark media block never worked: an inline{" "}
                <span className="mono text-xs">style</span> on{" "}
                <span className="mono text-xs">&lt;html&gt;</span> outranks every stylesheet rule,
                so the dark block never applied and an OS-dark visitor kept the light colors.
                Emit <span className="mono text-xs">systemModeCSSTemplate(light, dark)</span> as a{" "}
                <span className="mono text-xs">&lt;style&gt;</span> element instead. Only{" "}
                <span className="mono text-xs">&quot;system&quot;</span> may use media queries — a
                concrete mode must be a plain <span className="mono text-xs">:root</span> rule.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1.5">
                createThemeRuntime() no longer requires an argument
              </h3>
              <p className="text-sm leading-relaxed opacity-80">
                This is a relaxation —{" "}
                <span className="mono text-xs">createThemeRuntime()</span> used to throw, so the
                form the docs show failed at runtime. Existing calls still compile.
              </p>
            </div>
          </div>
        </section>

        <section id="unchanged" className="scroll-mt-24 mb-10">
          <SectionHeading num={6} desc="Verified safe. Do not change these, and do not expect a migration step for them.">
            What did <em>not</em> break
          </SectionHeading>
          <ul className="text-sm leading-relaxed opacity-80 list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <strong>Persisted selections.</strong> The fingerprint algorithm is unchanged, so
              cookies and <span className="mono text-xs">localStorage</span> entries written by 1.x
              stay valid.
            </li>
            <li>
              <strong>The cookie contract.</strong> Names are unchanged (
              <span className="mono text-xs">theme-name</span>,{" "}
              <span className="mono text-xs">theme-family</span>,{" "}
              <span className="mono text-xs">theme-mode</span>,{" "}
              <span className="mono text-xs">theme-fingerprint</span>).
            </li>
            <li>
              <strong>The CLI exit-code contract.</strong> 0 OK / 1 error / 2 usage / 3
              validation-failed — unchanged.
            </li>
            <li>
              <strong>Plugin lifecycle.</strong> No hook was removed;{" "}
              <span className="mono text-xs">createDevToolsPlugin</span> only gained methods.
            </li>
            <li>
              <strong>React lifecycle typing.</strong>{" "}
              <span className="mono text-xs">useThemeLifecycle</span> handlers narrowed from{" "}
              <span className="mono text-xs">unknown</span> to the per-event payload. A handler
              accepting <span className="mono text-xs">unknown</span> is still assignable, so
              previously-compiling code still compiles.
            </li>
          </ul>
        </section>

        <section id="checklist" className="scroll-mt-24 mb-10">
          <SectionHeading num={7} desc="A mechanical pass over your imports finds almost all of it.">
            Upgrade checklist
          </SectionHeading>
          <ol className="text-sm leading-relaxed opacity-80 list-decimal pl-5 flex flex-col gap-2">
            <li>
              Search for adapter imports coming from a framework package or an adapter root:
              <span className="mono text-xs"> useShadcnTheme</span>,{" "}
              <span className="mono text-xs">useBootstrapTheme</span>,{" "}
              <span className="mono text-xs">useDaisyTheme</span>,{" "}
              <span className="mono text-xs">useOpenPropsTheme</span>, and the{" "}
              <span className="mono text-xs">*ThemeProvider</span> components. Repoint each to the
              adapter&apos;s per-framework subpath.
            </li>
            <li>
              Add the runtime as the first argument at every call site, taken from your
              framework&apos;s accessor.
            </li>
            <li>
              If you use Astro, move the React surface to{" "}
              <span className="mono text-xs">@theme-kit/astro/client</span> and replace any{" "}
              <span className="mono text-xs">@theme-kit/astro/adapters</span> import.
            </li>
            <li>
              If you inline a <span className="mono text-xs">&quot;system&quot;</span> selection,
              switch to <span className="mono text-xs">systemModeCSSTemplate</span>.
            </li>
            <li>
              If you call <span className="mono text-xs">setFamily()</span> with a value that may
              not be registered, validate it first — the call is now a no-op.
            </li>
          </ol>
          <Callout className="mt-4" variant="success" title="Nothing else to do">
            <p className="text-sm leading-relaxed">
              Everything above is the complete list of verified breaks. If your code does not touch
              an adapter binding or an Astro React import, the upgrade is a version bump.
            </p>
          </Callout>
          <p className="text-sm leading-relaxed opacity-80 mt-6">
            Upgrading a <em>theme definition</em> rather than a package? See{" "}
            <Link href="/migration" className="underline">
              Migration
            </Link>{" "}
            for <span className="mono text-xs">migrateTheme()</span> and schema versions.
          </p>
        </section>
      </div>
    </DocsLayout>
  );
}
