/**
 * Compatibility data sourced from actual package metadata and source audits.
 * Last verified: 2026-09-24
 * Package version: 2.0.0
 */

export type SSRSupport = "Full" | "Helpers" | "Client-only" | "N/A";
export type ZeroFlashSupport = "Auto" | "Manual" | "None" | "N/A";
export type PersistenceSupport = "Cookie" | "LocalStorage" | "Both" | "None";
export type SyncSupport = "BroadcastChannel" | "Storage events" | "Both" | "None";
export type AdapterArchitecture = "CSS-variable" | "Generated-theme" | "Preset";
export type FrameworkSupport = "All" | "React" | "React+Vue+Svelte+Solid+Angular" | "None";

export interface FrameworkCompatibility {
  package: string;
  framework: string;
  frameworkVersion: string;
  ssr: SSRSupport;
  zeroFlash: ZeroFlashSupport;
  persistence: PersistenceSupport;
  sync: SyncSupport;
  scrollbar: "Provider prop" | "Component" | "Directive" | "Element" | "None";
  transitions: boolean;
  status: "Stable" | "Experimental";
  lastVerified: string;
  notes?: string;
}

export interface LibraryCompatibility {
  library: string;
  package: string;
  adapterType: AdapterArchitecture;
  frameworkSupport: FrameworkSupport;
  cssVarPrefix: string;
  libraryVersion: string;
  ssrSafe: boolean;
  lastVerified: string;
  notes?: string;
}

export const frameworkCompatibilityData: FrameworkCompatibility[] = [
  {
    package: "@theme-kit/core",
    framework: "Framework-agnostic",
    frameworkVersion: "N/A",
    ssr: "N/A",
    zeroFlash: "Manual",
    persistence: "None",
    sync: "Both",
    scrollbar: "None",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Zero runtime dependencies. Provides core engine for all integrations.",
  },
  {
    package: "@theme-kit/react",
    framework: "React",
    frameworkVersion: "^19.0.0",
    ssr: "Client-only",
    zeroFlash: "Manual",
    persistence: "LocalStorage",
    sync: "Both",
    scrollbar: "Component",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "SSR-safe but cannot server-render theme. Use Next.js adapter for SSR.",
  },
  {
    package: "@theme-kit/next",
    framework: "Next.js",
    frameworkVersion: "^15.5.22",
    ssr: "Full",
    zeroFlash: "Auto",
    persistence: "Cookie",
    sync: "Both",
    scrollbar: "Provider prop",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Server components read cookies, emit blocking script, render <html>. Zero-flash by default.",
  },
  {
    package: "@theme-kit/vue",
    framework: "Vue 3",
    frameworkVersion: "^3.4.0",
    ssr: "Client-only",
    zeroFlash: "Manual",
    persistence: "LocalStorage",
    sync: "Both",
    scrollbar: "Component",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Runtime created on onMounted. Use Nuxt adapter for SSR.",
  },
  {
    package: "@theme-kit/svelte",
    framework: "Svelte 5",
    frameworkVersion: "^5.0.0",
    ssr: "Client-only",
    zeroFlash: "Manual",
    persistence: "LocalStorage",
    sync: "Both",
    scrollbar: "Component",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes:
      "SSR-safe; the bindings are skipped on the server. In SvelteKit, inline the bootstrap script in app.html for zero-flash.",
  },
  {
    package: "@theme-kit/solid",
    framework: "Solid",
    frameworkVersion: "^1.8.0",
    ssr: "Client-only",
    zeroFlash: "Manual",
    persistence: "LocalStorage",
    sync: "Both",
    scrollbar: "Component",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "SSR-safe; children not rendered on server.",
  },
  {
    package: "@theme-kit/angular",
    framework: "Angular",
    frameworkVersion: ">=17.0.0",
    ssr: "Helpers",
    zeroFlash: "Manual",
    persistence: "LocalStorage",
    sync: "Both",
    scrollbar: "Directive",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Provides createBlockingScriptContent for SSR. Uses own bootstrap (not core's serializeThemeBootstrapScript).",
  },
  {
    package: "@theme-kit/web",
    framework: "Web Components",
    frameworkVersion: "N/A",
    ssr: "Client-only",
    zeroFlash: "Manual",
    persistence: "LocalStorage",
    sync: "Both",
    scrollbar: "Element",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes:
      "Framework-free custom elements. Zero-flash needs the bootstrap script the Quick Start shows inlined in <head>.",
  },
  {
    package: "@theme-kit/tailwind",
    framework: "Tailwind CSS v4",
    frameworkVersion: "^4.0.0",
    ssr: "N/A",
    zeroFlash: "N/A",
    persistence: "None",
    sync: "None",
    scrollbar: "None",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Maps semantic tokens to Tailwind utilities. Not a runtime package.",
  },
  {
    package: "@theme-kit/astro",
    framework: "Astro",
    frameworkVersion: "^5.0.0",
    ssr: "Full",
    zeroFlash: "Auto",
    persistence: "Cookie",
    sync: "Both",
    scrollbar: "Provider prop",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Server-renders <html> shell. Supports partial hydration.",
  },
  {
    package: "@theme-kit/nuxt",
    framework: "Nuxt 3",
    frameworkVersion: "^3.10.0",
    ssr: "Full",
    zeroFlash: "Auto",
    persistence: "Cookie",
    sync: "Both",
    scrollbar: "Provider prop",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Module config, auto-imports, SSR bootstrap.",
  },
  {
    package: "@theme-kit/remix",
    framework: "Remix",
    frameworkVersion: "^2.16.0",
    ssr: "Full",
    zeroFlash: "Manual",
    persistence: "Cookie",
    sync: "Both",
    scrollbar: "Component",
    transitions: true,
    status: "Stable",
    lastVerified: "2026-09-24",
    notes: "Server/client boundary. User must manually add tk-scrollbar class to <html>.",
  },
];

export const libraryCompatibilityData: LibraryCompatibility[] = [
  {
    library: "shadcn/ui",
    package: "@theme-kit/shadcn",
    adapterType: "CSS-variable",
    frameworkSupport: "React+Vue+Svelte+Solid+Angular",
    cssVarPrefix: "--background, --primary, --card, etc. (no shared prefix)",
    libraryVersion: "N/A (targets CSS var contract)",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "Framework-neutral factory. Exports /react /vue /svelte /solid /angular /factory.",
  },
  {
    library: "Bootstrap",
    package: "@theme-kit/bootstrap",
    adapterType: "CSS-variable",
    frameworkSupport: "React+Vue+Svelte+Solid+Angular",
    cssVarPrefix: "--bs-*",
    libraryVersion: "Bootstrap 5 (no peer dep)",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "Framework-neutral factory. Exports /react /vue /svelte /solid /angular /factory.",
  },
  {
    library: "daisyUI",
    package: "@theme-kit/daisyui",
    adapterType: "CSS-variable",
    frameworkSupport: "React+Vue+Svelte+Solid+Angular",
    cssVarPrefix: "--color-*",
    libraryVersion: "daisyUI 5 (no peer dep)",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "Framework-neutral factory. CSS var prefix is --color-*, NOT --dbg-* or --p-*.",
  },
  {
    library: "Open Props",
    package: "@theme-kit/open-props",
    adapterType: "CSS-variable",
    frameworkSupport: "React+Vue+Svelte+Solid+Angular",
    cssVarPrefix: "--color-*, --brand, --size-*, --shadow-*, --radius-*, --font-*",
    libraryVersion: "Open Props (no peer dep)",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "Framework-neutral factory. Exports /react /vue /svelte /solid /angular /factory.",
  },
  {
    library: "MUI",
    package: "@theme-kit/mui",
    adapterType: "Generated-theme",
    frameworkSupport: "React",
    cssVarPrefix: "Theme object",
    libraryVersion: "@mui/material ^9.0.0",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "React-only. Requires @emotion/react ^11, @emotion/styled ^11. No framework subpaths.",
  },
  {
    library: "Chakra UI",
    package: "@theme-kit/chakra",
    adapterType: "Generated-theme",
    frameworkSupport: "React",
    cssVarPrefix: "Theme object",
    libraryVersion: "@chakra-ui/react ^3.0.0",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "React-only. No framework subpaths.",
  },
  {
    library: "Ant Design",
    package: "@theme-kit/antd",
    adapterType: "Generated-theme",
    frameworkSupport: "React",
    cssVarPrefix: "Theme object",
    libraryVersion: "antd ^6.0.0",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "React-only. No framework subpaths.",
  },
  {
    library: "Mantine",
    package: "@theme-kit/mantine",
    adapterType: "Generated-theme",
    frameworkSupport: "React",
    cssVarPrefix: "Theme object",
    libraryVersion: "@mantine/core ^7.0.0 || ^9.0.0",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "React-only. Supports Mantine 7 and 9. Package lives at packages/adapters/mantine.",
  },
  {
    library: "UnoCSS",
    package: "@theme-kit/unocss",
    adapterType: "Preset",
    frameworkSupport: "All",
    cssVarPrefix: "References core --theme-* vars",
    libraryVersion: "unocss ^66.0.0",
    ssrSafe: true,
    lastVerified: "2026-09-24",
    notes: "Framework-agnostic preset. References core CSS vars (--theme-color-*, --theme-radius-*, etc.).",
  },
];

export const VERIFIED_DATE = "September 24, 2026";
export const VERIFIED_VERSION = "2.0.0";
