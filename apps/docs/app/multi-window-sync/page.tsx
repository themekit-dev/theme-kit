import type { Metadata } from "next";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";

export const metadata: Metadata = {
  title: "Multi-Window Sync",
  description:
    "How Theme Kit synchronizes theme selection across browser tabs and windows using BroadcastChannel, SharedWorker, and StorageEvent fallbacks.",
};

const broadcastSyncSnippet = {
  lang: "ts",
  title: "core — BroadcastChannel (default adapter)",
  code: `import { createMultiWindowSync } from "@theme-kit/core";

const sync = createMultiWindowSync({
  prefer: "auto", // "broadcast" | "sharedworker" | "auto"
  onFallback(strategy) {
    console.warn("Falling back:", strategy);
  },
});

// Every tab receives the update
sync.subscribe((selection) => {
  console.log("Theme changed in another tab:", selection);
});

// Post a change — all other tabs update instantly
sync.post({ mode: "dark", family: "slate" });`,
};

const broadcastAdapterSnippet = {
  lang: "ts",
  title: "core — createThemeSelectionBroadcast directly",
  code: `import { createThemeSelectionBroadcast } from "@theme-kit/core";

const channel = createThemeSelectionBroadcast({
  channelName: "my-app-theme",
});

if (channel) {
  channel.post({ mode: "dark", family: "slate" });

  channel.subscribe((state) => {
    // state.family and state.mode are both available
    applyTheme(state);
  });
}`,
};

const storageEventSnippet = {
  lang: "ts",
  title: "core — StorageEvent fallback",
  code: `import { createStorageEventSync } from "@theme-kit/core";

// Uses localStorage "storage" event to sync across tabs
// Works in all browsers, no BroadcastChannel needed
const sync = createStorageEventSync("theme-selection-state");

sync.post({ mode: "dark", family: "slate" });

sync.subscribe((selection) => {
  // Fires in other tabs when localStorage changes
  runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
});`,
};

const sharedWorkerSnippet = {
  lang: "ts",
  title: "core — SharedWorker bridge",
  code: `import { createMultiWindowSync } from "@theme-kit/core";

// Falls back to SharedWorker if BroadcastChannel is blocked
const sync = createMultiWindowSync({ prefer: "sharedworker" });

sync.subscribe((selection) => {
  runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
});`,
};

const reactSnippet = {
  lang: "tsx",
  title: "React — useMultiWindowSync hook",
  code: `import { useEffect } from "react";
import { createMultiWindowSync } from "@theme-kit/core";

export function useMultiWindowSync(runtime) {
  useEffect(() => {
    const sync = createMultiWindowSync();

    const unsub = sync.subscribe((selection) => {
      runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
    });

    return () => {
      unsub();
      sync.destroy();
    };
  }, [runtime]);
}`,
};

const vueSnippet = {
  lang: "ts",
  title: "Vue — composable",
  code: `import { onMounted, onUnmounted } from "vue";
import { createMultiWindowSync } from "@theme-kit/core";

export function useMultiWindowSync(runtime) {
  let sync;
  let unsub;

  onMounted(() => {
    sync = createMultiWindowSync();
    unsub = sync.subscribe((selection) => {
      runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
    });
  });

  onUnmounted(() => {
    unsub?.();
    sync?.destroy();
  });
}`,
};

const svelteSnippet = {
  lang: "ts",
  title: "Svelte — onMount action",
  code: `import { onMount, onDestroy } from "svelte";
import { createMultiWindowSync } from "@theme-kit/core";

export function syncTheme(runtime) {
  let sync;
  let unsub;

  onMount(() => {
    sync = createMultiWindowSync();
    unsub = sync.subscribe((selection) => {
      runtime.selection.setMode(selection.mode);
  runtime.selection.setFamily(selection.family);
    });
  });

  onDestroy(() => {
    unsub?.();
    sync?.destroy();
  });
}`,
};

const customChannelSnippet = {
  lang: "ts",
  title: "core — isolated channel names",
  code: `import { createMultiWindowSync } from "@theme-kit/core";

// Two separate scopes — admin panel vs. storefront
const adminSync = createMultiWindowSync({
  channelName: "admin-theme",
});

const storeSync = createMultiWindowSync({
  channelName: "storefront-theme",
});

// Changing admin theme does NOT affect storefront tabs
adminSync.post({ mode: "dark", family: "slate" });
storeSync.post({ mode: "light", family: "neutral" });`,
};

export default function MultiWindowSyncPage() {
  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <PageHeader
          eyebrow="Multi-Window Sync"
          title="One theme across every tab"
          description={
            <>
              When a user changes the theme in one tab, every other open tab
              should reflect the change instantly. Theme Kit provides adapters
              that handle cross-tab synchronization with automatic fallbacks —
              no manual <code className="mono text-[0.9em]">localStorage</code> listener
              wiring required.
            </>
          }
        />

        <section id="problem" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="Each browser tab runs its own runtime instance — without synchronization the selections drift apart."
          >
            The Problem
          </SectionHeading>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1.5">
            <li>
              Each tab creates its own{" "}
              <code className="mono text-[0.9em]">ThemeRuntime</code> with
              independent state. A theme switch in tab A does not propagate to
              tab B.
            </li>
            <li>
              The persistence adapter stores the selection in{" "}
              <code className="mono text-[0.9em]">localStorage</code>, but
              reading it only happens at bootstrap — tabs opened after a change
              get the right theme, but tabs already open stay stale.
            </li>
            <li>
              Users expect consistency: switching to dark mode in one tab
              should darken all tabs. Without sync they see a jarring split
              where half the UI is dark and half is light.
            </li>
            <li>
              Race conditions are possible if multiple tabs write to storage
              simultaneously — the sync adapters serialize updates through a
              single channel.
            </li>
          </ul>
        </section>

        <section id="broadcast" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="BroadcastChannel is the default transport — messages reach every same-origin tab without touching the DOM."
          >
            BroadcastChannel
          </SectionHeading>
          <div className="text-sm opacity-80 leading-relaxed mb-3">
            <code className="mono text-[0.9em]">createMultiWindowSync</code>{" "}
            tries{" "}
            <code className="mono text-[0.9em]">BroadcastChannel</code> first.
            If the browser supports it (all modern browsers do), every{" "}
            <code className="mono text-[0.9em]">.post()</code> call is
            broadcast to all other tabs on the same origin that have subscribed
            to the same channel name.
          </div>
          <CodeBlock
            html={highlightCode(broadcastSyncSnippet.code, "ts")}
            code={broadcastSyncSnippet.code}
            language="ts"
            filename={broadcastSyncSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>Channel name defaults to &quot;theme-selection&quot;</strong>{" "}
            <span className="mx-1 opacity-40">|</span>{" "}
            Pass{" "}
            <code className="mono text-[0.9em]">{"{ channelName: 'admin' }"}</code>{" "}
            to isolate scopes — see Custom Channels below.
          </Callout>
          <div className="mt-3 text-sm opacity-80 leading-relaxed mb-3">
            If you need the raw broadcast adapter without the auto-fallback
            logic, use{" "}
            <code className="mono text-[0.9em]">
              createThemeSelectionBroadcast
            </code>{" "}
            directly:
          </div>
          <CodeBlock
            html={highlightCode(broadcastAdapterSnippet.code, "ts")}
            code={broadcastAdapterSnippet.code}
            language="ts"
            filename={broadcastAdapterSnippet.title}
            className="m-0"
          />
        </section>

        <section id="storage-fallback" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="For environments where BroadcastChannel is blocked (some WebView contexts, older browsers), a localStorage-based fallback keeps everything in sync."
          >
            StorageEvent Fallback
          </SectionHeading>
          <div className="text-sm opacity-80 leading-relaxed mb-3">
            When{" "}
            <code className="mono text-[0.9em]">BroadcastChannel</code> is
            unavailable, Theme Kit falls back to writing the selection to{" "}
            <code className="mono text-[0.9em]">localStorage</code> and
            listening for the browser&apos;s native{" "}
            <code className="mono text-[0.9em]">storage</code> event. This
            event fires in every other tab whenever{" "}
            <code className="mono text-[0.9em]">localStorage</code> is
            modified — effectively giving you cross-tab messaging through the
            storage API.
          </div>
          <CodeBlock
            html={highlightCode(storageEventSnippet.code, "ts")}
            code={storageEventSnippet.code}
            language="ts"
            filename={storageEventSnippet.title}
            className="m-0"
          />
          <Callout className="mt-3">
            <strong>StorageEvent only fires in other tabs</strong>{" "}
            <span className="mx-1 opacity-40">|</span>{" "}
            The writing tab does not receive its own storage event. The sync
            adapter applies the change locally when{" "}
            <code className="mono text-[0.9em]">.post()</code> is called,
            before writing to storage.
          </Callout>
        </section>

        <section id="cross-tab-persistence" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="localStorage is the persistence layer — the sync adapters react to storage changes and push updates into the runtime."
          >
            Cross-Tab Persistence
          </SectionHeading>
          <div className="text-sm opacity-80 leading-relaxed mb-3">
            Persistence and sync work together but solve different problems:
          </div>
          <div className="rounded-xl border border-border overflow-hidden mb-3">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
              Persistence vs. Sync
            </div>
            <div className="p-4 flex flex-col gap-2 text-sm">
              {[
                ["Persistence", "Survives page reload — reads from localStorage at bootstrap"],
                ["Sync", "Propagates changes while the app is running — reacts to storage events or BroadcastChannel messages"],
                ["Together", "A theme change is written to storage (persistence) and broadcast to other tabs (sync) in the same tick"],
              ].map(([label, desc]) => (
                <div key={label} className="flex gap-3 items-start text-sm opacity-75">
                  <span className="font-semibold shrink-0 w-24">{label}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm opacity-80 leading-relaxed">
            The{" "}
            <code className="mono text-[0.9em]">ThemeSelectionState</code>{" "}
            object contains both{" "}
            <code className="mono text-[0.9em]">mode</code> (light/dark/system)
            and <code className="mono text-[0.9em]">family</code> (the color
            palette). Both values are synchronized — switching palettes in one
            tab switches palettes in every tab.
          </div>
        </section>

        <section id="frameworks" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="A thin hook or composable wraps the adapter lifecycle — mount creates, unmount destroys."
          >
            Setup in Every Framework
          </SectionHeading>
          <div className="text-sm opacity-80 leading-relaxed mb-3">
            The pattern is the same across frameworks: create the sync adapter
            on mount, subscribe to incoming changes, and clean up on unmount.
          </div>
          <div className="space-y-3">
            <CodeBlock
              html={highlightCode(reactSnippet.code, "tsx")}
              code={reactSnippet.code}
              language="tsx"
              filename={reactSnippet.title}
              className="m-0"
            />
            <CodeBlock
              html={highlightCode(vueSnippet.code, "ts")}
              code={vueSnippet.code}
              language="ts"
              filename={vueSnippet.title}
              className="m-0"
            />
            <CodeBlock
              html={highlightCode(svelteSnippet.code, "ts")}
              code={svelteSnippet.code}
              language="ts"
              filename={svelteSnippet.title}
              className="m-0"
            />
          </div>
          <Callout className="mt-3">
            <strong>SharedWorker is also an option</strong>{" "}
            <span className="mx-1 opacity-40">|</span>{" "}
            If you set{" "}
            <code className="mono text-[0.9em]">{"{ prefer: 'sharedworker' }"}</code>,
            the adapter uses a{" "}
            <code className="mono text-[0.9em]">SharedWorker</code> instead of{" "}
            <code className="mono text-[0.9em]">BroadcastChannel</code>.
            Useful in contexts where BroadcastChannel messages are throttled.
          </Callout>
        </section>

        <section id="custom-channels" className="scroll-mt-24">
          <SectionHeading
            num={6}
            desc="Different channel names create isolated sync scopes — admin and storefront can maintain independent theme selections."
          >
            Custom Channels
          </SectionHeading>
          <div className="text-sm opacity-80 leading-relaxed mb-3">
            By default all tabs share the{" "}
            <code className="mono text-[0.9em]">theme-selection</code> channel.
            If your app has multiple independently-themed regions (admin panel,
            embedded widget, storefront), give each one a unique channel name.
            Messages on different channels never cross.
          </div>
          <CodeBlock
            html={highlightCode(customChannelSnippet.code, "ts")}
            code={customChannelSnippet.code}
            language="ts"
            filename={customChannelSnippet.title}
            className="m-0"
          />
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/accessibility"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Accessibility</div>
                <div className="text-xs opacity-60">
                  Focus rings, reduced-motion, and color-scheme sync.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </a>
            <a
              href="/persistence"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Persistence</div>
                <div className="text-xs opacity-60">
                  localStorage adapters that survive page reload.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </a>
            <a
              href="/zero-flash"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Zero Flash</div>
                <div className="text-xs opacity-60">
                  How the first paint already matches the user.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </a>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
