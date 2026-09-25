import { PACKAGE_GRAPH, type PackageGraphEntry } from "./generated/package-graph";

/**
 * Editorial layer for `/package-map`.
 *
 * The *structure* (dependencies, used-by, peer deps, subpaths, install command)
 * is generated from the manifests into `lib/generated/package-graph.ts` and must
 * not be duplicated here. This file adds the judgement a manifest cannot carry:
 * which layer a package belongs to, whether it runs at runtime or build time,
 * why it exists, the APIs you actually reach for, and what to pair it with.
 *
 * `primaryApis` is verified against each package's real exports by
 * `scripts/verify-package-apis.mjs`, so a renamed export fails the gate instead
 * of quietly becoming a dead link in the docs.
 */

export type PackageLayer = "core" | "frameworks" | "ui" | "tooling";

/** How the package participates in a build. */
export type PackageRole = "runtime" | "build-time" | "both";

export type PackageEditorial = {
  layer: PackageLayer;
  role: PackageRole;
  /** One sentence on why this package exists — not a restatement of the manifest description. */
  purpose: string;
  /** The exports you actually reach for. Verified against the built package. */
  primaryApis: string[];
  /** Concrete situations that call for this package. */
  useCases: string[];
  /** Package names worth reading next. */
  related: string[];
};

export const LAYERS: {
  id: PackageLayer;
  label: string;
  blurb: string;
}[] = [
  {
    id: "core",
    label: "Core",
    blurb:
      "The engine. Framework-agnostic, dependency-free, and the only package that is not a binding over something else.",
  },
  {
    id: "frameworks",
    label: "Framework integrations",
    blurb:
      "One per rendering model. Each wraps the core runtime in the idioms of its framework and handles that framework's SSR story.",
  },
  {
    id: "ui",
    label: "UI library adapters",
    blurb:
      "Bridge Theme Kit tokens into a component library's own theming system, so its components follow your theme without restyling.",
  },
  {
    id: "tooling",
    label: "Tooling & build-time",
    blurb:
      "Everything that runs outside your app's runtime: the CLI, the devtools inspector, and the Tailwind CSS bridge.",
  },
];

export const EDITORIAL: Record<string, PackageEditorial> = {
  "@theme-kit/core": {
    layer: "core",
    role: "runtime",
    purpose:
      "Owns the theme model and the runtime. Every other package is a thin binding over this one, so behavior cannot diverge between frameworks.",
    primaryApis: [
      "defineTheme",
      "createThemeStore",
      "createThemeRuntime",
      "getBuiltInThemes",
      "themeToCSSVariables",
      "resolveTheme",
      "composeTheme",
      "generateTheme",
      "validateTheme",
      "createThemeBootstrapScript",
    ],
    useCases: [
      "Any app without a framework adapter — plain HTML, a custom renderer, or a server-rendered template",
      "Deriving a light/dark pair from a single seed color at build time",
      "Reading and writing theme state outside a component tree",
    ],
    related: ["@theme-kit/react", "@theme-kit/web", "@theme-kit/cli"],
  },

  "@theme-kit/react": {
    layer: "frameworks",
    role: "runtime",
    purpose:
      "React bindings: a provider, hooks, and scoped themes. Adds no theming logic of its own.",
    primaryApis: ["ThemeProvider", "useTheme", "useThemeRuntime", "ThemeScope"],
    useCases: [
      "Any React app (Vite, CRA, React Router) that is not Next.js or Remix",
      "Scoping a different theme to a subtree without touching global state",
    ],
    related: ["@theme-kit/core", "@theme-kit/next", "@theme-kit/remix"],
  },

  "@theme-kit/next": {
    layer: "frameworks",
    role: "both",
    purpose:
      "App Router integration. Resolves the theme on the server, emits a pre-paint bootstrap script, and hydrates without a flash or a mismatch.",
    primaryApis: ["ThemeProvider", "ThemeScope", "ThemeScrollbar"],
    useCases: [
      "Next.js App Router apps that need zero-flash SSR theming",
      "Cookie-based theme persistence that is correct on the very first paint",
    ],
    related: ["@theme-kit/react", "@theme-kit/core"],
  },

  "@theme-kit/remix": {
    layer: "frameworks",
    role: "both",
    purpose:
      "Remix integration: loader-side theme resolution plus a pre-paint script, so the server and client agree from the first byte.",
    primaryApis: [
      "ThemeProvider",
      "ThemeHead",
      "getInitialThemeState",
      "createRemixThemePersistence",
    ],
    useCases: [
      "Remix apps where the theme must be decided in a loader",
      "Sharing theme resolution between server and client without duplicating it",
    ],
    related: ["@theme-kit/react", "@theme-kit/core"],
  },

  "@theme-kit/vue": {
    layer: "frameworks",
    role: "runtime",
    purpose:
      "Vue 3 bindings: a provider component, composables, and scoped themes.",
    primaryApis: [
      "ThemeProvider",
      "useTheme",
      "useThemeRuntime",
      "provideThemeRuntime",
      "ThemeScope",
    ],
    useCases: [
      "Vue 3 apps and SPAs that are not Nuxt",
      "Composing theme state into existing setup() code",
    ],
    related: ["@theme-kit/core", "@theme-kit/nuxt"],
  },

  "@theme-kit/nuxt": {
    layer: "frameworks",
    role: "both",
    purpose:
      "Nuxt module. Registers the runtime, resolves the theme in a server plugin, and handles cookie persistence.",
    primaryApis: ["ThemeProvider", "useTheme", "ThemeScope"],
    useCases: [
      "Nuxt apps that need SSR-correct theming and cookie persistence",
      "Keeping a Nuxt app's first paint free of theme flash",
    ],
    related: ["@theme-kit/vue", "@theme-kit/core"],
  },

  "@theme-kit/svelte": {
    layer: "frameworks",
    role: "runtime",
    purpose: "Svelte 5 bindings built on runes.",
    primaryApis: ["ThemeProvider", "useTheme", "ThemeScope"],
    useCases: ["Svelte 5 apps and SvelteKit projects", "Reactive theme reads in runes-based components"],
    related: ["@theme-kit/core", "@theme-kit/web"],
  },

  "@theme-kit/solid": {
    layer: "frameworks",
    role: "runtime",
    purpose: "SolidJS bindings built on signals.",
    primaryApis: ["ThemeProvider", "useTheme", "ThemeScope"],
    useCases: ["SolidJS apps", "Fine-grained reactivity over theme state"],
    related: ["@theme-kit/core", "@theme-kit/web"],
  },

  "@theme-kit/angular": {
    layer: "frameworks",
    role: "runtime",
    purpose:
      "Angular integration: providers that wire the runtime into DI, an injectable accessor, and a directive for scoped themes.",
    primaryApis: [
      "provideThemeKit",
      "injectTheme",
      "ThemeScopeDirective",
      "ThemeInspectorComponent",
    ],
    useCases: [
      "Angular apps that need theming wired into DI",
      "Scoping a theme to a route or component subtree",
    ],
    related: ["@theme-kit/core", "@theme-kit/web"],
  },

  "@theme-kit/web": {
    layer: "frameworks",
    role: "runtime",
    purpose:
      "The vanilla runtime and DOM bindings — custom elements, plain scripts, and the shared base the Vue, Svelte, Solid and Angular packages build on.",
    primaryApis: [
      "ThemeKitProvider",
      "ThemeKitScope",
      "defineCustomElements",
      "useThemeMode",
      "useThemeFamily",
      "useThemeValue",
    ],
    useCases: [
      "No-framework apps, server-rendered templates, and progressive enhancement",
      "Web Components that need to read the active theme",
    ],
    related: ["@theme-kit/core"],
  },

  "@theme-kit/astro": {
    layer: "frameworks",
    role: "both",
    purpose:
      "Astro integration: an Astro integration plus components, with a pre-paint script and SSR-safe CSS templates.",
    primaryApis: ["themeKit", "ThemeKitInspector", "ThemeKitScrollbar", "buildThemeCssMap", "createBlockingScript"],
    useCases: [
      "Astro sites that want zero-flash theming across islands",
      "Static sites where the theme must resolve before first paint",
    ],
    related: ["@theme-kit/core", "@theme-kit/web"],
  },

  "@theme-kit/adapters": {
    layer: "ui",
    role: "runtime",
    purpose:
      "Shared adapter plumbing — token readers, color maths, and the source resolver every UI adapter builds on. You rarely install it directly.",
    primaryApis: ["readToken", "readColor", "readRadius", "mixColors", "generateShades", "resolveAdapterSource"],
    useCases: [
      "Writing your own adapter for a component library Theme Kit does not ship one for",
      "Reading Theme Kit tokens in a framework-agnostic way",
    ],
    related: ["@theme-kit/core", "@theme-kit/mui", "@theme-kit/shadcn"],
  },

  "@theme-kit/shadcn": {
    layer: "ui",
    role: "runtime",
    purpose:
      "Maps Theme Kit tokens onto shadcn/ui's CSS variables, so shadcn components follow your theme untouched.",
    primaryApis: ["createShadcnAdapter", "createShadcnVariables", "injectShadcnCSS"],
    useCases: [
      "shadcn/ui projects that want Theme Kit's families and persistence",
      "Keeping shadcn's CSS-variable contract while swapping the token source",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/tailwind", "@theme-kit/next"],
  },

  "@theme-kit/mui": {
    layer: "ui",
    role: "runtime",
    purpose: "Builds an MUI theme object from Theme Kit tokens and keeps the two in sync.",
    primaryApis: ["MuiThemeProvider", "createMuiTheme", "createMuiAdapter", "useMuiTheme"],
    useCases: [
      "Material UI apps that must follow a Theme Kit theme",
      "Driving MUI's palette, typography and shape from semantic tokens",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/react"],
  },

  "@theme-kit/chakra": {
    layer: "ui",
    role: "runtime",
    purpose: "Builds a Chakra UI theme from Theme Kit tokens and provides it to the tree.",
    primaryApis: ["ChakraThemeProvider", "createChakraTheme", "createChakraAdapter", "useChakraTheme"],
    useCases: [
      "Chakra UI apps that need Theme Kit's runtime and persistence",
      "Mapping semantic tokens onto Chakra's token system",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/react"],
  },

  "@theme-kit/antd": {
    layer: "ui",
    role: "runtime",
    purpose: "Feeds Theme Kit tokens into Ant Design's ConfigProvider theme.",
    primaryApis: ["AntdThemeProvider", "buildAntdConfig", "createAntdAdapter", "useAntdTheme"],
    useCases: [
      "Ant Design apps that must follow a Theme Kit theme",
      "Deriving Ant Design's design tokens from semantic tokens",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/react"],
  },

  "@theme-kit/mantine": {
    layer: "ui",
    role: "runtime",
    purpose: "Bridges a Theme Kit runtime into a Mantine theme object.",
    primaryApis: ["MantineThemeProvider", "createMantineTheme", "useMantineTheme"],
    useCases: [
      "Mantine apps that need Theme Kit's families and persistence",
      "Driving Mantine's color scheme from Theme Kit's mode",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/react"],
  },

  "@theme-kit/bootstrap": {
    layer: "ui",
    role: "runtime",
    purpose:
      "Generates Bootstrap 5 CSS variables from Theme Kit tokens — usable from any framework, not just React.",
    primaryApis: ["createBootstrapAdapter", "createBootstrapVariables", "injectBootstrapCSS"],
    useCases: [
      "Bootstrap 5 sites that want Theme Kit's theme switching",
      "Keeping `--bs-*` variables in step with your semantic tokens",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/core"],
  },

  "@theme-kit/daisyui": {
    layer: "ui",
    role: "runtime",
    purpose: "Generates daisyUI's theme variables from Theme Kit tokens.",
    primaryApis: ["createDaisyAdapter", "createDaisyVariables", "injectDaisyCSS"],
    useCases: [
      "daisyUI projects that want Theme Kit families and persistence",
      "Driving daisyUI's `--p`/`--b1`/… variables from semantic tokens",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/tailwind"],
  },

  "@theme-kit/open-props": {
    layer: "ui",
    role: "runtime",
    purpose: "Maps Theme Kit tokens onto Open Props custom properties.",
    primaryApis: ["createOpenPropsAdapter", "createOpenPropsVariables", "injectOpenPropsCSS"],
    useCases: [
      "Projects built on Open Props that want Theme Kit's runtime",
      "Exposing semantic tokens under Open Props' naming",
    ],
    related: ["@theme-kit/adapters", "@theme-kit/core"],
  },

  "@theme-kit/unocss": {
    layer: "ui",
    role: "build-time",
    purpose: "A UnoCSS preset that exposes Theme Kit tokens as utilities.",
    primaryApis: ["presetThemeKit", "createUnoTheme"],
    useCases: [
      "UnoCSS projects that want token-driven utilities",
      "Generating utility classes from semantic tokens at build time",
    ],
    related: ["@theme-kit/core", "@theme-kit/tailwind"],
  },

  "@theme-kit/tailwind": {
    layer: "tooling",
    role: "build-time",
    purpose:
      "Tailwind CSS v4 plugin that publishes Theme Kit tokens as Tailwind theme variables, plus the dark-mode class helper.",
    primaryApis: ["createTailwindPlugin", "themeCSS", "synchronizeDarkClass"],
    useCases: [
      "Tailwind v4 projects that want `bg-background`-style utilities driven by semantic tokens",
      "Keeping Tailwind's `dark:` variant aligned with Theme Kit's mode",
    ],
    related: ["@theme-kit/core", "@theme-kit/shadcn", "@theme-kit/daisyui"],
  },

  "@theme-kit/cli": {
    layer: "tooling",
    role: "build-time",
    purpose:
      "Generate, validate, inspect, migrate and export themes from a terminal or CI pipeline. Also usable as a library, since each command is exported.",
    primaryApis: [
      "cmdGenerate",
      "cmdValidate",
      "cmdMigrate",
      "cmdInspect",
      "cmdExport",
      "ExitCodes",
      "parseArgs",
    ],
    useCases: [
      "Gating a pull request on theme validity",
      "Generating a theme family from a brand seed color in CI",
      "Migrating a theme file written against an older format",
    ],
    related: ["@theme-kit/core"],
  },

  "@theme-kit/devtools": {
    layer: "tooling",
    role: "runtime",
    purpose:
      "Inspect the live theme at runtime — active tokens, resolved values, and the selection that produced them.",
    primaryApis: ["createDevToolsPanel", "createDevToolsInspector", "createDevToolsPlugin"],
    useCases: [
      "Debugging why a token resolves to an unexpected value",
      "Inspecting scoped themes and inherited tokens during development",
    ],
    related: ["@theme-kit/core"],
  },
};

/** A graph entry joined with its editorial layer. */
export type MappedPackage = PackageGraphEntry & PackageEditorial;

/**
 * Every package in the monorepo, enriched.
 *
 * A package present in the graph but missing from `EDITORIAL` still appears —
 * with `purpose` falling back to its manifest description and empty lists — so
 * a newly added package shows up as incomplete rather than vanishing silently.
 */
export const PACKAGE_MAP: MappedPackage[] = PACKAGE_GRAPH.map((entry) => {
  const editorial = EDITORIAL[entry.name];
  return {
    ...entry,
    layer: editorial?.layer ?? "tooling",
    role: editorial?.role ?? "runtime",
    purpose: editorial?.purpose ?? entry.description,
    primaryApis: editorial?.primaryApis ?? [],
    useCases: editorial?.useCases ?? [],
    related: editorial?.related ?? [],
  };
});

/** Packages with no editorial entry yet — surfaced in dev so gaps are visible. */
export const UNMAPPED_PACKAGES = PACKAGE_MAP.filter((p) => !EDITORIAL[p.name]).map(
  (p) => p.name,
);

export function packagesInLayer(layer: PackageLayer): MappedPackage[] {
  return PACKAGE_MAP.filter((p) => p.layer === layer);
}

/** `@theme-kit/mui` → `mui`, used for anchors and short labels. */
export function shortName(name: string): string {
  return name.replace("@theme-kit/", "");
}

export function packageByName(name: string): MappedPackage | undefined {
  return PACKAGE_MAP.find((p) => p.name === name);
}
