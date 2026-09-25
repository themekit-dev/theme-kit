import { type ReactElement } from "react";
import { Icon } from "@iconify/react";

const icons = {
  react: <Icon icon="devicon:react" width={24} height={24} />,
  next: <Icon icon="devicon:nextjs" width={24} height={24} />,
  vue: <Icon icon="devicon:vuejs" width={24} height={24} />,
  svelte: <Icon icon="devicon:svelte" width={24} height={24} />,
  solid: <Icon icon="devicon:solidjs" width={24} height={24} />,
  angular: <Icon icon="devicon:angular" width={24} height={24} />,
  web: <Icon icon="simple-icons:webcomponentsdotorg" width={24} height={24} />,
  tailwind: <Icon icon="devicon:tailwindcss" width={24} height={24} />,
  astro: <Icon icon="simple-icons:astro" width={24} height={24} />,
  nuxt: <Icon icon="devicon:nuxtjs" width={24} height={24} />,
  remix: <Icon icon="simple-icons:remix" width={24} height={24} />,
};

export type FrameworkFeature = {
  name: string;
  desc: string;
};

export type FrameworkGroup = {
  label: string;
  features: FrameworkFeature[];
};

export type FrameworkSnippet = {
  title: string;
  lang: string;
  code: string;
};

/**
 * The snippet slots a setup step may point at, by name.
 *
 * A step references the framework entry's own snippets instead of restating
 * them, so a snippet the Quick Start page also renders has exactly one
 * definition — the two pages cannot drift apart.
 */
export type SnippetSlot =
  | "quickStart"
  | "quickStartExtra"
  | "setupExtra"
  | "noTheme"
  | "snippet"
  | "snippet2"
  | "snippet3"
  | "snippet4"
  | "snippet6"
  | "switchSnippet"
  | "reactSetup"
  | "styles";

/**
 * One labelled step inside a setup path — "Install", "Configure", "Use Theme
 * Kit". The steps are the part that genuinely differs between two application
 * shapes; everything below the paths is shared and explained once.
 */
export type SetupStep = {
  /** Step label, rendered as the step heading. */
  label: string;
  /** One-line description of what the step does. */
  desc: string;
  /**
   * Render an install command here instead of a code snippet.
   *
   * `"base"` is the framework's own packages. `"renderer"` adds the client
   * renderer the second path needs, so the command the reader copies is
   * complete for the path they chose — the reader should never have to infer an
   * extra package from prose.
   */
  install?: "base" | "renderer";
  /** Snippets the framework entry already defines, resolved by slot name. */
  refs?: SnippetSlot[];
  /** Snippets that exist only in this guide, declared inline. */
  snippets?: FrameworkSnippet[];
  /** Optional callout shown under the snippets. */
  note?: string;
};

/**
 * One of the supported shapes of a Theme Kit app in this framework.
 *
 * Only frameworks whose integration genuinely supports more than one shape
 * declare these. Astro is the first: the distinction is whether the app ships a
 * client framework runtime at all, which changes the imports and the config —
 * and nothing else.
 */
export type SetupPath = {
  /** In-page anchor id, e.g. `astro-only`. Must be a stable, hand-written id. */
  id: string;
  /** Display name, e.g. "Astro-only". */
  name: string;
  /** Short badge on the choice card, e.g. "No React runtime". */
  badge: string;
  /** One-line summary for the choice card. */
  summary: string;
  /** "Use this when …" sentence — describes the shape, recommends nothing. */
  useWhen: string;
  /** The path's own steps. */
  steps: SetupStep[];
};

/** A concept that behaves identically in every path, explained once. */
export type SharedBehaviorSection = {
  /** Anchor id, e.g. `shared-readouts`. */
  id: string;
  title: string;
  /** Prose; `` `backticks` `` render as inline code. */
  body: string;
};

/** The "Choose your setup" decision block. */
export type SetupChoice = {
  title: string;
  intro: string;
  /** Exactly two paths, rendered as two visually distinct choices. */
  paths: [SetupPath, SetupPath];
  /** Column labels for the comparison table. */
  columns: [string, string];
  /**
   * "Which one should I use?" — describes the distinction rather than
   * recommending a path, because the right answer is a property of the app.
   */
  decision: { title: string; lines: string[] };
  /** Only the rows that differ, or that are explicitly shared. */
  comparison: { area: string; a: string; b: string }[];
};

/** A complete runnable example app that backs one of the paths. */
export type SetupExample = {
  label: string;
  /** Path inside the repo, e.g. `examples/apps/astro`. */
  path: string;
  note: string;
};

/**
 * A framework guide with more than one supported application shape.
 *
 * `lib/frameworks.tsx` stays the single source for the guide's snippets — this
 * field adds the *structure* the page renders: the two paths, the steps each
 * one contains, and the shared sections below them. The guide deliberately does
 * not duplicate the shared concepts into both paths.
 */
export type FrameworkSetupGuide = {
  /** Opening paragraphs, in order. `` `backticks` `` render as inline code. */
  overview: string[];
  choose: SetupChoice;
  /** Concepts explained once, after both paths. */
  shared: { title: string; intro: string; sections: SharedBehaviorSection[] };
  /** The runnable examples behind the paths. */
  examples: { title: string; intro: string; apps: SetupExample[] };
  /**
   * The client/server boundary the second path introduces, drawn as text so the
   * reader can see that React APIs are not reachable from `.astro` directly.
   */
  boundary: string;
  /** Intro copy for the caveats section. */
  caveatsIntro: string;
};

export type FrameworkItem = {
  slug: string;
  name: string;
  icon: ReactElement;
  pkg: string;
  tagline: string;
  mark: string;
  tags: string[];
  groups: FrameworkGroup[];
  quickStart: FrameworkSnippet;
  /**
   * A second file the setup needs, shown as its own block. One file per block:
   * a single block holding two files cannot carry two filenames, so a reader
   * cannot tell where one ends and the next begins.
   */
  quickStartExtra?: FrameworkSnippet;
  snippet: FrameworkSnippet;
  snippet2: FrameworkSnippet;
  snippet3?: FrameworkSnippet;
  /**
   * A further example, shown after `snippet3` in "More Examples". For API that
   * deserves its own block rather than another feature bullet — Astro's
   * `getThemeController()` surface, where the `getMode` / `getResolvedMode`
   * distinction is the whole point and prose alone loses it.
   */
  snippet4?: FrameworkSnippet;
  /**
   * A further example, shown after `snippet4`. Astro only today: toggling the
   * theme with no `<ThemeToggle />` at all.
   *
   * `snippet4` documents the `getThemeController()` surface; this shows the
   * page that uses it, because an API listing does not tell a reader where the
   * `<script>` goes or that it replaces the component rather than joining it.
   */
  snippet6?: FrameworkSnippet;
  noTheme: FrameworkSnippet;
  /**
   * Quick Start, step 2 — an extra file the minimal setup needs, shown after
   * `noTheme`. Only `web` uses it today: its minimal setup also needs the
   * bootstrap generator the built page loads.
   *
   * Astro is deliberately not one of them. Its setup is three files, and its
   * Quick Start renders them from the entry's own slots (`quickStart`,
   * `noTheme`, `snippet`) so there is exactly one definition of
   * `theme.config.ts`, `astro.config.mjs` and the layout — a Quick-Start-only
   * copy is how the two pages drifted before.
   */
  setupExtra?: FrameworkSnippet;
  /**
   * Quick Start, step 3 — the switcher, when `snippet` is not one. Tailwind's
   * `snippet` is a utility example and Astro's is the layout, so both supply
   * their own.
   */
  switchSnippet?: FrameworkSnippet;
  /**
   * Astro + React only — the integration config with the React renderer
   * registered (`react()` next to `themeKit()`).
   *
   * This is a slot rather than a guide-only inline snippet because two surfaces
   * render it: the guide's React path and the Quick Start page's React shape.
   * One definition means the two cannot disagree about what the React path
   * registers.
   */
  reactSetup?: FrameworkSnippet;
  /**
   * The canonical, token-driven stylesheet this framework's styling step shows.
   *
   * Every entry points at {@link CANONICAL_STYLES} — one definition, eleven
   * frameworks — so the framework snippets teach *integration* while the
   * stylesheet teaches *Theme Kit itself*. Only the file name differs, because
   * the conventional place for global CSS genuinely differs per framework.
   *
   * A slot rather than a page-local snippet because two surfaces render it (the
   * Quick Start page and the framework guide), and because Astro's layout
   * imports it by path: the copy-paste contract requires the file an import
   * names to be declared in the same bundle.
   */
  styles: FrameworkSnippet;
  /**
   * The framework guide's own first-success path — install, set up, add a
   * toggle, run. `noTheme` and `snippet` supply the two code steps; these three
   * fields supply the rest, so a reader never has to leave the page to get one
   * working theme.
   */
  /** Whether this exact setup is flash-free, and what it takes if not. */
  zeroFlashNote: string;
  /** Quick Start, step 2 — how the starting theme and mode are chosen here. */
  modeNote: string;
  /** Quick Start, step 2 — where this framework's theme configuration lives. */
  configNote: string;
  /** Extra packages the minimal setup needs beyond `@theme-kit/core` + `pkg`. */
  extraPackages?: string[];
  featureCount: number;
  /**
   * True for CSS-only integrations (Tailwind, UnoCSS). They have no provider to
   * mount and no runtime of their own — they expose tokens as utilities — so
   * `FrameworkPicker` leaves them out of its "which framework are you using?"
   * list. Quick Start still offers them, because that tab is a complete setup:
   * it installs a runtime adapter alongside the CSS.
   */
  cssOnly?: boolean;
  /**
   * Present only when this framework supports more than one application shape.
   * Astro is the first: an Astro-native app and an Astro + React island app are
   * different enough that the reader has to pick before the install step, so the
   * guide presents the choice up front and explains the shared half once.
   *
   * @see {@link FrameworkSetupGuide}
   */
  setupGuide?: FrameworkSetupGuide;
};

type RawFramework = Omit<FrameworkItem, "featureCount">;

/**
 * The canonical, token-driven stylesheet — the shared visual thread.
 *
 * Every framework's Quick Start and framework guide renders *this* stylesheet
 * from *this* definition: one stylesheet, eleven frameworks. That is the whole
 * point of keeping it apart from the integration code. The framework-specific
 * snippets teach how to wire Theme Kit into a given framework; this file teaches
 * Theme Kit itself, so a reader moving from React to Svelte to Astro meets the
 * same styling model rather than three near-identical CSS files that quietly
 * disagree.
 *
 * Every custom property below is one the runtime actually emits. The names are
 * derived from the implementation, not written by hand:
 * `themeToCSSVariables()` (`packages/core/src/css.ts`) appends each token key to
 * its group prefix **verbatim**, with two consequences worth knowing before
 * editing this block:
 *
 *   - colour keys stay camelCase on purpose — the real property is
 *     `--theme-color-cardForeground`, not `--theme-color-card-foreground`;
 *   - two group prefixes are singular — `--theme-shadow-md` and
 *     `--theme-breakpoint-lg`, not `--theme-shadows-*` / `--theme-breakpoints-*`.
 *
 * The built-in neutral themes (the provider's fallback when no `theme.config.ts`
 * is discoverable) define the full token set, so every property here resolves
 * with no configuration at all. `npm run probe:guide-first-success` re-derives
 * this list from the shipped emitter and asserts each name exists — a renamed
 * token fails the probe instead of silently falling back to an inherited value.
 *
 * Deliberately small: it demonstrates the chain
 * theme → token → CSS variable → UI, and is not a design system.
 */
export const CANONICAL_STYLES = `/* Theme Kit emits its design tokens as CSS custom properties on the root
   element, so a stylesheet only has to read them. Nothing here is
   theme-specific: these rules render every theme, including ones you add
   later. */
body {
  margin: 0;
  padding: var(--theme-spacing-8);
  background: var(--theme-color-background);
  color: var(--theme-color-foreground);
  font-family: var(--theme-typography-font-family-sans);
  line-height: var(--theme-typography-line-height-normal);
}

h1 {
  margin: 0;
  font-size: var(--theme-typography-font-size-2xl);
}

.surface {
  display: grid;
  gap: var(--theme-spacing-3);
  padding: var(--theme-spacing-6);
  background: var(--theme-color-card);
  color: var(--theme-color-cardForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.btn {
  font: inherit;
  padding: var(--theme-spacing-2) var(--theme-spacing-4);
  background: var(--theme-color-primary);
  color: var(--theme-color-primaryForeground);
  border: var(--theme-border-width-1) solid var(--theme-color-primary);
  border-radius: var(--theme-radius-md);
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid var(--theme-color-ring);
  outline-offset: 2px;
}`;

/**
 * The one-line explanation that accompanies {@link CANONICAL_STYLES}.
 *
 * Kept next to the stylesheet so the two cannot drift: every surface that
 * renders the stylesheet renders this sentence, and none of them writes its own.
 */
export const CANONICAL_STYLES_NOTE =
  "`.surface` and `.btn` read Theme Kit tokens, so switching the active theme repaints them — no re-render, and no per-theme CSS.";

/**
 * The step that introduces {@link CANONICAL_STYLES}, shared by Quick Start and
 * the framework guides so the two pages cannot describe it differently.
 *
 * Deliberately a plain object and not `as const`: `generate-framework-guides.mjs`
 * lifts this declaration verbatim into the scope it evaluates `rawFrameworks` in,
 * so it has to be valid JavaScript as written.
 */
export const CANONICAL_STYLES_STEP = {
  label: "Style it with Theme Kit tokens",
  desc: "Your own classes read the variables the active theme emits, so there is no per-theme CSS to write and nothing to re-render on a switch.",
};

export const rawFrameworks: RawFramework[] = [
  {
    slug: "react",
    name: "React",
    icon: icons.react,
    pkg: "@theme-kit/react",
    tagline:
      "Provider and hooks for React, with scoped themes, transitions, and an optional build-time bootstrap.",
    mark: "R",
    tags: ["SPA", "Vite", "Context"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProvider",
            desc: "Creates a runtime, wires DOM + CSS-variable bindings, and provides it via context. Accepts every ThemeRuntimeOptions prop.",
          },
          {
            name: "Runtime injection",
            desc: "Pass `runtime` to share an existing instance, or `initial` to seed the server-resolved selection for hydration.",
          },
          {
            name: "scheduled prop",
            desc: "Switches between `lightTheme` and `darkTheme` at each visitor's local sunrise and sunset. Latitude/longitude are optional — the location comes from the browser timezone unless you pin `timeZone`.",
          },
        ],
      },
      {
        label: "Root bootstrap",
        features: [
          {
            name: "createThemeRoot()",
            desc: "Optional client-only root bootstrap that lets Theme Kit control the initial React root commit when synchronous first-commit behavior is required.",
          },
          {
            name: "Standard createRoot()",
            desc: "Use the normal React root API when no special first-commit optimization is needed.",
          },
        ],
      },
      {
        label: "Hooks",
        features: [
          {
            name: "useTheme()",
            desc: "Returns `{ theme, mode, family, setMode, setFamily, toggleTheme }`.",
          },
          {
            name: "useThemeValue() / useThemeTokens()",
            desc: "The active theme definition, and the active theme tokens.",
          },
          {
            name: "useThemeMode() / useThemeFamily()",
            desc: "Granular reads for the current mode and family.",
          },
          {
            name: "useSetThemeMode() / useSetThemeFamily()",
            desc: "Granular setters — set mode or family independently.",
          },
          {
            name: "useToggleTheme()",
            desc: "Toggle function for light/dark.",
          },
          {
            name: "useThemeRuntime()",
            desc: "Access the full runtime: registry, history, lifecycle, plugins.",
          },
          {
            name: "useThemeHistory()",
            desc: "`{ undo, redo, canUndo, canRedo, clear }`.",
          },
          {
            name: "useThemeBatch()",
            desc: "Wrap `runtime.batch()` for atomic, coalesced updates.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore the full runtime state.",
          },
          {
            name: "useThemeTimeTravel()",
            desc: "`{ history, jump }` — indexed navigation through time.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to typed lifecycle events (`beforeThemeChange`, `afterPersist`, ...).",
          },
          {
            name: "useThemePacks()",
            desc: "Install a theme pack at runtime via `runtime.use()`.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive sunrise/sunset controller: `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`. Returns `null` when the provider has no `scheduled` option.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Apply a specific theme to a subtree; emits scoped CSS vars plus Tailwind-compatible `--color-*` / `--radius-*` variables.",
          },
          {
            name: "ThemeModeButton",
            desc: "One-click light → dark → system cycle button.",
          },
          {
            name: "ThemeInspector",
            desc: "Floating dev panel: active theme, selection, flattened tokens, generated CSS variables.",
          },
          {
            name: "useScopedTheme(ref, themeName)",
            desc: "Imperative scoping for any element ref.",
          },
          {
            name: "useThemePacks()",
            desc: "Install a theme pack at runtime via `runtime.use()`.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "createMuiAdapter() / createChakraAdapter()",
            desc: "Maps Theme Kit semantic tokens into native generated themes while preserving the framework-neutral runtime contract.",
          },
          {
            name: "createAntdAdapter() / createMuiAdapter() / createChakraAdapter()",
            desc: "Rebuilds the library theme from the active Theme Kit theme and exposes a reactive snapshot/subscribe bridge for React providers.",
          },
          {
            name: "MantineThemeProvider + createMantineTheme()",
            desc: "Mantine's generated-theme bridge: `createMantineTheme(runtime)` rebuilds the native Mantine theme from Theme Kit tokens, and `MantineThemeProvider` forces the color scheme to match the active mode.",
          },
          {
            name: "CSS-variable adapters",
            desc: "Shadcn, Bootstrap, DaisyUI, and Open Props adapters can be registered directly with the runtime; their factories do not require React.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Transitions are enabled by default (300ms, smooth). Pass `transition` to tune duration/easing/preset/properties, or `transition={{ enabled: false }}` to disable.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation for a single switch. For custom animation orchestration, compose the core diff/plan/runner APIs.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/App.tsx",
      lang: "tsx",
      code: `// src/App.tsx
import { ThemeProvider, useTheme } from "@theme-kit/react";

function Header() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme.name}</button>;
}

export function App() {
  return (
    <ThemeProvider defaultTheme="mint-light" transition={{ enabled: true }}>
      <Header />
    </ThemeProvider>
  );
}`,
    },
    snippet: {
      title: "src/ThemeSwitcher.tsx",
      lang: "tsx",
      code: `// src/ThemeSwitcher.tsx
import { useTheme } from "@theme-kit/react";

const page = {
  background: "var(--theme-color-background)",
  color: "var(--theme-color-foreground)",
  minHeight: "100vh",
  padding: "2rem",
};

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main style={page}>
      <h1>Theme Kit</h1>
      <p>Current theme: {theme.name} ({mode})</p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}`,
    },
    snippet2: {
      title: "src/theme-scope.tsx",
      lang: "tsx",
      code: `// src/theme-scope.tsx
import { ThemeProvider, ThemeScope, useThemeHistory } from "@theme-kit/react";

function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="mint-light">
      {/* Pinned to plum-dark regardless of the app-wide selection. */}
      <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
        <p>This subtree is always plum-dark.</p>
      </ThemeScope>
      <HistoryControls />
    </ThemeProvider>
  );
}`,
    },
    snippet3: {
      title: "src/main.tsx — optimized CSR bootstrap",
      lang: "tsx",
      code: `// src/main.tsx — optimized CSR bootstrap
import { createThemeRoot } from "@theme-kit/react";
import "@theme-kit/core/scrollbar.css";
import { App } from "./App";

createThemeRoot({
  container: document.getElementById("root")!,
  defaultTheme: "mint-light",
  initialMode: "system",
  transition: { enabled: true },
  // The runtime is handed in, so library providers can share the instance.
  render: () => <App />,
});`,
    },
    zeroFlashNote:
      "Included. `ThemeProvider` injects a blocking script into `<head>` before the first paint, so a returning visitor sees their saved theme immediately. For an SSR app, inline it yourself with `createThemeBootstrapScript()`.",
    modeNote:
      "`defaultTheme` chooses the starting theme. Add `initialMode=\"system\"` to follow the visitor's OS on the first visit.",
    configNote:
      "Themes and the starting mode come from the provider props. That is the whole setup, with or without a build tool. If you do build with Vite, you can declare them once in `theme.config.ts` instead and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.",
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "src/main.tsx",
      lang: "tsx",
      code: `// src/main.tsx
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@theme-kit/react";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" initialMode="system">
    <App />
  </ThemeProvider>,
);`,
    },
  },
  {
    slug: "next",
    name: "Next.js",
    icon: icons.next,
    pkg: "@theme-kit/next",
    tagline:
      "App Router theming with server-resolved themes, cookie persistence, and zero-flash.",
    mark: "N",
    tags: ["SSR", "RSC", "Zero-flash"],
    groups: [
      {
        label: "Server",
        features: [
          {
            name: "ThemeProvider (Server Component)",
            desc: "Reads `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration.",
          },
          {
            name: "Blocking bootstrap script",
            desc: "Emits a blocking script in `<head>` that applies the persisted theme before first paint.",
          },
          {
            name: "Dark-mode CSS fallback",
            desc: "Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`.",
          },
          {
            name: "scheduled prop",
            desc: "Pass `scheduled={{ lightTheme, darkTheme }}` to the server ThemeProvider to enable sunrise/sunset switching app-wide. Coordinates are optional — each visitor's timezone is auto-detected on the client.",
          },
        ],
      },
      {
        label: "Client",
        features: [
          {
            name: "@theme-kit/next/client",
            desc: "The client entry point. Exports ClientThemeProvider, ThemeBootstrap, createNextThemePersistence, every React hook, and ThemeScope / ThemeInspector / ThemeModeButton.",
          },
          {
            name: "ClientThemeProvider",
            desc: "Runtime for client components that need theme state. Mounts the runtime, syncs the `.dark` class, and persists the selection.",
          },
          {
            name: "ThemeBootstrap",
            desc: "Injects the SSR dark-mode CSS via `useServerInsertedHTML`.",
          },
          {
            name: "createNextThemePersistence()",
            desc: "Builds the adapter `ClientThemeProvider` uses: localStorage plus the `theme-mode`, `theme-family` and `theme-fingerprint` cookies the server reads on the next request.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive sunrise/sunset controller: `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Built-in runtime transition support. Configure duration/easing once on the provider; Theme Kit generates the transition styles at runtime, so applications do not need to maintain theme-transition rules in global CSS.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch from `@theme-kit/next/client`: call `runtime.store.set(theme, { suppressTransition: true })` when a switch must be instantaneous.",
          },
        ],
      },
      {
        label: "Scrollbar",
        features: [
          {
            name: "scrollbar prop",
            desc: "Enables Theme Kit's custom overlay scrollbar. The SSR bootstrap hides the native scrollbar before first paint, then the overlay engine synchronizes with browser scrolling without replacing native scroll behavior.",
          },
          {
            name: "scrollbar option",
            desc: "Configure the overlay appearance from semantic tokens, including an explicit color token when needed. The overlay remains theme-aware and updates with runtime theme changes.",
          },
        ],
      },
    ],
    quickStart: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `// app/layout.tsx
import type { ReactNode } from "react";
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }: { children: ReactNode }) {
  // ThemeProvider renders <html>, <head> and <body> itself.
  return (
    <ThemeProvider defaultTheme="mint-light">
      {children}
    </ThemeProvider>
  );
}`,
    },
    snippet: {
      title: "app/theme-switcher.tsx",
      lang: "tsx",
      code: `// app/theme-switcher.tsx
"use client";
import { useTheme } from "@theme-kit/next/client";

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main
      style={{
        background: "var(--theme-color-background)",
        color: "var(--theme-color-foreground)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Theme Kit</h1>
      <p>Current theme: {theme.name} ({mode})</p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}`,
    },
    snippet2: {
      title: "app/dashboard.tsx",
      lang: "tsx",
      code: `// app/dashboard.tsx — scoped theming + history controls
"use client";
import { ThemeScope, useThemeHistory } from "@theme-kit/next/client";

export function Dashboard() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();

  return (
    <div>
      <div>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>

      {/* Pinned to plum-dark, whatever the rest of the page is using. */}
      <ThemeScope theme="plum-dark">
        <p>This subtree is always plum-dark.</p>
      </ThemeScope>
    </div>
  );
}`,
    },
    zeroFlashNote:
      "Included. `ThemeProvider` resolves the first paint on the server and renders the pre-paint script into `<head>` itself. There is no bundler plugin to add.",
    modeNote:
      "The server resolves the mode from the persisted cookies, so a first-time visitor starts on `defaultTheme`. Once they pick System, that choice is stored and reused on every later request.",
    configNote:
      "Themes and the starting mode come from the provider in `app/layout.tsx`. Next does not use Vite, so there is no bundler plugin to add: the provider resolves the selection on the server and emits the pre-paint script itself.",
    styles: {
      title: "app/globals.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "app/layout.tsx",
      lang: "tsx",
      code: `// app/layout.tsx
import { ThemeProvider } from "@theme-kit/next";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}`,
    },
  },
  {
    slug: "vue",
    name: "Vue 3",
    icon: icons.vue,
    pkg: "@theme-kit/vue",
    tagline:
      "Provider and composables for Vue 3, with scoped themes.",
    mark: "V",
    tags: ["Composition API", "Provider"],
    groups: [
      {
        label: "Setup",
        features: [
          {
            name: "ThemeProvider",
            desc: "Provider component accepting every runtime option; auto-registered via `app.use` (`.install`).",
          },
          {
            name: "provideThemeRuntime() / useThemeRuntime()",
            desc: "Explicit provide/inject access to the runtime.",
          },
        ],
      },
      {
        label: "Composables",
        features: [
          {
            name: "useTheme()",
            desc: "Reactive refs for `theme`, `mode`, `family` plus `setMode`, `setFamily`, `toggleTheme`.",
          },
          {
            name: "useThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "useThemeBatch()",
            desc: "Atomic, coalesced updates via `runtime.batch()`.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore the full runtime state.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to typed lifecycle events.",
          },
          {
            name: "useThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive schedule state (a `Ref` with `enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus `enable()`/`disable()`/`set()`. Configure via the `scheduled` prop on ThemeProvider.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "Adapter framework subpaths",
            desc: "CSS-variable adapters own their framework wrappers behind subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional peers — they are not re-exported by the framework package.",
          },
          {
            name: "useShadcnTheme(runtime) / useBootstrapTheme(runtime)",
            desc: "Composables on each adapter's framework subpath install the React-free CSS-variable factory and dispose the returned handle with the component lifecycle. Pass the runtime from this framework's runtime getter.",
          },
          {
            name: "useDaisyTheme(runtime) / useOpenPropsTheme(runtime)",
            desc: "Same contract for DaisyUI and Open Props. The adapter subpath supplies lifecycle wiring while the factory stays framework-neutral.",
          },
          {
            name: "adapter factory subpaths",
            desc: "Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without any framework.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Scoped theming component for subtrees.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/App.vue",
      lang: "vue",
      code: `<!-- src/App.vue -->
<script setup lang="ts">
import { ThemeProvider } from "@theme-kit/vue";
</script>

<template>
  <!-- \`default-theme\` picks the theme. Add \`initial-mode="system"\` to follow
       the OS preference instead of the theme's own mode. -->
  <ThemeProvider default-theme="mint-light">
    <h1>Hello, themed world</h1>
  </ThemeProvider>
</template>`,
    },
    snippet: {
      title: "src/ThemeSwitcher.vue",
      lang: "vue",
      code: `<!-- src/ThemeSwitcher.vue -->
<script setup lang="ts">
import { useTheme } from "@theme-kit/vue";
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <main class="page">
    <h1>Theme Kit</h1>
    <p>Current theme: {{ theme.name }} ({{ mode }})</p>

    <button class="primary" @click="toggleTheme">Toggle theme</button>

    <section class="card">
      <h2>Themed card</h2>
      <p class="muted">Surface, border and text follow the theme.</p>
    </section>
  </main>
</template>

<style scoped>
  .page {
    background: var(--theme-color-background);
    color: var(--theme-color-foreground);
    min-height: 100vh;
    padding: 2rem;
  }
  .primary {
    background: var(--theme-color-primary);
    color: var(--theme-color-primaryForeground);
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .card {
    background: var(--theme-color-card);
    border: 1px solid var(--theme-color-border);
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
  }
  .muted {
    color: var(--theme-color-mutedForeground);
  }
</style>`,
    },
    snippet2: {
      title: "src/ThemeScopeExample.vue",
      lang: "vue",
      code: `<!-- src/ThemeScopeExample.vue -->
<script setup lang="ts">
// Import both explicitly — \`ThemeScope\` is only globally registered if your
// entry does \`app.use(ThemeScope)\`.
import { ThemeScope, useThemeHistory } from "@theme-kit/vue";
const { undo, redo, canUndo, canRedo } = useThemeHistory();
</script>

<template>
  <div>
    <button @click="undo" :disabled="!canUndo">Undo</button>
    <button @click="redo" :disabled="!canRedo">Redo</button>

    <ThemeScope theme="plum-dark">
      <p>This subtree is always plum-dark.</p>
    </ThemeScope>
  </div>
</template>`,
    },
    zeroFlashNote:
      "Included. `<ThemeProvider>` injects a blocking script into `<head>` before the first paint. For an SSR app, inline it with `createThemeBootstrapScript()` instead.",
    modeNote:
      "`default-theme` chooses the starting theme. Add `initial-mode=\"system\"` to follow the visitor's OS on the first visit.",
    configNote:
      "Themes and the starting mode come from the provider props. If you do build with Vite, you can declare them once in `theme.config.ts` instead and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.",
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "src/App.vue",
      lang: "vue",
      code: `<!-- src/App.vue — no theme definition needed -->
<script setup lang="ts">
import { ThemeProvider } from "@theme-kit/vue";
</script>

<!-- No \`themes\` prop → built-in neutral theme.
     default-theme picks the theme; initial-mode="system" is the opt-in for
     following the OS. The provider hands that mode to BOTH the pre-paint
     script it injects and the runtime, so the two cannot disagree. -->
<template>
  <ThemeProvider default-theme="light" initial-mode="system">
    <h1>Hello, themed world</h1>
  </ThemeProvider>
</template>`,
    },
  },
  {
    slug: "svelte",
    name: "Svelte 5",
    icon: icons.svelte,
    pkg: "@theme-kit/svelte",
    tagline:
      "Provider and readable stores for Svelte 5, with scoped themes and transitions.",
    mark: "S",
    tags: ["Context", "Stores", "Runes"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProvider",
            desc: "Context-based provider that wires DOM + CSS variable bindings.",
          },
          {
            name: "getThemeRuntime() / setThemeRuntime()",
            desc: "Context helpers for retrieving or overriding the runtime.",
          },
        ],
      },
      {
        label: "Stores",
        features: [
          {
            name: "useTheme()",
            desc: "Reactive readable stores for `theme`, `mode`, `family` and their setters.",
          },
          {
            name: "useThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "useThemeBatch()",
            desc: "Atomic, coalesced updates.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore runtime state.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to lifecycle events.",
          },
          {
            name: "useThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "useThemeSchedule() / getThemeSchedule()",
            desc: "Reactive readable store of the schedule state (`enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus the imperative `ThemeSchedule` controller. Configure via the `scheduled` prop on ThemeProvider.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "Adapter framework subpaths",
            desc: "CSS-variable adapters own their framework wrappers behind subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional peers — they are not re-exported by the framework package.",
          },
          {
            name: "useShadcnTheme(runtime) / useBootstrapTheme(runtime)",
            desc: "Composables on each adapter's framework subpath install the React-free CSS-variable factory and dispose the returned handle with the component lifecycle. Pass the runtime from this framework's runtime getter.",
          },
          {
            name: "useDaisyTheme(runtime) / useOpenPropsTheme(runtime)",
            desc: "Same contract for DaisyUI and Open Props. The adapter subpath supplies lifecycle wiring while the factory stays framework-neutral.",
          },
          {
            name: "adapter factory subpaths",
            desc: "Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without any framework.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Scoped theming component for subtrees.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/App.svelte",
      lang: "svelte",
      code: `<!-- src/App.svelte -->
<script lang="ts">
  import { ThemeProvider } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
</script>

<!-- \`defaultTheme\` picks the theme. Add \`initialMode="system"\` to follow the
     OS preference instead of the theme's own mode. -->
<ThemeProvider defaultTheme="mint-light">
  <ThemeSwitcher />
</ThemeProvider>`,
    },
    snippet: {
      title: "src/ThemeSwitcher.svelte",
      lang: "svelte",
      code: `<!-- src/ThemeSwitcher.svelte -->
<script lang="ts">
  import { useTheme } from "@theme-kit/svelte";
  const { theme, mode, toggleTheme } = useTheme();
</script>

<main class="page">
  <h1>Theme Kit</h1>
  <p>Current theme: {$theme.name} ({$mode})</p>

  <button class="primary" onclick={toggleTheme}>Toggle theme</button>

  <section class="card">
    <h2>Themed card</h2>
    <p class="muted">Surface, border and text follow the theme.</p>
  </section>
</main>

<style>
  .page {
    background: var(--theme-color-background);
    color: var(--theme-color-foreground);
    min-height: 100vh;
    padding: 2rem;
  }
  .primary {
    background: var(--theme-color-primary);
    color: var(--theme-color-primaryForeground);
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .card {
    background: var(--theme-color-card);
    border: 1px solid var(--theme-color-border);
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
  }
  .muted {
    color: var(--theme-color-mutedForeground);
  }
</style>`,
    },
    snippet2: {
      title: "src/App.svelte — history + scope",
      lang: "svelte",
      code: `<!-- src/App.svelte -->
<script lang="ts">
  import { ThemeProvider, ThemeScope, useThemeHistory } from "@theme-kit/svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";

  // \`undo\` / \`redo\` are functions; \`canUndo\` / \`canRedo\` are readable stores,
  // so they are read with \`$\` in the markup.
  const { undo, redo, canUndo, canRedo } = useThemeHistory();
</script>

<ThemeProvider defaultTheme="mint-light">
  <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
    <p>Scoped to plum-dark</p>
  </ThemeScope>

  <button onclick={undo} disabled={!$canUndo}>Undo</button>
  <button onclick={redo} disabled={!$canRedo}>Redo</button>

  <ThemeSwitcher />
</ThemeProvider>`,
    },
    zeroFlashNote:
      "Included. `<ThemeProvider>` injects a blocking script into `<head>` before the first paint. For an SSR app, inline it with `createThemeBootstrapScript()` instead.",
    modeNote:
      "`defaultTheme` chooses the starting theme. Add `initialMode=\"system\"` to follow the visitor's OS on the first visit.",
    configNote:
      "Themes and the starting mode come from the provider props. SvelteKit is Vite-based, so you can declare them once in `theme.config.ts` and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.",
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "src/App.svelte",
      lang: "svelte",
      code: `<!-- src/App.svelte — no theme definition needed -->
<script lang="ts">
  import { ThemeProvider } from "@theme-kit/svelte";
</script>

<!-- No \`themes\` prop → built-in neutral theme.
     defaultTheme picks the theme; initialMode="system" is the opt-in for
     following the OS. The provider hands that mode to BOTH the pre-paint
     script it injects and the runtime, so the two cannot disagree. -->
<ThemeProvider defaultTheme="light" initialMode="system">
  <h1>Hello, themed world</h1>
</ThemeProvider>`,
    },
  },
  {
    slug: "solid",
    name: "Solid",
    icon: icons.solid,
    pkg: "@theme-kit/solid",
    tagline:
      "Signals-first theming with a context provider and scoped subtrees.",
    mark: "So",
    tags: ["Signals", "Context"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ThemeProvider",
            desc: "Context provider with DOM + CSS variable bindings.",
          },
        ],
      },
      {
        label: "Signals",
        features: [
          {
            name: "useTheme()",
            desc: "Signals for `theme`, `mode`, `family` with getter access and setters.",
          },
          {
            name: "useThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "useThemeBatch()",
            desc: "Atomic, coalesced updates.",
          },
          {
            name: "useThemeSnapshot() / useThemeRestore()",
            desc: "Serialize and restore runtime state.",
          },
          {
            name: "useThemeLifecycle()",
            desc: "Subscribe to lifecycle events.",
          },
          {
            name: "useThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Reactive sunrise/sunset controller with signal-backed `enabled`, `active`, `status`, `sunrise`, `sunset`, `nextTransition` plus `enable()`/`disable()`/`set()`. Configure via the `scheduled` prop on ThemeProvider.",
          },
        ],
      },
      {
        label: "Library adapters",
        features: [
          {
            name: "Adapter framework subpaths",
            desc: "CSS-variable adapters own their framework wrappers behind subpaths (`/react`, `/vue`, `/svelte`, `/solid`, `/angular`) with optional peers — they are not re-exported by the framework package.",
          },
          {
            name: "useShadcnTheme(runtime) / useBootstrapTheme(runtime)",
            desc: "Composables on each adapter's framework subpath install the React-free CSS-variable factory and dispose the returned handle with the component lifecycle. Pass the runtime from this framework's runtime getter.",
          },
          {
            name: "useDaisyTheme(runtime) / useOpenPropsTheme(runtime)",
            desc: "Same contract for DaisyUI and Open Props. The adapter subpath supplies lifecycle wiring while the factory stays framework-neutral.",
          },
          {
            name: "adapter factory subpaths",
            desc: "Use `@theme-kit/shadcn/factory`, `@theme-kit/bootstrap/factory`, `@theme-kit/daisyui/factory`, or `@theme-kit/open-props/factory` when you need the adapter without any framework.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.",
          },
        ],
      },
      {
        label: "Components",
        features: [
          {
            name: "ThemeScope",
            desc: "Scoped theming component for subtrees.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/main.tsx",
      lang: "tsx",
      code: `// src/main.tsx
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import { App } from "./App";

render(
  () => (
    <ThemeProvider defaultTheme="mint-light">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);`,
    },
    snippet: {
      title: "src/App.tsx",
      lang: "tsx",
      code: `// src/App.tsx
import { useTheme } from "@theme-kit/solid";

const page = {
  background: "var(--theme-color-background)",
  color: "var(--theme-color-foreground)",
  "min-height": "100vh",
  padding: "2rem",
};

export function App() {
  // Signals: call them to read the current value.
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main style={page}>
      <h1>Theme Kit</h1>
      <p>
        Current theme: {theme().name} ({mode()})
      </p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          "border-radius": "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          "border-radius": "0.75rem",
          "margin-top": "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}`,
    },
    snippet2: {
      title: "src/App.tsx — history + scope",
      lang: "tsx",
      code: `// src/App.tsx
import { ThemeProvider, ThemeScope, useThemeHistory } from "@theme-kit/solid";

function HistoryControls() {
  // \`canUndo\` / \`canRedo\` are getters — read them off the object in JSX.
  // Destructuring freezes the mount-time value and the buttons never enable.
  const history = useThemeHistory();
  return (
    <div>
      <button onClick={history.undo} disabled={!history.canUndo}>Undo</button>
      <button onClick={history.redo} disabled={!history.canRedo}>Redo</button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="mint-light">
      <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
        <span>Always plum-dark</span>
      </ThemeScope>
      <HistoryControls />
    </ThemeProvider>
  );
}`,
    },
    zeroFlashNote:
      "Included. `<ThemeProvider>` injects a blocking script into `<head>` before the first paint. For an SSR app, inline it with `createThemeBootstrapScript()` instead.",
    modeNote:
      "`defaultTheme` chooses the starting theme. Add `initialMode=\"system\"` to follow the visitor's OS on the first visit.",
    configNote:
      "Themes and the starting mode come from the provider props. If you do build with Vite, you can declare them once in `theme.config.ts` instead and let `themeKitVitePlugin()` derive the pre-paint bootstrap from the same file — the provider then takes no theme props. The plugin is optional either way.",
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "src/main.tsx",
      lang: "tsx",
      code: `// src/main.tsx
import { render } from "solid-js/web";
import { ThemeProvider } from "@theme-kit/solid";
import { App } from "./App";

render(
  () => (
    <ThemeProvider defaultTheme="light" initialMode="system">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!,
);`,
    },
  },
  {
    slug: "angular",
    name: "Angular",
    icon: icons.angular,
    pkg: "@theme-kit/angular",
    tagline:
      "Standalone-API theming with DI providers, reactive injectables, and a scoping directive.",
    mark: "A",
    tags: ["DI", "Directive", "SSR"],
    groups: [
      {
        label: "Setup",
        features: [
          {
            name: "provideThemeKit(options)",
            desc: "App-level providers from a ThemeRuntimeOptions config.",
          },
          {
            name: "provideThemeKitRuntime(runtime)",
            desc: "Provide an existing shared runtime instance.",
          },
        ],
      },
      {
        label: "Injectables",
        features: [
          {
            name: "injectThemeRuntime()",
            desc: "Inject the full runtime.",
          },
          {
            name: "injectTheme()",
            desc: "Reactive `ThemeState` — theme, mode, family plus setters.",
          },
          {
            name: "injectThemeHistory()",
            desc: "Undo / redo / jump through theme history.",
          },
          {
            name: "injectThemeBatch()",
            desc: "Atomic, coalesced updates.",
          },
          {
            name: "injectThemeSnapshot() / injectThemeRestore()",
            desc: "Serialize and restore runtime state.",
          },
          {
            name: "injectThemeTimeTravel()",
            desc: "`{ history, jump }` — indexed time travel.",
          },
          {
            name: "injectThemeLifecycle()",
            desc: "Subscribe to lifecycle events.",
          },
          {
            name: "injectThemePacks()",
            desc: "Install theme packs at runtime.",
          },
          {
            name: "injectThemeSchedule()",
            desc: "Reactive sunrise/sunset controller: `state()` is a Signal of `enabled`, `status`, `sunrise`, `sunset`, `nextTransition`; plus `enable()`/`disable()`/`set()`. Configure via `scheduled` in `provideThemeKit()`.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition in provideThemeKit()",
            desc: "Pass `transition` config to `provideThemeKit()` to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.",
          },
        ],
      },
      {
        label: "Directives",
        features: [
          {
            name: "ThemeScopeDirective",
            desc: "Element-scoped theming via a directive.",
          },
        ],
      },
      {
        label: "SSR & Bootstrap",
        features: [
          {
            name: "createAngularPersistence()",
            desc: "Angular-flavored persistence adapter.",
          },
          {
            name: "createBlockingScriptContent / buildThemeCSSMap",
            desc: "Blocking `<script>` plus a critical `<style>` carrying the resolved theme's CSS variables, so a server-rendered page paints themed. For `system` mode it emits both schemes as media blocks.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/main.ts",
      lang: "ts",
      code: `// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ defaultTheme: "mint-light" })],
});`,
    },
    snippet: {
      title: "src/app/theme-switcher.component.ts",
      lang: "ts",
      code: `// src/app/theme-switcher.component.ts
import { Component } from "@angular/core";
import { injectTheme } from "@theme-kit/angular";

@Component({
  selector: "theme-switcher",
  standalone: true,
  template: \`
    <main class="page">
      <h1>Theme Kit</h1>
      <p>Current theme: {{ state().theme.name }} ({{ state().mode }})</p>

      <button class="primary" (click)="toggle()">Toggle theme</button>

      <section class="card">
        <h2>Themed card</h2>
        <p class="muted">Surface, border and text follow the theme.</p>
      </section>
    </main>
  \`,
  styles: \`
    .page {
      background: var(--theme-color-background);
      color: var(--theme-color-foreground);
      min-height: 100vh;
      padding: 2rem;
    }
    .primary {
      background: var(--theme-color-primary);
      color: var(--theme-color-primaryForeground);
      border: 0;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
    }
    .card {
      background: var(--theme-color-card);
      border: 1px solid var(--theme-color-border);
      border-radius: 0.75rem;
      margin-top: 1.5rem;
      padding: 1rem;
    }
    .muted {
      color: var(--theme-color-mutedForeground);
    }
  \`,
})
export class ThemeSwitcherComponent {
  // Must be public — Angular templates cannot access private members.
  state = injectTheme();

  toggle() {
    this.state().toggleTheme();
  }
}`,
    },
    snippet2: {
      title: "src/app/history-controls.component.ts",
      lang: "ts",
      code: `// src/app/history-controls.component.ts
import { Component } from "@angular/core";
import type { ThemeTransitionOptions } from "@theme-kit/core";
import {
  injectThemeHistory,
  ThemeScopeDirective,
} from "@theme-kit/angular";

@Component({
  selector: "history-controls",
  standalone: true,
  imports: [ThemeScopeDirective],
  template: \`
    <div [themeKitScope]="'plum-dark'" [themeKitScopeTransition]="transition">
      Scoped to plum-dark
    </div>
    <button (click)="undo()" [disabled]="!canUndo()">Undo</button>
    <button (click)="redo()" [disabled]="!canRedo()">Redo</button>
  \`,
})
export class HistoryControlsComponent {
  // \`history\` is a signal of \`{ canUndo, canRedo }\`; \`undo\`/\`redo\` are actions.
  private history = injectThemeHistory();

  transition: ThemeTransitionOptions = { duration: 300, easing: "ease" };

  canUndo() { return this.history.history().canUndo; }
  canRedo() { return this.history.history().canRedo; }
  undo() { this.history.undo(); }
  redo() { this.history.redo(); }
}`,
    },
    snippet3: {
      title: "src/app/app.component.ts",
      lang: "ts",
      code: `// src/app/app.component.ts
import { Component } from "@angular/core";
import { ThemeSwitcherComponent } from "./theme-switcher.component";
import { HistoryControlsComponent } from "./history-controls.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ThemeSwitcherComponent, HistoryControlsComponent],
  template: \`
    <header><theme-switcher /></header>
    <main><history-controls /></main>
  \`,
})
export class AppComponent {}`,
    },
    zeroFlashNote:
      "Not automatic. Render `createBlockingScriptContent()` into `index.html`’s `<head>` to paint the persisted theme before the bundle loads — without it the first frame is the default theme.",
    modeNote:
      "`provideThemeKit({ defaultTheme, initialMode })` chooses the starting theme. `initialMode: \"system\"` follows the visitor's OS.",
    configNote:
      "Themes and the starting mode are passed to `provideThemeKit()` when the app bootstraps. Angular does not use Vite, so there is no bundler plugin to add: the provider emits the pre-paint script.",
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "src/main.ts",
      lang: "ts",
      code: `// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideThemeKit } from "@theme-kit/angular";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideThemeKit({ defaultTheme: "light", initialMode: "system" })],
});`,
    },
  },
  {
    slug: "web",
    name: "Web Components",
    icon: icons.web,
    pkg: "@theme-kit/web",
    tagline:
      "Framework-free theming for any HTML page, through custom elements and CSS variables.",
    mark: "W",
    tags: ["No framework", "Custom elements"],
    groups: [
      {
        label: "Setup",
        features: [
          {
            name: "defineCustomElements()",
            desc: "Registers every `<theme-kit-*>` custom element.",
          },
        ],
      },
      {
        label: "Elements",
        features: [
          {
            name: "<theme-kit-provider>",
            desc: "Root runtime provider for a page or subtree.",
          },
          {
            name: "<theme-kit-scope>",
            desc: "Scoped theming via the `theme` attribute.",
          },
          {
            name: "<theme-kit-toggle>",
            desc: "Light/dark toggle button.",
          },
          {
            name: "<theme-kit-select>",
            desc: "Family / mode selector.",
          },
        ],
      },
      {
        label: "Adapters",
        features: [
          {
            name: "Framework-neutral adapter factories",
            desc: "Use Theme Kit adapter factories directly with the web runtime; no React, Vue, Svelte, Solid, or Angular layer is required.",
          },
          {
            name: "CSS-variable ecosystem",
            desc: "CSS-variable adapters update the document's variables/styles from the active runtime theme, making them suitable for framework-free pages and custom elements.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition attribute",
            desc: "Set `transition` attribute on `<theme-kit-provider>` to enable CSS transitions.",
          },
          {
            name: "getProviderRuntime()",
            desc: "Reads the runtime off a `<theme-kit-provider>` element once it has upgraded — `getProviderRuntime(providerEl)`. Returns `undefined` before then, and `undefined` if you pass an element that is not a provider.",
          },
        ],
      },
      {
        label: "Imperative",
        features: [
          {
            name: "getProviderRuntime()",
            desc: "Imperative access to the runtime: `getProviderRuntime(providerEl)`. From there `runtime.selection.setMode(\"dark\")`, `setFamily()` and `toggleTheme()` change the theme without a custom element.",
          },
          {
            name: "Reading the current theme",
            desc: "Read the nearest provider's current state from plain JavaScript — the vanilla equivalent of the framework hooks. They are getters, not subscriptions: re-read them inside a `runtime.store.subscribe()` callback.",
          },
        ],
      },
    ],
    quickStart: {
      title: "index.html",
      lang: "html",
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My app</title>

    <!-- Written by scripts/write-bootstrap.mjs, so the page paints themed. -->
    <script src="/bootstrap.js"></script>

    <script type="importmap">
      {
        "imports": {
          "@theme-kit/core": "/node_modules/@theme-kit/core/dist/index.js",
          "@theme-kit/web": "/node_modules/@theme-kit/web/dist/index.js"
        }
      }
    </script>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
      <theme-kit-toggle></theme-kit-toggle>
      <theme-kit-select type="mode"></theme-kit-select>
      <theme-kit-select type="family"></theme-kit-select>
    </theme-kit-provider>

    <script type="module">
      import { defineCustomElements } from "@theme-kit/web";
      defineCustomElements();
    </script>
  </body>
</html>`,
    },
    snippet: {
      title: "index.html — a themed page with a toggle",
      lang: "html",
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      .page {
        background: var(--theme-color-background);
        color: var(--theme-color-foreground);
        min-height: 100vh;
        padding: 2rem;
      }
      .primary {
        background: var(--theme-color-primary);
        color: var(--theme-color-primaryForeground);
        border: 0;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
      }
      .card {
        background: var(--theme-color-card);
        border: 1px solid var(--theme-color-border);
        border-radius: 0.75rem;
        margin-top: 1.5rem;
        padding: 1rem;
      }
      .muted {
        color: var(--theme-color-mutedForeground);
      }
    </style>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
      <main class="page">
        <h1>Theme Kit</h1>
        <p>Current theme: <span id="current">light</span></p>

        <theme-kit-toggle></theme-kit-toggle>

        <section class="card">
          <h2>Themed card</h2>
          <p class="muted">Surface, border and text follow the theme.</p>
        </section>
      </main>
    </theme-kit-provider>

    <script type="module">
      import {
        defineCustomElements,
        getProviderRuntime,
        useThemeValue,
      } from "@theme-kit/web";

      defineCustomElements();

      // The helpers are getters, so re-read them when the store changes.
      const runtime = getProviderRuntime(
        document.querySelector("theme-kit-provider"),
      );
      const label = document.getElementById("current");

      runtime.store.subscribe(() => {
        label.textContent = useThemeValue().name;
      });
    </script>
  </body>
</html>`,
    },
    snippet2: {
      title: "index.html — scope + selects",
      lang: "html",
      code: `<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<theme-kit-provider default-theme="light">
  <theme-kit-select type="mode"></theme-kit-select>
  <theme-kit-select type="family"></theme-kit-select>

  <theme-kit-scope theme="plum">
    <p>This region is always themed "plum".</p>
  </theme-kit-scope>
</theme-kit-provider>`,
    },
    zeroFlashNote:
      "You supply the script. `createThemeBootstrapScript()` writes it — see Quick Start for the generator — and it must load in `<head>` before the module script. Without it the page paints the default theme and corrects on load.",
    modeNote:
      "`default-theme` chooses the starting theme. `initial-mode=\"system\"` follows the visitor's OS.",
    configNote:
      "Themes and the starting mode are attributes on `<theme-kit-provider>`. The pre-paint script you generate is built from the same values, and there is nothing else to configure.",
    styles: {
      title: "styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "index.html",
      lang: "html",
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My app</title>

    <!-- Written by scripts/write-bootstrap.mjs, so the page paints themed. -->
    <script src="/bootstrap.js"></script>

    <!-- Bare specifiers need a map when no bundler rewrites them. -->
    <script type="importmap">
      {
        "imports": {
          "@theme-kit/core": "/node_modules/@theme-kit/core/dist/index.js",
          "@theme-kit/web": "/node_modules/@theme-kit/web/dist/index.js"
        }
      }
    </script>
  </head>
  <body>
    <theme-kit-provider default-theme="light" initial-mode="system">
      <my-app></my-app>
    </theme-kit-provider>

    <script type="module">
      import { defineCustomElements } from "@theme-kit/web";
      defineCustomElements();
    </script>
  </body>
</html>`,
    },
    setupExtra: {
      title: "scripts/write-bootstrap.mjs",
      lang: "js",
      code: `// Generates the pre-paint script index.html loads. Run it before serving:
//   node scripts/write-bootstrap.mjs
import { writeFileSync } from "node:fs";
import { createThemeBootstrapScript, getBuiltInThemes } from "@theme-kit/core";

writeFileSync(
  "bootstrap.js",
  createThemeBootstrapScript({
    themes: getBuiltInThemes(),
    defaultTheme: "light",
    initialMode: "system",
  }),
);`,
    },
  },
  {
    slug: "tailwind",
    name: "Tailwind CSS v4",
    icon: icons.tailwind,
    pkg: "@theme-kit/tailwind",
    cssOnly: true,
    tagline:
      "Map every semantic token to Tailwind v4 utilities and theme variables.",
    mark: "TW",
    tags: ["CSS", "Design tokens", "v4"],
    groups: [
      {
        label: "Integration",
        features: [
          {
            name: '@import "@theme-kit/tailwind"',
            desc: "One import maps tokens to `@theme` variables: `--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`.",
          },
          {
            name: "Dark-mode variant",
            desc: "`@custom-variant dark (&:where(.dark, .dark *))` — scoped to the `.dark` class Theme Kit maintains.",
          },
          {
            name: "synchronizeDarkClass(theme)",
            desc: "Keeps the `.dark` class in sync with the active theme.",
          },
          {
            name: "CSS layers",
            desc: "Ships `theme.css`, `dark.css` and `preflight.css` layers.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "CSS transition variables",
            desc: "Theme Kit exposes transition variables for Tailwind-aware styling, while the runtime owns the actual theme-change orchestration; you do not need to hand-author a global transition block just to get smooth theme changes.",
          },
          {
            name: "themeCSS",
            desc: "Tailwind-compatible `@theme` variable block generated from your Theme Kit tokens, imported via the package's CSS entry.",
          },
        ],
      },
    ],
    quickStart: {
      title: "src/globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

body {
  @apply bg-background text-foreground;
}`,
    },
    snippet: {
      title: "src/components/Card.tsx — semantic utilities",
      lang: "tsx",
      code: `// src/components/Card.tsx
export function Card() {
  return (
    <section className="bg-card text-card-foreground border border-border rounded-lg p-4">
      <h2 className="text-lg font-semibold">Your plan</h2>
      <p className="text-muted-foreground text-sm">
        Everything below inherits the active theme.
      </p>
      <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
        Upgrade
      </button>
    </section>
  );
}`,
    },
    snippet2: {
      title: "src/globals.css — token → utility map",
      lang: "css",
      code: `/* @theme-kit/tailwind maps every semantic token onto a Tailwind v4 utility.
   The ones you will reach for most:

     .bg-background          .text-foreground
     .bg-card                .text-card-foreground
     .bg-popover             .text-popover-foreground
     .bg-primary             .text-primary-foreground
     .bg-secondary           .text-secondary-foreground
     .bg-muted               .text-muted-foreground
     .bg-accent              .text-accent-foreground
     .bg-destructive         .text-destructive-foreground
     .bg-success             .text-success-foreground
     .border-border          .bg-input          .ring-ring

   Plus the token-driven scales, all reading --theme-* variables:

     .rounded-lg             --theme-radius-lg
     .p-4 .gap-2 .mt-6       --theme-spacing-*
     .shadow-md              --theme-shadow-md
     .border-2               --theme-border-width-*
     .z-40                   --theme-z-index-*

   Because the variables are live, Tailwind's \`dark:\` variant is optional —
   the runtime already swapped the values behind these utilities. */`,
    },
    zeroFlashNote:
      "Tailwind is build-time only — it maps tokens to utilities and never runs. Zero-flash comes from the runtime you mount, which here is `@theme-kit/react`, and that injects the script itself.",
    modeNote:
      "Tailwind maps tokens to utilities — it has no runtime of its own, so the starting mode comes from the adapter you install alongside it.",
    configNote:
      "This CSS import is the whole Tailwind integration — Tailwind maps tokens to utilities at build time and never runs in the browser. The runtime that switches themes is a separate package, installed in step 1.",
    extraPackages: ["@theme-kit/react"],
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "src/globals.css",
      lang: "css",
      code: `@import "tailwindcss";
@import "@theme-kit/tailwind";

/* No custom themes? The built-in neutral light/dark set
   maps straight to utilities — bg-background, text-foreground,
   bg-primary, text-primary-foreground and the rest. */
body {
  @apply bg-background text-foreground;
}`,
    },
    switchSnippet: {
      title: "src/ThemeSwitcher.tsx",
      lang: "tsx",
      code: `// src/ThemeSwitcher.tsx — the runtime here is @theme-kit/react
import { useTheme } from "@theme-kit/react";

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-semibold">Theme Kit</h1>
      <p className="text-muted-foreground">
        Current theme: {theme.name} ({mode})
      </p>

      <button
        onClick={toggleTheme}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Toggle theme
      </button>

      <section className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Themed card</h2>
        <p className="text-sm text-muted-foreground">
          Every utility here resolves to a Theme Kit token.
        </p>
      </section>
    </main>
  );
}`,
    },
  },
  {
    slug: "astro",
    name: "Astro",
    icon: icons.astro,
    pkg: "@theme-kit/astro",
    tagline:
      "Astro-native theming: an integration for the pre-paint bootstrap, a React-free <html> layout, a native <ThemeToggle />, and opt-in client islands.",
    mark: "As",
    tags: ["Integration", "Components", "Islands", "Zero-flash"],
    groups: [
      {
        label: "Astro integration",
        features: [
          {
            name: "theme.config.ts discovery",
            desc: "`themeKit()` finds `theme.config.ts` at the project root and derives everything from it — the pre-paint bootstrap and the runtime's configuration. Nothing is repeated in `astro.config.mjs`.",
          },
          {
            name: "Configuration transport",
            desc: "Injects the bootstrap projection as `window.__THEME_KIT_CONFIG__` from `<head>`. The island reads it instead of taking theme props, so its server-rendered and hydrated markup come from the same registry.",
          },
          {
            name: "themeKit() in astro.config.mjs",
            desc: "Registers the integration and injects the pre-paint bootstrap into every page's <head> with `injectScript(\"head-inline\")`.",
          },
          {
            name: "Zero-flash bootstrap",
            desc: "Reads the persisted cookies, resolves the effective mode against `prefers-color-scheme`, and applies the CSS variables plus `data-theme` before first paint.",
          },
          {
            name: "navigation: true (default)",
            desc: "Keeps the resolved theme across `<ClientRouter />` navigations — Astro otherwise copies each incoming page's `<html>` attributes over the live root. Inert without `<ClientRouter />`.",
          },
          {
            name: "No client framework required",
            desc: "`@theme-kit/astro` imports no React — the integration, the server helpers, the `<ThemeToggle />` component and the browser runtime are all framework-neutral. React is an optional peer, pulled in only by an island.",
          },
        ],
      },
      {
        label: "Astro components (no React)",
        features: [
          {
            name: "provider.astro",
            desc: "Server-renders the themed `<html data-theme>` from the request cookies. A concrete mode inlines that theme's variables; `system` emits both schemes as media blocks instead, since an inline variable would outrank the dark block.",
          },
          {
            name: "ThemeToggle.astro",
            desc: "A native Astro toggle: a real `<button>`, so keyboard and focus behaviour come from the platform. No island, no `client:load`, and no per-page `initialMode` / `initialFamily`. `showMode` makes its text the live mode.",
          },
          {
            name: "getThemeController()",
            desc: "The framework-neutral browser API, from `@theme-kit/astro/runtime`. Not a hook: a plain object with `getMode()`, `setMode()`, `setFamily()`, `toggleTheme()` and `subscribe()`, valid in any `<script>`. Idempotent — one runtime per document, shared with every other consumer.",
          },
          {
            name: "data-tk-readout",
            desc: "Marks an element whose text Theme Kit owns. The pre-paint bootstrap patches it from `<head>`, before the body is parsed, and the controller keeps it in sync afterwards — so a server-rendered label is never painted and then corrected.",
          },
          {
            name: "getInitialThemeState()",
            desc: "Resolves the initial state from `Astro.request` so a client island hydrates against exactly what the document rendered. Needs the registry (`config` or `themes`) and a request, so it belongs on a server-rendered page.",
          },
          {
            name: "createAstroThemePersistence() / computeFingerprint()",
            desc: "Cookie + localStorage persistence adapter, plus config fingerprinting to reject stale cookies.",
          },
        ],
      },
      {
        label: "Client islands (opt-in)",
        features: [
          {
            name: "@theme-kit/astro/client",
            desc: "The only entry that depends on React. Exports the `ThemeProviderClient` island, the `useTheme*` hooks, the React `ThemeScope`, and `ThemeReadout`.",
          },
          {
            name: "No theme props needed",
            desc: "The registry, default theme and initial mode/family come from the transported `theme.config.ts`. Restating `initialMode` / `initialFamily` is a second source of truth: when it drifts from the config, the island's server markup disagrees with its hydrated markup (React error #418) and the text fluctuates on every load.",
          },
          {
            name: "client:load, not client:only",
            desc: "Astro server-renders the island and hydrates it in place, so the panel is in the first paint and hydration only attaches handlers. `client:only` renders nothing on the server, which is the flash the integration exists to prevent.",
          },
          {
            name: "One island, not several",
            desc: "Astro hydrates islands in an unspecified order, so two separate islands would race. Write one island whose tree contains both the provider and its consumers — `ThemeProviderClient` renders nothing itself; it is the provider half of that tree.",
          },
          {
            name: "One runtime, shared",
            desc: "`ThemeProviderClient` adopts a runtime that already exists — one a `<ThemeToggle />` or `getThemeController()` script created — instead of making a second one, and leaves its destruction to the owner. Islands and native controls can share a page.",
          },
          {
            name: "Framework renderers stay optional",
            desc: "React is an optional peer dependency. Astro-only projects never install it — choosing a React island is what pulls it in.",
          },
          {
            name: "Adding the renderer",
            desc: "Opting in is one explicit step: install `@astrojs/react` and `react`, then add `react()` next to `themeKit()` in `astro.config.mjs`. The Astro + React path shows that config; the Astro-only path never registers a renderer.",
          },
          {
            name: "Client bundle cost",
            desc: "`<ThemeToggle />` and `getThemeController()` pull in the theme runtime — persistence, cross-tab sync and the DOM contract all come from `@theme-kit/core` rather than a second implementation. A page that only needs the *themed* document, with no interactive control, ships no client JavaScript at all: `provider.astro` and the inline bootstrap do that work on the server.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to the island provider (`@theme-kit/astro/client`) to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Applies the theme immediately, without animating. Use it for a one-off instant switch — `transition` is fixed at runtime creation. Compose the core diff/plan/runner APIs for custom animation.",
          },
        ],
      },
    ],
    quickStart: {
      title: "theme.config.ts",
      lang: "ts",
      code: `import { defineTheme, defineThemeKitConfig } from "@theme-kit/core";

const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light", label: "Mint Light", order: 10 },
    tokens: { colors: { background: "#f8fafc", foreground: "#0f172a" } },
  }),
  defineTheme({
    name: "mint-dark",
    meta: { family: "mint", mode: "dark", label: "Mint Dark", order: 20 },
    tokens: { colors: { background: "#0f172a", foreground: "#f8fafc" } },
  }),
];

export default defineThemeKitConfig({
  themes,
  defaultTheme: "mint-light",
  initialMode: "system",
  initialFamily: "mint",
});`,
    },
    snippet: {
      title: "src/layouts/BaseLayout.astro",
      lang: "astro",
      code: `---
// src/layouts/BaseLayout.astro — the one place the provider is mounted.
import Provider from "@theme-kit/astro/provider.astro";
import themeConfig from "../../theme.config";
import "../styles.css";
---

<Provider config={themeConfig} lang="en" bootstrap={false}>
  <slot />
</Provider>`,
    },
    styles: {
      title: "src/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    snippet2: {
      title: "src/pages/index.astro",
      lang: "astro",
      code: `---
import BaseLayout from "../layouts/BaseLayout.astro";
import ThemeToggle from "@theme-kit/astro/ThemeToggle.astro";
---

<BaseLayout>
  <h1>Themed with no client framework</h1>

  <!-- class is forwarded to the real <button>, so your own token-driven class
       styles it — here the .btn the stylesheet defines. -->
  <ThemeToggle class="btn" />

  <!-- showMode makes the visible text the live mode. The accessible name stays
       an action, because "dark" does not say what the button does. -->
  <ThemeToggle class="btn" showMode ariaLabel="Toggle colour scheme" />
</BaseLayout>`,
    },
    snippet3: {
      title: "src/pages/index.astro",
      lang: "astro",
      code: `---
import BaseLayout from "../layouts/BaseLayout.astro";
import ThemeToggle from "@theme-kit/astro/ThemeToggle.astro";
---

<BaseLayout>
  <main>
    <h1>Themed with no client framework</h1>

    <ThemeToggle />
    <ThemeToggle showMode />

    <section class="surface">
      <h2>Semantic tokens</h2>
      <p>
        This panel is themed by <code>--theme-color-card</code>, a
        <code>--theme-color-border</code> outline and
        <code>--theme-color-cardForeground</code> text — no hardcoded color.
      </p>
    </section>

    <p>
      mode:
      <span
        style="font-family: var(--theme-typography-font-family-mono)"
        data-tk-readout="mode">—</span>
    </p>
  </main>
</BaseLayout>`,
    },
    snippet4: {
      title: "getThemeController()",
      lang: "ts",
      code: `// The one runtime the provider, <ThemeToggle /> and any island share.
import { getThemeController } from "@theme-kit/astro/runtime";

const theme = getThemeController();

theme.getTheme();        // the resolved ThemeDefinition
theme.getMode();         // "light" | "dark" | "system" — the *selection*
theme.getResolvedMode(); // "light" | "dark" — what is actually painted
theme.getFamily();
theme.setMode("dark");
theme.setFamily("mint");
theme.toggleTheme();
theme.subscribe(({ theme, mode, family }) => { /* ... */ });`,
    },
    snippet6: {
      title: "src/pages/custom-toggle.astro",
      lang: "astro",
      code: `---
// src/pages/custom-toggle.astro — no <ThemeToggle />, no island.
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout>
  <h1>Your own toggle</h1>

  <button class="btn" id="theme-toggle">Toggle theme</button>

  <script>
    // The same runtime <ThemeToggle /> drives, reached directly. No component
    // import, no client framework, no hydration.
    import { getThemeController } from "@theme-kit/astro/runtime";

    const theme = getThemeController();

    document
      .getElementById("theme-toggle")
      ?.addEventListener("click", () => theme.toggleTheme());
  </script>
</BaseLayout>`,
    },
    reactSetup: {
      title: "astro.config.mjs",
      lang: "js",
      code: `// astro.config.mjs — the only addition is the React renderer.
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit(), react()],
});`,
    },
    zeroFlashNote:
      "Included. `themeKit()` injects the pre-paint bootstrap and `provider.astro` server-renders the themed `<html>`, so the first paint is already correct.",
    modeNote:
      "`theme.config.ts` declares the starting theme and mode once, and both the integration and the provider read it.",
    configNote:
      "Declared in `theme.config.ts` at the project root. `themeKit()` in `astro.config.mjs` discovers it and injects the pre-paint bootstrap, and `provider.astro` reads the same file — so nothing is repeated.",
    noTheme: {
      title: "astro.config.mjs",
      lang: "js",
      code: `// astro.config.mjs
import { defineConfig } from "astro/config";
import themeKit from "@theme-kit/astro";

export default defineConfig({
  integrations: [themeKit()],
});`,
    },
    switchSnippet: {
      title: "src/components/ThemeIsland.tsx",
      lang: "tsx",
      code: `// src/components/ThemeIsland.tsx
import { ThemeProviderClient, useTheme } from "@theme-kit/astro/client";

function Panel() {
  const { theme, mode, setMode, toggleTheme } = useTheme();

  return (
    <main
      style={{
        background: "var(--theme-color-background)",
        color: "var(--theme-color-foreground)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Theme Kit</h1>
      <p>Current theme: {theme.name} ({mode})</p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}

// ThemeProviderClient renders nothing — it installs the runtime. Panel is a
// sibling that reads it, and both hydrate as one island.
export default function ThemeIsland() {
  return (
    <>
      {/*
        No theme props. The registry, the default theme and the initial
        mode/family all come from the theme.config.ts the integration
        transported to the browser, so restating initialMode/initialFamily here
        would be a second source of truth for a decision the app already made.
      */}
      <ThemeProviderClient />
      <Panel />
    </>
  );
}

// Mount it from a page:
//   <ThemeIsland client:load />`,
    },
    setupGuide: {
      overview: [
        "Astro is not one setup. Theme Kit supports two application shapes here, and they differ in exactly one thing: whether the app ships a client framework runtime at all.",
        "The theme registry, the pre-paint bootstrap, the server-rendered `<html>` and the readout contract are identical in both. Only the interactive UI changes — a native Astro component plus a plain browser `<script>`, or a React island.",
        "Pick the shape first, then follow one path. The snippets in each path are complete for that shape, and the two paths do not overlap.",
      ],
      choose: {
        title: "Choose your setup",
        intro:
          "Both paths are fully supported. Pick the one that matches how you build interactive UI in this app — everything below the choice then applies to that path only, and the shared behavior is explained once, after both.",
        paths: [
          {
            id: "astro-only",
            name: "Astro-only",
            badge: "No React runtime",
            summary: "Astro-native theming. No client framework, no island.",
            useWhen:
              "Use this when your application is Astro-native and does not need a client framework for Theme Kit UI.",
            steps: [
              {
                label: "Install",
                desc: "Two packages, neither of which pulls in a client framework.",
                install: "base",
              },
              {
                label: "Configure",
                desc: "Three files. `theme.config.ts` declares the themes and the starting mode, `astro.config.mjs` registers the integration, and the layout mounts `provider.astro`, which server-renders the themed `<html>`.",
                refs: ["quickStart", "noTheme", "snippet"],
                note: "`themeKit()` discovers `theme.config.ts` at the project root, and the integration, `provider.astro` and any island all read that one file — so nothing is restated. Nothing in this path imports a client framework: the integration, the server helpers and the native components are framework-neutral, so this path installs no renderer and loads no client framework bundle on the page.",
              },
              {
                label: "Use Theme Kit",
                desc: "`<ThemeToggle />` is a real `<button>`, so keyboard and focus behavior come from the platform. `class` is forwarded to that button, so a token-driven class of your own is the whole styling story — there is no `::part`, no wrapper element and no theme prop to learn.",
                refs: ["snippet2"],
                note: "`showMode` makes the visible text the live mode, and `ariaLabel` keeps the accessible name an action — with `showMode` the visible text is a state (\"dark\"), which does not say what the button does. `label` is the static alternative, and is ignored while `showMode` is set.",
              },
              {
                label: "Toggle without the component",
                desc: "`<ThemeToggle />` is a convenience, not the contract. The same runtime is reachable from a plain `<script>`, so you can render whatever markup you like and drive it yourself — still with no client framework.",
                refs: ["snippet6", "snippet4"],
                note: "The component also sets `data-tk-toggle` on its button and delegates clicks from any element carrying that attribute, so your own markup can be a toggle once the component is on the page. `data-tk-readout` is the matching contract for text Theme Kit owns: the pre-paint bootstrap patches it from `<head>`, so a server-rendered label is never painted and then corrected.",
              },
              {
                label: CANONICAL_STYLES_STEP.label,
                desc: CANONICAL_STYLES_STEP.desc,
                refs: ["styles"],
                note: "Nothing in this stylesheet is theme-specific, and it is the same one every framework guide in these docs uses. Import it from the layout — `import \"../styles.css\"` — so the rules apply to every page.",
              },
              {
                label: "Complete example",
                desc: "The same page with a themed panel, two toggles and a live readout.",
                refs: ["snippet3"],
                note: "The markup is complete without the stylesheet — it only decides how `.surface` looks. Because those classes read variables, switching the theme re-paints them with no re-render and no per-theme CSS.",
              },
            ],
          },
          {
            id: "astro-react",
            name: "Astro + React",
            badge: "React islands",
            summary: "Astro pages with interactive React islands.",
            useWhen:
              "Use this when Astro renders the page shell but interactive themed UI is implemented with React islands.",
            steps: [
              {
                label: "Install",
                desc: "The same two Theme Kit packages, plus the React renderer Astro needs to hydrate an island.",
                install: "renderer",
                note: "This path additionally installs `@astrojs/react`, `react` and `react-dom`. The Theme Kit side is unchanged — `@theme-kit/astro/client` is a subpath of the package you already have, not a second package.",
              },
              {
                label: "Configure",
                desc: "Add the React integration next to `themeKit()`. That registration is the whole configuration difference between the two paths.",
                refs: ["reactSetup"],
                note: "`theme.config.ts` is unchanged from the Astro-only path. The integration, `provider.astro` and the island all read that one file, so there is nothing to restate here.",
              },
              {
                label: "Add React island",
                desc: "Write one island whose tree contains both the provider and its consumers. `ThemeProviderClient` renders nothing — it installs the runtime — so the panel that reads it is a sibling inside the same React tree.",
                refs: ["switchSnippet"],
                note: "Astro hydrates islands in an unspecified order, so two separate islands would race: a consumer island could hydrate before the one that installs the runtime. One island, one React tree, cannot.",
              },
              {
                label: "Native controls need no client runtime",
                desc: "Adding a renderer does not take the native component away. `<ThemeToggle />` is still a real `<button>` with no island and no `client:load`, `class` still styles it, and a plain `<script>` can drive the runtime instead of the component — so a page can mix native controls with the island.",
                refs: ["snippet2", "snippet6"],
                note: "The island adopts the runtime `<ThemeToggle />` or a `getThemeController()` script already installed, rather than creating a second one. A page that only needs the themed document — no interactive control at all — still ships no client JavaScript: `provider.astro` and the inline bootstrap do that work on the server.",
              },
              {
                label: "Use React APIs",
                desc: "Read the theme with `useTheme()` and render values with `ThemeReadout`. The `.astro` page only mounts the island with a hydration directive.",
                snippets: [
                  {
                    title: "src/components/ThemePanel.tsx",
                    lang: "tsx",
                    code: `// src/components/ThemePanel.tsx — the React half of the island.
import { ThemeReadout, useTheme } from "@theme-kit/astro/client";

export function ThemePanel() {
  const { theme, mode, family, setMode, setFamily, toggleTheme } = useTheme();

  return (
    <section>
      <p>
        theme: <ThemeReadout kind="theme" fallback="—" /> · mode:{" "}
        <ThemeReadout kind="mode" fallback="—" /> · family:{" "}
        <ThemeReadout kind="family" fallback="—" />
      </p>

      <button onClick={toggleTheme}>Toggle light / dark</button>
      <button onClick={() => setMode("system")}>System</button>
      <button onClick={() => setFamily("mint")}>Mint family</button>

      <p>
        Resolved: <code>{theme.name}</code> · selection: <code>{mode}</code> /{" "}
        <code>{family}</code>
      </p>
    </section>
  );
}`,
                  },
                  {
                    title: "src/pages/island.astro",
                    lang: "astro",
                    code: `---
// src/pages/island.astro — the Astro half: mount the island, nothing else.
import BaseLayout from "../layouts/BaseLayout.astro";
import ThemeIsland from "../components/ThemeIsland";
---

<BaseLayout>
  <h1>React island</h1>
  <p>
    Interactive themed UI lives inside the island. The page itself stays Astro.
  </p>

  <ThemeIsland client:load />
</BaseLayout>`,
                  },
                ],
                note: "React hooks are not available inside `.astro` files, and `useTheme()` cannot be called from frontmatter. The boundary is explicit: an Astro page renders a React island, the island renders React components, and only those components call the React Theme Kit API.",
              },
              {
                label: CANONICAL_STYLES_STEP.label,
                desc: CANONICAL_STYLES_STEP.desc,
                refs: ["styles"],
                note: "The Astro-only path imports this same file from the shared layout, so the two paths look identical for the same theme — the React island changes which framework renders the controls, not what the tokens paint.",
              },
              {
                label: "Complete example",
                desc: "The React path is these three files: the island component, the panel it renders, and the Astro page that mounts it. The island adopts the runtime the native controls use, so this page and the Astro-only page can coexist in one app.",
                note: "`src/components/ThemeIsland.tsx` (the island), `src/components/ThemePanel.tsx` (the React UI), `src/pages/island.astro` (the hydration directive). The themed document itself is still rendered by `provider.astro` in the shared layout.",
              },
            ],
          },
        ],
        columns: ["Astro-only", "Astro + React"],
        decision: {
          title: "Which one should I use?",
          lines: [
            "Choose Astro-only when your UI can stay in Astro and browser scripts, and you do not need a client UI framework for Theme Kit UI.",
            "Choose Astro + React when interactive themed UI is implemented inside React islands.",
            "Neither is more capable than the other: both paths drive one runtime, and a page can mix them — an island adopts a runtime that a `<ThemeToggle />` or `getThemeController()` script already installed, instead of creating a second one.",
          ],
        },
        comparison: [
          { area: "Astro integration — `themeKit()`", a: "yes", b: "yes" },
          { area: "`@astrojs/react` + `react`", a: "no", b: "yes" },
          { area: "React runtime in the bundle", a: "no", b: "yes" },
          { area: "React island", a: "no", b: "optional — only for React UI" },
          { area: "React hooks (`useTheme`)", a: "no", b: "yes" },
          {
            area: "Astro-native usage — `<ThemeToggle />`, `getThemeController()`",
            a: "yes",
            b: "yes",
          },
          { area: "SSR + pre-paint bootstrap", a: "shared", b: "shared" },
          { area: "Theme definitions — `theme.config.ts`", a: "shared", b: "shared" },
        ],
      },
      boundary: `Astro page
   ↓
React island   (client:load)
   ↓
React Theme Kit API   (@theme-kit/astro/client)`,
      shared: {
        title: "Shared behavior",
        intro:
          "These are identical in both paths — there is one implementation, and choosing a path does not change any of it. They are explained once, here.",
        sections: [
          {
            id: "shared-themes",
            title: "Themes and tokens",
            body: "Themes are declared once, in `theme.config.ts`, with `defineTheme` — a name, optional `meta` (family, mode, label) and a `tokens` object. `themeKit()` discovers that file at the project root and `provider.astro` renders from the same object, so both paths share one registry. Tokens reach CSS as `--theme-color-*` custom properties. The file is optional: with no discoverable config, the integration and the provider both fall back to the built-in themes and nothing fails. It is still where an app's own palette belongs, and both paths below declare it.",
          },
          {
            id: "shared-bootstrap",
            title: "Bootstrap and zero-flash",
            body: "`themeKit()` injects the pre-paint bootstrap at the `head-inline` stage, so the persisted selection is applied before the first paint rather than after hydration. For a `system` selection the server emits both schemes as `prefers-color-scheme` media blocks instead of inline variables — an inline variable would outrank the media query meant to correct it. A page that only needs the themed document ships no client JavaScript at all.",
          },
          {
            id: "shared-ssr",
            title: "SSR",
            body: "On a server-rendered page there is a request, so resolve the selection once with `getInitialThemeState()` and hand the result to `provider.astro` as `initial` — and to the island as `initial` if this page has one. Both then render the one resolution and cannot drift. A prerendered page has no request: the server cannot read the theme cookies, so the injected bootstrap applies the persisted selection in the browser and the runtime adopts what it painted.",
          },
          {
            id: "shared-readouts",
            title: "Readouts and the hydration contract",
            body: "`data-tk-readout` marks an element whose text Theme Kit owns. The pre-paint bootstrap patches it from `<head>`, before the body is parsed, and the runtime keeps it in sync afterwards — so a server-rendered value is never painted and then corrected. In React the same contract is `ThemeReadout` from `@theme-kit/astro/client`, which carries `suppressHydrationWarning` so React does not overwrite the patched text with its own server render. A plain `<span>{mode}</span>` inside an island is painted with the server's value and corrects itself after hydration — the `text fluctuates on reload` symptom.",
          },
        ],
      },
      examples: {
        title: "Examples",
        intro:
          "The complete runnable app behind this guide ships both shapes in one project, so the two can be compared side by side and the shared runtime can be seen at work.",
        apps: [
          {
            label: "Astro-only page",
            path: "examples/apps/astro",
            note: "`src/pages/index.astro` — themed, toggled and read out with no client framework. It uses `<ThemeToggle />` and `getThemeController()` only; no React is loaded on this page.",
          },
          {
            label: "Astro + React island",
            path: "examples/apps/astro",
            note: "`src/pages/island.astro` + `src/components/ThemeIsland.tsx` — one island (`client:load`) containing the provider and its consumers, sharing the runtime with the native controls.",
          },
        ],
      },
      caveatsIntro:
        "Both paths share one core, so the Astro-specific behavior below applies to either one.",
    },
  },
  {
    slug: "nuxt",
    name: "Nuxt 3",
    icon: icons.nuxt,
    pkg: "@theme-kit/nuxt",
    tagline:
      "Nuxt 3 module with server-rendered theming, cookie sync, auto-imported composables, and config-driven options.",
    mark: "Nu",
    tags: ["Module", "SSR", "Zero-flash", "Auto-import"],
    groups: [
      {
        label: "Server",
        features: [
          {
            name: "SSR-first theme resolution",
            desc: "Reads `theme-name`, `theme-mode`, `theme-family`, `theme-fingerprint` cookies, validates the fingerprint, resolves the initial theme, and renders `<html data-theme>` with inline CSS variables before hydration.",
          },
          {
            name: "Blocking bootstrap script",
            desc: "Emits a blocking script in `<head>` that applies the persisted theme before first paint.",
          },
          {
            name: "Dark-mode CSS fallback",
            desc: "Emits `@media (prefers-color-scheme: dark)` styles when the persisted mode is `system`.",
          },
          {
            name: "Cookie + localStorage sync",
            desc: "The client mirrors selection back to cookies so the server renders the right theme on the next request — same contract as `@theme-kit/next`.",
          },
        ],
      },
      {
        label: "Client",
        features: [
          {
            name: "Runtime plugin",
            desc: "A Nuxt plugin installs one app-wide runtime, provided to `useTheme()`, `useThemeRuntime()` and every auto-imported composable.",
          },
          {
            name: "Auto-imports",
            desc: "Composables (`useTheme`, `useThemeMode`, `useThemeHistory`, …) and components (`ThemeScope`, `ThemeScrollbar`) are auto-imported — no manual imports. They are also re-exported from `@theme-kit/nuxt` if you prefer being explicit.",
          },
          {
            name: 'configKey: "themeKit"',
            desc: "Configure `themes`, `defaultTheme`, `initialMode`, `initialFamily`, `transition`, `scrollbar`, `storageKey` and `scheduled` in `nuxt.config.ts`.",
          },
          {
            name: "useThemeSchedule()",
            desc: "Auto-imported composable exposing the sunrise/sunset schedule: reactive `state` (`enabled`, `status`, `sunrise`, `sunset`, `nextTransition`) plus `enable()`/`disable()`/`set()`. Configure via `scheduled` in the module config.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition in nuxt.config.ts",
            desc: "Configure `transition` in the `themeKit` config object to enable CSS transitions on theme changes. Duration/easing are set once; Theme Kit generates the transition styles at runtime.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation. For custom animation orchestration, compose the core diff/plan/runner APIs.",
          },
        ],
      },
      {
        label: "Scrollbar",
        features: [
          {
            name: "scrollbar: true",
            desc: "Enables Theme Kit's custom overlay scrollbar. The SSR bootstrap hides the native scrollbar before first paint, then the overlay engine synchronizes with browser scrolling without replacing native scroll behavior.",
          },
          {
            name: "scrollbar option",
            desc: "Configure the overlay appearance (thickness, radius, colors, auto-hide, …) from the `themeKit` config; the overlay stays theme-aware and updates with runtime theme changes.",
          },
        ],
      },
    ],
    quickStart: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  // Required when scrollbar: true — the styles ship with core, not the module.
  css: ["@theme-kit/core/scrollbar.css"],
  themeKit: {
    defaultTheme: "mint-light",
    initialMode: "system",
    transition: { duration: 360, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    scrollbar: true,
  },
});`,
    },
    snippet: {
      title: "components/ThemeSwitcher.vue",
      lang: "vue",
      code: `<script setup lang="ts">
// useTheme is auto-imported by the module — no import statement needed.
const { theme, mode, toggleTheme } = useTheme();
</script>

<template>
  <main class="page">
    <h1>Theme Kit</h1>
    <p>Current theme: {{ theme.name }} ({{ mode }})</p>

    <button class="primary" @click="toggleTheme">Toggle theme</button>

    <section class="card">
      <h2>Themed card</h2>
      <p class="muted">Surface, border and text follow the theme.</p>
    </section>
  </main>
</template>

<style scoped>
  .page {
    background: var(--theme-color-background);
    color: var(--theme-color-foreground);
    min-height: 100vh;
    padding: 2rem;
  }
  .primary {
    background: var(--theme-color-primary);
    color: var(--theme-color-primaryForeground);
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .card {
    background: var(--theme-color-card);
    border: 1px solid var(--theme-color-border);
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
  }
  .muted {
    color: var(--theme-color-mutedForeground);
  }
</style>`,
    },
    snippet2: {
      title: "components/ThemeHistoryControls.vue",
      lang: "vue",
      code: `<script setup lang="ts">
// Both composables and both components are auto-imported by the module.
const { undo, redo, canUndo, canRedo } = useThemeHistory();
const { theme, setFamily } = useTheme();
</script>

<template>
  <ThemeScope theme="plum-dark" :transition="{ duration: 300, easing: 'ease' }">
    <p>This subtree is always plum-dark.</p>
  </ThemeScope>

  <button @click="undo" :disabled="!canUndo">Undo</button>
  <button @click="redo" :disabled="!canRedo">Redo</button>

  <button @click="setFamily('mint')">{{ theme.name }}</button>

  <ThemeScrollbar auto-hide />
</template>`,
    },
    zeroFlashNote:
      "Included. The module emits the pre-paint bootstrap and server-renders the themed `<html>`.",
    modeNote:
      "`themeKit.initialMode` in `nuxt.config.ts` decides the starting mode, and `themeKit.defaultTheme` picks the theme.",
    configNote:
      "Declared in `nuxt.config.ts` under the `themeKit` key. The module reads it and emits the pre-paint bootstrap, so nothing is repeated elsewhere.",
    styles: {
      title: "assets/css/main.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "nuxt.config.ts",
      lang: "ts",
      code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@theme-kit/nuxt"],
  themeKit: {
    defaultTheme: "light",
  },
});`,
    },
  },
  {
    slug: "remix",
    name: "Remix",
    icon: icons.remix,
    pkg: "@theme-kit/remix",
    tagline:
      "Resolve the theme in a loader, paint it before first paint, then hydrate a matching runtime.",
    mark: "Re",
    tags: ["SSR", "Loaders", "Hydration"],
    groups: [
      {
        label: "Server",
        features: [
          {
            name: "getInitialThemeState()",
            desc: "Reads the `theme-mode` / `theme-family` cookies off the request and resolves the initial state. Imported from `@theme-kit/remix/server`.",
          },
          {
            name: "ThemeHead",
            desc: "Emits the blocking bootstrap in the document <head> so the page paints already themed, plus the `prefers-color-scheme` dark fallback.",
          },
          {
            name: "SSR-first resolution",
            desc: "Request → loader → resolve initial state → HTML document → browser hydration. The server resolves the theme, so the first paint already matches the hydrated client.",
          },
        ],
      },
      {
        label: "Client",
        features: [
          {
            name: "ThemeProvider",
            desc: "Hydrates against the loader-resolved `initial` state and mirrors the selection back to cookies on change.",
          },
          {
            name: "createRemixThemePersistence()",
            desc: "Builds the adapter `ThemeProvider` uses: localStorage plus the `theme-mode`, `theme-family` and `theme-fingerprint` cookies the loader reads on the next request.",
          },
          {
            name: "Full hook set + ThemeScope",
            desc: "Every React hook plus scoped subtrees — re-exported from `@theme-kit/react`.",
          },
          {
            name: "Intentional React dependency",
            desc: "Remix is a React framework, so `@theme-kit/remix` depends on `@theme-kit/core` + `@theme-kit/react` directly. No other framework or adapter package is pulled in.",
          },
        ],
      },
      {
        label: "Routing",
        features: [
          {
            name: "Provider lives in the root",
            desc: "Mount `ThemeProvider` in `app/root.tsx`; nested routes and layouts inherit it through `<Outlet />`.",
          },
          {
            name: "Route-level scopes",
            desc: "Wrap a route subtree in `ThemeScope` to pin it to a theme without changing the global selection.",
          },
        ],
      },
      {
        label: "Transition",
        features: [
          {
            name: "transition prop",
            desc: "Pass `transition` to ThemeProvider to enable CSS transitions on theme changes.",
          },
          {
            name: "runtime.store.set(theme, { suppressTransition: true })",
            desc: "Per-update escape hatch: `runtime.store.set(theme, { suppressTransition: true })` skips the configured animation. For custom animation orchestration, compose the core diff/plan/runner APIs.",
          },
        ],
      },
      {
        label: "Scrollbar",
        features: [
          {
            name: "scrollbar prop",
            desc: "Pass `scrollbar` to `ThemeHead` to hide the native scrollbar from the very first paint and hand over to Theme Kit's overlay engine once the runtime hydrates.",
          },
          {
            name: "Import the pre-paint styles",
            desc: "Needs `import \"@theme-kit/core/scrollbar.css\"` plus the `tk-scrollbar` class on `<html>`, which the snippet above sets. Without both, the native bar hides before the overlay exists.",
          },
        ],
      },
    ],
    quickStart: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `// app/root.tsx
import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getBuiltInThemes } from "@theme-kit/core";
import { ThemeHead, ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

const themes = getBuiltInThemes();

// One source of truth for the starting mode: the pre-paint script and the
// runtime resolve it independently, so both have to be told the same thing.
const INITIAL_MODE = "system";

// Resolve the selection server-side so hydration matches exactly.
export async function loader({ request }: { request: Request }) {
  return {
    initial: await getInitialThemeState(request, {
      themes,
      defaultTheme: "light",
      mode: INITIAL_MODE,
    }),
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const { initial } = useLoaderData<typeof loader>();
  const family = initial.theme.meta?.family ?? initial.selection.family;

  return (
    // ThemeHead writes these onto <html> before React hydrates, so the server
    // renders them too — that is what keeps the two in agreement.
    <html
      lang="en"
      data-theme={initial.theme.name}
      data-theme-mode={initial.selection.mode === "dark" ? "dark" : "light"}
      {...(family ? { "data-theme-family": family } : {})}
      data-theme-selection-mode={initial.selection.mode}
      {...(family ? { "data-theme-selection-family": family } : {})}
      data-theme-ready="true"
    >
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
        <ThemeHead themes={themes} defaultTheme="light" mode={INITIAL_MODE} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { initial } = useLoaderData<typeof loader>();
  return (
    <ThemeProvider initial={initial} themes={themes} defaultTheme="light">
      <Outlet />
    </ThemeProvider>
  );
}`,
    },
    snippet: {
      title: "app/routes/_index.tsx",
      lang: "tsx",
      code: `// The provider in app/root.tsx supplies the runtime, so a route just reads it.
import { useTheme } from "@theme-kit/remix";

export default function Index() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <main
      style={{
        background: "var(--theme-color-background)",
        color: "var(--theme-color-foreground)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Theme Kit</h1>
      <p>
        Current theme: {theme.name} ({mode})
      </p>

      <button
        onClick={toggleTheme}
        style={{
          background: "var(--theme-color-primary)",
          color: "var(--theme-color-primaryForeground)",
          border: 0,
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Toggle theme
      </button>

      <section
        style={{
          background: "var(--theme-color-card)",
          border: "1px solid var(--theme-color-border)",
          borderRadius: "0.75rem",
          marginTop: "1.5rem",
          padding: "1rem",
        }}
      >
        <h2>Themed card</h2>
        <p style={{ color: "var(--theme-color-mutedForeground)" }}>
          Surface, border and text follow the theme.
        </p>
      </section>
    </main>
  );
}`,
    },
    snippet2: {
      title: "app/themes.ts",
      lang: "ts",
      code: `// Imported as \`./themes\` from app/root.tsx.
import { defineTheme } from "@theme-kit/core";

export const themes = [
  defineTheme({
    name: "mint-light",
    meta: { family: "mint", mode: "light" },
    tokens: {
      colors: { primary: "#10b981", background: "#f0fdf9" },
    },
  }),
];`,
    },
    snippet3: {
      title: "app/components/history-scope.tsx",
      lang: "tsx",
      code: `// app/components/history-scope.tsx — used inside the root provider, so it
// does NOT create a second runtime of its own.
import { ThemeScope, useThemeHistory } from "@theme-kit/remix";

export function HistoryScope() {
  const { undo, redo, canUndo, canRedo } = useThemeHistory();

  return (
    <div>
      <div>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>

      <ThemeScope theme="plum-dark" transition={{ duration: 300, easing: "ease" }}>
        <span>Always plum-dark</span>
      </ThemeScope>
    </div>
  );
}`,
    },
    zeroFlashNote:
      "Included, but you wire it: the loader resolves the theme and `ThemeHead` emits the script in `<head>`. The `<html>` element declares the same attributes so hydration matches.",
    modeNote:
      "The loader resolves the initial state from the request cookies, so the first paint already matches. `mode` on `ThemeHead` and `initialMode` on `ThemeProvider` decide what a first-time visitor gets — keep them in one constant.",
    configNote:
      "Themes and the starting mode come from the loader and the provider props. Remix renders its own document, so there is no bundler plugin to add: `ThemeHead` emits the pre-paint script from the server.",
    styles: {
      title: "app/styles.css",
      lang: "css",
      code: CANONICAL_STYLES,
    },
    noTheme: {
      title: "app/root.tsx",
      lang: "tsx",
      code: `// app/root.tsx
import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getBuiltInThemes } from "@theme-kit/core";
import { ThemeHead, ThemeProvider } from "@theme-kit/remix";
import { getInitialThemeState } from "@theme-kit/remix/server";

const themes = getBuiltInThemes();

// One source of truth for the starting mode: the pre-paint script and the
// runtime resolve it independently, so both are told the same thing.
const INITIAL_MODE = "system";

export async function loader({ request }: { request: Request }) {
  return {
    initial: await getInitialThemeState(request, {
      themes,
      defaultTheme: "light",
      mode: INITIAL_MODE,
    }),
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const { initial } = useLoaderData<typeof loader>();
  const family = initial.theme.meta?.family ?? initial.selection.family;

  return (
    // ThemeHead writes these onto <html> before React hydrates, so the server
    // renders them too — that is what keeps the two in agreement.
    <html
      lang="en"
      data-theme={initial.theme.name}
      data-theme-mode={initial.selection.mode === "dark" ? "dark" : "light"}
      {...(family ? { "data-theme-family": family } : {})}
      data-theme-selection-mode={initial.selection.mode}
      {...(family ? { "data-theme-selection-family": family } : {})}
      data-theme-ready="true"
    >
      <head>
        <Meta />
        <Links />
        <ThemeHead themes={themes} defaultTheme="light" mode={INITIAL_MODE} />
      </head>
      <body>
        <ThemeProvider initial={initial} themes={themes} defaultTheme="light">
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}`,
    },
  },
];

export const frameworks: FrameworkItem[] = rawFrameworks.map((f) => ({
  ...f,
  featureCount: f.groups.reduce((sum, g) => sum + g.features.length, 0),
}));
