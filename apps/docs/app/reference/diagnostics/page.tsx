import type { Metadata } from "next";

import { DocsLayout } from "../../../components/docs-layout";
import { PageHeader } from "../../../components/ui/page-header";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/reference/diagnostics") },
  title: "Diagnostics Reference",
  description:
    "Every diagnostic Theme Kit emits: its stable code, severity, common cause, and correction — plus the API for collecting, formatting, and emitting your own.",
};

type Level = "error" | "warning";

type DiagnosticEntry = {
  /** Anchor target. Matches the fragment `createDiagnostic` derives from the code. */
  id: string;
  code: string;
  level: Level | "returned";
  api: string;
  pkg: string;
  meaning: string;
  cause: string;
  fix: string;
  emits: boolean;
};

const DIAGNOSTICS: DiagnosticEntry[] = [
  {
    id: "tk_mode_invalid",
    code: "TK_MODE_INVALID",
    level: "warning",
    api: "selection.setMode()",
    pkg: "@theme-kit/core",
    meaning:
      "setMode() received a value that is not light, dark, or system. The selection is left unchanged.",
    cause:
      "A mode that came from outside the type system — localStorage, a cookie, an element attribute, a cross-tab message, or a framework prop forwarded from plain JavaScript — was passed in without being validated first.",
    fix: 'Validate the incoming value before passing it. Pass one of "light", "dark", or "system", or gate the call behind isThemeMode().',
    emits: true,
  },
  {
    id: "tk_theme_token_missing",
    code: "TK_THEME_TOKEN_MISSING",
    level: "returned",
    api: "validateTheme()",
    pkg: "@theme-kit/core, @theme-kit/cli",
    meaning:
      "A theme definition is missing a required semantic token, or declares no tokens at all. Returned as a ValidationIssue rather than emitted to the console.",
    cause:
      "A hand-written theme definition omits one of the required semantic colour tokens, or a partial theme was passed where a complete one was expected.",
    fix: "Add the missing token, or build the theme from a complete base so every required token is present. `theme-kit validate` reports the same issues in CI.",
    emits: false,
  },
  {
    id: "tk_a11y_contrast_violation",
    code: "TK_A11Y_CONTRAST_VIOLATION",
    level: "warning",
    api: "createAccessibilityPlugin()",
    pkg: "@theme-kit/core",
    meaning:
      "One or more foreground/background pairs in the active theme fail WCAG AA normal contrast. Reported at error level when the plugin is created with warnOnly: false.",
    cause:
      "A colour pair was chosen for appearance rather than measured contrast — most often a muted foreground on a tinted surface, or a brand colour used as text on white.",
    fix: "Adjust the failing pair until it passes, or call validateThemeContrast() directly to inspect every pair that was checked.",
    emits: true,
  },
  {
    id: "tk_schedule_theme_unresolved",
    code: "TK_SCHEDULE_THEME_UNRESOLVED",
    level: "warning",
    api: "createScheduledPlugin()",
    pkg: "@theme-kit/core",
    meaning:
      "A schedule was configured, but its light/dark theme pair could not be resolved, so no schedule binding was installed.",
    cause:
      "The plugin was given theme names that are not registered on the runtime, or it was left to resolve by mode against a registry that has no matching themes.",
    fix: "Pass lightTheme and darkTheme explicitly, or register themes whose names or modes the schedule can resolve.",
    emits: true,
  },
  {
    id: "tk_plugin_destroy_failed",
    code: "TK_PLUGIN_DESTROY_FAILED",
    level: "warning",
    api: "pluginManager.destroy()",
    pkg: "@theme-kit/core",
    meaning:
      "A plugin threw from onDestroy() while the manager was tearing down. The remaining plugins were still destroyed and the registry was still cleared.",
    cause:
      "onDestroy() assumed the plugin had finished starting. It runs even when initialisation never completed, so state it expects to exist is missing.",
    fix: "Make onDestroy() tolerant of partial initialisation. The original exception is preserved on the diagnostic as cause.",
    emits: true,
  },
];

const FIELDS: { name: string; type: string; description: string }[] = [
  {
    name: "code",
    type: "ThemeDiagnosticCode",
    description:
      "Stable identifier. Safe to assert on in tests and to filter by; the message is not.",
  },
  {
    name: "level",
    type: 'ThemeDiagnosticLevel',
    description:
      "error, warning, deprecation, or info. Chosen deliberately per diagnostic, and it decides which console method is used.",
  },
  {
    name: "message",
    type: "string",
    description:
      "A concise, actionable description of what is wrong. May be reworded between releases.",
  },
  {
    name: "context",
    type: "ThemeDiagnosticContext",
    description:
      "Structured detail — api, property, path, received, expected, and any extra details payload.",
  },
  {
    name: "hint",
    type: "string",
    description:
      "What to do instead. Present only where there is a concrete correction.",
  },
  {
    name: "docs",
    type: "string",
    description:
      "A link to the entry on this page, derived from the code so call sites never repeat it.",
  },
  {
    name: "cause",
    type: "unknown",
    description:
      "The underlying exception, when the diagnostic reports a failure that wrapped one.",
  },
];

function CodeBadge({ level }: { level: Level | "returned" }) {
  const styles: Record<string, string> = {
    error: "bg-red-500/10 text-red-600 dark:text-red-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    returned: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      {level === "returned" ? "returned" : level}
    </span>
  );
}

function DiagnosticCard({ entry }: { entry: DiagnosticEntry }) {
  return (
    <section
      id={entry.id}
      className="scroll-mt-24 rounded-lg border border-border bg-muted/10 p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <code className="font-mono text-sm font-semibold">{entry.code}</code>
        <CodeBadge level={entry.level} />
        <span className="font-mono text-[0.6875rem] text-muted-foreground">
          {entry.pkg}
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium mb-1">What it means</dt>
          <dd className="text-muted-foreground">{entry.meaning}</dd>
        </div>
        <div>
          <dt className="font-medium mb-1">Common cause</dt>
          <dd className="text-muted-foreground">{entry.cause}</dd>
        </div>
        <div>
          <dt className="font-medium mb-1">Correction</dt>
          <dd className="text-muted-foreground">{entry.fix}</dd>
        </div>
        <div>
          <dt className="font-medium mb-1">Affected API</dt>
          <dd className="font-mono text-xs text-muted-foreground">{entry.api}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function DiagnosticsReferencePage() {
  return (
    <DocsLayout>
      <div className="max-w-4xl">
        <PageHeader
          eyebrow="Reference"
          title="Diagnostics Reference"
          description="Theme Kit reports recoverable problems through diagnostics rather than throwing. Each one carries a stable code you can assert on, a severity, and a concrete correction."
        />

        <div className="my-8 space-y-10">
          <section className="space-y-4 text-sm text-muted-foreground">
            <p>
              A diagnostic is plain data. Building one has no side effects, which
              keeps creation separate from the two environment-specific concerns:
              how it is formatted, and where it is written. The same diagnostic can
              therefore be logged, collected, forwarded to the devtools panel, or
              escalated to a thrown error without any of that logic being
              duplicated at the call site.
            </p>
            <p>
              <strong className="text-foreground">Codes are the contract.</strong>{" "}
              Tests assert on codes, not on message text, and the code is what
              tooling can filter by. Messages are written to be useful but may be
              reworded between releases — treat them as human output, not as an API.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">The diagnostic object</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-medium">Field</th>
                    <th className="text-left px-3 py-2.5 font-medium">Type</th>
                    <th className="text-left px-3 py-2.5 font-medium">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map((field) => (
                    <tr
                      key={field.name}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-3 py-3 font-mono text-[0.6875rem] align-top">
                        {field.name}
                      </td>
                      <td className="px-3 py-3 font-mono text-[0.6875rem] text-muted-foreground align-top">
                        {field.type}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">
              Development and production
            </h2>
            <p>
              The failure is never hidden in production — the message and the code
              are always emitted. What changes is how much surrounding detail is
              attached. In development the structured context, the hint, and the
              reference link are appended, because that is where they are
              actionable. In a production build the message is emitted on its own.
            </p>
            <p>
              Environment detection reads{" "}
              <code className="font-mono text-[0.6875rem]">NODE_ENV</code> through
              a guarded access, so it is safe in a browser bundle and can still be
              replaced statically by a bundler. When there is no signal at all,
              Theme Kit reports the richer form rather than the quieter one:
              suppressing a correctness failure is worse than an extra line of
              context.
            </p>
          </section>

          <section className="space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">
              Repeated occurrences
            </h2>
            <p>
              Diagnostics are deduplicated by default. Reactive code paths call the
              same API on every render or store update, so a single mistake would
              otherwise flood the console. The first occurrence is the informative
              one; identical repeats are suppressed until emission is reset.
            </p>
            <p>
              That memory is process-wide, which makes it stateful across tests. Call{" "}
              <code className="font-mono text-[0.6875rem]">
                resetDiagnosticEmission()
              </code>{" "}
              between test cases so each one observes its own emissions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Code reference</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-medium">Code</th>
                    <th className="text-left px-3 py-2.5 font-medium">Level</th>
                    <th className="text-left px-3 py-2.5 font-medium">
                      Reported by
                    </th>
                    <th className="text-left px-3 py-2.5 font-medium">Package</th>
                  </tr>
                </thead>
                <tbody>
                  {DIAGNOSTICS.map((entry) => (
                    <tr
                      key={entry.code}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-3 py-3 font-mono text-[0.6875rem]">
                        <a href={`#${entry.id}`} className="underline">
                          {entry.code}
                        </a>
                      </td>
                      <td className="px-3 py-3">
                        <CodeBadge level={entry.level} />
                      </td>
                      <td className="px-3 py-3 font-mono text-[0.6875rem] text-muted-foreground">
                        {entry.api}
                      </td>
                      <td className="px-3 py-3 font-mono text-[0.6875rem] text-muted-foreground">
                        {entry.pkg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              {DIAGNOSTICS.map((entry) => (
                <DiagnosticCard key={entry.code} entry={entry} />
              ))}
            </div>
          </section>

          <section className="space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">
              Emitting your own diagnostic
            </h2>
            <p>
              Plugins and integrations are expected to report through the same
              mechanism rather than calling the console directly, so the severity,
              the code, the deduplication, and the development/production
              formatting stay consistent across packages.
            </p>
            <p>
              <code className="font-mono text-[0.6875rem]">createDiagnostic()</code>{" "}
              builds the value,{" "}
              <code className="font-mono text-[0.6875rem]">formatDiagnostic()</code>{" "}
              renders it for an environment, and{" "}
              <code className="font-mono text-[0.6875rem]">emitDiagnostic()</code>{" "}
              writes it. The emit call accepts a sink, so a diagnostic can be routed
              into a test double, a log pipeline, or the devtools panel instead of
              the console.
            </p>
            <pre className="mono text-[0.6875rem] overflow-x-auto rounded-lg border border-border bg-muted/20 p-3">
              {`emitDiagnostic(
  createDiagnostic({
    code: "TK_MODE_INVALID",
    level: "warning",
    message: 'setMode() received an unknown mode "purple".',
    context: {
      api: "setMode",
      property: "mode",
      received: "purple",
      expected: "light | dark | system",
    },
    hint: "Pass one of the three valid modes, or omit the call.",
  }),
);`}
            </pre>
            <p>
              When the offending value comes from outside the type system — storage,
              a cookie, an element attribute, a cross-tab message — validate it with{" "}
              <code className="font-mono text-[0.6875rem]">isThemeMode()</code>{" "}
              first. It is the single shared predicate for the light/dark/system
              axis, exported so adapters do not each re-implement the comparison.
            </p>
          </section>

          <section className="space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">
              When a diagnostic is fatal
            </h2>
            <p>
              A diagnostic is recoverable by design. When a caller decides a
              particular failure cannot be recovered from, it can escalate the same
              value to a thrown error and keep the code and context intact, so the
              consumer can branch on the code rather than match on prose.
            </p>
            <pre className="mono text-[0.6875rem] overflow-x-auto rounded-lg border border-border bg-muted/20 p-3">
              {`// A caller that treats this as fatal rather than recoverable:
throw ThemeError.fromDiagnostic(diagnostic);`}
            </pre>
            <p>
              The single-argument form remains valid for failures that do not
              correspond to a diagnostic.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-muted/10 p-4 text-sm">
            <p className="font-medium mb-2">Related</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
              <li>
                <a href="/api-reference/core" className="underline">
                  Core API reference
                </a>{" "}
                — the generated reference for the diagnostics model.
              </li>
              <li>
                <a href="/custom-themes" className="underline">
                  Custom Themes
                </a>{" "}
                — defining and validating theme definitions.
              </li>
              <li>
                <a href="/plugins" className="underline">
                  Plugins
                </a>{" "}
                — lifecycle hooks, including the accessibility and scheduled
                plugins.
              </li>
              <li>
                <a href="/accessibility" className="underline">
                  Accessibility
                </a>{" "}
                — contrast requirements and the checks behind the violation code.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </DocsLayout>
  );
}
