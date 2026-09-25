"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
} from "@theme-kit/next/client";
import { themeToCSSVariables, type ThemeDefinition } from "@theme-kit/core";
import { CopyButton } from "./ui/copy-button";
import { PageHeader } from "./ui/page-header";
import { highlightCode } from "../lib/highlight";

export type PresetKind = "default" | "brand";

export const PRESET_KIND_META: Record<
  PresetKind,
  { label: string; hint: string; intro: string }
> = {
  default: {
    label: "Default Presets",
    hint: "Curated palettes from @theme-kit/core — the nine signature families.",
    intro:
      "The nine signature light/dark families that ship with the library: oat, berry, mint, citrus, cocoa, plum, iris, sky and graphite. Click any card to apply that preset to this entire site — live, no reload.",
  },
  brand: {
    label: "Brand Presets",
    hint: "Real-world brand palettes (Apple, GitHub, Vercel, Slack, Discord).",
    intro:
      "Real-world brand palettes that ship with the library. Click any card to apply that preset to this entire site — live, no reload.",
  },
};

export const DEFAULT_PRESET_SNIPPET = `import { getPresetThemes } from "@theme-kit/core";

// Default presets — nine families, light + dark
const themes = getPresetThemes();

// Restyle one family's tokens
const custom = getPresetThemes({
  plum: {
    light: { tokens: { colors: { primary: "#6d28d9" } } },
  },
});`;

export const BRAND_PRESET_SNIPPET = `import { getBrandPresets } from "@theme-kit/core";

// Apple, GitHub, Vercel, Slack, Discord — light + dark each
const themes = getBrandPresets();

const github = themes.filter((t) => t.meta?.family === "github");
createThemeRuntime({ themes: github, defaultTheme: "github-light" });`;

export interface PresetFamilyGroup {
  key: string;
  family: string;
  label: string;
  kind: PresetKind;
  light: ThemeDefinition | undefined;
  dark: ThemeDefinition | undefined;
}

const BRAND_FAMILIES = /^(apple|github|vercel|slack|discord)$/;

function buildGroups(themes: readonly ThemeDefinition[]): PresetFamilyGroup[] {
  const map = new Map<string, PresetFamilyGroup>();
  for (const themeItem of themes) {
    const tags = themeItem.meta?.tags ?? [];
    if (tags.includes("accessibility")) continue;
    // Skip themes the docs site ships for its own demos (theme-kit, lab,
    // scope) — the presets pages should show only library presets.
    if (tags.includes("docs-site")) continue;

    const family = themeItem.meta?.family ?? "default";
    const kind: PresetKind = BRAND_FAMILIES.test(family) ? "brand" : "default";

    const key =
      family === "default" && !themeItem.meta?.family ? "neutral" : family;

    const existing = map.get(key);
    const isNeutral = !themeItem.meta?.family;
    const strippedLabel = isNeutral
      ? "Neutral"
      : (themeItem.meta?.label ?? "").replace(/\s+(Light|Dark)$/i, "");
    const label = existing?.label ?? (strippedLabel || key);

    const group: PresetFamilyGroup = {
      key,
      family,
      label,
      kind: existing?.kind ?? kind,
      light: existing?.light,
      dark: existing?.dark,
    };

    if (themeItem.meta?.mode === "light") group.light = themeItem;
    else if (themeItem.meta?.mode === "dark") group.dark = themeItem;
    map.set(key, group);
  }
  return [...map.values()];
}

export function usePresetGroups(kind: PresetKind): PresetFamilyGroup[] {
  const runtime = useThemeRuntime();
  return useMemo(
    () => buildGroups(runtime.themes).filter((group) => group.kind === kind),
    [runtime.themes, kind],
  );
}

function PreviewCard({ theme }: { theme: ThemeDefinition | undefined }) {
  const colors = (theme?.tokens?.colors ?? {}) as Record<string, string>;
  const c = (key: string, fallback: string) => colors[key] ?? fallback;
  if (!theme) return null;
  return (
    <div
      className="rounded-xl overflow-hidden border text-left"
      style={{
        background: c("card", "#ffffff"),
        color: c("foreground", "#0f172a"),
        borderColor: c("border", "#e2e8f0"),
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{ background: c("muted", "#e2e8f0") }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: c("destructive", "#ef4444") }}
        />
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: c("accent", "#f59e0b") }}
        />
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: c("secondary", "#22c55e") }}
        />
        <span className="ml-2 text-[10px] opacity-40 mono">
          {theme.meta?.label ?? theme.name}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-md grid place-items-center text-[10px] font-bold"
            style={{
              background: c("primary", "#4f46e5"),
              color: c("primaryForeground", "#ffffff"),
            }}
          >
            TK
          </span>
          <span className="text-xs font-semibold">
            {theme.meta?.family ?? "Default"}
          </span>
        </div>
        <div
          className="text-sm font-semibold leading-tight"
          style={{ color: c("foreground", "#0f172a") }}
        >
          Ship theming, not themes
        </div>
        <div
          className="text-[11px] leading-relaxed"
          style={{ color: c("mutedForeground", "#64748b") }}
        >
          One runtime, every framework — swap light and dark with a single
          token update.
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
            style={{
              background: c("primary", "#4f46e5"),
              color: c("primaryForeground", "#ffffff"),
            }}
          >
            Get started
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              border: `1px solid ${c("border", "#e2e8f0")}`,
              color: c("mutedForeground", "#64748b"),
            }}
          >
            Explore
          </span>
        </div>
      </div>
    </div>
  );
}

export function PresetCard({ group }: { group: PresetFamilyGroup }) {
  const { theme } = useTheme();
  const setFamily = useSetThemeFamily();
  const appliedMode = theme?.meta?.mode === "dark" ? "dark" : "light";
  const [previewMode, setPreviewMode] = useState<"light" | "dark">(appliedMode);

  // Follow the main document theme: when the site switches light/dark,
  // every preset preview switches with it.
  useEffect(() => {
    setPreviewMode(appliedMode);
  }, [appliedMode]);

  const isActive =
    (theme?.meta?.family ?? "default") === group.family ||
    group.light?.name === theme?.name ||
    group.dark?.name === theme?.name;

  const previewTheme = previewMode === "light" ? group.light : group.dark;
  const colors = (previewTheme?.tokens?.colors ?? {}) as Record<string, string>;

  return (
    <div
      key={group.key}
      className={`glass-card card-lift p-4 flex flex-col ${
        isActive ? "ring-2 ring-ring" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-sm capitalize">{group.label}</div>
          <div className="mono text-[11px] opacity-40">{group.key}</div>
        </div>
        {isActive && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              background: "var(--theme-color-primary)",
              color:
                "var(--theme-color-primaryForeground)",
            }}
          >
            Active
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mb-2">
        {(["light", "dark"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setPreviewMode(mode)}
            className={`flex-1 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
              previewMode === mode
                ? "bg-muted text-foreground"
                : "text-foreground/40 hover:text-foreground/70"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <PreviewCard theme={previewTheme} />

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex gap-1">
          {[
            "background",
            "card",
            "primary",
            "secondary",
            "accent",
            "border",
          ].map((key) =>
            colors[key] ? (
              <div
                key={key}
                className="w-3.5 h-3.5 rounded-full border border-black/10"
                style={{ background: colors[key] }}
                title={`${key}: ${colors[key]}`}
              />
            ) : null,
          )}
        </div>
        <span className="text-[10px] opacity-40 mono">
          {previewMode}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFamily(group.family)}
        className="mt-3 w-full px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
        }}
      >
        {isActive ? "Applied to this site" : "Use this theme"}
      </button>
      <div className="text-[11px] opacity-60 mt-2">
        Snapshots every light/dark token pair of the family. Clicking applies{" "}
        <code className="mono">setFamily()</code> to this very page — live, no
        reload.
      </div>
    </div>
  );
}

export function PresetsHeader({ kind }: { kind: PresetKind }) {
  const otherKind: PresetKind = kind === "default" ? "brand" : "default";
  const meta = PRESET_KIND_META[kind];
  return (
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
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8" />
        </svg>
      }
      title={meta.label}
      subtitle="@theme-kit/core"
      description={meta.intro}
      actions={
        <Link
          href={`/presets/${otherKind}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary no-underline font-medium hover:underline"
        >
          {kind === "default"
            ? "Compare with Brand →"
            : "Explore Default →"}
        </Link>
      }
    />
  );
}

export function CurrentThemeInspector() {
  const { theme, mode, family } = useTheme();

  const css = useMemo(() => {
    if (!theme) return "";
    const vars = themeToCSSVariables(theme, { prefix: "theme-" });
    return Object.entries(vars)
      .map(([k, v]) => `${k}: ${v};`)
      .join("\n");
  }, [theme]);

  if (!theme) return null;

  return (
    <div
      className="rounded-xl border p-4 mb-8"
      style={{
        background: "var(--theme-color-card)",
        borderColor: "var(--theme-color-border)",
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold tracking-tight">Applied now on this site</h2>
          <p className="text-xs opacity-60 mt-0.5">
            This page is themed by the live runtime — every card above calls{" "}
            <code className="mono">setFamily()</code> on this very page.
          </p>
        </div>
        <span className="mono text-[11px] px-2.5 py-1 rounded-full border border-border">
          {theme.name} · {mode} · {family ?? "default"}
        </span>
      </div>
      <div className="mt-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-1.5 mono">
          Resolved CSS variables
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(themeToCSSVariables(theme, { prefix: "theme-" })).map(
            ([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border"
                title={`${key}: ${value}`}
              >
                <code className="mono text-[9px] opacity-60">{key}</code>
                <code className="mono text-[9px] opacity-70 break-all">{value}</code>
              </div>
            )
          )}
        </div>
        <div className="mt-2">
          <CopyButton
            text={css}
            label="Copy all"
            className="text-[10px] font-medium opacity-60 hover:opacity-100"
          />
        </div>
      </div>
    </div>
  );
}

/** Framework example type for snippets. */
export type FrameworkExample = {
  title: string;
  lang: string;
  code: string;
  filename?: string;
  html?: string;
};

/** Frameworks the preset pages can generate a setup snippet for. */
export const PRESET_FRAMEWORKS: { slug: string; name: string }[] = [
  { slug: "react", name: "React" },
  { slug: "next", name: "Next.js" },
  { slug: "vue", name: "Vue" },
  { slug: "nuxt", name: "Nuxt" },
  { slug: "svelte", name: "Svelte" },
  { slug: "solid", name: "Solid" },
  { slug: "angular", name: "Angular" },
  { slug: "astro", name: "Astro" },
  { slug: "remix", name: "Remix" },
  { slug: "web", name: "Web Components" },
  { slug: "tailwind", name: "Tailwind CSS" },
];

/**
 * Framework picker for the preset pages. React is the default selection; the
 * snippet below re-renders for whichever framework the visitor picks.
 */
export function FrameworkSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (framework: string) => void;
}) {
  return (
    <div className="mb-6">
      <span className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2.5">
        Pick your framework
      </span>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Pick your framework"
      >
        {PRESET_FRAMEWORKS.map((fw) => (
          <button
            key={fw.slug}
            type="button"
            onClick={() => onChange(fw.slug)}
            aria-pressed={selected === fw.slug}
            className={`chip ${selected === fw.slug ? "chip-active" : ""}`}
          >
            {fw.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Per-framework setup snippet for one preset family.
 *
 * Every snippet uses the framework package's own shipped API —
 * `ThemeProvider` / `provideThemeKit` / `defineCustomElements` — rather than
 * dropping down to `createThemeRuntime`. The preset itself always comes from
 * `@theme-kit/core` (`getPresetThemes` / `getBrandPresets`), and the whole
 * family is handed over so light and dark both resolve.
 */
export function getPresetFrameworkSnippet(
  family: string,
  kind: "default" | "brand",
  framework: string,
  mode: "light" | "dark" = "light"
): FrameworkExample {
  const getter = kind === "brand" ? "getBrandPresets" : "getPresetThemes";
  const themeName = `${family}-${mode}`;

  const snippets: Record<string, FrameworkExample> = {
    react: {
      title: "src/App.tsx",
      lang: "tsx",
      code: `import { ThemeProvider, useTheme } from "@theme-kit/react";
import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

function Switcher() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme.name}</button>;
}

export function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="${themeName}">
      <Switcher />
    </ThemeProvider>
  );
}`,
    },
    next: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `import type { ReactNode } from "react";
import { ThemeProvider } from "@theme-kit/next";
import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

export default function RootLayout({ children }: { children: ReactNode }) {
  // ThemeProvider renders <html>, <head> and <body> itself — do not add them.
  return (
    <ThemeProvider themes={themes} defaultTheme="${themeName}">
      {children}
    </ThemeProvider>
  );
}`,
    },
    vue: {
      title: "src/App.vue",
      lang: "vue",
      code: `<!-- src/App.vue -->
<script setup lang="ts">
import { ThemeProvider, useTheme } from "@theme-kit/vue";
import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");
const { theme, toggleTheme } = useTheme();
</script>

<template>
  <ThemeProvider :themes="themes" default-theme="${themeName}">
    <button @click="toggleTheme">{{ theme.name }}</button>
  </ThemeProvider>
</template>`,
    },
    svelte: {
      title: "src/App.svelte",
      lang: "svelte",
      code: `<!-- src/App.svelte -->
<script lang="ts">
  import { ThemeProvider, useTheme } from "@theme-kit/svelte";
  import { ${getter} } from "@theme-kit/core";

  // ${family} — light + dark in one family
  const themes = ${getter}().filter((t) => t.meta?.family === "${family}");
  const { theme, toggleTheme } = useTheme();
</script>

<ThemeProvider themes={themes} defaultTheme="${themeName}">
  <button onclick={toggleTheme}>{$theme.name}</button>
</ThemeProvider>`,
    },
    solid: {
      title: "src/App.tsx",
      lang: "tsx",
      code: `import { ThemeProvider, useTheme } from "@theme-kit/solid";
import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

function Switcher() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme().name}</button>;
}

export function App() {
  return (
    <ThemeProvider themes={themes} defaultTheme="${themeName}">
      <Switcher />
    </ThemeProvider>
  );
}`,
    },
    angular: {
      title: "src/main.ts",
      lang: "ts",
      code: `import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { ${getter} } from "@theme-kit/core";
import { AppComponent } from "./app/app.component";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ themes, defaultTheme: "${themeName}" })],
});`,
    },
    web: {
      title: "index.html",
      lang: "html",
      code: `<!doctype html>
<html lang="en">
  <body>
    <script type="module">
      import { defineCustomElements } from "@theme-kit/web";
      import { ${getter} } from "@theme-kit/core";

      // ${family} — light + dark in one family
      const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

      defineCustomElements();

      // The provider reads its themes from the \`themes\` attribute (JSON).
      document
        .querySelector("theme-kit-provider")
        ?.setAttribute("themes", JSON.stringify(themes));
    </script>

    <theme-kit-provider default-theme="${themeName}">
      <theme-kit-toggle></theme-kit-toggle>
      <my-app></my-app>
    </theme-kit-provider>
  </body>
</html>`,
    },
    astro: {
      title: "theme.config.ts + astro.config.ts",
      lang: "ts",
      code: `// theme.config.ts — the single declaration
import { defineThemeKitConfig } from "@theme-kit/core";
import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

export default defineThemeKitConfig({
  themes,
  defaultTheme: "${themeName}",
  initialMode: "system",
});

// astro.config.ts — registers the integration; the integration discovers the
// config above, injects the pre-paint bootstrap from it, and transports it to
// the runtime. No theme data here.
import { defineConfig } from "astro/config";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit()],
});`,
    },
    nuxt: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    themes,
    defaultTheme: "${themeName}",
    initialMode: "system",
  },
});`,
    },
    remix: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `import type { ReactNode } from "react";
import { useLoaderData } from "@remix-run/react";
import { ThemeHead, ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";
import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");

// The loader resolves the selection server-side, so hydration matches exactly.
export async function loader({ request }: { request: Request }) {
  return { initial: await getInitialThemeState(request, { themes }) };
}

export function Layout({ children }: { children: ReactNode }) {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <ThemeHead themes={themes} />
      </head>
      <body>
        <ThemeProvider initial={initial} themes={themes}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`,
    },
    tailwind: {
      title: "src/globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

/* The ${family} preset is resolved by the Theme Kit runtime into the
   --color-* variables below; pick the family with your framework's
   ThemeProvider (see the React / Next.js snippets). */

body {
  @apply bg-background text-foreground;
}`,
    },
  };

  return (
    snippets[framework] ?? {
      title: `${family}-${mode}.ts`,
      lang: "ts",
      code: `import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");
const theme = themes.find((t) => t.meta?.mode === "${mode}") ?? themes[0];

console.log(theme.name); // "${themeName}"`,
      html: highlightCode(`import { ${getter} } from "@theme-kit/core";

// ${family} — light + dark in one family
const themes = ${getter}().filter((t) => t.meta?.family === "${family}");
const theme = themes.find((t) => t.meta?.mode === "${mode}") ?? themes[0];

console.log(theme.name); // "${themeName}"`, "ts"),
    }
  );
}