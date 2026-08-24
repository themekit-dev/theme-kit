import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Migration",
  description:
    "How to migrate themes across versions: version bumps, breaking changes, token remapping, custom migration functions, and CI integration.",
};

// Headings render via SectionHeading (invisible to the layout's RSC tree
// walk), so provide them here for the TOC rail.
const migrationHeadings = buildPageHeadings([
  { text: "When to migrate", level: 2 },
  { text: "migrateTheme(theme, options)", level: 2 },
  { text: "registerMigration({ from, to, remapColors?, migrate? })", level: 2 },
  { text: "Multi-step migration", level: 2 },
  { text: "remapColors vs migrate", level: 2 },
  { text: "CI integration", level: 2 },
]);

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
    <DocsLayout headings={migrationHeadings}>
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

        <section id="register-migration" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
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
            num={3}
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
            num={4}
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
            num={5}
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
            num={6}
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

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/tokens"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Tokens &amp; Typography</div>
              <div className="text-xs opacity-60">
                Every semantic path available for remapping.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
          <Link
            href="/accessibility"
            className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Accessibility</div>
              <div className="text-xs opacity-60">
                Contrast checking and CVD simulation for migrated themes.
              </div>
            </div>
            <span style={{ color: "var(--theme-color-primary)" }}>→</span>
          </Link>
        </div>
      </div>
    </DocsLayout>
  );
}
