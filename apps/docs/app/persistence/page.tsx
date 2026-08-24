import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import { buildPageHeadings } from "../../lib/toc";

export const metadata: Metadata = {
  title: "Persistence",
  description:
    "How Theme Kit persists theme selection across visits: localStorage, custom adapters, cookie-based server-side persistence, and disabling persistence entirely.",
};

const howItWorksSnippet = {
  lang: "ts",
  title: "core — default persistence with the plugin",
  code: `import { createPersistencePlugin } from "@theme-kit/core";

// The persistence plugin writes the full selection state
// (mode + family) to localStorage under "theme-selection".
const persistence = createPersistencePlugin();

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  plugins: [persistence],
});

// On startup the plugin reads the saved state — if a returning
// user picked "dark" + "corporate" last visit, the runtime
// already resolves to that theme before the first paint.`,
};

const storageKeySnippet = {
  lang: "ts",
  title: "runtime — custom storage key",
  code: `// Pass a custom key to avoid collisions with other
// apps on the same origin.
const runtime = createThemeRuntime({
  themes,
  plugins: [createPersistencePlugin({ key: "my-app-theme" })],
});`,
};

const customAdapterSnippet = {
  lang: "ts",
  title: "custom — sessionStorage adapter",
  code: `import type { ThemeSelectionPersistenceAdapter } from "@theme-kit/core";

function createSessionStoragePersistence(
  key = "theme-selection",
): ThemeSelectionPersistenceAdapter {
  return {
    get() {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as ThemeSelectionState;
      } catch {
        return null;
      }
    },

    set(value) {
      sessionStorage.setItem(key, JSON.stringify(value));
    },

    remove() {
      sessionStorage.removeItem(key);
    },

    subscribe(listener) {
      // sessionStorage doesn't fire cross-tab storage events,
      // but we still implement the interface for consistency.
      return () => {};
    },
  };
}`,
};

const cookiesAdapterSnippet = {
  lang: "ts",
  title: "custom — cookie adapter",
  code: [
    `import type { ThemeSelectionPersistenceAdapter } from "@theme-kit/core";`,
    ``,
    `function parseCookies(header: string): Record<string, string> {`,
    `  return Object.fromEntries(`,
    `    header.split(";").map((c) => {`,
    `      const [k, ...v] = c.trim().split("=");`,
    `      return [k, decodeURIComponent(v.join("="))];`,
    `    }),`,
    `  );`,
    `}`,
    ``,
    `function createCookiePersistence(`,
    `  name = "theme-selection",`,
    `): ThemeSelectionPersistenceAdapter {`,
    `  return {`,
    `    get() {`,
    `      const cookies = parseCookies(document.cookie);`,
    `      const raw = cookies[name];`,
    `      if (!raw) return null;`,
    `      try {`,
    `        return JSON.parse(raw) as ThemeSelectionState;`,
    `      } catch {`,
    `        return null;`,
    `      }`,
    `    },`,
    ``,
    `    set(value) {`,
    `      document.cookie = \`\${name}=\${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=31536000; SameSite=Lax\`;`,
    `    },`,
    ``,
    `    remove() {`,
    `      document.cookie = \`\${name}=; path=/; max-age=0\`;`,
    `    },`,
    ``,
    `    subscribe(listener) {`,
    `      return () => {};`,
    `    },`,
    `  };`,
    `}`,
  ].join("\n"),
};

const urlHashSnippet = {
  lang: "ts",
  title: "custom — URL hash adapter",
  code: `import type { ThemeSelectionPersistenceAdapter } from "@theme-kit/core";

// Persist the theme in the URL hash so links share the state.
function createUrlHashPersistence(): ThemeSelectionPersistenceAdapter {
  return {
    get() {
      const hash = window.location.hash.slice(1);
      if (!hash) return null;
      const params = new URLSearchParams(hash);
      const mode = params.get("mode");
      const family = params.get("family");
      if (
        (mode === "light" || mode === "dark" || mode === "system") &&
        family
      ) {
        return { mode, family };
      }
      return null;
    },

    set(value) {
      const params = new URLSearchParams({
        mode: value.mode,
        family: value.family,
      });
      window.location.hash = params.toString();
    },

    remove() {
      history.replaceState(null, "", window.location.pathname);
    },

    subscribe(listener) {
      const handler = () => listener(null); // re-read on popstate
      window.addEventListener("popstate", handler);
      return () => window.removeEventListener("popstate", handler);
    },
  };
}`,
};

const serverSideSnippet = {
  lang: "tsx",
  title: "next.js — cookie-based server-side persistence",
  code: `// app/providers.tsx — client component
"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@theme-kit/react";
import type { ThemeSelectionState } from "@theme-kit/core";

export function Providers({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<ThemeSelectionState | null>(null);

  useEffect(() => {
    // Read the cookie on mount — no localStorage involved.
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("theme-selection="));

    if (cookie) {
      try {
        setSelection(JSON.parse(decodeURIComponent(cookie.split("=")[1])));
      } catch {}
    }
  }, []);

  return (
    <ThemeProvider
      defaultTheme="light"
      initialMode={selection?.mode}
      initialFamily={selection?.family}
    >
      {children}
    </ThemeProvider>
  );
}

// app/actions.ts — server action
"use server";

import { cookies } from "next/headers";

export async function saveThemeSelection(state: ThemeSelectionState) {
  const cookieStore = await cookies();
  cookieStore.set("theme-selection", JSON.stringify(state), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}`,
};

const disableSnippet = {
  lang: "ts",
  title: "core — disabling persistence",
  code: `const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
  // Pass null explicitly to disable persistence.
  persistence: null,

  // If you are using the plugin instead of the raw option,
  // simply omit it or pass an empty array.
  plugins: [],
});

// The runtime starts fresh every page load — no localStorage
// reads, no writes on theme change.`,
};

const vsSyncSnippet = {
  lang: "ts",
  title: "persistence vs. broadcast",
  code: `import {
  createThemeRuntime,
  createThemeSelectionBroadcast,
  createPersistencePlugin,
} from "@theme-kit/core";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",

  // Persistence: survives page reloads, writes to storage,
  // read once on init.
  plugins: [createPersistencePlugin()],

  // Broadcast: syncs across tabs in real-time, no storage
  // writes — messages travel through BroadcastChannel.
  broadcast: createThemeSelectionBroadcast(),
});

// Tab A picks "dark" + "ocean" at 2:00 PM.
// Tab B (already open) receives the broadcast → switches instantly.
//
// User closes both tabs, comes back tomorrow.
// Tab C opens → reads localStorage → lands on "dark" + "ocean".`,
};

// Headings render via SectionHeading (invisible to the layout's RSC walk).
const persistenceHeadings = buildPageHeadings([
  { text: "How persistence works", level: 2 },
  { text: "Storage keys", level: 2 },
  { text: "Custom adapters", level: 2 },
  { text: "Server-side persistence", level: 2 },
  { text: "Disabling persistence", level: 2 },
  { text: "Persistence vs. sync", level: 2 },
]);

export default function PersistencePage() {
  return (
    <DocsLayout headings={persistenceHeadings}>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Persistence"
          title="Remember the user's choice"
          description={
            <>
              Theme Kit remembers which theme the user picked so the next visit
              starts on the right one. Persistence is opt-in, pluggable, and
              designed to work alongside — not replace — cross-tab sync.
            </>
          }
        />

        <section id="how-it-works" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="The default behavior stores only the user's selection (mode + family), not the full theme definition."
          >
            How persistence works
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            When a persistence adapter is present, the runtime reads the saved
            state on initialization and writes every subsequent user choice.
            Only the selection metadata is stored — the actual theme tokens
            stay in your bundle and are resolved at runtime.
          </p>
          <CodeBlock
            html={highlightCode(howItWorksSnippet.code, "ts")}
            code={howItWorksSnippet.code}
            language="ts"
            filename={howItWorksSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Server-side rendering</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Persistence adapters are{" "}
            <code className="mono text-[0.9em]">null</code> on the server —
            no localStorage access during SSR. The default{" "}
            <code className="mono text-[0.9em]">initial</code> theme resolves
            first, then the client-side adapter takes over.
          </Callout>
        </section>

        <section id="storage-keys" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Customize the key under which the selection is stored to avoid collisions on shared origins."
          >
            Storage keys
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            By default the plugin uses{" "}
            <code className="mono text-[0.9em]">theme-selection</code> as the
            storage key. If multiple Theme Kit apps run on the same origin,
            pass a unique key to each one.
          </p>
          <CodeBlock
            html={highlightCode(storageKeySnippet.code, "ts")}
            code={storageKeySnippet.code}
            language="ts"
            filename={storageKeySnippet.title}
            className="m-0"
          />
        </section>

        <section id="custom-adapters" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Any object that implements ThemeSelectionPersistenceAdapter can be plugged in."
          >
            Custom adapters
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            The{" "}
            <code className="mono text-[0.9em]">
              ThemeSelectionPersistenceAdapter
            </code>{" "}
            interface is four methods:{" "}
            <code className="mono text-[0.9em]">get</code>,{" "}
            <code className="mono text-[0.9em]">set</code>,{" "}
            <code className="mono text-[0.9em]">remove</code>, and{" "}
            <code className="mono text-[0.9em]">subscribe</code>. Implement
            them against any storage backend.
          </p>

          <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
            sessionStorage — tab-scoped, cleared on close
          </div>
          <CodeBlock
            html={highlightCode(customAdapterSnippet.code, "ts")}
            code={customAdapterSnippet.code}
            language="ts"
            filename={customAdapterSnippet.title}
            className="m-0"
          />

          <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mt-6 mb-2">
            Cookies — survives incognito, works server-side
          </div>
          <CodeBlock
            html={highlightCode(cookiesAdapterSnippet.code, "ts")}
            code={cookiesAdapterSnippet.code}
            language="ts"
            filename={cookiesAdapterSnippet.title}
            className="m-0"
          />

          <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mt-6 mb-2">
            URL hash — shareable, bookmarkable
          </div>
          <CodeBlock
            html={highlightCode(urlHashSnippet.code, "ts")}
            code={urlHashSnippet.code}
            language="ts"
            filename={urlHashSnippet.title}
            className="m-0"
          />
        </section>

        <section id="server-side" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Use HTTP cookies to persist selection across environments where localStorage is unavailable."
          >
            Server-side persistence
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            In Next.js and other server-rendered frameworks, the initial
            render has no access to localStorage. Writing the selection to
            a cookie lets the server read it, apply the correct theme on the
            first paint, and pass it to the client runtime.
          </p>
          <CodeBlock
            html={highlightCode(serverSideSnippet.code, "tsx")}
            code={serverSideSnippet.code}
            language="tsx"
            filename={serverSideSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Zero-flash on return visits</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            The cookie is read server-side during SSR, so the page renders
            with the correct theme from the very first byte — no client-side
            flash.
          </Callout>
        </section>

        <section id="disabling" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="Pass null to the persistence option or omit the plugin entirely."
          >
            Disabling persistence
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-3">
            Some apps treat every visit as fresh — kiosk mode, demos, or
            situations where the default theme is always correct. Disable
            persistence by passing{" "}
            <code className="mono text-[0.9em]">null</code> to the runtime.
          </p>
          <CodeBlock
            html={highlightCode(disableSnippet.code, "ts")}
            code={disableSnippet.code}
            language="ts"
            filename={disableSnippet.title}
            className="m-0"
          />
        </section>

        <section id="persistence-vs-sync" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="Persistence and broadcast solve different problems — they are complementary, not competing."
          >
            Persistence vs. sync
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <div className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold mb-2">Persistence</div>
              <ul className="text-xs opacity-60 leading-relaxed list-disc pl-4 space-y-1">
                <li>Same browser, across visits</li>
                <li>Writes to storage on every change</li>
                <li>Read once on init</li>
                <li>Survives tab close and restart</li>
                <li>Backed by localStorage, cookies, etc.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold mb-2">Sync (broadcast)</div>
              <ul className="text-xs opacity-60 leading-relaxed list-disc pl-4 space-y-1">
                <li>Same browser, same moment</li>
                <li>No storage writes — in-memory messages</li>
                <li>Real-time across open tabs</li>
                <li>Lost on tab close</li>
                <li>Backed by BroadcastChannel</li>
              </ul>
            </div>
          </div>
          <CodeBlock
            html={highlightCode(vsSyncSnippet.code, "ts")}
            code={vsSyncSnippet.code}
            language="ts"
            filename={vsSyncSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Use both together</strong>{" "}
            <span className="mx-1 opacity-40">|</span>
            Broadcast syncs open tabs instantly; persistence makes the choice
            stick when a tab closes and reopens. They don't conflict.
          </Callout>
        </section>
      </div>
    </DocsLayout>
  );
}
