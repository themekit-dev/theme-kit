/**
 * Discovery fixture.
 *
 * Lives inside this package on purpose: `loadThemeKitConfig` resolves Vite
 * through whichever framework hosts it, and from here `astro` — and therefore
 * Vite — is reachable by walking up to `packages/astro/node_modules`. A fixture
 * in a temp directory outside the workspace would have no `node_modules` to walk
 * to, and the test would be measuring the resolver's fallback rather than the
 * integration's behaviour.
 */
import { defineTheme, defineThemeKitConfig } from "@theme-kit/core";

const themes = [
  defineTheme({
    name: "fixture-light",
    meta: { family: "fixture", mode: "light" },
    tokens: { colors: { background: "#ffffff" } },
  }),
  defineTheme({
    name: "fixture-dark",
    meta: { family: "fixture", mode: "dark" },
    tokens: { colors: { background: "#101014" } },
  }),
];

export default defineThemeKitConfig({
  themes,
  defaultTheme: "fixture-dark",
  initialMode: "system",
  initialFamily: "fixture",
});
