import type { Metadata } from "next";

import { DocsLayout } from "../../../components/docs-layout";
import { PageHeader } from "../../../components/ui/page-header";
import {
  frameworkCompatibilityData,
  libraryCompatibilityData,
  VERIFIED_DATE,
  VERIFIED_VERSION,
  type FrameworkCompatibility,
  type LibraryCompatibility,
} from "../../../lib/compatibility-data";
import { docsUrl } from "../../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/reference/compatibility") },
  title: "Compatibility & Support Matrix",
  description:
    "A single source of truth for Theme Kit framework, package, and library compatibility — SSR, zero-flash, persistence, adapter support, and last verification.",
};

function CompatibilityBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    Full: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Auto: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Stable: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Helpers: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Manual: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    "Client-only": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Cookie: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    LocalStorage: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    Both: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    None: "bg-muted/40 text-muted-foreground",
    "N/A": "bg-muted/40 text-muted-foreground",
  };

  const colorClass =
    colorMap[value] || "bg-muted/40 text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {value}
    </span>
  );
}

function FrameworkTable({ data }: { data: FrameworkCompatibility[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            <th className="text-left px-3 py-2.5 font-medium">Package</th>
            <th className="text-left px-3 py-2.5 font-medium">Framework</th>
            <th className="text-left px-3 py-2.5 font-medium">Version</th>
            <th className="text-left px-3 py-2.5 font-medium">SSR</th>
            <th className="text-left px-3 py-2.5 font-medium">Zero-flash</th>
            <th className="text-left px-3 py-2.5 font-medium">Persistence</th>
            <th className="text-left px-3 py-2.5 font-medium">Scrollbar</th>
            <th className="text-left px-3 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-border hover:bg-muted/20 transition-colors"
            >
              <td className="px-3 py-3 font-mono text-[0.6875rem]">
                {row.package}
              </td>
              <td className="px-3 py-3">{row.framework}</td>
              <td className="px-3 py-3 font-mono text-[0.6875rem] text-muted-foreground">
                {row.frameworkVersion}
              </td>
              <td className="px-3 py-3">
                <CompatibilityBadge value={row.ssr} />
              </td>
              <td className="px-3 py-3">
                <CompatibilityBadge value={row.zeroFlash} />
              </td>
              <td className="px-3 py-3">
                <CompatibilityBadge value={row.persistence} />
              </td>
              <td className="px-3 py-3 text-muted-foreground">
                {row.scrollbar}
              </td>
              <td className="px-3 py-3">
                <CompatibilityBadge value={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LibraryTable({ data }: { data: LibraryCompatibility[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            <th className="text-left px-3 py-2.5 font-medium">Library</th>
            <th className="text-left px-3 py-2.5 font-medium">Package</th>
            <th className="text-left px-3 py-2.5 font-medium">Architecture</th>
            <th className="text-left px-3 py-2.5 font-medium">
              Host Frameworks
            </th>
            <th className="text-left px-3 py-2.5 font-medium">CSS Vars / Type</th>
            <th className="text-left px-3 py-2.5 font-medium">SSR Safe</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-border hover:bg-muted/20 transition-colors"
            >
              <td className="px-3 py-3 font-medium">{row.library}</td>
              <td className="px-3 py-3 font-mono text-[0.6875rem]">
                {row.package}
              </td>
              <td className="px-3 py-3">
                <CompatibilityBadge value={row.adapterType} />
              </td>
              <td className="px-3 py-3 text-muted-foreground text-[0.6875rem]">
                {row.frameworkSupport}
              </td>
              <td className="px-3 py-3 font-mono text-[0.6875rem] text-muted-foreground max-w-xs truncate">
                {row.cssVarPrefix}
              </td>
              <td className="px-3 py-3">
                {row.ssrSafe ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompatibilityMatrixPage() {
  return (
    <DocsLayout>
      <div className="max-w-5xl">
        <PageHeader
          eyebrow="Reference"
          title="Compatibility & Support Matrix"
          description="Canonical answers for what is supported, tested, and production-ready — covering all frameworks, adapters, and libraries."
        />

        <div className="my-8 space-y-8">
          <div className="rounded-lg border border-border bg-muted/10 p-4 text-sm">
            <p className="font-medium mb-1">Data Verification</p>
            <p className="text-muted-foreground text-xs">
              Last verified: <strong>{VERIFIED_DATE}</strong> · Theme Kit{" "}
              <strong>v{VERIFIED_VERSION}</strong>
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              All data sourced from actual package.json peer dependencies and
              source code audits. For feature-by-feature caveats, visit{" "}
              <a href="/known-limitations" className="underline">
                Known Limitations
              </a>
              .
            </p>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Framework Package Compatibility
            </h2>
            <FrameworkTable data={frameworkCompatibilityData} />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Library Adapter Compatibility
            </h2>
            <LibraryTable data={libraryCompatibilityData} />
          </section>

          <section className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">Legend</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex gap-3">
                  <dt className="font-medium min-w-[8rem]">SSR:</dt>
                  <dd>
                    <strong>Full</strong> = server resolves theme and renders
                    shell; <strong>Helpers</strong> = exports bootstrap utils
                    (user wires); <strong>Client-only</strong> = runtime created
                    client-side
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium min-w-[8rem]">Zero-flash:</dt>
                  <dd>
                    <strong>Auto</strong> = blocking script injected
                    automatically; <strong>Manual</strong> = user must inline
                    script; <strong>None</strong> = not applicable
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium min-w-[8rem]">Persistence:</dt>
                  <dd>
                    <strong>Cookie</strong> = SSR-readable; <strong>LocalStorage</strong> = client-only; <strong>Both</strong> = supports
                    either
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium min-w-[8rem]">Adapter types:</dt>
                  <dd>
                    <strong>CSS-variable</strong> = writes :root CSS vars; <strong>Generated-theme</strong> = builds native library theme
                    object; <strong>Preset</strong> = build-time integration
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">
                Important Notes
              </h3>
              <ul className="space-y-1.5 text-xs list-disc list-inside">
                <li>
                  <strong>MUI, Chakra, Ant Design, Mantine:</strong> React-only.
                  No framework subpaths exist. The pure theme builders
                  (createMuiTheme, etc.) are framework-neutral, but runtime
                  integration requires React.
                </li>
                <li>
                  <strong>shadcn/ui, Bootstrap, daisyUI, Open Props:</strong>{" "}
                  Framework-neutral CSS-variable adapters. Exports /react /vue
                  /svelte /solid /angular /factory.
                </li>
                <li>
                  <strong>Next.js, Astro, Nuxt:</strong> Fully automated
                  zero-flash SSR. Server reads cookies, emits blocking script,
                  renders theme before hydration.
                </li>
                <li>
                  <strong>Remix:</strong> SSR-capable but requires manual
                  tk-scrollbar class on &lt;html&gt; element.
                </li>
                <li>
                  <strong>Angular:</strong> Uses own bootstrap implementation
                  (createBlockingScriptContent), not core's
                  serializeThemeBootstrapScript.
                </li>
                <li>
                  <strong>Cross-window sync:</strong> All framework packages
                  support BroadcastChannel and storage events (implemented in
                  core).
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </DocsLayout>
  );
}
