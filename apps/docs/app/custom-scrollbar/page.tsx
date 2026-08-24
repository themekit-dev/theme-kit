import type { Metadata } from "next";
import Link from "next/link";

import { DocsLayout } from "../../components/docs-layout";
import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/ui/page-header";
import { SectionHeading } from "../../components/ui/section-heading";
import { Callout } from "../../components/ui/callout";
import { highlightCode } from "../../lib/highlight";
import {
  ScrollbarFrameworkProvider,
  ScrollbarFrameworkSelector,
  ScrollbarFrameworkCode,
  MOUNT_SNIPPETS,
  OPTIONS_SNIPPETS,
  FLASHFREE_SNIPPETS,
  ARROW_SNIPPETS,
  CONTAINER_SNIPPETS,
} from "../../components/custom-scrollbar/scrollbar-framework";

export const metadata: Metadata = {
  title: "Custom Scrollbar",
  description:
    "Replace the default browser scrollbar with a theme-aware overlay that matches your design system — in any framework.",
};

function snippetBlock(snippet: { lang: string; title: string; code: string }) {
  return (
    <CodeBlock
      html={highlightCode(snippet.code, snippet.lang)}
      code={snippet.code}
      language={snippet.lang}
      className="rounded-lg m-0"
    />
  );
}

const cssImportSnippet = {
  lang: "css",
  title: "globals.css / app.css / style.css",
  code: `@import "@theme-kit/core/scrollbar.css";`,
};

const prePaintCSS = {
  lang: "css",
  title: "How it works",
  code: `/* Phase 1 — Bootstrap (before first paint):
   The @theme-kit/next ThemeProvider (or the bootstrap
   script in vanilla JS) adds the \`tk-scrollbar\` class
   to <html> and inlines this
   <style data-theme-kit-pre-paint="scrollbar"> in
   <head>. This hides native scrollbars immediately —
   no flash:

     html.tk-scrollbar,
     html.tk-scrollbar * {
       scrollbar-width: none;
       -ms-overflow-style: none;
     }
     html.tk-scrollbar *::-webkit-scrollbar {
       width: 0; height: 0;
     }

   Phase 2 — the engine: every managed container also gets
     data-theme-kit-scrollbar="overlay"
   so its native track is hidden while the custom overlay
   strips (position: fixed, marked data-theme-kit-host)
   are drawn over it. The browser still performs all
   scrolling; the overlay only represents it. */`,
};

const prePaintSnippet = {
  lang: "ts",
  title: "build-head.ts — pre-paint script",
  code: `import { createPrePaintScrollbarScript } from "@theme-kit/core";

// Called once in your server render or build step. The generated
// <script> is blocking, runs in <1ms, and is idempotent.
const head = [
  "<!doctype html>",
  "<html>",
  "  <head>",
  \`    <script>\${createPrePaintScrollbarScript()}</script>\`,
  '    <link rel="stylesheet" href="/scrollbar.css" />',
  "  </head>",
  "</html>",
  ].join("\\n");`,
};

const ssrCssSnippet = {
  lang: "ts",
  title: "SSR — inline the CSS instead of a script",
  code: `import { createPrePaintScrollbarCSS } from "@theme-kit/core";

// In your server-rendered <head>: hidden from the very first paint,
// no blocking <script>, and no hydration mismatches.
export function Head() {
  return (
    <head>
      <html lang="en" className="tk-scrollbar" />
      <style dangerouslySetInnerHTML={{ __html: createPrePaintScrollbarCSS() }} />
    </head>
  );
}`,
};

const vanillaSnippet = {
  lang: "ts",
  title: "Mount the overlay — vanilla JS",
  code: `import {
  createThemeRuntime,
  createThemeScrollbar,
} from "@theme-kit/core";
import "@theme-kit/core/scrollbar.css";
import themes from "./themes";

const runtime = createThemeRuntime({
  themes,
  defaultTheme: "light",
});

// One call mounts the overlay and discovers every scrollable container
// on the page. Returns an OverlayScrollbarHandle (or null on SSR /
// coarse-pointer devices).
const handle = createThemeScrollbar(runtime.store, {
  autoHide: true,
  arrows: true,
  thickness: 8,
  radius: 999,
});

// The strips recolor automatically when the theme changes.
runtime.selection.setMode("dark");`,
};

export default function CustomScrollbarPage() {
  return (
    <DocsLayout>
      <ScrollbarFrameworkProvider>
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
              <rect x="11" y="2" width="2" height="20" rx="1" />
              <rect x="4" y="6" width="4" height="12" rx="2" />
              <rect x="18" y="6" width="4" height="12" rx="2" />
            </svg>
          }
          title="Custom Scrollbar"
          subtitle="@theme-kit/core"
          description={
            <>
              Replace the browser&apos;s default scrollbar with a
              theme-aware overlay that matches your design system.
              Works on every framework — zero layout shift, no flash of
              native chrome. Import the scrollbar CSS once, then mount
              <code className="mono text-[0.9em]">ThemeScrollbar</code>{" "}
              anywhere in your app.
            </>
          }
        />

        <section id="frameworks" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={1}
            desc="ThemeScrollbar is not a demo — it is the overlay engine, mounted once in your app. Pick your framework below and every snippet on this page updates to match."
          >
            Pick your framework
          </SectionHeading>
          <ScrollbarFrameworkSelector scrollToId="quick-start" />
        </section>

        <section id="quick-start" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={2}
            desc="Import the scrollbar CSS, then mount ThemeScrollbar next to your app."
          >
            Quick start
          </SectionHeading>
          <ScrollbarFrameworkCode map={MOUNT_SNIPPETS} />
          <Callout className="mt-3">
            <strong>CSS import required</strong>
            <span className="mx-1 opacity-40">|</span>
            Add{" "}
            <code className="mono text-[0.9em]">
              @import "@theme-kit/core/scrollbar.css";
            </code>{" "}
            to your global stylesheet (
            <code className="mono text-[0.9em]">globals.css</code>
            , <code className="mono text-[0.9em]">app.css</code>
            , or <code className="mono text-[0.9em]">style.css</code>
            ). This brings in the pre-paint native-bar hiding and the
            overlay strip base styles.
          </Callout>
          {snippetBlock(cssImportSnippet)}
        </section>

        <section id="recommended-setup" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={3}
            desc="Where to place ThemeScrollbar, what configuration to use, and how it integrates with your theme."
          >
            Recommended setup
          </SectionHeading>

          <h3 className="text-base font-semibold mt-6 mb-3">
            Place ThemeScrollbar in the root layout
          </h3>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Mount <code className="mono text-[0.9em]">ThemeScrollbar</code>{" "}
            once in your root layout — not inside individual pages or
            components. The engine discovers every scrollable container on
            the page (including ones added later by client-side navigation),
            so a single mount covers the entire app.
          </p>

          <h3 className="text-base font-semibold mt-6 mb-3">
            Import the scrollbar CSS in your global stylesheet
          </h3>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Add the import to your global CSS file so the pre-paint native-bar
            hiding and overlay strip base styles are available before the first
            paint. This prevents a flash of native scrollbars on initial load.
          </p>

          <h3 className="text-base font-semibold mt-6 mb-3">
            Recommended configuration
          </h3>
          <div className="flex flex-col gap-2 text-sm opacity-80 leading-relaxed">
            <p>
              <strong className="opacity-100">autoHide</strong> — fades the
              strip after idle. Set to <code className="mono text-[0.9em]">false</code>{" "}
              if you want scrollbars always visible (e.g. on kiosk or
              accessibility-first setups).
            </p>
            <p>
              <strong className="opacity-100">autoHideDelay</strong> — idle time
              in ms before a revealed strip fades out. Default{" "}
              <code className="mono text-[0.9em]">900</code>. Only takes
              effect when <code className="mono text-[0.9em]">autoHide</code>{" "}
              is <code className="mono text-[0.9em]">true</code>.
            </p>
            <p>
              <strong className="opacity-100">thickness</strong> — resting thumb
              size. Increase for touch-friendly targets.
            </p>
            <p>
              <strong className="opacity-100">radius</strong> — set to{" "}
              <code className="mono text-[0.9em]">999</code> for a pill-shaped
              thumb that matches most design systems.
            </p>
            <p>
              <strong className="opacity-100">arrows</strong> — show arrow
              buttons at the ends of the track. Default{" "}
              <code className="mono text-[0.9em]">true</code>.
            </p>
            <p>
              <strong className="opacity-100">hoverExpand</strong> — grow the
              thumb on hover for easier targeting. Default{" "}
              <code className="mono text-[0.9em]">false</code>.
            </p>
          </div>

          <h3 className="text-base font-semibold mt-6 mb-3">
            How it integrates with your theme
          </h3>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            The overlay strips inherit your theme&apos;s colors automatically
            via CSS custom properties. No extra configuration is needed — the
            thumb, track, and arrows all pick up{" "}
            <code className="mono text-[0.9em]">--theme-color-*</code> tokens
            from the active theme. When you switch themes, the scrollbar
            updates instantly without re-mounting.
          </p>

          <h3 className="text-base font-semibold mt-6 mb-3">
            Best practices
          </h3>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1 mb-4">
            <li>
              Don&apos;t manually hide native scrollbars with{" "}
              <code className="mono text-[0.9em]">overflow: hidden</code> or{" "}
              <code className="mono text-[0.9em">::-webkit-scrollbar</code>{" "}
              CSS — the bootstrap handles this automatically via the{" "}
              <code className="mono text-[0.9em]">tk-scrollbar</code> class.
            </li>
            <li>
              Use <code className="mono text-[0.9em]">include</code> to scope
              the overlay to specific containers instead of the window when you
              only want custom scrollbars in certain areas.
            </li>
            <li>
              Use <code className="mono text-[0.9em]">appearance.include</code>{" "}
              and <code className="mono text-[0.9em]">appearance.exclude</code>{" "}
              for per-scrollbar configuration.
            </li>
            <li>
              Pass custom arrow icons via the{" "}
              <code className="mono text-[0.9em]">icons</code> group for
              framework-owned rendering (JSX, VNodes, etc.).
            </li>
          </ul>
        </section>

        <section id="zero-flash" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={4}
            desc="Hide the native bar before the first paint — only shown for frameworks that provide an SSR pre-paint hook."
          >
            Zero flash (SSR)
          </SectionHeading>
          <ScrollbarFrameworkCode
            map={FLASHFREE_SNIPPETS}
            fallback={
              <Callout>
                <strong>This framework doesn&apos;t provide SSR zero-flash</strong>
                <span className="mx-1 opacity-40">|</span>
                It renders client-side, so there&apos;s no server pre-paint hook.
                Hide the native bar before first paint with the blocking
                pre-paint script (see{" "}
                <code className="mono text-[0.9em]">Framework-agnostic</code>) or
                serve the page from an SSR framework (Next.js / Nuxt).
              </Callout>
            }
          />
          <Callout className="mt-3">
            <strong>Why this matters</strong>
            <span className="mx-1 opacity-40">|</span>
            Without pre-paint hiding, the browser paints the native scrollbar
            for a frame before the overlay engine mounts — a visible flash.
            The supported frameworks inline a tiny CSS block + the{" "}
            <code className="mono text-[0.9em]">tk-scrollbar</code> class during
            SSR (no blocking script, no hydration mismatch).
          </Callout>
        </section>

        <section id="options" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={5}
            desc="Every option is available as a flat top-level prop (flat wins over grouped) or organized into behavior, appearance, and icons groups. Pick your framework for the exact prop shape."
          >
            Options — grouped props API
          </SectionHeading>
          <ScrollbarFrameworkCode map={OPTIONS_SNIPPETS} />
          <Callout className="mt-3">
            <strong>Per-framework binding</strong>
            <span className="mx-1 opacity-40">|</span>
            JSX frameworks (React/Next/Solid/Remix) use object props; Vue/Nuxt
            use <code className="mono text-[0.9em]">:prop</code>; Svelte uses
            snippet attributes; Angular binds
            <code className="mono text-[0.9em]">[themeKitScrollbarOptions]</code>;
            Web Components use individual attributes; Vanilla JS uses a single
            options object on
            <code className="mono text-[0.9em]">createThemeScrollbar</code>.
          </Callout>
        </section>

        <section id="thumb-appearance" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={6}
            desc="Customize the scrollbar colors beyond what the theme provides. By default, colors derive from the active theme (primary → accent → foreground). Set these to override with any CSS color."
          >
            Thumb appearance
          </SectionHeading>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            All color options accept any valid CSS color string (hex, rgb, hsl, named colors, CSS variables, etc.).
          </p>
          <ul className="text-sm opacity-80 leading-relaxed list-disc pl-5 space-y-1 mb-4">
            <li>
              <code className="mono text-[0.9em]">thumbColor</code> — base thumb color. Default: theme-derived.
            </li>
            <li>
              <code className="mono text-[0.9em]">trackColor</code> — track background color. Default: transparent (theme-derived wash).
            </li>
            <li>
              <code className="mono text-[0.9em]">thumbHoverColor</code> — thumb color on hover. Default: same as <code className="mono text-[0.9em]">thumbColor</code>.
            </li>
            <li>
              <code className="mono text-[0.9em]">activeThumbColor</code> — thumb color while dragging. Default: same as <code className="mono text-[0.9em]">thumbColor</code>.
            </li>
          </ul>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            You can also theme via CSS custom properties — this is useful for dark/light mode pairs or global design tokens:
          </p>
          {snippetBlock({
            lang: "css",
            title: "CSS custom properties",
            code: `:root {
  --tk-scrollbar-thumb: #ff6b6b;
  --tk-scrollbar-track: #2d2d2d;
  --tk-scrollbar-thumb-hover: #ff8888;
  --tk-scrollbar-thumb-active: #ff4444;
}

/* Dark mode override */
.dark {
  --tk-scrollbar-thumb: #7c3aed;
  --tk-scrollbar-track: #1e1e1e;
  --tk-scrollbar-thumb-hover: #a855f7;
  --tk-scrollbar-thumb-active: #d946ef;
}`,
          })}
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            The CSS variables are defined on the overlay host element (<code className="mono text-[0.9em]">[data-theme-kit-host]</code>) with theme-derived defaults, so the scrollbar automatically follows your active theme. Custom values override the defaults.
          </p>
        </section>

        <section id="arrows" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={7}
            desc="Pass any ReactNode (Vue VNode, Svelte snippet, etc.) as arrow icons via the icons group."
          >
            Arrow icons
          </SectionHeading>
          <ScrollbarFrameworkCode map={ARROW_SNIPPETS} />
        </section>

        <section id="containers" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={8}
            desc="Use appearance.include to scope the overlay to a specific scrollable container instead of the window."
          >
            Container scrollbars
          </SectionHeading>
          <ScrollbarFrameworkCode map={CONTAINER_SNIPPETS} />
        </section>

        <section id="vanilla" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={9}
            desc="The overlay engine lives in @theme-kit/core, so you can mount it without React, Vue, Svelte, or any framework — with an identical option surface."
          >
            Framework-agnostic (vanilla JS)
          </SectionHeading>

          <h3 className="text-base font-semibold mt-6 mb-3">
            Programmatic mount
          </h3>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Create a theme store and pass it — plus the same options you&apos;d
            give <code className="mono text-[0.9em]">ThemeScrollbar</code> — to{" "}
            <code className="mono text-[0.9em]">createThemeScrollbar</code>.
            It returns an{" "}
            <code className="mono text-[0.9em]">OverlayScrollbarHandle</code>{" "}
            (or <code className="mono text-[0.9em]">null</code> when running on
            the server or on a coarse-pointer device where native bars are
            kept). <code className="mono text-[0.9em]">createThemeScrollbar</code>{" "}
            is the public alias for{" "}
            <code className="mono text-[0.9em]">createOverlayScrollbar</code> —
            use whichever reads best in your codebase.
          </p>
          {snippetBlock(vanillaSnippet)}

          <h3 className="text-base font-semibold mt-6 mb-3">
            Hide the native bar before first paint
          </h3>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            Framework providers bootstrap this for you. In vanilla settings,
            drop a blocking pre-paint script into{" "}
            <code className="mono text-[0.9em]">&lt;head&gt;</code> so the
            native scrollbar is never painted (it runs in under 1 ms and skips
            coarse-pointer devices unless you pass{" "}
            <code className="mono text-[0.9em]">{`{ touch: true }`}</code>).
          </p>
          {snippetBlock(prePaintSnippet)}
          <p className="text-sm opacity-80 leading-relaxed mt-4 mb-4">
            If you&apos;re already server-rendering markup, you can skip the
            script and inline{" "}
            <code className="mono text-[0.9em]">createPrePaintScrollbarCSS()</code>{" "}
            as a <code className="mono text-[0.9em]">&lt;style&gt;</code>{" "}
            alongside a <code className="mono text-[0.9em]">tk-scrollbar</code>{" "}
            class on <code className="mono text-[0.9em]">&lt;html&gt;</code> — no
            blocking script, no hydration mismatch.
          </p>
          {snippetBlock(ssrCssSnippet)}
        </section>

        <section id="how-it-works" className="scroll-mt-24 mb-10">
          <SectionHeading
            num={10}
            desc="The overlay never replaces native scrolling. It renders theme-colored strips that represent the scrollbar, while the browser handles the actual scroll physics."
          >
            How it works
          </SectionHeading>
          {snippetBlock(prePaintCSS)}
        </section>

        <section id="next" className="scroll-mt-24 mb-10">
<SectionHeading
            num={11}
            desc="Now that you have a custom scrollbar, theme it with your own tokens or explore the full API."
          >
            What&apos;s next
          </SectionHeading>
          <div className="flex flex-col gap-2">
            <Link
              href="/api-reference"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">API Reference</div>
                <div className="text-xs opacity-60">
                  Full reference for every OverlayScrollbarOptions type.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/custom-themes"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Custom Themes</div>
                <div className="text-xs opacity-60">
                  Theme the scrollbar with your own design tokens.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
            <Link
              href="/core-concepts"
              className="glass-card card-lift p-4 no-underline flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold">Core Concepts</div>
                <div className="text-xs opacity-60">
                  Theme families, semantic tokens, and the runtime.
                </div>
              </div>
              <span style={{ color: "var(--theme-color-primary)" }}>→</span>
            </Link>
          </div>
        </section>
      </div>
      </ScrollbarFrameworkProvider>
    </DocsLayout>
  );
}