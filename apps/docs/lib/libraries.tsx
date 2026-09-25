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
      code: `// src/components/InstallAdapter.tsx
import { useThemeRuntime } from "@theme-kit/react";
import { ${hook} } from "${pkg}/react";

// Mount this inside <ThemeProvider>. The hook registers the adapter on the
// provider's runtime and disposes it when the component unmounts.
export function InstallAdapter() {
  ${hook}(useThemeRuntime());
  return null;
}`,
    },
    {
      label: "Vue 3",
      lang: "vue",
      code: `<!-- src/components/InstallAdapter.vue -->
<script setup lang="ts">
import { useThemeRuntime } from "@theme-kit/vue";
import { ${hook} } from "${pkg}/vue";

// Mount this inside <ThemeProvider>.
${hook}(useThemeRuntime());
</script>

<template>
  <!-- renders nothing -->
</template>`,
    },
    {
      label: "Svelte",
      lang: "svelte",
      code: `<!-- src/components/InstallAdapter.svelte -->
<script lang="ts">
  import { getThemeRuntime } from "@theme-kit/svelte";
  import { ${hook} } from "${pkg}/svelte";

  // Mount this inside <ThemeProvider>.
  ${hook}(getThemeRuntime());
</script>`,
    },
    {
      label: "Solid",
      lang: "tsx",
      code: `// src/components/InstallAdapter.tsx
import { useThemeRuntime } from "@theme-kit/solid";
import { ${hook} } from "${pkg}/solid";

// Mount this inside <ThemeProvider>.
export function InstallAdapter() {
  ${hook}(useThemeRuntime());
  return null;
}`,
    },
    {
      label: "Angular",
      lang: "ts",
      code: `// src/app/app.component.ts
import { Component } from "@angular/core";
import { injectThemeRuntime } from "@theme-kit/angular";
import { ${injectable} } from "${pkg}/angular";

@Component({
  selector: "app-root",
  standalone: true,
  template: "<router-outlet />",
})
export class AppComponent {
  constructor() {
    // A constructor IS an injection context. The adapter is registered on the
    // runtime provided by provideThemeKit() and disposed with the component.
    ${injectable}(injectThemeRuntime());
  }
}`,
    },
    {
      label: "Next.js",
      lang: "tsx",
      code: `// app/install-adapter.tsx
"use client";
import { useThemeRuntime } from "@theme-kit/next/client";
import { ${hook} } from "${pkg}/react";

// Mount this anywhere below the root layout's <ThemeProvider>.
export function InstallAdapter() {
  ${hook}(useThemeRuntime());
  return null;
}`,
    },
    {
      label: "Nuxt",
      lang: "vue",
      code: `<!-- components/InstallAdapter.vue -->
<script setup lang="ts">
import { useThemeRuntime } from "@theme-kit/nuxt";
import { ${hook} } from "${pkg}/vue";

// The module already provides the runtime — just mount this in your app.
${hook}(useThemeRuntime());
</script>

<template>
  <!-- renders nothing -->
</template>`,
    },
    {
      label: "Remix",
      lang: "tsx",
      code: `// app/components/install-adapter.tsx
import { useThemeRuntime } from "@theme-kit/remix";
import { ${hook} } from "${pkg}/react";

// Mount this below the <ThemeProvider> in app/root.tsx.
export function InstallAdapter() {
  ${hook}(useThemeRuntime());
  return null;
}`,
    },
    {
      label: "Astro",
      lang: "tsx",
      code: `// src/components/ThemeIsland.tsx
import { ThemeProviderClient, useThemeRuntime } from "@theme-kit/astro/client";
import { ${hook} } from "${pkg}/react";

function InstallAdapter() {
  ${hook}(useThemeRuntime());
  return null;
}

// ThemeProviderClient renders nothing — it installs the runtime. The adapter is
// a sibling that reads it, and both hydrate as one island.
export default function ThemeIsland() {
  return (
    <>
      <ThemeProviderClient initialMode="system" />
      <InstallAdapter />
    </>
  );
}`,
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
      code: `// src/components/ThemeZone.tsx
import type { ReactNode } from "react";
import { useThemeRuntime } from "@theme-kit/react";
import { ${provider} } from "${pkg}";

// Mount this inside <ThemeProvider>. The provider rebuilds the library's
// native theme from Theme Kit tokens on every theme change.
export function ThemeZone({ children }: { children: ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}`,
    },
    {
      label: "Next.js",
      lang: "tsx",
      code: `// app/theme-zone.tsx
"use client";
import type { ReactNode } from "react";
import { useThemeRuntime } from "@theme-kit/next/client";
import { ${provider} } from "${pkg}";

// Mount this below the root layout's <ThemeProvider>.
export function ThemeZone({ children }: { children: ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}`,
    },
    {
      label: "Remix",
      lang: "tsx",
      code: `// app/components/theme-zone.tsx
import type { ReactNode } from "react";
import { useThemeRuntime } from "@theme-kit/remix";
import { ${provider} } from "${pkg}";

// Mount this below the <ThemeProvider> in app/root.tsx.
export function ThemeZone({ children }: { children: ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}`,
    },
    {
      label: "Astro",
      lang: "tsx",
      code: `// src/components/ThemeZone.tsx (client island)
import type { ReactNode } from "react";
import { useThemeRuntime } from "@theme-kit/astro/client";
import { ${provider} } from "${pkg}";

export default function ThemeZone({ children }: { children: ReactNode }) {
  const runtime = useThemeRuntime();
  return <${provider} runtime={runtime}>{children}</${provider}>;
}

// In your page — ThemeProviderClient installs the shared runtime first:
//   <ThemeProviderClient client:only="react" />
//   <ThemeZone client:only="react">{/* … */}</ThemeZone>`,
    },
  ];
}

function unocssFrameworkExample(): LibraryFrameworkExample[] {
  return [
    {
      label: "Any framework",
      lang: "ts",
      code: `// vite.config.ts — the preset exposes Theme Kit tokens as utilities such as
// \`bg-primary\`, \`text-foreground\`, \`border-border\` and \`rounded-lg\`. Their
// values reference the live \`--theme-*\` variables, so they follow whichever
// theme is active at runtime — no rebuild needed when the theme changes.
import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import { presetWind3 } from "unocss";
import { presetThemeKit } from "@theme-kit/unocss";

export default defineConfig({
  plugins: [UnoCSS({ presets: [presetWind3(), presetThemeKit()] })],
});`,
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
            name: "createShadcnVariables(tokens)",
            desc: "Deprecated — prefer `createShadcnAdapter`. Generates the shadcn CSS-variable map from a token set (`theme.tokens`), without touching the DOM. Passing a theme definition yields empty values.",
          },
          {
            name: "useShadcnTheme(runtime, options?)",
            desc: "React hook (from `@theme-kit/shadcn/react`) that installs and disposes the adapter onto an explicit runtime. Call once in your app root.",
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
import { getBuiltInThemes } from "@theme-kit/core";

// These factories read \`tokens\` as-is — pass the token set, not a theme and
// not a \`{ family, mode }\` pair. Built-in themes ship a complete token set.
const [theme] = getBuiltInThemes();

const css = createShadcnVariables(theme.tokens!);
// css -> { "--background": "#f8fafc", "--foreground": "#0f172a", … }`,
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
            name: "createBootstrapVariables(tokens)",
            desc: "Produces the concrete Bootstrap CSS custom-property map from a token set (`theme.tokens`) — no DOM required. A theme definition leaves the derived color pairs empty.",
          },
          {
            name: "useBootstrapTheme(runtime, options?)",
            desc: "React hook (from `@theme-kit/bootstrap/react`) that installs and disposes the adapter on the current runtime.",
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
import { getBuiltInThemes } from "@theme-kit/core";

// Pass the token set — a \`{ family, mode }\` pair is not a ThemeTokens and
// silently yields empty values ("--bs-body-bg": "").
const [theme] = getBuiltInThemes();

const css = createBootstrapVariables(theme.tokens!);
// css -> { "--bs-body-bg": "#f8fafc", "--bs-body-color": "#0f172a", … }`,
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
            name: "createDaisyVariables(tokens)",
            desc: "Generates the daisyUI CSS custom-property map from a token set (`theme.tokens`). A theme definition collapses the output to radius tokens only.",
          },
          {
            name: "useDaisyTheme(runtime, options?)",
            desc: "React hook (from `@theme-kit/daisyui/react`) that installs the daisyUI adapter onto an explicit runtime.",
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
import { getBuiltInThemes } from "@theme-kit/core";

// Pass the token set — a \`{ family, mode }\` pair yields only the radius and
// border variables, with every color missing.
const [theme] = getBuiltInThemes();

const css = createDaisyVariables(theme.tokens!);
// css -> { "--color-base-100": "#f8fafc", "--color-primary": "…", … }`,
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
            name: "createOpenPropsVariables(tokens)",
            desc: "Builds the Open Props variable map from a token set (`theme.tokens`). A theme definition leaves the color entries empty.",
          },
          {
            name: "useOpenPropsTheme(runtime, options?)",
            desc: "React hook (from `@theme-kit/open-props/react`) that installs the Open Props adapter onto an explicit runtime.",
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
import { getBuiltInThemes } from "@theme-kit/core";

const [theme] = getBuiltInThemes();

const css = createOpenPropsVariables(theme.tokens!);
// css -> { "--color-canvas": "#f8fafc", "--color-text": "#0f172a", … }`,
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
            desc: "Builds a MUI `Theme` from a theme definition, its tokens, or a runtime.",
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
import { getBuiltInThemes } from "@theme-kit/core";

// createMuiTheme accepts a runtime, a store, a theme definition, or raw
// tokens. A \`{ family, mode }\` object is none of those — the factory then
// falls back to MUI's stock palette instead of the theme you asked for.
const themes = getBuiltInThemes();
const theme = themes.find((t) => t.name === "mint-light")!;

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
            desc: "Builds a Chakra UI system from a theme definition, its tokens, or a runtime.",
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
import { getBuiltInThemes } from "@theme-kit/core";

const themes = getBuiltInThemes();
const theme = themes.find((t) => t.name === "mint-dark")!;

const system = createChakraTheme(theme);`,
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
            desc: "Builds an Ant Design `ThemeConfig` from a theme definition, its tokens, or a runtime.",
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
import { getBuiltInThemes } from "@theme-kit/core";

const themes = getBuiltInThemes();
const theme = themes.find((t) => t.name === "plum-dark")!;

const config = createAntdTheme(theme);`,
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
            desc: "Builds a Mantine theme from a theme definition, its tokens, or a runtime — colors (with generated shades), fonts, radius, spacing, shadows, breakpoints.",
          },
        ],
      },
    ],
    snippet2: {
      title: "Static theme",
      lang: "ts",
      code: `import { createMantineTheme } from "@theme-kit/mantine";
import { getBuiltInThemes } from "@theme-kit/core";

const themes = getBuiltInThemes();
const builtIn = themes.find((t) => t.name === "cocoa-dark")!;

const theme = createMantineTheme(builtIn);`,
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