/**
 * Recipe catalog — the single source of truth for `/recipes` and
 * `/recipes/[id]`. Lives here (rather than inside the route file) so the
 * sitemap can enumerate recipes without duplicating the list and drifting.
 */
export const recipeData = {
  "ssr-zero-flash": {
    title: "SSR Zero-flash Bootstrap",
    description:
      "Prevent the flash of unstyled content by resolving the theme on the server and embedding it in the initial render.",
    prerequisites: [
      "@theme-kit/core installed",
      "Framework adapter (e.g., @theme-kit/next, @theme-kit/nuxt)",
      "Theme configuration with cookie persistence",
    ],
    stack: "Next.js / Nuxt / Astro (SSR-capable frameworks)",
    result: "Zero-flash theme selection on first paint",
    code: `import {
  createThemeBootstrapScript,
  getBuiltInThemes,
} from "@theme-kit/core";

export async function BootstrapScript({ resolvedTheme }) {
  const script = createThemeBootstrapScript({
    themes: getBuiltInThemes(),
    defaultTheme: resolvedTheme,
  });
  return (
    <script dangerouslySetInnerHTML={{ __html: script }} key="theme-bootstrap" />
  );
}`,
    explanation: `The createThemeBootstrapScript function generates a synchronous script that runs before any CSS loads. It sets the correct CSS variables on the <html> element, preventing the browser from displaying the unstyled default theme.

The script:
1. Resolves the theme from cookies, headers, or URL parameters
2. Sets all CSS variables on document.documentElement
3. Does not require any Theme Kit runtime code to load

Make sure to:
- Include the script in <head> before stylesheets
- Use the same theme resolution logic server-side as client-side
- Render the data-theme* attributes the script writes on <html> too, so React
  has nothing to report as a mismatch`,
    nextSteps: [
      { text: "Learn about Persistence", href: "/persistence" },
      { text: "See known limitations", href: "/known-limitations#system-dark-no-js" },
    ],
  },
  "persistent-dark-mode": {
    title: "Persistent Dark Mode",
    description:
      "Save the user's theme preference across page reloads and browser sessions using localStorage or cookies.",
    prerequisites: [
      "@theme-kit/core installed",
      "A theme runtime initialized with persistence adapter",
    ],
    stack: "Any framework",
    result: "Theme selection persists across sessions",
    code: `import {
  createThemeRuntime,
  createPersistencePlugin,
} from "@theme-kit/core";

const runtime = createThemeRuntime({
  defaultTheme: "light",
  plugins: [createPersistencePlugin({ key: "my-app-theme" })],
});`,
    explanation: `The createPersistencePlugin connects the theme store to browser storage. By default it uses localStorage, but you can configure it to use cookies for SSR accessibility.

Important considerations:
- The storage key should be unique to your app
- In incognito/private browsing modes, storage may be cleared on close
- For SSR environments, prefer cookie-based persistence`,
    nextSteps: [
      { text: "Read persistence docs", href: "/persistence" },
      { text: "See cross-tab sync", href: "/recipes/cross-tab-sync" },
    ],
  },
  "system-mode": {
    title: "System Mode",
    description:
      "Respect the user's OS-level dark/light preference and update automatically when it changes.",
    prerequisites: [
      "@theme-kit/core installed",
      "Theme runtime configured with defaultMode",
    ],
    stack: "Any framework",
    result: "Theme automatically matches OS preference",
    code: `import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  defaultTheme: "system", // Respects prefers-color-scheme
});`,
    explanation: `Setting defaultTheme to "system" enables automatic theme resolution based on the CSS media query prefers-color-scheme. The theme will update when the user changes their OS theme preference.

Caveats:
- Without JavaScript, the fallback theme (light) is shown initially
- System mode requires JavaScript to resolve the preference on first paint`,
    nextSteps: [
      { text: "Learn about system mode caveats", href: "/known-limitations#system-dark-no-js" },
    ],
  },
  "theme-transitions": {
    title: "Theme Transitions",
    description:
      "Animate theme switches with customizable duration, easing, and presets for smooth visual experience.",
    prerequisites: [
      "@theme-kit/core installed",
      "Theme runtime initialized",
    ],
    stack: "Any framework",
    result: "Smooth animated theme transitions",
    code: `import { createThemeRuntime } from "@theme-kit/core";

const runtime = createThemeRuntime({
  defaultTheme: "light",
  transition: {
    enabled: true,
    preset: "smooth",
    duration: 360,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
});`,
    explanation: `The transition option enables CSS transition animations when themes change. The preset can be "smooth" (default easing) or "none". You can also provide your own easing function.

Note: Transitions are disabled by default. Enable them explicitly when you want animated theme switches.`,
    nextSteps: [
      { text: "See animation docs", href: "/animation" },
    ],
  },
  "cross-tab-sync": {
    title: "Cross-Tab Sync",
    description:
      "Synchronize theme changes across multiple browser tabs and windows using BroadcastChannel and storage events.",
    prerequisites: [
      "@theme-kit/core installed",
      "Theme runtime with multi-window sync adapter",
    ],
    stack: "Any framework",
    result: "Theme changes sync across all tabs",
    code: `import {
  createThemeRuntime,
  createMultiWindowSync,
} from "@theme-kit/core";

const runtime = createThemeRuntime({
  defaultTheme: "light",
  broadcast: createMultiWindowSync({ prefer: "auto" }),
});`,
    explanation: `createMultiWindowSync detects BroadcastChannel availability and falls back to SharedWorker or storage events as needed. This ensures theme sync works across all browsers, including incognito mode where BroadcastChannel may be blocked.`,
    nextSteps: [
      { text: "Learn about sync", href: "/multi-window-sync" },
    ],
  },
  "custom-scrollbar": {
    title: "Custom Scrollbar",
    description:
      "Overlay themed scrollbars that track the active theme with smooth transitions and touch-friendly interactions.",
    prerequisites: [
      "@theme-kit/core installed",
      "Theme scrollbar plugin",
    ],
    stack: "Any framework",
    result: "Custom themed overlay scrollbars",
    code: `import {
  createThemeRuntime,
  createOverlayScrollbar,
} from "@theme-kit/core";

const runtime = createThemeRuntime({
  defaultTheme: "light",
  plugins: [createOverlayScrollbar()],
});`,
    explanation: `The overlay scrollbar replaces native scrollbars with a themed overlay that:
- Uses theme colors for thumb and track
- Smoothly animates theme switches
- Works responsively on touch devices
- Does not affect layout (preserves content width)`,
    nextSteps: [
      { text: "Configure scrollbar", href: "/custom-scrollbar" },
    ],
  },
  "scoped-dashboard-theme": {
    title: "Scoped Dashboard Theme",
    description:
      "Apply a different theme to a specific subtree (like a dashboard panel) while keeping the rest of the app in its default theme.",
    prerequisites: [
      "@theme-kit/core installed",
      "A custom theme defined",
    ],
    stack: "React",
    result: "Scoped themes for dashboard sections",
    // The snippet imports `ThemeScope` from the React bindings, so this recipe
    // is React-specific.
    packages: ["@theme-kit/core", "@theme-kit/react"],
    code: `import { ThemeScope } from "@theme-kit/react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ThemeScope theme="corporate-light">
        <WidgetPanel />
        <AnalyticsCard />
      </ThemeScope>
    </div>
  );
}`,
    explanation: `ThemeScope wraps a subtree with an alternate theme. It accepts:
- A theme name (string)
- A theme family (string)
- An object { family, mode }

Note: In Svelte, ThemeScope reads props only at mount time. Other frameworks react to prop changes.`,
    nextSteps: [
      { text: "Read scoped themes", href: "/scoped-theme" },
    ],
  },
  "accessible-palette-generation": {
    title: "Accessible Palette Generation",
    description:
      "Generate color palettes that meet WCAG contrast requirements using Theme Kit's contrast validation.",
    prerequisites: [
      "@theme-kit/core installed",
      "Basic color palette",
    ],
    stack: "Any framework",
    result: "WCAG-compliant color tokens",
    code: `import {
  getContrastRatio,
  validateThemeContrast,
} from "@theme-kit/core";

// Contrast ratio between two colors.
// WCAG 2.1 AA needs 4.5:1 for normal text and 3:1 for large text.
const ratio = getContrastRatio("#000000", "#ffffff");
console.log(ratio.toFixed(2), ratio >= 4.5 ? "passes AA" : "fails AA");

// Validate every semantic pair in a theme at once
const result = validateThemeContrast(theme);
if (!result.valid) {
  console.error(
    "Failing pairs:",
    result.checks.filter((c) => !c.passesAANormal),
  );
}`,
    explanation: `Use getContrastRatio to check an individual color pair against the WCAG thresholds, and validateThemeContrast to audit every semantic pair in a theme in one pass. The Accessibility Lab runs both against the active theme in real time.`,
    nextSteps: [
      { text: "Use Accessibility Lab", href: "/accessibility" },
    ],
  },
  "cli-theme-generation": {
    title: "CLI-Driven Theme Generation",
    description:
      "Use the Theme Kit CLI to generate complete theme families from seed colors in your build pipeline.",
    prerequisites: [
      "@theme-kit/cli installed",
      "Seed color definition",
    ],
    stack: "Node.js (CI/CD)",
    result: "Generated theme files in your project",
    // This recipe drives the CLI, not the runtime — the only recipe that does.
    packages: ["@theme-kit/cli"],
    code: `theme-kit generate \\
  --seed "#6366f1" \\
  --output ./src/themes/brand.json \\
  --format json`,
    explanation: `The generate command creates light/dark theme pairs from a seed color. Output can be JSON, TypeScript, or raw CSS variables. Use in CI to generate consistent themes during build.`,
    nextSteps: [
      { text: "CLI Generate docs", href: "/cli/generate" },
    ],
  },
} as const;

export type RecipeId = keyof typeof recipeData;

/**
 * Canonical ordered recipe list.
 *
 * Derived from `recipeData` rather than maintained alongside it, so the index
 * page and the detail pages cannot disagree. Object key order is insertion order
 * for string keys, so this is the order the recipes are written in.
 */
export const RECIPES: { slug: RecipeId; title: string; description: string }[] =
  (Object.keys(recipeData) as RecipeId[]).map((slug) => ({
    slug,
    title: recipeData[slug].title,
    description: recipeData[slug].description,
  }));

/** Previous and next recipe in the canonical order, for page pagination. */
export function recipeNeighbours(slug: RecipeId): {
  prev?: { slug: RecipeId; title: string };
  next?: { slug: RecipeId; title: string };
} {
  const i = RECIPES.findIndex((r) => r.slug === slug);
  if (i === -1) return {};
  return {
    ...(i > 0 ? { prev: RECIPES[i - 1]! } : {}),
    ...(i < RECIPES.length - 1 ? { next: RECIPES[i + 1]! } : {}),
  };
}

/**
 * The packages a recipe needs installed.
 *
 * Declared explicitly per recipe because the code alone is not enough: the CLI
 * recipe's snippet is a shell command (`theme-kit generate …`) that names no
 * package at all. Defaults to core, which is what most recipes import.
 */
export function recipePackages(slug: RecipeId): string[] {
  const declared = (recipeData[slug] as { packages?: string[] }).packages;
  return declared ?? ["@theme-kit/core"];
}

/** Every `@theme-kit/*` package imported by a recipe's snippet. */
export function recipeImportedPackages(slug: RecipeId): string[] {
  return [
    ...new Set(
      [...recipeData[slug].code.matchAll(/@theme-kit\/[a-z-]+/g)].map((m) => m[0]),
    ),
  ];
}
