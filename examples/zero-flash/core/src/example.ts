import { createThemeBootstrapScript, defineTheme } from "@theme-kit/core";

const oceanLight = defineTheme({
  name: "ocean-light",
  meta: { family: "ocean", mode: "light" },
  tokens: { colors: { background: "#f0f9ff", foreground: "#0c1e2e" } },
});

const oceanDark = defineTheme({
  name: "ocean-dark",
  meta: { family: "ocean", mode: "dark" },
  tokens: { colors: { background: "#082f49", foreground: "#e0f2fe" } },
});

/**
 * `createThemeBootstrapScript` returns the body of a *blocking* script to
 * inline in `<head>`. It resolves the persisted selection (falling back to the
 * OS preference) and writes the theme's CSS variables before first paint, so
 * the page never flashes the wrong theme.
 *
 * ```html
 * <script><%~ script %></script>
 * ```
 */
const script = createThemeBootstrapScript({
  themes: [oceanLight, oceanDark],
  defaultTheme: "ocean-light",
  initialMode: "system",
});

console.log("script is", script.length, "characters");
console.log("--- first lines ---");
console.log(script.split("\n").slice(0, 4).join("\n"));
