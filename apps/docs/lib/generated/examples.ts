/**
 * GENERATED FILE — do not edit.
 *
 * Produced by `apps/docs/scripts/generate-examples.mjs` from the real
 * `examples/` workspace: the 21 concept examples' own `example.meta.json`
 * files and the 10 framework starter apps' `package.json`. Regenerate with
 * `pnpm --filter @theme-kit/docs examples:generate`; `examples:check` fails
 * when this drifts.
 *
 * Consumed by `/examples` and merged with the editorial layer in
 * `lib/examples.ts`.
 */

/** A focused, framework-specific implementation of one Theme Kit feature. */
export type ConceptExample = {
  kind: "concept";
  id: string;
  /** Path under `examples/`, e.g. `persistence/react`. */
  dir: string;
  /** The Theme Kit feature being demonstrated, e.g. `persistence`. */
  feature: string;
  /** `core` or a framework name. */
  framework: string;
  /** @theme-kit packages the example uses. */
  packages: string[];
  peerDependencies: string[];
  /** Source files, relative to `dir`. */
  files: string[];
  /** The file to read first, relative to `dir`. */
  entry: string;
  prerequisites: string[];
  /** The public APIs the example exercises — verified against the packages. */
  exportsUsed: string[];
};

/** A full runnable app for one framework integration. */
export type StarterExample = {
  kind: "starter";
  id: string;
  /** Path under `examples/`, e.g. `react`. */
  dir: string;
  framework: string;
  /** Workspace package name, e.g. `@theme-kit/example-react`. */
  name: string;
  packages: string[];
  devCommand: string;
  hasBuild: boolean;
};

export type GeneratedExample = ConceptExample | StarterExample;

export const CONCEPT_EXAMPLES: ConceptExample[] = [
  {
    kind: "concept",
    id: "accessibility-core",
    dir: "accessibility/core",
    feature: "accessibility",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["defineTheme", "getContrastRatio", "validateThemeContrast"],
  },
  {
    kind: "concept",
    id: "basic-theme-react",
    dir: "basic-theme/react",
    feature: "basic-theme",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "useTheme"],
  },
  {
    kind: "concept",
    id: "cli-core",
    dir: "cli/core",
    feature: "cli",
    framework: "core",
    packages: ["@theme-kit/cli"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["parseArgs"],
  },
  {
    kind: "concept",
    id: "custom-scrollbar-react",
    dir: "custom-scrollbar/react",
    feature: "custom-scrollbar",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "ThemeScrollbar"],
  },
  {
    kind: "concept",
    id: "devtools-react",
    dir: "devtools/react",
    feature: "devtools",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "ThemeInspector"],
  },
  {
    kind: "concept",
    id: "families-modes-react",
    dir: "families-modes/react",
    feature: "families-modes",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "useThemeMode", "useThemeFamily", "useSetThemeMode", "useSetThemeFamily", "useToggleTheme"],
  },
  {
    kind: "concept",
    id: "history-react",
    dir: "history/react",
    feature: "history",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "useTheme", "useThemeHistory"],
  },
  {
    kind: "concept",
    id: "multi-window-sync-core",
    dir: "multi-window-sync/core",
    feature: "multi-window-sync",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["createMultiWindowSync"],
  },
  {
    kind: "concept",
    id: "persistence-react",
    dir: "persistence/react",
    feature: "persistence",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "createDefaultPersistence", "ThemeProvider", "useTheme"],
  },
  {
    kind: "concept",
    id: "plugins-core",
    dir: "plugins/core",
    feature: "plugins",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["createPluginManager", "ThemeDefinition", "ThemePlugin"],
  },
  {
    kind: "concept",
    id: "runtime-core",
    dir: "runtime/core",
    feature: "runtime",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["defineTheme", "createThemeRuntime"],
  },
  {
    kind: "concept",
    id: "scheduling-react",
    dir: "scheduling/react",
    feature: "scheduling",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "useThemeSchedule"],
  },
  {
    kind: "concept",
    id: "scopes-core",
    dir: "scopes/core",
    feature: "scopes",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["defineTheme", "resolveScopedTheme", "scopeToCSSVariables", "themeToCSSVariables"],
  },
  {
    kind: "concept",
    id: "snapshots-react",
    dir: "snapshots/react",
    feature: "snapshots",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeRuntimeSnapshot", "ThemeProvider", "useTheme", "useThemeSnapshot", "useThemeRestore"],
  },
  {
    kind: "concept",
    id: "sunrise-sunset-core",
    dir: "sunrise-sunset/core",
    feature: "sunrise-sunset",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["calculateSunTimes", "resolveSolarLocation", "getBrowserTimeZone"],
  },
  {
    kind: "concept",
    id: "theme-generation-core",
    dir: "theme-generation/core",
    feature: "theme-generation",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["generateTheme"],
  },
  {
    kind: "concept",
    id: "theme-scope-react",
    dir: "theme-scope/react",
    feature: "theme-scope",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "useTheme", "ThemeScope"],
  },
  {
    kind: "concept",
    id: "themes-core",
    dir: "themes/core",
    feature: "themes",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["defineTheme", "extendTheme", "getThemeFamily", "getThemeMode", "resolveThemeName"],
  },
  {
    kind: "concept",
    id: "tokens-core",
    dir: "tokens/core",
    feature: "tokens",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["defineTheme", "flattenTokens", "themeToCSSVariables"],
  },
  {
    kind: "concept",
    id: "transitions-react",
    dir: "transitions/react",
    feature: "transitions",
    framework: "react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    peerDependencies: ["react", "react-dom"],
    files: ["src/themes.ts", "src/App.tsx", "src/main.tsx"],
    entry: "src/App.tsx",
    prerequisites: [],
    exportsUsed: ["defineTheme", "ThemeProvider", "useTheme"],
  },
  {
    kind: "concept",
    id: "zero-flash-core",
    dir: "zero-flash/core",
    feature: "zero-flash",
    framework: "core",
    packages: ["@theme-kit/core"],
    peerDependencies: [],
    files: ["src/example.ts"],
    entry: "src/example.ts",
    prerequisites: [],
    exportsUsed: ["createThemeBootstrapScript", "defineTheme"],
  },
];

export const STARTER_EXAMPLES: StarterExample[] = [
  {
    kind: "starter",
    id: "starter-angular",
    dir: "apps/angular",
    framework: "angular",
    name: "@theme-kit/app-angular",
    packages: ["@theme-kit/angular", "@theme-kit/core"],
    devCommand: "pnpm --filter @theme-kit/app-angular dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-astro",
    dir: "apps/astro",
    framework: "astro",
    name: "@theme-kit/app-astro",
    packages: ["@theme-kit/astro", "@theme-kit/core"],
    devCommand: "pnpm --filter @theme-kit/app-astro dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-next",
    dir: "apps/next",
    framework: "next",
    name: "@theme-kit/app-next",
    packages: ["@theme-kit/core", "@theme-kit/next"],
    devCommand: "pnpm --filter @theme-kit/app-next dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-nuxt",
    dir: "apps/nuxt",
    framework: "nuxt",
    name: "@theme-kit/app-nuxt",
    packages: ["@theme-kit/core", "@theme-kit/nuxt"],
    devCommand: "pnpm --filter @theme-kit/app-nuxt dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-react",
    dir: "apps/react",
    framework: "react",
    name: "@theme-kit/app-react",
    packages: ["@theme-kit/core", "@theme-kit/react"],
    devCommand: "pnpm --filter @theme-kit/app-react dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-remix",
    dir: "apps/remix",
    framework: "remix",
    name: "@theme-kit/app-remix",
    packages: ["@theme-kit/core", "@theme-kit/remix"],
    devCommand: "pnpm --filter @theme-kit/app-remix dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-solid",
    dir: "apps/solid",
    framework: "solid",
    name: "@theme-kit/app-solid",
    packages: ["@theme-kit/core", "@theme-kit/solid"],
    devCommand: "pnpm --filter @theme-kit/app-solid dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-svelte",
    dir: "apps/svelte",
    framework: "svelte",
    name: "@theme-kit/app-svelte",
    packages: ["@theme-kit/core", "@theme-kit/svelte"],
    devCommand: "pnpm --filter @theme-kit/app-svelte dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-tailwind",
    dir: "apps/tailwind",
    framework: "tailwind",
    name: "@theme-kit/app-tailwind",
    packages: ["@theme-kit/core", "@theme-kit/react", "@theme-kit/tailwind"],
    devCommand: "pnpm --filter @theme-kit/app-tailwind dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-vue",
    dir: "apps/vue",
    framework: "vue",
    name: "@theme-kit/app-vue",
    packages: ["@theme-kit/core", "@theme-kit/vue"],
    devCommand: "pnpm --filter @theme-kit/app-vue dev",
    hasBuild: true,
  },
  {
    kind: "starter",
    id: "starter-web",
    dir: "apps/web",
    framework: "web",
    name: "@theme-kit/app-web",
    packages: ["@theme-kit/core", "@theme-kit/web"],
    devCommand: "pnpm --filter @theme-kit/app-web dev",
    hasBuild: true,
  },
];
