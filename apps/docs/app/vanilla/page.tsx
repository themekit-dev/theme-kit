import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "Framework-Free",
  description:
    "Use Theme Kit without React, Vue, or Svelte — a single ThemeKit class gives you mode switching, family selection, CSS variable binding, and localStorage persistence.",
};

const initSnippet = {
  lang: "ts",
  title: "basic setup",
  code: `import { ThemeKit } from "@theme-kit/core/vanilla";

const kit = new ThemeKit({
  defaultTheme: "light",
});

// Or use the static shorthand
const kit = ThemeKit.init({ defaultTheme: "light" });`,
};

const readSnippet = {
  lang: "ts",
  title: "reading state",
  code: `// The full active theme definition (name, tokens, mode, etc.)
const current = kit.theme;

// The current mode: "light", "dark", or "system"
const mode = kit.mode;

// The current family: "default", "plum", "mint", …
const family = kit.family;

// All registered themes
const all = kit.themes;`,
};

const subscribeSnippet = {
  lang: "ts",
  title: "subscribing to changes",
  code: `// Fires when any theme change occurs
const unsub = kit.on("themeChange", (theme) => {
  console.log("New theme:", theme.name);
});

// Fires when only the mode changes
kit.on("modeChange", (mode) => {
  console.log("Mode:", mode);
});

// Fires when only the family changes
kit.on("familyChange", (family) => {
  console.log("Family:", family);
});

// Later — clean up
unsub();`,
};

const switchSnippet = {
  lang: "ts",
  title: "switching themes",
  code: `// Switch mode — persisted to localStorage automatically
kit.setMode("dark");
kit.setMode("light");
kit.setMode("system");

// Switch family
kit.setFamily("plum");
kit.setFamily("mint");

// Toggle between light and dark (ignores "system")
kit.toggleTheme();`,
};

const domSnippet = {
  lang: "ts",
  title: "manual CSS variable binding",
  code: `// By default ThemeKit binds CSS variables to <html> automatically.
// To target a specific element instead:
const kit = new ThemeKit({ target: document.getElementById("app") });

// Get a flat map of CSS custom properties for the current theme
const vars = kit.toCSSVariables();
// → { "--theme-color-primary": "#7c3aed", … }

// Update individual tokens at runtime
kit.update({ colors: { primary: "#10b981" } });`,
};

const persistSnippet = {
  lang: "ts",
  title: "persistence",
  code: `// Persistence is automatic — mode and family are saved to
// localStorage on every change and restored on init.

// To write the current selection explicitly (useful if you
// defer setup or change persistence strategy):
kit.setMode("dark");
kit.setFamily("plum");
// ^ already persisted — no extra call needed

// To access the persisted values before instantiating:
const saved = JSON.parse(localStorage.getItem("theme-kit") ?? "{}");
console.log(saved.mode, saved.family);`,
};

const fullHtmlSnippet = {
  lang: "html",
  title: "full HTML page",
  code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Theme Kit — Vanilla</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 2rem;
      background: var(--theme-color-background);
      color: var(--theme-color-foreground);
    }
    button {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--theme-color-border);
      background: var(--theme-color-card);
      color: var(--theme-color-foreground);
      cursor: pointer;
    }
    button:hover { border-color: var(--theme-color-primary); }
    .active { border-color: var(--theme-color-primary); font-weight: 600; }
  </style>
</head>
<body>
  <h1>Theme Kit — Vanilla</h1>
  <div id="controls" style="display:flex;gap:0.5rem;margin-bottom:1.5rem">
    <button data-mode="light">Light</button>
    <button data-mode="dark">Dark</button>
    <button data-mode="system">System</button>
    <button data-family="default">Default</button>
    <button data-family="plum">Plum</button>
  </div>
  <p id="status"></p>

  <script type="module">
    import { ThemeKit } from "https://esm.sh/@theme-kit/core/vanilla";

    const kit = ThemeKit.init({ defaultTheme: "light" });

    const status = document.getElementById("status");
    const render = () => {
      status.textContent =
        "Mode: " + kit.mode + " — Family: " + kit.family +
        " — Theme: " + kit.theme.name;
      document.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === kit.mode);
      });
      document.querySelectorAll("[data-family]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.family === kit.family);
      });
    };

    document.getElementById("controls").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.mode) kit.setMode(btn.dataset.mode);
      if (btn.dataset.family) kit.setFamily(btn.dataset.family);
    });

    kit.on("themeChange", render);
    render();
  </script>
</body>
</html>`,
};

export default function VanillaPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Vanilla"
          title="Framework-free theming"
          description={
            <>
              No React, no Vue, no Svelte — just a{" "}
              <code className="mono text-[0.9em]">ThemeKit</code> class.
              Drop it into any HTML page or plain-JS project and get mode
              switching, family selection, CSS variable binding, and
              localStorage persistence out of the box.
            </>
          }
        />

        <section id="why" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="When your page is a plain HTML file, a server-rendered template, or a framework that Theme Kit doesn't ship an adapter for."
          >
            Why Vanilla?
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              You have a static HTML page, WordPress theme, or PHP template
              that doesn't use a JavaScript framework.
            </li>
            <li>
              You want the lightest possible integration — one import, one
              class, no build step required.
            </li>
            <li>
              You're embedding theme controls inside an admin panel, docs site,
              or embedded widget.
            </li>
            <li>
              The runtime is identical to what the React/Vue/Svelte adapters
              use internally — same persistence, same token resolution, same
              family logic.
            </li>
          </ul>
        </section>

        <section id="init" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Import the class, pass your options, and the instance handles everything — DOM binding, persistence, and event emission."
          >
            The ThemeKit class
          </SectionHeading>
          <CodeBlock
            html={highlightCode(initSnippet.code, "ts")}
            code={initSnippet.code}
            language="ts"
            filename={initSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Static shorthand</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            <code className="mono text-[0.9em]">ThemeKit.init(options)</code>{" "}
            is identical to{" "}
            <code className="mono text-[0.9em]">new ThemeKit(options)</code>{" "}
            — pick whichever reads better.
          </Callout>
        </section>

        <section id="read" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Synchronous getters expose the active theme, its mode, and its family — plus a reactive event system."
          >
            Reading the active theme
          </SectionHeading>
          <CodeBlock
            html={highlightCode(readSnippet.code, "ts")}
            code={readSnippet.code}
            language="ts"
            filename={readSnippet.title}
            className="m-0"
          />
          <CodeBlock
            html={highlightCode(subscribeSnippet.code, "ts")}
            code={subscribeSnippet.code}
            language="ts"
            filename={subscribeSnippet.title}
            className="m-0 mt-3"
          />
        </section>

        <section id="switch" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Switch mode, switch family, or toggle — every change is persisted and emits the appropriate event."
          >
            Switching themes
          </SectionHeading>
          <CodeBlock
            html={highlightCode(switchSnippet.code, "ts")}
            code={switchSnippet.code}
            language="ts"
            filename={switchSnippet.title}
            className="m-0"
          />
        </section>

        <section id="dom" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="ThemeKit automatically writes CSS custom properties and a data-theme attribute to the target element. You can also read or apply them manually."
          >
            DOM binding
          </SectionHeading>
          <CodeBlock
            html={highlightCode(domSnippet.code, "ts")}
            code={domSnippet.code}
            language="ts"
            filename={domSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>What happens automatically</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            On every theme change, the target element gets{" "}
            <code className="mono text-[0.9em]">data-theme="…"</code>,{" "}
            <code className="mono text-[0.9em]">color-scheme</code>, and
            every <code className="mono text-[0.9em]">--theme-*</code> CSS
            custom property updated — no manual wiring needed.
          </Callout>
        </section>

        <section id="persist" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="Mode and family are persisted to localStorage on every change and automatically restored when a new instance is created."
          >
            Persistence
          </SectionHeading>
          <CodeBlock
            html={highlightCode(persistSnippet.code, "ts")}
            code={persistSnippet.code}
            language="ts"
            filename={persistSnippet.title}
            className="m-0"
          />
        </section>

        <section id="full-example" className="scroll-mt-24">
          <SectionHeading
            num={7}
            desc="A complete HTML page with a working theme switcher — save it as index.html and open it in a browser."
          >
            Full HTML example
          </SectionHeading>
          <CodeBlock
            html={highlightCode(fullHtmlSnippet.code, "html")}
            code={fullHtmlSnippet.code}
            language="html"
            filename={fullHtmlSnippet.title}
            className="m-0"
          />
        </section>
      </div>
    </DocsLayout>
  );
}
