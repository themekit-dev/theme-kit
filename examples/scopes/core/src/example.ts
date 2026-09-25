import {
  defineTheme,
  resolveScopedTheme,
  scopeToCSSVariables,
  themeToCSSVariables,
} from "@theme-kit/core";

const baseLight = defineTheme({
  name: "base-light",
  meta: { family: "base", mode: "light" },
  tokens: { colors: { background: "#ffffff", primary: "#2563eb" } },
});

const baseDark = defineTheme({
  name: "base-dark",
  meta: { family: "base", mode: "dark" },
  tokens: { colors: { background: "#0b1120", primary: "#60a5fa" } },
});

const plumLight = defineTheme({
  name: "plum-light",
  meta: { family: "plum", mode: "light" },
  tokens: { colors: { background: "#faf5ff", primary: "#7c3aed" } },
});

const themes = [baseLight, baseDark, plumLight] as const;

/** An exact selection: the scope is pinned to one theme by name. */
const pinned = resolveScopedTheme(themes, "plum-light");
console.log("pinned to:", pinned.name);

/**
 * A family selection: `mode` is optional and falls back to the parent
 * runtime's current mode (here forced with the `prefersDark` argument).
 */
const familyScoped = resolveScopedTheme(themes, { family: "base" }, true);
console.log("family=base with prefersDark →", familyScoped.name);

/**
 * Mirror the scoped theme's variables as the Tailwind-style aliases that
 * utilities resolve against (`--theme-color-primary` → `--color-primary`), so a
 * scoped subtree's utilities use the scope's values, not the page's. The
 * optional `prefix` argument is the *input* prefix (`"theme-"` by default).
 */
const scoped = scopeToCSSVariables(themeToCSSVariables(pinned));
console.log("scoped aliases:", Object.keys(scoped).sort().join(", "));
