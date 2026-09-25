/**
 * Per-framework caveats shown on each framework guide.
 *
 * Each entry names one thing that is specific to the adapter and one that is the
 * same everywhere, so a re-exported core API never implies adapter-specific
 * behavior. Keep entries short and link to a deeper page when one exists — never
 * to the guide the caveat is already on.
 */

export type FrameworkCaveat = {
  /** Caveat headline, shown as the callout title. */
  title: string;
  /** The behavior that is adapter-specific (not universal). */
  specific: string;
  /** The behavior that IS universal, for contrast. */
  universal?: string;
  /** Optional deeper link. */
  href?: string;
};

export const frameworkCaveats: Record<string, FrameworkCaveat> = {
  react: {
    title: "Provider placement decides whether state survives navigation",
    specific:
      "Mount `ThemeProvider` above your router. A provider inside a route component is destroyed and re-created on navigation, so it re-reads storage and can flicker. In Next.js it belongs in the App Router root layout. You do not need `createThemeRoot()` for the empty-root frame in a Vite app: `themeKitVitePlugin()` commits the first render synchronously by default, so `<ThemeProvider>` alone is blink-free. `createThemeRoot()` stays available as a client-only optimization when you have measured a gap.",
    universal:
      "Hooks (`useTheme`, `useThemeMode`, `useThemeValue`, `useThemeTokens`) read from the same runtime context in every framework.",
    href: "/vite-plugin",
  },
  next: {
    title: "Server and client theme resolution must agree",
    specific:
      "The server resolves the theme from cookies; the blocking bootstrap script resolves it independently in the browser, where `prefers-color-scheme` is visible. The App Router `ThemeProvider` handles the whole contract: it resolves once, passes the result as `initial`, emits the same `data-theme` / `data-theme-mode` / `data-theme-family` trio the script writes, and keeps `<html>` out of React's hydration diff. Mount it once in `app/layout.tsx` — it renders `<html>`, `<head>` and `<body>` itself, so your layout must not. `ClientThemeProvider` from `@theme-kit/next/client` is for the other shape: a client component that needs theme state when you render the document shell yourself. Server components cannot call the client hooks.",
    universal:
      "The blocking bootstrap script and CSS-variable output are produced by the same core function in every SSR framework.",
    href: "/zero-flash",
  },
  vue: {
    title: "Mount the provider once",
    specific:
      "Mount `<ThemeProvider>` once at the app root so a single runtime owns the DOM binding. Composables (`useTheme`, `useThemeMode`) then resolve that instance instead of creating their own; inside `setup()` you can reach it directly with `useThemeRuntime()`.",
    universal:
      "The composable surface mirrors the React/Svelte/Solid hooks — same names, same return shape.",
  },
  svelte: {
    title: "Scope reads props at mount, not on change",
    specific:
      "Svelte's ThemeScope reads its theme/family/mode props at mount time; prop changes after mount are not re-applied the way they are in React/Vue/Solid. Treat scope props as mount-time configuration.",
    universal:
      "Theme families, modes, persistence, history and cross-window sync behave identically across frameworks.",
    href: "/scoped-theme",
  },
  solid: {
    title: "Reactivity is signals, not context recreation",
    specific:
      "Solid's fine-grained reactivity means theme values update without re-rendering components. Consume them via the generated signals from `useTheme*` rather than destructuring snapshots you expect to update.",
    universal:
      "The runtime, plugin system and DOM adapters are the same core used by every other framework package.",
  },
  angular: {
    title: "Provider lifetime is the runtime lifetime",
    specific:
      "Provide the theme service at root (or a long-lived module) so one runtime owns the DOM binding. A provider scoped to a lazy-loaded component gets a fresh runtime and can fight the app-level one. The pre-paint script writes only the CSS variables the critical path needs.",
    universal:
      "The underlying store, selection controller and persistence layer are framework-neutral core.",
  },
  web: {
    title: "No framework, no provider — just the DOM contract",
    specific:
      "Web Components consume Theme Kit through DOM attributes and CSS variables. There is no provider tree, so apply the runtime explicitly and keep the bootstrap script in `<head>` for first-paint correctness.",
    universal:
      "The CSS-variable contract and token names are identical to every framework integration, so components are portable between them.",
    href: "/vanilla",
  },
  tailwind: {
    title: "The runtime and the utility layer are separate things",
    specific:
      "`@theme-kit/tailwind` maps Theme Kit semantic tokens to Tailwind theme variables at build time — it does not replace the runtime. You still mount the runtime (or the framework provider) to switch themes; Tailwind utilities then read the CSS variables the runtime writes.",
    universal:
      "Token names and the CSS-variable contract match the rest of Theme Kit, so the same theme works under any framework.",
  },
  astro: {
    title: "Islands are the theme boundary",
    specific:
      "The document is themed without any client JavaScript — the integration injects the pre-paint bootstrap and `provider.astro` renders the themed `<html>`. Only interactive state needs an island, and one island containing both the provider and its consumers is the shape that cannot race: Astro hydrates islands in an unspecified order, so a separate consumer island could hydrate before the one that installs the runtime. `ThemeProviderClient` renders nothing, so a consumer must be a sibling in the same island tree, never a child. On a prerendered page there is no request to read cookies from, so the island reads the persisted selection in the browser and the configured `initialMode` decides what a first-time visitor gets.",
    universal:
      "CSS variables are written to `document.documentElement`, so un-hydrated static markup picks up the active theme too.",
    href: "/zero-flash",
  },
  nuxt: {
    title: "Module config owns SSR bootstrap; auto-imports own the API surface",
    specific:
      "Configure the theme in `nuxt.config` via the module so the server render and the pre-paint script agree. The core composables are auto-imported from the package root — importing them manually can create a second runtime instance.",
    universal:
      "The composable names and the SSR bootstrap behavior match the other server-rendered integrations.",
    href: "/zero-flash",
  },
  remix: {
    title: "Resolve in the loader, paint with the head",
    specific:
      "Resolve the theme in your route `loader` and use it to render the blocking bootstrap script in the document head. The client runtime reads the persisted selection from cookies when `initial` is omitted, so it adopts the theme the pre-paint script already painted instead of resolving twice.",
    universal:
      "The loader/head split is the same server/client boundary the other SSR integrations use.",
    href: "/zero-flash",
  },
};

export function caveatForSlug(slug: string): FrameworkCaveat | undefined {
  return frameworkCaveats[slug];
}
