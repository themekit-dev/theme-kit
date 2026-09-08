import type { ReactElement } from "react";
import { CodeBlock } from "../code-block";
import { Callout } from "../ui/callout";
import { highlightCode } from "../../lib/highlight";
import type { FrameworkItem, FrameworkSnippet } from "../../lib/frameworks";

function pre({ children }: { children: string }) {
  return (
    <pre
      aria-hidden="true"
      className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground/80"
    >
      {children}
    </pre>
  );
}

function snippetBlock(snippet: FrameworkSnippet) {
  return (
    <CodeBlock
      html={highlightCode(snippet.code, snippet.lang)}
      code={snippet.code}
      language={snippet.lang}
      filename={snippet.title}
      className="rounded-lg m-0"
    />
  );
}

const NORMAL_DIAGRAM = `createRoot()
   ↓
ThemeProvider
   ↓
App`;

const OPTIMIZED_DIAGRAM = `createThemeRoot()
   ↓
createRoot()
   ↓
synchronous initial commit (flushSync)
   ↓
ThemeProvider
   ↓
App`;

const SSR_DIAGRAM = `framework root / hydration
   ↓
Theme Kit integration  (@theme-kit/next | @theme-kit/remix)
   ↓
App`;

const RUNTIME_COMPOSITION = `Theme Kit runtime (runtime)
   ↓
MUI theme            (createMuiTheme(runtime))
   ↓
MUI provider         (<MuiThemeProvider>)
   ↓
App`;

/**
 * "Which React setup should I use?" — shown near the top of the React guide.
 */
export function WhichReactSetupPanel() {
  const rows: { title: string; use: string; meta: string; tone: string }[] = [
    {
      title: "Standard application",
      use: "Use <ThemeProvider>",
      meta: "Recommended",
      tone: "text-foreground",
    },
    {
      title: "CSR first-commit optimization",
      use: "Use createThemeRoot()",
      meta: "Advanced / opt-in",
      tone: "text-foreground/80",
    },
    {
      title: "Next.js / Remix",
      use: "Use the framework integration",
      meta: "Don't manage the root yourself",
      tone: "text-foreground/80",
    },
  ];

  return (
    <section id="which-react-setup" className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight">
        Which React setup should I use?
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.title}
            className="rounded-xl border border-border bg-muted/40 p-4"
          >
            <div className={`text-sm font-semibold ${row.tone}`}>
              {row.title}
            </div>
            <code className="mt-1 block font-mono text-[0.85em] text-foreground">
              {row.use}
            </code>
            <div className="mt-2 block text-xs opacity-60">{row.meta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * "Optimized CSR bootstrap" — the createThemeRoot deep-dive on the React guide.
 * Renders snippet3 once, plus diagrams, a multi-provider composition, the
 * "when does it matter" callout, the CSR-only note and the flushSync rationale.
 */
export function OptimizedCsrBootstrap(framework: FrameworkItem): ReactElement {
  const multiProvider = `// main.tsx — composition stays fully in your hands
import { createThemeRoot } from "@theme-kit/react";
import { createMuiTheme } from "@theme-kit/mui/factory";
import { MuiThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { themes } from "./themes";
import App from "./App";

createThemeRoot({
  container: document.getElementById("root")!,
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",

  render: ({ runtime }) => (
    <MuiThemeProvider theme={createMuiTheme(runtime)}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MuiThemeProvider>
  ),
});`;

  return (
    <section id="optimized-csr-bootstrap" className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight">
        Optimized CSR bootstrap
      </h2>
      <p className="text-sm leading-relaxed opacity-80 mb-3">
        React&apos;s <code className="mono text-[0.9em]">createRoot().render()</code>{" "}
        may schedule the initial commit concurrently. In client-only applications
        where a delayed first commit creates a visible startup jerk, Theme Kit
        provides <code className="mono text-[0.9em]">createThemeRoot()</code> as
        an opt-in root bootstrap. Most applications should continue using{" "}
        <code className="mono text-[0.9em]">&lt;ThemeProvider&gt;</code> directly
        — this is a specialized tool, not a requirement.
      </p>

      <div className="mt-4">
        {framework.snippet3 ? snippetBlock(framework.snippet3) : null}
      </div>

      <Callout
        className="mt-3"
        title="ThemeProvider vs createThemeRoot"
      >
        <code className="mono text-[0.9em]">ThemeProvider</code> is the normal
        React integration. <code className="mono text-[0.9em]">createThemeRoot()</code>{" "}
        is an optional root-level bootstrap that owns the root boundary.
      </Callout>

      <h3 className="mt-6 text-sm font-semibold">
        When does createThemeRoot() matter?
      </h3>
      <p className="text-sm leading-relaxed opacity-80 mb-3">
        Use it when you have measured a visible first-render scheduling gap in a
        client-only React application. It is an opt-in behavior, not a
        requirement for ordinary Theme Kit usage.
      </p>

      <h3 className="text-sm font-semibold">Architecture</h3>
      <p className="text-sm leading-relaxed opacity-80 mb-1">
        Normal React (recommended for most apps):
      </p>
      {pre({ children: NORMAL_DIAGRAM })}
      <p className="text-sm leading-relaxed opacity-80 mb-1 mt-3">
        Optimized CSR bootstrap:
      </p>
      {pre({ children: OPTIMIZED_DIAGRAM })}
      <p className="text-sm leading-relaxed opacity-80 mb-1 mt-3">
        SSR frameworks:
      </p>
      {pre({ children: SSR_DIAGRAM })}

      <h3 className="mt-6 text-sm font-semibold">
        Composition stays yours
      </h3>
      <p className="text-sm leading-relaxed opacity-80 mb-3">
        <code className="mono text-[0.9em]">createThemeRoot()</code> does not own
        application composition. It owns the root; the{" "}
        <code className="mono text-[0.9em]">render({"{ runtime }"})</code> callback
        owns the tree, so arbitrary providers (MUI, Chakra, React Query, Redux,
        Router, …) compose freely and can derive their configuration from the
        Theme Kit runtime:
      </p>
      {pre({ children: RUNTIME_COMPOSITION })}
      <div className="mt-2">
        {snippetBlock({ title: "main.tsx", lang: "tsx", code: multiProvider })}
      </div>

      <h3 className="mt-6 text-sm font-semibold">
        Why doesn&apos;t ThemeProvider call flushSync()?
      </h3>
      <p className="text-sm leading-relaxed opacity-80 mb-3">
        <code className="mono text-[0.9em]">ThemeProvider</code> lives inside the
        React root. It cannot change how the owning root was scheduled, and calling{" "}
        <code className="mono text-[0.9em]">flushSync()</code> from inside the
        provider would couple the component to React&apos;s root scheduling
        semantics. <code className="mono text-[0.9em]">createThemeRoot()</code>{" "}
        exists specifically so the root-level behavior can be controlled at the
        correct boundary.
      </p>

      <Callout variant="neutral" title="CSR only">
        <code className="mono text-[0.9em]">createThemeRoot()</code> is intended
        for client-rendered React applications. Framework integrations such as
        Next.js and Remix own their application root/hydration lifecycle and
        should use their framework-specific Theme Kit integration instead.
      </Callout>
    </section>
  );
}