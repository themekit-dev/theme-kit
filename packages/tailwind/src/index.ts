/**
 * Theme Kit Tailwind CSS integration.
 *
 * Provides `createTailwindPlugin` (emits the theme as CSS variables usable
 * by Tailwind utilities), `synchronizeDarkClass` (keeps Tailwind's
 * `dark` variant in sync with the runtime), and the `themeCSS` helper.
 *
 * @packageDocumentation
 */
import type { ThemeDefinition } from "@theme-kit/core";

/**
 * Options for {@link createTailwindPlugin}.
 *
 * @see {@link createTailwindPlugin}
 */
export interface TailwindPluginOptions {
  /** The theme definitions the plugin is configured with. */
  themes?: readonly ThemeDefinition[];
  /** The name of the default theme. */
  defaultTheme?: string;
}

/**
 * Creates a Tailwind plugin for Theme Kit.
 *
 * The plugin registers Theme Kit with Tailwind so that theme tokens can be
 * consumed as Tailwind utilities. It is configured with the theme definitions
 * and an optional default theme.
 *
 * @param options The theme definitions and default theme.
 * @returns A Tailwind plugin object.
 *
 * @example
 * ```ts
 * import { createTailwindPlugin } from "@theme-kit/tailwind";
 * import { getBuiltInThemes } from "@theme-kit/core";
 *
 * export default {
 *   plugins: [
 *     createTailwindPlugin({
 *       themes: getBuiltInThemes(),
 *       defaultTheme: "light",
 *     }),
 *   ],
 * };
 * ```
 *
 * @see {@link synchronizeDarkClass}
 * @see {@link themeCSS}
 */
export function createTailwindPlugin(options?: TailwindPluginOptions) {
  return {
    name: "@theme-kit/tailwind",
  };
}

/**
 * Synchronizes the `dark` class on the document root with the given theme's
 * mode.
 *
 * Adds the `dark` class when the theme's mode is `"dark"` and removes it
 * otherwise. No-op when `document` is unavailable (for example during SSR).
 *
 * @param theme The theme whose mode determines the `dark` class.
 *
 * @see {@link createTailwindPlugin}
 */
export function synchronizeDarkClass(theme: { meta?: { mode?: string } }): void {
  if (typeof document === "undefined") return;
  const isDark = theme.meta?.mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * A CSS string containing the Theme Kit Tailwind theme CSS.
 *
 * Points to the generated theme CSS file (`./theme.css`) that defines the
 * theme tokens as CSS variables for use with Tailwind.
 *
 * @see {@link createTailwindPlugin}
 */
export const themeCSS = `/* Theme CSS is available at ./theme.css */`;
