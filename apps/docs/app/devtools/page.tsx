import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "DevTools",
  description:
    "The @theme-kit/devtools extension — inspect the active theme, trace token changes, and debug transitions and adapters.",
};

const quickStartCode = `import { createThemeRuntime } from "@theme-kit/core";
import { createDevToolsPlugin, createDevToolsPanel } from "@theme-kit/devtools";

const runtime = createThemeRuntime({
  themes,
  plugins: [createDevToolsPlugin()],
});

// Optional: mount the UI panel anywhere
const panel = createDevToolsPanel(
  runtime.plugins.get("devtools-inspector") as any,
);
document.body.appendChild(panel);`;

const pluginCode = `const plugin = createDevToolsPlugin({ maxEntries: 200, maxPerfEntries: 100 });

const runtime = createThemeRuntime({ themes, plugins: [plugin] });

plugin.getInspector().getState();
// {
//   currentTheme: ThemeDefinition,
//   selection: { mode, family },
//   history: [{ index, point: { theme, selection } }],
//   entries: [{ type, timestamp, label, data }],
//   performance: [{ duration, type, timestamp }],
//   cssVariables: { "--theme-color-primary": "#6366f1", ... },
// }`;

const inspectorCode = `const inspector = createDevToolsInspector();

// Read what has happened
inspector.getEntries();
// [{ type: "theme-change", timestamp: 1712345678901, label: "Theme changed", data: {} }]

inspector.getPerformance();
// [{ duration: 0, type: "afterThemeChange", timestamp: 1712345678901 }]

// Jump through history
inspector.jump(0); // restores snapshot at index 0

// Inspect live state
inspector.getState();
inspector.getCSSVariables();

// Export
inspector.exportState(); // JSON string of the full state
inspector.exportCSS();   // { "--theme-color-primary": "#6366f1", ... }

inspector.clearEntries();
inspector.clearPerformance();
inspector.destroy();`;

const panelCode = `const panel = createDevToolsPanel(inspector);
document.body.appendChild(panel);`;

const globalHookCode = `declare global {
  interface Window {
    __THEME_KIT_DEVTOOLS__?: Set<{
      getState(): unknown;
      getEntries(): unknown[];
      getPerformance(): unknown[];
    }>;
  }
}

for (const inspector of window.__THEME_KIT_DEVTOOLS__ ?? []) {
  console.log(inspector.getState());
}`;

const entryTypes = [
  { type: "theme-change", meaning: "The active theme changed" },
  { type: "mode-change", meaning: "The mode changed (light / dark / system)" },
  {
    type: "family-change",
    meaning: "The family changed (e.g. plum → mint)",
  },
  { type: "persist", meaning: "Selection was persisted to storage" },
  {
    type: "restore",
    meaning: "A snapshot was restored (undo / redo / jump)",
  },
  { type: "batch", meaning: "An atomic batched update ran" },
];

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const devToolsHeadings = buildPageHeadings([
  { text: "Quick start", level: 2 },
  { text: "createDevToolsPlugin(options)", level: 2 },
  { text: "createDevToolsInspector(options)", level: 2 },
  { text: "createDevToolsPanel(inspector)", level: 2 },
  { text: "Global hook", level: 2 },
  { text: "Entry types", level: 2 },
]);

export default function DevToolsPage() {
  return (
    <DocsLayout headings={devToolsHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          }
          title="DevTools"
          subtitle="@theme-kit/devtools"
          description={
            <>
              <code className="mono text-[0.9em]">@theme-kit/devtools</code>{" "}
              ships an inspector, a plugin, and a ready-made panel for debugging
              every theme change. It records lifecycle events, performance
              timings, state snapshots and the flattened CSS-variable output of
              the active theme.
            </>
          }
        />

        <section id="quick-start" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Attach the plugin to your runtime and a panel to your page."
          >
            Quick start
          </SectionHeading>
          <CodeBlock
            html={highlightCode(quickStartCode, "ts")}
            code={quickStartCode}
            language="ts"
            filename="setup"
            className="m-0"
          />
        </section>

        <section id="create-devtools-plugin" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="A Theme Kit plugin that instantiates an inspector, binds it to the runtime and exposes it on window.__THEME_KIT_DEVTOOLS__ so extensions can find it."
          >
            createDevToolsPlugin(options)
          </SectionHeading>
          <CodeBlock
            html={highlightCode(pluginCode, "ts")}
            code={pluginCode}
            language="ts"
            filename="plugin"
            className="m-0"
          />
          <Callout className="mt-3">
            Internally it subscribes to{" "}
            <code className="mono text-[0.9em]">beforeThemeChange</code> /{" "}
            <code className="mono text-[0.9em]">afterThemeChange</code> to
            record perf entries and emits a{" "}
            <code className="mono text-[0.9em]">theme-change</code> event entry
            on every switch.
          </Callout>
        </section>

        <section id="create-devtools-inspector" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="The standalone recorder — use it directly if you are not going through the plugin. Records theme-change entries, lifecycle performance events and state snapshots."
          >
            createDevToolsInspector(options)
          </SectionHeading>
          <CodeBlock
            html={highlightCode(inspectorCode, "ts")}
            code={inspectorCode}
            language="ts"
            filename="inspector"
            className="m-0"
          />
          <Callout className="mt-3">
            Capped at{" "}
            <code className="mono text-[0.9em]">maxEntries</code> (default 200)
            and{" "}
            <code className="mono text-[0.9em]">maxPerfEntries</code> (default
            100).
          </Callout>
        </section>

        <section id="create-devtools-panel" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Renders a floating, framework-free panel (plain DOM, no dependencies) with five tabs."
          >
            createDevToolsPanel(inspector)
          </SectionHeading>
          <CodeBlock
            html={highlightCode(panelCode, "ts")}
            code={panelCode}
            language="ts"
            filename="panel"
            className="m-0"
          />
          <div className="mt-4 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Panel tabs
            </div>
            <div className="p-4 flex flex-col gap-2 text-sm">
              {[
                ["Inspector", "The current theme and selection as pretty-printed JSON"],
                ["Events", "Chronological lifecycle event entries"],
                ["Perf", "beforeThemeChange / afterThemeChange timings as bars"],
                ["CSS Vars", "The flattened --theme-* variables with color swatches"],
                ["History", "Every snapshot with a one-click Jump to restore it"],
              ].map(([tab, desc]) => (
                <div key={tab} className="flex gap-2 items-start text-sm opacity-75">
                  <span
                    className="w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold bg-muted text-foreground/50"
                  >
                    {tab![0]}
                  </span>
                  <div>
                    <span className="font-semibold">{tab}</span>
                    <span className="ml-2 opacity-60">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm opacity-70">
            Footer buttons clear events/perf and export the state to JSON or the
            CSS variables to a <code className="mono text-[0.9em]">.css</code>{" "}
            file.
          </p>
        </section>

        <section id="global-hook" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="Every inspector registered via the plugin is added to a Set on window.__THEME_KIT_DEVTOOLS__ so a browser extension or your own code can enumerate and inspect all live runtimes."
          >
            Global hook
          </SectionHeading>
          <CodeBlock
            html={highlightCode(globalHookCode, "ts")}
            code={globalHookCode}
            language="ts"
            filename="global hook"
            className="m-0"
          />
        </section>

        <section id="entry-types" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="Every recorded entry has a type field."
          >
            Entry types
          </SectionHeading>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2 text-left font-semibold uppercase tracking-wider opacity-50 text-xs">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left font-semibold uppercase tracking-wider opacity-50 text-xs">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody>
                {entryTypes.map((entry, i) => (
                  <tr
                    key={entry.type}
                    className={i < entryTypes.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-2.5">
                      <code className="mono text-[0.9em]">{entry.type}</code>
                    </td>
                    <td className="px-4 py-2.5 opacity-70">{entry.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
