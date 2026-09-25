import { defineTheme, flattenTokens, themeToCSSVariables } from "@theme-kit/core";

/**
 * Tokens are the semantic values a theme carries, grouped by namespace
 * (`colors`, `spacing`, `radius`, `shadows`, `typography`, ...).
 */
const oceanLight = defineTheme({
  name: "ocean-light",
  meta: { family: "ocean", mode: "light" },
  tokens: {
    colors: {
      background: "#f0f9ff",
      foreground: "#0c1e2e",
      primary: "#0284c7",
    },
    radius: { lg: "0.5rem" },
  },
});

/** `flattenTokens` yields the raw dotted `group.key` paths. */
const flat = flattenTokens(oceanLight.tokens);
console.log("token paths:", Object.keys(flat).sort().join(", "));

/**
 * `themeToCSSVariables` yields the custom properties the runtime binds. Note
 * the singular group prefixes: `colors` → `--theme-color-*`,
 * `radius` → `--theme-radius-*`.
 */
const cssVars = themeToCSSVariables(oceanLight);
console.log("css variables:", Object.keys(cssVars).sort().join(", "));
console.log("--theme-color-primary =", cssVars["--theme-color-primary"]);
