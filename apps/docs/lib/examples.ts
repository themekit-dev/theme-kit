import {
  CONCEPT_EXAMPLES,
  STARTER_EXAMPLES,
  type ConceptExample,
  type StarterExample,
} from "./generated/examples";

/**
 * Editorial layer for `/examples`.
 *
 * The catalog itself is generated from the real `examples/` workspace (see
 * `scripts/generate-examples.mjs`): what a feature is called, which framework it
 * targets, which packages it uses, which files it contains and which APIs it
 * exercises all come from the examples' own metadata. This file adds only the
 * judgement metadata cannot carry — how hard it is, what you take away from it,
 * why the approach works, and how it varies.
 *
 * Deliberately absent: invented "live demo" URLs. These examples are not
 * deployed; a fabricated demo link would be worse than none. Where the docs site
 * has a genuinely interactive surface for the same concept, `liveHref` points at
 * it — otherwise the page tells you how to run it locally.
 */

export type Complexity = "beginner" | "intermediate" | "advanced";

export const COMPLEXITY_LABEL: Record<Complexity, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const COMPLEXITY_TONE: Record<Complexity, "success" | "accent" | "neutral"> = {
  beginner: "success",
  intermediate: "accent",
  advanced: "neutral",
};

export type ConceptGroup =
  | "theming"
  | "presentation"
  | "scoping"
  | "persistence"
  | "first-paint"
  | "runtime";

export const CONCEPT_GROUPS: { id: ConceptGroup; label: string; blurb: string }[] = [
  {
    id: "theming",
    label: "Theming basics",
    blurb: "Defining themes, reading tokens, and switching between families and modes.",
  },
  {
    id: "presentation",
    label: "Presentation & accessibility",
    blurb: "How the theme reaches pixels, and how to keep it legible.",
  },
  {
    id: "scoping",
    label: "Scoping",
    blurb: "Applying a different theme to part of a page instead of the whole document.",
  },
  {
    id: "persistence",
    label: "Persistence & sync",
    blurb: "Remembering the selection, and keeping it consistent across tabs and over time.",
  },
  {
    id: "first-paint",
    label: "First paint",
    blurb: "Getting the stored theme onto the page before the browser paints anything else.",
  },
  {
    id: "runtime",
    label: "Runtime & tooling",
    blurb: "Driving the runtime directly, extending it, and inspecting it.",
  },
];

export type ConceptEditorial = {
  group: ConceptGroup;
  complexity: Complexity;
  /** One sentence: what you take away. */
  whatYouLearn: string;
  /** Why this approach is correct — the part a snippet alone does not explain. */
  whyItWorks: string;
  /** How the pattern changes in real apps. */
  variations: string[];
  /** A genuinely interactive surface on this site, when one exists. */
  liveHref?: string;
  liveLabel?: string;
  /** Related docs to read next. */
  docsHref: string;
};

export const CONCEPT_EDITORIAL: Record<string, ConceptEditorial> = {
  "basic-theme": {
    group: "theming",
    complexity: "beginner",
    whatYouLearn:
      "The minimum viable Theme Kit setup: define a theme, wrap the app, read the active theme.",
    whyItWorks:
      "The provider owns a single runtime instance, so every component reads the same store. Nothing is duplicated per component and nothing needs prop-drilling.",
    variations: [
      "Swap `defineTheme` for `getBuiltInThemes()` to start from a shipped family",
      "Move the theme definitions into their own module once you have more than two",
    ],
    liveHref: "/quick-start",
    liveLabel: "Quick Start walkthrough",
    docsHref: "/core-concepts",
  },
  themes: {
    group: "theming",
    complexity: "beginner",
    whatYouLearn: "Defining, extending and resolving themes, and reading a theme's family and mode.",
    whyItWorks:
      "`extendTheme` resolves at read time rather than flattening eagerly, so a base theme can change without every child needing to be rebuilt.",
    variations: [
      "Use `composeTheme` when you need to merge several independent definitions",
      "Use `resolveThemeName` when you only need the identifier, not the tokens",
    ],
    liveHref: "/core-concepts",
    liveLabel: "Core concepts",
    docsHref: "/custom-themes",
  },
  tokens: {
    group: "theming",
    complexity: "beginner",
    whatYouLearn: "Turning a theme's token tree into flat CSS custom properties.",
    whyItWorks:
      "Tokens are emitted with the key path verbatim (`colors.primaryForeground` → `--theme-color-primaryForeground`), so the mapping is predictable and reversible.",
    variations: [
      "Use `flattenTokens` alone when you need the paths without CSS naming",
      "Write the variables to a stylesheet at build time instead of at runtime",
    ],
    liveHref: "/tokens",
    liveLabel: "Tokens & typography",
    docsHref: "/token-resolution",
  },
  "families-modes": {
    group: "theming",
    complexity: "beginner",
    whatYouLearn: "Switching theme family and light/dark mode independently.",
    whyItWorks:
      "Family and mode are separate axes in the selection, so changing one preserves the other — you never have to reconstruct the full selection to flip a single dimension.",
    variations: [
      "Drive the selection from a `<select>` instead of buttons",
      "Persist both axes so a reload restores the exact pair",
    ],
    liveHref: "/playground",
    liveLabel: "Playground — switch families and modes live",
    docsHref: "/presets/default",
  },
  "theme-generation": {
    group: "theming",
    complexity: "intermediate",
    whatYouLearn: "Deriving a complete light/dark theme pair from a single seed color.",
    whyItWorks:
      "The generator derives the whole semantic set from the seed rather than only tinting a few keys, so every derived pair is internally consistent by construction.",
    variations: [
      "Generate at build time and commit the result for a stable, reviewable palette",
      "Generate in the browser and let users export what they made",
    ],
    liveHref: "/theme-studio",
    liveLabel: "Theme Studio — generate from a seed live",
    docsHref: "/custom-themes",
  },
  transitions: {
    group: "presentation",
    complexity: "intermediate",
    whatYouLearn: "Animating a theme change instead of swapping it instantly.",
    whyItWorks:
      "Transitions are applied to the CSS custom properties themselves, so every element using those variables animates together without per-component wiring.",
    variations: [
      "Gate the transition behind `prefers-reduced-motion`",
      "Use a view transition for a cross-fade the CSS transition cannot express",
    ],
    liveHref: "/animation",
    liveLabel: "Animation lab — time the presets",
    docsHref: "/animation",
  },
  "custom-scrollbar": {
    group: "presentation",
    complexity: "beginner",
    whatYouLearn: "A theme-aware overlay scrollbar that follows the active theme.",
    whyItWorks:
      "The scrollbar reads the same custom properties as the rest of the UI, so it cannot fall out of sync with a theme change — there is no second color source.",
    variations: [
      "Disable auto-hide for a permanently visible thumb",
      "Inject the pre-paint scrollbar CSS so it is styled on the first frame",
    ],
    liveHref: "/custom-scrollbar",
    liveLabel: "Custom scrollbar docs",
    docsHref: "/custom-scrollbar",
  },
  accessibility: {
    group: "presentation",
    complexity: "intermediate",
    whatYouLearn: "Measuring contrast between theme tokens and validating a whole theme.",
    whyItWorks:
      "Contrast is computed from the resolved token values, so the check reflects what actually renders rather than what the palette intended.",
    variations: [
      "Fail a CI job when a theme drops below AA",
      "Audit every built-in family once and cache the report",
    ],
    liveHref: "/accessibility",
    liveLabel: "Accessibility Lab — run the checks live",
    docsHref: "/accessibility",
  },
  scopes: {
    group: "scoping",
    complexity: "intermediate",
    whatYouLearn: "Resolving a scoped theme and emitting its variables for a subtree.",
    whyItWorks:
      "Scoped variables are namespaced, so a nested theme overrides only inside its subtree and cannot leak upward into the document theme.",
    variations: [
      "Scope by element id when the target is a third-party widget",
      "Nest scopes for preview-inside-preview UIs",
    ],
    liveHref: "/scoped-theme",
    liveLabel: "Scoped theme docs",
    docsHref: "/scoped-theme",
  },
  "theme-scope": {
    group: "scoping",
    complexity: "intermediate",
    whatYouLearn: "Applying a scoped theme declaratively with `<ThemeScope>`.",
    whyItWorks:
      "The component creates a nested runtime for its subtree, so descendants read the scoped values through the same hooks they already use — no API change at the leaves.",
    variations: [
      "Combine with a theme switcher to preview a theme before applying it globally",
      "Nest scopes to build a theme gallery",
    ],
    liveHref: "/scoped-theme",
    liveLabel: "Scoped theme docs",
    docsHref: "/scoped-theme",
  },
  persistence: {
    group: "persistence",
    complexity: "intermediate",
    whatYouLearn: "Persisting the selection so it survives a reload, with a fingerprint guard.",
    whyItWorks:
      "The stored selection is tagged with a fingerprint of the available themes, so a stale entry from an older build is discarded instead of restoring a theme that no longer exists.",
    variations: [
      "Use cookies instead of storage when the server must read the selection",
      "Namespace the storage key per deployment environment",
    ],
    liveHref: "/persistence",
    liveLabel: "Persistence docs",
    docsHref: "/persistence",
  },
  "multi-window-sync": {
    group: "persistence",
    complexity: "advanced",
    whatYouLearn: "Keeping the theme in sync across tabs and windows.",
    whyItWorks:
      "Sync is a transport over the selection, not a second source of truth — each tab still owns its runtime, and the transport only propagates the selection change.",
    variations: [
      "Swap `BroadcastChannel` for `localStorage` events in older browsers",
      "Filter incoming messages by deployment id to avoid cross-app collisions",
    ],
    liveHref: "/multi-window-sync",
    liveLabel: "Multi-window sync docs",
    docsHref: "/multi-window-sync",
  },
  history: {
    group: "persistence",
    complexity: "intermediate",
    whatYouLearn: "Undo and redo across theme changes.",
    whyItWorks:
      "History records selections rather than DOM state, so undo restores a whole theme coherently instead of replaying individual property writes.",
    variations: [
      "Bound the stack to cap memory in a long-lived session",
      "Expose history as a timeline UI with jump-to-entry",
    ],
    liveHref: "/advanced-features",
    liveLabel: "Advanced features — history",
    docsHref: "/advanced-features",
  },
  snapshots: {
    group: "persistence",
    complexity: "advanced",
    whatYouLearn: "Capturing and restoring a full runtime snapshot.",
    whyItWorks:
      "A snapshot captures the runtime's resolved state, so restoring it does not depend on replaying the sequence of changes that produced it.",
    variations: [
      "Save snapshots to storage to restore an exact UI state",
      "Diff two snapshots to see what a theme change actually altered",
    ],
    liveHref: "/theme-inspector",
    liveLabel: "Theme Inspector — inspect live state",
    docsHref: "/advanced-features",
  },
  "zero-flash": {
    group: "first-paint",
    complexity: "advanced",
    whatYouLearn: "Emitting a pre-paint bootstrap script that applies the stored theme before first paint.",
    whyItWorks:
      "The script is synchronous and inlined in `<head>`, so it runs before the browser has any content to paint — the correct theme is in place before the first frame exists.",
    variations: [
      "Resolve the theme on the server and inline the resolved value",
      "Pair it with the Vite plugin so the built `index.html` already contains it",
    ],
    liveHref: "/zero-flash",
    liveLabel: "Zero-flash docs",
    docsHref: "/no-flash-ssr",
  },
  runtime: {
    group: "runtime",
    complexity: "intermediate",
    whatYouLearn: "Creating and driving a runtime directly, without a framework binding.",
    whyItWorks:
      "The runtime is the same object every adapter wraps, so anything you can do through a hook you can do here — the hooks are convenience, not the API surface.",
    variations: [
      "Drive it from a plain `<script>` on a server-rendered page",
      "Wrap it in your own store when you already have one",
    ],
    liveHref: "/vanilla",
    liveLabel: "Framework-free docs",
    docsHref: "/architecture",
  },
  plugins: {
    group: "runtime",
    complexity: "advanced",
    whatYouLearn: "Extending the runtime with a plugin.",
    whyItWorks:
      "Plugins hook named lifecycle events rather than patching internals, so a plugin keeps working across runtime releases that do not change the event contract.",
    variations: [
      "Ship a plugin as its own package when it is reusable",
      "Compose several plugins and rely on registration order",
    ],
    liveHref: "/plugins",
    liveLabel: "Plugins docs",
    docsHref: "/plugins",
  },
  devtools: {
    group: "runtime",
    complexity: "beginner",
    whatYouLearn: "Inspecting the live theme during development.",
    whyItWorks:
      "The inspector reads the runtime's resolved state, so it shows what the app is actually using rather than what the theme file declares.",
    variations: [
      "Register it as a plugin so it follows the runtime lifecycle",
      "Ship it behind a dev-only flag so it is absent from production",
    ],
    liveHref: "/devtools",
    liveLabel: "DevTools docs",
    docsHref: "/devtools",
  },
  cli: {
    group: "runtime",
    complexity: "intermediate",
    whatYouLearn: "Driving the CLI from code instead of a shell.",
    whyItWorks:
      "Each command is an exported function, so the CLI is scriptable and its argument parsing is reusable — the terminal entry point is a thin wrapper.",
    variations: [
      "Run it from a CI step and branch on the exit code",
      "Call the command function directly from a Node script",
    ],
    liveHref: "/cli/reference",
    liveLabel: "CLI reference",
    docsHref: "/cli",
  },
  scheduling: {
    group: "runtime",
    complexity: "intermediate",
    whatYouLearn: "Switching theme automatically on a schedule.",
    whyItWorks:
      "The schedule produces a selection through the same path as a manual switch, so a scheduled change is indistinguishable from a user action downstream.",
    variations: [
      "Override the schedule with a manual choice until the next boundary",
      "Persist the schedule so it survives a reload",
    ],
    liveHref: "/sunrise-sunset",
    liveLabel: "Sunrise & sunset docs",
    docsHref: "/sunrise-sunset",
  },
  "sunrise-sunset": {
    group: "runtime",
    complexity: "advanced",
    whatYouLearn: "Computing solar times for a location and switching the theme at dusk and dawn.",
    whyItWorks:
      "Solar times are computed from the location and date rather than polled, so the boundary is exact and the app does not need a timer per minute.",
    variations: [
      "Use the browser time zone when no explicit location is configured",
      "Let users pick a location manually instead of geolocating",
    ],
    liveHref: "/sunrise-sunset",
    liveLabel: "Sunrise & sunset docs",
    docsHref: "/sunrise-sunset",
  },
};

export type StarterEditorial = {
  label: string;
  blurb: string;
  complexity: Complexity;
  /** The framework guide that explains this integration. */
  docsHref: string;
};

export const STARTER_EDITORIAL: Record<string, StarterEditorial> = {
  react: {
    label: "React",
    blurb: "React 19 with the provider and hooks, built by Vite.",
    complexity: "beginner",
    docsHref: "/framework-guides/react",
  },
  next: {
    label: "Next.js",
    blurb: "App Router with server-side theme resolution.",
    complexity: "intermediate",
    docsHref: "/framework-guides/next",
  },
  vue: {
    label: "Vue 3",
    blurb: "Vue 3 with the plugin and composables, built by Vite.",
    complexity: "beginner",
    docsHref: "/framework-guides/vue",
  },
  nuxt: {
    label: "Nuxt",
    blurb: "Nuxt module with SSR and cookie persistence.",
    complexity: "intermediate",
    docsHref: "/framework-guides/nuxt",
  },
  svelte: {
    label: "Svelte 5",
    blurb: "Svelte 5 runes, built by Vite.",
    complexity: "beginner",
    docsHref: "/framework-guides/svelte",
  },
  solid: {
    label: "SolidJS",
    blurb: "Solid signals, built by Vite.",
    complexity: "beginner",
    docsHref: "/framework-guides/solid",
  },
  angular: {
    label: "Angular",
    blurb: "Angular DI providers and the scope directive.",
    complexity: "intermediate",
    docsHref: "/framework-guides/angular",
  },
  astro: {
    label: "Astro",
    blurb: "Astro integration with React islands.",
    complexity: "intermediate",
    docsHref: "/framework-guides/astro",
  },
  remix: {
    label: "Remix",
    blurb: "Remix v2 with loader-side theme resolution.",
    complexity: "intermediate",
    docsHref: "/framework-guides/remix",
  },
  web: {
    label: "Web Components",
    blurb: "Custom elements with no framework at all.",
    complexity: "beginner",
    docsHref: "/framework-guides/web",
  },
  tailwind: {
    label: "Tailwind CSS v4",
    blurb: "The Tailwind plugin exposing tokens as utilities.",
    complexity: "beginner",
    docsHref: "/framework-guides/tailwind",
  },
};

/** A concept example joined with its editorial entry. */
export type MappedConcept = ConceptExample & ConceptEditorial;

/** A starter app joined with its editorial entry. */
export type MappedStarter = StarterExample & StarterEditorial;

export const CONCEPTS: MappedConcept[] = CONCEPT_EXAMPLES.map((example) => {
  const editorial = CONCEPT_EDITORIAL[example.feature];
  return {
    ...example,
    group: editorial?.group ?? "runtime",
    complexity: editorial?.complexity ?? "intermediate",
    whatYouLearn: editorial?.whatYouLearn ?? "",
    whyItWorks: editorial?.whyItWorks ?? "",
    variations: editorial?.variations ?? [],
    ...(editorial?.liveHref ? { liveHref: editorial.liveHref } : {}),
    ...(editorial?.liveLabel ? { liveLabel: editorial.liveLabel } : {}),
    docsHref: editorial?.docsHref ?? "/core-concepts",
  };
});

export const STARTERS: MappedStarter[] = STARTER_EXAMPLES.map((example) => {
  const editorial = STARTER_EDITORIAL[example.framework];
  return {
    ...example,
    label: editorial?.label ?? example.framework,
    blurb: editorial?.blurb ?? "",
    complexity: editorial?.complexity ?? "intermediate",
    docsHref: editorial?.docsHref ?? "/framework-guides",
  };
});

/** Distinct frameworks across both kinds, for the filter bar. */
export const FRAMEWORKS: string[] = [
  ...new Set([...STARTERS.map((s) => s.framework), ...CONCEPTS.map((c) => c.framework)]),
].sort();

/** Distinct @theme-kit packages used by any example, for the filter bar. */
export const PACKAGES_USED: string[] = [
  ...new Set([...STARTERS.flatMap((s) => s.packages), ...CONCEPTS.flatMap((c) => c.packages)]),
].sort();

/** A repo link for an example directory. */
export function exampleRepoPath(dir: string): string {
  return `examples/${dir}`;
}
