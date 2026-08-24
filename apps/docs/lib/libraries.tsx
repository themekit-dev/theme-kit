import { type ReactElement } from "react";
import { Icon } from "@iconify/react";

const icons = {
  shadcn: <Icon icon="simple-icons:shadcnui" width={24} height={24} />,
  bootstrap: <Icon icon="devicon:bootstrap" width={24} height={24} />,
  daisyui: <Icon icon="simple-icons:daisyui" width={24} height={24} />,
  openprops: <Icon icon="simple-icons:css3" width={24} height={24} />,
  mui: <Icon icon="simple-icons:mui" width={24} height={24} />,
  chakra: <Icon icon="simple-icons:chakraui" width={24} height={24} />,
  antd: <Icon icon="simple-icons:antdesign" width={24} height={24} />,
  mantine: <Icon icon="simple-icons:mantine" width={24} height={24} />,
  unocss: <Icon icon="simple-icons:unocss" width={24} height={24} />,
};

export type LibraryFeature = {
  name: string;
  desc: string;
};

export type LibraryGroup = {
  label: string;
  features: LibraryFeature[];
};

export type LibrarySnippet = {
  title: string;
  lang: string;
  code: string;
};

export type LibraryFrameworkExample = {
  label: string;
  lang: string;
  code: string;
};

export type LibraryItem = {
  slug: string;
  name: string;
  icon: ReactElement;
  pkg: string;
  tagline: string;
  mark: string;
  tags: string[];
  kind: string;
  groups: LibraryGroup[];
  snippet2: LibrarySnippet;
  frameworks?: LibraryFrameworkExample[];
  /** Import path for the adapter's CSS file (e.g. "@theme-kit/shadcn/shadcn.css").
   *  Only adapters that map CSS variables ship a stylesheet; others are
   *  runtime-only and need no CSS import. */
  css?: string;
  featureCount: number;
};

type RawLibrary = Omit<LibraryItem, "featureCount">;

function cssAdapterFrameworks(opts: {
  hook: string;
  injectable: string;
  pkg: string;
}): LibraryFrameworkExample[] {
  const { hook, injectable, pkg } = opts;
  return [
    {
      label: "React",
      lang: "tsx",
      code: `import { ThemeProvider } from "@theme-kit/react";
import { ${hook} } from "${pkg}";

function Inside() {
  ${hook}();
  return null;
}

export function App() {
  return (
    <ThemeProvider>
      <Inside />
      <YourApp />
    </ThemeProvider>
  );
}`,
    },
    {
      label: "Vue 3",
      lang: "vue",
      code: `<script setup>
import { createThemeRuntime } from "@theme-kit/core";
import { provideThemeRuntime, ${hook} } from "@theme-kit/vue";

provideThemeRuntime(createThemeRuntime({ initial: "light" }));
${hook}();
</script>

<template>
  <YourApp />
</template>`,
    },
    {
      label: "Svelte",
      lang: "svelte",
      code: `<script>
  import { createThemeRuntime } from "@theme-kit/core";
  import { setThemeRuntime, ${hook} } from "@theme-kit/svelte";

  setThemeRuntime(createThemeRuntime({ initial: "light" }));
  ${hook}();
</script>

<YourApp />`,
    },
    {
      label: "Solid",
      lang: "tsx",
      code: `import { ThemeProvider, ${hook} } from "@theme-kit/solid";

export function App() {
  ${hook}();
  return <YourApp />;
}`,
    },
    {
      label: "Angular",
      lang: "ts",
      code: `import { provideThemeKit, ${injectable} } from "@theme-kit/angular";

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideThemeKit({ themes: getBuiltInThemes() })],
};

// app.component.ts
@Component({})
export class AppComponent {
  constructor() {
    ${injectable}();
  }
}`,
    },
    {
      label: "Next.js",
      lang: "tsx",
      code: `"use client";
import { ${hook} } from "@theme-kit/next/client";

export function RootClient() {
  ${hook}();
  return null;
}`,
    },
    {
      label: "Nuxt",
      lang: "vue",
      code: `<script setup>
import { ${hook} } from "@theme-kit/nuxt";

${hook}();
</script>

<template>
  <YourApp />
</template>`,
    },
    {
      label: "Remix",
      lang: "tsx",
      code: `import { ${hook} } from "@theme-kit/remix";

export function Layout({ children }: { children: React.ReactNode }) {
  ${hook}();
  return <>{children}</>;
}`,
    },
    {
      label: "Astro",
      lang: "tsx",
      code: `// src/components/theme-adapter.tsx (client island)
import { ${hook} } from "@theme-kit/astro/client";

export default function ThemeAdapter() {
  ${hook}();
  return null;
}

// In layout.astro:
// <ThemeAdapter client:only="react" />`,
    },
  ];
}

function generatedThemeFrameworks(opts: {
  provider: string;
  pkg: string;
}): LibraryFrameworkExample[] {
  const { provider, pkg } = opts;
  return [
    {
      label: "React",
      lang: "tsx",
      code: `import { ThemeProvider, useThemeRuntime } from "@theme-kit/react";
import { ${provider} } from "${pkg}";

function Zone() {
  const runtime = useThemeRuntime();
  return (
    <${provider} runtime={runtime}>
      <YourApp />
    </${provider}>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <Zone />
    </ThemeProvider>
  );
}`,
    },
    {
      label: "Next.js",
      lang: "tsx",
      code: `"use client";
import { ${provider}, useThemeRuntime } from "@theme-kit/next/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}`,
    },
    {
      label: "Remix",
      lang: "tsx",
      code: `import { ${provider}, useThemeRuntime } from "@theme-kit/remix";

export function RootLayout({ children }: { children: React.ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}`,
    },
    {
      label: "Astro",
      lang: "tsx",
      code: `// src/components/zone.tsx (client island)
import { ${provider}, useThemeRuntime } from "@theme-kit/astro/client";

export default function Zone({ children }: { children: React.ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}

// In layout.astro:
// <Zone client:only="react">{children}</Zone>`,
    },
  ];
}

function unocssFrameworkExample(): LibraryFrameworkExample[] {
  return [
    {
      label: "Any framework",
      lang: "tsx",
      code: `// vite.config.ts
import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import presetUno from "unocss/preset-uno";
import { presetThemeKit } from "@theme-kit/unocss";

export default defineConfig({
  plugins: [UnoCSS({ presets: [presetUno(), presetThemeKit()] })],
});

// Then use the semantic utilities in whatever framework you like:
<div className="bg-primary text-primary-foreground rounded-lg shadow-md" />`,
    },
  ];
}

export const rawLibraries: RawLibrary[] = [
  {
    slug: "shadcn",
    name: "shadcn/ui",
    icon: icons.shadcn,
    pkg: "@theme-kit/shadcn",
    tagline:
      "Drive shadcn/ui components with Theme Kit semantic tokens via a CSS-variable adapter that stays in sync at runtime.",
    mark: "SH",
    frameworks: cssAdapterFrameworks({
      hook: "useShadcnTheme",
      injectable: "injectShadcnTheme",
      pkg: "@theme-kit/shadcn",
    }),
    kind: "CSS Variables",
    css: "@theme-kit/shadcn/shadcn.css",
    tags: ["Radix", "CSS vars", "Runtime"],
    groups: [
      {
        label: "Adapter",
        features: [
          {
            name: "createShadcnAdapter(options)",
            desc: "Installs a tagged `:root` style element whose `--*` variables (colors, radius, border, shadow, typography) update as the theme changes.",
          },
          {
            name: "createShadcnVariables(source)",
            desc: "Generates the concrete shadcn CSS-variable map from a theme definition or tokens, without touching the DOM.",
          },
          {
            name: "useShadcnTheme(options?)",
            desc: "React hook that creates, installs, and disposes the adapter onto the active runtime. Call once in your app root.",
          },
          {
            name: "injectShadcnCSS()",
            desc: "Idempotent, SSR-safe helper that injects the shadcn compatibility stylesheet. Called automatically by the hook.",
          },
        ],
      },
      {
        label: "Options",
        features: [
          {
            name: "CreateShadcnAdapterOptions",
            desc: "Accepts `strategy` to hand a custom token→variable mapping to the adapter.",
          },
          {
            name: "ShadcnAdapterOptions",
            desc: "Typed options for how semantic tokens map to shadcn CSS custom properties.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Standalone variables",
      lang: "ts",
      code: `import { createShadcnVariables } from "@theme-kit/shadcn";
import { resolveInitialTheme, getBuiltInThemes } from "@theme-kit/core";

const themes = getBuiltInThemes();
const { theme } = resolveInitialTheme({ themes, family: "mint" });

const css = createShadcnVariables(theme);
// css -> { "--background": "#...", "--primary": "#...", ... }`,
    },
  },
  {
    slug: "bootstrap",
    name: "Bootstrap",
    icon: icons.bootstrap,
    pkg: "@theme-kit/bootstrap",
    tagline:
      "Compile Bootstrap 5 with Theme Kit semantic tokens through a CSS-variable adapter that refreshes variables as themes change.",
    mark: "BS",
    frameworks: cssAdapterFrameworks({
      hook: "useBootstrapTheme",
      injectable: "injectBootstrapTheme",
      pkg: "@theme-kit/bootstrap",
    }),
    kind: "CSS Variables",
    css: "@theme-kit/bootstrap/bootstrap.css",
    tags: ["v5", "Sass", "Runtime"],
    groups: [
      {
        label: "Adapter",
        features: [
          {
            name: "createBootstrapAdapter(options)",
            desc: "Maintains a tagged `:root` style element with concrete Bootstrap variables, including derived color pairs, kept in sync at runtime.",
          },
          {
            name: "createBootstrapVariables(source)",
            desc: "Produces the concrete Bootstrap CSS custom-property map from a theme source — no DOM required.",
          },
          {
            name: "useBootstrapTheme(options?)",
            desc: "React hook that creates, installs, and disposes the adapter on the current runtime.",
          },
          {
            name: "injectBootstrapCSS()",
            desc: "SSR-safe, idempotent helper that injects Bootstrap compatibility CSS on first use.",
          },
        ],
      },
      {
        label: "Options",
        features: [
          {
            name: "CreateBootstrapAdapterOptions",
            desc: "Accepts `strategy` to customize how tokens become Bootstrap variables.",
          },
          {
            name: "BootstrapAdapterOptions",
            desc: "Options covering derived-color handling (e.g. primary/tint pairs) and defaults.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static variables",
      lang: "ts",
      code: `import { createBootstrapVariables } from "@theme-kit/bootstrap";

const css = createBootstrapVariables({
  family: "plum",
  mode: "dark",
});
// css -> { "--bs-body-bg": "...", "--bs-primary": "...", ... }`,
    },
  },
  {
    slug: "daisyui",
    name: "daisyUI",
    icon: icons.daisyui,
    pkg: "@theme-kit/daisyui",
    tagline:
      "Wire daisyUI components to Theme Kit semantic tokens with a CSS-variable adapter that stays in sync as themes and modes change.",
    mark: "DU",
    frameworks: cssAdapterFrameworks({
      hook: "useDaisyTheme",
      injectable: "injectDaisyTheme",
      pkg: "@theme-kit/daisyui",
    }),
    kind: "CSS Variables",
    css: "@theme-kit/daisyui/daisyui.css",
    tags: ["Tailwind", "Framework", "Runtime"],
    groups: [
      {
        label: "Adapter",
        features: [
          {
            name: "createDaisyAdapter(options)",
            desc: "Installs a tagged `:root` style element with concrete daisyUI variables (background, foreground, base-100/200/300, primary, etc.).",
          },
          {
            name: "createDaisyVariables(source)",
            desc: "Generates the daisyUI CSS custom-property map from a theme definition or tokens.",
          },
          {
            name: "useDaisyTheme(options?)",
            desc: "React hook that installs the daisyUI adapter onto the active runtime.",
          },
          {
            name: "injectDaisyCSS()",
            desc: "Idempotent, SSR-safe helper to inject daisyUI compatibility CSS.",
          },
        ],
      },
      {
        label: "Options",
        features: [
          {
            name: "CreateDaisyAdapterOptions",
            desc: "Accepts `strategy` to map semantic tokens to daisyUI variables.",
          },
          {
            name: "DaisyAdapterOptions",
            desc: "Options controlling daisyUI variable derivation and defaults.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static variables",
      lang: "ts",
      code: `import { createDaisyVariables } from "@theme-kit/daisyui";

const css = createDaisyVariables({ family: "berry", mode: "dark" });
// css contains --dbg-base-100, --dbg-primary, --dbg-accent, ...`,
    },
  },
  {
    slug: "open-props",
    name: "Open Props",
    icon: icons.openprops,
    pkg: "@theme-kit/open-props",
    tagline:
      "Expose Theme Kit semantic tokens as Open Props style variables for any design that uses CSS custom properties.",
    mark: "OP",
    frameworks: cssAdapterFrameworks({
      hook: "useOpenPropsTheme",
      injectable: "injectOpenPropsTheme",
      pkg: "@theme-kit/open-props",
    }),
    kind: "CSS Variables",
    css: "@theme-kit/open-props/open-props.css",
    tags: ["CSS", "Design tokens", "Runtime"],
    groups: [
      {
        label: "Adapter",
        features: [
          {
            name: "createOpenPropsAdapter(options)",
            desc: "Installs a tagged `:root` style element with concrete `--op-*` variables updated as the theme changes.",
          },
          {
            name: "createOpenPropsVariables(source)",
            desc: "Builds the Open Props variable map from a theme definition or tokens.",
          },
          {
            name: "useOpenPropsTheme(options?)",
            desc: "React hook that installs the Open Props adapter onto the active runtime.",
          },
          {
            name: "injectOpenPropsCSS()",
            desc: "Idempotent, SSR-safe helper for injecting Open Props compatibility CSS.",
          },
        ],
      },
      {
        label: "Options",
        features: [
          {
            name: "CreateOpenPropsAdapterOptions",
            desc: "Accepts `strategy` to customize token→variable mapping.",
          },
          {
            name: "OpenPropsAdapterOptions",
            desc: "Options for Open Props variable derivation and defaults.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static variables",
      lang: "ts",
      code: `import { createOpenPropsVariables } from "@theme-kit/open-props";

const css = createOpenPropsVariables({ family: "cocoa" });
// css: "--op-primary", "--op-background", "--op-radius-md", ...`,
    },
  },
  {
    slug: "mui",
    name: "Material UI",
    icon: icons.mui,
    pkg: "@theme-kit/mui",
    tagline:
      "Derive a Material UI theme from Theme Kit semantic tokens and rebuild it automatically whenever the active theme changes.",
    mark: "MUI",
    frameworks: generatedThemeFrameworks({
      provider: "MuiThemeProvider",
      pkg: "@theme-kit/mui",
    }),
    kind: "Generated Theme",
    tags: ["React", "Provider", "createTheme"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "MuiThemeProvider",
            desc: "Wraps MUI's own `ThemeProvider` with a theme derived from Theme Kit semantic tokens (palette, shape, typography, shadows, breakpoints).",
          },
          {
            name: "useMuiTheme(runtime)",
            desc: "Subscribes to a Theme Kit runtime and returns a `Theme` rebuilt whenever the theme changes.",
          },
        ],
      },
      {
        label: "Create",
        features: [
          {
            name: "createMuiTheme(source)",
            desc: "Builds a `Theme` from a theme definition or tokens with `createTheme`.",
          },
          {
            name: "buildMuiThemeOptions(theme)",
            desc: "Maps an `AdapterResolvedTheme` to MUI `ThemeOptions` — colors, spacing, shape, shadows, breakpoints.",
          },
        ],
      },
      {
        label: "Registry",
        features: [
          {
            name: "createMuiAdapter(options)",
            desc: "Framework-neutral `ThemeAdapter` you register via `runtime.adapters.use()` — alternative to the provider, with `getSnapshot`/`subscribe` for use outside React.",
          },
          {
            name: "MUI_ADAPTER_ID",
            desc: "The registry id (`\"mui\"`) used to identify and replace the adapter.",
          },
          {
            name: "CreateMuiAdapterOptions",
            desc: "Options for the registry adapter — including `strategy` for how faithfully tokens map onto MUI's theme.",
          },
          {
            name: "MuiAdapterOptions",
            desc: "Base adapter options type (strategy + defaults) used by both the provider and the registry adapter.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static theme",
      lang: "ts",
      code: `import { createMuiTheme } from "@theme-kit/mui";
import { resolveInitialTheme, getBuiltInThemes } from "@theme-kit/core";

const themes = getBuiltInThemes();
const { theme } = resolveInitialTheme({ themes, family: "plum" });

const muiTheme = createMuiTheme(theme);`,
    },
  },
  {
    slug: "chakra",
    name: "Chakra UI",
    icon: icons.chakra,
    pkg: "@theme-kit/chakra",
    tagline:
      "Bootstrap a Chakra UI system from Theme Kit semantic tokens, rebuilt automatically as themes change.",
    mark: "CH",
    frameworks: generatedThemeFrameworks({
      provider: "ChakraThemeProvider",
      pkg: "@theme-kit/chakra",
    }),
    kind: "Generated Theme",
    tags: ["React", "System", "Provider"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "ChakraThemeProvider",
            desc: "Wraps Chakra's `ChakraProvider` with a system derived from Theme Kit semantic tokens.",
          },
          {
            name: "useChakraTheme(runtime)",
            desc: "Subscribes to a Theme Kit runtime and returns a Chakra `system` rebuilt on theme changes.",
          },
        ],
      },
      {
        label: "Create",
        features: [
          {
            name: "createChakraTheme(source)",
            desc: "Builds a Chakra UI system from a theme definition or source.",
          },
          {
            name: "buildChakraConfig(theme)",
            desc: "Maps an `AdapterResolvedTheme` to a Chakra `SystemStyleObject`/config shape.",
          },
        ],
      },
      {
        label: "Registry",
        features: [
          {
            name: "createChakraAdapter(options)",
            desc: "Framework-neutral `ThemeAdapter` you register via `runtime.adapters.use()` — alternative to the provider, for use outside React.",
          },
          {
            name: "CHAKRA_ADAPTER_ID",
            desc: "The registry id (`\"chakra\"`) used to identify and replace the adapter.",
          },
          {
            name: "CreateChakraAdapterOptions",
            desc: "Options for the registry adapter — including `strategy` for how faithfully tokens map onto Chakra's system.",
          },
          {
            name: "ChakraAdapterOptions",
            desc: "Base adapter options type (strategy + defaults) used by both the provider and the registry adapter.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static theme",
      lang: "ts",
      code: `import { createChakraTheme } from "@theme-kit/chakra";

const system = createChakraTheme({ family: "mint", mode: "dark" });`,
    },
  },
  {
    slug: "antd",
    name: "Ant Design",
    icon: icons.antd,
    pkg: "@theme-kit/antd",
    tagline:
      "Drive Ant Design's config-based theming from Theme Kit semantic tokens, rebuilt on every theme change.",
    mark: "AN",
    frameworks: generatedThemeFrameworks({
      provider: "AntdThemeProvider",
      pkg: "@theme-kit/antd",
    }),
    kind: "Generated Theme",
    tags: ["React", "ConfigProvider", "Token"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "AntdThemeProvider",
            desc: "Wraps Ant Design's `ConfigProvider` with a `theme` derived from Theme Kit semantic tokens.",
          },
          {
            name: "useAntdTheme(runtime)",
            desc: "Subscribes to a Theme Kit runtime and returns an AntD `ThemeConfig` on changes.",
          },
        ],
      },
      {
        label: "Create",
        features: [
          {
            name: "createAntdTheme(source)",
            desc: "Builds an Ant Design `ThemeConfig` from a theme definition or source.",
          },
          {
            name: "buildAntdConfig(theme)",
            desc: "Maps an `AdapterResolvedTheme` to AntD token configuration (colorPrimary, borderRadius, etc.).",
          },
        ],
      },
      {
        label: "Registry",
        features: [
          {
            name: "createAntdAdapter(options)",
            desc: "Framework-neutral `ThemeAdapter` you register via `runtime.adapters.use()` — alternative to the provider, for use outside React.",
          },
          {
            name: "ANTD_ADAPTER_ID",
            desc: "The registry id (`\"antd\"`) used to identify and replace the adapter.",
          },
          {
            name: "CreateAntdAdapterOptions",
            desc: "Options for the registry adapter — including `strategy` for how faithfully tokens map onto Ant Design's config.",
          },
          {
            name: "AntdAdapterOptions",
            desc: "Base adapter options type (strategy + defaults) used by both the provider and the registry adapter.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static config",
      lang: "ts",
      code: `import { createAntdTheme } from "@theme-kit/antd";

const config = createAntdTheme({ family: "plum", mode: "dark" });`,
    },
  },
  {
    slug: "mantine",
    name: "Mantine",
    icon: icons.mantine,
    pkg: "@theme-kit/mantine",
    tagline:
      "Map Theme semantic tokens onto a Mantine theme, with color-scheme forced to match the active Theme Kit mode.",
    mark: "MN",
    frameworks: generatedThemeFrameworks({
      provider: "MantineThemeProvider",
      pkg: "@theme-kit/mantine",
    }),
    kind: "Generated Theme",
    tags: ["React", "Provider", "ColorScheme"],
    groups: [
      {
        label: "Provider",
        features: [
          {
            name: "MantineThemeProvider",
            desc: "Wraps Mantine's `MantineProvider`, forcing the color scheme to match the active Theme Kit mode.",
          },
          {
            name: "useMantineTheme(runtime)",
            desc: "Subscribes to a runtime and returns a Mantine `Theme` rebuilt on changes.",
          },
        ],
      },
      {
        label: "Create",
        features: [
          {
            name: "createMantineTheme(source)",
            desc: "Builds a Mantine theme — colors (with generated shades), fonts, radius, spacing, shadows, breakpoints.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static theme",
      lang: "ts",
      code: `import { createMantineTheme } from "@theme-kit/mantine";

const theme = createMantineTheme({ family: "cocoa", mode: "dark" });`,
    },
  },
  {
    slug: "unocss",
    name: "UnoCSS",
    icon: icons.unocss,
    pkg: "@theme-kit/unocss",
    tagline:
      "Expose Theme semantic tokens as UnoCSS utilities (`bg-primary`, `rounded-lg`) that reference live CSS variables.",
    mark: "UN",
    frameworks: unocssFrameworkExample(),
    kind: "Build Time",
    tags: ["UnoCSS", "Preset", "Runtime vars"],
    groups: [
      {
        label: "Preset",
        features: [
          {
            name: "presetThemeKit()",
            desc: "UnoCSS preset mapping semantic tokens to utilities: `bg-primary`, `text-foreground`, `border-border`, `rounded-lg`, `shadow-lg`. Values reference `--theme-*` variables and update at runtime.",
          },
          {
            name: "createUnoTheme(source)",
            desc: "Returns a static UnoCSS theme object (colors, radii, shadows) with concrete values for build-time generation.",
          },
        ],
      },
      {
        label: "Types",
        features: [
          {
            name: "ThemeTokens",
            desc: "Re-exports the semantic token shape from `@theme-kit/core`.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static theme",
      lang: "ts",
      code: `import { createUnoTheme } from "@theme-kit/unocss";

const theme = createUnoTheme({ family: "berry" });
// theme.colors.primary === "#..."`,
    },
  },
];

export const libraries: LibraryItem[] = rawLibraries.map((lib) => ({
  ...lib,
  featureCount: lib.groups.reduce((sum, g) => sum + g.features.length, 0),
}));