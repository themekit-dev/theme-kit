export type ApiPackage = {
  slug: string;
  name: string;
  tagline: string;
  submodules?: string[];
};

export const apiPackages: ApiPackage[] = [
  {
    slug: "core",
    name: "@theme-kit/core",
    tagline:
      "The framework-agnostic heart of Theme Kit: store, model, registry, runtime, adapters, generation, validation, history, lifecycle and plugins.",
    submodules: ["vanilla", "vite", "config"],
  },
  {
    slug: "react",
    name: "@theme-kit/react",
    tagline:
      "Provider-first theming for React with hooks, scoped themes, adapters, runtime transitions, and an optional optimized client bootstrap.",
  },
  {
    slug: "next",
    name: "@theme-kit/next",
    tagline: "Next.js App Router integration: SSR-safe hydration, cookie persistence and zero-flash.",
    submodules: ["client"],
  },
  {
    slug: "vue",
    name: "@theme-kit/vue",
    tagline: "Vue 3 provider, composables and scopes over the shared runtime.",
  },
  {
    slug: "svelte",
    name: "@theme-kit/svelte",
    tagline: "Svelte 5 provider, context stores and runes-based reactivity.",
  },
  {
    slug: "solid",
    name: "@theme-kit/solid",
    tagline: "Solid provider, signals and scopes with fine-grained reactivity.",
  },
  {
    slug: "angular",
    name: "@theme-kit/angular",
    tagline: "Angular providers, injectables and an element-scoped directive.",
  },
  {
    slug: "web",
    name: "@theme-kit/web",
    tagline: "Framework-free theming for any HTML page via custom elements.",
  },
  {
    slug: "tailwind",
    name: "@theme-kit/tailwind",
    tagline: "Tailwind CSS v4 mappings from theme tokens to utility variables.",
  },
  {
    slug: "astro",
    name: "@theme-kit/astro",
    tagline: "Astro islands integration with a zero-flash blocking script.",
    submodules: ["client"],
  },
  {
    slug: "nuxt",
    name: "@theme-kit/nuxt",
    tagline: "Nuxt 3 module with SSR-first theming, zero-flash bootstrap, cookie sync and auto-imported composables.",
  },
  {
    slug: "remix",
    name: "@theme-kit/remix",
    tagline: "Remix loader-based SSR theming with a blocking head script.",
    submodules: ["server"],
  },
  {
    slug: "cli",
    name: "@theme-kit/cli",
    tagline: "Generate, validate, migrate, inspect and export themes from the command line.",
  },
  {
    slug: "devtools",
    name: "@theme-kit/devtools",
    tagline: "Runtime inspector, plugin and panel for debugging theme changes.",
  },
  {
    slug: "mui",
    name: "@theme-kit/mui",
    tagline: "MUI adapter: map theme tokens onto MUI's theme, palette and CSS variables.",
  },
  {
    slug: "chakra",
    name: "@theme-kit/chakra",
    tagline: "Chakra UI adapter: map theme tokens onto Chakra's config and semantic tokens.",
  },
  {
    slug: "antd",
    name: "@theme-kit/antd",
    tagline: "Ant Design adapter: map theme tokens onto Ant Design's theme algorithm input.",
  },
  {
    slug: "mantine",
    name: "@theme-kit/mantine",
    tagline: "Mantine bridge: build a Mantine theme from the active Theme Kit theme.",
  },
  {
    slug: "shadcn",
    name: "@theme-kit/shadcn",
    tagline: "shadcn/ui adapter: token variables plus framework bindings for React, Vue, Svelte, Solid and Angular.",
    submodules: ["factory", "react", "vue", "svelte", "solid", "angular"],
  },
  {
    slug: "bootstrap",
    name: "@theme-kit/bootstrap",
    tagline: "Bootstrap adapter: concrete --bs-* variables (including -rgb triplets) kept in sync with the runtime.",
    submodules: ["factory", "react", "vue", "svelte", "solid", "angular"],
  },
  {
    slug: "daisyui",
    name: "@theme-kit/daisyui",
    tagline: "daisyUI adapter: theme variables mapped onto daisyUI's CSS variable contract.",
    submodules: ["factory", "react", "vue", "svelte", "solid", "angular"],
  },
  {
    slug: "open-props",
    name: "@theme-kit/open-props",
    tagline: "Open Props adapter: map theme tokens onto Open Props custom properties.",
    submodules: ["factory", "react", "vue", "svelte", "solid", "angular"],
  },
  {
    slug: "unocss",
    name: "@theme-kit/unocss",
    tagline: "UnoCSS preset mapping theme tokens to utilities.",
  },
  {
    slug: "adapters",
    name: "@theme-kit/adapters",
    tagline: "Shared adapter toolkit: source resolution, token/color readers and React helpers.",
    submodules: ["react"],
  },
];

export const submoduleLabels: Record<string, string> = {
  vanilla: "Vanilla class API",
  vite: "Vite plugin",
  client: "Client entry",
  server: "Server entry",
  factory: "Adapter factory",
  react: "React binding",
  vue: "Vue binding",
  svelte: "Svelte binding",
  solid: "Solid binding",
  angular: "Angular binding",
};
