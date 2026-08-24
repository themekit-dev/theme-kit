import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { DOCS_ROUTES } from "./docs-routes";
import { frameworks } from "./frameworks";
import { libraries } from "./libraries";
import { packages } from "./packages";
import { PAGE_SECTIONS } from "./search-sections";

export type SearchEntryType = "docs" | "guides" | "cli" | "api" | "blog";

export type SearchEntry = {
  title: string;
  route: string;
  text: string;
  /** Content type used to group results in the search dialog. */
  type: SearchEntryType;
};

function classify(route: string): SearchEntryType {
  if (route.startsWith("/api-reference")) return "api";
  if (route.startsWith("/cli")) return "cli";
  if (route.startsWith("/blog")) return "blog";
  if (
    route.startsWith("/framework-guides") ||
    route.startsWith("/libraries")
  ) {
    return "guides";
  }
  return "docs";
}

const contentDir = join(process.cwd(), "content");

const ROUTES: Record<string, string> = {
  "core-concepts": "/core-concepts",
  architecture: "/architecture",
  packages: "/packages",
  "framework-guides": "/framework-guides",
  "advanced-features": "/advanced-features",
  adapters: "/adapters",
  "api-reference": "/api-reference",
  cli: "/cli",
  "cli/overview": "/cli",
  devtools: "/devtools",
  roadmap: "/roadmap",
  "custom-scrollbar": "/custom-scrollbar",
  libraries: "/libraries",
};

/**
 * Hand-written descriptions for JSX-only pages that have no markdown source.
 * These override the shorter hints from DOCS_ROUTES.
 */
const STATIC_ENTRIES: Omit<SearchEntry, "type">[] = [
  {
    title: "Quick Start",
    route: "/quick-start",
    text: "The shortest path to a themed app with no token definitions. Install @theme-kit/core plus your framework adapter, wrap your app in the provider with no themes prop, and get the built-in neutral light/dark theme with a toggle, persistence and history.",
  },
  {
    title: "CLI",
    route: "/cli",
    text: "The @theme-kit/cli command-line toolkit: generate, validate, inspect, migrate, and export Theme Kit themes from any shell or build pipeline. Global install, npx, or project-local; exit codes for CI.",
  },
  {
    title: "Theme Studio",
    route: "/theme-studio",
    text: "Generate a complete light and dark theme pair from a seed color with generateTheme(). Pick a seed, preview the derived palette, apply it to the live site. Theme generation studio.",
  },
  {
    title: "Playground",
    route: "/playground",
    text: "Interactive playground: switch families and modes live, explore the token tree, time-travel through theme history, multi-window sync demo, scheduled solar-time demo.",
  },
  {
    title: "Showcase",
    route: "/showcase",
    text: "Gallery of apps and projects built with Theme Kit: the official docs site, the interactive playground, and example apps for every supported framework.",
  },
  {
    title: "Blog",
    route: "/blog",
    text: "Theme Kit blog — release notes, deep dives, and guides on theming architecture, multi-window sync, scheduling, accessibility and more.",
  },
  {
    title: "Custom Themes",
    route: "/custom-themes",
    text: "Define your own themes with defineTheme, extendTheme and composeTheme. Register them with the runtime, generate from a seed color, and compose on top of built-in presets and brand palettes.",
  },
  {
    title: "Default Presets",
    route: "/presets/default",
    text: "The nine signature default preset families that ship with Theme Kit (oat, berry, mint, citrus, cocoa, plum, iris, sky, graphite) — each with light and dark. Click any preset to apply it live, plus the getPresetThemes code.",
  },
  {
    title: "Brand Presets",
    route: "/presets/brand",
    text: "Real-world brand preset palettes that ship with Theme Kit (Apple, GitHub, Vercel, Slack, Discord) — each with light and dark. Click any preset to apply it live, plus the getBrandPresets code.",
  },
  {
    title: "Animation & Transition",
    route: "/animation",
    text: "How Theme Kit animates theme changes — a live, interactive lab with duration / easing / preset / View Transitions / reduced-motion controls driving the real createThemeDiff → createTransitionPlan → runThemeAnimation pipeline, plus the diff → plan → scan → coordinate pipeline, transition presets (smooth / subtle / instant), the View Transitions cross-fade (useViewTransition), best practices, and the full transition API reference.",
  },
  {
    title: "Accessibility Lab",
    route: "/accessibility",
    text: "Live WCAG contrast checks with getContrastRatio, checkContrastPair and validateThemeContrast, color vision deficiency simulation with simulateCVD and simulateThemeForCVD, accessibility profiles (high contrast, large text), and a live demo of createAccessibilityPlugin reacting to a violating theme via onViolation with a one-click fix.",
  },
  {
    title: "Custom Scrollbar",
    route: "/custom-scrollbar",
    text: "Replace the browser's default scrollbar with a theme-aware overlay that matches your design system. Quick start, ThemeScrollbar setup per framework (React, Next.js, Vue, Svelte, Solid, Web Components, Angular, Nuxt, Remix), grouped options (behavior / appearance / icons), thumb colors and CSS custom properties, container-scoped scrollbars, and how the flash-free pre-paint engine works.",
  },
  {
    title: "Scoped Theme",
    route: "/scoped-theme",
    text: "Apply a whole theme to a subtree — a sandboxed island inside the app. Live ThemeScope demo, per-framework integration snippets (React, Next.js, Vue, Svelte, Solid, Angular, Web Components, Vanilla), imperative scoping with useScopedTheme and createScopedThemeBinding, scoped CSS variables, Tailwind aliases, and nesting.",
  },
  {
    title: "Zero Flash",
    route: "/zero-flash",
    text: "How Theme Kit prevents a flash of the wrong theme on reload and SSR. The problem (flash of incorrect theme), the full pipeline (persist → resolve → generate → render → blocking bootstrap → paint → hydrate), the core primitives (createThemeBootstrapScript, buildThemeCssMap, darkModeCSSTemplate), and per-framework integration for React, Next.js, Vue/Nuxt, SvelteKit, Solid, Angular, Astro, Remix and Web Components.",
  },
  {
    title: "Tokens & Typography",
    route: "/tokens",
    text: "Theme Kit's token system goes far beyond colors: typography (font family, font size, line height), spacing, radius, shadows, border widths, z-index and breakpoints are all semantic theme tokens. Live interactive demos per token group, how tokens map to CSS variables (--theme-color-*, --theme-typography-*, --theme-spacing-*, --theme-radius-*, --theme-shadow-*, --theme-border-width-*), and defining every group in one defineTheme call.",
  },
  {
    title: "Libraries",
    route: "/libraries",
    text: "Adapters bridge Theme Kit semantic tokens to the libraries you already use. CSS-variable adapters inject live variables; generated adapters rebuild a library theme on every theme change; build-time integrations expose tokens as utilities.",
  },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function walk(dir: string, base = ""): { file: string; rel: string }[] {
  const out: { file: string; rel: string }[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(abs, join(base, entry.name)));
    } else if (entry.name.endsWith(".md")) {
      out.push({ file: abs, rel: join(base, entry.name) });
    }
  }
  return out;
}

/**
 * Builds the searchable index. Coverage is guaranteed by seeding one entry
 * per route in DOCS_ROUTES (the canonical registry behind the sidebar's
 * prev/next path), then enriching:
 * 1. taglines for dynamic [slug] pages (frameworks / libraries / packages)
 * 2. hand-written descriptions for JSX-only pages
 * 3. section-level entries parsed out of every markdown file
 */
export function buildSearchIndex(): SearchEntry[] {
  // --- 1. Base coverage: every docs-navigation route -------------------
  const index = new Map<string, SearchEntry>();
  const sectionEntries: SearchEntry[] = [];

  const add = (entry: SearchEntry) => {
    index.set(entry.route, entry);
  };

  for (const route of DOCS_ROUTES) {
    add({
      title: route.label,
      route: route.href,
      text: route.hint ?? route.label,
      type: classify(route.href),
    });
  }

  // --- 2. Taglines for dynamic [slug] pages ----------------------------
  for (const fw of frameworks) {
    const route = `/framework-guides/${fw.slug}`;
    if (index.has(route)) {
      add({ ...index.get(route)!, text: `${fw.tagline} Install ${fw.pkg}.` });
    }
  }
  for (const lib of libraries) {
    const route = `/libraries/${lib.slug}`;
    if (index.has(route)) {
      add({ ...index.get(route)!, text: lib.tagline });
    }
  }
  for (const pkg of packages) {
    const route = `/packages/${pkg.slug}`;
    if (index.has(route)) {
      add({ ...index.get(route)!, text: pkg.tagline });
    }
  }

  // --- 3. Rich hand-written descriptions win over hints/taglines -------
  for (const entry of STATIC_ENTRIES) {
    const existing = index.get(entry.route);
    if (!existing || existing.text.length <= entry.text.length) {
      add({ ...entry, type: classify(entry.route) });
    }
  }

  // --- 4. Section-level data for JSX-only pages -------------------------
  // These pages have no markdown source; their SectionHeading titles and
  // descriptions were extracted into PAGE_SECTIONS so their content is
  // searchable beyond the one-line sidebar hint.
  for (const page of PAGE_SECTIONS) {
    const existing = index.get(page.route);
    if (existing && page.intro && page.intro.length > existing.text.length) {
      add({ ...existing, text: page.intro });
    }
    for (const section of page.sections) {
      const text = [section.title, section.desc]
        .filter(Boolean)
        .join(" — ")
        .trim();
      if (!text) continue;
      sectionEntries.push({
        title: section.title,
        route: page.route,
        text,
        type: classify(page.route),
      });
    }
  }

  // --- 5. Section-level entries from every markdown file ---------------
  for (const { file, rel } of walk(contentDir)) {
    const slug = rel.replace(/\.md$/, "").replace(/\\/g, "/");
    const route = ROUTES[slug] ?? `/${slug}`;

    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");

    let title = slug
      .split("/")
      .pop()!
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    let buffer: string[] = [];

    const flush = () => {
      const text = normalize(buffer.join(" "));
      // Keep every section as its own searchable entry. Skip only the
      // redundant file-intro fragment whose title duplicates the base
      // entry we already seeded from DOCS_ROUTES.
      const duplicateOfBase =
        index.get(route)?.title.toLowerCase() === title.toLowerCase();
      if (text && !duplicateOfBase) {
        sectionEntries.push({
          title,
          route,
          text,
          type: classify(route),
        });
      }
      buffer = [];
    };

    for (const line of lines) {
      const heading = /^#{2,4}\s+(.+)$/.exec(line);
      if (heading) {
        flush();
        title = normalize(heading[1]!.replace(/[`*_]/g, ""));
        buffer.push(title);
      } else {
        buffer.push(line);
      }
    }
    flush();
  }

  return [...index.values(), ...sectionEntries];
}
