import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { InlineCode } from "../../components/ui/inline-code";
import { Prerequisites } from "../../components/ui/prerequisites";
import { RelatedLinks } from "../../components/ui/related-links";
import { highlightCode } from "../../lib/highlight";
import { docsUrl } from "../../lib/site";

export const metadata: Metadata = {
  alternates: { canonical: docsUrl("/architecture") },
  title: "Architecture",
  description:
    "Inside Theme Kit: the runtime, store, transition pipeline, persistence, adapters, and how the pieces stay framework-agnostic.",
};

function snippet(code: string, lang = "ts") {
  return (
    <CodeBlock
      html={highlightCode(code, lang)}
      code={code}
      language={lang}
      className="rounded-lg m-0"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Snippet data                                                       */
/* ------------------------------------------------------------------ */

const createRuntimeCode = `import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,            // default: built-in themes
  defaultTheme,      // fallback theme name
  initialMode,       // "light" | "dark" | "system"
  initialFamily,     // e.g. "plum"
  persistence,       // localStorage adapter by default
  broadcast,         // BroadcastChannel adapter by default
  dom,               // DOM attribute binding options (false to disable)
  cssVariables,      // CSS variable binding options (false to disable)
  transition,        // smooth transitions
  scheduled,         // sunset/sunrise auto switching
  plugins,           // lifecycle + token transform plugins
});`;

const storeCode = `const theme = runtime.store.get();              // current theme
const unsubscribe = runtime.store.subscribe((t) => {
  console.log("theme changed:", t.name);
});

runtime.store.set(myTheme);                     // apply immediately
runtime.store.batch(() => {                      // coalesce several writes
  runtime.store.set(a);
  runtime.store.set(b);
});
unsubscribe();`;

const registryCode = `runtime.registry.register(myTheme);              // add a theme
runtime.registry.registerMany([a, b, c]);        // add several
runtime.registry.unregister("plum-dark");        // remove by name
runtime.registry.replace("plum-dark", newDark);  // swap in place
runtime.registry.get("plum-light");              // find by name
runtime.registry.has("plum-light");              // boolean
runtime.registry.list();                         // all themes
runtime.registry.getFamilies();                  // ["default", "plum", ...]
runtime.registry.getThemesByFamily("plum");      // plums only`;

const selectionCode = `runtime.selection.setMode("dark");               // "light" | "dark" | "system"
runtime.selection.setFamily("mint");             // switch palette
runtime.selection.toggleTheme();                 // flip light <-> dark
runtime.selection.getSelection();
// { mode: "dark", family: "mint" }`;

const themesCode = `for (const theme of runtime.themes) {
  console.log(theme.name, theme.meta?.family, theme.meta?.mode);
}

const plums = runtime.themes.filter(
  (t) => t.meta?.family === "plum",
);`;

const updateCode = `runtime.update({
  colors: {
    primary: "#6366f1",
    accent: { hover: "#4f46e5" },
  },
  radius: { lg: "16px" },
});`;

const useCode = `runtime.use({
  name: "brand",
  themes: [
    { name: "apple-light", meta: { family: "apple", mode: "light" }, tokens },
    { name: "apple-dark", meta: { family: "apple", mode: "dark" }, tokens },
  ],
});`;

const batchCode = `runtime.batch(() => {
  runtime.update({ colors: { primary: "#000" } });
  runtime.selection.setMode("dark");
  runtime.selection.setFamily("plum");
});
// subscribers fire exactly once, with the final theme`;

const snapshotRestoreCode = `const snapshot = runtime.snapshot();
// { theme, selection, history: [], registry: { themes } }

// ... make changes ...

runtime.restore(snapshot);   // back to exactly how it was`;

const historyCode = `runtime.history.undo();               // step back
runtime.history.redo();               // step forward
runtime.history.jump(2);              // jump to any point in time
runtime.history.canUndo();            // boolean
runtime.history.canRedo();            // boolean
runtime.history.getHistory();         // HistoryEntry[] { theme, timestamp }
runtime.history.clear();              // wipe the timeline`;

const lifecycleCode = `const off = runtime.lifecycle.on("beforeThemeChange", ({ current, next }) => {
  console.log(\`leaving \${current.name}, entering \${next.name}\`);
});

runtime.lifecycle.on("afterApply", ({ theme }) => {
  document.title = \`Theme — \${theme.name}\`;
});

off(); // unsubscribe`;

const destroyCode = `runtime.destroy();`;

const bootstrapCode = `import { createThemeBootstrapScript, buildThemeCssMap } from "@theme-kit/core";

const cssMap = buildThemeCssMap(themes);         // name + family:mode → variables
const script = createThemeBootstrapScript({
  themes,
  defaultTheme: "light",
  initialMode: "system",
  storageKey: "theme-selection",
  prefix: "theme-",
});
// inject \`script\` into <head> before first paint`;

const flowDiagram = `setFamily("plum")
  → selection.setFamily()
    → persistence.set({ mode, family })     // save
    → broadcast.post({ mode, family })       // sync other tabs
    → resolve theme for family + mode
    → lifecycle.emit("beforeThemeChange")
      → plugins.onBeforeThemeChange
    → store.set(theme)
      → lifecycle.emit("afterThemeChange")
      → DOM binding: data-theme, data-theme-mode, .dark class
      → CSS variables binding: --theme-* variables
      → lifecycle.emit("beforeApply" / "afterApply")
    → history records a snapshot`;

/* ------------------------------------------------------------------ */
/*  Runtime subsection data                                            */
/* ------------------------------------------------------------------ */

const runtimeSections = [
  {
    id: "runtime-store",
    title: "`runtime.store`",
    desc: "The reactive store holding the active theme. `get()` reads it, `set()` replaces it, `subscribe()` reacts to changes, and `batch()` coalesces multiple writes into a single notification.",
    code: storeCode,
  },
  {
    id: "runtime-registry",
    title: "`runtime.registry`",
    desc: "Every registered theme, powering dynamic theming. Register, unregister, replace, look up, and group themes by family.",
    code: registryCode,
  },
  {
    id: "runtime-selection",
    title: "`runtime.selection`",
    desc: "Mode + family resolution. Handles persistence and broadcast for you, and keeps the store in sync.",
    code: selectionCode,
  },
  {
    id: "runtime-themes",
    title: "`runtime.themes`",
    desc: "A read-only list of all registered themes — handy for rendering pickers, galleries, or walking families.",
    code: themesCode,
  },
  {
    id: "runtime-update",
    title: "`runtime.update(tokens)`",
    desc: "Live theme editing: merge partial tokens into the active theme and re-apply. The perfect primitive for theme studios and design-time tweaking.",
    code: updateCode,
  },
  {
    id: "runtime-use",
    title: "`runtime.use(pack)`",
    desc: "Install a theme pack at runtime. A pack is a named bundle of themes; every theme in it is stamped with a `pack:<name>` tag.",
    code: useCode,
  },
  {
    id: "runtime-batch",
    title: "`runtime.batch(cb)`",
    desc: "Run a callback atomically — intermediate state changes are suppressed until the callback finishes.",
    code: batchCode,
  },
  {
    id: "runtime-snapshot",
    title: "`runtime.snapshot()` / `runtime.restore(snapshot)`",
    desc: "Serialize the full runtime state — theme, selection, history, and registry — and restore it later. Ideal for time travel and demo replay.",
    code: snapshotRestoreCode,
  },
  {
    id: "runtime-history",
    title: "`runtime.history`",
    desc: "Built-in undo/redo, capped at 50 steps by default. Records full theme snapshots with timestamps.",
    code: historyCode,
  },
  {
    id: "runtime-lifecycle",
    title: "`runtime.lifecycle`",
    desc: "A typed event bus for the theme pipeline. Subscribe with `on()` (returns an unsubscribe function) and react to typed payloads.",
    code: lifecycleCode,
  },
  {
    id: "runtime-destroy",
    title: "`runtime.destroy()`",
    desc: "Full teardown: unsubscribes every listener, removes DOM/CSS bindings, closes the broadcast channel, and clears registry, history, and lifecycle.",
    code: destroyCode,
  },
];

const configFileCode = `// theme.config.ts — at the project root
import { defineThemeKitConfig } from "@theme-kit/core";
import { themes } from "./src/themes";

export default defineThemeKitConfig({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
  initialFamily: "mint",
});`;

const configProviderCode = `// main.tsx — the runtime, through your framework provider
import { ThemeProvider } from "@theme-kit/react";

<ThemeProvider>
  <App />
</ThemeProvider>`;

const configPluginCode = `// vite.config.ts — the pre-paint bootstrap, through a build integration
import { themeKitVitePlugin } from "@theme-kit/core/vite";

export default defineConfig({
  plugins: [react(), themeKitVitePlugin()],
});`;

const configAntiPatternCode = `// Declared twice — the plugin's copy and the provider's copy drift apart
themeKitVitePlugin({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
});

<ThemeProvider
  themes={themes}
  defaultTheme="mint-light"
  initialMode="system"
/>`;

const configDeclaredOnceCode = `// Declared once — both consumers read it
themeKitVitePlugin();

<ThemeProvider>
  <App />
</ThemeProvider>`;

/**
 * Which configuration keys each consumer reads.
 *
 * Derived from the shipped type rather than invented: `ThemeBootstrapConfig` is
 * `Pick<ThemeKitConfig, "themes" | "defaultTheme" | "initialMode" |
 * "initialFamily" | "storageKey" | "prefix">`, and both integrations transport
 * exactly that projection (`toBootstrapConfig`) to the runtime. Everything
 * outside the pick is runtime-only, and `plugins` / `adapters` additionally
 * cannot be serialized at all.
 */
const configSplit = [
  { key: "themes", runtime: true, bootstrap: true, note: "The registry both sides resolve from." },
  { key: "defaultTheme", runtime: true, bootstrap: true, note: "Fallback when nothing is persisted." },
  { key: "initialMode", runtime: true, bootstrap: true, note: "`system` → `prefers-color-scheme`." },
  { key: "initialFamily", runtime: true, bootstrap: true, note: "Family resolved before first paint." },
  { key: "storageKey", runtime: true, bootstrap: true, note: "The key both sides read." },
  { key: "prefix", runtime: true, bootstrap: true, note: "CSS variable prefix." },
  { key: "persistence", runtime: true, bootstrap: false, note: "A runtime decision made after the fact." },
  { key: "transition", runtime: true, bootstrap: false, note: "Nothing to animate before paint." },
  { key: "scrollbar", runtime: true, bootstrap: false, note: "Runtime overlay options." },
  { key: "plugins", runtime: true, bootstrap: false, note: "Not serializable — pass to the provider." },
  { key: "adapters", runtime: true, bootstrap: false, note: "Not serializable — pass to the provider." },
];

const layers = [
  { name: "Store", desc: "Minimal reactive state holding the active theme. `get`, `set`, `subscribe`, `batch`." },
  { name: "Registry", desc: "Every registered theme, powering dynamic theming, theme packs, and family lookups." },
  { name: "Selection", desc: "Mode + family resolution with persistence & broadcast, driving the store." },
  { name: "Adapters", desc: "CSS variables, DOM attributes, system theme, scoped themes, scheduled themes, transitions." },
  { name: "Resolvers", desc: "Token references, expressions, and derived colors resolved lazily at runtime." },
  { name: "Plugins", desc: "Hook into the lifecycle and transform tokens; official plugins ship for persistence, history, animations, accessibility, scheduling, debugging, and devtools." },
  { name: "Bootstrap", desc: "Blocking inline script for zero-flash, plus a `@media (prefers-color-scheme: dark)` fallback." },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ArchitecturePage() {
  const content = (
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
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          }
          title="Architecture"
          subtitle="@theme-kit/core — runtime, layers & data flow"
          description={
            <>
              Theme Kit&apos;s heart is a single framework-agnostic runtime that
              wires the store, registry, selection, persistence, broadcast, DOM
              bindings, history, lifecycle, and plugins together into one cohesive
              system.
            </>
          }
        />

        <Prerequisites
          items={[
            {
              label: "Understanding",
              value: "Core concepts and theme model",
              href: "/core-concepts",
            },
            {
              label: "Package",
              value: "@theme-kit/core or framework package",
              href: "/packages/core",
            },
            {
              label: "Knowledge",
              value: "JavaScript runtime patterns and reactive stores",
            },
          ]}
          className="mb-8"
        />

        {/* ---- One Runtime ---- */}
        <section id="one-runtime" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="The single entry point that wires every subsystem together."
          >
            One Runtime
          </SectionHeading>
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            The heart of the library is a single framework-agnostic runtime
            that wires the store, registry, selection, persistence, broadcast,
            DOM bindings, history, lifecycle, and plugins together.
          </p>
          {snippet(createRuntimeCode)}
          <p className="text-sm opacity-70 leading-relaxed mt-4">
            Once created, the runtime immediately:
          </p>
          <ol className="text-sm opacity-70 leading-relaxed list-decimal pl-5 mt-2 space-y-1">
            <li>Resolves the initial theme from <code className="mono text-[0.9em]">defaultTheme</code> / <code className="mono text-[0.9em]">initialMode</code> / <code className="mono text-[0.9em]">initialFamily</code> (or persisted selection).</li>
            <li>Registers every theme in the registry.</li>
            <li>Wires the store, selection controller, persistence, and broadcast.</li>
            <li>Applies DOM attributes and CSS variables via the bindings.</li>
          </ol>
        </section>

        {/* ---- Runtime API ---- */}
        <section id="runtime-api" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Every feature hangs off the `runtime` object. Each entry below shows the property and a minimal usage snippet."
          >
            Runtime API
          </SectionHeading>

          <div className="flex flex-col gap-8">
            {runtimeSections.map((section, i) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed mb-3">
                  <InlineCode>{section.desc}</InlineCode>
                </p>
                {snippet(section.code)}
              </div>
            ))}
          </div>
        </section>

        {/* ---- Configuration: one declaration, two consumers ---- */}
        <section id="configuration" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="One declaration. Two consumers. No duplicated theme configuration."
          >
            Configuration
          </SectionHeading>
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            The application&apos;s Theme Kit configuration is a single object at
            the project root, <code className="mono text-[0.9em]">theme.config.ts</code>,
            declared through{" "}
            <code className="mono text-[0.9em]">defineThemeKitConfig</code>. It is
            consumed by two things, and neither of them is a second declaration:
            the <strong>runtime</strong> (through your framework provider) and the{" "}
            <strong>pre-paint bootstrap</strong> (through a build integration such
            as the Vite plugin or the Astro integration).
          </p>
          {snippet(configFileCode)}
          <p className="text-sm opacity-70 leading-relaxed mt-4 mb-3">
            Both consumers read that file. The provider takes no theme props,
            because the build integration has already put the configuration in
            the page for it:
          </p>
          {snippet(configProviderCode, "tsx")}
          <p className="text-sm opacity-70 leading-relaxed mt-4 mb-3">
            And the build integration derives the blocking script from the same
            file, so the two cannot disagree:
          </p>
          {snippet(configPluginCode)}
          <p className="text-sm opacity-70 leading-relaxed mt-4">
            This exists to remove a class of bug rather than to add a feature.
            When the registry, the fallback theme and the initial mode are
            declared twice — once for the provider and once for whatever emits the
            pre-paint script — the two drift. A drift is visible: the script paints
            one theme, the runtime corrects it a frame later, and any theme-name
            readout contradicts the control that set it. This is the shape that
            drifts:
          </p>
          {snippet(configAntiPatternCode, "tsx")}
          <p className="text-sm opacity-70 leading-relaxed mt-4 mb-3">
            And this is the shape that cannot:
          </p>
          {snippet(configDeclaredOnceCode, "tsx")}
          <p className="text-sm opacity-70 leading-relaxed mt-4 mb-3">
            The split is not arbitrary — it follows the shipped type.{" "}
            <code className="mono text-[0.9em]">ThemeBootstrapConfig</code> is a{" "}
            <code className="mono text-[0.9em]">Pick</code> of{" "}
            <code className="mono text-[0.9em]">ThemeKitConfig</code>, and both
            integrations transport exactly that projection to the runtime:
          </p>
          <div className="rounded-xl border border-border overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      Key
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      Runtime
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      Bootstrap
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {configSplit.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-border last:border-0 align-top"
                    >
                      <td className="px-4 py-2.5 mono text-[0.85em] whitespace-nowrap">
                        {row.key}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span aria-label={row.runtime ? "used" : "not used"}>
                          {row.runtime ? "✓" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span aria-label={row.bootstrap ? "used" : "not used"}>
                          {row.bootstrap ? "✓" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 opacity-70">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Because the transported configuration is the bootstrap projection, the
            runtime-only keys never reach the provider through it — pass those to
            the provider directly. A build integration is an{" "}
            <strong>optimization</strong>, not a requirement: with no integration
            at all, a provider alone still themes the app, using the built-in
            neutral themes when no registry is supplied. What it gives up is the
            pre-paint guarantee.
          </p>
        </section>

        {/* ---- Layers ---- */}
        <section id="layers" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Each layer builds on the one below it."
          >
            Layers
          </SectionHeading>
          <div className="flex flex-col gap-2">
            {layers.map((layer, i) => (
              <div key={layer.name} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <span
                    className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-bold bg-muted text-foreground/50"
                  >
                    {i + 1}
                  </span>
                  {i < layers.length - 1 && (
                    <span
                      className="w-px flex-1 my-0.5"
                      style={{
                        background:
                          "linear-gradient(to bottom, color-mix(in srgb, var(--theme-color-border) 60%, transparent), color-mix(in srgb, var(--theme-color-border) 60%, transparent))",
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <div className="text-sm font-semibold">{layer.name}</div>
                  <div className="text-xs opacity-60 leading-relaxed mt-0.5">
                    <InlineCode>{layer.desc}</InlineCode>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- How a Theme Change Flows ---- */}
        <section id="flow" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc={`What happens when you call a method like \`setFamily("plum")\`.`}
          >
            How a Theme Change Flows
          </SectionHeading>
          {snippet(flowDiagram, "text")}
        </section>

        {/* ---- Bootstrap: Zero Flash ---- */}
        <section id="bootstrap" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="A blocking inline script ensures the first paint is never the wrong theme."
          >
            Bootstrap: Zero Flash
          </SectionHeading>
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            Before any JS runs, a blocking inline script reads the persisted
            selection, resolves the effective mode (<code className="mono text-[0.9em]">system</code>{" "}
            → <code className="mono text-[0.9em]">prefers-color-scheme</code>),
            and applies CSS variables + DOM effects.
          </p>
          {snippet(bootstrapCode)}
          <p className="text-sm opacity-70 leading-relaxed mt-4">
            The <code className="mono text-[0.9em]">@theme-kit/next</code> provider
            does all of this automatically — it reads cookies on the server, renders
            the resolved theme, and emits the blocking script.
          </p>
          <div className="mt-6">
            <Link
              href="/zero-flash"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Zero Flash — deep dive</div>
                <div className="text-xs opacity-60">
                  Full breakdown: the bootstrap pipeline, every framework, and how
                  hydration stays flash-free.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
          </div>
        </section>

        <RelatedLinks
          links={[
            {
              title: "Zero Flash",
              href: "/zero-flash",
              description: "Bootstrap pipeline and flash-free hydration",
            },
            {
              title: "Core Concepts",
              href: "/core-concepts",
              description: "Theme model, tokens, and design primitives",
            },
            {
              title: "Plugins",
              href: "/plugins",
              description: "Lifecycle hooks and token transformations",
            },
            {
              title: "API Reference",
              href: "/api-reference",
              description: "Complete runtime API documentation",
            },
          ]}
        />
      </div>
  );
  return <DocsLayout>{content}</DocsLayout>;
}
