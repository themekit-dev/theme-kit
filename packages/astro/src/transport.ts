import {
  toBootstrapConfig,
  type ThemeDefinition,
  type ThemeKitThemeConfig,
} from "@theme-kit/core";

/**
 * The last configuration published by {@link publishTransportedConfig}.
 *
 * @remarks
 * Module-scoped rather than global: it is a write-elision guard, not state
 * anything reads. Keeping it off `globalThis` keeps the transport's public
 * surface to the single documented global.
 */
let published: unknown = null;

/**
 * Publishes the application configuration where a **server-rendered** island
 * reads it.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param config - The application configuration (`theme.config.ts`).
 *
 * @remarks
 * `themeKit()` transports this configuration to the *browser* by injecting
 * `window.__THEME_KIT_CONFIG__` into `<head>`. That does nothing for the
 * server: `injectScript` emits a `<script>` tag, so during SSR the global is
 * unset and an island falls back to the built-in themes. The island's server
 * markup is then built from one registry and its hydrated markup from another,
 * React reports a text mismatch (error #418) and re-renders the island — which
 * the visitor sees as the panel's text fluctuating on every load.
 *
 * So the same projection has to be published on `globalThis` too, before the
 * island renders. Two callers do it, and the split is deliberate:
 *
 * - `provider.astro`, from its frontmatter. Astro renders a component's
 *   frontmatter before its slot, so a provider that owns the page's `<html>` is
 *   early enough for every island inside it. This is the one that matters for
 *   an Astro-native app.
 * - `getInitialThemeState()`, from the page's own frontmatter, for a page that
 *   resolves the selection from the request. That runs before the provider.
 *
 * Calling it twice is harmless — the write is elided when the same
 * configuration object is already published.
 *
 * @see {@link getInitialThemeState}
 */
export function publishTransportedConfig<T extends ThemeDefinition>(
  config: ThemeKitThemeConfig<T>,
): void {
  // Identity comparison, not deep equality: `theme.config.ts` is a module
  // singleton, so the same object arrives on every request. Comparing identity
  // turns this into a one-time write per process rather than a per-request one,
  // which is what keeps the shared global stable while the server handles
  // concurrent requests.
  if (published === config) return;
  published = config;

  (globalThis as unknown as Record<string, unknown>).__THEME_KIT_CONFIG__ =
    toBootstrapConfig(config);
}

/**
 * Forgets the last published configuration.
 *
 * @remarks
 * **Test-only.** It exists so a test can publish two different configurations in
 * one process; nothing in an application should call it.
 *
 * @internal
 */
export function __resetTransportedConfig(): void {
  published = null;
  delete (globalThis as unknown as Record<string, unknown>).__THEME_KIT_CONFIG__;
}
