import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { Prerequisites } from "../../components/ui/prerequisites";
import { NextSteps } from "../../components/ui/next-step-card";
import { RelatedLinks } from "../../components/ui/related-links";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/migration") },
  title: "Migration",
  description:
    "How to migrate themes across versions: version bumps, breaking changes, token remapping, custom migration functions, and CI integration.",
};

// Version-aware breaking-change record. Each row is one schema bump a theme
// author may need to bridge; `auto` means migrateTheme handles it once the
// matching registerMigration step is loaded.
const breakingChanges = [
  {
    from: "0.1",
    to: "0.2",
    change: "`bg` token renamed to `background`",
    automated: true,
    note: "Pure rename — handled by remapColors.",
  },
  {
    from: "0.2",
    to: "0.3",
    change: "Nested color tokens flattened into a semantic palette",
    automated: true,
    note: "Structural — needs a custom migrate function.",
  },
  {
    from: "0.3",
    to: "0.4",
    change: "`text` token renamed to `foreground`; `muted` derived token added",
    automated: true,
    note: "Rename plus a derived default.",
  },
  {
    from: "1.0",
    to: "1.3",
    change: "None — all releases since 1.0.0 are backward compatible",
    automated: false,
    note: "No migration step required.",
  },
] as const;

const whenToMigrateSnippet = {
  lang: "ts",
  title: "core — checking version and migrating",
  code: `import { migrateTheme } from "@theme-kit/core";

// A theme authored for an older version
const legacyTheme = {
  meta: { version: "0.1" },
  tokens: {
    colors: {
      primary: "#6b21a8",
      bg: "#ffffff",
    },
  },
};

// Migrate to the current version (or a specific target)
const migrated = migrateTheme(legacyTheme);
// migrated.meta.version === "0.2"`,
};

const registerMigrationSnippet = {
  lang: "ts",
  title: "core — registerMigration",
  code: `import { registerMigration } from "@theme-kit/core";

// Simple token rename: "bg" was renamed to "background" in v2
registerMigration({
  from: "0.1",
  to: "0.2",
  description: "Rename 'bg' token to 'background'",
  remapColors: [
    { from: "bg", to: "background" },
    { from: "surface", to: "surface" },
  ],
});

// With a custom migrate function for structural changes
registerMigration({
  from: "0.2",
  to: "0.3",
  description: "Restructure nested color tokens into a flat palette",
  migrate: (theme) => ({
    ...theme,
    tokens: {
      ...theme.tokens,
      colors: {
        background: theme.tokens?.colors?.background,
        foreground: theme.tokens?.colors?.foreground,
        primary: theme.tokens?.colors?.primary,
      },
    },
  }),
});`,
};

const multiStepSnippet = {
  lang: "ts",
  title: "core — chaining migrations",
  code: `import { registerMigration, migrateTheme } from "@theme-kit/core";

// Register a chain of migrations
registerMigration({
  from: "0.1",
  to: "0.2",
  remapColors: [{ from: "bg", to: "background" }],
});

registerMigration({
  from: "0.2",
  to: "0.3",
  remapColors: [{ from: "text", to: "foreground" }],
});

registerMigration({
  from: "0.3",
  to: "0.4",
  migrate: (theme) => ({
    ...theme,
    tokens: {
      ...theme.tokens,
      colors: {
        ...theme.tokens?.colors,
        muted: "var(--theme-color-foreground, 50%)",
      },
    },
  }),
});

// migrateTheme walks the chain automatically:
// v0.1 → v0.2 → v0.3 → v0.4
const theme = {
  meta: { version: "0.1" },
  tokens: { colors: { bg: "#fff", text: "#000" } },
};

const result = migrateTheme(theme);
// result.meta.version === "0.4"
// result.tokens.colors.background === "#fff"
// result.tokens.colors.foreground === "#000"`,
};

const remapVsMigrateSnippet = {
  lang: "ts",
  title: "core — remapColors vs migrate",
  code: `// remapColors: declarative, safe, automatic
// Use when a token is just renamed
registerMigration({
  from: "0.1",
  to: "0.2",
  remapColors: [
    { from: "bg", to: "background" },       // simple rename
    { from: "border", to: "borderColor" },   // simple rename
  ],
});

// migrate: imperative, full control
// Use when the structure changes or you need logic
registerMigration({
  from: "0.2",
  to: "0.3",
  migrate: (theme) => {
    const old = theme.tokens?.colors ?? {};
    return {
      ...theme,
      tokens: {
        ...theme.tokens,
        colors: {
          // Derive a new token from existing values
          surface: old.background ?? old.bg ?? "#fff",
          onSurface: old.foreground ?? old.text ?? "#000",
          primary: old.primary ?? old.accent ?? "#6b21a8",
        },
      },
    };
  },
});`,
};

const ciSnippet = {
  lang: "yaml",
  title: ".github/workflows/migrate-check.yml",
  code: `name: Theme Migration Check
on: [push, pull_request]

jobs:
  migrate-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Check themes for outdated versions
        run: |
          node -e "
            const { migrateTheme } = require('@theme-kit/core');
            const themes = require('./themes.json');
            let failed = false;
            for (const theme of themes) {
              const migrated = migrateTheme(theme);
              if (migrated.meta.version !== theme.meta.version) {
                console.log('Outdated theme:', theme.meta.name,
                  theme.meta.version, '->', migrated.meta.version);
                failed = true;
              }
            }
            if (failed) {
              console.error('Run migrateTheme on all themes before pushing.');
              process.exit(1);
            }
            console.log('All themes are up to date.');
          "`,
};

export default function MigrationPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Migration"
          title="Keep themes current across versions"
          description={
            <>
              Theme Kit ships a built-in migration engine that walks registered
              steps to bring any theme definition up to date — from simple token
              renames to full structural rewrites.
            </>
          }
        />

        <Prerequisites
          items={[
            {
              label: "@theme-kit/core installed",
              value: "Migration utilities are exported from core",
              href: "/packages/core",
            },
            {
              label: "Theme definitions with versions",
              value: "Each theme needs a meta.version field",
              href: "/custom-themes",
            },
          ]}
        />

        <section id="when-to-migrate" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Use migrateTheme when you bump a version, hit a breaking change, or adopt a new token schema."
          >
            When to migrate
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              <strong>Version bumps</strong> — every{" "}
              <code className="mono text-[0.9em]">ThemeDefinition</code>{" "}
              carries a <code className="mono text-[0.9em]">meta.version</code>.
              When you ship a new schema, bump the version so the migration
              engine knows which steps to apply.
            </li>
            <li>
              <strong>Breaking changes</strong> — renamed or removed tokens,
              restructured nesting, or changed semantics all need a migration
              step to keep existing themes working.
            </li>
            <li>
              <strong>API evolution</strong> — as Theme Kit grows, new token
              conventions emerge. A migration step lets you adopt them without
              manually editing every theme file.
            </li>
          </ul>
          <CodeBlock
            html={highlightCode(whenToMigrateSnippet.code, "ts")}
            code={whenToMigrateSnippet.code}
            language="ts"
            filename={whenToMigrateSnippet.title}
            className="m-0"
          />
        </section>

        <section id="schema-versions" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="What each schema bump changed, and whether the engine can bridge it automatically."
          >
            Schema versions &amp; breaking changes
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            A theme declares the schema it was authored for in{" "}
            <code className="mono text-[0.9em]">meta.version</code>. The table
            below is the authoritative record of every breaking schema change
            and the target version it lands in. If your theme is several
            versions behind, the engine walks every intermediate hop.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      From → To
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                      Breaking change
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      Auto-migratable
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakingChanges.map((row) => (
                    <tr
                      key={`${row.from}-${row.to}`}
                      className="border-b border-border last:border-0 align-top"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="mono text-[0.85em] font-semibold">
                          {row.from} → {row.to}
                        </code>
                      </td>
                      <td className="px-4 py-3 opacity-80 leading-relaxed">
                        {row.change}
                      </td>
                      <td className="px-4 py-3">
                        {row.automated ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 opacity-60 text-xs leading-relaxed">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Callout variant="info" className="mt-3">
            <strong>Theme Kit 1.x is backward compatible</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Every release since 1.0.0 ships without breaking theme schemas. The
            versions above cover the pre-1.0 schema line. See the{" "}
            <Link href="/changelog" className="text-primary hover:underline">
              changelog
            </Link>{" "}
            for per-release detail.
          </Callout>
        </section>

        <section id="register-migration" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="migrateTheme(theme, options) reads meta.version, walks the migration chain, and returns an updated theme."
          >
            migrateTheme(theme, options)
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Pass a theme and an optional{" "}
            <code className="mono text-[0.9em]">targetVersion</code>. The
            function finds every registered migration from the theme&apos;s
            current version toward the target, applies them in order, and
            updates <code className="mono text-[0.9em]">meta.version</code>{" "}
            on the result.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <div className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold mb-2">Options</div>
              <ul className="text-xs opacity-60 leading-relaxed list-disc pl-4 space-y-1">
                <li>
                  <code className="mono text-[0.9em]">targetVersion</code>{" "}
                  — version to migrate toward (defaults to the latest)
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold mb-2">Returns</div>
              <ul className="text-xs opacity-60 leading-relaxed list-disc pl-4 space-y-1">
                <li>
                  A new <code className="mono text-[0.9em]">ThemeDefinition</code>{" "}
                  with updated tokens and version
                </li>
                <li>If already at the target, the original object is returned</li>
              </ul>
            </div>
          </div>
          <Callout className="mt-3">
            <strong>Guard against runaway chains</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            The engine caps the chain at 20 steps to prevent infinite loops
            from circular migration registrations.
          </Callout>
        </section>

        <section id="register-migration-fn" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="registerMigration adds a step between two versions. Each step can carry a color remap table, a custom migrate function, or both."
          >
            registerMigration({"{"} from, to, remapColors?, migrate? {"}"})
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Each call registers a single hop — from one version to the next. The
            engine walks hops in order when{" "}
            <code className="mono text-[0.9em]">migrateTheme</code> is called.
            Register steps at module load so they are available everywhere.
          </p>
          <CodeBlock
            html={highlightCode(registerMigrationSnippet.code, "ts")}
            code={registerMigrationSnippet.code}
            language="ts"
            filename={registerMigrationSnippet.title}
            className="m-0"
          />
        </section>

        <section id="multi-step" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="When a theme is several versions behind, the engine walks every intermediate step automatically."
          >
            Multi-step migration
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Register migrations for each consecutive version pair. When{" "}
            <code className="mono text-[0.9em]">migrateTheme</code> runs, it
            builds a chain from the theme&apos;s current version to the target
            and applies each step in sequence.
          </p>
          <CodeBlock
            html={highlightCode(multiStepSnippet.code, "ts")}
            code={multiStepSnippet.code}
            language="ts"
            filename={multiStepSnippet.title}
            className="m-0"
          />
        </section>

        <section id="remap-vs-migrate" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="Use remapColors for simple renames. Use migrate when the transformation requires logic or structural changes."
          >
            remapColors vs migrate
          </SectionHeading>
          <div className="rounded-xl border border-border overflow-hidden mb-3">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              When to use each
            </div>
            <div className="grid sm:grid-cols-2 divide-x divide-border">
              <div className="p-4">
                <div className="text-sm font-semibold mb-2">
                  remapColors
                </div>
                <ul className="text-xs opacity-60 leading-relaxed list-disc pl-4 space-y-1">
                  <li>Token is renamed, not restructured</li>
                  <li>One-to-one key mapping</li>
                  <li>Declarative and safe</li>
                  <li>No access to other tokens</li>
                </ul>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold mb-2">migrate</div>
                <ul className="text-xs opacity-60 leading-relaxed list-disc pl-4 space-y-1">
                  <li>Structure changes (nesting, splitting, merging)</li>
                  <li>You need to read other tokens</li>
                  <li>You need conditional logic</li>
                  <li>Full access to the ThemeDefinition</li>
                </ul>
              </div>
            </div>
          </div>
          <CodeBlock
            html={highlightCode(remapVsMigrateSnippet.code, "ts")}
            code={remapVsMigrateSnippet.code}
            language="ts"
            filename={remapVsMigrateSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Both can be combined</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            A single migration step can carry both{" "}
            <code className="mono text-[0.9em]">remapColors</code> and{" "}
            <code className="mono text-[0.9em]">migrate</code>. The migrate
            function runs first, then remapColors is applied to the result.
          </Callout>
        </section>

        <section id="ci" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={7}
            desc="Catch outdated themes in CI before they ship. Run migrateTheme against every theme and fail the build if any are behind."
          >
            CI integration
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Add a lightweight CI step that loads every theme in your repo, runs{" "}
            <code className="mono text-[0.9em]">migrateTheme</code>, and exits
            non-zero if any theme&apos;s version doesn&apos;t match the
            result. This prevents shipping themes that haven&apos;t been
            updated for breaking changes.
          </p>
          <CodeBlock
            html={highlightCode(ciSnippet.code, "yaml")}
            code={ciSnippet.code}
            language="yaml"
            filename={ciSnippet.title}
            className="m-0"
          />
          <ul className="mt-3 text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              The script compares each theme&apos;s{" "}
              <code className="mono text-[0.9em]">meta.version</code> against
              the migrated result — if they differ, the theme is outdated.
            </li>
            <li>
              Works with both local theme files and programmatically generated
              themes.
            </li>
            <li>
              Pair with{" "}
              <code className="mono text-[0.9em]">clearMigrations</code> in
              tests to reset state between test cases.
            </li>
          </ul>
        </section>

        <section id="checklist" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={8}
            desc="The same repeatable sequence for every schema bump — run it once per theme file."
          >
            Migration checklist
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Work through this in order. Steps 1–3 are read-only; nothing in your
            project changes until step 4.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                    Verify it passed
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    step: "Back up the theme files (or commit them) before touching anything.",
                    verify: "A clean revert point exists in git.",
                  },
                  {
                    step: "Read meta.version on every theme and compare it against the table above.",
                    verify: "You know which themes are behind and by how many hops.",
                  },
                  {
                    step: "Register a migration step for each consecutive version pair you need to bridge.",
                    verify: "Every from → to hop in the chain is covered.",
                  },
                  {
                    step: "Run migrateTheme against one theme and diff the result against the input.",
                    verify: "Only the intended tokens changed; meta.version advanced to the target.",
                  },
                  {
                    step: "Validate the migrated theme with validateTheme (and validateThemeContrast if colors moved).",
                    verify: "The migrated theme still satisfies the required token set and contrast rules.",
                  },
                  {
                    step: "Apply the output to your project and exercise theme switching in the app.",
                    verify: "Light/dark switching and CSS variables render as before.",
                  },
                  {
                    step: "Add the CI check so this theme can never silently fall behind again.",
                    verify: "The pipeline fails on an outdated meta.version.",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 align-top"
                  >
                    <td className="px-4 py-3 font-mono text-xs opacity-50">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 opacity-80 leading-relaxed">
                      {row.step}
                    </td>
                    <td className="px-4 py-3 opacity-60 text-xs leading-relaxed">
                      {row.verify}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout variant="warning" className="mt-3">
            <strong>Never edit themes by hand mid-chain</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Register the steps, then let{" "}
            <code className="mono text-[0.9em]">migrateTheme</code> walk them.
            Hand-editing one hop breaks the assumption the next hop starts from
            a known shape.
          </Callout>
        </section>

        <NextSteps
          steps={[
            {
              title: "Register migrations for your schema",
              description: "Add migration steps between consecutive versions",
              href: "#register-migration-fn",
            },
            {
              title: "Add CI checks",
              description: "Catch outdated themes before they ship",
              href: "#ci",
            },
            {
              title: "Test multi-step chains",
              description: "Verify migrations across multiple versions",
              href: "#multi-step",
            },
          ]}
        />

        <RelatedLinks
          links={[
            {
              title: "Tokens & Typography",
              description: "Every semantic path available for remapping",
              href: "/tokens",
            },
            {
              title: "Accessibility",
              description: "Contrast checking and CVD simulation for migrated themes",
              href: "/accessibility",
            },
            {
              title: "Custom Themes",
              description: "Define versioned themes that support migration",
              href: "/custom-themes",
            },
          ]}
        />
      </div>
    </DocsLayout>
  );
}
