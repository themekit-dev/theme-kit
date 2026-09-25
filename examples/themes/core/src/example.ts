import {
  defineTheme,
  extendTheme,
  getThemeFamily,
  getThemeMode,
  resolveThemeName,
} from "@theme-kit/core";

/**
 * A theme family is one definition per mode. `meta.family` groups the modes and
 * `meta.mode` says which mode each definition serves.
 */
const oceanLight = defineTheme({
  name: "ocean-light",
  meta: { family: "ocean", mode: "light", label: "Ocean Light" },
  tokens: {
    colors: { background: "#f0f9ff", foreground: "#0c1e2e", primary: "#0284c7" },
  },
});

const oceanDark = defineTheme({
  name: "ocean-dark",
  meta: { family: "ocean", mode: "dark", label: "Ocean Dark" },
  tokens: {
    colors: { background: "#082f49", foreground: "#e0f2fe", primary: "#7dd3fc" },
  },
});

/**
 * `extendTheme` derives a new theme from a base one, merging token groups
 * recursively. Overriding `meta` keeps it inside the same family.
 */
const oceanSoftDark = extendTheme("ocean-soft-dark", oceanDark, {
  meta: { family: "ocean", mode: "dark", label: "Ocean Soft Dark" },
  colors: { primary: "#38bdf8" },
});

const themes = [oceanLight, oceanDark, oceanSoftDark] as const;

console.log("families:", themes.map(getThemeFamily).join(", "));
console.log("modes:", themes.map(getThemeMode).join(", "));
console.log("family=ocean mode=dark resolves to:", resolveThemeName(themes, "ocean", "dark"));
