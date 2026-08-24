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
    submodules: ["vanilla", "vite"],
  },
  {
    slug: "react",
    name: "@theme-kit/react",
    tagline: "Provider, hooks and components for React 18/19 — the reference integration.",
  },
  {
    slug: "next",
    name: "@theme-kit/next",
    tagline: "Next.js App Router integration: SSR-safe hydration, cookie persistence and zero flash of incorrect theme.",
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
];

export const submoduleLabels: Record<string, string> = {
  vanilla: "Vanilla class API",
  vite: "Vite plugin",
};
