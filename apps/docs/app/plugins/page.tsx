import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Plugins",
  description:
    "Extend Theme Kit with lifecycle hooks, token transforms, and runtime integrations using the plugin system.",
};

const basicPluginSnippet = {
  lang: "ts",
  title: "defining a basic plugin",
  code: `import type { ThemePlugin } from "@theme-kit/core";

const myPlugin: ThemePlugin = {
  name: "my-plugin",
  version: "1.0.0",
  priority: 10,

  onRuntimeCreated(runtime) {
    console.log("Runtime ready", runtime);
  },

  onAfterThemeChange({ theme }) {
    console.log("Theme changed to", theme.name);
  },
};`,
};

const hooksSnippet = {
  lang: "ts",
  title: "plugin hooks",
  code: `import type { ThemePlugin } from "@theme-kit/core";

const logger: ThemePlugin = {
  name: "logger",

  onRuntimeCreated(runtime) {
    // Called once when createThemeRuntime() finishes.
    // Return a teardown function to run on destroy().
    return () => console.log("runtime destroyed");
  },

  onBeforeThemeChange({ current, next }) {
    // Fires before the active theme switches.
    console.log(\`\${current.name} → \${next.name}\`);
  },

  onAfterThemeChange({ theme }) {
    // Fires after the new theme is active.
  },

  onBeforePersist({ selection }) {
    // Before the selection is saved to the persistence adapter.
  },

  onAfterPersist({ selection }) {
    // After the selection has been persisted.
  },

  onBeforeApply({ theme }) {
    // Before CSS variables are written to the DOM.
  },

  onAfterApply({ theme }) {
    // After CSS variables have been applied.
  },

  onDestroy() {
    // Cleanup when the runtime is destroyed.
  },
};`,
};

const transformSnippet = {
  lang: "ts",
  title: "token transform plugin",
  code: `import type { ThemePlugin, ThemeTokens } from "@theme-kit/core";

const contrastBoost: ThemePlugin = {
  name: "contrast-boost",
  priority: 5,

  transformTokens(tokens, { theme }) {
    // Adjust foreground tokens for better contrast.
    if (theme.meta?.mode === "dark") {
      return {
        ...tokens,
        colors: {
          ...tokens.colors,
          foreground: adjustBrightness(tokens.colors.foreground, 10),
        },
      };
    }
    return tokens;
  },
};`,
};

const prioritySnippet = {
  lang: "ts",
  title: "priority ordering",
  code: `import type { ThemePlugin } from "@theme-kit/core";

const pluginA: ThemePlugin = {
  name: "a",
  priority: 0,   // Runs first
  transformTokens(tokens) { /* … */ return tokens; },
};

const pluginB: ThemePlugin = {
  name: "b",
  // priority defaults to 10
  transformTokens(tokens) { /* … */ return tokens; },
};

const pluginC: ThemePlugin = {
  name: "c",
  priority: 20,  // Runs last
  transformTokens(tokens) { /* … */ return tokens;
};

// Execution order: A → B → C
// Lower priority values execute first.
// Plugins with the same priority run in registration order.`,
};

const runtimeSnippet = {
  lang: "ts",
  title: "runtime plugin management",
  code: `import { createThemeRuntime, createPluginManager } from "@theme-kit/core";

const runtime = createThemeRuntime({
  plugins: [debuggerPlugin, persistencePlugin],
});

// Standalone plugin manager
const manager = createPluginManager();

// Register a plugin — returns an unsubscribe function
const unsubscribe = manager.use(myPlugin);

// Look up a registered plugin by name
const found = manager.get("my-plugin");

// Remove a plugin by name
manager.remove("my-plugin");

// List all registered plugins (sorted by priority)
const all = manager.list();

// Destroy all plugins and call their onDestroy hooks
manager.destroy();

// Unsubscribe to remove the plugin later
unsubscribe();`,
};

const fullExampleSnippet = {
  lang: "ts",
  title: "full plugin example",
  code: `import type { ThemePlugin, ThemeTokens } from "@theme-kit/core";

/**
 * Logs every theme change and boosts contrast on dark tokens.
 */
const analyticsPlugin: ThemePlugin = {
  name: "theme-analytics",
  version: "1.0.0",
  priority: 5,

  onRuntimeCreated(runtime) {
    const unsubscribe = runtime.store.subscribe((theme) => {
      window.dispatchEvent(
        new CustomEvent("theme-change", { detail: theme.name }),
      );
    });
    return unsubscribe;
  },

  onBeforeThemeChange({ current, next }) {
    console.log(
      \`[theme-analytics] \${current.name} → \${next.name}\`,
    );
  },

  onAfterApply({ theme }) {
    console.log(\`[theme-analytics] Applied \${theme.name}\`);
  },

  transformTokens(tokens: ThemeTokens, { theme }) {
    if (theme.meta?.mode === "dark") {
      return {
        ...tokens,
        colors: {
          ...tokens.colors,
          foreground: tokens.colors.foreground ?? "#f5f5f5",
        },
      };
    }
    return tokens;
  },

  onDestroy() {
    console.log("[theme-analytics] Destroyed");
  },
};

// Pass to the runtime at creation
import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  plugins: [analyticsPlugin],
});`,
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const pluginsHeadings = buildPageHeadings([
  { text: "What is a Plugin?", level: 2 },
  { text: "Plugin Hooks", level: 2 },
  { text: "Token Transforms", level: 2 },
  { text: "Priority & Ordering", level: 2 },
  { text: "Runtime Integration", level: 2 },
  { text: "Full Example", level: 2 },
]);

export default function PluginsPage() {
  return (
    <DocsLayout headings={pluginsHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Plugins"
          title="Extend Theme Kit with plugins"
          description={
            <>
              Theme Kit&apos;s plugin system lets you hook into every stage of the
              theme lifecycle — from runtime creation to token transforms to
              persistence. Plugins are small, composable objects that follow a
              single{" "}
              <code className="mono text-[0.9em]">ThemePlugin</code> interface.
            </>
          }
        />

        <section id="what-is-a-plugin" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="A plugin is an object with a name, an optional version and priority, and any combination of lifecycle hooks."
          >
            What is a Plugin?
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Every plugin implements the{" "}
            <code className="mono text-[0.9em]">ThemePlugin</code> interface.
            At minimum, a plugin needs a <code className="mono text-[0.9em]">name</code>{" "}
            — everything else is optional. Plugins are registered when the
            runtime is created and can be managed dynamically via the{" "}
            <code className="mono text-[0.9em]">PluginManager</code>.
          </p>
          <CodeBlock
            html={highlightCode(basicPluginSnippet.code, "ts")}
            code={basicPluginSnippet.code}
            language="ts"
            filename={basicPluginSnippet.title}
            className="m-0"
          />
        </section>

        <section id="hooks" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Lifecycle hooks fire at predictable points during the theme runtime's lifetime."
          >
            Plugin Hooks
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            {[
              {
                name: "onRuntimeCreated",
                desc: "Called once when the runtime finishes initialization.",
              },
              {
                name: "onBeforeThemeChange",
                desc: "Fires before the active theme switches.",
              },
              {
                name: "onAfterThemeChange",
                desc: "Fires after the new theme is active.",
              },
              {
                name: "onBeforePersist",
                desc: "Fires before the selection is saved.",
              },
              {
                name: "onAfterPersist",
                desc: "Fires after the selection has been persisted.",
              },
              {
                name: "onBeforeApply",
                desc: "Fires before CSS variables are written to the DOM.",
              },
              {
                name: "onAfterApply",
                desc: "Fires after CSS variables have been applied.",
              },
              {
                name: "onDestroy",
                desc: "Called when the runtime is destroyed.",
              },
            ].map((hook) => (
              <div key={hook.name} className="rounded-xl border border-border p-4">
                <code className="mono text-[0.9em] font-semibold">
                  {hook.name}
                </code>
                <p className="text-xs opacity-60 leading-relaxed mt-2">
                  {hook.desc}
                </p>
              </div>
            ))}
          </div>
          <CodeBlock
            html={highlightCode(hooksSnippet.code, "ts")}
            code={hooksSnippet.code}
            language="ts"
            filename={hooksSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>onRuntimeCreated can return a teardown</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            If the hook returns a function, it will be called when the runtime
            is destroyed — useful for cleaning up subscriptions.
          </Callout>
        </section>

        <section id="token-transforms" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Transform tokens before they reach the DOM — override, augment, or remap any token path."
          >
            Token Transforms
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The <code className="mono text-[0.9em]">transformTokens</code> hook
            receives the full token object and the current theme, and must
            return the (potentially modified) tokens. Multiple transform plugins
            chain in priority order — each receives the output of the previous.
          </p>
          <CodeBlock
            html={highlightCode(transformSnippet.code, "ts")}
            code={transformSnippet.code}
            language="ts"
            filename={transformSnippet.title}
            className="m-0"
          />
        </section>

        <section id="priority" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="The priority field controls plugin execution order — lower values run first."
          >
            Priority &amp; Ordering
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5 mb-3">
            <li>
              <code className="mono text-[0.9em]">priority</code> defaults to{" "}
              <code className="mono text-[0.9em]">10</code> when omitted.
            </li>
            <li>
              Lower values execute first — a plugin with priority{" "}
              <code className="mono text-[0.9em]">0</code> runs before one with{" "}
              <code className="mono text-[0.9em]">10</code>.
            </li>
            <li>
              Plugins with the same priority run in registration order.
            </li>
            <li>
              <code className="mono text-[0.9em]">transformTokens</code> hooks
              chain in priority order — each plugin sees the previous output.
            </li>
          </ul>
          <CodeBlock
            html={highlightCode(prioritySnippet.code, "ts")}
            code={prioritySnippet.code}
            language="ts"
            filename={prioritySnippet.title}
            className="m-0"
          />
        </section>

        <section id="runtime-integration" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="Manage plugins at runtime with the PluginManager — register, look up, remove, and destroy."
          >
            Runtime Integration
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Plugins are passed at runtime creation via the{" "}
            <code className="mono text-[0.9em]">plugins</code> option. For
            dynamic management, use{" "}
            <code className="mono text-[0.9em]">createPluginManager()</code>{" "}
            to create a standalone manager, or call{" "}
            <code className="mono text-[0.9em]">runtime.destroy()</code> to
            tear down all registered plugins.
          </p>
          <CodeBlock
            html={highlightCode(runtimeSnippet.code, "ts")}
            code={runtimeSnippet.code}
            language="ts"
            filename={runtimeSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Duplicate names are skipped</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Registering a plugin with a name that is already registered logs a
            warning and returns a no-op unsubscribe function.
          </Callout>
        </section>

        <section id="full-example" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="A complete plugin that dispatches custom events on theme changes and boosts contrast on dark tokens."
          >
            Full Example
          </SectionHeading>
          <CodeBlock
            html={highlightCode(fullExampleSnippet.code, "ts")}
            code={fullExampleSnippet.code}
            language="ts"
            filename={fullExampleSnippet.title}
            className="m-0"
          />
        </section>
      </div>
    </DocsLayout>
  );
}
